// 통계 데이터 통합 및 의존성 관리

import { Subscription } from '../contexts/DataContext';
import { RealtimeStats, StatisticsError } from '../types/statistics';
import { calculateRealtimeStats } from './statisticsCalculator';
import { 
  updateStatisticsOnSubscriptionChange,
  updateUserStatistics,
  trackUserBehavior 
} from './statistics';

// 통계 업데이트 트리거 타입
export type StatisticsUpdateTrigger = 
  | 'subscription_added'
  | 'subscription_updated' 
  | 'subscription_deleted'
  | 'user_login'
  | 'manual_refresh'
  | 'data_import'
  | 'settings_changed';

// 컴포넌트 간 통계 동기화 클래스
export class StatisticsSyncManager {
  private static instance: StatisticsSyncManager;
  private listeners: Map<string, Array<(stats: RealtimeStats | null, error: StatisticsError | null) => void>> = new Map();
  private lastStats: RealtimeStats | null = null;
  private lastError: StatisticsError | null = null;
  private updateQueue: Array<{ trigger: StatisticsUpdateTrigger; data: any; timestamp: Date }> = [];
  private isProcessing = false;

  private constructor() {}

  static getInstance(): StatisticsSyncManager {
    if (!StatisticsSyncManager.instance) {
      StatisticsSyncManager.instance = new StatisticsSyncManager();
    }
    return StatisticsSyncManager.instance;
  }

  // 컴포넌트에서 통계 업데이트 구독
  subscribe(componentId: string, callback: (stats: RealtimeStats | null, error: StatisticsError | null) => void): () => void {
    if (!this.listeners.has(componentId)) {
      this.listeners.set(componentId, []);
    }
    
    this.listeners.get(componentId)!.push(callback);
    
    // 즉시 현재 상태 전달
    if (this.lastStats || this.lastError) {
      callback(this.lastStats, this.lastError);
    }

    // 구독 해제 함수 반환
    return () => {
      const callbacks = this.listeners.get(componentId);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
        if (callbacks.length === 0) {
          this.listeners.delete(componentId);
        }
      }
    };
  }

  // 모든 구독자에게 업데이트 알림
  private notifySubscribers(stats: RealtimeStats | null, error: StatisticsError | null) {
    this.lastStats = stats;
    this.lastError = error;

    console.log('📊 통계 업데이트 알림:', {
      subscriberCount: Array.from(this.listeners.values()).reduce((sum, callbacks) => sum + callbacks.length, 0),
      hasStats: !!stats,
      hasError: !!error
    });

    this.listeners.forEach((callbacks, componentId) => {
      callbacks.forEach(callback => {
        try {
          callback(stats, error);
        } catch (error) {
          console.error(`컴포넌트 ${componentId} 통계 콜백 오류:`, error);
        }
      });
    });
  }

  // 통계 업데이트 요청
  async updateStatistics(
    subscriptions: Subscription[], 
    trigger: StatisticsUpdateTrigger,
    additionalData?: any
  ): Promise<void> {
    // 업데이트 큐에 추가
    this.updateQueue.push({
      trigger,
      data: { subscriptions, ...additionalData },
      timestamp: new Date()
    });

    // 처리 중이 아니면 즉시 처리
    if (!this.isProcessing) {
      await this.processUpdateQueue();
    }
  }

  // 업데이트 큐 처리
  private async processUpdateQueue(): Promise<void> {
    if (this.isProcessing || this.updateQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      // 가장 최근 업데이트만 처리 (디바운싱 효과)
      const latestUpdate = this.updateQueue[this.updateQueue.length - 1];
      this.updateQueue = [];

      console.log('📊 통계 업데이트 처리:', {
        trigger: latestUpdate.trigger,
        subscriptionCount: latestUpdate.data.subscriptions?.length || 0
      });

      // 통계 계산
      const result = calculateRealtimeStats(latestUpdate.data.subscriptions || []);

      if (result.stats) {
        this.notifySubscribers(result.stats, null);
        
        // Firebase 통계도 업데이트 (백그라운드)
        this.updateFirebaseStatistics(latestUpdate).catch(error => {
          console.warn('Firebase 통계 업데이트 실패:', error);
        });
      } else {
        this.notifySubscribers(null, result.errors[0] || null);
      }

    } catch (error) {
      console.error('통계 업데이트 처리 오류:', error);
      this.notifySubscribers(null, {
        code: 'UPDATE_PROCESSING_ERROR',
        message: `통계 업데이트 처리 중 오류: ${error.message}`,
        timestamp: new Date()
      });
    } finally {
      this.isProcessing = false;

      // 큐에 추가 업데이트가 있으면 다시 처리
      if (this.updateQueue.length > 0) {
        setTimeout(() => this.processUpdateQueue(), 100);
      }
    }
  }

  // Firebase 통계 업데이트 (백그라운드)
  private async updateFirebaseStatistics(update: any): Promise<void> {
    try {
      const { trigger, data } = update;
      
      if (trigger.startsWith('subscription_') && data.subscriptionId && data.userId) {
        const action = trigger.split('_')[1] as 'added' | 'updated' | 'deleted';
        const actionMap = { added: 'create', updated: 'update', deleted: 'delete' };
        
        await updateStatisticsOnSubscriptionChange(
          data.subscriptionId,
          data.userId,
          actionMap[action] as any
        );
      }

      if (data.userId) {
        await updateUserStatistics(data.userId);
        
        if (trigger === 'user_login') {
          await trackUserBehavior(data.userId, { action: 'login' });
        }
      }

    } catch (error) {
      console.warn('Firebase 통계 업데이트 실패:', error);
    }
  }

  // 수동 새로고침
  async forceRefresh(subscriptions: Subscription[]): Promise<void> {
    console.log('🔄 통계 강제 새로고침');
    await this.updateStatistics(subscriptions, 'manual_refresh');
  }

  // 현재 통계 반환
  getCurrentStats(): RealtimeStats | null {
    return this.lastStats;
  }

  // 현재 에러 반환
  getCurrentError(): StatisticsError | null {
    return this.lastError;
  }

  // 디버그 정보
  getDebugInfo() {
    return {
      subscriberCount: Array.from(this.listeners.values()).reduce((sum, callbacks) => sum + callbacks.length, 0),
      queueLength: this.updateQueue.length,
      isProcessing: this.isProcessing,
      hasStats: !!this.lastStats,
      hasError: !!this.lastError,
      lastUpdateTime: this.lastStats?.lastUpdated || null
    };
  }
}

