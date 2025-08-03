import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { GlassCard } from './GlassCard';
import { WaveButton } from './WaveButton';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useLoadingState } from '../hooks/useLoadingState';
import { 
  Save,
  X,
  Check,
  AlertCircle,
  Globe,
  DollarSign,
  Calendar,
  Bell,
  Tag,
  FileText,
  Settings,
  CreditCard,
  Home,
  List,
  Plus,
  Eye,
  EyeOff,
  RefreshCw,
  Info,
  Star,
  Heart,
  Bookmark,
  Zap,
  Target,
  Sparkles,
  Activity,
  TrendingUp,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Hash,
  Calendar as CalendarIcon,
  Repeat,
  CheckCircle,
  XCircle,
  PauseCircle,
  ChevronDown,
  Search
} from 'lucide-react';
import { getPhaseColors, PhaseType } from '../utils/phaseColors';
import { cn } from './ui/utils';
import { collectAndSaveAllStatistics } from '../utils/statistics';

// Form validation types
interface FormErrors {
  serviceName?: string;
  amount?: string;
  paymentDay?: string;
  category?: string;
  paymentCycle?: string;
  currency?: string;
  serviceUrl?: string;
}

// 서비스 목록 정의
const SERVICE_LIST = [
  { name: 'Apple TV+', url: 'https://tv.apple.com' },
  { name: 'ChatGPT Plus', url: 'https://chat.openai.com' },
  { name: 'Claude Code', url: 'https://claude.ai/code' },
  { name: 'Claude Pro', url: 'https://claude.ai' },
  { name: 'Coupang Play', url: 'https://coupangplay.com' },
  { name: 'Cursor', url: 'https://cursor.sh' },
  { name: 'DeepSeek R1', url: 'https://deepseek.com' },
  { name: 'Disney+', url: 'https://disneyplus.com' },
  { name: 'GitHub Copilot', url: 'https://github.com/features/copilot' },
  { name: 'Grok 3', url: 'https://grok.x.ai' },
  { name: 'Jasper AI', url: 'https://jasper.ai' },
  { name: 'Netflix', url: 'https://netflix.com' },
  { name: 'NotebookLM', url: 'https://notebooklm.google' },
  { name: 'n8n', url: 'https://n8n.io' },
  { name: 'Perplexity Pro', url: 'https://perplexity.ai' },
  { name: 'Replicate', url: 'https://replicate.com' },
  { name: 'Spotify', url: 'https://spotify.com' },
  { name: 'Suno', url: 'https://suno.ai' },
  { name: 'YouTube Premium', url: 'https://youtube.com/premium' },
  { name: '교보문고 sam', url: 'https://sam.kyobobook.co.kr' },
  { name: '쿠팡 와우', url: 'https://coupang.com' },
  { name: '마켓컬리', url: 'https://kurly.com' },
  { name: '밀리의 서재', url: 'https://millie.co.kr' },
  { name: '네이버 멤버십', url: 'https://nid.naver.com/membership' },
  { name: '올리브영 프리미엄', url: 'https://oliveyoung.co.kr' },
  { name: '리디 셀렉트', url: 'https://select.ridibooks.com' },
  { name: 'SSG 유니버스클럽', url: 'https://ssg.com' },
  { name: 'TVING', url: 'https://tving.com' },
  { name: 'U+모바일TV', url: 'https://tv.uplus.co.kr' },
  { name: 'Watcha', url: 'https://watcha.com' },
  { name: 'Wavve', url: 'https://wavve.com' },
  { name: '윌라', url: 'https://welaaa.com' },
  { name: '요기요 플러스', url: 'https://yogiyo.co.kr' },
  { name: '배민 클럽', url: 'https://baemin.com' },
  { name: '카카오 T VIP', url: 'https://kakaot.com' },
  { name: 'GS Fresh', url: 'https://gsfresh.com' }
];

// Category mapping with phase colors
const CATEGORIES = [
  { name: '엔터테인먼트', phase: 'shine' as PhaseType, icon: Star },
  { name: '음악', phase: 'growth' as PhaseType, icon: Heart },
  { name: '개발', phase: 'challenge' as PhaseType, icon: Zap },
  { name: 'AI', phase: 'challenge' as PhaseType, icon: Sparkles },
  { name: '디자인', phase: 'growth' as PhaseType, icon: Target },
  { name: '생산성', phase: 'beginning' as PhaseType, icon: TrendingUp },
  { name: '교육', phase: 'beginning' as PhaseType, icon: Bookmark },
  { name: '피트니스', phase: 'challenge' as PhaseType, icon: Activity },
  { name: '뉴스', phase: 'beginning' as PhaseType, icon: Globe },
  { name: '게임', phase: 'shine' as PhaseType, icon: Zap },
  { name: '기타', phase: 'beginning' as PhaseType, icon: Settings }
];

const PAYMENT_CYCLES = [
  { value: 'monthly', label: '월간', icon: Calendar, description: '매월 결제' },
  { value: 'yearly', label: '연간', icon: Repeat, description: '연간 할인 혜택' },
  { value: 'onetime', label: '일회성', icon: CheckCircle, description: '한 번만 결제' }
];

const CURRENCIES = [
  { value: 'KRW', label: '원 (KRW)', symbol: '₩', icon: DollarSign },
  { value: 'USD', label: '달러 (USD)', symbol: '$', icon: DollarSign }
];

const STATUS_OPTIONS = [
  { value: 'active', label: '활성', icon: CheckCircle, color: 'success' },
  { value: 'paused', label: '일시정지', icon: PauseCircle, color: 'warning' },
  { value: 'cancelled', label: '해지', icon: XCircle, color: 'error' }
];

