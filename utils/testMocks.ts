// 테스트 환경을 위한 모킹 유틸리티

import { User } from 'firebase/auth';
import { NotificationUI } from '../types/notifications';

/**
 * 테스트용 모킹된 사용자 객체
 */
export const createMockUser = (overrides: Partial<User> = {}): User => {
  const mockUser: Partial<User> = {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    emailVerified: true,
    isAnonymous: false,
    metadata: {
      creationTime: '2023-01-01T00:00:00.000Z',
      lastSignInTime: new Date().toISOString(),
    },
    phoneNumber: null,
    photoURL: null,
    providerData: [],
    refreshToken: 'mock-refresh-token',
    tenantId: null,
    ...overrides
  };

  return mockUser as User;
};

/**
 * 테스트용 모킹된 알림 데이터
 */
export const createMockNotifications = (count: number = 10): NotificationUI[] => {
  const notifications: NotificationUI[] = [];
  
  for (let i = 0; i < count; i++) {
    const isRecent = i < 3;
    const isRead = Math.random() > 0.3; // 30% 확률로 읽지 않음
    const types = ['payment', 'system', 'renewal', 'expiry'] as const;
    const priorities = ['low', 'medium', 'high'] as const;
    const categories = ['엔터테인먼트', '음악', '개발', 'AI', '디자인', '생산성'] as const;
    
    const type = types[Math.floor(Math.random() * types.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    const notification: NotificationUI = {
      id: `test-notification-${i + 1}`,
      userId: 'test-user-123',
      type,
      priority,
      title: generateNotificationTitle(type, priority, i),
      message: generateNotificationMessage(type, priority, i),
      date: isRecent 
        ? new Date(Date.now() - Math.random() * 3600000).toISOString() // 지난 1시간 내
        : new Date(Date.now() - Math.random() * 7 * 24 * 3600000).toISOString(), // 지난 7일 내
      isRead,
      category,
      subscriptionId: Math.random() > 0.5 ? `test-subscription-${i + 1}` : undefined,
      actionUrl: undefined,
      metadata: type === 'payment' ? {
        amount: Math.floor(Math.random() * 50000) + 5000,
        currency: Math.random() > 0.8 ? 'USD' : 'KRW',
        daysUntil: Math.floor(Math.random() * 7),
        serviceName: `Test Service ${i + 1}`
      } : undefined,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 3600000).toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    notifications.push(notification);
  }
  
  return notifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

/**
 * 알림 제목 생성
 */
function generateNotificationTitle(type: string, priority: string, index: number): string {
  const titleMap = {
    payment: [
      `Netflix 결제 예정`,
      `Spotify 구독료 결제`,
      `Adobe Creative Cloud 결제`,
      `구독 서비스 결제 알림`,
      `월간 구독료 결제 예정`
    ],
    system: [
      `시스템 업데이트 완료`,
      `새로운 기능이 추가되었습니다`,
      `보안 업데이트 알림`,
      `서비스 점검 안내`,
      `계정 보안 알림`
    ],
    renewal: [
      `구독 갱신 완료`,
      `자동 갱신 설정 변경`,
      `구독 연장 알림`,
      `갱신 확인 필요`,
      `구독 기간 연장됨`
    ],
    expiry: [
      `구독 만료 경고`,
      `서비스 이용 기간 종료 예정`,
      `구독 연장 필요`,
      `서비스 만료 알림`,
      `구독 갱신 권장`
    ]
  };

  const titles = titleMap[type as keyof typeof titleMap] || titleMap.system;
  return titles[index % titles.length];
}

/**
 * 알림 메시지 생성
 */
function generateNotificationMessage(type: string, priority: string, index: number): string {
  const messageMap = {
    payment: [
      `3일 후 결제 예정입니다. 계좌 잔액을 확인해주세요.`,
      `오늘 결제가 진행됩니다. 결제 수단을 확인해주세요.`,
      `다음 주 결제 예정입니다. 미리 준비해주세요.`,
      `정기 결제가 곧 진행됩니다.`,
      `구독료 결제 일정을 확인해주세요.`
    ],
    system: [
      `새로운 버전이 출시되었습니다. 업데이트를 확인해주세요.`,
      `시스템 성능이 개선되었습니다.`,
      `보안 패치가 적용되었습니다.`,
      `서비스 품질 향상을 위한 점검이 완료되었습니다.`,
      `계정 보안을 위해 비밀번호를 변경해주세요.`
    ],
    renewal: [
      `구독이 성공적으로 갱신되었습니다.`,
      `자동 갱신 설정이 변경되었습니다.`,
      `구독 기간이 1년 연장되었습니다.`,
      `갱신 확인이 필요합니다. 설정에서 확인해주세요.`,
      `구독이 다음 달까지 연장되었습니다.`
    ],
    expiry: [
      `7일 후 구독이 만료됩니다. 갱신을 고려해주세요.`,
      `서비스 이용 기간이 곧 종료됩니다.`,
      `구독 연장을 위해 결제 정보를 업데이트해주세요.`,
      `서비스가 3일 후 중단됩니다.`,
      `구독 갱신을 권장합니다.`
    ]
  };

  const messages = messageMap[type as keyof typeof messageMap] || messageMap.system;
  return messages[index % messages.length];
}

/**
 * Firebase 서비스 모킹
 */
export const mockFirebaseServices = () => {
  if (typeof window !== 'undefined') {
    // @ts-ignore
    window.mockMode = true;
    
    // 모킹된 Firebase 서비스들
    // @ts-ignore
    window.firebase = {
      auth: createMockAuth(),
      db: createMockFirestore(),
      storage: createMockStorage()
    };
    
    // @ts-ignore
    window.auth = window.firebase.auth;
    // @ts-ignore
    window.db = window.firebase.db;
    // @ts-ignore
    window.storage = window.firebase.storage;
    
    // 모킹된 알림 서비스
    // @ts-ignore
    window.notificationService = createMockNotificationService();
    // @ts-ignore
    window.notificationMonitor = createMockNotificationMonitor();
    
    console.log('🧪 테스트 모드: Firebase 서비스가 모킹되었습니다');
  }
};

/**
 * 모킹된 인증 서비스
 */
function createMockAuth() {
  return {
    currentUser: createMockUser(),
    signInWithEmailAndPassword: async () => ({ user: createMockUser() }),
    createUserWithEmailAndPassword: async () => ({ user: createMockUser() }),
    signOut: async () => {},
    onAuthStateChanged: (callback: (user: User | null) => void) => {
      setTimeout(() => callback(createMockUser()), 100);
      return () => {};
    }
  };
}

/**
 * 모킹된 Firestore 서비스
 */
function createMockFirestore() {
  return {
    collection: () => ({
      doc: () => ({
        get: async () => ({ exists: () => true, data: () => ({}) }),
        set: async () => {},
        update: async () => {},
        delete: async () => {}
      }),
      add: async () => ({ id: 'mock-doc-id' }),
      get: async () => ({ docs: [] }),
      onSnapshot: (callback: (snapshot: any) => void) => {
        setTimeout(() => callback({ docs: [] }), 100);
        return () => {};
      }
    })
  };
}

/**
 * 모킹된 Storage 서비스
 */
function createMockStorage() {
  return {
    ref: () => ({
      put: async () => ({ ref: { getDownloadURL: async () => 'https://mock-url.com/image.jpg' } }),
      getDownloadURL: async () => 'https://mock-url.com/image.jpg',
      delete: async () => {}
    })
  };
}

/**
 * 모킹된 알림 서비스
 */
function createMockNotificationService() {
  const mockNotifications = createMockNotifications(25);
  
  return {
    getNotifications: async () => ({ 
      success: true, 
      data: mockNotifications,
      error: null 
    }),
    subscribeToNotifications: (userId: string, callback: (notifications: NotificationUI[]) => void) => {
      setTimeout(() => callback(mockNotifications), 500);
      return () => {};
    },
    markAsRead: async (id: string) => {
      console.log(`📖 모킹: 알림 ${id} 읽음 처리`);
      return { success: true, error: null };
    },
    deleteNotification: async (id: string) => {
      console.log(`🗑️ 모킹: 알림 ${id} 삭제`);
      return { success: true, error: null };
    },
    createNotification: async (notification: any) => {
      console.log(`📨 모킹: 알림 생성`, notification);
      return { success: true, data: { id: 'mock-notification-id' }, error: null };
    }
  };
}

/**
 * 모킹된 알림 모니터링 서비스
 */
function createMockNotificationMonitor() {
  return {
    checkPaymentDue: (userId: string, subscriptions: any[]) => {
      console.log(`💰 모킹: 결제 예정 확인 - 사용자: ${userId}, 구독: ${subscriptions.length}개`);
    },
    checkSubscriptionExpiry: (userId: string, subscriptions: any[]) => {
      console.log(`⏰ 모킹: 구독 만료 확인 - 사용자: ${userId}, 구독: ${subscriptions.length}개`);
    },
    startMonitoring: () => {
      console.log(`🔍 모킹: 모니터링 시작`);
    },
    stopMonitoring: () => {
      console.log(`⏹️ 모킹: 모니터링 중지`);
    }
  };
}