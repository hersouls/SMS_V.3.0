// 통계 계산 로직 개선된 버전

import { Subscription } from '../contexts/DataContext';
import { 
  RealtimeStats, 
  CategoryStats, 
  StatisticsOptions, 
  StatisticsError,
  TrendDataPoint 
} from '../types/statistics';

// 환율 및 상수
const DEFAULT_USD_TO_KRW_RATE = 1300;
const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

// 입력 데이터 검증
export function validateSubscriptions(subscriptions: Subscription[]): { 
  valid: Subscription[], 
  errors: StatisticsError[] 
} {
  const valid: Subscription[] = [];
  const errors: StatisticsError[] = [];

  subscriptions.forEach((sub, index) => {
    try {
      // 필수 필드 검증
      if (!sub.id || !sub.serviceName || typeof sub.amount !== 'number') {
        errors.push({
          code: 'INVALID_SUBSCRIPTION_DATA',
          message: `구독 데이터가 유효하지 않습니다: ${sub.serviceName || 'Unknown'}`,
          context: { subscriptionIndex: index, subscription: sub },
          timestamp: new Date()
        });
        return;
      }

      // 금액 검증
      if (sub.amount < 0 || sub.amount > 10000000) {
        errors.push({
          code: 'INVALID_AMOUNT',
          message: `구독 금액이 유효하지 않습니다: ${sub.amount}`,
          context: { subscriptionId: sub.id, amount: sub.amount },
          timestamp: new Date()
        });
        return;
      }

      // 결제일 검증
      if (sub.paymentDay < 1 || sub.paymentDay > 31) {
        errors.push({
          code: 'INVALID_PAYMENT_DAY',
          message: `결제일이 유효하지 않습니다: ${sub.paymentDay}`,
          context: { subscriptionId: sub.id, paymentDay: sub.paymentDay },
          timestamp: new Date()
        });
        return;
      }

      valid.push(sub);
    } catch (error) {
      errors.push({
        code: 'VALIDATION_ERROR',
        message: `구독 검증 중 오류 발생: ${error.message}`,
        context: { subscriptionIndex: index, error: error.message },
        timestamp: new Date()
      });
    }
  });

  return { valid, errors };
}

// 안전한 월별 금액 계산
export function calculateMonthlyAmount(
  subscription: Subscription, 
  exchangeRate: number = DEFAULT_USD_TO_KRW_RATE
): number {
  try {
    if (!subscription || typeof subscription.amount !== 'number') {
      return 0;
    }

    const baseAmount = subscription.currency === 'USD' 
      ? subscription.amount * exchangeRate 
      : subscription.amount;

    if (baseAmount < 0) return 0;

    switch (subscription.paymentCycle) {
      case 'yearly':
        return Math.round(baseAmount / 12);
      case 'onetime':
        return 0; // 일회성 결제는 월별 계산에서 제외
      case 'monthly':
      default:
        return Math.round(baseAmount);
    }
  } catch (error) {
    console.error('월별 금액 계산 오류:', error, subscription);
    return 0;
  }
}

// 안전한 연별 금액 계산
export function calculateYearlyAmount(
  subscription: Subscription, 
  exchangeRate: number = DEFAULT_USD_TO_KRW_RATE
): number {
  try {
    if (!subscription || typeof subscription.amount !== 'number') {
      return 0;
    }

    const baseAmount = subscription.currency === 'USD' 
      ? subscription.amount * exchangeRate 
      : subscription.amount;

    if (baseAmount < 0) return 0;

    switch (subscription.paymentCycle) {
      case 'yearly':
        return Math.round(baseAmount);
      case 'onetime':
        return Math.round(baseAmount); // 일회성은 그 해에만 적용
      case 'monthly':
      default:
        return Math.round(baseAmount * 12);
    }
  } catch (error) {
    console.error('연별 금액 계산 오류:', error, subscription);
    return 0;
  }
}

