import { supabase } from './supabase/client';

// 인증 상태 확인 함수
export const checkAuthenticationStatus = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('🚫 세션 확인 오류:', error);
      return {
        isAuthenticated: false,
        error: error.message,
        sessionData: null
      };
    }

    if (session?.user) {
      const now = Math.floor(Date.now() / 1000);
      const isExpired = session.expires_at ? now >= session.expires_at : false;
      
      const sessionInfo = {
        isAuthenticated: !isExpired,
        userId: session.user.id,
        email: session.user.email,
        role: session.user.role || 'authenticated',
        expiresAt: session.expires_at,
        isExpired,
        accessToken: session.access_token
      };

      console.log('🔐 인증 상태 확인 결과:', {
        authenticated: !isExpired,
        userId: session.user.id,
        email: session.user.email,
        expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'N/A',
        isExpired
      });

      return {
        isAuthenticated: !isExpired,
        error: null,
        sessionData: sessionInfo
      };
    } else {
      console.log('🚫 인증 상태: 로그아웃됨');
      return {
        isAuthenticated: false,
        error: null,
        sessionData: null
      };
    }
  } catch (error) {
    console.error('❌ 인증 상태 확인 실패:', error);
    return {
      isAuthenticated: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      sessionData: null
    };
  }
};

// 로그인 후 데이터 접근 테스트 함수
export const testDataAccessAfterLogin = async () => {
  console.log('🧪 로그인 후 데이터 접근 테스트 시작');
  
  // 1. 먼저 인증 상태 확인
  const authStatus = await checkAuthenticationStatus();
  
  if (!authStatus.isAuthenticated) {
    console.warn('⚠️ 사용자가 인증되지 않았습니다. 로그인이 필요합니다.');
    return {
      success: false,
      message: '인증이 필요합니다. 로그인 후 다시 시도하세요.',
      authStatus
    };
  }

  console.log('✅ 사용자 인증 확인됨, 데이터 접근 테스트 진행');

  const results = [];

  // 2. 구독 데이터 접근 테스트
  try {
    console.log('📋 구독 데이터 조회 테스트...');
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .limit(5);

    if (subError) {
      console.error('❌ 구독 데이터 조회 실패:', subError.message);
      results.push({
        table: 'subscriptions',
        success: false,
        error: subError.message,
        rowCount: 0
      });
    } else {
      console.log('✅ 구독 데이터 조회 성공:', subscriptions?.length || 0, '개 항목');
      results.push({
        table: 'subscriptions',
        success: true,
        error: null,
        rowCount: subscriptions?.length || 0
      });
    }
  } catch (error) {
    console.error('❌ 구독 데이터 테스트 중 오류:', error);
    results.push({
      table: 'subscriptions',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      rowCount: 0
    });
  }

  // 3. 사용자 설정 데이터 접근 테스트
  try {
    console.log('⚙️ 사용자 설정 데이터 조회 테스트...');
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')
      .limit(5);

    if (settingsError) {
      console.error('❌ 사용자 설정 데이터 조회 실패:', settingsError.message);
      results.push({
        table: 'user_settings',
        success: false,
        error: settingsError.message,
        rowCount: 0
      });
    } else {
      console.log('✅ 사용자 설정 데이터 조회 성공:', settings?.length || 0, '개 항목');
      results.push({
        table: 'user_settings',
        success: true,
        error: null,
        rowCount: settings?.length || 0
      });
    }
  } catch (error) {
    console.error('❌ 사용자 설정 데이터 테스트 중 오류:', error);
    results.push({
      table: 'user_settings',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      rowCount: 0
    });
  }

  // 4. 알림 데이터 접근 테스트
  try {
    console.log('🔔 알림 데이터 조회 테스트...');
    const { data: notifications, error: notificationError } = await supabase
      .from('notifications')
      .select('*')
      .limit(5);

    if (notificationError) {
      console.error('❌ 알림 데이터 조회 실패:', notificationError.message);
      results.push({
        table: 'notifications',
        success: false,
        error: notificationError.message,
        rowCount: 0
      });
    } else {
      console.log('✅ 알림 데이터 조회 성공:', notifications?.length || 0, '개 항목');
      results.push({
        table: 'notifications',
        success: true,
        error: null,
        rowCount: notifications?.length || 0
      });
    }
  } catch (error) {
    console.error('❌ 알림 데이터 테스트 중 오류:', error);
    results.push({
      table: 'notifications',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      rowCount: 0
    });
  }

  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;

  console.log(`🎯 데이터 접근 테스트 완료: ${successCount}/${totalCount} 성공`);

  return {
    success: successCount > 0,
    message: `${successCount}/${totalCount} 테이블에 성공적으로 접근했습니다.`,
    authStatus,
    results
  };
};

