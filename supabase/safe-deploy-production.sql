-- =====================================================
-- Moonwave SMS V3.0 Safe Production Deployment Script
-- 안전한 프로덕션 배포 (에러 방지)
-- =====================================================

-- 배포 시작 로그
SELECT 'Starting Moonwave SMS V3.0 safe deployment at ' || NOW() as deployment_start;

-- =====================================================
-- 1단계: 현재 상태 확인
-- =====================================================

-- 현재 테이블 목록 확인
SELECT 
  'Current tables:' as info,
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- =====================================================
-- 2단계: 안전한 기존 리소스 제거
-- =====================================================

-- 트리거 안전하게 제거 (존재하는 것만)
DO $$
BEGIN
    -- auth.users 트리거들
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        DROP TRIGGER on_auth_user_created ON auth.users CASCADE;
        RAISE NOTICE 'Dropped trigger: on_auth_user_created';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_deleted') THEN
        DROP TRIGGER on_auth_user_deleted ON auth.users CASCADE;
        RAISE NOTICE 'Dropped trigger: on_auth_user_deleted';
    END IF;
    
    -- 테이블별 트리거들 (테이블이 존재하는 경우만)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_preferences' AND table_schema = 'public') THEN
        IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_preferences_updated_at') THEN
            DROP TRIGGER update_user_preferences_updated_at ON public.user_preferences CASCADE;
            RAISE NOTICE 'Dropped trigger: update_user_preferences_updated_at';
        END IF;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscription_categories' AND table_schema = 'public') THEN
        IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_subscription_categories_updated_at') THEN
            DROP TRIGGER update_subscription_categories_updated_at ON public.subscription_categories CASCADE;
            RAISE NOTICE 'Dropped trigger: update_subscription_categories_updated_at';
        END IF;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions' AND table_schema = 'public') THEN
        IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_subscriptions_updated_at') THEN
            DROP TRIGGER update_subscriptions_updated_at ON public.subscriptions CASCADE;
            RAISE NOTICE 'Dropped trigger: update_subscriptions_updated_at';
        END IF;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
        IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_notifications_updated_at') THEN
            DROP TRIGGER update_notifications_updated_at ON public.notifications CASCADE;
            RAISE NOTICE 'Dropped trigger: update_notifications_updated_at';
        END IF;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_analytics' AND table_schema = 'public') THEN
        IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_analytics_updated_at') THEN
            DROP TRIGGER update_user_analytics_updated_at ON public.user_analytics CASCADE;
            RAISE NOTICE 'Dropped trigger: update_user_analytics_updated_at';
        END IF;
    END IF;
END
$$;

-- 함수들 안전하게 제거
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_user_deletion() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.create_user_settings() CASCADE;
DROP FUNCTION IF EXISTS public.create_user_preferences() CASCADE;
DROP FUNCTION IF EXISTS public.initialize_exchange_rates() CASCADE;
DROP FUNCTION IF EXISTS public.update_subscription_statistics() CASCADE;

SELECT 'Step 2 completed: Triggers and functions removed safely' as step_status;

-- =====================================================
-- 3단계: 기존 테이블 안전하게 제거
-- =====================================================

-- 뷰 먼저 제거
DROP VIEW IF EXISTS public.user_subscription_stats CASCADE;
DROP VIEW IF EXISTS public.user_subscription_summary CASCADE;

-- 테이블들을 의존성 순서대로 안전하게 제거
DROP TABLE IF EXISTS public.category_analytics CASCADE;
DROP TABLE IF EXISTS public.monthly_spending_trends CASCADE;
DROP TABLE IF EXISTS public.notification_analytics CASCADE;
DROP TABLE IF EXISTS public.subscription_lifecycle_analytics CASCADE;
DROP TABLE IF EXISTS public.user_behavior_analytics CASCADE;
DROP TABLE IF EXISTS public.subscription_statistics CASCADE;
DROP TABLE IF EXISTS public.payment_cycle_analytics CASCADE;
DROP TABLE IF EXISTS public.tag_analytics CASCADE;
DROP TABLE IF EXISTS public.subscription_tags CASCADE;
DROP TABLE IF EXISTS public.subscription_tag_relations CASCADE;
DROP TABLE IF EXISTS public.exchange_rates CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.payment_history CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.subscription_categories CASCADE;
DROP TABLE IF EXISTS public.user_preferences CASCADE;
DROP TABLE IF EXISTS public.user_settings CASCADE;
DROP TABLE IF EXISTS public.user_analytics CASCADE;

SELECT 'Step 3 completed: Existing tables removed safely' as step_status;

