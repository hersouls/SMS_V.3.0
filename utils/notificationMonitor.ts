// 알림 모니터링 및 자동 생성 시스템

import { notificationService } from './notificationService';
import { 
  CreateNotificationRequest, 
  NotificationBatch, 
  NotificationMetadata,
  NotificationSettings 
} from '../types/notifications';
import { Subscription } from '../contexts/DataContext';

// 모니터링 이벤트 타입
interface MonitoringEvent {
  type: 'subscription_added' | 'subscription_updated' | 'subscription_deleted' | 'payment_due' | 'subscription_expired';
  userId: string;
  subscriptionId: string;
  data?: any;
  timestamp: Date;
}

// 알림 트리거 조건
interface NotificationTrigger {
  id: string;
  name: string;
  condition: (event: MonitoringEvent, subscription?: Subscription) => boolean;
  createNotification: (event: MonitoringEvent, subscription?: Subscription) => CreateNotificationRequest;
  enabled: boolean;
  priority: number; // 낮을수록 우선순위 높음
}

// 알림 모니터링 서비스
export class NotificationMonitor {
  private static instance: NotificationMonitor;
  private triggers: NotificationTrigger[] = [];
  private eventQueue: MonitoringEvent[] = [];
  private isProcessing = false;
  private settings: Map<string, NotificationSettings> = new Map();

  private constructor() {
    this.initializeDefaultTriggers();
    this.startEventProcessor();
  }

  static getInstance(): NotificationMonitor {
    if (!NotificationMonitor.instance) {
      NotificationMonitor.instance = new NotificationMonitor();
    }
    return NotificationMonitor.instance;
  }

