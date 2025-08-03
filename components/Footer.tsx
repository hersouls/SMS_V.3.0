
import { useApp } from '../App';
import { GlassCard } from './GlassCard';
import { Heart, Sparkles, Moon } from 'lucide-react';

export function Footer() {
  const { user, isAuthenticated } = useApp();

  return (
    <footer className="px-token-md pb-token-lg" role="contentinfo" aria-label="페이지 하단 정보">
      <div className="max-w-7xl mx-auto">
        <GlassCard variant="light" className="p-token-lg relative overflow-hidden group">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <div className="absolute top-2 left-4 w-2 h-2 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full animate-pulse"></div>
            <div className="absolute bottom-4 right-6 w-1 h-1 bg-gradient-to-r from-warning-400 to-error-400 rounded-full animate-bounce"></div>
            <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-gradient-to-r from-success-400 to-info-400 rounded-full animate-ping"></div>
          </div>

          {/* Main Content */}
          <div className="relative z-10">
            <div className="flex flex-col items-center space-y-token-sm">
              {/* Logo and Brand */}
              <div className="flex items-center space-x-token-xs mb-token-sm">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg">
                  <Moon size={14} className="text-white-force icon-enhanced" strokeWidth={2} />
                </div>
                <span className="text-white-force text-high-contrast font-medium text-sm-ko tracking-ko-normal">Moonwave</span>
              </div>

              {/* Copyright Text */}
              <div className="text-center">
                <p className="text-white-force text-high-contrast text-sm-ko break-keep-ko leading-relaxed tracking-ko-normal">
                  © 2024 Moonwave 구독 관리 •{' '}
                  <span className="text-white-force text-high-contrast font-medium">
                    {user?.name || user?.email?.split('@')[0] || '사용자'}
                  </span>
                  님의 구독 공간
                </p>
              </div>

              {/* About Us and Terms Links */}
              <div className="flex items-center justify-center space-x-token-md mt-token-sm">
                <a 
                  href="/about" 
                  className="text-white-force text-high-contrast text-sm-ko hover:text-primary-400 transition-colors duration-300 tracking-ko-normal underline decoration-primary-400/50 hover:decoration-primary-400"
                >
                  About Moonwave
                </a>
                <span className="text-white-force text-high-contrast text-sm-ko">•</span>
                <a 
                  href="/terms" 
                  className="text-white-force text-high-contrast text-sm-ko hover:text-primary-400 transition-colors duration-300 tracking-ko-normal underline decoration-primary-400/50 hover:decoration-primary-400"
                >
                  Terms of Service
                </a>
              </div>

              {/* Decorative Elements */}
              <div className="flex items-center space-x-token-xs mt-token-sm">
                <div className="flex items-center space-x-1 text-xs text-white-force text-high-contrast">
                  <Heart size={12} className="animate-pulse icon-enhanced" strokeWidth={1.5} />
                  <span className="tracking-ko-normal">Made with</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-white-force text-high-contrast">
                  <Sparkles size={12} className="animate-spin icon-enhanced" strokeWidth={1.5} />
                  <span className="tracking-ko-normal">Tailwind CSS Plus</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hover Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -skew-x-12"></div>
        </GlassCard>
      </div>
    </footer>
  );
} 