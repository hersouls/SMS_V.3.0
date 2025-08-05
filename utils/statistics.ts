import { db, auth } from './firebase/config';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  Timestamp,
  orderBy,
  limit
} from 'firebase/firestore';

// =====================================================
// 통계 업데이트 디바운싱 및 큐 관리
// =====================================================

const pendingUpdates = new Map<string, NodeJS.Timeout>();

/**
 * 통계 업데이트를 디바운싱하여 중복 호출 방지
 */
function debounceStatisticsUpdate(
  key: string,
  updateFunction: () => Promise<void>,
  delay: number = 2000
): void {
  // 기존 타이머 취소
  if (pendingUpdates.has(key)) {
    clearTimeout(pendingUpdates.get(key)!);
  }

  // 새 타이머 설정
  const timer = setTimeout(async () => {
    try {
      await updateFunction();
    } catch (error) {
      console.error(`디바운싱된 통계 업데이트 실패 (${key}):`, error);
    } finally {
      pendingUpdates.delete(key);
    }
  }, delay);

  pendingUpdates.set(key, timer);
}

// =====================================================
// 통계 데이터 타입 정의
// =====================================================

export interface SubscriptionStatistics {
  id?: string;
  userId: string;
  subscriptionId: string;
  date: string;
  monthlyAmountKrw: number;
  yearlyAmountKrw: number;
  totalPaidKrw: number;
  category: string;
  status: 'active' | 'paused' | 'cancelled';
  paymentCycle: 'monthly' | 'yearly' | 'onetime';
  createdAt: any;
  updatedAt: any;
}

export interface UserStatistics {
  id?: string;
  userId: string;
  totalActiveSubscriptions: number;
  totalMonthlyKrw: number;
  totalYearlyKrw: number;
  totalSpentKrw: number;
  categoryBreakdown: Record<string, {
    count: number;
    monthlyAmount: number;
    yearlyAmount: number;
  }>;
  trendData: Array<{
    month: string;
    amount: number;
  }>;
  lastUpdated: any;
}

export interface UserBehavior {
  id?: string;
  userId: string;
  lastActive: any;
  totalLogins: number;
  totalSubscriptionsAdded: number;
  totalSubscriptionsDeleted: number;
  favoriteCategory: string;
  averageSubscriptionValue: number;
  metadata: any;
  createdAt: any;
  updatedAt: any;
}

// =====================================================
// 헬퍼 함수들
// =====================================================

function getCurrentUserId(): string | null {
  return auth.currentUser?.uid || null;
}

function formatTimestamp(timestamp: any): string {
  if (!timestamp) return new Date().toISOString();
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  return new Date(timestamp).toISOString();
}

// =====================================================
// 통계 업데이트 함수들
// =====================================================

/**
 * 구독 변경 시 통계 업데이트
 */
export async function updateStatisticsOnSubscriptionChange(
  subscriptionId: string,
  userId: string,
  action: 'create' | 'update' | 'delete'
): Promise<void> {
  debounceStatisticsUpdate(
    `subscription-${subscriptionId}`,
    async () => {
      try {
        console.log(`📊 구독 통계 업데이트 시작: ${action} - ${subscriptionId}`);
        
        if (action === 'delete') {
          // 삭제된 구독의 통계는 유지하되 상태만 업데이트
          const statRef = doc(db, 'subscription_statistics', `${userId}_${subscriptionId}`);
          await updateDoc(statRef, {
            status: 'cancelled',
            updatedAt: serverTimestamp()
          });
        } else {
          // 구독 정보 가져오기
          const subscriptionRef = doc(db, 'subscriptions', subscriptionId);
          const subscriptionDoc = await getDoc(subscriptionRef);
          
          if (!subscriptionDoc.exists()) {
            console.error('구독을 찾을 수 없습니다:', subscriptionId);
            return;
          }

          const subscription = subscriptionDoc.data();
          
          // 통계 계산
          const monthlyAmount = subscription.paymentCycle === 'monthly' 
            ? subscription.amount 
            : subscription.paymentCycle === 'yearly' 
              ? subscription.amount / 12 
              : 0;
              
          const yearlyAmount = subscription.paymentCycle === 'yearly'
            ? subscription.amount
            : subscription.paymentCycle === 'monthly'
              ? subscription.amount * 12
              : 0;

          // 통계 데이터 저장
          const statData: Partial<SubscriptionStatistics> = {
            userId,
            subscriptionId,
            date: new Date().toISOString().split('T')[0],
            monthlyAmountKrw: subscription.currency === 'USD' 
              ? monthlyAmount * 1300 
              : monthlyAmount,
            yearlyAmountKrw: subscription.currency === 'USD'
              ? yearlyAmount * 1300
              : yearlyAmount,
            totalPaidKrw: 0, // 실제 결제 기록에서 계산
            category: subscription.category || 'Others',
            status: subscription.status,
            paymentCycle: subscription.paymentCycle,
            updatedAt: serverTimestamp()
          };

          const statRef = doc(db, 'subscription_statistics', `${userId}_${subscriptionId}`);
          if (action === 'create') {
            await setDoc(statRef, {
              ...statData,
              createdAt: serverTimestamp()
            });
          } else {
            await updateDoc(statRef, statData);
          }
        }

        // 사용자 전체 통계 업데이트
        await updateUserStatistics(userId);
        
        console.log('✅ 구독 통계 업데이트 완료');
      } catch (error) {
        console.error('❌ 구독 통계 업데이트 실패:', error);
      }
    }
  );
}

