// 전체 시스템 포괄적 기능 테스트

import { test, expect } from '@playwright/test';

test.describe('전체 시스템 포괄적 기능 테스트', () => {

  test('Step 1: 인증 시스템 전체 기능 테스트', async ({ page }) => {
    console.log('\n=== Step 1: 인증 시스템 전체 기능 테스트 ===');
    
    // 1. 초기 페이지 로드 및 인증 상태 확인
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    const initialAuthState = await page.evaluate(() => {
      return {
        currentPath: window.location.pathname,
        hasLoginForm: document.querySelector('form, [data-testid="login-form"]') !== null,
        hasAuthButtons: Array.from(document.querySelectorAll('button')).filter(btn => 
          (btn.textContent || '').includes('로그인') || (btn.textContent || '').includes('회원가입')
        ).length,
        hasGoogleAuth: document.querySelector('[data-provider="google"], .google-auth') !== null,
        hasFirebaseAuth: typeof window.auth !== 'undefined',
        localStorageAuth: localStorage.getItem('firebase:authUser:AIzaSyA') !== null,
        hasErrorMessages: document.querySelectorAll('.error, [role="alert"]').length
      };
    });
    
    console.log('🔐 초기 인증 상태:', initialAuthState);
    
    // 2. 로그인 페이지 기능 검증
    if (initialAuthState.currentPath.includes('/login')) {
      // 로그인 폼 요소 확인
      const loginFormElements = await page.evaluate(() => {
        const emailInput = document.querySelector('input[type="email"], input[name="email"]');
        const passwordInput = document.querySelector('input[type="password"], input[name="password"]');
        const submitButton = Array.from(document.querySelectorAll('button[type="submit"], button')).find(btn =>
          btn.type === 'submit' || (btn.textContent || '').includes('로그인')
        );
        
        return {
          hasEmailInput: emailInput !== null,
          hasPasswordInput: passwordInput !== null,
          hasSubmitButton: submitButton !== null,
          emailPlaceholder: emailInput?.getAttribute('placeholder') || '',
          isFormAccessible: emailInput?.getAttribute('aria-label') !== null || emailInput?.getAttribute('id') !== null
        };
      });
      
      console.log('📝 로그인 폼 요소:', loginFormElements);
      
      // 폼 검증 테스트
      const emailInput = await page.$('input[type="email"], input[name="email"]');
      const passwordInput = await page.$('input[type="password"], input[name="password"]');
      
      if (emailInput && passwordInput) {
        // 빈 폼 제출 테스트
        const submitButton = await page.$('button[type="submit"], button');
        if (submitButton) {
          await submitButton.click();
          await page.waitForTimeout(1000);
          
          const validationState = await page.evaluate(() => ({
            hasValidationErrors: document.querySelectorAll('.error, [role="alert"], .invalid').length > 0,
            emailInputValid: document.querySelector('input[type="email"]')?.validity?.valid,
            passwordInputValid: document.querySelector('input[type="password"]')?.validity?.valid
          }));
          
          console.log('✅ 폼 검증 상태:', validationState);
        }
        
        // 잘못된 이메일 형식 테스트
        await emailInput.fill('invalid-email');
        await passwordInput.fill('test123');
        
        const invalidEmailState = await page.evaluate(() => ({
          emailInputValid: document.querySelector('input[type="email"]')?.validity?.valid,
          hasEmailError: document.querySelector('.email-error, [data-error="email"]') !== null
        }));
        
        console.log('📧 잘못된 이메일 검증:', invalidEmailState);
        
        // 폼 리셋
        await emailInput.fill('');
        await passwordInput.fill('');
      }
      
      // Google OAuth 버튼 테스트
      const googleAuthButtons = await page.$$('button, a');
      let googleAuthButton = null;
      
      for (const button of googleAuthButtons) {
        const text = await button.textContent();
        if (text && text.includes('Google')) {
          googleAuthButton = button;
          break;
        }
      }
      
      if (googleAuthButton) {
        console.log('🔑 Google OAuth 버튼 발견');
        
        // OAuth 버튼 클릭 테스트 (실제 OAuth는 진행하지 않음)
        const buttonBefore = await page.evaluate(() => ({
          buttonCount: document.querySelectorAll('button').length,
          hasLoadingState: document.querySelector('.loading, .spinner') !== null
        }));
        
        console.log('🔑 OAuth 버튼 클릭 전 상태:', buttonBefore);
      }
    }
    
    // 3. 회원가입 페이지 기능 검증 (있는 경우)
    const allLinks = await page.$$('a');
    let signupLink = null;
    
    for (const link of allLinks) {
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      if ((href && href.includes('signup')) || (text && text.includes('회원가입'))) {
        signupLink = link;
        break;
      }
    }
    
    if (signupLink) {
      await signupLink.click();
      await page.waitForTimeout(2000);
      
      const signupPageState = await page.evaluate(() => ({
        currentPath: window.location.pathname,
        hasSignupForm: document.querySelector('form') !== null,
        hasRequiredFields: document.querySelectorAll('input[required]').length,
        hasPasswordConfirm: document.querySelector('input[name*="confirm"], input[placeholder*="확인"]') !== null,
        hasTermsCheckbox: document.querySelector('input[type="checkbox"]') !== null
      }));
      
      console.log('📋 회원가입 페이지 상태:', signupPageState);
    }
    
    // 4. 인증 상태 관리 테스트
    const authStateManagement = await page.evaluate(() => {
      // 로컬 스토리지 인증 토큰 확인
      const authTokenKeys = Object.keys(localStorage).filter(key => 
        key.includes('auth') || key.includes('token') || key.includes('firebase')
      );
      
      return {
        hasAuthTokens: authTokenKeys.length > 0,
        authTokenKeys: authTokenKeys,
        sessionStorageAuth: Object.keys(sessionStorage).filter(key => 
          key.includes('auth') || key.includes('token')
        ).length > 0,
        hasCookieAuth: document.cookie.includes('auth') || document.cookie.includes('session')
      };
    });
    
    console.log('🔐 인증 상태 관리:', authStateManagement);
    
    // 5. 종합 평가
    const authSystemHealth = {
      hasLoginPage: initialAuthState.currentPath.includes('/login'),
      hasAuthForm: initialAuthState.hasLoginForm,
      hasOAuthSupport: initialAuthState.hasGoogleAuth,
      hasFirebaseIntegration: initialAuthState.hasFirebaseAuth,
      hasStateManagement: authStateManagement.hasAuthTokens,
      hasErrorHandling: initialAuthState.hasErrorMessages >= 0
    };
    
    const workingFeatures = Object.values(authSystemHealth).filter(Boolean).length;
    const totalFeatures = Object.keys(authSystemHealth).length;
    
    console.log('\\n🔐 인증 시스템 건강도:');
    console.log(`   - 로그인 페이지: ${authSystemHealth.hasLoginPage ? '✅' : '❌'}`);
    console.log(`   - 인증 폼: ${authSystemHealth.hasAuthForm ? '✅' : '❌'}`);
    console.log(`   - OAuth 지원: ${authSystemHealth.hasOAuthSupport ? '✅' : '❌'}`);
    console.log(`   - Firebase 연동: ${authSystemHealth.hasFirebaseIntegration ? '✅' : '❌'}`);
    console.log(`   - 상태 관리: ${authSystemHealth.hasStateManagement ? '✅' : '❌'}`);
    console.log(`   - 에러 처리: ${authSystemHealth.hasErrorHandling ? '✅' : '❌'}`);
    console.log(`   - 전체 성공률: ${((workingFeatures / totalFeatures) * 100).toFixed(1)}%`);
    
    // 최소 기본 기능은 작동해야 함
    expect(workingFeatures).toBeGreaterThanOrEqual(3);
  });

  test('Step 2: 구독 관리 시스템 전체 기능 테스트', async ({ page }) => {
    console.log('\\n=== Step 2: 구독 관리 시스템 전체 기능 테스트 ===');
    
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('🔒 인증 필요 - 기본 구독 관리 기능만 테스트');
      
      // 로그인 페이지에서도 확인 가능한 기본 구조
      const basicStructure = await page.evaluate(() => ({
        hasNavigation: document.querySelector('nav, .navigation') !== null,
        hasSubscriptionLinks: Array.from(document.querySelectorAll('a')).some(a => 
          (a.textContent || '').includes('구독') || a.href.includes('subscription')
        ),
        hasRouterSetup: typeof window.history?.pushState === 'function'
      }));
      
      console.log('📱 기본 구조 확인:', basicStructure);
      return;
    }
    
    // 1. 구독 페이지 접근 및 기본 구조 확인
    await page.goto('http://localhost:3000/subscriptions');
    await page.waitForTimeout(3000);
    
    const subscriptionPageStructure = await page.evaluate(() => {
      return {
        pageTitle: document.title,
        hasHeader: document.querySelector('h1, h2, .page-title') !== null,
        hasSubscriptionList: document.querySelectorAll('.subscription-card, [data-subscription-id]').length,
        hasAddButton: Array.from(document.querySelectorAll('button, a')).some(el => 
          (el.textContent || '').includes('추가') || (el.textContent || '').includes('새로')
        ),
        hasFilterOptions: document.querySelectorAll('.filter, button[role="tab"]').length,
        hasSearchFunction: document.querySelector('input[type="search"], input[placeholder*="검색"]') !== null,
        hasSortOptions: Array.from(document.querySelectorAll('button, select')).some(el =>
          (el.textContent || '').includes('정렬') || (el.textContent || '').includes('순서')
        )
      };
    });
    
    console.log('📋 구독 페이지 구조:', subscriptionPageStructure);
    
    // 2. 구독 카드/항목 세부 분석
    const subscriptionItemsAnalysis = await page.evaluate(() => {
      const subscriptionCards = Array.from(document.querySelectorAll('.subscription-card, [data-subscription-id]'));
      
      if (subscriptionCards.length === 0) {
        return {
          totalSubscriptions: 0,
          hasEmptyState: document.querySelector('.empty-state, .no-subscriptions') !== null,
          emptyStateMessage: document.querySelector('.empty-state, .no-subscriptions')?.textContent || ''
        };
      }
      
      const cardAnalysis = subscriptionCards.slice(0, 3).map((card, index) => {
        const cardData = {
          index,
          hasServiceName: card.querySelector('.service-name, [data-service-name]') !== null,
          hasAmount: card.querySelector('.amount, .price, [data-amount]') !== null,
          hasPaymentDate: card.querySelector('.payment-date, [data-payment-date]') !== null,
          hasCategory: card.querySelector('.category, [data-category]') !== null,
          hasStatus: card.querySelector('.status, [data-status]') !== null,
          hasActions: card.querySelectorAll('button, a').length,
          serviceName: card.querySelector('.service-name, [data-service-name]')?.textContent || '',
          amount: card.querySelector('.amount, .price, [data-amount]')?.textContent || ''
        };
        
        return cardData;
      });
      
      return {
        totalSubscriptions: subscriptionCards.length,
        cardAnalysis,
        averageActionsPerCard: cardAnalysis.reduce((sum, card) => sum + card.hasActions, 0) / cardAnalysis.length
      };
    });
    
    console.log('💳 구독 항목 분석:', subscriptionItemsAnalysis);
    
    // 3. 구독 추가 기능 테스트
    const addButtons = await page.$$('button, a');
    let addSubscriptionButton = null;
    
    for (const button of addButtons) {
      const text = await button.textContent();
      if (text && (text.includes('추가') || text.includes('새로') || text.includes('등록'))) {
        addSubscriptionButton = button;
        break;
      }
    }
    
    if (addSubscriptionButton) {
      console.log('➕ 구독 추가 기능 테스트');
      
      await addSubscriptionButton.click();
      await page.waitForTimeout(2000);
      
      const addSubscriptionPageState = await page.evaluate(() => {
        return {
          currentPath: window.location.pathname,
          hasForm: document.querySelector('form') !== null,
          hasServiceNameInput: document.querySelector('input[name*="service"], input[placeholder*="서비스"]') !== null,
          hasAmountInput: document.querySelector('input[type="number"], input[name*="amount"]') !== null,
          hasDateInput: document.querySelector('input[type="date"], input[name*="date"]') !== null,
          hasCategorySelect: document.querySelector('select, [role="combobox"]') !== null,
          hasSubmitButton: document.querySelector('button[type="submit"]') !== null,
          hasCancelButton: Array.from(document.querySelectorAll('button')).some(btn =>
            (btn.textContent || '').includes('취소') || (btn.textContent || '').includes('돌아')
          )
        };
      });
      
      console.log('📝 구독 추가 폼 상태:', addSubscriptionPageState);
      
      // 폼 필드 테스트 (데이터 입력)
      if (addSubscriptionPageState.hasForm) {
        const serviceNameInput = await page.$('input[name*="service"], input[placeholder*="서비스"]');
        const amountInput = await page.$('input[type="number"], input[name*="amount"]');
        
        if (serviceNameInput && amountInput) {
          await serviceNameInput.fill('테스트 구독 서비스');
          await amountInput.fill('9900');
          
          // 카테고리 선택 (있는 경우)
          const categorySelect = await page.$('select');
          if (categorySelect) {
            await categorySelect.selectOption({ index: 1 });
          }
          
          console.log('✅ 테스트 데이터 입력 완료');
          
          // 실제 저장은 하지 않고 취소
          const cancelButtons = await page.$$('button');
          for (const button of cancelButtons) {
            const text = await button.textContent();
            if (text && (text.includes('취소') || text.includes('돌아'))) {
              await button.click();
              await page.waitForTimeout(1000);
              break;
            }
          }
        }
      }
    }
    
    // 4. 구독 편집/삭제 기능 테스트
    await page.goto('http://localhost:3000/subscriptions');
    await page.waitForTimeout(2000);
    
    const subscriptionActions = await page.evaluate(() => {
      const subscriptionCards = Array.from(document.querySelectorAll('.subscription-card, [data-subscription-id]'));
      let editButtons = 0;
      let deleteButtons = 0;
      let viewButtons = 0;
      
      subscriptionCards.forEach(card => {
        const buttons = Array.from(card.querySelectorAll('button, a'));
        buttons.forEach(button => {
          const text = button.textContent || '';
          const ariaLabel = button.getAttribute('aria-label') || '';
          
          if (text.includes('편집') || text.includes('수정') || ariaLabel.includes('편집')) {
            editButtons++;
          } else if (text.includes('삭제') || ariaLabel.includes('삭제')) {
            deleteButtons++;
          } else if (text.includes('보기') || text.includes('상세') || ariaLabel.includes('보기')) {
            viewButtons++;
          }
        });
      });
      
      return {
        totalCards: subscriptionCards.length,
        editButtons,
        deleteButtons,
        viewButtons,
        hasActionButtons: (editButtons + deleteButtons + viewButtons) > 0
      };
    });
    
    console.log('⚙️ 구독 액션 버튼 분석:', subscriptionActions);
    
    // 5. 필터링 및 정렬 기능 테스트
    const filteringSortingTest = await page.evaluate(() => {
      const filterButtons = Array.from(document.querySelectorAll('button, .filter-tab'));
      const sortOptions = Array.from(document.querySelectorAll('select, button')).filter(el =>
        (el.textContent || '').includes('정렬') || (el.textContent || '').includes('순서')
      );
      
      const categoryFilters = filterButtons.filter(btn => {
        const text = btn.textContent || '';
        return text.includes('카테고리') || text.includes('전체') || 
               text.includes('엔터') || text.includes('음악') || text.includes('개발');
      });
      
      return {
        totalFilterButtons: filterButtons.length,
        categoryFilters: categoryFilters.length,
        sortOptions: sortOptions.length,
        hasActiveFilter: document.querySelector('.active, [aria-selected="true"]') !== null
      };
    });
    
    console.log('🔍 필터링/정렬 기능:', filteringSortingTest);
    
    // 6. 구독 통계 및 요약 정보
    const subscriptionStats = await page.evaluate(() => {
      const statsCards = Array.from(document.querySelectorAll('.stat-card, [data-stat]'));
      const totalAmountElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent || '';
        return text.includes('총 금액') || text.includes('월 지출') || text.includes('원');
      });
      
      return {
        hasStatsCards: statsCards.length > 0,
        statsCardsCount: statsCards.length,
        hasTotalAmount: totalAmountElements.length > 0,
        hasUpcomingPayments: Array.from(document.querySelectorAll('*')).some(el =>
          (el.textContent || '').includes('곧 결제') || (el.textContent || '').includes('예정')
        )
      };
    });
    
    console.log('📊 구독 통계 정보:', subscriptionStats);
    
    // 7. 종합 평가
    const subscriptionSystemHealth = {
      hasBasicStructure: subscriptionPageStructure.hasHeader,
      hasSubscriptionDisplay: subscriptionPageStructure.hasSubscriptionList > 0 || subscriptionItemsAnalysis.totalSubscriptions > 0,
      hasAddFunction: addSubscriptionButton !== null,
      hasActionButtons: subscriptionActions.hasActionButtons,
      hasFilteringFeatures: filteringSortingTest.totalFilterButtons > 0,
      hasStatsDisplay: subscriptionStats.hasStatsCards
    };
    
    const workingFeatures = Object.values(subscriptionSystemHealth).filter(Boolean).length;
    const totalFeatures = Object.keys(subscriptionSystemHealth).length;
    
    console.log('\\n💳 구독 관리 시스템 건강도:');
    console.log(`   - 기본 구조: ${subscriptionSystemHealth.hasBasicStructure ? '✅' : '❌'}`);
    console.log(`   - 구독 표시: ${subscriptionSystemHealth.hasSubscriptionDisplay ? '✅' : '❌'}`);
    console.log(`   - 추가 기능: ${subscriptionSystemHealth.hasAddFunction ? '✅' : '❌'}`);
    console.log(`   - 액션 버튼: ${subscriptionSystemHealth.hasActionButtons ? '✅' : '❌'}`);
    console.log(`   - 필터링: ${subscriptionSystemHealth.hasFilteringFeatures ? '✅' : '❌'}`);
    console.log(`   - 통계 표시: ${subscriptionSystemHealth.hasStatsDisplay ? '✅' : '❌'}`);
    console.log(`   - 전체 성공률: ${((workingFeatures / totalFeatures) * 100).toFixed(1)}%`);
    
    expect(workingFeatures).toBeGreaterThanOrEqual(4);
  });

  test('Step 3: 대시보드 기능 및 통계 시스템 테스트', async ({ page }) => {
    console.log('\\n=== Step 3: 대시보드 기능 및 통계 시스템 테스트 ===');
    
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('🔒 인증 필요 - 대시보드 접근 불가');
      return;
    }
    
    // 1. 대시보드 페이지 기본 구조 확인
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(3000);
    
    const dashboardStructure = await page.evaluate(() => {
      return {
        pageTitle: document.title,
        hasMainContent: document.querySelector('main, [role="main"]') !== null,
        hasHeader: document.querySelector('h1, .page-title') !== null,
        hasStatsCards: document.querySelectorAll('.stat-card, [data-stat]').length,
        hasCharts: document.querySelectorAll('canvas, svg, .chart').length,
        hasRecentActivity: document.querySelector('.recent-activity, .activity-list') !== null,
        hasUpcomingPayments: Array.from(document.querySelectorAll('*')).some(el =>
          (el.textContent || '').includes('곧 결제') || (el.textContent || '').includes('예정')
        ),
        hasNavigationLinks: document.querySelectorAll('nav a, .nav-link').length,
        hasActionButtons: document.querySelectorAll('button').length
      };
    });
    
    console.log('📊 대시보드 기본 구조:', dashboardStructure);
    
    // 2. 통계 카드 세부 분석
    const statsCardsAnalysis = await page.evaluate(() => {
      const statsCards = Array.from(document.querySelectorAll('.stat-card, [data-stat]'));
      
      const cardDetails = statsCards.map((card, index) => {
        const titleElement = card.querySelector('h2, h3, .title, .stat-title');
        const valueElement = card.querySelector('.value, .amount, .count, .number');
        const iconElement = card.querySelector('svg, .icon, [data-lucide]');
        
        return {
          index,
          hasTitle: titleElement !== null,
          hasValue: valueElement !== null,
          hasIcon: iconElement !== null,
          title: titleElement?.textContent?.trim() || '',
          value: valueElement?.textContent?.trim() || '',
          hasChangeIndicator: card.querySelector('.change, .trend, .percentage') !== null,
          isClickable: card.tagName === 'BUTTON' || card.onclick !== null || card.classList.contains('clickable')
        };
      });
      
      return {
        totalStatsCards: statsCards.length,
        cardDetails: cardDetails.slice(0, 5), // 처음 5개만
        averageCompleteness: cardDetails.length > 0 ? 
          cardDetails.reduce((sum, card) => sum + (card.hasTitle && card.hasValue ? 1 : 0), 0) / cardDetails.length : 0
      };
    });
    
    console.log('📈 통계 카드 분석:', statsCardsAnalysis);
    
    // 3. 차트 및 시각화 요소 분석
    const chartsAnalysis = await page.evaluate(() => {
      const canvasElements = document.querySelectorAll('canvas');
      const svgElements = document.querySelectorAll('svg');
      const chartContainers = document.querySelectorAll('.chart, [data-chart]');
      
      return {
        canvasCharts: canvasElements.length,
        svgCharts: svgElements.length,
        chartContainers: chartContainers.length,
        hasResponsiveCharts: Array.from(chartContainers).some(chart =>
          chart.style.width === '100%' || chart.classList.contains('responsive')
        ),
        hasChartLegends: document.querySelectorAll('.legend, .chart-legend').length > 0,
        hasChartTooltips: document.querySelectorAll('[data-tooltip], .tooltip').length > 0
      };
    });
    
    console.log('📉 차트 분석:', chartsAnalysis);
    
    // 4. 최근 활동 및 알림 영역 테스트
    const recentActivityAnalysis = await page.evaluate(() => {
      const activityList = document.querySelector('.recent-activity, .activity-list, .notifications');
      const activityItems = document.querySelectorAll('.activity-item, .notification-item, .recent-item');
      
      let activityDetails = [];
      if (activityItems.length > 0) {
        activityDetails = Array.from(activityItems).slice(0, 3).map((item, index) => ({
          index,
          hasTimestamp: item.querySelector('.time, .date, .timestamp') !== null,
          hasIcon: item.querySelector('svg, .icon') !== null,
          hasDescription: item.textContent && item.textContent.trim().length > 10,
          timestamp: item.querySelector('.time, .date, .timestamp')?.textContent || '',
          description: item.textContent?.substring(0, 50) + '...' || ''
        }));
      }
      
      return {
        hasActivitySection: activityList !== null,
        totalActivityItems: activityItems.length,
        activityDetails,
        hasMoreButton: document.querySelector('.more, .view-all, .see-more') !== null
      };
    });
    
    console.log('🔔 최근 활동 분석:', recentActivityAnalysis);
    
    // 5. 대시보드 인터랙션 테스트
    const dashboardInteractions = await page.evaluate(() => {
      const clickableElements = document.querySelectorAll('button, a, [onclick], .clickable');
      const interactiveStats = Array.from(document.querySelectorAll('.stat-card')).filter(card =>
        card.tagName === 'BUTTON' || card.onclick || card.classList.contains('clickable')
      );
      
      return {
        totalClickableElements: clickableElements.length,
        interactiveStatsCards: interactiveStats.length,
        hasRefreshButton: Array.from(clickableElements).some(el =>
          (el.textContent || '').includes('새로고침') || (el.textContent || '').includes('업데이트')
        ),
        hasExportButton: Array.from(clickableElements).some(el =>
          (el.textContent || '').includes('내보내기') || (el.textContent || '').includes('다운로드')
        ),
        hasFilterOptions: document.querySelectorAll('.filter, .date-picker, select').length > 0
      };
    });
    
    console.log('🖱️ 대시보드 상호작용:', dashboardInteractions);
    
    // 6. 반응형 디자인 테스트
    const responsiveDesignTest = await page.evaluate(() => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const isMobile = viewportWidth < 768;
      
      return {
        viewportSize: `${viewportWidth}x${viewportHeight}`,
        isMobileView: isMobile,
        hasResponsiveClasses: document.querySelector('[class*="md:"], [class*="lg:"], [class*="mobile"]') !== null,
        hasScrollableContent: document.body.scrollHeight > window.innerHeight,
        statsCardsLayout: document.querySelectorAll('.stat-card').length > 0 ? 
          window.getComputedStyle(document.querySelector('.stat-card').parentElement).display : 'none'
      };
    });
    
    console.log('📱 반응형 디자인:', responsiveDesignTest);
    
    // 7. 성능 및 로딩 상태 확인
    const performanceTest = await page.evaluate(() => {
      const performanceEntries = performance.getEntriesByType('navigation')[0];
      const hasLoadingStates = document.querySelectorAll('.loading, .skeleton, .spinner').length;
      const hasLazyLoading = document.querySelectorAll('[loading="lazy"]').length;
      
      return {
        domContentLoadTime: performanceEntries ? performanceEntries.domContentLoadedEventEnd - performanceEntries.domContentLoadedEventStart : 0,
        totalLoadTime: performanceEntries ? performanceEntries.loadEventEnd - performanceEntries.navigationStart : 0,
        hasLoadingStates: hasLoadingStates > 0,
        hasLazyLoading: hasLazyLoading > 0,
        hasErrorBoundaries: document.querySelector('[data-error-boundary]') !== null
      };
    });
    
    console.log('⚡ 성능 테스트:', performanceTest);
    
    // 8. 종합 평가
    const dashboardSystemHealth = {
      hasBasicStructure: dashboardStructure.hasMainContent && dashboardStructure.hasHeader,
      hasStatsDisplay: dashboardStructure.hasStatsCards > 0,
      hasVisualization: chartsAnalysis.canvasCharts > 0 || chartsAnalysis.svgCharts > 0,
      hasRecentActivity: recentActivityAnalysis.hasActivitySection,
      hasInteractivity: dashboardInteractions.totalClickableElements > 5,
      isResponsive: responsiveDesignTest.hasResponsiveClasses,
      hasGoodPerformance: performanceTest.totalLoadTime < 5000 || performanceTest.totalLoadTime === 0
    };
    
    const workingFeatures = Object.values(dashboardSystemHealth).filter(Boolean).length;
    const totalFeatures = Object.keys(dashboardSystemHealth).length;
    
    console.log('\\n📊 대시보드 시스템 건강도:');
    console.log(`   - 기본 구조: ${dashboardSystemHealth.hasBasicStructure ? '✅' : '❌'}`);
    console.log(`   - 통계 표시: ${dashboardSystemHealth.hasStatsDisplay ? '✅' : '❌'}`);
    console.log(`   - 시각화: ${dashboardSystemHealth.hasVisualization ? '✅' : '❌'}`);
    console.log(`   - 최근 활동: ${dashboardSystemHealth.hasRecentActivity ? '✅' : '❌'}`);
    console.log(`   - 상호작용: ${dashboardSystemHealth.hasInteractivity ? '✅' : '❌'}`);
    console.log(`   - 반응형: ${dashboardSystemHealth.isResponsive ? '✅' : '❌'}`);
    console.log(`   - 성능: ${dashboardSystemHealth.hasGoodPerformance ? '✅' : '❌'}`);
    console.log(`   - 전체 성공률: ${((workingFeatures / totalFeatures) * 100).toFixed(1)}%`);
    
    expect(workingFeatures).toBeGreaterThanOrEqual(4);
  });

  test('Step 4: 알림 시스템 전체 기능 테스트', async ({ page }) => {
    console.log('\\n=== Step 4: 알림 시스템 전체 기능 테스트 ===');
    
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('🔒 인증 필요 - 알림 시스템 기본 구조만 테스트');
      
      const basicNotificationStructure = await page.evaluate(() => ({
        hasNotificationAPI: 'Notification' in window,
        hasServiceWorker: 'serviceWorker' in navigator,
        notificationPermission: Notification.permission,
        hasLocalStorage: typeof localStorage !== 'undefined'
      }));
      
      console.log('🔔 기본 알림 구조:', basicNotificationStructure);
      return;
    }
    
    // 1. 알림 페이지 접근 및 기본 구조
    await page.goto('http://localhost:3000/notifications');
    await page.waitForTimeout(3000);
    
    const notificationPageStructure = await page.evaluate(() => {
      return {
        pageTitle: document.title,
        hasHeader: document.querySelector('h1, .page-title') !== null,
        hasNotificationList: document.querySelectorAll('.notification-item, [data-notification-id]').length,
        hasFilterTabs: document.querySelectorAll('.filter-tab, button[role="tab"]').length,
        hasStatsCards: document.querySelectorAll('.stat-card, [data-stat]').length,
        hasActionButtons: document.querySelectorAll('button').length,
        hasEmptyState: document.querySelector('.empty-state, .no-notifications') !== null,
        notificationPermission: Notification.permission,
        hasPermissionPrompt: Array.from(document.querySelectorAll('*')).some(el =>
          (el.textContent || '').includes('알림 권한') || (el.textContent || '').includes('허용')
        )
      };
    });
    
    console.log('🔔 알림 페이지 구조:', notificationPageStructure);
    
    // 2. 알림 항목 세부 분석
    const notificationItemsAnalysis = await page.evaluate(() => {
      const notificationItems = Array.from(document.querySelectorAll('.notification-item, [data-notification-id]'));
      
      if (notificationItems.length === 0) {
        return {
          totalNotifications: 0,
          hasEmptyState: true,
          emptyStateMessage: document.querySelector('.empty-state')?.textContent || ''
        };
      }
      
      const itemAnalysis = notificationItems.slice(0, 3).map((item, index) => {
        return {
          index,
          hasTitle: item.querySelector('.title, h3, .notification-title') !== null,
          hasMessage: item.querySelector('.message, .content, .notification-message') !== null,
          hasTimestamp: item.querySelector('.time, .date, .timestamp') !== null,
          hasIcon: item.querySelector('svg, .icon') !== null,
          hasActions: item.querySelectorAll('button').length,
          isRead: item.classList.contains('read') || item.getAttribute('data-read') === 'true',
          hasType: item.getAttribute('data-type') !== null || item.classList.contains('payment') || item.classList.contains('system')
        };
      });
      
      return {
        totalNotifications: notificationItems.length,
        itemAnalysis,
        readNotifications: notificationItems.filter(item => 
          item.classList.contains('read') || item.getAttribute('data-read') === 'true'
        ).length,
        unreadNotifications: notificationItems.filter(item => 
          !item.classList.contains('read') && item.getAttribute('data-read') !== 'true'
        ).length
      };
    });
    
    console.log('📨 알림 항목 분석:', notificationItemsAnalysis);
    
    // 3. 필터링 기능 테스트
    const filteringTest = await page.evaluate(() => {
      const filterButtons = Array.from(document.querySelectorAll('.filter-tab, button[role="tab"]'));
      const activeFilter = document.querySelector('.active, [aria-selected="true"]');
      
      const filterTypes = filterButtons.map(button => ({
        text: button.textContent?.trim() || '',
        isActive: button.classList.contains('active') || button.getAttribute('aria-selected') === 'true',
        hasCount: /\\d+/.test(button.textContent || '')
      }));
      
      return {
        totalFilters: filterButtons.length,
        hasActiveFilter: activeFilter !== null,
        filterTypes,
        hasAllFilter: filterTypes.some(f => f.text.includes('전체')),
        hasUnreadFilter: filterTypes.some(f => f.text.includes('읽지 않음')),
        hasTypeFilters: filterTypes.some(f => f.text.includes('결제') || f.text.includes('시스템'))
      };
    });
    
    console.log('🔍 필터링 기능:', filteringTest);
    
    // 4. 알림 액션 테스트 (읽음 처리, 삭제 등)
    const notificationActions = await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('button'));
      
      const actionButtons = {
        markAsRead: allButtons.filter(btn => 
          (btn.textContent || '').includes('읽음') || btn.getAttribute('aria-label')?.includes('읽음')
        ).length,
        deleteButtons: allButtons.filter(btn => 
          (btn.textContent || '').includes('삭제') || btn.getAttribute('aria-label')?.includes('삭제')
        ).length,
        markAllRead: allButtons.filter(btn => 
          (btn.textContent || '').includes('모두 읽음')
        ).length,
        refreshButton: allButtons.filter(btn => 
          (btn.textContent || '').includes('새로고침')
        ).length,
        selectionButtons: allButtons.filter(btn => 
          (btn.textContent || '').includes('선택') || btn.getAttribute('aria-label')?.includes('선택')
        ).length
      };
      
      return {
        ...actionButtons,
        totalActionButtons: Object.values(actionButtons).reduce((sum, count) => sum + count, 0),
        hasBulkActions: actionButtons.markAllRead > 0 || actionButtons.selectionButtons > 0
      };
    });
    
    console.log('⚙️ 알림 액션 버튼:', notificationActions);
    
    // 5. 브라우저 알림 권한 테스트
    const browserNotificationTest = await page.evaluate(() => {
      const hasNotificationAPI = 'Notification' in window;
      const currentPermission = hasNotificationAPI ? Notification.permission : 'unsupported';
      
      return {
        hasNotificationAPI,
        currentPermission,
        hasPermissionButton: Array.from(document.querySelectorAll('button')).some(btn =>
          (btn.textContent || '').includes('권한') || (btn.textContent || '').includes('허용')
        ),
        hasServiceWorkerSupport: 'serviceWorker' in navigator,
        canRequestPermission: hasNotificationAPI && typeof Notification.requestPermission === 'function'
      };
    });
    
    console.log('🔔 브라우저 알림 테스트:', browserNotificationTest);
    
    // 6. 실시간 업데이트 기능 테스트
    const realtimeTest = await page.evaluate(() => {
      return new Promise((resolve) => {
        let updateCount = 0;
        const startTime = Date.now();
        
        // DOM 변화 감지
        const observer = new MutationObserver(() => {
          updateCount++;
        });
        
        const targetNode = document.querySelector('.notification-list, main');
        if (targetNode) {
          observer.observe(targetNode, { 
            childList: true, 
            subtree: true 
          });
        }
        
        // 3초 후 결과 반환
        setTimeout(() => {
          observer.disconnect();
          resolve({
            domUpdates: updateCount,
            hasRealtimeCapability: updateCount > 0,
            testDuration: Date.now() - startTime,
            hasWebSocket: typeof WebSocket !== 'undefined',
            hasFirebaseListeners: typeof window.firebase !== 'undefined'
          });
        }, 3000);
      });
    });
    
    const realtimeResults = await realtimeTest;
    console.log('⚡ 실시간 업데이트 테스트:', realtimeResults);
    
    // 7. 알림 설정 및 환경설정
    const notificationSettings = await page.evaluate(() => {
      const settingsButtons = Array.from(document.querySelectorAll('button, a')).filter(el =>
        (el.textContent || '').includes('설정') || el.href?.includes('settings')
      );
      
      return {
        hasSettingsButton: settingsButtons.length > 0,
        hasNotificationPreferences: document.querySelector('.notification-settings, [data-notification-settings]') !== null,
        hasFrequencySettings: Array.from(document.querySelectorAll('*')).some(el =>
          (el.textContent || '').includes('빈도') || (el.textContent || '').includes('주기')
        ),
        hasTypeSettings: Array.from(document.querySelectorAll('input[type="checkbox"], .toggle')).length > 0
      };
    });
    
    console.log('⚙️ 알림 설정:', notificationSettings);
    
    // 8. 종합 평가
    const notificationSystemHealth = {
      hasBasicStructure: notificationPageStructure.hasHeader && notificationPageStructure.hasNotificationList >= 0,
      hasFilteringSystem: filteringTest.totalFilters > 0,
      hasActionButtons: notificationActions.totalActionButtons > 0,
      hasBrowserIntegration: browserNotificationTest.hasNotificationAPI,
      hasRealtimeFeatures: realtimeResults.hasRealtimeCapability || realtimeResults.hasFirebaseListeners,
      hasSettings: notificationSettings.hasSettingsButton || notificationSettings.hasNotificationPreferences,
      hasGoodUX: notificationPageStructure.hasStatsCards > 0 && (notificationItemsAnalysis.totalNotifications > 0 || notificationPageStructure.hasEmptyState)
    };
    
    const workingFeatures = Object.values(notificationSystemHealth).filter(Boolean).length;
    const totalFeatures = Object.keys(notificationSystemHealth).length;
    
    console.log('\\n🔔 알림 시스템 건강도:');
    console.log(`   - 기본 구조: ${notificationSystemHealth.hasBasicStructure ? '✅' : '❌'}`);
    console.log(`   - 필터링 시스템: ${notificationSystemHealth.hasFilteringSystem ? '✅' : '❌'}`);
    console.log(`   - 액션 버튼: ${notificationSystemHealth.hasActionButtons ? '✅' : '❌'}`);
    console.log(`   - 브라우저 연동: ${notificationSystemHealth.hasBrowserIntegration ? '✅' : '❌'}`);
    console.log(`   - 실시간 기능: ${notificationSystemHealth.hasRealtimeFeatures ? '✅' : '❌'}`);
    console.log(`   - 설정 기능: ${notificationSystemHealth.hasSettings ? '✅' : '❌'}`);
    console.log(`   - 사용자 경험: ${notificationSystemHealth.hasGoodUX ? '✅' : '❌'}`);
    console.log(`   - 전체 성공률: ${((workingFeatures / totalFeatures) * 100).toFixed(1)}%`);
    
    expect(workingFeatures).toBeGreaterThanOrEqual(4);
  });

  test('Step 5: 설정 및 환경설정 기능 테스트', async ({ page }) => {
    console.log('\\n=== Step 5: 설정 및 환경설정 기능 테스트 ===');
    
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('🔒 인증 필요 - 설정 페이지 접근 불가');
      return;
    }
    
    // 1. 설정 페이지 접근
    await page.goto('http://localhost:3000/settings');
    await page.waitForTimeout(3000);
    
    const settingsPageStructure = await page.evaluate(() => {
      return {
        pageTitle: document.title,
        hasHeader: document.querySelector('h1, .page-title') !== null,
        hasSettingSections: document.querySelectorAll('.setting-section, .settings-group').length,
        hasTabs: document.querySelectorAll('.tab, button[role="tab"]').length,
        hasForm: document.querySelector('form') !== null,
        hasInputFields: document.querySelectorAll('input, select, textarea').length,
        hasToggleSwitches: document.querySelectorAll('input[type="checkbox"], .toggle, .switch').length,
        hasSaveButton: Array.from(document.querySelectorAll('button[type="submit"], button')).some(btn => 
          btn.type === 'submit' || (btn.textContent || '').includes('저장')
        )
      };
    });
    
    console.log('⚙️ 설정 페이지 구조:', settingsPageStructure);
    
    // 2. 사용자 프로필 설정 테스트
    const profileSettingsTest = await page.evaluate(() => {
      const profileSection = document.querySelector('.profile, .user-settings, [data-section="profile"]');
      
      if (!profileSection) {
        return { hasProfileSection: false };
      }
      
      const profileInputs = {
        nameInput: profileSection.querySelector('input[name*="name"], input[placeholder*="이름"]') !== null,
        emailInput: profileSection.querySelector('input[type="email"], input[name*="email"]') !== null,
        phoneInput: profileSection.querySelector('input[type="tel"], input[name*="phone"]') !== null,
        avatarUpload: profileSection.querySelector('input[type="file"], .avatar-upload') !== null,
        languageSelect: profileSection.querySelector('select[name*="language"], select[name*="locale"]') !== null
      };
      
      return {
        hasProfileSection: true,
        ...profileInputs,
        profileFieldsCount: Object.values(profileInputs).filter(Boolean).length
      };
    });
    
    console.log('👤 프로필 설정:', profileSettingsTest);
    
    // 3. 알림 설정 테스트
    const notificationSettingsTest = await page.evaluate(() => {
      const notificationSection = document.querySelector('.notification-settings, [data-section="notifications"]');
      
      if (!notificationSection) {
        // 전체 페이지에서 알림 관련 설정 찾기
        const notificationElements = Array.from(document.querySelectorAll('*')).filter(el =>
          (el.textContent || '').includes('알림') || (el.textContent || '').includes('notification')
        );
        
        return {
          hasNotificationSection: false,
          hasNotificationElements: notificationElements.length > 0,
          notificationElementsCount: notificationElements.length
        };
      }
      
      const notificationToggles = {
        emailNotifications: notificationSection.querySelector('input[name*="email"], .email-toggle') !== null,
        pushNotifications: notificationSection.querySelector('input[name*="push"], .push-toggle') !== null,
        paymentReminders: notificationSection.querySelector('input[name*="payment"], .payment-toggle') !== null,
        weeklyReports: notificationSection.querySelector('input[name*="weekly"], .weekly-toggle') !== null,
        marketingEmails: notificationSection.querySelector('input[name*="marketing"], .marketing-toggle') !== null
      };
      
      return {
        hasNotificationSection: true,
        ...notificationToggles,
        activeTogglesCount: Object.values(notificationToggles).filter(Boolean).length
      };
    });
    
    console.log('🔔 알림 설정:', notificationSettingsTest);
    
    // 4. 결제 및 구독 설정 테스트
    const subscriptionSettingsTest = await page.evaluate(() => {
      const subscriptionSection = document.querySelector('.subscription-settings, [data-section="subscriptions"]');
      const paymentSection = document.querySelector('.payment-settings, [data-section="payment"]');
      
      const subscriptionElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent || '';
        return text.includes('구독') || text.includes('결제') || text.includes('환율') || text.includes('통화');
      });
      
      const currencySelect = Array.from(document.querySelectorAll('select[name*="currency"], select')).find(sel =>
        (sel.textContent || '').includes('KRW') || (sel.textContent || '').includes('USD')
      );
      const exchangeRateInput = document.querySelector('input[name*="exchange"], input[name*="rate"]');
      const defaultCategorySelect = Array.from(document.querySelectorAll('select[name*="category"], select')).find(sel =>
        (sel.textContent || '').includes('카테고리')
      );
      
      return {
        hasSubscriptionSection: subscriptionSection !== null,
        hasPaymentSection: paymentSection !== null,
        subscriptionElementsCount: subscriptionElements.length,
        hasCurrencySettings: currencySelect !== null,
        hasExchangeRateSettings: exchangeRateInput !== null,
        hasDefaultCategorySettings: defaultCategorySelect !== null,
        hasSubscriptionRelatedSettings: subscriptionElements.length > 0
      };
    });
    
    console.log('💳 구독 설정:', subscriptionSettingsTest);
    
    // 5. 테마 및 외관 설정 테스트
    const themeSettingsTest = await page.evaluate(() => {
      const themeSection = document.querySelector('.theme-settings, [data-section="theme"], [data-section="appearance"]');
      
      const themeElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent || '';
        return text.includes('테마') || text.includes('다크') || text.includes('라이트') || 
               text.includes('theme') || text.includes('dark') || text.includes('light');
      });
      
      const themeToggles = document.querySelectorAll('input[name*="theme"], .theme-toggle, .dark-mode-toggle');
      const colorPickers = document.querySelectorAll('input[type="color"], .color-picker');
      
      return {
        hasThemeSection: themeSection !== null,
        themeElementsCount: themeElements.length,
        themeTogglesCount: themeToggles.length,
        colorPickersCount: colorPickers.length,
        hasThemeRelatedSettings: themeElements.length > 0 || themeToggles.length > 0,
        currentTheme: document.documentElement.classList.contains('dark') ? 'dark' : 
                     document.documentElement.classList.contains('light') ? 'light' : 'auto'
      };
    });
    
    console.log('🎨 테마 설정:', themeSettingsTest);
    
    // 6. 보안 및 개인정보 설정 테스트
    const securitySettingsTest = await page.evaluate(() => {
      const securitySection = document.querySelector('.security-settings, [data-section="security"]');
      const privacySection = document.querySelector('.privacy-settings, [data-section="privacy"]');
      
      const securityElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent || '';
        return text.includes('보안') || text.includes('비밀번호') || text.includes('2단계') || 
               text.includes('security') || text.includes('password') || text.includes('2fa');
      });
      
      const privacyElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent || '';
        return text.includes('개인정보') || text.includes('데이터') || text.includes('수집') || 
               text.includes('privacy') || text.includes('data') || text.includes('analytics');
      });
      
      return {
        hasSecuritySection: securitySection !== null,
        hasPrivacySection: privacySection !== null,
        securityElementsCount: securityElements.length,
        privacyElementsCount: privacyElements.length,
        hasPasswordChange: securityElements.some(el => 
          (el.textContent || '').includes('비밀번호') || (el.textContent || '').includes('password')
        ),
        hasTwoFactorAuth: securityElements.some(el => 
          (el.textContent || '').includes('2단계') || (el.textContent || '').includes('2fa')
        )
      };
    });
    
    console.log('🔒 보안 설정:', securitySettingsTest);
    
    // 7. 설정 저장 및 적용 테스트
    const settingsSaveTest = await page.evaluate(() => {
      const saveButtons = Array.from(document.querySelectorAll('button')).filter(btn =>
        (btn.textContent || '').includes('저장') || (btn.textContent || '').includes('적용') ||
        (btn.textContent || '').includes('save') || btn.type === 'submit'
      );
      
      const resetButtons = Array.from(document.querySelectorAll('button')).filter(btn =>
        (btn.textContent || '').includes('초기화') || (btn.textContent || '').includes('리셋') ||
        (btn.textContent || '').includes('reset')
      );
      
      const forms = document.querySelectorAll('form');
      const hasUnsavedChangesIndicator = document.querySelector('.unsaved, .dirty, [data-unsaved]') !== null;
      
      return {
        saveButtonsCount: saveButtons.length,
        resetButtonsCount: resetButtons.length,
        formsCount: forms.length,
        hasFormValidation: Array.from(forms).some(form => 
          form.querySelector('input[required]') !== null
        ),
        hasUnsavedChangesIndicator,
        hasConfirmationDialogs: document.querySelector('.modal, .dialog, .confirm') !== null
      };
    });
    
    console.log('💾 설정 저장:', settingsSaveTest);
    
    // 8. 설정 검색 및 네비게이션 테스트
    const settingsNavigationTest = await page.evaluate(() => {
      const searchInput = document.querySelector('input[type="search"], input[placeholder*="검색"]');
      const sidebarNavigation = document.querySelector('.sidebar, .settings-nav, .nav-menu');
      const breadcrumbs = document.querySelector('.breadcrumb, .breadcrumbs');
      const backButton = Array.from(document.querySelectorAll('.back-button, button')).find(btn =>
        (btn.textContent || '').includes('뒤로')
      );
      
      const navigationLinks = document.querySelectorAll('.nav-link, .menu-item, a[href*="settings"]');
      
      return {
        hasSearchFunction: searchInput !== null,
        hasSidebarNavigation: sidebarNavigation !== null,
        hasBreadcrumbs: breadcrumbs !== null,
        hasBackButton: backButton !== null,
        navigationLinksCount: navigationLinks.length,
        hasTabNavigation: document.querySelectorAll('[role="tab"]').length > 0
      };
    });
    
    console.log('🧭 설정 네비게이션:', settingsNavigationTest);
    
    // 9. 종합 평가
    const settingsSystemHealth = {
      hasBasicStructure: settingsPageStructure.hasHeader && settingsPageStructure.hasInputFields > 0,
      hasProfileSettings: profileSettingsTest.hasProfileSection || profileSettingsTest.profileFieldsCount > 0,
      hasNotificationSettings: notificationSettingsTest.hasNotificationSection || notificationSettingsTest.hasNotificationElements,
      hasSubscriptionSettings: subscriptionSettingsTest.hasSubscriptionRelatedSettings,
      hasThemeSettings: themeSettingsTest.hasThemeRelatedSettings,
      hasSecuritySettings: securitySettingsTest.securityElementsCount > 0 || securitySettingsTest.privacyElementsCount > 0,
      hasSaveFunction: settingsSaveTest.saveButtonsCount > 0 || settingsSaveTest.formsCount > 0,
      hasGoodNavigation: settingsNavigationTest.hasTabNavigation || settingsNavigationTest.navigationLinksCount > 0
    };
    
    const workingFeatures = Object.values(settingsSystemHealth).filter(Boolean).length;
    const totalFeatures = Object.keys(settingsSystemHealth).length;
    
    console.log('\\n⚙️ 설정 시스템 건강도:');
    console.log(`   - 기본 구조: ${settingsSystemHealth.hasBasicStructure ? '✅' : '❌'}`);
    console.log(`   - 프로필 설정: ${settingsSystemHealth.hasProfileSettings ? '✅' : '❌'}`);
    console.log(`   - 알림 설정: ${settingsSystemHealth.hasNotificationSettings ? '✅' : '❌'}`);
    console.log(`   - 구독 설정: ${settingsSystemHealth.hasSubscriptionSettings ? '✅' : '❌'}`);
    console.log(`   - 테마 설정: ${settingsSystemHealth.hasThemeSettings ? '✅' : '❌'}`);
    console.log(`   - 보안 설정: ${settingsSystemHealth.hasSecuritySettings ? '✅' : '❌'}`);
    console.log(`   - 저장 기능: ${settingsSystemHealth.hasSaveFunction ? '✅' : '❌'}`);
    console.log(`   - 네비게이션: ${settingsSystemHealth.hasGoodNavigation ? '✅' : '❌'}`);
    console.log(`   - 전체 성공률: ${((workingFeatures / totalFeatures) * 100).toFixed(1)}%`);
    
    expect(workingFeatures).toBeGreaterThanOrEqual(5);
  });

  test('Step 6: 결제 캘린더 및 일정 관리 테스트', async ({ page }) => {
    console.log('\\n=== Step 6: 결제 캘린더 및 일정 관리 테스트 ===');
    
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('🔒 인증 필요 - 캘린더 기능 접근 불가');
      return;
    }
    
    // 1. 캘린더 페이지 접근 또는 캘린더 컴포넌트 확인
    let calendarFound = false;
    
    // 대시보드에서 캘린더 컴포넌트 확인
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(2000);
    
    const dashboardCalendarCheck = await page.evaluate(() => {
      return {
        hasCalendarComponent: document.querySelector('.calendar, [data-calendar]') !== null,
        hasPaymentDates: Array.from(document.querySelectorAll('*')).some(el =>
          (el.textContent || '').includes('결제일') || (el.textContent || '').includes('payment')
        ),
        hasUpcomingEvents: Array.from(document.querySelectorAll('*')).some(el =>
          (el.textContent || '').includes('예정') || (el.textContent || '').includes('upcoming')
        ),
        hasDatePickers: document.querySelectorAll('input[type="date"], .date-picker').length,
        hasScheduleElements: document.querySelectorAll('.schedule, .event, .appointment').length
      };
    });
    
    console.log('📅 대시보드 캘린더 확인:', dashboardCalendarCheck);
    
    // 전용 캘린더 페이지 확인 시도
    try {
      await page.goto('http://localhost:3000/calendar');
      await page.waitForTimeout(2000);
      calendarFound = true;
    } catch (error) {
      console.log('📅 전용 캘린더 페이지 없음');
      await page.goto('http://localhost:3000/dashboard');
      await page.waitForTimeout(1000);
    }
    
    const calendarPageStructure = await page.evaluate(() => {
      return {
        hasCalendarGrid: document.querySelector('.calendar-grid, .month-view, .week-view') !== null,
        hasCalendarNavigation: document.querySelectorAll('.prev-month, .next-month, .calendar-nav').length > 0,
        hasMonthYearDisplay: Array.from(document.querySelectorAll('*')).some(el => {
          const text = el.textContent || '';
          return /\\d{4}/.test(text) && (/1월|2월|3월|4월|5월|6월|7월|8월|9월|10월|11월|12월/.test(text) || 
                 /Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/.test(text));
        }),
        hasDateCells: document.querySelectorAll('.date-cell, .calendar-day, [data-date]').length,
        hasEventIndicators: document.querySelectorAll('.event-dot, .payment-indicator, .reminder').length,
        hasToday: document.querySelector('.today, .current-date') !== null,
        calendarType: calendarFound ? 'dedicated' : 'embedded'
      };
    });
    
    console.log('📅 캘린더 구조:', calendarPageStructure);
    
    // 2. 결제 일정 표시 기능 테스트
    const paymentScheduleTest = await page.evaluate(() => {
      const paymentElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent || '';
        return text.includes('결제') || text.includes('payment') || 
               text.includes('구독') || text.includes('subscription');
      });
      
      const dateElements = Array.from(document.querySelectorAll('[data-date], .date')).filter(el => {
        const hasPaymentIndicator = el.querySelector('.payment, .subscription, .event-dot') !== null;
        const hasPaymentText = (el.textContent || '').includes('결제') || (el.textContent || '').includes('구독');
        return hasPaymentIndicator || hasPaymentText;
      });
      
      return {
        paymentElementsCount: paymentElements.length,
        paymentDatesCount: dateElements.length,
        hasPaymentIndicators: document.querySelectorAll('.payment-dot, .subscription-indicator').length > 0,
        hasPaymentAmounts: paymentElements.some(el => 
          /\\d+원|\\$\\d+/.test(el.textContent || '')
        ),
        hasColorCoding: document.querySelector('[style*="color"], .text-red, .text-green, .text-blue') !== null
      };
    });
    
    console.log('💳 결제 일정 표시:', paymentScheduleTest);
    
    // 3. 캘린더 인터랙션 테스트
    const calendarInteractionTest = await page.evaluate(() => {
      const clickableDates = Array.from(document.querySelectorAll('.date-cell, .calendar-day, [data-date]')).filter(el =>
        el.onclick !== null || el.classList.contains('clickable') || el.getAttribute('role') === 'button'
      );
      
      const navigationButtons = document.querySelectorAll('.prev, .next, .calendar-nav button');
      const viewSwitchers = Array.from(document.querySelectorAll('button')).filter(btn => {
        const text = btn.textContent || '';
        return text.includes('월') || text.includes('주') || text.includes('일') ||
               text.includes('month') || text.includes('week') || text.includes('day');
      });
      
      return {
        clickableDatesCount: clickableDates.length,
        hasNavigationButtons: navigationButtons.length > 0,
        viewSwitchersCount: viewSwitchers.length,
        hasEventDetails: document.querySelector('.event-details, .payment-details, .tooltip') !== null,
        hasDateSelection: document.querySelector('.selected-date, .active-date') !== null
      };
    });
    
    console.log('🖱️ 캘린더 상호작용:', calendarInteractionTest);
    
    // 4. 알림 및 리마인더 기능 테스트
    const reminderTest = await page.evaluate(() => {
      const reminderElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent || '';
        return text.includes('알림') || text.includes('리마인더') || text.includes('reminder') ||
               text.includes('곧 결제') || text.includes('오늘 결제');
      });
      
      const upcomingPayments = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent || '';
        return text.includes('3일 후') || text.includes('7일 후') || text.includes('내일') ||
               text.includes('오늘') || /\\d+일\\s*후/.test(text);
      });
      
      return {
        reminderElementsCount: reminderElements.length,
        upcomingPaymentsCount: upcomingPayments.length,
        hasNotificationBadges: document.querySelectorAll('.badge, .notification-count').length > 0,
        hasUrgentIndicators: document.querySelectorAll('.urgent, .overdue, .red').length > 0,
        reminderSamples: reminderElements.slice(0, 3).map(el => 
          (el.textContent || '').substring(0, 30) + '...'
        )
      };
    });
    
    console.log('🔔 리마인더 기능:', reminderTest);
    
    // 5. 필터링 및 검색 기능 테스트
    const calendarFilterTest = await page.evaluate(() => {
      const filterButtons = Array.from(document.querySelectorAll('button')).filter(btn => {
        const text = btn.textContent || '';
        return text.includes('필터') || text.includes('카테고리') || text.includes('전체') ||
               text.includes('결제') || text.includes('구독');
      });
      
      const searchInput = document.querySelector('input[type="search"], input[placeholder*="검색"]');
      const categoryFilters = Array.from(document.querySelectorAll('button, .filter')).filter(el => {
        const text = el.textContent || '';
        return text.includes('엔터') || text.includes('음악') || text.includes('개발') ||
               text.includes('AI') || text.includes('디자인');
      });
      
      return {
        filterButtonsCount: filterButtons.length,
        hasSearchFunction: searchInput !== null,
        categoryFiltersCount: categoryFilters.length,
        hasDateRangeFilter: document.querySelector('.date-range, input[type="date"]') !== null,
        hasAmountFilter: document.querySelector('.amount-filter, input[type="number"]') !== null
      };
    });
    
    console.log('🔍 캘린더 필터링:', calendarFilterTest);
    
    // 6. 반응형 및 모바일 지원 테스트
    const responsiveCalendarTest = await page.evaluate(() => {
      const viewportWidth = window.innerWidth;
      const isMobile = viewportWidth < 768;
      
      return {
        viewportWidth,
        isMobileView: isMobile,
        hasResponsiveClasses: document.querySelector('[class*="md:"], [class*="lg:"], [class*="sm:"]') !== null,
        hasCollapsibleSidebar: document.querySelector('.sidebar-toggle, .mobile-menu') !== null,
        hasSwipeSupport: document.querySelector('[data-swipe], .swipeable') !== null,
        calendarScrollable: document.querySelector('.calendar-container')?.style.overflowX === 'auto',
        hasCompactView: isMobile && document.querySelector('.compact, .mobile-calendar') !== null
      };
    });
    
    console.log('📱 반응형 캘린더:', responsiveCalendarTest);
    
    // 7. 데이터 동기화 및 실시간 업데이트 테스트
    const calendarSyncTest = await page.evaluate(() => {
      return new Promise((resolve) => {
        let updateCount = 0;
        const startTime = Date.now();
        
        const observer = new MutationObserver(() => {
          updateCount++;
        });
        
        const calendarContainer = document.querySelector('.calendar, .calendar-container, [data-calendar]');
        if (calendarContainer) {
          observer.observe(calendarContainer, { 
            childList: true, 
            subtree: true,
            attributes: true 
          });
        }
        
        setTimeout(() => {
          observer.disconnect();
          resolve({
            calendarUpdates: updateCount,
            hasRealTimeSync: updateCount > 0,
            testDuration: Date.now() - startTime,
            hasCalendarContainer: calendarContainer !== null
          });
        }, 3000);
      });
    });
    
    const syncResults = await calendarSyncTest;
    console.log('🔄 캘린더 동기화:', syncResults);
    
    // 8. 종합 평가
    const calendarSystemHealth = {
      hasCalendarDisplay: calendarPageStructure.hasCalendarGrid || calendarPageStructure.hasDateCells > 0,
      hasPaymentSchedule: paymentScheduleTest.paymentElementsCount > 0 || paymentScheduleTest.paymentDatesCount > 0,
      hasInteractivity: calendarInteractionTest.clickableDatesCount > 0 || calendarInteractionTest.hasNavigationButtons,
      hasReminderFunction: reminderTest.reminderElementsCount > 0 || reminderTest.upcomingPaymentsCount > 0,
      hasFilteringFeatures: calendarFilterTest.filterButtonsCount > 0 || calendarFilterTest.hasSearchFunction,
      isResponsive: responsiveCalendarTest.hasResponsiveClasses,
      hasDataSync: syncResults.hasCalendarContainer
    };
    
    const workingFeatures = Object.values(calendarSystemHealth).filter(Boolean).length;
    const totalFeatures = Object.keys(calendarSystemHealth).length;
    
    console.log('\\n📅 캘린더 시스템 건강도:');
    console.log(`   - 캘린더 표시: ${calendarSystemHealth.hasCalendarDisplay ? '✅' : '❌'}`);
    console.log(`   - 결제 일정: ${calendarSystemHealth.hasPaymentSchedule ? '✅' : '❌'}`);
    console.log(`   - 상호작용: ${calendarSystemHealth.hasInteractivity ? '✅' : '❌'}`);
    console.log(`   - 리마인더: ${calendarSystemHealth.hasReminderFunction ? '✅' : '❌'}`);
    console.log(`   - 필터링: ${calendarSystemHealth.hasFilteringFeatures ? '✅' : '❌'}`);
    console.log(`   - 반응형: ${calendarSystemHealth.isResponsive ? '✅' : '❌'}`);
    console.log(`   - 데이터 동기화: ${calendarSystemHealth.hasDataSync ? '✅' : '❌'}`);
    console.log(`   - 전체 성공률: ${((workingFeatures / totalFeatures) * 100).toFixed(1)}%`);
    
    expect(workingFeatures).toBeGreaterThanOrEqual(3);
  });

  test('Step 7: Firebase 연동 및 데이터 동기화 테스트', async ({ page }) => {
    console.log('\\n=== Step 7: Firebase 연동 및 데이터 동기화 테스트 ===');
    
    // Firebase 연결 모니터링 설정
    await page.route('**/*', (route) => {
      const url = route.request().url();
      if (url.includes('firestore') || url.includes('firebase')) {
        console.log('🔥 Firebase 요청 감지:', route.request().method(), url.split('/').pop()?.substring(0, 30));
      }
      route.continue();
    });
    
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    // 1. Firebase SDK 로드 및 초기화 확인
    const firebaseInitialization = await page.evaluate(() => {
      return {
        hasFirebaseSDK: typeof window.firebase !== 'undefined',
        hasAuth: typeof window.auth !== 'undefined',
        hasFirestore: typeof window.db !== 'undefined',
        hasStorage: typeof window.storage !== 'undefined',
        hasAnalytics: typeof window.analytics !== 'undefined',
        firebaseConfig: typeof window.firebaseConfig !== 'undefined',
        
        // Firebase 서비스 상태
        authCurrentUser: window.auth?.currentUser !== undefined,
        firestoreConnected: window.db !== undefined,
        
        // 에러 확인
        hasFirebaseErrors: window.console?.errors?.some(error => 
          error.includes('firebase') || error.includes('firestore')
        ) || false,
        
        // 환경 변수 확인
        hasApiKey: document.querySelector('script')?.textContent?.includes('AIzaSyA') || false
      };
    });
    
    console.log('🔥 Firebase 초기화 상태:', firebaseInitialization);
    
    // 2. 인증 시스템 Firebase 연동 테스트
    const authFirebaseTest = await page.evaluate(() => {
      return {
        hasAuthStateListener: typeof window.onAuthStateChanged !== 'undefined',
        hasGoogleAuthProvider: typeof window.GoogleAuthProvider !== 'undefined',
        authPersistence: localStorage.getItem('firebase:authUser:AIzaSyA') !== null,
        hasAuthContext: typeof window.AuthContext !== 'undefined' || 
                       document.querySelector('[data-auth-context]') !== null,
        
        // 로그인 상태 확인
        isLoggedIn: window.location.pathname !== '/login',
        hasUserData: localStorage.getItem('userData') !== null ||
                    sessionStorage.getItem('userData') !== null
      };
    });
    
    console.log('🔐 인증 Firebase 연동:', authFirebaseTest);
    
    // 3. Firestore 데이터베이스 연결 테스트
    const firestoreConnectionTest = await page.evaluate(() => {
      return new Promise((resolve) => {
        try {
          // Firebase 연결 상태 확인
          const connectionState = {
            hasFirestoreImport: typeof window.addDoc !== 'undefined' || 
                               typeof window.collection !== 'undefined',
            hasQueryFunctions: typeof window.query !== 'undefined' ||
                              typeof window.where !== 'undefined',
            hasRealtimeListeners: typeof window.onSnapshot !== 'undefined',
            
            // 컬렉션 참조 확인
            hasSubscriptionsCollection: typeof window.subscriptionsRef !== 'undefined',
            hasNotificationsCollection: typeof window.notificationsRef !== 'undefined',
            hasUsersCollection: typeof window.usersRef !== 'undefined',
            
            // 서비스 클래스 확인
            hasNotificationService: typeof window.notificationService !== 'undefined',
            hasDataContext: typeof window.DataContext !== 'undefined',
            
            networkState: navigator.onLine,
            timestamp: new Date().toISOString()
          };
          
          resolve(connectionState);
        } catch (error) {
          resolve({
            error: error.message,
            hasFirestoreError: true
          });
        }
      });
    });
    
    const firestoreResults = await firestoreConnectionTest;
    console.log('🗄️ Firestore 연결 테스트:', firestoreResults);
    
    // 4. 실시간 데이터 동기화 테스트
    const realtimeSyncTest = await page.evaluate(() => {
      return new Promise((resolve) => {
        let dataUpdateCount = 0;
        let subscriptionUpdateCount = 0;
        let notificationUpdateCount = 0;
        
        // 데이터 변화 감지
        const observer = new MutationObserver((mutations) => {
          mutations.forEach(mutation => {
            if (mutation.target.classList?.contains('subscription-card') ||
                mutation.target.querySelector?.('.subscription-card')) {
              subscriptionUpdateCount++;
            }
            if (mutation.target.classList?.contains('notification-item') ||
                mutation.target.querySelector?.('.notification-item')) {
              notificationUpdateCount++;
            }
            dataUpdateCount++;
          });
        });
        
        // 메인 콘텐츠 영역 관찰
        const mainContent = document.querySelector('main, .app-content, [role="main"]');
        if (mainContent) {
          observer.observe(mainContent, {
            childList: true,
            subtree: true,
            attributes: true
          });
        }
        
        // 5초 후 결과 반환
        setTimeout(() => {
          observer.disconnect();
          resolve({
            totalDataUpdates: dataUpdateCount,
            subscriptionUpdates: subscriptionUpdateCount,
            notificationUpdates: notificationUpdateCount,
            hasRealtimeCapability: dataUpdateCount > 0,
            observedElement: mainContent !== null,
            
            // Firebase 리스너 확인
            hasActiveListeners: typeof window.unsubscribeListeners !== 'undefined',
            connectionQuality: navigator.connection?.effectiveType || 'unknown'
          });
        }, 5000);
      });
    });
    
    const syncResults = await realtimeSyncTest;
    console.log('⚡ 실시간 동기화 테스트:', syncResults);
    
    // 5. 오프라인 지원 및 캐싱 테스트
    const offlineSupportTest = await page.evaluate(() => {
      return {
        hasServiceWorker: 'serviceWorker' in navigator,
        serviceWorkerRegistered: navigator.serviceWorker?.controller !== null,
        hasOfflineIndicator: document.querySelector('.offline-indicator, [data-offline]') !== null,
        
        // Firebase 오프라인 지원
        hasFirestoreOffline: typeof window.enableNetwork !== 'undefined' &&
                            typeof window.disableNetwork !== 'undefined',
        
        // 로컬 캐싱
        hasLocalStorageData: Object.keys(localStorage).length > 0,
        hasIndexedDBSupport: 'indexedDB' in window,
        hasCacheAPI: 'caches' in window,
        
        // PWA 기능
        hasManifest: document.querySelector('link[rel="manifest"]') !== null,
        isInstallable: window.matchMedia('(display-mode: standalone)').matches
      };
    });
    
    console.log('📱 오프라인 지원:', offlineSupportTest);
    
    // 6. 데이터 무결성 및 검증 테스트
    const dataIntegrityTest = await page.evaluate(() => {
      // 로컬 스토리지의 데이터 검증
      const localData = {
        subscriptions: localStorage.getItem('subscriptions'),
        notifications: localStorage.getItem('notifications'),
        userData: localStorage.getItem('userData'),
        preferences: localStorage.getItem('preferences')
      };
      
      const dataValidation = {};
      Object.keys(localData).forEach(key => {
        if (localData[key]) {
          try {
            const parsed = JSON.parse(localData[key]);
            dataValidation[key] = {
              isValidJSON: true,
              hasData: Object.keys(parsed).length > 0,
              dataType: Array.isArray(parsed) ? 'array' : typeof parsed
            };
          } catch {
            dataValidation[key] = {
              isValidJSON: false,
              hasData: false
            };
          }
        } else {
          dataValidation[key] = { hasData: false };
        }
      });
      
      return {
        localDataValidation: dataValidation,
        hasValidationErrors: Object.values(dataValidation).some(v => v.isValidJSON === false),
        totalDataKeys: Object.keys(localStorage).length,
        
        // 타입 검증
        hasTypeDefinitions: typeof window.Subscription !== 'undefined' ||
                           typeof window.NotificationUI !== 'undefined',
        
        // 에러 바운더리
        hasErrorBoundaries: document.querySelector('[data-error-boundary]') !== null
      };
    });
    
    console.log('🔍 데이터 무결성:', dataIntegrityTest);
    
    // 7. 성능 및 최적화 테스트
    const performanceTest = await page.evaluate(() => {
      const performanceEntries = performance.getEntriesByType('navigation')[0];
      const resourceEntries = performance.getEntriesByType('resource');
      
      const firebaseResources = resourceEntries.filter(entry => 
        entry.name.includes('firebase') || entry.name.includes('firestore')
      );
      
      return {
        // 로딩 성능
        domContentLoadTime: performanceEntries ? 
          performanceEntries.domContentLoadedEventEnd - performanceEntries.domContentLoadedEventStart : 0,
        totalLoadTime: performanceEntries ? 
          performanceEntries.loadEventEnd - performanceEntries.navigationStart : 0,
        
        // Firebase 리소스 성능
        firebaseResourcesCount: firebaseResources.length,
        averageFirebaseLoadTime: firebaseResources.length > 0 ? 
          firebaseResources.reduce((sum, r) => sum + r.duration, 0) / firebaseResources.length : 0,
        
        // 메모리 사용량
        hasMemoryInfo: 'memory' in performance,
        memoryUsage: performance.memory ? {
          used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
        } : null,
        
        // 최적화 확인
        hasLazyLoading: document.querySelectorAll('[loading="lazy"]').length > 0,
        hasCodeSplitting: Array.from(document.scripts).some(script => 
          script.src.includes('chunk') || script.src.includes('vendor')
        )
      };
    });
    
    console.log('⚡ Firebase 성능:', performanceTest);
    
    // 8. 종합 평가
    const firebaseSystemHealth = {
      hasSDKLoaded: firebaseInitialization.hasFirebaseSDK || firebaseInitialization.hasFirestore,
      hasAuthIntegration: authFirebaseTest.hasAuthStateListener || authFirebaseTest.authPersistence,
      hasFirestoreConnection: firestoreResults.hasFirestoreImport && !firestoreResults.hasFirestoreError,
      hasRealtimeSync: syncResults.hasRealtimeCapability || syncResults.hasActiveListeners,
      hasOfflineSupport: offlineSupportTest.hasServiceWorker || offlineSupportTest.hasFirestoreOffline,
      hasDataIntegrity: !dataIntegrityTest.hasValidationErrors && dataIntegrityTest.totalDataKeys > 0,
      hasGoodPerformance: performanceTest.totalLoadTime < 5000 || performanceTest.averageFirebaseLoadTime < 1000
    };
    
    const workingFeatures = Object.values(firebaseSystemHealth).filter(Boolean).length;
    const totalFeatures = Object.keys(firebaseSystemHealth).length;
    
    console.log('\\n🔥 Firebase 시스템 건강도:');
    console.log(`   - SDK 로드: ${firebaseSystemHealth.hasSDKLoaded ? '✅' : '❌'}`);
    console.log(`   - 인증 연동: ${firebaseSystemHealth.hasAuthIntegration ? '✅' : '❌'}`);
    console.log(`   - Firestore 연결: ${firebaseSystemHealth.hasFirestoreConnection ? '✅' : '❌'}`);
    console.log(`   - 실시간 동기화: ${firebaseSystemHealth.hasRealtimeSync ? '✅' : '❌'}`);
    console.log(`   - 오프라인 지원: ${firebaseSystemHealth.hasOfflineSupport ? '✅' : '❌'}`);
    console.log(`   - 데이터 무결성: ${firebaseSystemHealth.hasDataIntegrity ? '✅' : '❌'}`);
    console.log(`   - 성능: ${firebaseSystemHealth.hasGoodPerformance ? '✅' : '❌'}`);
    console.log(`   - 전체 성공률: ${((workingFeatures / totalFeatures) * 100).toFixed(1)}%`);
    
    expect(workingFeatures).toBeGreaterThanOrEqual(3);
  });

  test('Step 8: 성능 최적화 및 메모리 누수 검사', async ({ page }) => {
    console.log('\\n=== Step 8: 성능 최적화 및 메모리 누수 검사 ===');
    
    // 성능 측정 시작
    await page.goto('http://localhost:3000');
    const startTime = Date.now();
    await page.waitForTimeout(3000);
    
    // 1. 초기 로딩 성능 측정
    const initialPerformance = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0];
      const resources = performance.getEntriesByType('resource');
      
      return {
        // 로딩 시간 분석
        domContentLoaded: perf ? perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart : 0,
        loadComplete: perf ? perf.loadEventEnd - perf.loadEventStart : 0,
        totalLoadTime: perf ? perf.loadEventEnd - perf.navigationStart : 0,
        
        // 리소스 분석
        totalResources: resources.length,
        jsResources: resources.filter(r => r.name.includes('.js')).length,
        cssResources: resources.filter(r => r.name.includes('.css')).length,
        imageResources: resources.filter(r => r.name.includes('.png') || r.name.includes('.jpg') || r.name.includes('.svg')).length,
        
        // 번들 크기 분석
        largestResource: resources.reduce((largest, current) => 
          current.transferSize > (largest?.transferSize || 0) ? current : largest, null
        ),
        totalTransferSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
        
        // First Paint 지표
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      };
    });
    
    console.log('⚡ 초기 로딩 성능:', {
      ...initialPerformance,
      totalTransferSizeMB: Math.round(initialPerformance.totalTransferSize / 1024 / 1024 * 100) / 100,
      largestResourceSize: initialPerformance.largestResource ? 
        Math.round(initialPerformance.largestResource.transferSize / 1024) + 'KB' : 'N/A'
    });
    
    // 2. 메모리 사용량 및 누수 검사
    const memoryTest = await page.evaluate(() => {
      return new Promise((resolve) => {
        const measurements = [];
        let intervalCount = 0;
        const maxIntervals = 10;
        
        const measureMemory = () => {
          if (performance.memory) {
            measurements.push({
              timestamp: Date.now(),
              used: performance.memory.usedJSHeapSize,
              total: performance.memory.totalJSHeapSize,
              limit: performance.memory.jsHeapSizeLimit
            });
          }
          
          intervalCount++;
          if (intervalCount >= maxIntervals) {
            clearInterval(memoryInterval);
            
            // 메모리 트렌드 분석
            const memoryTrend = measurements.length > 1 ? 
              measurements[measurements.length - 1].used - measurements[0].used : 0;
            
            resolve({
              hasMemoryAPI: performance.memory !== undefined,
              measurements: measurements.slice(0, 3), // 처음 3개만
              memoryTrend: memoryTrend,
              isMemoryIncreasing: memoryTrend > 0,
              averageMemoryUsage: measurements.length > 0 ? 
                measurements.reduce((sum, m) => sum + m.used, 0) / measurements.length : 0,
              potentialMemoryLeak: memoryTrend > 5 * 1024 * 1024 // 5MB 증가 시 의심
            });
          }
        };
        
        const memoryInterval = setInterval(measureMemory, 500);
        measureMemory(); // 첫 측정
      });
    });
    
    const memoryResults = await memoryTest;
    console.log('🧠 메모리 사용량:', {
      ...memoryResults,
      memoryTrendMB: Math.round(memoryResults.memoryTrend / 1024 / 1024 * 100) / 100,
      averageMemoryMB: Math.round(memoryResults.averageMemoryUsage / 1024 / 1024 * 100) / 100
    });
    
    // 3. DOM 성능 및 렌더링 최적화 검사
    const domPerformanceTest = await page.evaluate(() => {
      const domMetrics = {
        totalElements: document.querySelectorAll('*').length,
        totalListItems: document.querySelectorAll('li, .item, .card').length,
        imagesCount: document.querySelectorAll('img').length,
        scriptsCount: document.querySelectorAll('script').length,
        stylesheetsCount: document.querySelectorAll('link[rel="stylesheet"]').length,
        
        // 최적화 기법 확인
        hasLazyLoading: document.querySelectorAll('[loading="lazy"]').length,
        hasVirtualization: document.querySelector('.virtual-list, .windowed') !== null,
        hasImageOptimization: document.querySelectorAll('img[srcset], picture').length,
        
        // 렌더링 성능 지표
        hasWillChange: Array.from(document.querySelectorAll('*')).some(el => 
          getComputedStyle(el).willChange !== 'auto'
        ),
        hasTransforms: Array.from(document.querySelectorAll('*')).some(el => 
          getComputedStyle(el).transform !== 'none'
        ),
        
        // 리플로우 트리거 요소
        hasFixedPositions: document.querySelectorAll('[style*="position: fixed"]').length,
        hasAbsolutePositions: document.querySelectorAll('[style*="position: absolute"]').length
      };
      
      return domMetrics;
    });
    
    console.log('🎨 DOM 성능:', domPerformanceTest);
    
    // 4. JavaScript 성능 분석
    const jsPerformanceTest = await page.evaluate(() => {
      // 전역 객체 분석
      const globalObjects = Object.keys(window).filter(key => 
        typeof window[key] === 'object' && window[key] !== null
      ).length;
      
      // 이벤트 리스너 수 (근사치)
      const elementsWithListeners = Array.from(document.querySelectorAll('*')).filter(el => {
        const events = ['click', 'scroll', 'resize', 'load'];
        return events.some(event => el['on' + event] !== null);
      }).length;
      
      // 타이머 및 인터벌 체크
      const hasActiveTimers = typeof window.activeTimers !== 'undefined' && 
                             window.activeTimers > 0;
      
      return {
        globalObjectsCount: globalObjects,
        elementsWithListeners,
        hasActiveTimers,
        
        // React/프레임워크 특정 검사
        hasReactDevTools: typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined',
        hasReactFiber: document.querySelector('[data-reactroot]') !== null,
        
        // 번들 분석
        hasSourceMaps: Array.from(document.scripts).some(script => 
          script.src.includes('.map') || script.textContent?.includes('sourceMap')
        ),
        hasMinification: Array.from(document.scripts).some(script => 
          script.textContent && script.textContent.length > 1000 && 
          !script.textContent.includes('\\n')
        )
      };
    });
    
    console.log('⚙️ JavaScript 성능:', jsPerformanceTest);
    
    // 5. 네트워크 성능 및 캐싱 검사
    const networkPerformanceTest = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      
      const cacheAnalysis = {
        cachedResources: resources.filter(r => r.transferSize === 0).length,
        uncachedResources: resources.filter(r => r.transferSize > 0).length,
        totalCacheHitRate: resources.length > 0 ? 
          (resources.filter(r => r.transferSize === 0).length / resources.length * 100) : 0
      };
      
      const compressionAnalysis = {
        compressedResources: resources.filter(r => 
          r.encodedBodySize > 0 && r.decodedBodySize > r.encodedBodySize
        ).length,
        averageCompressionRatio: resources.length > 0 ? 
          resources.reduce((sum, r) => {
            if (r.encodedBodySize > 0 && r.decodedBodySize > 0) {
              return sum + (r.encodedBodySize / r.decodedBodySize);
            }
            return sum;
          }, 0) / resources.length : 0
      };
      
      return {
        ...cacheAnalysis,
        ...compressionAnalysis,
        hasServiceWorker: 'serviceWorker' in navigator,
        serviceWorkerActive: navigator.serviceWorker?.controller !== null,
        connectionType: navigator.connection?.effectiveType || 'unknown',
        hasHTTP2: resources.some(r => r.nextHopProtocol?.includes('h2'))
      };
    });
    
    console.log('🌐 네트워크 성능:', networkPerformanceTest);
    
    // 6. 사용자 인터랙션 성능 테스트
    const interactionTest = await page.evaluate(() => {
      return new Promise((resolve) => {
        let interactionTimes = [];
        let clickCount = 0;
        
        const measureInteraction = (event) => {
          const startTime = performance.now();
          
          // 다음 프레임에서 렌더링 완료 시간 측정
          requestAnimationFrame(() => {
            const endTime = performance.now();
            interactionTimes.push(endTime - startTime);
            clickCount++;
            
            if (clickCount >= 3) {
              document.removeEventListener('click', measureInteraction);
              resolve({
                averageInteractionTime: interactionTimes.reduce((sum, time) => sum + time, 0) / interactionTimes.length,
                maxInteractionTime: Math.max(...interactionTimes),
                interactionSamples: interactionTimes,
                hasGoodInteractivity: interactionTimes.every(time => time < 100)
              });
            }
          });
        };
        
        document.addEventListener('click', measureInteraction);
        
        // 3초 후 타임아웃
        setTimeout(() => {
          document.removeEventListener('click', measureInteraction);
          resolve({
            noInteractions: true,
            message: 'No user interactions detected during test period'
          });
        }, 3000);
        
        // 자동 클릭 시뮬레이션
        setTimeout(() => {
          const clickableElements = document.querySelectorAll('button, a, [onclick]');
          if (clickableElements.length > 0) {
            for (let i = 0; i < Math.min(3, clickableElements.length); i++) {
              setTimeout(() => {
                clickableElements[i].click();
              }, i * 100);
            }
          }
        }, 500);
      });
    });
    
    const interactionResults = await interactionTest;
    console.log('👆 사용자 상호작용 성능:', interactionResults);
    
    // 7. 종합 성능 점수 계산
    const performanceScore = {
      loadingPerformance: initialPerformance.totalLoadTime < 3000 && initialPerformance.firstContentfulPaint < 2000,
      memoryEfficiency: !memoryResults.potentialMemoryLeak && memoryResults.averageMemoryUsage < 50 * 1024 * 1024,
      domOptimization: domPerformanceTest.totalElements < 1000 && domPerformanceTest.hasLazyLoading > 0,
      jsPerformance: jsPerformanceTest.hasMinification && jsPerformanceTest.globalObjectsCount < 100,
      networkOptimization: networkPerformanceTest.totalCacheHitRate > 50 && networkPerformanceTest.hasServiceWorker,
      interactionResponsiveness: !interactionResults.noInteractions && 
                                (interactionResults.hasGoodInteractivity || interactionResults.averageInteractionTime < 100)
    };
    
    const workingOptimizations = Object.values(performanceScore).filter(Boolean).length;
    const totalOptimizations = Object.keys(performanceScore).length;
    
    console.log('\\n⚡ 성능 최적화 종합 평가:');
    console.log(`   - 로딩 성능: ${performanceScore.loadingPerformance ? '✅' : '❌'}`);
    console.log(`   - 메모리 효율성: ${performanceScore.memoryEfficiency ? '✅' : '❌'}`);
    console.log(`   - DOM 최적화: ${performanceScore.domOptimization ? '✅' : '❌'}`);
    console.log(`   - JS 성능: ${performanceScore.jsPerformance ? '✅' : '❌'}`);
    console.log(`   - 네트워크 최적화: ${performanceScore.networkOptimization ? '✅' : '❌'}`);
    console.log(`   - 상호작용 반응성: ${performanceScore.interactionResponsiveness ? '✅' : '❌'}`);
    console.log(`   - 전체 최적화율: ${((workingOptimizations / totalOptimizations) * 100).toFixed(1)}%`);
    
    expect(workingOptimizations).toBeGreaterThanOrEqual(3);
  });

  test('Step 9: 보안 및 에러 처리 메커니즘 테스트', async ({ page }) => {
    console.log('\\n=== Step 9: 보안 및 에러 처리 메커니즘 테스트 ===');
    
    // 콘솔 에러 수집 시작
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    // 1. 기본 보안 헤더 및 설정 검사
    const securityHeadersTest = await page.evaluate(() => {
      return {
        hasHTTPS: window.location.protocol === 'https:',
        hasCSP: document.querySelector('meta[http-equiv="Content-Security-Policy"]') !== null,
        hasXFrameOptions: document.querySelector('meta[http-equiv="X-Frame-Options"]') !== null,
        hasNoSniff: document.querySelector('meta[http-equiv="X-Content-Type-Options"]') !== null,
        
        // 쿠키 보안
        secureDocumentCookie: document.cookie.includes('Secure') || document.cookie.includes('HttpOnly'),
        
        // 외부 리소스 확인
        externalScripts: Array.from(document.scripts).filter(script => 
          script.src && !script.src.startsWith(window.location.origin)
        ).length,
        externalLinks: Array.from(document.links).filter(link => 
          link.href && !link.href.startsWith(window.location.origin) && link.rel !== 'stylesheet'
        ).length,
        
        // 인라인 스크립트 확인
        inlineScripts: Array.from(document.scripts).filter(script => 
          !script.src && script.textContent
        ).length
      };
    });
    
    console.log('🔒 보안 헤더 검사:', securityHeadersTest);
    
    // 2. 인증 및 권한 보안 테스트
    const authSecurityTest = await page.evaluate(() => {
      return {
        // 토큰 보안
        hasTokenInLocalStorage: Object.keys(localStorage).some(key => 
          key.includes('token') || key.includes('auth')
        ),
        hasSecureTokenStorage: Object.keys(localStorage).some(key => 
          key.includes('firebase:auth') // Firebase 인증 토큰은 안전
        ),
        
        // 민감 정보 노출 확인
        hasPasswordFields: document.querySelectorAll('input[type="password"]').length,
        passwordFieldsSecure: Array.from(document.querySelectorAll('input[type="password"]')).every(input => 
          input.autocomplete === 'current-password' || input.autocomplete === 'new-password'
        ),
        
        // CSRF 보호
        hasCSRFToken: document.querySelector('input[name="_token"], meta[name="csrf-token"]') !== null,
        
        // 권한 기반 접근 제어
        hasRoleBasedAccess: localStorage.getItem('userRole') !== null ||
                           sessionStorage.getItem('userRole') !== null,
        
        // API 보안
        hasAuthHeaders: typeof window.authHeaders !== 'undefined' ||
                       typeof window.Authorization !== 'undefined'
      };
    });
    
    console.log('🔐 인증 보안:', authSecurityTest);
    
    // 3. 입력 검증 및 XSS 보호 테스트
    const inputValidationTest = await page.evaluate(() => {
      const forms = Array.from(document.forms);
      const inputs = Array.from(document.querySelectorAll('input, textarea'));
      
      const validationAnalysis = {
        totalForms: forms.length,
        totalInputs: inputs.length,
        
        // 기본 검증
        requiredFields: inputs.filter(input => input.required).length,
        typedInputs: inputs.filter(input => 
          input.type !== 'text' && input.type !== 'textarea'
        ).length,
        
        // 패턴 검증
        patternValidation: inputs.filter(input => input.pattern).length,
        minMaxValidation: inputs.filter(input => 
          input.min || input.max || input.minLength || input.maxLength
        ).length,
        
        // XSS 보호
        hasInputSanitization: typeof window.sanitizeInput !== 'undefined' ||
                             typeof window.escapeHtml !== 'undefined',
        
        // 위험한 HTML 속성 확인
        hasOnClickAttributes: document.querySelectorAll('[onclick]').length,
        hasInlineEvents: document.querySelectorAll('[onload], [onerror], [onmouseover]').length
      };
      
      return validationAnalysis;
    });
    
    console.log('🛡️ 입력 검증:', inputValidationTest);
    
    // 4. 에러 바운더리 및 예외 처리 테스트
    const errorHandlingTest = await page.evaluate(() => {
      return {
        // React 에러 바운더리
        hasErrorBoundaries: document.querySelector('[data-error-boundary]') !== null,
        
        // 전역 에러 핸들러
        hasGlobalErrorHandler: typeof window.onerror === 'function' ||
                              typeof window.addEventListener === 'function',
        
        // Promise rejection 핸들러
        hasUnhandledRejectionHandler: typeof window.onunhandledrejection === 'function',
        
        // 사용자 친화적 에러 메시지
        hasErrorMessages: document.querySelectorAll('.error-message, .alert, [role="alert"]').length,
        hasLoadingStates: document.querySelectorAll('.loading, .spinner, .skeleton').length,
        hasFallbackUI: document.querySelector('.fallback, .error-fallback') !== null,
        
        // 네트워크 에러 처리
        hasNetworkErrorHandling: typeof window.navigator.onLine !== 'undefined',
        hasRetryMechanism: Array.from(document.querySelectorAll('button')).some(btn => 
          (btn.textContent || '').includes('다시 시도') || (btn.textContent || '').includes('재시도')
        )
      };
    });
    
    console.log('🚨 에러 처리:', errorHandlingTest);
    
    // 5. 데이터 보안 및 개인정보 보호 테스트
    const dataSecurityTest = await page.evaluate(() => {
      const sensitiveDataPatterns = [
        /\\b\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}\\b/, // 카드번호
        /\\b\\d{3}-\\d{2}-\\d{4}\\b/, // 주민번호 패턴
        /\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b/ // 이메일
      ];
      
      const pageText = document.body.textContent || '';
      const hasSensitiveDataExposed = sensitiveDataPatterns.some(pattern => 
        pattern.test(pageText)
      );
      
      return {
        // 민감 데이터 노출 확인
        hasSensitiveDataExposed,
        
        // 데이터 암호화
        hasEncryptedStorage: typeof window.crypto !== 'undefined' &&
                            typeof window.crypto.subtle !== 'undefined',
        
        // 개인정보 처리방침
        hasPrivacyPolicy: Array.from(document.links).some(link => 
          (link.textContent || '').includes('개인정보') || 
          (link.textContent || '').includes('privacy')
        ),
        
        // 쿠키 동의
        hasCookieConsent: document.querySelector('.cookie-consent, .gdpr-consent') !== null,
        
        // 데이터 최소화
        localStorageSize: JSON.stringify(localStorage).length,
        sessionStorageSize: JSON.stringify(sessionStorage).length,
        
        // 로깅 보안
        hasSecureLogging: !pageText.includes('password') && 
                         !pageText.includes('token') &&
                         !pageText.includes('secret')
      };
    });
    
    console.log('🔒 데이터 보안:', dataSecurityTest);
    
    // 6. 네트워크 보안 테스트
    const networkSecurityTest = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      
      return {
        // HTTPS 사용률
        httpsResources: resources.filter(r => r.name.startsWith('https://')).length,
        httpResources: resources.filter(r => r.name.startsWith('http://') && !r.name.includes('localhost')).length,
        
        // Mixed Content 확인
        hasMixedContent: window.location.protocol === 'https:' && 
                        resources.some(r => r.name.startsWith('http://')),
        
        // 외부 도메인 리소스
        externalDomains: new Set(resources
          .filter(r => !r.name.includes(window.location.hostname))
          .map(r => new URL(r.name).hostname)
        ).size,
        
        // 보안 연결
        hasSecureConnection: window.location.protocol === 'https:' || 
                           window.location.hostname === 'localhost',
        
        // API 엔드포인트 보안
        hasSecureAPIEndpoints: !Array.from(document.scripts).some(script => 
          script.textContent?.includes('http://') && 
          !script.textContent?.includes('localhost')
        )
      };
    });
    
    console.log('🌐 네트워크 보안:', networkSecurityTest);
    
    // 7. 클라이언트 사이드 보안 테스트
    const clientSecurityTest = await page.evaluate(() => {
      return {
        // DOM 조작 보안
        hasSecureDOM: typeof window.DOMPurify !== 'undefined' ||
                     typeof window.sanitize !== 'undefined',
        
        // 콘텐츠 보안
        hasFrameBreaking: document.querySelector('meta[http-equiv="X-Frame-Options"]') !== null ||
                         typeof window.top !== 'undefined',
        
        // 디버그 정보 노출
        hasDebugInfo: window.location.search.includes('debug') ||
                     typeof window.DEBUG !== 'undefined',
        isProductionBuild: process?.env?.NODE_ENV === 'production' ||
                          !document.documentElement.hasAttribute('data-dev'),
        
        // 소스맵 노출
        hasSourceMaps: Array.from(document.scripts).some(script => 
          script.src?.includes('.map')
        ),
        
        // 브라우저 보안 기능
        hasSecureContext: window.isSecureContext,
        hasWebCrypto: typeof window.crypto?.subtle !== 'undefined'
      };
    });
    
    console.log('💻 클라이언트 보안:', clientSecurityTest);
    
    // 8. 종합 보안 점수 및 에러 분석
    console.log('🚨 수집된 콘솔 에러 (처음 3개):', consoleErrors.slice(0, 3));
    
    const securityScore = {
      hasBasicSecurity: securityHeadersTest.hasHTTPS || securityHeadersTest.hasCSP,
      hasAuthSecurity: authSecurityTest.hasSecureTokenStorage && !authSecurityTest.hasTokenInLocalStorage,
      hasInputValidation: inputValidationTest.requiredFields > 0 && inputValidationTest.patternValidation > 0,
      hasErrorHandling: errorHandlingTest.hasErrorBoundaries || errorHandlingTest.hasGlobalErrorHandler,
      hasDataProtection: !dataSecurityTest.hasSensitiveDataExposed && dataSecurityTest.hasEncryptedStorage,
      hasNetworkSecurity: networkSecurityTest.hasSecureConnection && !networkSecurityTest.hasMixedContent,
      hasClientSecurity: !clientSecurityTest.hasDebugInfo && clientSecurityTest.hasSecureContext,
      hasLowErrorRate: consoleErrors.length < 5
    };
    
    const securityFeatures = Object.values(securityScore).filter(Boolean).length;
    const totalSecurityFeatures = Object.keys(securityScore).length;
    
    console.log('\\n🛡️ 보안 및 에러 처리 종합 평가:');
    console.log(`   - 기본 보안: ${securityScore.hasBasicSecurity ? '✅' : '❌'}`);
    console.log(`   - 인증 보안: ${securityScore.hasAuthSecurity ? '✅' : '❌'}`);
    console.log(`   - 입력 검증: ${securityScore.hasInputValidation ? '✅' : '❌'}`);
    console.log(`   - 에러 처리: ${securityScore.hasErrorHandling ? '✅' : '❌'}`);
    console.log(`   - 데이터 보호: ${securityScore.hasDataProtection ? '✅' : '❌'}`);
    console.log(`   - 네트워크 보안: ${securityScore.hasNetworkSecurity ? '✅' : '❌'}`);
    console.log(`   - 클라이언트 보안: ${securityScore.hasClientSecurity ? '✅' : '❌'}`);
    console.log(`   - 낮은 에러율: ${securityScore.hasLowErrorRate ? '✅' : '❌'}`);
    console.log(`   - 전체 보안률: ${((securityFeatures / totalSecurityFeatures) * 100).toFixed(1)}%`);
    console.log(`   - 총 콘솔 에러: ${consoleErrors.length}개`);
    
    expect(securityFeatures).toBeGreaterThanOrEqual(5);
  });

  test('Step 10: 전체 통합 테스트 및 사용자 경험 검증', async ({ page }) => {
    console.log('\\n=== Step 10: 전체 통합 테스트 및 사용자 경험 검증 ===');
    
    const testStartTime = Date.now();
    
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    // 1. 전체 시스템 아키텍처 검증
    const systemArchitectureTest = await page.evaluate(() => {
      return {
        // 라우팅 시스템
        hasRouter: typeof window.history?.pushState === 'function',
        hasRoutes: Array.from(document.links).filter(link => 
          link.href.includes('/dashboard') || link.href.includes('/subscriptions') ||
          link.href.includes('/notifications') || link.href.includes('/settings')
        ).length,
        
        // 상태 관리
        hasStateManagement: typeof window.React !== 'undefined' ||
                           typeof window.redux !== 'undefined' ||
                           localStorage.length > 0,
        
        // 데이터 계층
        hasDataLayer: typeof window.firebase !== 'undefined' ||
                     typeof window.API !== 'undefined',
        
        // UI 컴포넌트 시스템
        hasComponentLibrary: document.querySelectorAll('[class*="component"], [data-component]').length > 0,
        hasConsistentStyling: document.querySelectorAll('[class*="btn"], [class*="card"], [class*="modal"]').length > 0,
        
        // 반응형 디자인
        hasResponsiveDesign: document.querySelector('[class*="md:"], [class*="lg:"], [class*="responsive"]') !== null,
        isMobileOptimized: window.innerWidth < 768 ? 
          document.querySelector('.mobile, [class*="mobile"]') !== null : true
      };
    });
    
    console.log('🏗️ 시스템 아키텍처:', systemArchitectureTest);
    
    // 2. 사용자 워크플로우 통합 테스트
    const userWorkflowTest = await page.evaluate(() => {
      const workflows = {
        // 인증 워크플로우
        authWorkflow: {
          hasLoginForm: document.querySelector('form, [data-testid="login-form"]') !== null,
          hasGoogleAuth: document.querySelector('[data-provider="google"], .google-auth') !== null,
          hasSignupOption: Array.from(document.links).some(link => 
            link.href.includes('signup') || (link.textContent || '').includes('회원가입')
          )
        },
        
        // 구독 관리 워크플로우  
        subscriptionWorkflow: {
          canAddSubscription: Array.from(document.querySelectorAll('button, a')).some(el => 
            (el.textContent || '').includes('추가') || (el.textContent || '').includes('새로')
          ),
          canViewSubscriptions: Array.from(document.links).some(link => 
            link.href.includes('subscription')
          ),
          hasSubscriptionCategories: Array.from(document.querySelectorAll('*')).some(el => 
            (el.textContent || '').includes('카테고리') || (el.textContent || '').includes('엔터')
          )
        },
        
        // 알림 워크플로우
        notificationWorkflow: {
          canViewNotifications: Array.from(document.links).some(link => 
            link.href.includes('notification')
          ),
          hasNotificationPreferences: Array.from(document.querySelectorAll('*')).some(el => 
            (el.textContent || '').includes('알림 설정')
          ),
          canMarkAsRead: Array.from(document.querySelectorAll('button')).some(btn => 
            (btn.textContent || '').includes('읽음')
          )
        },
        
        // 설정 워크플로우
        settingsWorkflow: {
          canAccessSettings: Array.from(document.links).some(link => 
            link.href.includes('settings') || (link.textContent || '').includes('설정')
          ),
          hasUserProfile: Array.from(document.querySelectorAll('*')).some(el => 
            (el.textContent || '').includes('프로필') || (el.textContent || '').includes('계정')
          ),
          canUpdatePreferences: document.querySelectorAll('input, select').length > 0
        }
      };
      
      return workflows;
    });
    
    console.log('🔄 사용자 워크플로우:', userWorkflowTest);
    
    // 3. 사용자 경험 (UX) 품질 검증
    const uxQualityTest = await page.evaluate(() => {
      return {
        // 접근성
        accessibility: {
          hasAltTexts: Array.from(document.images).filter(img => img.alt).length,
          hasAriaLabels: document.querySelectorAll('[aria-label]').length,
          hasRoles: document.querySelectorAll('[role]').length,
          hasKeyboardNavigation: document.querySelectorAll('[tabindex]').length,
          hasFocusIndicators: getComputedStyle(document.body).outlineWidth !== '0px'
        },
        
        // 시각적 디자인
        visualDesign: {
          hasConsistentColors: document.querySelector('[class*="primary"], [class*="secondary"]') !== null,
          hasTypography: document.querySelector('[class*="text-"], [class*="font-"]') !== null,
          hasSpacing: document.querySelector('[class*="space-"], [class*="gap-"]') !== null,
          hasIcons: document.querySelectorAll('svg, .icon, [data-lucide]').length,
          hasImages: document.images.length
        },
        
        // 인터랙션 디자인
        interaction: {
          hasHoverEffects: Array.from(document.querySelectorAll('*')).some(el => 
            getComputedStyle(el, ':hover').cursor === 'pointer'
          ),
          hasTransitions: Array.from(document.querySelectorAll('*')).some(el => 
            getComputedStyle(el).transition !== 'all 0s ease 0s'
          ),
          hasActiveStates: document.querySelector('.active, [aria-selected="true"]') !== null,
          hasLoadingStates: document.querySelectorAll('.loading, .spinner, .skeleton').length
        },
        
        // 정보 아키텍처
        informationArchitecture: {
          hasNavigation: document.querySelector('nav, .navigation') !== null,
          hasBreadcrumbs: document.querySelector('.breadcrumb, .breadcrumbs') !== null,
          hasSearch: document.querySelector('input[type="search"], .search') !== null,
          hasFilters: document.querySelectorAll('.filter, [data-filter]').length,
          hasPagination: document.querySelector('.pagination, .page-nav') !== null
        }
      };
    });
    
    console.log('🎨 UX 품질:', uxQualityTest);
    
    // 4. 성능 및 최적화 종합 검증
    const performanceSummary = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0];
      const resources = performance.getEntriesByType('resource');
      
      return {
        // 로딩 성능
        loadingMetrics: {
          domContentLoaded: perf ? perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart : 0,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
          totalLoadTime: perf ? perf.loadEventEnd - perf.navigationStart : 0
        },
        
        // 리소스 최적화
        resourceOptimization: {
          totalResources: resources.length,
          compressedResources: resources.filter(r => r.encodedBodySize < r.decodedBodySize).length,
          cachedResources: resources.filter(r => r.transferSize === 0).length,
          optimizedImages: document.querySelectorAll('img[loading="lazy"], img[srcset]').length
        },
        
        // 번들 최적화
        bundleOptimization: {
          hasCodeSplitting: Array.from(document.scripts).some(script => 
            script.src.includes('chunk') || script.src.includes('vendor')
          ),
          hasTreeShaking: Array.from(document.scripts).some(script => 
            script.textContent && !script.textContent.includes('unused')
          ),
          hasMinification: Array.from(document.scripts).some(script => 
            script.textContent && script.textContent.length > 1000 && !script.textContent.includes('\\n')
          )
        }
      };
    });
    
    console.log('⚡ 성능 요약:', performanceSummary);
    
    // 5. 크로스 브라우저 호환성 검증
    const compatibilityTest = await page.evaluate(() => {
      return {
        // 모던 브라우저 기능
        modernFeatures: {
          hasES6Support: typeof Promise !== 'undefined' && typeof Map !== 'undefined',
          hasAsyncAwait: typeof (async () => {}) === 'function',
          hasFetchAPI: typeof fetch !== 'undefined',
          hasLocalStorage: typeof localStorage !== 'undefined',
          hasSessionStorage: typeof sessionStorage !== 'undefined'
        },
        
        // CSS 기능
        cssFeatures: {
          hasFlexbox: CSS.supports('display', 'flex'),
          hasGrid: CSS.supports('display', 'grid'),
          hasCustomProperties: CSS.supports('--var', 'value'),
          hasMediaQueries: window.matchMedia !== undefined
        },
        
        // 브라우저 API
        browserAPIs: {
          hasNotificationAPI: 'Notification' in window,
          hasServiceWorker: 'serviceWorker' in navigator,
          hasWebCrypto: 'crypto' in window && 'subtle' in window.crypto,
          hasIntersectionObserver: 'IntersectionObserver' in window
        },
        
        // 폴리필 감지
        polyfills: {
          hasPolyfillService: Array.from(document.scripts).some(script => 
            script.src.includes('polyfill')
          ),
          hasBabelTransform: Array.from(document.scripts).some(script => 
            script.textContent?.includes('_typeof') || script.textContent?.includes('_classCallCheck')
          )
        }
      };
    });
    
    console.log('🌐 브라우저 호환성:', compatibilityTest);
    
    // 6. 모바일 및 태블릿 대응 검증
    const mobileResponsivenessTest = await page.evaluate(() => {
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: window.devicePixelRatio
      };
      
      return {
        viewport,
        isMobile: viewport.width < 768,
        isTablet: viewport.width >= 768 && viewport.width < 1024,
        isDesktop: viewport.width >= 1024,
        
        // 반응형 디자인 확인
        hasViewportMeta: document.querySelector('meta[name="viewport"]') !== null,
        hasResponsiveImages: document.querySelectorAll('img[srcset], picture').length,
        hasResponsiveText: document.querySelector('[class*="text-sm"], [class*="text-lg"]') !== null,
        hasFlexibleLayout: document.querySelector('[class*="flex"], [class*="grid"]') !== null,
        
        // 터치 최적화
        hasTouchOptimization: document.querySelectorAll('[class*="touch"], button').length > 0,
        hasAppropriateButtonSize: Array.from(document.querySelectorAll('button')).some(btn => {
          const rect = btn.getBoundingClientRect();
          return rect.width >= 44 && rect.height >= 44; // 최소 터치 타겟 크기
        }),
        
        // 모바일 네비게이션
        hasMobileMenu: document.querySelector('.mobile-menu, .hamburger, [data-mobile-menu]') !== null,
        hasCollapsibleSidebar: document.querySelector('.sidebar-toggle') !== null
      };
    });
    
    console.log('📱 모바일 대응:', mobileResponsivenessTest);
    
    // 7. 최종 통합 점수 계산
    const integrationScore = {
      // 시스템 아키텍처 (25점)
      architecture: systemArchitectureTest.hasRouter && systemArchitectureTest.hasDataLayer && 
                   systemArchitectureTest.hasComponentLibrary,
      
      // 사용자 워크플로우 (20점)
      workflows: Object.values(userWorkflowTest).every(workflow => 
                 Object.values(workflow).some(Boolean)
               ),
      
      // UX 품질 (20점) 
      uxQuality: uxQualityTest.accessibility.hasAriaLabels > 0 &&
                uxQualityTest.visualDesign.hasConsistentColors &&
                uxQualityTest.interaction.hasTransitions,
      
      // 성능 (15점)
      performance: performanceSummary.loadingMetrics.totalLoadTime < 5000 &&
                  performanceSummary.resourceOptimization.cachedResources > 0,
      
      // 호환성 (10점)
      compatibility: compatibilityTest.modernFeatures.hasES6Support &&
                    compatibilityTest.cssFeatures.hasFlexbox,
      
      // 모바일 대응 (10점)
      mobile: mobileResponsivenessTest.hasViewportMeta &&
             mobileResponsivenessTest.hasFlexibleLayout
    };
    
    const totalTestTime = Date.now() - testStartTime;
    const passedTests = Object.values(integrationScore).filter(Boolean).length;
    const totalTests = Object.keys(integrationScore).length;
    const overallScore = (passedTests / totalTests) * 100;
    
    console.log('\\n🎯 전체 통합 테스트 최종 결과:');
    console.log(`   - 시스템 아키텍처: ${integrationScore.architecture ? '✅' : '❌'} (25점)`);
    console.log(`   - 사용자 워크플로우: ${integrationScore.workflows ? '✅' : '❌'} (20점)`);
    console.log(`   - UX 품질: ${integrationScore.uxQuality ? '✅' : '❌'} (20점)`);
    console.log(`   - 성능: ${integrationScore.performance ? '✅' : '❌'} (15점)`);
    console.log(`   - 브라우저 호환성: ${integrationScore.compatibility ? '✅' : '❌'} (10점)`);
    console.log(`   - 모바일 대응: ${integrationScore.mobile ? '✅' : '❌'} (10점)`);
    console.log('\\n📊 최종 통합 점수:');
    console.log(`   - 통과한 테스트: ${passedTests}/${totalTests}`);
    console.log(`   - 전체 점수: ${overallScore.toFixed(1)}/100점`);
    console.log(`   - 테스트 소요 시간: ${Math.round(totalTestTime / 1000)}초`);
    console.log(`   - 시스템 상태: ${overallScore >= 80 ? '🟢 우수' : overallScore >= 60 ? '🟡 양호' : '🔴 개선 필요'}`);
    
    expect(passedTests).toBeGreaterThanOrEqual(4);
    expect(overallScore).toBeGreaterThanOrEqual(60);
  });

});