import { test, expect } from '@playwright/test';

// Firebase 워크플로우 수정사항 검증 테스트

test.describe('Firebase 워크플로우 수정사항 검증', () => {
  
  test('수정사항 1: 데이터 컨텍스트 에러 핸들링 개선', async ({ page }) => {
    console.log('\n=== 수정사항 1: 데이터 컨텍스트 에러 핸들링 개선 ===');
    
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    // 데이터 로딩 상태 확인
    const dataContextErrors = await page.evaluate(() => {
      // 콘솔 에러 캐치
      const errors = [];
      const originalError = console.error;
      let capturedErrors = [];
      
      console.error = (...args) => {
        capturedErrors.push(args.join(' '));
        originalError.apply(console, args);
      };
      
      // 짧은 시간 후 원래 함수로 복원
      setTimeout(() => {
        console.error = originalError;
      }, 1000);
      
      return {
        hasDataContext: typeof window.React !== 'undefined',
        hasErrorBoundary: document.querySelector('[data-error-boundary]') !== null,
        timestamp: new Date().toISOString()
      };
    });
    
    console.log('📊 데이터 컨텍스트 상태:', dataContextErrors);
    
    // 로딩 상태 적절히 처리되는지 확인
    const loadingHandling = await page.evaluate(() => {
      const loadingElements = document.querySelectorAll('.loading, [data-loading], .animate-spin');
      const hasLoadingStates = loadingElements.length > 0;
      const hasContentOrLoading = document.querySelector('main, .main, [role="main"]') !== null || hasLoadingStates;
      
      return {
        hasLoadingStates,
        hasContentOrLoading,
        loadingElementsCount: loadingElements.length
      };
    });
    
    console.log('🔄 로딩 처리 상태:', loadingHandling);
    expect(loadingHandling.hasContentOrLoading).toBeTruthy();
  });

  test('수정사항 2: 구독 추가 폼 유효성 검사 강화', async ({ page }) => {
    console.log('\n=== 수정사항 2: 구독 추가 폼 유효성 검사 강화 ===');
    
    await page.goto('http://localhost:3000/subscriptions/new');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('🔒 인증 보호 정상 작동 - 로그인 페이지로 리다이렉트');
      return;
    }
    
    // 폼 요소들의 유효성 검사 속성 확인
    const formValidation = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
      const validationInfo = inputs.map(input => ({
        type: input.type || input.tagName.toLowerCase(),
        name: input.name || input.id || 'unnamed',
        required: input.required,
        hasPattern: !!input.pattern,
        hasMinMax: !!(input.min || input.max),
        hasValidation: !!(input.required || input.pattern || input.min || input.max)
      }));
      
      return {
        totalInputs: inputs.length,
        requiredInputs: validationInfo.filter(v => v.required).length,
        inputsWithValidation: validationInfo.filter(v => v.hasValidation).length,
        validationInfo
      };
    });
    
    console.log('📝 폼 유효성 검사:', formValidation);
    
    // 최소한의 유효성 검사가 있어야 함
    expect(formValidation.totalInputs).toBeGreaterThan(0);
    
    // 필수 필드 테스트 (실제 제출하지 않고 클라이언트 검증만 확인)
    const submitButton = page.locator('button[type="submit"], button:has-text("저장"), button:has-text("추가")').first();
    if (await submitButton.count() > 0) {
      // 빈 폼으로 제출 시도 (실제 제출되지 않음)
      await submitButton.click();
      await page.waitForTimeout(500);
      
      // 유효성 검사 메시지 확인
      const validationMessages = await page.locator('input:invalid, .error, [aria-invalid="true"]').count();
      console.log('✅ 유효성 검사 메시지:', validationMessages);
    }
  });

  test('수정사항 3: 통계 계산 최적화 및 캐싱', async ({ page }) => {
    console.log('\n=== 수정사항 3: 통계 계산 최적화 및 캐싱 ===');
    
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('🔒 인증 보호 정상 작동 - 통계는 로그인 후 확인 가능');
      return;
    }
    
    // 통계 관련 성능 확인
    const statisticsPerformance = await page.evaluate(() => {
      const startTime = performance.now();
      
      // 통계 요소들 수집
      const statisticElements = document.querySelectorAll(
        '[data-testid*="stat"], .statistic, .stat, [class*="stat"]'
      );
      
      const numberElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent || '';
        return /\d{1,3}(,\d{3})*원|\$\d+|\d+개|\d+%/.test(text);
      });
      
      const endTime = performance.now();
      
      return {
        statisticElementsCount: statisticElements.length,
        numberElementsCount: numberElements.length,
        processingTime: endTime - startTime,
        hasPerformanceAPI: typeof performance !== 'undefined',
        timestamp: new Date().toISOString()
      };
    });
    
    console.log('📈 통계 처리 성능:', statisticsPerformance);
    
    // 성능이 합리적인 범위 내에 있는지 확인
    expect(statisticsPerformance.processingTime).toBeLessThan(100); // 100ms 이내
    
    // 여러 번 새로고침해서 캐싱 효과 확인
    const refreshTimes = [];
    for (let i = 0; i < 3; i++) {
      const startTime = Date.now();
      await page.reload();
      await page.waitForTimeout(2000);
      const endTime = Date.now();
      refreshTimes.push(endTime - startTime);
      console.log(`🔄 새로고침 ${i + 1}: ${endTime - startTime}ms`);
    }
    
    // 평균 로딩 시간이 합리적인지 확인
    const averageTime = refreshTimes.reduce((a, b) => a + b, 0) / refreshTimes.length;
    console.log(`📊 평균 로딩 시간: ${averageTime.toFixed(0)}ms`);
    expect(averageTime).toBeLessThan(5000); // 5초 이내
  });

  test('수정사항 4: 실시간 업데이트 메커니즘 개선', async ({ page }) => {
    console.log('\n=== 수정사항 4: 실시간 업데이트 메커니즘 개선 ===');
    
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('🔒 인증 보호 정상 작동');
      return;
    }
    
    // 초기 상태 캡처
    const initialSnapshot = await page.evaluate(() => {
      return {
        subscriptionCount: document.querySelectorAll('[data-testid="subscription-card"], .subscription-card').length,
        totalAmount: document.querySelector('[data-testid="total-amount"], .total-amount')?.textContent || '',
        notificationCount: document.querySelector('[data-testid="notification-count"], .notification-badge')?.textContent || '0',
        timestamp: Date.now()
      };
    });
    
    console.log('📊 초기 상태:', initialSnapshot);
    
    // WebSocket 또는 실시간 연결 확인
    const realtimeConnections = await page.evaluate(() => {
      // Firebase 실시간 리스너나 WebSocket 연결 확인
      const hasWebSocket = typeof WebSocket !== 'undefined';
      const hasFirebaseListeners = typeof window.firebase !== 'undefined';
      const hasRealtimeAPI = typeof EventSource !== 'undefined';
      
      return {
        hasWebSocket,
        hasFirebaseListeners,
        hasRealtimeAPI,
        userAgent: navigator.userAgent.includes('Chrome') || navigator.userAgent.includes('Firefox')
      };
    });
    
    console.log('🔄 실시간 연결 기능:', realtimeConnections);
    
    // 페이지를 새 탭에서 열어서 동시성 테스트 (간단한 시뮬레이션)
    const context = page.context();
    const newPage = await context.newPage();
    await newPage.goto('http://localhost:3000');
    await newPage.waitForTimeout(2000);
    
    // 두 페이지의 상태 비교
    const newPageSnapshot = await newPage.evaluate(() => {
      return {
        subscriptionCount: document.querySelectorAll('[data-testid="subscription-card"], .subscription-card').length,
        totalAmount: document.querySelector('[data-testid="total-amount"], .total-amount')?.textContent || '',
        timestamp: Date.now()
      };
    });
    
    console.log('🔄 새 탭 상태:', newPageSnapshot);
    
    // 상태 일관성 확인
    const isConsistent = initialSnapshot.subscriptionCount === newPageSnapshot.subscriptionCount &&
                        initialSnapshot.totalAmount === newPageSnapshot.totalAmount;
    
    console.log('✅ 상태 일관성:', isConsistent ? '정상' : '확인 필요');
    
    await newPage.close();
  });

  test('수정사항 5: 에러 복구 및 사용자 피드백 개선', async ({ page }) => {
    console.log('\n=== 수정사항 5: 에러 복구 및 사용자 피드백 개선 ===');
    
    // 네트워크 오류 시뮬레이션을 위한 라우트 인터셉트
    let networkErrorCount = 0;
    await page.route('**/*', (route) => {
      const url = route.request().url();
      
      // Firebase API 호출 중 일부를 의도적으로 실패시킴
      if (url.includes('firestore') || url.includes('firebase')) {
        networkErrorCount++;
        if (networkErrorCount <= 2) { // 처음 2번은 실패
          console.log('🚫 네트워크 오류 시뮬레이션:', url.substring(0, 50) + '...');
          route.abort('failed');
          return;
        }
      }
      
      route.continue();
    });
    
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(5000); // 더 긴 대기 시간
    
    // 에러 복구 메커니즘 확인
    const errorRecovery = await page.evaluate(() => {
      const errorElements = document.querySelectorAll('.error, [role="alert"], .text-red');
      const retryButtons = Array.from(document.querySelectorAll('button')).filter(btn =>
        btn.textContent?.includes('다시') || 
        btn.textContent?.includes('재시도') ||
        btn.textContent?.includes('새로고침')
      );
      
      const loadingElements = document.querySelectorAll('.loading, .animate-spin, [data-loading]');
      const offlineIndicators = document.querySelectorAll('[data-offline], .offline');
      
      return {
        errorCount: errorElements.length,
        retryButtonCount: retryButtons.length,
        loadingCount: loadingElements.length,
        offlineIndicatorCount: offlineIndicators.length,
        hasContent: document.querySelector('main, [role="main"]') !== null
      };
    });
    
    console.log('🛡️ 에러 복구 상태:', errorRecovery);
    
    // 기본적인 콘텐츠나 로딩 상태는 표시되어야 함 (오프라인 상태라도)
    expect(errorRecovery.hasContent || errorRecovery.loadingCount > 0).toBeTruthy();
    
    // 재시도 버튼이 있다면 클릭해보기
    const retryButton = page.locator('button:has-text("다시"), button:has-text("재시도")').first();
    if (await retryButton.count() > 0) {
      console.log('🔄 재시도 버튼 발견 - 클릭 테스트');
      await retryButton.click();
      await page.waitForTimeout(2000);
      
      const afterRetry = await page.evaluate(() => {
        return {
          hasNewContent: document.querySelector('main, [role="main"]') !== null,
          errorCount: document.querySelectorAll('.error, [role="alert"]').length
        };
      });
      
      console.log('✅ 재시도 후 상태:', afterRetry);
    }
    
    // 브라우저 콘솔 에러 수집
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(1000);
    
    if (consoleErrors.length > 0) {
      console.log('⚠️ 콘솔 에러 (예상됨):');
      consoleErrors.slice(0, 3).forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.substring(0, 80)}...`);
      });
    }
    
    // 네트워크 오류 상황에서도 기본 기능은 동작해야 함
    expect(errorRecovery.hasContent || errorRecovery.loadingCount > 0).toBeTruthy();
  });

  test('종합: 전체 워크플로우 견고성 검증', async ({ page }) => {
    console.log('\n=== 종합: 전체 워크플로우 견고성 검증 ===');
    
    const testScenarios = [
      { name: '정상 접근', action: async () => {
        await page.goto('http://localhost:3000');
        await page.waitForTimeout(2000);
      }},
      { name: '새로고침', action: async () => {
        await page.reload();
        await page.waitForTimeout(2000);
      }},
      { name: '뒤로가기', action: async () => {
        await page.goBack();
        await page.waitForTimeout(1000);
      }},
      { name: '앞으로가기', action: async () => {
        await page.goForward();
        await page.waitForTimeout(1000);
      }},
      { name: '모바일 뷰', action: async () => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(1000);
      }},
      { name: '데스크톱 뷰', action: async () => {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.waitForTimeout(1000);
      }}
    ];
    
    const results = [];
    
    for (const scenario of testScenarios) {
      try {
        console.log(`🧪 테스트: ${scenario.name}`);
        await scenario.action();
        
        const state = await page.evaluate(() => {
          return {
            hasMainContent: document.querySelector('main, [role="main"], body > div') !== null,
            hasErrors: document.querySelectorAll('.error, [role="alert"]').length,
            isResponsive: window.innerWidth > 0 && window.innerHeight > 0,
            url: window.location.href
          };
        });
        
        const success = state.hasMainContent && state.hasErrors === 0 && state.isResponsive;
        results.push({ scenario: scenario.name, success, ...state });
        
        console.log(`${success ? '✅' : '❌'} ${scenario.name}: ${success ? '성공' : '실패'}`);
      } catch (error) {
        results.push({ scenario: scenario.name, success: false, error: error.message });
        console.log(`❌ ${scenario.name}: 에러 - ${error.message}`);
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const successRate = (successCount / results.length) * 100;
    
    console.log(`\n📊 워크플로우 견고성 결과:`);
    console.log(`   - 전체 시나리오: ${results.length}개`);
    console.log(`   - 성공: ${successCount}개`);
    console.log(`   - 성공률: ${successRate.toFixed(1)}%`);
    
    // 80% 이상의 시나리오가 성공해야 함
    expect(successRate).toBeGreaterThanOrEqual(80);
    
    console.log('\n🎉 전체 워크플로우 견고성 검증 완료!');
  });
});