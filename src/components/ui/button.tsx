import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { focusStyles } from "@/lib/design-tokens";
import { ariaUtils, keyboardNavigation } from "@/lib/accessibility";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 shadow-sm",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80 shadow-sm",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70 shadow-sm",
        ghost: "hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        link: "text-primary underline-offset-4 hover:underline active:text-primary/80",
        // 재무 관련 변형 추가
        income: "bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-sm",
        expense: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm",
        savings: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm",
        balance: "bg-yellow-600 text-white hover:bg-yellow-700 active:bg-yellow-800 shadow-sm",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8 text-base",
        xl: "h-12 rounded-lg px-10 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
      // 접근성 강화를 위한 추가 변형
      accessibility: {
        default: "",
        highContrast: "border-2 border-current ring-2 ring-offset-2 ring-current",
        largeTarget: "min-h-[44px] min-w-[44px]", // 터치 타겟 최소 크기
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      accessibility: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  // 접근성 관련 props 추가
  ariaLabel?: string;
  ariaDescribedBy?: string;
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    accessibility = "default",
    asChild = false, 
    ariaLabel,
    ariaDescribedBy,
    loading = false,
    loadingText,
    icon,
    iconPosition = 'left',
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    // 접근성 속성 구성
    const accessibilityProps = {
      ...(ariaLabel && { 'aria-label': ariaLabel }),
      ...(ariaDescribedBy && ariaUtils.describedBy(ariaDescribedBy)),
      ...(loading && { 'aria-busy': true }),
      ...(disabled && { 'aria-disabled': true }),
      ...(loading && loadingText && { 'aria-live': 'polite' }),
    };
    
    // 키보드 접근성
    const keyboardProps = {
      ...keyboardNavigation.onEnter(() => {
        if (!disabled && !loading) {
          // Enter 키로 클릭 시뮬레이션
          const event = new MouseEvent('click', { bubbles: true });
          if (ref && 'current' in ref && ref.current) {
            ref.current.dispatchEvent(event);
          }
        }
      }),
      ...keyboardNavigation.onSpace(() => {
        if (!disabled && !loading) {
          // Space 키로 클릭 시뮬레이션
          const event = new MouseEvent('click', { bubbles: true });
          if (ref && 'current' in ref && ref.current) {
            ref.current.dispatchEvent(event);
          }
        }
      }),
    };
    
    // 로딩 상태일 때 내용 변경
    const buttonContent = loading ? (
      <>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
        {loadingText || '처리 중...'}
      </>
    ) : (
      <>
        {icon && iconPosition === 'left' && (
          <span className="mr-2" aria-hidden="true">
            {icon}
          </span>
        )}
        {children}
        {icon && iconPosition === 'right' && (
          <span className="ml-2" aria-hidden="true">
            {icon}
          </span>
        )}
      </>
    );
    
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, accessibility, className }),
          focusStyles.ring,
          // 접근성 강화 스타일
          accessibility === 'largeTarget' && 'min-h-[44px] min-w-[44px]',
          // 로딩 상태 스타일
          loading && 'cursor-not-allowed opacity-75',
          // 비활성화 상태 스타일
          disabled && 'cursor-not-allowed opacity-50'
        )}
        ref={ref}
        disabled={disabled || loading}
        {...accessibilityProps}
        {...keyboardProps}
        {...props}
      >
        {buttonContent}
      </Comp>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
