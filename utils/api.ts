// API 관련 유틸리티 함수들
import { supabase } from './supabase/client';

// 환경 변수에서 Supabase URL 가져오기 (레거시 지원용)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL 환경 변수가 설정되지 않았습니다.');
}
const BASE_URL = `${supabaseUrl}/functions/v1/make-server-7a0e61a7`;

export class ApiService {
  private accessToken: string | null = null;

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.accessToken || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'X-Client-Info': 'sms-v2.0',
      ...options.headers,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      mode: 'cors',
      credentials: 'same-origin',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth methods
  async signup(email: string, password: string, name?: string) {
    try {
      return await this.request('/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      });
    } catch (error: any) {
      // 더 구체적인 에러 메시지 제공
      if (error.message.includes('already registered')) {
        throw new Error('이미 등록된 이메일입니다.');
      }
      if (error.message.includes('invalid email')) {
        throw new Error('올바른 이메일 형식을 입력해주세요.');
      }
      if (error.message.includes('weak password')) {
        throw new Error('비밀번호는 최소 6자 이상이어야 합니다.');
      }
      throw new Error('회원가입에 실패했습니다. 다시 시도해주세요.');
    }
  }

  // Subscription methods - Supabase 직접 사용
  async getSubscriptions() {
    try {
      console.log('🔍 API Service - getSubscriptions called');
      console.log('🔑 Access token:', this.accessToken ? 'present' : 'missing');
      
      const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('📊 Supabase query result:', {
        error: error?.message,
        dataCount: subscriptions?.length || 0,
        hasData: !!subscriptions
      });

      if (error) {
        console.error('❌ Supabase error:', error);
        throw new Error(error.message);
      }

      // 데이터 형식을 기존과 동일하게 변환
      const formattedSubscriptions = (subscriptions || []).map(sub => ({
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
        autoRenewal: sub.auto_renewal,
        status: sub.status,
        category: sub.category,
        tier: sub.tier,
        memo: sub.memo,
        notifications: sub.notifications,
        createdAt: sub.created_at,
        updatedAt: sub.updated_at
      }));

      return { subscriptions: formattedSubscriptions };
    } catch (error: any) {
      console.error('Error getting subscriptions:', error);
      throw new Error('구독 목록을 불러오는데 실패했습니다.');
    }
  }

  async createSubscription(subscription: any) {
    try {
      // 현재 사용자 정보 가져오기
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      // Supabase 스키마에 맞게 데이터 변환
      const subscriptionData = {
        user_id: user.id,
        service_name: subscription.serviceName,
        service_url: subscription.serviceUrl,
        logo: subscription.logo,
        logo_image: subscription.logoImage,
        amount: parseFloat(subscription.amount),
        currency: subscription.currency,
        payment_cycle: subscription.paymentCycle,
        payment_day: parseInt(subscription.paymentDay),
        payment_method: subscription.paymentMethod,
        start_date: subscription.startDate,
        auto_renewal: subscription.autoRenewal,
        status: subscription.status || 'active',
        category: subscription.category,
        tier: subscription.tier,
        memo: subscription.memo,
        notifications: subscription.notifications || {
          sevenDays: true,
          threeDays: true,
          sameDay: true
        }
      };

      const { data, error } = await supabase
        .from('subscriptions')
        .insert([subscriptionData])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // 응답 형식을 기존과 동일하게 맞춤
      const formattedSubscription = {
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
        autoRenewal: data.auto_renewal,
        status: data.status,
        category: data.category,
        tier: data.tier,
        memo: data.memo,
        notifications: data.notifications,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return { subscription: formattedSubscription };
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      throw new Error('구독을 추가하는데 실패했습니다: ' + error.message);
    }
  }

  async updateSubscription(id: string, updates: any) {
    try {
      // 데이터 변환
      const updateData: any = {};
      
      if (updates.serviceName !== undefined) updateData.service_name = updates.serviceName;
      if (updates.serviceUrl !== undefined) updateData.service_url = updates.serviceUrl;
      if (updates.logo !== undefined) updateData.logo = updates.logo;
      if (updates.logoImage !== undefined) updateData.logo_image = updates.logoImage;
      if (updates.amount !== undefined) updateData.amount = parseFloat(updates.amount);
      if (updates.currency !== undefined) updateData.currency = updates.currency;
      if (updates.paymentCycle !== undefined) updateData.payment_cycle = updates.paymentCycle;
      if (updates.paymentDay !== undefined) updateData.payment_day = parseInt(updates.paymentDay);
      if (updates.paymentMethod !== undefined) updateData.payment_method = updates.paymentMethod;
      if (updates.startDate !== undefined) updateData.start_date = updates.startDate;
      if (updates.autoRenewal !== undefined) updateData.auto_renewal = updates.autoRenewal;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.tier !== undefined) updateData.tier = updates.tier;
      if (updates.memo !== undefined) updateData.memo = updates.memo;
      if (updates.notifications !== undefined) updateData.notifications = updates.notifications;

      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // 응답 형식을 기존과 동일하게 맞춤
      const formattedSubscription = {
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
        autoRenewal: data.auto_renewal,
        status: data.status,
        category: data.category,
        tier: data.tier,
        memo: data.memo,
        notifications: data.notifications,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return { subscription: formattedSubscription };
    } catch (error: any) {
      console.error('Error updating subscription:', error);
      throw new Error('구독을 수정하는데 실패했습니다: ' + error.message);
    }
  }

  async deleteSubscription(id: string) {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting subscription:', error);
      throw new Error('구독을 삭제하는데 실패했습니다: ' + error.message);
    }
  }

  // Settings methods - Supabase 직접 사용
  async getSettings() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      const { data: preferences, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw new Error(error.message);
      }

      // 기본값 또는 기존 설정 반환
      const defaultSettings = {
        exchangeRate: 1300,
        defaultCurrency: 'KRW',
        notifications: {
          paymentReminders: true,
          priceChanges: false,
          subscriptionExpiry: true,
          email: true,
          push: true,
          sms: false
        },
        theme: 'dark',
        language: 'ko',
        timezone: 'Asia/Seoul',
        dateFormat: 'YYYY-MM-DD',
        currencyFormat: '₩#,##0'
      };

      if (!preferences) {
        return { settings: defaultSettings };
      }

      // 데이터 형식을 기존과 동일하게 변환
      const formattedSettings = {
        exchangeRate: preferences.exchange_rate || defaultSettings.exchangeRate,
        defaultCurrency: preferences.default_currency || defaultSettings.defaultCurrency,
        notifications: preferences.notifications || defaultSettings.notifications,
        theme: preferences.theme || defaultSettings.theme,
        language: preferences.language || defaultSettings.language,
        timezone: preferences.timezone || defaultSettings.timezone,
        dateFormat: preferences.date_format || defaultSettings.dateFormat,
        currencyFormat: preferences.currency_format || defaultSettings.currencyFormat
      };

      return { settings: formattedSettings };
    } catch (error: any) {
      console.error('Error getting settings:', error);
      throw new Error('설정을 불러오는데 실패했습니다: ' + error.message);
    }
  }

  async updateSettings(settings: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      // 데이터 변환
      const settingsData = {
        user_id: user.id,
        exchange_rate: settings.exchangeRate,
        default_currency: settings.defaultCurrency,
        notifications: settings.notifications,
        theme: settings.theme,
        language: settings.language,
        timezone: settings.timezone,
        date_format: settings.dateFormat,
        currency_format: settings.currencyFormat,
        updated_at: new Date().toISOString()
      };

      // upsert를 사용하여 없으면 생성, 있으면 업데이트
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert(settingsData, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // 응답 형식을 기존과 동일하게 맞춤
      const formattedSettings = {
        exchangeRate: data.exchange_rate,
        defaultCurrency: data.default_currency,
        notifications: data.notifications,
        theme: data.theme,
        language: data.language,
        timezone: data.timezone,
        dateFormat: data.date_format,
        currencyFormat: data.currency_format
      };

      return { settings: formattedSettings };
    } catch (error: any) {
      console.error('Error updating settings:', error);
      throw new Error('설정을 저장하는데 실패했습니다: ' + error.message);
    }
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // 현재 도메인 확인
  getCurrentDomain() {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return import.meta.env.VITE_APP_URL || 'https://sub.moonwave.kr';
  }
}

export const apiService = new ApiService();