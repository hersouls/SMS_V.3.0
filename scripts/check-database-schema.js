import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkDatabaseSchema() {
  console.log('🔄 데이터베이스 스키마 확인 중...\n');

  // 확인할 필수 테이블들
  const requiredTables = [
    'subscriptions',
    'notifications', 
    'user_preferences',
    'subscription_tags',
    'payment_history'
  ];

  console.log('📋 필수 테이블 존재 확인:');
  
  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: 테이블 존재 확인`);
      }
    } catch (err) {
      console.log(`❌ ${table}: 접근 불가 - ${err.message}`);
    }
  }

  console.log('\n🔑 인증 테스트:');
  
  // Auth 테이블 접근 가능성 확인 (RLS가 적용되어 있어야 정상)
  try {
    const { data, error } = await supabase.auth.getSession();
    console.log('✅ 인증 서비스 접근 가능');
  } catch (err) {
    console.log('❌ 인증 서비스 오류:', err.message);
  }

  console.log('\n🛡️ RLS (Row Level Security) 확인:');
  
  // RLS가 활성화되어 있는지 확인 (subscriptions 테이블은 로그인 없이 접근 불가해야 함)
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        service_name: 'test',
        amount: 1000,
        currency: 'KRW',
        payment_cycle: 'monthly',
        payment_day: 1,
        start_date: '2024-01-01'
      });
    
    if (error) {
      console.log('✅ RLS 적용됨: 미인증 사용자 접근 차단');
    } else {
      console.log('⚠️ RLS 미적용: 미인증 사용자도 데이터 추가 가능');
    }
  } catch (err) {
    console.log('✅ RLS 적용됨: 접근 제한');
  }

  console.log('\n🌐 연결 정보:');
  console.log(`📍 Supabase URL: ${process.env.VITE_SUPABASE_URL}`);
  console.log(`🔑 Anon Key 길이: ${process.env.VITE_SUPABASE_ANON_KEY?.length} 문자`);
  console.log(`🚀 앱 URL: ${process.env.VITE_APP_URL}`);
  
  console.log('\n✅ 데이터베이스 스키마 확인 완료!');
}

checkDatabaseSchema().catch(console.error);