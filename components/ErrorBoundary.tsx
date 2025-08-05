import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { WaveButton } from './WaveButton';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background dark flex items-center justify-center p-4" data-error-boundary>
          <div className="glass-default max-w-md w-full p-8 text-center space-y-6">
            <div className="flex justify-center">
              <AlertTriangle className="w-16 h-16 text-warning-500" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl-ko font-semibold text-white-force tracking-ko-normal">
                문제가 발생했습니다
              </h2>
              <p className="text-sm-ko text-white/70 tracking-ko-normal break-keep-ko">
                예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 홈으로 돌아가 보세요.
              </p>
            </div>

            {/* 개발 환경에서만 에러 정보 표시 */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left text-xs text-white/50 bg-black/20 p-3 rounded">
                <summary className="cursor-pointer mb-2">에러 세부정보</summary>
                <pre className="whitespace-pre-wrap">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3">
              <WaveButton
                onClick={this.handleRetry}
                variant="primary"
                className="flex-1"
                ariaLabel="다시 시도"
              >
                <RefreshCw size={16} className="mr-2" />
                다시 시도
              </WaveButton>
              
              <WaveButton
                onClick={this.handleGoHome}
                variant="outline"
                className="flex-1"
                ariaLabel="홈으로 가기"
              >
                <Home size={16} className="mr-2" />
                홈으로
              </WaveButton>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 함수형 래퍼 컴포넌트
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};