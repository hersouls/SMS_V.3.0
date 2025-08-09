// API 보안 강화 모듈
// SMS V.3.0 통합 테스트 보안 검토 결과 기반

// Supabase 클라이언트는 현재 번들에 포함되지 않음. 필요한 곳에서 스텁 사용.
const supabase: any = { auth: { getSession: async () => ({ data: { session: null }, error: null }), refreshSession: async () => ({ data: { session: null }, error: { message: 'disabled' } }), signOut: async () => {} } };

// JWT 토큰 검증 및 관리
export class TokenManager {
  private static instance: TokenManager;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number | null = null;
  private refreshPromise: Promise<string> | null = null;

  private constructor() {}

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  // 토큰 설정
  setTokens(accessToken: string, refreshToken: string, expiresIn: number) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.tokenExpiry = Date.now() + (expiresIn * 1000) - 60000; // 1분 여유
  }

  // 유효한 토큰 가져오기 (자동 갱신 포함)
  async getValidToken(): Promise<string | null> {
    if (!this.accessToken) {
      await this.loadTokenFromSession();
    }

    if (!this.accessToken) {
      throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
    }

    // 토큰이 곧 만료되거나 이미 만료된 경우 갱신
    if (this.tokenExpiry && Date.now() >= this.tokenExpiry) {
      return this.refreshTokenIfNeeded();
    }

    return this.accessToken;
  }

  // 세션에서 토큰 로드
  private async loadTokenFromSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('세션 로드 오류:', error);
        return;
      }

      if (session?.access_token) {
        this.setTokens(
          session.access_token,
          session.refresh_token || '',
          session.expires_in || 3600
        );
      }
    } catch (error) {
      console.error('토큰 로드 실패:', error);
    }
  }

  // 토큰 갱신 (중복 요청 방지)
  private async refreshTokenIfNeeded(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const token = await this.refreshPromise;
      return token;
    } finally {
      this.refreshPromise = null;
    }
  }

  // 실제 토큰 갱신 수행
  private async performTokenRefresh(): Promise<string> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('토큰 갱신 오류:', error);
        
        // 리프레시 토큰이 유효하지 않은 경우 자동 로그아웃
        if (error.message.includes('Invalid Refresh Token') || 
            error.message.includes('Refresh Token Not Found') ||
            error.message.includes('400')) {
          console.log('리프레시 토큰이 유효하지 않습니다. 자동 로그아웃을 수행합니다.');
          await this.handleInvalidRefreshToken();
        }
        
        throw new Error(`토큰 갱신 실패: ${error.message}`);
      }

      if (data.session?.access_token) {
        this.setTokens(
          data.session.access_token,
          data.session.refresh_token || '',
          data.session.expires_in || 3600
        );
        return data.session.access_token;
      }

      throw new Error('토큰 갱신 결과가 유효하지 않습니다.');
    } catch (error) {
      // 갱신 실패 시 로그아웃 처리
      this.clearTokens();
      throw error;
    }
  }

  // 유효하지 않은 리프레시 토큰 처리
  private async handleInvalidRefreshToken() {
    try {
      // 세션 완전 삭제
      await supabase.auth.signOut();
      
      // 로컬 스토리지 정리
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
      
      // 페이지 새로고침하여 상태 초기화
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } catch (logoutError) {
      console.error('로그아웃 처리 중 오류:', logoutError);
    }
  }

  // 토큰 삭제
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
  }

  // 토큰 상태 확인
  isTokenValid(): boolean {
    return !!(this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry);
  }
}

// API 요청 제한 및 레이트 리미팅
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private timeWindow: number;

  constructor(maxRequests: number = 100, timeWindowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowMs;
  }

  // 요청 허용 여부 확인
  canMakeRequest(userId: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];
    
    // 시간 윈도우 밖의 요청들 제거
    const validRequests = userRequests.filter(
      timestamp => now - timestamp < this.timeWindow
    );
    
    this.requests.set(userId, validRequests);
    
    return validRequests.length < this.maxRequests;
  }

  // 요청 기록
  recordRequest(userId: string): void {
    const userRequests = this.requests.get(userId) || [];
    userRequests.push(Date.now());
    this.requests.set(userId, userRequests);
  }

  // 남은 요청 수 확인
  getRemainingRequests(userId: string): number {
    const userRequests = this.requests.get(userId) || [];
    const now = Date.now();
    const validRequests = userRequests.filter(
      timestamp => now - timestamp < this.timeWindow
    );
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }
}

