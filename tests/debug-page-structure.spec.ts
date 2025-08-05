import { test, expect } from '@playwright/test';

// 페이지 구조 디버그 테스트

test('페이지 구조 분석', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  
  // 페이지 로딩 대기
  await page.waitForTimeout(2000);
  
  // 현재 URL 확인
  const currentUrl = page.url();
  console.log('현재 URL:', currentUrl);
  
  // 페이지 제목 확인
  const title = await page.title();
  console.log('페이지 제목:', title);
  
  // HTML 구조 확인
  const bodyContent = await page.evaluate(() => {
    return {
      hasBody: !!document.body,
      bodyClasses: document.body?.className || 'none',
      childrenCount: document.body?.children.length || 0,
      firstChild: document.body?.children[0]?.tagName || 'none',
      innerHTML: document.body?.innerHTML.slice(0, 500) || 'empty'
    };
  });
  
  console.log('Body 정보:', bodyContent);
  
  // 모든 요소 개수 확인
  const elementCounts = await page.evaluate(() => {
    return {
      divs: document.querySelectorAll('div').length,
      buttons: document.querySelectorAll('button').length,
      inputs: document.querySelectorAll('input').length,
      forms: document.querySelectorAll('form').length,
      h1: document.querySelectorAll('h1').length,
      h2: document.querySelectorAll('h2').length,
      h3: document.querySelectorAll('h3').length,
      scripts: document.querySelectorAll('script').length,
      links: document.querySelectorAll('link').length
    };
  });
  
  console.log('요소 개수:', elementCounts);
  
  // 특정 텍스트 검색
  const textContent = await page.evaluate(() => {
    const texts = [];
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    let node;
    while (node = walker.nextNode()) {
      const text = node.textContent?.trim();
      if (text && text.length > 2) {
        texts.push(text);
      }
    }
    
    return texts.slice(0, 10); // 처음 10개만
  });
  
  console.log('페이지 텍스트 내용:', textContent);
  
  // React 앱 로딩 확인
  const reactRoot = await page.locator('#root').count();
  console.log('React root 요소:', reactRoot);
  
  if (reactRoot > 0) {
    const rootContent = await page.locator('#root').innerHTML();
    console.log('Root 내용 (처음 300자):', rootContent.slice(0, 300));
  }
  
  // 에러가 있는지 확인
  const errors = await page.evaluate(() => {
    const errorElements = document.querySelectorAll('[class*="error"], [role="alert"]');
    return Array.from(errorElements).map(el => el.textContent);
  });
  
  console.log('에러 메시지:', errors);
  
  // 최소한 페이지가 로딩되었는지 확인
  expect(bodyContent.hasBody).toBeTruthy();
});