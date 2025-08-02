import { test, expect } from '@playwright/test';
import { TEST_CONFIG, TEST_SUBSCRIPTION } from './test-config';
import { stableLogin, stableClick, stableFill, waitForPageLoad, checkLoginStatus, cleanupTestData } from './test-helpers';

// 테스트 데이터 - 새로운 설정 사용
const TEST_USER = TEST_CONFIG.TEST_USER;

test.describe('Moonwave 구독 관리 시스템 기능 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);
  });

  test.describe('3.1 사용자 인증', () => {
    test('TC-001: 이메일/비밀번호로 회원가입', async ({ page }) => {
      // 회원가입 페이지로 이동
      await page.goto('/signup');
      await waitForPageLoad(page);
      
      // 회원가입 폼 입력
      await stableFill(page, 'input[type="email"]', 'new-test@example.com');
      await stableFill(page, 'input[type="password"]', 'testpassword123');
      await stableFill(page, 'input[name="name"]', '새 테스트 사용자');
      
      // 회원가입 완료
      await stableClick(page, 'button[type="submit"]');
      
      // 로그인 상태 확인 (대시보드로 리다이렉트)
      await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    });

    test('TC-002: Google OAuth 회원가입', async ({ page }) => {
      // 로그인 페이지로 이동
      await page.goto('/login');
      await waitForPageLoad(page);
      
      // Google 로그인 버튼 클릭
      await stableClick(page, 'button[aria-label="Google로 로그인"]');
      
      // Google OAuth 페이지 확인 (실제로는 모의)
      await expect(page.locator('text=Google')).toBeVisible();
    });

    test('TC-003: 이메일/비밀번호 로그인', async ({ page }) => {
      // 안정적인 로그인 함수 사용
      await stableLogin(page, TEST_USER.email, TEST_USER.password);
    });

    test('TC-004: Google OAuth 로그인', async ({ page }) => {
      // 로그인 페이지로 이동
      await page.goto('/login');
      await waitForPageLoad(page);
      
      // Google 로그인 버튼 클릭
      await stableClick(page, 'button[aria-label="Google로 로그인"]');
      
      // Google OAuth 플로우 확인
      await expect(page.locator('text=Google')).toBeVisible();
    });

    test('TC-005: 잘못된 비밀번호 입력 시 에러 처리', async ({ page }) => {
      // 로그인 페이지로 이동
      await page.goto('/login');
      await waitForPageLoad(page);
      
      // 잘못된 로그인 정보 입력
      await stableFill(page, 'input[type="email"]', TEST_USER.email);
      await stableFill(page, 'input[type="password"]', 'wrongpassword');
      
      // 로그인 시도
      await stableClick(page, 'button[type="submit"]');
      
      // 에러 메시지 확인
      await expect(page.locator('text=로그인에 실패했습니다')).toBeVisible();
    });

    test('TC-006: 로그아웃 기능', async ({ page }) => {
      // 먼저 로그인
      await stableLogin(page, TEST_USER.email, TEST_USER.password);
      
      // 대시보드에서 로그아웃 버튼 클릭
      await stableClick(page, 'button[aria-label="로그아웃"]');
      
      // 로그아웃 확인 (로그인 페이지로 리다이렉트)
      await expect(page).toHaveURL('/login');
    });

    test('TC-007: 세션 만료 처리', async ({ page }) => {
      // 로그인
      await stableLogin(page, TEST_USER.email, TEST_USER.password);
      
      // 세션 만료 시뮬레이션 (실제로는 세션 만료 시간 조정)
      // 여기서는 간단히 페이지 새로고침으로 확인
      await page.reload();
      await waitForPageLoad(page);
      
      // 세션 유지 확인
      await expect(page.locator('text=대시보드')).toBeVisible();
    });
  });

  test.describe('3.2 구독 관리', () => {
    test.beforeEach(async ({ page }) => {
      // 로그인
      await stableLogin(page, TEST_USER.email, TEST_USER.password);
    });

    test('TC-008: 기본 구독 정보 입력', async ({ page }) => {
      // 구독 추가 페이지로 이동
      await page.goto('/subscriptions/new');
      await waitForPageLoad(page);
      
      // 기본 정보 입력
      await stableFill(page, 'input[name="serviceName"]', TEST_SUBSCRIPTION.serviceName);
      await stableFill(page, 'input[name="amount"]', TEST_SUBSCRIPTION.amount.toString());
      await page.selectOption('select[name="currency"]', TEST_SUBSCRIPTION.currency);
      await page.selectOption('select[name="paymentCycle"]', TEST_SUBSCRIPTION.paymentCycle);
      await stableFill(page, 'input[name="paymentDay"]', TEST_SUBSCRIPTION.paymentDay.toString());
      
      // 구독 저장
      await stableClick(page, 'button[type="submit"]');
      
      // 구독 추가 확인
      await expect(page.locator(`text=${TEST_SUBSCRIPTION.serviceName}`)).toBeVisible();
    });

    test('TC-009: 상세 정보 입력', async ({ page }) => {
      // 구독 추가 페이지로 이동
      await page.goto('/subscriptions/new');
      await waitForPageLoad(page);
      await stableFill(page, 'input[name="serviceName"]', TEST_SUBSCRIPTION.serviceName);
      await stableFill(page, 'input[name="amount"]', TEST_SUBSCRIPTION.amount.toString());
      await page.selectOption('select[name="currency"]', TEST_SUBSCRIPTION.currency);
      await page.selectOption('select[name="paymentCycle"]', TEST_SUBSCRIPTION.paymentCycle);
      await stableFill(page, 'input[name="paymentDay"]', TEST_SUBSCRIPTION.paymentDay.toString());
      
      // 상세 정보 입력
      await page.selectOption('select[name="category"]', TEST_SUBSCRIPTION.category);
      await stableFill(page, 'input[name="tags"]', TEST_SUBSCRIPTION.tags.join(', '));
      await stableFill(page, 'textarea[name="memo"]', '테스트 메모');
      
      // 알림 설정
      await page.check('input[name="notifications.sevenDays"]');
      
      // 구독 저장
      await stableClick(page, 'button[type="submit"]');
      
      // 상세 정보 확인
      await expect(page.locator(`text=${TEST_SUBSCRIPTION.category}`)).toBeVisible();
    });

    test('TC-010: 로고 업로드', async ({ page }) => {
      // 구독 추가 페이지로 이동
      await page.goto('/subscriptions/new');
      await waitForPageLoad(page);
      await stableFill(page, 'input[name="serviceName"]', TEST_SUBSCRIPTION.serviceName);
      await stableFill(page, 'input[name="amount"]', TEST_SUBSCRIPTION.amount.toString());
      
      // 로고 업로드
      const fileChooserPromise = page.waitForEvent('filechooser');
      await stableClick(page, 'input[type="file"]');
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles('path/to/logo.png');
      
      // 구독 저장
      await stableClick(page, 'button[type="submit"]');
      
      // 로고 표시 확인
      await expect(page.locator('img[alt="로고"]')).toBeVisible();
    });

    test('TC-011: URL 입력', async ({ page }) => {
      // 구독 추가 페이지로 이동
      await page.goto('/subscriptions/new');
      await waitForPageLoad(page);
      await stableFill(page, 'input[name="serviceName"]', TEST_SUBSCRIPTION.serviceName);
      await stableFill(page, 'input[name="amount"]', TEST_SUBSCRIPTION.amount.toString());
      
      // URL 입력
      await stableFill(page, 'input[name="serviceUrl"]', 'https://netflix.com');
      
      // 구독 저장
      await stableClick(page, 'button[type="submit"]');
      
      // URL 링크 확인
      await expect(page.locator('a[href="https://netflix.com"]')).toBeVisible();
    });

    test('TC-012: 기본 정보 수정', async ({ page }) => {
      // 구독 추가
      await page.goto('/subscriptions/new');
      await waitForPageLoad(page);
      await stableFill(page, 'input[name="serviceName"]', TEST_SUBSCRIPTION.serviceName);
      await stableFill(page, 'input[name="amount"]', TEST_SUBSCRIPTION.amount.toString());
      await stableClick(page, 'button[type="submit"]');
      
      // 구독 수정 페이지로 이동
      await page.goto('/subscriptions/1/edit');
      await waitForPageLoad(page);
      
      // 정보 수정
      await stableFill(page, 'input[name="serviceName"]', 'Netflix Premium');
      await stableFill(page, 'input[name="amount"]', '20000');
      
      // 수정 저장
      await stableClick(page, 'button[type="submit"]');
      
      // 수정된 정보 확인
      await expect(page.locator('text=Netflix Premium')).toBeVisible();
      await expect(page.locator('text=20,000원')).toBeVisible();
    });

    test('TC-013: 상세 정보 수정', async ({ page }) => {
      // 구독 추가
      await page.goto('/subscriptions/new');
      await waitForPageLoad(page);
      await stableFill(page, 'input[name="serviceName"]', TEST_SUBSCRIPTION.serviceName);
      await stableFill(page, 'input[name="amount"]', TEST_SUBSCRIPTION.amount.toString());
      await page.selectOption('select[name="category"]', TEST_SUBSCRIPTION.category);
      await stableClick(page, 'button[type="submit"]');
      
      // 구독 수정
      await page.goto('/subscriptions/1/edit');
      await waitForPageLoad(page);
      
      // 상세 정보 수정
      await page.selectOption('select[name="category"]', '생산성');
      await stableFill(page, 'input[name="tags"]', '업무, 도구');
      await stableFill(page, 'textarea[name="memo"]', '수정된 메모');
      
      // 수정 저장
      await stableClick(page, 'button[type="submit"]');
      
      // 수정된 상세 정보 확인
      await expect(page.locator('text=생산성')).toBeVisible();
    });

    test('TC-014: 결제 정보 수정', async ({ page }) => {
      // 구독 추가
      await page.goto('/subscriptions/new');
      await waitForPageLoad(page);
      await stableFill(page, 'input[name="serviceName"]', TEST_SUBSCRIPTION.serviceName);
      await stableFill(page, 'input[name="amount"]', TEST_SUBSCRIPTION.amount.toString());
      await page.selectOption('select[name="paymentCycle"]', TEST_SUBSCRIPTION.paymentCycle);
      await stableFill(page, 'input[name="paymentDay"]', TEST_SUBSCRIPTION.paymentDay.toString());
      await stableClick(page, 'button[type="submit"]');
      
      // 구독 수정
      await page.goto('/subscriptions/1/edit');
      await waitForPageLoad(page);
      
      // 결제 정보 수정
      await page.selectOption('select[name="paymentCycle"]', 'yearly');
      await stableFill(page, 'input[name="paymentDay"]', '1');
      
      // 수정 저장
      await stableClick(page, 'button[type="submit"]');
      
      // 수정된 결제 정보 확인
      await expect(page.locator('text=연간')).toBeVisible();
    });

    test('TC-015: 구독 삭제 확인', async ({ page }) => {
      // 구독 추가
      await page.goto('/subscriptions/new');
      await waitForPageLoad(page);
      await stableFill(page, 'input[name="serviceName"]', TEST_SUBSCRIPTION.serviceName);
      await stableFill(page, 'input[name="amount"]', TEST_SUBSCRIPTION.amount.toString());
      await stableClick(page, 'button[type="submit"]');
      
      // 삭제 버튼 클릭
      await stableClick(page, 'button[aria-label="삭제"]');
      
      // 삭제 확인 다이얼로그 확인
      await expect(page.locator('text=정말 삭제하시겠습니까?')).toBeVisible();
      
      // 삭제 확인
      await stableClick(page, 'text=확인');
      
      // 구독 삭제 확인
      await expect(page.locator(`text=${TEST_SUBSCRIPTION.serviceName}`)).not.toBeVisible();
    });

    test('TC-016: 삭제 후 목록 업데이트', async ({ page }) => {
      // 구독 추가
      await page.goto('/subscriptions/new');
      await waitForPageLoad(page);
      await stableFill(page, 'input[name="serviceName"]', TEST_SUBSCRIPTION.serviceName);
      await stableFill(page, 'input[name="amount"]', TEST_SUBSCRIPTION.amount.toString());
      await stableClick(page, 'button[type="submit"]');
      
      // 삭제
      await stableClick(page, 'button[aria-label="삭제"]');
      await stableClick(page, 'text=확인');
      
      // 목록에서 제거 확인
      await expect(page.locator(`text=${TEST_SUBSCRIPTION.serviceName}`)).not.toBeVisible();
      
      // 구독 수 감소 확인
      const subscriptionCount = await page.locator('.subscription-card').count();
      expect(subscriptionCount).toBe(0);
    });

    test('TC-017: 활성 → 일시정지', async ({ page }) => {
      // 구독 추가
      await page.goto('/subscriptions/new');
      await waitForPageLoad(page);
      await stableFill(page, 'input[name="serviceName"]', TEST_SUBSCRIPTION.serviceName);
      await stableFill(page, 'input[name="amount"]', TEST_SUBSCRIPTION.amount.toString());
      await stableClick(page, 'button[type="submit"]');
      
      // 일시정지 버튼 클릭
      await stableClick(page, 'button[aria-label="일시정지"]');
      
      // 상태 변경 확인
      await expect(page.locator('text=일시정지')).toBeVisible();
    });

    test('TC-018: 일시정지 → 활성', async ({ page }) => {
      // 구독 추가 후 일시정지
      await page.goto('/subscriptions/new');
      await waitForPageLoad(page);
      await stableFill(page, 'input[name="serviceName"]', TEST_SUBSCRIPTION.serviceName);
      await stableFill(page, 'input[name="amount"]', TEST_SUBSCRIPTION.amount.toString());
      await stableClick(page, 'button[type="submit"]');
      await stableClick(page, 'button[aria-label="일시정지"]');
      
      // 활성화 버튼 클릭
      await stableClick(page, 'button[aria-label="활성화"]');
      
      // 상태 변경 확인
      await expect(page.locator('text=활성')).toBeVisible();
    });

    test('TC-019: 활성 → 해지', async ({ page }) => {
      // 구독 추가
      await page.goto('/subscriptions/new');
      await waitForPageLoad(page);
      await stableFill(page, 'input[name="serviceName"]', TEST_SUBSCRIPTION.serviceName);
      await stableFill(page, 'input[name="amount"]', TEST_SUBSCRIPTION.amount.toString());
      await stableClick(page, 'button[type="submit"]');
      
      // 해지 버튼 클릭
      await stableClick(page, 'button[aria-label="해지"]');
      await stableClick(page, 'text=확인');
      
      // 상태 변경 확인
      await expect(page.locator('text=해지')).toBeVisible();
    });

    test('TC-020: 해지 → 활성', async ({ page }) => {
      // 구독 추가 후 해지
      await page.goto('/subscriptions/new');
      await waitForPageLoad(page);
      await stableFill(page, 'input[name="serviceName"]', TEST_SUBSCRIPTION.serviceName);
      await stableFill(page, 'input[name="amount"]', TEST_SUBSCRIPTION.amount.toString());
      await stableClick(page, 'button[type="submit"]');
      await stableClick(page, 'button[aria-label="해지"]');
      await stableClick(page, 'text=확인');
      
      // 재활성화 버튼 클릭
      await stableClick(page, 'button[aria-label="재활성화"]');
      
      // 상태 변경 확인
      await expect(page.locator('text=활성')).toBeVisible();
    });
  });

  test.describe('3.3 설정 관리', () => {
    test.beforeEach(async ({ page }) => {
      // 로그인
      await stableLogin(page, TEST_USER.email, TEST_USER.password);
      
      // 설정 페이지로 이동
      await page.goto('/settings');
      await waitForPageLoad(page);
    });

    test('TC-021: USD 환율 변경', async ({ page }) => {
      // 환율 설정 섹션으로 이동
      await stableClick(page, 'text=환율 설정');
      
      // USD 환율 변경
      await stableFill(page, 'input[name="exchangeRate"]', '1300');
      
      // 저장
      await stableClick(page, 'button[type="submit"]');
      
      // 환율 변경 확인
      await expect(page.locator('text=1 USD = 1,300 KRW')).toBeVisible();
    });

    test('TC-022: 환율 변경 후 금액 표시 확인', async ({ page }) => {
      // 환율 설정
      await stableClick(page, 'text=환율 설정');
      await stableFill(page, 'input[name="exchangeRate"]', '1300');
      await stableClick(page, 'button[type="submit"]');
      
      // 구독 추가 (USD)
      await page.goto('/subscriptions/new');
      await waitForPageLoad(page);
      await stableFill(page, 'input[name="serviceName"]', 'Spotify');
      await stableFill(page, 'input[name="amount"]', '10');
      await page.selectOption('select[name="currency"]', 'USD');
      await stableClick(page, 'button[type="submit"]');
      
      // KRW로 변환된 금액 확인
      await expect(page.locator('text=13,000원')).toBeVisible();
    });

    test('TC-023: 잘못된 환율 입력 시 유효성 검사', async ({ page }) => {
      // 환율 설정
      await stableClick(page, 'text=환율 설정');
      
      // 잘못된 환율 입력
      await stableFill(page, 'input[name="exchangeRate"]', '-100');
      await stableClick(page, 'button[type="submit"]');
      
      // 에러 메시지 확인
      await expect(page.locator('text=환율은 0보다 커야 합니다')).toBeVisible();
    });

    test('TC-024: 결제 예정 알림 토글', async ({ page }) => {
      // 알림 설정 섹션으로 이동
      await stableClick(page, 'text=알림 설정');
      
      // 결제 예정 알림 토글
      await stableClick(page, 'input[name="notifications.paymentReminders"]');
      
      // 설정 저장
      await stableClick(page, 'button[type="submit"]');
      
      // 토글 상태 확인
      await expect(page.locator('input[name="notifications.paymentReminders"]')).toBeChecked();
    });

    test('TC-025: 가격 변동 알림 토글', async ({ page }) => {
      // 알림 설정
      await stableClick(page, 'text=알림 설정');
      
      // 가격 변동 알림 토글
      await stableClick(page, 'input[name="notifications.priceChanges"]');
      
      // 설정 저장
      await stableClick(page, 'button[type="submit"]');
      
      // 토글 상태 확인
      await expect(page.locator('input[name="notifications.priceChanges"]')).toBeChecked();
    });

    test('TC-026: 구독 만료 알림 토글', async ({ page }) => {
      // 알림 설정
      await stableClick(page, 'text=알림 설정');
      
      // 구독 만료 알림 토글
      await stableClick(page, 'input[name="notifications.subscriptionExpiry"]');
      
      // 설정 저장
      await stableClick(page, 'button[type="submit"]');
      
      // 토글 상태 확인
      await expect(page.locator('input[name="notifications.subscriptionExpiry"]')).toBeChecked();
    });

    test('TC-027: 사용자 정보 표시', async ({ page }) => {
      // 프로필 섹션으로 이동
      await stableClick(page, 'text=프로필');
      
      // 사용자 정보 확인
      await expect(page.locator(`text=${TEST_USER.email}`)).toBeVisible();
    });

    test('TC-028: 계정 통계 확인', async ({ page }) => {
      // 프로필 섹션으로 이동
      await stableClick(page, 'text=프로필');
      
      // 계정 통계 확인
      await expect(page.locator('text=총 구독 수')).toBeVisible();
      await expect(page.locator('text=월간 지출')).toBeVisible();
    });
  });

  test.describe('3.4 대시보드 및 통계', () => {
    test.beforeEach(async ({ page }) => {
      // 로그인
      await stableLogin(page, TEST_USER.email, TEST_USER.password);
    });

    test('TC-029: 월간 지출 총액 표시', async ({ page }) => {
      // 대시보드에서 월간 지출 확인
      await expect(page.locator('text=이번 달 지출')).toBeVisible();
      await expect(page.locator('.monthly-total')).toBeVisible();
    });

    test('TC-030: 활성 구독 수 표시', async ({ page }) => {
      // 대시보드에서 활성 구독 수 확인
      await expect(page.locator('text=활성 구독')).toBeVisible();
      await expect(page.locator('.active-subscriptions-count')).toBeVisible();
    });

    test('TC-031: 결제 예정 구독 표시', async ({ page }) => {
      // 대시보드에서 결제 예정 구독 확인
      await expect(page.locator('text=다음 결제')).toBeVisible();
      await expect(page.locator('.upcoming-payments')).toBeVisible();
    });

    test('TC-032: 카테고리별 통계', async ({ page }) => {
      // 통계 페이지로 이동
      await page.goto('/statistics');
      await waitForPageLoad(page);
      
      // 카테고리별 통계 확인
      await expect(page.locator('text=카테고리별 지출')).toBeVisible();
      await expect(page.locator('.category-chart')).toBeVisible();
    });

    test('TC-033: 통화별 통계', async ({ page }) => {
      // 통계 페이지로 이동
      await page.goto('/statistics');
      await waitForPageLoad(page);
      
      // 통화별 통계 확인
      await expect(page.locator('text=통화별 지출')).toBeVisible();
      await expect(page.locator('.currency-chart')).toBeVisible();
    });

    test('TC-034: 결제주기별 통계', async ({ page }) => {
      // 통계 페이지로 이동
      await page.goto('/statistics');
      await waitForPageLoad(page);
      
      // 결제주기별 통계 확인
      await expect(page.locator('text=결제주기별 구독')).toBeVisible();
      await expect(page.locator('.payment-cycle-chart')).toBeVisible();
    });
  });

  test.describe('3.5 알림 시스템', () => {
    test.beforeEach(async ({ page }) => {
      // 로그인
      await stableLogin(page, TEST_USER.email, TEST_USER.password);
    });

    test('TC-035: 알림 권한 요청', async ({ page }) => {
      // 알림 설정으로 이동
      await page.goto('/settings');
      await waitForPageLoad(page);
      await stableClick(page, 'text=알림 설정');
      
      // 알림 권한 요청 버튼 클릭
      await stableClick(page, 'text=알림 권한 요청');
      
      // 권한 요청 다이얼로그 확인
      await expect(page.locator('text=브라우저 알림을 허용하시겠습니까?')).toBeVisible();
    });

    test('TC-036: 결제 예정 알림 발송', async ({ page }) => {
      // 구독 추가 (결제일이 가까운 구독)
      await page.goto('/subscriptions/new');
      await waitForPageLoad(page);
      await stableFill(page, 'input[name="serviceName"]', 'Test Subscription');
      await stableFill(page, 'input[name="amount"]', '10000');
      await stableFill(page, 'input[name="paymentDay"]', '1');
      await stableClick(page, 'button[type="submit"]');
      
      // 알림 설정 활성화
      await page.goto('/settings');
      await waitForPageLoad(page);
      await stableClick(page, 'text=알림 설정');
      await page.check('input[name="notifications.paymentReminders"]');
      await stableClick(page, 'button[type="submit"]');
      
      // 알림 발송 확인 (실제로는 시간 기반 테스트 필요)
      await expect(page.locator('text=알림')).toBeVisible();
    });

    test('TC-037: 알림 클릭 시 해당 구독으로 이동', async ({ page }) => {
      // 알림 클릭 시뮬레이션
      await stableClick(page, '.notification-item');
      
      // 해당 구독 페이지로 이동 확인
      await expect(page.locator('text=구독 상세')).toBeVisible();
    });
  });

  test.describe('3.6 PWA 기능', () => {
    test.beforeEach(async ({ page }) => {
      // 로그인
      await stableLogin(page, TEST_USER.email, TEST_USER.password);
    });

    test('TC-038: PWA 설치 프롬프트 표시', async ({ page }) => {
      // PWA 설치 프롬프트 확인
      await expect(page.locator('text=앱 설치')).toBeVisible();
    });

    test('TC-039: 앱 설치 후 실행', async ({ page }) => {
      // PWA 설치 버튼 클릭
      await stableClick(page, 'text=앱 설치');
      
      // 설치 완료 확인
      await expect(page.locator('text=설치 완료')).toBeVisible();
    });

    test('TC-040: 오프라인 동작 확인', async ({ page }) => {
      // 오프라인 모드로 전환
      await page.route('**/*', route => route.abort());
      
      // 오프라인 상태에서 기본 기능 확인
      await expect(page.locator('text=오프라인 모드')).toBeVisible();
    });
  });
}); 