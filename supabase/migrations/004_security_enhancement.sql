-- 보안 강화 마이그레이션
-- 2025-08-31

-- 1. RLS 정책 강화 및 추가 검증

-- 사용자 테이블에 대한 추가 보안 정책
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id AND auth.role() = 'authenticated')
    WITH CHECK (auth.uid() = id AND auth.role() = 'authenticated');

-- 계좌 테이블에 대한 추가 보안 정책
DROP POLICY IF EXISTS "Users can view own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can insert own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can update own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can delete own accounts" ON accounts;

CREATE POLICY "Users can view own accounts" ON accounts
    FOR SELECT USING (auth.uid() = user_id AND auth.role() = 'authenticated');

CREATE POLICY "Users can insert own accounts" ON accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own accounts" ON accounts
    FOR UPDATE USING (auth.uid() = user_id AND auth.role() = 'authenticated')
    WITH CHECK (auth.uid() = user_id AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own accounts" ON accounts
    FOR DELETE USING (auth.uid() = user_id AND auth.role() = 'authenticated');

-- 월별 수입 테이블에 대한 추가 보안 정책
DROP POLICY IF EXISTS "Users can view own monthly income" ON monthly_income;
DROP POLICY IF EXISTS "Users can insert own monthly income" ON monthly_income;
DROP POLICY IF EXISTS "Users can update own monthly income" ON monthly_income;
DROP POLICY IF EXISTS "Users can delete own monthly income" ON monthly_income;

CREATE POLICY "Users can view own monthly income" ON monthly_income
    FOR SELECT USING (auth.uid() = user_id AND auth.role() = 'authenticated');

CREATE POLICY "Users can insert own monthly income" ON monthly_income
    FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own monthly income" ON monthly_income
    FOR UPDATE USING (auth.uid() = user_id AND auth.role() = 'authenticated')
    WITH CHECK (auth.uid() = user_id AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own monthly income" ON monthly_income
    FOR DELETE USING (auth.uid() = user_id AND auth.role() = 'authenticated');

-- 월별 지출 테이블에 대한 추가 보안 정책
DROP POLICY IF EXISTS "Users can view own monthly expenses" ON monthly_expenses;
DROP POLICY IF EXISTS "Users can insert own monthly expenses" ON monthly_expenses;
DROP POLICY IF EXISTS "Users can update own monthly expenses" ON monthly_expenses;
DROP POLICY IF EXISTS "Users can delete own monthly expenses" ON monthly_expenses;

CREATE POLICY "Users can view own monthly expenses" ON monthly_expenses
    FOR SELECT USING (auth.uid() = user_id AND auth.role() = 'authenticated');

CREATE POLICY "Users can insert own monthly expenses" ON monthly_expenses
    FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own monthly expenses" ON monthly_expenses
    FOR UPDATE USING (auth.uid() = user_id AND auth.role() = 'authenticated')
    WITH CHECK (auth.uid() = user_id AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own monthly expenses" ON monthly_expenses
    FOR DELETE USING (auth.uid() = user_id AND auth.role() = 'authenticated');

-- 월별 저축 테이블에 대한 추가 보안 정책
DROP POLICY IF EXISTS "Users can view own monthly savings" ON monthly_savings;
DROP POLICY IF EXISTS "Users can insert own monthly savings" ON monthly_savings;
DROP POLICY IF EXISTS "Users can update own monthly savings" ON monthly_savings;
DROP POLICY IF EXISTS "Users can delete own monthly savings" ON monthly_savings;

CREATE POLICY "Users can view own monthly savings" ON monthly_savings
    FOR SELECT USING (auth.uid() = user_id AND auth.role() = 'authenticated');

CREATE POLICY "Users can insert own monthly savings" ON monthly_savings
    FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own monthly savings" ON monthly_savings
    FOR UPDATE USING (auth.uid() = user_id AND auth.role() = 'authenticated')
    WITH CHECK (auth.uid() = user_id AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own monthly savings" ON monthly_savings
    FOR DELETE USING (auth.uid() = user_id AND auth.role() = 'authenticated');

-- 저축 목표 테이블에 대한 추가 보안 정책
DROP POLICY IF EXISTS "Users can view own savings goals" ON savings_goals;
DROP POLICY IF EXISTS "Users can insert own savings goals" ON savings_goals;
DROP POLICY IF EXISTS "Users can update own savings goals" ON savings_goals;
DROP POLICY IF EXISTS "Users can delete own savings goals" ON savings_goals;

CREATE POLICY "Users can view own savings goals" ON savings_goals
    FOR SELECT USING (auth.uid() = user_id AND auth.role() = 'authenticated');

CREATE POLICY "Users can insert own savings goals" ON savings_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own savings goals" ON savings_goals
    FOR UPDATE USING (auth.uid() = user_id AND auth.role() = 'authenticated')
    WITH CHECK (auth.uid() = user_id AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own savings goals" ON savings_goals
    FOR DELETE USING (auth.uid() = user_id AND auth.role() = 'authenticated');

-- 2. 데이터 변경 이력 추적을 위한 감사 테이블 생성

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 감사 로그 테이블에 대한 RLS 정책
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs" ON audit_logs
    FOR SELECT USING (auth.uid() = user_id AND auth.role() = 'authenticated');

-- 감사 로그 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- 3. 데이터 변경 감사 트리거 함수 생성

CREATE OR REPLACE FUNCTION audit_table_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_old_values JSONB;
    v_new_values JSONB;
    v_user_id UUID;
BEGIN
    -- 현재 사용자 ID 가져오기
    v_user_id := auth.uid();
    
    -- 사용자가 인증되지 않은 경우 감사 로그 생성하지 않음
    IF v_user_id IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;
    
    -- OLD와 NEW 값 준비
    IF TG_OP = 'DELETE' THEN
        v_old_values := to_jsonb(OLD);
        v_new_values := NULL;
    ELSIF TG_OP = 'UPDATE' THEN
        v_old_values := to_jsonb(OLD);
        v_new_values := to_jsonb(NEW);
    ELSIF TG_OP = 'INSERT' THEN
        v_old_values := NULL;
        v_new_values := to_jsonb(NEW);
    END IF;
    
    -- 감사 로그 삽입
    INSERT INTO audit_logs (
        user_id,
        table_name,
        record_id,
        action,
        old_values,
        new_values
    ) VALUES (
        v_user_id,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        v_old_values,
        v_new_values
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 감사 트리거 생성

-- 계좌 테이블 감사 트리거
DROP TRIGGER IF EXISTS audit_accounts_changes ON accounts;
CREATE TRIGGER audit_accounts_changes
    AFTER INSERT OR UPDATE OR DELETE ON accounts
    FOR EACH ROW EXECUTE FUNCTION audit_table_changes();

-- 월별 수입 테이블 감사 트리거
DROP TRIGGER IF EXISTS audit_monthly_income_changes ON monthly_income;
CREATE TRIGGER audit_monthly_income_changes
    AFTER INSERT OR UPDATE OR DELETE ON monthly_income
    FOR EACH ROW EXECUTE FUNCTION audit_table_changes();

-- 월별 지출 테이블 감사 트리거
DROP TRIGGER IF EXISTS audit_monthly_expenses_changes ON monthly_expenses;
CREATE TRIGGER audit_monthly_expenses_changes
    AFTER INSERT OR UPDATE OR DELETE ON monthly_expenses
    FOR EACH ROW EXECUTE FUNCTION audit_table_changes();

-- 월별 저축 테이블 감사 트리거
DROP TRIGGER IF EXISTS audit_monthly_savings_changes ON monthly_savings;
CREATE TRIGGER audit_monthly_savings_changes
    AFTER INSERT OR UPDATE OR DELETE ON monthly_savings
    FOR EACH ROW EXECUTE FUNCTION audit_table_changes();

-- 저축 목표 테이블 감사 트리거
DROP TRIGGER IF EXISTS audit_savings_goals_changes ON savings_goals;
CREATE TRIGGER audit_savings_goals_changes
    AFTER INSERT OR UPDATE OR DELETE ON savings_goals
    FOR EACH ROW EXECUTE FUNCTION audit_table_changes();

-- 5. 암호화 키 관리 개선

-- 암호화 키 테이블 생성 (실제 운영환경에서는 더 안전한 방법 사용)
CREATE TABLE IF NOT EXISTS encryption_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_name VARCHAR(100) UNIQUE NOT NULL,
    encrypted_key TEXT NOT NULL,
    key_version INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- 암호화 키 테이블에 대한 RLS 정책
ALTER TABLE encryption_keys ENABLE ROW LEVEL SECURITY;

-- 관리자만 암호화 키에 접근 가능
CREATE POLICY "Only admins can access encryption keys" ON encryption_keys
    FOR ALL USING (auth.role() = 'service_role');

-- 6. 입력 데이터 검증 함수 생성

-- 금액 검증 함수
CREATE OR REPLACE FUNCTION validate_amount(amount DECIMAL(15,2))
RETURNS BOOLEAN AS $$
BEGIN
    -- 금액이 음수이거나 너무 큰 값인지 검증
    IF amount < 0 OR amount > 999999999999.99 THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 날짜 검증 함수
CREATE OR REPLACE FUNCTION validate_date(year INTEGER, month INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    -- 년도와 월이 유효한 범위인지 검증
    IF year < 1900 OR year > 2100 OR month < 1 OR month > 12 THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 문자열 검증 함수 (XSS 방지)
CREATE OR REPLACE FUNCTION sanitize_text(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    -- HTML 태그 제거 및 특수 문자 이스케이프
    RETURN regexp_replace(
        regexp_replace(input_text, '<[^>]*>', '', 'g'),
        '[<>"\''&]',
        '',
        'g'
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 7. 보안 강화된 트리거 함수 업데이트

-- 계좌 생성/수정 시 검증
CREATE OR REPLACE FUNCTION validate_account_data()
RETURNS TRIGGER AS $$
BEGIN
    -- 금액 검증
    IF NOT validate_amount(NEW.balance) THEN
        RAISE EXCEPTION 'Invalid balance amount';
    END IF;
    
    -- 계좌명 Sanitization
    NEW.account_name := sanitize_text(NEW.account_name);
    
    -- 계좌 유형 검증
    IF NEW.account_type NOT IN ('checking', 'savings', 'investment', 'credit') THEN
        RAISE EXCEPTION 'Invalid account type';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 계좌 검증 트리거
DROP TRIGGER IF EXISTS validate_account_data_trigger ON accounts;
CREATE TRIGGER validate_account_data_trigger
    BEFORE INSERT OR UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION validate_account_data();

-- 8. 세션 관리 및 보안 강화

-- 비활성 세션 정리 함수
CREATE OR REPLACE FUNCTION cleanup_inactive_sessions()
RETURNS void AS $$
BEGIN
    -- 24시간 이상 비활성인 세션 정리
    DELETE FROM auth.sessions 
    WHERE updated_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 정기적인 세션 정리를 위한 스케줄 (PostgreSQL 13+ 필요)
-- SELECT cron.schedule('cleanup-sessions', '0 2 * * *', 'SELECT cleanup_inactive_sessions();');

-- 9. 보안 모니터링 뷰 생성

-- 보안 이벤트 요약 뷰
CREATE OR REPLACE VIEW security_events_summary AS
SELECT 
    DATE(created_at) as event_date,
    action,
    table_name,
    COUNT(*) as event_count,
    COUNT(DISTINCT user_id) as unique_users
FROM audit_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), action, table_name
ORDER BY event_date DESC, event_count DESC;

-- 의심스러운 활동 감지 뷰
CREATE OR REPLACE VIEW suspicious_activity AS
SELECT 
    user_id,
    COUNT(*) as action_count,
    COUNT(DISTINCT table_name) as tables_affected,
    MIN(created_at) as first_action,
    MAX(created_at) as last_action
FROM audit_logs
WHERE created_at >= NOW() - INTERVAL '1 hour'
GROUP BY user_id
HAVING COUNT(*) > 100; -- 1시간 내 100개 이상의 액션

-- 10. 성능 최적화를 위한 인덱스 추가

-- 감사 로그 성능 최적화
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action_time ON audit_logs(user_id, action, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_action_time ON audit_logs(table_name, action, created_at);

-- 보안 검색을 위한 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_audit_logs_security_search ON audit_logs(user_id, table_name, action, created_at);

-- 마이그레이션 완료 로그
INSERT INTO audit_logs (user_id, table_name, record_id, action, new_values)
VALUES (
    (SELECT id FROM users LIMIT 1),
    'migration',
    gen_random_uuid(),
    'INSERT',
    '{"migration": "004_security_enhancement", "status": "completed"}'
) ON CONFLICT DO NOTHING;

