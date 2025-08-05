// 구독 관련 Firebase 쿼리 최적화

import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  getDocs,
  onSnapshot,
  DocumentData,
  QueryConstraint 
} from 'firebase/firestore';
import { db } from './client';

/**
 * 안전한 구독 쿼리 - 인덱스 오류 방지
 */
export const getSubscriptionsForUser = async (userId: string, limitCount: number = 50) => {
  try {
    console.log('🔍 구독 데이터 조회 시작:', userId);
    
    // 방법 1: 단순 where 쿼리 (인덱스 불필요)
    const simpleQuery = query(
      collection(db, 'subscriptions'),
      where('userId', '==', userId),
      firestoreLimit(limitCount)
    );
    
    const querySnapshot = await getDocs(simpleQuery);
    const subscriptions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // 클라이언트 사이드에서 정렬 (인덱스 오류 방지)
    const sortedSubscriptions = subscriptions.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime; // 내림차순 정렬
    });
    
    console.log('✅ 구독 데이터 조회 성공:', sortedSubscriptions.length);
    return { data: sortedSubscriptions, error: null };
    
  } catch (error: any) {
    console.error('❌ 구독 데이터 조회 실패:', error);
    
    // 인덱스 오류인 경우 대체 방법 시도
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      console.log('🔄 인덱스 오류 - 대체 방법으로 재시도');
      return await getSubscriptionsWithoutIndex(userId, limitCount);
    }
    
    return { data: [], error };
  }
};

/**
 * 인덱스 없이 구독 데이터 조회하는 대체 방법
 */
export const getSubscriptionsWithoutIndex = async (userId: string, limitCount: number = 50) => {
  try {
    console.log('🔄 인덱스 없는 방법으로 구독 조회:', userId);
    
    // 가장 간단한 쿼리만 사용
    const basicQuery = query(
      collection(db, 'subscriptions'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(basicQuery);
    let subscriptions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // 클라이언트에서 정렬 및 제한
    subscriptions = subscriptions
      .sort((a, b) => {
        const aTime = a.createdAt?.seconds || a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.seconds || b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      })
      .slice(0, limitCount);
    
    console.log('✅ 대체 방법으로 구독 조회 성공:', subscriptions.length);
    return { data: subscriptions, error: null };
    
  } catch (error: any) {
    console.error('❌ 대체 방법도 실패:', error);
    return { data: [], error };
  }
};

/**
 * 실시간 구독 데이터 구독 (안전한 방법)
 */
export const subscribeToUserSubscriptions = (
  userId: string, 
  callback: (subscriptions: DocumentData[]) => void,
  limitCount: number = 50
) => {
  try {
    console.log('🔔 실시간 구독 시작:', userId);
    
    // 간단한 쿼리로 실시간 구독
    const simpleQuery = query(
      collection(db, 'subscriptions'),
      where('userId', '==', userId)
    );
    
    return onSnapshot(simpleQuery, (snapshot) => {
      let subscriptions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // 클라이언트에서 정렬 및 제한
      subscriptions = subscriptions
        .sort((a, b) => {
          const aTime = a.createdAt?.seconds || a.createdAt?.toMillis?.() || 0;
          const bTime = b.createdAt?.seconds || b.createdAt?.toMillis?.() || 0;
          return bTime - aTime;
        })
        .slice(0, limitCount);
      
      console.log('📨 실시간 구독 업데이트:', subscriptions.length);
      callback(subscriptions);
    }, (error) => {
      console.error('❌ 실시간 구독 오류:', error);
      
      // 오류 발생 시 빈 배열 반환
      callback([]);
    });
    
  } catch (error: any) {
    console.error('❌ 실시간 구독 설정 실패:', error);
    return () => {}; // 빈 unsubscribe 함수
  }
};

/**
 * 구독 통계 조회 (인덱스 오류 방지)
 */
export const getSubscriptionStats = async (userId: string) => {
  try {
    console.log('📊 구독 통계 조회:', userId);
    
    const { data: subscriptions, error } = await getSubscriptionsForUser(userId, 1000);
    
    if (error) {
      throw error;
    }
    
    // 클라이언트에서 통계 계산
    const now = new Date();
    const stats = {
      total: subscriptions.length,
      active: subscriptions.filter(s => s.status === 'active').length,
      paused: subscriptions.filter(s => s.status === 'paused').length,
      cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
      totalMonthly: subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, s) => {
          const amount = s.currency === 'USD' ? s.amount * 1300 : s.amount;
          return sum + (s.paymentCycle === 'monthly' ? amount : amount / 12);
        }, 0),
      byCategory: subscriptions.reduce((acc, s) => {
        const category = s.category || '기타';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
    
    console.log('✅ 구독 통계 계산 완료:', stats);
    return { data: stats, error: null };
    
  } catch (error: any) {
    console.error('❌ 구독 통계 조회 실패:', error);
    return { 
      data: {
        total: 0,
        active: 0,
        paused: 0,
        cancelled: 0,
        totalMonthly: 0,
        byCategory: {}
      }, 
      error 
    };
  }
};

/**
 * Firebase 인덱스 상태 확인
 */
export const checkFirebaseIndexStatus = async () => {
  try {
    // 테스트 쿼리로 인덱스 상태 확인
    const testQuery = query(
      collection(db, 'subscriptions'),
      where('userId', '==', 'test-user'),
      orderBy('createdAt', 'desc'),
      firestoreLimit(1)
    );
    
    await getDocs(testQuery);
    
    console.log('✅ Firebase 인덱스 정상');
    return { hasIndex: true, error: null };
    
  } catch (error: any) {
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      console.log('⚠️ Firebase 인덱스 필요');
      return { 
        hasIndex: false, 
        error,
        indexUrl: extractIndexUrl(error.message)
      };
    }
    
    console.log('❌ Firebase 인덱스 확인 실패:', error);
    return { hasIndex: false, error };
  }
};

/**
 * 오류 메시지에서 인덱스 URL 추출
 */
function extractIndexUrl(errorMessage: string): string | null {
  const urlMatch = errorMessage.match(/https:\/\/console\.firebase\.google\.com[^\s]+/);
  return urlMatch ? urlMatch[0] : null;
}