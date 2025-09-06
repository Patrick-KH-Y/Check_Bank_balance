import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

// 데이터베이스 파일 경로
const DB_PATH = path.join(process.cwd(), 'data', 'finance.db');

// 데이터베이스 디렉토리 생성
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 데이터베이스 연결
export function getDatabase(): sqlite3.Database {
  return new sqlite3.Database(DB_PATH);
}

// 데이터베이스 초기화
export async function initializeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    
    // 테이블 생성
    const createTables = `
      -- 사용자 테이블
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- 통장/계좌 테이블
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        account_name TEXT NOT NULL,
        account_type TEXT NOT NULL,
        balance REAL NOT NULL DEFAULT 0,
        currency TEXT DEFAULT 'KRW',
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- 월별 수입 상세 테이블
      CREATE TABLE IF NOT EXISTS monthly_income (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
        경훈_월급 REAL NOT NULL DEFAULT 0,
        선화_월급 REAL NOT NULL DEFAULT 0,
        other_income REAL DEFAULT 0,
        total_income REAL GENERATED ALWAYS AS (경훈_월급 + 선화_월급 + other_income) VIRTUAL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, year, month),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- 월별 지출 상세 테이블
      CREATE TABLE IF NOT EXISTS monthly_expenses (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
        housing REAL DEFAULT 0,
        food REAL DEFAULT 0,
        transportation REAL DEFAULT 0,
        utilities REAL DEFAULT 0,
        healthcare REAL DEFAULT 0,
        entertainment REAL DEFAULT 0,
        other_expenses REAL DEFAULT 0,
        total_expenses REAL GENERATED ALWAYS AS (
          housing + food + transportation + utilities + healthcare + entertainment + other_expenses
        ) VIRTUAL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, year, month),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- 공유 링크 테이블
      CREATE TABLE IF NOT EXISTS shared_dashboards (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        share_token TEXT UNIQUE NOT NULL,
        dashboard_data TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        expires_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- 인덱스 생성
      CREATE INDEX IF NOT EXISTS idx_monthly_income_user_year_month ON monthly_income(user_id, year, month);
      CREATE INDEX IF NOT EXISTS idx_monthly_expenses_user_year_month ON monthly_expenses(user_id, year, month);
      CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
    `;

    db.exec(createTables, (err) => {
      if (err) {
        console.error('데이터베이스 초기화 오류:', err);
        reject(err);
        return;
      }

      // 사용자만 생성 (기본 데이터 없이)
      insertUserOnly(db).then(() => {
        // 기본 고정 지출 데이터 삽입
        return insertDefaultFixedExpenses(db);
      }).then(() => {
        // 기본 지출 데이터 삽입
        return insertDefaultExpenses(db);
      }).then(() => {
        console.log('데이터베이스 초기화 완료');
        resolve();
      }).catch(reject);
    });
  });
}

// 사용자만 생성 (기본 데이터 없이)
async function insertUserOnly(db: sqlite3.Database): Promise<void> {
  return new Promise((resolve, reject) => {
    // 기존 사용자가 있는지 확인
    db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
      if (err) {
        console.error('사용자 데이터 확인 오류:', err);
        reject(err);
        return;
      }

      const userCount = (row as any)?.count || 0;
      
      // 이미 사용자가 있으면 생성하지 않음
      if (userCount > 0) {
        console.log('기존 사용자가 존재합니다.');
        resolve();
        return;
      }

      console.log('기본 사용자를 생성합니다...');
      
      // 임시 사용자 생성만
      const insertUser = `
        INSERT OR IGNORE INTO users (id, email, password_hash, full_name) 
        VALUES ('temp-user-123', 'test@example.com', 'temp_hash', '테스트 사용자')
      `;

      db.run(insertUser, (err) => {
        if (err) {
          console.error('사용자 생성 오류:', err);
          reject(err);
          return;
        }
        
        console.log('기본 사용자 생성 완료');
        resolve();
      });
    });
  });
}

// 기본 고정 지출 데이터 삽입
async function insertDefaultFixedExpenses(db: sqlite3.Database): Promise<void> {
  return new Promise((resolve, reject) => {
    // 기존 고정 지출이 있는지 확인
    db.get('SELECT COUNT(*) as count FROM monthly_expenses WHERE housing = 0 AND food = 0 AND transportation = 0 AND utilities = 0 AND healthcare = 0 AND entertainment = 0 AND other_expenses = 0', (err, row) => {
      if (err) {
        console.error('고정 지출 데이터 확인 오류:', err);
        reject(err);
        return;
      }

      const fixedExpenseCount = (row as any)?.count || 0;
      
      // 고정 지출이 없으면 삽입
      if (fixedExpenseCount === 0) {
        console.log('기본 고정 지출 데이터를 삽입합니다...');
        const insertFixedExpenses = `
          INSERT INTO monthly_expenses (id, user_id, year, month, housing, food, transportation, utilities, healthcare, entertainment, other_expenses)
          VALUES ('fixed-expenses-1', 'temp-user-123', 2023, 1, 0, 0, 0, 0, 0, 0, 0)
        `;
        db.run(insertFixedExpenses, (err) => {
          if (err) {
            console.error('고정 지출 데이터 삽입 오류:', err);
            reject(err);
            return;
          }
          console.log('기본 고정 지출 데이터 삽입 완료');
          resolve();
        });
      } else {
        console.log('기본 고정 지출 데이터가 이미 존재합니다.');
        resolve();
      }
    });
  });
}

