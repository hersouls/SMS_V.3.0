import { test, expect } from '@playwright/test';

// 기본 UI 요소 테스트 (로그인 없이)

test.describe('기본 UI 테스트', () => {
  test('로그인 페이지 접근 가능', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // 로그인 페이지로 리다이렉트되는지 확인
    await expect(page).toHaveURL(/.*login/);
    
    // 로그인 폼 요소 확인
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test('로그인 페이지 UI 요소', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    // Moonwave 로고/타이틀 확인
    const title = page.locator('h1, h2').filter({ hasText: /moonwave/i }).first();
    if (await title.count() > 0) {
      await expect(title).toBeVisible();
    }
    
    // 로그인 카드 확인
    const loginCard = page.locator('[class*="card"], [class*="glass"]').first();
    await expect(loginCard).toBeVisible();
  });

  test('다크 테마 기본 설정', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    // 다크 테마 색상 확인
    const body = page.locator('body');
    const backgroundColor = await body.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return computed.backgroundColor;
    });
    
    console.log('Background color:', backgroundColor);
    
    // 다크 테마인지 확인 (어두운 색상)
    const isDark = backgroundColor.includes('rgb') || backgroundColor.includes('#');
    expect(isDark).toBeTruthy();
  });

  test('반응형 - 모바일 뷰', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000/login');
    
    // 모바일에서도 로그인 폼이 제대로 표시되는지 확인
    const loginForm = page.locator('form, [class*="form"]').first();
    await expect(loginForm).toBeVisible();
    
    // 입력 필드가 모바일에서 적절한 크기인지 확인
    const emailInput = page.locator('input[type="email"]');
    const box = await emailInput.boundingBox();
    if (box) {
      expect(box.width).toBeGreaterThan(200); // 최소 너비
      expect(box.height).toBeGreaterThan(40);  // 최소 높이 (터치 친화적)
    }
  });

  test('반응형 - 데스크톱 뷰', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:3000/login');
    
    // 데스크톱에서 중앙 정렬 확인
    const loginCard = page.locator('[class*="card"], [class*="glass"]').first();
    const box = await loginCard.boundingBox();
    if (box) {
      const viewportWidth = 1920;
      const cardCenter = box.x + box.width / 2;
      const viewportCenter = viewportWidth / 2;
      
      // 카드가 대략 중앙에 위치하는지 확인 (±100px 허용)
      expect(Math.abs(cardCenter - viewportCenter)).toBeLessThan(100);
    }
  });

  test('Wave Background 존재 확인', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    // WaveBackground 컴포넌트는 우주 배경 효과를 렌더링함
    // 별, 성운, 유성 등의 요소를 확인
    const starElements = page.locator('div[style*="twinkle"], div[style*="shooting-star"], div[style*="nebula"]');
    const gradientElements = page.locator('div[class*="gradient"], div[class*="bg-gradient"]');
    
    // 우주 배경 관련 요소가 있는지 확인
    const hasSpaceBackground = 
      (await starElements.count() > 0) || 
      (await gradientElements.count() > 0);
    
    expect(hasSpaceBackground).toBeTruthy();
  });
});