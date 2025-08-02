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

console.log('🔍 Supabase 설정 확인:');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? '설정됨' : '설정되지 않음');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 실제 계정으로 로그인 테스트
async function testRealLogin() {
  console.log('\n🔐 실제 계정 로그인 테스트...');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'her_soul@naver.com',
      password: '27879876'
    });

    if (error) {
      console.error('❌ 로그인 실패:', error.message);
    } else {
      console.log('✅ 로그인 성공!');
      console.log('사용자 ID:', data.user?.id);
      console.log('세션:', data.session ? '유효' : '무효');
    }
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  }
}

// Supabase 연결 테스트
async function testConnection() {
  console.log('\n🔌 Supabase 연결 테스트...');
  
  try {
    const { data, error } = await supabase.from('subscriptions').select('count').limit(1);
    
    if (error) {
      console.error('❌ 연결 실패:', error.message);
    } else {
      console.log('✅ 연결 성공!');
    }
  } catch (error) {
    console.error('❌ 연결 오류:', error.message);
  }
}

// 메인 실행
async function main() {
  await testConnection();
  await testRealLogin();
}

main().catch(console.error); 