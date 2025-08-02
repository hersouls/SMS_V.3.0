-- =====================================================
-- 통계 테이블 Unique Constraint 수정 스크립트
-- =====================================================

-- 1. 기존 테이블이 있다면 삭제 (주의: 데이터 손실)
DROP TABLE IF EXISTS subscription_statistics CASCADE;
DROP TABLE IF EXISTS category_analytics CASCADE;
DROP TABLE IF EXISTS payment_cycle_analytics CASCADE;
DROP TABLE IF EXISTS tag_analytics CASCADE;
DROP TABLE IF EXISTS monthly_spending_trends CASCADE;
DROP TABLE IF EXISTS notification_analytics CASCADE;
DROP TABLE IF EXISTS subscription_lifecycle_analytics CASCADE;
DROP TABLE IF EXISTS user_behavior_analytics CASCADE;

-- 2. 테이블 재생성
CREATE TABLE subscription_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- 기본 통계
  monthly_amount_krw DECIMAL(10,2) DEFAULT 0,
  yearly_amount_krw DECIMAL(10,2) DEFAULT 0,
  total_paid_krw DECIMAL(10,2) DEFAULT 0,
  
  -- 카테고리별 통계
  category VARCHAR(100),
  category_rank INTEGER,
  category_percentage DECIMAL(5,2),
  
  -- 결제 주기별 통계
  payment_cycle VARCHAR(20),
  cycle_rank INTEGER,
  cycle_percentage DECIMAL(5,2),
  
  -- 상태별 통계
  status VARCHAR(20),
  days_active INTEGER DEFAULT 0,
  days_paused INTEGER DEFAULT 0,
  
  -- 통화별 통계
  currency VARCHAR(3),
  exchange_rate DECIMAL(10,4),
  
  -- 태그별 통계
  tags_count INTEGER DEFAULT 0,
  popular_tags JSONB DEFAULT '[]',
  
  -- 알림 통계
  notification_count INTEGER DEFAULT 0,
  notification_types JSONB DEFAULT '{}',
  
  -- 메타데이터
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, subscription_id, date)
);

CREATE TABLE category_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  
  -- 카테고리별 통계
  subscription_count INTEGER DEFAULT 0,
  active_count INTEGER DEFAULT 0,
  paused_count INTEGER DEFAULT 0,
  cancelled_count INTEGER DEFAULT 0,
  
  -- 금액 통계
  total_monthly_krw DECIMAL(10,2) DEFAULT 0,
  total_yearly_krw DECIMAL(10,2) DEFAULT 0,
  average_monthly_krw DECIMAL(10,2) DEFAULT 0,
  max_monthly_krw DECIMAL(10,2) DEFAULT 0,
  min_monthly_krw DECIMAL(10,2) DEFAULT 0,
  
  -- 결제 주기별 분포
  monthly_count INTEGER DEFAULT 0,
  yearly_count INTEGER DEFAULT 0,
  onetime_count INTEGER DEFAULT 0,
  
  -- 통화별 분포
  krw_count INTEGER DEFAULT 0,
  usd_count INTEGER DEFAULT 0,
  
  -- 성장률
  growth_rate DECIMAL(5,2) DEFAULT 0,
  previous_month_amount DECIMAL(10,2) DEFAULT 0,
  
  -- 메타데이터
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, category, date)
);

CREATE TABLE payment_cycle_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_cycle VARCHAR(20) NOT NULL,
  date DATE NOT NULL,
  
  -- 결제주기별 통계
  subscription_count INTEGER DEFAULT 0,
  active_count INTEGER DEFAULT 0,
  total_monthly_krw DECIMAL(10,2) DEFAULT 0,
  total_yearly_krw DECIMAL(10,2) DEFAULT 0,
  average_amount_krw DECIMAL(10,2) DEFAULT 0,
  
  -- 카테고리별 분포
  category_breakdown JSONB DEFAULT '{}',
  
  -- 통화별 분포
  currency_breakdown JSONB DEFAULT '{}',
  
  -- 성장률
  growth_rate DECIMAL(5,2) DEFAULT 0,
  previous_month_count INTEGER DEFAULT 0,
  
  -- 메타데이터
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, payment_cycle, date)
);

