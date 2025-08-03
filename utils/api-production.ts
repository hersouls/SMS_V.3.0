// 새로운 프로덕션 데이터베이스 구조에 맞춘 API 서비스
import { supabase, checkSupabaseConnection, checkAuthStatus } from './supabase/client';
import { secureApiClient } from './api-security';

// 환경 변수에서 Supabase URL 가져오기
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL 환경 변수가 설정되지 않았습니다.');
}

class ProductionApiService {
  private accessToken: string | null = null;

  constructor() {
    console.log('🚀 ProductionApiService 초기화됨');
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
    console.log('🔑 Access token 설정됨:', token ? 'present' : 'null');
  }

  // =====================================================
  // 헬퍼 함수들
  // =====================================================

  private async makeRequest(url: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // 인증 상태 확인 헬퍼 함수
  private async ensureAuthenticated() {
    const authStatus = await checkAuthStatus();
    if (!authStatus.isAuthenticated) {
      throw new Error('사용자 인증이 필요합니다. 다시 로그인해주세요.');
    }
    return authStatus.user;
  }

  // =====================================================
  // 인증 API (Magic Link 지원)
  // =====================================================

  async sendMagicLink(email: string, isSignup: boolean = false) {
    try {
      console.log('📧 Magic link 전송 중:', { email, isSignup });
      
      // 데이터베이스 연결 상태 확인
      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        throw new Error('데이터베이스 연결에 실패했습니다. 네트워크 연결을 확인해주세요.');
      }
      
      // 개발 환경에서는 localhost 사용
      let redirectUrl;
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        redirectUrl = `http://localhost:3003/auth/callback`;
      } else {
        redirectUrl = `${window.location.origin}/auth/callback`;
      }
      
      console.log('🔗 Magic link redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
          data: isSignup ? { is_signup: true } : undefined
        }
      });

      if (error) {
        console.error('❌ Magic link 오류:', error);
        throw error;
      }

      console.log('✅ Magic link 전송 성공:', data);
      return { 
        success: true, 
        message: '이메일로 로그인 링크를 전송했습니다. 이메일을 확인해주세요.',
        email 
      };
    } catch (error: any) {
      console.error('❌ Magic link 오류 상세:', error);
      
      // 구체적인 에러 메시지 제공
      if (error.message?.includes('invalid email') || error.message?.includes('Invalid email')) {
        throw new Error('올바른 이메일 형식을 입력해주세요.');
      }
      
      if (error.message?.includes('rate limit')) {
        throw new Error('너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
      
      throw new Error(error.message || 'Magic link 전송에 실패했습니다.');
    }
  }

  // Magic Link 기반 회원가입 (레거시 호환성)
  async signup(email: string, password?: string, name?: string) {
    // Magic Link 방식으로 리다이렉트
    return await this.sendMagicLink(email, true);
  }

  // Magic Link 기반 로그인 (레거시 호환성)
  async login(email: string, password?: string) {
    // Magic Link 방식으로 리다이렉트
    return await this.sendMagicLink(email, false);
  }

  // =====================================================
  // 구독 관리 API
  // =====================================================

  async getSubscriptions() {
    try {
      console.log('📊 구독 데이터 로딩 시작...');
      
      // 인증 상태 확인
      const user = await this.ensureAuthenticated();
      if (!user) {
        throw new Error('사용자 인증이 필요합니다.');
      }
      console.log('✅ 인증 확인됨:', { userId: user.id });
      
      // 데이터베이스 연결 확인
      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        throw new Error('데이터베이스 연결에 실패했습니다.');
      }
      
      console.log('🔍 구독 데이터 쿼리 중...');
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ 구독 데이터 로딩 오류:', error);
        throw error;
      }

      console.log('📊 구독 데이터 로딩 성공:', {
        count: data?.length || 0,
        userId: user.id
      });

      // 컬럼명을 프론트엔드 형식으로 변환
      const subscriptions = data?.map(sub => ({
        id: sub.id,
        serviceName: sub.service_name,
        serviceUrl: sub.service_url,
        logo: sub.logo,
        logoImage: sub.logo_image,
        amount: sub.amount,
        currency: sub.currency,
        paymentCycle: sub.payment_cycle,
        paymentDay: sub.payment_day,
        paymentMethod: sub.payment_method,
        startDate: sub.start_date,
        endDate: sub.end_date,
        autoRenewal: sub.auto_renewal,
        status: sub.status,
        category: sub.category,
        tier: sub.tier,
        tags: sub.tags || [],
        memo: sub.memo,
        notifications: sub.notifications || {
          sevenDays: true,
          threeDays: true,
          sameDay: true
        },
        createdAt: sub.created_at,
        updatedAt: sub.updated_at
      })) || [];

      return { subscriptions };
    } catch (error) {
      console.error('❌ getSubscriptions 오류:', error);
      throw error;
    }
  }

  async createSubscription(subscription: any) {
    try {
      // 현재 사용자 ID 가져오기
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('사용자 인증이 필요합니다.');
      }

      // 프론트엔드 형식을 데이터베이스 형식으로 변환
      const dbSubscription = {
        user_id: user.id,
        service_name: subscription.serviceName,
        service_url: subscription.serviceUrl,
        logo: subscription.logo,
        logo_image: subscription.logoImage,
        amount: subscription.amount,
        currency: subscription.currency,
        payment_cycle: subscription.paymentCycle,
        payment_day: subscription.paymentDay,
        payment_method: subscription.paymentMethod,
        start_date: subscription.startDate,
        end_date: subscription.endDate,
        auto_renewal: subscription.autoRenewal,
        status: subscription.status || 'active',
        category: subscription.category,
        tier: subscription.tier,
        tags: subscription.tags || [],
        memo: subscription.memo,
        notifications: subscription.notifications || {
          sevenDays: true,
          threeDays: true,
          sameDay: true
        }
      };

      const { data, error } = await supabase
        .from('subscriptions')
        .insert(dbSubscription)
        .select()
        .single();

      if (error) {
        console.error('Error creating subscription:', error);
        throw error;
      }

      // 응답을 프론트엔드 형식으로 변환
      const createdSubscription = {
        id: data.id,
        serviceName: data.service_name,
        serviceUrl: data.service_url,
        logo: data.logo,
        logoImage: data.logo_image,
        amount: data.amount,
        currency: data.currency,
        paymentCycle: data.payment_cycle,
        paymentDay: data.payment_day,
        paymentMethod: data.payment_method,
        startDate: data.start_date,
        endDate: data.end_date,
        autoRenewal: data.auto_renewal,
        status: data.status,
        category: data.category,
        tier: data.tier,
        tags: data.tags || [],
        memo: data.memo,
        notifications: data.notifications,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return { subscription: createdSubscription };
    } catch (error) {
      console.error('Error in createSubscription:', error);
      throw error;
    }
  }

  async updateSubscription(id: string, updates: any) {
    try {
      // 프론트엔드 형식을 데이터베이스 형식으로 변환
      const dbUpdates: any = {};
      if (updates.serviceName !== undefined) dbUpdates.service_name = updates.serviceName;
      if (updates.serviceUrl !== undefined) dbUpdates.service_url = updates.serviceUrl;
      if (updates.logo !== undefined) dbUpdates.logo = updates.logo;
      if (updates.logoImage !== undefined) dbUpdates.logo_image = updates.logoImage;
      if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
      if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
      if (updates.paymentCycle !== undefined) dbUpdates.payment_cycle = updates.paymentCycle;
      if (updates.paymentDay !== undefined) dbUpdates.payment_day = updates.paymentDay;
      if (updates.paymentMethod !== undefined) dbUpdates.payment_method = updates.paymentMethod;
      if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
      if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;
      if (updates.autoRenewal !== undefined) dbUpdates.auto_renewal = updates.autoRenewal;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.tier !== undefined) dbUpdates.tier = updates.tier;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
      if (updates.memo !== undefined) dbUpdates.memo = updates.memo;
      if (updates.notifications !== undefined) dbUpdates.notifications = updates.notifications;

      const { data, error } = await supabase
        .from('subscriptions')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating subscription:', error);
        throw error;
      }

      // 응답을 프론트엔드 형식으로 변환
      const updatedSubscription = {
        id: data.id,
        serviceName: data.service_name,
        serviceUrl: data.service_url,
        logo: data.logo,
        logoImage: data.logo_image,
        amount: data.amount,
        currency: data.currency,
        paymentCycle: data.payment_cycle,
        paymentDay: data.payment_day,
        paymentMethod: data.payment_method,
        startDate: data.start_date,
        endDate: data.end_date,
        autoRenewal: data.auto_renewal,
        status: data.status,
        category: data.category,
        tier: data.tier,
        tags: data.tags || [],
        memo: data.memo,
        notifications: data.notifications,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return { subscription: updatedSubscription };
    } catch (error) {
      console.error('Error in updateSubscription:', error);
      throw error;
    }
  }

  async deleteSubscription(id: string) {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting subscription:', error);
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Error in deleteSubscription:', error);
      throw error;
    }
  }

  // =====================================================
  // 사용자 설정 API
  // =====================================================

  async getPreferences() {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116는 "no rows returned" 에러
        console.error('Error fetching preferences:', error);
        throw error;
      }

      // 데이터베이스 형식을 프론트엔드 형식으로 변환
      const preferences = data ? {
        id: data.id,
        userId: data.user_id,
        exchangeRate: data.exchange_rate,
        defaultCurrency: data.default_currency,
        notifications: data.notifications,
        theme: data.theme,
        language: data.language,
        timezone: data.timezone,
        dateFormat: data.date_format,
        currencyFormat: data.currency_format,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      } : null;

      return { preferences };
    } catch (error) {
      console.error('Error in getPreferences:', error);
      throw error;
    }
  }

  async updatePreferences(updates: any) {
    try {
      // 프론트엔드 형식을 데이터베이스 형식으로 변환
      const dbUpdates: any = {};
      if (updates.exchangeRate !== undefined) dbUpdates.exchange_rate = updates.exchangeRate;
      if (updates.defaultCurrency !== undefined) dbUpdates.default_currency = updates.defaultCurrency;
      if (updates.notifications !== undefined) dbUpdates.notifications = updates.notifications;
      if (updates.theme !== undefined) dbUpdates.theme = updates.theme;
      if (updates.language !== undefined) dbUpdates.language = updates.language;
      if (updates.timezone !== undefined) dbUpdates.timezone = updates.timezone;
      if (updates.dateFormat !== undefined) dbUpdates.date_format = updates.dateFormat;
      if (updates.currencyFormat !== undefined) dbUpdates.currency_format = updates.currencyFormat;

      const { data, error } = await supabase
        .from('user_preferences')
        .upsert(dbUpdates)
        .select()
        .single();

      if (error) {
        console.error('Error updating preferences:', error);
        throw error;
      }

      // 응답을 프론트엔드 형식으로 변환
      const preferences = {
        id: data.id,
        userId: data.user_id,
        exchangeRate: data.exchange_rate,
        defaultCurrency: data.default_currency,
        notifications: data.notifications,
        theme: data.theme,
        language: data.language,
        timezone: data.timezone,
        dateFormat: data.date_format,
        currencyFormat: data.currency_format,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return { preferences };
    } catch (error) {
      console.error('Error in updatePreferences:', error);
      throw error;
    }
  }

  // =====================================================
  // 알림 API
  // =====================================================

  async getNotifications() {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }

      // 컬럼명을 프론트엔드 형식으로 변환
      const notifications = data?.map(notif => ({
        id: notif.id,
        userId: notif.user_id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        isRead: notif.is_read,
        priority: notif.priority,
        subscriptionId: notif.subscription_id,
        category: notif.category,
        metadata: notif.metadata,
        createdAt: notif.created_at,
        updatedAt: notif.updated_at
      })) || [];

      return { notifications };
    } catch (error) {
      console.error('Error in getNotifications:', error);
      throw error;
    }
  }

  // =====================================================
  // 카테고리 API
  // =====================================================

  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('subscription_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      // 컬럼명을 프론트엔드 형식으로 변환
      const categories = data?.map(cat => ({
        id: cat.id,
        userId: cat.user_id,
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        description: cat.description,
        isDefault: cat.is_default,
        createdAt: cat.created_at,
        updatedAt: cat.updated_at
      })) || [];

      return { categories };
    } catch (error) {
      console.error('Error in getCategories:', error);
      throw error;
    }
  }

  // =====================================================
  // 통계 API
  // =====================================================

  async getStatistics() {
    try {
      const { data, error } = await supabase
        .from('user_analytics')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false })
        .limit(12);

      if (error) {
        console.error('Error fetching statistics:', error);
        throw error;
      }

      return { statistics: data };
    } catch (error) {
      console.error('Error in getStatistics:', error);
      throw error;
    }
  }

  // 호환성을 위한 추가 통계 메서드들
  async getUserStatisticsDashboard() {
    return await this.getStatistics();
  }

  async getMonthlySpendingTrends() {
    return { trends: [] }; // 임시 구현
  }

  async generateStatisticsReport() {
    return { report: {} }; // 임시 구현
  }

  async exportStatisticsToCSV() {
    return { csv: '' }; // 임시 구현
  }

  async getSubscriptionById(id: string) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching subscription:', error);
        throw error;
      }

      // 컬럼명을 프론트엔드 형식으로 변환
      const subscription = {
        id: data.id,
        serviceName: data.service_name,
        serviceUrl: data.service_url,
        logo: data.logo,
        logoImage: data.logo_image,
        amount: data.amount,
        currency: data.currency,
        paymentCycle: data.payment_cycle,
        paymentDay: data.payment_day,
        paymentMethod: data.payment_method,
        startDate: data.start_date,
        endDate: data.end_date,
        autoRenewal: data.auto_renewal,
        status: data.status,
        category: data.category,
        tier: data.tier,
        tags: data.tags || [],
        memo: data.memo,
        notifications: data.notifications,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return { subscription };
    } catch (error) {
      console.error('Error in getSubscriptionById:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스 생성
export const productionApiService = new ProductionApiService();

// 기존 apiService와 호환성을 위한 별칭
export const apiService = productionApiService;