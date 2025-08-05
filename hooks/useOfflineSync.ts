// PWA 오프라인 동기화 훅
import { useState, useEffect, useCallback } from 'react';
import { syncManager } from '../utils/syncManager';
import { offlineStorage } from '../utils/offlineStorage';

interface OfflineSyncState {
  isOnline: boolean;
  syncInProgress: boolean;
  pendingItems: number;
  failedItems: number;
  lastSyncTime: string | null;
}

interface OfflineData {
  subscriptions: any[];
  notifications: any[];
  categories: any[];
  preferences: any | null;
  statistics: any | null;
}

export const useOfflineSync = (userId?: string) => {
  const [syncState, setSyncState] = useState<OfflineSyncState>({
    isOnline: navigator.onLine,
    syncInProgress: false,
    pendingItems: 0,
    failedItems: 0,
    lastSyncTime: null
  });

  const [offlineData, setOfflineData] = useState<OfflineData>({
    subscriptions: [],
    notifications: [],
    categories: [],
    preferences: null,
    statistics: null
  });

  // =====================================================
  // 상태 업데이트 함수들
  // =====================================================

  const updateSyncState = useCallback(async () => {
    try {
      const status = await syncManager.getSyncStatus();
      setSyncState(prev => ({
        ...prev,
        ...status,
        lastSyncTime: prev.lastSyncTime || new Date().toISOString()
      }));
    } catch (error) {
      console.error('❌ 동기화 상태 업데이트 실패:', error);
    }
  }, []);

  const loadOfflineData = useCallback(async () => {
    if (!userId) return;

    try {
      console.log('📂 오프라인 데이터 로드 중...', userId);

      const [subscriptions, notifications, categories, preferences, statistics] = await Promise.all([
        offlineStorage.getSubscriptions(userId),
        offlineStorage.getNotifications(userId),
        offlineStorage.getCategories(userId),
        offlineStorage.getPreferences(userId),
        offlineStorage.getLatestStatistics(userId)
      ]);

      // deleted 상태인 구독은 필터링
      const activeSubscriptions = subscriptions.filter(sub => sub.status !== 'deleted');

      setOfflineData({
        subscriptions: activeSubscriptions,
        notifications,
        categories,
        preferences,
        statistics
      });

      console.log('✅ 오프라인 데이터 로드 완료');
    } catch (error) {
      console.error('❌ 오프라인 데이터 로드 실패:', error);
    }
  }, [userId]);

  // =====================================================
  // 네트워크 상태 관리
  // =====================================================

  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 네트워크 연결됨');
      setSyncState(prev => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      console.log('📡 네트워크 연결 끊어짐');
      setSyncState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);  
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // =====================================================
  // 동기화 리스너 설정
  // =====================================================

  useEffect(() => {
    const removeSyncListener = syncManager.addSyncListener((status, details) => {
      console.log('🔄 동기화 상태 변경:', status, details);
      
      setSyncState(prev => ({
        ...prev,
        syncInProgress: status === 'started',
        lastSyncTime: status === 'completed' ? new Date().toISOString() : prev.lastSyncTime
      }));

      if (status === 'completed') {
        // 동기화 완료 후 오프라인 데이터 다시 로드
        loadOfflineData();
      }
    });

    return removeSyncListener;
  }, [loadOfflineData]);

  // =====================================================
  // 초기 데이터 로드
  // =====================================================

  useEffect(() => {
    if (userId) {
      loadOfflineData();
      updateSyncState();
    }
  }, [userId, loadOfflineData, updateSyncState]);

  // =====================================================
  // 주기적 상태 업데이트
  // =====================================================

  useEffect(() => {
    const interval = setInterval(updateSyncState, 30000); // 30초마다
    return () => clearInterval(interval);
  }, [updateSyncState]);

  // =====================================================
  // 오프라인 작업 함수들
  // =====================================================

  const queueCreateSubscription = useCallback(async (subscriptionData: any) => {
    console.log('📤 오프라인 구독 생성:', subscriptionData);
    
    try {
      const tempId = await syncManager.queueCreateSubscription(subscriptionData);
      
      // 즉시 로컬 상태 업데이트
      setOfflineData(prev => ({
        ...prev,
        subscriptions: [...prev.subscriptions, {
          ...subscriptionData,
          id: tempId,
          status: 'pending_sync',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }]
      }));

      await updateSyncState();
      return tempId;
    } catch (error) {
      console.error('❌ 오프라인 구독 생성 실패:', error);
      throw error;
    }
  }, [updateSyncState]);

  const queueUpdateSubscription = useCallback(async (id: string, updates: any) => {
    console.log('📤 오프라인 구독 수정:', id, updates);
    
    try {
      await syncManager.queueUpdateSubscription(id, updates);
      
      // 즉시 로컬 상태 업데이트
      setOfflineData(prev => ({
        ...prev,
        subscriptions: prev.subscriptions.map(sub =>
          sub.id === id 
            ? { ...sub, ...updates, updatedAt: new Date().toISOString() }
            : sub
        )
      }));

      await updateSyncState();
    } catch (error) {
      console.error('❌ 오프라인 구독 수정 실패:', error);
      throw error;
    }
  }, [updateSyncState]);

  const queueDeleteSubscription = useCallback(async (id: string) => {
    console.log('📤 오프라인 구독 삭제:', id);
    
    try {
      await syncManager.queueDeleteSubscription(id);
      
      // 즉시 로컬 상태에서 제거
      setOfflineData(prev => ({
        ...prev,
        subscriptions: prev.subscriptions.filter(sub => sub.id !== id)
      }));

      await updateSyncState();
    } catch (error) {
      console.error('❌ 오프라인 구독 삭제 실패:', error);
      throw error;
    }
  }, [updateSyncState]);

  const queueMarkNotificationRead = useCallback(async (notificationId: string) => {
    console.log('📤 오프라인 알림 읽음 처리:', notificationId);
    
    try {
      await syncManager.queueMarkNotificationRead(notificationId);
      
      // 즉시 로컬 상태 업데이트
      setOfflineData(prev => ({
        ...prev,
        notifications: prev.notifications.map(notif =>
          notif.id === notificationId
            ? { ...notif, isRead: true, updatedAt: new Date().toISOString() }
            : notif
        )
      }));

      await updateSyncState();
    } catch (error) {
      console.error('❌ 오프라인 알림 읽음 처리 실패:', error);
      throw error;
    }
  }, [updateSyncState]);

  const queueUpdatePreferences = useCallback(async (preferences: any) => {
    console.log('📤 오프라인 설정 업데이트:', preferences);
    
    try {
      await syncManager.queueUpdatePreferences(preferences);
      
      // 즉시 로컬 상태 업데이트
      setOfflineData(prev => ({
        ...prev,
        preferences: { ...prev.preferences, ...preferences }
      }));

      await updateSyncState();
    } catch (error) {
      console.error('❌ 오프라인 설정 업데이트 실패:', error);
      throw error;
    }
  }, [updateSyncState]);

  // =====================================================
  // 수동 동기화 및 새로고침
  // =====================================================

  const triggerSync = useCallback(async () => {
    console.log('🔄 수동 동기화 시작');
    
    if (!syncState.isOnline) {
      throw new Error('오프라인 상태에서는 동기화할 수 없습니다');
    }

    try {
      await syncManager.syncAll();
      await loadOfflineData();
      await updateSyncState();
    } catch (error) {
      console.error('❌ 수동 동기화 실패:', error);
      throw error;
    }
  }, [syncState.isOnline, loadOfflineData, updateSyncState]);

  const refreshData = useCallback(async () => {
    console.log('🔄 데이터 새로고침');
    
    if (!syncState.isOnline) {
      // 오프라인일 때는 로컬 데이터만 다시 로드
      await loadOfflineData();
      return;
    }

    try {
      await syncManager.refreshAllData();
      await loadOfflineData();
      await updateSyncState();
    } catch (error) {
      console.error('❌ 데이터 새로고침 실패:', error);
      throw error;
    }
  }, [syncState.isOnline, loadOfflineData, updateSyncState]);

  const clearFailedItems = useCallback(async () => {
    console.log('🧹 실패한 동기화 항목 정리');
    
    try {
      await syncManager.clearFailedSyncItems();
      await updateSyncState();
    } catch (error) {
      console.error('❌ 실패한 항목 정리 실패:', error);
      throw error;
    }
  }, [updateSyncState]);

  // =====================================================
  // 캐시 관리
  // =====================================================

  const clearCache = useCallback(async () => {
    console.log('🧹 캐시 정리');
    
    try {
      await offlineStorage.clearCache(userId);
      await loadOfflineData();
      await updateSyncState();
    } catch (error) {
      console.error('❌ 캐시 정리 실패:', error);
      throw error;
    }
  }, [userId, loadOfflineData, updateSyncState]);

  const getCacheInfo = useCallback(async () => {
    console.log('📊 캐시 정보 조회');
    
    try {
      return await offlineStorage.getCacheSize();
    } catch (error) {
      console.error('❌ 캐시 정보 조회 실패:', error);
      return [];
    }
  }, []);

  // =====================================================
  // 반환값
  // =====================================================

  return {
    // 상태
    syncState,
    offlineData,
    
    // 오프라인 작업
    queueCreateSubscription,
    queueUpdateSubscription,
    queueDeleteSubscription,
    queueMarkNotificationRead,
    queueUpdatePreferences,
    
    // 동기화 및 새로고침
    triggerSync,
    refreshData,
    clearFailedItems,
    
    // 캐시 관리
    clearCache,
    getCacheInfo,
    
    // 유틸리티
    isOfflineMode: !syncState.isOnline,
    hasPendingChanges: syncState.pendingItems > 0,
    hasFailedChanges: syncState.failedItems > 0,
    canSync: syncState.isOnline && !syncState.syncInProgress
  };
};

export default useOfflineSync;