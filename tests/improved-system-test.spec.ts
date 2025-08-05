// 개선된 시스템 전체 기능 테스트

import { test, expect, Page } from '@playwright/test';

// 테스트 헬퍼 함수들
class TestHelpers {
  constructor(private page: Page) {}

  async enableTestMode() {
    await this.page.evaluate(() => {
      if (window.enableTestMode) {
        window.enableTestMode();
      }
    });
  }

  async waitForReactApp() {
    // React 앱이 로드될 때까지 대기
    try {
      await this.page.waitForSelector('[data-testid="app"], main, #root', { timeout: 10000 });
    } catch (error) {
      // 기본 selector가 없어도 body가 있으면 계속 진행
      await this.page.waitForSelector('body', { timeout: 5000 });
    }
    
    // 네트워크 대기 대신 간단한 타임아웃 사용
    await this.page.waitForTimeout(3000);
  }

  async findButtonByText(text: string) {
    const buttons = await this.page.$$('button, a[role="button"], [role="button"]');
    
    for (const button of buttons) {
      const buttonText = await button.textContent();
      if (buttonText && buttonText.includes(text)) {
        return button;
      }
    }
    
    return null;
  }

  async findElementByText(selector: string, text: string) {
    const elements = await this.page.$$(selector);
    
    for (const element of elements) {
      const elementText = await element.textContent();
      if (elementText && elementText.includes(text)) {
        return element;
      }
    }
    
    return null;
  }

  async checkServiceHealth() {
    return await this.page.evaluate(() => {
      return {
        firebase: {
          auth: typeof window.auth !== 'undefined',
          db: typeof window.db !== 'undefined',
          storage: typeof window.storage !== 'undefined'
        },
        notifications: {
          service: typeof window.notificationService !== 'undefined',
          monitor: typeof window.notificationMonitor !== 'undefined'
        },
        react: {
          loaded: document.querySelector('#root, main, [data-testid="app"]') !== null,
          hasContent: document.body.children.length > 0
        }
      };
    });
  }
}

