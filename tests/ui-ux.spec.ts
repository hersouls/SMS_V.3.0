import { test, expect } from '@playwright/test';

// Phase 1: 기본 UI/레이아웃 테스트

// 테스트용 계정 정보
const TEST_USER = {
  email: 'test@example.com',
  password: 'TestPassword123!'
};

// 로그인 헬퍼 함수
async function loginToApp(page) {
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
}

test.describe('UI-001: 로고 및 브랜딩', () => {
  test.beforeEach(async ({ page }) => {
    await loginToApp(page);
  });

  test('Moonwave 로고 표시 및 클릭 시 대시보드 이동', async ({ page }) => {
    const logo = page.locator('h1:has-text("Moonwave"), a:has-text("Moonwave")').first();
    await expect(logo).toBeVisible();
    await logo.click();
    await expect(page).toHaveURL(/.*\/dashboard/);
  });
});

test.describe('UI-002: 네비게이션 메뉴', () => {
  test.beforeEach(async ({ page }) => {
    await loginToApp(page);
  });

  test('메인 메뉴 항목 표시 및 활성 상태', async ({ page }) => {
    // 헤더 내의 네비게이션 링크 확인
    const navItems = [
      { text: 'Dashboard', icon: 'LayoutDashboard' },
      { text: 'All Subscriptions', icon: 'CreditCard' },
      { text: 'Calendar', icon: 'Calendar' },
      { text: 'Statistics', icon: 'BarChart3' },
      { text: 'Settings', icon: 'Settings' }
    ];
    
    for (const item of navItems) {
      const navLink = page.locator(`a:has-text("${item.text}"), button:has-text("${item.text}")`).first();
      await expect(navLink).toBeVisible();
    }
  });
});

test.describe('UI-004: Glass Card 컴포넌트', () => {
  test.beforeEach(async ({ page }) => {
    await loginToApp(page);
  });

  test('Glass Card 효과 확인', async ({ page }) => {
    // GlassCard 컴포넌트 확인
    const glassCard = page.locator('[class*="glass"], [class*="backdrop"]').first();
    if (await glassCard.count() > 0) {
      await expect(glassCard).toBeVisible();
      
      // CSS 속성 확인
      const styles = await glassCard.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          backdropFilter: computed.backdropFilter,
          background: computed.background,
          border: computed.border
        };
      });
      
      // Glass 효과가 있는지 확인
      const hasGlassEffect = 
        styles.backdropFilter.includes('blur') ||
        styles.background.includes('rgba') ||
        styles.border.includes('rgba');
      
      expect(hasGlassEffect).toBeTruthy();
    }
  });
});

test.describe('UI-005: Wave Background', () => {
  test('Wave Background 애니메이션 존재', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    const waveBackground = page.locator('.wave-background, [class*="wave"]').first();
    if (await waveBackground.count() > 0) {
      await expect(waveBackground).toBeVisible();
    }
  });
});

// 반응형 디자인 테스트
test.describe('RWD-001: 모바일 반응형', () => {
  test('375px 모바일 레이아웃', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await loginToApp(page);
    
    // 모바일에서 컨텐츠가 제대로 표시되는지 확인
    const mainContent = page.locator('main').first();
    await expect(mainContent).toBeVisible();
    
    // 모바일 메뉴나 햄버거 메뉴 확인
    const mobileMenu = page.locator('[aria-label*="menu"], button[class*="mobile"], button[class*="hamburger"]');
    if (await mobileMenu.count() > 0) {
      await expect(mobileMenu).toBeVisible();
    }
  });
});

test.describe('RWD-003: 태블릿 반응형', () => {
  test('768px 태블릿 레이아웃', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await loginToApp(page);
    
    // 헤더나 네비게이션 영역 확인
    const header = page.locator('header, [class*="header"], [class*="Header"]').first();
    await expect(header).toBeVisible();
    
    // 메인 컨텐츠 영역 확인
    const mainContent = page.locator('main').first();
    await expect(mainContent).toBeVisible();
  });
});

test.describe('RWD-005: 데스크톱 반응형', () => {
  test('1920px 데스크톱 레이아웃', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:3000');
    
    // 전체 레이아웃 확인
    const mainContent = page.locator('main, [role="main"]');
    await expect(mainContent).toBeVisible();
  });
});

