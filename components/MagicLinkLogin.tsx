import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, LogIn, CheckCircle } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { WaveButton } from './WaveButton';
import { useAuth } from '../contexts/AuthContext';

export function MagicLinkLogin() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const { signInWithMagicLink, signInWithGoogle } = useAuth();

  const validateEmail = () => {
    if (!email || !email.includes('@')) {
      setError('올바른 이메일 주소를 입력해주세요.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);

    try {
      // Magic Link 방식으로 로그인
      const result = await signInWithMagicLink(email);
      
      if (result.success) {
        setEmailSent(true);
      } else {
        setError(result.error?.message || 'Magic Link 전송에 실패했습니다.');
      }
    } catch (err: any) {
      setError(err.message || 'Magic Link 전송에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsGoogleLoading(true);

    try {
      const result = await signInWithGoogle();
      if (result.user) {
        // Google 로그인 성공 시 리다이렉션 로직은 AuthContext에서 처리
      } else {
        setError(result.error?.message || 'Google 로그인에 실패했습니다.');
      }
    } catch (err: any) {
      setError(err.message || 'Google 로그인에 실패했습니다.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
        <GlassCard className="w-full max-w-md">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">
              이메일을 확인하세요! 📧
            </h2>
            <div className="space-y-4 text-white/80">
              <p>
                <strong>{email}</strong>으로<br />
                로그인 링크를 전송했습니다.
              </p>
              <p className="text-sm">
                이메일을 확인하고 링크를 클릭하면<br />
                자동으로 로그인됩니다.
              </p>
              <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4 mt-4">
                <p className="text-xs text-blue-200">
                  💡 <strong>팁:</strong> 이메일이 보이지 않으면 스팸 폴더를 확인해보세요.
                </p>
              </div>
            </div>
            
            <div className="mt-8 space-y-3">
              <WaveButton
                onClick={() => setEmailSent(false)}
                variant="outline"
                className="w-full"
              >
                다른 이메일로 시도
              </WaveButton>
              
              <Link 
                to="/signup" 
                className="block text-center text-white/60 hover:text-white text-sm transition-colors"
              >
                회원가입하기
              </Link>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <GlassCard className="w-full max-w-md">
        <div className="text-center mb-8">
          <LogIn className="w-12 h-12 text-white mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">로그인</h2>
          <p className="text-white/60">이메일로 간편하게 로그인하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3 text-red-200 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
              이메일
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                placeholder="your@email.com"
              />
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
            </div>
          </div>

          <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4">
            <p className="text-xs text-yellow-200">
              🔗 <strong>Magic Link 방식:</strong> 비밀번호 없이 이메일로 전송되는 링크를 통해 안전하게 로그인할 수 있습니다.
            </p>
          </div>

          <WaveButton
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                이메일 전송 중...
              </div>
            ) : (
              '로그인 링크 받기'
            )}
          </WaveButton>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-white/60">또는</span>
            </div>
          </div>

          <WaveButton
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full"
          >
            {isGoogleLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Google 연결 중...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google로 계속하기
              </div>
            )}
          </WaveButton>
        </form>

        <div className="mt-6 text-center">
          <p className="text-white/60 text-sm">
            계정이 없으신가요?{' '}
            <Link 
              to="/signup" 
              className="text-blue-300 hover:text-blue-200 font-medium transition-colors"
            >
              회원가입
            </Link>
          </p>
        </div>
      </GlassCard>
    </div>
  );
}