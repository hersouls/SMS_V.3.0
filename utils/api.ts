// API 관련 유틸리티 함수들

// 환경 변수에서 Supabase URL 가져오기
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bfurhjgnnjgfcafdrotk.supabase.co';
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

  // Subscription methods
  async getSubscriptions() {
    return this.request('/subscriptions');
  }

  async createSubscription(subscription: any) {
    return this.request('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(subscription),
    });
  }

  async updateSubscription(id: string, updates: any) {
    return this.request(`/subscriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteSubscription(id: string) {
    return this.request(`/subscriptions/${id}`, {
      method: 'DELETE',
    });
  }

  // Settings methods
  async getSettings() {
    return this.request('/settings');
  }

  async updateSettings(settings: any) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
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