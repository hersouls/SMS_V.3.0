// 통합 알림 서비스

import { 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  onSnapshot,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from './firebase/config';
import { 
  BaseNotification,
  NotificationUI,
  NotificationFirebase,
  CreateNotificationRequest,
  UpdateNotificationRequest,
  NotificationFilter,
  NotificationStats,
  NotificationSettings,
  NotificationBatch,
  NotificationError,
  NotificationServiceResponse,
  NotificationEvent,
  NOTIFICATION_CONSTANTS
} from '../types/notifications';

// 유틸리티 함수들
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  return timestamp instanceof Date ? timestamp : new Date(timestamp);
};

const convertToFirestore = (data: any) => {
  const converted = { ...data };
  
  // Date 객체를 Timestamp로 변환
  Object.keys(converted).forEach(key => {
    if (converted[key] instanceof Date) {
      converted[key] = Timestamp.fromDate(converted[key]);
    }
  });
  
  return converted;
};

const convertFirebaseToUI = (firebaseNotification: any): NotificationUI => {
  return {
    ...firebaseNotification,
    date: convertTimestamp(firebaseNotification.createdAt).toISOString(),
    createdAt: undefined,
    updatedAt: undefined
  };
};

const convertUIToFirebase = (uiNotification: NotificationUI): Omit<NotificationFirebase, 'id'> => {
  const { date, ...rest } = uiNotification;
  return {
    ...rest,
    createdAt: new Date(date),
    updatedAt: new Date()
  };
};

