import React, { createContext, useContext, useState, useEffect, ReactNode, Suspense } from 'react';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Waves } from 'lucide-react';
import { Toaster } from 'sonner';

// Lazy load components for better performance
const Login = React.lazy(() => import('./components/Login').then(module => ({ default: module.Login })));
const Signup = React.lazy(() => import('./components/Signup').then(module => ({ default: module.Signup })));
const MagicLinkLogin = React.lazy(() => import('./components/MagicLinkLogin').then(module => ({ default: module.MagicLinkLogin })));
const MagicLinkSignup = React.lazy(() => import('./components/MagicLinkSignup').then(module => ({ default: module.MagicLinkSignup })));
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
const FirebaseDebugger = React.lazy(() => import('./components/FirebaseDebugger').then(module => ({ default: module.default })));
const OAuthDebugger = React.lazy(() => import('./components/OAuthDebugger').then(module => ({ default: module.OAuthDebugger })));
const AuthCallback = React.lazy(() => import('./components/AuthCallback').then(module => ({ default: module.AuthCallback })));
const SupabaseTestDashboard = React.lazy(() => import('./components/SupabaseTestDashboard').then(module => ({ default: module.SupabaseTestDashboard })));
const MusicPlayer = React.lazy(() => import('./components/MusicPlayer').then(module => ({ default: module.MusicPlayer })));


// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
  </div>
);

import { WaveBackground } from './components/WaveBackground';
import PWAInstallPrompt from './components/PWAInstallPrompt';

// Authenticated Music Player Component - 임시로 비활성화
function AuthenticatedMusicPlayer() {
  // const { isAuthenticated } = useApp();
  
  // if (!isAuthenticated) {
  //   return null;
  // }
  
  return null; // MusicPlayer 임시 비활성화
}
// Firebase client imports
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { checkAuthStatus } from './utils/firebase/config';
import { signInWithEmail, signInWithGoogle, signOutUser } from './utils/firebase/client';
import { apiService } from './utils/api';
import { getOAuthErrorMessage, checkOAuthStatus } from './utils/oauth';
import { 
  updateStatisticsOnSubscriptionChange, 
  trackUserBehavior,
  collectAndSaveAllStatistics,

} from './utils/statistics';

// Supabase 테스트 도구 (개발 모드에서만) - 사용되지 않으므로 주석 처리
// Firebase auth and data hooks
import { useFirebaseAuth } from './hooks/useFirebaseAuth';

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
  endDate?: string;
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

