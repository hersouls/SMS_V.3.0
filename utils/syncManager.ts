// 오프라인 데이터 동기화 관리자
import { offlineStorage } from './offlineStorage';
import { firebaseApiService } from './api-firebase';

interface SyncQueueItem {
  id?: number;
  action: string;
  data: any;
  metadata?: any;
  timestamp: string;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  retryCount: number;
  lastError?: string;
}

class SyncManager {
  private syncInProgress = false;
  private maxRetries = 3;
  private retryDelay = 1000; // 1초
  private syncListeners: Array<(status: 'started' | 'completed' | 'error', details?: any) => void> = [];

  constructor() {
    this.setupNetworkListeners();
    console.log('🔄 SyncManager 초기화됨');
  }

  // =====================================================
  // 네트워크 상태 모니터링
  // =====================================================

  private setupNetworkListeners(): void {
    // 온라인 복구 시 자동 동기화
    window.addEventListener('online', () => {
      console.log('🌐 네트워크 연결 복구됨 - 자동 동기화 시작');
      this.syncAll();
    });

    window.addEventListener('offline', () => {
      console.log('📡 네트워크 연결 끊어짐 - 오프라인 모드');
    });
  }

  // =====================================================
  // 오프라인 작업 큐잉
  // =====================================================

  async queueCreateSubscription(subscriptionData: any): Promise<string> {
    console.log('📤 구독 생성 작업을 큐에 추가');
    
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await offlineStorage.addToSyncQueue('CREATE_SUBSCRIPTION', {
      ...subscriptionData,
      tempId
    });

    // 임시 구독을 로컬 스토리지에 저장 (즉시 UI 반영을 위해)
    const tempSubscription = {
      ...subscriptionData,
      id: tempId,
      status: 'pending_sync',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.addTempSubscriptionToCache(tempSubscription);
    
    return tempId;
  }

  async queueUpdateSubscription(id: string, updates: any): Promise<void> {
    console.log('📤 구독 수정 작업을 큐에 추가:', id);
    
    await offlineStorage.addToSyncQueue('UPDATE_SUBSCRIPTION', updates, { subscriptionId: id });
    
    // 로컬 캐시에서 즉시 업데이트
    await this.updateTempSubscriptionInCache(id, updates);
  }

  async queueDeleteSubscription(id: string): Promise<void> {
    console.log('📤 구독 삭제 작업을 큐에 추가:', id);
    
    await offlineStorage.addToSyncQueue('DELETE_SUBSCRIPTION', {}, { subscriptionId: id });
    
    // 로컬 캐시에서 즉시 삭제 표시
    await this.markSubscriptionAsDeleted(id);
  }

  async queueMarkNotificationRead(notificationId: string): Promise<void> {
    console.log('📤 알림 읽음 처리 작업을 큐에 추가:', notificationId);
    
    await offlineStorage.addToSyncQueue('MARK_NOTIFICATION_READ', {}, { notificationId });
    
    // 로컬에서 즉시 읽음 처리
    await this.markNotificationReadInCache(notificationId);
  }

  async queueUpdatePreferences(preferences: any): Promise<void> {
    console.log('📤 설정 업데이트 작업을 큐에 추가');
    
    await offlineStorage.addToSyncQueue('UPDATE_PREFERENCES', preferences);
    
    // 로컬에서 즉시 업데이트
    await offlineStorage.savePreferences(preferences);
  }

  // =====================================================
  // 로컬 캐시 임시 업데이트
  // =====================================================

  private async addTempSubscriptionToCache(subscription: any): Promise<void> {
    const userId = subscription.userId;
    const existingSubscriptions = await offlineStorage.getSubscriptions(userId);
    const updatedSubscriptions = [...existingSubscriptions, subscription];
    await offlineStorage.saveSubscriptions(updatedSubscriptions);
  }

  private async updateTempSubscriptionInCache(id: string, updates: any): Promise<void> {
    // 사용자 ID를 가져오는 로직이 필요하지만, 임시로 현재 인증된 사용자 사용
    const user = firebaseApiService['currentUser'];
    if (!user) return;

    const existingSubscriptions = await offlineStorage.getSubscriptions(user.uid);
    const updatedSubscriptions = existingSubscriptions.map(sub => 
      sub.id === id ? { ...sub, ...updates, updatedAt: new Date().toISOString() } : sub
    );
    await offlineStorage.saveSubscriptions(updatedSubscriptions);
  }

  private async markSubscriptionAsDeleted(id: string): Promise<void> {
    const user = firebaseApiService['currentUser'];
    if (!user) return;

    const existingSubscriptions = await offlineStorage.getSubscriptions(user.uid);
    const updatedSubscriptions = existingSubscriptions.map(sub => 
      sub.id === id ? { ...sub, status: 'deleted', updatedAt: new Date().toISOString() } : sub
    );
    await offlineStorage.saveSubscriptions(updatedSubscriptions);
  }

  private async markNotificationReadInCache(notificationId: string): Promise<void> {
    const user = firebaseApiService['currentUser'];
    if (!user) return;

    const existingNotifications = await offlineStorage.getNotifications(user.uid);
    const updatedNotifications = existingNotifications.map(notif => 
      notif.id === notificationId ? { ...notif, isRead: true, updatedAt: new Date().toISOString() } : notif
    );
    await offlineStorage.saveNotifications(updatedNotifications);
  }

  // =====================================================
  // 동기화 실행
  // =====================================================

  async syncAll(): Promise<void> {
    if (this.syncInProgress) {
      console.log('⏳ 동기화가 이미 진행 중입니다');
      return;
    }

    if (!navigator.onLine) {
      console.log('📡 오프라인 상태 - 동기화를 건너뜁니다');
      return;
    }

    this.syncInProgress = true;
    this.notifyListeners('started');

    try {
      console.log('🔄 전체 동기화 시작');
      
      const syncQueue = await offlineStorage.getSyncQueue();
      const pendingItems = syncQueue.filter(item => 
        item.status === 'pending' || (item.status === 'failed' && item.retryCount < this.maxRetries)
      );

      console.log(`📋 동기화 대기 작업: ${pendingItems.length}개`);

      for (const item of pendingItems) {
        await this.syncItem(item);
      }

      console.log('✅ 모든 동기화 작업 완료');
      this.notifyListeners('completed');

    } catch (error) {
      console.error('❌ 동기화 중 오류 발생:', error);
      this.notifyListeners('error', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncItem(item: SyncQueueItem): Promise<void> {
    try {
      console.log(`🔄 동기화 실행: ${item.action}`);
      
      // 동기화 시작 표시
      if (item.id) {
        await offlineStorage.updateSyncQueueItem(item.id, { 
          status: 'syncing',
          lastError: undefined
        });
      }

      let result;
      
      switch (item.action) {
        case 'CREATE_SUBSCRIPTION':
          result = await this.syncCreateSubscription(item);
          break;
          
        case 'UPDATE_SUBSCRIPTION':
          result = await this.syncUpdateSubscription(item);
          break;
          
        case 'DELETE_SUBSCRIPTION':
          result = await this.syncDeleteSubscription(item);
          break;
          
        case 'MARK_NOTIFICATION_READ':
          result = await this.syncMarkNotificationRead(item);
          break;
          
        case 'UPDATE_PREFERENCES':
          result = await this.syncUpdatePreferences(item);
          break;
          
        default:
          throw new Error(`알 수 없는 동기화 작업: ${item.action}`);
      }

      // 성공 시 큐에서 제거
      if (item.id) {
        await offlineStorage.removeSyncQueueItem(item.id);
      }
      
      console.log(`✅ 동기화 완료: ${item.action}`);

    } catch (error) {
      console.error(`❌ 동기화 실패: ${item.action}`, error);
      
      const retryCount = (item.retryCount || 0) + 1;
      
      if (item.id) {
        if (retryCount >= this.maxRetries) {
          // 최대 재시도 횟수 초과
          await offlineStorage.updateSyncQueueItem(item.id, {
            status: 'failed',
            retryCount,
            lastError: error instanceof Error ? error.message : '알 수 없는 오류'
          });
        } else {
          // 재시도 대기
          await offlineStorage.updateSyncQueueItem(item.id, {
            status: 'pending',
            retryCount,
            lastError: error instanceof Error ? error.message : '알 수 없는 오류'
          });
          
          // 재시도 지연
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * retryCount));
        }
      }
    }
  }

  // =====================================================
  // 개별 동기화 작업들
  // =====================================================

  private async syncCreateSubscription(item: SyncQueueItem): Promise<void> {
    const { tempId, ...subscriptionData } = item.data;
    
    const result = await firebaseApiService.createSubscription(subscriptionData);
    
    // 임시 구독을 실제 구독으로 교체
    const user = firebaseApiService['currentUser'];
    if (user && result.subscription) {
      const existingSubscriptions = await offlineStorage.getSubscriptions(user.uid);
      const updatedSubscriptions = existingSubscriptions
        .filter(sub => sub.id !== tempId)  // 임시 구독 제거
        .concat([result.subscription]);    // 실제 구독 추가
      
      await offlineStorage.saveSubscriptions(updatedSubscriptions);
    }
  }

  private async syncUpdateSubscription(item: SyncQueueItem): Promise<void> {
    const subscriptionId = item.metadata?.subscriptionId;
    if (!subscriptionId) {
      throw new Error('구독 ID가 없습니다');
    }
    
    await firebaseApiService.updateSubscription(subscriptionId, item.data);
    
    // 로컬 캐시 업데이트는 이미 완료되었으므로 별도 작업 불필요
  }

  private async syncDeleteSubscription(item: SyncQueueItem): Promise<void> {
    const subscriptionId = item.metadata?.subscriptionId;
    if (!subscriptionId) {
      throw new Error('구독 ID가 없습니다');
    }
    
    await firebaseApiService.deleteSubscription(subscriptionId);
    
    // 로컬 캐시에서 완전히 제거
    const user = firebaseApiService['currentUser'];
    if (user) {
      const existingSubscriptions = await offlineStorage.getSubscriptions(user.uid);
      const filteredSubscriptions = existingSubscriptions.filter(sub => sub.id !== subscriptionId);
      await offlineStorage.saveSubscriptions(filteredSubscriptions);
    }
  }

  private async syncMarkNotificationRead(item: SyncQueueItem): Promise<void> {
    const notificationId = item.metadata?.notificationId;
    if (!notificationId) {
      throw new Error('알림 ID가 없습니다');
    }
    
    await firebaseApiService.markNotificationAsRead(notificationId);
  }

  private async syncUpdatePreferences(item: SyncQueueItem): Promise<void> {
    await firebaseApiService.updatePreferences(item.data);
  }

  // =====================================================
  // 강제 데이터 새로고침
  // =====================================================

  async refreshAllData(): Promise<void> {
    console.log('🔄 모든 데이터 새로고침');
    
    if (!navigator.onLine) {
      console.log('📡 오프라인 상태 - 새로고침을 건너뜁니다');
      return;
    }

    try {
      const user = firebaseApiService['currentUser'];
      if (!user) {
        console.log('❌ 인증되지 않은 사용자 - 새로고침 중단');
        return;
      }

      // 구독 데이터 새로고침
      try {
        const subscriptionsResult = await firebaseApiService.getSubscriptions();
        await offlineStorage.saveSubscriptions(subscriptionsResult.subscriptions);
        console.log('✅ 구독 데이터 새로고침 완료');
      } catch (error) {
        console.error('❌ 구독 데이터 새로고침 실패:', error);
      }

      // 알림 데이터 새로고침
      try {
        const notificationsResult = await firebaseApiService.getNotifications();
        await offlineStorage.saveNotifications(notificationsResult.notifications);
        console.log('✅ 알림 데이터 새로고침 완료');
      } catch (error) {
        console.error('❌ 알림 데이터 새로고침 실패:', error);
      }

      // 카테고리 데이터 새로고침
      try {
        const categoriesResult = await firebaseApiService.getCategories();
        await offlineStorage.saveCategories(categoriesResult.categories);
        console.log('✅ 카테고리 데이터 새로고침 완료');
      } catch (error) {
        console.error('❌ 카테고리 데이터 새로고침 실패:', error);
      }

      // 사용자 설정 새로고침  
      try {
        const preferencesResult = await firebaseApiService.getPreferences();
        await offlineStorage.savePreferences(preferencesResult.preferences);
        console.log('✅ 사용자 설정 새로고침 완료');
      } catch (error) {
        console.error('❌ 사용자 설정 새로고침 실패:', error);
      }

      // 통계 데이터 새로고침
      try {
        const statisticsResult = await firebaseApiService.getStatistics();
        await offlineStorage.saveStatistics(user.uid, statisticsResult.statistics);
        console.log('✅ 통계 데이터 새로고침 완료');
      } catch (error) {
        console.error('❌ 통계 데이터 새로고침 실패:', error);
      }

      console.log('✅ 모든 데이터 새로고침 완료');

    } catch (error) {
      console.error('❌ 데이터 새로고침 중 오류:', error);
      throw error;
    }
  }

  // =====================================================
  // 리스너 관리
  // =====================================================

  addSyncListener(callback: (status: 'started' | 'completed' | 'error', details?: any) => void): () => void {
    this.syncListeners.push(callback);
    
    // 정리 함수 반환
    return () => {
      const index = this.syncListeners.indexOf(callback);
      if (index > -1) {
        this.syncListeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(status: 'started' | 'completed' | 'error', details?: any): void {
    this.syncListeners.forEach(callback => {
      try {
        callback(status, details);
      } catch (error) {
        console.error('❌ 동기화 리스너 오류:', error);
      }
    });
  }

  // =====================================================
  // 상태 조회
  // =====================================================

  isSyncInProgress(): boolean {
    return this.syncInProgress;
  }

  async getSyncStatus(): Promise<{
    isOnline: boolean;
    syncInProgress: boolean;
    pendingItems: number;
    failedItems: number;
  }> {
    const syncQueue = await offlineStorage.getSyncQueue();
    
    return {
      isOnline: navigator.onLine,
      syncInProgress: this.syncInProgress,
      pendingItems: syncQueue.filter(item => item.status === 'pending').length,
      failedItems: syncQueue.filter(item => item.status === 'failed').length
    };
  }

  async clearFailedSyncItems(): Promise<void> {
    console.log('🧹 실패한 동기화 항목 정리');
    
    const syncQueue = await offlineStorage.getSyncQueue();
    const failedItems = syncQueue.filter(item => item.status === 'failed');
    
    for (const item of failedItems) {
      if (item.id) {
        await offlineStorage.removeSyncQueueItem(item.id);
      }
    }
    
    console.log(`✅ ${failedItems.length}개의 실패한 동기화 항목 정리 완료`);
  }
}

// 싱글톤 인스턴스
export const syncManager = new SyncManager();
export default syncManager;