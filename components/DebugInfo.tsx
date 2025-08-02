import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { supabase } from '../utils/supabase/client';

export function DebugInfo() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isVisible, setIsVisible] = useState(true);
  const { user, isAuthenticated, isLoading } = useApp();

  useEffect(() => {
    const updateDebugInfo = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentPath = window.location.pathname;
        
        setDebugInfo({
          timestamp: new Date().toLocaleTimeString(),
          currentPath,
          isAuthenticated,
          isLoading,
          hasUser: !!user,
          userEmail: user?.email || 'N/A',
          hasSession: !!session,
          sessionExpired: session?.expires_at ? Date.now() / 1000 > session.expires_at : 'N/A'
        });
      } catch (error) {
        setDebugInfo(prev => ({ ...prev, error: error.message }));
      }
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 2000); // 2초마다 업데이트

    return () => clearInterval(interval);
  }, [user, isAuthenticated, isLoading]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed top-4 right-4 z-50 bg-red-500 text-white px-2 py-1 rounded text-xs"
      >
        디버그 표시
      </button>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/80 text-white p-3 rounded-lg text-xs max-w-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-yellow-400">디버그 정보</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-red-400 hover:text-red-300"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-1">
        <div>시간: {debugInfo.timestamp}</div>
        <div>경로: {debugInfo.currentPath}</div>
        <div>로딩중: {debugInfo.isLoading ? '✅' : '❌'}</div>
        <div>인증됨: {debugInfo.isAuthenticated ? '✅' : '❌'}</div>
        <div>사용자: {debugInfo.hasUser ? '✅' : '❌'}</div>
        <div>이메일: {debugInfo.userEmail}</div>
        <div>세션: {debugInfo.hasSession ? '✅' : '❌'}</div>
        <div>세션만료: {debugInfo.sessionExpired === 'N/A' ? 'N/A' : (debugInfo.sessionExpired ? '✅' : '❌')}</div>
        {debugInfo.error && <div className="text-red-400">오류: {debugInfo.error}</div>}
      </div>
    </div>
  );
}