export interface UserPreferences {
  id?: string;
  userId?: string;
  exchangeRate: number;
  defaultCurrency: 'KRW' | 'USD';
  notifications: {
    paymentReminders: boolean;
    priceChanges: boolean;
    subscriptionExpiry: boolean;
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
  language: 'ko' | 'en';
  timezone: string;
  dateFormat: string;
  currencyFormat: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'payment' | 'renewal' | 'expiry' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  subscriptionId?: string;
  category?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  subscriptionId: string;
  serviceName: string;
  amount: number;
  currency: 'KRW' | 'USD';
  paymentDate: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod?: string;
  paymentCycle?: 'monthly' | 'yearly' | 'onetime';
  notes?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  userId?: string;
  name: string;
  color: string;
  icon?: string;
  description?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// 간소화된 통계 타입
export interface SubscriptionStats {
  // 기본 통계
  totalSubscriptions: number;
  activeSubscriptions: number;
  pausedSubscriptions: number;
  cancelledSubscriptions: number;
  
  // 금액 통계
  totalMonthlyKrw: number;
  avgSubscriptionCost: number;
  
  // 결제 예정 통계
  upcomingPayments: number; // 7일 이내 결제 예정
  todayCount: number; // 오늘 결제 예정
  weekCount: number; // 이번 주 결제 예정
  
  // 카테고리별 통계
  categoryBreakdown: {
    [category: string]: {
      count: number;
      totalAmount: number;
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
  
  // 알림 설정 통계
  notificationStats: {
    sevenDays: number;
    threeDays: number;
    sameDay: number;
    totalWithNotifications: number;
  };
  
  // 자동 갱신 통계
  autoRenewalStats: {
    enabled: number;
    disabled: number;
    percentage: number;
  };
}

interface AppContextType {
  user: User | null;
  subscriptions: Subscription[];
  preferences: UserPreferences;
  notifications: Notification[];
  categories: Category[];
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
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  refreshData: () => Promise<void>;
  calculateStats: () => SubscriptionStats;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    console.warn('useApp이 AppProvider 외부에서 호출되었습니다.');
    // 기본값을 반환하여 에러를 방지
    return {
      user: null,
      subscriptions: [],
      preferences: {
        exchangeRate: 1300,
        defaultCurrency: 'KRW',
        notifications: {
          paymentReminders: true,
          priceChanges: false,
          subscriptionExpiry: true,
          email: true,
          push: true,
          sms: false,
        },
        theme: 'auto',
        language: 'ko',
        timezone: 'Asia/Seoul',
        dateFormat: 'YYYY-MM-DD',
        currencyFormat: 'KRW',
      },
      notifications: [],
      categories: [],
      isAuthenticated: false,
      isLoading: true,
      stats: {
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        pausedSubscriptions: 0,
        cancelledSubscriptions: 0,
        totalMonthlyKrw: 0,
        avgSubscriptionCost: 0,
        upcomingPayments: 0,
        todayCount: 0,
        weekCount: 0,
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
        }
      },
      login: async () => {},
      loginWithGoogle: async () => {},
      signup: async () => {},
      logout: async () => {},
      addSubscription: async () => {},
      updateSubscription: async () => {},
      deleteSubscription: async () => {},
      updatePreferences: async () => {},
      refreshData: async () => {},
      calculateStats: () => ({
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        pausedSubscriptions: 0,
        cancelledSubscriptions: 0,
        totalMonthlyKrw: 0,
        avgSubscriptionCost: 0,
        upcomingPayments: 0,
        todayCount: 0,
        weekCount: 0,
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
        }
      })
    };
  }
  return context;
};

function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({
    exchangeRate: 1300,
    defaultCurrency: 'KRW',
    notifications: {
      paymentReminders: true,
      priceChanges: false,
      subscriptionExpiry: true,
      email: true,
      push: true,
      sms: false,
    },
    theme: 'auto',
    language: 'ko',
    timezone: 'Asia/Seoul',
    dateFormat: 'YYYY-MM-DD',
    currencyFormat: 'KRW',
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<SubscriptionStats>({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    pausedSubscriptions: 0,
    cancelledSubscriptions: 0,
    totalMonthlyKrw: 0,
    avgSubscriptionCost: 0,
    upcomingPayments: 0,
    todayCount: 0,
    weekCount: 0,
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
    }
  });

  // Initialize authentication state
  useEffect(() => {
    console.log('🔄 App: initializeAuth useEffect 시작');
    const initializeAuth = async () => {
      try {
        console.log('🔍 App: getSession 호출 중...');
        
        // URL에 OAuth 콜백 파라미터가 있는지 확인
        const urlParams = new URLSearchParams(window.location.search);
        const urlHash = window.location.hash;
        const hasOAuthParams = urlParams.has('code') || urlParams.has('access_token') || urlHash.includes('access_token');
        
        console.log('🔍 App: OAuth 파라미터 확인:', {
          hasCode: urlParams.has('code'),
          hasAccessToken: urlParams.has('access_token') || urlHash.includes('access_token'),
          currentPath: window.location.pathname,
          hasOAuthParams
        });

        // OAuth 콜백 처리 중이면 세션 처리를 지연
        if (hasOAuthParams && window.location.pathname !== '/auth/callback') {
          console.log('🔄 App: OAuth 콜백 파라미터 감지, /auth/callback으로 리다이렉트');
          window.location.href = '/auth/callback' + window.location.search + window.location.hash;
          return;
        }

        // Firebase auth status check
        const { isAuthenticated, user: firebaseUser, error } = await checkAuthStatus();
        console.log('📋 App: Firebase 인증 상태:', { isAuthenticated, hasUser: !!firebaseUser });
        
        if (isAuthenticated && firebaseUser) {
          console.log('✅ App: Firebase 인증된 사용자 발견, 사용자 설정 중...');
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            joinDate: firebaseUser.metadata.creationTime ? new Date(firebaseUser.metadata.creationTime).toISOString().split('T')[0]! : new Date().toISOString().split('T')[0]!,
            name: firebaseUser.displayName || undefined
          });
          
          // Firebase access token will be handled by Firebase context
          console.log('🔑 Initial auth - Firebase user authenticated');
          
          console.log('🚀 Initial auth - Calling loadUserData...');
          try {
            await loadUserData();
          } catch (loadError) {
            console.error('⚠️ loadUserData 실패, 기본 상태로 계속 진행:', loadError);
          }
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
        // Firebase signOut will be handled by AuthContext
        
        // 로컬 상태 초기화
        setUser(null);
        setSubscriptions([]);
        setPreferences({
          exchangeRate: 1300,
          defaultCurrency: 'KRW',
          notifications: {
            paymentReminders: true,
            priceChanges: true,
            subscriptionExpiry: true,
            email: true,
            push: true,
            sms: false,
          },
          theme: 'auto',
          language: 'ko',
          timezone: 'Asia/Seoul',
          dateFormat: 'YYYY-MM-DD',
          currencyFormat: 'KRW',
        });
        setNotifications([]);
        setCategories([]);
        setStats({
          totalSubscriptions: 0,
          activeSubscriptions: 0,
          pausedSubscriptions: 0,
          cancelledSubscriptions: 0,
          totalMonthlyKrw: 0,
          avgSubscriptionCost: 0,
          upcomingPayments: 0,
          todayCount: 0,
          weekCount: 0,
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
        });
        
        console.log('세션 만료로 인해 로그아웃되었습니다.');
      } catch (error) {
        console.error('Session expired handling error:', error);
      }
    };

    initializeAuth();

    // Firebase auth state listener will be handled by AuthContext
    // No need for manual subscription cleanup as it's handled by the context
  }, []);

