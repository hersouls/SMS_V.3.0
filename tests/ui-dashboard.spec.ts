import { test, expect } from '@playwright/test';

// 대시보드 UI 테스트 (로그인 없이 구조만 확인)

test.describe('대시보드 UI 구조 테스트', () => {
  test('대시보드 직접 접근 시 로그인 리다이렉트', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // 로그인 페이지로 리다이렉트되는지 확인
    await expect(page).toHaveURL(/.*login/);
  });

  test('구독 페이지 직접 접근 시 로그인 리다이렉트', async ({ page }) => {
    await page.goto('http://localhost:3000/subscriptions');
    
    // 로그인 페이지로 리다이렉트되는지 확인
    await expect(page).toHaveURL(/.*login/);
  });

  test('설정 페이지 직접 접근 시 로그인 리다이렉트', async ({ page }) => {
    await page.goto('http://localhost:3000/settings');
    
    // 로그인 페이지로 리다이렉트되는지 확인
    await expect(page).toHaveURL(/.*login/);
  });
});

// Glass Card 컴포넌트 스타일 테스트
test.describe('Glass Card 효과 테스트', () => {
  test('로그인 페이지의 Glass Card 효과', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    // Glass Card 스타일을 가진 요소 찾기
    const cards = page.locator('[class*="backdrop"], [class*="glass"], [class*="blur"]');
    const cardCount = await cards.count();
    
    if (cardCount > 0) {
      const firstCard = cards.first();
      const styles = await firstCard.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          backdropFilter: computed.backdropFilter,
          background: computed.background,
          backgroundColor: computed.backgroundColor,
          border: computed.border,
          borderRadius: computed.borderRadius
        };
      });
      
      console.log('Glass Card styles:', styles);
      
      // Glass 효과 관련 스타일 확인
      const hasGlassEffect = 
        styles.backdropFilter !== 'none' ||
        styles.background.includes('rgba') ||
        styles.backgroundColor.includes('rgba');
      
      expect(hasGlassEffect).toBeTruthy();
    }
  });
});

// 버튼 컴포넌트 테스트
test.describe('버튼 시스템 테스트', () => {
  test('로그인 페이지 버튼 스타일', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    // 제출 버튼 찾기
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    
    // 버튼 스타일 확인
    const buttonStyles = await submitButton.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        backgroundColor: computed.backgroundColor,
        color: computed.color,
        padding: computed.padding,
        borderRadius: computed.borderRadius,
        minHeight: computed.minHeight || computed.height
      };
    });
    
    console.log('Button styles:', buttonStyles);
    
    // 버튼이 적절한 스타일을 가지고 있는지 확인
    expect(buttonStyles.borderRadius).not.toBe('0px'); // 둥근 모서리
  });

  test('버튼 호버 효과', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    const submitButton = page.locator('button[type="submit"]');
    
    // 호버 전 스타일
    const beforeHover = await submitButton.evaluate(el => 
      window.getComputedStyle(el).transform
    );
    
    // 호버
    await submitButton.hover();
    await page.waitForTimeout(100); // 트랜지션 대기
    
    // 호버 후 스타일
    const afterHover = await submitButton.evaluate(el => 
      window.getComputedStyle(el).transform
    );
    
    console.log('Hover effect:', { beforeHover, afterHover });
  });
});

// 입력 필드 테스트
test.describe('폼 입력 필드 테스트', () => {
  test('입력 필드 스타일 및 포커스 효과', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    const emailInput = page.locator('input[type="email"]');
    
    // 기본 스타일
    const defaultStyles = await emailInput.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        border: computed.border,
        outline: computed.outline,
        backgroundColor: computed.backgroundColor
      };
    });
    
    // 포커스
    await emailInput.focus();
    
    // 포커스 스타일
    const focusStyles = await emailInput.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        border: computed.border,
        outline: computed.outline,
        boxShadow: computed.boxShadow
      };
    });
    
    console.log('Input styles:', { defaultStyles, focusStyles });
    
    // 포커스 시 시각적 피드백이 있는지 확인
    const hasFocusEffect = 
      focusStyles.outline !== 'none' ||
      focusStyles.boxShadow !== 'none' ||
      focusStyles.border !== defaultStyles.border;
    
    expect(hasFocusEffect).toBeTruthy();
  });
});

// 반응형 그리드 테스트
test.describe('반응형 레이아웃 테스트', () => {
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 }
  ];

  for (const viewport of viewports) {
    test(`${viewport.name} 레이아웃 (${viewport.width}x${viewport.height})`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('http://localhost:3000/login');
      
      // 로그인 카드 크기 확인
      const loginCard = page.locator('form').first();
      const box = await loginCard.boundingBox();
      
      if (box) {
        console.log(`${viewport.name} card size:`, { width: box.width, height: box.height });
        
        // 뷰포트에 따른 적절한 크기 확인
        if (viewport.width < 768) {
          // 모바일: 카드가 화면 너비의 65% 이상을 차지해야 함
          expect(box.width).toBeGreaterThan(viewport.width * 0.65);
          expect(box.width).toBeLessThan(viewport.width * 0.95); // 너무 넓지 않아야 함
        } else {
          // 태블릿/데스크톱: 카드가 적절한 최대 너비를 가져야 함
          expect(box.width).toBeLessThan(600);
        }
      }
    });
  }
});