export interface SecurityConfig {
  // 암호화 설정
  encryption: {
    enabled: boolean;
    algorithm: string;
    keySize: number;
    ivSize: number;
  };
  
  // Rate Limiting 설정
  rateLimiting: {
    enabled: boolean;
    maxRequestsPerMinute: number;
    maxRequestsPerHour: number;
    blockDuration: number; // 분 단위
  };
  
  // 보안 헤더 설정
  securityHeaders: {
    enabled: boolean;
    hsts: boolean;
    csp: boolean;
    xssProtection: boolean;
    frameOptions: boolean;
    contentTypeOptions: boolean;
  };
  
  // 감사 로깅 설정
  auditLogging: {
    enabled: boolean;
    logLevel: 'minimal' | 'standard' | 'detailed';
    retentionDays: number;
    sensitiveFields: string[];
  };
  
  // 세션 관리 설정
  session: {
    secret: string;
    maxAge: number;
    secure: boolean;
    httpOnly: boolean;
    sameSite: 'strict' | 'lax' | 'none';
  };
  
  // CORS 설정
  cors: {
    enabled: boolean;
    allowedOrigins: string[];
    allowedMethods: string[];
    allowedHeaders: string[];
    credentials: boolean;
  };
}

// 환경 변수에서 설정 로드
export function loadSecurityConfig(): SecurityConfig {
  return {
    encryption: {
      enabled: process.env.NEXT_PUBLIC_ENCRYPTION_ENABLED === 'true',
      algorithm: process.env.NEXT_PUBLIC_ENCRYPTION_ALGORITHM || 'AES-GCM',
      keySize: parseInt(process.env.NEXT_PUBLIC_ENCRYPTION_KEY_SIZE || '256'),
      ivSize: parseInt(process.env.NEXT_PUBLIC_ENCRYPTION_IV_SIZE || '12'),
    },
    
    rateLimiting: {
      enabled: process.env.NEXT_PUBLIC_RATE_LIMITING_ENABLED === 'true',
      maxRequestsPerMinute: parseInt(process.env.NEXT_PUBLIC_RATE_LIMIT_PER_MINUTE || '100'),
      maxRequestsPerHour: parseInt(process.env.NEXT_PUBLIC_RATE_LIMIT_PER_HOUR || '1000'),
      blockDuration: parseInt(process.env.NEXT_PUBLIC_RATE_LIMIT_BLOCK_DURATION || '15'),
    },
    
    securityHeaders: {
      enabled: process.env.NEXT_PUBLIC_SECURITY_HEADERS_ENABLED === 'true',
      hsts: process.env.NEXT_PUBLIC_HSTS_ENABLED === 'true',
      csp: process.env.NEXT_PUBLIC_CSP_ENABLED === 'true',
      xssProtection: process.env.NEXT_PUBLIC_XSS_PROTECTION_ENABLED === 'true',
      frameOptions: process.env.NEXT_PUBLIC_FRAME_OPTIONS_ENABLED === 'true',
      contentTypeOptions: process.env.NEXT_PUBLIC_CONTENT_TYPE_OPTIONS_ENABLED === 'true',
    },
    
    auditLogging: {
      enabled: process.env.NEXT_PUBLIC_AUDIT_LOGGING_ENABLED === 'true',
      logLevel: (process.env.NEXT_PUBLIC_AUDIT_LOG_LEVEL as 'minimal' | 'standard' | 'detailed') || 'standard',
      retentionDays: parseInt(process.env.NEXT_PUBLIC_AUDIT_LOG_RETENTION_DAYS || '90'),
      sensitiveFields: (process.env.NEXT_PUBLIC_SENSITIVE_FIELDS || 'password,ssn,credit_card').split(','),
    },
    
    session: {
      secret: process.env.SESSION_SECRET || 'default-session-secret-change-in-production',
      maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400'), // 24시간
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: (process.env.SESSION_SAME_SITE as 'strict' | 'lax' | 'none') || 'strict',
    },
    
    cors: {
      enabled: process.env.NEXT_PUBLIC_CORS_ENABLED === 'true',
      allowedOrigins: (process.env.NEXT_PUBLIC_CORS_ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
      allowedMethods: (process.env.NEXT_PUBLIC_CORS_ALLOWED_METHODS || 'GET,POST,PUT,DELETE,OPTIONS').split(','),
      allowedHeaders: (process.env.NEXT_PUBLIC_CORS_ALLOWED_HEADERS || 'Content-Type,Authorization').split(','),
      credentials: process.env.NEXT_PUBLIC_CORS_CREDENTIALS === 'true',
    },
  };
}

// 개발 환경용 기본 설정
export const defaultSecurityConfig: SecurityConfig = {
  encryption: {
    enabled: true,
    algorithm: 'AES-GCM',
    keySize: 256,
    ivSize: 12,
  },
  
  rateLimiting: {
    enabled: true,
    maxRequestsPerMinute: 100,
    maxRequestsPerHour: 1000,
    blockDuration: 15,
  },
  
  securityHeaders: {
    enabled: true,
    hsts: false, // 개발 환경에서는 비활성화
    csp: true,
    xssProtection: true,
    frameOptions: true,
    contentTypeOptions: true,
  },
  
  auditLogging: {
    enabled: true,
    logLevel: 'standard',
    retentionDays: 30,
    sensitiveFields: ['password', 'ssn', 'credit_card'],
  },
  
  session: {
    secret: 'dev-session-secret',
    maxAge: 86400,
    secure: false,
    httpOnly: true,
    sameSite: 'lax',
  },
  
  cors: {
    enabled: true,
    allowedOrigins: ['http://localhost:3000'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
};

// 현재 환경에 따른 설정 반환
export function getSecurityConfig(): SecurityConfig {
  if (process.env.NODE_ENV === 'development') {
    return defaultSecurityConfig;
  }
  
  return loadSecurityConfig();
}

// 설정 유효성 검증
export function validateSecurityConfig(config: SecurityConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (config.encryption.enabled) {
    if (!process.env.NEXT_PUBLIC_ENCRYPTION_KEY) {
      errors.push('암호화가 활성화되었지만 암호화 키가 설정되지 않았습니다.');
    }
    
    if (config.encryption.keySize < 128) {
      errors.push('암호화 키 크기는 최소 128비트여야 합니다.');
    }
  }
  
  if (config.rateLimiting.enabled) {
    if (config.rateLimiting.maxRequestsPerMinute < 10) {
      errors.push('분당 최대 요청 수는 최소 10회여야 합니다.');
    }
    
    if (config.rateLimiting.maxRequestsPerHour < 100) {
      errors.push('시간당 최대 요청 수는 최소 100회여야 합니다.');
    }
  }
  
  if (config.session.secret === 'default-session-secret-change-in-production') {
    errors.push('프로덕션 환경에서는 기본 세션 시크릿을 변경해야 합니다.');
  }
  
  if (config.securityHeaders.hsts && process.env.NODE_ENV !== 'production') {
    errors.push('HSTS는 프로덕션 환경에서만 활성화해야 합니다.');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