CREATE TABLE tag_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tag_name VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  
  -- 태그별 통계
  subscription_count INTEGER DEFAULT 0,
  active_count INTEGER DEFAULT 0,
  total_monthly_krw DECIMAL(10,2) DEFAULT 0,
  average_amount_krw DECIMAL(10,2) DEFAULT 0,
  
  -- 카테고리별 분포
  category_breakdown JSONB DEFAULT '{}',
  
  -- 결제주기별 분포
  cycle_breakdown JSONB DEFAULT '{}',
  
  -- 인기도 순위
  popularity_rank INTEGER,
  popularity_score DECIMAL(5,2) DEFAULT 0,
  
  -- 메타데이터
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, tag_name, date)
);

CREATE TABLE monthly_spending_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  
  -- 월별 지출 통계
  total_spend_krw DECIMAL(10,2) DEFAULT 0,
  active_subscriptions INTEGER DEFAULT 0,
  new_subscriptions INTEGER DEFAULT 0,
  cancelled_subscriptions INTEGER DEFAULT 0,
  paused_subscriptions INTEGER DEFAULT 0,
  
  -- 카테고리별 지출
  category_spending JSONB DEFAULT '{}',
  
  -- 결제주기별 지출
  cycle_spending JSONB DEFAULT '{}',
  
  -- 통화별 지출
  currency_spending JSONB DEFAULT '{}',
  
  -- 변화율
  month_over_month_change DECIMAL(5,2) DEFAULT 0,
  year_over_year_change DECIMAL(5,2) DEFAULT 0,
  
  -- 예측 데이터
  predicted_next_month DECIMAL(10,2) DEFAULT 0,
  trend_direction VARCHAR(10) DEFAULT 'stable',
  
  -- 메타데이터
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, year, month)
);

CREATE TABLE notification_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- 알림 설정 통계
  total_subscriptions INTEGER DEFAULT 0,
  seven_days_enabled INTEGER DEFAULT 0,
  three_days_enabled INTEGER DEFAULT 0,
  same_day_enabled INTEGER DEFAULT 0,
  
  -- 알림 효과성
  notifications_sent INTEGER DEFAULT 0,
  notifications_read INTEGER DEFAULT 0,
  notifications_clicked INTEGER DEFAULT 0,
  
  -- 알림 타입별 통계
  payment_reminders INTEGER DEFAULT 0,
  renewal_notifications INTEGER DEFAULT 0,
  expiry_warnings INTEGER DEFAULT 0,
  
  -- 응답률
  response_rate DECIMAL(5,2) DEFAULT 0,
  engagement_score DECIMAL(5,2) DEFAULT 0,
  
  -- 메타데이터
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

CREATE TABLE user_behavior_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- 사용자 행동 통계
  login_count INTEGER DEFAULT 0,
  subscription_views INTEGER DEFAULT 0,
  subscription_edits INTEGER DEFAULT 0,
  subscription_adds INTEGER DEFAULT 0,
  subscription_deletes INTEGER DEFAULT 0,
  
  -- 기능 사용 통계
  dashboard_views INTEGER DEFAULT 0,
  calendar_views INTEGER DEFAULT 0,
  settings_views INTEGER DEFAULT 0,
  notification_views INTEGER DEFAULT 0,
  
  -- 세션 통계
  session_duration_minutes INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  unique_pages_visited INTEGER DEFAULT 0,
  
  -- 사용자 선호도
  preferred_categories JSONB DEFAULT '[]',
  preferred_payment_cycles JSONB DEFAULT '[]',
  preferred_currencies JSONB DEFAULT '[]',
  
  -- 사용자 만족도
  satisfaction_score DECIMAL(3,2) DEFAULT 0,
  engagement_score DECIMAL(5,2) DEFAULT 0,
  
  -- 메타데이터
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- 3. 인덱스 생성
CREATE INDEX idx_subscription_statistics_user_id ON subscription_statistics(user_id);
CREATE INDEX idx_subscription_statistics_subscription_id ON subscription_statistics(subscription_id);
CREATE INDEX idx_subscription_statistics_date ON subscription_statistics(date);
CREATE INDEX idx_subscription_statistics_category ON subscription_statistics(category);
CREATE INDEX idx_subscription_statistics_status ON subscription_statistics(status);

