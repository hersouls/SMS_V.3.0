import { ReactNode } from 'react';
import { cn } from './ui/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'light' | 'default' | 'strong';
  withWaveEffect?: boolean;
  hoverable?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
  style?: React.CSSProperties;
}

export function GlassCard({
  children,
  className,
  variant = 'default',
  withWaveEffect = false,
  hoverable = false,
  onClick,
  ariaLabel,
  style
}: GlassCardProps) {
  const baseClasses = 'rounded-lg relative overflow-hidden transition-smooth transform-gpu will-change-transform touch-target';
  
  const variantClasses = {
    light: 'glass-light',
    default: 'glass-default',
    strong: 'glass-strong'
  };

  const hoverClasses = hoverable ? 
    'hover:bg-white/20 hover:border-white/40 hover:translate-y-[-2px] hover:shadow-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus-ring keyboard-navigation' : '';

  const waveClasses = withWaveEffect ? 'wave-pulse' : '';

  const combinedClasses = cn(
    baseClasses,
    variantClasses[variant],
    hoverClasses,
    waveClasses,
    className
  );

  return (
    <div 
      className={combinedClasses} 
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : -1}
      aria-label={ariaLabel}
      style={style}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {withWaveEffect && (
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            <defs>
              <linearGradient id={`wave-gradient-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <path
              d="M0,100 C50,80 150,120 200,100 C250,80 350,120 400,100 L400,200 L0,200 Z"
              fill={`url(#wave-gradient-${variant})`}
              className="wave-pulse"
            />
          </svg>
        </div>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}