  // 구독 데이터나 설정이 변경될 때마다 통계 업데이트
  useEffect(() => {
    if ((subscriptions && subscriptions.length > 0) || preferences.exchangeRate) {
      const newStats = calculateStats();
      setStats(newStats);
    }
  }, [subscriptions, preferences.exchangeRate]);

  const loadUserData = async () => {
    try {
      console.log('🔄 loadUserData 시작');
      console.log('🔍 현재 isLoading 상태:', isLoading);
      
      // Firebase auth check
      const { isAuthenticated } = await checkAuthStatus();
      if (!isAuthenticated) {
        console.error('❌ Firebase 인증이 필요합니다.');
        throw new Error('사용자 인증이 필요합니다.');
      }
      
      console.log('✅ Firebase 인증 확인됨');
      
      // 데이터 로딩 중 상태 표시
      const loadingSteps = {
        subscriptions: false,
        preferences: false,
        notifications: false,
        categories: false,
        stats: false
      };

      // Helper function with timeout
      const withTimeout = (promise: Promise<any>, timeoutMs: number = 10000) => {
        return Promise.race([
          promise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('API 호출 타임아웃')), timeoutMs)
          )
        ]);
      };

      // Load subscriptions with timeout
      console.log('📊 구독 데이터 로딩 중...');
      try {
        const subscriptionsData = await withTimeout(apiService.getSubscriptions(), 10000);
        console.log('📊 구독 데이터 로딩 성공:', {
          count: subscriptionsData.subscriptions?.length || 0,
          data: subscriptionsData.subscriptions?.slice(0, 2) // Log first 2 items for debugging
        });
        setSubscriptions(subscriptionsData.subscriptions || []);
        loadingSteps.subscriptions = true;
      } catch (subscriptionError) {
        console.error('❌ 구독 데이터 로딩 실패:', subscriptionError);
        // 구독 데이터 로딩 실패해도 계속 진행
        setSubscriptions([]);
      }

      // Load preferences with timeout
      console.log('⚙️ Loading preferences...');
      try {
        const preferencesData = await withTimeout(apiService.getPreferences(), 3000);
        console.log('⚙️ Preferences loaded:', preferencesData);
        if (preferencesData.preferences) {
          setPreferences(prev => ({ ...prev, ...preferencesData.preferences }));
        }
        loadingSteps.preferences = true;
      } catch (preferencesError) {
        console.error('❌ Error loading preferences:', preferencesError);
        // 설정 로딩 실패해도 기본값 사용
      }

      // Load notifications with timeout
      console.log('🔔 Loading notifications...');
      try {
        const notificationsData = await withTimeout(apiService.getNotifications(), 3000);
        console.log('🔔 Notifications loaded:', {
          count: notificationsData.notifications?.length || 0,
          data: notificationsData.notifications?.slice(0, 2)
        });
        setNotifications(notificationsData.notifications || []);
        loadingSteps.notifications = true;
      } catch (notificationsError) {
        console.error('❌ Error loading notifications:', notificationsError);
        // 알림 로딩 실패해도 계속 진행
      }

      // Load categories with timeout
      console.log('🗂️ Loading categories...');
      try {
        const categoriesData = await withTimeout(apiService.getCategories(), 3000);
        console.log('🗂️ Categories loaded:', {
          count: categoriesData.categories?.length || 0,
          data: categoriesData.categories?.slice(0, 2)
        });
        setCategories(categoriesData.categories || []);
        loadingSteps.categories = true;
      } catch (categoriesError) {
        console.error('❌ Error loading categories:', categoriesError);
        // 카테고리 로딩 실패해도 계속 진행
      }

      // 통계 데이터 업데이트
      console.log('📈 Calculating stats...');
      try {
        const newStats = calculateStats();
        console.log('📈 Stats calculated:', {
          totalSubscriptions: newStats.totalSubscriptions,
          activeSubscriptions: newStats.activeSubscriptions,
          totalMonthlyKrw: newStats.totalMonthlyKrw
        });
        setStats(newStats);
        loadingSteps.stats = true;
      } catch (statsError) {
        console.error('❌ Error calculating stats:', statsError);
      }
      
      console.log('✅ loadUserData completed successfully', loadingSteps);
    } catch (error) {
      console.error('❌ Error loading user data:', error);
      
      // More detailed error logging
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      // Try to identify the specific issue
      try {
        // Firebase auth check
        const { isAuthenticated } = await checkAuthStatus();
        console.log('🔍 Firebase auth check:', {
          isAuthenticated
        });
      } catch (authError) {
        console.error('🔍 Auth session check failed:', authError);
      }
      
      // 에러가 발생해도 기본 상태로 설정
      setSubscriptions([]);
      setPreferences({
        exchangeRate: 1300,
        defaultCurrency: 'KRW',
        notifications: {
          paymentReminders: true,
          priceChanges: true,
          subscriptionExpiry: true,
          email: true,
          push: true,
          sms: false,
        },
        theme: 'auto',
        language: 'ko',
        timezone: 'Asia/Seoul',
        dateFormat: 'YYYY-MM-DD',
        currencyFormat: 'KRW',
      });
      setNotifications([]);
      setCategories([]);
      setStats({
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        pausedSubscriptions: 0,
        cancelledSubscriptions: 0,
        totalMonthlyKrw: 0,
        avgSubscriptionCost: 0,
        upcomingPayments: 0,
        todayCount: 0,
        weekCount: 0,
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
        }
      });
    } finally {
      console.log('🏁 loadUserData 완료, setIsLoading(false) 호출');
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Firebase auth
      const { user, error } = await signInWithEmail(email, password);

      if (error) {
        // 더 구체적인 에러 메시지 제공
        let errorMessage = '로그인에 실패했습니다.';
        
        if (error?.code === 'auth/invalid-credential') {
          errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
        } else if (error?.code === 'auth/too-many-requests') {
          errorMessage = '너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.';
        }
        
        throw new Error(errorMessage);
      }

      if (user) {
        // 사용자 행동 추적
        await trackUserBehavior(user.uid, { action: 'login' });
        
        // 통계 데이터 초기화 (필요한 경우)
        try {
          await collectAndSaveAllStatistics(user.uid);
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
      
      // 현재 도메인 감지 - 일관된 리다이렉트 URL 사용
      const currentOrigin = window.location.origin;
      // OAuth 콜백을 위한 특별한 페이지 사용
      const redirectUrl = `${currentOrigin}/auth/callback`;
      
      console.log('Google OAuth 시작:', {
        origin: currentOrigin,
        redirectUrl: redirectUrl,
        timestamp: new Date().toISOString()
      });
      
      // Firebase Google OAuth
      const { user, error } = await signInWithGoogle();

      if (error) {
        console.error('Google OAuth 오류:', error);
        
        // 구체적인 오류 메시지 제공
        const errorMessage = getOAuthErrorMessage(error?.message || 'Google 로그인에 실패했습니다.');
        throw new Error(errorMessage);
      }
      
      console.log('Google OAuth 성공:', user);
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
      
      // Then sign them in with Firebase
      const { user, error } = await signInWithEmail(email, password);

      if (error) {
        // 더 구체적인 에러 메시지 제공
        let errorMessage = '로그인에 실패했습니다.';
        
        if (error?.code === 'auth/invalid-credential') {
          errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
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
      
      // Firebase sign out
      const { success, error } = await signOutUser();
      if (!success || error) {
        throw new Error('로그아웃에 실패했습니다. 다시 시도해주세요.');
      }
      
      // 로컬 상태 초기화
      setUser(null);
      setSubscriptions([]);
      setPreferences({
        exchangeRate: 1300,
        defaultCurrency: 'KRW',
        notifications: {
          paymentReminders: true,
          priceChanges: true,
          subscriptionExpiry: true,
          email: true,
          push: true,
          sms: false,
        },
        theme: 'auto',
        language: 'ko',
        timezone: 'Asia/Seoul',
        dateFormat: 'YYYY-MM-DD',
        currencyFormat: 'KRW',
      });
      setNotifications([]);
      setCategories([]);
      setStats({
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        pausedSubscriptions: 0,
        cancelledSubscriptions: 0,
        totalMonthlyKrw: 0,
        avgSubscriptionCost: 0,
        upcomingPayments: 0,
        todayCount: 0,
        weekCount: 0,
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
        }
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

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    try {
      const response = await apiService.updatePreferences(newPreferences);
      setPreferences(prev => ({ ...prev, ...response.preferences }));
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  };

  const calculateStats = (): SubscriptionStats => {
    // Safety check to ensure subscriptions is always an array
    if (!subscriptions || !Array.isArray(subscriptions)) {
      return {
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        pausedSubscriptions: 0,
        cancelledSubscriptions: 0,
        totalMonthlyKrw: 0,
        avgSubscriptionCost: 0,
        upcomingPayments: 0,
        todayCount: 0,
        weekCount: 0,
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
        }
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentDay = now.getDate();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    let totalMonthlyKrw = 0; // 1일부터 오늘까지 실제 지출한 금액
    let activeSubscriptions = 0;
    let pausedSubscriptions = 0;
    let cancelledSubscriptions = 0;
    let upcomingPayments = 0;
    let todayCount = 0;
    let weekCount = 0;
    
    // Previous month calculations for trends
    let prevMonthTotal = 0;

    subscriptions.forEach(sub => {
      const amount = sub.currency === 'USD' ? sub.amount * preferences.exchangeRate : sub.amount;
      
      if (sub.status === 'active') {
        activeSubscriptions++;
        
        // 1일부터 오늘까지 실제 지출한 금액 계산
        if (sub.paymentDay <= currentDay) {
          totalMonthlyKrw += amount;
        }

        // 해당년도 1월 1일부터 오늘까지 지출한 합계 계산

        const today = new Date(currentYear, currentMonth, currentDay);
        
        // 월간 구독의 경우: 1월부터 현재 월까지의 결제일 확인
        if (sub.paymentCycle === 'monthly') {
          for (let month = 0; month <= currentMonth; month++) {
            const paymentDate = new Date(currentYear, month, sub.paymentDay);
            if (paymentDate <= today) {
              // This calculation is now handled by the API, so we just sum up the amounts
              // If we need to calculate yearly spending for trends, we'd need to store it or re-calculate
            }
          }
        }
        // 연간 구독의 경우: 1월 1일 이후에 결제일이 있으면 포함
        else if (sub.paymentCycle === 'yearly') {
          const paymentDate = new Date(currentYear, 0, sub.paymentDay);
          if (paymentDate <= today) {
            // This calculation is now handled by the API, so we just sum up the amounts
            // If we need to calculate yearly spending for trends, we'd need to store it or re-calculate
          }
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
          // This calculation is now handled by the API, so we just sum up the amounts
        }

        // 이번 주 결제 예정 확인
        const startOfWeek = new Date(now);
        const endOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        endOfWeek.setDate(now.getDate() + (6 - now.getDay()));
        
        const weekPaymentDate = new Date(currentYear, currentMonth, sub.paymentDay);
        if (weekPaymentDate >= startOfWeek && weekPaymentDate <= endOfWeek) {
          weekCount++;
          // This calculation is now handled by the API, so we just sum up the amounts
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
        pausedSubscriptions++;
      } else if (sub.status === 'cancelled') {
        cancelledSubscriptions++;
      }
    });

    const avgSubscriptionCost = activeSubscriptions > 0 ? totalMonthlyKrw / activeSubscriptions : 0;

    // 카테고리별 통계 계산
    const categoryBreakdown: { [category: string]: { count: number; totalAmount: number; } } = {};
    const categoryStats: { [category: string]: { count: number; totalAmount: number; } } = {};

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

    // 모든 구독을 다시 순회하여 상세 통계 계산
    subscriptions.forEach(sub => {
      const amount = sub.currency === 'USD' ? sub.amount * preferences.exchangeRate : sub.amount;
      const monthlyAmount = sub.paymentCycle === 'yearly' ? amount / 12 : amount;

      // 카테고리별 통계
      if (!categoryStats[sub.category]) {
        categoryStats[sub.category] = { count: 0, totalAmount: 0 };
      }
      const catStats = categoryStats[sub.category];
      if (catStats) {
        catStats.count++;
        catStats.totalAmount += amount;
      }

      // 결제 주기별 통계
      paymentCycleBreakdown[sub.paymentCycle].count++;
      paymentCycleBreakdown[sub.paymentCycle].totalAmount += amount;

      // 통화별 통계
      currencyBreakdown[sub.currency].count++;
      currencyBreakdown[sub.currency].totalAmount += amount;

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
    });

    // 자동 갱신 비율 계산
    const totalAutoRenewal = autoRenewalStats.enabled + autoRenewalStats.disabled;
    autoRenewalStats.percentage = totalAutoRenewal > 0 ? (autoRenewalStats.enabled / totalAutoRenewal) * 100 : 0;

    // 구독 등급별 평균 금액 계산
    // This part of the logic needs to be re-evaluated based on the new database schema
    // For now, we'll keep it simple, assuming 'tier' is removed or handled differently
    // If 'tier' is still relevant, this section would need to be re-implemented

    // 카테고리별 연간 금액 계산
    // This part of the logic needs to be re-evaluated based on the new database schema
    // For now, we'll keep it simple, assuming 'tier' is removed or handled differently

    // 카테고리별 통계를 categoryBreakdown에 복사
    Object.keys(categoryStats).forEach(category => {
      const catStats = categoryStats[category];
      if (catStats) {
        categoryBreakdown[category] = {
          count: catStats.count,
          totalAmount: catStats.totalAmount
        };
      }
    });

          return {
        totalSubscriptions: subscriptions.length,
        activeSubscriptions,
        pausedSubscriptions,
        cancelledSubscriptions,
        totalMonthlyKrw,
        avgSubscriptionCost,
        upcomingPayments,
        todayCount,
        weekCount,
        categoryBreakdown,
        paymentCycleBreakdown,
        currencyBreakdown,
        notificationStats,
        autoRenewalStats
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
      preferences,
      notifications,
      categories,
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
      updatePreferences,
      refreshData,
      calculateStats
    }}>
      {children}
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
    <AuthProvider>
      <DataProvider>
        <AppProvider>
          <Suspense fallback={<LoadingSpinner />}>
            <Router 
              basename="/"
              future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
            >
          <div className="min-h-screen bg-background text-foreground dark">
            {/* Moonwave Background */}
            <WaveBackground />
            
            {/* Main content */}
            <div className="relative z-10">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/magic-login" element={<MagicLinkLogin />} />
                <Route path="/magic-signup" element={<MagicLinkSignup />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
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
                <Route path="/firebase-debug" element={<FirebaseDebugger />} />
                <Route path="/music" element={<ProtectedRoute><MusicPlayer /></ProtectedRoute>} />
                
                {/* Handle preview_page.html and other unmatched routes */}
                <Route path="/preview_page.html" element={<RedirectRoute />} />
                <Route path="*" element={<RedirectRoute />} />
              </Routes>
            </div>
            
            {/* Music Player - Only show when authenticated */}
            <AuthenticatedMusicPlayer />
            
            {/* PWA Install Prompt */}
            <PWAInstallPrompt />
            
            {import.meta.env.VITE_DEV_MODE === 'true' && <OAuthDebugger />}
            
            {/* Firebase Debugger - 개발 모드에서만 표시 */}
            {import.meta.env.VITE_DEV_MODE === 'true' && <FirebaseDebugger />}
            
            <Toaster />
          </div>
            </Router>
          </Suspense>
        </AppProvider>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;