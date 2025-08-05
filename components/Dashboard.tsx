import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { GlassCard } from './GlassCard';
import { WaveButton } from './WaveButton';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useImprovedRealtimeStats } from '../hooks/useImprovedRealtimeStats';
import { StatisticsErrorFallback, StatisticsEmptyState, StatisticsLoadingState } from './StatisticsErrorFallback';
import { 
  Plus, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  PauseCircle,
  XCircle,
  ArrowUpRight,
  Settings,
  Archive,
  BarChart3,
  Bell,
  Activity,
  RefreshCw,
  List,
  PieChart,
  Sparkles,
  DollarSign,
  Star
} from 'lucide-react';
import { getPhaseColors, PhaseType } from '../utils/phaseColors';
import { cn } from './ui/utils';


export function Dashboard() {
  const { user } = useAuth();
  const { subscriptions, preferences, loading: dataLoading } = useData();
  const { stats, loading: statsLoading, error: statsError, refresh: refreshStats } = useImprovedRealtimeStats();
  
  // 모든 useState 훅들을 최상단으로 이동
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [monthlyBudget] = useState(500000); // 기본 월간 예산 50만원
  
  // Debug logging
  console.log('🏠 Dashboard render:', {
    subscriptionsCount: subscriptions?.length || 0,
    hasSubscriptions: (subscriptions?.length || 0) > 0,
    preferences,
    firstSubscription: subscriptions?.[0],
    dataLoading,
    statsLoading
  });
  
  const isLoading = dataLoading || statsLoading;
  
  // 통계 에러 처리
  if (statsError && !stats) {
    return (
      <div className="min-h-screen bg-background dark">
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center">
          <StatisticsErrorFallback 
            error={statsError}
            onRetry={refreshStats}
            showDetails={true}
          />
        </div>
        <Footer />
      </div>
    );
  }
  
  // 데이터가 없는 경우
  if (!isLoading && (!subscriptions || subscriptions.length === 0)) {
    return (
      <div className="min-h-screen bg-background dark">
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center">
          <StatisticsEmptyState 
            onAddSubscription={() => window.location.href = '/subscriptions/new'}
          />
        </div>
        <Footer />
      </div>
    );
  }
  
  // 초기 로딩 중이면 로딩 화면 표시
  if (isLoading && !subscriptions?.length) {
    return (
      <div className="min-h-screen bg-background dark">
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center">
          <StatisticsLoadingState />
        </div>
        <Footer />
      </div>
    );
  }
  


  // 중복 제거 함수
  const getUniqueSubscriptions = () => {
    // Safety check for subscriptions array
    if (!subscriptions || !Array.isArray(subscriptions)) {
      return [];
    }
    
    const seen = new Set();
    const uniqueSubs = subscriptions.filter(sub => {
      // id와 serviceName을 조합한 고유 키 생성
      const key = `${sub.id}-${sub.serviceName}`;
      if (seen.has(key)) {
        console.log('중복 구독 제거:', sub.serviceName, sub.id);
        return false;
      }
      seen.add(key);
      return true;
    });
    
    console.log('원본 구독 수:', subscriptions.length);
    console.log('중복 제거 후 구독 수:', uniqueSubs.length);
    
    return uniqueSubs;
  };

  // Refresh 함수
  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await refreshStats();
      console.log('✅ Dashboard 데이터 새로고침 완료');
    } catch (error) {
      console.error('❌ Dashboard 데이터 새로고침 실패:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // 필요한 헬퍼 함수들만 유지
  const getUniqueCategories = () => {
    if (!subscriptions || !Array.isArray(subscriptions)) return ['all'];
    const categories = subscriptions.map(sub => sub.category);
    const uniqueCategories = Array.from(new Set(categories));
    return ['all', ...uniqueCategories];
  };

  const getRecentSubscriptions = () => {
    if (!subscriptions || !Array.isArray(subscriptions)) return [];
    return [...subscriptions]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5);
  };

  const getUpcomingPayments = () => {
    if (!subscriptions || !Array.isArray(subscriptions)) return [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    return subscriptions
      .filter(sub => sub.status === 'active')
      .map(sub => {
        const paymentDate = new Date(currentYear, currentMonth, sub.paymentDay);
        if (paymentDate < now) {
          paymentDate.setMonth(paymentDate.getMonth() + 1);
        }
        const daysUntil = Math.ceil((paymentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          ...sub,
          nextPaymentDate: paymentDate,
          daysUntil
        };
      })
      .filter(sub => sub.daysUntil <= 7 && sub.daysUntil >= 0)
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 5);
  };

  const getCategoryBreakdown = () => {
    if (!subscriptions || !Array.isArray(subscriptions) || !stats?.categoryBreakdown) return [];
    return Object.entries(stats.categoryBreakdown)
      .map(([category, data]) => ({
        category,
        count: data.count,
        monthlyAmount: data.monthlyAmount || 0
      }))
      .sort((a, b) => b.monthlyAmount - a.monthlyAmount)
      .slice(0, 5);
  };


  // Category mapping with phase colors
  const getCategoryPhase = (category: string): PhaseType => {
    const categoryPhaseMap: Record<string, PhaseType> = {
      '엔터테인먼트': 'shine',
      '음악': 'growth',
      '개발': 'challenge',
      'AI': 'challenge',
      '디자인': 'growth',
      '생산성': 'beginning',
      '교육': 'beginning',
      '피트니스': 'challenge',
      '뉴스': 'beginning',
      '게임': 'shine',
      '기타': 'beginning'
    };
    return categoryPhaseMap[category] || 'beginning';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={16} className="icon-enhanced" strokeWidth={1.5} />;
      case 'paused':
        return <PauseCircle size={16} className="icon-enhanced" strokeWidth={1.5} />;
      case 'cancelled':
        return <XCircle size={16} className="icon-enhanced" strokeWidth={1.5} />;
      default:
        return <Clock size={16} className="icon-enhanced" strokeWidth={1.5} />;
    }
  };



  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('ko-KR') + '원';
  };


  const recentSubscriptions = getRecentSubscriptions();
  const upcomingPayments = getUpcomingPayments();
  const categoryBreakdown = getCategoryBreakdown();

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header */}
      <Header />

      {/* Body */}
      <main className="pt-28 pb-token-xl px-token-md">
        <div className="max-w-7xl mx-auto space-y-token-xl">

          {/* Enhanced Page Header */}
          <div className="flex items-center justify-end">
            <div className="flex items-center space-x-token-sm">
              <WaveButton
                variant="glass"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="hidden md:flex wave-button-glass-enhanced hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200 text-white-force font-medium touch-target"
                aria-label={isRefreshing ? "데이터 새로고침 중..." : "데이터 새로고침"}
              >
                <RefreshCw size={16} className={cn("mr-token-xs icon-enhanced", isRefreshing && "animate-spin")} strokeWidth={1.5} />
                새로고침
              </WaveButton>

              <Link to="/subscriptions/new">
                <WaveButton variant="primary" className="shadow-lg shadow-primary-500/20 wave-button-primary-enhanced hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200 text-white-force font-semibold touch-target">
                  <Plus size={16} className="mr-token-xs icon-enhanced" strokeWidth={1.5} />
                  새 구독 추가
                </WaveButton>
              </Link>
            </div>
          </div>

          {/* Enhanced Statistics Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-token-lg">
            {/* Total Spend KRW */}
            <GlassCard variant="strong" className="p-token-lg group hover:bg-white/30 hover:border-white/40 hover:translate-y-[-2px] hover:shadow-xl transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-white/50 active:scale-95">
              <div className="flex items-center justify-between mb-token-sm">
                <div className="p-token-sm rounded-lg transition-colors">
                  <DollarSign size={20} className="icon-enhanced" strokeWidth={1.5} />
                </div>
                {/* 월간 트렌드는 현재 계산되지 않으므로 제거 */}
              </div>
              <div>
                <p className="text-white-force/60 text-sm-ko mb-1">총 지출 (KRW)</p>
                <p className="text-3xl font-bold text-white-force group-hover:text-primary-300 transition-colors">
                  {formatCurrency(stats?.totalMonthlyKrw || 0)}
                </p>
                <p className="text-xs text-white-force/50 mt-1">
                  이번 달 기준
                </p>
              </div>
            </GlassCard>

            {/* Active Subscriptions */}
            <GlassCard variant="strong" className="p-token-lg group hover:bg-white/30 hover:border-white/40 hover:translate-y-[-2px] hover:shadow-xl transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-white/50 active:scale-95">
              <div className="flex items-center justify-between mb-token-sm">
                <div className="p-token-sm rounded-lg transition-colors">
                  <Activity size={20} className="icon-enhanced" strokeWidth={1.5} />
                </div>
                <div className="flex items-center space-x-1 text-xs text-green-400">
                  <CheckCircle size={12} className="icon-enhanced" strokeWidth={1.5} />
                  <span>활성</span>
                </div>
              </div>
              <div>
                <p className="text-white-force/60 text-sm-ko mb-1">활성 구독</p>
                <p className="text-3xl font-bold text-white-force group-hover:text-white/80 transition-colors">
                  {stats?.activeSubscriptions || 0}개
                </p>
                <p className="text-xs text-white-force/50 mt-1">
                  총 {stats?.totalSubscriptions || 0}개 중
                </p>
              </div>
            </GlassCard>

            {/* New Subscriptions */}
            <GlassCard variant="strong" className="p-token-lg group hover:bg-white/30 hover:border-white/40 hover:translate-y-[-2px] hover:shadow-xl transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-white/50 active:scale-95">
              <div className="flex items-center justify-between mb-token-sm">
                <div className="p-token-sm rounded-lg transition-colors">
                  <Plus size={20} className="icon-enhanced" strokeWidth={1.5} />
                </div>
                <div className="flex items-center space-x-1 text-xs text-primary-400">
                  <TrendingUp size={12} className="icon-enhanced" strokeWidth={1.5} />
                  <span>신규</span>
                </div>
              </div>
              <div>
                <p className="text-white-force/60 text-sm-ko mb-1">신규 구독</p>
                <p className="text-3xl font-bold text-white-force group-hover:text-primary-300 transition-colors">
                  {(subscriptions || []).filter(sub => {
                    const createdDate = new Date(sub.createdAt || new Date());
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    return createdDate >= thirtyDaysAgo;
                  }).length}개
                </p>
                <p className="text-xs text-white-force/50 mt-1">
                  최근 30일
                </p>
              </div>
            </GlassCard>

            {/* Cancelled Subscriptions */}
            <GlassCard variant="strong" className="p-token-lg group hover:bg-white/30 hover:border-white/40 hover:translate-y-[-2px] hover:shadow-xl transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-white/50 active:scale-95">
              <div className="flex items-center justify-between mb-token-sm">
                <div className="p-token-sm rounded-lg transition-colors">
                  <XCircle size={20} className="icon-enhanced" strokeWidth={1.5} />
                </div>
                <div className="flex items-center space-x-1 text-xs text-red-400">
                  <AlertCircle size={12} className="icon-enhanced" strokeWidth={1.5} />
                  <span>해지</span>
                </div>
              </div>
              <div>
                <p className="text-white-force/60 text-sm-ko mb-1">해지된 구독</p>
                <p className="text-3xl font-bold text-white-force group-hover:text-error-300 transition-colors">
                  {(subscriptions || []).filter(sub => sub.status === 'cancelled').length}개
                </p>
                <p className="text-xs text-white-force/50 mt-1">
                  전체 구독 대비
                </p>
              </div>
            </GlassCard>

            {/* Engagement Score */}
            <GlassCard variant="strong" className="p-token-lg group hover:bg-white/30 hover:border-white/40 hover:translate-y-[-2px] hover:shadow-xl transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-white/50 active:scale-95">
              <div className="flex items-center justify-between mb-token-sm">
                <div className="p-token-sm rounded-lg transition-colors">
                  <BarChart3 size={20} className="icon-enhanced" strokeWidth={1.5} />
                </div>
                {(() => {
                  const activeSubs = stats?.activeSubscriptions || 0;
                  const totalSubs = stats?.totalSubscriptions || 1;
                  const engagementScore = Math.min(100, Math.max(0, (activeSubs / Math.max(totalSubs, 1)) * 100));
                  if (engagementScore >= 80) return <div className="flex items-center space-x-1 text-xs text-green-400"><Star size={12} className="icon-enhanced" strokeWidth={1.5} /><span>우수</span></div>;
                  if (engagementScore >= 60) return <div className="flex items-center space-x-1 text-xs text-yellow-400"><CheckCircle size={12} className="icon-enhanced" strokeWidth={1.5} /><span>양호</span></div>;
                  return <div className="flex items-center space-x-1 text-xs text-red-400"><AlertCircle size={12} className="icon-enhanced" strokeWidth={1.5} /><span>개선</span></div>;
                })()}
              </div>
              <div>
                <p className="text-white-force/60 text-sm-ko mb-1">참여도 점수</p>
                <p className="text-3xl font-bold text-white-force group-hover:text-blue-300 transition-colors">
                  {Math.min(100, Math.max(0, ((stats?.activeSubscriptions || 0) / Math.max(stats?.totalSubscriptions || 1, 1)) * 100)).toFixed(1)}%
                </p>
                <p className="text-xs text-white-force/50 mt-1">
                  활성 구독 비율
                </p>
              </div>
            </GlassCard>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-token-xl">
            
            {/* Recent Subscriptions */}
            <div className="xl:col-span-2">
              <GlassCard variant="strong" className="p-token-lg hover:bg-white/30 hover:border-white/40 hover:translate-y-[-2px] hover:shadow-xl transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-white/50 active:scale-95">
                <div className="flex items-center justify-between mb-token-lg">
                  <div className="flex items-center space-x-token-sm">
                    <div className="p-token-sm rounded-lg">
                      <Archive size={20} className="icon-enhanced" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h2 className="text-2xl-ko font-semibold text-white-force break-keep-ko">최근 구독</h2>
                      <p className="text-white-force/60 text-sm-ko break-keep-ko text-high-contrast">최신 등록된 서비스들</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-token-sm">
                    {/* Category Filter */}
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-token-sm py-1 bg-white/5 border border-white/10 rounded text-white-force text-sm-ko focus:outline-none focus:ring-2 focus:ring-white/50 hover:bg-white/10 hover:border-white/20 transition-all duration-300 break-keep-ko touch-target"
                    >
                      {getUniqueCategories().map((category, index) => (
                        <option key={category + '-' + index} value={category} className="bg-gray-800">
                          {category === 'all' ? '전체' : category}
                        </option>
                      ))}
                    </select>

                    <Link to="/subscriptions">
                      <WaveButton variant="secondary" size="sm" className="text-white-force font-medium border border-white/30 hover:bg-white/20 hover:border-white/50 hover:translate-y-[-2px] hover:shadow-xl transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-white/50 active:scale-95 touch-target">
                        <List size={14} className="mr-1 icon-enhanced" strokeWidth={1.5} />
                        전체
                      </WaveButton>
                    </Link>
                  </div>
                </div>

                <div className="space-y-token-sm">
                  {recentSubscriptions.length > 0 ? (
                    recentSubscriptions.map((subscription, index) => {
                      const phaseColors = getPhaseColors(getCategoryPhase(subscription.category));
                      
                      return (
                        <Link key={subscription.id + '-' + index} to={`/subscriptions/${subscription.id}`}>
                          <div className="flex items-center justify-between p-token-md glass-light rounded-lg border border-white/10 hover:bg-white/30 hover:border-white/40 hover:translate-y-[-2px] hover:shadow-xl transition-all duration-300 group cursor-pointer hover:scale-105 focus:ring-2 focus:ring-white/50 active:scale-95 keyboard-navigation">
                            <div className="flex items-center space-x-token-md">
                              <div className={cn(
                                "w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold shadow-lg border border-white/20",
                                phaseColors.bg
                              )}>
                                {subscription.logoImage ? (
                                  <img 
                                    src={subscription.logoImage} 
                                    alt={subscription.serviceName}
                                    className="w-8 h-8 rounded-lg object-cover"
                                  />
                                ) : (
                                  subscription.logo || subscription.serviceName.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div>
                                <div className="flex items-center space-x-token-xs mb-1">
                                  <h3 className="font-medium text-white group-hover:text-primary-300 transition-colors break-keep-ko">
                                    {subscription.serviceName}
                                  </h3>
                                  {getStatusIcon(subscription.status)}
                                </div>
                                <div className="flex items-center space-x-2 text-sm-ko text-white-force/60">
                                  <span className={cn("w-2 h-2 rounded-full", phaseColors.bg)}></span>
                                  <span className="break-keep-ko">{subscription.category}</span>
                                  {subscription.tier && (
                                    <>
                                      <span>•</span>
                                      <span className="break-keep-ko">{subscription.tier}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="flex items-center space-x-2">
                                <div className="text-right">
                                  <p className="text-sm-ko font-medium text-white-force">
                                    {formatCurrency(subscription.currency === 'USD' ? subscription.amount * (preferences?.exchangeRate || 1) : subscription.amount)}
                                  </p>
                                  <p className="text-xs text-white-force/60">
                                    {subscription.paymentCycle === 'monthly' ? '월간' : 
                                     subscription.paymentCycle === 'yearly' ? '연간' : '일회성'}
                                  </p>
                                </div>
                                <ArrowUpRight size={16} className="text-white-force/40 group-hover:text-white-force/60 transition-colors" strokeWidth={1.5} />
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    <div className="text-center py-token-2xl">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-token-md">
                        <Archive size={32} className="text-white-force/40" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-white-force font-medium mb-token-sm break-keep-ko">
                        {selectedCategory === 'all' ? '구독이 없습니다' : `${selectedCategory} 구독이 없습니다`}
                      </h3>
                      <p className="text-white-force/60 text-sm-ko mb-token-lg break-keep-ko">
                        새로운 구독 서비스를 추가해보세요
                      </p>
                      <Link to="/subscriptions/new">
                        <WaveButton variant="primary" className="hover:bg-white/30 hover:border-white/40 hover:translate-y-[-2px] hover:shadow-xl transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-white/50 active:scale-95 text-white-force">
                          <Plus size={16} className="mr-token-xs icon-enhanced" strokeWidth={1.5} />
                          첫 구독 추가하기
                        </WaveButton>
                      </Link>
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>

            {/* Sidebar - Upcoming Payments & Category Breakdown */}
            <div className="xl:col-span-2 space-y-token-lg">
              
              {/* Upcoming Payments */}
              <GlassCard variant="strong" className="p-token-lg hover:bg-white/30 hover:border-white/40 hover:translate-y-[-2px] hover:shadow-xl transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-white/50 active:scale-95">
                <div className="flex items-center justify-between mb-token-lg">
                  <div className="flex items-center space-x-token-sm">
                    <div className="p-token-sm rounded-lg">
                      <Bell size={20} className="icon-enhanced" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h2 className="text-2xl-ko font-semibold text-white-force break-keep-ko">다가오는 결제</h2>
                      <p className="text-white-force/60 text-sm-ko break-keep-ko text-high-contrast">7일 이내 결제 예정</p>
                    </div>
                  </div>
                  <Link to="/calendar">
                    <WaveButton variant="secondary" size="sm" className="text-white-force font-medium border border-white/30 hover:bg-white/20 hover:border-white/50 hover:translate-y-[-2px] hover:shadow-xl transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-white/50 active:scale-95 touch-target">
                                              <Calendar size={14} className="icon-enhanced" strokeWidth={1.5} />
                    </WaveButton>
                  </Link>
                </div>

                <div className="space-y-token-sm">
                  {upcomingPayments.length > 0 ? (
                    upcomingPayments.map((payment, index) => {
                      const phaseColors = getPhaseColors(getCategoryPhase(payment.category));
                      
                      return (
                        <Link key={payment.id + '-' + index} to={`/subscriptions/${payment.id}`}>
                          <div className="p-token-md glass-light rounded-lg border border-white/10 hover:bg-white/30 hover:border-white/40 hover:translate-y-[-2px] hover:shadow-xl transition-all duration-300 group cursor-pointer hover:scale-105 focus:ring-2 focus:ring-white/50 active:scale-95 keyboard-navigation">
                            <div className="flex items-center justify-between mb-token-sm">
                              <div className="flex items-center space-x-token-sm">
                                <div className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm border border-white/20",
                                  phaseColors.bg
                                )}>
                                  {payment.logoImage ? (
                                    <img 
                                      src={payment.logoImage} 
                                      alt={payment.serviceName}
                                      className="w-6 h-6 rounded object-cover"
                                    />
                                  ) : (
                                    payment.logo || payment.serviceName.charAt(0).toUpperCase()
                                  )}
                                </div>
                                <h3 className="font-medium text-white group-hover:text-primary-300 transition-colors break-keep-ko">
                                  {payment.serviceName}
                                </h3>
                              </div>
                              
                              <span className={cn(
                                "text-xs px-2 py-1 rounded-full font-semibold border-2 text-white",
                                payment.daysUntil <= 1 
                                  ? "bg-red-500/40 border-red-400/60 shadow-lg shadow-red-500/30"
                                  : payment.daysUntil <= 3
                                    ? "bg-orange-500/40 border-orange-400/60 shadow-lg shadow-orange-500/30"
                                    : "bg-blue-500/40 border-blue-400/60 shadow-lg shadow-blue-500/30"
                              )}>
                                {payment.daysUntil === 0 ? '오늘' : 
                                 payment.daysUntil === 1 ? '내일' : 
                                 `${payment.daysUntil}일 후`}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-white-force/60">
                                {payment.nextPaymentDate.toLocaleDateString('ko-KR', { 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                              <p className="text-sm-ko font-medium text-white-force">
                                {formatCurrency(payment.currency === 'USD' ? payment.amount * (preferences?.exchangeRate || 1) : payment.amount)}
                              </p>
                            </div>
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    <div className="text-center py-token-xl">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-token-sm">
                        <CheckCircle size={24} className="text-white-force" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-white-force font-medium mb-1 break-keep-ko">모든 결제 완료!</h3>
                      <p className="text-white-force/60 text-sm-ko break-keep-ko">7일 내 예정된 결제가 없습니다</p>
                    </div>
                  )}
                </div>
              </GlassCard>

              {/* Category Breakdown */}
              <GlassCard variant="strong" className="p-token-lg hover:bg-white/30 hover:border-white/40 hover:translate-y-[-2px] hover:shadow-xl transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-white/50 active:scale-95">
                <div className="flex items-center justify-between mb-token-lg">
                  <div className="flex items-center space-x-token-sm">
                    <div className="p-token-sm rounded-lg">
                      <PieChart size={20} className="icon-enhanced" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h2 className="text-2xl-ko font-semibold text-white-force break-keep-ko">카테고리별 지출비율</h2>
                      <p className="text-white-force/60 text-sm-ko break-keep-ko text-high-contrast">월간 지출 분포</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-token-md">
                  {categoryBreakdown.length > 0 ? (
                    <>
                      {/* 통합 Progress Bar */}
                      <div className="space-y-token-sm">
                        <div className="flex items-center justify-between mb-token-sm">
                          <h3 className="text-white-force font-medium text-sm-ko">지출 분포</h3>
                          <span className="text-white-force/60 text-xs">총 {formatCurrency(stats?.totalMonthlyKrw || 0)}</span>
                        </div>
                        
                        <div className="relative h-6 bg-white/10 rounded-full overflow-hidden">
                                                  {categoryBreakdown.map((item, index) => {
                          const percentage = (stats?.totalMonthlyKrw || 0) > 0 ? (item.monthlyAmount / (stats?.totalMonthlyKrw || 1)) * 100 : 0;
                          const categoryColors = [
                            'bg-blue-500',
                            'bg-green-500', 
                            'bg-purple-500',
                            'bg-orange-500',
                            'bg-pink-500',
                            'bg-indigo-500',
                            'bg-teal-500',
                            'bg-red-500'
                          ];
                          const progressColor = categoryColors[index % categoryColors.length];
                          
                          // 누적 위치 계산
                          const previousWidth = categoryBreakdown
                            .slice(0, index)
                            .reduce((sum, prevItem) => {
                              const prevPercentage = (stats?.totalMonthlyKrw || 0) > 0 ? (prevItem.monthlyAmount / (stats?.totalMonthlyKrw || 1)) * 100 : 0;
                              return sum + prevPercentage;
                            }, 0);
                          
                          return (
                            <div
                              key={item.category + '-' + index}
                              className={cn(
                                "absolute h-full transition-all duration-500",
                                progressColor
                              )}
                              style={{
                                left: `${previousWidth}%`,
                                width: `${percentage}%`
                              }}
                              title={`${item.category}: ${formatCurrency(item.monthlyAmount)} (${percentage.toFixed(1)}%)`}
                            />
                          );
                        })}
                        </div>
                      </div>

                      {/* 카테고리별 상세 정보 */}
                      <div className="space-y-token-sm">
                        {categoryBreakdown.map((item, index) => {
                          const percentage = (item.monthlyAmount / (stats?.totalMonthlyKrw || 1)) * 100;
                          const categoryColors = [
                            'bg-blue-500',
                            'bg-green-500', 
                            'bg-purple-500',
                            'bg-orange-500',
                            'bg-pink-500',
                            'bg-indigo-500',
                            'bg-teal-500',
                            'bg-red-500'
                          ];
                          const progressColor = categoryColors[index % categoryColors.length];
                          
                          return (
                            <div key={item.category + '-' + index} className="flex items-center justify-between p-token-sm hover:bg-white/10 hover:border-white/20 hover:translate-y-[-1px] hover:shadow-lg transition-all duration-300 rounded-lg border border-transparent hover:scale-105 focus:ring-2 focus:ring-white/50 active:scale-95 keyboard-navigation">
                              <div className="flex items-center space-x-token-xs">
                                <span className={cn("w-3 h-3 rounded-full", progressColor)}></span>
                                <span className="text-white-force text-sm-ko break-keep-ko">{item.category}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-white-force font-medium text-sm-ko">
                                  {formatCurrency(item.monthlyAmount)}
                                </span>
                                <span className="text-white-force/60 text-xs ml-2">
                                  ({(stats?.totalMonthlyKrw || 0) > 0 ? percentage.toFixed(1) : '0.0'}%)
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-token-lg">
                      <BarChart3 size={32} className="text-white-force/20 mx-auto mb-token-sm" strokeWidth={1.5} />
                      <p className="text-white-force/60 text-sm-ko break-keep-ko">활성 구독이 없습니다</p>
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Enhanced Quick Actions */}
          <GlassCard variant="strong" className="p-token-lg">
            <div className="flex items-center justify-between mb-token-lg">
              <div className="flex items-center space-x-token-sm">
                                    <div className="p-token-sm rounded-lg">
                      <Sparkles size={20} className="icon-enhanced" strokeWidth={1.5} />
                    </div>
                <div>
                                        <h2 className="text-2xl-ko font-semibold text-white-force break-keep-ko">빠른 작업</h2>
                      <p className="text-white-force/60 text-sm-ko break-keep-ko text-high-contrast">자주 사용하는 기능들</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-token-md">
              {[
                {
                  to: "/subscriptions/new",
                  icon: Plus,
                  title: "새 구독 추가",
                  description: "서비스 등록하기",
                  color: "primary",
                  gradient: "from-primary-500 to-primary-600"
                },
                {
                  to: "/subscriptions",
                  icon: Archive,
                  title: "구독 관리",
                  description: "전체 목록 보기",
                  color: "secondary",
                  gradient: "from-secondary-500 to-secondary-600"
                },
                {
                  to: "/calendar",
                  icon: Calendar,
                  title: "결제 캘린더",
                  description: "월별 일정 확인",
                  color: "success",
                  gradient: "from-success-500 to-success-600"
                },
                {
                  to: "/settings",
                  icon: Settings,
                  title: "설정",
                  description: "환율 및 알림",
                  color: "warning",
                  gradient: "from-warning-500 to-warning-600"
                }
              ].map((action, index) => {
                const IconComponent = action.icon;
                
                return (
                  <Link key={action.to + '-' + index} to={action.to}>
                    <div className="p-token-lg glass-light rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-300 cursor-pointer group hover:scale-105 hover:shadow-xl hover:translate-y-[-2px] active:scale-95 focus:ring-2 focus:ring-white/50 focus:outline-none touch-target">
                      <div className="flex flex-col items-center text-center space-y-token-md">
                        <div className={cn(
                          "w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-300 bg-gradient-to-br",
                          action.to === "/subscriptions/new" && "from-blue-500/60 to-purple-600/60 border border-blue-400/30",
                          action.to === "/subscriptions" && "from-green-500/60 to-teal-600/60 border border-green-400/30",
                          action.to === "/calendar" && "from-orange-500/60 to-red-500/60 border border-orange-400/30",
                          action.to === "/settings" && "from-gray-500/60 to-gray-600/60 border border-gray-400/30"
                        )}>
                          <IconComponent size={24} className="icon-enhanced" strokeWidth={1.5} />
                        </div>
                        <div>
                          <h3 className="font-medium text-white-force group-hover:text-primary-300 transition-colors mb-1 break-keep-ko">
                            {action.title}
                          </h3>
                          <p className="text-sm-ko text-white-force/60 group-hover:text-white-force/80 transition-colors break-keep-ko">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </main>


      {/* Enhanced Footer */}
      <Footer />
    </div>
  );
}