// 데이터베이스 쿼리 헬퍼 함수
export function queryDatabase<T>(sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows as T[]);
      }
    });
  });
}

// 단일 행 조회
export function queryDatabaseSingle<T>(sql: string, params: any[] = []): Promise<T | null> {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row as T || null);
      }
    });
  });
}

// 실행 (INSERT, UPDATE, DELETE)
export function executeDatabase(sql: string, params: any[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// 기본 지출 데이터 삽입
async function insertDefaultExpenses(db: sqlite3.Database): Promise<void> {
  return new Promise((resolve, reject) => {
    // 기존 지출 데이터가 있는지 확인
    db.get('SELECT COUNT(*) as count FROM monthly_expenses', (err, row) => {
      if (err) {
        console.error('지출 데이터 확인 오류:', err);
        reject(err);
        return;
      }

      const count = (row as any)?.count || 0;
      
      // 이미 데이터가 있으면 삽입하지 않음
      if (count > 0) {
        console.log('기본 지출 데이터가 이미 존재합니다.');
        resolve();
        return;
      }

      console.log('기본 지출 데이터를 삽입합니다...');
      
      // 기본 지출 데이터 삽입 (2025년 전체 월별 데이터)
      const insertExpenses = `
        INSERT INTO monthly_expenses (id, user_id, year, month, housing, food, transportation, utilities, healthcare, entertainment, other_expenses, notes)
        VALUES 
          ('exp-2025-01', 'temp-user-123', 2025, 1, 1200000, 800000, 200000, 150000, 100000, 300000, 200000, '2025년 1월 기본 지출 데이터'),
          ('exp-2025-02', 'temp-user-123', 2025, 2, 1200000, 750000, 180000, 160000, 120000, 250000, 180000, '2025년 2월 기본 지출 데이터'),
          ('exp-2025-03', 'temp-user-123', 2025, 3, 1200000, 850000, 220000, 140000, 80000, 350000, 250000, '2025년 3월 기본 지출 데이터'),
          ('exp-2025-04', 'temp-user-123', 2025, 4, 1200000, 900000, 250000, 130000, 90000, 400000, 300000, '2025년 4월 기본 지출 데이터'),
          ('exp-2025-05', 'temp-user-123', 2025, 5, 1200000, 950000, 280000, 120000, 100000, 450000, 350000, '2025년 5월 기본 지출 데이터'),
          ('exp-2025-06', 'temp-user-123', 2025, 6, 1200000, 880000, 260000, 110000, 85000, 380000, 280000, '2025년 6월 기본 지출 데이터'),
          ('exp-2025-07', 'temp-user-123', 2025, 7, 1200000, 920000, 300000, 140000, 95000, 420000, 320000, '2025년 7월 기본 지출 데이터'),
          ('exp-2025-08', 'temp-user-123', 2025, 8, 1200000, 870000, 270000, 135000, 90000, 390000, 290000, '2025년 8월 기본 지출 데이터'),
          ('exp-2025-09', 'temp-user-123', 2025, 9, 1200000, 850000, 240000, 125000, 85000, 360000, 270000, '2025년 9월 기본 지출 데이터'),
          ('exp-2025-10', 'temp-user-123', 2025, 10, 1200000, 890000, 250000, 130000, 100000, 380000, 300000, '2025년 10월 기본 지출 데이터'),
          ('exp-2025-11', 'temp-user-123', 2025, 11, 1200000, 910000, 260000, 140000, 95000, 400000, 310000, '2025년 11월 기본 지출 데이터'),
          ('exp-2025-12', 'temp-user-123', 2025, 12, 1200000, 1000000, 280000, 150000, 110000, 500000, 400000, '2025년 12월 기본 지출 데이터');
      `;

      db.exec(insertExpenses, (err) => {
        if (err) {
          console.error('기본 지출 데이터 삽입 오류:', err);
          reject(err);
          return;
        }
        
        console.log('기본 지출 데이터 삽입 완료');
        resolve();
      });
    });
  });
}
