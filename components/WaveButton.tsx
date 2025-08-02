import { ReactNode, useState } from 'react';
import { cn } from './ui/utils';

interface WaveButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-pressed'?: boolean;
}

export function WaveButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className,
  ariaLabel,
  disabled = false,
  type = 'button',
  'aria-describedby': ariaDescribedby,
  'aria-expanded': ariaExpanded,
  'aria-pressed': ariaPressed
}: WaveButtonProps) {
  const [isClicked, setIsClicked] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const baseClasses = [
    'relative',
    'overflow-hidden',
    'rounded-lg',
    'border',
    'transition-all',
    'duration-300',
    'transform-gpu',
    'will-change-transform',
    'break-keep-ko',
    'font-medium',
    'active:scale-95',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'focus:ring-offset-background',
    'focus-ring',
    'keyboard-navigation',
    'touch-target',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'disabled:transform-none',
    'disabled:hover:scale-100',
    'backface-visibility-hidden',
    'wave-optimized',
    'hover:scale-105',
    'hover:shadow-xl',
    'active:scale-90',
    'focus:scale-105',
    'focus:shadow-2xl'
  ].join(' ');

  const variantClasses = {
    primary: [
      'bg-gradient-primary',
      'hover:from-primary-600',
      'hover:to-primary-700',
      'text-white-force',
      'text-high-contrast',
      'border-primary-500/30',
      'shadow-lg',
      'shadow-primary-500/20',
      'hover:shadow-xl',
      'hover:shadow-primary-500/30',
      'focus:ring-primary-400/50',
      'focus:ring-4',
      'glow-primary',
      'hover:border-primary-400/50',
      'active:from-primary-700',
      'active:to-primary-800',
      'active:shadow-2xl',
      'active:shadow-primary-500/40'
    ].join(' '),
    secondary: [
      'bg-gradient-secondary',
      'hover:from-secondary-600',
      'hover:to-secondary-700',
      'text-white-force',
      'text-high-contrast',
      'border-secondary-500/30',
      'shadow-lg',
      'shadow-secondary-500/20',
      'hover:shadow-xl',
      'hover:shadow-secondary-500/30',
      'focus:ring-secondary-400/50',
      'focus:ring-4',
      'glow-secondary',
      'hover:border-secondary-400/50',
      'active:from-secondary-700',
      'active:to-secondary-800',
      'active:shadow-2xl',
      'active:shadow-secondary-500/40'
    ].join(' '),
    success: [
      'bg-gradient-success',
      'hover:from-success-600',
      'hover:to-success-700',
      'text-white-force',
      'text-high-contrast',
      'border-success-500/30',
      'shadow-lg',
      'shadow-success-500/20',
      'hover:shadow-xl',
      'hover:shadow-success-500/30',
      'focus:ring-success-400/50',
      'focus:ring-4',
      'hover:border-success-400/50',
      'active:from-success-700',
      'active:to-success-800',
      'active:shadow-2xl',
      'active:shadow-success-500/40'
    ].join(' '),
    warning: [
      'bg-gradient-warning',
      'hover:from-warning-600',
      'hover:to-warning-700',
      'text-white-force',
      'text-high-contrast',
      'border-warning-500/30',
      'shadow-lg',
      'shadow-warning-500/20',
      'hover:shadow-xl',
      'hover:shadow-warning-500/30',
      'focus:ring-warning-400/50',
      'focus:ring-4',
      'hover:border-warning-400/50',
      'active:from-warning-700',
      'active:to-warning-800',
      'active:shadow-2xl',
      'active:shadow-warning-500/40'
    ].join(' '),
    error: [
      'bg-gradient-error',
      'hover:from-error-600',
      'hover:to-error-700',
      'text-white-force',
      'text-high-contrast',
      'border-error-500/30',
      'shadow-lg',
      'shadow-error-500/20',
      'hover:shadow-xl',
      'hover:shadow-error-500/30',
      'focus:ring-error-400/50',
      'focus:ring-4',
      'hover:border-error-400/50',
      'active:from-error-700',
      'active:to-error-800',
      'active:shadow-2xl',
      'active:shadow-error-500/40'
    ].join(' '),
    ghost: [
      'glass-default',
      'hover:glass-strong',
      'text-white-force',
      'text-high-contrast',
      'border-gray-600/30',
      'hover:border-gray-500/50',
      'focus:ring-primary-400/50',
      'focus:ring-4',
      'shadow-sm',
      'hover:shadow-lg',
      'hover:bg-white/20',
      'active:bg-white/30',
      'active:shadow-xl',
      'active:scale-95'
    ].join(' '),
    glass: [
      'bg-white/10',
      'backdrop-blur-md',
      'border',
      'border-white/20',
      'text-white-force',
      'text-high-contrast',
      'hover:bg-white/30',
      'hover:border-white/40',
      'hover:shadow-lg',
      'hover:shadow-white/20',
      'focus:ring-2',
      'focus:ring-white/50',
      'focus:ring-4',
      'focus:bg-white/40',
      'focus:border-white/60',
      'shadow-sm',
      'hover:shadow-md',
      'active:bg-white/50',
      'active:border-white/60',
      'active:shadow-xl',
      'active:shadow-white/30',
      'active:scale-90'
    ].join(' ')
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm-ko tracking-ko-normal min-h-[44px] min-w-[44px]',
    md: 'px-4 py-3 text-base-ko tracking-ko-normal min-h-[44px] min-w-[44px]',
    lg: 'px-6 py-4 text-lg-ko tracking-ko-normal min-h-[44px] min-w-[44px]'
  };

  const handleClick = () => {
    if (disabled) return;
    
    // 모션 감소 설정 확인
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!prefersReducedMotion) {
      setIsClicked(true);
      setIsPressed(true);
      
      setTimeout(() => {
        setIsClicked(false);
        setIsPressed(false);
      }, 400);
    }
    
    if (onClick) {
      onClick();
    }
  };

  const combinedClasses = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    isClicked ? 'wave-pulse scale-95' : '',
    'transition-smooth',
    'will-change-transform',
    className
  );

  return (
    <button
      type={type}
      className={combinedClasses}
      onClick={handleClick}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedby}
      aria-expanded={ariaExpanded}
      aria-pressed={ariaPressed}
      disabled={disabled}
      role="button"
      tabIndex={disabled ? -1 : 0}
    >
      {/* Wave Animation Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent wave-animation" />
      
      {/* Wave effect overlay for non-glass variants */}
      {variant !== 'glass' && (
        <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
          <svg viewBox="0 0 100 50" className="w-full h-full">
            <defs>
              <linearGradient id={`btn-wave-${variant}-${Math.random()}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.4)" />
                <stop offset="50%" stopColor="rgba(255, 255, 255, 0.2)" />
                <stop offset="100%" stopColor="rgba(255, 255, 255, 0.1)" />
              </linearGradient>
            </defs>
            <path
              d="M0,25 C20,15 40,35 60,25 C80,15 90,35 100,25 L100,50 L0,50 Z"
              fill={`url(#btn-wave-${variant}-${Math.random()})`}
              className={isClicked ? 'wave-pulse' : ''}
              style={{
                transformOrigin: 'center'
              }}
            />
          </svg>
        </div>
      )}

      {/* Shimmer effect for non-ghost and non-glass variants */}
      {variant !== 'ghost' && variant !== 'glass' && (
        <div className="absolute inset-0 opacity-0 hover:opacity-30 transition-opacity duration-300 pointer-events-none">
          <div className="w-full h-full shimmer" />
        </div>
      )}

      {/* Ripple Effect */}
      {isPressed && (
        <div className="absolute inset-0 bg-white/20 wave-ripple rounded-xl" />
      )}

      {/* Click ripple effect for non-glass variants */}
      {isClicked && variant !== 'glass' && (
        <div 
          className="absolute inset-0 pointer-events-none rounded-lg"
          style={{
            background: `radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)`,
            animation: 'fade-out 0.4s ease-out forwards'
          }}
        />
      )}
      
      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center gap-2 [&>svg]:icon-enhanced [&>svg]:w-5 [&>svg]:h-5">
        {children}
      </span>
    </button>
  );
}