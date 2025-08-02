import React, { createContext, useContext, useState, useEffect, ReactNode, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Waves } from 'lucide-react';
import { Toaster } from 'sonner';

// Lazy load components for better performance
const Login = React.lazy(() => import('./components/Login').then(module => ({ default: module.Login })));
const Signup = React.lazy(() => import('./components/Signup').then(module => ({ default: module.Signup })));
const Dashboard = React.lazy(() => import('./components/Dashboard').then(module => ({ default: module.Dashboard })));
const AllSubscriptions = React.lazy(() => import('./components/AllSubscriptions').then(module => ({ default: module.AllSubscriptions })));
const AddEditSubscription = React.lazy(() => import('./components/AddEditSubscription').then(module => ({ default: module.AddEditSubscription })));
const SubscriptionCard = React.lazy(() => import('./components/SubscriptionCard').then(module => ({ default: module.SubscriptionCard })));
const StatisticsDashboard = React.lazy(() => import('./components/StatisticsDashboard').then(module => ({ default: module.StatisticsDashboard })));
const Settings = React.lazy(() => import('./components/Settings').then(module => ({ default: module.Settings })));
const Notifications = React.lazy(() => import('./components/Notifications').then(module => ({ default: module.Notifications })));
const PaymentCalendar = React.lazy(() => import('./components/PaymentCalendar').then(module => ({ default: module.PaymentCalendar })));
const AboutUs = React.lazy(() => import('./components/AboutUs').then(module => ({ default: module.AboutUs })));
const TermsOfService = React.lazy(() => import('./components/TermsOfService').then(module => ({ default: module.TermsOfService })));
const OAuthDebugger = React.lazy(() => import('./components/OAuthDebugger').then(module => ({ default: module.OAuthDebugger })));
const RLSDebugger = React.lazy(() => import('./components/RLSDebugger').then(module => ({ default: module.RLSDebugger })));
const DataLoadingDebugger = React.lazy(() => import('./components/DataLoadingDebugger').then(module => ({ default: module.DataLoadingDebugger })));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
    {/* Debug indicator */}
    <div className="fixed top-20 left-4 z-50 bg-yellow-500 text-black px-2 py-1 rounded text-xs">
      ⏳ LoadingSpinner 활성
    </div>
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
  </div>
);

import { WaveBackground } from './components/WaveBackground';
import { MusicPlayer } from './components/MusicPlayer';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { DebugInfo } from './components/DebugInfo';
import { supabase } from './utils/supabase/client';
import { apiService } from './utils/api';
import { getOAuthErrorMessage, checkOAuthStatus } from './utils/oauth';
import { 
  updateStatisticsOnSubscriptionChange, 
  trackUserBehavior,
  collectAndSaveAllStatistics,

} from './utils/statistics';

// Types
export interface Subscription {
  id: string;
  serviceName: string;
  serviceUrl?: string;
  logo: string;
  logoImage?: string;
  amount: number;
  currency: 'KRW' | 'USD';
  paymentCycle: 'monthly' | 'yearly' | 'onetime';
  paymentDay: number;
  paymentMethod?: string;
  startDate: string;
  autoRenewal: boolean;
  status: 'active' | 'paused' | 'cancelled';
  category: string;
  tier?: string;
  tags: string[];
  memo?: string;
  notifications: {
    sevenDays: boolean;
    threeDays: boolean;
    sameDay: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  email: string;
  joinDate: string;
  name?: string;
}

export interface UserSettings {
  exchangeRate: number;
  notifications: {
    paymentReminders: boolean;
    priceChanges: boolean;
    subscriptionExpiry: boolean;
  };
}

export interface SubscriptionStats {
  // 월간 통계
  totalMonthly: number; // 1일부터 오늘까지 실제 지출한 금액
  monthlyTotal: number; // 모든 활성 구독의 월간 총액
  
  // 연간 통계
  yearlySpendingToDate: number; // 해당년도 1월 1일부터 오늘까지 지출한 합계
  yearlyTotal: number; // 해당년도 1월 1일부터 12월 31일까지 지출할 합계
  totalYearly: number; // 기존 연간 예상 (월간 총액 × 12)
  
  // 구독 상태 통계
  activeCount: number;
  pausedCount: number;
  cancelledCount: number;
  totalSubscriptions: number;
  
  // 결제 예정 통계
  upcomingPayments: number; // 7일 이내 결제 예정
  todayCount: number; // 오늘 결제 예정
  weekCount: number; // 이번 주 결제 예정
  
  // 금액 통계
  todayTotal: number; // 오늘 결제 총액
  weeklyTotal: number; // 이번 주 결제 총액
  avgSubscriptionCost: number; // 평균 구독 비용
  
  // 트렌드 통계
  monthlyTrend: number; // 전월 대비 증감률
  
  // 카테고리별 통계
  categoryBreakdown: {
    [category: string]: {
      count: number;
      totalAmount: number;
      monthlyAmount: number;
      yearlyAmount: number;
    };
  };
  
  // 결제 주기별 통계
  paymentCycleBreakdown: {
    monthly: { count: number; totalAmount: number; };
    yearly: { count: number; totalAmount: number; };
    onetime: { count: number; totalAmount: number; };
  };
  
  // 통화별 통계
  currencyBreakdown: {
    KRW: { count: number; totalAmount: number; };
    USD: { count: number; totalAmount: number; };
  };
  
