import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { queryDatabase, queryDatabaseSingle, executeDatabase, initializeDatabase } from '@/lib/database/sqlite';

interface FixedExpense {
  id: string;
  user_id: string;
  year: number;
  month: number;
  category: string;
  amount: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Zod 스키마 정의
const fixedExpenseCreateSchema = z.object({
  userId: z.string().min(1, 'userId는 필수입니다'),
  year: z.number().int().min(2020).max(2030, '년도는 2020-2030 사이여야 합니다'),
  month: z.number().int().min(1).max(12, '월은 1-12 사이여야 합니다'),
  category: z.string().min(1, '카테고리는 필수입니다'),
  amount: z.number().min(0, '금액은 0 이상이어야 합니다').max(1000000000, '금액이 너무 큽니다'),
  description: z.string().optional(),
});

const fixedExpenseUpdateSchema = z.object({
  id: z.string().min(1, 'id는 필수입니다'),
  userId: z.string().min(1, 'userId는 필수입니다'),
  year: z.number().int().min(2020).max(2030, '년도는 2020-2030 사이여야 합니다'),
  month: z.number().int().min(1).max(12, '월은 1-12 사이여야 합니다'),
  category: z.string().min(1, '카테고리는 필수입니다'),
  amount: z.number().min(0, '금액은 0 이상이어야 합니다').max(1000000000, '금액이 너무 큽니다'),
  description: z.string().optional(),
});

const queryParamsSchema = z.object({
  userId: z.string().min(1, 'userId는 필수입니다'),
  year: z.string().optional(),
  month: z.string().optional(),
});

const deleteParamsSchema = z.object({
  id: z.string().min(1, 'id는 필수입니다'),
  userId: z.string().min(1, 'userId는 필수입니다'),
});

// 고정 지출 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    // 입력값 검증
    const validationResult = queryParamsSchema.safeParse({ userId, year, month });
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: '입력값 검증 실패',
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { userId: validatedUserId, year: validatedYear, month: validatedMonth } = validationResult.data;

    await initializeDatabase();

    let sql = 'SELECT * FROM fixed_expenses WHERE user_id = ? AND is_active = 1';
    let params: any[] = [validatedUserId];

    if (validatedYear && validatedMonth) {
      const yearNum = parseInt(validatedYear);
      const monthNum = parseInt(validatedMonth);
      
      if (isNaN(yearNum) || isNaN(monthNum)) {
        return NextResponse.json(
          { error: '년도와 월은 숫자여야 합니다' },
          { status: 400 }
        );
      }
      
      sql += ' AND year = ? AND month = ?';
      params.push(yearNum, monthNum);
    }

    sql += ' ORDER BY created_at DESC';

    const fixedExpenses = await queryDatabase<FixedExpense>(sql, params);

    return NextResponse.json({
      success: true,
      data: fixedExpenses,
      count: fixedExpenses.length
    });
  } catch (error) {
    console.error('고정 지출 조회 중 오류:', error);
    return NextResponse.json(
      { 
        error: '서버 오류가 발생했습니다',
        message: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

// 고정 지출 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 입력값 검증
    const validationResult = fixedExpenseCreateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: '입력값 검증 실패',
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { userId, year, month, category, amount, description } = validationResult.data;

    await initializeDatabase();

    // 중복 체크 (같은 사용자의 같은 년월에 같은 카테고리가 있는지)
    const existingExpense = await queryDatabaseSingle<FixedExpense>(
      'SELECT * FROM fixed_expenses WHERE user_id = ? AND year = ? AND month = ? AND category = ? AND is_active = 1',
      [userId, year, month, category]
    );

    if (existingExpense) {
      return NextResponse.json(
        { error: '이미 같은 카테고리의 고정 지출이 존재합니다' },
        { status: 409 }
      );
    }

    const id = `fixed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const sql = `
      INSERT INTO fixed_expenses (id, user_id, year, month, category, amount, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    await executeDatabase(sql, [
      id, userId, year, month, category, amount, description || ''
    ]);

    const createdExpense = await queryDatabaseSingle<FixedExpense>(
      'SELECT * FROM fixed_expenses WHERE id = ?',
      [id]
    );

    if (!createdExpense) {
      throw new Error('생성된 고정 지출을 찾을 수 없습니다');
    }

    return NextResponse.json({
      success: true,
      data: createdExpense,
      message: '고정 지출이 성공적으로 생성되었습니다'
    });
  } catch (error) {
    console.error('고정 지출 생성 중 오류:', error);
    return NextResponse.json(
      { 
        error: '서버 오류가 발생했습니다',
        message: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

// 고정 지출 수정
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 입력값 검증
    const validationResult = fixedExpenseUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: '입력값 검증 실패',
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { id, userId, year, month, category, amount, description } = validationResult.data;

    await initializeDatabase();

    // 기존 데이터 존재 확인
    const existingExpense = await queryDatabaseSingle<FixedExpense>(
      'SELECT * FROM fixed_expenses WHERE id = ? AND user_id = ? AND is_active = 1',
      [id, userId]
    );

    if (!existingExpense) {
      return NextResponse.json(
        { error: '수정할 고정 지출을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 다른 고정 지출과 카테고리 중복 체크 (자신 제외)
    const duplicateExpense = await queryDatabaseSingle<FixedExpense>(
      'SELECT * FROM fixed_expenses WHERE user_id = ? AND year = ? AND month = ? AND category = ? AND id != ? AND is_active = 1',
      [userId, year, month, category, id]
    );

    if (duplicateExpense) {
      return NextResponse.json(
        { error: '이미 같은 카테고리의 고정 지출이 존재합니다' },
        { status: 409 }
      );
    }

    const sql = `
      UPDATE fixed_expenses 
      SET year = ?, month = ?, category = ?, amount = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `;
    
    await executeDatabase(sql, [
      year, month, category, amount, description || '', id, userId
    ]);

    const updatedExpense = await queryDatabaseSingle<FixedExpense>(
      'SELECT * FROM fixed_expenses WHERE id = ?',
      [id]
    );

    if (!updatedExpense) {
      throw new Error('수정된 고정 지출을 찾을 수 없습니다');
    }

    return NextResponse.json({
      success: true,
      data: updatedExpense,
      message: '고정 지출이 성공적으로 수정되었습니다'
    });
  } catch (error) {
    console.error('고정 지출 수정 중 오류:', error);
    return NextResponse.json(
      { 
        error: '서버 오류가 발생했습니다',
        message: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

// 고정 지출 삭제 (소프트 삭제)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    // 입력값 검증
    const validationResult = deleteParamsSchema.safeParse({ id, userId });
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: '입력값 검증 실패',
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { id: validatedId, userId: validatedUserId } = validationResult.data;

    await initializeDatabase();

    // 기존 데이터 존재 확인
    const existingExpense = await queryDatabaseSingle<FixedExpense>(
      'SELECT * FROM fixed_expenses WHERE id = ? AND user_id = ? AND is_active = 1',
      [validatedId, validatedUserId]
    );

    if (!existingExpense) {
      return NextResponse.json(
        { error: '삭제할 고정 지출을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    const sql = `
      UPDATE fixed_expenses 
      SET is_active = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `;
    
    await executeDatabase(sql, [validatedId, validatedUserId]);

    return NextResponse.json({
      success: true,
      message: '고정 지출이 성공적으로 삭제되었습니다'
    });
  } catch (error) {
    console.error('고정 지출 삭제 중 오류:', error);
    return NextResponse.json(
      { 
        error: '서버 오류가 발생했습니다',
        message: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}