test.describe('개선된 시스템 전체 기능 테스트', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    
    // 테스트 모드 활성화
    await page.addInitScript(() => {
      localStorage.setItem('TEST_MODE', 'true');
    });
    
    await page.goto('/');
    await helpers.enableTestMode();
    await helpers.waitForReactApp();
  });

  test('Step 1: 서비스 초기화 및 기본 구조 확인', async ({ page }) => {
    console.log('\n=== Step 1: 서비스 초기화 및 기본 구조 확인 ===');
    
    // 서비스 상태 확인
    const health = await helpers.checkServiceHealth();
    console.log('🔍 서비스 상태:', health);
    
    // 기본 UI 구조 확인
    const uiElements = await page.evaluate(() => {
      return {
        hasHeader: document.querySelector('header, [role="banner"], nav') !== null,
        hasMain: document.querySelector('main, [role="main"], .main-content') !== null,
        hasFooter: document.querySelector('footer, [role="contentinfo"]') !== null,
        hasNavigation: document.querySelectorAll('a, button').length > 0,
        bodyClasses: document.body.className,
        title: document.title
      };
    });
    
    console.log('🎨 UI 구조:', uiElements);
    
    // 기본 검증
    expect(health.react.loaded).toBe(true);
    expect(health.react.hasContent).toBe(true);
    expect(uiElements.hasNavigation).toBe(true);
    
    console.log('✅ Step 1 완료: 기본 구조 정상');
  });

  test('Step 2: 인증 시스템 모킹 테스트', async ({ page }) => {
    console.log('\n=== Step 2: 인증 시스템 모킹 테스트 ===');
    
    // 로그인 페이지로 이동 (리다이렉트 될 수 있음)
    const currentUrl = page.url();
    console.log('📍 현재 URL:', currentUrl);
    
    // 인증 관련 요소 찾기
    const authElements = await page.evaluate(() => {
      // 버튼들을 찾는 더 안전한 방법
      const allButtons = Array.from(document.querySelectorAll('button, a[href*="login"], a[href*="signup"], input[type="submit"]'));
      const allInputs = Array.from(document.querySelectorAll('input[type="email"], input[type="password"], input[placeholder*="이메일"], input[placeholder*="비밀번호"]'));
      
      return {
        loginButtons: allButtons.filter(btn => {
          const text = btn.textContent || '';
          return text.includes('로그인') || text.includes('Login') || text.includes('Sign In');
        }).length,
        signupButtons: allButtons.filter(btn => {
          const text = btn.textContent || '';
          return text.includes('회원가입') || text.includes('Sign Up') || text.includes('Register');
        }).length,
        emailInputs: allInputs.filter(input => 
          input.type === 'email' || 
          (input as HTMLInputElement).placeholder?.includes('이메일') ||
          (input as HTMLInputElement).placeholder?.includes('email')
        ).length,
        passwordInputs: allInputs.filter(input => 
          input.type === 'password' || 
          (input as HTMLInputElement).placeholder?.includes('비밀번호') ||
          (input as HTMLInputElement).placeholder?.includes('password')
        ).length,
        totalButtons: allButtons.length,
        totalInputs: allInputs.length
      };
    });
    
    console.log('🔐 인증 요소들:', authElements);
    
    // Firebase 인증 모킹 확인
    const authMocking = await page.evaluate(() => {
      return {
        hasAuth: typeof window.auth !== 'undefined',
        hasMockUser: !!(window.auth?.currentUser),
        userInfo: window.auth?.currentUser ? {
          uid: window.auth.currentUser.uid,
          email: window.auth.currentUser.email
        } : null
      };
    });
    
    console.log('🧪 인증 모킹 상태:', authMocking);
    
    // 검증
    expect(authMocking.hasAuth).toBe(true);
    expect(authElements.totalButtons).toBeGreaterThan(0);
    
    console.log('✅ Step 2 완료: 인증 시스템 모킹 정상');
  });

  test('Step 3: 알림 시스템 통합 테스트', async ({ page }) => {
    console.log('\n=== Step 3: 알림 시스템 통합 테스트 ===');
    
    // 알림 페이지로 이동 시도
    const navigationResult = await page.evaluate(() => {
      // 알림 관련 링크나 버튼 찾기
      const navLinks = Array.from(document.querySelectorAll('a, button'));
      const notificationLinks = navLinks.filter(link => {
        const text = link.textContent || '';
        const href = (link as HTMLAnchorElement).href || '';
        return text.includes('알림') || 
               text.includes('Notification') || 
               href.includes('notification') ||
               text.includes('Notice');
      });
      
      return {
        foundLinks: notificationLinks.length,
        linkTexts: notificationLinks.slice(0, 3).map(link => link.textContent?.substring(0, 20))
      };
    });
    
    console.log('📨 알림 네비게이션:', navigationResult);
    
    // 알림 서비스 모킹 확인
    const notificationServices = await page.evaluate(() => {
      return {
        hasNotificationService: typeof window.notificationService !== 'undefined',
        hasNotificationMonitor: typeof window.notificationMonitor !== 'undefined',
        serviceMethods: window.notificationService ? Object.keys(window.notificationService) : [],
        monitorMethods: window.notificationMonitor ? Object.keys(window.notificationMonitor) : []
      };
    });
    
    console.log('🔔 알림 서비스 상태:', notificationServices);
    
    // 알림 기능 테스트
    if (notificationServices.hasNotificationService) {
      const notificationTest = await page.evaluate(async () => {
        try {
          const result = await window.notificationService.getNotifications();
          return {
            success: result.success,
            hasData: !!result.data,
            error: result.error
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      });
      
      console.log('📋 알림 데이터 테스트:', notificationTest);
      expect(notificationTest.success).toBe(true);
    }
    
    console.log('✅ Step 3 완료: 알림 시스템 통합 정상');
  });

  test('Step 4: 성능 및 접근성 검증', async ({ page }) => {
    console.log('\n=== Step 4: 성능 및 접근성 검증 ===');
    
    // 성능 메트릭 수집
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      return {
        loadTime: navigation.loadEventEnd - navigation.navigationStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        resourceCount: performance.getEntriesByType('resource').length,
        memoryUsage: (performance as any).memory ? {
          used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024)
        } : null
      };
    });
    
    console.log('⚡ 성능 메트릭:', performanceMetrics);
    
    // 접근성 검증
    const accessibilityCheck = await page.evaluate(() => {
      return {
        hasAriaLabels: document.querySelectorAll('[aria-label]').length,
        hasRoles: document.querySelectorAll('[role]').length,
        hasTabIndex: document.querySelectorAll('[tabindex]').length,
        hasHeadings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
        hasImages: document.querySelectorAll('img').length,
        hasImageAlts: document.querySelectorAll('img[alt]').length,
        hasButtons: document.querySelectorAll('button, [role="button"]').length,
        hasLinks: document.querySelectorAll('a').length
      };
    });
    
    console.log('♿ 접근성 지표:', accessibilityCheck);
    
    // 성능 기준 검증
    expect(performanceMetrics.loadTime).toBeLessThan(10000); // 10초 이내
    expect(performanceMetrics.domContentLoaded).toBeLessThan(5000); // 5초 이내
    
    // 접근성 기준 검증 (기본적인 요소들이 있어야 함)
    expect(accessibilityCheck.hasButtons).toBeGreaterThan(0);
    
    console.log('✅ Step 4 완료: 성능 및 접근성 검증 완료');
  });

  test('Step 5: 전체 시스템 상태 요약', async ({ page }) => {
    console.log('\n=== Step 5: 전체 시스템 상태 요약 ===');
    
    // 종합 상태 확인
    const systemStatus = await page.evaluate(() => {
      const checks = {
        react: {
          name: 'React 앱',
          status: document.querySelector('#root, main, [data-testid="app"]') !== null,
          score: 0
        },
        firebase: {
          name: 'Firebase 서비스',
          status: typeof window.firebase !== 'undefined' && typeof window.auth !== 'undefined',
          score: 0
        },
        notifications: {
          name: '알림 시스템',
          status: typeof window.notificationService !== 'undefined',
          score: 0
        },
        ui: {
          name: 'UI 인터페이스',
          status: document.querySelectorAll('button, a, input').length > 10,
          score: 0
        },
        navigation: {
          name: '네비게이션',
          status: document.querySelectorAll('nav, [role="navigation"], a').length > 0,
          score: 0
        }
      };
      
      // 점수 계산
      let totalScore = 0;
      const maxScore = Object.keys(checks).length * 20; // 각 항목당 20점
      
      Object.values(checks).forEach(check => {
        check.score = check.status ? 20 : 0;
        totalScore += check.score;
      });
      
      return {
        checks,
        totalScore,
        maxScore,
        percentage: Math.round((totalScore / maxScore) * 100),
        overallStatus: totalScore >= maxScore * 0.8 ? '우수' : 
                      totalScore >= maxScore * 0.6 ? '양호' : '개선 필요'
      };
    });
    
    console.log('\n📊 전체 시스템 상태 요약:');
    console.log(`   전체 점수: ${systemStatus.totalScore}/${systemStatus.maxScore} (${systemStatus.percentage}%)`);
    console.log(`   종합 평가: ${systemStatus.overallStatus}`);
    
    console.log('\n📋 개별 항목 점검:');
    Object.entries(systemStatus.checks).forEach(([key, check]) => {
      const icon = check.status ? '✅' : '❌';
      console.log(`   ${icon} ${check.name}: ${check.score}/20점`);
    });
    
    // 개선된 기준으로 검증 (80% 이상)
    expect(systemStatus.percentage).toBeGreaterThanOrEqual(80);
    
    console.log('\n🎉 전체 시스템 테스트 완료!');
    console.log(`✨ 최종 결과: ${systemStatus.overallStatus} (${systemStatus.percentage}%)`);
  });
});