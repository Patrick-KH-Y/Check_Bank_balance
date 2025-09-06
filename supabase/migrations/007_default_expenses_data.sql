-- 기본 지출 데이터 삽입
-- 2025년 각 월별 기본 지출 데이터

-- 2025년 1월 기본 지출 데이터
INSERT INTO monthly_expenses (user_id, year, month, housing, food, transportation, utilities, healthcare, entertainment, other_expenses, notes)
VALUES (
    'temp-user-123',
    2025,
    1,
    1200000, -- 주거비 (월세/관리비)
    800000,  -- 식비
    200000,  -- 교통비
    150000,  -- 공과금
    100000,  -- 의료비
    300000,  -- 여가비
    200000,  -- 기타
    '2025년 1월 기본 지출 데이터'
) ON CONFLICT (user_id, year, month) DO UPDATE SET
    housing = EXCLUDED.housing,
    food = EXCLUDED.food,
    transportation = EXCLUDED.transportation,
    utilities = EXCLUDED.utilities,
    healthcare = EXCLUDED.healthcare,
    entertainment = EXCLUDED.entertainment,
    other_expenses = EXCLUDED.other_expenses,
    notes = EXCLUDED.notes,
    updated_at = NOW();

-- 2025년 2월 기본 지출 데이터
INSERT INTO monthly_expenses (user_id, year, month, housing, food, transportation, utilities, healthcare, entertainment, other_expenses, notes)
VALUES (
    'temp-user-123',
    2025,
    2,
    1200000, -- 주거비
    750000,  -- 식비 (설날로 인한 감소)
    180000,  -- 교통비
    160000,  -- 공과금 (난방비 증가)
    120000,  -- 의료비
    250000,  -- 여가비
    180000,  -- 기타
    '2025년 2월 기본 지출 데이터'
) ON CONFLICT (user_id, year, month) DO UPDATE SET
    housing = EXCLUDED.housing,
    food = EXCLUDED.food,
    transportation = EXCLUDED.transportation,
    utilities = EXCLUDED.utilities,
    healthcare = EXCLUDED.healthcare,
    entertainment = EXCLUDED.entertainment,
    other_expenses = EXCLUDED.other_expenses,
    notes = EXCLUDED.notes,
    updated_at = NOW();

-- 2025년 3월 기본 지출 데이터
INSERT INTO monthly_expenses (user_id, year, month, housing, food, transportation, utilities, healthcare, entertainment, other_expenses, notes)
VALUES (
    'temp-user-123',
    2025,
    3,
    1200000, -- 주거비
    850000,  -- 식비
    220000,  -- 교통비
    140000,  -- 공과금
    80000,   -- 의료비
    350000,  -- 여가비
    250000,  -- 기타
    '2025년 3월 기본 지출 데이터'
) ON CONFLICT (user_id, year, month) DO UPDATE SET
    housing = EXCLUDED.housing,
    food = EXCLUDED.food,
    transportation = EXCLUDED.transportation,
    utilities = EXCLUDED.utilities,
    healthcare = EXCLUDED.healthcare,
    entertainment = EXCLUDED.entertainment,
    other_expenses = EXCLUDED.other_expenses,
    notes = EXCLUDED.notes,
    updated_at = NOW();

-- 2025년 4월 기본 지출 데이터
INSERT INTO monthly_expenses (user_id, year, month, housing, food, transportation, utilities, healthcare, entertainment, other_expenses, notes)
VALUES (
    'temp-user-123',
    2025,
    4,
    1200000, -- 주거비
    900000,  -- 식비
    250000,  -- 교통비
    130000,  -- 공과금
    90000,   -- 의료비
    400000,  -- 여가비 (봄 여행)
    300000,  -- 기타
    '2025년 4월 기본 지출 데이터'
) ON CONFLICT (user_id, year, month) DO UPDATE SET
    housing = EXCLUDED.housing,
    food = EXCLUDED.food,
    transportation = EXCLUDED.transportation,
    utilities = EXCLUDED.utilities,
    healthcare = EXCLUDED.healthcare,
    entertainment = EXCLUDED.entertainment,
    other_expenses = EXCLUDED.other_expenses,
    notes = EXCLUDED.notes,
    updated_at = NOW();

