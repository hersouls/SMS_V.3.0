// Moonwave PWA Service Worker - Enhanced Offline Support
const CACHE_NAME = 'moonwave-v1.2.0';
const OFFLINE_URL = '/offline.html';
const API_CACHE_NAME = 'moonwave-api-v1.2.0';

// 캐시할 핵심 리소스들
const CORE_CACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/Moonwave_2.png',
  '/moonwave.svg'
];

// Install event - 향상된 캐싱 전략
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker 설치 중...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 핵심 리소스 캐싱 중...');
        return cache.addAll(CORE_CACHE_URLS);
      })
      .then(() => {
        console.log('✅ Service Worker 설치 완료');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker 설치 실패:', error);
      })
  );
});

// Fetch event - 스마트 캐싱 전략
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Chrome extension이나 다른 프로토콜 요청은 무시
  if (!request.url.startsWith('http')) {
    return;
  }

  // Always use network-first for JS and CSS to avoid stale module graphs
  const isScript = request.destination === 'script' || url.pathname.endsWith('.js');
  const isStyle = request.destination === 'style' || url.pathname.endsWith('.css');
  if (isScript || isStyle) {
    event.respondWith(networkFirstNoStore(request));
    return;
  }

  // Firebase/API 요청 처리 - Network First 전략
  if (url.hostname.includes('firestore') || url.hostname.includes('firebase') || 
      url.pathname.startsWith('/api/') || url.hostname.includes('googleapis')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // 네비게이션 요청 (HTML 페이지) - Cache First 전략
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // 정적 리소스 요청 - Stale While Revalidate 전략
  event.respondWith(handleStaticRequest(request));
});

// API 요청 처리 - Network First with Offline Fallback
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  
  try {
    // 먼저 네트워크 시도
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // 성공하면 캐시에 저장 (GET 요청만)
      if (request.method === 'GET') {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('📡 API 네트워크 실패, 캐시 확인:', request.url);
    
    // 네트워크 실패 시 캐시에서 응답 (GET 요청만)
    if (request.method === 'GET') {
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        console.log('📦 캐시에서 API 응답 제공');
        return cachedResponse;
      }
    }
    
    // 캐시도 없으면 오프라인 응답 반환
    return new Response(
      JSON.stringify({
        error: 'offline',
        message: '오프라인 상태입니다. 네트워크 연결을 확인해주세요.',
        cached: false,
        timestamp: new Date().toISOString()
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 
          'Content-Type': 'application/json',
          'X-Offline-Response': 'true'
        }
      }
    );
  }
}

// 네비게이션 요청 처리 - Offline Page Fallback
async function handleNavigationRequest(request) {
  try {
    // 먼저 네트워크 시도
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // 네트워크 성공 시 캐시 업데이트
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('📡 페이지 네트워크 실패, 캐시 또는 오프라인 페이지 제공');
    
    // 캐시에서 찾기
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 캐시도 없으면 오프라인 페이지 반환
    return cache.match(OFFLINE_URL) || new Response(
      createOfflineHTML(),
      { 
        headers: { 'Content-Type': 'text/html' },
        status: 200
      }
    );
  }
}

// 정적 리소스 처리 - Stale While Revalidate
async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // 백그라운드에서 업데이트
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // 네트워크 오류 무시
    return null;
  });
  
  // 캐시가 있으면 즉시 반환
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // 캐시가 없으면 네트워크 응답 대기
  try {
    const networkResponse = await fetchPromise;
    if (networkResponse) {
      return networkResponse;
    }
  } catch (error) {
    console.log('📡 정적 리소스 로드 실패:', request.url);
  }
  
  // 이미지 요청이면 플레이스홀더 반환
  if (request.destination === 'image') {
    return new Response(
      createPlaceholderSVG(),
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
  
  return new Response('리소스를 로드할 수 없습니다.', { status: 404 });
}

// 오프라인 HTML 생성
function createOfflineHTML() {
  return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>오프라인 - Moonwave</title>
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-align: center;
                padding: 2rem;
                margin: 0;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
            }
            .container { max-width: 400px; }
            .icon { font-size: 4rem; margin-bottom: 1rem; }
            h1 { margin-bottom: 1rem; }
            p { margin-bottom: 2rem; opacity: 0.8; }
            button {
                background: rgba(255,255,255,0.2);
                border: 2px solid rgba(255,255,255,0.3);
                color: white;
                padding: 0.75rem 1.5rem;
                border-radius: 0.5rem;
                cursor: pointer;
                font-size: 1rem;
                transition: all 0.3s ease;
            }
            button:hover {
                background: rgba(255,255,255,0.3);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="icon">📡</div>
            <h1>오프라인 상태</h1>
            <p>네트워크 연결을 확인하고 다시 시도해주세요.</p>
            <button onclick="window.location.reload()">다시 시도</button>
        </div>
    </body>
    </html>
  `;
}

// 플레이스홀더 SVG 생성
function createPlaceholderSVG() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="#f0f0f0"/>
      <text x="100" y="100" text-anchor="middle" dy="0.3em" font-family="Arial" font-size="14" fill="#666">
        이미지 없음
      </text>
    </svg>
  `;
}

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== API_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
      await self.clients.claim();
      console.log('🧹 Old caches cleaned and clients claimed');
    } catch (e) {
      console.warn('Activate cleanup failed', e);
    }
  })());
});

// Push notification event
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : '새로운 알림이 있습니다.',
    icon: '/Moonwave_2.png',
    badge: '/Moonwave_2.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '확인하기',
        icon: '/Moonwave_2.png'
      },
      {
        action: 'close',
        title: '닫기',
        icon: '/Moonwave_2.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('SMS V.3.0', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
}); 