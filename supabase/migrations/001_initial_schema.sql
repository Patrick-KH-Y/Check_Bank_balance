-- 자산 대시보드 초기 스키마
-- 2025-08-28

-- pgcrypto 확장 모듈 활성화 (암호화 기능)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 통장/계좌 테이블
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_name VARCHAR(100) NOT NULL,
    account_type VARCHAR(50) NOT NULL, -- 'checking', 'savings', 'investment', 'credit'
    balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'KRW',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 월별 재무 기록 테이블
CREATE TABLE IF NOT EXISTS financial_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    record_type VARCHAR(20) NOT NULL, -- 'income', 'expense', 'savings'
    category VARCHAR(100),
    subcategory VARCHAR(100),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    encrypted_data TEXT, -- 민감한 데이터 암호화 저장
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, year, month, record_type, category)
);

-- 월별 수입 상세 테이블
CREATE TABLE IF NOT EXISTS monthly_income (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    경훈_월급 DECIMAL(15,2) NOT NULL DEFAULT 0,
    선화_월급 DECIMAL(15,2) NOT NULL DEFAULT 0,
    other_income DECIMAL(15,2) DEFAULT 0,
    total_income DECIMAL(15,2) GENERATED ALWAYS AS (경훈_월급 + 선화_월급 + other_income) STORED,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, year, month)
);

-- 월별 지출 상세 테이블
CREATE TABLE IF NOT EXISTS monthly_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    housing DECIMAL(15,2) DEFAULT 0, -- 주거비
    food DECIMAL(15,2) DEFAULT 0, -- 식비
    transportation DECIMAL(15,2) DEFAULT 0, -- 교통비
    utilities DECIMAL(15,2) DEFAULT 0, -- 공과금
    healthcare DECIMAL(15,2) DEFAULT 0, -- 의료비
    entertainment DECIMAL(15,2) DEFAULT 0, -- 여가비
    other_expenses DECIMAL(15,2) DEFAULT 0, -- 기타
    total_expenses DECIMAL(15,2) GENERATED ALWAYS AS (
        housing + food + transportation + utilities + healthcare + entertainment + other_expenses
    ) STORED,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, year, month)
);

-- 공유 링크 테이블
CREATE TABLE IF NOT EXISTS shared_dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    share_token VARCHAR(255) UNIQUE NOT NULL,
    dashboard_data JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_financial_records_user_year_month ON financial_records(user_id, year, month);
CREATE INDEX IF NOT EXISTS idx_monthly_income_user_year_month ON monthly_income(user_id, year, month);
CREATE INDEX IF NOT EXISTS idx_monthly_expenses_user_year_month ON monthly_expenses(user_id, year, month);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_dashboards_token ON shared_dashboards(share_token);

-- RLS (Row Level Security) 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_dashboards ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성
-- 사용자는 자신의 데이터만 접근 가능
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own accounts" ON accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own accounts" ON accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own accounts" ON accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own accounts" ON accounts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own financial records" ON financial_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own financial records" ON financial_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own financial records" ON financial_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own financial records" ON financial_records FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own monthly income" ON monthly_income FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own monthly income" ON monthly_income FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own monthly income" ON monthly_income FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own monthly income" ON monthly_income FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own monthly expenses" ON monthly_expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own monthly expenses" ON monthly_expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own monthly expenses" ON monthly_expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own monthly expenses" ON monthly_expenses FOR DELETE USING (auth.uid() = user_id);

-- 공유 대시보드는 토큰으로만 접근 가능
CREATE POLICY "Shared dashboards are publicly readable" ON shared_dashboards FOR SELECT USING (true);

-- 암호화 함수 생성
CREATE OR REPLACE FUNCTION encrypt_sensitive_data(data TEXT, encryption_key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(encrypt_iv(data::bytea, encryption_key::bytea, gen_random_bytes(16), 'aes-cbc'), 'base64');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrypt_sensitive_data(encrypted_data TEXT, encryption_key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN convert_from(decrypt_iv(decode(encrypted_data, 'base64'), encryption_key::bytea, gen_random_bytes(16), 'aes-cbc'), 'utf8');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 초기 데이터 삽입 (2025년 8월)
INSERT INTO monthly_income (user_id, year, month, 경훈_월급, 선화_월급, other_income)
VALUES (
    (SELECT id FROM users LIMIT 1), -- 첫 번째 사용자 (실제로는 인증된 사용자 ID 사용)
    2025,
    8,
    5000000,
    6000000,
    0
) ON CONFLICT DO NOTHING;

-- 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 업데이트 트리거 생성
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_records_updated_at BEFORE UPDATE ON financial_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_monthly_income_updated_at BEFORE UPDATE ON monthly_income FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_monthly_expenses_updated_at BEFORE UPDATE ON monthly_expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

