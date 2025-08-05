import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase 환경 변수 - 환경 변수가 없으면 하드코딩된 값 사용
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBk1uQIH5pgz4nLjqZMqUVlwHlLa0LHhNw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sms-v3.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sms-v3",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sms-v3.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "278884646788",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:278884646788:web:9f534ea0468581b16867d1",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-SKHLBRGJWS"
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
      return false;
    }

    console.log('🔍 Firebase 연결 확인 중...');
    
    // Firestore가 초기화되었는지 확인
    if (db && typeof db._settings !== 'undefined') {
      console.log('✅ Firebase Firestore 초기화 확인');
      return true;
    }
    
    // Auth 상태로 연결 확인
    if (auth && auth.currentUser) {
      console.log('✅ Firebase 연결 성공 (인증된 사용자)');
      return true;
    }
    
    console.log('⚠️ Firebase는 초기화되었지만 인증되지 않음');
    return true; // Firebase는 연결되었지만 인증이 필요
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