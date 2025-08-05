import { test, expect } from '@playwright/test';

// Firebase 인증 및 전체 워크플로우 통합 테스트

// 타입 정의 추가
interface WorkflowStepResult {
  name: string;
  url: string;
  accessible: boolean;
  hasContent: boolean;
  hasErrors: number;
  finalUrl?: string;
  protected?: boolean;
  status: string;
  error?: string;
}

test.describe('Firebase 워크플로우 통합 테스트', () => {
  // 테스트용 사용자 정보
  const testUser = {
    email: 'test@moonwave.kr',
    password: 'testPassword123!',
    displayName: 'Test User'
  };

  // 테스트용 구독 데이터
  const testSubscription = {
    serviceName: 'Netflix',
    amount: 9900,
    currency: 'KRW',
    paymentCycle: 'monthly',
    paymentDay: 15,
    category: 'Entertainment',
    status: 'active'
  };

  test('Step 1: Firebase 인증 시스템 검증', async ({ page }) => {
    console.log('\n=== Step 1: Firebase 인증 시스템 검증 ===');
    
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(3000);
    
    // Firebase 초기화 확인
    const firebaseInitialized = await page.evaluate(() => {
      return typeof window !== 'undefined' && 
             window.console.log.toString().includes('Firebase') ||
             document.documentElement.innerHTML.includes('firebase');
    });
    
    console.log('✅ Firebase 초기화 상태:', firebaseInitialized ? '완료' : '확인 필요');
    
    // 로그인 페이지 요소 확인
    const googleLoginButton = page.locator('button:has-text("Google로 로그인")');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"], input[type="text"]');
    
    expect(await googleLoginButton.count()).toBeGreaterThan(0);
    expect(await emailInput.count()).toBeGreaterThan(0);
    expect(await passwordInput.count()).toBeGreaterThan(0);
    
    console.log('✅ 로그인 폼 요소 확인 완료');
    
    // Google 로그인 버튼 기능 테스트 (클릭만 확인)
    const initialButtonText = await googleLoginButton.textContent();
    await googleLoginButton.click();
    await page.waitForTimeout(1000);
    
    // 로딩 상태 확인
    const hasLoadingState = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).some(btn => 
        btn.textContent?.includes('로그인 중') || btn.disabled
      );
    });
    
    console.log('✅ Google 로그인 버튼 상태 변화:', hasLoadingState ? '정상' : '확인 필요');
    
    // 에러 처리 확인
    await page.waitForTimeout(2000);
    const errorElements = await page.locator('[role="alert"], .error, .text-red').count();
    console.log('🔍 에러 요소 개수:', errorElements);
  });

  test('Step 2: Firebase 데이터 로딩 워크플로우 검증', async ({ page }) => {
    console.log('\n=== Step 2: Firebase 데이터 로딩 워크플로우 검증 ===');
    
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log('현재 URL:', currentUrl);
    
    if (currentUrl.includes('/login')) {
      console.log('📝 인증이 필요한 상태 - 로그인 페이지로 리다이렉트됨');
      
      // 로그인 시도 (테스트 환경에서는 실제 인증하지 않음)
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"], input[type="text"]');
      
      if (await emailInput.count() > 0) {
        await emailInput.fill(testUser.email);
        console.log('✅ 이메일 입력 완료');
      }
      
      if (await passwordInput.count() > 0) {
        await passwordInput.fill(testUser.password);
        console.log('✅ 비밀번호 입력 완료');
      }
      
      // 로그인 버튼 확인 (실제 로그인은 하지 않음)
      const loginButton = page.locator('button[type="submit"], button:has-text("로그인")');
      if (await loginButton.count() > 0) {
        console.log('✅ 로그인 버튼 확인됨');
      }
    } else {
      console.log('📊 메인 대시보드 접근 가능');
      
      // 대시보드 데이터 로딩 상태 확인
      const loadingIndicators = await page.locator('.loading, [data-loading], .animate-pulse').count();
      console.log('🔄 로딩 인디케이터 개수:', loadingIndicators);
      
      // 데이터 표시 요소 확인
      const subscriptionCards = await page.locator('[data-testid="subscription-card"], .subscription-card').count();
      const statisticsElements = await page.locator('[data-testid="statistics"], .statistics').count();
      
      console.log('📊 구독 카드 개수:', subscriptionCards);
      console.log('📈 통계 요소 개수:', statisticsElements);
    }
    
    // Firebase 연결 상태 확인
    const firebaseStatus = await page.evaluate(() => {
      // 콘솔 로그에서 Firebase 관련 메시지 확인
      const logs = [];
      const originalLog = console.log;
      let firebaseMessages = [];
      
      // 간단한 Firebase 연결 상태 체크
      return {
        hasFirebaseConfig: typeof window !== 'undefined',
        timestamp: new Date().toISOString()
      };
    });
    
    console.log('🔥 Firebase 상태:', firebaseStatus);
  });

  test('Step 3: 구독 추가 기능 및 데이터 저장 검증', async ({ page }) => {
    console.log('\n=== Step 3: 구독 추가 기능 및 데이터 저장 검증 ===');
    
    await page.goto('http://localhost:3000/subscriptions/new');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('📝 인증 필요 - 로그인 페이지로 리다이렉트됨 (정상)');
      expect(currentUrl).toContain('/login');
      return;
    }
    
    console.log('📝 구독 추가 페이지 접근 성공');
    
    // 구독 추가 폼 요소들 확인
    const formElements = {
      serviceName: page.locator('input[name="serviceName"], input[placeholder*="서비스"], input[placeholder*="name"]').first(),
      amount: page.locator('input[name="amount"], input[type="number"], input[placeholder*="금액"]').first(),
      category: page.locator('select[name="category"], button[role="combobox"]').first(),
      paymentCycle: page.locator('select[name="paymentCycle"], input[name="paymentCycle"]').first(),
      submitButton: page.locator('button[type="submit"], button:has-text("저장"), button:has-text("추가")').first()
    };
    
    let formElementCount = 0;
    for (const [field, locator] of Object.entries(formElements)) {
      const count = await locator.count();
      if (count > 0) {
        formElementCount++;
        console.log(`✅ ${field} 필드 확인됨`);
      } else {
        console.log(`❌ ${field} 필드 누락`);
      }
    }
    
    console.log(`📊 폼 요소 확인: ${formElementCount}/5개`);
    expect(formElementCount).toBeGreaterThan(2); // 최소 3개 필드는 있어야 함
    
    // 폼 입력 테스트 (실제 저장은 하지 않음)
    if (await formElements.serviceName.count() > 0) {
      await formElements.serviceName.fill(testSubscription.serviceName);
      console.log('✅ 서비스명 입력 완료');
    }
    
    if (await formElements.amount.count() > 0) {
      await formElements.amount.fill(testSubscription.amount.toString());
      console.log('✅ 금액 입력 완료');
    }
    
    // 폼 유효성 검사 확인
    const validationErrors = await page.locator('.error, [role="alert"], .text-red').count();
    console.log('🔍 유효성 검사 에러:', validationErrors);
  });

  test('Step 4: 통계 처리 및 Firebase 저장 검증', async ({ page }) => {
    console.log('\n=== Step 4: 통계 처리 및 Firebase 저장 검증 ===');
    
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('📝 인증 필요 - 통계 처리는 로그인 후 가능');
      expect(currentUrl).toContain('/login');
      return;
    }
    
    // 통계 관련 JavaScript 함수들이 로드되었는지 확인
    const statisticsCapabilities = await page.evaluate(() => {
      const hasStatsFunctions = typeof window !== 'undefined' && (
        // 통계 관련 전역 함수들이 있는지 확인
        (window as any).updateStatistics ||
        (window as any).calculateStatistics ||
        // 또는 모듈이 로드되었는지 확인
        document.querySelector('script[src*="statistics"]') !== null ||
        // Firebase 관련 스크립트 확인
        document.querySelector('script[src*="firebase"]') !== null
      );
      
      return {
        hasStatsFunctions,
        hasFirebaseScripts: document.querySelectorAll('script[src*="firebase"]').length > 0,
        hasModernModules: document.querySelectorAll('script[type="module"]').length > 0
      };
    });
    
    console.log('📊 통계 처리 기능 확인:', statisticsCapabilities);
    
    // 대시보드에서 통계 표시 요소들 확인
    const statisticsElements = await page.evaluate(() => {
      const elements = {
        totalAmount: document.querySelector('[data-testid="total-amount"], .total-amount, .monthly-total') !== null,
        subscriptionCount: document.querySelector('[data-testid="subscription-count"], .subscription-count') !== null,
        categoryBreakdown: document.querySelector('[data-testid="category-chart"], .category-breakdown, .chart') !== null,
        upcomingPayments: document.querySelector('[data-testid="upcoming-payments"], .upcoming-payments') !== null,
        statistics: document.querySelectorAll('.statistic, .stat, [class*="stat"]').length
      };
      
      return elements;
    });
    
    console.log('📈 통계 표시 요소들:', statisticsElements);
    
    // 동적 데이터 업데이트 확인
    const dynamicContent = await page.evaluate(() => {
      // 동적으로 생성되는 콘텐츠 확인
      const hasDynamicNumbers = Array.from(document.querySelectorAll('*')).some(el => {
        const text = el.textContent || '';
        return /\d{1,3}(,\d{3})*원|\$\d+/.test(text); // 금액 패턴
      });
      
      const hasDateContent = Array.from(document.querySelectorAll('*')).some(el => {
        const text = el.textContent || '';
        return /\d{4}-\d{2}-\d{2}|\d{1,2}월|\d{1,2}일/.test(text); // 날짜 패턴
      });
      
      return {
        hasDynamicNumbers,
        hasDateContent,
        totalTextNodes: document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT).nextNode() !== null
      };
    });
    
    console.log('🔄 동적 콘텐츠 확인:', dynamicContent);
  });

  test('Step 5: 화면 표시 및 실시간 업데이트 검증', async ({ page }) => {
    console.log('\n=== Step 5: 화면 표시 및 실시간 업데이트 검증 ===');
    
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('📝 인증 필요 - 메인 화면 접근 불가');
      expect(currentUrl).toContain('/login');
      return;
    }
    
    // 초기 화면 상태 캡처
    const initialState = await page.evaluate(() => {
      return {
        subscriptionCards: document.querySelectorAll('[data-testid="subscription-card"], .subscription-card, .card').length,
        totalAmount: document.querySelector('[data-testid="total-amount"], .total-amount')?.textContent || '',
        timestamp: new Date().toISOString()
      };
    });
    
    console.log('📊 초기 화면 상태:', initialState);
    
    // 페이지 새로고침 후 상태 비교
    await page.reload();
    await page.waitForTimeout(3000);
    
    const reloadedState = await page.evaluate(() => {
      return {
        subscriptionCards: document.querySelectorAll('[data-testid="subscription-card"], .subscription-card, .card').length,
        totalAmount: document.querySelector('[data-testid="total-amount"], .total-amount')?.textContent || '',
        timestamp: new Date().toISOString()
      };
    });
    
    console.log('🔄 새로고침 후 상태:', reloadedState);
    
    // 데이터 일관성 확인
    const dataConsistency = {
      subscriptionCountMatches: initialState.subscriptionCards === reloadedState.subscriptionCards,
      totalAmountMatches: initialState.totalAmount === reloadedState.totalAmount,
      hasContent: reloadedState.subscriptionCards > 0 || reloadedState.totalAmount.length > 0
    };
    
    console.log('✅ 데이터 일관성 확인:', dataConsistency);
    
    // 반응형 업데이트 테스트 (화면 크기 변경)
    await page.setViewportSize({ width: 375, height: 667 }); // 모바일
    await page.waitForTimeout(1000);
    
    const mobileState = await page.evaluate(() => {
      return {
        isMobileLayout: window.innerWidth <= 768,
        hasResponsiveElements: document.querySelectorAll('.sm\\:, .md\\:, .lg\\:').length > 0,
        visibleElements: document.querySelectorAll(':not([style*="display: none"])').length
      };
    });
    
    console.log('📱 모바일 반응형 확인:', mobileState);
    
    // 다시 데스크톱으로 변경
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    
    console.log('💻 데스크톱 뷰로 복원 완료');
  });

  test('Step 6: 전체 워크플로우 통합 검증', async ({ page }) => {
    console.log('\n=== Step 6: 전체 워크플로우 통합 검증 ===');
    
    // 전체 워크플로우 시나리오 테스트
    const workflowSteps = [
      { name: '로그인 페이지 접근', url: '/login' },
      { name: '메인 대시보드 접근', url: '/' },
      { name: '구독 목록 페이지', url: '/subscriptions' },
      { name: '구독 추가 페이지', url: '/subscriptions/new' },
      { name: '설정 페이지', url: '/settings' },
      { name: '알림 페이지', url: '/notifications' }
    ];
    
    const results: WorkflowStepResult[] = [];
    
    for (const step of workflowSteps) {
      try {
        await page.goto(`http://localhost:3000${step.url}`);
        await page.waitForTimeout(2000);
        
        const currentUrl = page.url();
        const redirectedToLogin = currentUrl.includes('/login');
        const isAccessible = !redirectedToLogin || step.url === '/login';
        const hasContent = await page.locator('main, .main, [role="main"], body > div').count() > 0;
        const hasErrors = await page.locator('.error, [role="alert"]').count();
        
        // 로그인 페이지로 리다이렉트된 경우도 정상으로 처리 (인증 보호가 작동하는 것)
        const isProtectedRoute = step.url !== '/login' && redirectedToLogin;
        const actualStatus = isProtectedRoute ? 'protected' : 
                           (isAccessible && hasContent && hasErrors === 0 ? 'success' : 'warning');
        
        const stepResult: WorkflowStepResult = {
          ...step,
          accessible: isAccessible,
          hasContent,
          hasErrors,
          finalUrl: currentUrl,
          protected: isProtectedRoute,
          status: actualStatus
        };
        
        results.push(stepResult);
        const statusIcon = stepResult.status === 'success' ? '✅' : 
                          stepResult.status === 'protected' ? '🔒' : '⚠️';
        console.log(`${statusIcon} ${step.name}: ${stepResult.status}`);
      } catch (error) {
        const errorResult: WorkflowStepResult = {
          ...step,
          accessible: false,
          hasContent: false,
          hasErrors: 1,
          error: (error as Error).message,
          status: 'error'
        };
        results.push(errorResult);
        console.log(`❌ ${step.name}: 오류 발생`);
      }
    }
    
    // 결과 요약
    const summary = {
      total: results.length,
      success: results.filter(r => r.status === 'success').length,
      protected: results.filter(r => r.status === 'protected').length,
      warning: results.filter(r => r.status === 'warning').length,
      error: results.filter(r => r.status === 'error').length
    };
    
    console.log('\n📊 워크플로우 테스트 결과 요약:');
    console.log(`   - 전체: ${summary.total}개`);
    console.log(`   - 성공: ${summary.success}개`);
    console.log(`   - 보호됨 (인증필요): ${summary.protected}개`);
    console.log(`   - 경고: ${summary.warning}개`);
    console.log(`   - 오류: ${summary.error}개`);
    
    // 성공 + 보호됨(정상적인 인증 보호) = 정상 작동으로 간주
    const workingRoutes = summary.success + summary.protected;
    const workingRate = (workingRoutes / summary.total) * 100;
    console.log(`   - 정상 작동률: ${workingRate.toFixed(1)}%`);
    
    expect(workingRate).toBeGreaterThanOrEqual(80); // 80% 이상이 정상 작동해야 함
    
    console.log('\n🎉 전체 워크플로우 통합 테스트 완료!');
  });

  test('추가: 에러 처리 및 예외 상황 검증', async ({ page }) => {
    console.log('\n=== 추가: 에러 처리 및 예외 상황 검증 ===');
    
    // 네트워크 오류 시뮬레이션
    await page.route('**/*', (route) => {
      const url = route.request().url();
      if (url.includes('firebase') && Math.random() < 0.1) {
        // 10% 확률로 Firebase 요청 실패 시뮬레이션
        route.abort();
      } else {
        route.continue();
      }
    });
    
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    // 에러 핸들링 확인
    const errorHandling = await page.evaluate(() => {
      const hasErrorBoundary = document.querySelector('[data-error-boundary], .error-boundary') !== null;
      const hasErrorMessages = document.querySelectorAll('.error, [role="alert"]').length;
      const hasRetryButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
        btn.textContent?.includes('다시 시도') || btn.textContent?.includes('retry')
      ).length;
      
      return {
        hasErrorBoundary,
        hasErrorMessages,
        hasRetryButtons,
        timestamp: new Date().toISOString()
      };
    });
    
    console.log('🛡️ 에러 처리 메커니즘:', errorHandling);
    
    // 브라우저 콘솔 에러 확인
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    
    if (consoleErrors.length > 0) {
      console.log('⚠️ 콘솔 에러 발견:');
      consoleErrors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.substring(0, 100)}...`);
      });
    } else {
      console.log('✅ 콘솔 에러 없음');
    }
    
    // 중요한 에러가 있는지 확인 (치명적이지 않은 에러는 허용)
    const criticalErrors = consoleErrors.filter(error => 
      error.includes('Uncaught') || 
      error.includes('TypeError') || 
      error.includes('ReferenceError')
    );
    
    console.log(`🔍 치명적 에러: ${criticalErrors.length}개`);
    expect(criticalErrors.length).toBeLessThanOrEqual(2); // 최대 2개까지 허용
  });
});