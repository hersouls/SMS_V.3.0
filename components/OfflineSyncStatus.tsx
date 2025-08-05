// 오프라인 동기화 상태 컴포넌트
import React, { useState } from 'react';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { useAuth } from '../contexts/DataContext';

interface OfflineSyncStatusProps {
  className?: string;
  compact?: boolean;
}

const OfflineSyncStatus: React.FC<OfflineSyncStatusProps> = ({ 
  className = '', 
  compact = false 
}) => {
  const { user } = useAuth();
  const {
    syncState,
    triggerSync,
    clearFailedItems,
    clearCache,
    getCacheInfo,
    isOfflineMode,
    hasPendingChanges,
    hasFailedChanges,
    canSync
  } = useOfflineSync(user?.id);

  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [cacheInfo, setCacheInfo] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // =====================================================
  // 액션 핸들러들
  // =====================================================

  const handleSync = async () => {
    if (!canSync) return;
    
    setLoading(true);
    try {
      await triggerSync();
    } catch (error) {
      console.error('동기화 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFailed = async () => {
    setLoading(true);
    try {
      await clearFailedItems();
    } catch (error) {
      console.error('실패한 항목 정리 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    if (confirm('캐시를 정리하시겠습니까? 오프라인 데이터가 모두 삭제됩니다.')) {
      setLoading(true);
      try {
        await clearCache();
      } catch (error) {
        console.error('캐시 정리 실패:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleShowCacheInfo = async () => {
    setLoading(true);
    try {
      const info = await getCacheInfo();
      setCacheInfo(info);
      setShowActions(true);
    } catch (error) {
      console.error('캐시 정보 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // 상태 표시 함수들
  // =====================================================

  const getStatusIcon = () => {
    if (syncState.syncInProgress) return '🔄';
    if (isOfflineMode) return '📡';
    if (hasFailedChanges) return '⚠️';
    if (hasPendingChanges) return '📤';
    return '✅';
  };

  const getStatusText = () => {
    if (syncState.syncInProgress) return '동기화 중...';
    if (isOfflineMode) return '오프라인';
    if (hasFailedChanges) return `동기화 실패 (${syncState.failedItems}개)`;
    if (hasPendingChanges) return `동기화 대기 (${syncState.pendingItems}개)`;
    return '동기화됨';
  };

  const getStatusColor = () => {
    if (syncState.syncInProgress) return 'text-blue-600';
    if (isOfflineMode) return 'text-gray-600';
    if (hasFailedChanges) return 'text-red-600';
    if (hasPendingChanges) return 'text-yellow-600';
    return 'text-green-600';
  };

  // =====================================================
  // 컴팩트 모드 렌더링
  // =====================================================

  if (compact) {
    return (
      <div 
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()} bg-gray-100 dark:bg-gray-800 ${className}`}
        title={getStatusText()}
      >
        <span className={syncState.syncInProgress ? 'animate-spin' : ''}>
          {getStatusIcon()}
        </span>
        {!isOfflineMode && (hasPendingChanges || hasFailedChanges) && (
          <span>{syncState.pendingItems + syncState.failedItems}</span>
        )}
      </div>
    );
  }

  // =====================================================
  // 전체 모드 렌더링
  // =====================================================

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* 상태 헤더 */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className={`text-xl ${syncState.syncInProgress ? 'animate-spin' : ''}`}>
            {getStatusIcon()}
          </span>
          <div>
            <div className={`font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </div>
            {syncState.lastSyncTime && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                마지막 동기화: {new Date(syncState.lastSyncTime).toLocaleString('ko-KR')}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* 빠른 동기화 버튼 */}
          {canSync && hasPendingChanges && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSync();
              }}
              disabled={loading}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '동기화 중...' : '동기화'}
            </button>
          )}
          
          {/* 확장/축소 아이콘 */}
          <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>
      </div>

      {/* 확장된 세부 정보 */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
          <div className="mt-4 space-y-3">
            {/* 상태 정보 */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600 dark:text-gray-400">네트워크 상태</div>
                <div className={isOfflineMode ? 'text-red-600' : 'text-green-600'}>
                  {isOfflineMode ? '오프라인' : '온라인'}
                </div>
              </div>
              
              <div>
                <div className="text-gray-600 dark:text-gray-400">동기화 상태</div>
                <div className={getStatusColor()}>
                  {syncState.syncInProgress ? '진행 중' : '대기'}
                </div>
              </div>
              
              <div>
                <div className="text-gray-600 dark:text-gray-400">대기 중인 작업</div>
                <div className="text-gray-900 dark:text-gray-100">
                  {syncState.pendingItems}개
                </div>
              </div>
              
              <div>
                <div className="text-gray-600 dark:text-gray-400">실패한 작업</div>
                <div className={hasFailedChanges ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'}>
                  {syncState.failedItems}개
                </div>
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex flex-wrap gap-2 pt-2">
              {canSync && (
                <button
                  onClick={handleSync}
                  disabled={loading || !hasPendingChanges}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '동기화 중...' : '지금 동기화'}
                </button>
              )}
              
              {hasFailedChanges && (
                <button
                  onClick={handleClearFailed}
                  disabled={loading}
                  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  실패한 작업 정리
                </button>
              )}
              
              <button
                onClick={handleShowCacheInfo}
                disabled={loading}
                className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
              >
                캐시 정보
              </button>
              
              <button
                onClick={handleClearCache}
                disabled={loading}
                className="px-3 py-1.5 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
              >
                캐시 정리
              </button>
            </div>

            {/* 캐시 정보 모달 */}
            {showActions && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-semibold mb-4">캐시 정보</h3>
                  
                  <div className="space-y-2 mb-4">
                    {cacheInfo.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {item.store}
                        </span>
                        <span className="font-medium">
                          {item.count.toLocaleString()}개
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowActions(false)}
                      className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      닫기
                    </button>
                    <button
                      onClick={() => {
                        setShowActions(false);
                        handleClearCache();
                      }}
                      className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      캐시 정리
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 오프라인 모드 안내 */}
            {isOfflineMode && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900 rounded-md">
                <div className="flex items-start gap-2">
                  <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    <div className="font-medium">오프라인 모드</div>
                    <div className="mt-1">
                      네트워크 연결을 확인해주세요. 오프라인에서 수행한 작업은 온라인 복구 시 자동으로 동기화됩니다.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 동기화 진행 중 표시 */}
            {syncState.syncInProgress && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-md">
                <div className="flex items-center gap-2">
                  <div className="animate-spin">🔄</div>
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    데이터를 동기화하고 있습니다...
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineSyncStatus;