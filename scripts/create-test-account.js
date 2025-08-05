import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function createTestAccount() {
  try {
    const email = process.env.VITE_TEST_USER_EMAIL;
    const password = process.env.VITE_TEST_USER_PASSWORD;

    if (!email || !password) {
      console.error('❌ 테스트 계정 정보가 .env 파일에 없습니다.');
      process.exit(1);
    }

    console.log('🔐 테스트 계정 생성 중...');
    console.log('이메일:', email);

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 사용자 프로필 업데이트
    await updateProfile(user, {
      displayName: '테스트 사용자'
    });

    console.log('✅ 테스트 계정 생성 성공!');
    console.log('UID:', user.uid);
    console.log('이메일:', user.email);
    console.log('이름:', user.displayName);
    
    console.log('\n이제 generate-sample-data.js 스크립트를 실행할 수 있습니다.');
    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('✅ 테스트 계정이 이미 존재합니다.');
      console.log('generate-sample-data.js 스크립트를 바로 실행할 수 있습니다.');
      process.exit(0);
    } else {
      console.error('❌ 오류 발생:', error.message);
      process.exit(1);
    }
  }
}

console.log('🌊 Moonwave 테스트 계정 생성기');
console.log('================================\n');

createTestAccount();