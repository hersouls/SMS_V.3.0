// 데이터베이스 스키마 확인 스크립트
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  console.error('VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY를 설정해주세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabaseSchema() {
  console.log('🔍 데이터베이스 스키마 확인 중...\n');

  try {
    // 1. 기본 테이블 존재 확인
    const tables = [
      'subscriptions',
      'notifications', 
      'payment_history',
      'subscription_categories',
      'user_preferences'
    ];

    console.log('📋 테이블 존재 확인:');
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: 존재함`);
        }
      } catch (err) {
        console.log(`❌ ${table}: 테이블이 존재하지 않음`);
      }
    }

    // 2. RLS 정책 확인
    console.log('\n🔒 RLS 정책 확인:');
    const { data: policies, error: policyError } = await supabase
      .rpc('get_rls_policies');
    
    if (policyError) {
      console.log('❌ RLS 정책 확인 실패:', policyError.message);
    } else {
      console.log('✅ RLS 정책이 설정되어 있습니다.');
    }

    // 3. 인증 테스트
    console.log('\n👤 인증 테스트:');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('❌ 인증 확인 실패:', authError.message);
    } else if (user) {
      console.log('✅ 인증된 사용자:', user.email);
    } else {
      console.log('ℹ️ 인증되지 않은 상태');
    }

    // 4. 권한 테스트
    console.log('\n🔐 권한 테스트:');
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('id')
        .limit(1);
      
      if (error) {
        console.log('❌ 구독 테이블 접근 실패:', error.message);
      } else {
        console.log('✅ 구독 테이블 접근 가능');
      }
    } catch (err) {
      console.log('❌ 권한 테스트 실패:', err.message);
    }

    console.log('\n✅ 데이터베이스 스키마 확인 완료');

  } catch (error) {
    console.error('❌ 데이터베이스 확인 중 오류 발생:', error);
  }
}

// RLS 정책 정보를 가져오는 함수 (Supabase에서 실행)
const rlsCheckQuery = `
CREATE OR REPLACE FUNCTION get_rls_policies()
RETURNS TABLE (
  table_name text,
  policy_name text,
  action text,
  definition text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname || '.' || tablename as table_name,
    policyname as policy_name,
    CASE 
      WHEN cmd = 'r' THEN 'SELECT'
      WHEN cmd = 'a' THEN 'INSERT'
      WHEN cmd = 'w' THEN 'UPDATE'
      WHEN cmd = 'd' THEN 'DELETE'
      ELSE 'ALL'
    END as action,
    pg_get_expr(qual, polrelid) as definition
  FROM pg_policy p
  JOIN pg_class c ON p.polrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'public'
  ORDER BY tablename, policyname;
END;
$$ LANGUAGE plpgsql;
`;

checkDatabaseSchema();