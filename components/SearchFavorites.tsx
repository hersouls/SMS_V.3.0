import { useState, useEffect } from 'react';
import { Star, Trash2, Plus, Search } from 'lucide-react';
import { WaveButton } from './WaveButton';
import { GlassCard } from './GlassCard';
import { cn } from './ui/utils';
import { SearchFilter } from './AdvancedSearch';

interface SearchFavorite {
  id: string;
  name: string;
  filter: SearchFilter;
  createdAt: Date;
  lastUsed: Date;
}

interface SearchFavoritesProps {
  onApplyFilter: (filter: SearchFilter) => void;
  className?: string;
}

export function SearchFavorites({ onApplyFilter, className }: SearchFavoritesProps) {
  const [favorites, setFavorites] = useState<SearchFavorite[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFavoriteName, setNewFavoriteName] = useState('');
  const [currentFilter, setCurrentFilter] = useState<SearchFilter | null>(null);

  // 즐겨찾기 로드
  useEffect(() => {
    const savedFavorites = localStorage.getItem('searchFavorites');
    if (savedFavorites) {
      const parsed = JSON.parse(savedFavorites);
      setFavorites(parsed.map((fav: any) => ({
        ...fav,
        createdAt: new Date(fav.createdAt),
        lastUsed: new Date(fav.lastUsed)
      })));
    }
  }, []);

  // 즐겨찾기 저장
  const saveFavorites = (newFavorites: SearchFavorite[]) => {
    setFavorites(newFavorites);
    localStorage.setItem('searchFavorites', JSON.stringify(newFavorites));
  };

  // 즐겨찾기 추가
  const addFavorite = (filter: SearchFilter) => {
    if (!newFavoriteName.trim()) return;

    const newFavorite: SearchFavorite = {
      id: Date.now().toString(),
      name: newFavoriteName.trim(),
      filter,
      createdAt: new Date(),
      lastUsed: new Date()
    };

    const updatedFavorites = [newFavorite, ...favorites];
    saveFavorites(updatedFavorites);
    setNewFavoriteName('');
    setShowAddForm(false);
  };

  // 즐겨찾기 삭제
  const removeFavorite = (id: string) => {
    const updatedFavorites = favorites.filter(fav => fav.id !== id);
    saveFavorites(updatedFavorites);
  };

  // 즐겨찾기 적용
  const applyFavorite = (favorite: SearchFavorite) => {
    const updatedFavorite = {
      ...favorite,
      lastUsed: new Date()
    };
    
    const updatedFavorites = favorites.map(fav => 
      fav.id === favorite.id ? updatedFavorite : fav
    );
    saveFavorites(updatedFavorites);
    
    onApplyFilter(favorite.filter);
  };

  // 즐겨찾기 이름 가져오기
  const getFavoriteName = (filter: SearchFilter): string => {
    const parts: string[] = [];
    
    if (filter.query) parts.push(`"${filter.query}"`);
    if (filter.status !== 'all') parts.push(filter.status);
    if (filter.category !== 'all') parts.push(filter.category);
    if (filter.paymentCycle !== 'all') parts.push(filter.paymentCycle);
    if (filter.tags.length > 0) parts.push(`${filter.tags.length}개 태그`);
    
    return parts.length > 0 ? parts.join(' + ') : '기본 필터';
  };

  return (
    <div className={cn("space-y-token-md", className)}>
      {/* 즐겨찾기 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-white-force font-semibold flex items-center gap-token-xs">
          <Star size={16} className="text-yellow-400" />
          즐겨찾기
        </h3>
        
        <WaveButton
          variant="ghost"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-sm"
        >
          <Plus size={14} className="mr-token-xs" />
          추가
        </WaveButton>
      </div>

      {/* 즐겨찾기 추가 폼 */}
      {showAddForm && (
        <GlassCard variant="light" className="p-token-md">
          <div className="space-y-token-sm">
            <input
              type="text"
              placeholder="즐겨찾기 이름을 입력하세요"
              value={newFavoriteName}
              onChange={(e) => setNewFavoriteName(e.target.value)}
              className="w-full px-token-sm py-token-xs bg-white/5 border border-white/10 rounded text-white-force focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <div className="flex gap-token-xs">
              <WaveButton
                variant="primary"
                size="sm"
                onClick={() => currentFilter && addFavorite(currentFilter)}
                disabled={!newFavoriteName.trim() || !currentFilter}
              >
                저장
              </WaveButton>
              <WaveButton
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                취소
              </WaveButton>
            </div>
          </div>
        </GlassCard>
      )}

      {/* 즐겨찾기 목록 */}
      {favorites.length > 0 ? (
        <div className="space-y-token-xs">
          {favorites.map(favorite => (
            <GlassCard
              key={favorite.id}
              variant="light"
              className="p-token-sm hover:bg-white/10 transition-colors cursor-pointer group"
              onClick={() => applyFavorite(favorite)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-token-xs">
                    <Star size={14} className="text-yellow-400 flex-shrink-0" />
                    <span className="text-white-force text-sm font-medium truncate">
                      {favorite.name}
                    </span>
                  </div>
                  <div className="text-white/60 text-xs mt-token-xs">
                    {getFavoriteName(favorite.filter)}
                  </div>
                  <div className="text-white/40 text-xs mt-token-xs">
                    마지막 사용: {favorite.lastUsed.toLocaleDateString()}
                  </div>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFavorite(favorite.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-white/40 hover:text-red-400 p-token-xs"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <div className="text-center py-token-lg text-white/40 text-sm">
          저장된 즐겨찾기가 없습니다
        </div>
      )}
    </div>
  );
} 