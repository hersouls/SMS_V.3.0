import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from './test-config';

const TEST_USER = TEST_CONFIG.TEST_USER;

test.describe('간단한 로그인 테스트', () => {
  test('기본 로그인 테스트', async ({ page }) => {
    // 1. 홈페이지로 이동
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 2. 로그인 페이지로 이동
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // 3. 로그인 폼이 로드될 때까지 대기
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });
    await page.waitForSelector('button[type="submit"]', { timeout: 10000 });
    
    // 4. 로그인 정보 입력
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    
    // 5. 잠시 대기 후 로그인 버튼 클릭
    await page.waitForTimeout(2000);
    
    // 6. 로그인 버튼 클릭
    await page.click('button[type="submit"]');
    
    // 7. 로그인 성공 확인 (대시보드로 리다이렉트)
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
  });

  test('로그인 상태 확인', async ({ page }) => {
    // 1. 로그인
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });
    await page.waitForSelector('button[type="submit"]', { timeout: 10000 });
    
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    
    await page.waitForTimeout(2000);
    await page.click('button[type="submit"]');
    
    // 2. 로그인 상태 확인
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
    
    // 3. 로그아웃 버튼이 있는지 확인
    await page.waitForSelector('button[aria-label="로그아웃"]', { timeout: 10000 });
    
    // 4. 로그아웃
    await page.click('button[aria-label="로그아웃"]');
    
    // 5. 로그아웃 확인
    await expect(page).toHaveURL('/login');
  });
}); 