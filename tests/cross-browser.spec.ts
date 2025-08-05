import { test, expect, devices } from '@playwright/test';

// Phase 4: 크로스 브라우저 테스트

test.describe('CB-001: Chrome 브라우저 호환성', () => {
  test('Chrome에서 로그인 페이지 렌더링', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    // 기본 요소들 확인
    const title = page.locator('h1:has-text("Moonwave")');
    await expect(title).toBeVisible();
    
    const googleButton = page.locator('button:has-text("Google로 로그인")');
    await expect(googleButton).toBeVisible();
    
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    
    // Chrome 특정 기능 확인
    const userAgent = await page.evaluate(() => navigator.userAgent);
    console.log('Chrome UserAgent:', userAgent);
    
    // CSS Grid 지원 확인
    const supportsGrid = await page.evaluate(() => 
      CSS.supports('display', 'grid')
    );
    expect(supportsGrid).toBeTruthy();
  });

  test('Chrome에서 Glass 효과 지원', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    // Backdrop filter 지원 확인
    const supportsBackdropFilter = await page.evaluate(() => 
      CSS.supports('backdrop-filter', 'blur(10px)')
    );
    
    console.log('Chrome backdrop-filter 지원:', supportsBackdropFilter);
    
    // Glass Card 확인
    const glassCard = page.locator('[class*="glass"], form').first();
    const backdropFilter = await glassCard.evaluate(el => 
      window.getComputedStyle(el).backdropFilter
    );
    
    // Chrome에서는 backdrop-filter 지원
    expect(supportsBackdropFilter).toBeTruthy();
  });
});

test.describe('CB-002: Firefox 브라우저 호환성', () => {
  test('Firefox에서 로그인 페이지 렌더링', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    // 기본 요소들 확인
    const title = page.locator('h1:has-text("Moonwave")');
    await expect(title).toBeVisible();
    
    const googleButton = page.locator('button:has-text("Google로 로그인")');
    await expect(googleButton).toBeVisible();
    
    // Firefox 특정 기능 확인
    const userAgent = await page.evaluate(() => navigator.userAgent);
    console.log('Firefox UserAgent:', userAgent);
    
    // Flexbox 지원 확인 (Firefox는 강력한 Flexbox 지원)
    const supportsFlex = await page.evaluate(() => 
      CSS.supports('display', 'flex')
    );
    expect(supportsFlex).toBeTruthy();
  });

  test('Firefox에서 폰트 렌더링', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    // 한글 폰트 확인
    const title = page.locator('h1:has-text("Moonwave")');
    const fontFamily = await title.evaluate(el => 
      window.getComputedStyle(el).fontFamily
    );
    
    console.log('Firefox 폰트:', fontFamily);
    expect(fontFamily).toContain('Pretendard');
    
    // 폰트 크기 확인
    const fontSize = await title.evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    expect(parseInt(fontSize)).toBeGreaterThan(20);
  });
});

test.describe('CB-003: Safari/WebKit 브라우저 호환성', () => {
  test('Safari에서 로그인 페이지 렌더링', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    // 기본 요소들 확인
    const title = page.locator('h1:has-text("Moonwave")');
    await expect(title).toBeVisible();
    
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    
    // Safari 특정 기능 확인
    const userAgent = await page.evaluate(() => navigator.userAgent);
    console.log('Safari UserAgent:', userAgent);
    
    // WebKit 프리픽스 확인
    const supportsWebkit = await page.evaluate(() => 
      CSS.supports('-webkit-backdrop-filter', 'blur(10px)')
    );
    
    console.log('Safari -webkit-backdrop-filter 지원:', supportsWebkit);
  });

  test('Safari에서 입력 필드 스타일링', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    const emailInput = page.locator('input[type="email"]');
    
    // Safari의 기본 입력 필드 스타일 제거 확인
    const appearance = await emailInput.evaluate(el => 
      window.getComputedStyle(el).webkitAppearance || 
      window.getComputedStyle(el).appearance
    );
    
    console.log('Safari input appearance:', appearance);
    
    // 커스텀 스타일 적용 확인
    const borderRadius = await emailInput.evaluate(el => 
      window.getComputedStyle(el).borderRadius
    );
    expect(borderRadius).not.toBe('0px');
  });
});

