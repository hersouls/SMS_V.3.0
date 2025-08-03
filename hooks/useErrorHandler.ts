import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  handleAuthError, 
  handleFirestoreError, 
  handleGeneralError, 
  getErrorMessage, 
  getErrorSeverity, 
  isRetryableError, 
  logError,
  AppError 
} from '../utils/firebase/errors';

interface ErrorState {
  error: AppError | null;
  isRetryable: boolean;
  retryCount: number;
}

interface UseErrorHandlerReturn {
  error: AppError | null;
  isRetryable: boolean;
  retryCount: number;
  handleError: (error: any, context?: string, showToast?: boolean) => void;
  clearError: () => void;
  retry: (retryFunction: () => Promise<void>) => Promise<void>;
}

export const useErrorHandler = (userId?: string): UseErrorHandlerReturn => {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isRetryable: false,
    retryCount: 0
  });

  const handleError = useCallback((
    error: any, 
    context: string = 'Unknown', 
    showToast: boolean = true
  ) => {
    console.log('🚨 에러 핸들러 호출:', { error, context });

    // 에러 로깅
    logError(error, context, userId);

    let processedError: AppError;

    // 에러 타입에 따른 처리
    if (error?.code?.startsWith('auth/')) {
      processedError = handleAuthError(error);
    } else if (error?.code && ['permission-denied', 'not-found', 'unavailable'].includes(error.code)) {
      processedError = handleFirestoreError(error);
    } else if (error?.message?.includes('network')) {
      processedError = handleGeneralError(error, 'network');
    } else if (error?.message?.includes('timeout')) {
      processedError = handleGeneralError(error, 'timeout');
    } else {
      processedError = handleGeneralError(error, 'unknown');
    }

    const retryable = isRetryableError(error);

    setErrorState(prev => ({
      error: processedError,
      isRetryable: retryable,
      retryCount: retryable ? prev.retryCount : 0
    }));

    // 토스트 메시지 표시
    if (showToast) {
      const severity = getErrorSeverity(error);
      
      switch (severity) {
        case 'error':
          toast.error(processedError.userMessage, {
            description: retryable ? '잠시 후 다시 시도해주세요.' : undefined,
            duration: 5000
          });
          break;
        case 'warning':
          toast.warning(processedError.userMessage, {
            duration: 4000
          });
          break;
        case 'info':
          toast.info(processedError.userMessage, {
            duration: 3000
          });
          break;
      }
    }
  }, [userId]);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isRetryable: false,
      retryCount: 0
    });
  }, []);

  const retry = useCallback(async (retryFunction: () => Promise<void>) => {
    if (!errorState.isRetryable) {
      console.warn('🚨 재시도 불가능한 에러입니다.');
      return;
    }

    if (errorState.retryCount >= 3) {
      console.warn('🚨 최대 재시도 횟수를 초과했습니다.');
      toast.error('여러 번 시도했지만 실패했습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    try {
      console.log(`🔄 재시도 중... (${errorState.retryCount + 1}/3)`);
      
      setErrorState(prev => ({
        ...prev,
        retryCount: prev.retryCount + 1
      }));

      // 재시도 간격 (지수 백오프)
      const delay = Math.min(1000 * Math.pow(2, errorState.retryCount), 5000);
      await new Promise(resolve => setTimeout(resolve, delay));

      await retryFunction();
      
      // 성공 시 에러 상태 초기화
      clearError();
      toast.success('작업이 성공적으로 완료되었습니다.');
      
    } catch (retryError) {
      console.error('🚨 재시도 실패:', retryError);
      handleError(retryError, 'Retry', true);
    }
  }, [errorState.isRetryable, errorState.retryCount, handleError, clearError]);

  return {
    error: errorState.error,
    isRetryable: errorState.isRetryable,
    retryCount: errorState.retryCount,
    handleError,
    clearError,
    retry
  };
};