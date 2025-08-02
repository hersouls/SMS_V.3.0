import { supabase } from '../utils/supabase/client';

// =====================================================
// 통계 업데이트 디바운싱 및 큐 관리
// =====================================================

const pendingUpdates = new Map<string, NodeJS.Timeout>();
const operationQueue = new Map<string, Promise<any>>();

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

/**
 * 동시 통계 작업을 방지하기 위한 큐 관리
 */
async function queueOperation<T>(
  operationKey: string,
  operation: () => Promise<T>
): Promise<T> {
  // 이미 진행 중인 작업이 있다면 대기
  if (operationQueue.has(operationKey)) {
    await operationQueue.get(operationKey);
  }

  // 새 작업 등록
  const promise = operation().finally(() => {
    operationQueue.delete(operationKey);
  });

  operationQueue.set(operationKey, promise);
  return promise;
}

// =====================================================
// 통계 데이터 타입 정의
// =====================================================

export interface SubscriptionStatistics {
  id?: string;
  user_id: string;
  subscription_id: string;
  date: string;
  monthly_amount_krw: number;
  yearly_amount_krw: number;
  total_paid_krw: number;
  category: string;
  category_rank?: number;
  category_percentage?: number;
  payment_cycle: string;
  cycle_rank?: number;
  cycle_percentage?: number;
  status: string;
  days_active?: number;
  days_paused?: number;
  currency: string;
  exchange_rate?: number;
  tags_count: number;
  popular_tags?: string[];
  notification_count?: number;
  notification_types?: Record<string, boolean>;
  metadata?: Record<string, any>;
}

export interface CategoryAnalytics {
  id?: string;
  user_id: string;
  category: string;
  date: string;
  subscription_count: number;
  active_count: number;
  paused_count: number;
  cancelled_count: number;
  total_monthly_krw: number;
  total_yearly_krw: number;
  average_monthly_krw: number;
  max_monthly_krw: number;
  min_monthly_krw: number;
  monthly_count: number;
  yearly_count: number;
  onetime_count: number;
  krw_count: number;
  usd_count: number;
  growth_rate?: number;
  previous_month_amount?: number;
  metadata?: Record<string, any>;
}

export interface PaymentCycleAnalytics {
  id?: string;
  user_id: string;
  payment_cycle: string;
  date: string;
  subscription_count: number;
  active_count: number;
  total_monthly_krw: number;
  total_yearly_krw: number;
  average_amount_krw: number;
  category_breakdown?: Record<string, number>;
  currency_breakdown?: Record<string, number>;
  growth_rate?: number;
  previous_month_count?: number;
  metadata?: Record<string, any>;
}

export interface TagAnalytics {
  id?: string;
  user_id: string;
  tag_name: string;
  date: string;
  subscription_count: number;
  active_count: number;
  total_monthly_krw: number;
  average_amount_krw: number;
  category_breakdown?: Record<string, number>;
  cycle_breakdown?: Record<string, number>;
  popularity_rank?: number;
  popularity_score?: number;
  metadata?: Record<string, any>;
}

export interface MonthlySpendingTrends {
  id?: string;
  user_id: string;
  year: number;
  month: number;
  total_spend_krw: number;
  active_subscriptions: number;
  new_subscriptions: number;
  cancelled_subscriptions: number;
  paused_subscriptions: number;
  category_spending?: Record<string, number>;
  cycle_spending?: Record<string, number>;
  currency_spending?: Record<string, number>;
  month_over_month_change?: number;
  year_over_year_change?: number;
  predicted_next_month?: number;
  trend_direction?: 'increasing' | 'decreasing' | 'stable';
  metadata?: Record<string, any>;
}

export interface NotificationAnalytics {
  id?: string;
  user_id: string;
  date: string;
  total_subscriptions: number;
  seven_days_enabled: number;
  three_days_enabled: number;
  same_day_enabled: number;
  notifications_sent: number;
  notifications_read: number;
  notifications_clicked: number;
  payment_reminders: number;
  renewal_notifications: number;
  expiry_warnings: number;
  response_rate: number;
  engagement_score: number;
  metadata?: Record<string, any>;
}

export interface UserBehaviorAnalytics {
  id?: string;
  user_id: string;
  date: string;
  login_count: number;
  subscription_views: number;
  subscription_edits: number;
  subscription_adds: number;
  subscription_deletes: number;
  dashboard_views: number;
  calendar_views: number;
  settings_views: number;
  notification_views: number;
  session_duration_minutes: number;
  page_views: number;
  unique_pages_visited: number;
  preferred_categories?: string[];
  preferred_payment_cycles?: string[];
  preferred_currencies?: string[];
  satisfaction_score: number;
  engagement_score: number;
  metadata?: Record<string, any>;
}

// =====================================================
// 통계 데이터 수집 함수들
// =====================================================

/**
 * 구독 통계 데이터 수집
 */
