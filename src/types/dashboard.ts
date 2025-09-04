// 자산 대시보드 데이터 타입 정의
// 데이터베이스 스키마와 매핑

export interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  account_name: string;
  account_type: 'checking' | 'savings' | 'investment' | 'credit';
  balance: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinancialRecord {
  id: string;
  user_id: string;
  year: number;
  month: number;
  record_type: 'income' | 'expense' | 'savings';
  category: string;
  subcategory?: string;
  amount: number;
  description?: string;
  encrypted_data?: string;
  created_at: string;
  updated_at: string;
}

// 지출 내역 테이블용 타입
export interface ExpenseItem {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  description: string;
  is_fixed: boolean;
  date: string;
  created_at: string;
  updated_at: string;
}

// 개별 지출 항목용 폼 데이터
export interface ExpenseItemFormData {
  category: string;
  amount: number;
  description: string;
  is_fixed: boolean;
  date: string;
}

// 수입 상세 페이지용 타입
export interface IncomeItem {
  id: string;
  user_id: string;
  year: number;
  month: number;
  경훈_월급: number;
  선화_월급: number;
  other_income: number;
  total_income: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// IncomeFormData는 아래에서 다시 정의됨

export interface MonthlyIncome {
  id: string;
  user_id: string;
  year: number;
  month: number;
  경훈_월급: number;
  선화_월급: number;
  other_income: number;
  total_income: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MonthlyExpenses {
  id: string;
  user_id: string;
  year: number;
  month: number;
  housing: number;
  food: number;
  transportation: number;
  utilities: number;
  healthcare: number;
  entertainment: number;
  other_expenses: number;
  total_expenses: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SharedDashboard {
  id: string;
  user_id: string;
  share_token: string;
  dashboard_data: DashboardData;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
}

export interface DashboardData {
  monthly_income: MonthlyIncome;
  monthly_expenses: MonthlyExpenses;
  accounts: Account[];
  summary: {
    total_income: number;
    total_expenses: number;
    total_savings: number;
    savings_rate: number;
  };
}

export interface MonthlySummary {
  year: number;
  month: number;
  income: MonthlyIncome;
  expenses: MonthlyExpenses;
  total_income: number;
  total_expenses: number;
  total_savings: number;
  savings_rate: number;
}

export interface FinancialMetrics {
  current_month: MonthlySummary;
  previous_month: MonthlySummary;
  change: {
    income: {
      amount: number;
      percentage: number;
      type: 'positive' | 'negative' | 'neutral';
    };
    expenses: {
      amount: number;
      percentage: number;
      type: 'positive' | 'negative' | 'neutral';
    };
    savings: {
      amount: number;
      percentage: number;
      type: 'positive' | 'negative' | 'neutral';
    };
  };
}

// API 응답 타입
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

// 폼 데이터 타입
export interface IncomeFormData {
  year: number;
  month: number;
  경훈_월급: number;
  선화_월급: number;
  other_income?: number;
  notes?: string;
}

export interface ExpenseFormData {
  year: number;
  month: number;
  housing: number;
  food: number;
  transportation: number;
  utilities: number;
  healthcare: number;
  entertainment: number;
  other_expenses: number;
  notes?: string;
}

export interface AccountFormData {
  account_name: string;
  account_type: 'checking' | 'savings' | 'investment' | 'credit';
  balance: number;
  currency?: string;
}

// 저축 관련 타입
export interface MonthlySavings {
  id: string;
  user_id: string;
  year: number;
  month: number;
  account_id?: string;
  target_amount: number;
  actual_amount: number;
  savings_type: 'regular' | 'emergency' | 'investment' | 'goal';
  category?: string;
  description?: string;
  is_achieved: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  goal_name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  goal_type: 'short_term' | 'medium_term' | 'long_term';
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavingsFormData {
  year: number;
  month: number;
  account_id?: string;
  target_amount: number;
  actual_amount: number;
  savings_type: 'regular' | 'emergency' | 'investment' | 'goal';
  category?: string;
  description?: string;
  notes?: string;
}

export interface SavingsSummary {
  user_id: string;
  year: number;
  month: number;
  total_savings_entries: number;
  total_target_amount: number;
  total_actual_amount: number;
  average_savings: number;
  achieved_goals: number;
  achievement_rate: number;
}

export interface SavingsStatistics {
  monthly_summary: SavingsSummary | null;
  goals_summary: {
    total_goals: number;
    active_goals: number;
    total_target: number;
    total_current: number;
  };
  achievement_rate: number;
  generated_at: string;
}

// 필터 및 정렬 타입
export interface DateRange {
  start_date: string;
  end_date: string;
}

export interface FinancialFilters {
  year?: number;
  month?: number;
  category?: string;
  record_type?: 'income' | 'expense' | 'savings';
  min_amount?: number;
  max_amount?: number;
}

export interface SortOptions {
  field: keyof MonthlyIncome | keyof MonthlyExpenses | keyof FinancialRecord;
  direction: 'asc' | 'desc';
}

// 차트 데이터 타입
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface LineChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }[];
}

export interface PieChartData {
  labels: string[];
  data: number[];
  backgroundColor: string[];
}

export interface BarChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
  }[];
}

// 통계 및 분석 타입
export interface FinancialAnalysis {
  monthly_trends: {
    income_trend: number[];
    expense_trend: number[];
    savings_trend: number[];
    months: string[];
  };
  category_breakdown: {
    expenses: ChartDataPoint[];
    income: ChartDataPoint[];
  };
  savings_analysis: {
    current_rate: number;
    target_rate: number;
    projected_savings: number;
    recommendations: string[];
  };
}

