import { createClient } from './client';
import type {
  User,
  Account,
  FinancialRecord,
  MonthlyIncome,
  MonthlyExpenses,
  SharedDashboard,
  DashboardData,
  MonthlySummary,
  FinancialMetrics,
  IncomeFormData,
  ExpenseFormData,
  AccountFormData,
  ApiResponse,
  PaginatedResponse,
} from '@/types/dashboard';

export class ClientDatabaseService {
  private client;

  constructor() {
    this.client = createClient();
  }

  // 사용자 관련 메서드
  async getUserById(userId: string): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await this.client
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      };
    }
  }

  async getUserByEmail(email: string): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await this.client
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      };
    }
  }

  // 월별 수입 관련 메서드
  async getMonthlyIncome(
    userId: string,
    year: number,
    month: number
  ): Promise<ApiResponse<MonthlyIncome>> {
    try {
      const { data, error } = await this.client
        .from('monthly_income')
        .select('*')
        .eq('user_id', userId)
        .eq('year', year)
        .eq('month', month)
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      };
    }
  }

  async upsertMonthlyIncome(
    userId: string,
    incomeData: IncomeFormData
  ): Promise<ApiResponse<MonthlyIncome>> {
    try {
      const { data, error } = await this.client
        .from('monthly_income')
        .upsert({
          user_id: userId,
          ...incomeData,
          total_income: incomeData.경훈_월급 + incomeData.선화_월급 + (incomeData.other_income || 0),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      };
    }
  }

  // 월별 지출 관련 메서드
  async getMonthlyExpenses(
    userId: string,
    year: number,
    month: number
  ): Promise<ApiResponse<MonthlyExpenses>> {
    try {
      const { data, error } = await this.client
        .from('monthly_expenses')
        .select('*')
        .eq('user_id', userId)
        .eq('year', year)
        .eq('month', month)
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      };
    }
  }

  async upsertMonthlyExpenses(
    userId: string,
    expenseData: ExpenseFormData
  ): Promise<ApiResponse<MonthlyExpenses>> {
    try {
      const { data, error } = await this.client
        .from('monthly_expenses')
        .upsert({
          user_id: userId,
          ...expenseData,
          total_expenses: 
            expenseData.housing + 
            expenseData.food + 
            expenseData.transportation + 
            expenseData.utilities + 
            expenseData.healthcare + 
            expenseData.entertainment + 
            expenseData.other_expenses,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      };
    }
  }

  // 계좌 관련 메서드
  async getAccounts(userId: string): Promise<ApiResponse<Account[]>> {
    try {
      const { data, error } = await this.client
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        data,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      };
    }
  }

  async upsertAccount(
    userId: string,
    accountData: AccountFormData
  ): Promise<ApiResponse<Account>> {
    try {
      const { data, error } = await this.client
        .from('accounts')
        .upsert({
          user_id: userId,
          ...accountData,
          currency: accountData.currency || 'KRW',
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      };
    }
  }

  // 대시보드 데이터 관련 메서드
  async getDashboardData(
    userId: string,
    year: number,
    month: number
  ): Promise<ApiResponse<DashboardData>> {
    try {
      const [incomeResponse, expensesResponse, accountsResponse] = await Promise.all([
        this.getMonthlyIncome(userId, year, month),
        this.getMonthlyExpenses(userId, year, month),
        this.getAccounts(userId),
      ]);

      if (!incomeResponse.success || !expensesResponse.success || !accountsResponse.success) {
        throw new Error('Failed to fetch dashboard data');
      }

      const monthly_income = incomeResponse.data;
      const monthly_expenses = expensesResponse.data;
      const accounts = accountsResponse.data || [];

      // 요약 계산
      const total_income = monthly_income?.total_income || 0;
      const total_expenses = monthly_expenses?.total_expenses || 0;
      const total_savings = total_income - total_expenses;
      const savings_rate = total_income > 0 ? (total_savings / total_income) * 100 : 0;

      const summary = {
        total_income,
        total_expenses,
        total_savings,
        savings_rate,
      };

      const dashboardData: DashboardData = {
        monthly_income: monthly_income!,
        monthly_expenses: monthly_expenses!,
        accounts,
        summary,
      };

      return {
        data: dashboardData,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      };
    }
  }

  // 재무 지표 관련 메서드
  async getFinancialMetrics(
    userId: string,
    currentYear: number,
    currentMonth: number
  ): Promise<ApiResponse<FinancialMetrics>> {
    try {
      const currentMonthData = await this.getDashboardData(userId, currentYear, currentMonth);
      
      if (!currentMonthData.success || !currentMonthData.data) {
        throw new Error('Failed to fetch current month data');
      }

      // 이전 달 데이터 계산
      let previousYear = currentYear;
      let previousMonth = currentMonth - 1;
      
      if (previousMonth === 0) {
        previousMonth = 12;
        previousYear = currentYear - 1;
      }

      const previousMonthData = await this.getDashboardData(userId, previousYear, previousMonth);

      const current = currentMonthData.data;
      const previous = previousMonthData.success ? previousMonthData.data : null;

      if (!previous) {
        // 이전 달 데이터가 없는 경우 기본값 사용
        const metrics: FinancialMetrics = {
          current_month: {
            year: current.monthly_income.year,
            month: current.monthly_income.month,
            income: current.monthly_income,
            expenses: current.monthly_expenses,
            total_income: current.summary.total_income,
            total_expenses: current.summary.total_expenses,
            total_savings: current.summary.total_savings,
            savings_rate: current.summary.savings_rate,
          },
          previous_month: {
            year: previousYear,
            month: previousMonth,
            income: current.monthly_income, // 임시로 현재 달 데이터 사용
            expenses: current.monthly_expenses,
            total_income: 0,
            total_expenses: 0,
            total_savings: 0,
            savings_rate: 0,
          },
          change: {
            income: { amount: 0, percentage: 0, type: 'neutral' as const },
            expenses: { amount: 0, percentage: 0, type: 'neutral' as const },
            savings: { amount: 0, percentage: 0, type: 'neutral' as const },
          },
        };

        return {
          data: metrics,
          error: null,
          success: true,
        };
      }

      // 변화율 계산
      const incomeChange = this.calculateChange(current.summary.total_income, previous.summary.total_income);
      const expensesChange = this.calculateChange(current.summary.total_expenses, previous.summary.total_expenses);
      const savingsChange = this.calculateChange(current.summary.total_savings, previous.summary.total_savings);

      const metrics: FinancialMetrics = {
        current_month: {
          year: current.monthly_income.year,
          month: current.monthly_income.month,
          income: current.monthly_income,
          expenses: current.monthly_expenses,
          total_income: current.summary.total_income,
          total_expenses: current.summary.total_expenses,
          total_savings: current.summary.total_savings,
          savings_rate: current.summary.savings_rate,
        },
        previous_month: {
          year: previous.monthly_income.year,
          month: previous.monthly_income.month,
          income: previous.monthly_income,
          expenses: previous.monthly_expenses,
          total_income: previous.summary.total_income,
          total_expenses: previous.summary.total_expenses,
          total_savings: previous.summary.total_savings,
          savings_rate: previous.summary.savings_rate,
        },
        change: {
          income: incomeChange,
          expenses: expensesChange,
          savings: savingsChange,
        },
      };

      return {
        data: metrics,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      };
    }
  }

  // 변화율 계산 헬퍼 메서드
  private calculateChange(current: number, previous: number) {
    if (previous === 0) {
      return { amount: 0, percentage: 0, type: 'neutral' as const };
    }

    const amount = current - previous;
    const percentage = (amount / previous) * 100;

    if (amount > 0) {
      return { amount, percentage, type: 'positive' as const };
    } else if (amount < 0) {
      return { amount, percentage, type: 'negative' as const };
    } else {
      return { amount, percentage, type: 'neutral' as const };
    }
  }
}

// 클라이언트 전용 인스턴스 생성
export const clientDatabaseService = new ClientDatabaseService();
