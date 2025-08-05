import React from 'react';
import { AlertTriangle, RefreshCw, BarChart3, TrendingDown } from 'lucide-react';
import { WaveButton } from './WaveButton';
import { GlassCard } from './GlassCard';
import { StatisticsError } from '../types/statistics';

interface StatisticsErrorFallbackProps {
  error?: StatisticsError | Error | null;
  onRetry?: () => void;
  showDetails?: boolean;
  className?: string;
}

export function StatisticsErrorFallback({ 
  error, 
  onRetry, 
  showDetails = false,
  className = '' 
}: StatisticsErrorFallbackProps) {
  const isStatisticsError = error && 'code' in error;
  const errorCode = isStatisticsError ? (error as StatisticsError).code : 'UNKNOWN_ERROR';
  const errorMessage = error?.message || '통계 데이터를 불러올 수 없습니다';

  const getErrorIcon = () => {
    switch (errorCode) {
      case 'INVALID_SUBSCRIPTION_DATA':
      case 'VALIDATION_ERROR':
        return <AlertTriangle className="w-12 h-12 text-warning-500" />;
      case 'CALCULATION_ERROR':
        return <BarChart3 className="w-12 h-12 text-error-500" />;
      case 'NETWORK_ERROR':
        return <TrendingDown className="w-12 h-12 text-error-500" />;
      default:
        return <AlertTriangle className="w-12 h-12 text-error-500" />;
    }
  };

  const getErrorTitle = () => {
    switch (errorCode) {
      case 'INVALID_SUBSCRIPTION_DATA':
        return '구독 데이터 오류';
      case 'VALIDATION_ERROR':
        return '데이터 검증 오류';
      case 'CALCULATION_ERROR':
        return '통계 계산 오류';
      case 'NETWORK_ERROR':
        return '네트워크 연결 오류';
      default:
        return '통계 오류';
    }
  };

  const getErrorDescription = () => {
    switch (errorCode) {
      case 'INVALID_SUBSCRIPTION_DATA':
        return '일부 구독 데이터가 유효하지 않습니다. 구독 정보를 확인해 주세요.';
      case 'VALIDATION_ERROR':
        return '데이터 검증 과정에서 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.';
      case 'CALCULATION_ERROR':
        return '통계 계산 중 오류가 발생했습니다. 페이지를 새로고침해 주세요.';
      case 'NETWORK_ERROR':
        return '서버와의 연결에 문제가 있습니다. 인터넷 연결을 확인해 주세요.';
      default:
        return '예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
    }
  };

  return (
    <div className={`flex items-center justify-center p-6 ${className}`} data-error-fallback>
      <GlassCard className="max-w-lg w-full p-8 text-center space-y-6">
        <div className="flex justify-center">
          {getErrorIcon()}
        </div>
        
        <div className="space-y-3">
          <h3 className="text-xl-ko font-semibold text-white-force tracking-ko-normal">
            {getErrorTitle()}
          </h3>
          <p className="text-base-ko text-white/80 tracking-ko-normal break-keep-ko leading-relaxed">
            {getErrorDescription()}
          </p>
          
          {/* 기술적 오류 메시지 (개발 환경에서만) */}
          {showDetails && process.env.NODE_ENV === 'development' && (
            <details className="text-left text-sm text-white/60 bg-black/20 p-4 rounded-lg">
              <summary className="cursor-pointer mb-2 font-medium">기술적 세부사항</summary>
              <div className="space-y-2">
                <p><strong>오류 코드:</strong> {errorCode}</p>
                <p><strong>오류 메시지:</strong> {errorMessage}</p>
                {isStatisticsError && (error as StatisticsError).context && (
                  <div>
                    <strong>컨텍스트:</strong>
                    <pre className="mt-1 text-xs bg-black/30 p-2 rounded overflow-auto">
                      {JSON.stringify((error as StatisticsError).context, null, 2)}
                    </pre>
                  </div>
                )}
                {isStatisticsError && (
                  <p><strong>발생 시간:</strong> {new Date((error as StatisticsError).timestamp).toLocaleString('ko-KR')}</p>
                )}
              </div>
            </details>
          )}
        </div>

        <div className="flex gap-3">
          {onRetry && (
            <WaveButton
              onClick={onRetry}
              variant="primary"
              className="flex-1"
              ariaLabel="다시 시도"
            >
              <RefreshCw size={16} className="mr-2" />
              다시 시도
            </WaveButton>
          )}
          
          <WaveButton
            onClick={() => window.location.reload()}
            variant="outline"
            className="flex-1"
            ariaLabel="페이지 새로고침"
          >
            <BarChart3 size={16} className="mr-2" />
            새로고침
          </WaveButton>
        </div>

        {/* 도움말 링크 */}
        <div className="text-sm text-white/50">
          문제가 지속되면{' '}
          <button 
            className="underline hover:text-white/70 transition-colors"
            onClick={() => console.log('통계 오류 보고:', { errorCode, errorMessage, timestamp: new Date() })}
          >
            오류 보고
          </button>
          를 해주세요.
        </div>
      </GlassCard>
    </div>
  );
}

// 통계 데이터가 없을 때 표시하는 컴포넌트
export function StatisticsEmptyState({ onAddSubscription }: { onAddSubscription?: () => void }) {
  return (
    <div className="flex items-center justify-center p-6" data-empty-state>
      <GlassCard className="max-w-md w-full p-8 text-center space-y-6">
        <div className="flex justify-center">
          <BarChart3 className="w-16 h-16 text-white/40" />
        </div>
        
        <div className="space-y-3">
          <h3 className="text-xl-ko font-semibold text-white-force tracking-ko-normal">
            통계 데이터가 없습니다
          </h3>
          <p className="text-base-ko text-white/70 tracking-ko-normal break-keep-ko leading-relaxed">
            구독을 추가하면 다양한 통계와 분석을 확인할 수 있습니다.
          </p>
        </div>

        {onAddSubscription && (
          <WaveButton
            onClick={onAddSubscription}
            variant="primary"
            className="w-full"
            ariaLabel="첫 구독 추가하기"
          >
            <BarChart3 size={16} className="mr-2" />
            첫 구독 추가하기
          </WaveButton>
        )}

        <div className="text-sm text-white/50">
          구독을 추가하면 월별 지출, 카테고리별 분석, 결제 예정일 등의 통계를 확인할 수 있습니다.
        </div>
      </GlassCard>
    </div>
  );
}

// 통계 로딩 상태 컴포넌트
export function StatisticsLoadingState() {
  return (
    <div className="flex items-center justify-center p-6" data-loading-state>
      <GlassCard className="max-w-md w-full p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <BarChart3 className="w-12 h-12 text-primary-500 animate-pulse" />
            <div className="absolute inset-0 bg-primary-500/20 rounded-full animate-ping"></div>
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-lg-ko font-medium text-white-force tracking-ko-normal">
            통계 데이터 계산 중...
          </h3>
          <p className="text-sm-ko text-white/60 tracking-ko-normal">
            구독 데이터를 분석하고 있습니다.
          </p>
        </div>

        <div className="space-y-2">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-primary-500 rounded-full animate-pulse w-3/4"></div>
          </div>
          <div className="text-xs text-white/50">
            데이터 처리 중...
          </div>
        </div>
      </GlassCard>
    </div>
  );
}