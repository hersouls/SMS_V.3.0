// 회원가입 테스트 스크립트
import { productionApiService } from './utils/api-production.js';

async function testSignup() {
  console.log('🧪 회원가입 테스트 시작...');
  
  const testEmail = `test.${Date.now()}@moonwave.test`;
  const testPassword = 'testpassword123';
  const testName = 'Test User';
  
  try {
    console.log('📧 테스트 이메일:', testEmail);
    console.log('🔒 테스트 비밀번호:', testPassword);
    console.log('👤 테스트 이름:', testName);
    
    const result = await productionApiService.signup(testEmail, testPassword, testName);
    
    console.log('✅ 회원가입 성공!');
    console.log('👤 사용자 ID:', result.user?.id);
    console.log('📧 사용자 이메일:', result.user?.email);
    console.log('🔑 세션 존재:', !!result.session);
    
    return {
      success: true,
      userId: result.user?.id,
      email: result.user?.email,
      hasSession: !!result.session
    };
    
  } catch (error) {
    console.error('❌ 회원가입 실패:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Node.js 환경에서만 실행
if (typeof window === 'undefined') {
  testSignup().then(result => {
    console.log('\n📊 테스트 결과:', result);
    process.exit(result.success ? 0 : 1);
  });
}

export { testSignup };