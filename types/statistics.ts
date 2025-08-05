// 통계 데이터 타입 정의 통합 파일

import { Timestamp } from 'firebase/firestore';

// 기본 통계 인터페이스
export interface BaseStatistics {
  id?: string;
  userId: string;
  createdAt?: Timestamp | Date | string;
  updatedAt?: Timestamp | Date | string;
}

// 구독 통계
export interface SubscriptionStatistics extends BaseStatistics {
  subscriptionId: string;
  date: string; // YYYY-MM-DD 형식
  monthlyAmountKrw: number;
  yearlyAmountKrw: number;
  totalPaidKrw: number;
  category: string;
  status: 'active' | 'paused' | 'cancelled';
  paymentCycle: 'monthly' | 'yearly' | 'onetime';
}

// 사용자 전체 통계
export interface UserStatistics extends BaseStatistics {
  totalActiveSubscriptions: number;
  totalMonthlyKrw: number;
  totalYearlyKrw: number;
  totalSpentKrw: number;
  categoryBreakdown: Record<string, CategoryStats>;
  trendData: TrendDataPoint[];
  lastUpdated: Timestamp | Date | string;
}

// 카테고리 통계
export interface CategoryStats {
  count: number;
  monthlyAmount: number;
  yearlyAmount: number;
  percentage?: number;
}

// 트렌드 데이터 포인트
export interface TrendDataPoint {
  month: string; // YYYY-MM 형식
  amount: number;
  subscriptionCount?: number;
}

// 사용자 행동 통계
export interface UserBehavior extends BaseStatistics {
  lastActive: Timestamp | Date | string;
  totalLogins: number;
  totalSubscriptionsAdded: number;
  totalSubscriptionsDeleted: number;
  favoriteCategory: string;
  averageSubscriptionValue: number;
  sessionStats: SessionStats;
  metadata: Record<string, any>;
}

// 세션 통계
export interface SessionStats {
  totalSessions: number;
  averageDuration: number; // minutes
  lastSessionDuration: number;
  totalTimeSpent: number; // minutes
}

// 실시간 통계 (화면 표시용)
export interface RealtimeStats {
  // 기본 구독 통계
  totalSubscriptions: number;
  activeSubscriptions: number;
  pausedSubscriptions: number;
  cancelledSubscriptions: number;
  
  // 금액 통계
  totalMonthlyKrw: number;
  totalYearlyKrw: number;
  avgSubscriptionCost: number;
  
  // 결제 예정 통계
  upcomingPayments: number;
  todayCount: number;
  weekCount: number;
  monthCount: number;
  
  // 카테고리별 통계
  categoryBreakdown: Record<string, CategoryStats>;
  topCategories: Array<{
    name: string;
    count: number;
    amount: number;
    percentage: number;
  }>;
  
  // 결제 주기별 통계
  paymentCycleBreakdown: {
    monthly: CategoryStats;
    yearly: CategoryStats;
    onetime: CategoryStats;
  };
  
  // 통화별 통계
  currencyBreakdown: {
    KRW: CategoryStats;
    USD: CategoryStats;
  };
  
  // 알림 설정 통계
  notificationStats: {
    sevenDays: number;
    threeDays: number;
    sameDay: number;
    totalWithNotifications: number;
    notificationRate: number; // percentage
  };
  
  // 자동 갱신 통계
  autoRenewalStats: {
    enabled: number;
    disabled: number;
    percentage: number;
  };
  
  // 트렌드 통계
  trends: {
    monthlySpendingTrend: 'increasing' | 'decreasing' | 'stable';
    subscriptionGrowth: number; // percentage
    averageGrowthRate: number;
  };
  
  // 메타데이터
  lastUpdated: Date;
  dataQuality: {
    completeness: number; // percentage
    consistency: number; // percentage
    accuracy: number; // percentage
  };
}

// 통계 계산 옵션
export interface StatisticsOptions {
  includeInactive?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  currency?: 'KRW' | 'USD' | 'ALL';
  categories?: string[];
  exchangeRate?: number;
  precision?: number; // 소수점 자릿수
}

// 통계 오류 타입
export interface StatisticsError {
  code: string;
  message: string;
  context?: Record<string, any>;
  timestamp: Date;
}

// 통계 업데이트 이벤트
export interface StatisticsUpdateEvent {
  type: 'subscription_added' | 'subscription_updated' | 'subscription_deleted' | 'manual_refresh';
  subscriptionId?: string;
  userId: string;
  timestamp: Date;
  data?: Record<string, any>;
}

// 통계 내보내기 형식
export interface StatisticsExportData {
  userId: string;
  exportDate: Date;
  dateRange: {
    start: Date;
    end: Date;
  };
  summary: UserStatistics;
  detailed: SubscriptionStatistics[];
  charts: {
    categoryDistribution: Array<{ name: string; value: number }>;
    monthlyTrends: TrendDataPoint[];
    paymentCycleDist: Array<{ name: string; value: number }>;
  };
  metadata: {
    exportVersion: string;
    totalRecords: number;
    dataIntegrity: boolean;
  };
}

// 통계 대시보드 설정
export interface StatisticsDashboardConfig {
  defaultView: 'overview' | 'categories' | 'trends' | 'details';
  refreshInterval: number; // milliseconds
  autoRefresh: boolean;
  chartOptions: {
    showAnimations: boolean;
    colorScheme: 'default' | 'dark' | 'high-contrast';
    displayPrecision: number;
  };
  filters: {
    dateRange: 'week' | 'month' | 'quarter' | 'year' | 'custom';
    categories: string[];
    includeCancelled: boolean;
  };
}

// 유틸리티 타입들
export type StatisticsStatus = 'loading' | 'ready' | 'error' | 'empty';
export type StatisticsView = 'overview' | 'categories' | 'trends' | 'details' | 'report';
export type ChartType = 'bar' | 'pie' | 'line' | 'area' | 'donut';
export type TimeRange = 'day' | 'week' | 'month' | 'quarter' | 'year';
export type SortOrder = 'asc' | 'desc';
export type GroupBy = 'category' | 'cycle' | 'currency' | 'status' | 'date';

// 통계 훅 반환 타입
export interface UseStatisticsReturn {
  stats: RealtimeStats | null;
  loading: boolean;
  error: StatisticsError | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  exportData: (format: 'json' | 'csv' | 'xlsx') => Promise<string>;
  updateConfig: (config: Partial<StatisticsDashboardConfig>) => void;
}