// 알림 서비스 클래스
export class NotificationService {
  private static instance: NotificationService;
  private listeners: Map<string, ((notifications: NotificationUI[]) => void)[]> = new Map();
  private unsubscribeMap: Map<string, () => void> = new Map();

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // 현재 사용자 확인
  private async getCurrentUser() {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('사용자가 로그인되어 있지 않습니다.');
    }
    return user;
  }

  // 에러 생성 헬퍼
  private createError(
    code: NotificationError['code'], 
    message: string, 
    context?: any
  ): NotificationError {
    return {
      code,
      message,
      context,
      timestamp: new Date()
    };
  }

  // 알림 생성
  async createNotification(request: CreateNotificationRequest): Promise<NotificationServiceResponse<string>> {
    try {
      const user = await this.getCurrentUser();
      
      // 권한 확인
      if (request.userId !== user.uid) {
        throw this.createError('PERMISSION_DENIED', '다른 사용자의 알림을 생성할 수 없습니다.');
      }

      // 데이터 검증
      if (!request.title || request.title.length > NOTIFICATION_CONSTANTS.MAX_TITLE_LENGTH) {
        throw this.createError('INVALID_DATA', '제목이 유효하지 않습니다.');
      }
      
      if (!request.message || request.message.length > NOTIFICATION_CONSTANTS.MAX_MESSAGE_LENGTH) {
        throw this.createError('INVALID_DATA', '메시지가 유효하지 않습니다.');
      }

      // 일일 할당량 확인
      const todayCount = await this.getTodayNotificationCount(user.uid);
      if (todayCount >= NOTIFICATION_CONSTANTS.MAX_NOTIFICATIONS_PER_DAY) {
        throw this.createError('QUOTA_EXCEEDED', '일일 알림 생성 한도를 초과했습니다.');
      }

      const now = new Date();
      const notificationData = {
        ...request,
        priority: request.priority || NOTIFICATION_CONSTANTS.DEFAULT_PRIORITY,
        isRead: false,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(
        collection(db, 'notifications'), 
        convertToFirestore(notificationData)
      );

      // 브라우저 알림도 전송 (권한이 있는 경우)
      await this.sendBrowserNotification(notificationData);

      console.log('✅ 알림 생성 성공:', docRef.id);
      
      return {
        success: true,
        data: docRef.id
      };
    } catch (error: any) {
      console.error('❌ 알림 생성 실패:', error);
      
      const notificationError = error instanceof Error && 'code' in error 
        ? error as NotificationError
        : this.createError('UNKNOWN_ERROR', error.message || '알림 생성에 실패했습니다.');

      return {
        success: false,
        error: notificationError
      };
    }
  }

  // 알림 목록 조회
  async getNotifications(
    userId: string, 
    filter?: NotificationFilter
  ): Promise<NotificationServiceResponse<NotificationUI[]>> {
    try {
      const user = await this.getCurrentUser();
      
      if (userId !== user.uid) {
        throw this.createError('PERMISSION_DENIED', '다른 사용자의 알림을 조회할 수 없습니다.');
      }

      let q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      // 필터 적용
      if (filter?.type && filter.type !== 'all') {
        q = query(q, where('type', '==', filter.type));
      }
      
      if (filter?.priority && filter.priority !== 'all') {
        q = query(q, where('priority', '==', filter.priority));
      }

      // 제한 적용
      q = query(q, limit(50));

      const querySnapshot = await getDocs(q);
      let notifications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertTimestamp(doc.data().createdAt),
        updatedAt: convertTimestamp(doc.data().updatedAt)
      })) as NotificationFirebase[];

      // 클라이언트 사이드 필터링
      if (filter?.status && filter.status !== 'all') {
        notifications = notifications.filter(n => 
          filter.status === 'read' ? n.isRead : !n.isRead
        );
      }

      if (filter?.dateRange) {
        notifications = notifications.filter(n =>
          n.createdAt >= filter.dateRange!.start && 
          n.createdAt <= filter.dateRange!.end
        );
      }

      // UI 형식으로 변환
      const uiNotifications = notifications.map(convertFirebaseToUI);

      return {
        success: true,
        data: uiNotifications,
        metadata: {
          total: uiNotifications.length,
          hasMore: querySnapshot.size === 50
        }
      };
    } catch (error: any) {
      console.error('❌ 알림 목록 조회 실패:', error);
      
      const notificationError = error instanceof Error && 'code' in error
        ? error as NotificationError
        : this.createError('UNKNOWN_ERROR', error.message || '알림 목록 조회에 실패했습니다.');

      return {
        success: false,
        error: notificationError
      };
    }
  }

  // 알림 읽음 처리
  async markAsRead(notificationId: string): Promise<NotificationServiceResponse<boolean>> {
    try {
      const user = await this.getCurrentUser();
      
      const notificationRef = doc(db, 'notifications', notificationId);
      const notificationDoc = await getDoc(notificationRef);
      
      if (!notificationDoc.exists()) {
        throw this.createError('INVALID_DATA', '알림을 찾을 수 없습니다.');
      }

      const notificationData = notificationDoc.data();
      if (notificationData.userId !== user.uid) {
        throw this.createError('PERMISSION_DENIED', '권한이 없습니다.');
      }

      await updateDoc(notificationRef, {
        isRead: true,
        updatedAt: serverTimestamp()
      });

      console.log('✅ 알림 읽음 처리 성공:', notificationId);
      
      return {
        success: true,
        data: true
      };
    } catch (error: any) {
      console.error('❌ 알림 읽음 처리 실패:', error);
      
      const notificationError = error instanceof Error && 'code' in error
        ? error as NotificationError
        : this.createError('UNKNOWN_ERROR', error.message || '알림 읽음 처리에 실패했습니다.');

      return {
        success: false,
        error: notificationError
      };
    }
  }

  // 알림 삭제
  async deleteNotification(notificationId: string): Promise<NotificationServiceResponse<boolean>> {
    try {
      const user = await this.getCurrentUser();
      
      const notificationRef = doc(db, 'notifications', notificationId);
      const notificationDoc = await getDoc(notificationRef);
      
      if (!notificationDoc.exists()) {
        throw this.createError('INVALID_DATA', '알림을 찾을 수 없습니다.');
      }

      const notificationData = notificationDoc.data();
      if (notificationData.userId !== user.uid) {
        throw this.createError('PERMISSION_DENIED', '권한이 없습니다.');
      }

      await deleteDoc(notificationRef);

      console.log('✅ 알림 삭제 성공:', notificationId);
      
      return {
        success: true,
        data: true
      };
    } catch (error: any) {
      console.error('❌ 알림 삭제 실패:', error);
      
      const notificationError = error instanceof Error && 'code' in error
        ? error as NotificationError
        : this.createError('UNKNOWN_ERROR', error.message || '알림 삭제에 실패했습니다.');

      return {
        success: false,
        error: notificationError
      };
    }
  }

  // 배치 알림 생성
  async createBatchNotifications(batch: NotificationBatch): Promise<NotificationServiceResponse<string[]>> {
    try {
      const user = await this.getCurrentUser();
      
      if (batch.userId !== user.uid) {
        throw this.createError('PERMISSION_DENIED', '권한이 없습니다.');
      }

      if (batch.notifications.length === 0) {
        throw this.createError('INVALID_DATA', '생성할 알림이 없습니다.');
      }

      const firestoreBatch = writeBatch(db);
      const notificationIds: string[] = [];
      const now = new Date();

      for (const notification of batch.notifications) {
        // 검증
        if (!notification.title || !notification.message) {
          continue;
        }

        const docRef = doc(collection(db, 'notifications'));
        const notificationData = {
          ...notification,
          userId: batch.userId,
          priority: notification.priority || NOTIFICATION_CONSTANTS.DEFAULT_PRIORITY,
          isRead: false,
          createdAt: now,
          updatedAt: now
        };

        firestoreBatch.set(docRef, convertToFirestore(notificationData));
        notificationIds.push(docRef.id);
      }

      await firestoreBatch.commit();

      console.log('✅ 배치 알림 생성 성공:', notificationIds.length);
      
      return {
        success: true,
        data: notificationIds
      };
    } catch (error: any) {
      console.error('❌ 배치 알림 생성 실패:', error);
      
      const notificationError = error instanceof Error && 'code' in error
        ? error as NotificationError
        : this.createError('UNKNOWN_ERROR', error.message || '배치 알림 생성에 실패했습니다.');

      return {
        success: false,
        error: notificationError
      };
    }
  }

  // 알림 통계 조회
  async getNotificationStats(userId: string): Promise<NotificationServiceResponse<NotificationStats>> {
    try {
      const user = await this.getCurrentUser();
      
      if (userId !== user.uid) {
        throw this.createError('PERMISSION_DENIED', '권한이 없습니다.');
      }

      const result = await this.getNotifications(userId);
      if (!result.success || !result.data) {
        throw new Error('알림 목록을 가져올 수 없습니다.');
      }

      const notifications = result.data;
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const stats: NotificationStats = {
        total: notifications.length,
        unread: notifications.filter(n => !n.isRead).length,
        byType: {
          payment: notifications.filter(n => n.type === 'payment').length,
          renewal: notifications.filter(n => n.type === 'renewal').length,
          expiry: notifications.filter(n => n.type === 'expiry').length,
          system: notifications.filter(n => n.type === 'system').length,
          warning: notifications.filter(n => n.type === 'warning').length,
          info: notifications.filter(n => n.type === 'info').length
        },
        byPriority: {
          low: notifications.filter(n => n.priority === 'low').length,
          medium: notifications.filter(n => n.priority === 'medium').length,
          high: notifications.filter(n => n.priority === 'high').length,
          urgent: notifications.filter(n => n.priority === 'urgent').length
        },
        todayCount: notifications.filter(n => new Date(n.date) >= today).length,
        weekCount: notifications.filter(n => new Date(n.date) >= weekAgo).length,
        monthCount: notifications.filter(n => new Date(n.date) >= monthAgo).length
      };

      return {
        success: true,
        data: stats
      };
    } catch (error: any) {
      console.error('❌ 알림 통계 조회 실패:', error);
      
      const notificationError = error instanceof Error && 'code' in error
        ? error as NotificationError
        : this.createError('UNKNOWN_ERROR', error.message || '알림 통계 조회에 실패했습니다.');

      return {
        success: false,
        error: notificationError
      };
    }
  }

  // 실시간 리스너
  subscribeToNotifications(
    userId: string, 
    callback: (notifications: NotificationUI[]) => void
  ): () => void {
    if (!this.listeners.has(userId)) {
      this.listeners.set(userId, []);
    }
    
    this.listeners.get(userId)!.push(callback);

    // 첫 번째 리스너인 경우 Firestore 리스너 설정
    if (this.listeners.get(userId)!.length === 1) {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: convertTimestamp(doc.data().createdAt),
          updatedAt: convertTimestamp(doc.data().updatedAt)
        })) as NotificationFirebase[];

        const uiNotifications = notifications.map(convertFirebaseToUI);
        
        // 모든 리스너에게 알림
        this.listeners.get(userId)?.forEach(listener => {
          try {
            listener(uiNotifications);
          } catch (error) {
            console.error('알림 리스너 오류:', error);
          }
        });
      });

      this.unsubscribeMap.set(userId, unsubscribe);
    }

    // 구독 해제 함수 반환
    return () => {
      const callbacks = this.listeners.get(userId);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }

        // 마지막 리스너인 경우 Firestore 리스너 해제
        if (callbacks.length === 0) {
          const unsubscribe = this.unsubscribeMap.get(userId);
          if (unsubscribe) {
            unsubscribe();
            this.unsubscribeMap.delete(userId);
          }
          this.listeners.delete(userId);
        }
      }
    };
  }

  // 브라우저 알림 전송
  private async sendBrowserNotification(notification: any): Promise<void> {
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        const browserNotification = new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: `notification-${notification.id || Date.now()}`,
          requireInteraction: notification.priority === 'high' || notification.priority === 'urgent'
        });

        // 클릭 이벤트 처리
        browserNotification.onclick = () => {
          window.focus();
          if (notification.subscriptionId) {
            window.location.href = `/subscriptions/${notification.subscriptionId}`;
          }
          browserNotification.close();
        };

        // 자동 닫기 (높은 우선순위가 아닌 경우)
        if (notification.priority !== 'high' && notification.priority !== 'urgent') {
          setTimeout(() => {
            browserNotification.close();
          }, 5000);
        }
      }
    } catch (error) {
      console.warn('브라우저 알림 전송 실패:', error);
    }
  }

  // 오늘 생성된 알림 수 조회
  private async getTodayNotificationCount(userId: string): Promise<number> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(today))
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.warn('오늘 알림 수 조회 실패:', error);
      return 0;
    }
  }
}

// 싱글톤 인스턴스 내보내기
export const notificationService = NotificationService.getInstance();