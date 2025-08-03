// API 동시 요청 처리 및 큐잉 시스템
// SMS V.3.0 통합 테스트 결과 기반 개선사항

import { apiService } from './api';

interface QueuedRequest {
  id: string;
  request: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  retries: number;
  maxRetries: number;
  priority: 'high' | 'medium' | 'low';
  timestamp: number;
}

// Rate Limiting 설정 인터페이스
interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
}

export class ApiQueue {
  private queue: QueuedRequest[] = [];
  private processing = new Set<string>();
  private maxConcurrent: number;
  private defaultMaxRetries: number;
  private retryDelay: number;
  
  // Rate Limiting 관련 속성
  private rateLimitConfig: RateLimitConfig;
  private requestCounts: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(options: {
    maxConcurrent?: number;
    defaultMaxRetries?: number;
    retryDelay?: number;
    rateLimitConfig?: RateLimitConfig;
  } = {}) {
    this.maxConcurrent = options.maxConcurrent || 3; // 동시 요청 제한
    this.defaultMaxRetries = options.defaultMaxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
    
    // Rate Limiting 기본 설정
    this.rateLimitConfig = options.rateLimitConfig || {
      windowMs: 60 * 1000, // 1분
      max: 60, // 분당 최대 60회 요청
      message: 'Too many requests. Please try again later.'
    };
    
    // Rate limit 카운터 정리 (1분마다)
    setInterval(() => this.cleanupRateLimitCounts(), 60000);
  }