CREATE INDEX idx_category_analytics_user_id ON category_analytics(user_id);
CREATE INDEX idx_category_analytics_category ON category_analytics(category);
CREATE INDEX idx_category_analytics_date ON category_analytics(date);

CREATE INDEX idx_payment_cycle_analytics_user_id ON payment_cycle_analytics(user_id);
CREATE INDEX idx_payment_cycle_analytics_payment_cycle ON payment_cycle_analytics(payment_cycle);
CREATE INDEX idx_payment_cycle_analytics_date ON payment_cycle_analytics(date);

CREATE INDEX idx_tag_analytics_user_id ON tag_analytics(user_id);
CREATE INDEX idx_tag_analytics_tag_name ON tag_analytics(tag_name);
CREATE INDEX idx_tag_analytics_date ON tag_analytics(date);
CREATE INDEX idx_tag_analytics_popularity_rank ON tag_analytics(popularity_rank);

CREATE INDEX idx_monthly_spending_trends_user_id ON monthly_spending_trends(user_id);
CREATE INDEX idx_monthly_spending_trends_year_month ON monthly_spending_trends(year, month);

CREATE INDEX idx_notification_analytics_user_id ON notification_analytics(user_id);
CREATE INDEX idx_notification_analytics_date ON notification_analytics(date);

CREATE INDEX idx_user_behavior_analytics_user_id ON user_behavior_analytics(user_id);
CREATE INDEX idx_user_behavior_analytics_date ON user_behavior_analytics(date);

-- 4. RLS 정책 설정
ALTER TABLE subscription_statistics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own subscription statistics" ON subscription_statistics
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own subscription statistics" ON subscription_statistics
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own subscription statistics" ON subscription_statistics
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own subscription statistics" ON subscription_statistics
  FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE category_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own category analytics" ON category_analytics
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own category analytics" ON category_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own category analytics" ON category_analytics
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own category analytics" ON category_analytics
  FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE payment_cycle_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own payment cycle analytics" ON payment_cycle_analytics
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own payment cycle analytics" ON payment_cycle_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own payment cycle analytics" ON payment_cycle_analytics
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own payment cycle analytics" ON payment_cycle_analytics
  FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE tag_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own tag analytics" ON tag_analytics
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tag analytics" ON tag_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tag analytics" ON tag_analytics
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tag analytics" ON tag_analytics
  FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE monthly_spending_trends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own monthly spending trends" ON monthly_spending_trends
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own monthly spending trends" ON monthly_spending_trends
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own monthly spending trends" ON monthly_spending_trends
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own monthly spending trends" ON monthly_spending_trends
  FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE notification_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notification analytics" ON notification_analytics
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own notification analytics" ON notification_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notification analytics" ON notification_analytics
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notification analytics" ON notification_analytics
  FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE user_behavior_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own user behavior analytics" ON user_behavior_analytics
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own user behavior analytics" ON user_behavior_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own user behavior analytics" ON user_behavior_analytics
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own user behavior analytics" ON user_behavior_analytics
  FOR DELETE USING (auth.uid() = user_id);

-- 5. 완료 메시지
SELECT 'Statistics tables recreated successfully with proper constraints!' as status; 