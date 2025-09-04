import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase, queryDatabase } from '@/lib/database/sqlite';

export async function GET(request: NextRequest) {
  try {
    // 데이터베이스 초기화
    await initializeDatabase();

    // 데이터베이스 연결 테스트
    try {
      const data = await queryDatabase<{ count: number }>('SELECT COUNT(*) as count FROM monthly_expenses');
      
      return NextResponse.json({
        success: true,
        message: 'SQLite 데이터베이스 연결 성공',
        data: {
          tableCount: data[0]?.count || 0,
          databaseType: 'SQLite',
          location: 'data/finance.db'
        }
      });

    } catch (dbError) {
      return NextResponse.json({
        error: '데이터베이스 쿼리 실패',
        details: dbError instanceof Error ? dbError.message : 'Unknown error',
        suggestion: 'Check if the database file exists and is accessible.'
      }, { status: 500 });
    }

  } catch (error) {
    return NextResponse.json({
      error: '서버 오류',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
