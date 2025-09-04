import { NextRequest, NextResponse } from 'next/server';
import { queryDatabase, initializeDatabase } from '@/lib/database/sqlite';

export async function GET(request: NextRequest) {
  try {
    // 데이터베이스 초기화
    await initializeDatabase();

    // 모든 테이블의 데이터 개수 조회
    const tables = ['users', 'monthly_income', 'monthly_expenses', 'accounts'];
    const tableCounts: Record<string, any> = {};

    for (const table of tables) {
      try {
        const countResult = await queryDatabase<{ count: number }>(`SELECT COUNT(*) as count FROM ${table}`);
        tableCounts[table] = countResult[0]?.count || 0;
      } catch (error) {
        tableCounts[table] = { error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }

    // 최근 수입 데이터 조회
    let recentIncome = null;
    try {
      const incomeResult = await queryDatabase(`SELECT * FROM monthly_income ORDER BY updated_at DESC LIMIT 5`);
      recentIncome = incomeResult;
    } catch (error) {
      recentIncome = { error: error instanceof Error ? error.message : 'Unknown error' };
    }

    // 최근 지출 데이터 조회
    let recentExpenses = null;
    try {
      const expensesResult = await queryDatabase(`SELECT * FROM monthly_expenses ORDER BY updated_at DESC LIMIT 5`);
      recentExpenses = expensesResult;
    } catch (error) {
      recentExpenses = { error: error instanceof Error ? error.message : 'Unknown error' };
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      databaseInfo: {
        location: 'data/finance.db',
        tableCounts,
        recentIncome,
        recentExpenses
      }
    });

  } catch (error) {
    return NextResponse.json({
      error: '데이터베이스 상태 확인 실패',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