  // 기본 트리거 초기화
  private initializeDefaultTriggers(): void {
    this.triggers = [
      // 7일 전 결제 알림
      {
        id: 'payment-7days',
        name: '7일 전 결제 알림',
        condition: (event, subscription) => {
          if (event.type !== 'payment_due' || !subscription) return false;
          
          const daysUntil = this.calculateDaysUntilPayment(subscription);
          return daysUntil === 7 && subscription.notifications?.sevenDays;
        },
        createNotification: (event, subscription) => ({
          userId: event.userId,
          type: 'payment',
          title: `${subscription?.serviceName} 결제 예정`,
          message: `7일 후 ${subscription?.serviceName} 결제가 예정되어 있습니다. (${this.formatAmount(subscription?.amount, subscription?.currency)})`,
          priority: 'medium',
          subscriptionId: event.subscriptionId,
          category: subscription?.category,
          metadata: {
            amount: subscription?.amount,
            currency: subscription?.currency,
            daysUntil: 7,
            serviceName: subscription?.serviceName,
            subscriptionId: event.subscriptionId,
            userId: event.userId
          }
        }),
        enabled: true,
        priority: 2
      },

      // 3일 전 결제 알림
      {
        id: 'payment-3days',
        name: '3일 전 결제 알림',
        condition: (event, subscription) => {
          if (event.type !== 'payment_due' || !subscription) return false;
          
          const daysUntil = this.calculateDaysUntilPayment(subscription);
          return daysUntil === 3 && subscription.notifications?.threeDays;
        },
        createNotification: (event, subscription) => ({
          userId: event.userId,
          type: 'payment',
          title: `${subscription?.serviceName} 곧 결제`,
          message: `3일 후 ${subscription?.serviceName} 자동 결제됩니다. 결제 수단을 확인해주세요.`,
          priority: 'high',
          subscriptionId: event.subscriptionId,
          category: subscription?.category,
          metadata: {
            amount: subscription?.amount,
            currency: subscription?.currency,
            daysUntil: 3,
            serviceName: subscription?.serviceName,
            subscriptionId: event.subscriptionId,
            userId: event.userId
          }
        }),
        enabled: true,
        priority: 1
      },

      // 당일 결제 알림
      {
        id: 'payment-today',
        name: '당일 결제 알림',
        condition: (event, subscription) => {
          if (event.type !== 'payment_due' || !subscription) return false;
          
          const daysUntil = this.calculateDaysUntilPayment(subscription);
          return daysUntil === 0 && subscription.notifications?.sameDay;
        },
        createNotification: (event, subscription) => ({
          userId: event.userId,
          type: 'payment',
          title: `${subscription?.serviceName} 오늘 결제`,
          message: `오늘 ${subscription?.serviceName} 자동 결제가 진행됩니다. (${this.formatAmount(subscription?.amount, subscription?.currency)})`,
          priority: 'urgent',
          subscriptionId: event.subscriptionId,
          category: subscription?.category,
          metadata: {
            amount: subscription?.amount,
            currency: subscription?.currency,
            daysUntil: 0,
            serviceName: subscription?.serviceName,
            subscriptionId: event.subscriptionId,
            userId: event.userId
          }
        }),
        enabled: true,
        priority: 0
      },

      // 새 구독 추가 알림
      {
        id: 'subscription-added',
        name: '새 구독 추가 알림',
        condition: (event) => event.type === 'subscription_added',
        createNotification: (event, subscription) => ({
          userId: event.userId,
          type: 'system',
          title: '새 구독이 추가되었습니다',
          message: `${subscription?.serviceName} 구독이 성공적으로 추가되었습니다. 다음 결제일: ${this.formatNextPaymentDate(subscription)}`,
          priority: 'low',
          subscriptionId: event.subscriptionId,
          category: subscription?.category,
          metadata: {
            amount: subscription?.amount,
            currency: subscription?.currency,
            serviceName: subscription?.serviceName,
            subscriptionId: event.subscriptionId,
            userId: event.userId
          }
        }),
        enabled: true,
        priority: 5
      },

      // 구독 만료 알림
      {
        id: 'subscription-expired',
        name: '구독 만료 알림',
        condition: (event) => event.type === 'subscription_expired',
        createNotification: (event, subscription) => ({
          userId: event.userId,
          type: 'expiry',
          title: '구독이 만료되었습니다',
          message: `${subscription?.serviceName} 구독이 만료되었습니다. 계속 사용하려면 갱신해주세요.`,
          priority: 'high',
          subscriptionId: event.subscriptionId,
          category: subscription?.category,
          metadata: {
            serviceName: subscription?.serviceName,
            subscriptionId: event.subscriptionId,
            userId: event.userId
          }
        }),
        enabled: true,
        priority: 1
      },

      // 구독 정보 변경 알림
      {
        id: 'subscription-updated',
        name: '구독 정보 변경 알림',
        condition: (event, subscription) => {
          if (event.type !== 'subscription_updated' || !subscription) return false;
          
          // 중요한 변경사항만 알림 (금액, 결제일, 상태 변경)
          const changes = event.data?.changes || {};
          return changes.amount !== undefined || 
                 changes.paymentDay !== undefined || 
                 changes.status !== undefined ||
                 changes.paymentCycle !== undefined;
        },
        createNotification: (event, subscription) => {
          const changes = event.data?.changes || {};
          let changeDescription = '';
          
          if (changes.amount !== undefined) {
            changeDescription += `금액이 ${this.formatAmount(changes.amount, subscription?.currency)}로 변경되었습니다. `;
          }
          if (changes.paymentDay !== undefined) {
            changeDescription += `결제일이 매월 ${changes.paymentDay}일로 변경되었습니다. `;
          }
          if (changes.status !== undefined) {
            const statusText = changes.status === 'active' ? '활성' : 
                             changes.status === 'paused' ? '일시정지' : '취소';
            changeDescription += `상태가 '${statusText}'로 변경되었습니다. `;
          }

          return {
            userId: event.userId,
            type: 'system',
            title: `${subscription?.serviceName} 구독 정보 변경`,
            message: changeDescription.trim(),
            priority: 'medium',
            subscriptionId: event.subscriptionId,
            category: subscription?.category,
            metadata: {
              changes,
              serviceName: subscription?.serviceName,
              subscriptionId: event.subscriptionId,
              userId: event.userId
            }
          };
        },
        enabled: true,
        priority: 3
      }
    ];
  }

