import { Page } from '@playwright/test';

export const TEST_USER = {
  email: 'test@moonwave.com',
  password: 'Test123!'
};

export async function loginToApp(page: Page): Promise<void> {
  try {
    // 로그인 페이지로 이동
    await page.goto('http://localhost:3000/login');
    
    // 로그인 폼이 로드될 때까지 대기
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    // 이메일과 비밀번호 입력
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    
    // 로그인 버튼 클릭
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // 대시보드로 리다이렉트될 때까지 대기
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  } catch (error) {
    console.error('Login failed:', error);
    // 로그인 실패 시 스크린샷 캡처
    await page.screenshot({ path: 'tests/screenshots/login-error.png' });
    throw error;
  }
}

export async function ensureLoggedOut(page: Page): Promise<void> {
  // 로컬 스토리지 클리어
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  
  // 쿠키 삭제
  await page.context().clearCookies();
}