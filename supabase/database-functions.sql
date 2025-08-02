-- =====================================================
-- Moonwave SMS V2.0 Database Functions (Updated)
-- Supabase SQL Editor에서 실행하세요
-- =====================================================

-- =====================================================
-- 기존 트리거 삭제 (함수 삭제 전에 먼저 실행)
-- =====================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

-- =====================================================
-- 기존 함수들 삭제
-- =====================================================

-- 구독 관련 함수들 삭제
DROP FUNCTION IF EXISTS get_user_subscriptions(UUID);
DROP FUNCTION IF EXISTS get_subscription_stats(UUID);

-- 알림 관련 함수들 삭제
DROP FUNCTION IF EXISTS get_unread_notifications_count(UUID);
DROP FUNCTION IF EXISTS mark_notifications_as_read(UUID, UUID[]);
DROP FUNCTION IF EXISTS create_payment_notification(UUID, UUID, VARCHAR, DECIMAL, VARCHAR, DATE, INTEGER);

-- 결제 내역 관련 함수들 삭제
DROP FUNCTION IF EXISTS get_monthly_payment_history(UUID, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS get_yearly_payment_stats(UUID, INTEGER);

-- 카테고리 관련 함수들 삭제
DROP FUNCTION IF EXISTS get_category_stats(UUID);

-- 태그 관련 함수들 삭제
DROP FUNCTION IF EXISTS get_subscription_tags(UUID, UUID);
DROP FUNCTION IF EXISTS get_tag_subscription_count(UUID);

-- 분석 관련 함수들 삭제
DROP FUNCTION IF EXISTS generate_daily_analytics(UUID, DATE);

-- 사용자 설정 관련 함수들 삭제
DROP FUNCTION IF EXISTS create_user_preferences(UUID);

-- 트리거 함수들 삭제
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS handle_user_deletion();

-- =====================================================
-- 1. 구독 관련 함수들
-- =====================================================

-- 사용자별 구독 목록 조회
CREATE OR REPLACE FUNCTION get_user_subscriptions(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  service_name VARCHAR(255),
  service_url TEXT,
  logo VARCHAR(255),
  logo_image TEXT,
  amount DECIMAL(10,2),
  currency VARCHAR(3),
  payment_cycle VARCHAR(20),
  payment_day INTEGER,
  payment_method VARCHAR(100),
  start_date DATE,
  auto_renewal BOOLEAN,
  status VARCHAR(20),
  category VARCHAR(100),
  tier VARCHAR(50),
  memo TEXT,
  notifications JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.service_name,
    s.service_url,
    s.logo,
    s.logo_image,
    s.amount,
    s.currency,
    s.payment_cycle,
    s.payment_day,
    s.payment_method,
    s.start_date,
    s.auto_renewal,
    s.status,
    s.category,
    s.tier,
    s.memo,
    s.notifications,
    s.created_at,
    s.updated_at
  FROM subscriptions s
  WHERE s.user_id = user_uuid
  ORDER BY s.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 구독 통계 조회
CREATE OR REPLACE FUNCTION get_subscription_stats(user_uuid UUID)
RETURNS TABLE (
  total_subscriptions INTEGER,
  active_subscriptions INTEGER,
  paused_subscriptions INTEGER,
  cancelled_subscriptions INTEGER,
  total_monthly_amount DECIMAL(10,2),
  total_monthly_amount_krw DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_subscriptions,
    COUNT(CASE WHEN status = 'active' THEN 1 END)::INTEGER as active_subscriptions,
    COUNT(CASE WHEN status = 'paused' THEN 1 END)::INTEGER as paused_subscriptions,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END)::INTEGER as cancelled_subscriptions,
    SUM(CASE WHEN currency = 'USD' THEN amount ELSE amount END) as total_monthly_amount,
    SUM(CASE WHEN currency = 'USD' THEN amount * 1300 ELSE amount END) as total_monthly_amount_krw
  FROM subscriptions
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. 알림 관련 함수들
-- =====================================================

-- 사용자별 읽지 않은 알림 개수 조회
CREATE OR REPLACE FUNCTION get_unread_notifications_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM notifications
    WHERE user_id = user_uuid AND is_read = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 알림 일괄 읽음 처리
CREATE OR REPLACE FUNCTION mark_notifications_as_read(user_uuid UUID, notification_ids UUID[])
RETURNS VOID AS $$
BEGIN
  UPDATE notifications
  SET is_read = TRUE, updated_at = NOW()
  WHERE user_id = user_uuid AND id = ANY(notification_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 결제 알림 생성
CREATE OR REPLACE FUNCTION create_payment_notification(
  user_uuid UUID,
  subscription_id UUID,
  subscription_name VARCHAR(255),
  amount DECIMAL(10,2),
  currency VARCHAR(3),
  payment_date DATE,
  days_until INTEGER
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    subscription_id,
    type,
    title,
    message,
    priority,
    metadata
  ) VALUES (
    user_uuid,
    subscription_id,
    'payment',
    '결제 예정 알림',
    subscription_name || '의 결제가 ' || days_until || '일 후에 예정되어 있습니다.',
    CASE 
      WHEN days_until <= 1 THEN 'high'
      WHEN days_until <= 3 THEN 'medium'
      ELSE 'low'
    END,
    jsonb_build_object(
      'amount', amount,
      'currency', currency,
      'payment_date', payment_date,
      'days_until', days_until,
      'service_name', subscription_name
    )
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. 결제 내역 관련 함수들
-- =====================================================

-- 월별 결제 내역 조회
CREATE OR REPLACE FUNCTION get_monthly_payment_history(
  user_uuid UUID,
  year_param INTEGER,
  month_param INTEGER
)
RETURNS TABLE (
  id UUID,
  service_name VARCHAR(255),
  amount DECIMAL(10,2),
  currency VARCHAR(3),
  payment_date DATE,
  status VARCHAR(20),
  payment_method VARCHAR(100)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ph.id,
    ph.service_name,
    ph.amount,
    ph.currency,
    ph.payment_date,
    ph.status,
    ph.payment_method
  FROM payment_history ph
  WHERE ph.user_id = user_uuid
    AND EXTRACT(YEAR FROM ph.payment_date) = year_param
    AND EXTRACT(MONTH FROM ph.payment_date) = month_param
  ORDER BY ph.payment_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 연도별 결제 통계
CREATE OR REPLACE FUNCTION get_yearly_payment_stats(user_uuid UUID, year_param INTEGER)
RETURNS TABLE (
  total_amount DECIMAL(10,2),
  total_amount_krw DECIMAL(10,2),
  payment_count INTEGER,
  avg_amount DECIMAL(10,2),
  currency_breakdown JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    SUM(ph.amount) as total_amount,
    SUM(CASE WHEN ph.currency = 'USD' THEN ph.amount * 1300 ELSE ph.amount END) as total_amount_krw,
    COUNT(*) as payment_count,
    AVG(ph.amount) as avg_amount,
    jsonb_object_agg(ph.currency, COUNT(*)) as currency_breakdown
  FROM payment_history ph
  WHERE ph.user_id = user_uuid
    AND EXTRACT(YEAR FROM ph.payment_date) = year_param
    AND ph.status = 'completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. 카테고리 관련 함수들
-- =====================================================

-- 사용자별 카테고리 통계
CREATE OR REPLACE FUNCTION get_category_stats(user_uuid UUID)
RETURNS TABLE (
  category_name VARCHAR(100),
  subscription_count INTEGER,
  total_amount DECIMAL(10,2),
  total_amount_krw DECIMAL(10,2),
  color VARCHAR(7),
  icon VARCHAR(50)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sc.name as category_name,
    COUNT(s.id)::INTEGER as subscription_count,
    SUM(CASE WHEN s.currency = 'USD' THEN s.amount ELSE s.amount END) as total_amount,
    SUM(CASE WHEN s.currency = 'USD' THEN s.amount * 1300 ELSE s.amount END) as total_amount_krw,
    sc.color,
    sc.icon
  FROM subscription_categories sc
  LEFT JOIN subscriptions s ON sc.name = s.category AND s.user_id = user_uuid AND s.status = 'active'
  WHERE sc.user_id = user_uuid OR sc.user_id IS NULL
  GROUP BY sc.name, sc.color, sc.icon
  ORDER BY subscription_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. 태그 관련 함수들
-- =====================================================

-- 구독별 태그 조회
CREATE OR REPLACE FUNCTION get_subscription_tags(subscription_id_param UUID, user_uuid UUID)
RETURNS TABLE (
  tag_id UUID,
  tag_name VARCHAR(50),
  tag_color VARCHAR(7)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    st.id as tag_id,
    st.name as tag_name,
    st.color as tag_color
  FROM subscription_tags st
  INNER JOIN subscription_tag_relations str ON st.id = str.tag_id
  WHERE str.subscription_id = subscription_id_param
    AND str.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 태그별 구독 개수 조회
CREATE OR REPLACE FUNCTION get_tag_subscription_count(user_uuid UUID)
RETURNS TABLE (
  tag_id UUID,
  tag_name VARCHAR(50),
  tag_color VARCHAR(7),
  subscription_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    st.id as tag_id,
    st.name as tag_name,
    st.color as tag_color,
    COUNT(str.subscription_id)::INTEGER as subscription_count
  FROM subscription_tags st
  LEFT JOIN subscription_tag_relations str ON st.id = str.tag_id
  WHERE st.user_id = user_uuid
  GROUP BY st.id, st.name, st.color
  ORDER BY subscription_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. 분석 관련 함수들
-- =====================================================

-- 일별 사용자 분석 데이터 생성
CREATE OR REPLACE FUNCTION generate_daily_analytics(user_uuid UUID, target_date DATE)
RETURNS VOID AS $$
DECLARE
  total_spend DECIMAL(10,2) := 0;
  total_spend_krw DECIMAL(10,2) := 0;
  active_count INTEGER := 0;
  new_count INTEGER := 0;
  cancelled_count INTEGER := 0;
  paused_count INTEGER := 0;
  category_breakdown JSONB := '{}';
  currency_breakdown JSONB := '{}';
BEGIN
  -- 구독 통계 계산
  SELECT 
    COUNT(*) FILTER (WHERE status = 'active'),
    COUNT(*) FILTER (WHERE status = 'cancelled'),
    COUNT(*) FILTER (WHERE status = 'paused'),
    COUNT(*) FILTER (WHERE created_at::date = target_date),
    SUM(CASE WHEN currency = 'USD' THEN amount * 1300 ELSE amount END) FILTER (WHERE status = 'active'),
    SUM(amount) FILTER (WHERE status = 'active')
  INTO active_count, cancelled_count, paused_count, new_count, total_spend_krw, total_spend
  FROM subscriptions
  WHERE user_id = user_uuid;

  -- 카테고리별 분석
  SELECT jsonb_object_agg(category, count)
  INTO category_breakdown
  FROM (
    SELECT 
      category,
      COUNT(*) as count
    FROM subscriptions
    WHERE user_id = user_uuid AND status = 'active'
    GROUP BY category
  ) cat_stats;

  -- 통화별 분석
  SELECT jsonb_object_agg(currency, count)
  INTO currency_breakdown
  FROM (
    SELECT 
      currency,
      COUNT(*) as count
    FROM subscriptions
    WHERE user_id = user_uuid AND status = 'active'
    GROUP BY currency
  ) curr_stats;

  -- 분석 데이터 삽입 또는 업데이트
  INSERT INTO user_analytics (
    user_id,
    date,
    total_spend,
    total_spend_krw,
    active_subscriptions,
    new_subscriptions,
    cancelled_subscriptions,
    paused_subscriptions,
    category_breakdown,
    currency_breakdown
  ) VALUES (
    user_uuid,
    target_date,
    COALESCE(total_spend, 0),
    COALESCE(total_spend_krw, 0),
    COALESCE(active_count, 0),
    COALESCE(new_count, 0),
    COALESCE(cancelled_count, 0),
    COALESCE(paused_count, 0),
    COALESCE(category_breakdown, '{}'),
    COALESCE(currency_breakdown, '{}')
  )
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    total_spend = EXCLUDED.total_spend,
    total_spend_krw = EXCLUDED.total_spend_krw,
    active_subscriptions = EXCLUDED.active_subscriptions,
    new_subscriptions = EXCLUDED.new_subscriptions,
    cancelled_subscriptions = EXCLUDED.cancelled_subscriptions,
    paused_subscriptions = EXCLUDED.paused_subscriptions,
    category_breakdown = EXCLUDED.category_breakdown,
    currency_breakdown = EXCLUDED.currency_breakdown,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. 사용자 설정 관련 함수들
-- =====================================================

-- 사용자 기본 설정 생성
CREATE OR REPLACE FUNCTION create_user_preferences(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_preferences (
    user_id,
    exchange_rate,
    default_currency,
    notifications,
    theme,
    language,
    timezone
  ) VALUES (
    user_uuid,
    1300,
    'KRW',
    '{"paymentReminders": true, "priceChanges": false, "subscriptionExpiry": true, "email": true, "push": true, "sms": false}',
    'dark',
    'ko',
    'Asia/Seoul'
  )
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. 트리거 함수들
-- =====================================================

-- 새 사용자 등록 시 기본 설정 생성
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 기본 카테고리 복사
  INSERT INTO subscription_categories (user_id, name, color, icon, description, is_default)
  SELECT NEW.id, name, color, icon, description, FALSE
  FROM subscription_categories
  WHERE user_id IS NULL;
  
  -- 사용자 설정 생성
  PERFORM create_user_preferences(NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 사용자 삭제 시 관련 데이터 정리
CREATE OR REPLACE FUNCTION handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- 모든 관련 데이터는 CASCADE로 자동 삭제됨
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. 트리거 생성
-- =====================================================

-- 새 사용자 등록 트리거
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 사용자 삭제 트리거
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_user_deletion();

-- =====================================================
-- 완료 메시지
-- =====================================================
SELECT 'Database functions updated successfully!' as status; 