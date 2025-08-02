import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Waves } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { useApp } from '../App';

export function AuthCallback() {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useApp();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 AuthCallback: OAuth 콜백 처리 시작');
        
        // URL에서 OAuth 결과 확인
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        
        console.log('📋 AuthCallback: URL 파라미터 확인:', {
          hasCode: !!code,
          error,
          errorDescription
        });

        if (error) {
          console.error('❌ AuthCallback: OAuth 오류:', { error, errorDescription });
          setError(errorDescription || error || 'OAuth 인증에 실패했습니다.');
          setIsProcessing(false);
          return;
        }

        if (code) {
          console.log('✅ AuthCallback: OAuth 코드 수신, 세션 교환 중...');
          
          // 코드를 세션으로 교환
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error('❌ AuthCallback: 세션 교환 실패:', exchangeError);
            setError('인증 처리 중 오류가 발생했습니다.');
            setIsProcessing(false);
            return;
          }

          console.log('🎉 AuthCallback: 세션 교환 성공:', {
            hasSession: !!data.session,
            hasUser: !!data.user
          });

          // 성공적으로 인증되면 대시보드로 이동
          // useApp의 onAuthStateChange가 자동으로 상태를 업데이트할 것임
          setIsProcessing(false);
          navigate('/dashboard', { replace: true });
        } else {
          // 코드가 없으면 에러
          console.error('❌ AuthCallback: OAuth 코드가 없음');
          setError('인증 코드를 받지 못했습니다.');
          setIsProcessing(false);
        }
      } catch (err) {
        console.error('💥 AuthCallback: 예상치 못한 오류:', err);
        setError('인증 처리 중 오류가 발생했습니다.');
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  // 에러가 있으면 로그인 페이지로 리다이렉트
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark">
        <div className="flex flex-col items-center space-y-6 text-center max-w-md mx-auto p-8">
          <div className="text-6xl">❌</div>
          <h1 className="text-2xl font-semibold text-white">인증 오류</h1>
          <p className="text-white/70">{error}</p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 처리 중이면 로딩 화면
  if (isProcessing || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark">
        <div className="flex flex-col items-center space-y-6">
          <Waves 
            size={64}
            className="text-primary-500 wave-pulse transform-gpu animate-spin"
            aria-label="인증 처리 중"
          />
          <div className="text-white/60 text-lg tracking-wide">
            Google 계정으로 로그인 중...
          </div>
        </div>
      </div>
    );
  }

  // 인증 완료되면 대시보드로 리다이렉트
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // 기본적으로 로그인 페이지로 리다이렉트
  return <Navigate to="/login" replace />;
}