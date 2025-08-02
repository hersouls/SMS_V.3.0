import { useEffect, useRef } from 'react';

export function WaveBackground() {
  return (
    <>
      {/* Main gradient background - 최적화된 Moonwave 배경 */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-primary-950 to-gray-950" />
      
      {/* Secondary depth layer */}
      <div className="fixed inset-0 bg-gradient-to-t from-gray-950/95 via-transparent to-primary-950/30" />
      
      {/* Animated wave layers */}
      <div className="fixed inset-0 opacity-25 pointer-events-none overflow-hidden">
        {/* Primary Wave Layer */}
        <svg
          viewBox="0 0 1400 800"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="primaryWave" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--primary-400)" stopOpacity="0.4" />
              <stop offset="50%" stopColor="var(--primary-500)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--primary-600)" stopOpacity="0.2" />
            </linearGradient>
            <filter id="blur1">
              <feGaussianBlur stdDeviation="2" />
            </filter>
          </defs>
          <path
            d="M0,400 C200,300 400,500 700,400 C1000,300 1200,500 1400,400 L1400,800 L0,800 Z"
            fill="url(#primaryWave)"
            filter="url(#blur1)"
            className="wave-gentle"
            style={{
              transformOrigin: 'center',
              animationDelay: '0s'
            }}
          />
        </svg>
        
        {/* Secondary Wave Layer */}
        <svg
          viewBox="0 0 1400 800"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="secondaryWave" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--secondary-400)" stopOpacity="0.35" />
              <stop offset="50%" stopColor="var(--secondary-500)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--secondary-600)" stopOpacity="0.15" />
            </linearGradient>
            <filter id="blur2">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>
          <path
            d="M0,500 C300,400 500,600 800,500 C1100,400 1300,600 1400,500 L1400,800 L0,800 Z"
            fill="url(#secondaryWave)"
            filter="url(#blur2)"
            className="wave-gentle"
            style={{
              transformOrigin: 'center',
              animationDelay: '1.5s',
              animationDirection: 'reverse'
            }}
          />
        </svg>
        
        {/* Accent Wave Layer */}
        <svg
          viewBox="0 0 1400 800"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="accentWave" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--primary-300)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--secondary-300)" stopOpacity="0.1" />
            </linearGradient>
            <filter id="blur3">
              <feGaussianBlur stdDeviation="1.5" />
            </filter>
          </defs>
          <path
            d="M0,300 C250,200 450,400 750,300 C1050,200 1250,400 1400,300 L1400,800 L0,800 Z"
            fill="url(#accentWave)"
            filter="url(#blur3)"
            className="wave-pulse"
            style={{
              transformOrigin: 'center',
              animationDelay: '0.8s'
            }}
          />
        </svg>

        {/* Deep Current Layer */}
        <svg
          viewBox="0 0 1400 800"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="deepWave" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--gray-700)" stopOpacity="0.4" />
              <stop offset="50%" stopColor="var(--primary-800)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--gray-800)" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path
            d="M0,600 C350,500 700,700 1050,600 C1225,550 1300,650 1400,600 L1400,800 L0,800 Z"
            fill="url(#deepWave)"
            className="float"
            style={{
              transformOrigin: 'center',
              animationDelay: '2.5s'
            }}
          />
        </svg>
      </div>
      
      {/* Floating light particles */}
      <div className="fixed inset-0 opacity-12 pointer-events-none overflow-hidden">
        {Array.from({ length: 10 }).map((_, i) => {
          const size = Math.random() * 3 + 1;
          const colors = [
            'var(--primary-300)',
            'var(--secondary-300)',
            'var(--primary-400)',
            'var(--secondary-400)'
          ];
          const color = colors[i % colors.length];
          
          return (
            <div
              key={`particle-${i}`}
              className="absolute rounded-full blur-sm"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: color,
                animation: `float ${Math.random() * 4 + 6}s ease-in-out infinite ${Math.random() * 3}s`,
                boxShadow: `0 0 ${size * 4}px ${color}`,
              }}
            />
          );
        })}
      </div>

      {/* Larger floating orbs */}
      <div className="fixed inset-0 opacity-6 pointer-events-none overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => {
          const size = Math.random() * 20 + 15;
          const positions = [
            { left: '15%', top: '25%' },
            { left: '75%', top: '20%' },
            { left: '30%', top: '75%' },
            { left: '80%', top: '70%' },
          ];
          const pos = positions[i];
          const isSecondary = i % 2 === 1;
          
          return (
            <div
              key={`orb-${i}`}
              className="absolute rounded-full"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: pos.left,
                top: pos.top,
                background: `radial-gradient(circle, var(--${isSecondary ? 'secondary' : 'primary'}-400) 0%, transparent 70%)`,
                animation: `wave-pulse ${Math.random() * 3 + 8}s ease-in-out infinite ${Math.random() * 2}s`,
                filter: 'blur(8px)',
              }}
            />
          );
        })}
      </div>
      
      {/* Moonbeam effects */}
      <div className="fixed inset-0 opacity-8 pointer-events-none">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={`beam-${i}`}
            className="absolute"
            style={{
              width: '2px',
              height: '100%',
              left: `${25 + i * 25}%`,
              background: `linear-gradient(to bottom, var(--secondary-300), transparent)`,
              animation: `shimmer ${4 + i}s ease-in-out infinite ${i * 1.5}s`,
              transform: `rotate(${-8 + i * 4}deg)`,
            }}
          />
        ))}
      </div>
      
      {/* Subtle animated gradient overlay */}
      <div 
        className="fixed inset-0 opacity-4 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at top, var(--primary-400) 0%, transparent 50%),
            radial-gradient(ellipse at bottom, var(--secondary-400) 0%, transparent 50%)
          `,
          animation: 'wave-gentle 15s ease-in-out infinite alternate',
        }}
      />
      
      {/* Subtle noise texture */}
      <div 
        className="fixed inset-0 opacity-[0.015] pointer-events-none mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' fill='%23${encodeURIComponent('94a3b8')}'/%3E%3C/svg%3E")`,
        }}
      />
    </>
  );
}