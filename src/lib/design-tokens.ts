// 디자인 시스템 토큰 및 유틸리티
export const designTokens = {
  // 색상 팔레트
  colors: {
    // 주요 브랜드 색상
    primary: {
      50: 'hsl(210, 100%, 98%)',
      100: 'hsl(210, 100%, 96%)',
      200: 'hsl(214, 95%, 93%)',
      300: 'hsl(213, 97%, 87%)',
      400: 'hsl(215, 95%, 78%)',
      500: 'hsl(215, 91%, 65%)',
      600: 'hsl(215, 88%, 56%)',
      700: 'hsl(215, 84%, 47%)',
      800: 'hsl(215, 79%, 39%)',
      900: 'hsl(215, 75%, 32%)',
      950: 'hsl(215, 80%, 22%)',
    },
    
    // 재무 관련 색상
    financial: {
      income: 'hsl(142, 76%, 36%)',      // 수입 - 녹색
      expense: 'hsl(0, 84%, 60%)',       // 지출 - 빨간색
      savings: 'hsl(199, 89%, 48%)',     // 저축 - 파란색
      balance: 'hsl(45, 93%, 47%)',      // 잔액 - 노란색
      neutral: 'hsl(220, 13%, 91%)',     // 중립 - 회색
    },
    
    // 상태 색상
    status: {
      success: 'hsl(142, 76%, 36%)',
      warning: 'hsl(38, 92%, 50%)',
      error: 'hsl(0, 84%, 60%)',
      info: 'hsl(199, 89%, 48%)',
    },
    
    // 그레이스케일
    gray: {
      50: 'hsl(0, 0%, 98%)',
      100: 'hsl(0, 0%, 96%)',
      200: 'hsl(0, 0%, 90%)',
      300: 'hsl(0, 0%, 83%)',
      400: 'hsl(0, 0%, 64%)',
      500: 'hsl(0, 0%, 45%)',
      600: 'hsl(0, 0%, 32%)',
      700: 'hsl(0, 0%, 25%)',
      800: 'hsl(0, 0%, 15%)',
      900: 'hsl(0, 0%, 9%)',
    },
  },
  
  // 타이포그래피
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  
  // 간격 시스템
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
  },
  
  // 그림자
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  
  // 애니메이션
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  
  // 브레이크포인트
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // 접근성
  accessibility: {
    focusRing: {
      offset: '2px',
      width: '2px',
      color: 'hsl(215, 88%, 56%)',
    },
    contrast: {
      minimum: 4.5,  // WCAG AA 기준
      enhanced: 7,   // WCAG AAA 기준
    },
  },
} as const;

// 색상 대비 계산 유틸리티
export function calculateContrastRatio(color1: string, color2: string): number {
  // 간단한 대비 계산 (실제로는 더 정확한 계산 필요)
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  
  const r1 = parseInt(hex1.substr(0, 2), 16);
  const g1 = parseInt(hex1.substr(2, 2), 16);
  const b1 = parseInt(hex1.substr(4, 2), 16);
  
  const r2 = parseInt(hex2.substr(0, 2), 16);
  const g2 = parseInt(hex2.substr(2, 2), 16);
  const b2 = parseInt(hex2.substr(4, 2), 16);
  
  const luminance1 = (0.299 * r1 + 0.587 * g1 + 0.114 * b1) / 255;
  const luminance2 = (0.299 * r2 + 0.587 * g2 + 0.114 * b2) / 255;
  
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

// 접근성 색상 검증
export function validateAccessibilityColors(
  foreground: string, 
  background: string
): { isValid: boolean; contrastRatio: number; message: string } {
  const contrastRatio = calculateContrastRatio(foreground, background);
  
  if (contrastRatio >= designTokens.accessibility.contrast.enhanced) {
    return {
      isValid: true,
      contrastRatio,
      message: '우수한 대비 (WCAG AAA)',
    };
  } else if (contrastRatio >= designTokens.accessibility.contrast.minimum) {
    return {
      isValid: true,
      contrastRatio,
      message: '적절한 대비 (WCAG AA)',
    };
  } else {
    return {
      isValid: false,
      contrastRatio,
      message: '부족한 대비 - 접근성 기준 미달',
    };
  }
}

// 반응형 유틸리티
export const responsive = {
  sm: (value: string) => `@media (min-width: ${designTokens.breakpoints.sm}) { ${value} }`,
  md: (value: string) => `@media (min-width: ${designTokens.breakpoints.md}) { ${value} }`,
  lg: (value: string) => `@media (min-width: ${designTokens.breakpoints.lg}) { ${value} }`,
  xl: (value: string) => `@media (min-width: ${designTokens.breakpoints.xl}) { ${value} }`,
  '2xl': (value: string) => `@media (min-width: ${designTokens.breakpoints['2xl']}) { ${value} }`,
};

// 애니메이션 유틸리티
export const animations = {
  fadeIn: 'animate-in fade-in duration-300',
  fadeOut: 'animate-out fade-out duration-300',
  slideIn: 'animate-in slide-in-from-bottom-4 duration-300',
  slideOut: 'animate-out slide-out-to-bottom-4 duration-300',
  scaleIn: 'animate-in zoom-in-95 duration-200',
  scaleOut: 'animate-out zoom-out-95 duration-200',
};

// 포커스 스타일 유틸리티
export const focusStyles = {
  ring: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-600',
  outline: 'focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600',
};