// RLS 정책 테스트 (인증 전/후 비교)
export const testRLSPolicyComparison = async () => {
  console.log('🔒 RLS 정책 비교 테스트 시작');
  
  const authStatus = await checkAuthenticationStatus();
  
  const testTables = [
    'subscriptions',
    'user_settings', 
    'notifications',
    'user_behavior_analytics'
  ];

  const results = [];

  for (const table of testTables) {
    try {
      console.log(`📊 ${table} 테이블 RLS 테스트...`);
      
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      const result = {
        table,
        isAuthenticated: authStatus.isAuthenticated,
        success: !error,
        error: error?.message,
        rowCount: data?.length || 0,
        rlsBlocked: error?.message?.includes('Row Level Security policy') || false
      };

      if (error) {
        if (error.message.includes('Row Level Security policy')) {
          console.log(`🛡️ ${table}: RLS 정책에 의해 차단됨 (${authStatus.isAuthenticated ? '인증됨' : '미인증'})`);
        } else {
          console.error(`❌ ${table}: ${error.message}`);
        }
      } else {
        console.log(`✅ ${table}: 접근 성공 (${data?.length || 0}개 행)`);
      }

      results.push(result);
    } catch (error) {
      console.error(`❌ ${table} 테스트 중 오류:`, error);
      results.push({
        table,
        isAuthenticated: authStatus.isAuthenticated,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        rowCount: 0,
        rlsBlocked: false
      });
    }
  }

  return {
    authStatus,
    results,
    summary: {
      total: results.length,
      successful: results.filter(r => r.success).length,
      rlsBlocked: results.filter(r => r.rlsBlocked).length,
      errors: results.filter(r => !r.success && !r.rlsBlocked).length
    }
  };
};

// 세션 상태를 콘솔에 상세히 출력하는 함수
export const logSessionDetails = async () => {
  console.log('🔍 세션 상태 상세 분석 시작');
  console.log('==========================================');

  try {
    // 현재 세션 정보
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ 세션 조회 오류:', error);
      return;
    }

    if (!session) {
      console.log('🚫 현재 세션 없음 - 사용자가 로그아웃 상태입니다.');
      console.log('💡 해결 방법: /login 페이지에서 로그인하세요.');
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at;
    const isExpired = expiresAt ? now >= expiresAt : false;
    const timeUntilExpiry = expiresAt ? expiresAt - now : 0;

    console.log('📋 세션 정보:');
    console.log(`   사용자 ID: ${session.user.id}`);
    console.log(`   이메일: ${session.user.email}`);
    console.log(`   역할: ${session.user.role || 'authenticated'}`);
    console.log(`   생성 시간: ${new Date(session.user.created_at).toLocaleString()}`);
    console.log(`   세션 만료 시간: ${expiresAt ? new Date(expiresAt * 1000).toLocaleString() : 'N/A'}`);
    console.log(`   현재 시간: ${new Date().toLocaleString()}`);
    console.log(`   만료 여부: ${isExpired ? '❌ 만료됨' : '✅ 유효함'}`);
    
    if (!isExpired && timeUntilExpiry > 0) {
      const hours = Math.floor(timeUntilExpiry / 3600);
      const minutes = Math.floor((timeUntilExpiry % 3600) / 60);
      console.log(`   남은 시간: ${hours}시간 ${minutes}분`);
    }

    console.log('\n🔑 토큰 정보:');
    console.log(`   액세스 토큰: ${session.access_token ? session.access_token.substring(0, 20) + '...' : 'N/A'}`);
    console.log(`   리프레시 토큰: ${session.refresh_token ? session.refresh_token.substring(0, 20) + '...' : 'N/A'}`);

    if (session.user.user_metadata && Object.keys(session.user.user_metadata).length > 0) {
      console.log('\n👤 사용자 메타데이터:');
      console.log(session.user.user_metadata);
    }

    console.log('\n==========================================');
    
    if (isExpired) {
      console.log('⚠️ 세션이 만료되었습니다. 다시 로그인해주세요.');
    } else {
      console.log('✅ 세션이 유효합니다. 데이터에 접근할 수 있습니다.');
    }

  } catch (error) {
    console.error('❌ 세션 분석 중 오류:', error);
  }
};