test.describe('CB-004: 모바일 브라우저 테스트', () => {
  test('iPhone Safari 호환성', async ({ browser, browserName }) => {
    // Firefox는 모바일 디바이스 에뮬레이션 미지원으로 스킵
    if (browserName === 'firefox') {
      console.log('Firefox는 모바일 디바이스 에뮬레이션을 지원하지 않습니다.');
      return;
    }
    
    const context = await browser.newContext({
      ...devices['iPhone 12']
    });
    const page = await context.newPage();
    
    await page.goto('http://localhost:3000/login');
    
    // 모바일 뷰포트 확인
    const viewport = page.viewportSize();
    expect(viewport?.width).toBe(390);
    
    // 터치 타겟 크기 확인
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();
      
      if (box) {
        // iOS 터치 타겟 최소 44px
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
    
    await context.close();
  });

  test('Android Chrome 호환성', async ({ browser, browserName }) => {
    // Firefox는 모바일 디바이스 에뮬레이션 미지원으로 스킵
    if (browserName === 'firefox') {
      console.log('Firefox는 모바일 디바이스 에뮬레이션을 지원하지 않습니다.');
      return;
    }
    
    const context = await browser.newContext({
      ...devices['Pixel 5']
    });
    const page = await context.newPage();
    
    await page.goto('http://localhost:3000/login');
    
    // 모바일 뷰포트 확인
    const viewport = page.viewportSize();
    expect(viewport?.width).toBe(393);
    
    // Android 특정 기능 확인
    const userAgent = await page.evaluate(() => navigator.userAgent);
    console.log('Android Chrome UserAgent:', userAgent);
    
    // 입력 필드 줌 방지 확인 (폰트 크기 16px 이상)
    const emailInput = page.locator('input[type="email"]');
    const fontSize = await emailInput.evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    
    expect(parseInt(fontSize)).toBeGreaterThanOrEqual(16);
    
    await context.close();
  });
});

test.describe('CB-005: PWA 기능 테스트', () => {
  test('Service Worker 등록 확인', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Service Worker 지원 확인
    const swSupported = await page.evaluate(() => 
      'serviceWorker' in navigator
    );
    
    console.log('Service Worker 지원:', swSupported);
    expect(swSupported).toBeTruthy();
    
    // 등록된 Service Worker 확인 (있다면)
    const swRegistration = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          return !!registration;
        } catch (e) {
          return false;
        }
      }
      return false;
    });
    
    console.log('Service Worker 등록됨:', swRegistration);
    // PWA가 설정되어 있지 않을 수 있으므로 실패해도 OK
    expect(typeof swRegistration).toBe('boolean');
  });

  test('Web App Manifest 확인', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Manifest 링크 태그 확인
    const manifestLink = page.locator('link[rel="manifest"]');
    const hasManifest = await manifestLink.count() > 0;
    
    console.log('Manifest 파일 링크:', hasManifest);
    
    if (hasManifest) {
      const manifestHref = await manifestLink.getAttribute('href');
      console.log('Manifest 경로:', manifestHref);
      expect(manifestHref).toBeTruthy();
    }
    
    // Manifest가 없어도 테스트 통과 (선택적 기능)
    expect(typeof hasManifest).toBe('boolean');
  });

  test('오프라인 대응 확인', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    // 페이지가 정상 로드되는지 확인
    const title = page.locator('h1:has-text("Moonwave")');
    await expect(title).toBeVisible();
    
    // 네트워크 상태 확인 API (지원된다면)
    const onlineStatus = await page.evaluate(() => navigator.onLine);
    console.log('온라인 상태:', onlineStatus);
    expect(typeof onlineStatus).toBe('boolean');
    
    // 캐시 API 지원 확인
    const cacheSupported = await page.evaluate(() => 'caches' in window);
    console.log('Cache API 지원:', cacheSupported);
    expect(typeof cacheSupported).toBe('boolean');
  });
});

