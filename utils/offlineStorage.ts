// IndexedDB를 사용한 오프라인 데이터 저장소
class OfflineStorage {
  private dbName = 'MoonwaveDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  // 스토어 이름들
  private stores = {
    subscriptions: 'subscriptions',
    notifications: 'notifications',
    categories: 'categories',
    preferences: 'preferences',
    statistics: 'statistics',
    statisticsReports: 'statisticsReports',
    syncQueue: 'syncQueue'
  };

  constructor() {
    this.initDB();
  }

  // =====================================================
  // 데이터베이스 초기화
  // =====================================================

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('🗄️ IndexedDB 초기화 중...');
      
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('❌ IndexedDB 초기화 실패:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB 초기화 성공');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        console.log('🔄 IndexedDB 스키마 업그레이드 중...');

        // Subscriptions 스토어
        if (!db.objectStoreNames.contains(this.stores.subscriptions)) {
          const subscriptionsStore = db.createObjectStore(this.stores.subscriptions, { keyPath: 'id' });
          subscriptionsStore.createIndex('userId', 'userId', { unique: false });
          subscriptionsStore.createIndex('status', 'status', { unique: false });
          subscriptionsStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Notifications 스토어
        if (!db.objectStoreNames.contains(this.stores.notifications)) {
          const notificationsStore = db.createObjectStore(this.stores.notifications, { keyPath: 'id' });
          notificationsStore.createIndex('userId', 'userId', { unique: false });
          notificationsStore.createIndex('isRead', 'isRead', { unique: false });
          notificationsStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Categories 스토어
        if (!db.objectStoreNames.contains(this.stores.categories)) {
          const categoriesStore = db.createObjectStore(this.stores.categories, { keyPath: 'id' });
          categoriesStore.createIndex('userId', 'userId', { unique: false });
          categoriesStore.createIndex('name', 'name', { unique: false });
        }

        // Preferences 스토어
        if (!db.objectStoreNames.contains(this.stores.preferences)) {
          db.createObjectStore(this.stores.preferences, { keyPath: 'userId' });
        }

        // Statistics 스토어
        if (!db.objectStoreNames.contains(this.stores.statistics)) {
          const statisticsStore = db.createObjectStore(this.stores.statistics, { keyPath: 'id' });
          statisticsStore.createIndex('userId', 'userId', { unique: false });
          statisticsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Statistics Reports 스토어
        if (!db.objectStoreNames.contains(this.stores.statisticsReports)) {
          const reportsStore = db.createObjectStore(this.stores.statisticsReports, { keyPath: 'id' });
          reportsStore.createIndex('userId', 'userId', { unique: false });
          reportsStore.createIndex('reportType', 'reportType', { unique: false });
          reportsStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Sync Queue 스토어 (오프라인에서 수행된 작업들을 저장)
        if (!db.objectStoreNames.contains(this.stores.syncQueue)) {
          const syncStore = db.createObjectStore(this.stores.syncQueue, { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('action', 'action', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('status', 'status', { unique: false });
        }

        console.log('✅ IndexedDB 스키마 업그레이드 완료');
      };
    });
  }

  // =====================================================
  // 기본 CRUD 작업
  // =====================================================

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.initDB();
    }
    if (!this.db) {
      throw new Error('데이터베이스 연결 실패');
    }
    return this.db;
  }

  private async executeTransaction<T>(
    storeName: string, 
    mode: IDBTransactionMode, 
    operation: (store: IDBObjectStore) => IDBRequest<T>
  ): Promise<T> {
    const db = await this.ensureDB();
    const transaction = db.transaction([storeName], mode);
    const store = transaction.objectStore(storeName);
    const request = operation(store);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // =====================================================
  // 구독 데이터 관리
  // =====================================================

  async saveSubscriptions(subscriptions: any[]): Promise<void> {
    console.log('💾 구독 데이터 저장 중:', subscriptions.length);
    
    const db = await this.ensureDB();
    const transaction = db.transaction([this.stores.subscriptions], 'readwrite');
    const store = transaction.objectStore(this.stores.subscriptions);

    // 모든 구독 데이터를 저장
    for (const subscription of subscriptions) {
      const subscriptionWithTimestamp = {
        ...subscription,
        _cachedAt: new Date().toISOString()
      };
      store.put(subscriptionWithTimestamp);
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        console.log('✅ 구독 데이터 저장 완료');
        resolve();
      };
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getSubscriptions(userId: string): Promise<any[]> {
    console.log('📂 캐시된 구독 데이터 조회:', userId);
    
    const db = await this.ensureDB();
    const transaction = db.transaction([this.stores.subscriptions], 'readonly');
    const store = transaction.objectStore(this.stores.subscriptions);
    const index = store.index('userId');
    const request = index.getAll(userId);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const subscriptions = request.result || [];
        console.log('✅ 캐시된 구독 데이터 조회 완료:', subscriptions.length);
        resolve(subscriptions);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // =====================================================
  // 알림 데이터 관리
  // =====================================================

  async saveNotifications(notifications: any[]): Promise<void> {
    console.log('💾 알림 데이터 저장 중:', notifications.length);
    
    const db = await this.ensureDB();
    const transaction = db.transaction([this.stores.notifications], 'readwrite');
    const store = transaction.objectStore(this.stores.notifications);

    for (const notification of notifications) {
      const notificationWithTimestamp = {
        ...notification,
        _cachedAt: new Date().toISOString()
      };
      store.put(notificationWithTimestamp);
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        console.log('✅ 알림 데이터 저장 완료');
        resolve();
      };
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getNotifications(userId: string): Promise<any[]> {
    console.log('📂 캐시된 알림 데이터 조회:', userId);
    
    return this.executeTransaction(
      this.stores.notifications,
      'readonly',
      (store) => store.index('userId').getAll(userId)
    );
  }

  // =====================================================
  // 카테고리 데이터 관리
  // =====================================================

  async saveCategories(categories: any[]): Promise<void> {
    console.log('💾 카테고리 데이터 저장 중:', categories.length);
    
    const db = await this.ensureDB();
    const transaction = db.transaction([this.stores.categories], 'readwrite');
    const store = transaction.objectStore(this.stores.categories);

    for (const category of categories) {
      store.put({ ...category, _cachedAt: new Date().toISOString() });
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        console.log('✅ 카테고리 데이터 저장 완료');
        resolve();
      };
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getCategories(userId: string): Promise<any[]> {
    console.log('📂 캐시된 카테고리 데이터 조회:', userId);
    
    return this.executeTransaction(
      this.stores.categories,
      'readonly',
      (store) => store.index('userId').getAll(userId)
    );
  }

  // =====================================================
  // 사용자 설정 관리
  // =====================================================

  async savePreferences(preferences: any): Promise<void> {
    console.log('💾 사용자 설정 저장 중:', preferences.userId);
    
    const preferencesWithTimestamp = {
      ...preferences,
      _cachedAt: new Date().toISOString()
    };

    return this.executeTransaction(
      this.stores.preferences,
      'readwrite',
      (store) => store.put(preferencesWithTimestamp)
    );
  }

  async getPreferences(userId: string): Promise<any | null> {
    console.log('📂 캐시된 사용자 설정 조회:', userId);
    
    return this.executeTransaction(
      this.stores.preferences,
      'readonly',
      (store) => store.get(userId)
    );
  }

  // =====================================================
  // 통계 데이터 관리
  // =====================================================

  async saveStatistics(userId: string, statistics: any): Promise<void> {
    console.log('💾 통계 데이터 저장 중:', userId);
    
    const statisticsData = {
      id: `${userId}-${Date.now()}`,
      userId,
      data: statistics,
      timestamp: new Date().toISOString(),
      _cachedAt: new Date().toISOString()
    };

    return this.executeTransaction(
      this.stores.statistics,
      'readwrite',
      (store) => store.put(statisticsData)
    );
  }

  async getLatestStatistics(userId: string): Promise<any | null> {
    console.log('📂 최신 통계 데이터 조회:', userId);
    
    const db = await this.ensureDB();
    const transaction = db.transaction([this.stores.statistics], 'readonly');
    const store = transaction.objectStore(this.stores.statistics);
    const index = store.index('userId');
    const request = index.getAll(userId);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const results = request.result || [];
        // 가장 최신 데이터 반환
        const latest = results.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0];
        
        console.log('✅ 최신 통계 데이터 조회 완료:', latest ? '데이터 있음' : '데이터 없음');
        resolve(latest?.data || null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // =====================================================
  // 동기화 큐 관리
  // =====================================================

  async addToSyncQueue(action: string, data: any, metadata?: any): Promise<void> {
    console.log('📤 동기화 큐에 작업 추가:', action);
    
    const queueItem = {
      action,
      data,
      metadata: metadata || {},
      timestamp: new Date().toISOString(),
      status: 'pending',
      retryCount: 0
    };

    return this.executeTransaction(
      this.stores.syncQueue,
      'readwrite',
      (store) => store.add(queueItem)
    );
  }

  async getSyncQueue(): Promise<any[]> {
    console.log('📥 동기화 큐 조회');
    
    return this.executeTransaction(
      this.stores.syncQueue,
      'readonly',
      (store) => store.getAll()
    );
  }

  async updateSyncQueueItem(id: number, updates: any): Promise<void> {
    console.log('✏️ 동기화 큐 항목 업데이트:', id);
    
    const db = await this.ensureDB();
    const transaction = db.transaction([this.stores.syncQueue], 'readwrite');
    const store = transaction.objectStore(this.stores.syncQueue);
    
    const getRequest = store.get(id);
    
    return new Promise((resolve, reject) => {
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          const updatedItem = { ...item, ...updates };
          const putRequest = store.put(updatedItem);
          
          putRequest.onsuccess = () => {
            console.log('✅ 동기화 큐 항목 업데이트 완료');
            resolve();
          };
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('항목을 찾을 수 없습니다'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async removeSyncQueueItem(id: number): Promise<void> {
    console.log('🗑️ 동기화 큐 항목 삭제:', id);
    
    return this.executeTransaction(
      this.stores.syncQueue,
      'readwrite',
      (store) => store.delete(id)
    );
  }

  // =====================================================
  // 캐시 관리
  // =====================================================

  async clearCache(userId?: string): Promise<void> {
    console.log('🧹 캐시 정리 중...', userId ? `사용자: ${userId}` : '전체');
    
    const db = await this.ensureDB();
    const storeNames = Object.values(this.stores).filter(name => name !== this.stores.syncQueue);
    
    const transaction = db.transaction(storeNames, 'readwrite');

    if (userId) {
      // 특정 사용자 데이터만 삭제
      for (const storeName of storeNames) {
        const store = transaction.objectStore(storeName);
        
        if (storeName === this.stores.preferences) {
          store.delete(userId);
        } else if (store.indexNames.contains('userId')) {
          const index = store.index('userId');
          const request = index.getAll(userId);
          
          request.onsuccess = () => {
            const items = request.result;
            items.forEach(item => store.delete(item.id));
          };
        }
      }
    } else {
      // 전체 캐시 삭제
      for (const storeName of storeNames) {
        const store = transaction.objectStore(storeName);
        store.clear();
      }
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        console.log('✅ 캐시 정리 완료');
        resolve();
      };
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getCacheSize(): Promise<{ store: string; count: number }[]> {
    console.log('📊 캐시 크기 조회 중...');
    
    const db = await this.ensureDB();
    const storeNames = Object.values(this.stores);
    const sizes: { store: string; count: number }[] = [];

    const transaction = db.transaction(storeNames, 'readonly');

    for (const storeName of storeNames) {
      const store = transaction.objectStore(storeName);
      const countRequest = store.count();
      
      await new Promise<void>((resolve, reject) => {
        countRequest.onsuccess = () => {
          sizes.push({ store: storeName, count: countRequest.result });
          resolve();
        };
        countRequest.onerror = () => reject(countRequest.error);
      });
    }

    console.log('✅ 캐시 크기 조회 완료:', sizes);
    return sizes;
  }

  // =====================================================
  // 네트워크 상태 관리
  // =====================================================

  isOnline(): boolean {
    return navigator.onLine;
  }

  onNetworkChange(callback: (isOnline: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 정리 함수 반환
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }
}

// 싱글톤 인스턴스
export const offlineStorage = new OfflineStorage();
export default offlineStorage;