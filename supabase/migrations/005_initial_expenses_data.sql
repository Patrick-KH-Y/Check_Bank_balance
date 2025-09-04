-- 기본 월별 지출 내역 초기값 세팅
-- 2025-09-04

-- 2025년 8월 기본 지출 데이터 삽입
INSERT INTO monthly_expenses (user_id, year, month, housing, food, transportation, utilities, healthcare, entertainment, other_expenses, notes)
VALUES 
    -- 8월 데이터
    (
        (SELECT id FROM users LIMIT 1), -- 첫 번째 사용자 (실제로는 인증된 사용자 ID 사용)
        2025,
        8,
        1900000, -- 주거비
        1400000, -- 식비
        480000,  -- 교통비
        280000,  -- 공과금
        180000,  -- 의료비
        280000,  -- 여가비
        180000,  -- 기타
        '2025년 8월 기본 지출 데이터'
    ),
    -- 9월 데이터
    (
        (SELECT id FROM users LIMIT 1), -- 첫 번째 사용자 (실제로는 인증된 사용자 ID 사용)
        2025,
        9,
        2000000, -- 주거비
        1500000, -- 식비
        500000,  -- 교통비
        300000,  -- 공과금
        200000,  -- 의료비
        300000,  -- 여가비
        200000,  -- 기타
        '2025년 9월 기본 지출 데이터'
    )
ON CONFLICT (user_id, year, month) DO UPDATE SET
    housing = EXCLUDED.housing,
    food = EXCLUDED.food,
    transportation = EXCLUDED.transportation,
    utilities = EXCLUDED.utilities,
    healthcare = EXCLUDED.healthcare,
    entertainment = EXCLUDED.entertainment,
    other_expenses = EXCLUDED.other_expenses,
    notes = EXCLUDED.notes,
    updated_at = NOW();

-- 2025년 8월 기본 수입 데이터 삽입 (이미 있지만 확인용)
INSERT INTO monthly_income (user_id, year, month, 경훈_월급, 선화_월급, other_income, notes)
VALUES 
    -- 8월 데이터
    (
        (SELECT id FROM users LIMIT 1),
        2025,
        8,
        4800000, -- 경훈 월급
        5700000, -- 선화 월급
        0,      -- 기타 수입
        '2025년 8월 기본 수입 데이터'
    ),
    -- 9월 데이터
    (
        (SELECT id FROM users LIMIT 1),
        2025,
        9,
        5000000, -- 경훈 월급
        6000000, -- 선화 월급
        0,      -- 기타 수입
        '2025년 9월 기본 수입 데이터'
    )
ON CONFLICT (user_id, year, month) DO UPDATE SET
    경훈_월급 = EXCLUDED.경훈_월급,
    선화_월급 = EXCLUDED.선화_월급,
    other_income = EXCLUDED.other_income,
    notes = EXCLUDED.notes,
    updated_at = NOW();

-- 기본 통장 데이터 삽입
INSERT INTO accounts (user_id, account_name, account_type, balance, currency, is_active)
VALUES 
    (
        (SELECT id FROM users LIMIT 1),
        '주거래은행',
        'checking',
        15000000,
        'KRW',
        true
    ),
    (
        (SELECT id FROM users LIMIT 1),
        '저축은행',
        'savings',
        50000000,
        'KRW',
        true
    ),
    (
        (SELECT id FROM users LIMIT 1),
        '투자계좌',
        'investment',
        25000000,
        'KRW',
        true
    )
ON CONFLICT DO NOTHING;
