import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  Clock, 
  DollarSign, 
  Calendar,
  Tag,
  Star,
  History,
  Settings,
  ChevronDown,
  ChevronUp,
  Check,
  Sliders
} from 'lucide-react';
import { WaveButton } from './WaveButton';
import { GlassCard } from './GlassCard';
import { cn } from './ui/utils';

export interface SearchFilter {
  query: string;
  status: 'all' | 'active' | 'paused' | 'cancelled';
  category: string;
  priceRange: { min: number; max: number };
  paymentCycle: 'all' | 'monthly' | 'yearly' | 'onetime';
  tags: string[];
  dateRange: { start: Date | null; end: Date | null };
  sortBy: 'recent' | 'name' | 'amount' | 'paymentDay' | 'category';
  sortOrder: 'asc' | 'desc';
}

interface AdvancedSearchProps {
  subscriptions: any[];
  onFilterChange: (filter: SearchFilter) => void;
  onSearchHistorySave?: (query: string) => void;
  className?: string;
}

export function AdvancedSearch({ 
  subscriptions, 
  onFilterChange, 
  onSearchHistorySave,
  className 
}: AdvancedSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [filter, setFilter] = useState<SearchFilter>({
    query: '',
    status: 'all',
    category: 'all',
    priceRange: { min: 0, max: 1000000 },
    paymentCycle: 'all',
    tags: [],
    dateRange: { start: null, end: null },
    sortBy: 'recent',
    sortOrder: 'desc'
  });

  // 검색 히스토리 로드
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // 검색 히스토리 저장
  const saveSearchHistory = (query: string) => {
    if (!query.trim()) return;
    
    const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    onSearchHistorySave?.(query);
  };

  // 필터 변경 핸들러
  const updateFilter = (updates: Partial<SearchFilter>) => {
    const newFilter = { ...filter, ...updates };
    setFilter(newFilter);
    onFilterChange(newFilter);
    
    // 검색어가 변경되면 히스토리에 저장
    if (updates.query !== undefined) {
      saveSearchHistory(updates.query);
    }
  };

  // 실시간 검색 (디바운싱)
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(filter.query);
    }, 300);

    return () => clearTimeout(timer);
  }, [filter.query]);

  useEffect(() => {
    updateFilter({ query: debouncedQuery });
  }, [debouncedQuery]);

  // 사용 가능한 카테고리 및 태그 추출
  const { categories, tags, priceRanges } = useMemo(() => {
    const categorySet = new Set<string>();
    const tagSet = new Set<string>();
    const prices: number[] = [];

    subscriptions.forEach(sub => {
      if (sub.category) categorySet.add(sub.category);
      if (sub.tags) sub.tags.forEach((tag: string) => tagSet.add(tag));
      
      const monthlyAmount = sub.paymentCycle === 'yearly' ? sub.amount / 12 : sub.amount;
      prices.push(monthlyAmount);
    });

    return {
      categories: Array.from(categorySet).sort(),
      tags: Array.from(tagSet).sort(),
      priceRanges: {
        min: Math.min(...prices),
        max: Math.max(...prices)
      }
    };
  }, [subscriptions]);

  // 가격 범위 옵션
  const priceRangeOptions = [
    { label: '전체', value: { min: 0, max: 1000000 } },
    { label: '1만원 미만', value: { min: 0, max: 10000 } },
    { label: '1-5만원', value: { min: 10000, max: 50000 } },
    { label: '5-10만원', value: { min: 50000, max: 100000 } },
    { label: '10만원 이상', value: { min: 100000, max: 1000000 } }
  ];

  return (
    <div className={cn("space-y-token-md", className)}>
      {/* 기본 검색 바 */}
      <div className="relative">
        <Search size={20} className="absolute left-token-sm top-1/2 -translate-y-1/2 text-white-force" />
        <input
          type="text"
          placeholder="구독명, 카테고리, 태그로 검색..."
          value={filter.query}
          onChange={(e) => updateFilter({ query: e.target.value })}
          onFocus={() => setShowHistory(true)}
          className="w-full pl-12 pr-12 py-token-sm bg-white/5 border border-white/10 rounded-lg text-white-force placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
        />
        
        {/* 검색어 지우기 버튼 */}
        {filter.query && (
          <button
            onClick={() => updateFilter({ query: '' })}
            className="absolute right-token-sm top-1/2 -translate-y-1/2 text-white-force hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        )}

        {/* 검색 히스토리 드롭다운 */}
        {showHistory && searchHistory.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg z-50">
            {searchHistory.map((query, index) => (
              <button
                key={index}
                onClick={() => {
                  updateFilter({ query });
                  setShowHistory(false);
                }}
                className="w-full px-token-sm py-token-xs text-left text-white-force hover:bg-white/20 flex items-center gap-token-xs"
              >
                <History size={14} />
                {query}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 고급 필터 토글 버튼 */}
      <div className="flex items-center justify-between">
        <WaveButton
          variant="secondary"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm"
        >
          <Sliders size={16} className="mr-token-xs" />
          고급 필터
          {isExpanded ? <ChevronUp size={16} className="ml-token-xs" /> : <ChevronDown size={16} className="ml-token-xs" />}
        </WaveButton>

        {/* 활성 필터 표시 */}
        <div className="flex items-center gap-token-xs">
          {filter.status !== 'all' && (
            <span className="px-token-xs py-1 text-xs bg-primary-500/20 text-primary-400 rounded">
              {filter.status}
            </span>
          )}
          {filter.category !== 'all' && (
            <span className="px-token-xs py-1 text-xs bg-purple-500/20 text-purple-400 rounded">
              {filter.category}
            </span>
          )}
          {filter.paymentCycle !== 'all' && (
            <span className="px-token-xs py-1 text-xs bg-green-500/20 text-green-400 rounded">
              {filter.paymentCycle}
            </span>
          )}
        </div>
      </div>

      {/* 고급 필터 패널 */}
      {isExpanded && (
        <GlassCard variant="light" className="p-token-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-token-lg">
            
            {/* 상태 필터 */}
            <div>
              <label className="block text-white-force text-sm font-medium mb-token-xs">
                상태
              </label>
              <select
                value={filter.status}
                onChange={(e) => updateFilter({ status: e.target.value as any })}
                className="w-full px-token-sm py-token-xs bg-white/5 border border-white/10 rounded text-white-force focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">전체</option>
                <option value="active">활성</option>
                <option value="paused">일시정지</option>
                <option value="cancelled">해지됨</option>
              </select>
            </div>

            {/* 카테고리 필터 */}
            <div>
              <label className="block text-white-force text-sm font-medium mb-token-xs">
                카테고리
              </label>
              <select
                value={filter.category}
                onChange={(e) => updateFilter({ category: e.target.value })}
                className="w-full px-token-sm py-token-xs bg-white/5 border border-white/10 rounded text-white-force focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">전체</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* 결제 주기 필터 */}
            <div>
              <label className="block text-white-force text-sm font-medium mb-token-xs">
                결제 주기
              </label>
              <select
                value={filter.paymentCycle}
                onChange={(e) => updateFilter({ paymentCycle: e.target.value as any })}
                className="w-full px-token-sm py-token-xs bg-white/5 border border-white/10 rounded text-white-force focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">전체</option>
                <option value="monthly">월간</option>
                <option value="yearly">연간</option>
                <option value="onetime">일회성</option>
              </select>
            </div>

            {/* 가격 범위 필터 */}
            <div>
              <label className="block text-white-force text-sm font-medium mb-token-xs">
                가격 범위
              </label>
              <select
                value={JSON.stringify(filter.priceRange)}
                onChange={(e) => updateFilter({ priceRange: JSON.parse(e.target.value) })}
                className="w-full px-token-sm py-token-xs bg-white/5 border border-white/10 rounded text-white-force focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {priceRangeOptions.map(option => (
                  <option key={option.label} value={JSON.stringify(option.value)}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 정렬 옵션 */}
            <div>
              <label className="block text-white-force text-sm font-medium mb-token-xs">
                정렬
              </label>
              <div className="flex gap-token-xs">
                <select
                  value={filter.sortBy}
                  onChange={(e) => updateFilter({ sortBy: e.target.value as any })}
                  className="flex-1 px-token-sm py-token-xs bg-white/5 border border-white/10 rounded text-white-force focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="recent">최신순</option>
                  <option value="name">이름순</option>
                  <option value="amount">가격순</option>
                  <option value="paymentDay">결제일순</option>
                  <option value="category">카테고리순</option>
                </select>
                <button
                  onClick={() => updateFilter({ sortOrder: filter.sortOrder === 'asc' ? 'desc' : 'asc' })}
                  className="px-token-sm py-token-xs bg-white/5 border border-white/10 rounded text-white-force hover:bg-white/10 transition-colors"
                >
                  {filter.sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </div>

            {/* 태그 필터 */}
            <div>
              <label className="block text-white-force text-sm font-medium mb-token-xs">
                태그
              </label>
              <div className="flex flex-wrap gap-token-xs">
                {tags.slice(0, 5).map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      const newTags = filter.tags.includes(tag)
                        ? filter.tags.filter(t => t !== tag)
                        : [...filter.tags, tag];
                      updateFilter({ tags: newTags });
                    }}
                    className={cn(
                      "px-token-xs py-1 text-xs rounded transition-colors",
                      filter.tags.includes(tag)
                        ? "bg-primary-500/20 text-primary-400 border border-primary-500/30"
                        : "bg-white/10 text-white/60 border border-white/20 hover:bg-white/20"
                    )}
                  >
                    {tag}
                  </button>
                ))}
                {tags.length > 5 && (
                  <span className="px-token-xs py-1 text-xs text-white/40">
                    +{tags.length - 5}개 더
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 필터 초기화 버튼 */}
          <div className="mt-token-lg pt-token-md border-t border-white/10">
            <WaveButton
              variant="ghost"
              onClick={() => {
                const resetFilter: SearchFilter = {
                  query: '',
                  status: 'all',
                  category: 'all',
                  priceRange: { min: 0, max: 1000000 },
                  paymentCycle: 'all',
                  tags: [],
                  dateRange: { start: null, end: null },
                  sortBy: 'recent',
                  sortOrder: 'desc'
                };
                setFilter(resetFilter);
                onFilterChange(resetFilter);
              }}
              className="text-sm text-white/60 hover:text-white"
            >
              <X size={16} className="mr-token-xs" />
              필터 초기화
            </WaveButton>
          </div>
        </GlassCard>
      )}
    </div>
  );
} 