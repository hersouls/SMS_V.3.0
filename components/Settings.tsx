import { useState, useEffect } from 'react';
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
  User,
  DollarSign,
  Bell,
  Shield,
  LogOut,
  Save,
  Check,
  AlertTriangle,
  Settings as SettingsIcon,
  Info,
  Eye,
  Trash2,
  RefreshCw,
  Globe,
  Home,
  Mail,
  Calendar,
  BarChart3,
  TrendingUp,
  Activity,
  Zap,
  Archive,
  Download,
  ExternalLink,
  Target,
  Award,
  Sparkles,
  X,
  Heart,
  PieChart
} from 'lucide-react';
import { cn } from './ui/utils';

export function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { preferences, updatePreferences, subscriptions } = useData();
  const { handleError } = useErrorHandler();
  const { isLoading, withLoading } = useLoadingState();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Default preferences structure
  const defaultPreferences = {
    exchangeRate: 1300,
    defaultCurrency: 'KRW' as const,
    notifications: {
      paymentReminders: true,
      priceChanges: true,
      subscriptionExpiry: true,
      email: true,
      push: true,
      sms: false
    },
    theme: 'dark' as const,
    language: 'ko' as const,
    timezone: 'Asia/Seoul',
    dateFormat: 'YYYY-MM-DD',
    currencyFormat: 'KRW'
  };
  
  // State management - use preferences or default values
  const [localSettings, setLocalSettings] = useState(preferences || defaultPreferences);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteCountdown, setDeleteCountdown] = useState(0);
  const [activeSection, setActiveSection] = useState<'profile' | 'currency' | 'notifications' | 'security' | 'advanced'>('profile');


  // Update local settings when global settings change
  useEffect(() => {
    if (preferences) {
      setLocalSettings(preferences);
    }
  }, [preferences]);

  // Delete confirmation countdown
  useEffect(() => {
    if (deleteCountdown > 0) {
      const timer = setTimeout(() => setDeleteCountdown(deleteCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showDeleteConfirm && deleteCountdown === 0) {
      setShowDeleteConfirm(false);
    }
  }, [deleteCountdown, showDeleteConfirm]);

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

  const handleSettingsUpdate = async (newSettings: Partial<typeof defaultPreferences>) => {
    await withLoading('save', async () => {
      try {
        setSaveStatus('saving');
        await updatePreferences(newSettings);
        setLocalSettings((prev) => ({ ...prev, ...newSettings }));
        setSaveStatus('saved');
        console.log('✅ 설정이 성공적으로 저장되었습니다.');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        setSaveStatus('error');
        handleError(error, '설정 저장에 실패했습니다.');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }
    });
  };

  // 더 정확한 설정 변경 감지 함수
  const hasSettingsChanged = () => {
    const hasChanged = (
      localSettings.exchangeRate !== (preferences?.exchangeRate || defaultPreferences.exchangeRate) ||
      JSON.stringify(localSettings.notifications) !== JSON.stringify(preferences?.notifications || defaultPreferences.notifications)
    );
    console.log('Settings changed:', hasChanged, {
      localExchangeRate: localSettings.exchangeRate,
      globalExchangeRate: preferences?.exchangeRate || defaultPreferences.exchangeRate,
      localNotifications: localSettings.notifications,
      globalNotifications: preferences?.notifications || defaultPreferences.notifications
    });
    return hasChanged;
  };

  const handleExchangeRateChange = (rate: number) => {
    // 환율 유효성 검사 강화
    if (rate <= 0) {
      alert('환율은 0보다 커야 합니다.');
      return;
    }
    if (rate > 10000) {
      alert('환율은 10,000 이하여야 합니다.');
      return;
    }
    
    setLocalSettings(prev => ({ ...prev, exchangeRate: rate }));
    
    // 환율 변경 시 즉시 저장
    handleSettingsUpdate({ exchangeRate: rate });
  };

  const handleNotificationChange = (key: keyof typeof defaultPreferences.notifications, value: boolean) => {
    const updatedNotifications = { ...localSettings.notifications, [key]: value };
    setLocalSettings((prev) => ({ ...prev, notifications: updatedNotifications }));
    
    // 알림 설정 변경 시 즉시 저장
    handleSettingsUpdate({ notifications: updatedNotifications });
    
    // 브라우저 알림 권한 요청 (필요한 경우)
    if (value && key === 'paymentReminders') {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  };

  const handleLogout = async () => {
    console.log('🔑 로그아웃 시작');
    setIsLoggingOut(true);
    
    // 타임아웃 설정 (10초)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('로그아웃 타임아웃')), 10000);
    });
    
    try {
      console.log('🔑 signOut 함수 호출');
      const result = await Promise.race([
        signOut(),
        timeoutPromise
      ]);
      console.log('🔑 signOut 결과:', result);
      
      if (result.success) {
        console.log('✅ 로그아웃 성공, 로그인 페이지로 이동');
        navigate('/login');
      } else {
        console.error('❌ 로그아웃 실패:', result.error);
        setSaveStatus('error');
        setIsLoggingOut(false);
      }
    } catch (error) {
      console.error('❌ 로그아웃 중 예외 발생:', error);
      setSaveStatus('error');
      setIsLoggingOut(false);
    }
  };

  const handleDeleteAccount = () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      setDeleteCountdown(10);
    } else {
      // In a real app, this would call an API to delete the account
      // Use proper notification instead of alert
      setShowDeleteConfirm(false);
      setDeleteCountdown(0);
      
      // Show a proper notification/toast message
      console.log('계정 삭제 기능은 데모에서는 사용할 수 없습니다.');
      
      // In production, you would:
      // await deleteUserAccount();
      // navigate('/login');
    }
  };

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <RefreshCw size={16} className="animate-spin text-primary-400" />;
      case 'saved':
        return <Check size={16} className="text-white" />;
      case 'error':
        return <X size={16} className="text-error-400" />;
      default:
        return null;
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving': return '저장 중...';
      case 'saved': return '저장됨';
      case 'error': return '저장 실패';
      default: return '';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateStats = () => {
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
    const pausedSubscriptions = subscriptions.filter(sub => sub.status === 'paused');
    const cancelledSubscriptions = subscriptions.filter(sub => sub.status === 'cancelled');
    
    const monthlyTotal = activeSubscriptions.reduce((total, sub) => {
      const amount = sub.currency === 'USD' ? sub.amount * localSettings.exchangeRate : sub.amount;
      return total + (sub.paymentCycle === 'monthly' ? amount : amount / 12);
    }, 0);

    const yearlyTotal = monthlyTotal * 12;
    const averagePerSubscription = activeSubscriptions.length > 0 ? monthlyTotal / activeSubscriptions.length : 0;

    // Calculate savings if switching yearly subscriptions to monthly equivalents
    const yearlySavings = activeSubscriptions
      .filter(sub => sub.paymentCycle === 'yearly')
      .reduce((savings, sub) => {
        const amount = sub.currency === 'USD' ? sub.amount * localSettings.exchangeRate : sub.amount;
        const monthlyEquivalent = (amount / 12) * 12; // What it would cost monthly
        const actualYearly = amount;
        return savings + (monthlyEquivalent - actualYearly);
      }, 0);

    return {
      total: subscriptions.length,
      active: activeSubscriptions.length,
      paused: pausedSubscriptions.length,
      cancelled: cancelledSubscriptions.length,
      monthlyTotal,
      yearlyTotal,
      averagePerSubscription,
      yearlySavings
    };
  };

  const stats = calculateStats();

  const sections = [
    { key: 'profile', label: '프로필', icon: User, color: 'primary' },
    { key: 'currency', label: '환율', icon: DollarSign, color: 'success' },
    { key: 'notifications', label: '알림', icon: Bell, color: 'warning' },
    { key: 'security', label: '보안', icon: Shield, color: 'error' },
    { key: 'advanced', label: '고급', icon: SettingsIcon, color: 'secondary' }
  ];

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
                className="hidden md:flex text-white-force/60 hover:text-white-force hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200"
              >
                <Home size={16} className="mr-token-xs text-white-force icon-enhanced" />
                대시보드
              </WaveButton>
              
              <div>
                <div className="flex items-center space-x-token-sm mb-token-xs">
                  <h1 className="text-3xl font-bold text-white-force">설정</h1>
                  {saveStatus !== 'idle' && (
                    <div className="flex items-center space-x-token-xs px-2 py-1 rounded-full bg-white/10">
                      {getSaveStatusIcon()}
                      <span className={cn(
                        "text-xs",
                        saveStatus === 'saved' && "text-white-force",
                        saveStatus === 'error' && "text-red-400",
                        saveStatus === 'saving' && "text-primary-400"
                      )}>
                        {getSaveStatusText()}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-white-force/70">
                  {user?.name || user?.email?.split('@')[0]}님의 계정 설정 • 
                  <span className="ml-2 text-primary-400">
                    {stats.active}개 활성 구독 • 월 {stats.monthlyTotal.toLocaleString('ko-KR')}원
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
                className="hidden md:flex text-white-force/60 hover:text-white-force hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200"
                aria-label={isLoading('refresh') ? "데이터 새로고침 중..." : "데이터 새로고침"}
              >
                <RefreshCw size={16} className={cn("mr-token-xs text-white-force icon-enhanced", isLoading('refresh') && "animate-spin")} />
                새로고침
              </WaveButton>

              <WaveButton 
                variant="primary" 
                onClick={() => {
                  const changedSettings: Partial<typeof defaultPreferences> = {};
                  if (localSettings.exchangeRate !== (preferences?.exchangeRate || defaultPreferences.exchangeRate)) {
                    changedSettings.exchangeRate = localSettings.exchangeRate;
                  }
                  if (JSON.stringify(localSettings.notifications) !== JSON.stringify(preferences?.notifications || defaultPreferences.notifications)) {
                    changedSettings.notifications = localSettings.notifications;
                  }
                  handleSettingsUpdate(changedSettings);
                }}
                disabled={!hasSettingsChanged() || saveStatus === 'saving'}
                className="shadow-lg shadow-primary-500/20 hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200"
              >
                <Save size={16} className="mr-token-xs text-white-force icon-enhanced" />
                {saveStatus === 'saving' ? '저장 중...' : '변경사항 저장'}
              </WaveButton>
            </div>
          </div>

          {/* Enhanced Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-token-lg">
            {[
              {
                key: 'total',
                label: '총 구독',
                value: stats.total,
                subtext: `${stats.active}개 활성`,
                icon: Archive,
                color: 'primary',
                change: null
              },
              {
                key: 'monthly',
                label: '월간 지출',
                value: `${stats.monthlyTotal.toLocaleString('ko-KR')}원`,
                subtext: `평균 ${stats.averagePerSubscription.toLocaleString('ko-KR')}원`,
                icon: TrendingUp,
                color: 'success',
                change: null
              },
              {
                key: 'savings',
                label: '연간 절약',
                value: `${stats.yearlySavings.toLocaleString('ko-KR')}원`,
                subtext: '연간 구독 할인',
                icon: Target,
                color: 'warning',
                change: stats.yearlySavings > 0 ? 'positive' : null
              },
              {
                key: 'efficiency',
                label: '구독 효율성',
                value: `${Math.round((stats.active / Math.max(stats.total, 1)) * 100)}%`,
                subtext: `${stats.paused + stats.cancelled}개 비활성`,
                icon: Activity,
                color: 'secondary',
                change: null
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
                        stat.color === 'success' && "text-white",
                        stat.color === 'warning' && "text-yellow-400",
                        stat.color === 'secondary' && "text-blue-400"
                      )} />
                    </div>
                    
                    {stat.change && (
                                              <div className="flex items-center space-x-1 text-xs text-white-force">
                        <TrendingUp size={12} className="icon-enhanced text-white-force" />
                        <span>절약</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-2xl font-bold text-white-force mb-1 group-hover:scale-105 transition-transform">
                      {stat.value}
                    </p>
                    <p className="text-white-force/60 text-sm-ko">{stat.label}</p>
                    <p className="text-white-force/50 text-xs mt-1">{stat.subtext}</p>
                  </div>
                </GlassCard>
              );
            })}
          </div>

          {/* Enhanced Navigation Tabs */}
          <GlassCard variant="strong" className="p-token-lg">
            <div className="flex flex-wrap gap-token-xs">
              {sections.map((section) => {
                const IconComponent = section.icon;
                const isActive = activeSection === section.key;
                
                return (
                  <WaveButton
                    key={section.key}
                    variant={isActive ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setActiveSection(section.key as any)}
                    className={cn(
                      "transition-all duration-200 hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50",
                      isActive && "shadow-lg shadow-primary-500/20"
                    )}
                  >
                    <IconComponent size={14} className="mr-1 text-white-force icon-enhanced" />
                    {section.label}
                  </WaveButton>
                );
              })}
            </div>
          </GlassCard>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-token-xl">
            
            {/* Main Content */}
            <div className="xl:col-span-3 space-y-token-lg">
              
              {/* Profile Section */}
              {activeSection === 'profile' && (
                <GlassCard variant="strong" className="p-token-lg">
                  <div className="flex items-center space-x-token-sm mb-token-lg">
                    <div className="p-token-sm bg-primary-500/20 rounded-lg">
                      <User size={20} className="text-primary-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white-force">프로필 정보</h2>
                      <p className="text-white-force/60 text-sm-ko">계정 정보를 관리합니다</p>
                    </div>
                  </div>

                  <div className="space-y-token-lg">
                    {/* Enhanced User Avatar */}
                    <div className="flex items-center space-x-token-lg">
                      <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-lg">
                          <User size={32} className="text-white-force icon-enhanced" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success-500 rounded-full flex items-center justify-center border-2 border-background">
                          <Check size={12} className="text-white-force icon-enhanced" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white-force mb-1">
                          {user?.name || user?.email?.split('@')[0]}
                        </h3>
                        <p className="text-white-force/60 mb-2">Moonwave 사용자</p>
                        <div className="flex items-center space-x-token-sm">
                          <div className="px-2 py-1 bg-primary-500/40 border-primary-400/60 shadow-lg shadow-primary-500/30 text-white rounded-full text-xs font-semibold border-2">
                            Premium
                          </div>
                                                      <div className="px-2 py-1 bg-success-500/40 border-success-400/60 shadow-lg shadow-success-500/30 text-white rounded-full text-xs font-semibold border-2">
                            인증됨
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Profile Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-token-md">
                      <div className="p-token-md glass-light rounded-lg border border-white/10">
                        <div className="flex items-center space-x-token-sm mb-token-sm">
                          <Mail size={16} className="text-info-400 icon-enhanced" />
                          <label className="text-white-force/60 text-sm-ko">이메일 주소</label>
                        </div>
                        <p className="text-white-force font-medium">{user?.email}</p>
                        <div className="flex items-center space-x-1 mt-1">
                                                  <Check size={12} className="text-white-force icon-enhanced" />
                        <span className="text-white-force text-xs">인증 완료</span>
                        </div>
                      </div>

                      <div className="p-token-md glass-light rounded-lg border border-white/10">
                        <div className="flex items-center space-x-token-sm mb-token-sm">
                          <Calendar size={16} className="text-warning-400 icon-enhanced" />
                          <label className="text-white-force/60 text-sm-ko">가입일</label>
                        </div>
                        <p className="text-white-force font-medium">
                          {user?.joinDate ? formatDate(user.joinDate) : '알 수 없음'}
                        </p>
                        <p className="text-white-force/50 text-xs mt-1">
                          {user?.joinDate ? `${Math.floor((new Date().getTime() - new Date(user.joinDate).getTime()) / (1000 * 60 * 60 * 24))}일 전` : ''}
                        </p>
                      </div>

                      {user?.name && (
                        <div className="p-token-md glass-light rounded-lg border border-white/10">
                                                  <div className="flex items-center space-x-token-sm mb-token-sm">
                          <User size={16} className="text-secondary-400 icon-enhanced" />
                          <label className="text-white-force/60 text-sm-ko">이름</label>
                        </div>
                        <p className="text-white-force font-medium">{user.name}</p>
                        </div>
                      )}

                      <div className="p-token-md glass-light rounded-lg border border-white/10">
                        <div className="flex items-center space-x-token-sm mb-token-sm">
                          <Activity size={16} className="text-white-force icon-enhanced" />
                          <label className="text-white-force/60 text-sm-ko">활성 구독</label>
                        </div>
                        <p className="text-white-force font-medium">{stats.active}개</p>
                        <p className="text-white-force/50 text-xs mt-1">
                          총 {stats.total}개 중
                        </p>
                      </div>
                    </div>

                    {/* Account Preferences */}
                    <div className="p-token-md bg-info-500/10 border border-info-500/20 rounded-lg">
                      <div className="flex items-start space-x-token-sm">
                        <Info size={16} className="text-info-400 mt-0.5 flex-shrink-0 icon-enhanced" />
                        <div className="text-sm">
                          <p className="text-info-300 font-medium mb-1">계정 관리 팁</p>
                          <p className="text-info-200/80 text-high-contrast">
                            정기적으로 구독 현황을 점검하고, 사용하지 않는 서비스는 정리하여 
                            불필요한 지출을 줄일 수 있습니다.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* Enhanced Currency Section */}
              {activeSection === 'currency' && (
                <GlassCard variant="strong" className="p-token-lg">
                  <div className="flex items-center space-x-token-sm mb-token-lg">
                    <div className="p-token-sm bg-success-500/20 rounded-lg">
                                              <DollarSign size={20} className="text-white-force icon-enhanced" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white-force">환율 설정</h2>
                      <p className="text-white-force/60 text-sm-ko">USD 구독의 원화 표시를 위한 환율을 설정합니다</p>
                    </div>
                  </div>

                  <div className="space-y-token-lg">
                    {/* Enhanced Exchange Rate Input */}
                    <div className="p-token-lg glass-light rounded-xl border border-white/10">
                      <label className="text-white-force font-medium mb-token-md block">USD → KRW 환율</label>
                      <div className="flex items-center space-x-token-md">
                        <div className="flex-1 relative">
                          <div className="absolute left-token-md top-1/2 -translate-y-1/2 text-white-force font-medium">
                            $1 =
                          </div>
                          <input
                            type="number"
                            value={localSettings.exchangeRate}
                            onChange={(e) => handleExchangeRateChange(parseFloat(e.target.value) || 0)}
                            onBlur={() => handleSettingsUpdate({ exchangeRate: localSettings.exchangeRate })}
                            className="w-full pl-16 pr-16 py-token-md text-xl font-bold bg-white/5 border border-white/10 rounded-lg text-white-force placeholder:text-white-force/40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-target"
                            min="1"
                            max="9999"
                            step="1"
                          />
                          <div className="absolute right-token-md top-1/2 -translate-y-1/2 text-white-force font-medium">
                            원
                          </div>
                        </div>
                        <WaveButton
                          variant="primary"
                          onClick={() => handleSettingsUpdate({ exchangeRate: localSettings.exchangeRate })}
                          disabled={localSettings.exchangeRate === (preferences?.exchangeRate || defaultPreferences.exchangeRate) || localSettings.exchangeRate <= 0}
                          className="px-token-lg hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200 touch-target"
                        >
                          <Save size={16} className="mr-token-xs text-white-force icon-enhanced" />
                          적용
                        </WaveButton>
                      </div>
                      
                      {/* Exchange Rate Preview */}
                      <div className="mt-token-md p-token-md bg-primary-500/10 border border-primary-500/20 rounded-lg">
                        <div className="grid grid-cols-3 gap-token-md text-center">
                          <div>
                            <p className="text-primary-300 text-xs">$10</p>
                            <p className="text-white-force font-medium">{(localSettings.exchangeRate * 10).toLocaleString('ko-KR')}원</p>
                          </div>
                          <div>
                            <p className="text-primary-300 text-xs">$50</p>
                            <p className="text-white-force font-medium">{(localSettings.exchangeRate * 50).toLocaleString('ko-KR')}원</p>
                          </div>
                          <div>
                            <p className="text-primary-300 text-xs">$100</p>
                            <p className="text-white-force font-medium">{(localSettings.exchangeRate * 100).toLocaleString('ko-KR')}원</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Exchange Rate Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-token-md">
                      <div className="p-token-md glass-light rounded-lg border border-white/10">
                        <div className="flex items-center space-x-token-sm mb-token-sm">
                          <Globe size={16} className="text-info-400 icon-enhanced" />
                          <span className="text-white-force/60 text-sm-ko">현재 설정</span>
                        </div>
                        <p className="text-white-force font-bold text-lg">
                          {localSettings.exchangeRate.toLocaleString('ko-KR')}원
                        </p>
                        <p className="text-info-400 text-xs">1 USD 기준</p>
                      </div>

                      <div className="p-token-md glass-light rounded-lg border border-white/10">
                        <div className="flex items-center space-x-token-sm mb-token-sm">
                          <TrendingUp size={16} className="text-white-force icon-enhanced" />
                          <span className="text-white-force/60 text-sm-ko">월 총 지출</span>
                        </div>
                        <p className="text-white-force font-bold text-lg">
                          {stats.monthlyTotal.toLocaleString('ko-KR')}원
                        </p>
                        <p className="text-white-force text-xs">환율 적용 후</p>
                      </div>

                      <div className="p-token-md glass-light rounded-lg border border-white/10">
                        <div className="flex items-center space-x-token-sm mb-token-sm">
                          <RefreshCw size={16} className="text-warning-400 icon-enhanced" />
                          <span className="text-white-force/60 text-sm-ko">업데이트</span>
                        </div>
                        <p className="text-white-force font-bold text-lg">실시간</p>
                        <p className="text-warning-400 text-xs">자동 계산</p>
                      </div>
                    </div>

                    {/* Impact Analysis */}
                    <div className="p-token-lg bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-500/20 rounded-xl">
                      <div className="flex items-center space-x-token-sm mb-token-md">
                        <BarChart3 size={20} className="text-primary-400 icon-enhanced" />
                        <h3 className="text-white-force font-semibold">환율 영향 분석</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-token-md">
                        <div>
                          <p className="text-white-force/70 text-sm-ko mb-2">USD 구독 개수</p>
                          <p className="text-2xl font-bold text-white-force">
                            {subscriptions.filter(sub => sub.currency === 'USD').length}개
                          </p>
                        </div>
                        <div>
                          <p className="text-white-force/70 text-sm-ko mb-2">USD 구독 월 총액</p>
                          <p className="text-2xl font-bold text-primary-400">
                            {subscriptions
                              .filter(sub => sub.currency === 'USD' && sub.status === 'active')
                              .reduce((total, sub) => {
                                const monthlyAmount = sub.paymentCycle === 'yearly' ? sub.amount / 12 : sub.amount;
                                return total + monthlyAmount;
                              }, 0)
                              .toFixed(2)} USD
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-token-md bg-info-500/10 border border-info-500/20 rounded-lg">
                      <div className="flex items-start space-x-token-sm">
                        <Info size={16} className="text-info-400 mt-0.5 flex-shrink-0 icon-enhanced" />
                        <div className="text-sm">
                          <p className="text-info-300 font-medium mb-1">환율 설정 안내</p>
                          <p className="text-info-200/80 text-high-contrast">
                            설정한 환율은 USD 구독 서비스의 한화 표시에만 사용됩니다. 
                            실제 결제 시에는 카드사나 결제 서비스의 환율이 적용됩니다.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* Enhanced Notifications Section */}
              {activeSection === 'notifications' && (
                <GlassCard variant="strong" className="p-token-lg">
                  <div className="flex items-center space-x-token-sm mb-token-lg">
                    <div className="p-token-sm bg-warning-500/20 rounded-lg">
                      <Bell size={20} className="text-warning-400 icon-enhanced" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white-force">알림 설정</h2>
                      <p className="text-white-force/60 text-sm-ko">구독 관련 알림을 관리합니다</p>
                    </div>
                  </div>

                  <div className="space-y-token-lg">
                    {/* Enhanced Notification Settings */}
                    {[
                      {
                        key: 'paymentReminders' as keyof typeof defaultPreferences.notifications,
                        title: '결제 예정 알림',
                        description: '구독 결제일 전에 미리 알림을 받습니다',
                        icon: Calendar,
                        color: 'primary',
                        importance: 'high'
                      },
                      {
                        key: 'priceChanges' as keyof typeof defaultPreferences.notifications,
                        title: '가격 변동 알림',
                        description: '구독 서비스의 가격이 변경될 때 알림을 받습니다',
                        icon: TrendingUp,
                        color: 'warning',
                        importance: 'medium'
                      },
                      {
                        key: 'subscriptionExpiry' as keyof typeof defaultPreferences.notifications,
                        title: '구독 만료 알림',
                        description: '구독이 만료되기 전에 미리 알림을 받습니다',
                        icon: AlertTriangle,
                        color: 'error',
                        importance: 'high'
                      }
                    ].map((notification) => {
                      const IconComponent = notification.icon;
                      const isEnabled = localSettings.notifications[notification.key];
                      
                      return (
                        <div key={notification.key} className={cn(
                          "p-token-lg glass-light rounded-xl border transition-all duration-200",
                          isEnabled ? "border-primary-500/30 bg-primary-500/5" : "border-white/10"
                        )}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-token-md flex-1">
                              <div className={cn(
                                "p-token-sm rounded-lg",
                                notification.color === 'primary' && "bg-primary-500/20",
                                notification.color === 'warning' && "bg-warning-500/20",
                                notification.color === 'error' && "bg-error-500/20"
                              )}>
                                <IconComponent size={20} className={cn(
                                  notification.color === 'primary' && "text-primary-400",
                                  notification.color === 'warning' && "text-warning-400",
                                  notification.color === 'error' && "text-error-400"
                                )} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-token-sm mb-2">
                                  <h3 
                                    id={`notification-label-${notification.key}`}
                                    className="text-white-force font-medium"
                                  >
                                    {notification.title}
                                  </h3>
                                  {notification.importance === 'high' && (
                                    <span className="px-2 py-0.5 bg-error-500/40 border-error-400/60 shadow-lg shadow-error-500/30 text-white-force rounded-full text-xs font-semibold border-2">
                                      중요
                                    </span>
                                  )}
                                </div>
                                <p 
                                  id={`notification-desc-${notification.key}`}
                                  className="text-white-force/60 text-sm-ko mb-token-sm"
                                >
                                  {notification.description}
                                </p>
                                {isEnabled && (
                                  <div className="flex items-center space-x-1 text-xs text-white-force">
                                    <Check size={12} className="icon-enhanced" />
                                    <span>활성화됨</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <button
                              onClick={() => handleNotificationChange(notification.key, !isEnabled)}
                              className={cn(
                                "relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-background min-w-[44px] min-h-[44px] p-2",
                                isEnabled ? "bg-primary-500" : "bg-white/20"
                              )}
                              role="switch"
                              aria-checked={isEnabled}
                              aria-labelledby={`notification-label-${notification.key}`}
                              aria-describedby={`notification-desc-${notification.key}`}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleNotificationChange(notification.key, !isEnabled);
                                }
                              }}
                            >
                              <span
                                className={cn(
                                  "inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200 shadow-lg",
                                  isEnabled ? "translate-x-7" : "translate-x-1"
                                )}
                                aria-hidden="true"
                              />
                              <span className="sr-only">
                                {notification.label} {isEnabled ? '활성화됨' : '비활성화됨'}
                              </span>
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Notification Summary */}
                    <div className="p-token-lg bg-gradient-to-r from-secondary-500/10 to-primary-500/10 border border-secondary-500/20 rounded-xl">
                      <div className="flex items-center space-x-token-sm mb-token-md">
                        <Activity size={20} className="text-secondary-400 icon-enhanced" />
                        <h3 className="text-white-force font-semibold">알림 현황</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-token-md">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-white-force mb-1">
                            {Object.values(localSettings.notifications).filter(Boolean).length}
                          </p>
                          <p className="text-white-force/60 text-sm-ko">활성 알림</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary-400 mb-1">
                            {stats.active}
                          </p>
                          <p className="text-white-force/60 text-sm-ko">대상 구독</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-secondary-400 mb-1">
                            실시간
                          </p>
                          <p className="text-white-force/60 text-sm-ko">알림 전송</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* Enhanced Security Section */}
              {activeSection === 'security' && (
                <GlassCard variant="strong" className="p-token-lg">
                  <div className="flex items-center space-x-token-sm mb-token-lg">
                    <div className="p-token-sm bg-error-500/20 rounded-lg">
                      <Shield size={20} className="text-error-400 icon-enhanced" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white-force">보안 설정</h2>
                      <p className="text-white-force/60 text-sm-ko">계정 보안을 관리합니다</p>
                    </div>
                  </div>

                  <div className="space-y-token-lg">
                    {/* Account Security Status */}
                    <div className="p-token-lg glass-light rounded-xl border border-white/10">
                      <div className="flex items-center space-x-token-sm mb-token-md">
                        <div className="w-12 h-12 bg-success-500/20 rounded-full flex items-center justify-center">
                          <Shield size={24} className="text-white-force icon-enhanced" />
                        </div>
                        <div>
                          <h3 className="text-white-force font-semibold">계정 보안 상태</h3>
                          <p className="text-white-force text-sm-ko">양호</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-token-md">
                        <div className="flex items-center space-x-token-sm">
                          <Check size={16} className="text-white-force icon-enhanced" />
                          <span className="text-white-force/70 text-sm-ko">이메일 인증 완료</span>
                        </div>
                        <div className="flex items-center space-x-token-sm">
                          <Check size={16} className="text-white-force icon-enhanced" />
                          <span className="text-white-force/70 text-sm-ko">안전한 로그인</span>
                        </div>
                        <div className="flex items-center space-x-token-sm">
                          <Check size={16} className="text-white-force icon-enhanced" />
                          <span className="text-white-force/70 text-sm-ko">데이터 암호화</span>
                        </div>
                        <div className="flex items-center space-x-token-sm">
                          <Check size={16} className="text-white-force icon-enhanced" />
                          <span className="text-white-force/70 text-sm-ko">정기 백업</span>
                        </div>
                      </div>
                    </div>

                    {/* Account Actions */}
                    <div className="space-y-token-md">
                      <div className="p-token-lg glass-light rounded-xl border border-white/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-token-md">
                            <div className="p-token-sm bg-info-500/20 rounded-lg">
                              <LogOut size={20} className="text-info-400" />
                            </div>
                            <div>
                              <h3 className="text-white-force font-medium mb-1">세션 관리</h3>
                              <p className="text-white-force/60 text-sm-ko">현재 기기에서 로그아웃합니다</p>
                            </div>
                          </div>
                          <WaveButton
                            variant="secondary"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                          >
                            <LogOut size={16} className="mr-token-xs text-white-force icon-enhanced" />
                            {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
                          </WaveButton>
                        </div>
                      </div>

                      <div className="p-token-lg glass-light rounded-xl border border-white/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-token-md">
                            <div className="p-token-sm bg-secondary-500/20 rounded-lg">
                              <Download size={20} className="text-secondary-400" />
                            </div>
                            <div>
                              <h3 className="text-white-force font-medium mb-1">데이터 내보내기</h3>
                              <p className="text-white-force/60 text-sm-ko">구독 데이터를 JSON 형태로 다운로드</p>
                            </div>
                          </div>
                          <WaveButton
                            variant="ghost"
                            onClick={() => {
                              const dataStr = JSON.stringify(subscriptions, null, 2);
                              const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                              const exportFileDefaultName = 'moonwave-subscriptions.json';
                              const linkElement = document.createElement('a');
                              linkElement.setAttribute('href', dataUri);
                              linkElement.setAttribute('download', exportFileDefaultName);
                              linkElement.click();
                            }}
                            className="text-white/60 hover:text-white"
                          >
                            <Download size={16} className="mr-token-xs text-white-force icon-enhanced" />
                            내보내기
                          </WaveButton>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Danger Zone */}
                    <div className="p-token-lg bg-error-500/10 border border-error-500/20 rounded-xl">
                      <div className="flex items-start space-x-token-sm mb-token-lg">
                        <AlertTriangle size={20} className="text-error-400 flex-shrink-0 mt-0.5 icon-enhanced" />
                        <div>
                          <h3 className="text-error-300 font-semibold mb-1">위험 구역</h3>
                          <p className="text-error-200/80 text-sm-ko text-high-contrast">
                            이 작업들은 되돌릴 수 없습니다. 신중하게 진행해주세요.
                          </p>
                        </div>
                      </div>

                      <div className="p-token-md glass-light rounded-lg border border-error-500/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white-force font-medium mb-1">계정 영구 삭제</h4>
                            <p className="text-white-force/60 text-sm-ko">
                              모든 구독 데이터와 설정이 영구적으로 삭제됩니다
                            </p>
                          </div>
                          
                          <WaveButton
                            variant="ghost"
                            onClick={handleDeleteAccount}
                            className={cn(
                              "transition-all duration-200",
                              showDeleteConfirm
                                ? "bg-error-500 text-white hover:bg-error-600"
                                : "text-error-400 hover:text-error-300 hover:bg-error-500/10"
                            )}
                          >
                            <Trash2 size={16} className="mr-token-xs text-white-force icon-enhanced" />
                            {showDeleteConfirm 
                              ? `확인 (${deleteCountdown}초)` 
                              : '계정 삭제'
                            }
                          </WaveButton>
                        </div>

                        {showDeleteConfirm && (
                          <div className="mt-token-md p-token-sm bg-error-500/20 border border-error-500/30 rounded-lg">
                            <p className="text-error-200 text-xs text-high-contrast">
                              정말로 계정을 삭제하시겠습니까? {deleteCountdown}초 후에 자동으로 취소됩니다.
                              계속하려면 다시 클릭하세요.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* Advanced Section */}
              {activeSection === 'advanced' && (
                <GlassCard variant="strong" className="p-token-lg">
                  <div className="flex items-center space-x-token-sm mb-token-lg">
                    <div className="p-token-sm bg-secondary-500/20 rounded-lg">
                      <SettingsIcon size={20} className="text-secondary-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white-force">고급 설정</h2>
                      <p className="text-white-force/60 text-sm-ko">시스템 및 개발자 옵션</p>
                    </div>
                  </div>

                  <div className="space-y-token-lg">
                    {/* System Information */}
                    <div className="p-token-lg glass-light rounded-xl border border-white/10">
                      <h3 className="text-white font-semibold mb-token-md">시스템 정보</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-token-md text-sm">
                        <div>
                          <span className="text-white/60">앱 버전</span>
                          <p className="text-white font-medium">Moonwave v2.0</p>
                        </div>
                        <div>
                          <span className="text-white/60">빌드</span>
                          <p className="text-white font-medium">2024.12.14</p>
                        </div>
                        <div>
                          <span className="text-white/60">환경</span>
                          <p className="text-white font-medium">Production</p>
                        </div>
                        <div>
                          <span className="text-white/60">API 버전</span>
                          <p className="text-white font-medium">v1.0</p>
                        </div>
                      </div>
                    </div>

                    {/* Debug Options */}
                    <div className="p-token-lg glass-light rounded-xl border border-white/10">
                      <h3 className="text-white font-semibold mb-token-md">개발자 옵션</h3>
                      <div className="space-y-token-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-medium">디버그 모드</h4>
                            <p className="text-white/60 text-sm">콘솔 로그 출력 활성화</p>
                          </div>
                          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-white/20 transition-colors duration-200">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 translate-x-1" />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-medium">성능 모니터링</h4>
                            <p className="text-white/60 text-sm">앱 성능 지표 수집</p>
                          </div>
                          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-500 transition-colors duration-200">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 translate-x-6" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* About */}
                    <div className="p-token-lg bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-500/20 rounded-xl">
                      <div className="flex items-center space-x-token-sm mb-token-md">
                        <Sparkles size={20} className="text-primary-400 icon-enhanced" />
                        <h3 className="text-white-force font-semibold">Moonwave 구독 관리</h3>
                      </div>
                      <p className="text-white-force/80 text-sm-ko mb-token-md text-high-contrast">
                        구독 서비스를 효율적으로 관리하고 불필요한 지출을 줄일 수 있도록 돕는 
                        스마트한 구독 관리 플랫폼입니다.
                      </p>
                      <div className="flex items-center space-x-token-sm">
                        <WaveButton variant="ghost" size="sm" className="text-white-force/60 hover:text-white-force">
                          <ExternalLink size={14} className="mr-1 text-white-force icon-enhanced" />
                          문서
                        </WaveButton>
                        <WaveButton variant="ghost" size="sm" className="text-white-force/60 hover:text-white-force">
                          <Heart size={14} className="mr-1 text-white-force icon-enhanced" />
                          피드백
                        </WaveButton>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              )}
            </div>

            {/* Enhanced Sidebar */}
            <div className="space-y-token-lg">
              
              {/* Quick Stats */}
              <GlassCard variant="strong" className="p-token-lg">
                <div className="flex items-center space-x-token-sm mb-token-lg">
                  <div className="p-token-sm bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg">
                    <PieChart size={20} className="text-white-force icon-enhanced" />
                  </div>
                  <div>
                    <h3 className="text-white-force font-semibold">계정 요약</h3>
                    <p className="text-white-force/60 text-sm-ko">주요 지표</p>
                  </div>
                </div>
                
                <div className="space-y-token-md">
                  {[
                    { label: '활성 구독', value: stats.active, total: stats.total, color: 'success' },
                    { label: '일시정지', value: stats.paused, total: stats.total, color: 'warning' },
                    { label: '해지됨', value: stats.cancelled, total: stats.total, color: 'error' }
                  ].map((item) => (
                    <div key={item.label} className="p-token-sm glass-light rounded-lg border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white-force/60 text-sm-ko">{item.label}</span>
                        <span className="text-white-force font-medium text-lg">{item.value}</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            item.color === 'success' && "bg-success-500",
                            item.color === 'warning' && "bg-warning-500",
                            item.color === 'error' && "bg-error-500"
                          )}
                          style={{ width: `${(item.value / Math.max(item.total, 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Quick Settings */}
              <GlassCard variant="strong" className="p-token-lg">
                <div className="flex items-center space-x-token-sm mb-token-lg">
                  <div className="p-token-sm bg-secondary-500/20 rounded-lg">
                    <Zap size={20} className="text-secondary-400 icon-enhanced" />
                  </div>
                  <div>
                    <h3 className="text-white-force font-semibold">빠른 설정</h3>
                    <p className="text-white-force/60 text-sm-ko">원클릭 액세스</p>
                  </div>
                </div>
                
                <div className="space-y-token-xs">
                  {sections.map((section) => {
                    const IconComponent = section.icon;
                    const isActive = activeSection === section.key;
                    
                    return (
                      <button
                        key={section.key}
                        onClick={() => setActiveSection(section.key as any)}
                        className={cn(
                          "w-full p-token-sm rounded-lg text-left transition-all duration-200 flex items-center space-x-token-sm touch-target",
                          isActive 
                            ? "bg-primary-500/20 border border-primary-500/30 text-primary-300"
                            : "glass-light border border-white/10 text-white-force/60 hover:text-white-force hover:bg-white/5"
                        )}
                      >
                        <IconComponent size={16} className="icon-enhanced" />
                        <span className="text-sm-ko font-medium">{section.label}</span>
                      </button>
                    );
                  })}
                </div>
              </GlassCard>

              {/* Account Summary */}
              <GlassCard variant="strong" className="p-token-lg">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-token-md">
                    <User size={24} className="text-white-force icon-enhanced" />
                  </div>
                  <h3 className="text-white-force font-semibold mb-token-sm">
                    {user?.name || user?.email?.split('@')[0]}
                  </h3>
                  <p className="text-3xl font-bold text-white-force mb-token-xs">
                    {stats.monthlyTotal.toLocaleString('ko-KR')}원
                  </p>
                  <p className="text-white-force/70 text-sm-ko mb-token-md">
                    월간 구독료
                  </p>
                  
                  {stats.yearlySavings > 0 && (
                    <div className="p-token-sm bg-success-500/20 border border-success-500/30 rounded-lg">
                                              <div className="flex items-center justify-center space-x-1 text-white-force">
                        <Award size={14} className="icon-enhanced" />
                        <span className="text-sm-ko font-medium">
                          연간 {stats.yearlySavings.toLocaleString('ko-KR')}원 절약
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </GlassCard>

              {/* Quick Actions */}
              <GlassCard variant="light" className="p-token-lg">
                <h3 className="text-white-force font-semibold mb-token-md">빠른 액션</h3>
                <div className="space-y-token-sm">
                  <Link to="/dashboard">
                    <WaveButton variant="ghost" size="sm" className="w-full justify-start text-white-force touch-target">
                      <Home size={14} className="mr-2 text-white-force icon-enhanced" />
                      대시보드로 이동
                    </WaveButton>
                  </Link>
                  <Link to="/subscriptions">
                    <WaveButton variant="ghost" size="sm" className="w-full justify-start text-white-force touch-target">
                      <Archive size={14} className="mr-2 text-white-force icon-enhanced" />
                      구독 관리
                    </WaveButton>
                  </Link>
                  <Link to="/notifications">
                    <WaveButton variant="ghost" size="sm" className="w-full justify-start text-white-force touch-target">
                      <Bell size={14} className="mr-2 text-white-force icon-enhanced" />
                      알림 센터
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