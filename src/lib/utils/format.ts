/**
 * 통화 포맷팅 유틸리티 함수
 */

/**
 * 숫자를 한국 원화 형식으로 포맷팅
 * @param amount - 포맷팅할 금액
 * @param currency - 통화 단위 (기본값: '원')
 * @returns 포맷팅된 통화 문자열
 */
export function formatCurrency(amount: number, currency: string = '원'): string {
  if (amount === 0) return `0${currency}`;
  
  return `${amount.toLocaleString('ko-KR')}${currency}`;
}

/**
 * 숫자를 퍼센트 형식으로 포맷팅
 * @param value - 퍼센트 값 (0-1 사이의 소수)
 * @param decimals - 소수점 자릿수 (기본값: 1)
 * @returns 포맷팅된 퍼센트 문자열
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  const percentage = value * 100;
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * 숫자를 간단한 단위로 포맷팅 (만, 억, 조)
 * @param amount - 포맷팅할 금액
 * @returns 포맷팅된 문자열
 */
export function formatCompactCurrency(amount: number): string {
  if (amount >= 1000000000000) {
    return `${(amount / 1000000000000).toFixed(1)}조원`;
  } else if (amount >= 100000000) {
    return `${(amount / 100000000).toFixed(1)}억원`;
  } else if (amount >= 10000) {
    return `${(amount / 10000).toFixed(1)}만원`;
  } else {
    return `${amount.toLocaleString()}원`;
  }
}

/**
 * 날짜를 한국어 형식으로 포맷팅
 * @param date - 포맷팅할 날짜
 * @returns 포맷팅된 날짜 문자열
 */
export function formatKoreanDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  
  return `${year}년 ${month}월 ${day}일`;
}

/**
 * 월을 한국어 형식으로 포맷팅
 * @param year - 년도
 * @param month - 월
 * @returns 포맷팅된 월 문자열
 */
export function formatKoreanMonth(year: number, month: number): string {
  return `${year}년 ${month}월`;
}