  // 구독 등급별 통계
  tierBreakdown: {
    [tier: string]: {
      count: number;
      totalAmount: number;
      avgAmount: number;
    };
  };
  
  // 알림 설정 통계
  notificationStats: {
    sevenDays: number; // 7일 전 알림 설정된 구독 수
    threeDays: number; // 3일 전 알림 설정된 구독 수
    sameDay: number; // 당일 알림 설정된 구독 수
    totalWithNotifications: number; // 알림 설정된 총 구독 수
  };
  
  // 자동 갱신 통계
  autoRenewalStats: {
    enabled: number; // 자동 갱신 활성화된 구독 수
    disabled: number; // 자동 갱신 비활성화된 구독 수
    percentage: number; // 자동 갱신 비율
  };
  
  // 태그별 통계
  tagStats: {
    [tag: string]: {
      count: number;
      totalAmount: number;
    };
  };
  
  // 구독 시작일별 통계 (최근 12개월)
  startDateBreakdown: {
    [month: string]: {
      count: number;
      totalAmount: number;
    };
  };
  
  // 결제일별 통계
  paymentDayBreakdown: {
    [day: number]: {
      count: number;
      totalAmount: number;
    };
  };
  
  // 인사이트 통계
  insights: {
    mostExpensiveCategory: string; // 가장 비싼 카테고리
    cheapestCategory: string; // 가장 저렴한 카테고리
    mostPopularCategory: string; // 가장 인기 있는 카테고리
    averageMonthlySpending: number; // 평균 월 지출
    totalSavingsFromYearly: number; // 연간 구독으로 인한 총 절약액
    projectedYearlySpending: number; // 예상 연간 지출
    spendingGrowthRate: number; // 지출 증가율
    subscriptionEfficiency: number; // 구독 효율성 (활성 구독 대비 총 지출)
  };
}

interface AppContextType {
  user: User | null;
  subscriptions: Subscription[];
  settings: UserSettings;
  isAuthenticated: boolean;
  isLoading: boolean;
  stats: SubscriptionStats;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  addSubscription: (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSubscription: (id: string, subscription: Partial<Subscription>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  refreshData: () => Promise<void>;
  calculateStats: () => SubscriptionStats;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    exchangeRate: 1300,
    notifications: {
      paymentReminders: true,
      priceChanges: false,
      subscriptionExpiry: true
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<SubscriptionStats>({
    totalMonthly: 0,
    monthlyTotal: 0,
    yearlySpendingToDate: 0,
    yearlyTotal: 0,
    totalYearly: 0,
    activeCount: 0,
    pausedCount: 0,
    cancelledCount: 0,
    totalSubscriptions: 0,
    upcomingPayments: 0,
    todayCount: 0,
    weekCount: 0,
    todayTotal: 0,
    weeklyTotal: 0,
    avgSubscriptionCost: 0,
    monthlyTrend: 0,
    categoryBreakdown: {},
    paymentCycleBreakdown: {
      monthly: { count: 0, totalAmount: 0 },
      yearly: { count: 0, totalAmount: 0 },
      onetime: { count: 0, totalAmount: 0 }
    },
    currencyBreakdown: {
      KRW: { count: 0, totalAmount: 0 },
      USD: { count: 0, totalAmount: 0 }
    },
    tierBreakdown: {},
    notificationStats: {
      sevenDays: 0,
      threeDays: 0,
      sameDay: 0,
      totalWithNotifications: 0
    },
    autoRenewalStats: {
      enabled: 0,
      disabled: 0,
      percentage: 0
    },
    tagStats: {},
    startDateBreakdown: {},
    paymentDayBreakdown: {},
    insights: {
      mostExpensiveCategory: '',
      cheapestCategory: '',
      mostPopularCategory: '',
      averageMonthlySpending: 0,
      totalSavingsFromYearly: 0,
      projectedYearlySpending: 0,
      spendingGrowthRate: 0,
      subscriptionEfficiency: 0
    }
  });

  // Initialize authentication state
  useEffect(() => {
    console.log('🔄 App: initializeAuth useEffect 시작');
    const initializeAuth = async () => {
      try {
        console.log('🔍 App: getSession 호출 중...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('📋 App: getSession 결과:', { hasSession: !!session, hasUser: !!session?.user });
        
        if (session?.user) {
          // 세션 만료 확인
          const now = Math.floor(Date.now() / 1000);
          const expiresAt = session.expires_at;
          
          console.log('⏰ App: 세션 만료 확인:', { now, expiresAt, isExpired: expiresAt && now >= expiresAt });
          
          if (expiresAt && now >= expiresAt) {
            console.log('⚠️ App: 세션이 만료되었습니다.');
            await handleSessionExpired();
            return;
          }
          
          console.log('✅ App: 유효한 세션 발견, 사용자 설정 중...');
          setUser({
            id: session.user.id,
            email: session.user.email!,
            joinDate: new Date(session.user.created_at).toISOString().split('T')[0],
            name: session.user.user_metadata?.name
          });
          
          console.log('🔑 Initial auth - Setting access token:', session.access_token ? 'present' : 'missing');
          apiService.setAccessToken(session.access_token);
          
          console.log('🚀 Initial auth - Calling loadUserData...');
          await loadUserData();
        } else {
          console.log('❌ App: 세션 또는 사용자가 없음, 로그아웃 상태로 설정');
        }
      } catch (error) {
        console.error('💥 App: Error initializing auth:', error);
      } finally {
        console.log('🏁 App: initializeAuth 완료, isLoading을 false로 설정');
        setIsLoading(false);
      }
    };

    const handleSessionExpired = async () => {
      try {
        // 사용자 행동 추적
        if (user) {
          await trackUserBehavior(user.id, { action: 'session_expired' });
        }
        
        // 로그아웃 처리
        await supabase.auth.signOut();
        
        // 로컬 상태 초기화
        setUser(null);
        setSubscriptions([]);
        setSettings({
          exchangeRate: 1300,
          notifications: {
            paymentReminders: true,
            priceChanges: true,
            subscriptionExpiry: true,
          },
        });
        setStats({
          totalMonthly: 0,
          monthlyTotal: 0,
          yearlySpendingToDate: 0,
          yearlyTotal: 0,
          totalYearly: 0,
          activeCount: 0,
          pausedCount: 0,
          cancelledCount: 0,
          totalSubscriptions: 0,
          upcomingPayments: 0,
          todayCount: 0,
          weekCount: 0,
          todayTotal: 0,
          weeklyTotal: 0,
          avgSubscriptionCost: 0,
          monthlyTrend: 0,
          categoryBreakdown: {},
          paymentCycleBreakdown: {
            monthly: { count: 0, totalAmount: 0 },
            yearly: { count: 0, totalAmount: 0 },
            onetime: { count: 0, totalAmount: 0 },
          },
          currencyBreakdown: {
            KRW: { count: 0, totalAmount: 0 },
            USD: { count: 0, totalAmount: 0 },
          },
          tierBreakdown: {},
          notificationStats: {
            sevenDays: 0,
            threeDays: 0,
            sameDay: 0,
            totalWithNotifications: 0,
          },
          autoRenewalStats: {
            enabled: 0,
            disabled: 0,
            percentage: 0,
          },
          tagStats: {},
          startDateBreakdown: {},
          paymentDayBreakdown: {},
          insights: {
            mostExpensiveCategory: '',
            cheapestCategory: '',
            mostPopularCategory: '',
            averageMonthlySpending: 0,
            totalSavingsFromYearly: 0,
            projectedYearlySpending: 0,
            spendingGrowthRate: 0,
            subscriptionEfficiency: 0,
          },
        });
        
        console.log('세션 만료로 인해 로그아웃되었습니다.');
      } catch (error) {
        console.error('Session expired handling error:', error);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session?.user) {
        // 세션 만료 확인
        const now = Math.floor(Date.now() / 1000);
        const expiresAt = session.expires_at;
        
        if (expiresAt && now >= expiresAt) {
          console.log('세션이 만료되었습니다.');
          await handleSessionExpired();
          return;
        }
        
        setUser({
          id: session.user.id,
          email: session.user.email!,
          joinDate: new Date(session.user.created_at).toISOString().split('T')[0],
          name: session.user.user_metadata?.name
        });
        
        console.log('🔑 Setting access token:', session.access_token ? 'present' : 'missing');
        apiService.setAccessToken(session.access_token);
        
        console.log('🚀 Calling loadUserData after auth state change...');
        await loadUserData();
      } else if (event === 'SIGNED_OUT') {
        // 사용자 행동 추적
        if (user) {
          await trackUserBehavior(user.id, { action: 'sign_out' });
        }
        
        setUser(null);
        setSubscriptions([]);
        setSettings({
          exchangeRate: 1300,
          notifications: {
            paymentReminders: true,
            priceChanges: true,
            subscriptionExpiry: true
          }
        });
        apiService.setAccessToken(null);
      } else if (event === 'TOKEN_REFRESHED') {
        // 토큰 갱신 시 액세스 토큰 업데이트
        if (session?.access_token) {
          apiService.setAccessToken(session.access_token);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 구독 데이터나 설정이 변경될 때마다 통계 업데이트
  useEffect(() => {
    if ((subscriptions && subscriptions.length > 0) || settings.exchangeRate) {
      const newStats = calculateStats();
      setStats(newStats);
    }
  }, [subscriptions, settings.exchangeRate]);

  const loadUserData = async () => {
    try {
      console.log('🔄 loadUserData started');
      
      // Load subscriptions
      console.log('📊 Loading subscriptions...');
      const subscriptionsData = await apiService.getSubscriptions();
      console.log('📊 Subscriptions loaded:', {
        count: subscriptionsData.subscriptions?.length || 0,
        data: subscriptionsData.subscriptions?.slice(0, 2) // Log first 2 items for debugging
      });
      setSubscriptions(subscriptionsData.subscriptions || []);

      // Load settings
      console.log('⚙️ Loading settings...');
      const settingsData = await apiService.getSettings();
      console.log('⚙️ Settings loaded:', settingsData);
      if (settingsData.settings) {
        setSettings(prev => ({ ...prev, ...settingsData.settings }));
      }

      // 통계 데이터 업데이트
      console.log('📈 Calculating stats...');
      const newStats = calculateStats();
      console.log('📈 Stats calculated:', {
        totalSubscriptions: newStats.totalSubscriptions,
        activeCount: newStats.activeCount,
        totalMonthly: newStats.totalMonthly
      });
      setStats(newStats);
      
      console.log('✅ loadUserData completed successfully');
    } catch (error) {
      console.error('❌ Error loading user data:', error);
      
      // More detailed error logging
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      // Try to identify the specific issue
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('🔍 Auth session check:', {
          hasSession: !!session,
          userId: session?.user?.id,
          accessToken: session?.access_token ? 'present' : 'missing'
        });
      } catch (authError) {
        console.error('🔍 Auth session check failed:', authError);
      }
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // 더 구체적인 에러 메시지 제공
        let errorMessage = '로그인에 실패했습니다.';
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = '이메일 인증이 필요합니다. 이메일을 확인해주세요.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = '너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.';
        }
        
        throw new Error(errorMessage);
      }

      if (data.user) {
        // 사용자 행동 추적
        await trackUserBehavior(data.user.id, { action: 'login' });
        
        // 통계 데이터 초기화 (필요한 경우)
        try {
          await collectAndSaveAllStatistics(data.user.id);
        } catch (error) {
          console.warn('통계 데이터 초기화 실패:', error);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      // OAuth 상태 확인
      const oauthStatus = checkOAuthStatus();
      console.log('OAuth 상태:', oauthStatus);
      
      if (!oauthStatus.isConfigured) {
        throw new Error('Google OAuth가 설정되지 않았습니다. 개발자에게 문의하세요.');
      }
      
      // 현재 도메인 감지
      const currentOrigin = window.location.origin;
      const redirectUrl = `${currentOrigin}/dashboard`;
      
      console.log('Google OAuth 시작:', {
        origin: currentOrigin,
        redirectUrl: redirectUrl,
        timestamp: new Date().toISOString()
      });
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Google OAuth 오류:', error);
        
        // 구체적인 오류 메시지 제공
        const errorMessage = getOAuthErrorMessage(error.message);
        throw new Error(errorMessage);
      }
      
      console.log('Google OAuth 성공:', data);
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    try {
      // First create user via our API
      await apiService.signup(email, password, name);
      
      // Then sign them in
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // 더 구체적인 에러 메시지 제공
        let errorMessage = '로그인에 실패했습니다.';
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = '이메일 인증이 필요합니다. 이메일을 확인해주세요.';
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // 사용자 행동 추적
      if (user) {
        await trackUserBehavior(user.id, { action: 'logout' });
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error('로그아웃에 실패했습니다. 다시 시도해주세요.');
      }
      
      // 로컬 상태 초기화
      setUser(null);
      setSubscriptions([]);
      setSettings({
        exchangeRate: 1300,
        notifications: {
          paymentReminders: true,
          priceChanges: true,
          subscriptionExpiry: true,
        },
      });
      setStats({
        totalMonthly: 0,
        monthlyTotal: 0,
        yearlySpendingToDate: 0,
        yearlyTotal: 0,
        totalYearly: 0,
        activeCount: 0,
        pausedCount: 0,
        cancelledCount: 0,
        totalSubscriptions: 0,
        upcomingPayments: 0,
        todayCount: 0,
        weekCount: 0,
        todayTotal: 0,
        weeklyTotal: 0,
        avgSubscriptionCost: 0,
        monthlyTrend: 0,
        categoryBreakdown: {},
        paymentCycleBreakdown: {
          monthly: { count: 0, totalAmount: 0 },
          yearly: { count: 0, totalAmount: 0 },
          onetime: { count: 0, totalAmount: 0 },
        },
        currencyBreakdown: {
          KRW: { count: 0, totalAmount: 0 },
          USD: { count: 0, totalAmount: 0 },
        },
        tierBreakdown: {},
        notificationStats: {
          sevenDays: 0,
          threeDays: 0,
          sameDay: 0,
          totalWithNotifications: 0,
        },
        autoRenewalStats: {
          enabled: 0,
          disabled: 0,
          percentage: 0,
        },
        tagStats: {},
        startDateBreakdown: {},
        paymentDayBreakdown: {},
        insights: {
          mostExpensiveCategory: '',
          cheapestCategory: '',
          mostPopularCategory: '',
          averageMonthlySpending: 0,
          totalSavingsFromYearly: 0,
          projectedYearlySpending: 0,
          spendingGrowthRate: 0,
          subscriptionEfficiency: 0,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const addSubscription = async (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await apiService.createSubscription(subscription);
      setSubscriptions(prev => [...prev, response.subscription]);
      
      // 통계 업데이트
      if (user) {
        await updateStatisticsOnSubscriptionChange(response.subscription.id, user.id, 'create');
        await trackUserBehavior(user.id, { action: 'subscription_add' });
      }
    } catch (error) {
      console.error('Error adding subscription:', error);
      throw error;
    }
  };

  const updateSubscription = async (id: string, updates: Partial<Subscription>) => {
    try {
      const response = await apiService.updateSubscription(id, updates);
      setSubscriptions(prev => 
        prev.map(sub => sub.id === id ? response.subscription : sub)
      );
      
      // 통계 업데이트
      if (user) {
        await updateStatisticsOnSubscriptionChange(id, user.id, 'update');
        await trackUserBehavior(user.id, { action: 'subscription_edit' });
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  };

  const deleteSubscription = async (id: string) => {
    try {
      await apiService.deleteSubscription(id);
      setSubscriptions(prev => prev.filter(sub => sub.id !== id));
      
      // 통계 업데이트
      if (user) {
        await updateStatisticsOnSubscriptionChange(id, user.id, 'delete');
        await trackUserBehavior(user.id, { action: 'subscription_delete' });
      }
    } catch (error) {
      console.error('Error deleting subscription:', error);
      throw error;
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    try {
      const response = await apiService.updateSettings(newSettings);
      setSettings(prev => ({ ...prev, ...response.settings }));
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  const calculateStats = (): SubscriptionStats => {
    // Safety check to ensure subscriptions is always an array
    if (!subscriptions || !Array.isArray(subscriptions)) {
      return {
        totalMonthly: 0,
        monthlyTotal: 0,
        totalYearly: 0,
        yearlyTotal: 0,
        yearlySpendingToDate: 0,
        activeCount: 0,
        pausedCount: 0,
        cancelledCount: 0,
        totalSubscriptions: 0,
        upcomingPayments: 0,
        todayCount: 0,
        todayTotal: 0,
        weekCount: 0,
        weeklyTotal: 0,
        prevMonthTotal: 0,
        categoryBreakdown: {},
        tierBreakdown: {},
        tagStats: {},
        paymentDayBreakdown: {},
        startDateBreakdown: {},
        notificationStats: { enabled: 0, disabled: 0, percentage: 0 },
        monthlyTrend: 0,
        yearlyTrend: 0
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentDay = now.getDate();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    let totalMonthly = 0; // 1일부터 오늘까지 실제 지출한 금액
    let monthlyTotal = 0; // 모든 활성 구독의 월간 총액
    let yearlySpendingToDate = 0; // 해당년도 1월 1일부터 오늘까지 지출한 합계
    let yearlyTotal = 0; // 해당년도 1월 1일부터 12월 31일까지 지출할 합계
    let totalYearly = 0;
    let activeCount = 0;
    let pausedCount = 0;
    let cancelledCount = 0;
    let upcomingPayments = 0;
    let todayCount = 0;
    let weekCount = 0;
    let todayTotal = 0;
    let weeklyTotal = 0;
    
    // Previous month calculations for trends
    let prevMonthTotal = 0;

    subscriptions.forEach(sub => {
      const amount = sub.currency === 'USD' ? sub.amount * settings.exchangeRate : sub.amount;
      
      if (sub.status === 'active') {
        activeCount++;
        
        // 1일부터 오늘까지 실제 지출한 금액 계산
        if (sub.paymentDay <= currentDay) {
          totalMonthly += amount;
        }
        
        // 모든 활성 구독의 월간 총액 계산
        if (sub.paymentCycle === 'monthly') {
          monthlyTotal += amount;
          totalYearly += amount * 12;
        } else if (sub.paymentCycle === 'yearly') {
          totalYearly += amount;
          monthlyTotal += amount / 12;
        }

        // 해당년도 1월 1일부터 오늘까지 지출한 합계 계산

        const today = new Date(currentYear, currentMonth, currentDay);
        
        // 월간 구독의 경우: 1월부터 현재 월까지의 결제일 확인
        if (sub.paymentCycle === 'monthly') {
          for (let month = 0; month <= currentMonth; month++) {
            const paymentDate = new Date(currentYear, month, sub.paymentDay);
            if (paymentDate <= today) {
              yearlySpendingToDate += amount;
            }
          }
        }
        // 연간 구독의 경우: 1월 1일 이후에 결제일이 있으면 포함
        else if (sub.paymentCycle === 'yearly') {
          const paymentDate = new Date(currentYear, 0, sub.paymentDay);
          if (paymentDate <= today) {
            yearlySpendingToDate += amount;
          }
        }

        // 해당년도 1월 1일부터 12월 31일까지 지출할 합계 계산
        if (sub.paymentCycle === 'monthly') {
          // 월간 구독: 12개월 × 월간 금액
          yearlyTotal += amount * 12;
        } else if (sub.paymentCycle === 'yearly') {
          // 연간 구독: 연간 금액
          yearlyTotal += amount;
        }

        // Check for upcoming payments (next 7 days)
        const paymentDate = new Date(currentYear, currentMonth, sub.paymentDay);
        if (paymentDate < now) {
          paymentDate.setMonth(paymentDate.getMonth() + 1);
        }
        
        const daysUntilPayment = Math.ceil((paymentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilPayment <= 7 && daysUntilPayment >= 0) {
          upcomingPayments++;
        }

        // 오늘 결제 예정 확인
        if (sub.paymentDay === currentDay) {
          todayCount++;
          todayTotal += amount;
        }

        // 이번 주 결제 예정 확인
        const startOfWeek = new Date(now);
        const endOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        endOfWeek.setDate(now.getDate() + (6 - now.getDay()));
        
        const weekPaymentDate = new Date(currentYear, currentMonth, sub.paymentDay);
        if (weekPaymentDate >= startOfWeek && weekPaymentDate <= endOfWeek) {
          weekCount++;
          weeklyTotal += amount;
        }

        // Calculate previous month trend (simplified - assumes subscription existed)
        const subStartDate = new Date(sub.startDate);
        if (subStartDate <= new Date(lastMonthYear, lastMonth + 1, 0)) {
          if (sub.paymentCycle === 'monthly') {
            prevMonthTotal += amount;
          } else if (sub.paymentCycle === 'yearly') {
            prevMonthTotal += amount / 12;
          }
        }
      } else if (sub.status === 'paused') {
        pausedCount++;
      } else if (sub.status === 'cancelled') {
        cancelledCount++;
      }
    });

    const monthlyTrend = prevMonthTotal > 0 ? ((totalMonthly - prevMonthTotal) / prevMonthTotal) * 100 : 0;
    const avgSubscriptionCost = activeCount > 0 ? monthlyTotal / activeCount : 0;

    // 카테고리별 통계 계산
    const categoryBreakdown: { [category: string]: { count: number; totalAmount: number; monthlyAmount: number; yearlyAmount: number; } } = {};
    const categoryStats: { [category: string]: { count: number; totalAmount: number; monthlyAmount: number; } } = {};

    // 결제 주기별 통계 계산
    const paymentCycleBreakdown = {
      monthly: { count: 0, totalAmount: 0 },
      yearly: { count: 0, totalAmount: 0 },
      onetime: { count: 0, totalAmount: 0 }
    };

    // 통화별 통계 계산
    const currencyBreakdown = {
      KRW: { count: 0, totalAmount: 0 },
      USD: { count: 0, totalAmount: 0 }
    };

    // 구독 등급별 통계 계산
    const tierBreakdown: { [tier: string]: { count: number; totalAmount: number; avgAmount: number; } } = {};

    // 알림 설정 통계 계산
    const notificationStats = {
      sevenDays: 0,
      threeDays: 0,
      sameDay: 0,
      totalWithNotifications: 0
    };

    // 자동 갱신 통계 계산
    const autoRenewalStats = {
      enabled: 0,
      disabled: 0,
      percentage: 0
    };

    // 태그별 통계 계산
    const tagStats: { [tag: string]: { count: number; totalAmount: number; } } = {};

    // 구독 시작일별 통계 계산 (최근 12개월)
    const startDateBreakdown: { [month: string]: { count: number; totalAmount: number; } } = {};

    // 결제일별 통계 계산
    const paymentDayBreakdown: { [day: number]: { count: number; totalAmount: number; } } = {};

    // 모든 구독을 다시 순회하여 상세 통계 계산
    subscriptions.forEach(sub => {
      const amount = sub.currency === 'USD' ? sub.amount * settings.exchangeRate : sub.amount;
      const monthlyAmount = sub.paymentCycle === 'yearly' ? amount / 12 : amount;

      // 카테고리별 통계
      if (!categoryStats[sub.category]) {
        categoryStats[sub.category] = { count: 0, totalAmount: 0, monthlyAmount: 0 };
      }
      categoryStats[sub.category].count++;
      categoryStats[sub.category].totalAmount += amount;
      categoryStats[sub.category].monthlyAmount += monthlyAmount;

      // 결제 주기별 통계
      paymentCycleBreakdown[sub.paymentCycle].count++;
      paymentCycleBreakdown[sub.paymentCycle].totalAmount += amount;

      // 통화별 통계
      currencyBreakdown[sub.currency].count++;
      currencyBreakdown[sub.currency].totalAmount += amount;

      // 구독 등급별 통계
      if (sub.tier) {
        if (!tierBreakdown[sub.tier]) {
          tierBreakdown[sub.tier] = { count: 0, totalAmount: 0, avgAmount: 0 };
        }
        tierBreakdown[sub.tier].count++;
        tierBreakdown[sub.tier].totalAmount += amount;
      }

      // 알림 설정 통계
      if (sub.notifications?.sevenDays) notificationStats.sevenDays++;
      if (sub.notifications?.threeDays) notificationStats.threeDays++;
      if (sub.notifications?.sameDay) notificationStats.sameDay++;
      if (sub.notifications?.sevenDays || sub.notifications?.threeDays || sub.notifications?.sameDay) {
        notificationStats.totalWithNotifications++;
      }

      // 자동 갱신 통계
      if (sub.autoRenewal) {
        autoRenewalStats.enabled++;
      } else {
        autoRenewalStats.disabled++;
      }

      // 태그별 통계
      if (sub.tags && Array.isArray(sub.tags)) {
        sub.tags.forEach(tag => {
          if (!tagStats[tag]) {
            tagStats[tag] = { count: 0, totalAmount: 0 };
          }
          tagStats[tag].count++;
          tagStats[tag].totalAmount += amount;
        });
      }

      // 구독 시작일별 통계 (최근 12개월)
      const startDate = new Date(sub.startDate);
      const monthKey = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
      if (!startDateBreakdown[monthKey]) {
        startDateBreakdown[monthKey] = { count: 0, totalAmount: 0 };
      }
      startDateBreakdown[monthKey].count++;
      startDateBreakdown[monthKey].totalAmount += amount;

      // 결제일별 통계
      if (!paymentDayBreakdown[sub.paymentDay]) {
        paymentDayBreakdown[sub.paymentDay] = { count: 0, totalAmount: 0 };
      }
      paymentDayBreakdown[sub.paymentDay].count++;
      paymentDayBreakdown[sub.paymentDay].totalAmount += amount;
    });

    // 자동 갱신 비율 계산
    const totalAutoRenewal = autoRenewalStats.enabled + autoRenewalStats.disabled;
    autoRenewalStats.percentage = totalAutoRenewal > 0 ? (autoRenewalStats.enabled / totalAutoRenewal) * 100 : 0;

    // 구독 등급별 평균 금액 계산
    Object.keys(tierBreakdown).forEach(tier => {
      if (tierBreakdown[tier].count > 0) {
        tierBreakdown[tier].avgAmount = tierBreakdown[tier].totalAmount / tierBreakdown[tier].count;
      }
    });

    // 카테고리별 연간 금액 계산
    Object.keys(categoryStats).forEach(category => {
      categoryBreakdown[category] = {
        count: categoryStats[category].count,
        totalAmount: categoryStats[category].totalAmount,
        monthlyAmount: categoryStats[category].monthlyAmount,
        yearlyAmount: categoryStats[category].monthlyAmount * 12
      };
    });

    // 인사이트 계산
    const insights = {
      mostExpensiveCategory: '',
      cheapestCategory: '',
      mostPopularCategory: '',
      averageMonthlySpending: 0,
      totalSavingsFromYearly: 0,
      projectedYearlySpending: 0,
      spendingGrowthRate: 0,
      subscriptionEfficiency: 0
    };

    // 가장 비싼/저렴한/인기 있는 카테고리 찾기
    let maxAmount = 0;
    let minAmount = Infinity;
    let maxCount = 0;

    Object.keys(categoryStats).forEach(category => {
      if (categoryStats[category].monthlyAmount > maxAmount) {
        maxAmount = categoryStats[category].monthlyAmount;
        insights.mostExpensiveCategory = category;
      }
      if (categoryStats[category].monthlyAmount < minAmount) {
        minAmount = categoryStats[category].monthlyAmount;
        insights.cheapestCategory = category;
      }
      if (categoryStats[category].count > maxCount) {
        maxCount = categoryStats[category].count;
        insights.mostPopularCategory = category;
      }
    });

    // 평균 월 지출
    insights.averageMonthlySpending = monthlyTotal;

    // 연간 구독으로 인한 절약액 계산 (월간 가격 대비 연간 구독 할인율 20% 가정)
    const yearlySubscriptions = subscriptions.filter(sub => sub.paymentCycle === 'yearly' && sub.status === 'active');
    insights.totalSavingsFromYearly = yearlySubscriptions.reduce((total, sub) => {
      const amount = sub.currency === 'USD' ? sub.amount * settings.exchangeRate : sub.amount;
      const monthlyEquivalent = amount / 12;
      const yearlyEquivalent = monthlyEquivalent * 12;
      const savings = yearlyEquivalent - amount;
      return total + savings;
    }, 0);

    // 예상 연간 지출
    insights.projectedYearlySpending = yearlyTotal;

    // 지출 증가율 (전월 대비)
    insights.spendingGrowthRate = monthlyTrend;

    // 구독 효율성 (활성 구독 대비 총 지출)
    insights.subscriptionEfficiency = activeCount > 0 ? monthlyTotal / activeCount : 0;

    return {
      totalMonthly,
      monthlyTotal,
      yearlySpendingToDate,
      yearlyTotal,
      totalYearly,
      activeCount,
      pausedCount,
      cancelledCount,
      totalSubscriptions: subscriptions.length,
      upcomingPayments,
      todayCount,
      weekCount,
      todayTotal,
      weeklyTotal,
      avgSubscriptionCost,
      monthlyTrend,
      categoryBreakdown,
      paymentCycleBreakdown,
      currencyBreakdown,
      tierBreakdown,
      notificationStats,
      autoRenewalStats,
      tagStats,
      startDateBreakdown,
      paymentDayBreakdown,
      insights
    };
  };

  const refreshData = async () => {
    if (user) {
      await loadUserData();
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      subscriptions: subscriptions || [],
      settings,
      isAuthenticated: !!user,
      isLoading,
      stats,
      login,
      loginWithGoogle,
      signup,
      logout,
      addSubscription,
      updateSubscription,
      deleteSubscription,
      updateSettings,
      refreshData,
      calculateStats
    }}>
      <Suspense fallback={<LoadingSpinner />}>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="min-h-screen bg-background text-foreground dark">
            {/* Moonwave Background */}
            <WaveBackground />
            
            {/* Main content */}
            <div className="relative z-10">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/" element={<ProtectedRoute><Navigate to="/dashboard" /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/subscriptions" element={<ProtectedRoute><AllSubscriptions /></ProtectedRoute>} />
                <Route path="/subscriptions/:id" element={<ProtectedRoute><SubscriptionCard /></ProtectedRoute>} />
                <Route path="/subscriptions/new" element={<ProtectedRoute><AddEditSubscription /></ProtectedRoute>} />
                <Route path="/subscriptions/:id/edit" element={<ProtectedRoute><AddEditSubscription /></ProtectedRoute>} />
                <Route path="/calendar" element={<ProtectedRoute><PaymentCalendar /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                <Route path="/statistics" element={<ProtectedRoute><StatisticsDashboard /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/terms" element={<TermsOfService />} />
                
                {/* Handle preview_page.html and other unmatched routes */}
                <Route path="/preview_page.html" element={<RedirectRoute />} />
                <Route path="*" element={<RedirectRoute />} />
              </Routes>
            </div>
            
            {/* Music Player - Absolute Position */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
              <MusicPlayer />
            </div>
            
            {/* PWA Install Prompt */}
            <PWAInstallPrompt />
            
            {/* Debug Info - Always show for debugging login issue */}
            <DebugInfo />
            
            {import.meta.env.VITE_DEV_MODE === 'true' && <OAuthDebugger />}
            <Toaster />
          </div>
        </Router>
      </Suspense>
    </AppContext.Provider>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const context = useContext(AppContext);
  
  console.log('🛡️ ProtectedRoute: 렌더링 시작', { hasContext: !!context });
  
  if (!context) {
    console.log('❌ ProtectedRoute: context가 없음, 로딩 화면 표시');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark">
        <div className="flex flex-col items-center space-y-token-md">
          <Waves 
            size={64}
            className="text-primary-500 wave-pulse transform-gpu animate-spin"
            aria-label="로딩 중"
          />
          <div className="text-white/60 text-sm tracking-wide">로딩 중...</div>
        </div>
      </div>
    );
  }
  
  const { isAuthenticated, isLoading } = context;
  
  console.log('🛡️ ProtectedRoute: 상태 확인', { isAuthenticated, isLoading });
  
  if (isLoading) {
    console.log('⏳ ProtectedRoute: 로딩 중, 로딩 화면 표시');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark">
        {/* Debug indicator */}
        <div className="fixed top-20 left-4 z-50 bg-blue-500 text-white px-2 py-1 rounded text-xs">
          🛡️ ProtectedRoute 로딩중
        </div>
        <div className="flex flex-col items-center space-y-token-md">
          <Waves 
            size={64}
            className="text-primary-500 wave-pulse transform-gpu animate-spin"
            aria-label="로딩 중"
          />
          <div className="text-white/60 text-sm tracking-wide">로딩 중...</div>
        </div>
      </div>
    );
  }
  
  console.log('🛡️ ProtectedRoute: 최종 결정', { 
    isAuthenticated, 
    willShowChildren: isAuthenticated,
    willRedirectToLogin: !isAuthenticated 
  });
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function RedirectRoute() {
  const context = useContext(AppContext);
  
  console.log('🔄 RedirectRoute: 렌더링 시작', { hasContext: !!context });
  
  if (!context) {
    console.log('❌ RedirectRoute: context가 없음, 로딩 화면 표시');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark">
        <div className="flex flex-col items-center space-y-token-md">
          <Waves 
            size={64}
            className="text-primary-500 wave-pulse transform-gpu animate-spin"
            aria-label="로딩 중"
          />
          <div className="text-white/60 text-sm tracking-wide">로딩 중...</div>
        </div>
      </div>
    );
  }
  
  const { isAuthenticated, isLoading } = context;
  
  console.log('🔄 RedirectRoute: 상태 확인', { isAuthenticated, isLoading });
  
  if (isLoading) {
    console.log('⏳ RedirectRoute: 로딩 중, 로딩 화면 표시');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark">
        <div className="flex flex-col items-center space-y-token-md">
          <Waves 
            size={64}
            className="text-primary-500 wave-pulse transform-gpu animate-spin"
            aria-label="로딩 중"
          />
          <div className="text-white/60 text-sm tracking-wide">로딩 중...</div>
        </div>
      </div>
    );
  }
  
  // Redirect based on authentication status
  console.log('🔄 RedirectRoute: 리다이렉트 결정', { 
    isAuthenticated, 
    redirectTo: isAuthenticated ? "/dashboard" : "/login" 
  });
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}

function App() {
  return (
    <AppProvider>
      <Suspense fallback={<LoadingSpinner />}>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="min-h-screen bg-background text-foreground dark">
            {/* Moonwave Background */}
            <WaveBackground />
            
            {/* Main content */}
            <div className="relative z-10">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/" element={<ProtectedRoute><Navigate to="/dashboard" /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/subscriptions" element={<ProtectedRoute><AllSubscriptions /></ProtectedRoute>} />
                <Route path="/subscriptions/:id" element={<ProtectedRoute><SubscriptionCard /></ProtectedRoute>} />
                <Route path="/subscriptions/new" element={<ProtectedRoute><AddEditSubscription /></ProtectedRoute>} />
                <Route path="/subscriptions/:id/edit" element={<ProtectedRoute><AddEditSubscription /></ProtectedRoute>} />
                <Route path="/calendar" element={<ProtectedRoute><PaymentCalendar /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                <Route path="/statistics" element={<ProtectedRoute><StatisticsDashboard /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/rls-debug" element={<RLSDebugger />} />
                <Route path="/data-debug" element={<ProtectedRoute><DataLoadingDebugger /></ProtectedRoute>} />
                
                {/* Handle preview_page.html and other unmatched routes */}
                <Route path="/preview_page.html" element={<RedirectRoute />} />
                <Route path="*" element={<RedirectRoute />} />
              </Routes>
            </div>
            
            {/* Music Player - Absolute Position */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
              <MusicPlayer />
            </div>
            
            {/* PWA Install Prompt */}
            <PWAInstallPrompt />
            
            {/* Debug Info - Always show for debugging login issue */}
            <DebugInfo />
            
            {import.meta.env.VITE_DEV_MODE === 'true' && <OAuthDebugger />}
            <Toaster />
          </div>
        </Router>
      </Suspense>
    </AppProvider>
  );
}

export default App;