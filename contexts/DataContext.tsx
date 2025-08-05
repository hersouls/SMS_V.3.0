import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useCollection, useDocument } from '../hooks/useFirestore';
import { useSafeSubscriptions } from '../hooks/useSafeSubscriptions';
import { useAuth } from './AuthContext';
import { 
  createDocument,
  updateDocument,
  deleteDocument,
  where,
  orderBy,
  Timestamp
} from '../utils/firebase/client';
import { 
  getSubscriptionsForUser,
  subscribeToUserSubscriptions,
  getSubscriptionStats
} from '../utils/firebase/subscriptionQueries';

export interface Subscription {
  id: string;
  serviceName: string;
  serviceUrl?: string;
  logo: string;
  logoImage?: string;
  amount: number;
  currency: 'KRW' | 'USD';
  paymentCycle: 'monthly' | 'yearly' | 'onetime';
  paymentDay: number;
  paymentMethod?: string;
  startDate: string;
  endDate?: string;
  autoRenewal: boolean;
  status: 'active' | 'paused' | 'cancelled';
  category: string;
  tier?: string;
  tags: string[];
  memo?: string;
  notifications: {
    sevenDays: boolean;
    threeDays: boolean;
    sameDay: boolean;
  };
  userId: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface UserPreferences {
  id?: string;
  userId?: string;
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
  createdAt?: any;
  updatedAt?: any;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'payment' | 'renewal' | 'expiry' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  subscriptionId?: string;
  category?: string;
  metadata?: any;
  createdAt: any;
  updatedAt: any;
}

interface DataContextType {
  subscriptions: Subscription[];
  preferences: UserPreferences | null;
  notifications: Notification[];
  loading: boolean;
  error: Error | null;
  addSubscription: (subscription: Omit<Subscription, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<{ id: string | null; error: any }>;
  updateSubscription: (id: string, subscription: Partial<Subscription>) => Promise<{ success: boolean; error: any }>;
  deleteSubscription: (id: string) => Promise<{ success: boolean; error: any }>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<{ success: boolean; error: any }>;
  markNotificationAsRead: (id: string) => Promise<{ success: boolean; error: any }>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { user } = useAuth();

  // 사용자의 구독 정보 가져오기 (안전한 방법)
  const { 
    data: subscriptions, 
    loading: subscriptionsLoading, 
    error: subscriptionsError,
    refresh: refreshSubscriptions
  } = useSafeSubscriptions(user?.uid || null);

  // 구독 데이터 변경 로깅
  useEffect(() => {
    console.log('📊 구독 데이터 상태 변경:', {
      count: subscriptions?.length || 0,
      loading: subscriptionsLoading,
      error: subscriptionsError,
      userId: user?.uid
    });
  }, [subscriptions, subscriptionsLoading, subscriptionsError, user?.uid]);

  // 사용자의 설정 정보 가져오기
  const { 
    data: preferences, 
    loading: preferencesLoading, 
    error: preferencesError 
  } = useDocument<UserPreferences>(
    'preferences',
    user?.uid || ''
  );

  // 사용자의 알림 정보 가져오기
  const { 
    data: notifications, 
    loading: notificationsLoading, 
    error: notificationsError 
  } = useCollection<Notification>(
    'notifications',
    user ? [
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    ] : []
  );

  const loading = subscriptionsLoading || preferencesLoading || notificationsLoading;
  const error = subscriptionsError || preferencesError || notificationsError;

  // 에러 발생 시 로깅
  React.useEffect(() => {
    if (error) {
      console.error('📊 DataContext 에러 발생:', error);
    }
  }, [error]);

  const addSubscription = async (subscriptionData: Omit<Subscription, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) {
      return { id: null, error: new Error('사용자가 인증되지 않았습니다.') };
    }

    console.log('🔄 구독 추가 중:', subscriptionData.serviceName);

    // Remove undefined values to prevent Firestore errors
    const cleanSubscriptionData = Object.fromEntries(
      Object.entries(subscriptionData).filter(([key, value]) => {
        const isUndefined = value === undefined;
        if (isUndefined) {
          console.log(`🧹 Removing undefined field: ${key}`);
        }
        return !isUndefined;
      })
    );

    console.log('📝 Original subscription data:', subscriptionData);
    console.log('🧹 Cleaned subscription data:', cleanSubscriptionData);

    const newSubscription = {
      ...cleanSubscriptionData,
      userId: user.uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const result = await createDocument('subscriptions', newSubscription);
    
    if (result.id) {
      console.log('✅ 구독 추가 성공, 실시간 업데이트 대기 중...');
      // 실시간 업데이트를 위해 잠시 대기
      setTimeout(() => {
        console.log('🔄 실시간 데이터 새로고침 트리거');
      }, 1000);
    }

    return result;
  };

  const updateSubscription = async (id: string, subscriptionData: Partial<Subscription>) => {
    if (!user) {
      return { success: false, error: new Error('사용자가 인증되지 않았습니다.') };
    }

    console.log('🔄 구독 업데이트 중:', id);

    // Remove undefined values to prevent Firestore errors
    const cleanSubscriptionData = Object.fromEntries(
      Object.entries(subscriptionData).filter(([_, value]) => value !== undefined)
    );

    const updateData = {
      ...cleanSubscriptionData,
      updatedAt: Timestamp.now()
    };

    return await updateDocument('subscriptions', id, updateData);
  };

  const deleteSubscription = async (id: string) => {
    if (!user) {
      return { success: false, error: new Error('사용자가 인증되지 않았습니다.') };
    }

    console.log('🔄 구독 삭제 중:', id);
    return await deleteDocument('subscriptions', id);
  };

  const updatePreferences = async (preferencesData: Partial<UserPreferences>) => {
    if (!user) {
      return { success: false, error: new Error('사용자가 인증되지 않았습니다.') };
    }

    console.log('🔄 설정 업데이트 중');

    // Remove undefined values to prevent Firestore errors
    const cleanPreferencesData = Object.fromEntries(
      Object.entries(preferencesData).filter(([_, value]) => value !== undefined)
    );

    const updateData = {
      ...cleanPreferencesData,
      userId: user.uid,
      updatedAt: Timestamp.now()
    };

    if (preferences) {
      return await updateDocument('preferences', user.uid, updateData);
    } else {
      const newPreferences = {
        ...updateData,
        createdAt: Timestamp.now()
      };
      const result = await createDocument('preferences', newPreferences);
      return { success: !!result.id, error: result.error };
    }
  };

  const markNotificationAsRead = async (id: string) => {
    if (!user) {
      return { success: false, error: new Error('사용자가 인증되지 않았습니다.') };
    }

    console.log('🔄 알림 읽음 처리 중:', id);

    const updateData = {
      isRead: true,
      updatedAt: Timestamp.now()
    };

    return await updateDocument('notifications', id, updateData);
  };

  const value: DataContextType = {
    subscriptions: subscriptions || [],
    preferences: preferences || null,
    notifications: notifications || [],
    loading,
    error,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    updatePreferences,
    markNotificationAsRead
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};