-- =====================================================
-- 4단계: UUID 확장 및 새 테이블 생성
-- =====================================================

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USER_PREFERENCES 테이블
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  exchange_rate DECIMAL(10,2) DEFAULT 1300.00,
  default_currency VARCHAR(3) DEFAULT 'KRW' CHECK (default_currency IN ('KRW', 'USD')),
  
  notifications JSONB DEFAULT '{
    "sms": false,
    "push": true,
    "email": true,
    "price_changes": false,
    "payment_reminders": true,
    "subscription_expiry": true,
    "seven_days": true,
    "three_days": true,
    "same_day": true
  }'::jsonb,
  
  theme VARCHAR(10) DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'auto')),
  language VARCHAR(5) DEFAULT 'ko' CHECK (language IN ('ko', 'en')),
  timezone VARCHAR(50) DEFAULT 'Asia/Seoul',
  date_format VARCHAR(20) DEFAULT 'YYYY-MM-DD',
  currency_format VARCHAR(20) DEFAULT '₩#,##0',
  
  music_enabled BOOLEAN DEFAULT true,
  sound_effects BOOLEAN DEFAULT true,
  auto_backup BOOLEAN DEFAULT true,
  data_retention_days INTEGER DEFAULT 365,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. SUBSCRIPTION_CATEGORIES 테이블
CREATE TABLE public.subscription_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#3B82F6',
  icon VARCHAR(50),
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, name)
);

-- 3. SUBSCRIPTIONS 테이블
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  service_name VARCHAR(255) NOT NULL,
  service_url TEXT,
  logo VARCHAR(255),
  logo_image TEXT,
  
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  currency VARCHAR(3) NOT NULL CHECK (currency IN ('KRW', 'USD')),
  payment_cycle VARCHAR(20) NOT NULL CHECK (payment_cycle IN ('monthly', 'yearly', 'onetime')),
  payment_day INTEGER NOT NULL CHECK (payment_day >= 1 AND payment_day <= 31),
  payment_method VARCHAR(100),
  
  start_date DATE NOT NULL,
  end_date DATE,
  auto_renewal BOOLEAN DEFAULT true,
  
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  category VARCHAR(100),
  tier VARCHAR(50),
  tags TEXT[] DEFAULT '{}',
  
  memo TEXT,
  notifications JSONB DEFAULT '{
    "seven_days": true,
    "three_days": true,
    "same_day": true
  }'::jsonb,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PAYMENT_HISTORY 테이블
CREATE TABLE public.payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  
  service_name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  currency VARCHAR(3) NOT NULL CHECK (currency IN ('KRW', 'USD')),
  payment_date DATE NOT NULL,
  payment_method VARCHAR(100),
  payment_cycle VARCHAR(20) CHECK (payment_cycle IN ('monthly', 'yearly', 'onetime')),
  
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  notes TEXT,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. NOTIFICATIONS 테이블
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  
  type VARCHAR(20) NOT NULL CHECK (type IN ('payment', 'renewal', 'expiry', 'system', 'reminder')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  is_read BOOLEAN DEFAULT false,
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  
  category VARCHAR(100),
  metadata JSONB DEFAULT '{}'::jsonb,
  
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. EXCHANGE_RATES 테이블
CREATE TABLE public.exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  base_currency VARCHAR(3) NOT NULL,
  target_currency VARCHAR(3) NOT NULL,
  rate DECIMAL(10,4) NOT NULL CHECK (rate > 0),
  source VARCHAR(50) DEFAULT 'manual',
  
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(base_currency, target_currency, valid_from)
);

-- 7. USER_ANALYTICS 테이블
CREATE TABLE public.user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  total_subscriptions INTEGER DEFAULT 0,
  active_subscriptions INTEGER DEFAULT 0,
  paused_subscriptions INTEGER DEFAULT 0,
  cancelled_subscriptions INTEGER DEFAULT 0,
  
  monthly_total_krw DECIMAL(12,2) DEFAULT 0,
  yearly_total_krw DECIMAL(12,2) DEFAULT 0,
  average_monthly_krw DECIMAL(10,2) DEFAULT 0,
  
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, year, month)
);

SELECT 'Step 4 completed: New tables created successfully' as step_status;