  // API 요청을 큐에 추가
  async enqueue<T>(
    requestFn: () => Promise<T>,
    options: {
      priority?: 'high' | 'medium' | 'low';
      maxRetries?: number;
      id?: string;
    } = {}
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const request: QueuedRequest = {
        id: options.id || this.generateId(),
        request: requestFn,
        resolve,
        reject,
        retries: 0,
        maxRetries: options.maxRetries || this.defaultMaxRetries,
        priority: options.priority || 'medium',
        timestamp: Date.now()
      };

      // 우선순위에 따라 큐에 삽입
      this.insertByPriority(request);
      this.processQueue();
    });
  }

  private insertByPriority(request: QueuedRequest) {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const insertIndex = this.queue.findIndex(
      item => priorityOrder[item.priority] < priorityOrder[request.priority]
    );
    
    if (insertIndex === -1) {
      this.queue.push(request);
    } else {
      this.queue.splice(insertIndex, 0, request);
    }
  }

  // Rate limit 확인
  private checkRateLimit(userId?: string): boolean {
    const key = userId || 'anonymous';
    const now = Date.now();
    const limit = this.requestCounts.get(key);

    if (!limit || now > limit.resetTime) {
      // 새로운 윈도우 시작
      this.requestCounts.set(key, {
        count: 1,
        resetTime: now + this.rateLimitConfig.windowMs
      });
      return true;
    }

    if (limit.count >= this.rateLimitConfig.max) {
      // Rate limit 초과
      return false;
    }

    // 카운트 증가
    limit.count++;
    return true;
  }

  // Rate limit 카운터 정리
  private cleanupRateLimitCounts() {
    const now = Date.now();
    for (const [key, limit] of this.requestCounts.entries()) {
      if (now > limit.resetTime) {
        this.requestCounts.delete(key);
      }
    }
  }

  private async processQueue() {
    // 동시 실행 중인 요청이 최대치에 도달했으면 대기
    if (this.processing.size >= this.maxConcurrent) {
      return;
    }

    // 대기 중인 요청이 없으면 종료
    if (this.queue.length === 0) {
      return;
    }

    const request = this.queue.shift()!;
    
    // Rate limit 확인 (사용자 ID는 요청 처리 시 확인)
    const userId = await this.getCurrentUserId();
    if (!this.checkRateLimit(userId)) {
      request.reject(new Error(this.rateLimitConfig.message));
      // 다음 요청 처리
      this.processQueue();
      return;
    }
    
    this.processing.add(request.id);

    try {
      const result = await this.executeWithRetry(request);
      request.resolve(result);
    } catch (error) {
      request.reject(error);
    } finally {
      this.processing.delete(request.id);
      // 다음 요청 처리
      this.processQueue();
    }
  }

  // 현재 사용자 ID 가져오기 (Supabase 사용 시)
  private async getCurrentUserId(): Promise<string | undefined> {
    try {
      // Supabase 클라이언트가 있다면 사용자 ID 반환
      if (typeof window !== 'undefined' && (window as any).supabase) {
        const { data } = await (window as any).supabase.auth.getUser();
        return data?.user?.id;
      }
    } catch {
      // 에러 무시
    }
    return undefined;
  }

  private async executeWithRetry(request: QueuedRequest): Promise<any> {
    for (let attempt = 0; attempt <= request.maxRetries; attempt++) {
      try {
        const result = await request.request();
        return result;
      } catch (error) {
        request.retries = attempt + 1;

        // 마지막 시도였다면 에러 던지기
        if (attempt === request.maxRetries) {
          throw new Error(`API 요청 실패 (${request.retries}회 재시도): ${error}`);
        }

        // 재시도 전 대기
        await this.delay(this.retryDelay * Math.pow(2, attempt)); // 지수 백오프
        
        console.warn(`API 요청 재시도 ${attempt + 1}/${request.maxRetries}: ${request.id}`);
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateId(): string {
    return `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 큐 상태 확인
  getQueueStatus() {
    return {
      queued: this.queue.length,
      processing: this.processing.size,
      maxConcurrent: this.maxConcurrent,
      rateLimitConfig: this.rateLimitConfig,
      rateLimitCounts: Array.from(this.requestCounts.entries()).map(([key, value]) => ({
        userId: key,
        count: value.count,
        resetTime: new Date(value.resetTime).toISOString()
      }))
    };
  }

  // 특정 요청 취소
  cancel(id: string): boolean {
    const index = this.queue.findIndex(request => request.id === id);
    if (index !== -1) {
      const request = this.queue.splice(index, 1)[0];
      request.reject(new Error('Request cancelled'));
      return true;
    }
    return false;
  }

  // 모든 대기 중인 요청 취소
  cancelAll() {
    const cancelled = this.queue.splice(0);
    cancelled.forEach(request => {
      request.reject(new Error('Request cancelled'));
    });
    return cancelled.length;
  }
}

// 전역 API 큐 인스턴스
export const apiQueue = new ApiQueue({
  maxConcurrent: 3,    // 동시 최대 3개 요청
  defaultMaxRetries: 3, // 기본 3회 재시도
  retryDelay: 1000,    // 1초 재시도 지연
  rateLimitConfig: {
    windowMs: 60 * 1000, // 1분
    max: 60,             // 분당 최대 60회 요청
    message: 'Too many requests. Please try again later.'
  }
});

// 큐를 사용하는 래퍼 함수들
export const queuedFetch = async (
  url: string, 
  options: RequestInit = {},
  queueOptions: {
    priority?: 'high' | 'medium' | 'low';
    maxRetries?: number;
    id?: string;
  } = {}
) => {
  return apiQueue.enqueue(
    () => fetch(url, options),
    queueOptions
  );
};

// Supabase 클라이언트를 위한 큐잉 래퍼
export const queuedSupabaseRequest = async <T>(
  requestFn: () => Promise<T>,
  options: {
    priority?: 'high' | 'medium' | 'low';
    maxRetries?: number;
    operation?: string;
  } = {}
): Promise<T> => {
  return apiQueue.enqueue(
    requestFn,
    {
      ...options,
      id: options.operation ? `supabase_${options.operation}_${Date.now()}` : undefined
    }
  );
};

// 구독 관련 특화 큐잉 함수들
export const queuedSubscriptionOperations = {
  // 구독 생성 (높은 우선순위)
  async createSubscription(subscriptionData: any) {
    return queuedSupabaseRequest(
      () => apiService.createSubscription(subscriptionData),
      { priority: 'high', operation: 'create_subscription' }
    );
  },

  // 구독 수정 (높은 우선순위)
  async updateSubscription(id: string, updates: any) {
    return queuedSupabaseRequest(
      () => apiService.updateSubscription(id, updates),
      { priority: 'high', operation: 'update_subscription' }
    );
  },

  // 구독 삭제 (높은 우선순위)
  async deleteSubscription(id: string) {
    return queuedSupabaseRequest(
      () => apiService.deleteSubscription(id),
      { priority: 'high', operation: 'delete_subscription' }
    );
  },

  // 구독 목록 조회 (중간 우선순위)
  async getSubscriptions(filters?: any) {
    return queuedSupabaseRequest(
      () => apiService.getSubscriptions(filters),
      { priority: 'medium', operation: 'get_subscriptions' }
    );
  },

  // 구독 상세 조회 (중간 우선순위)
  async getSubscriptionById(id: string) {
    return queuedSupabaseRequest(
      () => apiService.getSubscriptionById(id),
      { priority: 'medium', operation: 'get_subscription_by_id' }
    );
  }
};

// 배치 요청 처리
export const batchRequests = async <T>(
  requests: (() => Promise<T>)[],
  options: {
    batchSize?: number;
    priority?: 'high' | 'medium' | 'low';
    failFast?: boolean;
  } = {}
): Promise<T[]> => {
  const { batchSize = 3, priority = 'medium', failFast = false } = options;
  const results: T[] = [];
  const errors: Error[] = [];

  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    
    const batchPromises = batch.map((request, index) =>
      apiQueue.enqueue(request, {
        priority,
        id: `batch_${i + index}_${Date.now()}`
      }).catch(error => {
        errors.push(error);
        if (failFast) throw error;
        return null;
      })
    );

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults.filter(result => result !== null));
  }

  if (errors.length > 0 && failFast) {
    throw new Error(`배치 요청 실패: ${errors.length}개 오류 발생`);
  }

  return results;
};

// 모니터링 및 디버깅
export const ApiQueueMonitor = {
  startMonitoring(intervalMs: number = 5000) {
    setInterval(() => {
      const status = apiQueue.getQueueStatus();
      if (status.queued > 0 || status.processing > 0) {
        console.log('🔄 API Queue Status:', status);
      }
    }, intervalMs);
  },

  getStatistics() {
    return apiQueue.getQueueStatus();
  },

  logQueueStatus() {
    const status = apiQueue.getQueueStatus();
    console.table(status);
  }
};

// 타입 정의
export type ApiQueueOptions = {
  priority?: 'high' | 'medium' | 'low';
  maxRetries?: number;
  id?: string;
};

export type BatchRequestOptions = {
  batchSize?: number;
  priority?: 'high' | 'medium' | 'low';
  failFast?: boolean;
};