export async function collectSubscriptionStatistics(
  subscriptionId: string,
  userId: string,
  exchangeRate: number = 1300
): Promise<SubscriptionStatistics | null> {
  try {
    // 구독 데이터 조회
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .eq('user_id', userId)
      .single();

    if (error || !subscription) {
      console.error('구독 데이터 조회 실패:', error);
      return null;
    }

    // 월간/연간 금액 계산
    const monthlyAmountKrw = subscription.currency === 'USD' 
      ? subscription.amount * exchangeRate 
      : subscription.amount;

    const yearlyAmountKrw = subscription.payment_cycle === 'yearly'
      ? monthlyAmountKrw
      : monthlyAmountKrw * 12;

    // 카테고리 순위 계산
    const { data: categoryStats } = await supabase
      .from('subscriptions')
      .select('category, amount, currency, payment_cycle')
      .eq('user_id', userId)
      .eq('status', 'active');

    const categoryAmounts = categoryStats?.reduce((acc, sub) => {
      const amount = sub.currency === 'USD' ? sub.amount * exchangeRate : sub.amount;
      acc[sub.category] = (acc[sub.category] || 0) + amount;
      return acc;
    }, {} as Record<string, number>) || {};

    const sortedCategories = Object.entries(categoryAmounts)
      .sort(([,a], [,b]) => b - a);

    const categoryRank = sortedCategories.findIndex(([cat]) => cat === subscription.category) + 1;
    const categoryPercentage = categoryAmounts[subscription.category] 
      ? (categoryAmounts[subscription.category] / Object.values(categoryAmounts).reduce((a, b) => a + b, 0)) * 100
      : 0;

    // 결제주기 순위 계산
    const cycleAmounts = categoryStats?.reduce((acc, sub) => {
      const amount = sub.currency === 'USD' ? sub.amount * exchangeRate : sub.amount;
      acc[sub.payment_cycle] = (acc[sub.payment_cycle] || 0) + amount;
      return acc;
    }, {} as Record<string, number>) || {};

    const sortedCycles = Object.entries(cycleAmounts)
      .sort(([,a], [,b]) => b - a);

    const cycleRank = sortedCycles.findIndex(([cycle]) => cycle === subscription.payment_cycle) + 1;
    const cyclePercentage = cycleAmounts[subscription.payment_cycle]
      ? (cycleAmounts[subscription.payment_cycle] / Object.values(cycleAmounts).reduce((a, b) => a + b, 0)) * 100
      : 0;

    const statistics: SubscriptionStatistics = {
      user_id: userId,
      subscription_id: subscriptionId,
      date: new Date().toISOString().split('T')[0],
      monthly_amount_krw: monthlyAmountKrw,
      yearly_amount_krw: yearlyAmountKrw,
      total_paid_krw: 0, // 결제 이력에서 계산
      category: subscription.category,
      category_rank: categoryRank,
      category_percentage: categoryPercentage,
      payment_cycle: subscription.payment_cycle,
      cycle_rank: cycleRank,
      cycle_percentage: cyclePercentage,
      status: subscription.status,
      currency: subscription.currency,
      exchange_rate: exchangeRate,
      tags_count: subscription.tags?.length || 0,
      popular_tags: subscription.tags || [],
      notification_types: subscription.notifications,
      metadata: {
        service_name: subscription.service_name,
        payment_method: subscription.payment_method,
        auto_renewal: subscription.auto_renewal
      }
    };

    return statistics;
  } catch (error) {
    console.error('구독 통계 수집 실패:', error);
    return null;
  }
}

/**
 * 카테고리별 분석 데이터 수집
 */
export async function collectCategoryAnalytics(
  userId: string,
  exchangeRate: number = 1300
): Promise<CategoryAnalytics[]> {
  try {
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (error || !subscriptions) {
      console.error('구독 데이터 조회 실패:', error);
      return [];
    }

    // 카테고리별 그룹화
    const categoryGroups = subscriptions.reduce((acc, sub) => {
      if (!acc[sub.category]) {
        acc[sub.category] = [];
      }
      acc[sub.category].push(sub);
      return acc;
    }, {} as Record<string, (typeof subscriptions)[0][]>);

    const analytics: CategoryAnalytics[] = [];

    for (const [category, subs] of Object.entries(categoryGroups)) {
      const typedSubs = subs as (typeof subscriptions)[0][];
      const activeCount = typedSubs.filter(s => s.status === 'active').length;
      const pausedCount = typedSubs.filter(s => s.status === 'paused').length;
      const cancelledCount = typedSubs.filter(s => s.status === 'cancelled').length;

      const monthlyAmounts = typedSubs.map(sub => {
        const amount = sub.currency === 'USD' ? sub.amount * exchangeRate : sub.amount;
        return sub.payment_cycle === 'yearly' ? amount / 12 : amount;
      });

      const totalMonthlyKrw = monthlyAmounts.reduce((a: number, b: number) => a + b, 0);
      const totalYearlyKrw = totalMonthlyKrw * 12;
      const averageMonthlyKrw = monthlyAmounts.length > 0 ? totalMonthlyKrw / monthlyAmounts.length : 0;
      const maxMonthlyKrw = Math.max(...monthlyAmounts, 0);
      const minMonthlyKrw = Math.min(...monthlyAmounts, 0);

      const monthlyCount = typedSubs.filter(s => s.payment_cycle === 'monthly').length;
      const yearlyCount = typedSubs.filter(s => s.payment_cycle === 'yearly').length;
      const onetimeCount = typedSubs.filter(s => s.payment_cycle === 'onetime').length;

      const krwCount = typedSubs.filter(s => s.currency === 'KRW').length;
      const usdCount = typedSubs.filter(s => s.currency === 'USD').length;

      analytics.push({
        user_id: userId,
        category,
        date: new Date().toISOString().split('T')[0],
        subscription_count: typedSubs.length,
        active_count: activeCount,
        paused_count: pausedCount,
        cancelled_count: cancelledCount,
        total_monthly_krw: totalMonthlyKrw,
        total_yearly_krw: totalYearlyKrw,
        average_monthly_krw: averageMonthlyKrw,
        max_monthly_krw: maxMonthlyKrw,
        min_monthly_krw: minMonthlyKrw,
        monthly_count: monthlyCount,
        yearly_count: yearlyCount,
        onetime_count: onetimeCount,
        krw_count: krwCount,
        usd_count: usdCount,
        metadata: {
          category_description: getCategoryDescription(category)
        }
      });
    }

    return analytics;
  } catch (error) {
    console.error('카테고리 분석 수집 실패:', error);
    return [];
  }
}

/**
 * 결제주기별 분석 데이터 수집
 */
