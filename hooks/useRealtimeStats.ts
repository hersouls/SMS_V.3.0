import { useMemo } from 'react';
import { useRealtimeSubscriptions } from './useRealtimeSubscriptions';
import { Subscription } from '../contexts/DataContext';

interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  pausedSubscriptions: number;
  cancelledSubscriptions: number;
  totalMonthlyKrw: number;
  avgSubscriptionCost: number;
  upcomingPayments: number;
  todayCount: number;
  weekCount: number;
  categoryBreakdown: Record<string, { count: number; totalAmount: number }>;
  paymentCycleBreakdown: {
    monthly: { count: number; totalAmount: number };
    yearly: { count: number; totalAmount: number };
    onetime: { count: number; totalAmount: number };
  };
  currencyBreakdown: {
    KRW: { count: number; totalAmount: number };
    USD: { count: number; totalAmount: number };
  };
  notificationStats: {
    sevenDays: number;
    threeDays: number;
    sameDay: number;
    totalWithNotifications: number;
  };
  autoRenewalStats: {
    enabled: number;
    disabled: number;
    percentage: number;
  };
}

interface RealtimeStatsHook {
  stats: SubscriptionStats;
  loading: boolean;
  error: Error | null;
  refresh: () => void;
}

// KRW 환율 (임시로 고정값 사용, 나중에 실시간 API로 대체 가능)
const USD_TO_KRW_RATE = 1300;

const calculateMonthlyAmount = (subscription: Subscription): number => {
  const baseAmount = subscription.currency === 'USD' 
    ? subscription.amount * USD_TO_KRW_RATE 
    : subscription.amount;

  switch (subscription.paymentCycle) {
    case 'yearly':
      return baseAmount / 12;
    case 'onetime':
      return 0; // 일회성 결제는 월별 계산에서 제외
    default:
      return baseAmount;
  }
};

const isUpcoming = (subscription: Subscription, days: number): boolean => {
  if (subscription.status !== 'active') return false;
  
  const today = new Date();
  const currentDay = today.getDate();
  const paymentDay = subscription.paymentDay;
  
  // 다음 결제일 계산
  let nextPaymentDate = new Date(today);
  nextPaymentDate.setDate(paymentDay);
  
  if (paymentDay <= currentDay) {
    // 다음 달로 이동
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
  }
  
  const diffTime = nextPaymentDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= days;
};

export const useRealtimeStats = (): RealtimeStatsHook => {
  const { subscriptions, loading, error, refresh } = useRealtimeSubscriptions();

  const stats = useMemo((): SubscriptionStats => {
    if (!subscriptions || subscriptions.length === 0) {
      return {
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        pausedSubscriptions: 0,
        cancelledSubscriptions: 0,
        totalMonthlyKrw: 0,
        avgSubscriptionCost: 0,
        upcomingPayments: 0,
        todayCount: 0,
        weekCount: 0,
        categoryBreakdown: {},
        paymentCycleBreakdown: {
          monthly: { count: 0, totalAmount: 0 },
          yearly: { count: 0, totalAmount: 0 },
          onetime: { count: 0, totalAmount: 0 }
        },
        currencyBreakdown: {
          KRW: { count: 0, totalAmount: 0 },
          USD: { count: 0, totalAmount: 0 }
        },
        notificationStats: {
          sevenDays: 0,
          threeDays: 0,
          sameDay: 0,
          totalWithNotifications: 0
        },
        autoRenewalStats: {
          enabled: 0,
          disabled: 0,
          percentage: 0
        }
      };
    }

    console.log('📊 통계 계산 중:', subscriptions.length);

    const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
    const pausedSubscriptions = subscriptions.filter(s => s.status === 'paused');
    const cancelledSubscriptions = subscriptions.filter(s => s.status === 'cancelled');

    // 월별 총 비용 계산
    const totalMonthlyKrw = activeSubscriptions.reduce((sum, sub) => {
      return sum + calculateMonthlyAmount(sub);
    }, 0);

    // 평균 구독 비용
    const avgSubscriptionCost = activeSubscriptions.length > 0 
      ? totalMonthlyKrw / activeSubscriptions.length 
      : 0;

    // 예정된 결제들
    const todayCount = activeSubscriptions.filter(s => isUpcoming(s, 0)).length;
    const weekCount = activeSubscriptions.filter(s => isUpcoming(s, 7)).length;
    const upcomingPayments = weekCount;

    // 카테고리별 분석
    const categoryBreakdown = subscriptions.reduce((acc, sub) => {
      if (!acc[sub.category]) {
        acc[sub.category] = { count: 0, totalAmount: 0 };
      }
      acc[sub.category].count++;
      acc[sub.category].totalAmount += calculateMonthlyAmount(sub);
      return acc;
    }, {} as Record<string, { count: number; totalAmount: number }>);

    // 결제 주기별 분석
    const paymentCycleBreakdown = subscriptions.reduce((acc, sub) => {
      acc[sub.paymentCycle].count++;
      acc[sub.paymentCycle].totalAmount += calculateMonthlyAmount(sub);
      return acc;
    }, {
      monthly: { count: 0, totalAmount: 0 },
      yearly: { count: 0, totalAmount: 0 },
      onetime: { count: 0, totalAmount: 0 }
    });

    // 통화별 분석
    const currencyBreakdown = subscriptions.reduce((acc, sub) => {
      acc[sub.currency].count++;
      acc[sub.currency].totalAmount += sub.amount;
      return acc;
    }, {
      KRW: { count: 0, totalAmount: 0 },
      USD: { count: 0, totalAmount: 0 }
    });

    // 알림 설정 통계
    const notificationStats = subscriptions.reduce((acc, sub) => {
      if (sub.notifications.sevenDays) acc.sevenDays++;
      if (sub.notifications.threeDays) acc.threeDays++;
      if (sub.notifications.sameDay) acc.sameDay++;
      
      if (sub.notifications.sevenDays || sub.notifications.threeDays || sub.notifications.sameDay) {
        acc.totalWithNotifications++;
      }
      
      return acc;
    }, {
      sevenDays: 0,
      threeDays: 0,
      sameDay: 0,
      totalWithNotifications: 0
    });

    // 자동 갱신 통계
    const autoRenewalEnabled = subscriptions.filter(s => s.autoRenewal).length;
    const autoRenewalDisabled = subscriptions.length - autoRenewalEnabled;
    const autoRenewalPercentage = subscriptions.length > 0 
      ? (autoRenewalEnabled / subscriptions.length) * 100 
      : 0;

    const calculatedStats: SubscriptionStats = {
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: activeSubscriptions.length,
      pausedSubscriptions: pausedSubscriptions.length,
      cancelledSubscriptions: cancelledSubscriptions.length,
      totalMonthlyKrw: Math.round(totalMonthlyKrw),
      avgSubscriptionCost: Math.round(avgSubscriptionCost),
      upcomingPayments,
      todayCount,
      weekCount,
      categoryBreakdown,
      paymentCycleBreakdown,
      currencyBreakdown,
      notificationStats,
      autoRenewalStats: {
        enabled: autoRenewalEnabled,
        disabled: autoRenewalDisabled,
        percentage: Math.round(autoRenewalPercentage)
      }
    };

    console.log('📊 통계 계산 완료:', calculatedStats);
    return calculatedStats;
  }, [subscriptions]);

  return {
    stats,
    loading,
    error,
    refresh
  };
};