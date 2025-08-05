import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { GlassCard } from './GlassCard';
import { WaveButton } from './WaveButton';
import { FirebaseIndexError } from './FirebaseIndexError';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { AdvancedSearch, SearchFilter } from './AdvancedSearch';
import { SearchHighlight } from './SearchHighlight';
import { SearchFavorites } from './SearchFavorites';
import { SearchSummary } from './SearchSummary';
import { 
  Plus, 
  Search, 
  Grid3X3,
  List,
  CheckCircle,
  PauseCircle,
  XCircle,
  Clock,
  Edit3,
  TrendingUp,
  Home,
  SortAsc,
  SortDesc,
  RefreshCw,
  Eye,
  Archive,
  Star,
  Filter
} from 'lucide-react';
import { getPhaseColors, PhaseType } from '../utils/phaseColors';
import { cn } from './ui/utils';

export function AllSubscriptions() {
  const { user } = useAuth();
  const { subscriptions, preferences, loading, error } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  
  // States
  const [currentFilter, setCurrentFilter] = useState<SearchFilter>({
    query: '',
    status: 'all',
    category: 'all',
    priceRange: { min: 0, max: 1000000 },
    paymentCycle: 'all',
    tags: [],
    dateRange: { start: null, end: null },
    sortBy: 'recent',
    sortOrder: 'desc'
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);

  // Handle location state messages
  useEffect(() => {
    if (location.state?.message) {
      // You could show a toast here if you have a toast system
      console.log(location.state.message);
      // Clear the state
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  // Responsive view mode
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode('list');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate filtered and sorted subscriptions with enhanced logic
  const { filteredSubscriptions, statusCounts, categories, totalMonthlySpend } = useMemo(() => {
    // Filter subscriptions
    let filtered = subscriptions.filter(sub => {
      // 검색어 필터링
      const query = currentFilter.query.toLowerCase();
      const matchesSearch = !query || 
        sub.serviceName.toLowerCase().includes(query) ||
        sub.category.toLowerCase().includes(query) ||
        sub.tags.some(tag => tag.toLowerCase().includes(query));
      
      // 상태 필터링
      const matchesStatus = currentFilter.status === 'all' || sub.status === currentFilter.status;
      
      // 카테고리 필터링
      const matchesCategory = currentFilter.category === 'all' || sub.category === currentFilter.category;
      
      // 결제 주기 필터링
      const matchesPaymentCycle = currentFilter.paymentCycle === 'all' || sub.paymentCycle === currentFilter.paymentCycle;
      
      // 가격 범위 필터링
      const monthlyAmount = getMonthlyAmount(sub);
      const matchesPriceRange = monthlyAmount >= currentFilter.priceRange.min && monthlyAmount <= currentFilter.priceRange.max;
      
      // 태그 필터링
      const matchesTags = currentFilter.tags.length === 0 || 
        currentFilter.tags.some(tag => sub.tags.includes(tag));
      
      return matchesSearch && matchesStatus && matchesCategory && matchesPaymentCycle && matchesPriceRange && matchesTags;
    });

    // Sort subscriptions
    filtered.sort((a, b) => {
      let result = 0;
      
      switch (currentFilter.sortBy) {
        case 'name':
          result = a.serviceName.localeCompare(b.serviceName, 'ko');
          break;
        case 'amount':
          const amountA = getMonthlyAmount(a);
          const amountB = getMonthlyAmount(b);
          result = amountB - amountA;
          break;
        case 'paymentDay':
          result = a.paymentDay - b.paymentDay;
          break;
        case 'category':
          result = a.category.localeCompare(b.category, 'ko');
          break;
        case 'recent':
        default:
          result = new Date(b.createdAt || b.startDate).getTime() - new Date(a.createdAt || a.startDate).getTime();
          break;
      }
      
      return currentFilter.sortOrder === 'asc' ? -result : result;
    });

    // Calculate status counts
    const counts = {
      all: subscriptions.length,
      active: subscriptions.filter(sub => sub.status === 'active').length,
      paused: subscriptions.filter(sub => sub.status === 'paused').length,
      cancelled: subscriptions.filter(sub => sub.status === 'cancelled').length,
    };

    // Get unique categories with counts
    const categoryMap = new Map();
    if (subscriptions && Array.isArray(subscriptions)) {
      subscriptions.forEach(sub => {
        categoryMap.set(sub.category, (categoryMap.get(sub.category) || 0) + 1);
      });
    }
    const uniqueCategories = ['all', ...Array.from(categoryMap.keys()).sort()];

    // Calculate total monthly spending
    const monthlySpend = subscriptions
      .filter(sub => sub.status === 'active')
      .reduce((total, sub) => {
        const amount = sub.currency === 'USD' ? sub.amount * (preferences?.exchangeRate || 1) : sub.amount;
        const monthlyAmount = sub.paymentCycle === 'yearly' ? amount / 12 : amount;
        return total + monthlyAmount;
      }, 0);

    return {
      filteredSubscriptions: filtered,
      statusCounts: counts,
      categories: uniqueCategories,
      totalMonthlySpend: monthlySpend
    };
      }, [subscriptions, currentFilter, preferences?.exchangeRate]);

  // Enhanced refresh function  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Firebase 실시간 데이터이므로 별도 새로고침 불필요
      console.log('✅ Firebase 실시간 데이터 새로고침');
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
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
        return <CheckCircle size={16} className="icon-enhanced text-white" />;
      case 'paused':
        return <PauseCircle size={16} className="text-white-force" />;
      case 'cancelled':
        return <XCircle size={16} className="text-white-force" />;
      default:
        return <Clock size={16} className="icon-enhanced text-white-force" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '활성';
      case 'paused': return '일시정지';
      case 'cancelled': return '해지';
      default: return '알 수 없음';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-white border-green-500/30';
      case 'paused':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-white/10 text-white/70 border-white/20';
    }
  };



  const getNextPaymentDate = (subscription: any) => {
    const today = new Date();
    const paymentDay = subscription.paymentDay;
    let nextPayment = new Date(today.getFullYear(), today.getMonth(), paymentDay);
    
    if (nextPayment < today) {
      nextPayment.setMonth(nextPayment.getMonth() + 1);
    }
    
    const diffTime = nextPayment.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getMonthlyAmount = (subscription: any) => {
    const amount = subscription.currency === 'USD' ? subscription.amount * (preferences?.exchangeRate || 1) : subscription.amount;
    return subscription.paymentCycle === 'yearly' ? amount / 12 : amount;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header */}
      <Header />

      {/* Body */}
      <main className="pt-28 pb-token-xl px-token-md">
        <div className="max-w-7xl mx-auto space-y-token-xl">

          {/* Enhanced Page Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-token-md">
              <WaveButton
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="hidden md:flex text-white-force hover:text-white hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200"
              >
                <Home size={16} className="mr-token-xs icon-enhanced text-white-force" />
                대시보드
              </WaveButton>
              
              <div>
                                  <h1 className="text-3xl font-bold text-white-force">구독 관리</h1>
                <p className="text-white-force text-sm-ko">
                  {subscriptions.length}개의 구독 • 월 {totalMonthlySpend.toLocaleString('ko-KR')}원
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-token-sm">
              <WaveButton
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="hidden md:flex text-white-force hover:text-white hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200"
              >
                <RefreshCw size={16} className={cn("mr-token-xs icon-enhanced text-white-force", isRefreshing && "animate-spin")} />
                새로고침
              </WaveButton>

              <Link to="/subscriptions/new">
                <WaveButton variant="primary" className="shadow-lg shadow-primary-500/20 hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200 text-white-force">
                  <Plus size={16} className="mr-token-xs icon-enhanced text-white-force" />
                  새 구독 추가
                </WaveButton>
              </Link>
            </div>
          </div>

          {/* Enhanced Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-token-lg">
            {[
              { 
                key: 'all', 
                label: '전체 구독', 
                count: statusCounts.all, 
                color: 'primary',
                icon: Archive,
                change: null
              },
              { 
                key: 'active', 
                label: '활성 구독', 
                count: statusCounts.active, 
                color: 'success',
                icon: CheckCircle,
                change: '+2'
              },
              { 
                key: 'paused', 
                label: '일시정지', 
                count: statusCounts.paused, 
                color: 'warning',
                icon: PauseCircle,
                change: null
              },
              { 
                key: 'cancelled', 
                label: '해지됨', 
                count: statusCounts.cancelled, 
                color: 'error',
                icon: XCircle,
                change: null
              }
            ].map((stat, index) => {
              const IconComponent = stat.icon;
              const isSelected = currentFilter.status === stat.key;
              
              return (
                <GlassCard 
                  key={stat.key + '-' + index} 
                  variant={isSelected ? "strong" : "light"} 
                  className={cn(
                    "p-token-lg cursor-pointer transition-all duration-300 hover:border-white/30 hover:scale-105 group hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 focus:outline-none",
                    isSelected && "ring-1 ring-primary-500/30 shadow-lg"
                  )}
                  onClick={() => setCurrentFilter(prev => ({ ...prev, status: stat.key as any }))}
                >
                  <div className="flex items-center justify-between mb-token-sm">
                    <div className={cn(
                      "p-token-sm rounded-lg",
                      stat.color === 'primary' && "bg-primary-500/20",
                      stat.color === 'success' && "bg-green-500/20",
                      stat.color === 'warning' && "bg-yellow-500/20",
                      stat.color === 'error' && "bg-red-500/20"
                    )}>
                      <IconComponent size={20} className={cn(
                        "icon-enhanced",
                        stat.color === 'primary' && "text-primary-400",
                        stat.color === 'success' && "text-white-force",
                        stat.color === 'warning' && "text-yellow-400",
                        stat.color === 'error' && "text-red-400"
                      )} />
                    </div>
                    
                                        {stat.change && (
                      <div className="flex items-center space-x-1 text-xs text-white-force">
                        <TrendingUp size={12} className="icon-enhanced" />
                        <span>{stat.change}</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-3xl font-bold text-white-force mb-1 group-hover:scale-105 transition-transform">
                      {stat.count}
                    </p>
                    <p className="text-white-force text-sm-ko">{stat.label}</p>
                  </div>
                </GlassCard>
              );
            })}
          </div>

          {/* Enhanced Controls */}
          <GlassCard variant="strong" className="p-token-lg">
            <div className="space-y-token-lg">
              {/* Main Controls Row */}
              <div className="flex flex-col xl:flex-row gap-token-md">
                {/* Advanced Search */}
                <div className="flex-1">
                  <AdvancedSearch
                    subscriptions={subscriptions}
                    onFilterChange={setCurrentFilter}
                    onSearchHistorySave={(query) => console.log('검색 히스토리 저장:', query)}
                  />
                </div>

                {/* View Mode and Favorites */}
                <div className="flex flex-wrap gap-token-sm">
                  {/* Favorites Toggle */}
                  <WaveButton
                    variant={showFavorites ? "primary" : "secondary"}
                    onClick={() => setShowFavorites(!showFavorites)}
                    className="text-sm"
                  >
                    <Star size={16} className="mr-token-xs" />
                    즐겨찾기
                  </WaveButton>

                  {/* View Mode Toggle */}
                  <div className="flex border border-white/10 rounded-lg overflow-hidden">
                    <WaveButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className={cn(
                        "rounded-none border-none hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200",
                        viewMode === 'grid'
                          ? "bg-primary-500 text-white"
                          : "bg-white/5 text-white-force hover:text-white hover:bg-white/10"
                      )}
                    >
                      <Grid3X3 size={16} className="icon-enhanced" />
                    </WaveButton>
                    <WaveButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className={cn(
                        "rounded-none border-none hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200",
                        viewMode === 'list'
                          ? "bg-primary-500 text-white"
                          : "bg-white/5 text-white-force hover:text-white hover:bg-white/10"
                      )}
                    >
                      <List size={16} className="icon-enhanced" />
                    </WaveButton>
                  </div>
                </div>
              </div>

              {/* Results Info & Actions */}
              <div className="flex items-center justify-between pt-token-md border-t border-white/10">
                <div className="flex items-center space-x-token-md">
                  <p className="text-white-force text-sm-ko">
                    <span className="text-white-force font-medium">{filteredSubscriptions.length}개</span> 구독 
                    {selectedStatus !== 'all' && (
                      <span className="text-white-force"> • {getStatusText(selectedStatus)}</span>
                    )}
                    {selectedCategory !== 'all' && (
                      <span className="text-white-force"> • {selectedCategory}</span>
                    )}
                  </p>
                  
                  {filteredSubscriptions.length > 0 && (
                    <p className="text-primary-400 text-sm-ko">
                      월 총 {filteredSubscriptions
                        .filter(sub => sub.status === 'active')
                        .reduce((total, sub) => total + getMonthlyAmount(sub), 0)
                        .toLocaleString('ko-KR')}원
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-token-sm">
                  {(currentFilter.query || currentFilter.status !== 'all' || currentFilter.category !== 'all' || currentFilter.tags.length > 0) && (
                    <WaveButton
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCurrentFilter({
                          query: '',
                          status: 'all',
                          category: 'all',
                          priceRange: { min: 0, max: 1000000 },
                          paymentCycle: 'all',
                          tags: [],
                          dateRange: { start: null, end: null },
                          sortBy: 'recent',
                          sortOrder: 'desc'
                        });
                      }}
                      className="text-white-force hover:text-white hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200"
                    >
                      필터 초기화
                    </WaveButton>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Firebase Index Error Display */}
          {error && (
            <FirebaseIndexError 
              error={error} 
              onRetry={() => window.location.reload()} 
              className="mb-token-lg"
            />
          )}

          {/* Search Summary */}
          <SearchSummary
            totalCount={subscriptions.length}
            filteredCount={filteredSubscriptions.length}
            filter={currentFilter}
          />

          {/* Enhanced Subscriptions Display */}
          {filteredSubscriptions.length > 0 ? (
            <div className={cn(
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-token-lg" 
                : "space-y-token-sm"
            )}>
              {filteredSubscriptions.map((subscription, index) => {
                const phaseColors = getPhaseColors(getCategoryPhase(subscription.category));
                const daysUntilPayment = getNextPaymentDate(subscription);
                const monthlyAmount = getMonthlyAmount(subscription);
                
                return (
                  <GlassCard 
                    key={subscription.id + '-' + index} 
                    variant="strong" 
                    className={cn(
                      "group hover:border-white/30 transition-all duration-300 hover:scale-105 hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 focus:outline-none",
                      viewMode === 'list' && "hover:scale-100 hover:bg-white/5"
                    )}
                  >
                    {viewMode === 'grid' ? (
                      /* Enhanced Grid View */
                      <div className="p-token-lg">
                        {/* Header with enhanced logo */}
                        <div className="flex items-start justify-between mb-token-lg">
                          <div className="flex items-center space-x-token-sm">
                            <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg",
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
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-white-force truncate group-hover:text-primary-300 transition-colors text-lg-ko">
                                <SearchHighlight 
                                  text={subscription.serviceName} 
                                  query={currentFilter.query}
                                />
                              </h3>
                              <div className="flex items-center space-x-1">
                                <span className={cn("w-2 h-2 rounded-full", phaseColors.bg)}></span>
                                <p className="text-white-force text-sm-ko">
                                  <SearchHighlight 
                                    text={subscription.category} 
                                    query={currentFilter.query}
                                  />
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(subscription.status)}
                            {subscription.autoRenewal && subscription.status === 'active' && (
                              <RefreshCw size={12} className="text-white" />
                            )}
                          </div>
                        </div>

                        {/* Enhanced Content */}
                        <div className="space-y-token-sm mb-token-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-white-force text-sm-ko">월 지출</span>
                            <div className="text-right">
                              <span className="font-semibold text-white-force">
                                {monthlyAmount.toLocaleString('ko-KR')}원
                              </span>
                              {subscription.paymentCycle === 'yearly' && (
                                <p className="text-xs text-yellow-400">연간 할인</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-white-force text-sm-ko">다음 결제</span>
                            <span className={cn(
                              "text-sm-ko font-medium",
                              daysUntilPayment <= 3 ? "text-yellow-400" :
                              daysUntilPayment <= 7 ? "text-blue-400" : "text-white-force"
                            )}>
                              {daysUntilPayment === 0 ? '오늘' : 
                               daysUntilPayment === 1 ? '내일' : 
                               `${daysUntilPayment}일 후`}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-white-force text-sm-ko">상태</span>
                            <span className={cn(
                              "px-token-sm py-1 rounded-full text-xs border text-white-force",
                              getStatusBadgeClass(subscription.status)
                            )}>
                              {getStatusText(subscription.status)}
                            </span>
                          </div>

                          {/* Tags */}
                          {subscription.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-token-sm">
                              {subscription.tags.slice(0, 2).map((tag, tagIndex) => (
                                <span key={`tag-${tag}-${tagIndex}`} className="px-2 py-0.5 bg-secondary-500/40 border-secondary-400/60 shadow-lg shadow-secondary-500/30 text-white text-xs rounded-full font-semibold border-2">
                                  #{tag}
                                </span>
                              ))}
                              {subscription.tags.length > 2 && (
                                <span className="px-2 py-0.5 bg-white/10 text-white-force text-xs rounded-full">
                                  +{subscription.tags.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Enhanced Actions */}
                        <div className="flex space-x-token-xs">
                          <Link to={`/subscriptions/${subscription.id}`} className="flex-1">
                            <WaveButton 
                              variant="secondary" 
                              size="sm" 
                              className="w-full hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200 text-white-force"
                            >
                              <Eye size={14} className="mr-1 icon-enhanced text-white-force" />
                              상세보기
                            </WaveButton>
                          </Link>
                          <Link to={`/subscriptions/${subscription.id}/edit`}>
                            <WaveButton 
                              variant="ghost" 
                              size="sm" 
                              className="text-white-force hover:text-white hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200"
                            >
                              <Edit3 size={14} className="icon-enhanced" />
                            </WaveButton>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      /* Enhanced List View */
                      <div className="p-token-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-token-md flex-1">
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0",
                              phaseColors.bg
                            )}>
                              {subscription.logoImage ? (
                                <img 
                                  src={subscription.logoImage} 
                                  alt={subscription.serviceName}
                                  className="w-6 h-6 rounded object-cover"
                                />
                              ) : (
                                subscription.logo || subscription.serviceName.charAt(0).toUpperCase()
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-token-sm mb-1">
                                <h3 className="font-medium text-white-force truncate group-hover:text-primary-300 transition-colors text-lg-ko">
                                  {subscription.serviceName}
                                </h3>
                                {getStatusIcon(subscription.status)}
                                <span className={cn(
                                  "px-token-xs py-0.5 rounded-full text-xs border text-white-force",
                                  getStatusBadgeClass(subscription.status)
                                )}>
                                  {getStatusText(subscription.status)}
                                </span>
                                {subscription.autoRenewal && subscription.status === 'active' && (
                                  <RefreshCw size={12} className="icon-enhanced text-white-force" />
                                )}
                              </div>
                              <div className="flex items-center space-x-token-sm text-sm-ko text-white-force">
                                <span className={cn("w-2 h-2 rounded-full", phaseColors.bg)}></span>
                                <span>{subscription.category}</span>
                                <span>•</span>
                                <span>매월 {subscription.paymentDay}일</span>
                                <span>•</span>
                                <span className={cn(
                                  daysUntilPayment <= 3 ? "text-yellow-400" :
                                  daysUntilPayment <= 7 ? "text-blue-400" : "text-white-force"
                                )}>
                                  {daysUntilPayment === 0 ? '오늘 결제' : 
                                   daysUntilPayment === 1 ? '내일 결제' : 
                                   `${daysUntilPayment}일 후 결제`}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-token-lg">
                            <div className="text-right">
                              <p className="font-semibold text-white-force">
                                {monthlyAmount.toLocaleString('ko-KR')}원
                              </p>
                              <p className="text-white-force text-sm-ko">
                                월간{subscription.paymentCycle === 'yearly' && ' (연간할인)'}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <Link to={`/subscriptions/${subscription.id}`}>
                                <WaveButton 
                                  variant="secondary" 
                                  size="sm"
                                  className="hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200"
                                >
                                  <Eye size={14} className="icon-enhanced" />
                                </WaveButton>
                              </Link>
                              <Link to={`/subscriptions/${subscription.id}/edit`}>
                                <WaveButton 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-white-force hover:text-white hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200"
                                >
                                  <Edit3 size={14} className="icon-enhanced" />
                                </WaveButton>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </GlassCard>
                );
              })}
            </div>
          ) : (
            /* Enhanced Empty State */
            <GlassCard variant="light" className="p-token-2xl">
              <div className="text-center max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-full flex items-center justify-center mx-auto mb-token-lg">
                  {searchQuery || selectedStatus !== 'all' || selectedCategory !== 'all' ? (
                    <Search size={40} className="icon-enhanced text-white-force" />
                  ) : (
                    <Archive size={40} className="icon-enhanced text-white-force" />
                  )}
                </div>
                
                <h3 className="text-white-force font-semibold mb-token-sm text-xl-ko">
                  {searchQuery || selectedStatus !== 'all' || selectedCategory !== 'all' 
                    ? '검색 결과가 없습니다' 
                    : '구독이 없습니다'
                  }
                </h3>
                
                <p className="text-white-force text-sm-ko mb-token-lg leading-relaxed">
                  {searchQuery || selectedStatus !== 'all' || selectedCategory !== 'all'
                    ? '다른 검색어나 필터 조건을 시도해보세요'
                    : 'Moonwave에서 첫 번째 구독을 추가하고\n체계적인 구독 관리를 시작해보세요'
                  }
                </p>
                
                <div className="flex justify-center space-x-token-sm">
                  {(searchQuery || selectedStatus !== 'all' || selectedCategory !== 'all') ? (
                    <WaveButton
                      variant="secondary"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedStatus('all');
                        setSelectedCategory('all');
                      }}
                      className="hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200 text-white-force"
                    >
                      <RefreshCw size={16} className="mr-token-xs icon-enhanced text-white-force" />
                      필터 초기화
                    </WaveButton>
                  ) : (
                    <Link to="/subscriptions/new">
                      <WaveButton variant="primary" className="shadow-lg shadow-primary-500/20 hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200 text-white-force">
                        <Plus size={16} className="mr-token-xs icon-enhanced text-white-force" />
                        첫 구독 추가하기
                      </WaveButton>
                    </Link>
                  )}
                </div>
              </div>
            </GlassCard>
          )}
        </div>
      </main>

      {/* Enhanced Footer */}
      <Footer />
    </div>
  );
}