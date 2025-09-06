import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateInputData, yearSchema, monthSchema } from '@/lib/security/input-validation';
import { z } from 'zod';

// 감사 로그 조회 스키마
const auditLogQuerySchema = z.object({
  year: yearSchema.optional(),
  month: monthSchema.optional(),
  table_name: z.string().optional(),
  action: z.enum(['INSERT', 'UPDATE', 'DELETE']).optional(),
  limit: z.number().min(1).max(100).optional().default(50),
  offset: z.number().min(0).optional().default(0),
});

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

// 감사 로그 조회
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
    
    // 쿼리 파라미터 검증
    const { searchParams } = new URL(request.url);
    const queryParams = {
      year: searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined,
      month: searchParams.get('month') ? parseInt(searchParams.get('month')!) : undefined,
      table_name: searchParams.get('table_name') || undefined,
      action: searchParams.get('action') as 'INSERT' | 'UPDATE' | 'DELETE' | undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    };
    
    const validation = validateInputData(queryParams, auditLogQuerySchema);
    if (!validation.success) {
      return setSecurityHeaders(
        NextResponse.json({ 
          error: '쿼리 파라미터가 유효하지 않습니다.', 
          details: 'errors' in validation ? validation.errors : []
        }, { status: 400 })
      );
    }
    
    const { year, month, table_name, action, limit, offset } = validation.data;
    
    // 감사 로그 조회 쿼리 구성
    let query = supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // 필터 적용
    if (year) {
      query = query.eq('year', year);
    }
    
    if (month) {
      query = query.eq('month', month);
    }
    
    if (table_name) {
      query = query.eq('table_name', table_name);
    }
    
    if (action) {
      query = query.eq('action', action);
    }
    
    const { data: auditLogs, error, count } = await query;
    
    if (error) {
      console.error('감사 로그 조회 오류:', error);
      return setSecurityHeaders(
        NextResponse.json({ error: '감사 로그 조회에 실패했습니다.' }, { status: 500 })
      );
    }
    
    // 총 개수 조회
    let totalCount = 0;
    if (count !== null) {
      totalCount = count;
    } else {
      const { count: total } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      totalCount = total || 0;
    }
    
    return setSecurityHeaders(
      NextResponse.json({
        data: auditLogs,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount,
        },
      })
    );
    
  } catch (error) {
    console.error('감사 로그 조회 중 오류 발생:', error);
    return setSecurityHeaders(
      NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
    );
  }
}

// 감사 로그 생성 (시스템 내부용)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return setSecurityHeaders(
        NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
      );
    }
    
    const body = await request.json();
    
    // 감사 로그 데이터 검증
    const auditLogSchema = z.object({
      table_name: z.string().min(1).max(100),
      record_id: z.string().uuid(),
      action: z.enum(['INSERT', 'UPDATE', 'DELETE']),
      old_values: z.record(z.any()).optional(),
      new_values: z.record(z.any()).optional(),
      ip_address: z.string().ip().optional(),
      user_agent: z.string().max(500).optional(),
    });
    
    const validation = validateInputData(body, auditLogSchema);
    if (!validation.success) {
      return setSecurityHeaders(
        NextResponse.json({
          error: '감사 로그 데이터가 유효하지 않습니다.',       
          details: 'errors' in validation ? validation.errors : []
        }, { status: 400 })
      );
    }
    
    const { table_name, record_id, action, old_values, new_values, ip_address, user_agent } = validation.data;
    
    // 감사 로그 생성
    const auditLogData = {
      user_id: user.id,
      table_name,
      record_id,
      action,
      old_values: old_values || null,
      new_values: new_values || null,
      ip_address: ip_address || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
      user_agent: user_agent || request.headers.get('user-agent') || null,
    };
    
    const { data: newAuditLog, error } = await supabase
      .from('audit_logs')
      .insert(auditLogData)
      .select()
      .single();
    
    if (error) {
      console.error('감사 로그 생성 오류:', error);
      return setSecurityHeaders(
        NextResponse.json({ error: '감사 로그 생성에 실패했습니다.' }, { status: 500 })
      );
    }
    
    return setSecurityHeaders(
      NextResponse.json({ data: newAuditLog }, { status: 201 })
    );
    
  } catch (error) {
    console.error('감사 로그 생성 중 오류 발생:', error);
    return setSecurityHeaders(
      NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
    );
  }
}

