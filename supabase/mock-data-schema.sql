-- Supabase SQL Editor에서 실행하세요
-- Mock Data 테이블 생성

-- mock_data 테이블 생성
CREATE TABLE IF NOT EXISTS mock_data (
    id BIGSERIAL PRIMARY KEY,
    data_key VARCHAR(255) NOT NULL UNIQUE,
    data_value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_mock_data_key ON mock_data(data_key);
CREATE INDEX IF NOT EXISTS idx_mock_data_updated_at ON mock_data(updated_at);

-- RLS (Row Level Security) 활성화
ALTER TABLE mock_data ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능하도록 정책 설정 (개발/테스트 목적)
CREATE POLICY "Enable read access for all users" ON mock_data
    FOR SELECT USING (true);

-- 모든 사용자가 쓰기 가능하도록 정책 설정 (개발/테스트 목적)
CREATE POLICY "Enable insert for all users" ON mock_data
    FOR INSERT WITH CHECK (true);

-- 모든 사용자가 업데이트 가능하도록 정책 설정 (개발/테스트 목적)
CREATE POLICY "Enable update for all users" ON mock_data
    FOR UPDATE USING (true);

-- 모든 사용자가 삭제 가능하도록 정책 설정 (개발/테스트 목적)
CREATE POLICY "Enable delete for all users" ON mock_data
    FOR DELETE USING (true);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거 생성
DROP TRIGGER IF EXISTS update_mock_data_updated_at ON mock_data;
CREATE TRIGGER update_mock_data_updated_at
    BEFORE UPDATE ON mock_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 댓글: 이 테이블은 개발 및 테스트 목적으로 모의 데이터를 저장합니다.
COMMENT ON TABLE mock_data IS '개발 및 테스트용 모의 데이터 저장 테이블';
COMMENT ON COLUMN mock_data.data_key IS '데이터 키 (고유값)';
COMMENT ON COLUMN mock_data.data_value IS '데이터 값 (JSON 형태)';