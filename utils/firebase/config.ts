import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { collection, query, limit, getDocs } from 'firebase/firestore';

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
  hasAppId: !!firebaseConfig.appId
});

// Firebase 앱 초기화
let firebaseApp;
let auth;
let db;
let storage;

try {
  // 필수 환경 변수 검증
  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
    throw new Error('Firebase 환경 변수가 설정되지 않았습니다. .env 파일을 확인해주세요.');
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
  
  // 초기화 실패 시 null로 설정
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
      return false;
    }

    console.log('🔍 Firebase 연결 확인 중...');
    
    // Firestore 연결 테스트 - 실제 컬렉션에 접근
    const testCollection = collection(db, '_connection_test');
    const testQuery = query(testCollection, limit(1));
    
    try {
      await getDocs(testQuery);
      console.log('✅ Firebase 연결 성공');
      return true;
    } catch (firestoreError: any) {
      // 권한 오류는 연결은 되었지만 권한이 없는 경우
      if (firestoreError.code === 'permission-denied') {
        console.log('✅ Firebase 연결됨 (권한 필요)');
        return true;
      }
      throw firestoreError;
    }
  } catch (error) {
    console.error('❌ Firebase 연결 오류:', error);
    return false;
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
      return { isAuthenticated: false, user: null, error: null };
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
    return { isAuthenticated: false, user: null, error };
  }
};

// Firebase 서비스 내보내기
export { firebaseApp, auth, db, storage }; 