-- =====================================================
-- Moonwave SMS V2.0 Database Schema (Updated)
-- Supabase SQL Editor에서 실행하세요
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 기존 뷰 삭제
-- =====================================================
DROP VIEW IF EXISTS user_subscription_stats;

-- =====================================================
-- 1. SUBSCRIPTIONS 테이블 (새로 추가)
-- =====================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service_name VARCHAR(255) NOT NULL,
  service_url TEXT,
  logo VARCHAR(255),
  logo_image TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL CHECK (currency IN ('KRW', 'USD')),
  payment_cycle VARCHAR(20) NOT NULL CHECK (payment_cycle IN ('monthly', 'yearly', 'onetime')),
  payment_day INTEGER NOT NULL CHECK (payment_day >= 1 AND payment_day <= 31),
  payment_method VARCHAR(100),
  start_date DATE NOT NULL,
  auto_renewal BOOLEAN DEFAULT TRUE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  category VARCHAR(100),
  tier VARCHAR(50),
  memo TEXT,
  notifications JSONB DEFAULT '{
    "sevenDays": true,
    "threeDays": true,
    "sameDay": true
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_category ON subscriptions(category);
CREATE INDEX IF NOT EXISTS idx_subscriptions_payment_day ON subscriptions(payment_day);
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at ON subscriptions(created_at);

-- =====================================================
-- 2. NOTIFICATIONS 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('payment', 'renewal', 'expiry', 'system')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  category VARCHAR(100),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_subscription_id ON notifications(subscription_id);

-- =====================================================
-- 3. PAYMENT_HISTORY 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  service_name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL CHECK (currency IN ('KRW', 'USD')),
  payment_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method VARCHAR(100),
  payment_cycle VARCHAR(20) CHECK (payment_cycle IN ('monthly', 'yearly', 'onetime')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_subscription_id ON payment_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_payment_date ON payment_history(payment_date);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);

-- =====================================================
-- 4. SUBSCRIPTION_CATEGORIES 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS subscription_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NULL,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#3B82F6',
  icon VARCHAR(50),
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_subscription_categories_user_id ON subscription_categories(user_id);

-- 기본 카테고리 데이터 삽입 (NULL user_id로 시스템 기본 카테고리 생성)
INSERT INTO subscription_categories (user_id, name, color, icon, description, is_default) VALUES
  (NULL, '엔터테인먼트', '#EF4444', 'tv', '넷플릭스, 디즈니플러스 등', true),
  (NULL, '음악', '#8B5CF6', 'music', '스포티파이, 애플뮤직 등', true),
  (NULL, '개발', '#06B6D4', 'code', 'GitHub, Vercel 등', true),
  (NULL, 'AI', '#10B981', 'brain', 'ChatGPT, Claude 등', true),
  (NULL, '디자인', '#F59E0B', 'palette', 'Figma, Adobe 등', true),
  (NULL, '생산성', '#3B82F6', 'briefcase', 'Notion, Slack 등', true),
  (NULL, '교육', '#06B6D4', 'book-open', 'Coursera, Udemy 등', true),
  (NULL, '피트니스', '#10B981', 'activity', 'MyFitnessPal, Strava 등', true),
  (NULL, '뉴스', '#6B7280', 'newspaper', '뉴스 구독 서비스', true),
  (NULL, '게임', '#8B5CF6', 'gamepad-2', '게임 구독 서비스', true),
  (NULL, '기타', '#6B7280', 'more-horizontal', '기타 구독 서비스', true)
ON CONFLICT (user_id, name) DO NOTHING;

-- =====================================================
-- 5. SUBSCRIPTION_TAGS 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS subscription_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(7) DEFAULT '#6B7280',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_subscription_tags_user_id ON subscription_tags(user_id);

