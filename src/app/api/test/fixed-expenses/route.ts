import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 테스트용 스키마
const testFixedExpenseSchema = z.object({
  userId: z.string().min(1, 'userId는 필수입니다'),
  year: z.number().int().min(2020).max(2030, '년도는 2020-2030 사이여야 합니다'),
  month: z.number().int().min(1).max(12, '월은 1-12 사이여야 합니다'),
  category: z.string().min(1, '카테고리는 필수입니다'),
  amount: z.number().min(0, '금액은 0 이상이어야 합니다').max(1000000000, '금액이 너무 큽니다'),
  description: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 입력값 검증 테스트
    const validationResult = testFixedExpenseSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: '입력값 검증 실패',
        details: validationResult.error.errors,
        testType: 'validation'
      }, { status: 400 });
    }

    // 성공적인 검증 결과 반환
    return NextResponse.json({
      success: true,
      message: '입력값 검증 성공',
      validatedData: validationResult.data,
      testType: 'validation'
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '테스트 중 오류 발생',
      message: error instanceof Error ? error.message : '알 수 없는 오류',
      testType: 'error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testType = searchParams.get('type') || 'info';

    switch (testType) {
      case 'validation':
        return NextResponse.json({
          success: true,
          message: '검증 테스트 엔드포인트',
          availableTests: [
            'POST /api/test/fixed-expenses - 입력값 검증 테스트',
            'GET /api/test/fixed-expenses?type=validation - 검증 정보'
          ],
          testSchema: {
            userId: 'string (required)',
            year: 'number (2020-2030)',
            month: 'number (1-12)',
            category: 'string (required)',
            amount: 'number (0-1000000000)',
            description: 'string (optional)'
          }
        });

      case 'error':
        // 의도적으로 에러 발생 테스트
        throw new Error('테스트용 에러');

      default:
        return NextResponse.json({
          success: true,
          message: '고정 지출 API 테스트 엔드포인트',
          endpoints: {
            'POST /api/test/fixed-expenses': '입력값 검증 테스트',
            'GET /api/test/fixed-expenses?type=validation': '검증 스키마 정보',
            'GET /api/test/fixed-expenses?type=error': '에러 처리 테스트'
          },
          usage: 'POST 요청으로 테스트 데이터를 보내면 검증 결과를 반환합니다.'
        });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '테스트 중 오류 발생',
      message: error instanceof Error ? error.message : '알 수 없는 오류',
      testType: 'error'
    }, { status: 500 });
  }
}

