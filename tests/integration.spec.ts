import { test, expect } from '@playwright/test';

// 실제 애플리케이션의 테스트 계정
const TEST_USER = {
  email: 'her_soul@naver.com',
  password: '27879876',
  name: '테스트 사용자'
};

const TEST_SUBSCRIPTION = {
  serviceName: 'Netflix',
  amount: 17000,
  currency: 'KRW',
  paymentCycle: 'monthly',
  paymentDay: 15,
  category: '엔터테인먼트',
  tags: ['스트리밍', '영화']
};

test.describe('Moonwave 구독 관리 시스템 통합 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3011/');
    // 페이지 로딩 대기
    await page.waitForLoadState('networkidle');
  });

  test.describe('3.1 인증 시스템 통합', () => {
    test('INT-001: Supabase Auth와 프론트엔드 통합', async ({ page }) => {
      // 1. 회원가입 플로우 (실제로는 테스트 계정이 있으므로 생략)
      
      // 2. 로그인 플로우
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.fill('input[type="password"]', TEST_USER.password);
      
      // 로그인 버튼 클릭
      await page.click('button[type="submit"]');
      
      // 3. 로그인 성공 확인 (대시보드로 리다이렉트)
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      await expect(page.locator('text=대시보드')).toBeVisible();
      
      // 4. 로그아웃
      await page.click('text=로그아웃');
      await expect(page.locator('text=로그인')).toBeVisible();
    });

    test('INT-002: Google OAuth 통합', async ({ page }) => {
      // Google OAuth 버튼 클릭
      await page.waitForSelector('text=Google로 로그인', { timeout: 10000 });
      await page.click('text=Google로 로그인');
      
      // OAuth 플로우 확인 (실제 테스트에서는 모의 필요)
      await expect(page.locator('text=Google')).toBeVisible();
    });

    test('INT-003: 세션 지속성 테스트', async ({ page }) => {
      // 1. 로그인
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.fill('input[type="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      
      // 2. 페이지 새로고침
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      await page.reload();
      await expect(page.locator('text=대시보드')).toBeVisible();
      
      // 3. 다른 페이지로 이동
      await page.click('text=구독 관리');
      await expect(page.locator('text=구독 목록')).toBeVisible();
    });
  });

  test.describe('3.2 데이터 관리 통합', () => {
    test('INT-004: 구독 데이터 CRUD 통합', async ({ page }) => {
      // 로그인
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.fill('input[type="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      
      // 대시보드 로딩 대기
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      
      // 1. 구독 추가 (Create)
      await page.click('text=구독 추가');
      await page.waitForSelector('input[name="serviceName"]', { timeout: 10000 });
      await page.fill('input[name="serviceName"]', TEST_SUBSCRIPTION.serviceName);
      await page.fill('input[name="amount"]', TEST_SUBSCRIPTION.amount.toString());
      await page.selectOption('select[name="currency"]', TEST_SUBSCRIPTION.currency);
      await page.selectOption('select[name="paymentCycle"]', TEST_SUBSCRIPTION.paymentCycle);
      await page.fill('input[name="paymentDay"]', TEST_SUBSCRIPTION.paymentDay.toString());
      await page.selectOption('select[name="category"]', TEST_SUBSCRIPTION.category);
      await page.click('button[type="submit"]');
      
      // 2. 구독 목록 조회 (Read)
      await expect(page.locator(`text=${TEST_SUBSCRIPTION.serviceName}`)).toBeVisible();
      
      // 3. 구독 정보 수정 (Update)
      await page.click(`text=${TEST_SUBSCRIPTION.serviceName}`);
      await page.fill('input[name="amount"]', '18000');
      await page.click('button[type="submit"]');
      await expect(page.locator('text=18,000원')).toBeVisible();
      
      // 4. 구독 삭제 (Delete)
      await page.click('button[aria-label="삭제"]');
      await page.click('text=확인');
      await expect(page.locator(`text=${TEST_SUBSCRIPTION.serviceName}`)).not.toBeVisible();
    });

    test('INT-005: 실시간 데이터 동기화', async ({ page, context }) => {
      // 로그인
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.fill('input[type="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      
      // 대시보드 로딩 대기
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      
      // 새 탭에서 동일한 사용자로 로그인
      const newPage = await context.newPage();
      await newPage.goto('http://localhost:3011/');
      await newPage.waitForSelector('input[type="email"]', { timeout: 10000 });
      await newPage.fill('input[type="email"]', TEST_USER.email);
      await newPage.fill('input[type="password"]', TEST_USER.password);
      await newPage.click('button[type="submit"]');
      
      // 첫 번째 탭에서 구독 추가
      await page.click('text=구독 추가');
      await page.waitForSelector('input[name="serviceName"]', { timeout: 10000 });
      await page.fill('input[name="serviceName"]', 'Spotify');
      await page.fill('input[name="amount"]', '13900');
      await page.selectOption('select[name="currency"]', 'KRW');
      await page.selectOption('select[name="paymentCycle"]', 'monthly');
      await page.fill('input[name="paymentDay"]', '20');
      await page.selectOption('select[name="category"]', '음악');
      await page.click('button[type="submit"]');
      
      // 두 번째 탭에서 실시간 업데이트 확인
      await newPage.reload();
      await expect(newPage.locator('text=Spotify')).toBeVisible();
    });

    test('INT-006: 입력 데이터 검증', async ({ page }) => {
      // 로그인
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.fill('input[type="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      
      // 대시보드 로딩 대기
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      
      // 유효하지 않은 데이터 입력
      await page.click('text=구독 추가');
      await page.waitForSelector('input[name="serviceName"]', { timeout: 10000 });
      await page.fill('input[name="serviceName"]', ''); // 빈 서비스명
      await page.fill('input[name="amount"]', '-1000'); // 음수 금액
      await page.fill('input[name="paymentDay"]', '32'); // 잘못된 결제일
      await page.click('button[type="submit"]');
      
      // 에러 메시지 확인
      await expect(page.locator('text=서비스명을 입력해주세요')).toBeVisible();
      await expect(page.locator('text=올바른 금액을 입력해주세요')).toBeVisible();
      await expect(page.locator('text=올바른 결제일을 입력해주세요')).toBeVisible();
    });
  });

  test.describe('3.3 API 통합', () => {
    test('INT-007: REST API 통합', async ({ page }) => {
      // 로그인
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.fill('input[type="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      
      // 대시보드 로딩 대기
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      
      // API 요청 모니터링
      const responsePromise = page.waitForResponse(response => 
        response.url().includes('/rest/v1/subscriptions') && 
        response.status() === 200
      );
      
      await page.click('text=구독 관리');
      await responsePromise;
      
      // 응답 데이터 확인
      await expect(page.locator('text=구독 목록')).toBeVisible();
    });

    test('INT-008: RPC 함수 통합', async ({ page }) => {
      // 로그인
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.fill('input[type="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      
      // 대시보드 로딩 대기
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      
      // 통계 페이지로 이동
      await page.click('text=통계');
      
      // RPC 함수 호출 확인
      const responsePromise = page.waitForResponse(response => 
        response.url().includes('/rest/v1/rpc/') && 
        response.status() === 200
      );
      
      await page.reload();
      await responsePromise;
      
      // 통계 데이터 표시 확인
      await expect(page.locator('text=월간 지출')).toBeVisible();
    });

    test('INT-009: 환율 API 통합', async ({ page }) => {
      // 로그인
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.fill('input[type="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      
      // 대시보드 로딩 대기
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      
      // USD 구독 추가
      await page.click('text=구독 추가');
      await page.waitForSelector('input[name="serviceName"]', { timeout: 10000 });
      await page.fill('input[name="serviceName"]', 'Netflix US');
      await page.fill('input[name="amount"]', '15.99');
      await page.selectOption('select[name="currency"]', 'USD');
      await page.selectOption('select[name="paymentCycle"]', 'monthly');
      await page.fill('input[name="paymentDay"]', '15');
      await page.selectOption('select[name="category"]', '엔터테인먼트');
      await page.click('button[type="submit"]');
      
      // 환율 정보 표시 확인
      await expect(page.locator('text=USD')).toBeVisible();
      await expect(page.locator('text=KRW')).toBeVisible();
    });
  });

  test.describe('3.4 UI/UX 통합', () => {
    test('INT-010: 컴포넌트 간 데이터 흐름', async ({ page }) => {
      // 로그인
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.fill('input[type="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      
      // 대시보드 로딩 대기
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      
      // 구독 추가
      await page.click('text=구독 추가');
      await page.waitForSelector('input[name="serviceName"]', { timeout: 10000 });
      await page.fill('input[name="serviceName"]', TEST_SUBSCRIPTION.serviceName);
      await page.fill('input[name="amount"]', TEST_SUBSCRIPTION.amount.toString());
      await page.selectOption('select[name="currency"]', TEST_SUBSCRIPTION.currency);
      await page.selectOption('select[name="paymentCycle"]', TEST_SUBSCRIPTION.paymentCycle);
      await page.fill('input[name="paymentDay"]', TEST_SUBSCRIPTION.paymentDay.toString());
      await page.selectOption('select[name="category"]', TEST_SUBSCRIPTION.category);
      await page.click('button[type="submit"]');
      
      // 대시보드에서 데이터 확인
      await page.click('text=대시보드');
      await expect(page.locator(`text=${TEST_SUBSCRIPTION.serviceName}`)).toBeVisible();
      
      // 구독 관리에서 데이터 확인
      await page.click('text=구독 관리');
      await expect(page.locator(`text=${TEST_SUBSCRIPTION.serviceName}`)).toBeVisible();
    });

    test('INT-011: 라우팅 통합', async ({ page }) => {
      // 로그인
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.fill('input[type="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      
      // 대시보드 로딩 대기
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      
      // 페이지 간 네비게이션
      await page.click('text=대시보드');
      await expect(page.locator('text=월간 지출')).toBeVisible();
      
      await page.click('text=구독 관리');
      await expect(page.locator('text=구독 목록')).toBeVisible();
      
      await page.click('text=통계');
      await expect(page.locator('text=지출 분석')).toBeVisible();
      
      await page.click('text=설정');
      await expect(page.locator('text=계정 설정')).toBeVisible();
      
      // URL 파라미터 처리 확인
      await page.goto('http://localhost:3011/subscription/new');
      await expect(page.locator('text=구독 추가')).toBeVisible();
    });

    test('INT-012: 전역 상태 관리', async ({ page }) => {
      // 로그인
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.fill('input[type="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      
      // 대시보드 로딩 대기
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      
      // 사용자 정보 상태 확인
      await expect(page.locator('text=테스트 사용자')).toBeVisible();
      
      // 구독 데이터 상태 확인
      await page.click('text=구독 추가');
      await page.waitForSelector('input[name="serviceName"]', { timeout: 10000 });
      await page.fill('input[name="serviceName"]', TEST_SUBSCRIPTION.serviceName);
      await page.fill('input[name="amount"]', TEST_SUBSCRIPTION.amount.toString());
      await page.selectOption('select[name="currency"]', TEST_SUBSCRIPTION.currency);
      await page.selectOption('select[name="paymentCycle"]', TEST_SUBSCRIPTION.paymentCycle);
      await page.fill('input[name="paymentDay"]', TEST_SUBSCRIPTION.paymentDay.toString());
      await page.selectOption('select[name="category"]', TEST_SUBSCRIPTION.category);
      await page.click('button[type="submit"]');
      
      // 상태 변경 시 UI 업데이트 확인
      await expect(page.locator(`text=${TEST_SUBSCRIPTION.serviceName}`)).toBeVisible();
      
      // 설정 정보 상태 확인
      await page.click('text=설정');
      await page.click('text=알림 설정');
      await page.click('input[name="paymentReminder"]');
      await page.click('button[type="submit"]');
      
      // 설정 변경 확인
      await expect(page.locator('text=설정이 저장되었습니다')).toBeVisible();
    });
  });

  test.describe('3.5 PWA 통합', () => {
    test('INT-013: 오프라인 기능 통합', async ({ page }) => {
      // 로그인
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.fill('input[type="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      
      // 대시보드 로딩 대기
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      
      // 오프라인 모드 시뮬레이션
      await page.route('**/*', route => route.abort());
      
      // 오프라인 상태에서 앱 동작 확인
      await page.reload();
      await expect(page.locator('text=오프라인 모드')).toBeVisible();
      
      // 온라인 복구 시뮬레이션
      await page.unroute('**/*');
      await page.reload();
      await expect(page.locator('text=대시보드')).toBeVisible();
    });

    test('INT-014: 푸시 알림 통합', async ({ page }) => {
      // 로그인
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.fill('input[type="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      
      // 대시보드 로딩 대기
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      
      // 알림 권한 요청
      await page.click('text=설정');
      await page.click('text=알림 설정');
      await page.click('text=알림 권한 요청');
      
      // 권한 요청 다이얼로그 확인
      await expect(page.locator('text=알림 권한')).toBeVisible();
    });

    test('INT-015: PWA 설치 통합', async ({ page }) => {
      // 로그인
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.fill('input[type="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      
      // 대시보드 로딩 대기
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      
      // 설치 프롬프트 확인
      await expect(page.locator('text=앱 설치')).toBeVisible();
      
      // 설치 버튼 클릭
      await page.click('text=설치');
      
      // 설치 완료 확인
      await expect(page.locator('text=설치 완료')).toBeVisible();
    });
  });

  test.describe('3.6 알림 시스템 통합', () => {
    test('INT-016: 브라우저 알림 권한', async ({ page }) => {
      // 로그인
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.fill('input[type="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      
      // 대시보드 로딩 대기
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      
      // 알림 권한 요청
      await page.click('text=설정');
      await page.click('text=알림 설정');
      await page.click('text=알림 권한 요청');
      
      // 권한 상태 확인
      await expect(page.locator('text=알림 권한')).toBeVisible();
      
      // 알림 발송 테스트
      await page.click('text=테스트 알림 발송');
      await expect(page.locator('text=알림이 발송되었습니다')).toBeVisible();
    });

    test('INT-017: 예정된 알림 통합', async ({ page }) => {
      // 로그인
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.fill('input[type="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      
      // 대시보드 로딩 대기
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      
      // 구독 추가 (오늘 결제일로 설정)
      const today = new Date().getDate();
      await page.click('text=구독 추가');
      await page.waitForSelector('input[name="serviceName"]', { timeout: 10000 });
      await page.fill('input[name="serviceName"]', '테스트 구독');
      await page.fill('input[name="amount"]', '10000');
      await page.selectOption('select[name="currency"]', 'KRW');
      await page.selectOption('select[name="paymentCycle"]', 'monthly');
      await page.fill('input[name="paymentDay"]', today.toString());
      await page.selectOption('select[name="category"]', '테스트');
      await page.click('button[type="submit"]');
      
      // 알림 설정 확인
      await page.click('text=설정');
      await page.click('text=알림 설정');
      await expect(page.locator('input[name="paymentReminder"]')).toBeChecked();
    });
  });

  test.describe('3.7 데이터 동기화 통합', () => {
    test('INT-018: 다중 디바이스 동기화', async ({ page, context }) => {
      // 첫 번째 디바이스에서 로그인
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.fill('input[type="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      
      // 대시보드 로딩 대기
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      
      // 두 번째 디바이스에서 로그인
      const newPage = await context.newPage();
      await newPage.goto('http://localhost:3011/');
      await newPage.waitForSelector('input[type="email"]', { timeout: 10000 });
      await newPage.fill('input[type="email"]', TEST_USER.email);
      await newPage.fill('input[type="password"]', TEST_USER.password);
      await newPage.click('button[type="submit"]');
      
      // 첫 번째 탭에서 구독 추가
      await page.click('text=구독 추가');
      await page.waitForSelector('input[name="serviceName"]', { timeout: 10000 });
      await page.fill('input[name="serviceName"]', '멀티 디바이스 테스트');
      await page.fill('input[name="amount"]', '5000');
      await page.selectOption('select[name="currency"]', 'KRW');
      await page.selectOption('select[name="paymentCycle"]', 'monthly');
      await page.fill('input[name="paymentDay"]', '25');
      await page.selectOption('select[name="category"]', '테스트');
      await page.click('button[type="submit"]');
      
      // 두 번째 탭에서 실시간 확인
      await newPage.reload();
      await expect(newPage.locator('text=멀티 디바이스 테스트')).toBeVisible();
    });

    test('INT-019: 오프라인 동기화', async ({ page }) => {
      // 로그인
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.fill('input[type="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      
      // 대시보드 로딩 대기
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      
      // 오프라인 상태에서 구독 수정
      await page.route('**/*', route => route.abort());
      
      await page.click('text=구독 관리');
      await page.click('text=테스트 구독');
      await page.fill('input[name="amount"]', '15000');
      await page.click('button[type="submit"]');
      
      // 오프라인 저장 확인
      await expect(page.locator('text=오프라인 모드')).toBeVisible();
      
      // 온라인 복구 시 동기화
      await page.unroute('**/*');
      await page.reload();
      
      // 동기화 확인
      await expect(page.locator('text=동기화 완료')).toBeVisible();
    });
  });
}); 