// 결제 예정일 계산 (개선된 버전)
export function isUpcoming(subscription: Subscription, days: number): boolean {
  try {
    if (!subscription || subscription.status !== 'active') {
      return false;
    }

    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const paymentDay = Math.min(subscription.paymentDay, 31);
    
    // 다음 결제일 계산
    let nextPaymentDate = new Date(currentYear, currentMonth, paymentDay);
    
    // 이번 달 결제일이 이미 지났으면 다음 달로
    if (nextPaymentDate <= today) {
      nextPaymentDate = new Date(currentYear, currentMonth + 1, paymentDay);
    }
    
    // 월말 처리 (예: 2월 30일 -> 2월 28일/29일)
    const lastDayOfMonth = new Date(nextPaymentDate.getFullYear(), nextPaymentDate.getMonth() + 1, 0).getDate();
    if (paymentDay > lastDayOfMonth) {
      nextPaymentDate.setDate(lastDayOfMonth);
    }
    
    const diffTime = nextPaymentDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / MILLISECONDS_PER_DAY);
    
    return diffDays >= 0 && diffDays <= days;
  } catch (error) {
    console.error('결제 예정일 계산 오류:', error, subscription);
    return false;
  }
}

// 카테고리별 통계 계산
export function calculateCategoryStats(
  subscriptions: Subscription[], 
  options: StatisticsOptions = {}
): Record<string, CategoryStats> {
  const categoryStats: Record<string, CategoryStats> = {};
  const exchangeRate = options.exchangeRate || DEFAULT_USD_TO_KRW_RATE;
  
  let totalMonthlyAmount = 0;

  subscriptions.forEach(sub => {
    try {
      const category = sub.category || 'Others';
      const monthlyAmount = calculateMonthlyAmount(sub, exchangeRate);
      const yearlyAmount = calculateYearlyAmount(sub, exchangeRate);
      
      if (!categoryStats[category]) {
        categoryStats[category] = {
          count: 0,
          monthlyAmount: 0,
          yearlyAmount: 0,
          percentage: 0
        };
      }
      
      categoryStats[category].count += 1;
      categoryStats[category].monthlyAmount += monthlyAmount;
      categoryStats[category].yearlyAmount += yearlyAmount;
      
      totalMonthlyAmount += monthlyAmount;
    } catch (error) {
      console.error('카테고리 통계 계산 오류:', error, sub);
    }
  });

  // 퍼센티지 계산
  Object.keys(categoryStats).forEach(category => {
    if (totalMonthlyAmount > 0) {
      categoryStats[category].percentage = Math.round(
        (categoryStats[category].monthlyAmount / totalMonthlyAmount) * 100
      );
    }
  });

  return categoryStats;
}

