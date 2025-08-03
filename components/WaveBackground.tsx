
// 우주 배경 효과 - 별들과 함께
// 고해상도 최적화된 우주 테마 배경

export function WaveBackground() {
  return (
    <>
      {/* 우주 기본 배경 - 더 강한 검정색 */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      
      {/* 깊은 우주 그라데이션 - 더 어둡게 */}
      <div className="fixed inset-0 bg-gradient-to-t from-black/95 via-transparent to-gray-900/80" />
      
      {/* 은하수 효과 - 더 선명하게 */}
      <div className="fixed inset-0 opacity-40 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-300/15 to-transparent animate-pulse" 
             style={{ transform: 'rotate(-15deg) scale(1.5)' }} />
      </div>
      
      {/* 작은 별들 - 크기 30% 감소 */}
      <div className="fixed inset-0 opacity-95 pointer-events-none overflow-hidden">
        {Array.from({ length: 120 }).map((_, i) => {
          const size = (Math.random() * 4 + 2) * 0.7; // 30% 감소: 2-6px → 1.4-4.2px
          const colors = ['#ffffff', '#fbbf24', '#60a5fa', '#a855f7', '#f59e0b'];
          const color = colors[i % colors.length];
          
          return (
            <div
              key={`star-${i}`}
              className="absolute rounded-full"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: color,
                animation: `twinkle ${Math.random() * 4 + 2}s ease-in-out infinite ${Math.random() * 3}s`,
                boxShadow: `0 0 ${size * 6}px ${color}`, // 글로우 효과 증가
                filter: 'blur(0.2px)', // 블러 효과 감소
              }}
            />
          );
        })}
      </div>

      {/* 큰 별들 - 크기 30% 감소 */}
      <div className="fixed inset-0 opacity-98 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => { // 개수 증가
          const size = (Math.random() * 12 + 6) * 0.7; // 30% 감소: 6-18px → 4.2-12.6px
          const positions = [
            { left: '15%', top: '25%' },
            { left: '75%', top: '35%' },
            { left: '45%', top: '15%' },
            { left: '85%', top: '65%' },
            { left: '25%', top: '75%' },
            { left: '65%', top: '85%' },
            { left: '90%', top: '20%' },
            { left: '10%', top: '60%' },
            { left: '50%', top: '50%' },
            { left: '30%', top: '40%' },
            { left: '70%', top: '70%' },
            { left: '20%', top: '85%' },
            { left: '80%', top: '10%' },
            { left: '5%', top: '30%' },
            { left: '95%', top: '80%' },
            { left: '40%', top: '90%' },
            { left: '60%', top: '5%' },
            { left: '35%', top: '65%' },
            { left: '55%', top: '25%' },
            { left: '15%', top: '45%' },
          ];
          const pos = positions[i];
          const colors = ['#ffffff', '#fbbf24', '#60a5fa', '#f59e0b'];
          const color = colors[i % colors.length];
          
          return (
            <div
              key={`big-star-${i}`}
              className="absolute rounded-full"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: pos?.left || 0,
                top: pos?.top || 0,
                backgroundColor: color,
                animation: `twinkle ${Math.random() * 3 + 4}s ease-in-out infinite ${Math.random() * 2}s`,
                boxShadow: `0 0 ${size * 15}px ${color}`, // 글로우 효과 대폭 증가
                filter: 'blur(0.3px)', // 블러 효과 감소
              }}
            />
          );
        })}
      </div>

      {/* 성운 효과 - 더 밝고 선명하게 */}
      <div className="fixed inset-0 opacity-40 pointer-events-none overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => { // 개수 증가
          const size = Math.random() * 300 + 200; // 크기 증가
          const positions = [
            { left: '10%', top: '40%' },
            { left: '70%', top: '20%' },
            { left: '80%', top: '70%' },
            { left: '30%', top: '80%' },
            { left: '60%', top: '30%' },
            { left: '20%', top: '60%' },
          ];
          const pos = positions[i];
          const colors = ['#1e40af', '#5b21b6', '#0891b2', '#7c3aed', '#dc2626', '#059669'];
          const color = colors[i % colors.length];
          
          return (
            <div
              key={`nebula-${i}`}
              className="absolute rounded-full"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: pos?.left || 0,
                top: pos?.top || 0,
                background: `radial-gradient(circle, ${color}25 0%, ${color}15 30%, transparent 70%)`, // 투명도 증가
                animation: `nebula ${Math.random() * 10 + 15}s ease-in-out infinite ${Math.random() * 5}s`,
                filter: 'blur(20px)', // 블러 효과 감소
              }}
            />
          );
        })}
      </div>

      {/* 유성 효과 - 크기 30% 감소 */}
      <div className="fixed inset-0 opacity-90 pointer-events-none overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => { // 개수 증가
          const positions = [
            { left: '0%', top: '20%' },
            { left: '0%', top: '60%' },
            { left: '0%', top: '80%' },
            { left: '0%', top: '40%' },
            { left: '0%', top: '90%' },
            { left: '0%', top: '10%' },
            { left: '0%', top: '70%' },
            { left: '0%', top: '50%' },
          ];
          const pos = positions[i];
          
          return (
            <div
              key={`shooting-star-${i}`}
              className="absolute w-1 h-1 bg-white rounded-full" // 크기 30% 감소: w-1.5 h-1.5 → w-1 h-1
              style={{
                left: pos?.left || 0,
                top: pos?.top || 0,
                animation: `shooting-star ${Math.random() * 3 + 4}s linear infinite ${Math.random() * 5}s`,
                boxShadow: '0 0 20px #ffffff, 0 0 40px #ffffff', // 글로우 효과 증가
              }}
            />
          );
        })}
      </div>
      
      {/* 우주 먼지 효과 - 크기 30% 감소 */}
      <div className="fixed inset-0 opacity-30 pointer-events-none overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => { // 개수 증가
          const size = (Math.random() * 3 + 1.5) * 0.7; // 30% 감소: 1.5-4.5px → 1.05-3.15px
          
          return (
            <div
              key={`dust-${i}`}
              className="absolute rounded-full bg-gray-400" // 색상 변경
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 8 + 10}s ease-in-out infinite ${Math.random() * 5}s`,
                filter: 'blur(0.3px)', // 블러 효과 감소
              }}
            />
          );
        })}
      </div>
      
      {/* 추가 우주 그라데이션 레이어 - 더 선명하게 */}
      <div className="fixed inset-0 bg-gradient-to-br from-transparent via-blue-900/5 to-purple-900/5" />
      
      {/* 미묘한 우주 노이즈 텍스처 - 더 선명하게 */}
      <div 
        className="fixed inset-0 opacity-5 pointer-events-none mix-blend-overlay" // 투명도 증가
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' fill='%23${encodeURIComponent('ffffff')}'/%3E%3C/svg%3E")`,
        }}
      />
    </>
  );
}