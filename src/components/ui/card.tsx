import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

// 재무 관련 특화 카드 컴포넌트들
const FinancialCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    type: 'income' | 'expense' | 'savings' | 'balance';
    trend?: 'up' | 'down' | 'neutral';
    value: string | number;
    label: string;
    change?: string;
    changePercentage?: number;
    ariaLabel?: string;
  }
>(({ 
  className, 
  type, 
  trend, 
  value, 
  label, 
  change, 
  changePercentage,
  ariaLabel,
  ...props 
}, ref) => {
  const typeStyles = {
    income: "border-l-4 border-l-green-500 bg-green-50/50",
    expense: "border-l-4 border-l-red-500 bg-red-50/50",
    savings: "border-l-4 border-l-blue-500 bg-blue-50/50",
    balance: "border-l-4 border-l-yellow-500 bg-yellow-50/50",
  };

  const trendIcons = {
    up: "↗️",
    down: "↘️",
    neutral: "→",
  };

  const trendColors = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-gray-600",
  };

  return (
    <Card
      ref={ref}
      className={cn(
        "transition-all duration-300 hover:shadow-lg",
        typeStyles[type],
        className
      )}
      {...(ariaLabel && { 'aria-label': ariaLabel })}
      {...props}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {label}
          </CardTitle>
          {trend && (
            <span 
              className={cn("text-lg", trendColors[trend])}
              aria-label={`${trend === 'up' ? '증가' : trend === 'down' ? '감소' : '변화 없음'}`}
            >
              {trendIcons[trend]}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={cn("text-xs mt-1", trendColors[trend || 'neutral'])}>
            {change}
            {changePercentage && ` (${changePercentage > 0 ? '+' : ''}${changePercentage}%)`}
          </p>
        )}
      </CardContent>
    </Card>
  );
});

FinancialCard.displayName = "FinancialCard";

export { FinancialCard };
