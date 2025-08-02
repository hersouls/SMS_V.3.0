import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { GlassCard } from './GlassCard';
import { WaveButton } from './WaveButton';
import { useApp } from '../App';
import { 
  Bell, 
  Check, 
  CheckCircle,
  AlertCircle,
  Clock,
  CreditCard,
  Trash2,
  Settings as SettingsIcon,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Info,
  X,
  Filter,
  RefreshCw,
  Archive,
  Star,
  Eye,
  EyeOff,
  Home,
  MoreHorizontal,
  Zap,
  Target,
  Activity,
  AlertTriangle,
  CheckSquare,
  PlayCircle,
  UserCheck
} from 'lucide-react';
import { getPhaseColors, PhaseType } from '../utils/phaseColors';
import { cn } from './ui/utils';

interface Notification {
  id: string;
  type: 'payment' | 'renewal' | 'expiry' | 'system';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  subscriptionId?: string;
  category?: string;
  metadata?: {
    amount?: number;
    currency?: 'KRW' | 'USD';
    daysUntil?: number;
    serviceName?: string;
  };
}

export function Notifications() {
  const { subscriptions, settings, user, refreshData } = useApp();
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'payment' | 'system'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // 알림 권한 확인 및 요청
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      
      // 권한이 허용되지 않은 경우 자동으로 요청
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          setNotificationPermission(permission);
          if (permission === 'granted') {
            console.log('알림 권한이 허용되었습니다.');
          } else if (permission === 'denied') {
            console.log('알림 권한이 거부되었습니다.');
          }
        });
      }
    }
  }, []);

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

  // 알림 클릭 이벤트 리스너
  useEffect(() => {
    const handleNotificationClick = (event: any) => {
      const tag = event.notification.tag;
      if (tag && tag.startsWith('payment-')) {
        const subscriptionId = tag.split('-')[1];
        navigate(`/subscription/${subscriptionId}`);
      }
    };

    if ('Notification' in window) {
      // 알림 클릭 이벤트 리스너 등록
      navigator.serviceWorker?.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
          handleNotificationClick(event.data);
        }
      });
    }

    return () => {
      // 클린업
    };
  }, [navigate]);

  // Enhanced notification generation with better categorization
  useEffect(() => {
    const generateNotifications = () => {
      const now = new Date();
      const generatedNotifications: Notification[] = [];

      // Generate payment notifications for each active subscription
      if (subscriptions && Array.isArray(subscriptions)) {
        subscriptions.forEach((sub) => {
          if (sub.status === 'active') {
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();
          let paymentDate = new Date(currentYear, currentMonth, sub.paymentDay);
          
          // 브라우저 알림 발송 (권한이 허용된 경우)
          if (notificationPermission === 'granted' && settings.notifications.paymentReminders) {
            const daysUntilPayment = Math.ceil((paymentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
            // 7일 전 알림
            if (daysUntilPayment === 7 && sub.notifications?.sevenDays) {
              new Notification(`${sub.serviceName} 결제 예정`, {
                body: `7일 후 ${sub.serviceName} 결제가 예정되어 있습니다. (${formatCurrency(sub.amount, sub.currency)})`,
                icon: '/favicon.ico',
                tag: `payment-${sub.id}-7days`,
                requireInteraction: false
              });
            }
            
            // 3일 전 알림
            if (daysUntilPayment === 3 && sub.notifications?.threeDays) {
              new Notification(`${sub.serviceName} 결제 예정`, {
                body: `3일 후 ${sub.serviceName} 결제가 예정되어 있습니다. (${formatCurrency(sub.amount, sub.currency)})`,
                icon: '/favicon.ico',
                tag: `payment-${sub.id}-3days`,
                requireInteraction: false
              });
            }
            
            // 당일 알림
            if (daysUntilPayment === 0 && sub.notifications?.sameDay) {
              new Notification(`${sub.serviceName} 결제일`, {
                body: `오늘 ${sub.serviceName} 결제일입니다. (${formatCurrency(sub.amount, sub.currency)})`,
                icon: '/favicon.ico',
                tag: `payment-${sub.id}-today`,
                requireInteraction: true
              });
            }
          }
          
          // If payment day has passed this month, calculate for next month
          if (paymentDate < now) {
            paymentDate.setMonth(paymentDate.getMonth() + 1);
          }
          
          const daysUntilPayment = Math.ceil((paymentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          const amount = sub.currency === 'USD' ? sub.amount * settings.exchangeRate : sub.amount;

          // 7-day reminder
          if (daysUntilPayment <= 7 && daysUntilPayment > 3 && sub.notifications?.sevenDays) {
            generatedNotifications.push({
              id: `${sub.id}-7days-${paymentDate.getTime()}`,
              type: 'payment',
              title: `${sub.serviceName} 결제 예정`,
              message: `${daysUntilPayment}일 후 결제 예정입니다. 금액: ${amount.toLocaleString('ko-KR')}원`,
              date: new Date().toISOString(),
              isRead: Math.random() > 0.7,
              priority: 'medium',
              subscriptionId: sub.id,
              category: sub.category,
              metadata: {
                amount: sub.amount,
                currency: sub.currency,
                daysUntil: daysUntilPayment,
                serviceName: sub.serviceName
              }
            });
          }
          
          // 3-day reminder
          if (daysUntilPayment <= 3 && daysUntilPayment > 0 && sub.notifications?.threeDays) {
            generatedNotifications.push({
              id: `${sub.id}-3days-${paymentDate.getTime()}`,
              type: 'payment',
              title: `${sub.serviceName} 곧 결제`,
              message: `${daysUntilPayment}일 후 자동 결제됩니다. 결제 수단을 확인해주세요.`,
              date: new Date().toISOString(),
              isRead: Math.random() > 0.5,
              priority: 'high',
              subscriptionId: sub.id,
              category: sub.category,
              metadata: {
                amount: sub.amount,
                currency: sub.currency,
                daysUntil: daysUntilPayment,
                serviceName: sub.serviceName
              }
            });
          }
          
          // Same-day reminder
          if (daysUntilPayment === 0 && sub.notifications?.sameDay) {
            generatedNotifications.push({
              id: `${sub.id}-today-${paymentDate.getTime()}`,
              type: 'payment',
              title: `${sub.serviceName} 오늘 결제`,
              message: `오늘 자동 결제가 진행됩니다. 금액: ${amount.toLocaleString('ko-KR')}원`,
              date: new Date().toISOString(),
              isRead: false,
              priority: 'high',
              subscriptionId: sub.id,
              category: sub.category,
              metadata: {
                amount: sub.amount,
                currency: sub.currency,
                daysUntil: daysUntilPayment,
                serviceName: sub.serviceName
              }
            });
          }
        }
      });
      }

      // Enhanced system notifications
      generatedNotifications.push(
        {
          id: 'system-exchange-rate',
          type: 'system',
          title: '환율 업데이트',
          message: `USD 환율이 ${settings.exchangeRate.toLocaleString('ko-KR')}원으로 업데이트되었습니다. 구독료가 자동으로 재계산됩니다.`,
          date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          isRead: true,
          priority: 'low'
        },
        {
          id: 'system-monthly-report',
          type: 'system',
          title: '월간 리포트 준비 완료',
          message: `이번 달 구독 사용 리포트가 준비되었습니다. 총 ${(subscriptions || []).filter(s => s.status === 'active').length}개의 활성 구독으로 ${(subscriptions || []).reduce((total, sub) => {
            const amount = sub.currency === 'USD' ? sub.amount * settings.exchangeRate : sub.amount;
            const monthlyAmount = sub.paymentCycle === 'yearly' ? amount / 12 : amount;
            return total + (sub.status === 'active' ? monthlyAmount : 0);
          }, 0).toLocaleString('ko-KR')}원을 지출하고 있습니다.`,
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          isRead: false,
          priority: 'medium'
        },
        {
          id: 'system-optimization-tip',
          type: 'system',
          title: '구독 최적화 제안',
          message: '중복되거나 사용하지 않는 구독이 있는지 확인해보세요. 월 평균 3-5개의 구독이 적정 수준입니다.',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          isRead: Math.random() > 0.3,
          priority: 'low'
        },
        {
          id: 'system-new-feature',
          type: 'system',
          title: '새로운 기능 추가',
          message: 'Phase 색상 시스템과 카테고리별 분석 기능이 추가되었습니다. 더욱 직관적으로 구독을 관리해보세요.',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          isRead: Math.random() > 0.4,
          priority: 'medium'
        }
      );

      // Sort by priority and date
      generatedNotifications.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      
      setNotifications(generatedNotifications);
    };

    generateNotifications();
  }, [subscriptions, settings.exchangeRate]);

  // Enhanced refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Calculate filtered notifications and enhanced stats
  const { filteredNotifications, stats } = useMemo(() => {
    let filtered = notifications;
    
    switch (filter) {
      case 'unread':
        filtered = notifications.filter(n => !n.isRead);
        break;
      case 'payment':
        filtered = notifications.filter(n => n.type === 'payment');
        break;
      case 'system':
        filtered = notifications.filter(n => n.type === 'system');
        break;
      default:
        filtered = notifications;
    }

    const stats = {
      total: notifications.length,
      unread: notifications.filter(n => !n.isRead).length,
      payment: notifications.filter(n => n.type === 'payment').length,
      system: notifications.filter(n => n.type === 'system').length,
      high: notifications.filter(n => n.priority === 'high').length,
      medium: notifications.filter(n => n.priority === 'medium').length,
      low: notifications.filter(n => n.priority === 'low').length,
      todayPayments: notifications.filter(n => 
        n.type === 'payment' && n.metadata?.daysUntil === 0
      ).length
    };

    return { filteredNotifications: filtered, stats };
  }, [notifications, filter]);

  // Enhanced notification actions
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const deleteSelectedNotifications = () => {
    setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)));
    setSelectedNotifications([]);
  };

  const markSelectedAsRead = () => {
    setNotifications(prev => 
      prev.map(n => selectedNotifications.includes(n.id) ? { ...n, isRead: true } : n)
    );
    setSelectedNotifications([]);
  };

  const toggleSelection = (id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedNotifications(filteredNotifications.map(n => n.id));
  };

  const clearSelection = () => {
    setSelectedNotifications([]);
  };

  // Enhanced notification styling helpers
  const getNotificationIcon = (type: string, priority: string) => {
    if (type === 'payment') {
      return priority === 'high' ? AlertTriangle : CreditCard;
    }
    return type === 'system' ? Info : Bell;
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (type === 'payment') {
      switch (priority) {
        case 'high': return 'text-error-400';
        case 'medium': return 'text-warning-400';
        default: return 'text-white';
      }
    }
    return 'text-info-400';
  };

  const getNotificationBgColor = (type: string, priority: string) => {
    if (type === 'payment') {
      switch (priority) {
        case 'high': return 'bg-error-500/20';
        case 'medium': return 'bg-warning-500/20';
        default: return 'bg-success-500/20';
      }
    }
    return 'bg-info-500/20';
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-error-500/20 text-error-300 border-error-500/30';
      case 'medium':
        return 'bg-warning-500/20 text-warning-300 border-warning-500/30';
      default:
        return 'bg-info-500/20 text-info-300 border-info-500/30';
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}일 전`;
    
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: 'KRW' | 'USD') => {
    const finalAmount = currency === 'USD' ? amount * settings.exchangeRate : amount;
    return finalAmount.toLocaleString('ko-KR') + '원';
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
                className="hidden md:flex text-white/60 hover:text-white hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200 touch-target-sm focus-ring"
              >
                <Home size={16} className="mr-token-xs icon-enhanced text-white" />
                <span className="text-base-ko font-medium text-white-force tracking-ko-normal">대시보드</span>
              </WaveButton>
              
              <div>
                <div className="flex items-center space-x-token-sm mb-token-xs">
                  <h1 className="text-3xl-ko font-bold text-white-force tracking-ko-normal break-keep-ko">알림 센터</h1>
                  {stats.unread > 0 && (
                    <div className="flex items-center space-x-1 px-2 py-1 bg-warning-500/40 border-warning-400/60 shadow-lg shadow-warning-500/30 text-white rounded-full text-xs-ko font-semibold border-2">
                      <Bell size={12} className="icon-enhanced text-white" />
                      <span className="text-white-force tracking-ko-normal">{stats.unread}개 신규</span>
                    </div>
                  )}
                </div>
                <p className="text-base-ko text-white/70 text-high-contrast tracking-ko-normal break-keep-ko">
                  {user?.name || user?.email?.split('@')[0]}님의 알림 • 
                  <span className="ml-2 text-primary-400">
                    총 {stats.total}개 {stats.todayPayments > 0 && `• 오늘 결제 ${stats.todayPayments}건`}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-token-sm">
              <WaveButton
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="hidden md:flex text-white/60 hover:text-white hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200 touch-target-sm focus-ring"
              >
                <RefreshCw size={16} className={cn("mr-token-xs icon-enhanced text-white", isRefreshing && "animate-spin")} />
                <span className="text-base-ko font-medium text-white-force tracking-ko-normal">새로고침</span>
              </WaveButton>

              <Link to="/settings">
                <WaveButton variant="secondary" className="shadow-lg shadow-secondary-500/20 hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200 text-white touch-target focus-ring">
                  <SettingsIcon size={16} className="mr-token-xs icon-enhanced text-white" />
                  <span className="text-base-ko font-medium text-white-force tracking-ko-normal">알림 설정</span>
                </WaveButton>
              </Link>
            </div>
          </div>

          {/* Enhanced Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-token-lg">
            {[
              { 
                key: 'total', 
                label: '전체 알림', 
                count: stats.total, 
                color: 'primary',
                icon: Archive,
                change: null
              },
              { 
                key: 'unread', 
                label: '읽지 않음', 
                count: stats.unread, 
                color: 'warning',
                icon: Bell,
                change: stats.unread > 0 ? 'active' : null
              },
              { 
                key: 'payment', 
                label: '결제 알림', 
                count: stats.payment, 
                color: 'success',
                icon: CreditCard,
                change: stats.todayPayments > 0 ? 'urgent' : null
              },
              { 
                key: 'high', 
                label: '높은 우선순위', 
                count: stats.high, 
                color: 'error',
                icon: AlertTriangle,
                change: stats.high > 0 ? 'attention' : null
              }
            ].map((stat) => {
              const IconComponent = stat.icon;
              const isSelected = (stat.key === 'unread' && filter === 'unread') ||
                               (stat.key === 'payment' && filter === 'payment');
              
              return (
                <GlassCard 
                  key={stat.key} 
                  variant={isSelected ? "strong" : "light"} 
                  className={cn(
                    "p-token-lg cursor-pointer transition-all duration-300 hover:border-white/30 hover:scale-105 group touch-target",
                    isSelected && "ring-1 ring-primary-500/30 shadow-lg",
                    (stat.key === 'unread' || stat.key === 'payment') && "cursor-pointer"
                  )}
                  onClick={() => {
                    if (stat.key === 'unread') setFilter('unread');
                    else if (stat.key === 'payment') setFilter('payment');
                  }}
                >
                  <div className="flex items-center justify-between mb-token-sm">
                    <div className={cn(
                      "p-token-sm rounded-lg",
                      stat.color === 'primary' && "bg-primary-500/20",
                      stat.color === 'warning' && "bg-warning-500/20",
                      stat.color === 'success' && "bg-success-500/20",
                      stat.color === 'error' && "bg-error-500/20"
                    )}>
                      <IconComponent size={20} className={cn(
                        "icon-enhanced",
                        stat.color === 'primary' && "text-primary-400",
                        stat.color === 'warning' && "text-warning-400",
                        stat.color === 'success' && "text-white",
                        stat.color === 'error' && "text-error-400"
                      )} />
                    </div>
                    
                    {stat.change && (
                      <div className={cn(
                        "flex items-center space-x-1 text-xs-ko px-2 py-1 rounded-full tracking-ko-normal",
                        stat.change === 'active' && "bg-warning-500/20 text-warning-300",
                        stat.change === 'urgent' && "bg-error-500/20 text-error-300",
                        stat.change === 'attention' && "bg-error-500/20 text-error-300"
                      )}>
                      <Activity size={12} className="icon-enhanced" />
                        <span className="text-white-force tracking-ko-normal">
                          {stat.change === 'active' ? '신규' :
                           stat.change === 'urgent' ? '오늘' : '주의'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-3xl-ko font-bold text-white-force mb-1 group-hover:scale-105 transition-transform tracking-ko-normal">
                      {stat.count}
                    </p>
                    <p className="text-base-ko text-white/60 tracking-ko-normal break-keep-ko">{stat.label}</p>
                  </div>
                </GlassCard>
              );
            })}
          </div>

          {/* Enhanced Controls */}
          <GlassCard variant="strong" className="p-token-lg">
            <div className="space-y-token-lg">
              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-token-sm">
                {[
                  { key: 'all', label: '전체', count: stats.total, icon: Archive },
                  { key: 'unread', label: '읽지 않음', count: stats.unread, icon: Bell },
                  { key: 'payment', label: '결제 알림', count: stats.payment, icon: CreditCard },
                  { key: 'system', label: '시스템', count: stats.system, icon: Info }
                ].map((tab) => {
                  const IconComponent = tab.icon;
                  const isActive = filter === tab.key;
                  
                  return (
                    <WaveButton
                      key={tab.key}
                      variant={isActive ? "primary" : "ghost"}
                      size="sm"
                      onClick={() => setFilter(tab.key as any)}
                      className={cn(
                        "transition-all duration-200 hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 text-white touch-target-sm focus-ring",
                        isActive && "shadow-lg shadow-primary-500/20"
                      )}
                    >
                      <IconComponent size={14} className="mr-1 icon-enhanced text-white" />
                      <span className="text-sm-ko font-medium text-white-force tracking-ko-normal">{tab.label}</span>
                      {tab.count > 0 && (
                        <span className={cn(
                          "ml-1 px-1.5 py-0.5 rounded-full text-xs-ko font-semibold tracking-ko-normal",
                          isActive
                            ? "bg-white/20 text-white-force"
                            : "bg-white/10 text-white/60"
                        )}>
                          {tab.count}
                        </span>
                      )}
                    </WaveButton>
                  );
                })}
              </div>

              {/* Selection and Actions */}
              <div className="flex items-center justify-between pt-token-md border-t border-white/10">
                <div className="flex items-center space-x-token-md">
                  <p className="text-base-ko text-white/70 tracking-ko-normal break-keep-ko">
                    <span className="text-white-force font-medium">{filteredNotifications.length}개</span> 알림
                    {selectedNotifications.length > 0 && (
                      <span className="text-primary-400 ml-2">
                        • {selectedNotifications.length}개 선택
                      </span>
                    )}
                  </p>

                  {filteredNotifications.length > 0 && (
                    <WaveButton
                      variant="ghost"
                      size="sm"
                      onClick={selectedNotifications.length === filteredNotifications.length ? clearSelection : selectAll}
                      className="text-white/60 hover:text-white hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200 touch-target-sm focus-ring"
                    >
                      <CheckSquare size={14} className="mr-1 icon-enhanced text-white" />
                      <span className="text-sm-ko font-medium text-white-force tracking-ko-normal">
                        {selectedNotifications.length === filteredNotifications.length ? '선택 해제' : '전체 선택'}
                      </span>
                    </WaveButton>
                  )}
                </div>

                <div className="flex items-center space-x-token-sm">
                  {selectedNotifications.length > 0 && (
                    <>
                      <WaveButton
                        variant="ghost"
                        size="sm"
                        onClick={markSelectedAsRead}
                        className="text-white hover:text-white/80 hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200 touch-target-sm focus-ring"
                      >
                        <CheckCircle size={14} className="mr-1 icon-enhanced text-white" />
                        <span className="text-sm-ko font-medium text-white-force tracking-ko-normal">읽음 처리</span>
                      </WaveButton>
                      
                      <WaveButton
                        variant="ghost"
                        size="sm"
                        onClick={deleteSelectedNotifications}
                        className="text-error-400 hover:text-error-300 hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200 touch-target-sm focus-ring"
                      >
                        <Trash2 size={14} className="mr-1 icon-enhanced text-white" />
                        <span className="text-sm-ko font-medium text-white-force tracking-ko-normal">삭제</span>
                      </WaveButton>
                    </>
                  )}
                  
                  {stats.unread > 0 && (
                    <WaveButton
                      variant="secondary"
                      size="sm"
                      onClick={markAllAsRead}
                      className="hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200 touch-target-sm focus-ring"
                    >
                      <Eye size={14} className="mr-1 icon-enhanced text-white" />
                      <span className="text-sm-ko font-medium text-white-force tracking-ko-normal">모두 읽음</span>
                    </WaveButton>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Enhanced Notifications List */}
          {filteredNotifications.length > 0 ? (
            <div className="space-y-token-sm">
              {filteredNotifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type, notification.priority);
                const iconColor = getNotificationColor(notification.type, notification.priority);
                const bgColor = getNotificationBgColor(notification.type, notification.priority);
                const isSelected = selectedNotifications.includes(notification.id);
                const phaseColors = notification.category ? getPhaseColors(getCategoryPhase(notification.category)) : null;
                
                return (
                  <GlassCard 
                    key={notification.id}
                    variant={notification.isRead ? "light" : "strong"}
                    className={cn(
                      "transition-all duration-200 hover:border-white/30 hover:bg-white/5 touch-target",
                      !notification.isRead && "ring-1 ring-primary-500/30",
                      isSelected && "ring-2 ring-primary-500/50 bg-primary-500/10",
                      notification.priority === 'high' && !notification.isRead && "shadow-lg shadow-error-500/20"
                    )}
                  >
                    <div className="p-token-lg">
                      <div className="flex items-start space-x-token-md">
                        {/* Selection Checkbox */}
                        <button
                          onClick={() => toggleSelection(notification.id)}
                          className={cn(
                            "w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 mt-1 touch-target-sm focus-ring",
                            isSelected 
                              ? "bg-primary-500 border-primary-500" 
                              : "border-white/30 hover:border-white/50"
                          )}
                          aria-label={isSelected ? "선택 해제" : "선택"}
                        >
                          {isSelected && <Check size={12} className="text-white icon-enhanced" />}
                        </button>

                        {/* Icon */}
                        <div className={cn(
                          "p-token-sm rounded-lg flex-shrink-0",
                          bgColor
                        )}>
                          <IconComponent size={20} className={cn(iconColor, "icon-enhanced")} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-token-sm">
                            <div className="flex-1">
                              <div className="flex items-center space-x-token-sm mb-1">
                                <h3 className={cn(
                                  "font-medium text-lg-ko tracking-ko-normal break-keep-ko",
                                  notification.isRead ? "text-white/80" : "text-white-force"
                                )}>
                                  {notification.title}
                                </h3>
                                
                                {/* Category Phase Indicator */}
                                {phaseColors && (
                                  <span className={cn("w-2 h-2 rounded-full", phaseColors.bg)}></span>
                                )}
                                
                                {/* Read Status */}
                                {!notification.isRead && (
                                  <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
                                )}
                              </div>
                              
                              <p className={cn(
                                "text-sm-ko break-words tracking-ko-normal",
                                notification.isRead ? "text-white/50" : "text-white/70"
                              )}>
                                {notification.message}
                              </p>
                            </div>

                            {/* Priority Badge */}
                            <span className={cn(
                              "text-xs-ko px-2 py-1 rounded-full border ml-token-md flex-shrink-0 tracking-ko-normal",
                              getPriorityBadgeClass(notification.priority)
                            )}>
                              {notification.priority === 'high' ? '높음' : 
                               notification.priority === 'medium' ? '보통' : '낮음'}
                            </span>
                          </div>

                          {/* Enhanced Metadata */}
                          {notification.metadata && (
                            <div className="mb-token-sm p-token-sm bg-white/5 rounded-lg">
                              <div className="flex items-center justify-between text-sm-ko">
                                {notification.metadata.amount && notification.metadata.currency && (
                                  <div className="flex items-center space-x-token-xs text-white/60">
                                    <DollarSign size={14} className="icon-enhanced" />
                                    <span className="font-medium text-white-force tracking-ko-normal">
                                      {formatCurrency(notification.metadata.amount, notification.metadata.currency)}
                                    </span>
                                    {notification.metadata.currency === 'USD' && (
                                      <span className="text-xs-ko text-white/40 tracking-ko-normal">
                                        (${notification.metadata.amount})
                                      </span>
                                    )}
                                  </div>
                                )}
                                
                                {notification.metadata.daysUntil !== undefined && (
                                  <div className="flex items-center space-x-token-xs text-white/60">
                                    <Clock size={14} className="icon-enhanced" />
                                    <span className={cn(
                                      "font-medium tracking-ko-normal",
                                      notification.metadata.daysUntil === 0 ? "text-error-400" :
                                      notification.metadata.daysUntil <= 3 ? "text-warning-400" : ""
                                    )}>
                                      {notification.metadata.daysUntil === 0 ? '오늘' : 
                                       notification.metadata.daysUntil === 1 ? '내일' :
                                       `${notification.metadata.daysUntil}일 후`}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Footer */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-token-sm text-xs-ko text-white/40 tracking-ko-normal">
                              <span>{formatRelativeTime(notification.date)}</span>
                              {notification.category && (
                                <>
                                  <span>•</span>
                                  <span className="break-keep-ko">{notification.category}</span>
                                </>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-1">
                              {!notification.isRead && (
                                <WaveButton
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1.5 text-white hover:text-white/80 hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200 touch-target-sm focus-ring"
                                  ariaLabel="읽음 처리"
                                >
                                  <Check size={14} className="icon-enhanced" />
                                </WaveButton>
                              )}
                              
                              {notification.subscriptionId && (
                                <Link to={`/subscriptions/${notification.subscriptionId}`}>
                                  <WaveButton
                                    variant="ghost"
                                    size="sm"
                                    className="p-1.5 text-primary-400 hover:text-primary-300 hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200 touch-target-sm focus-ring"
                                    ariaLabel="구독 상세보기"
                                  >
                                    <Eye size={14} className="icon-enhanced" />
                                  </WaveButton>
                                </Link>
                              )}
                              
                              <WaveButton
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNotification(notification.id)}
                                className="p-1.5 text-white/40 hover:text-error-400 hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200 touch-target-sm focus-ring"
                                ariaLabel="삭제"
                              >
                                <Trash2 size={14} className="icon-enhanced" />
                              </WaveButton>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          ) : (
            /* Enhanced Empty State */
            <GlassCard variant="light" className="p-token-2xl">
              <div className="text-center max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-full flex items-center justify-center mx-auto mb-token-lg">
                  {filter === 'all' ? (
                    <Bell size={40} className="text-white/40 icon-enhanced" />
                  ) : filter === 'payment' ? (
                    <CreditCard size={40} className="text-white/40 icon-enhanced" />
                  ) : filter === 'system' ? (
                    <Info size={40} className="text-white/40 icon-enhanced" />
                  ) : (
                    <EyeOff size={40} className="text-white/40 icon-enhanced" />
                  )}
                </div>
                
                <h3 className="text-xl-ko font-semibold mb-token-sm text-white-force tracking-ko-normal break-keep-ko">
                  {filter === 'all' ? '알림이 없습니다' : 
                   filter === 'unread' ? '읽지 않은 알림이 없습니다' :
                   filter === 'payment' ? '결제 알림이 없습니다' :
                   '시스템 알림이 없습니다'}
                </h3>
                
                <p className="text-base-ko text-white/60 mb-token-lg leading-relaxed tracking-ko-normal break-keep-ko">
                  {filter === 'all' ? 
                    '새로운 알림이 도착하면 여기에 표시됩니다.\n구독 활동에 따라 자동으로 생성됩니다.' :
                    '조건에 맞는 알림이 없습니다.\n다른 필터를 확인해보세요.'
                  }
                </p>
                
                <div className="flex justify-center space-x-token-sm">
                  {filter !== 'all' ? (
                    <WaveButton
                      variant="secondary"
                      onClick={() => setFilter('all')}
                      className="hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200 touch-target focus-ring"
                    >
                      <Archive size={16} className="mr-token-xs icon-enhanced text-white" />
                      <span className="text-base-ko font-medium text-white-force tracking-ko-normal">전체 알림 보기</span>
                    </WaveButton>
                  ) : (
                    <Link to="/dashboard">
                      <WaveButton variant="primary" className="shadow-lg shadow-primary-500/20 hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200 text-white touch-target focus-ring">
                        <Home size={16} className="mr-token-xs icon-enhanced text-white" />
                        <span className="text-base-ko font-medium text-white-force tracking-ko-normal">대시보드로 이동</span>
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