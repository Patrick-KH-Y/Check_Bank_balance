import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 저축 통계 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // URL 파라미터에서 년도와 월 추출
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    if (!year || !month) {
      return NextResponse.json(
        { error: '년도와 월이 필요합니다.' },
        { status: 400 }
      );
    }

    // Supabase RPC 함수 호출하여 통계 계산
    const { data: statistics, error } = await supabase.rpc(
      'get_savings_statistics',
      {
        p_user_id: user.id,
        p_year: parseInt(year),
        p_month: parseInt(month)
      }
    );

    if (error) {
      console.error('저축 통계 조회 오류:', error);
      return NextResponse.json(
        { error: '저축 통계를 불러오는데 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: statistics });
  } catch (error) {
    console.error('저축 통계 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