  // 이벤트 프로세서 시작
  private startEventProcessor(): void {
    setInterval(() => {
      this.processEventQueue();
    }, 1000); // 1초마다 이벤트 처리

    // 일일 결제 알림 검사 (매일 오전 9시)
    this.scheduleDailyPaymentCheck();
  }

  // 이벤트 대기열 처리
  private async processEventQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift()!;
        await this.processEvent(event);
      }
    } catch (error) {
      console.error('이벤트 처리 중 오류:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  // 개별 이벤트 처리
  private async processEvent(event: MonitoringEvent): Promise<void> {
    try {
      const userSettings = this.settings.get(event.userId);
      if (userSettings && !userSettings.enabled) {
        console.log('사용자 알림이 비활성화되어 있어 건너뜀:', event.userId);
        return;
      }

      const subscription = event.data?.subscription as Subscription;
      const matchingTriggers = this.triggers
        .filter(trigger => trigger.enabled && trigger.condition(event, subscription))
        .sort((a, b) => a.priority - b.priority); // 우선순위 정렬

      if (matchingTriggers.length === 0) {
        console.log('매칭되는 트리거가 없음:', event.type);
        return;
      }

      // 중복 알림 방지를 위한 배치 처리
      const notifications: CreateNotificationRequest[] = [];
      
      for (const trigger of matchingTriggers) {
        try {
          const notification = trigger.createNotification(event, subscription);
          
          // 알림 설정 확인
          if (this.shouldCreateNotification(notification, userSettings)) {
            notifications.push(notification);
            console.log('알림 생성 예정:', trigger.name, notification.title);
          }
        } catch (error) {
          console.error('알림 생성 실패:', trigger.name, error);
        }
      }

      // 배치로 알림 생성
      if (notifications.length > 0) {
        const batchResult = await notificationService.createBatchNotifications({
          userId: event.userId,
          notifications,
          deduplication: true
        });

        if (batchResult.success) {
          console.log('✅ 배치 알림 생성 성공:', batchResult.data?.length);
        } else {
          console.error('❌ 배치 알림 생성 실패:', batchResult.error);
        }
      }
    } catch (error) {
      console.error('이벤트 처리 실패:', error);
    }
  }

  // 알림 생성 여부 판단
  private shouldCreateNotification(
    notification: CreateNotificationRequest, 
    settings?: NotificationSettings
  ): boolean {
    if (!settings) return true;

    // 타입별 활성화 상태 확인
    const typeEnabled = settings.types[notification.type as keyof typeof settings.types];
    if (!typeEnabled) return false;

    // 조용한 시간 확인
    if (settings.timing.quietHours.enabled) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      if (this.isInQuietHours(currentTime, settings.timing.quietHours.startTime, settings.timing.quietHours.endTime)) {
        console.log('조용한 시간으로 인해 알림 연기:', currentTime);
        return false;
      }
    }

    return true;
  }

  // 조용한 시간 체크
  private isInQuietHours(currentTime: string, startTime: string, endTime: string): boolean {
    const current = this.timeToMinutes(currentTime);
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);

    if (start <= end) {
      return current >= start && current <= end;
    } else {
      // 자정을 넘는 경우 (예: 22:00 - 08:00)
      return current >= start || current <= end;
    }
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // 공개 메서드들
  
  // 이벤트 추가
  addEvent(event: Omit<MonitoringEvent, 'timestamp'>): void {
    this.eventQueue.push({
      ...event,
      timestamp: new Date()
    });
    
    console.log('이벤트 추가됨:', event.type, event.subscriptionId);
  }

  // 구독 관련 이벤트들
  onSubscriptionAdded(userId: string, subscription: Subscription): void {
    this.addEvent({
      type: 'subscription_added',
      userId,
      subscriptionId: subscription.id!,
      data: { subscription }
    });
  }

  onSubscriptionUpdated(userId: string, subscriptionId: string, subscription: Subscription, changes: any): void {
    this.addEvent({
      type: 'subscription_updated',
      userId,
      subscriptionId,
      data: { subscription, changes }
    });
  }

  onSubscriptionDeleted(userId: string, subscriptionId: string): void {
    this.addEvent({
      type: 'subscription_deleted',
      userId,
      subscriptionId
    });
  }

  // 결제 관련 이벤트
  checkPaymentDue(userId: string, subscriptions: Subscription[]): void {
    subscriptions.forEach(subscription => {
      if (subscription.status === 'active') {
        this.addEvent({
          type: 'payment_due',
          userId,
          subscriptionId: subscription.id!,
          data: { subscription }
        });
      }
    });
  }

  // 만료 확인
  checkSubscriptionExpiry(userId: string, subscriptions: Subscription[]): void {
    subscriptions.forEach(subscription => {
      if (this.isSubscriptionExpired(subscription)) {
        this.addEvent({
          type: 'subscription_expired',
          userId,
          subscriptionId: subscription.id!,
          data: { subscription }
        });
      }
    });
  }

  // 사용자 설정 업데이트
  updateUserSettings(userId: string, settings: NotificationSettings): void {
    this.settings.set(userId, settings);
    console.log('사용자 알림 설정 업데이트:', userId);
  }

  // 트리거 관리
  addTrigger(trigger: NotificationTrigger): void {
    this.triggers.push(trigger);
    this.triggers.sort((a, b) => a.priority - b.priority);
  }

  updateTrigger(triggerId: string, updates: Partial<NotificationTrigger>): void {
    const index = this.triggers.findIndex(t => t.id === triggerId);
    if (index !== -1) {
      this.triggers[index] = { ...this.triggers[index], ...updates };
    }
  }

  // 일일 결제 알림 스케줄링
  private scheduleDailyPaymentCheck(): void {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // 오전 9시

    const timeUntilTomorrow = tomorrow.getTime() - now.getTime();

    setTimeout(() => {
      // 이후 매일 실행
      setInterval(() => {
        this.performDailyPaymentCheck();
      }, 24 * 60 * 60 * 1000);

      // 첫 실행
      this.performDailyPaymentCheck();
    }, timeUntilTomorrow);
  }

  private async performDailyPaymentCheck(): Promise<void> {
    console.log('일일 결제 알림 확인 시작');
    // 실제 구현에서는 모든 사용자의 구독을 확인해야 함
    // 현재는 로그만 출력
  }

  // 유틸리티 메서드들
  private calculateDaysUntilPayment(subscription: Subscription): number {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    let paymentDate = new Date(currentYear, currentMonth, subscription.paymentDay);

    if (paymentDate < now) {
      paymentDate.setMonth(paymentDate.getMonth() + 1);
    }

    return Math.ceil((paymentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  private formatAmount(amount?: number, currency?: 'KRW' | 'USD'): string {
    if (!amount) return '0원';
    
    if (currency === 'USD') {
      return `$${amount} (약 ${(amount * 1300).toLocaleString('ko-KR')}원)`;
    }
    
    return `${amount.toLocaleString('ko-KR')}원`;
  }

  private formatNextPaymentDate(subscription?: Subscription): string {
    if (!subscription) return '미정';
    
    const now = new Date();
    const nextPayment = new Date(now.getFullYear(), now.getMonth(), subscription.paymentDay);
    
    if (nextPayment < now) {
      nextPayment.setMonth(nextPayment.getMonth() + 1);
    }
    
    return nextPayment.toLocaleDateString('ko-KR');
  }

  private isSubscriptionExpired(subscription: Subscription): boolean {
    if (!subscription.endDate) return false;
    
    const now = new Date();
    const endDate = new Date(subscription.endDate);
    
    return endDate < now && subscription.status === 'active';
  }

  // 디버그 정보
  getDebugInfo() {
    return {
      queueLength: this.eventQueue.length,
      isProcessing: this.isProcessing,
      triggersCount: this.triggers.length,
      enabledTriggers: this.triggers.filter(t => t.enabled).length,
      userSettingsCount: this.settings.size
    };
  }
}

// 싱글톤 인스턴스 내보내기
export const notificationMonitor = NotificationMonitor.getInstance();