export async function collectPaymentCycleAnalytics(
  userId: string,
  exchangeRate: number = 1300
): Promise<PaymentCycleAnalytics[]> {
  try {
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (error || !subscriptions) {
      console.error('구독 데이터 조회 실패:', error);
      return [];
    }

    // 결제주기별 그룹화
    const cycleGroups = subscriptions.reduce((acc, sub) => {
      if (!acc[sub.payment_cycle]) {
        acc[sub.payment_cycle] = [];
      }
      acc[sub.payment_cycle].push(sub);
      return acc;
    }, {} as Record<string, (typeof subscriptions)[0][]>);

    const analytics: PaymentCycleAnalytics[] = [];

    for (const [cycle, subs] of Object.entries(cycleGroups)) {
      const typedSubs = subs as (typeof subscriptions)[0][];
      const activeCount = typedSubs.filter(s => s.status === 'active').length;

      const amounts = typedSubs.map(sub => {
        const amount = sub.currency === 'USD' ? sub.amount * exchangeRate : sub.amount;
        return sub.payment_cycle === 'yearly' ? amount / 12 : amount;
      });

      const totalMonthlyKrw = amounts.reduce((a: number, b: number) => a + b, 0);
      const totalYearlyKrw = totalMonthlyKrw * 12;
      const averageAmountKrw = amounts.length > 0 ? totalMonthlyKrw / amounts.length : 0;

      // 카테고리별 분포
      const categoryBreakdown = typedSubs.reduce((acc: Record<string, number>, sub) => {
        acc[sub.category] = (acc[sub.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // 통화별 분포
      const currencyBreakdown = typedSubs.reduce((acc: Record<string, number>, sub) => {
        acc[sub.currency] = (acc[sub.currency] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      analytics.push({
        user_id: userId,
        payment_cycle: cycle,
        date: new Date().toISOString().split('T')[0],
        subscription_count: typedSubs.length,
        active_count: activeCount,
        total_monthly_krw: totalMonthlyKrw,
        total_yearly_krw: totalYearlyKrw,
        average_amount_krw: averageAmountKrw,
        category_breakdown: categoryBreakdown,
        currency_breakdown: currencyBreakdown,
        metadata: {
          cycle_description: getPaymentCycleDescription(cycle)
        }
      });
    }

    return analytics;
  } catch (error) {
    console.error('결제주기 분석 수집 실패:', error);
    return [];
  }
}

/**
 * 태그별 분석 데이터 수집
 */
export async function collectTagAnalytics(
  userId: string,
  exchangeRate: number = 1300
): Promise<TagAnalytics[]> {
  try {
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (error || !subscriptions) {
      console.error('구독 데이터 조회 실패:', error);
      return [];
    }

    // 모든 태그 수집
    const allTags = new Set<string>();
    subscriptions.forEach(sub => {
      if (sub.tags) {
        sub.tags.forEach((tag: string) => allTags.add(tag));
      }
    });

    const analytics: TagAnalytics[] = [];

    for (const tag of allTags) {
      const taggedSubs = subscriptions.filter(sub => 
        sub.tags && sub.tags.includes(tag)
      );

      const activeCount = taggedSubs.filter(s => s.status === 'active').length;

      const amounts = taggedSubs.map(sub => {
        const amount = sub.currency === 'USD' ? sub.amount * exchangeRate : sub.amount;
        return sub.payment_cycle === 'yearly' ? amount / 12 : amount;
      });

      const totalMonthlyKrw = amounts.reduce((a: number, b: number) => a + b, 0);
      const averageAmountKrw = amounts.length > 0 ? totalMonthlyKrw / amounts.length : 0;

      // 카테고리별 분포
      const categoryBreakdown = taggedSubs.reduce((acc: Record<string, number>, sub) => {
        acc[sub.category] = (acc[sub.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // 결제주기별 분포
      const cycleBreakdown = taggedSubs.reduce((acc: Record<string, number>, sub) => {
        acc[sub.payment_cycle] = (acc[sub.payment_cycle] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // 인기도 점수 계산 (구독 수 + 평균 금액 기반)
      const popularityScore = taggedSubs.length * 10 + averageAmountKrw / 1000;

      analytics.push({
        user_id: userId,
        tag_name: tag,
        date: new Date().toISOString().split('T')[0],
        subscription_count: taggedSubs.length,
        active_count: activeCount,
        total_monthly_krw: totalMonthlyKrw,
        average_amount_krw: averageAmountKrw,
        category_breakdown: categoryBreakdown,
        cycle_breakdown: cycleBreakdown,
        popularity_score: popularityScore
      });
    }

    // 인기도 순위 설정
    analytics.sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0));
    analytics.forEach((analytics, index) => {
      analytics.popularity_rank = index + 1;
    });

    return analytics;
  } catch (error) {
    console.error('태그 분석 수집 실패:', error);
    return [];
  }
}

/**
 * 월별 지출 트렌드 데이터 수집
 */
export async function collectMonthlySpendingTrends(
  userId: string,
  year: number,
  month: number,
  exchangeRate: number = 1300
): Promise<MonthlySpendingTrends | null> {
  try {
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (error || !subscriptions) {
      console.error('구독 데이터 조회 실패:', error);
      return null;
    }

    const activeSubs = subscriptions.filter(s => s.status === 'active');
    
    // 이번 달에 추가된 구독
    const currentMonth = new Date(year, month - 1, 1);
    const nextMonth = new Date(year, month, 1);
    const newSubs = subscriptions.filter(s => {
      const createdDate = new Date(s.created_at);
      return createdDate >= currentMonth && createdDate < nextMonth;
    });

    // 이번 달에 취소된 구독
    const cancelledSubs = subscriptions.filter(s => s.status === 'cancelled');
    const pausedSubs = subscriptions.filter(s => s.status === 'paused');

    // 월별 지출 계산
    const monthlyAmounts = activeSubs.map(sub => {
      const amount = sub.currency === 'USD' ? sub.amount * exchangeRate : sub.amount;
      return sub.payment_cycle === 'yearly' ? amount / 12 : amount;
    });

    const totalSpendKrw = monthlyAmounts.reduce((a: number, b: number) => a + b, 0);

    // 카테고리별 지출
    const categorySpending = activeSubs.reduce((acc, sub) => {
      const amount = sub.currency === 'USD' ? sub.amount * exchangeRate : sub.amount;
      const monthlyAmount = sub.payment_cycle === 'yearly' ? amount / 12 : amount;
      acc[sub.category] = (acc[sub.category] || 0) + monthlyAmount;
      return acc;
    }, {} as Record<string, number>);

    // 결제주기별 지출
    const cycleSpending = activeSubs.reduce((acc, sub) => {
      const amount = sub.currency === 'USD' ? sub.amount * exchangeRate : sub.amount;
      const monthlyAmount = sub.payment_cycle === 'yearly' ? amount / 12 : amount;
      acc[sub.payment_cycle] = (acc[sub.payment_cycle] || 0) + monthlyAmount;
      return acc;
    }, {} as Record<string, number>);

    // 통화별 지출
    const currencySpending = activeSubs.reduce((acc, sub) => {
      const amount = sub.currency === 'USD' ? sub.amount * exchangeRate : sub.amount;
      const monthlyAmount = sub.payment_cycle === 'yearly' ? amount / 12 : amount;
      acc[sub.currency] = (acc[sub.currency] || 0) + monthlyAmount;
      return acc;
    }, {} as Record<string, number>);

    // 트렌드 방향 결정 (간단한 로직)
    const trendDirection: 'increasing' | 'decreasing' | 'stable' = 
      newSubs.length > cancelledSubs.length ? 'increasing' :
      newSubs.length < cancelledSubs.length ? 'decreasing' : 'stable';

    return {
      user_id: userId,
      year,
      month,
      total_spend_krw: totalSpendKrw,
      active_subscriptions: activeSubs.length,
      new_subscriptions: newSubs.length,
      cancelled_subscriptions: cancelledSubs.length,
      paused_subscriptions: pausedSubs.length,
      category_spending: categorySpending,
      cycle_spending: cycleSpending,
      currency_spending: currencySpending,
      trend_direction: trendDirection,
      predicted_next_month: totalSpendKrw * 1.05, // 간단한 예측
      metadata: {
        exchange_rate: exchangeRate,
        calculation_date: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('월별 지출 트렌드 수집 실패:', error);
    return null;
  }
}

/**
 * 알림 분석 데이터 수집
 */
export async function collectNotificationAnalytics(
  userId: string
): Promise<NotificationAnalytics | null> {
  try {
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (error || !subscriptions) {
      console.error('구독 데이터 조회 실패:', error);
      return null;
    }

    const activeSubs = subscriptions.filter(s => s.status === 'active');
    
    // 알림 설정 통계
    const sevenDaysEnabled = activeSubs.filter(s => s.notifications?.sevenDays).length;
    const threeDaysEnabled = activeSubs.filter(s => s.notifications?.threeDays).length;
    const sameDayEnabled = activeSubs.filter(s => s.notifications?.sameDay).length;

    // 알림 이력 조회
    const { data: notifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date().toISOString().split('T')[0]);

    const notificationsSent = notifications?.length || 0;
    const notificationsRead = notifications?.filter(n => n.is_read).length || 0;
    const notificationsClicked = notifications?.filter(n => n.metadata?.clicked).length || 0;

    const responseRate = notificationsSent > 0 ? (notificationsRead / notificationsSent) * 100 : 0;
    const engagementScore = notificationsSent > 0 ? (notificationsClicked / notificationsSent) * 100 : 0;

    return {
      user_id: userId,
      date: new Date().toISOString().split('T')[0],
      total_subscriptions: activeSubs.length,
      seven_days_enabled: sevenDaysEnabled,
      three_days_enabled: threeDaysEnabled,
      same_day_enabled: sameDayEnabled,
      notifications_sent: notificationsSent,
      notifications_read: notificationsRead,
      notifications_clicked: notificationsClicked,
      payment_reminders: notifications?.filter(n => n.type === 'payment').length || 0,
      renewal_notifications: notifications?.filter(n => n.type === 'renewal').length || 0,
      expiry_warnings: notifications?.filter(n => n.type === 'expiry').length || 0,
      response_rate: responseRate,
      engagement_score: engagementScore,
      metadata: {
        total_notifications: notificationsSent,
        read_rate: responseRate,
        engagement_rate: engagementScore
      }
    };
  } catch (error) {
    console.error('알림 분석 수집 실패:', error);
    return null;
  }
}

/**
 * 사용자 행동 분석 데이터 수집
 */
export async function collectUserBehaviorAnalytics(
  userId: string,
  behaviorData: {
    loginCount?: number;
    subscriptionViews?: number;
    subscriptionEdits?: number;
    subscriptionAdds?: number;
    subscriptionDeletes?: number;
    dashboardViews?: number;
    calendarViews?: number;
    settingsViews?: number;
    notificationViews?: number;
    sessionDurationMinutes?: number;
    pageViews?: number;
    uniquePagesVisited?: number;
  }
): Promise<UserBehaviorAnalytics> {
  try {
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('category, payment_cycle, currency')
      .eq('user_id', userId);

    // 사용자 선호도 분석
    const categories = subscriptions?.map(s => s.category) || [];
    const paymentCycles = subscriptions?.map(s => s.payment_cycle) || [];
    const currencies = subscriptions?.map(s => s.currency) || [];

    const preferredCategories = [...new Set(categories)].slice(0, 5);
    const preferredPaymentCycles = [...new Set(paymentCycles)];
    const preferredCurrencies = [...new Set(currencies)];

    // 만족도 점수 계산 (간단한 로직)
    const satisfactionScore = Math.min(5, Math.max(1, 
      (behaviorData.loginCount || 0) / 10 + 
      (behaviorData.subscriptionViews || 0) / 5 + 
      (behaviorData.sessionDurationMinutes || 0) / 60
    ));

    // 참여도 점수 계산
    const engagementScore = Math.min(100, 
      (behaviorData.pageViews || 0) * 2 + 
      (behaviorData.uniquePagesVisited || 0) * 5 + 
      (behaviorData.subscriptionEdits || 0) * 10
    );

    return {
      user_id: userId,
      date: new Date().toISOString().split('T')[0],
      login_count: behaviorData.loginCount || 0,
      subscription_views: behaviorData.subscriptionViews || 0,
      subscription_edits: behaviorData.subscriptionEdits || 0,
      subscription_adds: behaviorData.subscriptionAdds || 0,
      subscription_deletes: behaviorData.subscriptionDeletes || 0,
      dashboard_views: behaviorData.dashboardViews || 0,
      calendar_views: behaviorData.calendarViews || 0,
      settings_views: behaviorData.settingsViews || 0,
      notification_views: behaviorData.notificationViews || 0,
      session_duration_minutes: behaviorData.sessionDurationMinutes || 0,
      page_views: behaviorData.pageViews || 0,
      unique_pages_visited: behaviorData.uniquePagesVisited || 0,
      preferred_categories: preferredCategories,
      preferred_payment_cycles: preferredPaymentCycles,
      preferred_currencies: preferredCurrencies,
      satisfaction_score: satisfactionScore,
      engagement_score: engagementScore,
      metadata: {
        collection_timestamp: new Date().toISOString(),
        data_source: 'user_behavior_tracking'
      }
    };
  } catch (error) {
    console.error('사용자 행동 분석 수집 실패:', error);
    throw error;
  }
}

// =====================================================
// 통계 데이터 저장 함수들
// =====================================================

/**
 * 통계 데이터를 Supabase에 저장 (upsert 방식, 재시도 로직 포함)
 */
// Analytics tables availability cache
const analyticsTablesCache = new Map<string, boolean>();

export async function saveStatisticsData<T>(
  tableName: string,
  data: T,
  retryCount: number = 0
): Promise<boolean> {
  try {
    // 테이블별로 올바른 제약조건 사용
    let conflictColumns: string;
    
    switch (tableName) {
      case 'subscription_statistics':
        conflictColumns = 'user_id,subscription_id,date';
        break;
      case 'category_analytics':
        conflictColumns = 'user_id,category,date';
        break;
      case 'payment_cycle_analytics':
        conflictColumns = 'user_id,payment_cycle,date';
        break;
      case 'tag_analytics':
        conflictColumns = 'user_id,tag_name,date';
        break;
      case 'monthly_spending_trends':
        conflictColumns = 'user_id,year,month';
        break;
      case 'notification_analytics':
        conflictColumns = 'user_id,date';
        break;
      case 'user_behavior_analytics':
        conflictColumns = 'user_id,date';
        break;
      default:
        conflictColumns = 'user_id,date';
    }

    // 데이터를 upsert로 저장
    const { error } = await supabase
      .from(tableName)
      .upsert(data);

    if (error) {
      console.error(`${tableName} 저장 실패:`, error);
      
      // 재시도 로직 (최대 3회)
      if (retryCount < 3) {
        console.log(`${tableName} 저장 재시도 (${retryCount + 1}/3)`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return await saveStatisticsData(tableName, data, retryCount + 1);
      }
      
      return false;
    }

    return true;
  } catch (error) {
    console.error(`${tableName} 저장 중 예외 발생:`, error);
    
    // 재시도 로직 (최대 3회)
    if (retryCount < 3) {
      console.log(`${tableName} 저장 재시도 (${retryCount + 1}/3)`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return await saveStatisticsData(tableName, data, retryCount + 1);
    }
    
    return false;
  }
}

/**
 * 종합 통계 데이터 수집 및 저장
 */
export async function collectAndSaveAllStatistics(
  userId: string,
  exchangeRate: number = 1300
): Promise<boolean> {
  const debounceKey = `all-stats-${userId}`;
  
  return new Promise((resolve) => {
    debounceStatisticsUpdate(debounceKey, async () => {
      try {
        console.log(`전체 통계 수집 시작 (사용자: ${userId})`);
        
        // 1. 구독별 통계 수집
        const { data: subscriptions } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('user_id', userId);

        if (subscriptions) {
          for (const sub of subscriptions) {
            const stats = await collectSubscriptionStatistics(sub.id, userId, exchangeRate);
            if (stats) {
              await saveStatisticsData('subscription_statistics', stats);
            }
          }
        }

        // 2. 카테고리별 분석
        const categoryAnalytics = await collectCategoryAnalytics(userId, exchangeRate);
        for (const analytics of categoryAnalytics) {
          await saveStatisticsData('category_analytics', analytics);
        }

        // 3. 결제주기별 분석
        const cycleAnalytics = await collectPaymentCycleAnalytics(userId, exchangeRate);
        for (const analytics of cycleAnalytics) {
          await saveStatisticsData('payment_cycle_analytics', analytics);
        }

        // 4. 태그별 분석
        const tagAnalytics = await collectTagAnalytics(userId, exchangeRate);
        for (const analytics of tagAnalytics) {
          await saveStatisticsData('tag_analytics', analytics);
        }

        // 5. 월별 지출 트렌드
        const currentDate = new Date();
        const monthlyTrends = await collectMonthlySpendingTrends(
          userId,
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          exchangeRate
        );
        if (monthlyTrends) {
          await saveStatisticsData('monthly_spending_trends', monthlyTrends);
        }

        // 6. 알림 분석
        const notificationAnalytics = await collectNotificationAnalytics(userId);
        if (notificationAnalytics) {
          await saveStatisticsData('notification_analytics', notificationAnalytics);
        }

        console.log(`전체 통계 수집 완료 (사용자: ${userId})`);
        resolve(true);
      } catch (error) {
        console.error('종합 통계 수집 및 저장 실패:', error);
        resolve(false);
      }
    });
    
    // 디바운싱으로 인해 즉시 실행되지 않을 수 있으므로 일단 true 반환
    resolve(true);
  });
}

// =====================================================
// 통계 데이터 실시간 업데이트 함수들
// =====================================================

/**
 * 구독 변경 시 실시간 통계 업데이트
 */
export async function updateStatisticsOnSubscriptionChange(
  subscriptionId: string,
  userId: string,
  action: 'create' | 'update' | 'delete'
): Promise<boolean> {
  const debounceKey = `sub-change-${userId}`;
  
  return new Promise((resolve) => {
    debounceStatisticsUpdate(debounceKey, async () => {
      try {
        console.log(`통계 업데이트 시작: ${action} - 구독 ${subscriptionId}`);

        // 1. 구독별 통계 업데이트
        if (action !== 'delete') {
          const subscriptionStats = await collectSubscriptionStatistics(subscriptionId, userId);
          if (subscriptionStats) {
            await saveStatisticsData('subscription_statistics', subscriptionStats);
          }
        }

        // 2. 카테고리별 분석 업데이트
        const categoryAnalytics = await collectCategoryAnalytics(userId);
        for (const analytics of categoryAnalytics) {
          await saveStatisticsData('category_analytics', analytics);
        }

        // 3. 결제주기별 분석 업데이트
        const cycleAnalytics = await collectPaymentCycleAnalytics(userId);
        for (const analytics of cycleAnalytics) {
          await saveStatisticsData('payment_cycle_analytics', analytics);
        }

        // 4. 태그별 분석 업데이트
        const tagAnalytics = await collectTagAnalytics(userId);
        for (const analytics of tagAnalytics) {
          await saveStatisticsData('tag_analytics', analytics);
        }

        // 5. 월별 지출 트렌드 업데이트
        const currentDate = new Date();
        const monthlyTrends = await collectMonthlySpendingTrends(
          userId,
          currentDate.getFullYear(),
          currentDate.getMonth() + 1
        );
        if (monthlyTrends) {
          await saveStatisticsData('monthly_spending_trends', monthlyTrends);
        }

        console.log(`통계 업데이트 완료: ${action} - 구독 ${subscriptionId}`);
      } catch (error) {
        console.error(`통계 업데이트 실패: ${action} - 구독 ${subscriptionId}`, error);
      }
    });
    
    // 디바운싱으로 인해 즉시 실행되지 않을 수 있으므로 일단 true 반환
    resolve(true);
  });
}

/**
 * 사용자 행동 추적 및 통계 업데이트
 */
export async function trackUserBehavior(
  userId: string,
  behavior: {
    action: 'login' | 'subscription_view' | 'subscription_edit' | 'subscription_add' | 'subscription_delete' | 'dashboard_view' | 'calendar_view' | 'settings_view' | 'notification_view' | 'session_expired' | 'sign_out' | 'logout';
    page?: string;
    sessionDuration?: number;
  }
): Promise<void> {
  try {
    // 기존 행동 데이터 조회
    const today = new Date().toISOString().split('T')[0];
    // Check if analytics table exists
    if (!analyticsTablesCache.get('user_behavior_analytics')) {
      const { error: testError } = await supabase
        .from('user_behavior_analytics')
        .select('*')
        .limit(1);
      
      if (testError && testError.code === '42P01') {
        console.warn('User behavior analytics table does not exist. Skipping behavior tracking.');
        analyticsTablesCache.set('user_behavior_analytics', false);
        return;
      }
      analyticsTablesCache.set('user_behavior_analytics', true);
    }

    if (!analyticsTablesCache.get('user_behavior_analytics')) {
      return;
    }

    const { data: existingBehavior } = await supabase
      .from('user_behavior_analytics')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    // 행동 데이터 업데이트
    const behaviorData = {
      user_id: userId,
      date: today,
      login_count: existingBehavior?.login_count || 0,
      subscription_views: existingBehavior?.subscription_views || 0,
      subscription_edits: existingBehavior?.subscription_edits || 0,
      subscription_adds: existingBehavior?.subscription_adds || 0,
      subscription_deletes: existingBehavior?.subscription_deletes || 0,
      dashboard_views: existingBehavior?.dashboard_views || 0,
      calendar_views: existingBehavior?.calendar_views || 0,
      settings_views: existingBehavior?.settings_views || 0,
      notification_views: existingBehavior?.notification_views || 0,
      session_duration_minutes: existingBehavior?.session_duration_minutes || 0,
      page_views: existingBehavior?.page_views || 0,
      unique_pages_visited: existingBehavior?.unique_pages_visited || 0,
      satisfaction_score: existingBehavior?.satisfaction_score || 0,
      engagement_score: existingBehavior?.engagement_score || 0,
      metadata: existingBehavior?.metadata || {}
    };

    // 행동에 따른 카운터 증가
    switch (behavior.action) {
      case 'login':
        behaviorData.login_count++;
        break;
      case 'subscription_view':
        behaviorData.subscription_views++;
        break;
      case 'subscription_edit':
        behaviorData.subscription_edits++;
        break;
      case 'subscription_add':
        behaviorData.subscription_adds++;
        break;
      case 'subscription_delete':
        behaviorData.subscription_deletes++;
        break;
      case 'dashboard_view':
        behaviorData.dashboard_views++;
        break;
      case 'calendar_view':
        behaviorData.calendar_views++;
        break;
      case 'settings_view':
        behaviorData.settings_views++;
        break;
      case 'notification_view':
        behaviorData.notification_views++;
        break;
    }

    // 세션 시간 추가
    if (behavior.sessionDuration) {
      behaviorData.session_duration_minutes += behavior.sessionDuration;
    }

    // 페이지 뷰 증가
    behaviorData.page_views++;

    // 고유 페이지 추적
    if (behavior.page) {
      const visitedPages = new Set(existingBehavior?.metadata?.visited_pages || []);
      visitedPages.add(behavior.page);
      behaviorData.unique_pages_visited = visitedPages.size;
      behaviorData.metadata.visited_pages = Array.from(visitedPages);
    }

    // 참여도 점수 재계산
    behaviorData.engagement_score = Math.min(100,
      behaviorData.page_views * 2 +
      behaviorData.unique_pages_visited * 5 +
      behaviorData.subscription_edits * 10 +
      behaviorData.subscription_adds * 15
    );

    // 만족도 점수 재계산
    behaviorData.satisfaction_score = Math.min(5, Math.max(1,
      behaviorData.login_count / 10 +
      behaviorData.subscription_views / 5 +
      behaviorData.session_duration_minutes / 60
    ));

    // 데이터 저장 (재시도 로직 포함)
    const saveSuccess = await saveStatisticsData('user_behavior_analytics', behaviorData);
    
    if (saveSuccess) {
      console.log(`사용자 행동 추적 완료: ${behavior.action} - 사용자 ${userId}`);
    } else {
      console.warn(`사용자 행동 추적 저장 실패: ${behavior.action} - 사용자 ${userId}`);
    }
  } catch (error) {
    console.error('사용자 행동 추적 실패:', error);
  }
}

/**
 * 통계 데이터 캐시 관리
 */
const statisticsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5분

export function getCachedStatistics(key: string): any | null {
  const cached = statisticsCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

export function setCachedStatistics(key: string, data: any): void {
  statisticsCache.set(key, { data, timestamp: Date.now() });
}

export function clearStatisticsCache(): void {
  statisticsCache.clear();
}

/**
 * 통계 데이터 내보내기 (CSV)
 */
export async function exportStatisticsToCSV(
  userId: string,
  dateRange: { start: string; end: string }
): Promise<string> {
  try {
    const statistics = await getUserStatisticsDashboard(userId, dateRange);
    
    if (!statistics || statistics.length === 0) {
      return '';
    }

    // CSV 헤더
    const headers = [
      '날짜',
      '총 지출 (KRW)',
      '활성 구독 수',
      '새 구독 수',
      '취소된 구독 수',
      '카테고리별 지출',
      '통화별 지출',
      '알림 전송 수',
      '응답률 (%)',
      '로그인 수',
      '세션 시간 (분)',
      '참여도 점수'
    ];

    // CSV 데이터
    const csvData = statistics.map(stat => [
      stat.date,
      stat.total_spend_krw || 0,
      stat.active_subscriptions || 0,
      stat.new_subscriptions || 0,
      stat.cancelled_subscriptions || 0,
      JSON.stringify(stat.category_breakdown || {}),
      JSON.stringify(stat.currency_breakdown || {}),
      stat.notifications_sent || 0,
      stat.response_rate || 0,
      stat.login_count || 0,
      stat.session_duration_minutes || 0,
      stat.engagement_score || 0
    ]);

    // CSV 문자열 생성
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  } catch (error) {
    console.error('통계 CSV 내보내기 실패:', error);
    return '';
  }
}

/**
 * 통계 데이터 요약 리포트 생성
 */
export async function generateStatisticsReport(
  userId: string,
  dateRange: { start: string; end: string }
): Promise<{
  summary: {
    totalSpend: number;
    averageSpend: number;
    activeSubscriptions: number;
    topCategory: string;
    topCategorySpend: number;
    growthRate: number;
  };
  trends: {
    spendingTrend: 'increasing' | 'decreasing' | 'stable';
    subscriptionGrowth: number;
    categoryDistribution: Record<string, number>;
  };
  insights: string[];
}> {
  try {
    const statistics = await getUserStatisticsDashboard(userId, dateRange);
    
    if (!statistics || statistics.length === 0) {
      return {
        summary: {
          totalSpend: 0,
          averageSpend: 0,
          activeSubscriptions: 0,
          topCategory: '',
          topCategorySpend: 0,
          growthRate: 0
        },
        trends: {
          spendingTrend: 'stable',
          subscriptionGrowth: 0,
          categoryDistribution: {}
        },
        insights: ['데이터가 부족합니다.']
      };
    }

    // 요약 통계 계산
    const totalSpend = statistics.reduce((sum, stat) => sum + (stat.total_spend_krw || 0), 0);
    const averageSpend = totalSpend / statistics.length;
    const activeSubscriptions = Math.max(...statistics.map(s => s.active_subscriptions || 0));
    
    // 최고 지출 카테고리
    const categorySpending = statistics.reduce((acc, stat) => {
      if (stat.category_breakdown) {
        Object.entries(stat.category_breakdown).forEach(([category, amount]) => {
          acc[category] = (acc[category] || 0) + amount;
        });
      }
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(categorySpending)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || '';
    const topCategorySpend = categorySpending[topCategory] || 0;

    // 성장률 계산
    const firstStat = statistics[statistics.length - 1];
    const lastStat = statistics[0];
    const growthRate = firstStat && lastStat && firstStat.total_spend_krw
      ? ((lastStat.total_spend_krw - firstStat.total_spend_krw) / firstStat.total_spend_krw) * 100
      : 0;

    // 트렌드 분석
    const spendingTrend: 'increasing' | 'decreasing' | 'stable' = 
      growthRate > 5 ? 'increasing' : growthRate < -5 ? 'decreasing' : 'stable';

    const subscriptionGrowth = lastStat && firstStat
      ? lastStat.active_subscriptions - firstStat.active_subscriptions
      : 0;

    // 인사이트 생성
    const insights: string[] = [];
    
    if (growthRate > 10) {
      insights.push('지출이 크게 증가하고 있습니다. 구독을 검토해보세요.');
    } else if (growthRate < -10) {
      insights.push('지출이 감소하고 있습니다. 새로운 서비스를 고려해보세요.');
    }

    if (topCategorySpend > totalSpend * 0.5) {
      insights.push(`${topCategory} 카테고리에 지출이 집중되어 있습니다.`);
    }

    if (activeSubscriptions > 10) {
      insights.push('구독이 많습니다. 정기적으로 검토해보세요.');
    }

    if (insights.length === 0) {
      insights.push('구독 패턴이 안정적입니다.');
    }

    return {
      summary: {
        totalSpend,
        averageSpend,
        activeSubscriptions,
        topCategory,
        topCategorySpend,
        growthRate
      },
      trends: {
        spendingTrend,
        subscriptionGrowth,
        categoryDistribution: categorySpending
      },
      insights
    };
  } catch (error) {
    console.error('통계 리포트 생성 실패:', error);
    throw error;
  }
}

// =====================================================
// 통계 데이터 조회 함수들
// =====================================================

/**
 * 사용자 통계 대시보드 데이터 조회
 */
export async function getUserStatisticsDashboard(
  userId: string,
  dateRange: { start: string; end: string } = {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  }
): Promise<Array<{
  id?: string;
  user_id: string;
  date: string;
  total_spend_krw: number;
  active_subscriptions: number;
  new_subscriptions: number;
  cancelled_subscriptions: number;
  category_breakdown: Record<string, number>;
  currency_breakdown: Record<string, number>;
  category_monthly_spend: number;
  category_subscription_count: number;
  cycle_monthly_spend: number;
  cycle_subscription_count: number;
  notifications_sent: number;
  response_rate: number;
  login_count: number;
  session_duration_minutes: number;
  engagement_score: number;
}> | null> {
  try {
    // 종합 통계 뷰에서 데이터 조회
    const { data, error } = await supabase
      .from('comprehensive_statistics_dashboard')
      .select('*')
      .eq('user_id', userId)
      .gte('date', dateRange.start)
      .lte('date', dateRange.end)
      .order('date', { ascending: false });

    if (error) {
      console.error('통계 대시보드 데이터 조회 실패:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('통계 대시보드 조회 중 오류:', error);
    return null;
  }
}

/**
 * 카테고리별 통계 조회
 */
export async function getCategoryStatistics(
  userId: string,
  date: string = new Date().toISOString().split('T')[0]
): Promise<CategoryAnalytics[]> {
  try {
    // Check if analytics table exists
    if (!analyticsTablesCache.get('category_analytics')) {
      const { error: testError } = await supabase
        .from('category_analytics')
        .select('*')
        .limit(1);
      
      if (testError && testError.code === '42P01') {
        console.warn('Category analytics table does not exist. Returning empty data.');
        analyticsTablesCache.set('category_analytics', false);
        return [];
      }
      analyticsTablesCache.set('category_analytics', true);
    }

    if (!analyticsTablesCache.get('category_analytics')) {
      return [];
    }

    const { data, error } = await supabase
      .from('category_analytics')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .order('total_monthly_krw', { ascending: false });

    if (error) {
      if (error.code === '42P01') {
        console.warn('Category analytics table does not exist. Analytics features disabled.');
        analyticsTablesCache.set('category_analytics', false);
        return [];
      }
      console.error('카테고리 통계 조회 실패:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('카테고리 통계 조회 중 오류:', error);
    return [];
  }
}

/**
 * 월별 지출 트렌드 조회
 */
export async function getMonthlySpendingTrends(
  userId: string,
  year: number
): Promise<MonthlySpendingTrends[]> {
  try {
    const { data, error } = await supabase
      .from('monthly_spending_trends')
      .select('*')
      .eq('user_id', userId)
      .eq('year', year)
      .order('month', { ascending: true });

    if (error) {
      console.error('월별 지출 트렌드 조회 실패:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('월별 지출 트렌드 조회 중 오류:', error);
    return [];
  }
}

// =====================================================
// 유틸리티 함수들
// =====================================================

function getCategoryDescription(category: string): string {
  const descriptions: Record<string, string> = {
    '엔터테인먼트': '넷플릭스, 디즈니플러스 등 엔터테인먼트 서비스',
    '음악': '스포티파이, 애플뮤직 등 음악 스트리밍 서비스',
    '개발': 'GitHub, Vercel 등 개발 도구 및 서비스',
    'AI': 'ChatGPT, Claude 등 AI 서비스',
    '디자인': 'Figma, Adobe 등 디자인 도구',
    '생산성': 'Notion, Slack 등 생산성 도구',
    '교육': 'Coursera, Udemy 등 교육 플랫폼',
    '피트니스': 'MyFitnessPal, Strava 등 피트니스 앱',
    '뉴스': '뉴스 구독 서비스',
    '게임': '게임 구독 서비스',
    '기타': '기타 구독 서비스'
  };
  return descriptions[category] || '기타 카테고리';
}

function getPaymentCycleDescription(cycle: string): string {
  const descriptions: Record<string, string> = {
    'monthly': '매월 결제',
    'yearly': '연간 결제 (할인 혜택)',
    'onetime': '일회성 결제'
  };
  return descriptions[cycle] || '알 수 없는 결제주기';
}

// =====================================================
// 통계 데이터 초기화 함수
// =====================================================

/**
 * 사용자의 모든 통계 데이터 초기화
 */
export async function checkDatabaseTables(): Promise<void> {
  try {
    const tables = [
      'subscription_statistics',
      'category_analytics', 
      'payment_cycle_analytics',
      'tag_analytics',
      'monthly_spending_trends',
      'notification_analytics',
      'user_behavior_analytics'
    ];

    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`${table} 테이블 확인 실패:`, error);
      } else {
        console.log(`${table} 테이블 존재함`);
      }
    }
  } catch (error) {
    console.error('데이터베이스 테이블 확인 중 오류:', error);
  }
}

export async function initializeUserStatistics(userId: string): Promise<boolean> {
  try {
    // 기존 통계 데이터 삭제
    const tables = [
      'subscription_statistics',
      'category_analytics',
      'payment_cycle_analytics',
      'tag_analytics',
      'monthly_spending_trends',
      'notification_analytics',
      'user_behavior_analytics'
    ];

    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error(`${table} 데이터 삭제 실패:`, error);
      }
    }

    // 새로운 통계 데이터 수집 및 저장
    const success = await collectAndSaveAllStatistics(userId);
    
    if (success) {
      console.log(`사용자 ${userId}의 통계 데이터가 초기화되었습니다.`);
    }

    return success;
  } catch (error) {
    console.error('통계 데이터 초기화 실패:', error);
    return false;
  }
} 