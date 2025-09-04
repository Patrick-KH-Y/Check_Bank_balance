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