// 메인 통계 계산 함수 (개선된 버전)
export function calculateRealtimeStats(
  subscriptions: Subscription[], 
  options: StatisticsOptions = {}
): { stats: RealtimeStats | null, errors: StatisticsError[] } {
  try {
    // 입력 검증
    if (!Array.isArray(subscriptions)) {
      return {
        stats: null,
        errors: [{
          code: 'INVALID_INPUT',
          message: '구독 데이터가 배열이 아닙니다',
          timestamp: new Date()
        }]
      };
    }

    const { valid: validSubscriptions, errors: validationErrors } = validateSubscriptions(subscriptions);
    
    if (validSubscriptions.length === 0) {
      return {
        stats: createEmptyStats(),
        errors: validationErrors
      };
    }

    const exchangeRate = options.exchangeRate || DEFAULT_USD_TO_KRW_RATE;
    const includeInactive = options.includeInactive || false;
    
    // 필터링
    const filteredSubscriptions = includeInactive 
      ? validSubscriptions 
      : validSubscriptions.filter(sub => sub.status === 'active');

    // 기본 구독 통계
    const activeSubscriptions = validSubscriptions.filter(s => s.status === 'active');
    const pausedSubscriptions = validSubscriptions.filter(s => s.status === 'paused');
    const cancelledSubscriptions = validSubscriptions.filter(s => s.status === 'cancelled');

    // 금액 계산
    const totalMonthlyKrw = activeSubscriptions.reduce((sum, sub) => 
      sum + calculateMonthlyAmount(sub, exchangeRate), 0
    );
    
    const totalYearlyKrw = activeSubscriptions.reduce((sum, sub) => 
      sum + calculateYearlyAmount(sub, exchangeRate), 0
    );

    const avgSubscriptionCost = activeSubscriptions.length > 0 
      ? Math.round(totalMonthlyKrw / activeSubscriptions.length) 
      : 0;

    // 결제 예정 계산
    const todayCount = activeSubscriptions.filter(s => isUpcoming(s, 0)).length;
    const weekCount = activeSubscriptions.filter(s => isUpcoming(s, 7)).length;
    const monthCount = activeSubscriptions.filter(s => isUpcoming(s, 30)).length;

    // 카테고리별 통계
    const categoryBreakdown = calculateCategoryStats(filteredSubscriptions, options);
    
    // 상위 카테고리 계산
    const topCategories = Object.entries(categoryBreakdown)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.monthlyAmount - a.monthlyAmount)
      .slice(0, 5);

    // 결제 주기별 분석
    const paymentCycleBreakdown = filteredSubscriptions.reduce((acc, sub) => {
      const monthlyAmount = calculateMonthlyAmount(sub, exchangeRate);
      const yearlyAmount = calculateYearlyAmount(sub, exchangeRate);
      
      acc[sub.paymentCycle].count++;
      acc[sub.paymentCycle].monthlyAmount += monthlyAmount;
      acc[sub.paymentCycle].yearlyAmount += yearlyAmount;
      
      return acc;
    }, {
      monthly: { count: 0, monthlyAmount: 0, yearlyAmount: 0 },
      yearly: { count: 0, monthlyAmount: 0, yearlyAmount: 0 },
      onetime: { count: 0, monthlyAmount: 0, yearlyAmount: 0 }
    });

    // 통화별 분석
    const currencyBreakdown = filteredSubscriptions.reduce((acc, sub) => {
      acc[sub.currency].count++;
      acc[sub.currency].monthlyAmount += calculateMonthlyAmount(sub, exchangeRate);
      acc[sub.currency].yearlyAmount += calculateYearlyAmount(sub, exchangeRate);
      return acc;
    }, {
      KRW: { count: 0, monthlyAmount: 0, yearlyAmount: 0 },
      USD: { count: 0, monthlyAmount: 0, yearlyAmount: 0 }
    });

    // 알림 설정 통계
    const notificationStats = filteredSubscriptions.reduce((acc, sub) => {
      if (sub.notifications?.sevenDays) acc.sevenDays++;
      if (sub.notifications?.threeDays) acc.threeDays++;
      if (sub.notifications?.sameDay) acc.sameDay++;
      
      if (sub.notifications?.sevenDays || sub.notifications?.threeDays || sub.notifications?.sameDay) {
        acc.totalWithNotifications++;
      }
      
      return acc;
    }, {
      sevenDays: 0,
      threeDays: 0,
      sameDay: 0,
      totalWithNotifications: 0,
      notificationRate: 0
    });

    // 알림 비율 계산
    notificationStats.notificationRate = filteredSubscriptions.length > 0
      ? Math.round((notificationStats.totalWithNotifications / filteredSubscriptions.length) * 100)
      : 0;

    // 자동 갱신 통계
    const autoRenewalEnabled = filteredSubscriptions.filter(s => s.autoRenewal).length;
    const autoRenewalDisabled = filteredSubscriptions.length - autoRenewalEnabled;
    const autoRenewalPercentage = filteredSubscriptions.length > 0 
      ? Math.round((autoRenewalEnabled / filteredSubscriptions.length) * 100)
      : 0;

    // 트렌드 분석 (간단한 버전)
    const trends = {
      monthlySpendingTrend: 'stable' as const,
      subscriptionGrowth: 0,
      averageGrowthRate: 0
    };

    // 데이터 품질 평가
    const dataQuality = {
      completeness: Math.round((validSubscriptions.length / subscriptions.length) * 100),
      consistency: validationErrors.length === 0 ? 100 : Math.max(0, 100 - (validationErrors.length * 10)),
      accuracy: Math.min(100, Math.max(0, 100 - validationErrors.length))
    };

    const stats: RealtimeStats = {
      totalSubscriptions: validSubscriptions.length,
      activeSubscriptions: activeSubscriptions.length,
      pausedSubscriptions: pausedSubscriptions.length,
      cancelledSubscriptions: cancelledSubscriptions.length,
      
      totalMonthlyKrw: Math.round(totalMonthlyKrw),
      totalYearlyKrw: Math.round(totalYearlyKrw),
      avgSubscriptionCost,
      
      upcomingPayments: weekCount,
      todayCount,
      weekCount,
      monthCount,
      
      categoryBreakdown,
      topCategories,
      
      paymentCycleBreakdown,
      currencyBreakdown,
      notificationStats,
      
      autoRenewalStats: {
        enabled: autoRenewalEnabled,
        disabled: autoRenewalDisabled,
        percentage: autoRenewalPercentage
      },
      
      trends,
      
      lastUpdated: new Date(),
      dataQuality
    };

    console.log('📊 통계 계산 완료:', {
      totalSubs: stats.totalSubscriptions,
      monthlyAmount: stats.totalMonthlyKrw,
      categories: Object.keys(categoryBreakdown).length,
      errors: validationErrors.length
    });

    return { stats, errors: validationErrors };
    
  } catch (error) {
    console.error('통계 계산 중 치명적 오류:', error);
    return {
      stats: null,
      errors: [{
        code: 'CALCULATION_ERROR',
        message: `통계 계산 중 오류 발생: ${error.message}`,
        context: { error: error.toString() },
        timestamp: new Date()
      }]
    };
  }
}

