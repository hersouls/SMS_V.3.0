import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { GlassCard } from './GlassCard';
import { WaveButton } from './WaveButton';
import { WaveBackground } from './WaveBackground';
import { AppContext } from '../App';
import {
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  RefreshCw,
  Download,
  Share2,
  Settings,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  DollarSign,
  CreditCard,
  ShoppingCart,
  Music,
  Video,
  Gamepad2,
  BookOpen,
  Coffee,
  Car,
  Plane,
  Train,
  Bus,
  Bike,
  Walking,
  Home,
  Building,
  Store,
  ShoppingBag,
  Gift,
  Heart,
  Star,
  Zap,
  Target,
  Award,
  Trophy,
  Medal,
  Crown,
  Flag,
  MapPin,
  Globe,
  Wifi,
  Signal,
  Battery,
  Power,
  Lightbulb,
  Flame,
  Snowflake,
  Cloud,
  Sun,
  Moon,
  Star as StarIcon,
  Heart as HeartIcon,
  Zap as ZapIcon,
  Target as TargetIcon,
  Award as AwardIcon,
  Trophy as TrophyIcon,
  Medal as MedalIcon,
  Crown as CrownIcon,
  Flag as FlagIcon,
  MapPin as MapPinIcon,
  Globe as GlobeIcon,
  Wifi as WifiIcon,
  Signal as SignalIcon,
  Battery as BatteryIcon,
  Power as PowerIcon,
  Lightbulb as LightbulbIcon,
  Flame as FlameIcon,
  Snowflake as SnowflakeIcon,
  Cloud as CloudIcon,
  Sun as SunIcon,
  Moon as MoonIcon
} from 'lucide-react';
import { cn } from './ui/utils';
import {
  getUserStatisticsDashboard,
  getCategoryStatistics,
  getMonthlySpendingTrends,
  generateStatisticsReport,
  exportStatisticsToCSV,
  clearStatisticsCache,
  CategoryAnalytics,
  MonthlySpendingTrends
} from '../utils/statistics';
import {
  loadMockDataFromDatabase,
  initializeMockData
} from '../utils/mockData';

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

