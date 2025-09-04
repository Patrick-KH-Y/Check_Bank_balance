import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 보안 헤더 설정
function setSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  return response;
}

// 보안 통계 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return setSecurityHeaders(
        NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
      );
    }
    
    // 쿼리 파라미터에서 기간 설정
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // 기본 30일
    const days = parseInt(period);
    
    if (isNaN(days) || days < 1 || days > 365) {
      return setSecurityHeaders(
        NextResponse.json({ error: '유효하지 않은 기간입니다. 1-365일 사이의 값을 입력해주세요.' }, { status: 400 })
      );
    }
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // 1. 총 보안 이벤트 수
    const { count: totalEvents, error: eventsError } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());
    
    if (eventsError) {
      console.error('총 이벤트 수 조회 오류:', eventsError);
    }
    
    // 2. 의심스러운 활동 수
    const { count: suspiciousActivities, error: suspiciousError } = await supabase
      .from('suspicious_activity')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());
    
    if (suspiciousError) {
      console.error('의심스러운 활동 수 조회 오류:', suspiciousError);
    }
    
    // 3. 실패한 로그인 시도 수 (사용자별로 추적)
    const { count: failedLogins, error: loginError } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('action', 'LOGIN_FAILED')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());
    
    if (loginError) {
      console.error('실패한 로그인 시도 수 조회 오류:', loginError);
    }
    
    // 4. 데이터 변경 활동 분석
    const { data: dataChanges, error: changesError } = await supabase
      .from('audit_logs')
      .select('action, table_name, created_at')
      .eq('user_id', user.id)
      .in('action', ['INSERT', 'UPDATE', 'DELETE'])
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });
    
    if (changesError) {
      console.error('데이터 변경 활동 조회 오류:', changesError);
    }
    
    // 5. 테이블별 활동 분석
    const tableActivity = dataChanges?.reduce((acc, log) => {
      const table = log.table_name;
      const action = log.action;
      
      if (!acc[table]) {
        acc[table] = { INSERT: 0, UPDATE: 0, DELETE: 0, total: 0 };
      }
      
      acc[table][action]++;
      acc[table].total++;
      
      return acc;
    }, {} as Record<string, { INSERT: number; UPDATE: number; DELETE: number; total: number }>) || {};
    
    // 6. 일별 활동 추이
    const dailyActivity = dataChanges?.reduce((acc, log) => {
      const date = new Date(log.created_at).toISOString().split('T')[0];
      
      if (!acc[date]) {
        acc[date] = 0;
      }
      
      acc[date]++;
      return acc;
    }, {} as Record<string, number>) || {};
    
    // 7. 암호화 상태 확인
    const { data: encryptionStatus, error: encryptionError } = await supabase
      .rpc('get_encryption_status', { user_id_param: user.id });
    
    if (encryptionError) {
      console.error('암호화 상태 조회 오류:', encryptionError);
    }
    
    // 8. 보안 점수 계산 (0-100)
    let securityScore = 100;
    
    // 의심스러운 활동이 있으면 점수 감점
    if (suspiciousActivities && suspiciousActivities > 0) {
      securityScore -= Math.min(30, suspiciousActivities * 5);
    }
    
    // 실패한 로그인 시도가 많으면 점수 감점
    if (failedLogins && failedLogins > 5) {
      securityScore -= Math.min(20, (failedLogins - 5) * 2);
    }
    
    // 데이터 변경 활동이 없으면 점수 감점 (비활성 계정)
    if (totalEvents === 0) {
      securityScore -= 10;
    }
    
    securityScore = Math.max(0, securityScore);
    
    // 9. 보안 권장사항 생성
    const recommendations: string[] = [];
    
    if (suspiciousActivities && suspiciousActivities > 0) {
      recommendations.push('의심스러운 활동이 감지되었습니다. 계정 보안을 확인해주세요.');
    }
    
    if (failedLogins && failedLogins > 5) {
      recommendations.push('로그인 실패가 많습니다. 비밀번호를 변경하는 것을 권장합니다.');
    }
    
    if (securityScore < 70) {
      recommendations.push('보안 점수가 낮습니다. 보안 설정을 점검해주세요.');
    }
    
    if (Object.keys(tableActivity).length === 0) {
      recommendations.push('데이터 활동이 없습니다. 정기적인 데이터 백업을 권장합니다.');
    }
    
    const statistics = {
      period: {
        days,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      metrics: {
        totalEvents: totalEvents || 0,
        suspiciousActivities: suspiciousActivities || 0,
        failedLogins: failedLogins || 0,
        securityScore,
      },
      dataActivity: {
        tableActivity,
        dailyActivity,
        totalChanges: dataChanges?.length || 0,
      },
      encryption: {
        status: encryptionStatus || 'unknown',
        enabled: encryptionStatus === 'active',
      },
      recommendations,
      lastUpdated: new Date().toISOString(),
    };
    
    return setSecurityHeaders(
      NextResponse.json({ data: statistics })
    );
    
  } catch (error) {
    console.error('보안 통계 조회 중 오류 발생:', error);
    return setSecurityHeaders(
      NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
    );
  }
}

