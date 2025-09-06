-- 고정 지출 검증 강화를 위한 추가 제약조건 및 인덱스

-- 카테고리 중복 방지를 위한 유니크 인덱스 (같은 사용자의 같은 년월에 같은 카테고리는 허용하지 않음)
CREATE UNIQUE INDEX IF NOT EXISTS idx_fixed_expenses_unique_category 
ON fixed_expenses (user_id, year, month, category) 
WHERE is_active = 1;

-- 금액 범위 체크 제약조건 추가
ALTER TABLE fixed_expenses 
ADD CONSTRAINT chk_amount_range 
CHECK (amount >= 0 AND amount <= 1000000000);

-- 년도 범위 체크 제약조건 추가
ALTER TABLE fixed_expenses 
ADD CONSTRAINT chk_year_range 
CHECK (year >= 2020 AND year <= 2030);

-- 월 범위 체크 제약조건 추가
ALTER TABLE fixed_expenses 
ADD CONSTRAINT chk_month_range 
CHECK (month >= 1 AND month <= 12);

-- 카테고리 길이 제한
ALTER TABLE fixed_expenses 
ADD CONSTRAINT chk_category_length 
CHECK (length(category) >= 1 AND length(category) <= 100);

-- 설명 길이 제한
ALTER TABLE fixed_expenses 
ADD CONSTRAINT chk_description_length 
CHECK (description IS NULL OR (length(description) >= 0 AND length(description) <= 500));

-- 성능 최적화를 위한 추가 인덱스
CREATE INDEX IF NOT EXISTS idx_fixed_expenses_amount ON fixed_expenses (amount);
CREATE INDEX IF NOT EXISTS idx_fixed_expenses_created_at ON fixed_expenses (created_at);
CREATE INDEX IF NOT EXISTS idx_fixed_expenses_updated_at ON fixed_expenses (updated_at);

-- 통계 뷰 생성 (카테고리별 고정 지출 통계)
CREATE VIEW IF NOT EXISTS fixed_expenses_category_stats AS
SELECT 
  user_id,
  year,
  month,
  category,
  COUNT(*) as count,
  SUM(amount) as total_amount,
  AVG(amount) as avg_amount,
  MIN(amount) as min_amount,
  MAX(amount) as max_amount
FROM fixed_expenses 
WHERE is_active = 1
GROUP BY user_id, year, month, category;

-- 월별 고정 지출 요약 뷰
CREATE VIEW IF NOT EXISTS fixed_expenses_monthly_summary AS
SELECT 
  user_id,
  year,
  month,
  COUNT(*) as total_items,
  SUM(amount) as total_amount,
  COUNT(DISTINCT category) as unique_categories,
  GROUP_CONCAT(DISTINCT category, ', ') as categories
FROM fixed_expenses 
WHERE is_active = 1
GROUP BY user_id, year, month;

