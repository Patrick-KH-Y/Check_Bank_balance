/**
 * 입력 데이터 검증 및 Sanitization 유틸리티
 * XSS, SQL Injection, 데이터 무결성 검증을 위한 함수들
 */

import { z } from 'zod';

// 기본 검증 스키마
export const amountSchema = z.number()
  .min(0, '금액은 0 이상이어야 합니다')
  .max(999999999999.99, '금액이 너무 큽니다')
  .multipleOf(0.01, '금액은 소수점 둘째 자리까지 허용됩니다');

export const yearSchema = z.number()
  .int('년도는 정수여야 합니다')
  .min(1900, '년도는 1900년 이상이어야 합니다')
  .max(2100, '년도는 2100년 이하여야 합니다');

export const monthSchema = z.number()
  .int('월은 정수여야 합니다')
  .min(1, '월은 1 이상이어야 합니다')
  .max(12, '월은 12 이하여야 합니다');

export const accountNameSchema = z.string()
  .min(1, '계좌명은 필수입니다')
  .max(100, '계좌명은 100자 이하여야 합니다')
  .regex(/^[a-zA-Z0-9가-힣\s\-_()]+$/, '계좌명에 특수문자를 사용할 수 없습니다');

export const accountTypeSchema = z.enum(['checking', 'savings', 'investment', 'credit'], {
  errorMap: () => ({ message: '유효하지 않은 계좌 유형입니다' })
});

export const savingsTypeSchema = z.enum(['regular', 'emergency', 'investment', 'goal'], {
  errorMap: () => ({ message: '유효하지 않은 저축 유형입니다' })
});

export const currencySchema = z.string()
  .length(3, '통화 코드는 3자리여야 합니다')
  .regex(/^[A-Z]{3}$/, '통화 코드는 대문자 3자리여야 합니다');

// 복합 검증 스키마
export const accountFormSchema = z.object({
  account_name: accountNameSchema,
  account_type: accountTypeSchema,
  balance: amountSchema,
  currency: currencySchema.optional().default('KRW'),
});

export const savingsFormSchema = z.object({
  year: yearSchema,
  month: monthSchema,
  account_id: z.string().uuid('유효하지 않은 계좌 ID입니다').optional(),
  target_amount: amountSchema,
  actual_amount: amountSchema,
  savings_type: savingsTypeSchema,
  category: z.string().max(100, '카테고리는 100자 이하여야 합니다').optional(),
  description: z.string().max(500, '설명은 500자 이하여야 합니다').optional(),
  notes: z.string().max(1000, '메모는 1000자 이하여야 합니다').optional(),
});

export const incomeFormSchema = z.object({
  year: yearSchema,
  month: monthSchema,
  경훈_월급: amountSchema,
  선화_월급: amountSchema,
  other_income: amountSchema.optional().default(0),
  notes: z.string().max(1000, '메모는 1000자 이하여야 합니다').optional(),
});

export const expenseFormSchema = z.object({
  year: yearSchema,
  month: monthSchema,
  housing: amountSchema.optional().default(0),
  food: amountSchema.optional().default(0),
  transportation: amountSchema.optional().default(0),
  utilities: amountSchema.optional().default(0),
  healthcare: amountSchema.optional().default(0),
  entertainment: amountSchema.optional().default(0),
  other_expenses: amountSchema.optional().default(0),
  notes: z.string().max(1000, '메모는 1000자 이하여야 합니다').optional(),
});

// XSS 방지를 위한 HTML Sanitization
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // HTML 태그 제거
  const withoutTags = input.replace(/<[^>]*>/g, '');
  
  // 특수 문자 이스케이프
  const escaped = withoutTags
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  return escaped;
}

// SQL Injection 방지를 위한 문자열 검증
export function validateSqlString(input: string): boolean {
  if (typeof input !== 'string') {
    return false;
  }

  // 위험한 SQL 키워드나 특수 문자 검사
  const dangerousPatterns = [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script|javascript|vbscript|onload|onerror|onclick)\b)/i,
    /[;'"\\]/, // 세미콜론, 따옴표, 백슬래시
    /--/, // SQL 주석
    /\/\*/, // SQL 블록 주석
    /\*\//, // SQL 블록 주석 종료
  ];

  return !dangerousPatterns.some(pattern => pattern.test(input));
}

