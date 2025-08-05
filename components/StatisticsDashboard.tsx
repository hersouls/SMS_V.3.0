import { useState, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { GlassCard } from './GlassCard';
import { WaveBackground } from './WaveBackground';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useImprovedRealtimeStats } from '../hooks/useImprovedRealtimeStats';
import { StatisticsErrorFallback } from './StatisticsErrorFallback';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useLoadingState } from '../hooks/useLoadingState';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Plus,
  DollarSign,
  Music,
  Gamepad2,
  BookOpen,
  Zap,
  Minus,
  Monitor,
  Code,
  Cpu,
  Palette,
  Dumbbell,
  Circle,
  AlertCircle,
  FileText,
  BarChart,
  Users,
  Activity,
  Clock,
  Coins,
  Sparkles,
  Lock,
  Lightbulb,
  Database,
  TestTube,
  Calendar
} from 'lucide-react';
import { cn } from './ui/utils';
import { apiService } from '../utils/api';
import {
  initializeMockData
} from '../utils/mockData';
import { WaveButton } from './WaveButton';

interface StatisticsData {
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
}

interface StatisticsReport {
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
}

// 구독 패턴 분석 인터페이스 추가
interface SubscriptionPattern {
  patternType: 'consistent' | 'fluctuating' | 'growing' | 'declining';
  confidence: number;
  description: string;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  monthlyTrend: number[];
  categoryPatterns: Record<string, {
    trend: 'increasing' | 'decreasing' | 'stable';
    percentage: number;
    recommendation: string;
  }>;
}

// 지출 추이 분석 인터페이스 추가
interface SpendingTrend {
  period: '3months' | '6months' | '12months' | '24months';
  totalSpending: number;
  averageMonthlySpending: number;
  growthRate: number;
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  seasonalPattern: boolean;
  peakMonths: number[];
  lowMonths: number[];
  forecast: {
    nextMonth: number;
    nextQuarter: number;
    confidence: number;
  };
  insights: string[];
}

// 카테고리별 분석 인터페이스 추가
interface CategoryAnalysis {
  category: string;
  totalSpending: number;
  monthlyAverage: number;
  subscriptionCount: number;
  growthRate: number;
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  efficiency: number; // 효율성 점수 (0-100)
  recommendations: string[];
  topServices: Array<{
    serviceName: string;
    amount: number;
    percentage: number;
  }>;
  monthlyBreakdown: number[];
}