-- =====================================================
-- 6. SUBSCRIPTION_TAG_RELATIONS 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS subscription_tag_relations (
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES subscription_tags(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (subscription_id, tag_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_subscription_tag_relations_subscription_id ON subscription_tag_relations(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_tag_relations_tag_id ON subscription_tag_relations(tag_id);
CREATE INDEX IF NOT EXISTS idx_subscription_tag_relations_user_id ON subscription_tag_relations(user_id);

-- =====================================================
-- 7. USER_ANALYTICS 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_spend DECIMAL(10,2) DEFAULT 0,
  total_spend_krw DECIMAL(10,2) DEFAULT 0,
  active_subscriptions INTEGER DEFAULT 0,
  new_subscriptions INTEGER DEFAULT 0,
  cancelled_subscriptions INTEGER DEFAULT 0,
  paused_subscriptions INTEGER DEFAULT 0,
  category_breakdown JSONB DEFAULT '{}',
  currency_breakdown JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_date ON user_analytics(date);

-- =====================================================
-- 8. USER_PREFERENCES 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  exchange_rate DECIMAL(10,2) DEFAULT 1300,
  default_currency VARCHAR(3) DEFAULT 'KRW' CHECK (default_currency IN ('KRW', 'USD')),
  notifications JSONB DEFAULT '{
    "paymentReminders": true,
    "priceChanges": false,
    "subscriptionExpiry": true,
    "email": true,
    "push": true,
    "sms": false
  }',
  theme VARCHAR(20) DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'auto')),
  language VARCHAR(10) DEFAULT 'ko' CHECK (language IN ('ko', 'en')),
  timezone VARCHAR(50) DEFAULT 'Asia/Seoul',
  date_format VARCHAR(20) DEFAULT 'YYYY-MM-DD',
  currency_format VARCHAR(20) DEFAULT '₩#,##0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- =====================================================
-- 9. ROW LEVEL SECURITY (RLS) 설정
-- =====================================================

-- 기존 정책 삭제 (있는 경우)
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can delete their own subscriptions" ON subscriptions;

DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;

DROP POLICY IF EXISTS "Users can view their own payment history" ON payment_history;
DROP POLICY IF EXISTS "Users can insert their own payment history" ON payment_history;
DROP POLICY IF EXISTS "Users can update their own payment history" ON payment_history;
DROP POLICY IF EXISTS "Users can delete their own payment history" ON payment_history;

DROP POLICY IF EXISTS "Users can view their own categories" ON subscription_categories;
DROP POLICY IF EXISTS "Users can insert their own categories" ON subscription_categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON subscription_categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON subscription_categories;

DROP POLICY IF EXISTS "Users can view their own tags" ON subscription_tags;
DROP POLICY IF EXISTS "Users can insert their own tags" ON subscription_tags;
DROP POLICY IF EXISTS "Users can update their own tags" ON subscription_tags;
DROP POLICY IF EXISTS "Users can delete their own tags" ON subscription_tags;

DROP POLICY IF EXISTS "Users can view their own tag relations" ON subscription_tag_relations;
DROP POLICY IF EXISTS "Users can insert their own tag relations" ON subscription_tag_relations;
DROP POLICY IF EXISTS "Users can update their own tag relations" ON subscription_tag_relations;
DROP POLICY IF EXISTS "Users can delete their own tag relations" ON subscription_tag_relations;

DROP POLICY IF EXISTS "Users can view their own analytics" ON user_analytics;
DROP POLICY IF EXISTS "Users can insert their own analytics" ON user_analytics;
DROP POLICY IF EXISTS "Users can update their own analytics" ON user_analytics;
DROP POLICY IF EXISTS "Users can delete their own analytics" ON user_analytics;

DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can delete their own preferences" ON user_preferences;

-- Subscriptions RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own subscriptions" ON subscriptions
  FOR DELETE USING (auth.uid() = user_id);

-- Notifications RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own notifications" ON notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Payment History RLS
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own payment history" ON payment_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own payment history" ON payment_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own payment history" ON payment_history
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own payment history" ON payment_history
  FOR DELETE USING (auth.uid() = user_id);

-- Subscription Categories RLS
ALTER TABLE subscription_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own categories" ON subscription_categories
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can insert their own categories" ON subscription_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can update their own categories" ON subscription_categories
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own categories" ON subscription_categories
  FOR DELETE USING (auth.uid() = user_id);

-- Subscription Tags RLS
ALTER TABLE subscription_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own tags" ON subscription_tags
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tags" ON subscription_tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tags" ON subscription_tags
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tags" ON subscription_tags
  FOR DELETE USING (auth.uid() = user_id);

-- Subscription Tag Relations RLS
ALTER TABLE subscription_tag_relations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own tag relations" ON subscription_tag_relations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tag relations" ON subscription_tag_relations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tag relations" ON subscription_tag_relations
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tag relations" ON subscription_tag_relations
  FOR DELETE USING (auth.uid() = user_id);

-- User Analytics RLS
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own analytics" ON user_analytics
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own analytics" ON user_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own analytics" ON user_analytics
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own analytics" ON user_analytics
  FOR DELETE USING (auth.uid() = user_id);

-- User Preferences RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own preferences" ON user_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 10. 함수 및 트리거 생성
-- =====================================================

-- 자동 updated_at 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 기존 트리거 삭제 (있는 경우)
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
DROP TRIGGER IF EXISTS update_subscription_categories_updated_at ON subscription_categories;
DROP TRIGGER IF EXISTS update_user_analytics_updated_at ON user_analytics;
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;

-- 트리거 생성
CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at 
  BEFORE UPDATE ON notifications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_categories_updated_at 
  BEFORE UPDATE ON subscription_categories 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_analytics_updated_at 
  BEFORE UPDATE ON user_analytics 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON user_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 11. 뷰 생성
-- =====================================================

-- 사용자별 구독 통계 뷰 (보안 강화 버전)
-- SECURITY DEFINER 제거하고 RLS에 의존
CREATE OR REPLACE VIEW user_subscription_stats AS
SELECT 
  user_id,
  COUNT(*) as total_subscriptions,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscriptions,
  COUNT(CASE WHEN status = 'paused' THEN 1 END) as paused_subscriptions,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_subscriptions,
  SUM(CASE WHEN currency = 'USD' THEN amount * 1300 ELSE amount END) as total_monthly_krw,
  MAX(created_at) as last_updated
FROM subscriptions
GROUP BY user_id;

-- =====================================================
-- 완료 메시지
-- =====================================================
SELECT 'Database schema updated successfully!' as status; 