-- 2025년 5월 기본 지출 데이터
INSERT INTO monthly_expenses (user_id, year, month, housing, food, transportation, utilities, healthcare, entertainment, other_expenses, notes)
VALUES (
    'temp-user-123',
    2025,
    5,
    1200000, -- 주거비
    950000,  -- 식비
    280000,  -- 교통비
    120000,  -- 공과금
    100000,  -- 의료비
    450000,  -- 여가비 (가족여행)
    350000,  -- 기타
    '2025년 5월 기본 지출 데이터'
) ON CONFLICT (user_id, year, month) DO UPDATE SET
    housing = EXCLUDED.housing,
    food = EXCLUDED.food,
    transportation = EXCLUDED.transportation,
    utilities = EXCLUDED.utilities,
    healthcare = EXCLUDED.healthcare,
    entertainment = EXCLUDED.entertainment,
    other_expenses = EXCLUDED.other_expenses,
    notes = EXCLUDED.notes,
    updated_at = NOW();

-- 2025년 6월 기본 지출 데이터
INSERT INTO monthly_expenses (user_id, year, month, housing, food, transportation, utilities, healthcare, entertainment, other_expenses, notes)
VALUES (
    'temp-user-123',
    2025,
    6,
    1200000, -- 주거비
    880000,  -- 식비
    260000,  -- 교통비
    110000,  -- 공과금
    85000,   -- 의료비
    380000,  -- 여가비
    280000,  -- 기타
    '2025년 6월 기본 지출 데이터'
) ON CONFLICT (user_id, year, month) DO UPDATE SET
    housing = EXCLUDED.housing,
    food = EXCLUDED.food,
    transportation = EXCLUDED.transportation,
    utilities = EXCLUDED.utilities,
    healthcare = EXCLUDED.healthcare,
    entertainment = EXCLUDED.entertainment,
    other_expenses = EXCLUDED.other_expenses,
    notes = EXCLUDED.notes,
    updated_at = NOW();

-- 2025년 7월 기본 지출 데이터
INSERT INTO monthly_expenses (user_id, year, month, housing, food, transportation, utilities, healthcare, entertainment, other_expenses, notes)
VALUES (
    'temp-user-123',
    2025,
    7,
    1200000, -- 주거비
    920000,  -- 식비
    300000,  -- 교통비
    140000,  -- 공과금 (냉방비)
    95000,   -- 의료비
    420000,  -- 여가비 (여름휴가)
    320000,  -- 기타
    '2025년 7월 기본 지출 데이터'
) ON CONFLICT (user_id, year, month) DO UPDATE SET
    housing = EXCLUDED.housing,
    food = EXCLUDED.food,
    transportation = EXCLUDED.transportation,
    utilities = EXCLUDED.utilities,
    healthcare = EXCLUDED.healthcare,
    entertainment = EXCLUDED.entertainment,
    other_expenses = EXCLUDED.other_expenses,
    notes = EXCLUDED.notes,
    updated_at = NOW();

-- 2025년 8월 기본 지출 데이터
INSERT INTO monthly_expenses (user_id, year, month, housing, food, transportation, utilities, healthcare, entertainment, other_expenses, notes)
VALUES (
    'temp-user-123',
    2025,
    8,
    1200000, -- 주거비
    870000,  -- 식비
    270000,  -- 교통비
    135000,  -- 공과금
    90000,   -- 의료비
    390000,  -- 여가비
    290000,  -- 기타
    '2025년 8월 기본 지출 데이터'
) ON CONFLICT (user_id, year, month) DO UPDATE SET
    housing = EXCLUDED.housing,
    food = EXCLUDED.food,
    transportation = EXCLUDED.transportation,
    utilities = EXCLUDED.utilities,
    healthcare = EXCLUDED.healthcare,
    entertainment = EXCLUDED.entertainment,
    other_expenses = EXCLUDED.other_expenses,
    notes = EXCLUDED.notes,
    updated_at = NOW();

