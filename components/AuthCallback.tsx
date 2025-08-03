import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { WaveButton } from './WaveButton';
import { useAuth } from '../contexts/AuthContext';

export function AuthCallback() {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { confirmMagicLink, user: authUser } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 AuthCallback: Firebase Magic Link 콜백 처리 시작');
        
        const currentUrl = window.location.href;
        console.log('📋 AuthCallback: 현재 URL:', currentUrl);
        
        // Firebase Magic Link 확인
        if (currentUrl.includes('__firebase')) {
          console.log('✅ Firebase Magic Link 감지됨');
          
          try {
            const result = await confirmMagicLink(currentUrl);
            
            if (result.user) {
              console.log('✅ Magic Link 인증 성공:', result.user.email);
              setUser(result.user);
              setSuccess(true);
              
              // 2초 후 대시보드로 리다이렉트
              setTimeout(() => {
                navigate('/dashboard', { replace: true });
              }, 2000);
            } else {
              console.error('❌ Magic Link 처리 실패:', result.error);
              setError(result.error?.message || 'Magic Link 인증에 실패했습니다.');
            }
            
            setIsProcessing(false);
            return;
          } catch (magicLinkError) {
            console.error('❌ Magic Link 처리 실패:', magicLinkError);
            setError('Magic Link 인증에 실패했습니다. 다시 시도해주세요.');
            setIsProcessing(false);
            return;
          }
        }
        
        // 일반적인 콜백 URL 확인 (Google OAuth 등)
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        
        if (error) {
          console.error('❌ AuthCallback: OAuth 오류:', { error, errorDescription });
          setError(errorDescription || error || 'OAuth 인증에 실패했습니다.');
          setIsProcessing(false);
          return;
        }
        
        // 이미 인증된 사용자인지 확인
        if (authUser) {
          console.log('✅ 이미 인증된 사용자:', authUser.email);
          setUser(authUser);
          setSuccess(true);
          
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 1000);
          
          setIsProcessing(false);
          return;
        }
        
        // 유효한 인증 정보가 없는 경우
        console.log('ℹ️ AuthCallback: 유효한 인증 정보가 없음, 로그인 페이지로 이동');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 1000);
        
        setIsProcessing(false);
        
      } catch (err: any) {
        console.error('💥 AuthCallback: 예상치 못한 오류:', err);
        setError(err.message || '인증 처리 중 오류가 발생했습니다.');
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, [navigate, confirmMagicLink]);

  // 에러가 있으면 에러 화면 표시
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
        <GlassCard className="w-full max-w-md">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">
              인증 실패
            </h2>
            <div className="space-y-4 text-white/80">
              <p className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 text-red-200 text-sm">
                {error}
              </p>
              <p className="text-sm">
                다시 시도하거나 다른 방법으로 로그인해보세요.
              </p>
            </div>
            
            <div className="mt-8 space-y-3">
              <WaveButton
                onClick={() => navigate('/login', { replace: true })}
                className="w-full"
              >
                로그인 페이지로 돌아가기
              </WaveButton>
              
              <WaveButton
                onClick={() => navigate('/signup', { replace: true })}
                variant="outline"
                className="w-full"
              >
                회원가입하기
              </WaveButton>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  // 성공 화면
  if (success && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
        <GlassCard className="w-full max-w-md">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">
              로그인 성공! 🎉
            </h2>
            <div className="space-y-4 text-white/80">
              <p>
                안녕하세요, <strong>{user?.email}</strong>님!
              </p>
              <p className="text-sm">
                곧 대시보드로 이동합니다...
              </p>
              <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4">
                <p className="text-xs text-green-200">
                  ✨ Magic Link 인증이 성공적으로 완료되었습니다.
                </p>
              </div>
            </div>
            
            <div className="mt-8">
              <WaveButton
                onClick={() => navigate('/dashboard', { replace: true })}
                className="w-full"
              >
                대시보드로 바로 가기
              </WaveButton>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  // 처리 중이면 로딩 화면
  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
        <GlassCard className="w-full max-w-md">
          <div className="text-center">
            <Loader className="w-16 h-16 text-blue-400 mx-auto mb-6 animate-spin" />
            <h2 className="text-2xl font-bold text-white mb-4">
              인증 처리 중...
            </h2>
            <p className="text-white/80">
              잠시만 기다려주세요.
            </p>
          </div>
        </GlassCard>
      </div>
    );
  }

  // 인증 완료되면 대시보드로 리다이렉트
  if (authUser) {
    return <Navigate to="/dashboard" replace />;
  }

  // 기본적으로 로그인 페이지로 리다이렉트
  return <Navigate to="/login" replace />;
}