// 보안 헤더 및 요청 검증
export class SecurityValidator {
  private static allowedOrigins = [
    'https://sub.moonwave.kr',
    'https://ycdy8.github.io',
    'http://localhost:3010',
    'http://localhost:5173'
  ];

  // 요청 헤더 검증
  static validateRequest(request: Request): boolean {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    
    // Origin 검증
    if (origin && !this.allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      console.warn('허용되지 않은 Origin:', origin);
      return false;
    }

    // Referer 검증 (있는 경우)
    if (referer && !this.allowedOrigins.some(allowed => referer.startsWith(allowed))) {
      console.warn('허용되지 않은 Referer:', referer);
      return false;
    }

    return true;
  }

  // SQL 인젝션 패턴 감지
  static detectSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
      /(--|\/\*|\*\/|;|'|"|`)/g,
      /(\bOR\b|\bAND\b).*?=.*?(\bOR\b|\bAND\b)/gi,
      /1\s*=\s*1/gi,
      /\'\s*OR\s*\'\w*\'\s*=\s*\'\w*\'/gi
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
  }

  // XSS 패턴 감지
  static detectXSS(input: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }

  // 입력 데이터 sanitization
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>'"]/g, '') // 위험한 문자 제거
      .replace(/javascript:/gi, '') // JavaScript 프로토콜 제거
      .replace(/on\w+=/gi, '') // 이벤트 핸들러 제거
      .trim();
  }

  // 파일 업로드 검증
  static validateFileUpload(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: '허용되지 않은 파일 형식입니다.' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: '파일 크기가 너무 큽니다. (최대 5MB)' };
    }

    return { valid: true };
  }
}

// 보안 헤더 설정
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self' https://*.supabase.co https://*.supabase.in; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co; style-src 'self' 'unsafe-inline';",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

// 보안 강화된 API 클래스
export class SecureApiClient {
  private tokenManager: TokenManager;
  private rateLimiter: RateLimiter;

  constructor() {
    this.tokenManager = TokenManager.getInstance();
    this.rateLimiter = new RateLimiter(100, 60000); // 분당 100회 제한
  }

  // 보안 강화된 API 요청
  async secureRequest(
    url: string,
    options: RequestInit = {},
    userId?: string
  ): Promise<Response> {
    // 레이트 리미팅 검사
    if (userId && !this.rateLimiter.canMakeRequest(userId)) {
      throw new Error('요청 제한에 도달했습니다. 잠시 후 다시 시도해주세요.');
    }

    // 유효한 토큰 획득
    const token = await this.tokenManager.getValidToken();

    // 보안 헤더 설정
    const secureHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Client-Info': 'sms-v3.0',
      'X-Requested-With': 'XMLHttpRequest',
      ...securityHeaders,
      ...options.headers,
    };

    // 요청 실행
    const response = await fetch(url, {
      ...options,
      headers: secureHeaders,
      credentials: 'same-origin',
      mode: 'cors',
    });

    // 요청 기록 (성공한 경우)
    if (userId && response.ok) {
      this.rateLimiter.recordRequest(userId);
    }

    // 응답 보안 검증
    this.validateResponse(response);