-- 2025년 9월 기본 지출 데이터
INSERT INTO monthly_expenses (user_id, year, month, housing, food, transportation, utilities, healthcare, entertainment, other_expenses, notes)
VALUES (
    'temp-user-123',
    2025,
    9,
    1200000, -- 주거비
    850000,  -- 식비
    240000,  -- 교통비
    125000,  -- 공과금
    85000,   -- 의료비
    360000,  -- 여가비
    270000,  -- 기타
    '2025년 9월 기본 지출 데이터'
) ON CONFLICT (user_id, year, month) DO UPDATE SET
    housing = EXCLUDED.housing,
    food = EXCLUDED.food,
    transportation = EXCLUDED.transportation,
    utilities = EXCLUDED.utilities,
    healthcare = EXCLUDED.healthcare,
    entertainment = EXCLUDED.entertainment,
    other_expenses = EXCLUDED.other_expenses,
    notes = EXCLUDED.notes,
    updated_at = NOW();

-- 2025년 10월 기본 지출 데이터
INSERT INTO monthly_expenses (user_id, year, month, housing, food, transportation, utilities, healthcare, entertainment, other_expenses, notes)
VALUES (
    'temp-user-123',
    2025,
    10,
    1200000, -- 주거비
    890000,  -- 식비
    250000,  -- 교통비
    130000,  -- 공과금
    100000,  -- 의료비
    380000,  -- 여가비
    300000,  -- 기타
    '2025년 10월 기본 지출 데이터'
) ON CONFLICT (user_id, year, month) DO UPDATE SET
    housing = EXCLUDED.housing,
    food = EXCLUDED.food,
    transportation = EXCLUDED.transportation,
    utilities = EXCLUDED.utilities,
    healthcare = EXCLUDED.healthcare,
    entertainment = EXCLUDED.entertainment,
    other_expenses = EXCLUDED.other_expenses,
    notes = EXCLUDED.notes,
    updated_at = NOW();

-- 2025년 11월 기본 지출 데이터
INSERT INTO monthly_expenses (user_id, year, month, housing, food, transportation, utilities, healthcare, entertainment, other_expenses, notes)
VALUES (
    'temp-user-123',
    2025,
    11,
    1200000, -- 주거비
    910000,  -- 식비
    260000,  -- 교통비
    140000,  -- 공과금 (난방비)
    95000,   -- 의료비
    400000,  -- 여가비
    310000,  -- 기타
    '2025년 11월 기본 지출 데이터'
) ON CONFLICT (user_id, year, month) DO UPDATE SET
    housing = EXCLUDED.housing,
    food = EXCLUDED.food,
    transportation = EXCLUDED.transportation,
    utilities = EXCLUDED.utilities,
    healthcare = EXCLUDED.healthcare,
    entertainment = EXCLUDED.entertainment,
    other_expenses = EXCLUDED.other_expenses,
    notes = EXCLUDED.notes,
    updated_at = NOW();

-- 2025년 12월 기본 지출 데이터
INSERT INTO monthly_expenses (user_id, year, month, housing, food, transportation, utilities, healthcare, entertainment, other_expenses, notes)
VALUES (
    'temp-user-123',
    2025,
    12,
    1200000, -- 주거비
    1000000, -- 식비 (연말 모임)
    280000,  -- 교통비
    150000,  -- 공과금 (난방비)
    110000,  -- 의료비
    500000,  -- 여가비 (연말 휴가)
    400000,  -- 기타 (선물비)
    '2025년 12월 기본 지출 데이터'
) ON CONFLICT (user_id, year, month) DO UPDATE SET
    housing = EXCLUDED.housing,
    food = EXCLUDED.food,
    transportation = EXCLUDED.transportation,
    utilities = EXCLUDED.utilities,
    healthcare = EXCLUDED.healthcare,
    entertainment = EXCLUDED.entertainment,
    other_expenses = EXCLUDED.other_expenses,
    notes = EXCLUDED.notes,
    updated_at = NOW();
