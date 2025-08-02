import { Link, useLocation } from 'react-router-dom';
import { Home, Bell, User, BarChart3 } from 'lucide-react';
import { WaveButton } from './WaveButton';


export function Header() {
  const location = useLocation();


  const isHome = location.pathname === '/dashboard';
  const isNotifications = location.pathname === '/notifications';
  const isStatistics = location.pathname === '/statistics';
  const isSettings = location.pathname === '/settings';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-token-md" role="banner" aria-label="페이지 상단 네비게이션">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Left: Home Button */}
          <div className="flex-shrink-0">
            <Link to="/dashboard">
              <WaveButton
                variant={isHome ? "primary" : "ghost"}
                size="sm"
                ariaLabel="홈으로 이동"
                className="p-token-sm hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-smooth"
              >
                <Home size={20} className="icon-enhanced" />
              </WaveButton>
            </Link>
          </div>

          {/* Right: Notifications, Statistics & Profile */}
          <div className="flex items-center space-x-token-xs">
            {/* Notifications */}
            <Link to="/notifications">
              <WaveButton
                variant={isNotifications ? "primary" : "ghost"}
                size="sm"
                ariaLabel="알림"
                className="p-token-sm relative hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-smooth"
              >
                <Bell size={20} className="icon-enhanced" />
                {/* Notification Badge */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full border-2 border-white/20 shadow-lg shadow-red-500/30"></div>
              </WaveButton>
            </Link>

            {/* Statistics */}
            <Link to="/statistics">
              <WaveButton
                variant={isStatistics ? "primary" : "ghost"}
                size="sm"
                ariaLabel="통계 대시보드"
                className="p-token-sm hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-smooth"
              >
                <BarChart3 size={20} className="icon-enhanced" />
              </WaveButton>
            </Link>

            {/* Profile */}
            <Link to="/settings">
              <WaveButton
                variant={isSettings ? "primary" : "ghost"}
                size="sm"
                ariaLabel="설정으로 이동"
                className="p-token-sm hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-smooth"
              >
                <User size={20} className="icon-enhanced" />
              </WaveButton>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}