// 빈 통계 객체 생성
function createEmptyStats(): RealtimeStats {
  return {
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    pausedSubscriptions: 0,
    cancelledSubscriptions: 0,
    totalMonthlyKrw: 0,
    totalYearlyKrw: 0,
    avgSubscriptionCost: 0,
    upcomingPayments: 0,
    todayCount: 0,
    weekCount: 0,
    monthCount: 0,
    categoryBreakdown: {},
    topCategories: [],
    paymentCycleBreakdown: {
      monthly: { count: 0, monthlyAmount: 0, yearlyAmount: 0 },
      yearly: { count: 0, monthlyAmount: 0, yearlyAmount: 0 },
      onetime: { count: 0, monthlyAmount: 0, yearlyAmount: 0 }
    },
    currencyBreakdown: {
      KRW: { count: 0, monthlyAmount: 0, yearlyAmount: 0 },
      USD: { count: 0, monthlyAmount: 0, yearlyAmount: 0 }
    },
    notificationStats: {
      sevenDays: 0,
      threeDays: 0,
      sameDay: 0,
      totalWithNotifications: 0,
      notificationRate: 0
    },
    autoRenewalStats: {
      enabled: 0,
      disabled: 0,
      percentage: 0
    },
    trends: {
      monthlySpendingTrend: 'stable',
      subscriptionGrowth: 0,
      averageGrowthRate: 0
    },
    lastUpdated: new Date(),
    dataQuality: {
      completeness: 100,
      consistency: 100,
      accuracy: 100
    }
  };
}

// 통계 데이터 포맷팅 유틸리티
export const formatters = {
  currency: (amount: number, currency: 'KRW' | 'USD' = 'KRW'): string => {
    if (currency === 'USD') {
      return `$${amount.toLocaleString()}`;
    }
    return `₩${amount.toLocaleString()}`;
  },
  
  percentage: (value: number, precision: number = 1): string => {
    return `${value.toFixed(precision)}%`;
  },
  
  count: (count: number): string => {
    return `${count.toLocaleString()}개`;
  },
  
  date: (date: Date): string => {
    return date.toLocaleDateString('ko-KR');
  }
};