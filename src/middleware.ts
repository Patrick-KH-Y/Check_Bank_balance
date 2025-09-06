import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate Limiting을 위한 간단한 메모리 저장소 (실제 운영에서는 Redis 사용 권장)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate Limiting 검증
function checkRateLimit(ip: string, path: string): boolean {
  const key = `${ip}:${path}`;
  const now = Date.now();
  const limit = rateLimitStore.get(key);

  if (!limit || now > limit.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + 60000 }); // 1분 제한
    return true;
  }

  if (limit.count >= 100) { // 1분 내 100회 제한
    return false;
  }

  limit.count++;
  return true;
}

// 보안 헤더 설정
function setSecurityHeaders(response: NextResponse): NextResponse {
  // XSS 보호
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // 클릭재킹 방지
  response.headers.set('X-Frame-Options', 'DENY');
  
  // MIME 타입 스니핑 방지
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // 참조자 정책
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // HSTS (HTTPS 강제)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
  );
  
  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );
  
  return response;
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Rate Limiting (API 라우트에만 적용)
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    
    if (!checkRateLimit(ip, request.nextUrl.pathname)) {
      return new NextResponse(
        JSON.stringify({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }),
        { 
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
  
  // 보안 헤더 설정
  setSecurityHeaders(response);
  
  // CORS 설정 (필요한 경우)
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  
  // OPTIONS 요청 처리 (CORS preflight)
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200 });
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};

