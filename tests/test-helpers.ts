import { Page, expect } from '@playwright/test';

/**
 * 안정적인 로그인 함수
 */
export async function stableLogin(page: Page, email: string, password: string) {
  // 로그인 페이지로 이동
  await page.goto('/login');
  
  // 페이지 로딩 대기
  await page.waitForLoadState('networkidle');
  
  // 이메일 입력
  await page.fill('input[type="email"]', email);
  
  // 비밀번호 입력
  await page.fill('input[type="password"]', password);
  
  // 로그인 버튼이 안정될 때까지 대기
  await page.waitForSelector('button[type="submit"]', { state: 'visible' });
  
  // 버튼 클릭 전 잠시 대기
  await page.waitForTimeout(1000);
  
  // 로그인 버튼 클릭
  await page.click('button[type="submit"]');
  
  // 로그인 성공 확인 (대시보드로 리다이렉트)
  await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
}

/**
 * 안정적인 버튼 클릭 함수
 */
export async function stableClick(page: Page, selector: string) {
  // 요소가 안정될 때까지 대기
  await page.waitForSelector(selector, { state: 'visible', timeout: 10000 });
  
  // 요소가 안정적일 때까지 대기
  await page.waitForFunction(
    (sel) => {
      const element = document.querySelector(sel);
      if (!element) return false;
      
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    },
    selector,
    { timeout: 10000 }
  );
  
  // 잠시 대기
  await page.waitForTimeout(500);
  
  // 클릭
  await page.click(selector);
}

/**
 * 안정적인 폼 입력 함수
 */
export async function stableFill(page: Page, selector: string, value: string) {
  await page.waitForSelector(selector, { state: 'visible' });
  await page.fill(selector, value);
  await page.waitForTimeout(200);
}

/**
 * 페이지 로딩 완료 대기 함수
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
}

/**
 * 로그인 상태 확인 함수
 */
export async function checkLoginStatus(page: Page) {
  try {
    // 대시보드 페이지에서 로그인 상태 확인
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // 로그아웃 버튼이 있으면 로그인된 상태
    const logoutButton = page.locator('button[aria-label="로그아웃"]');
    return await logoutButton.isVisible();
  } catch {
    return false;
  }
}

/**
 * 테스트 데이터 정리 함수
 */
export async function cleanupTestData(page: Page) {
  try {
    // 구독 목록으로 이동
    await page.goto('/subscriptions');
    await page.waitForLoadState('networkidle');
    
    // 테스트 구독 삭제
    const testSubscriptions = page.locator('text=Netflix');
    const count = await testSubscriptions.count();
    
    for (let i = 0; i < count; i++) {
      await testSubscriptions.first().click();
      await stableClick(page, 'button[aria-label="삭제"]');
      await stableClick(page, 'button[aria-label="확인"]');
      await page.waitForTimeout(1000);
    }
  } catch (error) {
    console.log('테스트 데이터 정리 중 오류:', error);
  }
} 