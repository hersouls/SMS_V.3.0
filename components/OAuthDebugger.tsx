import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { WaveButton } from './WaveButton';
import { checkOAuthStatus, getGoogleOAuthConfig } from '../utils/oauth';

export function OAuthDebugger() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  const runDebug = () => {
    const status = checkOAuthStatus();
    const config = getGoogleOAuthConfig();
    
    setDebugInfo({
      status,
      config,
      environment: {
        VITE_GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID ? '설정됨' : '설정되지 않음',
        VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? '설정됨' : '설정되지 않음',
        VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? '설정됨' : '설정되지 않음',
      },
      currentUrl: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <WaveButton
          variant="secondary"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="opacity-50 hover:opacity-100"
        >
          🔧 OAuth 디버그
        </WaveButton>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <GlassCard variant="strong" className="w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white-force">Google OAuth 디버거</h2>
          <WaveButton
            variant="secondary"
            size="sm"
            onClick={() => setIsVisible(false)}
          >
            ✕
          </WaveButton>
        </div>

        <div className="space-y-4">
          <WaveButton
            variant="primary"
            onClick={runDebug}
            className="w-full"
          >
            🔍 OAuth 설정 확인
          </WaveButton>

          {debugInfo && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white-force mb-2">OAuth 상태</h3>
                <pre className="bg-black/20 p-3 rounded text-xs text-white-force overflow-x-auto">
                  {JSON.stringify(debugInfo.status, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white-force mb-2">OAuth 설정</h3>
                <pre className="bg-black/20 p-3 rounded text-xs text-white-force overflow-x-auto">
                  {JSON.stringify(debugInfo.config, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white-force mb-2">환경 변수</h3>
                <pre className="bg-black/20 p-3 rounded text-xs text-white-force overflow-x-auto">
                  {JSON.stringify(debugInfo.environment, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white-force mb-2">현재 URL</h3>
                <div className="bg-black/20 p-3 rounded text-xs text-white-force break-all">
                  {debugInfo.currentUrl}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white-force mb-2">문제 해결 가이드</h3>
                <div className="bg-yellow-500/20 p-3 rounded text-sm text-white-force">
                  <p className="mb-2"><strong>Google OAuth 오류 해결 방법:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Google Cloud Console에서 승인된 리다이렉트 URI 확인</li>
                    <li>Supabase Dashboard에서 Site URL과 Redirect URLs 설정</li>
                    <li>환경 변수 VITE_GOOGLE_CLIENT_ID 확인</li>
                    <li>브라우저 캐시 및 쿠키 삭제</li>
                    <li>애플리케이션 재시작</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
} 