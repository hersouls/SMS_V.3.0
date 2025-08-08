import React, { createContext, useContext, useState, useEffect, ReactNode, Suspense } from 'react';

import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
const MusicPlayer = React.lazy(() => import('./components/MusicPlayer').then(module => ({ default: module.MusicPlayer })));
const AuthDebugger = React.lazy(() => import('./components/AuthDebugger').then(module => ({ default: module.AuthDebugger })));


// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
  </div>
);

import { WaveBackground } from './components/WaveBackground';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NetworkErrorFallback } from './components/NetworkErrorFallback';

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
import { checkAuthStatus, auth } from './utils/firebase/config';
import { signInWithEmail, signInWithGoogle, signOutUser } from './utils/firebase/client';
import { onAuthStateChanged } from 'firebase/auth';
import { apiService } from './utils/api';
import { getOAuthErrorMessage, checkOAuthStatus } from './utils/oauth';
import { 
  updateStatisticsOnSubscriptionChange, 
  trackUserBehavior,
  collectAndSaveAllStatistics,
} from './utils/statistics';

// 알림 서비스 초기화
import { notificationService } from './utils/notificationService';
import { notificationMonitor } from './utils/notificationMonitor';
import { useNotifications } from './hooks/useNotifications';

// Firebase auth and data hooks
import { useFirebaseAuth } from './hooks/useFirebaseAuth';
import { useAuth } from './contexts/AuthContext';

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

