import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp, auth } from './config';

// Firebase Functions 초기화
let functions: any = null;

try {
  if (firebaseApp) {
    functions = getFunctions(firebaseApp);
    console.log('✅ Firebase Functions 초기화 완료');
  } else {
    console.warn('⚠️ Firebase 앱이 초기화되지 않아 Functions를 사용할 수 없습니다.');
  }
} catch (error) {
  console.error('❌ Firebase Functions 초기화 실패:', error);
}

// Cloud Functions 호출 타입 정의
interface CallableFunction<T = any, R = any> {
  (data?: T): Promise<{ data: R }>;
}

// 구독 관련 함수들
export const subscriptionFunctions = {
  // 구독 목록 조회
  getUserSubscriptions: httpsCallable(functions, 'getUserSubscriptions') as CallableFunction<void, { subscriptions: any[] }>,
  
  // 구독 생성
  createSubscription: httpsCallable(functions, 'createSubscription') as CallableFunction<any, { id: string }>,
  
  // 구독 수정
  updateSubscription: httpsCallable(functions, 'updateSubscription') as CallableFunction<{ subscriptionId: string; [key: string]: any }, { success: boolean }>,
  
  // 구독 삭제
  deleteSubscription: httpsCallable(functions, 'deleteSubscription') as CallableFunction<{ subscriptionId: string }, { success: boolean }>
};

// 알림 관련 함수들
export const notificationFunctions = {
  // 알림 목록 조회
  getUserNotifications: httpsCallable(functions, 'getUserNotifications') as CallableFunction<void, { notifications: any[] }>,
  
  // 알림 읽음 처리
  markNotificationAsRead: httpsCallable(functions, 'markNotificationAsRead') as CallableFunction<{ notificationId: string }, { success: boolean }>
};

// 사용자 관련 함수들
export const userFunctions = {
  // 사용자 프로필 조회
  getUserProfile: httpsCallable(functions, 'getUserProfile') as CallableFunction<void, { profile: any }>
};

// 환율 관련 함수들
export const exchangeFunctions = {
  // 환율 조회
  getExchangeRates: httpsCallable(functions, 'getExchangeRates') as CallableFunction<void, { rates: any }>
};

// 에러 핸들링을 위한 래퍼 함수
export const callCloudFunction = async <T = any, R = any>(
  func: CallableFunction<T, R>,
  data?: T
): Promise<R> => {
  try {
    if (!functions) {
      throw new Error('Firebase Functions가 초기화되지 않았습니다.');
    }
    
    const result = await func(data);
    return result.data;
  } catch (error: any) {
    console.error('Cloud Function 호출 오류:', error);
    
    // Firebase Functions 에러 코드에 따른 처리
    switch (error.code) {
      case 'functions/unauthenticated':
        throw new Error('로그인이 필요합니다.');
      case 'functions/permission-denied':
        throw new Error('권한이 없습니다.');
      case 'functions/not-found':
        throw new Error('함수를 찾을 수 없습니다.');
      case 'functions/internal':
        throw new Error('서버 내부 오류가 발생했습니다.');
      case 'functions/unavailable':
        throw new Error('서비스를 일시적으로 사용할 수 없습니다.');
      default:
        throw new Error(error.message || '알 수 없는 오류가 발생했습니다.');
    }
  }
};

// API 호출 헬퍼 함수들
export const api = {
  // 구독 관련
  subscriptions: {
    async getAll() {
      const result = await callCloudFunction(subscriptionFunctions.getUserSubscriptions);
      return result.subscriptions;
    },
    
    async create(subscriptionData: any) {
      const result = await callCloudFunction(subscriptionFunctions.createSubscription, subscriptionData);
      return result.id;
    },
    
    async update(subscriptionId: string, updateData: any) {
      const result = await callCloudFunction(subscriptionFunctions.updateSubscription, {
        subscriptionId,
        ...updateData
      });
      return result.success;
    },
    
    async delete(subscriptionId: string) {
      const result = await callCloudFunction(subscriptionFunctions.deleteSubscription, {
        subscriptionId
      });
      return result.success;
    }
  },
  
  // 알림 관련
  notifications: {
    async getAll() {
      const result = await callCloudFunction(notificationFunctions.getUserNotifications);
      return result.notifications;
    },
    
    async markAsRead(notificationId: string) {
      const result = await callCloudFunction(notificationFunctions.markNotificationAsRead, {
        notificationId
      });
      return result.success;
    }
  },
  
  // 사용자 관련
  user: {
    async getProfile() {
      const result = await callCloudFunction(userFunctions.getUserProfile);
      return result.profile;
    }
  },
  
  // 환율 관련
  exchange: {
    async getRates() {
      const result = await callCloudFunction(exchangeFunctions.getExchangeRates);
      return result.rates;
    }
  }
};

// Firestore 실시간 리스너를 위한 헬퍼
export const realtimeHelpers = {
  // 구독 목록 실시간 리스너
  subscribeToSubscriptions: (userId: string, callback: (subscriptions: any[]) => void) => {
    const { onSnapshot, collection, query, orderBy } = require('firebase/firestore');
    const { db } = require('./config');
    
    const q = query(
      collection(db, 'users', userId, 'subscriptions'),
      orderBy('nextPaymentDate', 'asc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const subscriptions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(subscriptions);
    });
  },
  
  // 알림 목록 실시간 리스너
  subscribeToNotifications: (userId: string, callback: (notifications: any[]) => void) => {
    const { onSnapshot, collection, query, orderBy, limit } = require('firebase/firestore');
    const { db } = require('./config');
    
    const q = query(
      collection(db, 'users', userId, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(notifications);
    });
  }
};