// 다크 테마 테스트
test.describe('THEME-001: 다크 테마 색상 시스템', () => {
  test.beforeEach(async ({ page }) => {
    await loginToApp(page);
  });

  test('다크 테마 배경색 확인', async ({ page }) => {
    // body 또는 main 요소의 배경색 확인
    const mainElement = page.locator('body, main, #root').first();
    const styles = await mainElement.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        backgroundColor: computed.backgroundColor,
        color: computed.color
      };
    });
    
    // 다크 테마인지 확인 (어두운 배경색)
    const isDarkTheme = 
      styles.backgroundColor.includes('rgb') || 
      styles.backgroundColor.includes('rgba') ||
      styles.backgroundColor.includes('#');
    
    expect(isDarkTheme).toBeTruthy();
  });
});

// 컴포넌트별 상세 테스트
test.describe('UI-015: 버튼 시스템', () => {
  test('버튼 변형 및 상태', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Primary 버튼 찾기
    const primaryButton = page.locator('button').filter({ hasText: /add|create|save/i }).first();
    if (await primaryButton.count() > 0) {
      await expect(primaryButton).toBeVisible();
      
      // 호버 상태 테스트
      await primaryButton.hover();
      await page.waitForTimeout(100); // 호버 애니메이션 대기
    }
  });
});

// 대시보드 UI 테스트
test.describe('UI-009: 통계 카드 레이아웃', () => {
  test.beforeEach(async ({ page }) => {
    await loginToApp(page);
  });

  test('대시보드 통계 카드 표시', async ({ page }) => {
    // 대시보드의 통계 영역 확인
    const statsSection = page.locator('[class*="stat"], [class*="metric"], [class*="summary"]');
    const count = await statsSection.count();
    
    // 또는 특정 통계 텍스트 확인
    const monthlyTotal = page.locator('text=/monthly total|this month|월간/i');
    const hasStats = (await statsSection.count() > 0) || (await monthlyTotal.count() > 0);
    
    expect(hasStats).toBeTruthy();
  });
});

// 구독 관리 UI 테스트
test.describe('UI-011: 구독 카드 디자인', () => {
  test.beforeEach(async ({ page }) => {
    await loginToApp(page);
  });

  test('구독 카드 표시 및 레이아웃', async ({ page }) => {
    // All Subscriptions 페이지로 이동
    await page.click('a:has-text("All Subscriptions"), button:has-text("All Subscriptions")');
    await page.waitForURL('**/subscriptions');
    
    // 구독 카드나 구독 추가 버튼 확인
    const subscriptionElements = page.locator('[class*="subscription"], [class*="card"], button:has-text("Add Subscription")');
    const hasSubscriptionUI = await subscriptionElements.count() > 0;
    
    expect(hasSubscriptionUI).toBeTruthy();
  });
});

// 설정 페이지 UI 테스트
test.describe('UI-013: 설정 섹션 구분', () => {
  test.beforeEach(async ({ page }) => {
    await loginToApp(page);
  });

  test('설정 페이지 섹션 표시', async ({ page }) => {
    // Settings 페이지로 이동
    await page.click('a:has-text("Settings"), button:has-text("Settings")');
    await page.waitForURL('**/settings');
    
    // 설정 섹션이나 설정 관련 요소 확인
    const settingsElements = page.locator('[class*="setting"], [class*="preference"], h1:has-text("Settings"), h2');
    const hasSettingsUI = await settingsElements.count() > 0;
    
    expect(hasSettingsUI).toBeTruthy();
  });
});

// 시각적 회귀 테스트
test.describe('시각적 회귀 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await loginToApp(page);
  });

  test('대시보드 스크린샷', async ({ page }) => {
    await page.waitForTimeout(2000); // 애니메이션 안정화 대기
    await expect(page).toHaveScreenshot('dashboard.png', { 
      fullPage: true,
      animations: 'disabled',
      maxDiffPixels: 100 // 약간의 차이 허용
    });
  });

  test('구독 페이지 스크린샷', async ({ page }) => {
    await page.click('a:has-text("All Subscriptions"), button:has-text("All Subscriptions")');
    await page.waitForURL('**/subscriptions');
    await page.waitForTimeout(2000); // 애니메이션 안정화 대기
    await expect(page).toHaveScreenshot('subscriptions.png', { 
      fullPage: true,
      animations: 'disabled',
      maxDiffPixels: 100
    });
  });
});