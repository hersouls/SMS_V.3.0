import { SearchFilter } from './AdvancedSearch';
import { Search, Filter, Tag, DollarSign, Calendar } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { cn } from './ui/utils';

interface SearchSummaryProps {
  totalCount: number;
  filteredCount: number;
  filter: SearchFilter;
  className?: string;
}

export function SearchSummary({ totalCount, filteredCount, filter, className }: SearchSummaryProps) {
  const hasActiveFilters = 
    filter.query || 
    filter.status !== 'all' || 
    filter.category !== 'all' || 
    filter.paymentCycle !== 'all' || 
    filter.tags.length > 0 ||
    filter.priceRange.min > 0 ||
    filter.priceRange.max < 1000000;

  if (!hasActiveFilters) {
    return null;
  }

  const getFilterDescription = () => {
    const parts: string[] = [];
    
    if (filter.query) parts.push(`"${filter.query}" 검색`);
    if (filter.status !== 'all') parts.push(`${filter.status} 상태`);
    if (filter.category !== 'all') parts.push(`${filter.category} 카테고리`);
    if (filter.paymentCycle !== 'all') parts.push(`${filter.paymentCycle} 결제`);
    if (filter.tags.length > 0) parts.push(`${filter.tags.length}개 태그`);
    
    const priceRange = filter.priceRange;
    if (priceRange.min > 0 || priceRange.max < 1000000) {
      if (priceRange.min > 0 && priceRange.max < 1000000) {
        parts.push(`${priceRange.min.toLocaleString()}원 ~ ${priceRange.max.toLocaleString()}원`);
      } else if (priceRange.min > 0) {
        parts.push(`${priceRange.min.toLocaleString()}원 이상`);
      } else if (priceRange.max < 1000000) {
        parts.push(`${priceRange.max.toLocaleString()}원 이하`);
      }
    }
    
    return parts.join(' + ');
  };

  return (
    <GlassCard variant="light" className={cn("p-token-md", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-token-sm">
          <Search size={16} className="text-primary-400" />
          <div>
            <p className="text-white-force text-sm">
              <span className="font-semibold">{filteredCount}</span>개 결과 
              {totalCount !== filteredCount && (
                <span className="text-white/60"> (전체 {totalCount}개 중)</span>
              )}
            </p>
            <p className="text-white/60 text-xs">
              {getFilterDescription()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-token-xs">
          {filter.query && (
            <span className="px-token-xs py-1 text-xs bg-primary-500/20 text-primary-400 rounded">
              검색
            </span>
          )}
          {filter.status !== 'all' && (
            <span className="px-token-xs py-1 text-xs bg-green-500/20 text-green-400 rounded">
              {filter.status}
            </span>
          )}
          {filter.category !== 'all' && (
            <span className="px-token-xs py-1 text-xs bg-purple-500/20 text-purple-400 rounded">
              {filter.category}
            </span>
          )}
          {filter.paymentCycle !== 'all' && (
            <span className="px-token-xs py-1 text-xs bg-blue-500/20 text-blue-400 rounded">
              {filter.paymentCycle}
            </span>
          )}
          {filter.tags.length > 0 && (
            <span className="px-token-xs py-1 text-xs bg-orange-500/20 text-orange-400 rounded">
              {filter.tags.length}개 태그
            </span>
          )}
        </div>
      </div>
    </GlassCard>
  );
} 