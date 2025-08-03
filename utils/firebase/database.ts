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
  Timestamp,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';
import { db, auth } from './config';

// 타입 정의
export interface Subscription {
  id?: string;
  userId: string;
  serviceName: string;
  serviceUrl?: string;
  logo?: string;
  logoImage?: string;
  amount: number;
  currency: 'KRW' | 'USD';
  paymentCycle: 'monthly' | 'yearly' | 'onetime';
  paymentDay: number;
  paymentMethod?: string;
  startDate: Date;
  endDate?: Date;
  autoRenewal: boolean;
  status: 'active' | 'paused' | 'cancelled';
  category?: string;
  tier?: string;
  memo?: string;
  notifications: {
    sevenDays: boolean;
    threeDays: boolean;
    sameDay: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id?: string;
  userId: string;
  type: 'payment' | 'renewal' | 'expiry' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  subscriptionId?: string;
  category?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentHistory {
  id?: string;
  userId: string;
  subscriptionId: string;
  serviceName: string;
  amount: number;
  currency: 'KRW' | 'USD';
  paymentDate: Date;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod?: string;
  paymentCycle?: 'monthly' | 'yearly' | 'onetime';
  notes?: string;
  createdAt: Date;
}

export interface UserPreferences {
  id?: string;
  userId: string;
  exchangeRate: number;
  defaultCurrency: 'KRW' | 'USD';
  notifications: {
    paymentReminders: boolean;
    priceChanges: boolean;
    subscriptionExpiry: boolean;
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
  language: 'ko' | 'en';
  timezone: string;
  dateFormat: string;
  currencyFormat: string;
  createdAt: Date;
  updatedAt: Date;
}

// 유틸리티 함수들
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return timestamp;
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

// 구독 서비스
export const subscriptionService = {
  // 구독 목록 조회
  async getSubscriptions(userId: string): Promise<Subscription[]> {
    try {
      const q = query(
        collection(db, 'subscriptions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertTimestamp(doc.data().createdAt),
        updatedAt: convertTimestamp(doc.data().updatedAt),
        startDate: convertTimestamp(doc.data().startDate),
        endDate: doc.data().endDate ? convertTimestamp(doc.data().endDate) : undefined
      })) as Subscription[];
    } catch (error) {
      console.error('구독 목록 조회 실패:', error);
      throw error;
    }
  },

  // 구독 조회
  async getSubscription(id: string): Promise<Subscription | null> {
    try {
      const docRef = doc(db, 'subscriptions', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
          startDate: convertTimestamp(data.startDate),
          endDate: data.endDate ? convertTimestamp(data.endDate) : undefined
        } as Subscription;
      }
      
      return null;
    } catch (error) {
      console.error('구독 조회 실패:', error);
      throw error;
    }
  },

  // 구독 생성
  async createSubscription(subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date();
      const subscriptionData = {
        ...subscription,
        createdAt: now,
        updatedAt: now
      };
      
      const docRef = await addDoc(collection(db, 'subscriptions'), convertToFirestore(subscriptionData));
      return docRef.id;
    } catch (error) {
      console.error('구독 생성 실패:', error);
      throw error;
    }
  },

  // 구독 수정
  async updateSubscription(id: string, updates: Partial<Subscription>): Promise<void> {
    try {
      const docRef = doc(db, 'subscriptions', id);
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };
      
      await updateDoc(docRef, convertToFirestore(updateData));
    } catch (error) {
      console.error('구독 수정 실패:', error);
      throw error;
    }
  },

  // 구독 삭제
  async deleteSubscription(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'subscriptions', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('구독 삭제 실패:', error);
      throw error;
    }
  },

  // 활성 구독 수 조회
  async getActiveSubscriptionsCount(userId: string): Promise<number> {
    try {
      const q = query(
        collection(db, 'subscriptions'),
        where('userId', '==', userId),
        where('status', '==', 'active')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error('활성 구독 수 조회 실패:', error);
      throw error;
    }
  }
};

// 알림 서비스
export const notificationService = {
  // 알림 목록 조회
  async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertTimestamp(doc.data().createdAt),
        updatedAt: convertTimestamp(doc.data().updatedAt)
      })) as Notification[];
    } catch (error) {
      console.error('알림 목록 조회 실패:', error);
      throw error;
    }
  },

  // 알림 생성
  async createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date();
      const notificationData = {
        ...notification,
        createdAt: now,
        updatedAt: now
      };
      
      const docRef = await addDoc(collection(db, 'notifications'), convertToFirestore(notificationData));
      return docRef.id;
    } catch (error) {
      console.error('알림 생성 실패:', error);
      throw error;
    }
  },

  // 알림 읽음 처리
  async markAsRead(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'notifications', id);
      await updateDoc(docRef, {
        isRead: true,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
      throw error;
    }
  }
};

// 사용자 설정 서비스
export const userPreferencesService = {
  // 사용자 설정 조회
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const q = query(
        collection(db, 'userPreferences'),
        where('userId', '==', userId),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        ...data,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt)
      } as UserPreferences;
    } catch (error) {
      console.error('사용자 설정 조회 실패:', error);
      throw error;
    }
  },

  // 사용자 설정 생성/수정
  async upsertUserPreferences(preferences: Omit<UserPreferences, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const existing = await this.getUserPreferences(preferences.userId);
      const now = new Date();
      
      if (existing) {
        // 기존 설정 업데이트
        const docRef = doc(db, 'userPreferences', existing.id!);
        await updateDoc(docRef, {
          ...preferences,
          updatedAt: now
        });
        return existing.id!;
      } else {
        // 새 설정 생성
        const preferencesData = {
          ...preferences,
          createdAt: now,
          updatedAt: now
        };
        
        const docRef = await addDoc(collection(db, 'userPreferences'), convertToFirestore(preferencesData));
        return docRef.id;
      }
    } catch (error) {
      console.error('사용자 설정 저장 실패:', error);
      throw error;
    }
  }
}; 