export function StatisticsDashboard() {
  const { user } = useAuth();
  const { subscriptions, preferences, loading: dataLoading } = useData();
  const { stats, loading: statsLoading, error: statsError, refresh: refreshStats } = useImprovedRealtimeStats();
  const { handleError } = useErrorHandler();
  const { isLoading, withLoading } = useLoadingState();
  const [selectedView, setSelectedView] = useState<'overview' | 'categories' | 'trends' | 'details' | 'report' | 'patterns'>('overview');
  const [animateCards, setAnimateCards] = useState(false);
  const [useRealData, setUseRealData] = useState(true);
  const [patternAnalysis, setPatternAnalysis] = useState<SubscriptionPattern | null>(null);
  const [analyzingPatterns, setAnalyzingPatterns] = useState(false);
  const [spendingTrend, setSpendingTrend] = useState<SpendingTrend | null>(null);
  const [selectedTrendPeriod, setSelectedTrendPeriod] = useState<'3months' | '6months' | '12months' | '24months'>('12months');
  const [categoryAnalysis, setCategoryAnalysis] = useState<CategoryAnalysis[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [analyzingCategories, setAnalyzingCategories] = useState(false);

  // 통계 리포트 생성 함수
  const generateStatisticsReport = (): StatisticsReport => {
    if (!stats || !subscriptions) {
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
        insights: ['데이터가 부족하여 분석을 수행할 수 없습니다.']
      };
    }

    // 카테고리별 지출 계산
    const categorySpending: Record<string, number> = {};
    let totalSpend = 0;
    let activeCount = 0;

    subscriptions.forEach(sub => {
      if (sub.status === 'active') {
        activeCount++;
        // amount를 월별 금액으로 사용 (paymentCycle에 따라 조정)
        let monthlyAmount = sub.amount || 0;
        if (sub.paymentCycle === 'yearly') {
          monthlyAmount = monthlyAmount / 12;
        } else if (sub.paymentCycle === 'onetime') {
          monthlyAmount = 0; // 일회성은 월별 계산에서 제외
        }
        totalSpend += monthlyAmount;
        
        const category = sub.category || '기타';
        categorySpending[category] = (categorySpending[category] || 0) + monthlyAmount;
      }
    });

    // 최고 지출 카테고리 찾기
    const topCategory = Object.entries(categorySpending).reduce((max, [category, amount]) => 
      amount > max.amount ? { category, amount } : max, 
      { category: '', amount: 0 }
    );

    // 평균 지출 계산
    const averageSpend = activeCount > 0 ? totalSpend / activeCount : 0;

    // 성장률 계산 (이전 달 대비)
    const growthRate = calculateGrowthRate(stats);

    // 트렌드 방향 결정
    const spendingTrend: 'increasing' | 'decreasing' | 'stable' = 
      growthRate > 5 ? 'increasing' : 
      growthRate < -5 ? 'decreasing' : 'stable';

    // 구독 성장률 계산
    const subscriptionGrowth = calculateSubscriptionGrowth(stats);

    // 인사이트 생성
    const insights = generateInsights(stats, categorySpending, totalSpend, averageSpend);

    return {
      summary: {
        totalSpend,
        averageSpend,
        activeSubscriptions: activeCount,
        topCategory: topCategory.category,
        topCategorySpend: topCategory.amount,
        growthRate
      },
      trends: {
        spendingTrend,
        subscriptionGrowth,
        categoryDistribution: categorySpending
      },
      insights
    };
  };

  // 성장률 계산 함수
  const calculateGrowthRate = (stats: any): number => {
    // 실제 구현에서는 이전 달 데이터와 비교
    // 현재는 임시로 랜덤 값 사용
    return Math.random() * 20 - 10; // -10% ~ +10%
  };

  // 구독 성장률 계산 함수
  const calculateSubscriptionGrowth = (stats: any): number => {
    // 실제 구현에서는 이전 달 구독 수와 비교
    return Math.random() * 15 - 5; // -5% ~ +10%
  };

  // 인사이트 생성 함수
  const generateInsights = (
    stats: any, 
    categorySpending: Record<string, number>, 
    totalSpend: number, 
    averageSpend: number
  ): string[] => {
    const insights: string[] = [];

    // 총 지출 인사이트
    if (totalSpend > 100000) {
      insights.push('월 지출이 10만원을 초과하고 있습니다. 구독 서비스를 재검토해보세요.');
    } else if (totalSpend < 50000) {
      insights.push('현재 구독 지출이 적절한 수준입니다. 필요에 따라 새로운 서비스를 고려해보세요.');
    }

    // 카테고리별 인사이트
    const topCategory = Object.entries(categorySpending).reduce((max, [category, amount]) => 
      amount > max.amount ? { category, amount } : max, 
      { category: '', amount: 0 }
    );

    if (topCategory.amount > totalSpend * 0.5) {
      insights.push(`${topCategory.category} 카테고리가 전체 지출의 50% 이상을 차지합니다.`);
    }

    // 평균 지출 인사이트
    if (averageSpend > 30000) {
      insights.push('구독당 평균 지출이 높습니다. 더 저렴한 대안을 찾아보세요.');
    }

    // 알림 설정 인사이트
    if (stats?.notificationStats?.totalWithNotifications > 0) {
      const notificationRate = stats.notificationStats.notificationRate || 0;
      if (notificationRate < 50) {
        insights.push('알림 응답률이 낮습니다. 알림 설정을 확인해보세요.');
      }
    }

    // 기본 인사이트
    if (insights.length === 0) {
      insights.push('현재 구독 패턴이 안정적입니다.');
      insights.push('정기적으로 구독 서비스를 검토하는 것을 권장합니다.');
    }

    return insights;
  };

  // 구독 패턴 분석 함수
  const analyzeSubscriptionPatterns = async (): Promise<SubscriptionPattern> => {
    if (!subscriptions || subscriptions.length === 0) {
      return {
        patternType: 'consistent',
        confidence: 0,
        description: '분석할 구독 데이터가 없습니다.',
        recommendations: ['새로운 구독을 추가해보세요.'],
        riskLevel: 'low',
        monthlyTrend: [],
        categoryPatterns: {}
      };
    }

    // 월별 지출 트렌드 계산
    const monthlySpending = new Array(12).fill(0);
    const categorySpending: Record<string, number[]> = {};
    
    subscriptions.forEach(sub => {
      if (sub.status === 'active') {
        const monthlyAmount = sub.paymentCycle === 'yearly' ? (sub.amount || 0) / 12 : (sub.amount || 0);
        
        // 현재 월부터 12개월 전까지의 트렌드 계산 (임시 데이터)
        for (let i = 0; i < 12; i++) {
          monthlySpending[i] += monthlyAmount * (0.8 + Math.random() * 0.4); // 변동성 추가
        }
        
        const category = sub.category || '기타';
        if (!categorySpending[category]) {
          categorySpending[category] = new Array(12).fill(0);
        }
        // 배열이 생성되었으므로 안전하게 접근
        for (let i = 0; i < 12; i++) {
          categorySpending[category][i] += monthlyAmount * (0.8 + Math.random() * 0.4);
        }
      }
    });

    // 패턴 타입 결정
    const totalSpend = monthlySpending.reduce((sum, amount) => sum + amount, 0);
    const avgSpend = totalSpend / 12;
    const variance = monthlySpending.reduce((sum, amount) => sum + Math.pow(amount - avgSpend, 2), 0) / 12;
    const coefficientOfVariation = Math.sqrt(variance) / avgSpend;

    let patternType: 'consistent' | 'fluctuating' | 'growing' | 'declining';
    let confidence: number;
    let description: string;
    let riskLevel: 'low' | 'medium' | 'high';

    if (coefficientOfVariation < 0.1) {
      patternType = 'consistent';
      confidence = 0.9;
      description = '안정적인 구독 패턴을 보이고 있습니다.';
      riskLevel = 'low';
    } else if (coefficientOfVariation > 0.3) {
      patternType = 'fluctuating';
      confidence = 0.7;
      description = '변동성이 큰 구독 패턴입니다.';
      riskLevel = 'medium';
    } else {
      // 성장/감소 패턴 분석
      const firstHalf = monthlySpending.slice(0, 6).reduce((sum, amount) => sum + amount, 0);
      const secondHalf = monthlySpending.slice(6).reduce((sum, amount) => sum + amount, 0);
      
      if (secondHalf > firstHalf * 1.2) {
        patternType = 'growing';
        confidence = 0.8;
        description = '구독 지출이 증가하는 추세입니다.';
        riskLevel = 'medium';
      } else if (secondHalf < firstHalf * 0.8) {
        patternType = 'declining';
        confidence = 0.8;
        description = '구독 지출이 감소하는 추세입니다.';
        riskLevel = 'low';
      } else {
        patternType = 'consistent';
        confidence = 0.6;
        description = '상대적으로 안정적인 구독 패턴입니다.';
        riskLevel = 'low';
      }
    }

    // 카테고리별 패턴 분석
    const categoryPatterns: Record<string, {
      trend: 'increasing' | 'decreasing' | 'stable';
      percentage: number;
      recommendation: string;
    }> = {};

    Object.entries(categorySpending).forEach(([category, amounts]) => {
      if (amounts && amounts.length > 0) {
        const firstHalf = amounts.slice(0, 6).reduce((sum, amount) => sum + amount, 0);
        const secondHalf = amounts.slice(6).reduce((sum, amount) => sum + amount, 0);
        const total = firstHalf + secondHalf;
        
        let trend: 'increasing' | 'decreasing' | 'stable';
        let recommendation: string;
        
        if (secondHalf > firstHalf * 1.3) {
          trend = 'increasing';
          recommendation = `${category} 카테고리 지출이 증가하고 있습니다. 필요성을 재검토해보세요.`;
        } else if (secondHalf < firstHalf * 0.7) {
          trend = 'decreasing';
          recommendation = `${category} 카테고리 지출이 감소하고 있습니다.`;
        } else {
          trend = 'stable';
          recommendation = `${category} 카테고리는 안정적인 패턴을 보입니다.`;
        }
        
        categoryPatterns[category] = {
          trend,
          percentage: (total / (totalSpend || 1)) * 100,
          recommendation
        };
      }
    });

    // 추천사항 생성
    const recommendations: string[] = [];
    
    if (patternType === 'fluctuating') {
      recommendations.push('월별 지출 변동이 큽니다. 정기적인 구독 검토를 권장합니다.');
    }
    
    if (patternType === 'growing') {
      recommendations.push('구독 지출이 증가하고 있습니다. 불필요한 구독을 정리해보세요.');
    }
    
    const highSpendingCategories = Object.entries(categoryPatterns)
      .filter(([_, data]) => data && data.percentage > 30)
      .map(([category, _]) => category);
    
    if (highSpendingCategories.length > 0) {
      recommendations.push(`${highSpendingCategories.join(', ')} 카테고리 비중이 높습니다. 대안을 검토해보세요.`);
    }
    
    if (recommendations.length === 0) {
      recommendations.push('현재 구독 패턴이 건강합니다. 정기적인 모니터링을 계속하세요.');
    }

    return {
      patternType,
      confidence,
      description,
      recommendations,
      riskLevel,
      monthlyTrend: monthlySpending,
      categoryPatterns
    };
  };

  // 패턴 분석 실행
  const runPatternAnalysis = async () => {
    setAnalyzingPatterns(true);
    try {
      const analysis = await analyzeSubscriptionPatterns();
      setPatternAnalysis(analysis);
    } catch (error) {
      handleError(error, '패턴 분석 중 오류가 발생했습니다.');
    } finally {
      setAnalyzingPatterns(false);
    }
  };

  // 지출 추이 분석 함수
  const analyzeSpendingTrend = async (period: '3months' | '6months' | '12months' | '24months'): Promise<SpendingTrend> => {
    if (!subscriptions || subscriptions.length === 0) {
      return {
        period,
        totalSpending: 0,
        averageMonthlySpending: 0,
        growthRate: 0,
        trendDirection: 'stable',
        seasonalPattern: false,
        peakMonths: [],
        lowMonths: [],
        forecast: {
          nextMonth: 0,
          nextQuarter: 0,
          confidence: 0
        },
        insights: ['분석할 구독 데이터가 없습니다.']
      };
    }

    // 기간별 월 수 계산
    const monthCount = {
      '3months': 3,
      '6months': 6,
      '12months': 12,
      '24months': 24
    }[period];

    // 월별 지출 데이터 생성 (실제로는 Firebase에서 가져와야 함)
    const monthlyData = new Array(monthCount).fill(0).map((_, index) => {
      let total = 0;
      subscriptions.forEach(sub => {
        if (sub.status === 'active') {
          const monthlyAmount = sub.paymentCycle === 'yearly' ? (sub.amount || 0) / 12 : (sub.amount || 0);
          // 시계열 변동성 추가 (계절성, 트렌드 등)
          const seasonalFactor = 1 + 0.2 * Math.sin((index / monthCount) * 2 * Math.PI);
          const trendFactor = 1 + (index / monthCount) * 0.1; // 점진적 증가
          const randomFactor = 0.8 + Math.random() * 0.4;
          total += monthlyAmount * seasonalFactor * trendFactor * randomFactor;
        }
      });
      return total;
    });

    const totalSpending = monthlyData.reduce((sum, amount) => sum + amount, 0);
    const averageMonthlySpending = totalSpending / monthCount;

    // 성장률 계산
    const firstHalf = monthlyData.slice(0, Math.floor(monthCount / 2)).reduce((sum, amount) => sum + amount, 0);
    const secondHalf = monthlyData.slice(Math.floor(monthCount / 2)).reduce((sum, amount) => sum + amount, 0);
    const growthRate = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0;

    // 트렌드 방향 결정
    const trendDirection: 'increasing' | 'decreasing' | 'stable' = 
      growthRate > 5 ? 'increasing' : 
      growthRate < -5 ? 'decreasing' : 'stable';

    // 계절성 패턴 분석
    const seasonalPattern = monthCount >= 12;
    const peakMonths: number[] = [];
    const lowMonths: number[] = [];

    if (seasonalPattern) {
      const avg = monthlyData.reduce((sum, amount) => sum + amount, 0) / monthCount;
      monthlyData.forEach((amount, index) => {
        if (amount > avg * 1.2) peakMonths.push(index + 1);
        if (amount < avg * 0.8) lowMonths.push(index + 1);
      });
    }

    // 예측 모델 (간단한 선형 회귀)
    const forecast = calculateForecast(monthlyData, period);

    // 인사이트 생성
    const insights = generateTrendInsights(monthlyData, growthRate, trendDirection, seasonalPattern, peakMonths, lowMonths);

    return {
      period,
      totalSpending,
      averageMonthlySpending,
      growthRate,
      trendDirection,
      seasonalPattern,
      peakMonths,
      lowMonths,
      forecast,
      insights
    };
  };

  // 예측 계산 함수
  const calculateForecast = (monthlyData: number[], period: string): { nextMonth: number; nextQuarter: number; confidence: number } => {
    if (monthlyData.length < 2) {
      return { nextMonth: 0, nextQuarter: 0, confidence: 0 };
    }

    // 간단한 선형 회귀
    const n = monthlyData.length;
    const sumX = (n * (n + 1)) / 2;
    const sumY = monthlyData.reduce((sum, amount) => sum + amount, 0);
    const sumXY = monthlyData.reduce((sum, amount, index) => sum + amount * (index + 1), 0);
    const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const nextMonth = slope * (n + 1) + intercept;
    const nextQuarter = slope * (n + 3) + intercept;

    // 신뢰도 계산 (R-squared)
    const meanY = sumY / n;
    const ssRes = monthlyData.reduce((sum, amount, index) => {
      const predicted = slope * (index + 1) + intercept;
      return sum + Math.pow(amount - predicted, 2);
    }, 0);
    const ssTot = monthlyData.reduce((sum, amount) => sum + Math.pow(amount - meanY, 2), 0);
    const confidence = ssTot > 0 ? (1 - ssRes / ssTot) * 100 : 0;

    return {
      nextMonth: Math.max(0, nextMonth),
      nextQuarter: Math.max(0, nextQuarter),
      confidence: Math.min(100, Math.max(0, confidence))
    };
  };

  // 트렌드 인사이트 생성 함수
  const generateTrendInsights = (
    monthlyData: number[],
    growthRate: number,
    trendDirection: 'increasing' | 'decreasing' | 'stable',
    seasonalPattern: boolean,
    peakMonths: number[],
    lowMonths: number[]
  ): string[] => {
    const insights: string[] = [];

    // 성장률 인사이트
    if (growthRate > 10) {
      insights.push('지출이 빠르게 증가하고 있습니다. 구독 서비스를 재검토해보세요.');
    } else if (growthRate > 5) {
      insights.push('지출이 점진적으로 증가하고 있습니다. 정기적인 모니터링이 필요합니다.');
    } else if (growthRate < -10) {
      insights.push('지출이 크게 감소하고 있습니다. 서비스 이용도를 확인해보세요.');
    } else if (growthRate < -5) {
      insights.push('지출이 감소하고 있습니다. 새로운 서비스 추가를 고려해보세요.');
    } else {
      insights.push('지출이 안정적으로 유지되고 있습니다.');
    }

    // 계절성 패턴 인사이트
    if (seasonalPattern && peakMonths.length > 0) {
      insights.push(`${peakMonths.join(', ')}월에 지출이 집중됩니다. 계절성을 고려한 예산 계획을 세워보세요.`);
    }

    if (seasonalPattern && lowMonths.length > 0) {
      insights.push(`${lowMonths.join(', ')}월에 지출이 낮습니다. 이 시기를 활용해 새로운 서비스를 시도해보세요.`);
    }

    // 변동성 인사이트
    const variance = monthlyData.reduce((sum, amount, index) => {
      const mean = monthlyData.reduce((s, a) => s + a, 0) / monthlyData.length;
      return sum + Math.pow(amount - mean, 2);
    }, 0) / monthlyData.length;
    const coefficientOfVariation = Math.sqrt(variance) / (monthlyData.reduce((sum, amount) => sum + amount, 0) / monthlyData.length);

    if (coefficientOfVariation > 0.3) {
      insights.push('월별 지출 변동이 큽니다. 정기적인 구독 검토를 권장합니다.');
    } else if (coefficientOfVariation < 0.1) {
      insights.push('매우 안정적인 지출 패턴을 보이고 있습니다.');
    }

    return insights;
  };

  // 트렌드 분석 실행
  const runTrendAnalysis = async () => {
    try {
      const analysis = await analyzeSpendingTrend(selectedTrendPeriod);
      setSpendingTrend(analysis);
    } catch (error) {
      handleError(error, '트렌드 분석 중 오류가 발생했습니다.');
    }
  };

  // 트렌드 분석 초기화
  useEffect(() => {
    if (selectedView === 'trends' && !spendingTrend) {
      runTrendAnalysis();
    }
  }, [selectedView, spendingTrend, selectedTrendPeriod]);

  // 패턴 분석 초기화
  useEffect(() => {
    if (selectedView === 'patterns' && !patternAnalysis) {
      runPatternAnalysis();
    }
  }, [selectedView, patternAnalysis]);

  // 통계 리포트 생성
  const statisticsReport = generateStatisticsReport();

  // 월별 트렌드 데이터 (임시)
  const monthlyTrends = [
    { year: 2024, month: 1, total_spend_krw: 150000, trend_direction: 'increasing' as const },
    { year: 2024, month: 2, total_spend_krw: 180000, trend_direction: 'increasing' as const },
    { year: 2024, month: 3, total_spend_krw: 160000, trend_direction: 'decreasing' as const },
    { year: 2024, month: 4, total_spend_krw: 170000, trend_direction: 'increasing' as const },
    { year: 2024, month: 5, total_spend_krw: 190000, trend_direction: 'increasing' as const },
    { year: 2024, month: 6, total_spend_krw: 185000, trend_direction: 'decreasing' as const }
  ];

  // 카드 애니메이션 효과
  useEffect(() => {
    if (!dataLoading && stats) {
      setAnimateCards(true);
      const timer = setTimeout(() => setAnimateCards(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [dataLoading, stats]);

  // No longer needed - using real-time stats from Firebase
  const loadStatisticsData = async () => {
    console.log('✅ Using Firebase real-time statistics');
  };

  const refreshStatistics = async () => {
    await withLoading('refresh', async () => {
      try {
        await refreshStats();
        console.log('✅ Firebase 실시간 데이터 새로고침 완료');
      } catch (error) {
        handleError(error, '통계 데이터 새로고침에 실패했습니다.');
      }
    });
  };

  const exportCSV = async () => {
    if (!user) return;

    try {
      // 현재 날짜 기준으로 CSV 내보내기
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endDate = now.toISOString().split('T')[0];
      
      // CSV 데이터 생성
      const csvData = generateCSVData();
      if (csvData) {
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `statistics_${startDate}_${endDate}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('CSV 내보내기 실패:', error);
      // 에러 처리는 handleError를 사용
      handleError(error, 'CSV 내보내기 중 오류가 발생했습니다.');
    }
  };

  // Excel 형식 데이터 내보내기 함수
  const exportExcel = async () => {
    if (!user) return;

    try {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endDate = now.toISOString().split('T')[0];
      
      // Excel 데이터 생성
      const excelData = generateExcelData();
      if (excelData) {
        const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `statistics_${startDate}_${endDate}.xlsx`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Excel 내보내기 실패:', error);
      handleError(error, 'Excel 내보내기 중 오류가 발생했습니다.');
    }
  };

  // Excel 데이터 생성 함수
  const generateExcelData = (): string => {
    if (!stats || !subscriptions) return '';

    // Excel XML 형식으로 데이터 생성
    const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheets>
    <sheet name="구독현황" sheetId="1" r:id="rId1"/>
    <sheet name="카테고리분석" sheetId="2" r:id="rId2"/>
    <sheet name="통계요약" sheetId="3" r:id="rId3"/>
  </sheets>
</workbook>`;

    // 구독현황 시트 데이터
    const subscriptionData = subscriptions.map(sub => [
      sub.serviceName,
      sub.category,
      sub.amount,
      sub.paymentCycle,
      sub.status,
      sub.paymentDay,
      sub.startDate,
      sub.endDate
    ]);

    // 카테고리별 분석 데이터
    const categoryData = Object.entries(stats?.categoryBreakdown || {}).map(([category, data]) => [
      category,
      data.monthlyAmount,
      data.count,
      ((data.monthlyAmount / (stats?.totalMonthlyKrw || 1)) * 100).toFixed(1) + '%'
    ]);

    // 통계 요약 데이터
    const summaryData = [
      ['총 월 지출', stats?.totalMonthlyKrw?.toLocaleString() + '원'],
      ['활성 구독 수', stats?.activeSubscriptions + '개'],
      ['카테고리 수', Object.keys(stats?.categoryBreakdown || {}).length + '개'],
      ['평균 구독 금액', ((stats?.totalMonthlyKrw || 0) / (stats?.activeSubscriptions || 1)).toLocaleString() + '원']
    ];

    return workbook;
  };

  // 상세 Excel 내보내기 함수
  const exportDetailedExcel = async () => {
    if (!user) return;

    try {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endDate = now.toISOString().split('T')[0];
      
      // 상세 Excel 데이터 생성
      const detailedData = generateDetailedExcelData();
      if (detailedData) {
        const blob = new Blob([detailedData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `detailed_statistics_${startDate}_${endDate}.xlsx`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('상세 Excel 내보내기 실패:', error);
      handleError(error, '상세 Excel 내보내기 중 오류가 발생했습니다.');
    }
  };

  // 상세 Excel 데이터 생성 함수
  const generateDetailedExcelData = (): string => {
    if (!stats || !subscriptions) return '';

    // 상세 분석 데이터 포함
    const detailedData = {
      subscriptions: subscriptions.map(sub => ({
        serviceName: sub.serviceName,
        category: sub.category,
        amount: sub.amount,
        paymentCycle: sub.paymentCycle,
        status: sub.status,
        paymentDay: sub.paymentDay,
        startDate: sub.startDate,
        endDate: sub.endDate,
        monthlyAmount: sub.paymentCycle === 'yearly' ? (sub.amount || 0) / 12 : (sub.amount || 0)
      })),
      categoryAnalysis: categoryAnalysis,
      spendingTrend: spendingTrend,
      patternAnalysis: patternAnalysis,
      statistics: stats
    };

    // JSON 형태로 반환 (실제로는 Excel 라이브러리 사용)
    return JSON.stringify(detailedData, null, 2);
  };

  // CSV 데이터 생성 함수
  const generateCSVData = (): string => {
    if (!stats || !subscriptions) return '';

    const headers = ['서비스명', '카테고리', '월 금액', '결제 주기', '상태', '결제일'];
    const rows = subscriptions.map(sub => [
      sub.serviceName,
      sub.category,
      sub.amount,
      sub.paymentCycle,
      sub.status,
      sub.paymentDay
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const getTrendIcon = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="text-emerald-500 drop-shadow-lg" size={20} />;
      case 'decreasing':
        return <TrendingDown className="text-red-500 drop-shadow-lg" size={20} />;
          case 'stable':
      return <Minus className="text-blue-500 drop-shadow-lg" size={20} />;
    }
  };

  const getTrendColor = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing':
        return 'text-emerald-500';
      case 'decreasing':
        return 'text-red-500';
      case 'stable':
        return 'text-blue-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      '엔터테인먼트': <Monitor className="text-purple-400" size={20} />,
      '음악': <Music className="text-pink-400" size={20} />,
      '개발': <Code className="text-blue-400" size={20} />,
              'AI': <Cpu className="text-cyan-400" size={20} />,
      '디자인': <Palette className="text-orange-400" size={20} />,
      '생산성': <Zap className="text-yellow-400" size={20} />,
      '교육': <BookOpen className="text-green-400" size={20} />,
      '피트니스': <Dumbbell className="text-red-400" size={20} />,
      '게임': <Gamepad2 className="text-indigo-400" size={20} />
    };
    return icons[category as keyof typeof icons] || <Circle className="text-gray-400" size={20} />;
  };

  // 카테고리별 분석 함수
  const analyzeCategories = async (): Promise<CategoryAnalysis[]> => {
    if (!subscriptions || subscriptions.length === 0) {
      return [];
    }

    // 카테고리별 구독 그룹화
    const categoryGroups: Record<string, any[]> = {};
    subscriptions.forEach(sub => {
      if (sub.status === 'active') {
        const category = sub.category || '기타';
        if (!categoryGroups[category]) {
          categoryGroups[category] = [];
        }
        categoryGroups[category].push(sub);
      }
    });

    const analyses: CategoryAnalysis[] = [];

    Object.entries(categoryGroups).forEach(([category, categorySubs]) => {
      const totalSpending = categorySubs.reduce((sum, sub) => {
        const monthlyAmount = sub.paymentCycle === 'yearly' ? (sub.amount || 0) / 12 : (sub.amount || 0);
        return sum + monthlyAmount;
      }, 0);

      const monthlyAverage = totalSpending;
      const subscriptionCount = categorySubs.length;

      // 성장률 계산 (임시 데이터)
      const growthRate = (Math.random() - 0.5) * 20; // -10% ~ +10%

      // 트렌드 방향 결정
      const trendDirection: 'increasing' | 'decreasing' | 'stable' = 
        growthRate > 5 ? 'increasing' : 
        growthRate < -5 ? 'decreasing' : 'stable';

      // 효율성 점수 계산 (구독당 평균 금액, 서비스 다양성 등 고려)
      const avgPerSubscription = totalSpending / subscriptionCount;
      const efficiency = Math.max(0, Math.min(100, 100 - (avgPerSubscription / 50000) * 100));

      // 상위 서비스 추출
      const topServices = categorySubs
        .map(sub => ({
          serviceName: sub.serviceName,
          amount: sub.paymentCycle === 'yearly' ? (sub.amount || 0) / 12 : (sub.amount || 0),
          percentage: 0
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3)
        .map(service => ({
          ...service,
          percentage: (service.amount / totalSpending) * 100
        }));

      // 월별 분해 (임시 데이터)
      const monthlyBreakdown = new Array(12).fill(0).map(() => 
        totalSpending * (0.8 + Math.random() * 0.4)
      );

      // 추천사항 생성
      const recommendations = generateCategoryRecommendations(
        category,
        totalSpending,
        subscriptionCount,
        growthRate,
        efficiency,
        topServices
      );

      analyses.push({
        category,
        totalSpending,
        monthlyAverage,
        subscriptionCount,
        growthRate,
        trendDirection,
        efficiency,
        recommendations,
        topServices,
        monthlyBreakdown
      });
    });

    return analyses.sort((a, b) => b.totalSpending - a.totalSpending);
  };

  // 카테고리별 추천사항 생성 함수
  const generateCategoryRecommendations = (
    category: string,
    totalSpending: number,
    subscriptionCount: number,
    growthRate: number,
    efficiency: number,
    topServices: Array<{ serviceName: string; amount: number; percentage: number }>
  ): string[] => {
    const recommendations: string[] = [];

    // 지출 규모 기반 추천
    if (totalSpending > 100000) {
      recommendations.push(`${category} 카테고리 지출이 높습니다. 서비스 통합을 고려해보세요.`);
    } else if (totalSpending < 20000) {
      recommendations.push(`${category} 카테고리 지출이 적습니다. 더 많은 서비스를 탐색해보세요.`);
    }

    // 구독 수 기반 추천
    if (subscriptionCount > 5) {
      recommendations.push(`${category} 카테고리 구독이 많습니다. 중복 서비스를 정리해보세요.`);
    } else if (subscriptionCount < 2) {
      recommendations.push(`${category} 카테고리 구독이 적습니다. 다양한 옵션을 탐색해보세요.`);
    }

    // 성장률 기반 추천
    if (growthRate > 10) {
      recommendations.push(`${category} 카테고리 지출이 빠르게 증가하고 있습니다.`);
    } else if (growthRate < -10) {
      recommendations.push(`${category} 카테고리 지출이 감소하고 있습니다. 서비스 품질을 확인해보세요.`);
    }

    // 효율성 기반 추천
    if (efficiency < 50) {
      recommendations.push(`${category} 카테고리 효율성이 낮습니다. 더 저렴한 대안을 찾아보세요.`);
    } else if (efficiency > 80) {
      recommendations.push(`${category} 카테고리 효율성이 높습니다. 현재 상태를 유지하세요.`);
    }

    // 상위 서비스 기반 추천
    if (topServices.length > 0 && topServices[0] && topServices[0].percentage > 70) {
      recommendations.push(`${topServices[0].serviceName}에 지출이 집중되어 있습니다.`);
    }

    return recommendations;
  };

  // 카테고리 분석 실행
  const runCategoryAnalysis = async () => {
    setAnalyzingCategories(true);
    try {
      const analyses = await analyzeCategories();
      setCategoryAnalysis(analyses);
      if (analyses.length > 0 && analyses[0] && !selectedCategory) {
        setSelectedCategory(analyses[0].category);
      }
    } catch (error) {
      handleError(error, '카테고리 분석 중 오류가 발생했습니다.');
    } finally {
      setAnalyzingCategories(false);
    }
  };

  // 카테고리 분석 초기화
  useEffect(() => {
    if (selectedView === 'categories' && categoryAnalysis.length === 0) {
      runCategoryAnalysis();
    }
  }, [selectedView, categoryAnalysis]);

  if (!user) {
    return (
      <div className="min-h-screen relative">
        <WaveBackground />
        <Header />
        <main className="pt-28 pb-token-xl px-token-md relative z-10">
          <div className="max-w-7xl mx-auto">
            <GlassCard variant="light" className="p-token-2xl backdrop-blur-xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-token-md animate-pulse">
                  <Lock className="text-white text-2xl" size={24} />
                </div>
                <h2 className="text-white-force text-xl-ko font-semibold mb-token-md">
                  로그인이 필요합니다
                </h2>
                <p className="text-white-force text-sm-ko opacity-60">
                  통계를 보려면 먼저 로그인해주세요.
                </p>
              </div>
            </GlassCard>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 통계 에러 처리
  if (statsError && !stats) {
    return (
      <div className="min-h-screen relative">
        <WaveBackground />
        <Header />
        <main className="pt-28 pb-token-xl px-token-md relative z-10">
          <div className="max-w-7xl mx-auto">
            <StatisticsErrorFallback 
              error={statsError}
              onRetry={refreshStats}
              showDetails={true}
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 데이터가 없는 경우
  if (!statsLoading && (!subscriptions || subscriptions.length === 0)) {
    return (
      <div className="min-h-screen relative">
        <WaveBackground />
        <Header />
        <main className="pt-28 pb-token-xl px-token-md relative z-10">
          <div className="max-w-7xl mx-auto">
            <GlassCard variant="strong" className="p-token-2xl backdrop-blur-xl">
              <div className="text-center space-y-token-md">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto">
                  <BarChart3 className="text-white text-2xl" size={24} />
                </div>
                <div>
                  <p className="text-white-force text-lg-ko font-semibold">구독 데이터가 없습니다</p>
                  <p className="text-white-force text-sm-ko opacity-60">
                    통계를 보려면 먼저 구독을 추가해주세요.
                  </p>
                </div>
                <WaveButton
                  variant="primary"
                  onClick={() => window.location.href = '/subscriptions/new'}
                  className="shadow-lg shadow-primary-500/20 wave-button-primary-enhanced"
                >
                  <Plus size={16} className="mr-token-xs" />
                  구독 추가하기
                </WaveButton>
              </div>
            </GlassCard>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 로딩 상태
  if (statsLoading && !stats) {
    return (
      <div className="min-h-screen relative">
        <WaveBackground />
        <Header />
        <main className="pt-28 pb-token-xl px-token-md relative z-10">
          <div className="max-w-7xl mx-auto">
            <GlassCard variant="strong" className="p-token-2xl backdrop-blur-xl">
              <div className="text-center space-y-token-md">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto"></div>
                  <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-primary-400 rounded-full animate-spin mx-auto" style={{ animationDelay: '0.5s' }}></div>
                </div>
                <div className="space-y-token-sm">
                  <p className="text-white-force text-lg-ko font-semibold">통계 데이터를 불러오는 중...</p>
                  <div className="flex justify-center space-x-1">
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <WaveBackground />
      <Header />

      <main className="pt-28 pb-token-xl px-token-md relative z-10">
        <div className="max-w-7xl mx-auto space-y-token-xl">
          
          {/* 헤더 섹션 */}
          <div className="flex items-center justify-between">
            <div className="space-y-token-sm">
              <div className="flex items-center gap-token-sm">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
                  <BarChart3 className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-white-force text-3xl-ko font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    통계 대시보드
                  </h1>
                  <p className="text-white-force text-sm-ko opacity-60">
                    구독 패턴과 지출 트렌드를 분석해보세요
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-token-sm">
              <WaveButton
                variant="secondary"
                onClick={() => setUseRealData(!useRealData)}
                className="text-xs wave-button-glass-enhanced"
              >
                {useRealData ? (
                  <>
                    <Database className="w-4 h-4 mr-1" />
                    실제 데이터
                  </>
                ) : (
                  <>
                    <TestTube className="w-4 h-4 mr-1" />
                    가상 데이터
                  </>
                )}
              </WaveButton>
              
              <WaveButton
                variant="primary"
                onClick={refreshStatistics}
                disabled={isLoading('refresh') || dataLoading || statsLoading}
                className="shadow-lg shadow-primary-500/20 wave-button-primary-enhanced"
              >
                <RefreshCw size={16} className={cn("mr-token-xs", (isLoading('refresh') || dataLoading || statsLoading) && "animate-spin")} />
                새로고침
              </WaveButton>
            </div>
          </div>

          {/* 뷰 선택 탭 */}
          <div className="flex space-x-token-sm p-token-sm bg-white/5 backdrop-blur-sm rounded-2xl overflow-x-auto">
            {[
              { key: 'overview', label: '개요', icon: BarChart3, color: 'from-blue-500 to-cyan-500' },
              { key: 'categories', label: '카테고리', icon: PieChart, color: 'from-purple-500 to-pink-500' },
              { key: 'trends', label: '트렌드', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
              { key: 'details', label: '상세', icon: FileText, color: 'from-orange-500 to-red-500' },
              { key: 'report', label: '리포트', icon: BarChart, color: 'from-indigo-500 to-purple-500' },
              { key: 'patterns', label: '패턴', icon: Dumbbell, color: 'from-yellow-500 to-orange-500' }
            ].map(({ key, label, icon: Icon, color }) => (
              <WaveButton
                key={key}
                variant={selectedView === key ? 'primary' : 'secondary'}
                onClick={() => setSelectedView(key as any)}
                className={cn(
                  "flex items-center gap-token-xs transition-smooth transform-gpu will-change-transform whitespace-nowrap",
                  selectedView === key && `bg-gradient-to-r ${color} shadow-lg wave-button-primary-enhanced`
                )}
              >
                <Icon size={16} />
                {label}
              </WaveButton>
            ))}
          </div>

          {/* 로딩 상태 */}
          {(dataLoading || statsLoading) && (
            <GlassCard variant="strong" className="p-token-2xl backdrop-blur-xl">
              <div className="text-center space-y-token-md">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto"></div>
                  <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-primary-400 rounded-full animate-spin mx-auto" style={{ animationDelay: '0.5s' }}></div>
                </div>
                <div className="space-y-token-sm">
                  <p className="text-white-force text-lg-ko font-semibold">통계 데이터를 불러오는 중...</p>
                  <div className="flex justify-center space-x-1">
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {/* 에러 상태 */}
          {statsError && (
            <GlassCard variant="strong" className="p-token-2xl backdrop-blur-xl">
              <div className="text-center space-y-token-md">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle size={32} className="text-white" />
                </div>
                <div className="space-y-token-sm">
                  <p className="text-white-force text-lg-ko font-semibold">오류가 발생했습니다</p>
                  <p className="text-white-force text-sm-ko opacity-60">{statsError?.message || '알 수 없는 오류가 발생했습니다'}</p>
                </div>
                <WaveButton
                  variant="primary"
                  onClick={refreshStatistics}
                  className="shadow-lg shadow-primary-500/20 wave-button-primary-enhanced"
                >
                  <RefreshCw size={16} className="mr-token-xs" />
                  다시 시도
                </WaveButton>
              </div>
            </GlassCard>
          )}

          {/* 통계 데이터 표시 */}
          {!dataLoading && !statsLoading && !statsError && stats && (
            <>
              {/* 개요 섹션 */}
              {selectedView === 'overview' && (
                <div className="space-y-token-xl">
                  {/* 주요 지표 카드들 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-token-lg">
                    <GlassCard variant="light" className="p-token-lg hover-card-subtle transition-smooth transform-gpu will-change-transform">
                      <div className="flex items-center gap-token-sm mb-token-sm">
                        <DollarSign className="text-emerald-400" size={20} />
                        <h3 className="text-white-force font-semibold">총 지출</h3>
                      </div>
                      <p className="text-white-force text-xl-ko font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                        {(stats?.totalMonthlyKrw || 0).toLocaleString()}원
                      </p>
                    </GlassCard>

                    <GlassCard variant="light" className="p-token-lg hover-card-subtle transition-smooth transform-gpu will-change-transform">
                      <div className="flex items-center gap-token-sm mb-token-sm">
                        <Users className="text-blue-400" size={20} />
                        <h3 className="text-white-force font-semibold">활성 구독</h3>
                      </div>
                      <p className="text-white-force text-xl-ko font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        {stats?.activeSubscriptions || 0}개
                      </p>
                    </GlassCard>

                    <GlassCard variant="light" className="p-token-lg hover-card-subtle transition-smooth transform-gpu will-change-transform">
                      <div className="flex items-center gap-token-sm mb-token-sm">
                        <Plus className="text-purple-400" size={20} />
                        <h3 className="text-white-force font-semibold">새 구독</h3>
                      </div>
                      <p className="text-white-force text-xl-ko font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {0}개
                      </p>
                    </GlassCard>

                    <GlassCard variant="light" className="p-token-lg hover-card-subtle transition-smooth transform-gpu will-change-transform">
                      <div className="flex items-center gap-token-sm mb-token-sm">
                        <Activity className="text-orange-400" size={20} />
                        <h3 className="text-white-force font-semibold">참여도</h3>
                      </div>
                      <p className="text-white-force text-xl-ko font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                        {0}점
                      </p>
                    </GlassCard>
                  </div>

                  {/* 추가 통계 카드들 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-token-lg">
                    <GlassCard variant="light" className="p-token-lg hover-card-subtle transition-smooth transform-gpu will-change-transform">
                      <div className="flex items-center gap-token-sm mb-token-sm">
                        <Clock className="text-blue-400" size={20} />
                        <h3 className="text-white-force font-semibold">세션 시간</h3>
                      </div>
                      <p className="text-white-force text-xl-ko font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        {0}분
                      </p>
                    </GlassCard>

                    <GlassCard variant="light" className="p-token-lg hover-card-subtle transition-smooth transform-gpu will-change-transform">
                      <div className="flex items-center gap-token-sm mb-token-sm">
                        <AlertCircle className="text-orange-400" size={20} />
                        <h3 className="text-white-force font-semibold">알림 전송</h3>
                      </div>
                      <p className="text-white-force text-xl-ko font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                        {stats?.notificationStats?.totalWithNotifications || 0}개
                      </p>
                      <p className="text-white/60 text-sm">
                        응답률: {stats?.notificationStats?.notificationRate?.toFixed(1) || 0}%
                      </p>
                    </GlassCard>

                    <GlassCard variant="light" className="p-token-lg hover-card-subtle transition-smooth transform-gpu will-change-transform">
                      <div className="flex items-center gap-token-sm mb-token-sm">
                        <Users className="text-green-400" size={20} />
                        <h3 className="text-white-force font-semibold">로그인</h3>
                      </div>
                      <p className="text-white-force text-xl-ko font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        {0}회
                      </p>
                    </GlassCard>
                  </div>
                </div>
              )}

              {/* 카테고리 섹션 */}
              {selectedView === 'categories' && (
                <div className="space-y-token-lg">
                  {analyzingCategories ? (
                    <GlassCard variant="strong" className="p-token-2xl backdrop-blur-xl">
                      <div className="text-center space-y-token-md">
                        <div className="relative">
                          <div className="w-20 h-20 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto"></div>
                          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-primary-400 rounded-full animate-spin mx-auto" style={{ animationDelay: '0.5s' }}></div>
                        </div>
                        <div className="space-y-token-sm">
                          <p className="text-white-force text-lg-ko font-semibold">카테고리를 분석하고 있습니다...</p>
                          <div className="flex justify-center space-x-1">
                            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  ) : categoryAnalysis.length > 0 ? (
                    <div className="space-y-token-lg">
                      {/* 카테고리 선택 */}
                      <GlassCard variant="light" className="p-token-lg">
                        <div className="flex items-center gap-token-sm mb-token-md">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                            <PieChart className="text-white w-4 h-4" />
                          </div>
                          <h3 className="text-white-force font-semibold">카테고리별 상세 분석</h3>
                        </div>
                        
                        <div className="flex space-x-token-sm overflow-x-auto pb-token-sm">
                          {categoryAnalysis.map((analysis) => (
                            <WaveButton
                              key={analysis.category}
                              variant={selectedCategory === analysis.category ? 'primary' : 'secondary'}
                              onClick={() => setSelectedCategory(analysis.category)}
                              className="text-xs whitespace-nowrap"
                            >
                              {analysis.category}
                            </WaveButton>
                          ))}
                        </div>
                      </GlassCard>

                      {/* 선택된 카테고리 상세 분석 */}
                      {selectedCategory && (() => {
                        const analysis = categoryAnalysis.find(a => a.category === selectedCategory);
                        if (!analysis) return null;

                        return (
                          <div className="space-y-token-lg">
                            {/* 요약 지표 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-token-md">
                              <div className="p-token-md bg-white/5 rounded-lg">
                                <div className="flex items-center gap-token-sm mb-token-sm">
                                  <DollarSign className="text-emerald-400 w-4 h-4" />
                                  <div>
                                    <p className="text-white/60 text-xs">총 지출</p>
                                    <p className="text-white-force font-semibold text-sm">
                                      {analysis.totalSpending.toLocaleString()}원
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="p-token-md bg-white/5 rounded-lg">
                                <div className="flex items-center gap-token-sm mb-token-sm">
                                  <Users className="text-blue-400 w-4 h-4" />
                                  <div>
                                    <p className="text-white/60 text-xs">구독 수</p>
                                    <p className="text-white-force font-semibold text-sm">
                                      {analysis.subscriptionCount}개
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="p-token-md bg-white/5 rounded-lg">
                                <div className="flex items-center gap-token-sm mb-token-sm">
                                  <TrendingUp className="text-purple-400 w-4 h-4" />
                                  <div>
                                    <p className="text-white/60 text-xs">성장률</p>
                                    <div className="flex items-center gap-token-xs">
                                      <p className={cn("text-white-force font-semibold text-sm", getTrendColor(analysis.trendDirection))}>
                                        {analysis.growthRate > 0 ? '+' : ''}{analysis.growthRate.toFixed(1)}%
                                      </p>
                                      {getTrendIcon(analysis.trendDirection)}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="p-token-md bg-white/5 rounded-lg">
                                <div className="flex items-center gap-token-sm mb-token-sm">
                                  <Activity className="text-orange-400 w-4 h-4" />
                                  <div>
                                    <p className="text-white/60 text-xs">효율성</p>
                                    <p className="text-white-force font-semibold text-sm">
                                      {analysis.efficiency.toFixed(0)}%
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* 상위 서비스 */}
                            <GlassCard variant="light" className="p-token-lg">
                              <div className="flex items-center gap-token-sm mb-token-md">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
                                  <BarChart3 className="text-white w-4 h-4" />
                                </div>
                                <h4 className="text-white-force font-semibold">상위 서비스</h4>
                              </div>
                              <div className="space-y-token-sm">
                                {analysis.topServices.map((service, index) => (
                                  <div key={service.serviceName} className="flex items-center justify-between p-token-sm bg-white/5 rounded-lg">
                                    <div className="flex items-center gap-token-sm">
                                      <span className="text-white-force text-sm font-semibold">{index + 1}.</span>
                                      <span className="text-white-force text-sm">{service.serviceName}</span>
                                    </div>
                                    <div className="flex items-center gap-token-sm">
                                      <span className="text-white-force font-semibold">
                                        {service.amount.toLocaleString()}원
                                      </span>
                                      <span className="text-white-force text-sm opacity-60">
                                        ({service.percentage.toFixed(1)}%)
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </GlassCard>

                            {/* 추천사항 */}
                            <GlassCard variant="light" className="p-token-lg">
                              <div className="flex items-center gap-token-sm mb-token-md">
                                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                                  <Lightbulb className="text-white w-4 h-4" />
                                </div>
                                <h4 className="text-white-force font-semibold">AI 추천사항</h4>
                              </div>
                              <div className="space-y-token-sm">
                                {analysis.recommendations.map((recommendation, index) => (
                                  <div key={index} className="flex items-start gap-token-sm p-token-sm bg-white/5 rounded-lg">
                                    <Sparkles size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-white-force text-sm leading-relaxed">{recommendation}</p>
                                  </div>
                                ))}
                              </div>
                            </GlassCard>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <GlassCard variant="strong" className="p-token-2xl backdrop-blur-xl">
                      <div className="text-center space-y-token-md">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                          <PieChart className="text-white text-2xl" size={24} />
                        </div>
                        <div>
                          <p className="text-white-force text-lg-ko font-semibold">카테고리 분석 준비 완료</p>
                          <p className="text-white-force text-sm-ko opacity-60">
                            카테고리별 상세 분석을 수행합니다.
                          </p>
                        </div>
                        <WaveButton
                          variant="primary"
                          onClick={runCategoryAnalysis}
                          className="shadow-lg shadow-primary-500/20 wave-button-primary-enhanced"
                        >
                          <PieChart size={16} className="mr-token-xs" />
                          카테고리 분석 시작
                        </WaveButton>
                      </div>
                    </GlassCard>
                  )}
                </div>
              )}

              {/* 트렌드 섹션 */}
              {selectedView === 'trends' && (
                <div className="space-y-token-lg">
                  {/* 기간 선택 */}
                  <GlassCard variant="light" className="p-token-lg">
                    <div className="flex items-center gap-token-sm mb-token-md">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg">
                        <TrendingUp className="text-white w-4 h-4" />
                      </div>
                      <h3 className="text-white-force font-semibold">지출 추이 분석</h3>
                    </div>
                    
                    <div className="flex space-x-token-sm mb-token-md">
                      {[
                        { key: '3months', label: '3개월' },
                        { key: '6months', label: '6개월' },
                        { key: '12months', label: '12개월' },
                        { key: '24months', label: '24개월' }
                      ].map(({ key, label }) => (
                        <WaveButton
                          key={key}
                          variant={selectedTrendPeriod === key ? 'primary' : 'secondary'}
                          onClick={() => {
                            setSelectedTrendPeriod(key as any);
                            setSpendingTrend(null); // 새로운 분석을 위해 초기화
                          }}
                          className="text-xs"
                        >
                          {label}
                        </WaveButton>
                      ))}
                    </div>

                    {spendingTrend ? (
                      <div className="space-y-token-lg">
                        {/* 요약 지표 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-token-md">
                          <div className="p-token-md bg-white/5 rounded-lg">
                            <div className="flex items-center gap-token-sm mb-token-sm">
                              <DollarSign className="text-emerald-400 w-4 h-4" />
                              <div>
                                <p className="text-white/60 text-xs">총 지출</p>
                                <p className="text-white-force font-semibold text-sm">
                                  {spendingTrend.totalSpending.toLocaleString()}원
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="p-token-md bg-white/5 rounded-lg">
                            <div className="flex items-center gap-token-sm mb-token-sm">
                              <BarChart3 className="text-blue-400 w-4 h-4" />
                              <div>
                                <p className="text-white/60 text-xs">평균 월 지출</p>
                                <p className="text-white-force font-semibold text-sm">
                                  {spendingTrend.averageMonthlySpending.toLocaleString()}원
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="p-token-md bg-white/5 rounded-lg">
                            <div className="flex items-center gap-token-sm mb-token-sm">
                              <TrendingUp className="text-purple-400 w-4 h-4" />
                              <div>
                                <p className="text-white/60 text-xs">성장률</p>
                                <div className="flex items-center gap-token-xs">
                                  <p className={cn("text-white-force font-semibold text-sm", getTrendColor(spendingTrend.trendDirection))}>
                                    {spendingTrend.growthRate > 0 ? '+' : ''}{spendingTrend.growthRate.toFixed(1)}%
                                  </p>
                                  {getTrendIcon(spendingTrend.trendDirection)}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="p-token-md bg-white/5 rounded-lg">
                            <div className="flex items-center gap-token-sm mb-token-sm">
                              <Activity className="text-orange-400 w-4 h-4" />
                              <div>
                                <p className="text-white/60 text-xs">예측 신뢰도</p>
                                <p className="text-white-force font-semibold text-sm">
                                  {spendingTrend.forecast.confidence.toFixed(0)}%
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 예측 정보 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-token-lg">
                          <GlassCard variant="light" className="p-token-lg">
                            <div className="flex items-center gap-token-sm mb-token-md">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
                                <Clock className="text-white w-4 h-4" />
                              </div>
                              <h4 className="text-white-force font-semibold">예측 정보</h4>
                            </div>
                            <div className="space-y-token-sm">
                              <div className="flex items-center justify-between p-token-sm bg-white/5 rounded-lg">
                                <span className="text-white-force text-sm">다음 달 예상 지출</span>
                                <span className="text-white-force font-semibold">
                                  {spendingTrend.forecast.nextMonth.toLocaleString()}원
                                </span>
                              </div>
                              <div className="flex items-center justify-between p-token-sm bg-white/5 rounded-lg">
                                <span className="text-white-force text-sm">다음 분기 예상 지출</span>
                                <span className="text-white-force font-semibold">
                                  {spendingTrend.forecast.nextQuarter.toLocaleString()}원
                                </span>
                              </div>
                            </div>
                          </GlassCard>

                          <GlassCard variant="light" className="p-token-lg">
                            <div className="flex items-center gap-token-sm mb-token-md">
                              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                                <Calendar className="text-white w-4 h-4" />
                              </div>
                              <h4 className="text-white-force font-semibold">계절성 패턴</h4>
                            </div>
                            <div className="space-y-token-sm">
                              {spendingTrend.seasonalPattern ? (
                                <>
                                  {spendingTrend.peakMonths.length > 0 && (
                                    <div className="p-token-sm bg-white/5 rounded-lg">
                                      <p className="text-white-force text-sm">
                                        <span className="text-emerald-400 font-semibold">피크 월:</span> {spendingTrend.peakMonths.join(', ')}월
                                      </p>
                                    </div>
                                  )}
                                  {spendingTrend.lowMonths.length > 0 && (
                                    <div className="p-token-sm bg-white/5 rounded-lg">
                                      <p className="text-white-force text-sm">
                                        <span className="text-blue-400 font-semibold">저점 월:</span> {spendingTrend.lowMonths.join(', ')}월
                                      </p>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <p className="text-white-force text-sm opacity-60">
                                  계절성 패턴이 감지되지 않았습니다.
                                </p>
                              )}
                            </div>
                          </GlassCard>
                        </div>

                        {/* 인사이트 */}
                        <GlassCard variant="light" className="p-token-lg">
                          <div className="flex items-center gap-token-sm mb-token-md">
                            <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                              <Lightbulb className="text-white w-4 h-4" />
                            </div>
                            <h4 className="text-white-force font-semibold">트렌드 인사이트</h4>
                          </div>
                          <div className="space-y-token-sm">
                            {spendingTrend.insights.map((insight, index) => (
                              <div key={index} className="flex items-start gap-token-sm p-token-sm bg-white/5 rounded-lg">
                                <Sparkles size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                                <p className="text-white-force text-sm leading-relaxed">{insight}</p>
                              </div>
                            ))}
                          </div>
                        </GlassCard>
                      </div>
                    ) : (
                      <div className="text-center space-y-token-md">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
                          <TrendingUp className="text-white text-2xl" size={24} />
                        </div>
                        <div>
                          <p className="text-white-force text-lg-ko font-semibold">트렌드 분석 준비 완료</p>
                          <p className="text-white-force text-sm-ko opacity-60">
                            선택한 기간의 지출 추이를 분석합니다.
                          </p>
                        </div>
                        <WaveButton
                          variant="primary"
                          onClick={runTrendAnalysis}
                          className="shadow-lg shadow-primary-500/20 wave-button-primary-enhanced"
                        >
                          <TrendingUp size={16} className="mr-token-xs" />
                          트렌드 분석 시작
                        </WaveButton>
                      </div>
                    )}
                  </GlassCard>
                </div>
              )}

              {/* 상세 섹션 */}
              {selectedView === 'details' && (
                <div className="space-y-token-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-token-lg">
                    <GlassCard variant="light" className="p-token-lg backdrop-blur-sm">
                      <div className="flex items-center gap-token-sm mb-token-sm">
                        <Clock size={20} className="text-blue-400" />
                        <h3 className="text-white-force font-semibold">세션 시간</h3>
                      </div>
                      <p className="text-white-force text-xl-ko font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        {0}분
                      </p>
                      <div className="mt-token-sm">
                        <div className="w-full bg-white/20 backdrop-blur-sm rounded-full h-3 shadow-inner">
                          <div 
                            className="h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full shadow-lg"
                            style={{ width: `${Math.min((0 / 60) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </GlassCard>

                    <GlassCard variant="light" className="p-token-lg backdrop-blur-sm">
                      <div className="flex items-center gap-token-sm mb-token-sm">
                        <AlertCircle size={20} className="text-orange-400" />
                        <h3 className="text-white-force font-semibold">알림 전송</h3>
                      </div>
                      <p className="text-white-force text-xl-ko font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                        {stats?.notificationStats?.totalWithNotifications || 0}개
                      </p>
                      <p className="text-white/60 text-sm">
                        응답률: {stats?.notificationStats?.notificationRate?.toFixed(1) || 0}%
                      </p>
                    </GlassCard>

                    <GlassCard variant="light" className="p-token-lg backdrop-blur-sm">
                      <div className="flex items-center gap-token-sm mb-token-sm">
                        <Users size={20} className="text-green-400" />
                        <h3 className="text-white-force font-semibold">로그인</h3>
                      </div>
                      <p className="text-white-force text-xl-ko font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        {0}회
                      </p>
                    </GlassCard>
                  </div>

                  <div className="flex justify-center space-x-token-sm">
                    <WaveButton
                      variant="secondary"
                      onClick={exportCSV}
                      className="shadow-lg wave-button-secondary-enhanced"
                    >
                      <Download size={16} className="mr-token-xs" />
                      CSV 내보내기
                    </WaveButton>
                    <WaveButton
                      variant="secondary"
                      onClick={exportExcel}
                      className="shadow-lg wave-button-secondary-enhanced"
                    >
                      <Download size={16} className="mr-token-xs" />
                      Excel 내보내기
                    </WaveButton>
                    <WaveButton
                      variant="secondary"
                      onClick={exportDetailedExcel}
                      className="shadow-lg wave-button-secondary-enhanced"
                    >
                      <Download size={16} className="mr-token-xs" />
                      상세 Excel 내보내기
                    </WaveButton>
                  </div>
                </div>
              )}

              {/* 리포트 섹션 */}
              {selectedView === 'report' && stats && (
                <div className="space-y-token-lg">
                  {/* 요약 */}
                  <GlassCard variant="strong" className="p-token-lg glass-breathe hover-card-strong transition-smooth transform-gpu will-change-transform">
                    <div className="flex items-center gap-token-sm mb-token-lg">
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                        <BarChart className="text-white w-5 h-5" />
                      </div>
                      <h3 className="text-white-force font-semibold text-lg">요약 리포트</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-token-lg">
                      <div className="space-y-token-xs p-token-sm bg-white/5 rounded-lg">
                        <p className="text-white/60 text-sm font-medium">총 지출</p>
                        <p className="text-white-force text-xl-ko font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                          {statisticsReport.summary.totalSpend.toLocaleString()}원
                        </p>
                      </div>
                      <div className="space-y-token-xs p-token-sm bg-white/5 rounded-lg">
                        <p className="text-white/60 text-sm font-medium">평균 지출</p>
                        <p className="text-white-force text-xl-ko font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                          {statisticsReport.summary.averageSpend.toLocaleString()}원
                        </p>
                      </div>
                      <div className="space-y-token-xs p-token-sm bg-white/5 rounded-lg">
                        <p className="text-white/60 text-sm font-medium">성장률</p>
                        <div className="flex items-center gap-token-xs">
                          <p className={cn("text-white-force text-xl-ko font-bold", getTrendColor(statisticsReport.trends.spendingTrend))}>
                            {statisticsReport.summary.growthRate > 0 ? '+' : ''}{statisticsReport.summary.growthRate.toFixed(1)}%
                          </p>
                          {getTrendIcon(statisticsReport.trends.spendingTrend)}
                        </div>
                      </div>
                    </div>
                  </GlassCard>

                  {/* 인사이트 */}
                  <GlassCard variant="light" className="p-token-lg hover-card-subtle transition-smooth transform-gpu will-change-transform">
                    <div className="flex items-center gap-token-sm mb-token-lg">
                      <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Lightbulb className="text-white w-5 h-5" />
                      </div>
                      <h3 className="text-white-force font-semibold text-lg">인사이트</h3>
                    </div>
                    <div className="space-y-token-sm">
                      {statisticsReport.insights.map((insight, index) => (
                        <div key={index} className="flex items-start gap-token-sm p-token-sm bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-200">
                          <Sparkles size={16} className="text-yellow-400 mt-0.5 flex-shrink-0 icon-enhanced" />
                          <p className="text-white-force text-sm leading-relaxed text-high-contrast">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              )}

              {/* 구독 패턴 분석 섹션 */}
              {selectedView === 'patterns' && (
                <div className="space-y-token-lg">
                  <GlassCard variant="strong" className="p-token-lg glass-breathe hover-card-strong transition-smooth transform-gpu will-change-transform">
                    <div className="flex items-center gap-token-sm mb-token-lg">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Dumbbell className="text-white w-5 h-5" />
                      </div>
                      <h3 className="text-white-force font-semibold text-lg">구독 패턴 분석</h3>
                    </div>
                    
                    {analyzingPatterns ? (
                      <div className="text-center space-y-token-md">
                        <div className="relative">
                          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto"></div>
                          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary-400 rounded-full animate-spin mx-auto" style={{ animationDelay: '0.5s' }}></div>
                        </div>
                        <p className="text-white-force text-lg-ko font-semibold">패턴을 분석하고 있습니다...</p>
                      </div>
                    ) : patternAnalysis ? (
                      <div className="space-y-token-lg">
                        {/* 패턴 요약 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-token-md">
                          <div className="p-token-md bg-white/5 rounded-lg">
                            <div className="flex items-center gap-token-sm mb-token-sm">
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center",
                                patternAnalysis.patternType === 'consistent' && "bg-gradient-to-r from-green-500 to-emerald-500",
                                patternAnalysis.patternType === 'fluctuating' && "bg-gradient-to-r from-yellow-500 to-orange-500",
                                patternAnalysis.patternType === 'growing' && "bg-gradient-to-r from-red-500 to-pink-500",
                                patternAnalysis.patternType === 'declining' && "bg-gradient-to-r from-blue-500 to-cyan-500"
                              )}>
                                <Activity className="text-white w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-white/60 text-xs">패턴 타입</p>
                                <p className="text-white-force font-semibold text-sm">
                                  {patternAnalysis.patternType === 'consistent' && '안정적'}
                                  {patternAnalysis.patternType === 'fluctuating' && '변동성'}
                                  {patternAnalysis.patternType === 'growing' && '증가'}
                                  {patternAnalysis.patternType === 'declining' && '감소'}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="p-token-md bg-white/5 rounded-lg">
                            <div className="flex items-center gap-token-sm mb-token-sm">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                <TrendingUp className="text-white w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-white/60 text-xs">신뢰도</p>
                                <p className="text-white-force font-semibold text-sm">
                                  {(patternAnalysis.confidence * 100).toFixed(0)}%
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="p-token-md bg-white/5 rounded-lg">
                            <div className="flex items-center gap-token-sm mb-token-sm">
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center",
                                patternAnalysis.riskLevel === 'low' && "bg-gradient-to-r from-green-500 to-emerald-500",
                                patternAnalysis.riskLevel === 'medium' && "bg-gradient-to-r from-yellow-500 to-orange-500",
                                patternAnalysis.riskLevel === 'high' && "bg-gradient-to-r from-red-500 to-pink-500"
                              )}>
                                <AlertCircle className="text-white w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-white/60 text-xs">위험 수준</p>
                                <p className="text-white-force font-semibold text-sm">
                                  {patternAnalysis.riskLevel === 'low' && '낮음'}
                                  {patternAnalysis.riskLevel === 'medium' && '보통'}
                                  {patternAnalysis.riskLevel === 'high' && '높음'}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="p-token-md bg-white/5 rounded-lg">
                            <div className="flex items-center gap-token-sm mb-token-sm">
                              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <BarChart3 className="text-white w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-white/60 text-xs">분석 카테고리</p>
                                <p className="text-white-force font-semibold text-sm">
                                  {Object.keys(patternAnalysis.categoryPatterns).length}개
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 패턴 설명 */}
                        <div className="p-token-lg bg-white/5 rounded-lg">
                          <h4 className="text-white-force font-semibold mb-token-sm">패턴 분석 결과</h4>
                          <p className="text-white-force text-sm leading-relaxed opacity-80 mb-token-md">
                            {patternAnalysis.description}
                          </p>
                          
                          {/* 월별 트렌드 차트 */}
                          <div className="mb-token-lg">
                            <h5 className="text-white-force font-semibold text-sm mb-token-sm">월별 지출 트렌드</h5>
                            <div className="flex items-end gap-token-xs h-32">
                              {patternAnalysis.monthlyTrend.map((amount, index) => {
                                const maxAmount = Math.max(...patternAnalysis.monthlyTrend);
                                const height = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
                                return (
                                  <div key={index} className="flex-1 flex flex-col items-center">
                                    <div 
                                      className="w-full bg-gradient-to-t from-primary-400 to-primary-600 rounded-t-sm transition-all duration-300 hover:scale-105"
                                      style={{ height: `${height}%` }}
                                    ></div>
                                    <span className="text-white-force text-xs mt-token-xs opacity-60">{index + 1}월</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* 카테고리별 패턴 */}
                          <div className="mb-token-lg">
                            <h5 className="text-white-force font-semibold text-sm mb-token-sm">카테고리별 패턴</h5>
                            <div className="space-y-token-sm">
                              {Object.entries(patternAnalysis.categoryPatterns).map(([category, data]) => (
                                <div key={category} className="flex items-center justify-between p-token-sm bg-white/5 rounded-lg">
                                  <div className="flex items-center gap-token-sm">
                                    {getCategoryIcon(category)}
                                    <span className="text-white-force text-sm">{category}</span>
                                  </div>
                                  <div className="flex items-center gap-token-sm">
                                    <span className={cn("text-sm font-semibold", getTrendColor(data.trend))}>
                                      {data.trend === 'increasing' && '증가'}
                                      {data.trend === 'decreasing' && '감소'}
                                      {data.trend === 'stable' && '안정'}
                                    </span>
                                    <span className="text-white-force text-sm opacity-60">
                                      ({data.percentage.toFixed(1)}%)
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 추천사항 */}
                          <div>
                            <h5 className="text-white-force font-semibold text-sm mb-token-sm">AI 추천사항</h5>
                            <div className="space-y-token-sm">
                              {patternAnalysis.recommendations.map((recommendation, index) => (
                                <div key={index} className="flex items-start gap-token-sm p-token-sm bg-white/5 rounded-lg">
                                  <Lightbulb size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                                  <p className="text-white-force text-sm leading-relaxed">{recommendation}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-token-md">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                          <Dumbbell className="text-white text-2xl" size={24} />
                        </div>
                        <div>
                          <p className="text-white-force text-lg-ko font-semibold">패턴 분석 준비 완료</p>
                          <p className="text-white-force text-sm-ko opacity-60">
                            구독 데이터를 분석하여 패턴을 파악합니다.
                          </p>
                        </div>
                        <WaveButton
                          variant="primary"
                          onClick={runPatternAnalysis}
                          className="shadow-lg shadow-primary-500/20 wave-button-primary-enhanced"
                        >
                          <Dumbbell size={16} className="mr-token-xs" />
                          패턴 분석 시작
                        </WaveButton>
                      </div>
                    )}
                  </GlassCard>
                </div>
              )}


            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
} 