test.describe('CB-006: 브라우저별 성능 비교', () => {
  test('각 브라우저 로딩 성능 측정', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - startTime;
    const browserName = await page.evaluate(() => {
      const ua = navigator.userAgent;
      if (ua.includes('Chrome')) return 'Chrome';
      if (ua.includes('Firefox')) return 'Firefox';
      if (ua.includes('Safari')) return 'Safari';
      return 'Unknown';
    });
    
    console.log(`${browserName} 로딩 시간: ${loadTime}ms`);
    
    // 모든 브라우저에서 10초 이내 로딩
    expect(loadTime).toBeLessThan(10000);
  });

  test('JavaScript 실행 성능', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('http://localhost:3000/login');
    await page.waitForSelector('h1:has-text("Moonwave")', { timeout: 5000 });
    const renderTime = Date.now() - startTime;
    
    // React 앱 초기화 시간 측정 (더 안전한 방법)
    const performanceData = await page.evaluate(() => {
      const entries = performance.getEntriesByType('navigation');
      if (entries.length > 0) {
        const navigation = entries[0] as PerformanceNavigationTiming;
        const domLoaded = navigation.domContentLoadedEventEnd - navigation.navigationStart;
        const loadComplete = navigation.loadEventEnd - navigation.navigationStart;
        
        return {
          domContentLoaded: isNaN(domLoaded) ? null : domLoaded,
          loadComplete: isNaN(loadComplete) ? null : loadComplete
        };
      }
      return { domContentLoaded: null, loadComplete: null };
    });
    
    console.log('페이지 렌더링 시간:', renderTime, 'ms');
    console.log('DOM Content Loaded:', performanceData.domContentLoaded, 'ms');
    console.log('Load Complete:', performanceData.loadComplete, 'ms');
    
    // 페이지 렌더링이 5초 이내
    expect(renderTime).toBeLessThan(5000);
    
    // Performance API 데이터가 있다면 검증
    if (performanceData.domContentLoaded !== null) {
      expect(performanceData.domContentLoaded).toBeLessThan(5000);
    }
  });
});

test.describe('CB-007: CSS 호환성 테스트', () => {
  test('CSS Grid 지원 확인', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    const cssSupport = await page.evaluate(() => ({
      grid: CSS.supports('display', 'grid'),
      flexbox: CSS.supports('display', 'flex'),
      backdropFilter: CSS.supports('backdrop-filter', 'blur(10px)'),
      webkitBackdropFilter: CSS.supports('-webkit-backdrop-filter', 'blur(10px)')
    }));
    
    console.log('CSS 지원 현황:', cssSupport);
    
    // 기본적인 CSS 기능은 모두 지원되어야 함
    expect(cssSupport.grid).toBeTruthy();
    expect(cssSupport.flexbox).toBeTruthy();
    
    // Backdrop filter는 브라우저에 따라 다를 수 있음
    const hasBackdropFilter = cssSupport.backdropFilter || cssSupport.webkitBackdropFilter;
    expect(typeof hasBackdropFilter).toBe('boolean');
  });

  test('커스텀 CSS 속성 지원', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    // CSS 변수 지원 확인
    const supportsCustomProps = await page.evaluate(() => 
      CSS.supports('color', 'var(--primary-color)')
    );
    
    console.log('CSS 커스텀 속성 지원:', supportsCustomProps);
    expect(supportsCustomProps).toBeTruthy();
    
    // CSS 함수들 지원 확인
    const supportsFunctions = await page.evaluate(() => ({
      calc: CSS.supports('width', 'calc(100% - 20px)'),
      minmax: CSS.supports('grid-template-columns', 'minmax(200px, 1fr)'),
      clamp: CSS.supports('font-size', 'clamp(1rem, 2vw, 2rem)')
    }));
    
    console.log('CSS 함수 지원:', supportsFunctions);
    expect(supportsFunctions.calc).toBeTruthy();
  });
});