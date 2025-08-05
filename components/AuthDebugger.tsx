import React, { useEffect, useState } from 'react';
import { auth } from '../utils/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../App';

export function AuthDebugger() {
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [appContextUser, setAppContextUser] = useState<any>(null);
  const [authContextUser, setAuthContextUser] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const authContext = useAuth();
  const appContext = useApp();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`🔍 AuthDebugger: ${message}`);
  };

  useEffect(() => {
    // Firebase Auth 직접 구독
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      addLog(`Firebase Auth 상태 변경: ${user ? `로그인됨 (${user.email})` : '로그아웃됨'}`);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Auth Context 상태 추적
    setAuthContextUser(authContext.user);
    addLog(`Auth Context 상태: ${authContext.user ? `로그인됨 (${authContext.user.email})` : '로그아웃됨'}`);
  }, [authContext.user]);

  useEffect(() => {
    // App Context 상태 추적
    setAppContextUser(appContext.user);
    addLog(`App Context 상태: ${appContext.user ? `로그인됨 (${appContext.user.email})` : '로그아웃됨'}`);
  }, [appContext.user]);

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-black/80 backdrop-blur text-white p-4 rounded-lg shadow-lg z-50">
      <h3 className="text-sm font-bold mb-2">🔍 Auth 디버거</h3>
      
      <div className="space-y-2 text-xs">
        <div className="border-b border-white/20 pb-2">
          <div className="flex justify-between">
            <span>Firebase Auth:</span>
            <span className={firebaseUser ? 'text-green-400' : 'text-red-400'}>
              {firebaseUser ? firebaseUser.email : '없음'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Auth Context:</span>
            <span className={authContextUser ? 'text-green-400' : 'text-red-400'}>
              {authContextUser ? authContextUser.email : '없음'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>App Context:</span>
            <span className={appContextUser ? 'text-green-400' : 'text-red-400'}>
              {appContextUser ? appContextUser.email : '없음'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>App isAuthenticated:</span>
            <span className={appContext.isAuthenticated ? 'text-green-400' : 'text-red-400'}>
              {appContext.isAuthenticated ? 'true' : 'false'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>App isLoading:</span>
            <span className={appContext.isLoading ? 'text-yellow-400' : 'text-green-400'}>
              {appContext.isLoading ? 'true' : 'false'}
            </span>
          </div>
        </div>
        
        <div className="max-h-32 overflow-y-auto">
          <div className="text-xs opacity-70">로그:</div>
          {logs.slice(-5).map((log, i) => (
            <div key={i} className="text-xs opacity-80">{log}</div>
          ))}
        </div>
      </div>
      
      <div className="mt-2 space-x-2">
        <button
          onClick={() => window.location.reload()}
          className="text-xs bg-blue-500 px-2 py-1 rounded"
        >
          새로고침
        </button>
        <button
          onClick={() => setLogs([])}
          className="text-xs bg-gray-500 px-2 py-1 rounded"
        >
          로그 지우기
        </button>
      </div>
    </div>
  );
}