// 금액 데이터 검증 및 정규화
export function validateAndNormalizeAmount(amount: number | string): number | null {
  try {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numAmount) || !isFinite(numAmount)) {
      return null;
    }

    // 소수점 둘째 자리로 반올림
    const rounded = Math.round(numAmount * 100) / 100;
    
    if (rounded < 0 || rounded > 999999999999.99) {
      return null;
    }

    return rounded;
  } catch {
    return null;
  }
}

// 날짜 데이터 검증
export function validateDate(year: number, month: number): boolean {
  try {
    if (!Number.isInteger(year) || !Number.isInteger(month)) {
      return false;
    }

    if (year < 1900 || year > 2100) {
      return false;
    }

    if (month < 1 || month > 12) {
      return false;
    }

    // 실제 유효한 날짜인지 확인
    const date = new Date(year, month - 1, 1);
    return date.getFullYear() === year && date.getMonth() === month - 1;
  } catch {
    return false;
  }
}

// UUID 검증
export function validateUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// 이메일 검증
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 비밀번호 강도 검증
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length < 8) {
    feedback.push('비밀번호는 최소 8자 이상이어야 합니다');
  } else {
    score += 1;
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('소문자를 포함해야 합니다');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('대문자를 포함해야 합니다');
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('숫자를 포함해야 합니다');
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('특수문자를 포함하는 것을 권장합니다');
  }

  const isValid = score >= 4 && password.length >= 8;

  return {
    isValid,
    score,
    feedback: isValid ? [] : feedback,
  };
}

// 입력 데이터 전체 검증 함수
export function validateInputData<T>(
  data: T,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => err.message);
      return { success: false, errors };
    }
    return { success: false, errors: ['알 수 없는 검증 오류가 발생했습니다'] };
  }
}

// 보안 헤더 검증
export function validateSecurityHeaders(headers: Record<string, string>): {
  isValid: boolean;
  missingHeaders: string[];
} {
  const requiredHeaders = [
    'x-content-type-options',
    'x-frame-options',
    'x-xss-protection',
    'referrer-policy',
  ];

  const missingHeaders = requiredHeaders.filter(
    header => !headers[header] && !headers[header.toLowerCase()]
  );

  return {
    isValid: missingHeaders.length === 0,
    missingHeaders,
  };
}

// Rate Limiting을 위한 간단한 검증
export function validateRateLimit(
  userId: string,
  action: string,
  currentCount: number,
  maxCount: number,
  timeWindow: number
): boolean {
  // 실제 구현에서는 Redis나 데이터베이스를 사용하여 더 정교한 제어 필요
  return currentCount < maxCount;
}

// 파일 업로드 검증
export function validateFileUpload(
  file: File,
  maxSize: number = 5 * 1024 * 1024, // 5MB
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
): { isValid: boolean; error?: string } {
  if (file.size > maxSize) {
    return { isValid: false, error: '파일 크기가 너무 큽니다' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: '허용되지 않는 파일 형식입니다' };
  }

  return { isValid: true };
}

// CSRF 토큰 검증 (간단한 구현)
export function validateCsrfToken(token: string, expectedToken: string): boolean {
  return token === expectedToken;
}

// 입력 길이 제한 및 정규화
export function normalizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') {
    return '';
  }

  // 앞뒤 공백 제거
  let normalized = input.trim();
  
  // 연속된 공백을 하나로
  normalized = normalized.replace(/\s+/g, ' ');
  
  // 길이 제한
  if (normalized.length > maxLength) {
    normalized = normalized.substring(0, maxLength);
  }

  return normalized;
}

// 숫자 입력 정규화
export function normalizeNumber(input: number | string): number | null {
  try {
    const num = typeof input === 'string' ? parseFloat(input) : input;
    
    if (isNaN(num) || !isFinite(num)) {
      return null;
    }

    return num;
  } catch {
    return null;
  }
}

// 날짜 입력 정규화
export function normalizeDate(input: string | Date): Date | null {
  try {
    if (input instanceof Date) {
      return input;
    }

    const date = new Date(input);
    
    if (isNaN(date.getTime())) {
      return null;
    }

    return date;
  } catch {
    return null;
  }
}
