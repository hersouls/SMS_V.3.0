import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Header } from './Header';
import { GlassCard } from './GlassCard';
import { WaveButton } from './WaveButton';
import { useApp } from '../App';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  ExternalLink, 
  DollarSign, 
  Calendar, 
  Bell, 
  Settings, 
  Tag,
  FileText,
  Check,
  X,
  AlertCircle,
  CheckCircle,
  PauseCircle,
  XCircle,
  Clock,
  Home,
  List,
  Archive,
  Activity,
  TrendingUp,
  TrendingDown,
  Star,
  Heart,
  Bookmark,
  Share2,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Globe,
  CreditCard,
  Timer,
  Target,
  Award,
  PlayCircle,
  Pause,
  StopCircle,
  MoreHorizontal,
  Info,
  Sparkles
} from 'lucide-react';
import { getPhaseColors, PhaseType } from '../utils/phaseColors';
import { cn } from './ui/utils';
import { collectAndSaveAllStatistics } from '../utils/statistics';

export function SubscriptionCard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { subscriptions, settings, user, updateSubscription, deleteSubscription } = useApp();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const subscription = subscriptions.find(sub => sub.id === id);

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

  if (!subscription) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-28 pb-token-xl px-token-md">
          <div className="max-w-7xl mx-auto">
            <GlassCard variant="light" className="p-token-2xl">
              <div className="text-center max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-error-500/20 to-warning-500/20 rounded-full flex items-center justify-center mx-auto mb-token-lg">
                  <AlertCircle size={40} className="text-error-400" />
                </div>
                <h3 className="text-white-force text-high-contrast font-semibold mb-token-sm">구독을 찾을 수 없습니다</h3>
                <p className="text-white-force text-high-contrast text-sm mb-token-lg leading-relaxed tracking-ko-normal">
                  요청하신 구독 정보가 존재하지 않거나 삭제되었습니다.
                  구독 목록에서 다시 확인해주세요.
                </p>
                <div className="flex justify-center space-x-token-sm">
                  <Link to="/subscriptions">
                    <WaveButton variant="primary" className="shadow-lg shadow-primary-500/20 text-white">
                      <List size={16} className="mr-token-xs text-white-force icon-enhanced" />
                      구독 목록
                    </WaveButton>
                  </Link>
                  <Link to="/dashboard">
                    <WaveButton variant="secondary" className="text-white-force text-high-contrast">
                      <Home size={16} className="mr-token-xs text-white-force icon-enhanced" />
                      대시보드
                    </WaveButton>
                  </Link>
                </div>
              </div>
            </GlassCard>
          </div>
        </main>
      </div>
    );
  }

  const phaseColors = getPhaseColors(getCategoryPhase(subscription.category));

  const handleDelete = () => {
    deleteSubscription(subscription.id);
    navigate('/subscriptions');
  };

  const handleStatusChange = async (newStatus: 'active' | 'paused' | 'cancelled') => {
    setIsUpdating(true);
    try {
      await updateSubscription(subscription.id, { status: newStatus });
      
      // 상태 변경 후 통계 업데이트
      try {
        if (user) {
          await collectAndSaveAllStatistics(user.id);
        }
      } catch (error) {
        console.warn('통계 업데이트 실패:', error);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      // 사용자에게 에러 알림
      alert('상태 변경에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleAutoRenewal = async () => {
    setIsUpdating(true);
    try {
      await updateSubscription(subscription.id, { autoRenewal: !subscription.autoRenewal });
      
      // 자동 갱신 변경 후 통계 업데이트
      try {
        if (user) {
          await collectAndSaveAllStatistics(user.id);
        }
      } catch (error) {
        console.warn('통계 업데이트 실패:', error);
      }
    } catch (error) {
      console.error('Error updating auto-renewal:', error);
      // 사용자에게 에러 알림
      alert('자동 갱신 설정 변경에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleNotification = async (type: 'sevenDays' | 'threeDays' | 'sameDay') => {
    setIsUpdating(true);
    try {
      await updateSubscription(subscription.id, {
        notifications: {
          ...subscription.notifications,
          [type]: !subscription.notifications[type]
        }
      });
      
      // 알림 설정 변경 후 통계 업데이트
      try {
        if (user) {
          await collectAndSaveAllStatistics(user.id);
        }
      } catch (error) {
        console.warn('통계 업데이트 실패:', error);
      }
    } catch (error) {
      console.error('Error updating notification:', error);
      // 사용자에게 에러 알림
      alert('알림 설정 변경에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={16} className="text-white" />;
      case 'paused':
        return <PauseCircle size={16} className="text-warning-400" />;
      case 'cancelled':
        return <XCircle size={16} className="text-error-400" />;
      default:
        return <Clock size={16} className="text-white/60" />;
    }
  };

  const getStatusLabel = (status: string) => {
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
        return 'bg-success-500/40 border-success-400/60 shadow-lg shadow-success-500/30 text-white font-semibold border-2';
      case 'paused':
        return 'bg-warning-500/40 border-warning-400/60 shadow-lg shadow-warning-500/30 text-white font-semibold border-2';
      case 'cancelled':
        return 'bg-error-500/40 border-error-400/60 shadow-lg shadow-error-500/30 text-white font-semibold border-2';
      default:
        return 'bg-white/10 text-white/70 border-white/20 font-semibold border-2';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getNextPaymentDate = () => {
    const today = new Date();
    const nextPayment = new Date(today.getFullYear(), today.getMonth(), subscription.paymentDay);
    if (nextPayment < today) {
      nextPayment.setMonth(nextPayment.getMonth() + 1);
    }
    return nextPayment.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: 'KRW' | 'USD') => {
    if (currency === 'USD') {
      const krwAmount = amount * settings.exchangeRate;
      return `$${amount.toLocaleString()} (${krwAmount.toLocaleString('ko-KR')}원)`;
    } else {
      return `${amount.toLocaleString('ko-KR')}원`;
    }
  };

  const getDaysUntilPayment = () => {
    const today = new Date();
    const nextPayment = new Date(today.getFullYear(), today.getMonth(), subscription.paymentDay);
    if (nextPayment < today) {
      nextPayment.setMonth(nextPayment.getMonth() + 1);
    }
    const diffTime = nextPayment.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getMonthlyAmount = () => {
    if (subscription.paymentCycle === 'yearly') {
      return subscription.currency === 'USD' 
        ? (subscription.amount * settings.exchangeRate) / 12
        : subscription.amount / 12;
    }
    return subscription.currency === 'USD' 
      ? subscription.amount * settings.exchangeRate
      : subscription.amount;
  };

  const getYearlyAmount = () => {
    if (subscription.paymentCycle === 'monthly') {
      return getMonthlyAmount() * 12;
    }
    return subscription.currency === 'USD' 
      ? subscription.amount * settings.exchangeRate
      : subscription.amount;
  };

  const formatPaymentCycle = (cycle: string) => {
    switch (cycle) {
      case 'monthly': return '월간';
      case 'yearly': return '연간';
      case 'onetime': return '일회성';
      default: return cycle;
    }
  };

  const getPaymentUrgency = () => {
    const days = getDaysUntilPayment();
    if (days === 0) return 'today';
    if (days === 1) return 'tomorrow';
    if (days <= 3) return 'urgent';
    if (days <= 7) return 'soon';
    return 'normal';
  };

  const getUrgencyClass = () => {
    const urgency = getPaymentUrgency();
    switch (urgency) {
      case 'today':
        return 'bg-error-500/20 text-error-300 border border-error-500/30';
      case 'tomorrow':
        return 'bg-warning-500/20 text-warning-300 border border-warning-500/30';
      case 'urgent':
        return 'bg-warning-500/15 text-warning-400 border border-warning-500/20';
      case 'soon':
        return 'bg-info-500/15 text-info-400 border border-info-500/20';
      default:
        return 'bg-white/10 text-white/60 border border-white/20';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const daysUntilPayment = getDaysUntilPayment();
  const monthlyAmount = getMonthlyAmount();
  const yearlyAmount = getYearlyAmount();

  return (
    <div className="min-h-screen bg-background" role="main" aria-label="구독 상세 페이지">
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
                onClick={() => navigate(-1)}
                ariaLabel="뒤로가기"
              >
                <ArrowLeft size={20} />
              </WaveButton>
              
              <div>
                <div className="flex items-center space-x-token-sm mb-token-xs">
                  <h1 className="text-3xl font-bold text-white-force text-high-contrast">
                    {subscription.serviceName}
                  </h1>
                  <div className={cn("px-2 py-1 rounded-full text-xs", getStatusBadgeClass(subscription.status))}>
                    {getStatusLabel(subscription.status)}
                  </div>
                  {subscription.autoRenewal && subscription.status === 'active' && (
                    <div className="px-2 py-1 bg-success-500/40 border-success-400/60 shadow-lg shadow-success-500/30 text-white rounded-full text-xs font-semibold border-2">
                      자동갱신
                    </div>
                  )}
                </div>
                <p className="text-white-force text-high-contrast">
                  {subscription.category} • 
                  <span className="ml-2 text-primary-400">
                    월 {monthlyAmount.toLocaleString('ko-KR')}원 • {daysUntilPayment}일 후 결제
                  </span>
                </p>
              </div>
            </div>

            <div className="flex space-x-token-sm">
              <WaveButton
                variant="ghost"
                size="sm"
                onClick={() => navigate('/subscriptions')}
                className="hidden md:flex text-white/60 hover:text-white"
              >
                <List size={16} className="mr-token-xs text-white-force icon-enhanced" />
                목록
              </WaveButton>

              <Link to={`/subscriptions/${subscription.id}/edit`}>
                <WaveButton variant="secondary" className="shadow-lg shadow-secondary-500/20 text-white-force text-high-contrast">
                  <Edit size={16} className="mr-token-xs text-white-force icon-enhanced" />
                  수정
                </WaveButton>
              </Link>
              
              <WaveButton 
                variant="ghost"
                onClick={() => setShowDeleteModal(true)}
                className="text-error-400 hover:text-error-300 hover:bg-error-500/10"
              >
                <Trash2 size={16} className="mr-token-xs text-white-force icon-enhanced" />
                삭제
              </WaveButton>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-token-xl">
            
            {/* Main Content */}
            <div className="xl:col-span-3 space-y-token-lg">
              
              {/* Enhanced Service Information */}
              <GlassCard variant="strong" className="p-token-lg">
                <div className="flex items-center space-x-token-sm mb-token-lg">
                  <div className={cn("p-token-sm rounded-lg", phaseColors.bg)}>
                    <Globe size={20} className={phaseColors.text} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white-force text-high-contrast">서비스 정보</h2>
                    <p className="text-white-force text-high-contrast text-sm">{subscription.category} 서비스</p>
                  </div>
                </div>

                <div className="flex items-center space-x-token-lg">
                  {/* Enhanced Logo */}
                  <div className="relative">
                    <div className={cn(
                      "w-24 h-24 rounded-2xl flex items-center justify-center text-white-force text-high-contrast text-2xl font-bold flex-shrink-0 shadow-lg",
                      phaseColors.bg
                    )}>
                      {subscription.logoImage ? (
                        <img 
                          src={subscription.logoImage} 
                          alt={subscription.serviceName}
                          className="w-20 h-20 rounded-xl object-cover"
                        />
                      ) : (
                        subscription.logo || subscription.serviceName.charAt(0).toUpperCase()
                      )}
                    </div>
                    
                    {/* Service Status Indicator */}
                    <div className={cn(
                      "absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-background",
                      subscription.status === 'active' ? "bg-success-500" :
                      subscription.status === 'paused' ? "bg-warning-500" : "bg-error-500"
                    )}>
                      {subscription.status === 'active' ? <CheckCircle size={12} className="text-white-force icon-enhanced" /> :
                       subscription.status === 'paused' ? <Pause size={12} className="text-white-force icon-enhanced" /> :
                       <StopCircle size={12} className="text-white-force icon-enhanced" />}
                    </div>
                  </div>
                  
                  {/* Enhanced Service Details */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-token-md mb-token-sm">
                                          <h3 className="text-3xl font-bold text-white-force">
                      {subscription.serviceName}
                    </h3>
                      {subscription.tier && (
                        <div className="px-3 py-1 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border border-primary-500/30 rounded-full">
                          <span className="text-primary-300 text-sm font-medium">{subscription.tier}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-token-sm">
                      {subscription.serviceUrl && (
                        <a 
                          href={subscription.serviceUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 text-primary-400 hover:text-primary-300 text-sm transition-colors group"
                        >
                          <Globe size={14} />
                          <span className="group-hover:underline">{subscription.serviceUrl}</span>
                          <ExternalLink size={12} />
                        </a>
                      )}
                      
                      <div className="flex items-center space-x-token-md">
                        {getStatusIcon(subscription.status)}
                        <span className={cn(
                          "px-3 py-1 rounded-full text-sm border font-medium",
                          getStatusBadgeClass(subscription.status)
                        )}>
                          {getStatusLabel(subscription.status)}
                        </span>
                        
                        {subscription.status !== 'cancelled' && (
                          <>
                            <span className="text-white/40">•</span>
                            <span className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              getUrgencyClass()
                            )}>
                              {daysUntilPayment === 0 ? '오늘 결제' :
                               daysUntilPayment === 1 ? '내일 결제' :
                               `${daysUntilPayment}일 후 결제`}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Enhanced Payment Information */}
              <GlassCard variant="strong" className="p-token-lg">
                <div className="flex items-center space-x-token-sm mb-token-lg">
                  <div className="p-token-sm bg-success-500/20 rounded-lg">
                    <DollarSign size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white-force text-high-contrast">결제 정보</h2>
                    <p className="text-white-force text-high-contrast text-sm">구독료 및 결제 설정</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-token-md mb-token-lg">
                  <div className="p-token-md glass-light rounded-lg border border-white/10">
                    <div className="flex items-center space-x-token-sm mb-token-xs">
                      <CreditCard size={16} className="text-white-force icon-enhanced" />
                      <label className="text-white-force text-high-contrast text-sm">구독료</label>
                    </div>
                    <p className="text-white-force text-high-contrast font-bold text-lg">
                      {formatCurrency(subscription.amount, subscription.currency)}
                    </p>
                    <p className="text-white-force text-high-contrast text-xs">
                      {formatPaymentCycle(subscription.paymentCycle)}
                    </p>
                  </div>

                  <div className="p-token-md glass-light rounded-lg border border-white/10">
                    <div className="flex items-center space-x-token-sm mb-token-xs">
                      <Calendar size={16} className="text-warning-400 icon-enhanced" />
                      <label className="text-white-force text-high-contrast text-sm">결제일</label>
                    </div>
                    <p className="text-white-force text-high-contrast font-bold text-lg">매월 {subscription.paymentDay}일</p>
                    <p className="text-white-force text-high-contrast text-xs">{getNextPaymentDate()}</p>
                  </div>

                  <div className="p-token-md glass-light rounded-lg border border-white/10">
                    <div className="flex items-center space-x-token-sm mb-token-xs">
                      <Timer size={16} className="text-info-400 icon-enhanced" />
                      <label className="text-white-force text-high-contrast text-sm">남은 일수</label>
                    </div>
                    <p className={cn(
                      "font-bold text-lg",
                      daysUntilPayment <= 3 ? "text-warning-400" :
                      daysUntilPayment <= 7 ? "text-info-400" : "text-white-force text-high-contrast"
                    )}>
                      {daysUntilPayment}일
                    </p>
                    <p className="text-white-force text-high-contrast text-xs">
                      {daysUntilPayment === 0 ? '오늘 결제' :
                       daysUntilPayment === 1 ? '내일 결제' : '결제 예정'}
                    </p>
                  </div>

                  <div className="p-token-md glass-light rounded-lg border border-white/10">
                    <div className="flex items-center space-x-token-sm mb-token-xs">
                      <TrendingUp size={16} className="text-primary-400" />
                      <label className="text-white/60 text-sm">월 환산</label>
                    </div>
                    <p className="text-primary-400 font-bold text-lg">
                      {monthlyAmount.toLocaleString('ko-KR')}원
                    </p>
                    <p className="text-white/60 text-xs">월간 지출</p>
                  </div>

                  <div className="p-token-md glass-light rounded-lg border border-white/10">
                    <div className="flex items-center space-x-token-sm mb-token-xs">
                      <Target size={16} className="text-secondary-400" />
                      <label className="text-white/60 text-sm">연간 예상</label>
                    </div>
                    <p className="text-secondary-400 font-bold text-lg">
                      {yearlyAmount.toLocaleString('ko-KR')}원
                    </p>
                    <p className="text-white/60 text-xs">
                      {subscription.paymentCycle === 'yearly' ? '연간 할인' : '연간 환산'}
                    </p>
                  </div>

                  <div className="p-token-md glass-light rounded-lg border border-white/10">
                    <div className="flex items-center space-x-token-sm mb-token-xs">
                      <CreditCard size={16} className="text-white/60" />
                      <label className="text-white/60 text-sm">결제수단</label>
                    </div>
                    <p className="text-white font-medium">
                      {subscription.paymentMethod || '미설정'}
                    </p>
                    <p className="text-white/60 text-xs">결제 방법</p>
                  </div>
                </div>

                {/* Payment Cycle Benefits */}
                {subscription.paymentCycle === 'yearly' && (
                  <div className="p-token-md bg-gradient-to-r from-success-500/10 to-primary-500/10 border border-success-500/20 rounded-lg">
                    <div className="flex items-center space-x-token-sm mb-token-sm">
                      <Award size={16} className="text-white" />
                                              <h3 className="text-white font-medium">연간 구독 혜택</h3>
                    </div>
                    <p className="text-success-200/80 text-sm">
                      월간 구독 대비 약 17% 할인 혜택을 받고 있습니다.
                    </p>
                  </div>
                )}
              </GlassCard>

              {/* Enhanced Subscription Settings */}
              <GlassCard variant="strong" className="p-token-lg">
                <div className="flex items-center space-x-token-sm mb-token-lg">
                  <div className="p-token-sm bg-warning-500/20 rounded-lg">
                    <Settings size={20} className="text-warning-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white-force text-high-contrast">구독 설정</h2>
                    <p className="text-white-force text-high-contrast text-sm">상태 및 갱신 설정</p>
                  </div>
                </div>

                <div className="space-y-token-md">
                  {/* Status Control */}
                  <div className="p-token-lg glass-light rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-token-md">
                      <div>
                        <h3 className="text-white-force text-high-contrast font-medium mb-1">구독 상태</h3>
                        <p className="text-white-force text-high-contrast text-sm">구독을 일시정지하거나 재개할 수 있습니다</p>
                      </div>
                      <div className="flex space-x-token-xs">
                        <WaveButton
                          variant={subscription.status === 'active' ? "primary" : "ghost"}
                          size="sm"
                          onClick={() => handleStatusChange('active')}
                          disabled={isUpdating || subscription.status === 'active'}
                        >
                                                  <PlayCircle size={14} className="mr-1 text-white-force icon-enhanced" />
                        활성
                      </WaveButton>
                      <WaveButton
                        variant={subscription.status === 'paused' ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => handleStatusChange('paused')}
                        disabled={isUpdating || subscription.status === 'paused'}
                      >
                        <Pause size={14} className="mr-1 text-white-force icon-enhanced" />
                        일시정지
                      </WaveButton>
                      <WaveButton
                        variant={subscription.status === 'cancelled' ? "ghost" : "ghost"}
                        size="sm"
                        onClick={() => handleStatusChange('cancelled')}
                        disabled={isUpdating || subscription.status === 'cancelled'}
                        className="text-error-400 hover:text-error-300"
                      >
                        <StopCircle size={14} className="mr-1 text-white-force icon-enhanced" />
                        해지
                        </WaveButton>
                      </div>
                    </div>
                  </div>

                  {/* Auto Renewal */}
                  <div className="p-token-lg glass-light rounded-xl border border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white-force text-high-contrast font-medium mb-1">자동 갱신</h3>
                        <p className="text-white-force text-high-contrast text-sm">구독이 자동으로 갱신되도록 설정합니다</p>
                      </div>
                      <button
                        onClick={toggleAutoRenewal}
                        disabled={isUpdating}
                        className={cn(
                          "relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-background",
                          subscription.autoRenewal ? "bg-primary-500" : "bg-white/20",
                          isUpdating && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200 shadow-lg",
                            subscription.autoRenewal ? "translate-x-7" : "translate-x-1"
                          )}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Subscription Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-token-md">
                    <div className="p-token-md glass-light rounded-lg border border-white/10">
                      <div className="flex items-center space-x-token-sm mb-token-sm">
                        <Calendar size={16} className="text-info-400" />
                        <label className="text-white/60 text-sm">시작일</label>
                      </div>
                      <p className="text-white font-medium">{formatDate(subscription.startDate)}</p>
                      <p className="text-white/50 text-xs mt-1">
                        {Math.floor((new Date().getTime() - new Date(subscription.startDate).getTime()) / (1000 * 60 * 60 * 24))}일 경과
                      </p>
                    </div>

                    <div className="p-token-md glass-light rounded-lg border border-white/10">
                      <div className="flex items-center space-x-token-sm mb-token-sm">
                        <Activity size={16} className="text-secondary-400" />
                        <label className="text-white/60 text-sm">결제 횟수</label>
                      </div>
                      <p className="text-white font-medium">
                        {Math.floor((new Date().getTime() - new Date(subscription.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30))}회
                      </p>
                      <p className="text-white/50 text-xs mt-1">예상 결제 횟수</p>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Enhanced Notifications */}
              <GlassCard variant="strong" className="p-token-lg">
                <div className="flex items-center space-x-token-sm mb-token-lg">
                  <div className="p-token-sm bg-info-500/20 rounded-lg">
                    <Bell size={20} className="text-info-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white-force text-high-contrast">알림 설정</h2>
                    <p className="text-white-force text-high-contrast text-sm">결제 알림 관리</p>
                  </div>
                </div>

                <div className="space-y-token-md">
                  {[
                    {
                      key: 'sevenDays' as keyof typeof subscription.notifications,
                      title: '7일 전 알림',
                      description: '결제 7일 전에 미리 알림을 받습니다',
                      icon: Calendar,
                      recommended: true
                    },
                    {
                      key: 'threeDays' as keyof typeof subscription.notifications,
                      title: '3일 전 알림',
                      description: '결제 3일 전에 알림을 받습니다',
                      icon: Clock,
                      recommended: true
                    },
                    {
                      key: 'sameDay' as keyof typeof subscription.notifications,
                      title: '당일 알림',
                      description: '결제 당일에 알림을 받습니다',
                      icon: Bell,
                      recommended: false
                    }
                  ].map((notification) => {
                    const IconComponent = notification.icon;
                    const isEnabled = subscription.notifications[notification.key];
                    
                    return (
                      <div key={notification.key} className={cn(
                        "p-token-lg glass-light rounded-xl border transition-all duration-200",
                        isEnabled ? "border-primary-500/30 bg-primary-500/5" : "border-white/10"
                      )}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-start space-x-token-md flex-1">
                            <div className={cn(
                              "p-token-sm rounded-lg",
                              isEnabled ? "bg-primary-500/20" : "bg-white/10"
                            )}>
                              <IconComponent size={20} className={cn(
                                isEnabled ? "text-primary-400" : "text-white/60"
                              )} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-token-sm mb-1">
                                <h3 className="text-white font-medium">{notification.title}</h3>
                                {notification.recommended && (
                                  <span className="px-2 py-0.5 bg-success-500/20 text-white rounded-full text-xs">
                                    추천
                                  </span>
                                )}
                              </div>
                              <p className="text-white/60 text-sm">{notification.description}</p>
                              {isEnabled && (
                                <div className="flex items-center space-x-1 mt-2 text-xs text-white">
                                  <Check size={12} />
                                  <span>알림 활성화됨</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <button
                            onClick={() => toggleNotification(notification.key)}
                            disabled={isUpdating}
                            className={cn(
                              "relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-background",
                              isEnabled ? "bg-primary-500" : "bg-white/20",
                              isUpdating && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            <span
                              className={cn(
                                "inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200 shadow-lg",
                                isEnabled ? "translate-x-7" : "translate-x-1"
                              )}
                            />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Notification Summary */}
                <div className="mt-token-lg p-token-md bg-gradient-to-r from-info-500/10 to-primary-500/10 border border-info-500/20 rounded-lg">
                  <div className="flex items-center space-x-token-sm mb-token-sm">
                    <Activity size={16} className="text-info-400" />
                    <h3 className="text-info-300 font-medium">알림 현황</h3>
                  </div>
                  <p className="text-info-200/80 text-sm">
                    총 {Object.values(subscription.notifications).filter(Boolean).length}개의 알림이 활성화되어 있습니다.
                    결제일에 맞춰 정확한 시간에 알림을 전송합니다.
                  </p>
                </div>
              </GlassCard>

              {/* Enhanced Memo */}
              {subscription.memo && (
                <GlassCard variant="strong" className="p-token-lg">
                  <div className="flex items-center space-x-token-sm mb-token-lg">
                    <div className="p-token-sm bg-secondary-500/20 rounded-lg">
                      <FileText size={20} className="text-secondary-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">메모</h2>
                      <p className="text-white/60 text-sm">추가 정보</p>
                    </div>
                  </div>

                  <div className="p-token-lg glass-light rounded-xl border border-white/10">
                    <p className="text-white/80 leading-relaxed break-keep-ko">
                      {subscription.memo}
                    </p>
                  </div>
                </GlassCard>
              )}
            </div>

            {/* Enhanced Sidebar */}
            <div className="space-y-token-lg">
              
              {/* Enhanced Quick Summary */}
              <GlassCard variant="strong" className="p-token-lg">
                <div className="flex items-center space-x-token-sm mb-token-lg">
                  <div className="p-token-sm bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">요약 정보</h3>
                    <p className="text-white/60 text-sm">핵심 지표</p>
                  </div>
                </div>
                
                <div className="space-y-token-sm">
                  {[
                    {
                      label: '구독 상태',
                      value: getStatusLabel(subscription.status),
                      icon: getStatusIcon(subscription.status),
                      color: subscription.status === 'active' ? 'text-white' :
                             subscription.status === 'paused' ? 'text-warning-400' : 'text-error-400'
                    },
                    {
                      label: '다음 결제',
                      value: `${daysUntilPayment}일 후`,
                      icon: <Timer size={14} className="text-warning-400" />,
                      color: daysUntilPayment <= 3 ? 'text-warning-400' : 'text-white'
                    },
                    {
                      label: '월 지출',
                      value: `${monthlyAmount.toLocaleString('ko-KR')}원`,
                      icon: <DollarSign size={14} className="text-primary-400" />,
                      color: 'text-primary-400'
                    },
                    {
                      label: '자동갱신',
                      value: subscription.autoRenewal ? '활성' : '비활성',
                      icon: subscription.autoRenewal ? 
                        <CheckCircle size={14} className="text-white" /> : 
                        <XCircle size={14} className="text-error-400" />,
                                              color: subscription.autoRenewal ? 'text-white' : 'text-error-400'
                    }
                  ].map((item, index) => (
                    <div key={index} className="p-token-sm glass-light rounded-lg border border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-token-xs">
                          {item.icon}
                          <span className="text-white/60 text-sm">{item.label}</span>
                        </div>
                        <span className={cn("font-medium text-sm", item.color)}>
                          {item.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Enhanced Category & Tags */}
              <GlassCard variant="strong" className="p-token-lg">
                <div className="flex items-center space-x-token-sm mb-token-lg">
                  <div className={cn("p-token-sm rounded-lg", phaseColors.bg)}>
                    <Tag size={20} className={phaseColors.text} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">분류</h3>
                    <p className="text-white/60 text-sm">카테고리 & 태그</p>
                  </div>
                </div>
                
                <div className="space-y-token-md">
                  {/* Category */}
                  <div>
                    <label className="text-white/60 text-sm mb-token-xs block">카테고리</label>
                    <div className={cn(
                      "p-token-md rounded-xl border-2",
                      phaseColors.bg,
                      phaseColors.border
                    )}>
                      <span className={cn("font-medium", phaseColors.text)}>
                        {subscription.category}
                      </span>
                    </div>
                  </div>
                  
                  {/* Tags */}
                  <div>
                    <label className="text-white/60 text-sm mb-token-xs block">
                      태그 ({subscription.tags.length}개)
                    </label>
                    {subscription.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-token-xs">
                        {subscription.tags.map((tag, index) => (
                          <div key={index} className="px-token-sm py-1 bg-secondary-500/20 border border-secondary-500/30 rounded-full">
                            <span className="text-secondary-300 text-xs font-medium">
                              #{tag}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-token-md bg-white/5 border border-white/10 rounded-lg text-center">
                        <span className="text-white/40 text-sm">태그가 없습니다</span>
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>

              {/* Enhanced Notification Status */}
              <GlassCard variant="strong" className="p-token-lg">
                <div className="flex items-center space-x-token-sm mb-token-lg">
                  <div className="p-token-sm bg-info-500/20 rounded-lg">
                    <Bell size={20} className="text-info-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">알림 현황</h3>
                    <p className="text-white/60 text-sm">설정 상태</p>
                  </div>
                </div>
                
                <div className="space-y-token-sm">
                  {[
                    { key: 'sevenDays', label: '7일 전' },
                    { key: 'threeDays', label: '3일 전' },
                    { key: 'sameDay', label: '당일' }
                  ].map((notification) => {
                    const isEnabled = subscription.notifications[notification.key as keyof typeof subscription.notifications];
                    
                    return (
                      <div key={notification.key} className="p-token-sm glass-light rounded-lg border border-white/10">
                        <div className="flex items-center justify-between">
                          <span className="text-white/70 text-sm">{notification.label}</span>
                          <div className="flex items-center space-x-1">
                            {isEnabled ? (
                              <>
                                                            <CheckCircle size={12} className="text-white" />
                            <span className="text-white font-medium text-xs">ON</span>
                              </>
                            ) : (
                              <>
                                <XCircle size={12} className="text-error-400" />
                                <span className="text-error-400 font-medium text-xs">OFF</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="pt-token-sm border-t border-white/10">
                    <div className="text-center">
                      <span className="text-white/60 text-xs">
                        {Object.values(subscription.notifications).filter(Boolean).length}/3 활성화
                      </span>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Enhanced Quick Actions */}
              <GlassCard variant="light" className="p-token-lg">
                <div className="flex items-center space-x-token-sm mb-token-lg">
                  <div className="p-token-sm bg-gradient-to-br from-secondary-500/20 to-primary-500/20 rounded-lg">
                    <Settings size={20} className="text-secondary-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">빠른 작업</h3>
                    <p className="text-white/60 text-sm">원클릭 액션</p>
                  </div>
                </div>
                
                <div className="space-y-token-sm">
                  <Link to={`/subscriptions/${subscription.id}/edit`}>
                    <WaveButton
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-white/60 hover:text-white"
                    >
                      <Edit size={16} className="mr-token-sm text-white" />
                      정보 수정
                    </WaveButton>
                  </Link>
                  
                  <WaveButton
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-white/60 hover:text-white"
                    onClick={() => copyToClipboard(`${subscription.serviceName} - ${formatCurrency(subscription.amount, subscription.currency)}`)}
                  >
                    <Copy size={16} className="mr-token-sm text-white" />
                    정보 복사
                  </WaveButton>
                  
                  <WaveButton
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-white/60 hover:text-white"
                    onClick={() => navigate('/subscriptions')}
                  >
                    <List size={16} className="mr-token-sm text-white" />
                    목록 보기
                  </WaveButton>
                  
                  <WaveButton
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-white/60 hover:text-white"
                    onClick={() => navigate('/dashboard')}
                  >
                    <Home size={16} className="mr-token-sm text-white" />
                    대시보드
                  </WaveButton>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className="px-token-md pb-token-lg" role="contentinfo" aria-label="페이지 하단 정보">
        <div className="max-w-7xl mx-auto">
          <GlassCard variant="light" className="p-token-lg">
            <div className="text-center">
              <p className="text-white-force text-high-contrast text-sm">
                © 2024 Moonwave 구독 관리 • {user?.name || user?.email}님의 구독 상세
              </p>
            </div>
          </GlassCard>
        </div>
      </footer>

      {/* Delete Modal */}
      {showDeleteModal && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          serviceName={subscription.serviceName}
        />
      )}
    </div>
  );
}