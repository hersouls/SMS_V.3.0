import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ES 모듈에서 __dirname 사용
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 환경변수 로드
dotenv.config({ path: join(__dirname, '..', '.env') });

// Supabase 클라이언트 설정
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다.');
  console.error('VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY를 확인해주세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 테스트 계정 정보
const TEST_ACCOUNTS = [
  {
    email: 'test@moonwave.com',
    password: 'Test123!',
    name: '테스트 사용자'
  },
  {
    email: 'integration-test@moonwave.com',
    password: 'Test123!',
    name: '통합 테스트 사용자'
  },
  {
    email: 'api-test@moonwave.com',
    password: 'Test123!',
    name: 'API 테스트 사용자'
  }
];

async function createTestAccounts() {
  console.log('🧪 테스트 계정 생성을 시작합니다...\n');

  for (const account of TEST_ACCOUNTS) {
    try {
      console.log(`📝 ${account.email} 계정 생성 중...`);
      
      // 회원가입
      const { data, error } = await supabase.auth.signUp({
        email: account.email,
        password: account.password,
        options: {
          data: {
            name: account.name
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          console.log(`✅ ${account.email} - 이미 존재하는 계정입니다.`);
        } else {
          console.error(`❌ ${account.email} - 회원가입 실패:`, error.message);
        }
      } else {
        console.log(`✅ ${account.email} - 계정이 성공적으로 생성되었습니다.`);
      }

      // 이메일 인증 확인 (실제로는 수동으로 확인 필요)
      console.log(`📧 ${account.email} - 이메일 인증이 필요합니다.`);
      
    } catch (error) {
      console.error(`❌ ${account.email} - 오류 발생:`, error.message);
    }
  }

  console.log('\n🎉 테스트 계정 설정이 완료되었습니다!');
  console.log('\n📋 다음 단계:');
  console.log('1. 각 테스트 계정의 이메일을 확인하여 인증을 완료하세요.');
  console.log('2. 인증 완료 후 테스트를 실행하세요.');
  console.log('3. 테스트 실행: npm run test');
}

async function verifyTestAccounts() {
  console.log('🔍 테스트 계정 인증 상태를 확인합니다...\n');

  for (const account of TEST_ACCOUNTS) {
    try {
      console.log(`🔐 ${account.email} 로그인 테스트 중...`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password
      });

      if (error) {
        console.log(`❌ ${account.email} - 로그인 실패: ${error.message}`);
      } else {
        console.log(`✅ ${account.email} - 로그인 성공!`);
      }

    } catch (error) {
      console.error(`❌ ${account.email} - 확인 중 오류:`, error.message);
    }
  }
}

async function cleanupTestAccounts() {
  console.log('🧹 테스트 계정 정리를 시작합니다...\n');
  
  // 주의: 실제 운영 환경에서는 사용하지 마세요!
  console.log('⚠️  이 기능은 개발 환경에서만 사용하세요!');
  console.log('테스트 계정 삭제는 수동으로 진행하세요.');
}

// 메인 실행
async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'create':
      await createTestAccounts();
      break;
    case 'verify':
      await verifyTestAccounts();
      break;
    case 'cleanup':
      await cleanupTestAccounts();
      break;
    default:
      console.log('📖 사용법:');
      console.log('  node scripts/setup-test-accounts.js create   - 테스트 계정 생성');
      console.log('  node scripts/setup-test-accounts.js verify   - 테스트 계정 확인');
      console.log('  node scripts/setup-test-accounts.js cleanup  - 테스트 계정 정리');
      break;
  }
}

main().catch(console.error); 