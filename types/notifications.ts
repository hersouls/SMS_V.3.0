// 통합된 알림 타입 정의

export interface NotificationMetadata {
  amount?: number;
  currency?: 'KRW' | 'USD';
  daysUntil?: number;
  serviceName?: string;
  subscriptionId?: string;
  userId?: string;
  originalAmount?: number;
  originalCurrency?: 'KRW' | 'USD';
  exchangeRate?: number;
  [key: string]: any;
}

export interface BaseNotification {
  id: string;
  userId: string;
  type: 'payment' | 'renewal' | 'expiry' | 'system' | 'warning' | 'info';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  subscriptionId?: string;
  category?: string;
  metadata?: NotificationMetadata;
  createdAt: Date;
  updatedAt: Date;
}

// 컴포넌트에서 사용하는 알림 인터페이스 (기존 호환성 유지)
export interface NotificationUI extends Omit<BaseNotification, 'createdAt' | 'updatedAt'> {
  date: string; // ISO string for UI compatibility
}

// Firebase에서 사용하는 알림 인터페이스  
export interface NotificationFirebase extends BaseNotification {
  // Firebase Timestamp는 자동으로 Date로 변환됨
}

// 알림 생성 요청 인터페이스
export interface CreateNotificationRequest {
  userId: string;
  type: BaseNotification['type'];
  title: string;
  message: string;
  priority?: BaseNotification['priority'];
  subscriptionId?: string;
  category?: string;
  metadata?: NotificationMetadata;
}

// 알림 업데이트 요청 인터페이스
export interface UpdateNotificationRequest {
  isRead?: boolean;
  priority?: BaseNotification['priority'];
  metadata?: Partial<NotificationMetadata>;
}

// 알림 필터 옵션
export interface NotificationFilter {
  type?: BaseNotification['type'] | 'all';
  status?: 'read' | 'unread' | 'all';
  priority?: BaseNotification['priority'] | 'all';
  dateRange?: {
    start: Date;
    end: Date;
  };
  subscriptionId?: string;
  category?: string;
}

// 알림 통계 인터페이스
export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<BaseNotification['type'], number>;
  byPriority: Record<BaseNotification['priority'], number>;
  todayCount: number;
  weekCount: number;
  monthCount: number;
}

// 알림 설정 인터페이스
export interface NotificationSettings {
  userId: string;
  enabled: boolean;
  types: {
    payment: boolean;
    renewal: boolean;
    expiry: boolean;
    system: boolean;
    warning: boolean;
  };
  methods: {
    browser: boolean;
    email: boolean;
    push: boolean;
  };
  timing: {
    paymentReminders: {
      sevenDays: boolean;
      threeDays: boolean;
      oneDay: boolean;
      sameDay: boolean;
    };
    quietHours: {
      enabled: boolean;
      startTime: string; // HH:mm format
      endTime: string;   // HH:mm format
    };
  };
  frequency: {
    maxDaily: number;
    maxWeekly: number;
    groupSimilar: boolean;
  };
}

// 알림 배치 처리 인터페이스
export interface NotificationBatch {
  userId: string;
  notifications: CreateNotificationRequest[];
  deduplication?: boolean;
  scheduling?: {
    sendAt?: Date;
    timezone?: string;
  };
}

// 알림 에러 인터페이스
export interface NotificationError {
  code: 'PERMISSION_DENIED' | 'INVALID_DATA' | 'QUOTA_EXCEEDED' | 'NETWORK_ERROR' | 'UNKNOWN_ERROR';
  message: string;
  context?: {
    notificationId?: string;
    userId?: string;
    operation?: string;
    [key: string]: any;
  };
  timestamp: Date;
}

// 알림 서비스 응답 인터페이스
export interface NotificationServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: NotificationError;
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}

// 알림 이벤트 타입
export type NotificationEvent = 
  | { type: 'created'; notification: BaseNotification }
  | { type: 'updated'; notification: BaseNotification; changes: Partial<BaseNotification> }
  | { type: 'deleted'; notificationId: string; userId: string }
  | { type: 'marked_read'; notificationId: string; userId: string }
  | { type: 'settings_changed'; userId: string; settings: NotificationSettings };

// 유틸리티 타입들
export type NotificationType = BaseNotification['type'];
export type NotificationPriority = BaseNotification['priority'];

// 알림 상수
export const NOTIFICATION_CONSTANTS = {
  MAX_TITLE_LENGTH: 100,
  MAX_MESSAGE_LENGTH: 500,
  MAX_NOTIFICATIONS_PER_USER: 1000,
  MAX_NOTIFICATIONS_PER_DAY: 50,
  DEFAULT_PRIORITY: 'medium' as NotificationPriority,
  DEFAULT_RETENTION_DAYS: 30,
} as const;