    return response;
  }

  // 응답 보안 검증
  private validateResponse(response: Response): void {
    // Content-Type 검증
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('application/json')) {
      console.warn('예상하지 못한 Content-Type:', contentType);
    }

    // 보안 헤더 검증
    const securityHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'strict-transport-security'
    ];

    securityHeaders.forEach(header => {
      if (!response.headers.has(header)) {
        console.warn(`보안 헤더 누락: ${header}`);
      }
    });
  }

  // 데이터 검증 및 sanitization
  validateAndSanitizeData(data: any): any {
    if (typeof data === 'string') {
      // SQL 인젝션 및 XSS 검사
      if (SecurityValidator.detectSQLInjection(data)) {
        throw new Error('유효하지 않은 입력 데이터입니다.');
      }
      if (SecurityValidator.detectXSS(data)) {
        throw new Error('보안 위험이 있는 입력 데이터입니다.');
      }
      return SecurityValidator.sanitizeInput(data);
    }

    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.validateAndSanitizeData(value);
      }
      return sanitized;
    }

    return data;
  }

  // 구독 데이터 특화 검증
  validateSubscriptionData(subscription: any): any {
    const sanitized = { ...subscription };

    // 필수 필드 검증
    if (!subscription.serviceName || subscription.serviceName.trim().length === 0) {
      throw new Error('서비스명은 필수입니다.');
    }

    if (!subscription.amount || isNaN(parseFloat(subscription.amount))) {
      throw new Error('유효한 금액을 입력해주세요.');
    }

    if (!subscription.paymentDay || isNaN(parseInt(subscription.paymentDay))) {
      throw new Error('유효한 결제일을 입력해주세요.');
    }

    // 날짜 필드 검증
    if (subscription.startDate) {
      const startDate = new Date(subscription.startDate);
      if (isNaN(startDate.getTime())) {
        throw new Error('유효한 시작일을 입력해주세요.');
      }
    }

    if (subscription.endDate) {
      const endDate = new Date(subscription.endDate);
      if (isNaN(endDate.getTime())) {
        throw new Error('유효한 종료일을 입력해주세요.');
      }

      // 종료일이 시작일보다 이전인지 확인
      if (subscription.startDate) {
        const startDate = new Date(subscription.startDate);
        if (endDate < startDate) {
          throw new Error('종료일은 시작일보다 이후여야 합니다.');
        }
      }
    }

    // 금액 범위 검증
    const amount = parseFloat(subscription.amount);
    if (amount < 0 || amount > 1000000) {
      throw new Error('금액은 0원 이상 1,000,000원 이하여야 합니다.');
    }

    // 결제일 범위 검증
    const paymentDay = parseInt(subscription.paymentDay);
    if (paymentDay < 1 || paymentDay > 31) {
      throw new Error('결제일은 1일부터 31일 사이여야 합니다.');
    }

    // 일반적인 sanitization 적용
    return this.validateAndSanitizeData(sanitized);
  }
}

// 전역 보안 API 클라이언트 인스턴스
export const secureApiClient = new SecureApiClient();

// 보안 유틸리티 함수들
export const SecurityUtils = {
  // CSRF 토큰 생성
  generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },

  // 비밀번호 강도 검증
  validatePasswordStrength(password: string): { valid: boolean; score: number; feedback: string[] } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score += 1;
    else feedback.push('8자 이상이어야 합니다.');

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('소문자를 포함해야 합니다.');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('대문자를 포함해야 합니다.');

    if (/\d/.test(password)) score += 1;
    else feedback.push('숫자를 포함해야 합니다.');

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    else feedback.push('특수문자를 포함해야 합니다.');

    return {
      valid: score >= 4,
      score,
      feedback
    };
  },

  // 이메일 형식 검증
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // 사용자 입력 검증
  validateUserInput(input: string, type: 'text' | 'email' | 'password' | 'number'): boolean {
    switch (type) {
      case 'email':
        return this.validateEmail(input);
      case 'password':
        return this.validatePasswordStrength(input).valid;
      case 'number':
        return !isNaN(Number(input)) && isFinite(Number(input));
      case 'text':
        return input.length > 0 && input.length <= 1000;
      default:
        return false;
    }
  }
};

// 감사 로그 시스템
export class AuditLogger {
  private static logs: any[] = [];

  static log(action: string, userId: string, details: any = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      userId,
      details,
      userAgent: navigator.userAgent,
      ip: 'client-side' // 서버에서 실제 IP 기록
    };

    this.logs.push(logEntry);
    
    // 로그가 너무 많이 쌓이면 오래된 것 제거
    if (this.logs.length > 1000) {
      this.logs.splice(0, 500);
    }

    // 중요한 액션은 즉시 서버로 전송
    if (this.isCriticalAction(action)) {
      this.sendToServer(logEntry);
    }
  }

  private static isCriticalAction(action: string): boolean {
    const criticalActions = [
      'login_attempt',
      'login_failed', 
      'password_change',
      'account_deletion',
      'permission_change',
      'security_violation'
    ];
    return criticalActions.includes(action);
  }

  private static async sendToServer(logEntry: any) {
    try {
      // 실제 구현에서는 서버 로깅 엔드포인트로 전송
      console.log('🔒 Security Log:', logEntry);
    } catch (error) {
      console.error('감사 로그 전송 실패:', error);
    }
  }

  static getLogs(): any[] {
    return [...this.logs];
  }
}