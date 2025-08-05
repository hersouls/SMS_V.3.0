import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { GlassCard } from './GlassCard';
import { WaveButton } from './WaveButton';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useLoadingState } from '../hooks/useLoadingState';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  DollarSign,
  CheckCircle,
  ArrowUpRight,
  Home,
  Bell,
  RefreshCw,
  Plus,
  Settings,
  Activity,
  List,
  Archive,
  CalendarDays,
  Timer,
  Sparkles
} from 'lucide-react';
import { getPhaseColors, PhaseType } from '../utils/phaseColors';
import { cn } from './ui/utils';

export function PaymentCalendar() {
  const { user } = useAuth();
  const { subscriptions, preferences } = useData();
  const { handleError } = useErrorHandler();
  const { isLoading, withLoading } = useLoadingState();
  const navigate = useNavigate();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [filterCategory, setFilterCategory] = useState('all');

  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');

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

  // Enhanced refresh function
  const handleRefresh = async () => {
    await withLoading('refresh', async () => {
      try {
        console.log('✅ Firebase 실시간 데이터 새로고침');
      } catch (error) {
        handleError(error, '데이터 새로고침에 실패했습니다.');
      }
    });
  };

  // Calendar navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  // Get unique categories
  const getUniqueCategories = () => {
    const categories = subscriptions.map(sub => sub.category);
    const uniqueCategories = Array.from(new Set(categories));
    return ['all', ...uniqueCategories];
  };

  // Filter subscriptions by category
  const filteredSubscriptions = filterCategory === 'all' 
    ? activeSubscriptions 
    : activeSubscriptions.filter(sub => sub.category === filterCategory);

  // Generate calendar grid
  const calendarDays = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const subscriptionsOnDay = filteredSubscriptions.filter(sub => sub.paymentDay === day);
    calendarDays.push({ 
      day, 
      subscriptions: subscriptionsOnDay,
      isToday: isCurrentMonth && day === todayDate
    });
  }

  // Get today's payments
  const todaysPayments = isCurrentMonth 
    ? filteredSubscriptions.filter(sub => sub.paymentDay === todayDate)
    : [];

  // Get this week's payments with enhanced logic
  const getThisWeekPayments = () => {
    const startOfWeek = new Date(today);
    const endOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    endOfWeek.setDate(today.getDate() + (6 - today.getDay()));

    return filteredSubscriptions
      .filter(sub => {
        const paymentDate = new Date(year, month, sub.paymentDay);
        return paymentDate >= startOfWeek && paymentDate <= endOfWeek;
      })
      .sort((a, b) => a.paymentDay - b.paymentDay);
  };

  const thisWeekPayments = getThisWeekPayments();

  // Get upcoming payments (next 30 days)
  const getUpcomingPayments = () => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    return filteredSubscriptions
      .map(sub => {
        let paymentDate = new Date(year, month, sub.paymentDay);
        
        // If payment day has passed this month, move to next month
        if (paymentDate < today) {
          paymentDate.setMonth(paymentDate.getMonth() + 1);
        }
        
        const daysUntilPayment = Math.ceil((paymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          ...sub,
          paymentDate,
          daysUntilPayment
        };
      })
      .filter(sub => sub.daysUntilPayment <= 30 && sub.daysUntilPayment >= 0)
      .sort((a, b) => a.daysUntilPayment - b.daysUntilPayment);
  };

  const upcomingPayments = getUpcomingPayments();

  // Calculate enhanced stats with trends
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentDay = now.getDate();

    // 해당년도 1월 1일부터 오늘까지 지출한 합계 계산
    const yearlySpendingToDate = filteredSubscriptions.reduce((total, sub) => {
      const amount = sub.currency === 'USD' ? sub.amount * (preferences?.exchangeRate || 1) : sub.amount;
      
      // 해당년도 1월 1일부터 오늘까지의 결제일을 확인하여 실제 지출액 계산
      
      const today = new Date(currentYear, currentMonth, currentDay);
      
      // 월간 구독의 경우: 1월부터 현재 월까지의 결제일 확인
      if (sub.paymentCycle === 'monthly') {
        for (let month = 0; month <= currentMonth; month++) {
          const paymentDate = new Date(currentYear, month, sub.paymentDay);
          if (paymentDate <= today) {
            total += amount;
          }
        }
      }
      // 연간 구독의 경우: 1월 1일 이후에 결제일이 있으면 포함
      else if (sub.paymentCycle === 'yearly') {
        const paymentDate = new Date(currentYear, 0, sub.paymentDay);
        if (paymentDate <= today) {
          total += amount;
        }
      }
      
      return total;
    }, 0);

    // 해당년도 1월 1일부터 12월 31일까지 지출할 합계 계산
    const yearlyTotal = filteredSubscriptions.reduce((total, sub) => {
      const amount = sub.currency === 'USD' ? sub.amount * (preferences?.exchangeRate || 1) : sub.amount;
      
      if (sub.paymentCycle === 'monthly') {
        // 월간 구독: 12개월 × 월간 금액
        total += amount * 12;
      } else if (sub.paymentCycle === 'yearly') {
        // 연간 구독: 연간 금액
        total += amount;
      }
      
      return total;
    }, 0);

    // 1일부터 오늘까지 지출한 금액 계산 (기존 로직 유지)
    const totalMonthly = filteredSubscriptions.reduce((total, sub) => {
      const amount = sub.currency === 'USD' ? sub.amount * (preferences?.exchangeRate || 1) : sub.amount;
      
      // 1일부터 오늘까지의 결제일을 확인하여 실제 지출액 계산
      if (sub.paymentDay <= currentDay) {
        return total + amount;
      }
      return total;
    }, 0);

    const monthlyTotal = filteredSubscriptions.reduce((total, sub) => {
      const amount = sub.currency === 'USD' ? sub.amount * (preferences?.exchangeRate || 1) : sub.amount;
      const monthlyAmount = sub.paymentCycle === 'yearly' ? amount / 12 : amount;
      return total + monthlyAmount;
    }, 0);

    const todayCount = todaysPayments.length;
    const weekCount = thisWeekPayments.length;
    const upcomingCount = upcomingPayments.filter(p => p.daysUntilPayment <= 7).length;

    // Calculate this week's total amount
    const weeklyTotal = thisWeekPayments.reduce((total, sub) => {
      const amount = sub.currency === 'USD' ? sub.amount * (preferences?.exchangeRate || 1) : sub.amount;
      return total + amount;
    }, 0);

    // Calculate today's total amount
    const todayTotal = todaysPayments.reduce((total, sub) => {
      const amount = sub.currency === 'USD' ? sub.amount * (preferences?.exchangeRate || 1) : sub.amount;
      return total + amount;
    }, 0);

    return {
      totalMonthly, // 1일부터 오늘까지 지출한 금액
      monthlyTotal,
      yearlySpendingToDate, // 해당년도 1월 1일부터 오늘까지 지출한 합계
      yearlyTotal, // 해당년도 1월 1일부터 12월 31일까지 지출할 합계
      todayCount,
      weekCount,
      upcomingCount,
      totalSubscriptions: filteredSubscriptions.length,
      weeklyTotal,
      todayTotal,
      averagePayment: filteredSubscriptions.length > 0 ? monthlyTotal / filteredSubscriptions.length : 0
    };
  }, [filteredSubscriptions, preferences?.exchangeRate, todaysPayments, thisWeekPayments, upcomingPayments]);

  const formatCurrency = (amount: number, currency: 'KRW' | 'USD') => {
    const finalAmount = currency === 'USD' ? amount * (preferences?.exchangeRate || 1) : amount;
    return finalAmount.toLocaleString('ko-KR') + '원';
  };

  const getPaymentUrgency = (daysUntil: number) => {
    if (daysUntil === 0) return 'today';
    if (daysUntil === 1) return 'tomorrow';
    if (daysUntil <= 3) return 'urgent';
    if (daysUntil <= 7) return 'soon';
    return 'normal';
  };

  const getUrgencyClass = (urgency: string) => {
    switch (urgency) {
      case 'today':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'tomorrow':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'urgent':
        return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20';
      case 'soon':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/20';
      default:
        return 'bg-white/10 text-white-force border-white/20';
    }
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
                <div className="flex items-center space-x-token-sm mb-token-xs">
                  <h1 className="text-3xl font-bold text-white-force">결제 캘린더</h1>
                  {stats.upcomingCount > 0 && (
                    <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-500/40 border-yellow-400/60 shadow-lg shadow-yellow-500/30 text-white-force rounded-full text-xs font-semibold border-2">
                      <Bell size={12} className="icon-enhanced" />
                      <span>{stats.upcomingCount}건 예정</span>
                    </div>
                  )}
                </div>
                <p className="text-white-force text-sm-ko">
                  {user?.name || user?.email?.split('@')[0]}님의 결제 일정 • 
                  <span className="ml-2 text-primary-400">
                    {year}년 {monthNames[month]} • 월 {formatCurrency(stats.monthlyTotal, 'KRW')}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-token-sm">
              <WaveButton
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading('refresh')}
                className="hidden md:flex text-white-force hover:text-white hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200"
              >
                <RefreshCw size={16} className={cn("mr-token-xs icon-enhanced text-white-force", isLoading('refresh') && "animate-spin")} />
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
                key: 'monthly',
                label: '월간 총액',
                value: formatCurrency(stats.monthlyTotal, 'KRW'),
                subtext: `평균 ${formatCurrency(stats.averagePayment, 'KRW')}/구독`,
                icon: DollarSign,
                color: 'primary',
                change: null
              },
              {
                key: 'active',
                label: '활성 구독',
                value: `${stats.totalSubscriptions}개`,
                subtext: `전체 ${subscriptions.length}개 중`,
                icon: Activity,
                color: 'success',
                change: null
              },
              {
                key: 'today',
                label: '오늘 결제',
                value: `${stats.todayCount}개`,
                subtext: stats.todayTotal > 0 ? formatCurrency(stats.todayTotal, 'KRW') : '결제 없음',
                icon: Timer,
                color: 'warning',
                change: stats.todayCount > 0 ? 'active' : null
              },
              {
                key: 'week',
                label: '이번 주',
                value: `${stats.weekCount}개`,
                subtext: stats.weeklyTotal > 0 ? formatCurrency(stats.weeklyTotal, 'KRW') : '결제 없음',
                icon: CalendarDays,
                color: 'secondary',
                change: stats.weekCount > 3 ? 'busy' : null
              }
            ].map((stat) => {
              const IconComponent = stat.icon;
              
              return (
                <GlassCard 
                  key={stat.key} 
                  variant="strong"
                  className="p-token-lg group hover:border-white/30 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-token-sm">
                    <div className={cn(
                      "p-token-sm rounded-lg",
                      stat.color === 'primary' && "bg-primary-500/20",
                      stat.color === 'success' && "bg-green-500/20",
                      stat.color === 'warning' && "bg-yellow-500/20",
                      stat.color === 'secondary' && "bg-blue-500/20"
                    )}>
                      <IconComponent size={20} className={cn(
                        "icon-enhanced",
                        stat.color === 'primary' && "text-primary-400",
                        stat.color === 'success' && "text-white-force",
                        stat.color === 'warning' && "text-yellow-400",
                        stat.color === 'secondary' && "text-blue-400"
                      )} />
                    </div>
                    
                    {stat.change && (
                      <div className={cn(
                        "flex items-center space-x-1 text-xs px-2 py-1 rounded-full",
                        stat.change === 'active' && "bg-warning-500/20 text-warning-300",
                        stat.change === 'busy' && "bg-info-500/20 text-info-300"
                      )}>
                        <Activity size={12} className="icon-enhanced" />
                        <span>
                          {stat.change === 'active' ? '오늘' : '바쁨'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-3xl font-bold text-white-force mb-1 group-hover:scale-105 transition-transform">
                      {stat.value}
                    </p>
                    <p className="text-white-force text-sm-ko">{stat.label}</p>
                    <p className="text-white-force text-xs-ko mt-1">{stat.subtext}</p>
                  </div>
                </GlassCard>
              );
            })}
          </div>

          {/* Enhanced Controls */}
          <GlassCard variant="strong" className="p-token-lg">
            <div className="space-y-token-lg">
              {/* Calendar Header with Navigation */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-token-md">
                <div className="flex items-center space-x-token-sm">
                  <div className="p-token-sm bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg">
                    <Calendar size={20} className="text-white-force icon-enhanced" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white-force">
                      {year}년 {monthNames[month]}
                    </h2>
                    <p className="text-white-force text-sm-ko">
                      {filteredSubscriptions.length}개 구독 서비스
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-token-sm">
                  {/* Category Filter */}
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-token-sm py-token-xs bg-white/5 border border-white/10 rounded text-white-force text-sm-ko focus:outline-none focus:ring-2 focus:ring-primary-500 keyboard-navigation"
                  >
                    {getUniqueCategories().map((category, index) => (
                      <option key={`${category}-${index}`} value={category} className="bg-gray-800 text-white-force">
                        {category === 'all' ? '전체 카테고리' : category}
                      </option>
                    ))}
                  </select>

                  {/* View Mode Toggle */}
                  <div className="flex border border-white/10 rounded-lg overflow-hidden">
                    <WaveButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode('calendar')}
                      className={cn(
                        "rounded-none border-none hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200",
                        viewMode === 'calendar'
                          ? "bg-primary-500 text-white-force"
                          : "bg-white/5 text-white-force hover:text-white hover:bg-white/10"
                      )}
                    >
                      <Calendar size={14} className="icon-enhanced" />
                    </WaveButton>
                    <WaveButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className={cn(
                        "rounded-none border-none hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200",
                        viewMode === 'list'
                          ? "bg-primary-500 text-white-force"
                          : "bg-white/5 text-white-force hover:text-white hover:bg-white/10"
                      )}
                    >
                      <List size={14} className="icon-enhanced" />
                    </WaveButton>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center space-x-1">
                    <WaveButton
                      variant="ghost"
                      size="sm"
                      onClick={goToPreviousMonth}
                      ariaLabel="이전 달"
                      className="hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200 touch-target-sm"
                    >
                      <ChevronLeft size={16} className="icon-enhanced" />
                    </WaveButton>
                    <WaveButton
                      variant="secondary"
                      size="sm"
                      onClick={goToToday}
                      className="hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200 touch-target-sm"
                    >
                      오늘
                    </WaveButton>
                    <WaveButton
                      variant="ghost"
                      size="sm"
                      onClick={goToNextMonth}
                      ariaLabel="다음 달"
                      className="hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200 touch-target-sm"
                    >
                      <ChevronRight size={16} className="icon-enhanced" />
                    </WaveButton>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-token-xl">
            
            {/* Calendar or List View */}
            <div className="xl:col-span-3">
              {viewMode === 'calendar' ? (
                /* Enhanced Calendar Grid */
                <GlassCard variant="strong" className="p-token-lg">
                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-token-xs mb-token-md">
                    {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                      <div key={day} className={cn(
                        "text-center font-medium py-token-sm text-sm-ko",
                        index === 0 || index === 6 ? "text-error-400" : "text-white-force"
                      )}>
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-token-xs">
                    {calendarDays.map((item, index) => (
                      <div 
                        key={index} 
                        className={cn(
                          "aspect-square rounded-xl border transition-all duration-300 hover:scale-105",
                          item?.isToday 
                            ? "bg-gradient-to-br from-primary-500/30 to-secondary-500/30 border-primary-500/50 ring-2 ring-primary-500/30 shadow-lg shadow-primary-500/20" 
                            : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                        )}
                      >
                        {item && (
                          <div className="h-full p-token-xs flex flex-col">
                            <div className={cn(
                              "text-sm mb-token-xs font-semibold",
                              item.isToday ? "text-primary-300" : "text-white-force"
                            )}>
                              {item.day}
                            </div>
                            
                            <div className="flex-1 flex flex-col gap-1">
                              {item.subscriptions.slice(0, 3).map(sub => {
                                const phaseColors = getPhaseColors(getCategoryPhase(sub.category));
                                
                                return (
                                  <Link
                                    key={sub.id}
                                    to={`/subscriptions/${sub.id}`}
                                    className={cn(
                                      "text-xs px-1 py-0.5 rounded text-center truncate transition-all duration-200 hover:scale-105",
                                      phaseColors.bg,
                                      phaseColors.text
                                    )}
                                    title={`${sub.serviceName} - ${formatCurrency(sub.amount, sub.currency)}`}
                                  >
                                    {sub.logoImage ? (
                                      <img 
                                        src={sub.logoImage} 
                                        alt={sub.serviceName}
                                        className="w-3 h-3 mx-auto rounded-sm"
                                      />
                                    ) : (
                                      sub.logo || sub.serviceName.charAt(0)
                                    )}
                                  </Link>
                                );
                              })}
                              {item.subscriptions.length > 3 && (
                                <div className="text-xs text-white-force text-center font-medium">
                                  +{item.subscriptions.length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </GlassCard>
              ) : (
                /* Enhanced List View */
                <GlassCard variant="strong" className="p-token-lg">
                  <div className="space-y-token-sm">
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1)
                      .filter(day => {
                        const subscriptionsOnDay = filteredSubscriptions.filter(sub => sub.paymentDay === day);
                        return subscriptionsOnDay.length > 0;
                      })
                      .map(day => {
                        const subscriptionsOnDay = filteredSubscriptions.filter(sub => sub.paymentDay === day);
                        const isToday = isCurrentMonth && day === todayDate;
                        const totalAmount = subscriptionsOnDay.reduce((total, sub) => {
                          const amount = sub.currency === 'USD' ? sub.amount * preferences.exchangeRate : sub.amount;
                          return total + amount;
                        }, 0);
                        
                        return (
                          <div
                            key={day}
                            className={cn(
                              "p-token-md rounded-xl border transition-all duration-200",
                              isToday 
                                ? "bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border-primary-500/30"
                                : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                            )}
                          >
                            <div className="flex items-center justify-between mb-token-sm">
                              <div className="flex items-center space-x-token-sm">
                                <div className={cn(
                                  "w-10 h-10 rounded-lg flex items-center justify-center font-bold",
                                  isToday ? "bg-primary-500 text-white" : "bg-white/10 text-white/80"
                                )}>
                                  {day}
                                </div>
                                <div>
                                  <h3 className="text-white-force font-medium text-lg-ko">
                                    {month + 1}월 {day}일
                                    {isToday && <span className="text-primary-400 ml-2 text-sm-ko">(오늘)</span>}
                                  </h3>
                                  <p className="text-white-force text-sm-ko">
                                    {subscriptionsOnDay.length}개 결제 • {formatCurrency(totalAmount, 'KRW')}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-token-sm">
                              {subscriptionsOnDay.map(sub => {
                                const phaseColors = getPhaseColors(getCategoryPhase(sub.category));
                                
                                return (
                                  <Link
                                    key={sub.id}
                                    to={`/subscriptions/${sub.id}`}
                                    className="p-token-sm glass-light rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-200 group"
                                  >
                                    <div className="flex items-center space-x-token-sm">
                                      <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm",
                                        phaseColors.bg
                                      )}>
                                        {sub.logoImage ? (
                                          <img 
                                            src={sub.logoImage} 
                                            alt={sub.serviceName}
                                            className="w-6 h-6 rounded object-cover"
                                          />
                                        ) : (
                                          sub.logo || sub.serviceName.charAt(0)
                                        )}
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="text-white-force font-medium text-sm-ko group-hover:text-primary-300 transition-colors">
                                          {sub.serviceName}
                                        </h4>
                                        <div className="flex items-center space-x-2 text-xs-ko text-white-force">
                                          <span className={cn("w-2 h-2 rounded-full", phaseColors.bg)}></span>
                                          <span>{sub.category}</span>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-white-force font-medium text-sm-ko">
                                          {formatCurrency(sub.amount, sub.currency)}
                                        </p>
                                        <p className="text-white-force text-xs-ko">
                                          {sub.paymentCycle === 'monthly' ? '월간' : 
                                           sub.paymentCycle === 'yearly' ? '연간' : '일회성'}
                                        </p>
                                      </div>
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </GlassCard>
              )}
            </div>

            {/* Enhanced Sidebar */}
            <div className="space-y-token-lg">
              
              {/* Today's Payments */}
              <GlassCard variant="strong" className="p-token-lg">
                <div className="flex items-center space-x-token-sm mb-token-lg">
                  <div className="p-token-sm bg-yellow-500/20 rounded-lg">
                    <Timer size={20} className="text-yellow-400 icon-enhanced" />
                  </div>
                  <div>
                    <h3 className="text-white-force font-semibold text-lg-ko">오늘의 결제</h3>
                    <p className="text-white-force text-sm-ko">
                      {stats.todayCount}개 • {formatCurrency(stats.todayTotal, 'KRW')}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-token-sm">
                  {todaysPayments.length > 0 ? (
                    todaysPayments.map(sub => {
                      const phaseColors = getPhaseColors(getCategoryPhase(sub.category));
                      
                      return (
                        <Link
                          key={sub.id}
                          to={`/subscriptions/${sub.id}`}
                          className="block p-token-sm glass-light rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-200 group"
                        >
                          <div className="flex items-center space-x-token-sm">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm",
                              phaseColors.bg
                            )}>
                              {sub.logoImage ? (
                                <img 
                                  src={sub.logoImage} 
                                  alt={sub.serviceName}
                                  className="w-6 h-6 rounded object-cover"
                                />
                              ) : (
                                sub.logo || sub.serviceName.charAt(0)
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-white-force font-medium text-sm-ko group-hover:text-primary-300 transition-colors">
                                {sub.serviceName}
                              </h4>
                              <div className="flex items-center space-x-2 text-xs-ko text-white-force">
                                <span className={cn("w-2 h-2 rounded-full", phaseColors.bg)}></span>
                                <span>{sub.category}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-white-force font-medium text-sm-ko">
                                {formatCurrency(sub.amount, sub.currency)}
                              </p>
                              <ArrowUpRight size={12} className="text-white-force icon-enhanced group-hover:text-white/60 transition-colors ml-auto" />
                            </div>
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    <div className="text-center py-token-lg">
                      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-token-sm">
                        <CheckCircle size={24} className="text-white-force icon-enhanced" />
                      </div>
                      <h4 className="text-white-force font-medium mb-1 text-lg-ko">모든 결제 완료!</h4>
                      <p className="text-white-force text-sm-ko">오늘 결제 예정인 구독이 없습니다</p>
                    </div>
                  )}
                </div>
              </GlassCard>

              {/* Upcoming Payments */}
              <GlassCard variant="strong" className="p-token-lg">
                <div className="flex items-center space-x-token-sm mb-token-lg">
                  <div className="p-token-sm bg-blue-500/20 rounded-lg">
                    <Bell size={20} className="text-blue-400 icon-enhanced" />
                  </div>
                  <div>
                    <h3 className="text-white-force font-semibold text-lg-ko">다가오는 결제</h3>
                    <p className="text-white-force text-sm-ko">30일 이내</p>
                  </div>
                </div>
                
                <div className="space-y-token-sm">
                  {upcomingPayments.slice(0, 5).map(payment => {
                    const urgency = getPaymentUrgency(payment.daysUntilPayment);
                    const phaseColors = getPhaseColors(getCategoryPhase(payment.category));
                    
                    return (
                      <Link
                        key={payment.id}
                        to={`/subscriptions/${payment.id}`}
                        className="block p-token-sm glass-light rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-200 group"
                      >
                        <div className="flex items-center justify-between mb-token-xs">
                          <div className="flex items-center space-x-token-sm">
                            <div className={cn(
                              "w-6 h-6 rounded flex items-center justify-center text-white font-bold text-xs",
                              phaseColors.bg
                            )}>
                              {payment.logoImage ? (
                                <img 
                                  src={payment.logoImage} 
                                  alt={payment.serviceName}
                                  className="w-4 h-4 rounded object-cover"
                                />
                              ) : (
                                payment.logo || payment.serviceName.charAt(0)
                              )}
                            </div>
                            <h4 className="text-white-force font-medium text-sm group-hover:text-primary-300 transition-colors">
                              {payment.serviceName}
                            </h4>
                          </div>
                          <span className={cn(
                            "text-xs px-2 py-1 rounded-full border font-medium text-white-force",
                            getUrgencyClass(urgency)
                          )}>
                            {payment.daysUntilPayment === 0 ? '오늘' :
                             payment.daysUntilPayment === 1 ? '내일' :
                             `${payment.daysUntilPayment}일 후`}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs-ko text-white-force">
                          <span>
                            {payment.paymentDate.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="text-white-force font-medium">
                            {formatCurrency(payment.amount, payment.currency)}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                  
                  {upcomingPayments.length === 0 && (
                    <div className="text-center py-token-lg">
                      <Calendar size={32} className="text-white-force icon-enhanced mx-auto mb-token-sm" />
                      <p className="text-white-force text-sm-ko">30일 이내 결제 예정이 없습니다</p>
                    </div>
                  )}
                </div>
              </GlassCard>

              {/* Monthly Summary */}
              <GlassCard variant="strong" className="p-token-lg">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-token-md">
                    <Sparkles size={24} className="text-white-force icon-enhanced" />
                  </div>
                  <h3 className="text-white-force font-semibold mb-token-sm text-lg-ko">
                    {monthNames[month]} 결제 요약
                  </h3>
                  <p className="text-3xl font-bold text-white-force mb-token-xs">
                    {formatCurrency(stats.monthlyTotal, 'KRW')}
                  </p>
                  <p className="text-white-force text-sm-ko mb-token-md">
                    {stats.totalSubscriptions}개 구독 서비스
                  </p>
                  
                  <div className="space-y-2 text-sm-ko">
                    <div className="flex justify-between">
                      <span className="text-white-force">평균 구독료</span>
                      <span className="text-white-force">
                        {formatCurrency(stats.averagePayment, 'KRW')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white-force">이번 주 총액</span>
                      <span className="text-white-force">
                        {formatCurrency(stats.weeklyTotal, 'KRW')}
                      </span>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Quick Actions */}
              <GlassCard variant="light" className="p-token-lg">
                <h3 className="text-white-force font-semibold mb-token-md text-lg-ko">빠른 액션</h3>
                <div className="space-y-token-sm">
                  <Link to="/subscriptions">
                    <WaveButton variant="ghost" size="sm" className="w-full justify-start hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200 text-white-force">
                      <Archive size={14} className="mr-2 icon-enhanced text-white-force" />
                      전체 구독 보기
                    </WaveButton>
                  </Link>
                  <Link to="/notifications">
                    <WaveButton variant="ghost" size="sm" className="w-full justify-start hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200 text-white-force">
                      <Bell size={14} className="mr-2 icon-enhanced text-white-force" />
                      알림 설정
                    </WaveButton>
                  </Link>
                  <Link to="/settings">
                    <WaveButton variant="ghost" size="sm" className="w-full justify-start hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200 text-white-force">
                      <Settings size={14} className="mr-2 icon-enhanced text-white-force" />
                      환율 설정
                    </WaveButton>
                  </Link>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </main>

      {/* Enhanced Footer */}
      <Footer />
    </div>
  );
}