export function AddEditSubscription() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscriptions, preferences, addSubscription, updateSubscription } = useData();
  const { handleError } = useErrorHandler(user?.uid);
  const { withLoading, isLoading } = useLoadingState();
  
  const isEditing = !!id;
  const existingSubscription = isEditing ? subscriptions.find(sub => sub.id === id) : null;

  // Form state
  const [formData, setFormData] = useState({
    serviceName: '',
    serviceUrl: '',
    logo: '',
    logoImage: '',
    amount: '',
    currency: 'KRW' as 'KRW' | 'USD',
    paymentCycle: 'monthly' as 'monthly' | 'yearly' | 'onetime',
    paymentDay: '1',
    paymentMethod: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    autoRenewal: true,
    status: 'active' as 'active' | 'paused' | 'cancelled',
    category: '엔터테인먼트',
    tier: '',
    tags: [] as string[],
    memo: '',
    notifications: {
      sevenDays: true,
      threeDays: true,
      sameDay: false
    }
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const [activeSection, setActiveSection] = useState<'basic' | 'payment' | 'settings' | 'notifications'>('basic');
  const [newTag, setNewTag] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');

  // 서비스 드롭다운 상태
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const [serviceSearchTerm, setServiceSearchTerm] = useState('');
  const [isCustomService, setIsCustomService] = useState(false);

  // 드롭다운 외부 클릭 감지 및 리사이즈 대응
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const dropdown = document.querySelector('.service-dropdown');
      if (dropdown && !dropdown.contains(target)) {
        setIsServiceDropdownOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsServiceDropdownOpen(false);
      }
    };

    const handleResize = () => {
      // 화면 크기 변화 시 드롭다운 닫기 (레이아웃 안에 있으므로 자동으로 위치 조정됨)
      if (isServiceDropdownOpen) {
        // 필요시 추가 로직
      }
    };

    if (isServiceDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleResize);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [isServiceDropdownOpen]);

  // Initialize form with existing data when editing
  useEffect(() => {
    if (isEditing && existingSubscription) {
      setFormData({
        serviceName: existingSubscription.serviceName,
        serviceUrl: existingSubscription.serviceUrl || '',
        logo: existingSubscription.logo,
        logoImage: existingSubscription.logoImage || '',
        amount: existingSubscription.amount.toString(),
        currency: existingSubscription.currency,
        paymentCycle: existingSubscription.paymentCycle,
        paymentDay: existingSubscription.paymentDay.toString(),
        paymentMethod: existingSubscription.paymentMethod || '',
        startDate: (existingSubscription.startDate && existingSubscription.startDate !== '' ? existingSubscription.startDate : new Date().toISOString().split('T')[0]) as string,
        endDate: existingSubscription.endDate || '',
        autoRenewal: existingSubscription.autoRenewal,
        status: existingSubscription.status,
        category: existingSubscription.category,
        tier: existingSubscription.tier || '',
        tags: existingSubscription.tags,
        memo: existingSubscription.memo || '',
        notifications: existingSubscription.notifications
      });
    }
  }, [isEditing, existingSubscription]);

  // Get phase colors for selected category
  const selectedCategory = CATEGORIES.find(cat => cat.name === formData.category);
  const phaseColors = getPhaseColors(selectedCategory?.phase || 'beginning');

  // 필터링된 서비스 목록
  const filteredServices = SERVICE_LIST.filter(service =>
    service.name.toLowerCase().includes(serviceSearchTerm.toLowerCase())
  );

  // 서비스 선택 핸들러
  const handleServiceSelect = (service: { name: string; url: string }) => {
    setFormData(prev => ({
      ...prev,
      serviceName: service.name,
      serviceUrl: service.url
    }));
    setIsServiceDropdownOpen(false);
    setServiceSearchTerm('');
    setIsCustomService(false);
  };

  // 직접 입력 모드 활성화
  const handleCustomServiceInput = () => {
    setIsCustomService(true);
    setIsServiceDropdownOpen(false);
    setServiceSearchTerm('');
  };

  // 서비스 이름 변경 핸들러
  const handleServiceNameChange = (value: string) => {
    setFormData(prev => ({ ...prev, serviceName: value }));
    
    // 직접 입력 모드에서 리스트에 있는 서비스를 선택한 경우 자동으로 URL 설정
    if (isCustomService) {
      const matchedService = SERVICE_LIST.find(service => 
        service.name.toLowerCase() === value.toLowerCase()
      );
      if (matchedService) {
        setFormData(prev => ({ ...prev, serviceUrl: matchedService.url }));
        setIsCustomService(false);
      }
    }
    
    // Clear error when user starts typing
    if (errors.serviceName) {
      setErrors(prev => ({ ...prev, serviceName: undefined }));
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.serviceName.trim()) {
      newErrors.serviceName = '서비스명을 입력해주세요.';
    } else if (formData.serviceName.trim().length > 100) {
      newErrors.serviceName = '서비스명은 100자 이하여야 합니다.';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = '올바른 금액을 입력해주세요.';
    } else if (parseFloat(formData.amount) > 1000000) {
      newErrors.amount = '금액은 1,000,000 이하여야 합니다.';
    }

    const paymentDay = parseInt(formData.paymentDay);
    if (paymentDay < 1 || paymentDay > 31) {
      newErrors.paymentDay = '결제일은 1-31 사이의 숫자여야 합니다.';
    }

    if (!formData.category) {
      newErrors.category = '카테고리를 선택해주세요.';
    }

    if (!formData.paymentCycle) {
      newErrors.paymentCycle = '결제주기를 선택해주세요.';
    }

    if (!formData.currency) {
      newErrors.currency = '통화를 선택해주세요.';
    }

    // URL 검증
    if (formData.serviceUrl && !isValidUrl(formData.serviceUrl)) {
      newErrors.serviceUrl = '올바른 URL 형식을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await withLoading('submit', async () => {
      try {
        const subscriptionData = {
          serviceName: formData.serviceName.trim(),
          serviceUrl: formData.serviceUrl.trim() || undefined,
          logo: formData.logo.trim() || formData.serviceName.charAt(0).toUpperCase(),
          logoImage: formData.logoImage.trim() || undefined,
          amount: parseFloat(formData.amount),
          currency: formData.currency,
          paymentCycle: formData.paymentCycle,
          paymentDay: parseInt(formData.paymentDay),
          paymentMethod: formData.paymentMethod.trim() || undefined,
          startDate: (formData.startDate && formData.startDate !== '' ? formData.startDate : new Date().toISOString().split('T')[0]) as string,
          endDate: formData.endDate.trim() || undefined,
          autoRenewal: formData.autoRenewal,
          status: formData.status,
          category: formData.category,
          tier: formData.tier.trim() || undefined,
          tags: formData.tags,
          memo: formData.memo.trim() || undefined,
          notifications: formData.notifications
        };

        let result;
        if (isEditing && existingSubscription) {
          result = await updateSubscription(existingSubscription.id, subscriptionData);
        } else {
          result = await addSubscription(subscriptionData);
        }

        if (result.error) {
          handleError(result.error, 'Subscription Save', true);
          return;
        }

        console.log(`✅ 구독 ${isEditing ? '수정' : '추가'} 성공`);
        
        // Firebase 실시간 업데이트로 통계는 자동 계산되므로 별도 통계 수집 불필요
        
        // 성공 후 목록 페이지로 이동
        setTimeout(() => {
          navigate('/subscriptions');
        }, 1000);
      } catch (error) {
        console.error('Error saving subscription:', error);
        handleError(error, 'Subscription Save', true);
      }
    });
  };

  // Handle input changes
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle tag management
  const addTag = () => {
    const tag = newTag.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Handle image upload
  const handleImageUpload = (file: File) => {
    // Reset previous error
    setUploadError('');

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    // Create file reader
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        handleChange('logoImage', result);
      }
    };

    reader.onerror = () => {
      setUploadError('파일을 읽는 중 오류가 발생했습니다.');
    };

    // Read file as data URL
    reader.readAsDataURL(file);
  };

  // Calculate monthly amount for display
  const calculateMonthlyAmount = () => {
    const amount = parseFloat(formData.amount) || 0;
    if (formData.paymentCycle === 'yearly') {
      const monthlyAmount = amount / 12;
      const convertedAmount = formData.currency === 'USD' ? monthlyAmount * preferences.exchangeRate : monthlyAmount;
      return convertedAmount;
    }
    return formData.currency === 'USD' ? amount * preferences.exchangeRate : amount;
  };

  const sections = [
    { key: 'basic', label: '기본 정보', icon: Globe, color: 'primary' },
    { key: 'payment', label: '결제 정보', icon: CreditCard, color: 'success' },
    { key: 'settings', label: '구독 설정', icon: Settings, color: 'warning' },
    { key: 'notifications', label: '알림 설정', icon: Bell, color: 'secondary' }
  ];

  if (!existingSubscription && isEditing) {
    return (
      <div className="min-h-screen bg-background dark">
        <Header />
        <main className="pt-28 pb-token-xl px-token-md">
          <div className="max-w-7xl mx-auto">
            <GlassCard variant="light" className="p-token-2xl">
              <div className="text-center max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-error-500/20 to-warning-500/20 rounded-full flex items-center justify-center mx-auto mb-token-lg">
                  <AlertCircle size={40} className="text-error-400 icon-enhanced" />
                </div>
                <h3 className="text-white-force text-high-contrast text-lg-ko font-semibold mb-token-sm">구독을 찾을 수 없습니다</h3>
                <p className="text-white-force text-sm-ko mb-token-lg leading-relaxed opacity-60">
                  편집하려는 구독 정보가 존재하지 않거나 삭제되었습니다.
                </p>
                <div className="flex justify-center space-x-token-sm">
                  <Link to="/subscriptions">
                    <WaveButton variant="primary" className="shadow-lg shadow-primary-500/20 text-white-force">
                      <List size={16} className="mr-token-xs text-white-force" />
                      구독 목록
                    </WaveButton>
                  </Link>
                  <Link to="/dashboard">
                    <WaveButton variant="secondary" className="text-white-force">
                      <Home size={16} className="mr-token-xs text-white-force" />
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

  return (
    <div className="min-h-screen bg-background dark">
      {/* Enhanced Header */}
      <Header />

      {/* Body */}
      <main className="pt-28 pb-token-xl px-token-md">
        <div className="max-w-7xl mx-auto space-y-token-xl">
          
          {/* Enhanced Page Header */}
          <div className="flex items-center justify-end">
            <div className="flex items-center space-x-token-sm">
              <WaveButton
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                disabled={isLoading('submit')}
                className="hidden md:flex text-red-400 hover:text-red-300 hover:bg-red-500/20 active:scale-95 focus:ring-2 focus:ring-red-500/50 transition-all duration-300 font-medium"
              >
                <X size={16} className={cn("mr-token-xs text-white-force", isLoading('submit') && "animate-spin")} strokeWidth={1.5} />
                삭제
              </WaveButton>

              <WaveButton
                variant="primary"
                onClick={() => handleSubmit()}
                disabled={isLoading('submit')}
                className="shadow-lg shadow-primary-500/20 hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-300 text-white-force font-semibold"
              >
                {isLoading('submit') ? (
                  <RefreshCw size={16} className="mr-token-xs animate-spin text-white-force" />
                ) : (
                  <Save size={16} className="mr-token-xs text-white-force" />
                )}
                {isEditing ? '변경사항 저장' : '저장'}
              </WaveButton>
            </div>
          </div>

          {/* Enhanced Section Navigation */}
          <GlassCard variant="strong" className="p-token-lg">
            <div className="flex flex-wrap gap-token-md">
              {sections.map((section) => {
                const IconComponent = section.icon;
                const isActive = activeSection === section.key;
                
                return (
                  <div
                    key={section.key}
                    onClick={() => setActiveSection(section.key as any)}
                    className={cn(
                      "p-token-md rounded-lg border transition-all duration-300 cursor-pointer hover:bg-white/20 hover:border-white/40 active:scale-95 focus:ring-2 focus:ring-white/50 focus:outline-none keyboard-navigation",
                      isActive 
                        ? "bg-blue-500/40 border-blue-400/60 text-white-force shadow-lg shadow-blue-500/40" 
                        : "bg-white/10 border-white/20 text-white-force hover:text-white-force hover:bg-white/15"
                    )}
                  >
                    <div className="flex items-center space-x-token-sm">
                      <div className={cn(
                        "p-token-sm rounded-lg transition-all duration-300",
                        isActive ? "bg-blue-500/50" : "bg-white/25"
                      )}>
                        <IconComponent size={16} className={cn(
                          "transition-all duration-300",
                          isActive ? "text-white-force" : "text-white-force"
                        )} />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-white-force">{section.label}</h3>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Main Content Grid */}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-token-xl">
              
              {/* Main Form Content */}
              <div className="xl:col-span-3 space-y-token-lg">

                {/* Basic Information Section */}
                {activeSection === 'basic' && (
                  <GlassCard variant="strong" className="p-token-lg">
                                          <div className="flex items-center space-x-token-sm mb-token-lg">
                        <div className="p-token-sm bg-primary-500/20 rounded-lg">
                          <Globe size={20} className="text-primary-400 icon-enhanced" />
                        </div>
                        <div>
                          <h2 className="text-xl-ko font-semibold text-white-force text-high-contrast">기본 정보</h2>
                          <p className="text-white-force text-sm-ko opacity-60">서비스의 기본 정보를 입력하세요</p>
                        </div>
                      </div>

                    <div className="space-y-token-lg">
                      {/* Service Name & URL */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-token-md">
                        <div className="space-y-token-sm">
                          <label className="text-white-force font-medium flex items-center space-x-token-xs">
                            <Globe size={16} className="text-primary-400" />
                            <span>서비스 이름 *</span>
                          </label>
                          
                          {/* 서비스 드롭다운 */}
                          <div className="relative service-dropdown">
                            <div className="relative">
                              <input
                                type="text"
                                value={formData.serviceName}
                                onChange={(e) => handleServiceNameChange(e.target.value)}
                                onFocus={() => {
                                  setIsServiceDropdownOpen(true);
                                }}
                                onBlur={() => {
                                  // 약간의 지연을 두어 클릭 이벤트가 처리되도록 함
                                  setTimeout(() => {
                                    // 블러 처리 로직이 필요한 경우 여기에 추가
                                  }, 100);
                                }}
                                className={cn(
                                  "w-full px-token-md py-token-sm bg-white/5 border rounded-lg text-white-force placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all pr-10",
                                  errors.serviceName ? "border-error-500" : "border-white/10"
                                )}
                                placeholder="서비스를 선택하거나 직접 입력하세요..."
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setIsServiceDropdownOpen(!isServiceDropdownOpen);
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white-force transition-colors"
                              >
                                <ChevronDown size={16} className={cn("transition-transform", isServiceDropdownOpen && "rotate-180")} />
                              </button>
                            </div>
                            


                            {/* 드롭다운 메뉴 */}
                            {isServiceDropdownOpen && (
                              <div 
                                className="absolute z-50 bg-gray-900 border border-gray-600 rounded-lg shadow-2xl max-h-60 overflow-y-auto service-dropdown-menu backdrop-blur-sm mt-1"
                                style={{ 
                                  width: '100%',
                                  maxWidth: '100%',
                                  minWidth: '300px'
                                }}
                              >
                                {/* 검색 입력 */}
                                <div className="p-3 border-b border-gray-600">
                                  <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                      type="text"
                                      value={serviceSearchTerm}
                                      onChange={(e) => setServiceSearchTerm(e.target.value)}
                                      className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                      placeholder="서비스 검색..."
                                      autoFocus
                                    />
                                  </div>
                                </div>

                                {/* 서비스 목록 */}
                                <div className="py-1">
                                  {filteredServices.length > 0 ? (
                                    filteredServices.map((service, index) => (
                                      <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleServiceSelect(service)}
                                        className="w-full px-4 py-3 text-left text-white hover:bg-gray-700 transition-colors flex items-center justify-between group"
                                      >
                                        <div>
                                          <div className="font-medium">{service.name}</div>
                                          <div className="text-xs text-gray-400">{service.url}</div>
                                        </div>
                                        <Check size={16} className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                      </button>
                                    ))
                                  ) : (
                                    <div className="px-4 py-3 text-gray-400 text-sm text-center">
                                      검색 결과가 없습니다
                                    </div>
                                  )}
                                  
                                  {/* 직접 입력 옵션 */}
                                  <button
                                    type="button"
                                    onClick={handleCustomServiceInput}
                                    className="w-full px-4 py-3 text-left text-white hover:bg-gray-700 transition-colors border-t border-gray-600 flex items-center justify-between group"
                                  >
                                    <div>
                                      <div className="font-medium text-blue-400">직접 입력</div>
                                      <div className="text-xs text-gray-400">리스트에 없는 서비스 추가</div>
                                    </div>
                                    <Plus size={16} className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {errors.serviceName && (
                            <div className="flex items-center space-x-token-xs text-error-400 text-sm">
                              <AlertCircle size={12} />
                              <span>{errors.serviceName}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-token-sm">
                          <label className="text-white-force font-medium flex items-center space-x-token-xs">
                            <LinkIcon size={16} className="text-secondary-400" />
                            <span>서비스 URL</span>
                          </label>
                          <input
                            type="url"
                            value={formData.serviceUrl}
                            onChange={(e) => handleChange('serviceUrl', e.target.value)}
                            className="w-full px-token-md py-token-sm bg-white/5 border border-white/10 rounded-lg text-white-force placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            placeholder="https://example.com"
                          />
                        </div>
                      </div>

                      {/* Logo & Category */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-token-md">
                        <div className="space-y-token-sm">
                          <label className="text-white-force font-medium flex items-center space-x-token-xs">
                            <ImageIcon size={16} className="text-warning-400" />
                            <span>로고 (텍스트)</span>
                          </label>
                          <div className="flex items-center space-x-token-sm">
                            <div className={cn(
                              "w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg",
                              phaseColors.bg
                            )}>
                              {formData.logo || formData.serviceName.charAt(0).toUpperCase()}
                            </div>
                            <input
                              type="text"
                              value={formData.logo}
                              onChange={(e) => handleChange('logo', e.target.value)}
                              className="flex-1 px-token-md py-token-sm bg-white/5 border border-white/10 rounded-lg text-white-force placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                              placeholder="N, 🎵, 로고 텍스트..."
                              maxLength={3}
                            />
                          </div>
                        </div>

                        {/* Logo Image Upload */}
                        <div className="space-y-token-sm">
                          <label className="text-white-force font-medium flex items-center space-x-token-xs">
                            <Upload size={16} className="text-info-400" />
                            <span>로고 이미지 업로드</span>
                          </label>
                          
                          <div className="space-y-token-md">
                            {/* Upload Area */}
                            <div
                              className={cn(
                                "relative border-2 border-dashed rounded-lg transition-all duration-200",
                                "hover:border-primary-500/50 hover:bg-primary-500/5",
                                "border-white/20 bg-white/5"
                              )}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.currentTarget.classList.add('border-primary-500', 'bg-primary-500/10');
                              }}
                              onDragLeave={(e) => {
                                e.preventDefault();
                                e.currentTarget.classList.remove('border-primary-500', 'bg-primary-500/10');
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                e.currentTarget.classList.remove('border-primary-500', 'bg-primary-500/10');
                                const files = e.dataTransfer.files;
                                if (files.length > 0 && files[0]) {
                                  handleImageUpload(files[0]);
                                }
                              }}
                            >
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleImageUpload(file);
                                  }
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                              
                              {formData.logoImage ? (
                                <div className="relative p-token-md">
                                  <div className="flex items-center space-x-token-md">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/20">
                                      <img
                                        src={formData.logoImage}
                                        alt="로고 미리보기"
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                                                      <div className="flex-1">
                                    <p className="text-white-force font-medium mb-1">이미지 업로드됨</p>
                                    <p className="text-white-force text-sm opacity-60">새 이미지를 선택하거나 드래그하여 교체할 수 있습니다</p>
                                  </div>
                                    <WaveButton
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        handleChange('logoImage', '');
                                      }}
                                      className="text-error-400 hover:text-error-300 hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200"
                                    >
                                      <X size={16} />
                                    </WaveButton>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-token-xl text-center">
                                  <div className="w-12 h-12 bg-info-500/20 rounded-full flex items-center justify-center mx-auto mb-token-md">
                                    <Upload size={24} className="text-info-400" />
                                  </div>
                                  <p className="text-white-force font-medium mb-token-xs">
                                    로고 이미지를 업로드하세요
                                  </p>
                                  <p className="text-white-force text-sm mb-token-md opacity-60">
                                    PNG, JPG, WEBP 파일을 드래그하거나 클릭하여 선택
                                  </p>
                                  <div className="flex justify-center">
                                    <WaveButton
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="text-info-400 hover:text-info-300 hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200"
                                    >
                                      <ImageIcon size={14} className="mr-1 text-white-force" />
                                      파일 선택
                                    </WaveButton>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Upload Error */}
                            {uploadError && (
                              <div className="p-token-sm bg-error-500/10 border border-error-500/20 rounded-lg">
                                <div className="flex items-center space-x-token-sm">
                                  <AlertCircle size={14} className="text-error-400 flex-shrink-0" />
                                  <span className="text-white-force text-sm">{uploadError}</span>
                                </div>
                              </div>
                            )}

                            {/* Upload Info */}
                            <div className="w-full p-token-sm bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 hover:border-white/30 transition-all duration-200 cursor-pointer">
                              <div className="flex items-start space-x-token-sm w-full">
                                <Info size={14} className="text-white-force mt-0.5 flex-shrink-0" />
                                <div className="text-xs text-left">
                                  <p className="text-white-force font-medium mb-1">업로드 가이드</p>
                                  <ul className="text-white-force space-y-0.5 opacity-80">
                                    <li>• 권장 크기: 512x512px 이상</li>
                                    <li>• 파일 형식: PNG, JPG, WEBP</li>
                                    <li>• 최대 크기: 5MB</li>
                                    <li>• 정사각형 비율 권장</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-token-sm">
                          <label className="text-white-force font-medium flex items-center space-x-token-xs">
                            <Tag size={16} className={phaseColors.text} />
                            <span>카테고리 *</span>
                          </label>
                          <div className="grid grid-cols-2 gap-token-xs">
                            {CATEGORIES.map((category, index) => {
                              const IconComponent = category.icon;
                              const categoryColors = getPhaseColors(category.phase);
                              const isSelected = formData.category === category.name;
                              
                              return (
                                <button
                                  key={category.name + '-' + index}
                                  type="button"
                                  onClick={() => handleChange('category', category.name)}
                                  className={cn(
                                    "p-token-sm rounded-lg border transition-all duration-300 text-left hover:bg-white/20 hover:border-white/40 active:scale-95 focus:ring-2 focus:ring-white/50 focus:outline-none keyboard-navigation",
                                    isSelected 
                                      ? `${categoryColors.bg} ${categoryColors.border} text-white-force`
                                      : "bg-white/10 border-white/20 text-white-force hover:text-white-force hover:bg-white/15"
                                  )}
                                >
                                  <div className="flex items-center space-x-token-xs">
                                    <IconComponent size={14} />
                                    <span className="text-sm font-medium">{category.name}</span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                          {errors.category && (
                            <div className="flex items-center space-x-token-xs text-error-400 text-sm">
                              <AlertCircle size={12} />
                              <span>{errors.category}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tier & Logo Image URL */}
                      {showAdvanced && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-token-md">
                          <div className="space-y-token-sm">
                                                      <label className="text-white-force font-medium flex items-center space-x-token-xs">
                            <Star size={16} className="text-warning-400" />
                            <span>구독 등급</span>
                          </label>
                            <input
                              type="text"
                              value={formData.tier}
                              onChange={(e) => handleChange('tier', e.target.value)}
                              className="w-full px-token-md py-token-sm bg-white/5 border border-white/10 rounded-lg text-white-force placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                              placeholder="Premium, Pro, Basic..."
                            />
                          </div>

                          <div className="space-y-token-sm">
                                                      <label className="text-white-force font-medium flex items-center space-x-token-xs">
                            <Upload size={16} className="text-info-400" />
                            <span>로고 이미지 URL</span>
                          </label>
                            <input
                              type="url"
                              value={formData.logoImage}
                              onChange={(e) => handleChange('logoImage', e.target.value)}
                              className="w-full px-token-md py-token-sm bg-white/5 border border-white/10 rounded-lg text-white-force placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                              placeholder="https://example.com/logo.png"
                            />
                          </div>
                        </div>
                      )}

                      {/* Advanced Options Toggle */}
                      <div className="flex justify-center">
                        <WaveButton
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAdvanced(!showAdvanced)}
                          className="text-white/60 hover:text-white-force hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200"
                        >
                          {showAdvanced ? <EyeOff size={14} className="mr-1 text-white-force" /> : <Eye size={14} className="mr-1 text-white-force" />}
                          {showAdvanced ? '고급 옵션 숨기기' : '고급 옵션 보기'}
                        </WaveButton>
                      </div>
                    </div>
                  </GlassCard>
                )}

                {/* Payment Information Section */}
                {activeSection === 'payment' && (
                  <GlassCard variant="strong" className="p-token-lg">
                                          <div className="flex items-center space-x-token-sm mb-token-lg">
                        <div className="p-token-sm bg-success-500/20 rounded-lg">
                          <CreditCard size={20} className="text-white-force icon-enhanced" />
                        </div>
                        <div>
                          <h2 className="text-xl-ko font-semibold text-white-force text-high-contrast">결제 정보</h2>
                          <p className="text-white-force text-sm-ko opacity-60">구독료와 결제 설정을 입력하세요</p>
                        </div>
                      </div>

                    <div className="space-y-token-lg">
                      {/* Amount & Currency */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-token-md">
                        <div className="md:col-span-2 space-y-token-sm">
                          <label className="text-white-force font-medium flex items-center space-x-token-xs">
                            <DollarSign size={16} className="text-white-force" />
                            <span>구독료 *</span>
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              value={formData.amount}
                              onChange={(e) => handleChange('amount', e.target.value)}
                              className={cn(
                                "w-full pl-12 pr-token-md py-token-md text-xl font-bold bg-white/5 border rounded-lg text-white-force placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all",
                                errors.amount ? "border-error-500" : "border-white/10"
                              )}
                              placeholder="0"
                              min="0"
                              step="0.01"
                            />
                            <div className="absolute left-token-sm top-1/2 -translate-y-1/2 text-white/60 font-medium">
                              {CURRENCIES.find(c => c.value === formData.currency)?.symbol}
                            </div>
                          </div>
                          {errors.amount && (
                            <div className="flex items-center space-x-token-xs text-error-400 text-sm">
                              <AlertCircle size={12} />
                              <span>{errors.amount}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-token-sm">
                          <label className="text-white-force font-medium">통화</label>
                          <div className="space-y-token-xs">
                            {CURRENCIES.map((currency, index) => {
                              const IconComponent = currency.icon;
                              const isSelected = formData.currency === currency.value;
                              
                              return (
                                <button
                                  key={currency.value + '-' + index}
                                  type="button"
                                  onClick={() => handleChange('currency', currency.value)}
                                  className={cn(
                                    "w-full p-token-sm rounded-lg border transition-all duration-300 text-left hover:bg-white/20 hover:border-white/40 active:scale-95 focus:ring-2 focus:ring-white/50 focus:outline-none keyboard-navigation",
                                    isSelected 
                                      ? "bg-blue-500/40 border-blue-400/60 text-white-force shadow-lg shadow-blue-500/40"
                                      : "bg-white/10 border-white/20 text-white-force hover:text-white-force hover:bg-white/15"
                                  )}
                                >
                                  <div className="flex items-center space-x-token-sm">
                                    <IconComponent size={14} />
                                    <span className="text-sm font-medium">{currency.label}</span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Payment Cycle */}
                      <div className="space-y-token-sm">
                        <label className="text-white-force font-medium flex items-center space-x-token-xs">
                          <Repeat size={16} className="text-warning-400" />
                          <span>결제 주기 *</span>
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-token-md">
                          {PAYMENT_CYCLES.map((cycle, index) => {
                            const IconComponent = cycle.icon;
                            const isSelected = formData.paymentCycle === cycle.value;
                            
                            return (
                              <button
                                key={cycle.value + '-' + index}
                                type="button"
                                onClick={() => handleChange('paymentCycle', cycle.value)}
                                className={cn(
                                  "p-token-md rounded-lg border transition-all duration-300 text-left hover:bg-white/20 hover:border-white/40 active:scale-95 focus:ring-2 focus:ring-white/50 focus:outline-none keyboard-navigation",
                                  isSelected 
                                    ? "bg-blue-500/40 border-blue-400/60 text-white-force shadow-lg shadow-blue-500/40"
                                    : "bg-white/10 border-white/20 text-white-force hover:text-white-force hover:bg-white/15"
                                )}
                              >
                                <div className="flex items-center space-x-token-sm mb-token-xs">
                                  <IconComponent size={16} />
                                  <span className="font-medium">{cycle.label}</span>
                                </div>
                                <p className="text-xs opacity-80">{cycle.description}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Payment Day & Method */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-token-md">
                        <div className="space-y-token-sm">
                          <label className="text-white-force font-medium flex items-center space-x-token-xs">
                            <CalendarIcon size={16} className="text-white-force" />
                            <span>결제일 *</span>
                          </label>
                          <select
                            value={formData.paymentDay}
                            onChange={(e) => handleChange('paymentDay', e.target.value)}
                            className={cn(
                              "w-full px-token-md py-token-sm bg-white/5 border rounded-lg text-white-force focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all",
                              errors.paymentDay ? "border-error-500" : "border-white/10"
                            )}
                          >
                            {Array.from({ length: 31 }, (_, i) => i + 1).map((day, index) => (
                              <option key={`day-${day}-${index}`} value={day} className="bg-gray-800">
                                매월 {day}일
                              </option>
                            ))}
                          </select>
                          {errors.paymentDay && (
                            <div className="flex items-center space-x-token-xs text-error-400 text-sm">
                              <AlertCircle size={12} />
                              <span>{errors.paymentDay}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-token-sm">
                          <label className="text-white-force font-medium flex items-center space-x-token-xs">
                            <CreditCard size={16} className="text-secondary-400" />
                            <span>결제 수단</span>
                          </label>
                          <input
                            type="text"
                            value={formData.paymentMethod}
                            onChange={(e) => handleChange('paymentMethod', e.target.value)}
                            className="w-full px-token-md py-token-sm bg-white/5 border border-white/10 rounded-lg text-white-force placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            placeholder="신한카드, 계좌이체, PayPal..."
                          />
                        </div>
                      </div>

                      {/* Payment Preview */}
                      <GlassCard variant="strong" className="p-token-lg">
                        <div className="flex items-center space-x-token-sm mb-token-lg">
                          <div className="p-token-sm bg-gradient-to-br from-success-500/20 to-primary-500/20 rounded-lg">
                            <TrendingUp size={20} className="text-white-force icon-enhanced" />
                          </div>
                          <div>
                            <h3 className="text-lg-ko font-semibold text-high-contrast">결제 미리보기</h3>
                            <p className="text-white-force text-sm-ko opacity-60">구독료 정보를 한눈에 확인하세요</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-token-md">
                          <div className="p-token-md glass-light rounded-lg border border-white/10 text-center hover:bg-white/10 hover:border-white/20 transition-all duration-200">
                            <p className="text-white/80 text-sm mb-1">
                              {formData.paymentCycle === 'monthly' ? '월간' : 
                               formData.paymentCycle === 'yearly' ? '연간' : '일회성'}
                            </p>
                            <p className="text-white-force font-bold text-lg">
                              {formData.amount ? parseFloat(formData.amount).toLocaleString('ko-KR') : '0'}
                              {CURRENCIES.find(c => c.value === formData.currency)?.symbol}
                            </p>
                          </div>
                          <div className="p-token-md glass-light rounded-lg border border-white/10 text-center hover:bg-white/10 hover:border-white/20 transition-all duration-200">
                            <p className="text-white/80 text-sm mb-1">월 환산 (원화)</p>
                            <p className="text-white-force font-bold text-lg">
                              {calculateMonthlyAmount().toLocaleString('ko-KR')}원
                            </p>
                          </div>
                          <div className="p-token-md glass-light rounded-lg border border-white/10 text-center hover:bg-white/10 hover:border-white/20 transition-all duration-200">
                            <p className="text-white/80 text-sm mb-1">연간 예상</p>
                            <p className="text-white-force font-bold text-lg">
                              {(calculateMonthlyAmount() * 12).toLocaleString('ko-KR')}원
                            </p>
                          </div>
                        </div>
                      </GlassCard>
                    </div>
                  </GlassCard>
                )}

                {/* Subscription Settings Section */}
                {activeSection === 'settings' && (
                  <GlassCard variant="strong" className="p-token-lg">
                                          <div className="flex items-center space-x-token-sm mb-token-lg">
                        <div className="p-token-sm bg-warning-500/20 rounded-lg">
                          <Settings size={20} className="text-warning-400 icon-enhanced" />
                        </div>
                        <div>
                          <h2 className="text-xl-ko font-semibold text-white-force text-high-contrast">구독 설정</h2>
                          <p className="text-white-force text-sm-ko opacity-60">구독 상태와 추가 설정을 관리하세요</p>
                        </div>
                      </div>

                    <div className="space-y-token-lg">
                      {/* Status */}
                      <div className="space-y-token-sm">
                        <label className="text-white-force font-medium flex items-center space-x-token-xs">
                          <Activity size={16} className="text-warning-400" />
                          <span>구독 상태</span>
                        </label>
                        <div className="space-y-token-xs">
                          {STATUS_OPTIONS.map((status, index) => {
                            const IconComponent = status.icon;
                            const isSelected = formData.status === status.value;
                            
                            return (
                              <button
                                key={status.value + '-' + index}
                                type="button"
                                onClick={() => handleChange('status', status.value)}
                                className={cn(
                                  "w-full p-token-sm rounded-lg border transition-all duration-300 text-left hover:bg-white/20 hover:border-white/40 active:scale-95 focus:ring-2 focus:ring-white/50 focus:outline-none keyboard-navigation",
                                  isSelected 
                                    ? "bg-blue-500/40 border-blue-400/60 text-white-force shadow-lg shadow-blue-500/40"
                                    : "bg-white/10 border-white/20 text-white-force hover:text-white-force hover:bg-white/15"
                                )}
                              >
                                <div className="flex items-center space-x-token-sm">
                                  <IconComponent size={14} />
                                  <span className="text-sm font-medium">{status.label}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Start Date & End Date */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-token-md">
                        <div className="space-y-token-sm">
                          <label className="text-white-force font-medium flex items-center space-x-token-xs">
                            <Calendar size={16} className="text-white-force" />
                            <span>시작일</span>
                          </label>
                          <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => handleChange('startDate', e.target.value)}
                            className="w-full px-token-md py-token-sm bg-white/5 border border-white/10 rounded-lg text-white-force focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:contrast-100"
                          />
                        </div>

                        <div className="space-y-token-sm">
                          <label className="text-white-force font-medium flex items-center space-x-token-xs">
                            <Calendar size={16} className="text-warning-400" />
                            <span>종료일</span>
                            <span className="text-xs text-white/60">(선택사항)</span>
                          </label>
                          <div className="space-y-token-xs">
                            <div className="relative">
                              <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => {
                                  const newEndDate = e.target.value;
                                  handleChange('endDate', newEndDate);
                                  
                                  // 종료일을 설정하면 자동 갱신을 활성화
                                  if (newEndDate && !formData.autoRenewal) {
                                    handleChange('autoRenewal', true);
                                  }
                                }}
                                className="w-full px-token-md py-token-sm bg-white/5 border border-white/10 rounded-lg text-white-force focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:contrast-100"
                                placeholder="종료일을 설정하지 않으면 자동 갱신 설정에 따라 결정됩니다"
                              />
                              {formData.endDate && (
                                <button
                                  type="button"
                                  onClick={() => handleChange('endDate', '')}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-error-400 transition-colors"
                                  title="종료일 제거"
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                            <div className="text-xs text-white/60">
                              {formData.endDate ? (
                                <span className="text-warning-400">종료일 설정됨 - 해당 날짜까지 자동 갱신 후 종료</span>
                              ) : formData.autoRenewal ? (
                                <span className="text-success-400">자동 갱신 활성화 - 종료일 없이 계속 갱신</span>
                              ) : (
                                <span className="text-info-400">자동 갱신 비활성화 - 1개월 후 자동 종료</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Auto Renewal */}
                      <div className="p-token-lg glass-light rounded-xl border border-white/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-token-md">
                            <div className="p-token-sm bg-success-500/20 rounded-lg">
                              <Repeat size={20} className="text-white-force" />
                            </div>
                            <div>
                              <h3 className="text-white-force font-medium mb-1">자동 갱신</h3>
                              <p className="text-white/60 text-sm">
                                {formData.endDate 
                                  ? `종료일(${formData.endDate})까지 자동 갱신 후 종료`
                                  : formData.autoRenewal 
                                    ? '종료일 없이 계속 갱신'
                                    : '1개월 후 자동 종료'
                                }
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newAutoRenewal = !formData.autoRenewal;
                              handleChange('autoRenewal', newAutoRenewal);
                              
                              // 자동 갱신을 비활성화하면 종료일을 1개월 후로 설정
                              if (!newAutoRenewal && !formData.endDate) {
                                const oneMonthLater = new Date();
                                oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
                                handleChange('endDate', oneMonthLater.toISOString().split('T')[0]);
                              }
                              // 자동 갱신을 활성화하고 종료일이 1개월 후로 설정되어 있다면 종료일 제거
                              else if (newAutoRenewal && formData.endDate) {
                                const oneMonthLater = new Date();
                                oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
                                const oneMonthLaterStr = oneMonthLater.toISOString().split('T')[0];
                                
                                if (formData.endDate === oneMonthLaterStr) {
                                  handleChange('endDate', '');
                                }
                              }
                            }}
                            className={cn(
                              "relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-background hover:bg-white/30 active:scale-95 keyboard-navigation",
                              formData.autoRenewal ? "bg-blue-500" : "bg-white/20"
                            )}
                          >
                            <span
                              className={cn(
                                "inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200 shadow-lg",
                                formData.autoRenewal ? "translate-x-7" : "translate-x-1"
                              )}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="space-y-token-sm">
                        <label className="text-white-force font-medium flex items-center space-x-token-xs">
                          <Hash size={16} className="text-secondary-400" />
                          <span>태그</span>
                        </label>
                        
                        <div className="flex items-center space-x-token-sm">
                          <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                            className="flex-1 px-token-md py-token-sm bg-white/5 border border-white/10 rounded-lg text-white-force placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            placeholder="새 태그 입력..."
                          />
                          <WaveButton
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={addTag}
                            className="text-secondary-400 hover:text-secondary-300 hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200"
                          >
                            <Plus size={16} />
                          </WaveButton>
                        </div>

                        {formData.tags.length > 0 && (
                          <div className="flex flex-wrap gap-token-xs">
                            {formData.tags.map((tag, index) => (
                              <div key={`tag-${tag}-${index}`} className="flex items-center space-x-1 px-token-sm py-1 bg-secondary-500/40 border-secondary-400/60 shadow-lg shadow-secondary-500/30 text-white-force rounded-full font-semibold border-2">
                                <span className="text-secondary-300 text-xs font-medium">#{tag}</span>
                                <button
                                  type="button"
                                  onClick={() => removeTag(tag)}
                                  className="text-secondary-400 hover:text-secondary-300 hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Memo */}
                      <div className="space-y-token-sm">
                        <label className="text-white-force font-medium flex items-center space-x-token-xs">
                          <FileText size={16} className="text-info-400" />
                          <span>메모</span>
                        </label>
                        <textarea
                          value={formData.memo}
                          onChange={(e) => handleChange('memo', e.target.value)}
                          rows={3}
                          className="w-full px-token-md py-token-sm bg-white/5 border border-white/10 rounded-lg text-white-force placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                          placeholder="구독에 대한 추가 정보나 메모를 입력하세요..."
                        />
                      </div>
                    </div>
                  </GlassCard>
                )}

                {/* Notifications Section */}
                {activeSection === 'notifications' && (
                  <GlassCard variant="strong" className="p-token-lg">
                                          <div className="flex items-center space-x-token-sm mb-token-lg">
                        <div className="p-token-sm bg-secondary-500/20 rounded-lg">
                          <Bell size={20} className="text-secondary-400 icon-enhanced" />
                        </div>
                        <div>
                          <h2 className="text-xl-ko font-semibold text-white-force text-high-contrast">알림 설정</h2>
                          <p className="text-white-force text-sm-ko opacity-60">결제 알림을 설정하세요</p>
                        </div>
                      </div>

                    <div className="space-y-token-md">
                      {[
                        {
                          key: 'sevenDays' as keyof typeof formData.notifications,
                          title: '7일 전 알림',
                          description: '결제 7일 전에 미리 알림을 받습니다',
                          icon: Calendar,
                          recommended: true
                        },
                        {
                          key: 'threeDays' as keyof typeof formData.notifications,
                          title: '3일 전 알림',
                          description: '결제 3일 전에 알림을 받습니다',
                          icon: Bell,
                          recommended: true
                        },
                        {
                          key: 'sameDay' as keyof typeof formData.notifications,
                          title: '당일 알림',
                          description: '결제 당일에 알림을 받습니다',
                          icon: AlertCircle,
                          recommended: false
                        }
                      ].map((notification, index) => {
                        const IconComponent = notification.icon;
                        const isEnabled = formData.notifications[notification.key];
                        
                        return (
                          <div key={`notification-${notification.key}-${index}`} className={cn(
                            "p-token-lg glass-light rounded-xl border transition-all duration-300 hover:bg-white/20 hover:border-white/40",
                            isEnabled ? "border-secondary-500/40 bg-secondary-500/10" : "border-white/20"
                          )}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-start space-x-token-md flex-1">
                                <div className={cn(
                                  "p-token-sm rounded-lg",
                                  isEnabled ? "bg-secondary-500/20" : "bg-white/10"
                                )}>
                                  <IconComponent size={20} className={cn(
                                    isEnabled ? "text-secondary-400" : "text-white/60"
                                  )} />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-token-sm mb-1">
                                    <h3 className="text-white-force font-medium">{notification.title}</h3>
                                    {notification.recommended && (
                                      <span className="px-2 py-0.5 bg-white/40 border-white/60 shadow-lg shadow-white/30 text-white-force rounded-full text-xs font-semibold border-2">
                                        추천
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-white/60 text-sm">{notification.description}</p>
                                  {isEnabled && (
                                    <div className="flex items-center space-x-1 mt-2 text-xs text-white-force">
                                      <Check size={12} />
                                      <span>알림 활성화됨</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <button
                                type="button"
                                onClick={() => {
                                  const newNotifications = { 
                                    ...formData.notifications, 
                                    [notification.key]: !isEnabled 
                                  };
                                  handleChange('notifications', newNotifications);
                                }}
                                className={cn(
                                  "relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-background hover:bg-white/30 active:scale-95 keyboard-navigation",
                                  isEnabled ? "bg-blue-500" : "bg-white/20"
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
                    <div className="mt-token-lg p-token-md bg-gradient-to-r from-blue-500/20 to-primary-500/20 border border-blue-400/40 rounded-lg hover:bg-gradient-to-r hover:from-blue-500/30 hover:to-primary-500/30 hover:border-blue-400/60 transition-all duration-300">
                      <div className="flex items-center space-x-token-sm mb-token-sm">
                        <Activity size={16} className="text-white-force" />
                        <h3 className="text-white-force font-medium">알림 요약</h3>
                      </div>
                      <p className="text-white/80 text-sm">
                        총 {Object.values(formData.notifications).filter(Boolean).length}개의 알림이 활성화됩니다.
                        결제일에 맞춰 정확한 시간에 알림을 전송합니다.
                      </p>
                    </div>
                  </GlassCard>
                )}
              </div>

              {/* Enhanced Sidebar */}
              <div className="space-y-token-lg">
                
                {/* Preview Card */}
                <GlassCard variant="strong" className="p-token-lg">
                                    <div className="flex items-center space-x-token-sm mb-token-lg">
                    <div className="p-token-sm bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg">
                      <Eye size={20} className="text-white-force icon-enhanced" />
                    </div>
                  <div>
                    <h3 className="text-lg-ko font-semibold text-white-force text-high-contrast">미리보기</h3>
                        <p className="text-white-force text-sm-ko opacity-60">구독 카드 미리보기</p>
                  </div>
                </div>
                  
                  <div className="p-token-md glass-light rounded-lg border border-white/10">
                    <div className="flex items-center space-x-token-md mb-token-md">
                      <div className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg overflow-hidden",
                        phaseColors.bg
                      )}>
                        {formData.logoImage ? (
                          <img 
                            src={formData.logoImage} 
                            alt="로고"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          formData.logo || formData.serviceName.charAt(0).toUpperCase() || '?'
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white-force font-medium">
                          {formData.serviceName || '서비스 이름'}
                        </h4>
                        <div className="flex items-center space-x-1">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-xs",
                            phaseColors.bg,
                            phaseColors.text
                          )}>
                            {formData.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-token-sm text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">금액</span>
                        <span className="text-white-force font-medium">
                          {formData.amount ? parseFloat(formData.amount).toLocaleString('ko-KR') : '0'}
                          {CURRENCIES.find(c => c.value === formData.currency)?.symbol}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">주기</span>
                        <span className="text-white-force font-medium">
                          {PAYMENT_CYCLES.find(c => c.value === formData.paymentCycle)?.label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">결제일</span>
                        <span className="text-white-force font-medium">매월 {formData.paymentDay}일</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">종료일</span>
                        <span className="text-white-force font-medium">
                          {formData.endDate ? formData.endDate : (formData.autoRenewal ? '무제한' : '1개월 후')}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-white/10 pt-token-sm">
                        <span className="text-white/60">월 환산</span>
                        <span className="text-primary-400 font-medium">
                          {calculateMonthlyAmount().toLocaleString('ko-KR')}원
                        </span>
                      </div>
                    </div>
                  </div>
                </GlassCard>

                {/* Quick Actions */}
                                <GlassCard variant="light" className="p-token-lg">
                  <h3 className="text-lg-ko font-semibold text-white-force text-high-contrast mb-token-md">빠른 액션</h3>
                  <div className="space-y-6">
                    <Link to="/subscriptions">
                      <div className="p-token-md glass-light rounded-lg border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer group mb-6">
                        <div className="flex items-center space-x-token-sm">
                          <div className="p-token-sm bg-primary-500/20 rounded-lg">
                            <List size={16} className="text-primary-400 icon-enhanced" />
                          </div>
                          <div>
                            <h4 className="text-white-force font-medium">구독 목록</h4>
                            <p className="text-white/60 text-sm">전체 구독 관리</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <Link to="/dashboard">
                      <div className="p-token-md glass-light rounded-lg border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer group mb-6">
                        <div className="flex items-center space-x-token-sm">
                          <div className="p-token-sm bg-success-500/20 rounded-lg">
                            <Home size={16} className="text-white-force icon-enhanced" />
                          </div>
                          <div>
                            <h4 className="text-white-force font-medium">대시보드</h4>
                            <p className="text-white/60 text-sm">홈으로 이동</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                                          <div 
                        className="p-token-md glass-light rounded-lg border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer group"
                        onClick={() => {
                          setFormData({
                            serviceName: '',
                            serviceUrl: '',
                            logo: '',
                            logoImage: '',
                            amount: '',
                            currency: 'KRW',
                            paymentCycle: 'monthly',
                            paymentDay: '1',
                            paymentMethod: '',
                            startDate: new Date().toISOString().split('T')[0],
                            endDate: '',
                            autoRenewal: true,
                            status: 'active',
                            category: '엔터테인먼트',
                            tier: '',
                            tags: [],
                            memo: '',
                            notifications: {
                              sevenDays: true,
                              threeDays: true,
                              sameDay: false
                            }
                          });
                          setErrors({});
                        }}
                      >
                      <div className="flex items-center space-x-token-sm">
                                                  <div className="p-token-sm bg-warning-500/20 rounded-lg">
                            <RefreshCw size={16} className="text-warning-400 icon-enhanced" />
                          </div>
                        <div>
                          <h4 className="text-white-force font-medium">폼 초기화</h4>
                          <p className="text-white/60 text-sm">입력 내용 지우기</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>

                {/* Form Progress */}
                                <GlassCard variant="strong" className="p-token-lg">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-token-md">
                      <Sparkles size={24} className="text-white-force icon-enhanced" />
                    </div>
                  <h3 className="text-lg-ko font-semibold text-white-force text-high-contrast mb-token-sm">
                    {isEditing ? '편집 중' : '추가 중'}
                  </h3>
                    <p className="text-white-force/70 text-sm mb-token-md">
                      {formData.serviceName || '새 구독'}의 정보를 {isEditing ? '수정' : '설정'}하고 있습니다
                    </p>
                    
                    <div className="text-center">
                      <p className="text-2xl-ko font-bold text-white-force text-high-contrast mb-1">
                        {calculateMonthlyAmount().toLocaleString('ko-KR')}원
                      </p>
                      <p className="text-white-force/60 text-sm">
                        예상 월 지출
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Enhanced Footer */}
      <Footer />
    </div>
  );
}