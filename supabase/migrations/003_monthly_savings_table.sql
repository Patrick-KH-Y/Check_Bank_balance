-- 월별 저축 현황 테이블 생성
-- 2025-08-31

-- 월별 저축 상세 테이블
CREATE TABLE IF NOT EXISTS monthly_savings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    target_amount DECIMAL(15,2) NOT NULL DEFAULT 0, -- 목표 저축액
    actual_amount DECIMAL(15,2) NOT NULL DEFAULT 0, -- 실제 저축액
    savings_type VARCHAR(50) NOT NULL DEFAULT 'regular', -- 'regular', 'emergency', 'investment', 'goal'
    category VARCHAR(100), -- '주택', '교육', '여행', '기타' 등
    description TEXT,
    is_achieved BOOLEAN DEFAULT false, -- 목표 달성 여부
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, year, month, account_id, savings_type)
);

-- 저축 목표 테이블 (장기 목표 관리)
CREATE TABLE IF NOT EXISTS savings_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_name VARCHAR(100) NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) DEFAULT 0,
    target_date DATE,
    goal_type VARCHAR(50) NOT NULL DEFAULT 'short_term', -- 'short_term', 'medium_term', 'long_term'
    priority INTEGER DEFAULT 1, -- 1: 높음, 2: 보통, 3: 낮음
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 저축 통계 뷰 생성
CREATE OR REPLACE VIEW savings_summary AS
SELECT 
    ms.user_id,
    ms.year,
    ms.month,
    COUNT(ms.id) as total_savings_entries,
    SUM(ms.target_amount) as total_target_amount,
    SUM(ms.actual_amount) as total_actual_amount,
    AVG(ms.actual_amount) as average_savings,
    SUM(CASE WHEN ms.is_achieved THEN 1 ELSE 0 END) as achieved_goals,
    (SUM(ms.actual_amount) / NULLIF(SUM(ms.target_amount), 0) * 100) as achievement_rate
FROM monthly_savings ms
GROUP BY ms.user_id, ms.year, ms.month;

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_monthly_savings_user_year_month ON monthly_savings(user_id, year, month);
CREATE INDEX IF NOT EXISTS idx_monthly_savings_account_id ON monthly_savings(account_id);
CREATE INDEX IF NOT EXISTS idx_monthly_savings_type ON monthly_savings(savings_type);
CREATE INDEX IF NOT EXISTS idx_monthly_savings_achieved ON monthly_savings(is_achieved);
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_goals_active ON savings_goals(is_active);

-- RLS 활성화
ALTER TABLE monthly_savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성
-- 월별 저축 데이터
CREATE POLICY "Users can view own monthly savings" ON monthly_savings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own monthly savings" ON monthly_savings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own monthly savings" ON monthly_savings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own monthly savings" ON monthly_savings
    FOR DELETE USING (auth.uid() = user_id);

-- 저축 목표
CREATE POLICY "Users can view own savings goals" ON savings_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own savings goals" ON savings_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own savings goals" ON savings_goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own savings goals" ON savings_goals
    FOR DELETE USING (auth.uid() = user_id);

-- 업데이트 트리거 생성
CREATE TRIGGER update_monthly_savings_updated_at 
    BEFORE UPDATE ON monthly_savings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_savings_goals_updated_at 
    BEFORE UPDATE ON savings_goals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 저축 달성률 계산 함수
CREATE OR REPLACE FUNCTION calculate_savings_achievement_rate(
    p_user_id UUID,
    p_year INTEGER,
    p_month INTEGER
)
RETURNS DECIMAL(5,2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_target_amount DECIMAL(15,2);
    v_actual_amount DECIMAL(15,2);
    v_achievement_rate DECIMAL(5,2);
BEGIN
    SELECT 
        COALESCE(SUM(target_amount), 0),
        COALESCE(SUM(actual_amount), 0)
    INTO v_target_amount, v_actual_amount
    FROM monthly_savings
    WHERE user_id = p_user_id AND year = p_year AND month = p_month;
    
    IF v_target_amount > 0 THEN
        v_achievement_rate := (v_actual_amount / v_target_amount) * 100;
    ELSE
        v_achievement_rate := 0;
    END IF;
    
    RETURN v_achievement_rate;
END;
$$;

-- 저축 통계 집계 함수
CREATE OR REPLACE FUNCTION get_savings_statistics(
    p_user_id UUID,
    p_year INTEGER,
    p_month INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSONB;
    v_monthly_savings RECORD;
    v_goals_summary RECORD;
BEGIN
    -- 월별 저축 요약
    SELECT * INTO v_monthly_savings
    FROM savings_summary
    WHERE user_id = p_user_id AND year = p_year AND month = p_month;
    
    -- 저축 목표 요약
    SELECT 
        COUNT(*) as total_goals,
        COUNT(CASE WHEN is_active THEN 1 END) as active_goals,
        SUM(target_amount) as total_target,
        SUM(current_amount) as total_current
    INTO v_goals_summary
    FROM savings_goals
    WHERE user_id = p_user_id AND is_active = true;
    
    v_result := jsonb_build_object(
        'monthly_summary', v_monthly_savings,
        'goals_summary', v_goals_summary,
        'achievement_rate', calculate_savings_achievement_rate(p_user_id, p_year, p_month),
        'generated_at', NOW()
    );
    
    RETURN v_result;
END;
$$;

