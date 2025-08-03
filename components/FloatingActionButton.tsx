import { useState } from 'react';
import { Plus, CreditCard, Calendar, Settings, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { WaveButton } from './WaveButton';

export function FloatingActionButton() {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const actions = [
    {
      icon: CreditCard,
      label: '구독 추가',
      action: () => navigate('/subscriptions/new'),
      color: 'from-primary-500 to-primary-600'
    },
    {
      icon: Calendar,
      label: '캘린더 보기',
      action: () => navigate('/calendar'),
      color: 'from-secondary-500 to-secondary-600'
    },
    {
      icon: Settings,
      label: '설정',
      action: () => navigate('/settings'),
      color: 'from-success-500 to-success-600'
    }
  ];

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleActionClick = (actionFn: () => void) => {
    actionFn();
    setIsExpanded(false);
  };

  // Hide FAB on auth pages
  if (location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Action Menu */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 space-y-3 slide-up">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div
                key={action.label + '-' + index}
                className="flex items-center space-x-3"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                {/* Label */}
                <div className="glass-strong px-3 py-2 rounded-lg">
                  <span className="text-sm-ko font-medium text-white-force whitespace-nowrap tracking-ko-normal break-keep-ko">
                    {action.label}
                  </span>
                </div>
                
                {/* Action Button */}
                <button
                  onClick={() => handleActionClick(action.action)}
                  className={`
                    w-12 h-12 rounded-full bg-gradient-to-r ${action.color}
                    flex items-center justify-center text-white
                    shadow-lg hover:shadow-xl transform hover:scale-105
                    transition-all duration-200 transform-gpu
                    focus:outline-none focus:ring-2 focus:ring-white/50
                    hover:bg-white/30 active:scale-95 touch-target-sm
                    wave-button-glass-enhanced
                  `}
                  aria-label={action.label}
                >
                  <Icon size={20} className="icon-enhanced" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Main FAB */}
      <WaveButton
        onClick={toggleExpanded}
        variant="primary"
        className={`
          w-14 h-14 rounded-full p-0 shadow-xl hover:shadow-2xl
          transform transition-all duration-300 transform-gpu
          ${isExpanded ? 'rotate-45 scale-110' : 'hover:scale-105'}
          float hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50
          touch-target-lg wave-button-primary-enhanced
        `}
        ariaLabel={isExpanded ? '메뉴 닫기' : '메뉴 열기'}
      >
        {isExpanded ? (
          <X size={24} className="icon-enhanced" />
        ) : (
          <Plus size={24} className="icon-enhanced" />
        )}
      </WaveButton>

      {/* Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10 fade-in"
          onClick={() => setIsExpanded(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}