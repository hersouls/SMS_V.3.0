import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase 환경 변수
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// 환경 변수 확인
console.log('🔍 Firebase 환경 변수 확인:', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  hasStorageBucket: !!firebaseConfig.storageBucket,
  hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
  hasAppId: !!firebaseConfig.appId,
  isDevelopment: import.meta.env.DEV
});

// Firebase 앱 초기화 (환경 변수가 없어도 초기화 시도)
let firebaseApp;
let auth;
let db;
let storage;

try {
  // 환경 변수가 설정되지 않은 경우 에러 발생
  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
    console.warn('⚠️ Firebase 환경 변수가 설정되지 않았습니다. Supabase를 사용합니다.');
    console.warn('Firebase 설정이 필요한 경우 .env 파일에 Firebase 환경 변수를 추가하세요.');
    console.warn('예시:');
    console.warn('VITE_FIREBASE_API_KEY=your_api_key');
    console.warn('VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com');
    console.warn('VITE_FIREBASE_PROJECT_ID=your_project_id');
    
    // 더미 설정으로 초기화 (실제 사용하지 않음)
    firebaseConfig.apiKey = 'dummy-api-key';
    firebaseConfig.authDomain = 'dummy.firebaseapp.com';
    firebaseConfig.projectId = 'dummy-project';
  }

  // Firebase 앱 초기화
  firebaseApp = initializeApp(firebaseConfig);

  // Firebase 서비스 초기화
  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);
  storage = getStorage(firebaseApp);

  console.log('✅ Firebase 초기화 완료');
} catch (error) {
  console.error('❌ Firebase 초기화 실패:', error);
  
  // 더미 객체 생성 (에러 방지용)
  firebaseApp = null;
  auth = null;
  db = null;
  storage = null;
}

// 개발 환경에서 에뮬레이터 연결 (현재 비활성화)
if (import.meta.env.VITE_USE_EMULATOR === 'true' && db) {
  try {
    const { connectAuthEmulator } = await import('firebase/auth');
    const { connectStorageEmulator } = await import('firebase/storage');
    
    // Firestore 에뮬레이터 연결
    if (!db._settings?.host?.includes('localhost')) {
      connectFirestoreEmulator(db, 'localhost', 8080);
      console.log('🔧 Firestore 에뮬레이터에 연결됨');
    }
    
    // Auth 에뮬레이터 연결
    if (!auth.config.emulator && import.meta.env.VITE_USE_AUTH_EMULATOR !== 'false') {
      connectAuthEmulator(auth, 'http://localhost:9099');
      console.log('🔧 Auth 에뮬레이터에 연결됨');
    }
    
    // Storage 에뮬레이터 연결
    if (!storage._host?.includes('localhost') && import.meta.env.VITE_USE_STORAGE_EMULATOR !== 'false') {
      connectStorageEmulator(storage, 'localhost', 9199);
      console.log('🔧 Storage 에뮬레이터에 연결됨');
    }
  } catch (error) {
    console.warn('⚠️ 에뮬레이터 연결 실패:', error);
  }
}

// Firebase 연결 확인 함수
export const checkFirebaseConnection = async () => {
  try {
    if (!db) {
      console.log('ℹ️ Firebase가 설정되지 않았습니다.');
      return { connected: false, error: 'Firebase not configured' };
    }

    console.log('🔍 Firebase 연결 확인 중...');
    
    // Firestore 연결 테스트 - 더 안전한 방법으로 변경
    try {
      // 간단한 쿼리로 연결 테스트
      const testQuery = db.collection('_test_connection').limit(1);
      await testQuery.get();
      
      console.log('✅ Firebase 연결 성공');
      return { connected: true, error: null };
    } catch (firestoreError) {
      // 권한 오류는 연결은 되지만 권한이 없는 경우
      if (firestoreError.code === 'permission-denied') {
        console.log('✅ Firebase 연결됨 (권한 없음)');
        return { connected: true, error: 'Permission denied' };
      }
      
      // 다른 오류는 연결 실패로 간주
      console.error('❌ Firebase 연결 오류:', firestoreError);
      return { connected: false, error: firestoreError.message };
    }
  } catch (error) {
    console.error('❌ Firebase 연결 확인 중 오류:', error);
    return { connected: false, error: error.message };
  }
};

// 현재 도메인 확인 함수
export const getCurrentDomain = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return import.meta.env.VITE_APP_URL || 'https://sub.moonwave.kr';
};

// 허용된 도메인 목록
export const getAllowedOrigins = () => {
  const origins = import.meta.env.VITE_ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000,https://sub.moonwave.kr,https://www.sub.moonwave.kr';
  return origins.split(',').map(origin => origin.trim());
};

// 인증 상태 확인 함수
export const checkAuthStatus = async () => {
  try {
    if (!auth) {
      console.log('ℹ️ Firebase Auth가 설정되지 않았습니다.');
      return { isAuthenticated: false, user: null, error: 'Firebase Auth not configured' };
    }

    const user = auth.currentUser;
    
    if (!user) {
      console.log('ℹ️ 인증되지 않은 사용자');
      return { isAuthenticated: false, user: null, error: null };
    }
    
    console.log('✅ 인증된 사용자:', {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    });
    
    return { 
      isAuthenticated: true, 
      user: user, 
      error: null 
    };
  } catch (error) {
    console.error('❌ 인증 상태 확인 실패:', error);
    return { isAuthenticated: false, user: null, error: error.message };
  }
};

// Firebase 서비스 내보내기
export { firebaseApp, auth, db, storage }; 