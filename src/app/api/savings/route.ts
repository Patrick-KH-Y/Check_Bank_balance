import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 저축 목록 조회
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
    const accountId = searchParams.get('accountId');

    let query = supabase
      .from('monthly_savings')
      .select(`
        *,
        accounts:account_id (
          id,
          account_name,
          account_type,
          balance
        )
      `)
      .eq('user_id', user.id);

    // 년도와 월이 제공된 경우 필터링
    if (year && month) {
      query = query.eq('year', parseInt(year)).eq('month', parseInt(month));
    }

    // 특정 계좌로 필터링
    if (accountId) {
      query = query.eq('account_id', accountId);
    }

    const { data: savings, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('저축 조회 오류:', error);
      return NextResponse.json(
        { error: '저축 정보를 불러오는데 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: savings });
  } catch (error) {
    console.error('저축 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 새 저축 데이터 생성
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { 
      year, 
      month, 
      account_id, 
      target_amount, 
      actual_amount, 
      savings_type, 
      category, 
      description, 
      notes 
    } = body;

    // 필수 필드 검증
    if (!year || !month || target_amount === undefined || actual_amount === undefined || !savings_type) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 저축 유형 검증
    const validSavingsTypes = ['regular', 'emergency', 'investment', 'goal'];
    if (!validSavingsTypes.includes(savings_type)) {
      return NextResponse.json(
        { error: '유효하지 않은 저축 유형입니다.' },
        { status: 400 }
      );
    }

    // 목표 달성 여부 계산
    const is_achieved = actual_amount >= target_amount;

    // 새 저축 데이터 생성
    const { data: newSavings, error } = await supabase
      .from('monthly_savings')
      .insert({
        user_id: user.id,
        year,
        month,
        account_id,
        target_amount,
        actual_amount,
        savings_type,
        category,
        description,
        is_achieved,
        notes,
      })
      .select(`
        *,
        accounts:account_id (
          id,
          account_name,
          account_type,
          balance
        )
      `)
      .single();

    if (error) {
      console.error('저축 생성 오류:', error);
      return NextResponse.json(
        { error: '저축 데이터 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: newSavings }, { status: 201 });
  } catch (error) {
    console.error('저축 생성 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 저축 데이터 수정
export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { 
      id, 
      account_id, 
      target_amount, 
      actual_amount, 
      savings_type, 
      category, 
      description, 
      notes 
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: '저축 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 저축 데이터 소유권 확인
    const { data: existingSavings, error: fetchError } = await supabase
      .from('monthly_savings')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingSavings) {
      return NextResponse.json(
        { error: '저축 데이터를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 목표 달성 여부 계산
    const is_achieved = actual_amount >= target_amount;

    // 저축 데이터 업데이트
    const updateData: any = {};
    if (account_id !== undefined) updateData.account_id = account_id;
    if (target_amount !== undefined) updateData.target_amount = target_amount;
    if (actual_amount !== undefined) updateData.actual_amount = actual_amount;
    if (savings_type !== undefined) updateData.savings_type = savings_type;
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (notes !== undefined) updateData.notes = notes;
    updateData.is_achieved = is_achieved;
    updateData.updated_at = new Date().toISOString();

    const { data: updatedSavings, error } = await supabase
      .from('monthly_savings')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`
        *,
        accounts:account_id (
          id,
          account_name,
          account_type,
          balance
        )
      `)
      .single();

    if (error) {
      console.error('저축 수정 오류:', error);
      return NextResponse.json(
        { error: '저축 데이터 수정에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: updatedSavings });
  } catch (error) {
    console.error('저축 수정 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 저축 데이터 삭제
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: '저축 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 저축 데이터 소유권 확인
    const { data: existingSavings, error: fetchError } = await supabase
      .from('monthly_savings')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingSavings) {
      return NextResponse.json(
        { error: '저축 데이터를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 저축 데이터 삭제
    const { error } = await supabase
      .from('monthly_savings')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('저축 삭제 오류:', error);
      return NextResponse.json(
        { error: '저축 데이터 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: '저축 데이터가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('저축 삭제 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
