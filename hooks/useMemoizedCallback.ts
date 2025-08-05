import { useCallback, useRef } from 'react';

/**
 * 깊은 의존성 비교를 통한 메모이제이션 콜백 훅
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  const ref = useRef<{
    deps: React.DependencyList;
    callback: T;
  }>();

  // 깊은 비교 함수
  const deepEqual = (a: React.DependencyList, b: React.DependencyList): boolean => {
    if (a.length !== b.length) return false;
    
    for (let i = 0; i < a.length; i++) {
      if (typeof a[i] === 'object' && typeof b[i] === 'object') {
        if (JSON.stringify(a[i]) !== JSON.stringify(b[i])) return false;
      } else if (a[i] !== b[i]) {
        return false;
      }
    }
    
    return true;
  };

  if (!ref.current || !deepEqual(ref.current.deps, deps)) {
    ref.current = {
      deps: [...deps],
      callback
    };
  }

  return useCallback(ref.current.callback, [ref.current.callback]);
}

/**
 * 디바운스된 콜백 훅
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay, ...deps]
  );
}

/**
 * 스로틀된 콜백 훅
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList
): T {
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        callback(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          callback(...args);
        }, delay - (now - lastCallRef.current));
      }
    }) as T,
    [callback, delay, ...deps]
  );
}