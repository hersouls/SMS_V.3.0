import { createClient } from '@supabase/supabase-js';

// 환경 변수에서 Supabase 설정 가져오기
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 환경 변수 디버깅
console.log('🔍 Supabase 환경 변수 확인:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'undefined',
  key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'undefined'
});

// 환경 변수가 설정되지 않은 경우 에러 발생
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase 환경 변수 오류:', {
    VITE_SUPABASE_URL: supabaseUrl ? '설정됨' : '설정되지 않음',
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? '설정됨' : '설정되지 않음'
  });
  throw new Error('Supabase 환경 변수가 설정되지 않았습니다. VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY를 설정해주세요.');
}

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'sms-v3.0',
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  },
  db: {
    schema: 'public'
  }
});

// 클라이언트 상태 확인 함수
export const checkSupabaseConnection = async () => {
  try {
    console.log('🔍 Supabase 연결 확인 중...');
    
    // 먼저 인증 상태 확인
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('🔑 세션 상태:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      sessionError: sessionError?.message
    });

    // 데이터베이스 연결 테스트
    const { data, error } = await supabase.from('subscriptions').select('count').limit(1);
    
    if (error) {
      console.error('❌ Supabase 연결 오류:', error);
      return false;
    }
    
    console.log('✅ Supabase 연결 성공');
    return true;
  } catch (error) {
    console.error('❌ Supabase 연결 확인 실패:', error);
    return false;
  }
};

// 현재 도메인 확인 함수
export const getCurrentDomain = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return import.meta.env.VITE_APP_URL || 'https://sub.moonwave.kr';
};

// 허용된 도메인 목록
export const getAllowedOrigins = () => {
  const origins = import.meta.env.VITE_ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000,https://sub.moonwave.kr,https://www.sub.moonwave.kr';
  return origins.split(',').map(origin => origin.trim());
};

// 인증 상태 확인 함수
export const checkAuthStatus = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ 인증 상태 확인 오류:', error);
      return { isAuthenticated: false, user: null, error };
    }
    
    if (!session?.user) {
      console.log('ℹ️ 인증되지 않은 사용자');
      return { isAuthenticated: false, user: null, error: null };
    }
    
    console.log('✅ 인증된 사용자:', {
      id: session.user.id,
      email: session.user.email,
      hasAccessToken: !!session.access_token
    });
    
    return { 
      isAuthenticated: true, 
      user: session.user, 
      accessToken: session.access_token,
      error: null 
    };
  } catch (error) {
    console.error('❌ 인증 상태 확인 실패:', error);
    return { isAuthenticated: false, user: null, error };
  }
};