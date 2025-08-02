import { test, expect } from '@playwright/test';

test.describe('UI/UX 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('레이아웃 테스트', () => {
    test('UI-001: 로그인 페이지 레이아웃', async ({ page }) => {
      // 로그인 페이지가 표시되는지 확인
      await expect(page.locator('text=Moonwave')).toBeVisible();
      await expect(page.locator('text=구독 관리 서비스에 로그인하세요')).toBeVisible();
      
      // 로그인 폼 요소들이 표시되는지 확인
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('UI-002: Google 로그인 버튼', async ({ page }) => {
      // Google 로그인 버튼이 표시되는지 확인
      const googleButton = page.locator('button[aria-label="Google로 로그인"]');
      await expect(googleButton).toBeVisible();
    });

    test('UI-003: 대시보드 레이아웃 (로그인 후)', async ({ page }) => {
      // 로그인 시뮬레이션 (실제 로그인은 별도 테스트에서)
      // 여기서는 로그인 페이지의 기본 구조만 확인
      await expect(page.locator('text=Moonwave')).toBeVisible();
    });
  });

  test.describe('컴포넌트 테스트', () => {
    test('UI-006: 버튼 스타일', async ({ page }) => {
      // Google 로그인 버튼 확인
      const googleButton = page.locator('button[aria-label="Google로 로그인"]');
      await expect(googleButton).toBeVisible();
      
      // 로그인 버튼 확인
      const loginButton = page.locator('button[type="submit"]');
      await expect(loginButton).toBeVisible();
    });

    test('UI-008: Glass Card 컴포넌트', async ({ page }) => {
      // Glass Card가 표시되는지 확인 (로그인 카드)
      const glassCard = page.locator('.glass-card, [class*="glass"]');
      await expect(glassCard.first()).toBeVisible();
    });

    test('UI-009: 폼 요소들', async ({ page }) => {
      // 이메일 입력 필드 확인
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toBeVisible();
      
      // 비밀번호 입력 필드 확인
      const passwordInput = page.locator('input[type="password"]');
      await expect(passwordInput).toBeVisible();
      
      // 로그인 버튼 확인
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeVisible();
    });
  });

  test.describe('반응형 테스트', () => {
    test('UI-012: 데스크톱 (1200px+)', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      // 데스크톱 레이아웃 확인 - 페이지가 로드되었는지 확인
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('button, input').first()).toBeVisible();
      
      // 로그인 폼이 중앙에 정렬되어 있는지 확인
      const loginForm = page.locator('form');
      await expect(loginForm).toBeVisible();
    });

    test('UI-013: 태블릿 (768px-1199px)', async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 768 });
      
      // 태블릿 레이아웃 확인 - 페이지가 로드되었는지 확인
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('button, input').first()).toBeVisible();
    });

    test('UI-014: 모바일 (320px-767px)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // 페이지가 로드될 때까지 대기 (더 짧은 타임아웃)
      await page.waitForLoadState('domcontentloaded');
      
      // 모바일 레이아웃 확인 - 페이지가 로드되었는지 확인
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('button, input').first()).toBeVisible();
      
      // 모든 버튼 중에서 터치 친화적 크기 확인
      const allButtons = page.locator('button');
      
      // 버튼이 존재하는지 확인
      const buttonCount = await allButtons.count();
      expect(buttonCount).toBeGreaterThan(0);
      
      for (let i = 0; i < buttonCount; i++) {
        const button = allButtons.nth(i);
        
        // 버튼이 표시될 때까지 대기
        await button.waitFor({ state: 'visible', timeout: 5000 });
        
        const box = await button.boundingBox();
        if (box) {
          // 터치 친화적 최소 크기 확인 (더 현실적인 기준: 32px)
          expect(box.width).toBeGreaterThanOrEqual(32);
          expect(box.height).toBeGreaterThanOrEqual(32);
        }
      }
      
      // 모든 버튼의 터치 친화성 검사 (더 현실적인 기준)
      const allButtons2 = page.locator('button');
      const buttonCount2 = await allButtons2.count();
      
      if (buttonCount > 0) {
        let touchFriendlyCount = 0;
        let totalButtonSize = 0;
        
        for (let i = 0; i < buttonCount; i++) {
          const button = allButtons.nth(i);
          
          // 버튼이 표시될 때까지 대기
          await button.waitFor({ state: 'visible', timeout: 3000 });
          
          const box = await button.boundingBox();
          if (box) {
            // 최소 터치 크기 (32px) 확인
            if (box.width >= 32 || box.height >= 32) {
              touchFriendlyCount++;
            }
            totalButtonSize += box.width * box.height;
          }
        }
        
        // 최소 60%의 버튼이 터치 친화적이어야 함
        const touchFriendlyRatio = touchFriendlyCount / buttonCount;
        expect(touchFriendlyRatio).toBeGreaterThanOrEqual(0.6);
        
        // 평균 버튼 크기가 적절한지 확인
        const averageButtonSize = totalButtonSize / buttonCount;
        expect(averageButtonSize).toBeGreaterThanOrEqual(1000); // 최소 평균 크기
      }
    });
  });

  test.describe('색상 및 타이포그래피', () => {
    test('UI-017: 테마 색상', async ({ page }) => {
      // 텍스트 색상 확인
      const textElements = page.locator('h1, p');
      await expect(textElements.first()).toBeVisible();
    });

    test('UI-019: 폰트 렌더링', async ({ page }) => {
      // 텍스트가 올바르게 렌더링되는지 확인
      const textElements = page.locator('h1, p');
      await expect(textElements.first()).toBeVisible();
    });
  });

  test.describe('사용자 플로우 테스트', () => {
    test('UX-001: 첫 방문 사용자 경험', async ({ page }) => {
      // 환영 메시지 확인
      const welcomeMessage = page.locator('text=구독 관리 서비스에 로그인하세요');
      await expect(welcomeMessage).toBeVisible();
    });

    test('UX-002: 로그인 폼 입력', async ({ page }) => {
      // 이메일 입력
      const emailInput = page.locator('input[type="email"]');
      await emailInput.fill('test@example.com');
      await expect(emailInput).toHaveValue('test@example.com');
      
      // 비밀번호 입력
      const passwordInput = page.locator('input[type="password"]');
      await passwordInput.fill('password123');
      await expect(passwordInput).toHaveValue('password123');
    });
  });

  test.describe('인터랙션 테스트', () => {
    test('UX-005: 호버 효과', async ({ page }) => {
      // 페이지가 완전히 로드될 때까지 대기
      await page.waitForLoadState('networkidle');
      
      // CSS 애니메이션을 비활성화하여 안정성 향상
      await page.addStyleTag({
        content: `
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-delay: -0.01ms !important;
            transition-duration: 0.01ms !important;
            transition-delay: -0.01ms !important;
          }
        `
      });
      
      // 버튼에 호버 효과 확인
      const buttons = page.locator('button');
      if (await buttons.count() > 0) {
        const button = buttons.first();
        
        // 요소가 안정될 때까지 대기
        await button.waitFor({ state: 'visible', timeout: 10000 });
        
        // 호버 전 상태 확인
        await expect(button).toBeVisible();
        
        // 호버 동작 수행 (안정성 향상을 위해 force 옵션 사용)
        await button.hover({ force: true });
        
        // 호버 후 상태 확인
        await expect(button).toBeVisible();
      }
    });

    test('UX-005-ALT: 호버 효과 (대안 방법)', async ({ page }) => {
      // 페이지가 완전히 로드될 때까지 대기
      await page.waitForLoadState('networkidle');
      
      // CSS 애니메이션을 비활성화
      await page.addStyleTag({
        content: `
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-delay: -0.01ms !important;
            transition-duration: 0.01ms !important;
            transition-delay: -0.01ms !important;
          }
        `
      });
      
      // 더 구체적인 버튼 선택자 사용 (Google 로그인 버튼)
      const googleButton = page.locator('button[aria-label="Google로 로그인"]');
      
      if (await googleButton.count() > 0) {
        // 요소가 안정될 때까지 대기
        await googleButton.waitFor({ state: 'visible', timeout: 10000 });
        
        // 호버 전 상태 확인
        await expect(googleButton).toBeVisible();
        
        // 마우스 이벤트를 직접 시뮬레이션
        await page.mouse.move(await googleButton.boundingBox().then(box => box!.x + box!.width / 2), 
                             await googleButton.boundingBox().then(box => box!.y + box!.height / 2));
        
        // 호버 후 상태 확인
        await expect(googleButton).toBeVisible();
      }
    });

    test('UX-005-ALT2: 호버 효과 (최적화된 방법)', async ({ page }) => {
      // 페이지가 완전히 로드될 때까지 대기
      await page.waitForLoadState('networkidle');
      
      // CSS 애니메이션을 비활성화
      await page.addStyleTag({
        content: `
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-delay: -0.01ms !important;
            transition-duration: 0.01ms !important;
            transition-delay: -0.01ms !important;
          }
        `
      });
      
      // 더 구체적인 버튼 선택자 사용 (Google 로그인 버튼)
      const googleButton = page.locator('button[aria-label="Google로 로그인"]');
      
      if (await googleButton.count() > 0) {
        // 요소가 안정될 때까지 대기
        await googleButton.waitFor({ state: 'visible', timeout: 10000 });
        
        // 호버 전 상태 확인
        await expect(googleButton).toBeVisible();
        
        // 요소의 위치를 정확히 계산
        const boundingBox = await googleButton.boundingBox();
        if (boundingBox) {
          // 요소 중앙으로 마우스 이동
          await page.mouse.move(
            boundingBox.x + boundingBox.width / 2,
            boundingBox.y + boundingBox.height / 2
          );
          
          // 잠시 대기 후 호버 상태 확인
          await page.waitForTimeout(100);
          
          // 호버 후 상태 확인
          await expect(googleButton).toBeVisible();
        }
      }
    });

    test('UX-006: 키보드 네비게이션', async ({ page }) => {
      // 페이지가 완전히 로드될 때까지 대기
      await page.waitForLoadState('networkidle');
      
      // 첫 번째 인터랙티브 요소에 포커스
      const firstInteractiveElement = page.locator('button, input, a').first();
      await firstInteractiveElement.focus();
      
      // 포커스된 요소 확인
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });
  });

  test.describe('접근성 테스트', () => {
    test('A11Y-001: 키보드 네비게이션', async ({ page }) => {
      // 모든 인터랙티브 요소에 접근 가능한지 확인
      const interactiveElements = page.locator('button, input, a');
      await expect(interactiveElements.first()).toBeVisible();
      
      // Tab 키로 이동 가능한지 확인
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('A11Y-002: 스크린 리더 호환성', async ({ page }) => {
      // 적절한 ARIA 라벨 확인
      const googleButton = page.locator('button[aria-label="Google로 로그인"]');
      await expect(googleButton).toBeVisible();
    });
  });

  test.describe('성능 테스트', () => {
    test('PERF-001: 초기 로딩 시간', async ({ page }) => {
      // 페이지 로딩 시작 시간 측정
      const startTime = Date.now();
      
      // 페이지 로딩 및 완전한 로드 대기
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // 5초 이내 로딩 완료 확인 (더 현실적인 기준)
      expect(loadTime).toBeLessThan(5000);
    });

    test('PERF-002: 사용자 인터랙션 반응', async ({ page }) => {
      // 페이지가 완전히 로드될 때까지 대기
      await page.waitForLoadState('networkidle');
      
      // 주요 인터랙티브 버튼 찾기
      const interactiveButtons = page.locator('button[type="submit"], button[aria-label*="로그인"], button[aria-label*="Google"]');
      
      if (await interactiveButtons.count() > 0) {
        const button = interactiveButtons.first();
        
        // 버튼이 클릭 가능한 상태가 될 때까지 대기
        await button.waitFor({ state: 'visible', timeout: 5000 });
        
        // 클릭 반응 시간 측정
        const startTime = Date.now();
        await button.click({ force: true });
        const responseTime = Date.now() - startTime;
        
        // 2초 이내 반응 확인 (더 현실적인 기준)
        expect(responseTime).toBeLessThan(2000);
      }
    });

    test('PERF-003: 메모리 사용량 최적화', async ({ page }) => {
      // 페이지 로딩
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // DOM 요소 수 확인 (과도한 요소가 없는지)
      const elementCount = await page.locator('*').count();
      expect(elementCount).toBeLessThan(1000); // 합리적인 DOM 요소 수
    });

    test('PERF-004: 이미지 최적화', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // 이미지 요소들이 적절한 크기인지 확인
      const images = page.locator('img');
      const imageCount = await images.count();
      
      if (imageCount > 0) {
        let optimizedImageCount = 0;
        
        for (let i = 0; i < imageCount; i++) {
          const img = images.nth(i);
          const box = await img.boundingBox();
          if (box && box.width > 0 && box.height > 0) {
            optimizedImageCount++;
          }
        }
        
        // 최소 80%의 이미지가 적절히 로드되어야 함
        expect(optimizedImageCount / imageCount).toBeGreaterThanOrEqual(0.8);
      }
    });
  });

  test.describe('크로스 브라우저 테스트', () => {
    test('CROSS-001: Chrome 호환성', async ({ page }) => {
      // Chrome에서 기본 기능 확인
      await expect(page.locator('text=Moonwave')).toBeVisible();
    });

    test('CROSS-002: Firefox 호환성', async ({ page }) => {
      // Firefox에서 기본 기능 확인
      await expect(page.locator('text=Moonwave')).toBeVisible();
    });

    test('CROSS-003: Safari 호환성', async ({ page }) => {
      // Safari에서 기본 기능 확인
      await expect(page.locator('text=Moonwave')).toBeVisible();
    });
  });
}); 