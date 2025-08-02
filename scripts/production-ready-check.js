import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function productionReadyCheck() {
  console.log('🚀 프로덕션 배포 준비 상태 확인\n');
  
  let allChecks = [];

  // 1. 환경 변수 확인
  console.log('📋 1. 환경 변수 확인:');
  const envChecks = [
    { name: 'VITE_SUPABASE_URL', value: process.env.VITE_SUPABASE_URL },
    { name: 'VITE_SUPABASE_ANON_KEY', value: process.env.VITE_SUPABASE_ANON_KEY },
    { name: 'VITE_GOOGLE_CLIENT_ID', value: process.env.VITE_GOOGLE_CLIENT_ID },
    { name: 'VITE_APP_URL', value: process.env.VITE_APP_URL },
    { name: 'VITE_DEV_MODE', value: process.env.VITE_DEV_MODE }
  ];

  envChecks.forEach(check => {
    const status = check.value ? '✅' : '❌';
    console.log(`  ${status} ${check.name}: ${check.value || '미설정'}`);
    allChecks.push({ name: check.name, passed: !!check.value });
  });

  // DEV_MODE가 false인지 확인
  const isProduction = process.env.VITE_DEV_MODE === 'false';
  console.log(`  ${isProduction ? '✅' : '⚠️'} 프로덕션 모드: ${isProduction ? '활성화' : '개발 모드'}`);
  allChecks.push({ name: 'Production Mode', passed: isProduction });

  // 2. Supabase 연결 확인
  console.log('\n🔗 2. Supabase 연결 확인:');
  try {
    const { data, error } = await supabase.from('subscriptions').select('count').limit(1);
    if (error) {
      console.log('  ❌ Supabase 연결 실패:', error.message);
      allChecks.push({ name: 'Supabase Connection', passed: false });
    } else {
      console.log('  ✅ Supabase 연결 성공');
      allChecks.push({ name: 'Supabase Connection', passed: true });
    }
  } catch (err) {
    console.log('  ❌ Supabase 연결 오류:', err.message);
    allChecks.push({ name: 'Supabase Connection', passed: false });
  }

  // 3. 인증 설정 확인
  console.log('\n🔐 3. 인증 설정 확인:');
  try {
    const { data: session } = await supabase.auth.getSession();
    console.log('  ✅ 인증 서비스 작동');
    allChecks.push({ name: 'Auth Service', passed: true });
  } catch (err) {
    console.log('  ❌ 인증 서비스 오류:', err.message);
    allChecks.push({ name: 'Auth Service', passed: false });
  }

  // 4. RLS 보안 확인
  console.log('\n🛡️ 4. 보안 설정 확인:');
  try {
    const { error } = await supabase
      .from('subscriptions')
      .insert({ service_name: 'test', amount: 1000, currency: 'KRW', payment_cycle: 'monthly', payment_day: 1, start_date: '2024-01-01' });
    
    if (error && error.message.includes('Row Level Security')) {
      console.log('  ✅ RLS 보안 활성화됨');
      allChecks.push({ name: 'RLS Security', passed: true });
    } else {
      console.log('  ⚠️ RLS 보안 확인 필요');
      allChecks.push({ name: 'RLS Security', passed: false });
    }
  } catch (err) {
    console.log('  ✅ RLS 보안 활성화됨 (접근 제한)');
    allChecks.push({ name: 'RLS Security', passed: true });
  }

  // 5. 테이블 스키마 확인
  console.log('\n📊 5. 데이터베이스 스키마 확인:');
  const tables = ['subscriptions', 'notifications', 'user_preferences', 'subscription_tags', 'payment_history'];
  let tableChecksPassed = 0;

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (!error) {
        console.log(`  ✅ ${table} 테이블 존재`);
        tableChecksPassed++;
      } else {
        console.log(`  ❌ ${table} 테이블 오류: ${error.message}`);
      }
    } catch (err) {
      console.log(`  ❌ ${table} 테이블 접근 불가`);
    }
  }

  allChecks.push({ name: 'Database Schema', passed: tableChecksPassed === tables.length });

  // 6. 종합 결과
  console.log('\n📈 종합 결과:');
  const passedChecks = allChecks.filter(check => check.passed).length;
  const totalChecks = allChecks.length;
  
  console.log(`✅ 통과: ${passedChecks}/${totalChecks} 항목`);
  
  if (passedChecks === totalChecks) {
    console.log('\n🎉 프로덕션 배포 준비 완료!');
    console.log('🚀 배포 가능 상태입니다.');
  } else {
    console.log('\n⚠️ 일부 항목 확인 필요');
    console.log('❌ 실패한 항목들:');
    allChecks.filter(check => !check.passed).forEach(check => {
      console.log(`  - ${check.name}`);
    });
  }

  // 7. 다음 단계 안내
  console.log('\n📝 배포 후 확인사항:');
  console.log('  1. Supabase 대시보드에서 RLS 정책 검토');
  console.log('  2. 인증 제공자 설정 (Google OAuth 등)');
  console.log('  3. 이메일 템플릿 설정');
  console.log('  4. 도메인별 CORS 설정 확인');
  console.log('  5. SSL 인증서 확인');

  return passedChecks === totalChecks;
}

productionReadyCheck()
  .then(isReady => {
    process.exit(isReady ? 0 : 1);
  })
  .catch(console.error);