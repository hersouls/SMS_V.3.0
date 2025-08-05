import React, { 
  memo, 
  useMemo, 
  useCallback, 
  startTransition,
  Profiler,
  ProfilerOnRenderCallback 
} from 'react';

/**
 * 렌더링 성능 측정을 위한 프로파일러 래퍼
 */
interface PerformanceProfilerProps {
  id: string;
  children: React.ReactNode;
  onRender?: ProfilerOnRenderCallback;
  logToConsole?: boolean;
}

export const PerformanceProfiler: React.FC<PerformanceProfilerProps> = ({
  id,
  children,
  onRender,
  logToConsole = false
}) => {
  const handleRender: ProfilerOnRenderCallback = useCallback((
    profileId,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
    interactions
  ) => {
    if (logToConsole) {
      console.log(`🔍 [Performance] ${profileId} (${phase}):`, {
        actualDuration: `${actualDuration.toFixed(2)}ms`,
        baseDuration: `${baseDuration.toFixed(2)}ms`,
        startTime: `${startTime.toFixed(2)}ms`,
        commitTime: `${commitTime.toFixed(2)}ms`,
        interactions: interactions.size
      });
    }
    
    onRender?.(profileId, phase, actualDuration, baseDuration, startTime, commitTime, interactions);
  }, [onRender, logToConsole]);

  return (
    <Profiler id={id} onRender={handleRender}>
      {children}
    </Profiler>
  );
};

/**
 * 컴포넌트를 React.memo로 래핑하고 성능 프로파일링을 추가하는 HOC
 */
export function withPerformanceOptimization<P extends object>(
  Component: React.ComponentType<P>,
  compareProps?: (prevProps: P, nextProps: P) => boolean,
  profileId?: string
) {
  const MemoizedComponent = memo(Component, compareProps);
  
  const WrappedComponent: React.FC<P> = (props) => {
    const shouldProfile = process.env.NODE_ENV === 'development' && profileId;
    
    if (shouldProfile) {
      return (
        <PerformanceProfiler id={profileId} logToConsole>
          <MemoizedComponent {...props} />
        </PerformanceProfiler>
      );
    }
    
    return <MemoizedComponent {...props} />;
  };
  
  WrappedComponent.displayName = `withPerformanceOptimization(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * 무거운 계산을 startTransition으로 래핑하는 훅
 */
export function useTransition<T>(
  calculation: () => T,
  deps: React.DependencyList,
  fallback?: T
): [T | undefined, boolean] {
  const [result, setResult] = React.useState<T | undefined>(fallback);
  const [isPending, setIsPending] = React.useState(false);

  React.useEffect(() => {
    setIsPending(true);
    
    startTransition(() => {
      const newResult = calculation();
      setResult(newResult);
      setIsPending(false);
    });
  }, deps);

  return [result, isPending];
}

/**
 * 컴포넌트의 렌더링 횟수를 추적하는 훅 (개발 환경용)
 */
export function useRenderCount(componentName: string) {
  const renderCount = React.useRef(0);
  
  React.useEffect(() => {
    renderCount.current += 1;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 [Render Count] ${componentName}: ${renderCount.current}`);
    }
  });
  
  return renderCount.current;
}

/**
 * 메모리 사용량을 모니터링하는 훅 (개발 환경용)
 */
export function useMemoryMonitor(interval: number = 5000) {
  const [memoryInfo, setMemoryInfo] = React.useState<{
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null>(null);

  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    const checkMemory = () => {
      if ('memory' in performance) {
        // @ts-ignore - Chrome specific API
        const memory = performance.memory;
        setMemoryInfo({
          usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1024 / 1024),
          jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
        });
      }
    };

    checkMemory();
    const intervalId = setInterval(checkMemory, interval);

    return () => clearInterval(intervalId);
  }, [interval]);

  return memoryInfo;
}

/**
 * 번들 크기 분석을 위한 동적 import 래퍼
 */
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
): React.LazyExoticComponent<T> {
  const LazyComponent = React.lazy(async () => {
    const start = performance.now();
    
    try {
      const module = await importFunc();
      const end = performance.now();
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚡ [Lazy Load] Component loaded in ${(end - start).toFixed(2)}ms`);
      }
      
      return module;
    } catch (error) {
      console.error('🚨 [Lazy Load] Failed to load component:', error);
      
      if (fallback) {
        return { default: fallback };
      }
      
      throw error;
    }
  });

  return LazyComponent;
}

/**
 * 이미지 preload 유틸리티
 */
export function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map(url => 
      new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = url;
      })
    )
  );
}

/**
 * 리소스 사전 로딩 훅
 */
export function usePreloadResources(resources: string[]) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [loadedCount, setLoadedCount] = React.useState(0);

  React.useEffect(() => {
    if (resources.length === 0) {
      setIsLoaded(true);
      return;
    }

    let loadedItems = 0;

    const loadResource = (url: string) => {
      return new Promise<void>((resolve) => {
        if (url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
          // 이미지 preload
          const img = new Image();
          img.onload = img.onerror = () => {
            loadedItems++;
            setLoadedCount(loadedItems);
            resolve();
          };
          img.src = url;
        } else {
          // 기타 리소스 preload (CSS, JS 등)
          const link = document.createElement('link');
          link.rel = 'preload';
          link.href = url;
          link.as = url.endsWith('.css') ? 'style' : 'script';
          link.onload = link.onerror = () => {
            loadedItems++;
            setLoadedCount(loadedItems);
            resolve();
          };
          document.head.appendChild(link);
        }
      });
    };

    Promise.all(resources.map(loadResource)).then(() => {
      setIsLoaded(true);
    });
  }, [resources]);

  return {
    isLoaded,
    loadedCount,
    totalCount: resources.length,
    progress: resources.length > 0 ? (loadedCount / resources.length) * 100 : 100
  };
}