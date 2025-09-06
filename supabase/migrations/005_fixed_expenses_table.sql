-- 고정 지출 내역 테이블 생성
CREATE TABLE IF NOT EXISTS fixed_expenses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  category TEXT NOT NULL,
  amount REAL NOT NULL DEFAULT 0,
  description TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_fixed_expenses_user_year_month ON fixed_expenses(user_id, year, month);
CREATE INDEX IF NOT EXISTS idx_fixed_expenses_category ON fixed_expenses(category);
CREATE INDEX IF NOT EXISTS idx_fixed_expenses_active ON fixed_expenses(is_active);

-- 샘플 데이터 삽입 (선택사항)
INSERT OR IGNORE INTO fixed_expenses (id, user_id, year, month, category, amount, description) VALUES
('fixed-001', 'temp-user-123', 2025, 9, '주거비', 2000000, '월세'),
('fixed-002', 'temp-user-123', 2025, 9, '통신비', 150000, '인터넷 + 휴대폰'),
('fixed-003', 'temp-user-123', 2025, 9, '보험료', 300000, '생명보험'),
('fixed-004', 'temp-user-123', 2025, 9, '교통비', 200000, '대중교통'),
('fixed-005', 'temp-user-123', 2025, 9, '교육비', 500000, '학원비');

-- 뷰 생성 (고정 지출 요약)
CREATE VIEW IF NOT EXISTS fixed_expenses_summary AS
SELECT 
  user_id,
  year,
  month,
  COUNT(*) as total_count,
  SUM(amount) as total_amount,
  GROUP_CONCAT(category, ', ') as categories
FROM fixed_expenses 
WHERE is_active = 1
GROUP BY user_id, year, month;

