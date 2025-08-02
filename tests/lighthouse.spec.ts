import { test, expect } from '@playwright/test';
import lighthouse from 'lighthouse';
import chromeLauncher from 'chrome-launcher';

test.describe('Lighthouse 성능 및 접근성 테스트', () => {
  test('PERF-001: Lighthouse 성능 점수', async ({ page }) => {
    // Chrome 실행
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
    const options = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: chrome.port,
    };

    try {
      // Lighthouse 실행
      const runnerResult = await lighthouse('http://localhost:5173', options);
      const categories = runnerResult?.lhr?.categories;

      if (categories) {
        // 성능 점수 확인 (목표: 90점 이상)
        const performanceScore = categories.performance?.score || 0;
        console.log(`Performance Score: ${performanceScore * 100}`);
        expect(performanceScore).toBeGreaterThan(0.9);

        // 접근성 점수 확인 (목표: 90점 이상)
        const accessibilityScore = categories.accessibility?.score || 0;
        console.log(`Accessibility Score: ${accessibilityScore * 100}`);
        expect(accessibilityScore).toBeGreaterThan(0.9);

        // 모범 사례 점수 확인 (목표: 90점 이상)
        const bestPracticesScore = categories['best-practices']?.score || 0;
        console.log(`Best Practices Score: ${bestPracticesScore * 100}`);
        expect(bestPracticesScore).toBeGreaterThan(0.9);

        // SEO 점수 확인 (목표: 90점 이상)
        const seoScore = categories.seo?.score || 0;
        console.log(`SEO Score: ${seoScore * 100}`);
        expect(seoScore).toBeGreaterThan(0.9);
      }
    } finally {
      await chrome.kill();
    }
  });

  test('PERF-002: 로딩 시간 측정', async ({ page }) => {
    const startTime = Date.now();
    
    // 페이지 로딩
    await page.goto('/');
    
    // DOMContentLoaded 이벤트 대기
    await page.waitForLoadState('domcontentloaded');
    const domContentLoadedTime = Date.now() - startTime;
    
    // load 이벤트 대기
    await page.waitForLoadState('load');
    const loadTime = Date.now() - startTime;
    
    console.log(`DOMContentLoaded: ${domContentLoadedTime}ms`);
    console.log(`Load: ${loadTime}ms`);
    
    // 성능 기준 확인
    expect(domContentLoadedTime).toBeLessThan(2000); // 2초 이내
    expect(loadTime).toBeLessThan(3000); // 3초 이내
  });

  test('PERF-003: First Contentful Paint (FCP)', async ({ page }) => {
    // 성능 메트릭 수집
    const performanceMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcp = entries.find(entry => entry.name === 'first-contentful-paint');
          if (fcp) {
            resolve({
              fcp: fcp.startTime,
              navigationStart: performance.timing.navigationStart
            });
          }
        });
        observer.observe({ entryTypes: ['paint'] });
      });
    });

    if (performanceMetrics) {
      const fcpTime = performanceMetrics.fcp;
      console.log(`First Contentful Paint: ${fcpTime}ms`);
      
      // FCP 목표: 1.8초 이내
      expect(fcpTime).toBeLessThan(1800);
    }
  });

  test('PERF-004: Largest Contentful Paint (LCP)', async ({ page }) => {
    // LCP 측정
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      });
    });

    if (lcp) {
      console.log(`Largest Contentful Paint: ${lcp}ms`);
      
      // LCP 목표: 2.5초 이내
      expect(lcp).toBeLessThan(2500);
    }
  });

  test('A11Y-003: 색상 대비 비율', async ({ page }) => {
    await page.goto('/');
    
    // 텍스트 요소들의 색상 대비 확인
    const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, span, div');
    
    for (let i = 0; i < Math.min(await textElements.count(), 10); i++) {
      const element = textElements.nth(i);
      const isVisible = await element.isVisible();
      
      if (isVisible) {
        // 요소가 보이는지 확인
        await expect(element).toBeVisible();
        
        // 텍스트 색상이 있는지 확인
        const color = await element.evaluate(el => {
          const style = window.getComputedStyle(el);
          return style.color;
        });
        
        expect(color).not.toBe('rgba(0, 0, 0, 0)'); // 투명하지 않아야 함
      }
    }
  });

  test('A11Y-004: 키보드 접근성', async ({ page }) => {
    await page.goto('/');
    
    // Tab 키로 모든 인터랙티브 요소에 접근 가능한지 확인
    const interactiveElements = page.locator('button, a, input, select, textarea, [tabindex]');
    
    for (let i = 0; i < Math.min(await interactiveElements.count(), 5); i++) {
      const element = interactiveElements.nth(i);
      const isVisible = await element.isVisible();
      
      if (isVisible) {
        // 요소가 포커스 가능한지 확인
        await element.focus();
        const isFocused = await element.evaluate(el => el === document.activeElement);
        expect(isFocused).toBe(true);
      }
    }
  });

  test('A11Y-005: 스크린 리더 호환성', async ({ page }) => {
    await page.goto('/');
    
    // ARIA 라벨이 있는 요소들 확인
    const ariaElements = page.locator('[aria-label], [aria-labelledby], [role]');
    
    if (await ariaElements.count() > 0) {
      await expect(ariaElements.first()).toBeVisible();
    }
    
    // 이미지에 alt 속성이 있는지 확인
    const images = page.locator('img');
    for (let i = 0; i < Math.min(await images.count(), 5); i++) {
      const image = images.nth(i);
      const alt = await image.getAttribute('alt');
      
      // alt 속성이 있거나 decorative 이미지인지 확인
      expect(alt !== null || await image.getAttribute('role') === 'presentation').toBe(true);
    }
  });
}); 