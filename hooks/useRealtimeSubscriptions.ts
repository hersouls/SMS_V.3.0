import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCollection } from './useFirestore';
import { where, orderBy } from '../utils/firebase/client';
import { Subscription } from '../contexts/DataContext';

interface RealtimeSubscriptionsHook {
  subscriptions: Subscription[];
  loading: boolean;
  error: Error | null;
  refresh: () => void;
}

export const useRealtimeSubscriptions = (): RealtimeSubscriptionsHook => {
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Firestore 실시간 구독
  const { data: subscriptions, loading, error } = useCollection<Subscription>(
    'subscriptions',
    user ? [
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    ] : []
  );

  // 수동 새로고침 함수
  const refresh = () => {
    console.log('🔄 구독 데이터 새로고침');
    setRefreshTrigger(prev => prev + 1);
  };

  // 사용자 변경 시 자동 새로고침
  useEffect(() => {
    if (user) {
      console.log('👤 사용자 변경됨, 구독 데이터 새로고침');
      refresh();
    }
  }, [user?.uid]);

  // 데이터 변경 로깅
  useEffect(() => {
    if (subscriptions && subscriptions.length > 0) {
      console.log('📊 구독 데이터 업데이트됨:', {
        count: subscriptions.length,
        activeCount: subscriptions.filter(s => s.status === 'active').length,
        pausedCount: subscriptions.filter(s => s.status === 'paused').length,
        cancelledCount: subscriptions.filter(s => s.status === 'cancelled').length
      });
    }
  }, [subscriptions]);

  return {
    subscriptions: subscriptions || [],
    loading,
    error,
    refresh
  };
};