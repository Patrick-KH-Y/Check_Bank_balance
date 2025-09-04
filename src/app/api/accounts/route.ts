import { NextRequest, NextResponse } from 'next/server';
import { queryDatabase, executeDatabase, initializeDatabase } from '@/lib/database/sqlite';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    if (!year || !month) {
      return NextResponse.json(
        { error: 'year, month 파라미터가 필요합니다.' },
        { status: 400 }
      );
    }

    // 데이터베이스 초기화
    await initializeDatabase();

    const sql = `
      SELECT * FROM accounts 
      WHERE is_active = 1
      ORDER BY created_at DESC
    `;
    
    const accounts = await queryDatabase(sql);

    return NextResponse.json(accounts);
  } catch (error) {
    console.error('통장 데이터 조회 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, accountName, accountType, balance, currency } = body;

    if (!userId || !accountName || !accountType) {
      return NextResponse.json(
        { error: 'userId, accountName, accountType는 필수 필드입니다.' },
        { status: 400 }
      );
    }

    // 데이터베이스 초기화
    await initializeDatabase();

    const id = `acc-${Date.now()}`;
    
    const sql = `
      INSERT INTO accounts 
      (id, user_id, account_name, account_type, balance, currency, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `;
    
    await executeDatabase(sql, [
      id, userId, accountName, accountType, balance || 0, currency || 'KRW'
    ]);

    // 생성된 데이터 조회
    const createdAccounts = await queryDatabase(
      'SELECT * FROM accounts WHERE id = ?',
      [id]
    );

    return NextResponse.json(createdAccounts[0]);
  } catch (error) {
    console.error('통장 데이터 저장 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, userId, accountName, accountType, balance, currency } = body;

    if (!id || !userId) {
      return NextResponse.json(
        { error: 'id와 userId는 필수 필드입니다.' },
        { status: 400 }
      );
    }

    // 데이터베이스 초기화
    await initializeDatabase();

    const sql = `
      UPDATE accounts 
      SET account_name = ?, account_type = ?, balance = ?, 
          currency = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `;
    
    await executeDatabase(sql, [
      accountName, accountType, balance || 0, currency || 'KRW',
      id, userId
    ]);

    // 수정된 데이터 조회
    const updatedAccounts = await queryDatabase(
      'SELECT * FROM accounts WHERE id = ?',
      [id]
    );

    return NextResponse.json(updatedAccounts[0]);
  } catch (error) {
    console.error('통장 데이터 수정 중 오류:', error);
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

    const sql = 'UPDATE accounts SET is_active = 0 WHERE id = ? AND user_id = ?';
    await executeDatabase(sql, [id, userId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('통장 데이터 삭제 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
