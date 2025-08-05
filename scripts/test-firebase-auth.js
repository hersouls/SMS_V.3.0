import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyBk1uQIH5pgz4nLjqZMqUVlwHlLa0LHhNw",
  authDomain: "sms-v3.firebaseapp.com",
  projectId: "sms-v3",
  storageBucket: "sms-v3.firebasestorage.app",
  messagingSenderId: "278884646788",
  appId: "1:278884646788:web:9f534ea0468581b16867d1",
  measurementId: "G-SKHLBRGJWS"
};

async function testFirebaseAuth() {
  try {
    console.log('🔥 Firebase Auth 테스트 시작...');
    
    // Firebase 초기화
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    
    console.log('✅ Firebase Auth 초기화 완료');
    
    // 테스트용 이메일/비밀번호
    const testEmail = `test-${Date.now()}@moonwave.kr`;
    const testPassword = 'testPassword123!';
    
    console.log('📧 테스트 계정 생성 중:', testEmail);
    
    // 1. 사용자 계정 생성 테스트
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    const user = userCredential.user;
    
    console.log('✅ 사용자 계정 생성 성공:', {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified
    });
    
    // 2. 로그아웃 테스트
    await signOut(auth);
    console.log('✅ 로그아웃 성공');
    
    // 3. 로그인 테스트
    const loginCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
    const loginUser = loginCredential.user;
    
    console.log('✅ 로그인 성공:', {
      uid: loginUser.uid,
      email: loginUser.email,
      emailVerified: loginUser.emailVerified
    });
    
    // 4. 최종 로그아웃
    await signOut(auth);
    console.log('✅ 최종 로그아웃 완료');
    
    console.log('🎉 Firebase Auth 테스트 완료!');
    
  } catch (error) {
    console.error('❌ Firebase Auth 테스트 실패:', error.code, error.message);
  }
}

// 스크립트 실행
testFirebaseAuth();