export function StatisticsDashboard() {
  const context = useContext(AppContext);
  
  if (!context) {
    return (
      <div className="min-h-screen relative">
        <WaveBackground />
        <Header />
        <main className="pt-28 pb-token-xl px-token-md relative z-10">
          <div className="max-w-7xl mx-auto">
            <GlassCard variant="light" className="p-token-2xl backdrop-blur-xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-token-md animate-pulse">
                  <Lock className="text-white text-2xl" />
                </div>
                <h2 className="text-white-force text-xl-ko font-semibold mb-token-md">
                  로딩 중...
                </h2>
                <p className="text-white-force text-sm-ko opacity-60">
                  데이터를 불러오는 중입니다.
                </p>
              </div>
            </GlassCard>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  const { user } = context;
  const [statisticsData, setStatisticsData] = useState<StatisticsData | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryAnalytics[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlySpendingTrends[]>([]);
  const [statisticsReport, setStatisticsReport] = useState<StatisticsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedView, setSelectedView] = useState<'overview' | 'categories' | 'trends' | 'details' | 'report'>('overview');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [useRealData, setUseRealData] = useState(false);
  const [animateCards, setAnimateCards] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 통계 데이터 로드
  useEffect(() => {
    if (user) {
      loadStatisticsData();
    }
  }, [user, dateRange, useRealData]);

  // 카드 애니메이션 효과
  useEffect(() => {
    if (!loading && statisticsData) {
      setAnimateCards(true);
      const timer = setTimeout(() => setAnimateCards(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, statisticsData]);

  const loadStatisticsData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      let dashboardData: StatisticsData | null = null;
      let categoryData: CategoryAnalytics[] = [];
      let trendsData: MonthlySpendingTrends[] = [];
      let reportData: StatisticsReport | null = null;

      if (useRealData) {
        // 실제 데이터베이스에서 데이터 로드
        try {
          const realData = await getUserStatisticsDashboard(user.id, dateRange);
          if (realData && realData.length > 0) {
            const latestData = realData[0];
            dashboardData = {
              total_spend_krw: latestData.total_spend_krw || 0,
              active_subscriptions: latestData.active_subscriptions || 0,
              new_subscriptions: latestData.new_subscriptions || 0,
              cancelled_subscriptions: latestData.cancelled_subscriptions || 0,
              category_breakdown: latestData.category_breakdown || {},
              currency_breakdown: latestData.currency_breakdown || {},
              category_monthly_spend: latestData.category_monthly_spend || 0,
              category_subscription_count: latestData.category_subscription_count || 0,
              cycle_monthly_spend: latestData.cycle_monthly_spend || 0,
              cycle_subscription_count: latestData.cycle_subscription_count || 0,
              notifications_sent: latestData.notifications_sent || 0,
              response_rate: latestData.response_rate || 0,
              login_count: latestData.login_count || 0,
              session_duration_minutes: latestData.session_duration_minutes || 0,
              engagement_score: latestData.engagement_score || 0
            };
          }

          categoryData = await getCategoryStatistics(user.id);
          trendsData = await getMonthlySpendingTrends(user.id, new Date().getFullYear());
          reportData = await generateStatisticsReport(user.id, dateRange);
        } catch (error) {
          console.warn('실제 데이터 로드 실패, 가상 데이터 사용:', error);
          setUseRealData(false);
          
          // 에러 메시지 표시
          setError('실제 데이터를 불러올 수 없어 가상 데이터를 사용합니다.');
          
          // 가상 데이터로 즉시 전환
          const mockData = initializeMockData();
          
          dashboardData = {
            total_spend_krw: mockData.monthlySpendingTrends[11]?.total_spend_krw || 150000,
            active_subscriptions: mockData.subscriptions.filter((s: any) => s.status === 'active').length,
            new_subscriptions: Math.floor(Math.random() * 3) + 1,
            cancelled_subscriptions: mockData.subscriptions.filter((s: any) => s.status === 'cancelled').length,
            category_breakdown: mockData.categoryAnalytics.reduce((acc: any, cat: any) => {
              acc[cat.category] = cat.total_monthly_krw;
              return acc;
            }, {} as Record<string, number>),
            currency_breakdown: {
              KRW: mockData.subscriptions.filter((s: any) => s.currency === 'KRW').length,
              USD: mockData.subscriptions.filter((s: any) => s.currency === 'USD').length
            },
            category_monthly_spend: mockData.categoryAnalytics[0]?.total_monthly_krw || 0,
            category_subscription_count: mockData.categoryAnalytics[0]?.subscription_count || 0,
            cycle_monthly_spend: mockData.paymentCycleAnalytics[0]?.total_monthly_krw || 0,
            cycle_subscription_count: mockData.paymentCycleAnalytics[0]?.subscription_count || 0,
            notifications_sent: mockData.notificationAnalytics.notifications_sent,
            response_rate: mockData.notificationAnalytics.response_rate,
            login_count: mockData.userBehaviorAnalytics.login_count,
            session_duration_minutes: mockData.userBehaviorAnalytics.session_duration_minutes,
            engagement_score: mockData.userBehaviorAnalytics.engagement_score
          };

          categoryData = mockData.categoryAnalytics;
          trendsData = mockData.monthlySpendingTrends;
          
          // 가상 리포트 생성
          reportData = {
            summary: {
              totalSpend: dashboardData.total_spend_krw,
              averageSpend: dashboardData.total_spend_krw / 12,
              activeSubscriptions: dashboardData.active_subscriptions,
              topCategory: Object.keys(dashboardData.category_breakdown)[0] || '',
              topCategorySpend: Object.values(dashboardData.category_breakdown)[0] || 0,
              growthRate: 5.2
            },
            trends: {
              spendingTrend: 'increasing' as const,
              subscriptionGrowth: 2,
              categoryDistribution: dashboardData.category_breakdown
            },
            insights: [
              '엔터테인먼트 카테고리에 지출이 집중되어 있습니다.',
              '월 평균 지출이 안정적으로 유지되고 있습니다.',
              '새로운 구독 추가를 고려해보세요.'
            ]
          };
        }
      }

      if (!dashboardData) {
        // 가상 데이터 사용
        const mockData = initializeMockData();
        
        dashboardData = {
          total_spend_krw: mockData.monthlySpendingTrends[11]?.total_spend_krw || 150000,
          active_subscriptions: mockData.subscriptions.filter((s: any) => s.status === 'active').length,
          new_subscriptions: Math.floor(Math.random() * 3) + 1,
          cancelled_subscriptions: mockData.subscriptions.filter((s: any) => s.status === 'cancelled').length,
          category_breakdown: mockData.categoryAnalytics.reduce((acc: any, cat: any) => {
            acc[cat.category] = cat.total_monthly_krw;
            return acc;
          }, {} as Record<string, number>),
          currency_breakdown: {
            KRW: mockData.subscriptions.filter((s: any) => s.currency === 'KRW').length,
            USD: mockData.subscriptions.filter((s: any) => s.currency === 'USD').length
          },
          category_monthly_spend: mockData.categoryAnalytics[0]?.total_monthly_krw || 0,
          category_subscription_count: mockData.categoryAnalytics[0]?.subscription_count || 0,
          cycle_monthly_spend: mockData.paymentCycleAnalytics[0]?.total_monthly_krw || 0,
          cycle_subscription_count: mockData.paymentCycleAnalytics[0]?.subscription_count || 0,
          notifications_sent: mockData.notificationAnalytics.notifications_sent,
          response_rate: mockData.notificationAnalytics.response_rate,
          login_count: mockData.userBehaviorAnalytics.login_count,
          session_duration_minutes: mockData.userBehaviorAnalytics.session_duration_minutes,
          engagement_score: mockData.userBehaviorAnalytics.engagement_score
        };

        categoryData = mockData.categoryAnalytics;
        trendsData = mockData.monthlySpendingTrends;
        
        // 가상 리포트 생성
        reportData = {
          summary: {
            totalSpend: dashboardData.total_spend_krw,
            averageSpend: dashboardData.total_spend_krw / 12,
            activeSubscriptions: dashboardData.active_subscriptions,
            topCategory: Object.keys(dashboardData.category_breakdown)[0] || '',
            topCategorySpend: Object.values(dashboardData.category_breakdown)[0] || 0,
            growthRate: 5.2
          },
          trends: {
            spendingTrend: 'increasing' as const,
            subscriptionGrowth: 2,
            categoryDistribution: dashboardData.category_breakdown
          },
          insights: [
            '엔터테인먼트 카테고리에 지출이 집중되어 있습니다.',
            '월 평균 지출이 안정적으로 유지되고 있습니다.',
            '새로운 구독 추가를 고려해보세요.'
          ]
        };
      }

      setStatisticsData(dashboardData);
      setCategoryStats(categoryData);
      setMonthlyTrends(trendsData);
      setStatisticsReport(reportData);
    } catch (error) {
      console.error('통계 데이터 로드 실패:', error);
      setError('통계 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const refreshStatistics = async () => {
    setRefreshing(true);
    setError(null);
    
    try {
      if (useRealData) {
        clearStatisticsCache();
      }
      await loadStatisticsData();
      console.log('통계 데이터가 성공적으로 새로고침되었습니다.');
    } catch (error) {
      console.error('통계 새로고침 실패:', error);
      setError('통계 데이터 새로고침에 실패했습니다.');
    } finally {
      setRefreshing(false);
    }
  };

  const exportCSV = async () => {
    if (!user) return;

    try {
      const csvContent = await exportStatisticsToCSV(user.id, dateRange);
      if (csvContent) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `statistics_${dateRange.start}_${dateRange.end}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('CSV 내보내기 실패:', error);
      setError('CSV 내보내기 중 오류가 발생했습니다.');
    }
  };

  const getTrendIcon = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="text-emerald-500 drop-shadow-lg" size={20} />;
      case 'decreasing':
        return <TrendingDown className="text-red-500 drop-shadow-lg" size={20} />;
      case 'stable':
        return <Equal className="text-blue-500 drop-shadow-lg" size={20} />;
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
      '엔터테인먼트': <Tv className="text-purple-400" size={20} />,
      '음악': <Music className="text-pink-400" size={20} />,
      '개발': <Code className="text-blue-400" size={20} />,
      'AI': <Brain className="text-cyan-400" size={20} />,
      '디자인': <Palette className="text-orange-400" size={20} />,
      '생산성': <Zap className="text-yellow-400" size={20} />,
      '교육': <BookOpen className="text-green-400" size={20} />,
      '피트니스': <Dumbbell className="text-red-400" size={20} />,
      '게임': <Gamepad2 className="text-indigo-400" size={20} />
    };
    return icons[category as keyof typeof icons] || <Circle className="text-gray-400" size={20} />;
  };



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
                  <Lock className="text-white text-2xl" />
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

  // 에러 상태 처리
  if (error) {
    return (
      <div className="min-h-screen relative">
        <WaveBackground />
        <Header />
        <main className="pt-28 pb-token-xl px-token-md relative z-10">
          <div className="max-w-7xl mx-auto">
            <GlassCard variant="light" className="p-token-2xl backdrop-blur-xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="text-white text-2xl" />
                </div>
                <h2 className="text-white-force text-xl-ko font-semibold mb-token-md">
                  오류가 발생했습니다
                </h2>
                <p className="text-white-force text-sm-ko opacity-60 mb-token-md">
                  {error}
                </p>
                <WaveButton
                  variant="primary"
                  onClick={() => {
                    setError(null);
                    loadStatisticsData();
                  }}
                  className="mt-token-md"
                >
                  다시 시도
                </WaveButton>
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
                disabled={loading}
                className="shadow-lg shadow-primary-500/20 wave-button-primary-enhanced"
              >
                <RefreshCw size={16} className={cn("mr-token-xs", loading && "animate-spin")} />
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
              { key: 'report', label: '리포트', icon: BarChart, color: 'from-indigo-500 to-purple-500' }
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
          {loading && (
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
          {error && (
            <GlassCard variant="strong" className="p-token-2xl backdrop-blur-xl">
              <div className="text-center space-y-token-md">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle size={32} className="text-white" />
                </div>
                <div className="space-y-token-sm">
                  <p className="text-white-force text-lg-ko font-semibold">오류가 발생했습니다</p>
                  <p className="text-white-force text-sm-ko opacity-60">{error}</p>
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
          {!loading && !error && statisticsData && (
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
                        {statisticsData.total_spend_krw.toLocaleString()}원
                      </p>
                    </GlassCard>

                    <GlassCard variant="light" className="p-token-lg hover-card-subtle transition-smooth transform-gpu will-change-transform">
                      <div className="flex items-center gap-token-sm mb-token-sm">
                        <Users className="text-blue-400" size={20} />
                        <h3 className="text-white-force font-semibold">활성 구독</h3>
                      </div>
                      <p className="text-white-force text-xl-ko font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        {statisticsData.active_subscriptions}개
                      </p>
                    </GlassCard>

                    <GlassCard variant="light" className="p-token-lg hover-card-subtle transition-smooth transform-gpu will-change-transform">
                      <div className="flex items-center gap-token-sm mb-token-sm">
                        <Plus className="text-purple-400" size={20} />
                        <h3 className="text-white-force font-semibold">새 구독</h3>
                      </div>
                      <p className="text-white-force text-xl-ko font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {statisticsData.new_subscriptions}개
                      </p>
                    </GlassCard>

                    <GlassCard variant="light" className="p-token-lg hover-card-subtle transition-smooth transform-gpu will-change-transform">
                      <div className="flex items-center gap-token-sm mb-token-sm">
                        <Activity className="text-orange-400" size={20} />
                        <h3 className="text-white-force font-semibold">참여도</h3>
                      </div>
                      <p className="text-white-force text-xl-ko font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                        {Math.round(statisticsData.engagement_score)}점
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
                        {statisticsData.session_duration_minutes}분
                      </p>
                    </GlassCard>

                    <GlassCard variant="light" className="p-token-lg hover-card-subtle transition-smooth transform-gpu will-change-transform">
                      <div className="flex items-center gap-token-sm mb-token-sm">
                        <AlertCircle className="text-orange-400" size={20} />
                        <h3 className="text-white-force font-semibold">알림 전송</h3>
                      </div>
                      <p className="text-white-force text-xl-ko font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                        {statisticsData.notifications_sent}개
                      </p>
                      <p className="text-white/60 text-sm">
                        응답률: {statisticsData.response_rate.toFixed(1)}%
                      </p>
                    </GlassCard>

                    <GlassCard variant="light" className="p-token-lg hover-card-subtle transition-smooth transform-gpu will-change-transform">
                      <div className="flex items-center gap-token-sm mb-token-sm">
                        <Users className="text-green-400" size={20} />
                        <h3 className="text-white-force font-semibold">로그인</h3>
                      </div>
                      <p className="text-white-force text-xl-ko font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        {statisticsData.login_count}회
                      </p>
                    </GlassCard>
                  </div>
                </div>
              )}

              {/* 카테고리 섹션 */}
              {selectedView === 'categories' && (
                <div className="space-y-token-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-token-lg">
                    {Object.entries(statisticsData.category_breakdown).map(([category, amount], index) => (
                      <GlassCard 
                        key={`category-${category}-${index}-${amount}`} 
                        variant="light" 
                        className={cn(
                          "p-token-lg hover-card-subtle transition-smooth transform-gpu will-change-transform",
                          animateCards && "fade-in-up"
                        )}
                      >
                        <div className="flex items-center justify-between mb-token-sm">
                          <div className="flex items-center gap-token-sm">
                            {getCategoryIcon(category)}
                            <h3 className="text-white-force font-semibold">{category}</h3>
                          </div>
                          <div className="w-8 h-8 bg-gradient-to-r from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
                            <PieChart size={16} className="text-white" />
                          </div>
                        </div>
                        <p className="text-white-force text-xl-ko font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                          {amount.toLocaleString()}원
                        </p>
                        <div className="mt-token-sm space-y-token-xs">
                          <div className="flex justify-between text-sm">
                            <span className="text-white/60">비중</span>
                            <span className="text-white-force font-semibold">
                              {((amount / statisticsData.total_spend_krw) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-white/20 backdrop-blur-sm rounded-full h-3 shadow-inner">
                            <div 
                              className="h-3 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500 shadow-lg"
                              style={{ width: `${(amount / statisticsData.total_spend_krw) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </div>
              )}

              {/* 트렌드 섹션 */}
              {selectedView === 'trends' && (
                <div className="space-y-token-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-token-lg">
                    <GlassCard variant="light" className="p-token-lg hover-card-subtle transition-smooth transform-gpu will-change-transform">
                      <div className="flex items-center gap-token-sm mb-token-md">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg">
                          <TrendingUp className="text-white w-4 h-4" />
                        </div>
                        <h3 className="text-white-force font-semibold">월별 트렌드</h3>
                      </div>
                      <div className="space-y-token-sm">
                        {monthlyTrends.slice(-6).map((trend, index) => (
                          <div key={index} className="flex items-center justify-between p-token-sm bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-200">
                            <span className="text-white-force text-sm">
                              {trend.year}년 {trend.month}월
                            </span>
                            <div className="flex items-center gap-token-xs">
                              <span className="text-white-force font-semibold">
                                {trend.total_spend_krw.toLocaleString()}원
                              </span>
                              {getTrendIcon(trend.trend_direction || 'stable')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </GlassCard>

                    <GlassCard variant="light" className="p-token-lg hover-card-subtle transition-smooth transform-gpu will-change-transform">
                      <div className="flex items-center gap-token-sm mb-token-md">
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                          <Coins className="text-white w-4 h-4" />
                        </div>
                        <h3 className="text-white-force font-semibold">통화별 분포</h3>
                      </div>
                      <div className="space-y-token-sm">
                        {Object.entries(statisticsData.currency_breakdown).map(([currency, count]) => (
                          <div key={currency} className="flex items-center justify-between p-token-sm bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-200">
                            <div className="flex items-center gap-token-sm">
                              <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full shadow-sm"></div>
                              <span className="text-white-force text-sm">{currency}</span>
                            </div>
                            <span className="text-white-force font-semibold">{count}개</span>
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  </div>
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
                        {statisticsData.session_duration_minutes}분
                      </p>
                      <div className="mt-token-sm">
                        <div className="w-full bg-white/20 backdrop-blur-sm rounded-full h-3 shadow-inner">
                          <div 
                            className="h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full shadow-lg"
                            style={{ width: `${Math.min((statisticsData.session_duration_minutes / 60) * 100, 100)}%` }}
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
                        {statisticsData.notifications_sent}개
                      </p>
                      <p className="text-white/60 text-sm">
                        응답률: {statisticsData.response_rate.toFixed(1)}%
                      </p>
                    </GlassCard>

                    <GlassCard variant="light" className="p-token-lg backdrop-blur-sm">
                      <div className="flex items-center gap-token-sm mb-token-sm">
                        <Users size={20} className="text-green-400" />
                        <h3 className="text-white-force font-semibold">로그인</h3>
                      </div>
                      <p className="text-white-force text-xl-ko font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        {statisticsData.login_count}회
                      </p>
                    </GlassCard>
                  </div>

                  <div className="flex justify-center">
                    <WaveButton
                      variant="secondary"
                      onClick={exportCSV}
                      className="shadow-lg wave-button-secondary-enhanced"
                    >
                      <Download size={16} className="mr-token-xs" />
                      CSV 내보내기
                    </WaveButton>
                  </div>
                </div>
              )}

              {/* 리포트 섹션 */}
              {selectedView === 'report' && statisticsReport && (
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
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
} 