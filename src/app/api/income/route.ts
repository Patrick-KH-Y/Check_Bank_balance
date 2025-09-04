import { NextRequest, NextResponse } from 'next/server';
import { queryDatabaseSingle, executeDatabase, initializeDatabase } from '@/lib/database/sqlite';

interface MonthlyIncome {
  id: string;
  user_id: string;
  year: number;
  month: number;
  경훈_월급: number;
  선화_월급: number;
  other_income: number;
  total_income: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

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
      SELECT * FROM monthly_income 
      WHERE user_id = ? AND year = ? AND month = ?
    `;
    
    const data = await queryDatabaseSingle<MonthlyIncome>(sql, [userId, parseInt(year), parseInt(month)]);

    if (!data) {
      return NextResponse.json(
        { error: '수입 데이터를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('수입 데이터 조회 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, year, month, 경훈_월급, 선화_월급, other_income, notes } = body;

    if (!userId || !year || !month) {
      return NextResponse.json(
        { error: 'userId, year, month는 필수 필드입니다.' },
        { status: 400 }
      );
    }

    // 데이터베이스 초기화
    await initializeDatabase();

    const id = `inc-${year}-${month.toString().padStart(2, '0')}`;
    
    // 기존 데이터 확인
    const existingData = await queryDatabaseSingle<MonthlyIncome>(
      'SELECT * FROM monthly_income WHERE user_id = ? AND year = ? AND month = ?',
      [userId, parseInt(year), parseInt(month)]
    );

    if (existingData) {
      console.log(`기존 수입 데이터 업데이트: ${id}`);
      // 기존 데이터 업데이트
      const updateSql = `
        UPDATE monthly_income 
        SET 경훈_월급 = ?, 선화_월급 = ?, other_income = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ? AND year = ? AND month = ?
      `;
      
      await executeDatabase(updateSql, [
        경훈_월급 || 0, 선화_월급 || 0, other_income || 0, notes || '',
        userId, parseInt(year), parseInt(month)
      ]);
    } else {
      console.log(`새 수입 데이터 생성: ${id}`);
      // 새 데이터 삽입
      const insertSql = `
        INSERT INTO monthly_income 
        (id, user_id, year, month, 경훈_월급, 선화_월급, other_income, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      await executeDatabase(insertSql, [
        id, userId, parseInt(year), parseInt(month),
        경훈_월급 || 0, 선화_월급 || 0, other_income || 0, notes || ''
      ]);
    }

    // 생성/수정된 데이터 조회
    const createdData = await queryDatabaseSingle<MonthlyIncome>(
      'SELECT * FROM monthly_income WHERE id = ?',
      [id]
    );

    console.log(`수입 데이터 저장 완료: ${id}, 총 수입: ${createdData?.total_income}원`);

    return NextResponse.json(createdData);
  } catch (error) {
    console.error('수입 데이터 저장 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, userId, year, month, 경훈_월급, 선화_월급, other_income, notes } = body;

    if (!id || !userId) {
      return NextResponse.json(
        { error: 'id와 userId는 필수 필드입니다.' },
        { status: 400 }
      );
    }

    // 데이터베이스 초기화
    await initializeDatabase();

    const sql = `
      UPDATE monthly_income 
      SET year = ?, month = ?, 경훈_월급 = ?, 선화_월급 = ?, 
          other_income = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `;
    
    await executeDatabase(sql, [
      parseInt(year), parseInt(month),
      경훈_월급 || 0, 선화_월급 || 0, other_income || 0, notes || '',
      id, userId
    ]);

    // 수정된 데이터 조회
    const updatedData = await queryDatabaseSingle<MonthlyIncome>(
      'SELECT * FROM monthly_income WHERE id = ?',
      [id]
    );

    return NextResponse.json(updatedData);
  } catch (error) {
    console.error('수입 데이터 수정 중 오류:', error);
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

    const sql = 'DELETE FROM monthly_income WHERE id = ? AND user_id = ?';
    await executeDatabase(sql, [id, userId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('수입 데이터 삭제 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
