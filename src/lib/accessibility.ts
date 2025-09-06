// 접근성 개선을 위한 유틸리티 함수들
import { focusStyles } from './design-tokens';

// ARIA 속성 생성 유틸리티
export const ariaUtils = {
  // 라벨과 설명 연결
  describedBy: (id: string) => ({ 'aria-describedby': id }),
  
  // 현재 상태 표시
  current: (value: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false') => ({ 'aria-current': value }),
  
  // 숨김 처리
  hidden: (hidden: boolean = true) => ({ 'aria-hidden': hidden }),
  
  // 필수 필드 표시
  required: (required: boolean = true) => ({ 'aria-required': required }),
  
  // 유효성 상태
  invalid: (invalid: boolean = true) => ({ 'aria-invalid': invalid }),
  
  // 확장/축소 상태
  expanded: (expanded: boolean) => ({ 'aria-expanded': expanded }),
  
  // 선택 상태
  selected: (selected: boolean) => ({ 'aria-selected': selected }),
  
  // 활성 상태
  pressed: (pressed: boolean) => ({ 'aria-pressed': pressed }),
  
  // 라이브 리전
  live: (polite: boolean = true) => ({ 'aria-live': polite ? 'polite' : 'assertive' }),
  
  // 역할 정의
  role: (role: string) => ({ role }),
  
  // 탭 인덱스
  tabIndex: (index: number) => ({ tabIndex: index }),
};

// 키보드 내비게이션 유틸리티
export const keyboardNavigation = {
  // Enter 키 처리
  onEnter: (callback: () => void) => ({
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        callback();
      }
    },
  }),
  
  // Space 키 처리
  onSpace: (callback: () => void) => ({
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        callback();
      }
    },
  }),
  
  // 화살표 키 처리
  onArrowKeys: (callbacks: {
    up?: () => void;
    down?: () => void;
    left?: () => void;
    right?: () => void;
  }) => ({
    onKeyDown: (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          callbacks.up?.();
          break;
        case 'ArrowDown':
          e.preventDefault();
          callbacks.down?.();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          callbacks.left?.();
          break;
        case 'ArrowRight':
          e.preventDefault();
          callbacks.right?.();
          break;
      }
    },
  }),
  
  // Escape 키 처리
  onEscape: (callback: () => void) => ({
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        callback();
      }
    },
  }),
  
  // Tab 키 순서 관리
  tabIndex: (index: number) => ({ tabIndex: index }),
};

// 포커스 관리 유틸리티
export const focusManagement = {
  // 포커스 트랩 설정
  trap: (ref: React.RefObject<HTMLElement>) => ({
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Tab') {
        const focusableElements = ref.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements && focusableElements.length > 0) {
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
          
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      }
    },
  }),
  
  // 자동 포커스
  autoFocus: (ref: React.RefObject<HTMLElement>) => ({
    ref,
    onFocus: () => ref.current?.focus(),
  }),
  
  // 포커스 복원
  restore: (previousElement: HTMLElement | null) => ({
    onBlur: () => {
      if (previousElement) {
        previousElement.focus();
      }
    },
  }),
};

// 스크린 리더 지원 유틸리티
export const screenReader = {
  // 숨김 텍스트 (시각적으로는 보이지 않지만 스크린 리더에서 읽힘)
  srOnly: 'sr-only',
  
  // 스크린 리더 전용 텍스트 스타일
  srOnlyClass: 'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0',
  
  // 상태 변경 알림
  announce: (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },
  
  // 진행 상황 표시
  progress: (current: number, total: number) => ({
    role: 'progressbar',
    'aria-valuenow': current,
    'aria-valuemin': 0,
    'aria-valuemax': total,
    'aria-label': `진행률: ${current} / ${total}`,
  }),
  
  // 슬라이더 접근성
  slider: (min: number, max: number, value: number, step?: number) => ({
    role: 'slider',
    'aria-valuemin': min,
    'aria-valuemax': max,
    'aria-valuenow': value,
    ...(step && { 'aria-valuetext': `${value}단계` }),
  }),
};

// 색상 대비 및 시각적 접근성
export const visualAccessibility = {
  // 고대비 모드 지원
  highContrast: {
    border: 'border-2 border-current',
    text: 'text-current',
    background: 'bg-current',
  },
  
  // 포커스 표시 강화
  focusIndicator: focusStyles.ring + ' focus-visible:ring-offset-background',
  
  // 호버 상태 표시
  hoverState: 'hover:bg-opacity-10 hover:scale-105 transition-all duration-200',
  
  // 활성 상태 표시
  activeState: 'active:scale-95 active:bg-opacity-20',
};

// 접근성 검증 유틸리티
export const accessibilityValidation = {
  // 필수 속성 검증
  validateRequiredProps: (props: Record<string, any>, required: string[]) => {
    const missing = required.filter(prop => !props[prop]);
    return {
      isValid: missing.length === 0,
      missing,
      message: missing.length > 0 ? `필수 속성 누락: ${missing.join(', ')}` : '모든 필수 속성이 설정됨',
    };
  },
  
  // 색상 대비 검증
  validateColorContrast: (foreground: string, background: string) => {
    // 간단한 대비 검증 (실제로는 더 정확한 계산 필요)
    const contrast = Math.abs(
      parseInt(foreground.replace('#', ''), 16) - 
      parseInt(background.replace('#', ''), 16)
    );
    
    return {
      isValid: contrast > 100,
      contrast,
      message: contrast > 100 ? '적절한 대비' : '대비 부족 - 접근성 문제',
    };
  },
  
  // 키보드 접근성 검증
  validateKeyboardAccess: (element: HTMLElement) => {
    const isFocusable = element.tabIndex >= 0;
    const hasKeyboardHandlers = element.onkeydown !== null;
    
    return {
      isValid: isFocusable && hasKeyboardHandlers,
      issues: [
        !isFocusable && '포커스 불가능',
        !hasKeyboardHandlers && '키보드 이벤트 핸들러 없음',
      ].filter(Boolean),
      message: isFocusable && hasKeyboardHandlers ? '키보드 접근성 양호' : '키보드 접근성 개선 필요',
    };
  },
};

// 접근성 컴포넌트 래퍼 (JSX 사용으로 인해 별도 파일로 분리 권장)
// export function withAccessibility<P extends object>(
//   Component: React.ComponentType<P>,
//   accessibilityProps: Record<string, any> = {}
// ) {
//   return React.forwardRef<HTMLElement, P>((props, ref) => (
//     <Component
//       {...props}
//       {...accessibilityProps}
//       ref={ref}
//     />
//   ));
// }