// 전역 인스턴스
export const statisticsSync = StatisticsSyncManager.getInstance();

// 컴포넌트에서 사용할 헬퍼 함수들
export const statisticsHelpers = {
  // 구독 변경 알림
  notifySubscriptionChange: (
    subscriptionId: string,
    userId: string,
    action: 'added' | 'updated' | 'deleted',
    subscriptions: Subscription[]
  ) => {
    statisticsSync.updateStatistics(
      subscriptions,
      `subscription_${action}` as StatisticsUpdateTrigger,
      { subscriptionId, userId }
    );
  },

  // 사용자 로그인 알림
  notifyUserLogin: (userId: string, subscriptions: Subscription[]) => {
    statisticsSync.updateStatistics(subscriptions, 'user_login', { userId });
  },

  // 설정 변경 알림
  notifySettingsChange: (subscriptions: Subscription[], settings: any) => {
    statisticsSync.updateStatistics(subscriptions, 'settings_changed', { settings });
  },

  // 데이터 가져오기 알림
  notifyDataImport: (subscriptions: Subscription[], importData: any) => {
    statisticsSync.updateStatistics(subscriptions, 'data_import', { importData });
  },

  // 수동 새로고침
  refreshStatistics: (subscriptions: Subscription[]) => {
    return statisticsSync.forceRefresh(subscriptions);
  }
};

// React 컴포넌트에서 사용할 통계 동기화 훅
export function useStatisticsSync(componentId: string, subscriptions: Subscription[] = []) {
  const [stats, setStats] = React.useState<RealtimeStats | null>(null);
  const [error, setError] = React.useState<StatisticsError | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = statisticsSync.subscribe(componentId, (newStats, newError) => {
      setStats(newStats);
      setError(newError);
      setLoading(false);
    });

    // 초기 계산 트리거
    if (subscriptions.length > 0) {
      statisticsSync.updateStatistics(subscriptions, 'manual_refresh');
    } else {
      setLoading(false);
    }

    return unsubscribe;
  }, [componentId]);

  // 구독 데이터가 변경되면 통계 업데이트
  React.useEffect(() => {
    if (subscriptions.length > 0) {
      statisticsSync.updateStatistics(subscriptions, 'manual_refresh');
    }
  }, [subscriptions]);

  const refresh = React.useCallback(() => {
    setLoading(true);
    return statisticsHelpers.refreshStatistics(subscriptions);
  }, [subscriptions]);

  return {
    stats,
    error,
    loading,
    refresh
  };
}

// TypeScript에서 React import
import React from 'react';