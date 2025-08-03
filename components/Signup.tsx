import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, UserPlus } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { WaveButton } from './WaveButton';
import { useAuth } from '../contexts/AuthContext';

export function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const navigate = useNavigate();
  const { signUp, signInWithGoogle } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return false;
    }
    if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUp(formData.email, formData.password);
      if (result.user) {
        // TODO: 사용자 프로필에 이름 추가하는 로직 필요
        navigate('/dashboard');
      } else {
        setError(result.error?.message || '회원가입에 실패했습니다.');
      }
    } catch (err: any) {
      setError(err.message || '회원가입에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    setIsGoogleLoading(true);

    try {
      const result = await signInWithGoogle();
      if (result.user) {
        navigate('/dashboard');
      } else {
        setError(result.error?.message || 'Google 회원가입에 실패했습니다.');
      }
    } catch (err: any) {
      setError(err.message || 'Google 회원가입에 실패했습니다.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" role="main" aria-label="회원가입 페이지">
      <div className="w-full max-w-md slide-up">
        <GlassCard variant="strong" className="p-8" withWaveEffect={true}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4 wave-pulse">🌊</div>
            <h1 className="text-3xl-ko font-medium text-white-force text-high-contrast mb-2 tracking-ko-normal break-keep-ko">
              Moonwave
            </h1>
            <p className="text-base-ko text-white-force text-high-contrast tracking-ko-normal break-keep-ko">
              새로운 계정을 만들어보세요
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <GlassCard variant="light" className="p-4 mb-6 border-red-500/50 bg-red-500/10">
              <div className="flex items-center space-x-2">
                <div className="text-red-400">⚠️</div>
                <p className="text-sm-ko text-white-force text-high-contrast tracking-ko-normal break-keep-ko">
                  {error}
                </p>
              </div>
            </GlassCard>
          )}

          {/* Google Signup Button */}
          <WaveButton
            type="button"
            variant="secondary"
            size="lg"
            className="w-full mb-6 hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-smooth"
            onClick={handleGoogleSignup}
            disabled={isGoogleLoading}
            ariaLabel="Google로 회원가입"
          >
            <div className="flex items-center justify-center space-x-3">
              <div className="w-5 h-5">
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>
              <span>{isGoogleLoading ? 'Google 회원가입 중...' : 'Google로 회원가입'}</span>
            </div>
          </WaveButton>

          {/* Divider */}
          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm-ko">
              <span className="bg-transparent px-2 text-white-force text-high-contrast tracking-ko-normal">
                또는
              </span>
            </div>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm-ko font-medium text-white-force text-high-contrast mb-2 tracking-ko-normal">
                이름
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-white-force icon-enhanced" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="
                    glass-light w-full pl-10 pr-4 py-3 rounded-lg 
                    text-base-ko text-white-force text-high-contrast placeholder-white/50 
                    tracking-ko-normal focus:outline-none focus:ring-2 
                    focus:ring-blue-500/50 focus:border-transparent
                    transition-smooth
                  "
                  placeholder="이름을 입력하세요"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm-ko font-medium text-white-force text-high-contrast mb-2 tracking-ko-normal">
                이메일
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-white-force icon-enhanced" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="
                    glass-light w-full pl-10 pr-4 py-3 rounded-lg 
                    text-base-ko text-white-force text-high-contrast placeholder-white/50 
                    tracking-ko-normal focus:outline-none focus:ring-2 
                    focus:ring-blue-500/50 focus:border-transparent
                    transition-smooth
                  "
                  placeholder="이메일을 입력하세요"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm-ko font-medium text-white-force text-high-contrast mb-2 tracking-ko-normal">
                비밀번호
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-white-force icon-enhanced" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="
                    glass-light w-full pl-10 pr-12 py-3 rounded-lg 
                    text-base-ko text-white-force text-high-contrast placeholder-white/50 
                    tracking-ko-normal focus:outline-none focus:ring-2 
                    focus:ring-blue-500/50 focus:border-transparent
                    transition-smooth
                  "
                  placeholder="비밀번호를 입력하세요"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-white-force icon-enhanced hover:text-white/60 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-white-force icon-enhanced hover:text-white/60 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm-ko font-medium text-white-force text-high-contrast mb-2 tracking-ko-normal">
                비밀번호 확인
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-white-force icon-enhanced" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="
                    glass-light w-full pl-10 pr-12 py-3 rounded-lg 
                    text-base-ko text-white-force text-high-contrast placeholder-white/50 
                    tracking-ko-normal focus:outline-none focus:ring-2 
                    focus:ring-blue-500/50 focus:border-transparent
                    transition-smooth
                  "
                  placeholder="비밀번호를 다시 입력하세요"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-white-force icon-enhanced hover:text-white/60 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-white-force icon-enhanced hover:text-white/60 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <WaveButton
              type="submit"
              variant="primary"
              size="lg"
              className="w-full hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-smooth"
              disabled={isLoading}
              ariaLabel="회원가입"
            >
              <div className="flex items-center justify-center space-x-2">
                <UserPlus size={20} />
                <span>{isLoading ? '회원가입 중...' : '회원가입'}</span>
              </div>
            </WaveButton>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-sm-ko text-white-force text-high-contrast tracking-ko-normal break-keep-ko">
              이미 계정이 있으신가요?{' '}
              <Link 
                to="/login" 
                className="text-white-force text-high-contrast font-medium transition-smooth hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50"
              >
                로그인
              </Link>
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}