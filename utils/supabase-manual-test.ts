import { supabase } from './supabase/client';

interface TestResult {
  testName: string;
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
}

// 테스트 결과를 저장할 배열
const testResults: TestResult[] = [];

// 테스트 결과 기록 함수
const logTestResult = (testName: string, success: boolean, data?: any, error?: string) => {
  const result: TestResult = {
    testName,
    success,
    data,
    error,
    timestamp: new Date().toISOString()
  };
  
  testResults.push(result);
  
  const status = success ? '✅' : '❌';
  console.log(`${status} ${testName}:`, success ? data : error);
  
  return result;
};

// 1. 환경 변수 및 클라이언트 설정 테스트
export const testEnvironmentConfig = () => {
  console.log('\n🔧 환경 설정 테스트 시작...');
  
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    const hasUrl = !!supabaseUrl;
    const hasKey = !!supabaseAnonKey;
    
    logTestResult('Supabase URL 설정', hasUrl, { url: hasUrl ? '설정됨' : '미설정' });
    logTestResult('Supabase Anon Key 설정', hasKey, { key: hasKey ? '설정됨' : '미설정' });
    
    if (hasUrl && hasKey) {
      logTestResult('클라이언트 생성', true, { 
        url: supabaseUrl.substring(0, 30) + '...', 
        keyLength: supabaseAnonKey.length 
      });
    } else {
      logTestResult('클라이언트 생성', false, null, '환경 변수가 설정되지 않음');
    }
    
    return hasUrl && hasKey;
  } catch (error) {
    logTestResult('환경 설정 테스트', false, null, error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
};

// 2. 연결 테스트
export const testSupabaseConnection = async () => {
  console.log('\n🌐 Supabase 연결 테스트 시작...');
  
  try {
    // 간단한 SELECT 쿼리로 연결 확인
    const { data, error } = await supabase
      .from('subscriptions')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      logTestResult('데이터베이스 연결', false, null, error.message);
      return false;
    }
    
    logTestResult('데이터베이스 연결', true, { message: '연결 성공', count: data });
    return true;
  } catch (error) {
    logTestResult('연결 테스트', false, null, error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
};

// 3. 인증 상태 테스트
export const testAuthenticationStatus = async () => {
  console.log('\n🔐 인증 상태 테스트 시작...');
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      logTestResult('세션 조회', false, null, error.message);
      return null;
    }
    
    if (session?.user) {
      const now = Math.floor(Date.now() / 1000);
      const isExpired = session.expires_at ? now >= session.expires_at : false;
      
      const sessionInfo = {
        userId: session.user.id,
        email: session.user.email,
        role: session.user.role || 'authenticated',
        isExpired,
        expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'N/A'
      };
      
      logTestResult('사용자 인증 상태', !isExpired, sessionInfo);
      return !isExpired ? sessionInfo : null;
    } else {
      logTestResult('사용자 인증 상태', false, null, '로그아웃 상태');
      return null;
    }
  } catch (error) {
    logTestResult('인증 상태 테스트', false, null, error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
};

// 4. 데이터베이스 스키마 테스트
export const testDatabaseSchema = async () => {
  console.log('\n📊 데이터베이스 스키마 테스트 시작...');
  
  const tables = [
    'subscriptions',
    'user_preferences', 
    'notifications',
    'categories',
    'tags',
    'statistics_cache'
  ];
  
  const schemaResults = [];
  
  for (const tableName of tables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        logTestResult(`테이블 ${tableName}`, false, null, error.message);
        schemaResults.push({ table: tableName, exists: false, error: error.message });
      } else {
        logTestResult(`테이블 ${tableName}`, true, { count: data });
        schemaResults.push({ table: tableName, exists: true, count: data });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logTestResult(`테이블 ${tableName}`, false, null, errorMsg);
      schemaResults.push({ table: tableName, exists: false, error: errorMsg });
    }
  }
  
  return schemaResults;
};

// 5. 기본 CRUD 테스트 (로그인 사용자 전용)
export const testBasicCRUD = async () => {
  console.log('\n📝 기본 CRUD 테스트 시작...');
  
  // 먼저 인증 상태 확인
  const authStatus = await testAuthenticationStatus();
  if (!authStatus) {
    logTestResult('CRUD 테스트', false, null, '로그인이 필요합니다');
    return false;
  }
  
  try {
    // 1. CREATE - 테스트 구독 생성
    const testSubscription = {
      service_name: 'Test Service',
      service_url: 'https://test.com',
      amount: 9.99,
      currency: 'USD',
      payment_cycle: 'monthly',
      payment_day: 1,
      start_date: new Date().toISOString().split('T')[0],
      category: 'Test',
      status: 'active'
    };
    
    const { data: createdData, error: createError } = await supabase
      .from('subscriptions')
      .insert(testSubscription)
      .select()
      .single();
    
    if (createError) {
      logTestResult('데이터 생성 (CREATE)', false, null, createError.message);
      return false;
    }
    
    logTestResult('데이터 생성 (CREATE)', true, { id: createdData.id });
    const testId = createdData.id;
    
    // 2. READ - 생성된 데이터 조회
    const { data: readData, error: readError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', testId)
      .single();
    
    if (readError) {
      logTestResult('데이터 조회 (READ)', false, null, readError.message);
    } else {
      logTestResult('데이터 조회 (READ)', true, { service_name: readData.service_name });
    }
    
    // 3. UPDATE - 데이터 수정
    const { data: updatedData, error: updateError } = await supabase
      .from('subscriptions')
      .update({ service_name: 'Updated Test Service' })
      .eq('id', testId)
      .select()
      .single();
    
    if (updateError) {
      logTestResult('데이터 수정 (UPDATE)', false, null, updateError.message);
    } else {
      logTestResult('데이터 수정 (UPDATE)', true, { service_name: updatedData.service_name });
    }
    
    // 4. DELETE - 데이터 삭제
    const { error: deleteError } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', testId);
    
    if (deleteError) {
      logTestResult('데이터 삭제 (DELETE)', false, null, deleteError.message);
    } else {
      logTestResult('데이터 삭제 (DELETE)', true, { deletedId: testId });
    }
    
    return true;
  } catch (error) {
    logTestResult('CRUD 테스트', false, null, error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
};

// 6. Real-time 기능 테스트
export const testRealtimeFeatures = async () => {
  console.log('\n⚡ Real-time 기능 테스트 시작...');
  
  try {
    const channel = supabase
      .channel('test-channel')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'subscriptions'
      }, (payload) => {
        logTestResult('Real-time INSERT 이벤트', true, payload);
      })
      .subscribe();
    
    // 구독 상태 확인
    if (channel) {
      logTestResult('Real-time 채널 구독', true, { channelState: 'subscribed' });
      
      // 5초 후 구독 해제
      setTimeout(() => {
        supabase.removeChannel(channel);
        logTestResult('Real-time 채널 구독 해제', true, { channelState: 'unsubscribed' });
      }, 5000);
      
      return true;
    } else {
      logTestResult('Real-time 채널 구독', false, null, '채널 생성 실패');
      return false;
    }
  } catch (error) {
    logTestResult('Real-time 테스트', false, null, error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
};

// 7. 파일 스토리지 테스트 (선택적)
export const testStorageFeatures = async () => {
  console.log('\n📁 스토리지 기능 테스트 시작...');
  
  try {
    // 버킷 목록 조회
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      logTestResult('스토리지 버킷 조회', false, null, bucketsError.message);
      return false;
    }
    
    logTestResult('스토리지 버킷 조회', true, { bucketCount: buckets.length, buckets: buckets.map(b => b.name) });
    return true;
  } catch (error) {
    logTestResult('스토리지 테스트', false, null, error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
};

// 8. 전체 테스트 실행
export const runAllSupabaseTests = async () => {
  console.log('🚀 Supabase 연동 전체 테스트 시작');
  console.log('='.repeat(50));
  
  // 테스트 결과 초기화
  testResults.length = 0;
  
  // 1. 환경 설정 테스트
  const envTest = testEnvironmentConfig();
  if (!envTest) {
    console.log('\n❌ 환경 설정이 올바르지 않습니다. 테스트를 중단합니다.');
    return testResults;
  }
  
  // 2. 연결 테스트
  const connectionTest = await testSupabaseConnection();
  if (!connectionTest) {
    console.log('\n❌ Supabase 연결에 실패했습니다. 네트워크 및 설정을 확인하세요.');
    return testResults;
  }
  
  // 3. 인증 상태 테스트
  await testAuthenticationStatus();
  
  // 4. 데이터베이스 스키마 테스트
  await testDatabaseSchema();
  
  // 5. CRUD 테스트
  await testBasicCRUD();
  
  // 6. Real-time 테스트
  await testRealtimeFeatures();
  
  // 7. 스토리지 테스트
  await testStorageFeatures();
  
  // 테스트 결과 요약
  console.log('\n📋 테스트 결과 요약');
  console.log('='.repeat(50));
  
  const successCount = testResults.filter(r => r.success).length;
  const totalCount = testResults.length;
  
  console.log(`✅ 성공: ${successCount}개`);
  console.log(`❌ 실패: ${totalCount - successCount}개`);
  console.log(`📊 성공률: ${((successCount / totalCount) * 100).toFixed(1)}%`);
  
  // 실패한 테스트만 표시
  const failedTests = testResults.filter(r => !r.success);
  if (failedTests.length > 0) {
    console.log('\n❌ 실패한 테스트:');
    failedTests.forEach(test => {
      console.log(`  - ${test.testName}: ${test.error}`);
    });
  }
  
  return testResults;
};

// 9. 특정 기능별 테스트 실행
export const runAuthTests = async () => {
  console.log('🔐 인증 관련 테스트만 실행');
  testResults.length = 0;
  
  testEnvironmentConfig();
  await testSupabaseConnection();
  await testAuthenticationStatus();
  
  return testResults.filter(r => r.testName.includes('인증') || r.testName.includes('세션'));
};

export const runDatabaseTests = async () => {
  console.log('📊 데이터베이스 관련 테스트만 실행');
  testResults.length = 0;
  
  await testSupabaseConnection();
  await testDatabaseSchema();
  await testBasicCRUD();
  
  return testResults.filter(r => 
    r.testName.includes('데이터베이스') || 
    r.testName.includes('테이블') || 
    r.testName.includes('CRUD')
  );
};

// 10. 브라우저 콘솔에서 사용할 수 있도록 window 객체에 추가
if (typeof window !== 'undefined') {
  (window as any).supabaseTest = {
    runAllTests: runAllSupabaseTests,
    runAuthTests,
    runDatabaseTests,
    testEnvironment: testEnvironmentConfig,
    testConnection: testSupabaseConnection,
    testAuth: testAuthenticationStatus,
    testSchema: testDatabaseSchema,
    testCRUD: testBasicCRUD,
    testRealtime: testRealtimeFeatures,
    testStorage: testStorageFeatures,
    getResults: () => testResults
  };
}