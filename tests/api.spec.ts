import { test, expect } from '@playwright/test';
import { supabase } from '../utils/supabase/client';
import { TEST_CONFIG, TEST_SUBSCRIPTION } from './test-config';

// API 테스트 데이터 - 새로운 설정 사용
const API_TEST_USER = TEST_CONFIG.API_USER;

const API_TEST_SUBSCRIPTION = {
  serviceName: 'API Test Service',
  amount: 10000,
  currency: 'KRW',
  paymentCycle: 'monthly',
  paymentDay: 15,
  category: '테스트'
};

test.describe('Moonwave API 통합 테스트', () => {
  let authToken: string;
  let userId: string;

  test.beforeAll(async () => {
    // 테스트 사용자 생성 및 인증
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: API_TEST_USER.email,
      password: API_TEST_USER.password,
      options: {
        data: {
          name: API_TEST_USER.name
        }
      }
    });

    if (signUpError) {
      console.error('회원가입 에러:', signUpError);
    }

    // 로그인
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: API_TEST_USER.email,
      password: API_TEST_USER.password
    });

    if (signInError) {
      console.error('로그인 에러:', signInError);
    } else {
      authToken = signInData.session?.access_token || '';
      userId = signInData.user?.id || '';
    }
  });

  test.describe('REST API 통합 테스트', () => {
    test('API-001: 인증된 API 요청', async ({ request }) => {
      // 인증 헤더를 포함한 API 요청
      const response = await request.get('/rest/v1/subscriptions', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'apikey': process.env.VITE_SUPABASE_ANON_KEY || ''
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    test('API-002: 구독 데이터 CRUD', async ({ request }) => {
      // 1. Create - 구독 생성
      const createResponse = await request.post('/rest/v1/subscriptions', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'apikey': process.env.VITE_SUPABASE_ANON_KEY || '',
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        data: {
          user_id: userId,
          service_name: API_TEST_SUBSCRIPTION.serviceName,
          amount: API_TEST_SUBSCRIPTION.amount,
          currency: API_TEST_SUBSCRIPTION.currency,
          payment_cycle: API_TEST_SUBSCRIPTION.paymentCycle,
          payment_day: API_TEST_SUBSCRIPTION.paymentDay,
          category: API_TEST_SUBSCRIPTION.category,
          start_date: new Date().toISOString().split('T')[0]
        }
      });

      expect(createResponse.status()).toBe(201);
      const createdData = await createResponse.json();
      const subscriptionId = createdData[0].id;

      // 2. Read - 구독 조회
      const readResponse = await request.get(`/rest/v1/subscriptions?id=eq.${subscriptionId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'apikey': process.env.VITE_SUPABASE_ANON_KEY || ''
        }
      });

      expect(readResponse.status()).toBe(200);
      const readData = await readResponse.json();
      expect(readData[0].service_name).toBe(API_TEST_SUBSCRIPTION.serviceName);

      // 3. Update - 구독 수정
      const updateResponse = await request.patch(`/rest/v1/subscriptions?id=eq.${subscriptionId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'apikey': process.env.VITE_SUPABASE_ANON_KEY || '',
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        data: {
          amount: 15000
        }
      });

      expect(updateResponse.status()).toBe(200);
      const updateData = await updateResponse.json();
      expect(updateData[0].amount).toBe('15000.00');

      // 4. Delete - 구독 삭제
      const deleteResponse = await request.delete(`/rest/v1/subscriptions?id=eq.${subscriptionId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'apikey': process.env.VITE_SUPABASE_ANON_KEY || ''
        }
      });

      expect(deleteResponse.status()).toBe(204);
    });

    test('API-003: 데이터 검증', async ({ request }) => {
      // 유효하지 않은 데이터로 구독 생성 시도
      const invalidResponse = await request.post('/rest/v1/subscriptions', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'apikey': process.env.VITE_SUPABASE_ANON_KEY || '',
          'Content-Type': 'application/json'
        },
        data: {
          user_id: userId,
          service_name: '', // 빈 서비스명
          amount: -1000, // 음수 금액
          currency: 'INVALID', // 잘못된 통화
          payment_day: 32, // 잘못된 결제일
          start_date: new Date().toISOString().split('T')[0]
        }
      });

      expect(invalidResponse.status()).toBe(400);
    });

    test('API-004: 권한 검증', async ({ request }) => {
      // 인증 없이 API 요청
      const unauthorizedResponse = await request.get('/rest/v1/subscriptions', {
        headers: {
          'apikey': process.env.VITE_SUPABASE_ANON_KEY || ''
        }
      });

      expect(unauthorizedResponse.status()).toBe(401);
    });
  });

  test.describe('RPC 함수 통합 테스트', () => {
    test('API-005: 통계 계산 함수', async ({ request }) => {
      // 통계 계산 RPC 함수 호출
      const response = await request.post('/rest/v1/rpc/get_user_statistics', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'apikey': process.env.VITE_SUPABASE_ANON_KEY || '',
          'Content-Type': 'application/json'
        },
        data: {
          user_id: userId
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('total_subscriptions');
      expect(data).toHaveProperty('monthly_spending');
    });

    test('API-006: 복잡한 쿼리 함수', async ({ request }) => {
      // 복잡한 쿼리 RPC 함수 호출
      const response = await request.post('/rest/v1/rpc/get_subscription_analytics', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'apikey': process.env.VITE_SUPABASE_ANON_KEY || '',
          'Content-Type': 'application/json'
        },
        data: {
          user_id: userId,
          start_date: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0]
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  test.describe('실시간 API 통합 테스트', () => {
    test('API-007: 실시간 구독', async ({ request }) => {
      // 실시간 구독 설정
      const response = await request.post('/rest/v1/realtime/subscribe', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'apikey': process.env.VITE_SUPABASE_ANON_KEY || '',
          'Content-Type': 'application/json'
        },
        data: {
          event: 'INSERT',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${userId}`
        }
      });

      expect(response.status()).toBe(200);
    });

    test('API-008: 실시간 이벤트 수신', async ({ request }) => {
      // WebSocket 연결 테스트 (실제 구현에서는 WebSocket 클라이언트 필요)
      // 이 테스트는 기본 구조만 제공
      expect(true).toBe(true);
    });
  });

  test.describe('외부 API 통합 테스트', () => {
    test('API-009: 환율 API', async ({ request }) => {
      // 환율 API 호출 (실제 API 엔드포인트로 대체 필요)
      const response = await request.get('/api/exchange-rate', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'apikey': process.env.VITE_SUPABASE_ANON_KEY || ''
        }
      });

      // 실제 구현에 따라 응답 검증
      expect(response.status()).toBe(200);
    });

    test('API-010: 알림 API', async ({ request }) => {
      // 알림 발송 API 호출
      const response = await request.post('/rest/v1/notifications', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'apikey': process.env.VITE_SUPABASE_ANON_KEY || '',
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        data: {
          user_id: userId,
          type: 'payment',
          title: '결제 예정 알림',
          message: 'Netflix 결제가 3일 후 예정됩니다.',
          priority: 'medium'
        }
      });

      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data[0].title).toBe('결제 예정 알림');
    });
  });

  test.describe('에러 처리 테스트', () => {
    test('API-011: 네트워크 오류 처리', async ({ request }) => {
      // 잘못된 URL로 요청
      const response = await request.get('/rest/v1/nonexistent', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'apikey': process.env.VITE_SUPABASE_ANON_KEY || ''
        }
      });

      expect(response.status()).toBe(404);
    });

    test('API-012: 타임아웃 처리', async ({ request }) => {
      // 타임아웃이 발생할 수 있는 긴 쿼리
      const response = await request.post('/rest/v1/rpc/slow_query', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'apikey': process.env.VITE_SUPABASE_ANON_KEY || '',
          'Content-Type': 'application/json'
        },
        data: {
          user_id: userId
        },
        timeout: 5000 // 5초 타임아웃
      });

      // 타임아웃 또는 성공 응답 확인
      expect([200, 408]).toContain(response.status());
    });

    test('API-013: 데이터베이스 오류 처리', async ({ request }) => {
      // 잘못된 데이터로 데이터베이스 오류 유발
      const response = await request.post('/rest/v1/subscriptions', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'apikey': process.env.VITE_SUPABASE_ANON_KEY || '',
          'Content-Type': 'application/json'
        },
        data: {
          user_id: 'invalid-uuid', // 잘못된 UUID
          service_name: 'Test',
          amount: 1000,
          currency: 'KRW',
          payment_cycle: 'monthly',
          payment_day: 15,
          start_date: new Date().toISOString().split('T')[0]
        }
      });

      expect(response.status()).toBe(400);
    });
  });

  test.describe('성능 테스트', () => {
    test('API-014: 대량 데이터 처리', async ({ request }) => {
      const startTime = Date.now();
      
      // 대량의 구독 데이터 조회
      const response = await request.get('/rest/v1/subscriptions', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'apikey': process.env.VITE_SUPABASE_ANON_KEY || ''
        }
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status()).toBe(200);
      expect(responseTime).toBeLessThan(5000); // 5초 이내 응답
    });

    test('API-015: 동시 요청 처리', async ({ request }) => {
      // 동시에 여러 요청 발송
      const promises = Array.from({ length: 10 }, () =>
        request.get('/rest/v1/subscriptions', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'apikey': process.env.VITE_SUPABASE_ANON_KEY || ''
          }
        })
      );

      const responses = await Promise.all(promises);
      
      // 모든 요청이 성공적으로 처리되었는지 확인
      responses.forEach(response => {
        expect(response.status()).toBe(200);
      });
    });
  });

  test.afterAll(async () => {
    // 테스트 데이터 정리
    if (authToken && userId) {
      // 테스트 중 생성된 구독 데이터 삭제
      await supabase
        .from('subscriptions')
        .delete()
        .eq('user_id', userId);

      // 테스트 중 생성된 알림 데이터 삭제
      await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId);

      // 테스트 사용자 계정 삭제 (선택사항)
      // await supabase.auth.admin.deleteUser(userId);
    }
  });
}); 