-- =====================================================
-- 5단계: 인덱스 생성
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_categories_user_id ON public.subscription_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_categories_name ON public.subscription_categories(name);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_category ON public.subscriptions(category);
CREATE INDEX IF NOT EXISTS idx_subscriptions_payment_day ON public.subscriptions(payment_day);
CREATE INDEX IF NOT EXISTS idx_subscriptions_start_date ON public.subscriptions(start_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON public.subscriptions(end_date);
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON public.payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_subscription_id ON public.payment_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_payment_date ON public.payment_history(payment_date);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON public.payment_history(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_for ON public.notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currencies ON public.exchange_rates(base_currency, target_currency);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_valid_from ON public.exchange_rates(valid_from);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON public.user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_year_month ON public.user_analytics(year, month);

SELECT 'Step 5 completed: Indexes created successfully' as step_status;

-- =====================================================
-- 6단계: RLS 정책 설정
-- =====================================================

-- 모든 테이블에 RLS 활성화
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- RLS 정책들
CREATE POLICY "Users can view own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own preferences" ON public.user_preferences
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own categories" ON public.subscription_categories
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can manage own subscriptions" ON public.subscriptions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own payment history" ON public.payment_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payment history" ON public.payment_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "All users can view exchange rates" ON public.exchange_rates
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can view own analytics" ON public.user_analytics
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can manage analytics" ON public.user_analytics
  FOR ALL USING (auth.uid() = user_id);

SELECT 'Step 6 completed: RLS policies created successfully' as step_status;

-- =====================================================
-- 7단계: 함수 및 트리거 생성
-- =====================================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 새 사용자를 위한 기본 설정 생성 함수 (에러 처리 강화)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    -- 기본 사용자 환경설정 생성
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- 기본 카테고리 생성
    INSERT INTO public.subscription_categories (user_id, name, color, icon, is_default)
    VALUES 
      (NEW.id, 'Entertainment', '#FF6B6B', '🎵', true),
      (NEW.id, 'Productivity', '#4ECDC4', '💼', true),
      (NEW.id, 'Education', '#45B7D1', '📚', true),
      (NEW.id, 'Health & Fitness', '#96CEB4', '💪', true),
      (NEW.id, 'News & Media', '#FFEAA7', '📰', true),
      (NEW.id, 'Utilities', '#DDA0DD', '🔧', true)
    ON CONFLICT (user_id, name) DO NOTHING;
    
  EXCEPTION
    WHEN OTHERS THEN
      -- 에러가 발생해도 사용자 생성은 계속 진행
      RAISE NOTICE 'Error creating default user data for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 기본 환율 데이터 삽입 함수
CREATE OR REPLACE FUNCTION public.initialize_exchange_rates()
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.exchange_rates (base_currency, target_currency, rate, source)
  VALUES 
    ('USD', 'KRW', 1300.00, 'system'),
    ('KRW', 'USD', 0.00077, 'system')
  ON CONFLICT (base_currency, target_currency, valid_from) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscription_categories_updated_at
  BEFORE UPDATE ON public.subscription_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_analytics_updated_at
  BEFORE UPDATE ON public.user_analytics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 새 사용자 생성 시 기본 설정 생성 트리거
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

SELECT 'Step 7 completed: Functions and triggers created successfully' as step_status;

-- =====================================================
-- 8단계: 뷰 및 초기 데이터
-- =====================================================

-- 사용자별 구독 요약 뷰
CREATE OR REPLACE VIEW public.user_subscription_summary AS
SELECT 
  s.user_id,
  COUNT(*) as total_subscriptions,
  COUNT(*) FILTER (WHERE s.status = 'active') as active_subscriptions,
  COUNT(*) FILTER (WHERE s.status = 'paused') as paused_subscriptions,
  COUNT(*) FILTER (WHERE s.status = 'cancelled') as cancelled_subscriptions,
  SUM(CASE 
    WHEN s.currency = 'KRW' AND s.payment_cycle = 'monthly' AND s.status = 'active' THEN s.amount
    WHEN s.currency = 'USD' AND s.payment_cycle = 'monthly' AND s.status = 'active' THEN s.amount * 1300
    WHEN s.currency = 'KRW' AND s.payment_cycle = 'yearly' AND s.status = 'active' THEN s.amount / 12
    WHEN s.currency = 'USD' AND s.payment_cycle = 'yearly' AND s.status = 'active' THEN (s.amount * 1300) / 12
    ELSE 0
  END) as monthly_total_krw
FROM public.subscriptions s
GROUP BY s.user_id;

-- 기본 환율 데이터 삽입
SELECT public.initialize_exchange_rates();

SELECT 'Step 8 completed: Views and initial data created successfully' as step_status;

-- =====================================================
-- 9단계: 권한 설정
-- =====================================================

-- 권한 부여
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

SELECT 'Step 9 completed: Permissions granted successfully' as step_status;

-- =====================================================
-- 배포 완료 확인
-- =====================================================

-- 생성된 테이블 확인
SELECT 
  'Tables created: ' || COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'user_preferences', 
    'subscription_categories', 
    'subscriptions', 
    'payment_history', 
    'notifications', 
    'exchange_rates', 
    'user_analytics'
  );

-- 생성된 함수 확인
SELECT 
  'Functions created: ' || COUNT(*) as function_count
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name IN (
    'update_updated_at_column',
    'handle_new_user',
    'initialize_exchange_rates'
  );

-- 생성된 인덱스 확인
SELECT 
  'Indexes created: ' || COUNT(*) as index_count
FROM pg_indexes 
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%';

-- 배포 완료 메시지
SELECT 
  'Moonwave SMS V3.0 Production Schema deployed safely!' as deployment_status,
  'Deployment completed at: ' || NOW() as completion_time;

-- 회원가입 테스트 안내
SELECT 
  'Ready for testing!' as next_step,
  'Try creating a new account to test the signup flow' as instruction;