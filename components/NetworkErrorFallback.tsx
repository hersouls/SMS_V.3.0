import React from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { WaveButton } from './WaveButton';
import { GlassCard } from './GlassCard';

interface NetworkErrorFallbackProps {
  error?: Error;
  onRetry?: () => void;
  isOnline?: boolean;
  className?: string;
}

export function NetworkErrorFallback({ 
  error, 
  onRetry, 
  isOnline = navigator.onLine,
  className = '' 
}: NetworkErrorFallbackProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className={`flex items-center justify-center p-4 ${className}`} data-error-fallback>
      <GlassCard className="max-w-md w-full p-6 text-center space-y-4">
        <div className="flex justify-center">
          {isOnline ? (
            <AlertCircle className="w-12 h-12 text-warning-500" />
          ) : (
            <WifiOff className="w-12 h-12 text-error-500" />
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg-ko font-semibold text-white-force tracking-ko-normal">
            {isOnline ? '연결 오류' : '인터넷 연결 없음'}
          </h3>
          <p className="text-sm-ko text-white/70 tracking-ko-normal break-keep-ko">
            {isOnline 
              ? '서버와의 연결에 문제가 있습니다. 잠시 후 다시 시도해 주세요.'
              : '인터넷 연결을 확인하고 다시 시도해 주세요.'
            }
          </p>
        </div>

        {/* 개발 환경에서만 에러 정보 표시 */}
        {process.env.NODE_ENV === 'development' && error && (
          <details className="text-left text-xs text-white/50 bg-black/20 p-3 rounded">
            <summary className="cursor-pointer mb-2">에러 정보</summary>
            <pre className="whitespace-pre-wrap text-xs">
              {error.toString()}
            </pre>
          </details>
        )}

        <div className="flex gap-3">
          <WaveButton
            onClick={handleRetry}
            variant="primary"
            className="flex-1"
            ariaLabel="다시 시도"
          >
            <RefreshCw size={16} className="mr-2" />
            다시 시도
          </WaveButton>
          
          {!isOnline && (
            <WaveButton
              onClick={() => window.location.href = '/'}
              variant="outline" 
              className="flex-1"
              ariaLabel="홈으로 가기"
            >
              <Wifi size={16} className="mr-2" />
              홈으로
            </WaveButton>
          )}
        </div>

        {/* 연결 상태 표시 */}
        <div className="flex items-center justify-center space-x-2 text-xs text-white/50">
          {isOnline ? (
            <>
              <Wifi size={14} className="text-success-500" />
              <span>온라인</span>
            </>
          ) : (
            <>
              <WifiOff size={14} className="text-error-500" />
              <span>오프라인</span>
            </>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

// 네트워크 상태를 감지하는 커스텀 훅
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}