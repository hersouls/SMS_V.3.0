import React, { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from './ui/utils';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number; // 뷰포트 밖에서 렌더링할 추가 아이템 수
  onScroll?: (scrollTop: number) => void;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan = 5,
  onScroll
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 보이는 아이템 범위 계산
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );

    return {
      start: Math.max(0, start - overscan),
      end: Math.min(items.length - 1, end + overscan)
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // 가상화된 아이템들
  const virtualItems = useMemo(() => {
    const result = [];
    
    for (let i = visibleRange.start; i <= visibleRange.end; i++) {
      result.push({
        index: i,
        item: items[i],
        offsetTop: i * itemHeight,
      });
    }
    
    return result;
  }, [items, visibleRange, itemHeight]);

  // 전체 높이
  const totalHeight = items.length * itemHeight;

  // 스크롤 핸들러
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setScrollTop(scrollTop);
    onScroll?.(scrollTop);
  };

  // 스크롤 위치 복원
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollTop;
    }
  }, []);

  return (
    <div
      ref={scrollRef}
      className={cn("overflow-auto", className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {virtualItems.map(({ index, item, offsetTop }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: offsetTop,
              left: 0,
              right: 0,
              height: itemHeight,
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// 사용 예제를 위한 간단한 리스트 아이템 컴포넌트
export const VirtualizedListItem = React.memo<{
  children: React.ReactNode;
  className?: string;
}>(({ children, className }) => (
  <div className={cn("flex items-center px-4 py-2 border-b border-white/10", className)}>
    {children}
  </div>
));