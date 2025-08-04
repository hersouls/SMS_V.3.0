import React, { useState, useEffect } from 'react';
import { checkFirebaseConnection, checkAuthStatus } from '../utils/firebase/config';
import { db, auth } from '../utils/firebase/config';

interface DiagnosticResult {
  firebaseConfig: boolean;
  firebaseConnection: boolean;
  authStatus: boolean;
  userAuthenticated: boolean;
  errors: string[];
}

export const FirebaseDiagnostic: React.FC = () => {
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult>({
    firebaseConfig: false,
    firebaseConnection: false,
    authStatus: false,
    userAuthenticated: false,
    errors: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDiagnostic = async () => {
      const errors: string[] = [];
      
      // 1. Firebase 설정 확인
      const hasFirebaseConfig = !!(db && auth);
      if (!hasFirebaseConfig) {
        errors.push('Firebase 설정이 없습니다. .env 파일을 확인하세요.');
      }

      // 2. Firebase 연결 확인
      let firebaseConnected = false;
      if (hasFirebaseConfig) {
        try {
          const connectionResult = await checkFirebaseConnection();
          firebaseConnected = connectionResult.connected;
          if (!connectionResult.connected) {
            errors.push(`Firebase 연결 실패: ${connectionResult.error}`);
          }
        } catch (error) {
          errors.push(`Firebase 연결 확인 중 오류: ${error}`);
        }
      }

      // 3. 인증 상태 확인
      let authWorking = false;
      let userAuth = false;
      if (hasFirebaseConfig) {
        try {
          const authResult = await checkAuthStatus();
          authWorking = true;
          userAuth = authResult.isAuthenticated;
          if (!authResult.isAuthenticated && authResult.error) {
            errors.push(`인증 상태 확인 실패: ${authResult.error}`);
          }
        } catch (error) {
          errors.push(`인증 상태 확인 중 오류: ${error}`);
        }
      }

      setDiagnostic({
        firebaseConfig: hasFirebaseConfig,
        firebaseConnection: firebaseConnected,
        authStatus: authWorking,
        userAuthenticated: userAuth,
        errors
      });
      setLoading(false);
    };

    runDiagnostic();
  }, []);

  if (loading) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-blue-800">Firebase 진단 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Firebase 진단 결과</h3>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${diagnostic.firebaseConfig ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>Firebase 설정: {diagnostic.firebaseConfig ? '✅ 정상' : '❌ 문제'}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${diagnostic.firebaseConnection ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>Firebase 연결: {diagnostic.firebaseConnection ? '✅ 정상' : '❌ 문제'}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${diagnostic.authStatus ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>인증 시스템: {diagnostic.authStatus ? '✅ 정상' : '❌ 문제'}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${diagnostic.userAuthenticated ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
          <span>사용자 인증: {diagnostic.userAuthenticated ? '✅ 로그인됨' : '⚠️ 로그인 필요'}</span>
        </div>
      </div>

      {diagnostic.errors.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-semibold text-red-800 mb-2">발견된 문제들:</h4>
          <ul className="space-y-1">
            {diagnostic.errors.map((error, index) => (
              <li key={index} className="text-red-700 text-sm">• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {diagnostic.errors.length === 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">✅ 모든 Firebase 설정이 정상입니다!</p>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">문제 해결 방법:</h4>
        <ul className="space-y-1 text-sm text-blue-700">
          <li>• Firebase 콘솔에서 프로젝트 설정을 확인하세요</li>
          <li>• .env 파일의 Firebase 환경 변수를 확인하세요</li>
          <li>• 네트워크 연결을 확인하세요</li>
          <li>• 브라우저 콘솔에서 더 자세한 오류를 확인하세요</li>
        </ul>
      </div>
    </div>
  );
};