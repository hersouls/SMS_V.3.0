import { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { GlassCard } from './GlassCard';
import { WaveButton } from './WaveButton';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useLoadingState } from '../hooks/useLoadingState';
import { useNotifications } from '../hooks/useNotifications';
import { notificationMonitor } from '../utils/notificationMonitor';
import { 
  Bell, 
  Check, 
  CheckCircle,
  Clock,
  CreditCard,
  Trash2,
  Settings as SettingsIcon,
  DollarSign,
  Info,
  RefreshCw,
  Archive,
  Eye,
  EyeOff,
  Home,
  Activity,
  AlertTriangle,
  CheckSquare
} from 'lucide-react';
import { getPhaseColors, PhaseType } from '../utils/phaseColors';
import { cn } from './ui/utils';
import { VirtualizedList } from './VirtualizedList';
import { NotificationItem } from './NotificationItem';
import { useMemoizedCallback } from '../hooks/useMemoizedCallback';
import { withPerformanceOptimization } from '../utils/performance';

// 기존 로컬 Notification 인터페이스는 제거하고 통합 타입 사용
import { NotificationUI } from '../types/notifications';

export function Notifications() {
  const { user } = useAuth();
  const { subscriptions, preferences, loading: dataLoading } = useData();
  const { handleError } = useErrorHandler();
  const { isLoading, withLoading } = useLoadingState();
  const navigate = useNavigate();
  
  // 통합 알림 훅 사용
  const {
    notifications,
    filteredNotifications,
    stats,
    loading: notificationsLoading,
    error: notificationError,
    filter,
    setFilter,
    selectedNotifications,
    setSelectedNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteSelected,
    markSelectedAsRead,
    refresh,
    toggleSelection,
    selectAll,
    clearSelection,
    hasPermission,
    requestPermission
  } = useNotifications();

  // 구독 데이터 변경 시 모니터링 시스템에 알림
  useEffect(() => {
    if (!user?.uid || !subscriptions) return;
    
    // 구독 변경 사항을 모니터링 시스템에 알림
    subscriptions.forEach(subscription => {
      if (subscription.id) {
        // 이전 상태와 비교해서 변경 사항이 있으면 이벤트 발생
        // 현재는 간단히 결제 예정일만 확인
        notificationMonitor.checkPaymentDue(user.uid, [subscription]);
      }
    });
  }, [user?.uid, subscriptions]);


  // 권한 요청 처리
  const handlePermissionRequest = async () => {
    const granted = await requestPermission();
    if (granted) {
      console.log('✅ 알림 권한이 허용되었습니다.');
    } else {
      console.log('❌ 알림 권한이 거부되었습니다.');
    }
  };

  // Enhanced refresh function with memoization
  const handleRefresh = useMemoizedCallback(async () => {
    await withLoading('refresh', async () => {
      try {
        await refresh();
        console.log('✅ 알림 새로고침 완료');
      } catch (error) {
        handleError(error, '알림 새로고침에 실패했습니다.');
      }
    });
  }, [refresh, withLoading, handleError]);

  // 에러 처리
  useEffect(() => {
    if (notificationError) {
      handleError(notificationError, notificationError.message);
    }
  }, [notificationError, handleError]);

  // 메모이제이션된 날짜 포맷팅 함수

  const formatRelativeTime = useCallback((dateString: string) => {
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
  }, []);

  const formatCurrency = useCallback((amount: number, currency: 'KRW' | 'USD') => {
    const finalAmount = currency === 'USD' ? amount * (preferences?.exchangeRate || 1) : amount;
    return finalAmount.toLocaleString('ko-KR') + '원';
  }, [preferences?.exchangeRate]);

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
                    총 {stats.total}개 {stats.todayCount > 0 && `• 오늘 알림 ${stats.todayCount}건`}
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
                className="hidden md:flex text-white/60 hover:text-white hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200 touch-target-sm focus-ring"
              >
                <RefreshCw size={16} className={cn("mr-token-xs icon-enhanced text-white", isLoading('refresh') && "animate-spin")} />
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
                count: stats.byType.payment, 
                color: 'success',
                icon: CreditCard,
                change: stats.todayCount > 0 ? 'urgent' : null
              },
              { 
                key: 'high', 
                label: '높은 우선순위', 
                count: stats.byPriority.high, 
                color: 'error',
                icon: AlertTriangle,
                change: stats.byPriority.high > 0 ? 'attention' : null
              }
            ].map((stat) => {
              const IconComponent = stat.icon;
              const isSelected = (stat.key === 'unread' && filter.status === 'unread') ||
                               (stat.key === 'payment' && filter.type === 'payment');
              
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
                    if (stat.key === 'unread') setFilter({ ...filter, status: 'unread', type: 'all' });
                    else if (stat.key === 'payment') setFilter({ ...filter, type: 'payment', status: 'all' });
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
                  { key: 'payment', label: '결제 알림', count: stats.byType.payment, icon: CreditCard },
                  { key: 'system', label: '시스템', count: stats.byType.system, icon: Info }
                ].map((tab) => {
                  const IconComponent = tab.icon;
                  const isActive = filter.type === tab.key || (tab.key === 'all' && (!filter.type || filter.type === 'all'));
                  
                  return (
                    <WaveButton
                      key={tab.key}
                      variant={isActive ? "primary" : "ghost"}
                      size="sm"
                      onClick={() => setFilter({ 
                        ...filter, 
                        type: tab.key === 'all' ? 'all' : tab.key as any,
                        status: tab.key === 'unread' ? 'unread' : filter.status
                      })}
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
                        onClick={deleteSelected}
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
            filteredNotifications.length > 50 ? (
              // 50개 이상의 알림은 가상화된 리스트 사용
              <VirtualizedList
                items={filteredNotifications}
                itemHeight={200} // 대략적인 알림 아이템 높이
                containerHeight={800} // 컨테이너 높이
                className="space-y-token-sm"
                renderItem={(notification, index) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    isSelected={selectedNotifications.includes(notification.id)}
                    onToggleSelection={toggleSelection}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                    formatCurrency={formatCurrency}
                    formatRelativeTime={formatRelativeTime}
                  />
                )}
              />
            ) : (
              // 50개 이하는 일반 리스트 사용
              <div className="space-y-token-sm">
                {filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    isSelected={selectedNotifications.includes(notification.id)}
                    onToggleSelection={toggleSelection}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                    formatCurrency={formatCurrency}
                    formatRelativeTime={formatRelativeTime}
                  />
                ))}
              </div>
            )
          ) : (
            /* Enhanced Empty State */
            <GlassCard variant="light" className="p-token-2xl">
              <div className="text-center max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-full flex items-center justify-center mx-auto mb-token-lg">
                  {(!filter.type || filter.type === 'all') ? (
                    <Bell size={40} className="text-white/40 icon-enhanced" />
                  ) : filter.type === 'payment' ? (
                    <CreditCard size={40} className="text-white/40 icon-enhanced" />
                  ) : filter.type === 'system' ? (
                    <Info size={40} className="text-white/40 icon-enhanced" />
                  ) : (
                    <EyeOff size={40} className="text-white/40 icon-enhanced" />
                  )}
                </div>
                
                <h3 className="text-xl-ko font-semibold mb-token-sm text-white-force tracking-ko-normal break-keep-ko">
                  {(!filter.type || filter.type === 'all') && (!filter.status || filter.status === 'all') ? '알림이 없습니다' : 
                   filter.status === 'unread' ? '읽지 않은 알림이 없습니다' :
                   filter.type === 'payment' ? '결제 알림이 없습니다' :
                   filter.type === 'system' ? '시스템 알림이 없습니다' :
                   '조건에 맞는 알림이 없습니다'}
                </h3>
                
                <p className="text-base-ko text-white/60 mb-token-lg leading-relaxed tracking-ko-normal break-keep-ko">
                  {(!filter.type || filter.type === 'all') && (!filter.status || filter.status === 'all') ? 
                    '새로운 알림이 도착하면 여기에 표시됩니다.\n구독 활동에 따라 자동으로 생성됩니다.' :
                    '조건에 맞는 알림이 없습니다.\n다른 필터를 확인해보세요.'
                  }
                </p>
                
                <div className="flex justify-center space-x-token-sm">
                  {(filter.type && filter.type !== 'all') || (filter.status && filter.status !== 'all') ? (
                    <WaveButton
                      variant="secondary"
                      onClick={() => setFilter({ type: 'all', status: 'all' })}
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