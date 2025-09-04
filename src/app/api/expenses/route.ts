import { NextRequest, NextResponse } from 'next/server';
import { queryDatabaseSingle, executeDatabase, initializeDatabase } from '@/lib/database/sqlite';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const userId = searchParams.get('userId');

    if (!year || !month || !userId) {
      return NextResponse.json(
        { error: 'year, month, userId 파라미터가 필요합니다.' },
        { status: 400 }
      );
    }

    // 데이터베이스 초기화
    await initializeDatabase();

    const sql = `
      SELECT * FROM monthly_expenses 
      WHERE user_id = ? AND year = ? AND month = ?
    `;
    
    const data = await queryDatabaseSingle(sql, [userId, parseInt(year), parseInt(month)]);

    if (!data) {
      return NextResponse.json(
        { error: '지출 데이터를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('지출 데이터 조회 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, year, month, housing, food, transportation, utilities, healthcare, entertainment, other_expenses, notes } = body;

    if (!userId || !year || !month) {
      return NextResponse.json(
        { error: 'userId, year, month는 필수 필드입니다.' },
        { status: 400 }
      );
    }

    // 데이터베이스 초기화
    await initializeDatabase();

    const id = `exp-${year}-${month.toString().padStart(2, '0')}`;
    
    const sql = `
      INSERT OR REPLACE INTO monthly_expenses 
      (id, user_id, year, month, housing, food, transportation, utilities, healthcare, entertainment, other_expenses, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await executeDatabase(sql, [
      id, userId, parseInt(year), parseInt(month),
      housing || 0, food || 0, transportation || 0, utilities || 0,
      healthcare || 0, entertainment || 0, other_expenses || 0, notes || ''
    ]);

    // 생성된 데이터 조회
    const createdData = await queryDatabaseSingle(
      'SELECT * FROM monthly_expenses WHERE id = ?',
      [id]
    );

    return NextResponse.json(createdData);
  } catch (error) {
    console.error('지출 데이터 저장 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, userId, year, month, housing, food, transportation, utilities, healthcare, entertainment, other_expenses, notes } = body;

    if (!id || !userId) {
      return NextResponse.json(
        { error: 'id와 userId는 필수 필드입니다.' },
        { status: 400 }
      );
    }

    // 데이터베이스 초기화
    await initializeDatabase();

    const sql = `
      UPDATE monthly_expenses 
      SET year = ?, month = ?, housing = ?, food = ?, transportation = ?, 
          utilities = ?, healthcare = ?, entertainment = ?, other_expenses = ?, 
          notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `;
    
    await executeDatabase(sql, [
      parseInt(year), parseInt(month),
      housing || 0, food || 0, transportation || 0, utilities || 0,
      healthcare || 0, entertainment || 0, other_expenses || 0, notes || '',
      id, userId
    ]);

    // 수정된 데이터 조회
    const updatedData = await queryDatabaseSingle(
      'SELECT * FROM monthly_expenses WHERE id = ?',
      [id]
    );

    return NextResponse.json(updatedData);
  } catch (error) {
    console.error('지출 데이터 수정 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!id || !userId) {
      return NextResponse.json(
        { error: 'id와 userId 파라미터가 필요합니다.' },
        { status: 400 }
      );
    }

    // 데이터베이스 초기화
    await initializeDatabase();

    const sql = 'DELETE FROM monthly_expenses WHERE id = ? AND user_id = ?';
    await executeDatabase(sql, [id, userId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('지출 데이터 삭제 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
