// Supabase 연결 및 저장 테스트 유틸리티
import { supabase, checkSupabaseConnection } from './supabase/client';

export interface TestResult {
  test: string;
  success: boolean;
  error?: string;
  data?: any;
  timestamp: string;
}

export class SupabaseTestSuite {
  private results: TestResult[] = [];

  private logResult(test: string, success: boolean, error?: string, data?: any) {
    const result: TestResult = {
      test,
      success,
      error,
      data,
      timestamp: new Date().toISOString()
    };
    this.results.push(result);
    console.log(`[${success ? 'PASS' : 'FAIL'}] ${test}`, result);
    return result;
  }

  // 1. 기본 연결 테스트
  async testConnection(): Promise<TestResult> {
    try {
      const isConnected = await checkSupabaseConnection();
      return this.logResult('Supabase 연결 테스트', isConnected);
    } catch (error: any) {
      return this.logResult('Supabase 연결 테스트', false, error.message);
    }
  }

  // 2. 환경 변수 확인
  async testEnvironment(): Promise<TestResult> {
    try {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!url || !key) {
        return this.logResult('환경 변수 테스트', false, '필수 환경 변수가 설정되지 않음');
      }
      
      return this.logResult('환경 변수 테스트', true, undefined, { 
        url: url.substring(0, 20) + '...', 
        keyLength: key.length 
      });
    } catch (error: any) {
      return this.logResult('환경 변수 테스트', false, error.message);
    }
  }

  // 3. 테이블 존재 확인
  async testTablesExist(): Promise<TestResult> {
    try {
      const tables = ['subscriptions', 'notifications', 'payment_history', 'subscription_categories', 'user_preferences'];
      const results: Record<string, boolean> = {};
      
      for (const table of tables) {
        try {
          const { error } = await supabase.from(table).select('*').limit(1);
          results[table] = !error;
        } catch {
          results[table] = false;
        }
      }
      
      const allExist = Object.values(results).every(exists => exists);
      return this.logResult('테이블 존재 확인', allExist, undefined, results);
    } catch (error: any) {
      return this.logResult('테이블 존재 확인', false, error.message);
    }
  }

  // 4. Auth 시스템 테스트
  async testAuthSystem(): Promise<TestResult> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data: { user } } = await supabase.auth.getUser();
      
      return this.logResult('Auth 시스템 테스트', true, undefined, {
        sessionExists: !!session,
        userExists: !!user,
        userId: user?.id
      });
    } catch (error: any) {
      return this.logResult('Auth 시스템 테스트', false, error.message);
    }
  }

  // 5. 회원가입 테스트 (실제 계정 생성)
  async testSignup(email: string, password: string, name?: string): Promise<TestResult> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (error) {
        return this.logResult('회원가입 테스트', false, error.message);
      }

      return this.logResult('회원가입 테스트', true, undefined, {
        userId: data.user?.id,
        email: data.user?.email,
        hasSession: !!data.session,
        emailConfirmed: data.user?.email_confirmed_at !== null
      });
    } catch (error: any) {
      return this.logResult('회원가입 테스트', false, error.message);
    }
  }

  // 6. 트리거 함수 테스트
  async testTriggers(): Promise<TestResult> {
    try {
      // 현재 사용자 ID 가져오기
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return this.logResult('트리거 함수 테스트', false, '로그인된 사용자 없음');
      }

      // user_preferences 테이블에 자동 생성된 레코드 확인
      const { data: preferences, error: prefError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // subscription_categories 테이블에 기본 카테고리 확인
      const { data: categories, error: catError } = await supabase
        .from('subscription_categories')
        .select('*')
        .eq('user_id', user.id);

      return this.logResult('트리거 함수 테스트', true, undefined, {
        userPreferences: !prefError && !!preferences,
        categoriesCount: categories?.length || 0,
        errors: { prefError, catError }
      });
    } catch (error: any) {
      return this.logResult('트리거 함수 테스트', false, error.message);
    }
  }

  // 7. RLS 정책 테스트
  async testRLSPolicies(): Promise<TestResult> {
    try {
      // 현재 사용자로 데이터 접근 테스트
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return this.logResult('RLS 정책 테스트', false, '로그인된 사용자 없음');
      }

      // 다양한 테이블에 접근 시도
      const tables = ['subscriptions', 'notifications', 'payment_history'];
      const results: Record<string, boolean> = {};

      for (const table of tables) {
        try {
          const { error } = await supabase.from(table).select('*').limit(1);
          results[table] = !error;
        } catch {
          results[table] = false;
        }
      }

      return this.logResult('RLS 정책 테스트', true, undefined, results);
    } catch (error: any) {
      return this.logResult('RLS 정책 테스트', false, error.message);
    }
  }

  // 8. 데이터 삽입 테스트
  async testDataInsertion(): Promise<TestResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return this.logResult('데이터 삽입 테스트', false, '로그인된 사용자 없음');
      }

      // 테스트 구독 데이터 삽입
      const testSubscription = {
        user_id: user.id,
        service_name: 'Test Service',
        amount: 9.99,
        currency: 'USD',
        payment_cycle: 'monthly',
        payment_day: 1,
        start_date: new Date().toISOString().split('T')[0],
        category: 'Entertainment'
      };

      const { data, error } = await supabase
        .from('subscriptions')
        .insert(testSubscription)
        .select()
        .single();

      if (error) {
        return this.logResult('데이터 삽입 테스트', false, error.message);
      }

      // 삽입된 데이터 삭제 (테스트 정리)
      await supabase.from('subscriptions').delete().eq('id', data.id);

      return this.logResult('데이터 삽입 테스트', true, undefined, { insertedId: data.id });
    } catch (error: any) {
      return this.logResult('데이터 삽입 테스트', false, error.message);
    }
  }

  // 전체 테스트 실행
  async runAllTests(testEmail?: string, testPassword?: string, testName?: string): Promise<TestResult[]> {
    console.log('🧪 Supabase 테스트 스위트 시작...');
    
    this.results = []; // 결과 초기화

    // 기본 테스트들
    await this.testEnvironment();
    await this.testConnection();
    await this.testTablesExist();
    await this.testAuthSystem();

    // 회원가입 테스트 (선택적)
    if (testEmail && testPassword) {
      await this.testSignup(testEmail, testPassword, testName);
      // 회원가입 후 추가 테스트
      await this.testTriggers();
      await this.testRLSPolicies();
      await this.testDataInsertion();
    }

    this.printSummary();
    return this.results;
  }

  // 테스트 결과 요약
  printSummary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.success).length;
    const failed = total - passed;

    console.log('\n📊 테스트 결과 요약:');
    console.log(`✅ 통과: ${passed}/${total}`);
    console.log(`❌ 실패: ${failed}/${total}`);
    console.log(`📈 성공률: ${((passed / total) * 100).toFixed(1)}%\n`);

    if (failed > 0) {
      console.log('❌ 실패한 테스트:');
      this.results
        .filter(r => !r.success)
        .forEach(r => console.log(`  - ${r.test}: ${r.error}`));
    }
  }

  // 결과 반환
  getResults(): TestResult[] {
    return this.results;
  }
}

// 간편 테스트 함수들
export const quickConnectTest = async (): Promise<boolean> => {
  const tester = new SupabaseTestSuite();
  const result = await tester.testConnection();
  return result.success;
};

export const quickSignupTest = async (email: string, password: string, name?: string): Promise<TestResult> => {
  const tester = new SupabaseTestSuite();
  return await tester.testSignup(email, password, name);
};