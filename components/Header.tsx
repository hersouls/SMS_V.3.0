import { Link, useLocation } from 'react-router-dom';
import { Icons } from './ui/heroicons';
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
                <Icons.Home size={20} className="icon-enhanced" />
              </WaveButton>
            </Link>
          </div>

          {/* Right: Notifications, Music, Statistics & Profile */}
          <div className="flex items-center space-x-token-xs">
            {/* Notifications */}
            <Link to="/notifications">
              <WaveButton
                variant={isNotifications ? "primary" : "ghost"}
                size="sm"
                ariaLabel={`알림 ${3}개의 읽지 않은 알림`}
                className="p-token-sm relative hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-smooth"
              >
                <Icons.Bell size={20} className="icon-enhanced" />
                {/* Notification Badge */}
                {3 > 0 && (
                  <div 
                    className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-400 rounded-full border-2 border-white/20 shadow-lg shadow-red-500/30 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <span className="text-white text-xs font-bold px-1">
                      {3 > 99 ? '99+' : 3}
                    </span>
                  </div>
                )}
              </WaveButton>
            </Link>

            {/* Music */}
            <Link to="/music">
              <WaveButton
                variant="ghost"
                size="sm"
                ariaLabel="음악 플레이어"
                className="p-token-sm hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-smooth"
              >
                <Icons.Music size={20} className="icon-enhanced" />
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
                <Icons.BarChart size={20} className="icon-enhanced" />
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
                <Icons.User size={20} className="icon-enhanced" />
              </WaveButton>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}