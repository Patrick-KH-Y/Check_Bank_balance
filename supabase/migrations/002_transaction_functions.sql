-- 데이터 저장 및 동기화 로직 개선을 위한 트랜잭션 함수들
-- 2025-08-31

-- 월별 수입 데이터 트랜잭션 저장 함수
CREATE OR REPLACE FUNCTION upsert_monthly_income_transaction(
  p_user_id UUID,
  p_year INTEGER,
  p_month INTEGER,
  p_경훈_월급 DECIMAL(15,2),
  p_선화_월급 DECIMAL(15,2),
  p_other_income DECIMAL(15,2) DEFAULT 0,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_existing_id UUID;
  v_total_income DECIMAL(15,2);
BEGIN
  -- 트랜잭션 시작
  BEGIN
    -- 기존 데이터 확인
    SELECT id INTO v_existing_id
    FROM monthly_income
    WHERE user_id = p_user_id AND year = p_year AND month = p_month;
    
    -- 총 수입 계산
    v_total_income := p_경훈_월급 + p_선화_월급 + p_other_income;
    
    IF v_existing_id IS NOT NULL THEN
      -- 기존 데이터 업데이트
      UPDATE monthly_income
      SET 
        경훈_월급 = p_경훈_월급,
        선화_월급 = p_선화_월급,
        other_income = p_other_income,
        notes = p_notes,
        updated_at = NOW()
      WHERE id = v_existing_id;
      
      v_result := jsonb_build_object(
        'success', true,
        'data', jsonb_build_object(
          'id', v_existing_id,
          'user_id', p_user_id,
          'year', p_year,
          'month', p_month,
          '경훈_월급', p_경훈_월급,
          '선화_월급', p_선화_월급,
          'other_income', p_other_income,
          'total_income', v_total_income,
          'notes', p_notes,
          'updated_at', NOW()
        ),
        'message', '수입 정보가 성공적으로 업데이트되었습니다.'
      );
    ELSE
      -- 새 데이터 생성
      INSERT INTO monthly_income (
        user_id, year, month, 경훈_월급, 선화_월급, other_income, notes
      ) VALUES (
        p_user_id, p_year, p_month, p_경훈_월급, p_선화_월급, p_other_income, p_notes
      ) RETURNING id INTO v_existing_id;
      
      v_result := jsonb_build_object(
        'success', true,
        'data', jsonb_build_object(
          'id', v_existing_id,
          'user_id', p_user_id,
          'year', p_year,
          'month', p_month,
          '경훈_월급', p_경훈_월급,
          '선화_월급', p_선화_월급,
          'other_income', p_other_income,
          'total_income', v_total_income,
          'notes', p_notes,
          'created_at', NOW(),
          'updated_at', NOW()
        ),
        'message', '수입 정보가 성공적으로 생성되었습니다.'
      );
    END IF;
    
    -- 관련 대시보드 데이터 무효화를 위한 이벤트 발생
    PERFORM pg_notify('dashboard_update', jsonb_build_object(
      'user_id', p_user_id,
      'year', p_year,
      'month', p_month,
      'type', 'income'
    )::text);
    
    RETURN v_result;
    
  EXCEPTION
    WHEN OTHERS THEN
      -- 에러 발생 시 롤백
      v_result := jsonb_build_object(
        'success', false,
        'error', SQLERRM,
        'message', '수입 정보 저장 중 오류가 발생했습니다.'
      );
      RETURN v_result;
  END;
END;
$$;

-- 월별 지출 데이터 트랜잭션 저장 함수
CREATE OR REPLACE FUNCTION upsert_monthly_expenses_transaction(
  p_user_id UUID,
  p_year INTEGER,
  p_month INTEGER,
  p_housing DECIMAL(15,2) DEFAULT 0,
  p_food DECIMAL(15,2) DEFAULT 0,
  p_transportation DECIMAL(15,2) DEFAULT 0,
  p_utilities DECIMAL(15,2) DEFAULT 0,
  p_healthcare DECIMAL(15,2) DEFAULT 0,
  p_entertainment DECIMAL(15,2) DEFAULT 0,
  p_other_expenses DECIMAL(15,2) DEFAULT 0,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_existing_id UUID;
  v_total_expenses DECIMAL(15,2);
BEGIN
  -- 트랜잭션 시작
  BEGIN
    -- 기존 데이터 확인
    SELECT id INTO v_existing_id
    FROM monthly_expenses
    WHERE user_id = p_user_id AND year = p_year AND month = p_month;
    
    -- 총 지출 계산
    v_total_expenses := p_housing + p_food + p_transportation + p_utilities + p_healthcare + p_entertainment + p_other_expenses;
    
    IF v_existing_id IS NOT NULL THEN
      -- 기존 데이터 업데이트
      UPDATE monthly_expenses
      SET 
        housing = p_housing,
        food = p_food,
        transportation = p_transportation,
        utilities = p_utilities,
        healthcare = p_healthcare,
        entertainment = p_entertainment,
        other_expenses = p_other_expenses,
        notes = p_notes,
        updated_at = NOW()
      WHERE id = v_existing_id;
      
      v_result := jsonb_build_object(
        'success', true,
        'data', jsonb_build_object(
          'id', v_existing_id,
          'user_id', p_user_id,
          'year', p_year,
          'month', p_month,
          'housing', p_housing,
          'food', p_food,
          'transportation', p_transportation,
          'utilities', p_utilities,
          'healthcare', p_healthcare,
          'entertainment', p_entertainment,
          'other_expenses', p_other_expenses,
          'total_expenses', v_total_expenses,
          'notes', p_notes,
          'updated_at', NOW()
        ),
        'message', '지출 정보가 성공적으로 업데이트되었습니다.'
      );
    ELSE
      -- 새 데이터 생성
      INSERT INTO monthly_expenses (
        user_id, year, month, housing, food, transportation, utilities, healthcare, entertainment, other_expenses, notes
      ) VALUES (
        p_user_id, p_year, p_month, p_housing, p_food, p_transportation, p_utilities, p_healthcare, p_entertainment, p_other_expenses, p_notes
      ) RETURNING id INTO v_existing_id;
      
      v_result := jsonb_build_object(
        'success', true,
        'data', jsonb_build_object(
          'id', v_existing_id,
          'user_id', p_user_id,
          'year', p_year,
          'month', p_month,
          'housing', p_housing,
          'food', p_food,
          'transportation', p_transportation,
          'utilities', p_utilities,
          'healthcare', p_healthcare,
          'entertainment', p_entertainment,
          'other_expenses', p_other_expenses,
          'total_expenses', v_total_expenses,
          'notes', p_notes,
          'created_at', NOW(),
          'updated_at', NOW()
        ),
        'message', '지출 정보가 성공적으로 생성되었습니다.'
      );
    END IF;
    
    -- 관련 대시보드 데이터 무효화를 위한 이벤트 발생
    PERFORM pg_notify('dashboard_update', jsonb_build_object(
      'user_id', p_user_id,
      'year', p_year,
      'month', p_month,
      'type', 'expenses'
    )::text);
    
    RETURN v_result;
    
  EXCEPTION
    WHEN OTHERS THEN
      -- 에러 발생 시 롤백
      v_result := jsonb_build_object(
        'success', false,
        'error', SQLERRM,
        'message', '지출 정보 저장 중 오류가 발생했습니다.'
      );
      RETURN v_result;
  END;
END;
$$;

-- 계좌 정보 트랜잭션 저장 함수
CREATE OR REPLACE FUNCTION upsert_account_transaction(
  p_user_id UUID,
  p_account_name VARCHAR(100),
  p_account_type VARCHAR(50),
  p_balance DECIMAL(15,2),
  p_currency VARCHAR(3) DEFAULT 'KRW',
  p_account_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_new_id UUID;
BEGIN
  -- 트랜잭션 시작
  BEGIN
    -- 계좌 유형 검증
    IF p_account_type NOT IN ('checking', 'savings', 'investment', 'credit') THEN
      v_result := jsonb_build_object(
        'success', false,
        'error', 'Invalid account type',
        'message', '유효하지 않은 계좌 유형입니다.'
      );
      RETURN v_result;
    END IF;
    
    IF p_account_id IS NOT NULL THEN
      -- 기존 계좌 업데이트
      UPDATE accounts
      SET 
        account_name = p_account_name,
        account_type = p_account_type,
        balance = p_balance,
        currency = p_currency,
        updated_at = NOW()
      WHERE id = p_account_id AND user_id = p_user_id;
      
      IF NOT FOUND THEN
        v_result := jsonb_build_object(
          'success', false,
          'error', 'Account not found',
          'message', '계좌를 찾을 수 없습니다.'
        );
        RETURN v_result;
      END IF;
      
      v_result := jsonb_build_object(
        'success', true,
        'data', jsonb_build_object(
          'id', p_account_id,
          'user_id', p_user_id,
          'account_name', p_account_name,
          'account_type', p_account_type,
          'balance', p_balance,
          'currency', p_currency,
          'is_active', true,
          'updated_at', NOW()
        ),
        'message', '계좌 정보가 성공적으로 업데이트되었습니다.'
      );
    ELSE
      -- 새 계좌 생성
      INSERT INTO accounts (
        user_id, account_name, account_type, balance, currency
      ) VALUES (
        p_user_id, p_account_name, p_account_type, p_balance, p_currency
      ) RETURNING id INTO v_new_id;
      
      v_result := jsonb_build_object(
        'success', true,
        'data', jsonb_build_object(
          'id', v_new_id,
          'user_id', p_user_id,
          'account_name', p_account_name,
          'account_type', p_account_type,
          'balance', p_balance,
          'currency', p_currency,
          'is_active', true,
          'created_at', NOW(),
          'updated_at', NOW()
        ),
        'message', '계좌가 성공적으로 생성되었습니다.'
      );
    END IF;
    
    -- 관련 대시보드 데이터 무효화를 위한 이벤트 발생
    PERFORM pg_notify('dashboard_update', jsonb_build_object(
      'user_id', p_user_id,
      'type', 'accounts'
    )::text);
    
    RETURN v_result;
    
  EXCEPTION
    WHEN OTHERS THEN
      -- 에러 발생 시 롤백
      v_result := jsonb_build_object(
        'success', false,
        'error', SQLERRM,
        'message', '계좌 정보 저장 중 오류가 발생했습니다.'
      );
      RETURN v_result;
  END;
END;
$$;

-- 데이터 무결성 검증 함수
CREATE OR REPLACE FUNCTION validate_financial_data(
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
  v_income_exists BOOLEAN;
  v_expenses_exists BOOLEAN;
  v_income_total DECIMAL(15,2);
  v_expenses_total DECIMAL(15,2);
  v_savings_rate DECIMAL(5,2);
BEGIN
  -- 수입 데이터 확인
  SELECT EXISTS(
    SELECT 1 FROM monthly_income 
    WHERE user_id = p_user_id AND year = p_year AND month = p_month
  ) INTO v_income_exists;
  
  -- 지출 데이터 확인
  SELECT EXISTS(
    SELECT 1 FROM monthly_expenses 
    WHERE user_id = p_user_id AND year = p_year AND month = p_month
  ) INTO v_expenses_exists;
  
  -- 수입 총액
  SELECT COALESCE(total_income, 0) INTO v_income_total
  FROM monthly_income 
  WHERE user_id = p_user_id AND year = p_year AND month = p_month;
  
  -- 지출 총액
  SELECT COALESCE(total_expenses, 0) INTO v_expenses_total
  FROM monthly_expenses 
  WHERE user_id = p_user_id AND year = p_year AND month = p_month;
  
  -- 저축률 계산
  IF v_income_total > 0 THEN
    v_savings_rate := ((v_income_total - v_expenses_total) / v_income_total) * 100;
  ELSE
    v_savings_rate := 0;
  END IF;
  
  v_result := jsonb_build_object(
    'success', true,
    'data', jsonb_build_object(
      'income_exists', v_income_exists,
      'expenses_exists', v_expenses_exists,
      'total_income', v_income_total,
      'total_expenses', v_expenses_total,
      'total_savings', v_income_total - v_expenses_total,
      'savings_rate', v_savings_rate,
      'is_complete', v_income_exists AND v_expenses_exists,
      'validation_date', NOW()
    ),
    'message', '데이터 무결성 검증이 완료되었습니다.'
  );
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    v_result := jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'message', '데이터 무결성 검증 중 오류가 발생했습니다.'
    );
    RETURN v_result;
END;
$$;

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_monthly_income_user_year_month_updated ON monthly_income(user_id, year, month, updated_at);
CREATE INDEX IF NOT EXISTS idx_monthly_expenses_user_year_month_updated ON monthly_expenses(user_id, year, month, updated_at);
CREATE INDEX IF NOT EXISTS idx_accounts_user_active_updated ON accounts(user_id, is_active, updated_at);

-- RLS 정책 업데이트 (보안 강화)
ALTER TABLE monthly_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- 사용자별 데이터 접근 정책
CREATE POLICY IF NOT EXISTS "Users can view own monthly income" ON monthly_income
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own monthly income" ON monthly_income
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own monthly income" ON monthly_income
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can view own monthly expenses" ON monthly_expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own monthly expenses" ON monthly_expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own monthly expenses" ON monthly_expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can view own accounts" ON accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own accounts" ON accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own accounts" ON accounts
  FOR UPDATE USING (auth.uid() = user_id);

