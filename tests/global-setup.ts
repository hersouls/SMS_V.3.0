// 글로벌 테스트 설정

import { chromium } from '@playwright/test';

async function globalSetup() {
  console.log('🚀 테스트 환경 설정 시작...');

  // 브라우저 실행
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 애플리케이션이 로드될 때까지 대기
    console.log('📱 애플리케이션 로드 확인 중...');
    await page.goto('http://localhost:3004', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // 추가 대기 시간
    await page.waitForTimeout(2000);

    // 테스트 모킹 모드 활성화
    await page.evaluate(() => {
      // 테스트 모드 플래그 설정
      localStorage.setItem('TEST_MODE', 'true');
      
      // 모킹 스크립트 주입
      const script = document.createElement('script');
      script.textContent = `
        // 테스트용 모킹 함수들
        window.enableTestMode = function() {
          console.log('🧪 테스트 모드 활성화');
          
          // Firebase 모킹
          window.firebase = {
            auth: {
              currentUser: {
                uid: 'test-user-123',
                email: 'test@example.com',
                displayName: 'Test User'
              }
            },
            db: {},
            storage: {}
          };
          
          window.auth = window.firebase.auth;
          window.db = window.firebase.db;
          window.storage = window.firebase.storage;
          
          // 알림 서비스 모킹
          window.notificationService = {
            getNotifications: async () => ({ success: true, data: [], error: null }),
            subscribeToNotifications: (userId, callback) => {
              setTimeout(() => callback([]), 100);
              return () => {};
            },
            markAsRead: async () => ({ success: true, error: null }),
            deleteNotification: async () => ({ success: true, error: null }),
            createNotification: async () => ({ success: true, data: { id: 'mock' }, error: null })
          };
          
          window.notificationMonitor = {
            checkPaymentDue: () => console.log('Mock: checkPaymentDue'),
            checkSubscriptionExpiry: () => console.log('Mock: checkSubscriptionExpiry')
          };
          
          return true;
        };
        
        // 즉시 실행
        window.enableTestMode();
      `;
      document.head.appendChild(script);
    });

    console.log('✅ 테스트 환경 설정 완료');

    // 기본 상태 확인
    const title = await page.title();
    console.log(`📝 애플리케이션 제목: ${title}`);

    // 기본 요소들이 로드되었는지 확인
    await page.waitForSelector('body', { timeout: 10000 });
    console.log('📄 페이지 기본 구조 로드 완료');

  } catch (error) {
    console.error('❌ 테스트 환경 설정 실패:', error);
    throw error;
  } finally {
    await browser.close();
  }

  console.log('🎯 글로벌 설정 완료');
}

export default globalSetup;