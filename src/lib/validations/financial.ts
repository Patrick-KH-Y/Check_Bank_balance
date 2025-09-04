import { z } from 'zod';

// 월별 수입 입력 검증 스키마
export const incomeFormSchema = z.object({
  year: z.number().min(2020).max(2030),
  month: z.number().min(1).max(12),
  경훈_월급: z.number().min(0).max(100000000),
  선화_월급: z.number().min(0).max(100000000),
  other_income: z.number().min(0).max(100000000).optional(),
  notes: z.string().max(500).optional(),
});

// 월별 지출 입력 검증 스키마
export const expenseFormSchema = z.object({
  year: z.number().min(2020).max(2030),
  month: z.number().min(1).max(12),
  housing: z.number().min(0).max(100000000),
  food: z.number().min(0).max(100000000),
  transportation: z.number().min(0).max(100000000),
  utilities: z.number().min(0).max(100000000),
  healthcare: z.number().min(0).max(100000000),
  entertainment: z.number().min(0).max(100000000),
  other_expenses: z.number().min(0).max(100000000),
  notes: z.string().max(500).optional(),
});

// 계좌 입력 검증 스키마
export const accountFormSchema = z.object({
  account_name: z.string().min(1, '계좌명을 입력해주세요').max(100),
  account_type: z.enum(['checking', 'savings', 'investment', 'credit']),
  balance: z.number().min(0, '잔액은 0 이상이어야 합니다').max(100000000000),
  currency: z.string().length(3).default('KRW'),
});

// 통합 재무 데이터 입력 검증 스키마
export const financialDataFormSchema = z.object({
  year: z.number().min(2020).max(2030),
  month: z.number().min(1).max(12),
  income: incomeFormSchema.omit({ year: true, month: true }),
  expenses: expenseFormSchema.omit({ year: true, month: true }),
  accounts: z.array(accountFormSchema).min(1, '최소 하나의 계좌를 입력해주세요'),
});

// 타입 추출
export type IncomeFormData = z.infer<typeof incomeFormSchema>;
export type ExpenseFormData = z.infer<typeof expenseFormSchema>;
export type AccountFormData = z.infer<typeof accountFormSchema>;
export type FinancialDataFormData = z.infer<typeof financialDataFormSchema>;

// 검증 함수들
export const validateIncomeForm = (data: unknown): IncomeFormData => {
  return incomeFormSchema.parse(data);
};

export const validateExpenseForm = (data: unknown): ExpenseFormData => {
  return expenseFormSchema.parse(data);
};

export const validateAccountForm = (data: unknown): AccountFormData => {
  return accountFormSchema.parse(data);
};

export const validateFinancialDataForm = (data: unknown): FinancialDataFormData => {
  return financialDataFormSchema.parse(data);
};

