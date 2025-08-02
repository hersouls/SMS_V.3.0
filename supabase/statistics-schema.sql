-- =====================================================
-- Moonwave SMS V2.0 통계 시스템 스키마
-- 포괄적인 통계 분석을 위한 추가 테이블들
-- =====================================================

-- =====================================================
-- 1. SUBSCRIPTION_STATISTICS 테이블 (상세 통계)
-- =====================================================
CREATE TABLE IF NOT EXISTS subscription_statistics (
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

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_subscription_statistics_user_id ON subscription_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_statistics_subscription_id ON subscription_statistics(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_statistics_date ON subscription_statistics(date);
CREATE INDEX IF NOT EXISTS idx_subscription_statistics_category ON subscription_statistics(category);
CREATE INDEX IF NOT EXISTS idx_subscription_statistics_status ON subscription_statistics(status);

-- =====================================================
-- 2. CATEGORY_ANALYTICS 테이블 (카테고리별 분석)
-- =====================================================
CREATE TABLE IF NOT EXISTS category_analytics (
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

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_category_analytics_user_id ON category_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_category_analytics_category ON category_analytics(category);
CREATE INDEX IF NOT EXISTS idx_category_analytics_date ON category_analytics(date);

-- =====================================================
-- 3. PAYMENT_CYCLE_ANALYTICS 테이블 (결제주기별 분석)
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_cycle_analytics (
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

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_payment_cycle_analytics_user_id ON payment_cycle_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_cycle_analytics_payment_cycle ON payment_cycle_analytics(payment_cycle);
CREATE INDEX IF NOT EXISTS idx_payment_cycle_analytics_date ON payment_cycle_analytics(date);

-- =====================================================
-- 4. TAG_ANALYTICS 테이블 (태그별 분석)
-- =====================================================
CREATE TABLE IF NOT EXISTS tag_analytics (
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

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_tag_analytics_user_id ON tag_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_tag_analytics_tag_name ON tag_analytics(tag_name);
CREATE INDEX IF NOT EXISTS idx_tag_analytics_date ON tag_analytics(date);
CREATE INDEX IF NOT EXISTS idx_tag_analytics_popularity_rank ON tag_analytics(popularity_rank);

-- =====================================================
-- 5. MONTHLY_SPENDING_TRENDS 테이블 (월별 지출 트렌드)
-- =====================================================
CREATE TABLE IF NOT EXISTS monthly_spending_trends (
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

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_monthly_spending_trends_user_id ON monthly_spending_trends(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_spending_trends_year_month ON monthly_spending_trends(year, month);

-- =====================================================
-- 6. NOTIFICATION_ANALYTICS 테이블 (알림 분석)
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_analytics (
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

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_notification_analytics_user_id ON notification_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_analytics_date ON notification_analytics(date);

-- =====================================================
-- 7. SUBSCRIPTION_LIFECYCLE_ANALYTICS 테이블 (구독 생명주기 분석)
-- =====================================================
CREATE TABLE IF NOT EXISTS subscription_lifecycle_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  
  -- 생명주기 통계
  created_date DATE NOT NULL,
  first_payment_date DATE,
  last_payment_date DATE,
  cancelled_date DATE,
  paused_date DATE,
  resumed_date DATE,
  
  -- 기간 통계
  total_days INTEGER DEFAULT 0,
  active_days INTEGER DEFAULT 0,
  paused_days INTEGER DEFAULT 0,
  
  -- 결제 통계
  total_payments INTEGER DEFAULT 0,
  total_amount_paid DECIMAL(10,2) DEFAULT 0,
  average_payment_amount DECIMAL(10,2) DEFAULT 0,
  
  -- 상태 변화 이력
  status_changes JSONB DEFAULT '[]',
  
  -- 수익성 분석
  roi_score DECIMAL(5,2) DEFAULT 0,
  value_score DECIMAL(5,2) DEFAULT 0,
  
  -- 메타데이터
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, subscription_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_subscription_lifecycle_analytics_user_id ON subscription_lifecycle_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_lifecycle_analytics_subscription_id ON subscription_lifecycle_analytics(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_lifecycle_analytics_created_date ON subscription_lifecycle_analytics(created_date);

-- =====================================================
-- 8. USER_BEHAVIOR_ANALYTICS 테이블 (사용자 행동 분석)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_behavior_analytics (
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

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_behavior_analytics_user_id ON user_behavior_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_analytics_date ON user_behavior_analytics(date);

-- =====================================================
-- 9. ROW LEVEL SECURITY (RLS) 설정
-- =====================================================

-- 통계 테이블들에 대한 RLS 정책 생성
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

ALTER TABLE subscription_lifecycle_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own subscription lifecycle analytics" ON subscription_lifecycle_analytics
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own subscription lifecycle analytics" ON subscription_lifecycle_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own subscription lifecycle analytics" ON subscription_lifecycle_analytics
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own subscription lifecycle analytics" ON subscription_lifecycle_analytics
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

-- =====================================================
-- 10. 통계 업데이트 트리거 함수들
-- =====================================================

-- 구독 통계 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_subscription_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- 구독이 추가/수정/삭제될 때 통계 테이블들 업데이트
  -- 이 함수는 구독 데이터가 변경될 때마다 호출됨
  
  -- 1. subscription_statistics 테이블 업데이트
  INSERT INTO subscription_statistics (
    user_id, subscription_id, date, monthly_amount_krw, yearly_amount_krw,
    category, status, currency, tags_count
  )
  VALUES (
    NEW.user_id, NEW.id, CURRENT_DATE,
    CASE WHEN NEW.currency = 'USD' THEN NEW.amount * 1300 ELSE NEW.amount END,
    CASE WHEN NEW.payment_cycle = 'yearly' THEN 
      CASE WHEN NEW.currency = 'USD' THEN NEW.amount * 1300 ELSE NEW.amount END
    ELSE 
      CASE WHEN NEW.currency = 'USD' THEN NEW.amount * 1300 * 12 ELSE NEW.amount * 12 END
    END,
    NEW.category, NEW.status, NEW.currency,
    array_length(NEW.tags, 1)
  )
  ON CONFLICT (user_id, subscription_id, date) 
  DO UPDATE SET
    monthly_amount_krw = EXCLUDED.monthly_amount_krw,
    yearly_amount_krw = EXCLUDED.yearly_amount_krw,
    category = EXCLUDED.category,
    status = EXCLUDED.status,
    currency = EXCLUDED.currency,
    tags_count = EXCLUDED.tags_count,
    updated_at = NOW();
  
  -- 2. category_analytics 테이블 업데이트
  INSERT INTO category_analytics (
    user_id, category, date, subscription_count, active_count,
    total_monthly_krw, total_yearly_krw
  )
  SELECT 
    NEW.user_id, NEW.category, CURRENT_DATE,
    COUNT(*), COUNT(CASE WHEN status = 'active' THEN 1 END),
    SUM(CASE WHEN currency = 'USD' THEN amount * 1300 ELSE amount END),
    SUM(CASE WHEN payment_cycle = 'yearly' THEN 
      CASE WHEN currency = 'USD' THEN amount * 1300 ELSE amount END
    ELSE 
      CASE WHEN currency = 'USD' THEN amount * 1300 * 12 ELSE amount * 12 END
    END)
  FROM subscriptions 
  WHERE user_id = NEW.user_id AND category = NEW.category
  ON CONFLICT (user_id, category, date) 
  DO UPDATE SET
    subscription_count = EXCLUDED.subscription_count,
    active_count = EXCLUDED.active_count,
    total_monthly_krw = EXCLUDED.total_monthly_krw,
    total_yearly_krw = EXCLUDED.total_yearly_krw,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 구독 변경 시 통계 업데이트 트리거
CREATE TRIGGER trigger_update_subscription_statistics
  AFTER INSERT OR UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_subscription_statistics();

-- =====================================================
-- 11. 통계 뷰 생성
-- =====================================================

-- 종합 통계 대시보드 뷰
CREATE OR REPLACE VIEW comprehensive_statistics_dashboard AS
SELECT 
  ua.user_id,
  ua.date,
  ua.total_spend_krw,
  ua.active_subscriptions,
  ua.new_subscriptions,
  ua.cancelled_subscriptions,
  ua.category_breakdown,
  ua.currency_breakdown,
  
  -- 카테고리별 상세 통계
  ca.category,
  ca.total_monthly_krw as category_monthly_spend,
  ca.subscription_count as category_subscription_count,
  
  -- 결제주기별 통계
  pca.payment_cycle,
  pca.total_monthly_krw as cycle_monthly_spend,
  pca.subscription_count as cycle_subscription_count,
  
  -- 알림 통계
  na.notifications_sent,
  na.response_rate,
  
  -- 사용자 행동 통계
  uba.login_count,
  uba.session_duration_minutes,
  uba.engagement_score
  
FROM user_analytics ua
LEFT JOIN category_analytics ca ON ua.user_id = ca.user_id AND ua.date = ca.date
LEFT JOIN payment_cycle_analytics pca ON ua.user_id = pca.user_id AND ua.date = pca.date
LEFT JOIN notification_analytics na ON ua.user_id = na.user_id AND ua.date = na.date
LEFT JOIN user_behavior_analytics uba ON ua.user_id = uba.user_id AND ua.date = uba.date;

-- =====================================================
-- 완료 메시지
-- =====================================================
SELECT 'Statistics schema created successfully!' as status; 