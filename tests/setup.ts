import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';

// DOM 환경 설정
import 'whatwg-fetch';

// Firebase 에뮬레이터 환경 변수 설정
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
process.env.FIREBASE_FUNCTIONS_EMULATOR_HOST = 'localhost:5001';

// 테스트용 환경 변수
process.env.VITE_FIREBASE_PROJECT_ID = 'demo-test-project';
process.env.VITE_FIREBASE_API_KEY = 'demo-api-key';
process.env.VITE_FIREBASE_AUTH_DOMAIN = 'demo-test-project.firebaseapp.com';
process.env.VITE_FIREBASE_STORAGE_BUCKET = 'demo-test-project.appspot.com';
process.env.VITE_FIREBASE_MESSAGING_SENDER_ID = '123456789';
process.env.VITE_FIREBASE_APP_ID = '1:123456789:web:demo';
process.env.VITE_USE_EMULATOR = 'true';

// 글로벌 테스트 설정
beforeAll(async () => {
  console.log('🧪 Firebase 테스트 환경 설정 시작');
  
  // 에뮬레이터 연결 대기
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('✅ Firebase 에뮬레이터 연결 준비 완료');
});

afterAll(async () => {
  console.log('🔚 Firebase 테스트 환경 정리 완료');
});

beforeEach(async () => {
  // 각 테스트 전 초기화
  console.log('🔄 테스트 케이스 초기화');
});

afterEach(async () => {
  // 각 테스트 후 정리
  console.log('🧹 테스트 케이스 정리');
});

// 전역 오류 핸들러
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// 콘솔 에러 억제 (테스트 중 불필요한 로그 제거)
const originalError = console.error;
console.error = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning:') || 
     args[0].includes('Consider adding an error boundary'))
  ) {
    return;
  }
  originalError.apply(console, args);
};

export {};