export interface PWAStatus {
  isInstalled: boolean;
  isInstallable: boolean;
  isOnline: boolean;
  isStandalone: boolean;
}

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// PWA가 설치 가능한지 확인
export const isPWAInstallable = (): boolean => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

// PWA가 이미 설치되어 있는지 확인
export const isPWAInstalled = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
};

// 앱이 독립 실행 모드인지 확인
export const isStandalone = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
};

// 온라인 상태 확인
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// PWA 상태 가져오기
export const getPWAStatus = (): PWAStatus => {
  return {
    isInstalled: isPWAInstalled(),
    isInstallable: isPWAInstallable(),
    isOnline: isOnline(),
    isStandalone: isStandalone(),
  };
};

// 서비스 워커 등록
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.log('서비스 워커를 지원하지 않습니다');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('서비스 워커 등록 성공:', registration);
    return registration;
  } catch (error) {
    console.error('서비스 워커 등록 실패:', error);
    return null;
  }
};

// 푸시 알림 권한 요청
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.log('이 브라우저는 알림을 지원하지 않습니다');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('알림 권한 요청 실패:', error);
    return 'denied';
  }
};

// 푸시 알림 보내기
export const sendNotification = (title: string, options?: NotificationOptions): void => {
  if (!('Notification' in window)) {
    console.log('이 브라우저는 알림을 지원하지 않습니다');
    return;
  }

  if (Notification.permission !== 'granted') {
    console.log('알림 권한이 없습니다');
    return;
  }

  try {
    new Notification(title, {
      icon: '/Moonwave_2.png',
      badge: '/Moonwave_2.png',
      ...options,
    });
  } catch (error) {
    console.error('알림 전송 실패:', error);
  }
};

// 캐시 관리
export const clearCache = async (): Promise<void> => {
  if (!('caches' in window)) {
    console.log('캐시 API를 지원하지 않습니다');
    return;
  }

  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('캐시가 성공적으로 삭제되었습니다');
  } catch (error) {
    console.error('캐시 삭제 실패:', error);
  }
};

// 오프라인 상태 감지
export const addOnlineStatusListener = (
  onOnline: () => void,
  onOffline: () => void
): (() => void) => {
  const handleOnline = () => {
    console.log('온라인 상태로 변경되었습니다');
    onOnline();
  };

  const handleOffline = () => {
    console.log('오프라인 상태로 변경되었습니다');
    onOffline();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

// 앱 업데이트 감지
export const addUpdateListener = (onUpdate: () => void): (() => void) => {
  const handleUpdate = () => {
    console.log('새로운 버전이 사용 가능합니다');
    onUpdate();
  };

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', handleUpdate);
  }

  return () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.removeEventListener('controllerchange', handleUpdate);
    }
  };
}; 