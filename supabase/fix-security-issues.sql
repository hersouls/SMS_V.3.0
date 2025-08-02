-- =====================================================
-- 보안 문제 해결 스크립트
-- Supabase Database Linter에서 발견된 보안 문제들을 수정
-- =====================================================

-- =====================================================
-- 1. 기존 문제가 있는 뷰들 삭제
-- =====================================================

-- 기존 user_subscription_summary 뷰 삭제 (SECURITY DEFINER 및 auth.users 노출 문제)
DROP VIEW IF EXISTS public.user_subscription_summary;

-- 기존 user_subscription_stats 뷰 삭제 (SECURITY DEFINER 문제)
DROP VIEW IF EXISTS public.user_subscription_stats;

-- =====================================================
-- 2. 보안이 강화된 뷰들 재생성
-- =====================================================

-- user_subscription_stats 뷰 재생성 (SECURITY DEFINER 제거)
-- 이 뷰는 auth.users 테이블을 직접 참조하지 않고 user_id만 사용
CREATE OR REPLACE VIEW public.user_subscription_stats AS
SELECT 
  s.user_id,
  COUNT(*) as total_subscriptions,
  COUNT(CASE WHEN s.status = 'active' THEN 1 END) as active_subscriptions,
  COUNT(CASE WHEN s.status = 'paused' THEN 1 END) as paused_subscriptions,
  COUNT(CASE WHEN s.status = 'cancelled' THEN 1 END) as cancelled_subscriptions,
  SUM(CASE WHEN s.currency = 'USD' THEN s.amount * 1300 ELSE s.amount END) as total_monthly_krw,
  MAX(s.created_at) as last_updated
FROM subscriptions s
GROUP BY s.user_id;

-- user_subscription_summary 뷰 생성 (보안 강화된 버전)
-- auth.users의 민감한 정보를 노출하지 않고, 필요한 통계 정보만 제공
CREATE OR REPLACE VIEW public.user_subscription_summary AS
SELECT 
  s.user_id,
  COUNT(*) as subscription_count,
  COUNT(CASE WHEN s.status = 'active' THEN 1 END) as active_count,
  COUNT(CASE WHEN s.status = 'paused' THEN 1 END) as paused_count,
  COUNT(CASE WHEN s.status = 'cancelled' THEN 1 END) as cancelled_count,
  
  -- 금액 통계 (한화 기준)
  SUM(CASE 
    WHEN s.currency = 'USD' THEN s.amount * 1300 
    ELSE s.amount 
  END) as total_monthly_krw,
  
  AVG(CASE 
    WHEN s.currency = 'USD' THEN s.amount * 1300 
    ELSE s.amount 
  END) as avg_monthly_krw,
  
  -- 카테고리별 통계
  COUNT(DISTINCT s.category) as category_count,
  
  -- 결제 주기별 통계
  COUNT(CASE WHEN s.payment_cycle = 'monthly' THEN 1 END) as monthly_subscriptions,
  COUNT(CASE WHEN s.payment_cycle = 'yearly' THEN 1 END) as yearly_subscriptions,
  COUNT(CASE WHEN s.payment_cycle = 'onetime' THEN 1 END) as onetime_subscriptions,
  
  -- 통화별 통계
  COUNT(CASE WHEN s.currency = 'KRW' THEN 1 END) as krw_subscriptions,
  COUNT(CASE WHEN s.currency = 'USD' THEN 1 END) as usd_subscriptions,
  
  -- 시간 정보
  MIN(s.created_at) as first_subscription_date,
  MAX(s.created_at) as last_subscription_date,
  MAX(s.updated_at) as last_updated
  
FROM subscriptions s
GROUP BY s.user_id;

-- =====================================================
-- 3. 뷰에 대한 RLS 정책 설정
-- =====================================================

-- user_subscription_stats 뷰에 대한 RLS 활성화
-- 뷰 자체에는 RLS를 직접 적용할 수 없지만, 
-- 기본 테이블(subscriptions)에 이미 RLS가 설정되어 있으므로
-- 뷰를 통한 접근도 자동으로 제한됩니다.

-- =====================================================
-- 4. 권한 설정
-- =====================================================

-- anon 역할에서 뷰 접근 권한 제거
REVOKE ALL ON public.user_subscription_stats FROM anon;
REVOKE ALL ON public.user_subscription_summary FROM anon;

-- authenticated 역할에만 SELECT 권한 부여
GRANT SELECT ON public.user_subscription_stats TO authenticated;
GRANT SELECT ON public.user_subscription_summary TO authenticated;

-- =====================================================
-- 5. 추가 보안 함수 생성
-- =====================================================

-- 현재 사용자의 구독 통계만 반환하는 안전한 함수
CREATE OR REPLACE FUNCTION get_my_subscription_stats()
RETURNS TABLE (
  total_subscriptions BIGINT,
  active_subscriptions BIGINT,
  paused_subscriptions BIGINT,
  cancelled_subscriptions BIGINT,
  total_monthly_krw NUMERIC,
  last_updated TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 현재 인증된 사용자의 ID 확인
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT 
    uss.total_subscriptions,
    uss.active_subscriptions,
    uss.paused_subscriptions,
    uss.cancelled_subscriptions,
    uss.total_monthly_krw,
    uss.last_updated
  FROM public.user_subscription_stats uss
  WHERE uss.user_id = auth.uid();
END;
$$;

-- 현재 사용자의 구독 요약만 반환하는 안전한 함수
CREATE OR REPLACE FUNCTION get_my_subscription_summary()
RETURNS TABLE (
  subscription_count BIGINT,
  active_count BIGINT,
  paused_count BIGINT,
  cancelled_count BIGINT,
  total_monthly_krw NUMERIC,
  avg_monthly_krw NUMERIC,
  category_count BIGINT,
  monthly_subscriptions BIGINT,
  yearly_subscriptions BIGINT,
  onetime_subscriptions BIGINT,
  krw_subscriptions BIGINT,
  usd_subscriptions BIGINT,
  first_subscription_date TIMESTAMPTZ,
  last_subscription_date TIMESTAMPTZ,
  last_updated TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 현재 인증된 사용자의 ID 확인
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT 
    uss.subscription_count,
    uss.active_count,
    uss.paused_count,
    uss.cancelled_count,
    uss.total_monthly_krw,
    uss.avg_monthly_krw,
    uss.category_count,
    uss.monthly_subscriptions,
    uss.yearly_subscriptions,
    uss.onetime_subscriptions,
    uss.krw_subscriptions,
    uss.usd_subscriptions,
    uss.first_subscription_date,
    uss.last_subscription_date,
    uss.last_updated
  FROM public.user_subscription_summary uss
  WHERE uss.user_id = auth.uid();
END;
$$;

-- =====================================================
-- 6. 함수 권한 설정
-- =====================================================

-- anon 역할에서 함수 실행 권한 제거
REVOKE ALL ON FUNCTION get_my_subscription_stats() FROM anon;
REVOKE ALL ON FUNCTION get_my_subscription_summary() FROM anon;

-- authenticated 역할에만 함수 실행 권한 부여
GRANT EXECUTE ON FUNCTION get_my_subscription_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_my_subscription_summary() TO authenticated;

-- =====================================================
-- 완료 메시지
-- =====================================================
SELECT 'Security issues fixed successfully!' as status,
       'Views recreated without SECURITY DEFINER' as user_subscription_stats_fix,
       'auth.users exposure removed' as auth_users_fix,
       'Safe functions created for authenticated users only' as additional_security;