function AppProviderContent({ children }: { children: ReactNode }) {
  // AuthContext에서 인증 상태 가져오기
  const { user: authUser, loading: authLoading, isAuthenticated, signIn, signInWithGoogle, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
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

  // AuthContext의 사용자 상태와 동기화
  useEffect(() => {
    console.log('🔄 App: AuthContext 상태 동기화:', {
      hasAuthUser: !!authUser,
      email: authUser?.email,
      authLoading,
      isAuthenticated
    });
    
    if (authLoading) {
      console.log('⏳ App: AuthContext 로딩 중');
      setIsLoading(true);
      return;
    }
    
    if (authUser && isAuthenticated) {
      console.log('✅ App: AuthContext에서 인증된 사용자 감지, App Context 업데이트');
      const appUser: User = {
        id: authUser.uid,
        email: authUser.email || '',
        joinDate: authUser.metadata.creationTime ? new Date(authUser.metadata.creationTime).toISOString().split('T')[0]! : new Date().toISOString().split('T')[0]!,
        name: authUser.displayName || undefined
      };
      
      setUser(appUser);
      
      // 사용자 데이터 로드
      loadUserData().catch(error => {
        console.error('⚠️ loadUserData 실패:', error);
      }).finally(() => {
        setIsLoading(false);
      });
    } else {
      console.log('❌ App: AuthContext에서 로그아웃 상태 감지, App Context 초기화');
      
      // 즉시 로그인 페이지로 리다이렉트 (보호된 경로에 있는 경우)
      const currentPath = location.pathname;
      const protectedPaths = ['/dashboard', '/subscriptions', '/calendar', '/notifications', '/statistics', '/settings', '/music'];
      const isOnProtectedPath = protectedPaths.some(path => currentPath.startsWith(path)) || currentPath === '/';
      
      if (isOnProtectedPath && currentPath !== '/login') {
        console.log('🔄 App: 보호된 경로에서 로그아웃 감지, 강제 리다이렉트', {
          from: currentPath,
          to: '/login'
        });
        navigate('/login', { replace: true });
        return;
      }
      
      setUser(null);
      setSubscriptions([]);
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
      setIsLoading(false);
    }
  }, [authUser, authLoading, isAuthenticated]);

  // 구독 데이터나 설정이 변경될 때마다 통계 업데이트
  useEffect(() => {
    if ((subscriptions && subscriptions.length > 0) || preferences?.exchangeRate) {
      const newStats = calculateStats();
      setStats(newStats);
    }
      }, [subscriptions, preferences?.exchangeRate]);

  const loadUserData = async () => {
    try {
      console.log('🔄 loadUserData 시작');
      
      if (!authUser) {
        console.error('❌ 인증된 사용자가 없습니다.');
        throw new Error('사용자 인증이 필요합니다.');
      }
      
      console.log('✅ 인증된 사용자 확인됨:', authUser.email);
      
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
    const result = await signIn(email, password);
    if (result.error) {
      throw new Error(result.error.message || '로그인에 실패했습니다.');
    }
    // 사용자 상태는 AuthContext의 onAuthStateChanged에서 자동으로 업데이트됨
  };

  const loginWithGoogle = async () => {
    const result = await signInWithGoogle();
    if (result.error) {
      throw new Error(result.error.message || 'Google 로그인에 실패했습니다.');
    }
    // 사용자 상태는 AuthContext의 onAuthStateChanged에서 자동으로 업데이트됨
  };

  const signup = async (email: string, password: string, name?: string) => {
    try {
      // First create user via our API
      await apiService.signup(email, password, name);
      
      // Then sign them in with AuthContext
      const result = await signIn(email, password);
      if (result.error) {
        throw new Error(result.error.message || '회원가입 후 로그인에 실패했습니다.');
      }
      // 사용자 상태는 AuthContext의 onAuthStateChanged에서 자동으로 업데이트됨
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // 사용자 행동 추적
      if (user) {
        await trackUserBehavior(user.id, { action: 'logout' });
      }
      
      // AuthContext의 signOut 사용
      const result = await signOut();
      if (!result.success || result.error) {
        throw new Error('로그아웃에 실패했습니다. 다시 시도해주세요.');
      }
      
      // 상태 초기화는 AuthContext의 onAuthStateChanged에서 자동으로 처리됨
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
      const amount = sub.currency === 'USD' ? sub.amount * (preferences?.exchangeRate || 1) : sub.amount;
      
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
      const amount = sub.currency === 'USD' ? sub.amount * (preferences?.exchangeRate || 1) : sub.amount;
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
      isAuthenticated: isAuthenticated && !!user,
      isLoading: isLoading || authLoading,
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

function AppProvider({ children }: { children: ReactNode }) {
  return (
    <AppProviderContent>
      {children}
    </AppProviderContent>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const context = useContext(AppContext);
  
  console.log('🛡️ ProtectedRoute: 렌더링 시작', { 
    hasContext: !!context,
    currentPath: window.location.pathname
  });
  
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
  
  console.log('🛡️ ProtectedRoute: 상태 확인', { 
    isAuthenticated, 
    isLoading,
    currentPath: window.location.pathname
  });
  
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
    willRedirectToLogin: !isAuthenticated,
    currentPath: window.location.pathname
  });
  
  if (!isAuthenticated) {
    console.log('🔄 ProtectedRoute: 로그인 페이지로 리다이렉트 실행', {
      from: window.location.pathname,
      to: '/login'
    });
    return <Navigate to="/login" replace />;
  }
  
  console.log('✅ ProtectedRoute: 인증됨, 자식 컴포넌트 렌더링');
  return <>{children}</>;
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
  // 알림 서비스를 전역 객체에 노출 (개발 및 테스트용)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.notificationService = notificationService;
      // @ts-ignore  
      window.notificationMonitor = notificationMonitor;
      // @ts-ignore
      window.useNotifications = useNotifications;
      console.log('🔧 알림 서비스를 window 객체에 노출 완료');
    }
  }, []);

  // Normalize runtime basename for React Router (leading slash, no trailing slash except root)
  const normalizeRouterBasename = (input?: string): string => {
    const fallback = import.meta.env.BASE_URL || '/';
    let base = (input && input.trim() !== '' ? input : fallback).trim();
    if (!base.startsWith('/')) base = `/${base}`;
    // Remove trailing slash unless the path is just '/'
    if (base.length > 1 && base.endsWith('/')) base = base.slice(0, -1);
    // collapse duplicate slashes
    base = base.replace(/\/+\/+/g, '/');
    return base === '//' ? '/' : base;
  };

  const basename = normalizeRouterBasename(import.meta.env.VITE_BASE_PATH);

  return (
    <ErrorBoundary>
      <Router
        basename={basename}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <AuthProvider>
          <DataProvider>
            <AppProvider>
              <Suspense fallback={<LoadingSpinner />}>
                <div className="min-h-screen bg-background text-foreground dark">
                  {/* Moonwave Background */}
                  <WaveBackground />
                  
                  {/* Main content */}
                  <div className="relative z-10">
                    <Routes>
                      <Route path="/login" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <Login />
                        </Suspense>
                      } />
                      <Route path="/signup" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <Signup />
                        </Suspense>
                      } />
                      <Route path="/magic-login" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <MagicLinkLogin />
                        </Suspense>
                      } />
                      <Route path="/magic-signup" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <MagicLinkSignup />
                        </Suspense>
                      } />
                      <Route path="/auth/callback" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <AuthCallback />
                        </Suspense>
                      } />
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
                  
                  {/* Auth Debugger - 개발 모드에서만 표시 */}
                  {import.meta.env.VITE_DEV_MODE === 'true' && <AuthDebugger />}
                  
                  <Toaster />
                </div>
              </Suspense>
            </AppProvider>
          </DataProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;