import React, { useState, useEffect } from 'react';
import { checkFirebaseConnection, checkAuthStatus } from '../utils/firebase/config';
import { firebaseApp, auth, db } from '../utils/firebase/config';

interface FirebaseStatus {
  isConnected: boolean;
  isAuthenticated: boolean;
  error: string | null;
  lastChecked: Date | null;
  configStatus: {
    hasApiKey: boolean;
    hasAuthDomain: boolean;
    hasProjectId: boolean;
    hasApp: boolean;
    hasAuth: boolean;
    hasDb: boolean;
  };
}

const FirebaseDebugger: React.FC = () => {
  const [status, setStatus] = useState<FirebaseStatus>({
    isConnected: false,
    isAuthenticated: false,
    error: null,
    lastChecked: null,
    configStatus: {
      hasApiKey: false,
      hasAuthDomain: false,
      hasProjectId: false,
      hasApp: false,
      hasAuth: false,
      hasDb: false
    }
  });
  const [isVisible, setIsVisible] = useState(false);

  const checkStatus = async () => {
    try {
      console.log('🔍 Firebase 상태 확인 중...');
      
      // 설정 상태 확인
      const configStatus = {
        hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
        hasAuthDomain: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        hasProjectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
        hasApp: !!firebaseApp,
        hasAuth: !!auth,
        hasDb: !!db
      };
      
      const connectionResult = await checkFirebaseConnection();
      const authResult = await checkAuthStatus();
      
      setStatus({
        isConnected: connectionResult,
        isAuthenticated: authResult.isAuthenticated,
        error: null,
        lastChecked: new Date(),
        configStatus
      });
      
      console.log('✅ Firebase 상태 확인 완료:', {
        connected: connectionResult,
        authenticated: authResult.isAuthenticated,
        configStatus
      });
    } catch (error) {
      console.error('❌ Firebase 상태 확인 실패:', error);
      setStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        lastChecked: new Date()
      }));
    }
  };

  useEffect(() => {
    // 초기 상태 확인
    checkStatus();
    
    // 30초마다 상태 확인
    const interval = setInterval(checkStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-lg z-50"
        title="Firebase 디버거 열기"
      >
        🔥
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-80 z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Firebase 디버거</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span>연결 상태:</span>
          <span className={`px-2 py-1 rounded text-sm ${
            status.isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {status.isConnected ? '연결됨' : '연결 안됨'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span>인증 상태:</span>
          <span className={`px-2 py-1 rounded text-sm ${
            status.isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {status.isAuthenticated ? '인증됨' : '인증 안됨'}
          </span>
        </div>
        
        {/* 설정 상태 표시 */}
        <div className="border-t pt-2">
          <div className="text-xs font-semibold mb-1">설정 상태:</div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>API Key:</span>
              <span className={status.configStatus.hasApiKey ? 'text-green-600' : 'text-red-600'}>
                {status.configStatus.hasApiKey ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Auth Domain:</span>
              <span className={status.configStatus.hasAuthDomain ? 'text-green-600' : 'text-red-600'}>
                {status.configStatus.hasAuthDomain ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Project ID:</span>
              <span className={status.configStatus.hasProjectId ? 'text-green-600' : 'text-red-600'}>
                {status.configStatus.hasProjectId ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Firebase App:</span>
              <span className={status.configStatus.hasApp ? 'text-green-600' : 'text-red-600'}>
                {status.configStatus.hasApp ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Auth Service:</span>
              <span className={status.configStatus.hasAuth ? 'text-green-600' : 'text-red-600'}>
                {status.configStatus.hasAuth ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Database:</span>
              <span className={status.configStatus.hasDb ? 'text-green-600' : 'text-red-600'}>
                {status.configStatus.hasDb ? '✓' : '✗'}
              </span>
            </div>
          </div>
        </div>
        
        {status.error && (
          <div className="bg-red-100 border border-red-300 rounded p-2">
            <span className="text-red-800 text-sm">오류: {status.error}</span>
          </div>
        )}
        
        {status.lastChecked && (
          <div className="text-xs text-gray-500">
            마지막 확인: {status.lastChecked.toLocaleTimeString()}
          </div>
        )}
      </div>
      
      <div className="mt-3 space-y-2">
        <button
          onClick={checkStatus}
          className="w-full bg-blue-500 text-white py-2 px-3 rounded text-sm hover:bg-blue-600"
        >
          상태 다시 확인
        </button>
        
        <button
          onClick={() => {
            console.log('Firebase 환경 변수:', {
              VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY ? '설정됨' : '설정되지 않음',
              VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '설정됨' : '설정되지 않음',
              VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '설정됨' : '설정되지 않음'
            });
          }}
          className="w-full bg-gray-500 text-white py-2 px-3 rounded text-sm hover:bg-gray-600"
        >
          환경 변수 확인
        </button>
      </div>
    </div>
  );
};

export default FirebaseDebugger;