/**
 * 사용자 전체 통계 업데이트
 */
export async function updateUserStatistics(userId: string): Promise<void> {
  try {
    console.log('📊 사용자 통계 업데이트 시작:', userId);
    
    // 사용자의 모든 활성 구독 가져오기
    const subscriptionsRef = collection(db, 'subscriptions');
    const q = query(
      subscriptionsRef,
      where('userId', '==', userId),
      where('status', '==', 'active')
    );
    
    const querySnapshot = await getDocs(q);
    const subscriptions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // 통계 계산
    let totalMonthlyKrw = 0;
    let totalYearlyKrw = 0;
    const categoryBreakdown: Record<string, any> = {};

    subscriptions.forEach(sub => {
      const monthlyAmount = sub.paymentCycle === 'monthly'
        ? sub.amount
        : sub.paymentCycle === 'yearly'
          ? sub.amount / 12
          : 0;
          
      const yearlyAmount = sub.paymentCycle === 'yearly'
        ? sub.amount
        : sub.paymentCycle === 'monthly'
          ? sub.amount * 12
          : 0;

      const monthlyKrw = sub.currency === 'USD' ? monthlyAmount * 1300 : monthlyAmount;
      const yearlyKrw = sub.currency === 'USD' ? yearlyAmount * 1300 : yearlyAmount;

      totalMonthlyKrw += monthlyKrw;
      totalYearlyKrw += yearlyKrw;

      // 카테고리별 통계
      const category = sub.category || 'Others';
      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = {
          count: 0,
          monthlyAmount: 0,
          yearlyAmount: 0
        };
      }
      categoryBreakdown[category].count++;
      categoryBreakdown[category].monthlyAmount += monthlyKrw;
      categoryBreakdown[category].yearlyAmount += yearlyKrw;
    });

    // 사용자 통계 저장
    const userStatRef = doc(db, 'user_statistics', userId);
    await setDoc(userStatRef, {
      userId,
      totalActiveSubscriptions: subscriptions.length,
      totalMonthlyKrw,
      totalYearlyKrw,
      totalSpentKrw: 0, // 실제 결제 기록에서 계산
      categoryBreakdown,
      trendData: [], // 추후 구현
      lastUpdated: serverTimestamp()
    }, { merge: true });

    console.log('✅ 사용자 통계 업데이트 완료');
  } catch (error) {
    console.error('❌ 사용자 통계 업데이트 실패:', error);
  }
}

/**
 * 사용자 행동 추적
 */
