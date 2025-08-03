import { useState, useCallback } from 'react';

interface LoadingState {
  [key: string]: boolean;
}

interface UseLoadingStateReturn {
  loading: LoadingState;
  isLoading: (key?: string) => boolean;
  setLoading: (key: string, value: boolean) => void;
  withLoading: <T>(key: string, asyncFunction: () => Promise<T>) => Promise<T>;
  clearLoading: () => void;
}

export const useLoadingState = (initialLoading: LoadingState = {}): UseLoadingStateReturn => {
  const [loading, setLoadingState] = useState<LoadingState>(initialLoading);

  // 특정 키의 로딩 상태 확인
  const isLoading = useCallback((key?: string): boolean => {
    if (!key) {
      return Object.values(loading).some(value => value);
    }
    return loading[key] || false;
  }, [loading]);

  // 특정 키의 로딩 상태 설정
  const setLoading = useCallback((key: string, value: boolean) => {
    setLoadingState(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // 비동기 함수를 로딩 상태와 함께 실행
  const withLoading = useCallback(async <T>(
    key: string, 
    asyncFunction: () => Promise<T>
  ): Promise<T> => {
    try {
      setLoading(key, true);
      console.log(`🔄 [${key}] 로딩 시작`);
      
      const result = await asyncFunction();
      
      console.log(`✅ [${key}] 로딩 완료`);
      return result;
    } catch (error) {
      console.error(`❌ [${key}] 로딩 실패:`, error);
      throw error;
    } finally {
      setLoading(key, false);
    }
  }, [setLoading]);

  // 모든 로딩 상태 초기화
  const clearLoading = useCallback(() => {
    setLoadingState({});
  }, []);

  return {
    loading,
    isLoading,
    setLoading,
    withLoading,
    clearLoading
  };
};