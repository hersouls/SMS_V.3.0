// 안전한 구독 데이터 훅 - Firebase 인덱스 오류 방지

import { useState, useEffect } from 'react';
import { 
  getSubscriptionsForUser,
  subscribeToUserSubscriptions 
} from '../utils/firebase/subscriptionQueries';
import { Subscription } from '../contexts/DataContext';

export interface UseSafeSubscriptionsReturn {
  data: Subscription[];
  loading: boolean;
  error: any;
  refresh: () => Promise<void>;
}

export const useSafeSubscriptions = (userId: string | null): UseSafeSubscriptionsReturn => {
  const [data, setData] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  // 데이터 새로고침 함수
  const refresh = async () => {
    if (!userId) {
      setData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await getSubscriptionsForUser(userId);
      
      if (result.error) {
        throw result.error;
      }
      
      setData(result.data as Subscription[]);
      console.log('✅ 안전한 구독 데이터 로드 성공:', result.data.length);
      
    } catch (err: any) {
      console.error('❌ 안전한 구독 데이터 로드 실패:', err);
      setError(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // 초기 로딩 및 사용자 변경 시 데이터 로드
  useEffect(() => {
    refresh();
  }, [userId]);

  // 실시간 구독 설정
  useEffect(() => {
    if (!userId) {
      return;
    }

    console.log('🔔 안전한 실시간 구독 설정:', userId);
    
    const unsubscribe = subscribeToUserSubscriptions(
      userId,
      (subscriptions) => {
        console.log('📨 안전한 실시간 구독 업데이트:', subscriptions.length);
        setData(subscriptions as Subscription[]);
        setLoading(false);
        setError(null);
      }
    );

    return () => {
      console.log('🔔 안전한 실시간 구독 해제');
      unsubscribe();
    };
  }, [userId]);

  return {
    data,
    loading,
    error,
    refresh
  };
};