export async function trackUserBehavior(
  userId: string,
  metadata: any = {}
): Promise<void> {
  try {
    console.log('🔍 사용자 행동 추적:', userId, metadata);
    
    const behaviorRef = doc(db, 'user_behavior', userId);
    const behaviorDoc = await getDoc(behaviorRef);
    
    if (behaviorDoc.exists()) {
      const currentData = behaviorDoc.data();
      const updates: any = {
        lastActive: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // 특정 행동에 따른 카운터 증가
      if (metadata.action === 'login') {
        updates.totalLogins = (currentData.totalLogins || 0) + 1;
      } else if (metadata.action === 'subscription_add') {
        updates.totalSubscriptionsAdded = (currentData.totalSubscriptionsAdded || 0) + 1;
      } else if (metadata.action === 'subscription_delete') {
        updates.totalSubscriptionsDeleted = (currentData.totalSubscriptionsDeleted || 0) + 1;
      }

      await updateDoc(behaviorRef, updates);
    } else {
      // 새 사용자 행동 레코드 생성
      await setDoc(behaviorRef, {
        userId,
        lastActive: serverTimestamp(),
        totalLogins: metadata.action === 'login' ? 1 : 0,
        totalSubscriptionsAdded: metadata.action === 'subscription_add' ? 1 : 0,
        totalSubscriptionsDeleted: metadata.action === 'subscription_delete' ? 1 : 0,
        favoriteCategory: '',
        averageSubscriptionValue: 0,
        metadata,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    console.log('✅ 사용자 행동 추적 완료');
  } catch (error) {
    console.error('❌ 사용자 행동 추적 실패:', error);
  }
}

/**
 * 월별 트렌드 데이터 계산
 */
export async function calculateMonthlyTrends(
  userId: string,
  months: number = 12
): Promise<Array<{ month: string; amount: number }>> {
  try {
    console.log('📈 월별 트렌드 계산 시작:', userId);
    
    const trendData: Array<{ month: string; amount: number }> = [];
    const now = new Date();
    
    for (let i = 0; i < months; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = date.toISOString().substring(0, 7); // YYYY-MM
      
      // 해당 월의 구독 통계 조회
      const statsRef = collection(db, 'subscription_statistics');
      const q = query(
        statsRef,
        where('userId', '==', userId),
        where('date', '>=', `${monthStr}-01`),
        where('date', '<=', `${monthStr}-31`)
      );
      
      const querySnapshot = await getDocs(q);
      let monthlyTotal = 0;
      
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        monthlyTotal += data.monthlyAmountKrw || 0;
      });
      
      trendData.unshift({
        month: monthStr,
        amount: monthlyTotal
      });
    }
    
    console.log('✅ 월별 트렌드 계산 완료');
    return trendData;
  } catch (error) {
    console.error('❌ 월별 트렌드 계산 실패:', error);
    return [];
  }
}

/**
 * 카테고리별 통계 계산
 */
export async function calculateCategoryStatistics(
  userId: string
): Promise<Record<string, any>> {
  try {
    console.log('🗂️ 카테고리별 통계 계산 시작:', userId);
    
    const subscriptionsRef = collection(db, 'subscriptions');
    const q = query(
      subscriptionsRef,
      where('userId', '==', userId),
      where('status', '==', 'active')
    );
    
    const querySnapshot = await getDocs(q);
    const categoryStats: Record<string, any> = {};
    
    querySnapshot.docs.forEach(doc => {
      const sub = doc.data();
      const category = sub.category || 'Others';
      
      if (!categoryStats[category]) {
        categoryStats[category] = {
          count: 0,
          totalMonthlyKrw: 0,
          totalYearlyKrw: 0,
          percentage: 0
        };
      }
      
      const monthlyAmount = sub.paymentCycle === 'monthly'
        ? sub.amount
        : sub.paymentCycle === 'yearly'
          ? sub.amount / 12
          : 0;
          
      const yearlyAmount = sub.paymentCycle === 'yearly'
        ? sub.amount
        : sub.paymentCycle === 'monthly'
          ? sub.amount * 12
          : 0;

      const monthlyKrw = sub.currency === 'USD' ? monthlyAmount * 1300 : monthlyAmount;
      const yearlyKrw = sub.currency === 'USD' ? yearlyAmount * 1300 : yearlyAmount;
      
      categoryStats[category].count++;
      categoryStats[category].totalMonthlyKrw += monthlyKrw;
      categoryStats[category].totalYearlyKrw += yearlyKrw;
    });
    
    // 백분율 계산
    const totalMonthly = Object.values(categoryStats).reduce(
      (sum: number, stat: any) => sum + stat.totalMonthlyKrw, 
      0
    );
    
    Object.keys(categoryStats).forEach(category => {
      categoryStats[category].percentage = totalMonthly > 0
        ? (categoryStats[category].totalMonthlyKrw / totalMonthly) * 100
        : 0;
    });
    
    console.log('✅ 카테고리별 통계 계산 완료');
    return categoryStats;
  } catch (error) {
    console.error('❌ 카테고리별 통계 계산 실패:', error);
    return {};
  }
}

/**
 * 결제 예정 통계 계산
 */
export async function calculateUpcomingPayments(
  userId: string,
  days: number = 30
): Promise<{
  count: number;
  totalAmount: number;
  payments: Array<any>;
}> {
  try {
    console.log('💳 결제 예정 통계 계산 시작:', userId);
    
    const subscriptionsRef = collection(db, 'subscriptions');
    const q = query(
      subscriptionsRef,
      where('userId', '==', userId),
      where('status', '==', 'active')
    );
    
    const querySnapshot = await getDocs(q);
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    
    const upcomingPayments: Array<any> = [];
    let totalAmount = 0;
    
    querySnapshot.docs.forEach(doc => {
      const sub = doc.data();
      const paymentDate = new Date(now.getFullYear(), now.getMonth(), sub.paymentDay);
      
      if (paymentDate < now) {
        paymentDate.setMonth(paymentDate.getMonth() + 1);
      }
      
      if (paymentDate <= endDate) {
        const amount = sub.currency === 'USD' ? sub.amount * 1300 : sub.amount;
        totalAmount += amount;
        
        upcomingPayments.push({
          subscriptionId: doc.id,
          serviceName: sub.serviceName,
          amount,
          paymentDate: paymentDate.toISOString(),
          category: sub.category
        });
      }
    });
    
    console.log('✅ 결제 예정 통계 계산 완료');
    return {
      count: upcomingPayments.length,
      totalAmount,
      payments: upcomingPayments.sort((a, b) => 
        new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()
      )
    };
  } catch (error) {
    console.error('❌ 결제 예정 통계 계산 실패:', error);
    return { count: 0, totalAmount: 0, payments: [] };
  }
}

/**
 * 알림 통계 계산
 */
export async function calculateNotificationStatistics(
  userId: string
): Promise<{
  totalNotifications: number;
  unreadCount: number;
  byType: Record<string, number>;
}> {
  try {
    console.log('🔔 알림 통계 계산 시작:', userId);
    
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    let unreadCount = 0;
    const byType: Record<string, number> = {};
    
    querySnapshot.docs.forEach(doc => {
      const notification = doc.data();
      
      if (!notification.isRead) {
        unreadCount++;
      }
      
      const type = notification.type || 'other';
      byType[type] = (byType[type] || 0) + 1;
    });
    
    console.log('✅ 알림 통계 계산 완료');
    return {
      totalNotifications: querySnapshot.size,
      unreadCount,
      byType
    };
  } catch (error) {
    console.error('❌ 알림 통계 계산 실패:', error);
    return { totalNotifications: 0, unreadCount: 0, byType: {} };
  }
}

/**
 * 구독 성장률 계산
 */
export async function calculateGrowthRate(
  userId: string
): Promise<{
  monthlyGrowth: number;
  yearlyGrowth: number;
  newSubscriptions: number;
  cancelledSubscriptions: number;
}> {
  try {
    console.log('📊 구독 성장률 계산 시작:', userId);
    
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    
    // 현재 활성 구독 수
    const activeRef = collection(db, 'subscriptions');
    const activeQuery = query(
      activeRef,
      where('userId', '==', userId),
      where('status', '==', 'active')
    );
    const activeSnapshot = await getDocs(activeQuery);
    const currentActive = activeSnapshot.size;
    
    // 지난달 통계
    const statsRef = collection(db, 'user_statistics');
    const lastMonthStr = lastMonth.toISOString().substring(0, 7);
    const statsQuery = query(
      statsRef,
      where('userId', '==', userId),
      where('month', '==', lastMonthStr)
    );
    
    const statsSnapshot = await getDocs(statsQuery);
    const lastMonthActive = statsSnapshot.empty ? currentActive : statsSnapshot.docs[0].data().totalActiveSubscriptions;
    
    // 성장률 계산
    const monthlyGrowth = lastMonthActive > 0 
      ? ((currentActive - lastMonthActive) / lastMonthActive) * 100 
      : 0;
    
    console.log('✅ 구독 성장률 계산 완료');
    return {
      monthlyGrowth,
      yearlyGrowth: 0, // 추후 구현
      newSubscriptions: Math.max(0, currentActive - lastMonthActive),
      cancelledSubscriptions: 0 // 추후 구현
    };
  } catch (error) {
    console.error('❌ 구독 성장률 계산 실패:', error);
    return {
      monthlyGrowth: 0,
      yearlyGrowth: 0,
      newSubscriptions: 0,
      cancelledSubscriptions: 0
    };
  }
}

/**
 * 전체 통계 수집 및 저장
 */
export async function collectAndSaveAllStatistics(userId: string): Promise<void> {
  debounceStatisticsUpdate(
    `all-stats-${userId}`,
    async () => {
      try {
        console.log('📊 전체 통계 수집 시작:', userId);
        
        // 모든 통계 계산
        const [
          categoryStats,
          monthlyTrends,
          upcomingPayments,
          notificationStats,
          growthRate
        ] = await Promise.all([
          calculateCategoryStatistics(userId),
          calculateMonthlyTrends(userId),
          calculateUpcomingPayments(userId),
          calculateNotificationStatistics(userId),
          calculateGrowthRate(userId)
        ]);
        
        // 통합 통계 저장
        const summaryRef = doc(db, 'statistics_summary', userId);
        await setDoc(summaryRef, {
          userId,
          categoryBreakdown: categoryStats,
          monthlyTrends,
          upcomingPayments: {
            count: upcomingPayments.count,
            totalAmount: upcomingPayments.totalAmount
          },
          notifications: notificationStats,
          growth: growthRate,
          lastUpdated: serverTimestamp()
        }, { merge: true });
        
        console.log('✅ 전체 통계 수집 완료');
      } catch (error) {
        console.error('❌ 전체 통계 수집 실패:', error);
      }
    },
    5000 // 5초 디바운스
  );
}

/**
 * 실시간 통계 구독
 */
export function subscribeToStatistics(
  userId: string,
  onUpdate: (stats: any) => void
): () => void {
  console.log('📊 실시간 통계 구독 시작:', userId);
  
  // Firebase는 실시간 리스너를 지원하지만, 
  // 여기서는 간단히 폴링으로 구현
  const intervalId = setInterval(async () => {
    try {
      const summaryRef = doc(db, 'statistics_summary', userId);
      const summaryDoc = await getDoc(summaryRef);
      
      if (summaryDoc.exists()) {
        onUpdate(summaryDoc.data());
      }
    } catch (error) {
      console.error('실시간 통계 업데이트 실패:', error);
    }
  }, 30000); // 30초마다 업데이트
  
  return () => {
    console.log('📊 실시간 통계 구독 종료');
    clearInterval(intervalId);
  };
}

/**
 * 통계 데이터 초기화
 */
export async function initializeStatistics(userId: string): Promise<void> {
  try {
    console.log('🔧 통계 데이터 초기화 시작:', userId);
    
    // 사용자 통계 초기화
    await updateUserStatistics(userId);
    
    // 전체 통계 수집
    await collectAndSaveAllStatistics(userId);
    
    console.log('✅ 통계 데이터 초기화 완료');
  } catch (error) {
    console.error('❌ 통계 데이터 초기화 실패:', error);
  }
}

/**
 * 통계 데이터 내보내기
 */
export async function exportStatistics(
  userId: string,
  format: 'json' | 'csv' = 'json'
): Promise<string> {
  try {
    console.log('📤 통계 데이터 내보내기 시작:', userId);
    
    // 모든 통계 데이터 수집
    const summaryRef = doc(db, 'statistics_summary', userId);
    const summaryDoc = await getDoc(summaryRef);
    
    if (!summaryDoc.exists()) {
      throw new Error('통계 데이터를 찾을 수 없습니다.');
    }
    
    const data = summaryDoc.data();
    
    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else {
      // CSV 변환 로직 (간단한 구현)
      const csvRows = ['Category,Count,Monthly Amount,Yearly Amount'];
      
      Object.entries(data.categoryBreakdown || {}).forEach(([category, stats]: [string, any]) => {
        csvRows.push(`${category},${stats.count},${stats.totalMonthlyKrw},${stats.totalYearlyKrw}`);
      });
      
      return csvRows.join('\n');
    }
  } catch (error) {
    console.error('❌ 통계 데이터 내보내기 실패:', error);
    throw error;
  }
}