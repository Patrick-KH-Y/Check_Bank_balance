import { createClient } from './client';
import { createClient as createServerClient } from './server';
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

export class DatabaseService {
  private client;

  constructor(isServer = false) {
    this.client = isServer ? createServerClient() : createClient();
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
          year: incomeData.year,
          month: incomeData.month,
          경훈_월급: incomeData.경훈_월급,
          선화_월급: incomeData.선화_월급,
          other_income: incomeData.other_income || 0,
          notes: incomeData.notes,
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

  async getMonthlyIncomeHistory(
    userId: string,
    limit = 12
  ): Promise<ApiResponse<MonthlyIncome[]>> {
    try {
      const { data, error } = await this.client
        .from('monthly_income')
        .select('*')
        .eq('user_id', userId)
        .order('year', { ascending: false })
        .order('month', { ascending: false })
        .limit(limit);

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
          year: expenseData.year,
          month: expenseData.month,
          housing: expenseData.housing,
          food: expenseData.food,
          transportation: expenseData.transportation,
          utilities: expenseData.utilities,
          healthcare: expenseData.healthcare,
          entertainment: expenseData.entertainment,
          other_expenses: expenseData.other_expenses,
          notes: expenseData.notes,
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
        .order('account_name');

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

  async createAccount(
    userId: string,
    accountData: AccountFormData
  ): Promise<ApiResponse<Account>> {
    try {
      const { data, error } = await this.client
        .from('accounts')
        .insert({
          user_id: userId,
          account_name: accountData.account_name,
          account_type: accountData.account_type,
          balance: accountData.balance,
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

  async updateAccount(
    accountId: string,
    updates: Partial<AccountFormData>
  ): Promise<ApiResponse<Account>> {
    try {
      const { data, error } = await this.client
        .from('accounts')
        .update(updates)
        .eq('id', accountId)
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

      const income = incomeResponse.data;
      const expenses = expensesResponse.data;
      const accounts = accountsResponse.data || [];

      // 기본값 설정
      const defaultIncome: MonthlyIncome = {
        id: '',
        user_id: userId,
        year,
        month,
        경훈_월급: 0,
        선화_월급: 0,
        other_income: 0,
        total_income: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const defaultExpenses: MonthlyExpenses = {
        id: '',
        user_id: userId,
        year,
        month,
        housing: 0,
        food: 0,
        transportation: 0,
        utilities: 0,
        healthcare: 0,
        entertainment: 0,
        other_expenses: 0,
        total_expenses: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const finalIncome = income || defaultIncome;
      const finalExpenses = expenses || defaultExpenses;

      const totalIncome = finalIncome.total_income;
      const totalExpenses = finalExpenses.total_expenses;
      const totalSavings = totalIncome - totalExpenses;
      const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;

      const dashboardData: DashboardData = {
        monthly_income: finalIncome,
        monthly_expenses: finalExpenses,
        accounts,
        summary: {
          total_income: totalIncome,
          total_expenses: totalExpenses,
          total_savings: totalSavings,
          savings_rate: savingsRate,
        },
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

  // 공유 대시보드 관련 메서드
  async createSharedDashboard(
    userId: string,
    dashboardData: DashboardData,
    expiresAt?: Date
  ): Promise<ApiResponse<SharedDashboard>> {
    try {
      const shareToken = this.generateShareToken();
      
      const { data, error } = await this.client
        .from('shared_dashboards')
        .insert({
          user_id: userId,
          share_token: shareToken,
          dashboard_data: dashboardData,
          expires_at: expiresAt?.toISOString(),
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

  async getSharedDashboard(shareToken: string): Promise<ApiResponse<SharedDashboard>> {
    try {
      const { data, error } = await this.client
        .from('shared_dashboards')
        .select('*')
        .eq('share_token', shareToken)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      // 만료일 확인
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        throw new Error('Shared dashboard has expired');
      }

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

  // 재무 지표 계산 메서드
  async getFinancialMetrics(
    userId: string,
    currentYear: number,
    currentMonth: number
  ): Promise<ApiResponse<FinancialMetrics>> {
    try {
      const [currentResponse, previousResponse] = await Promise.all([
        this.getDashboardData(userId, currentYear, currentMonth),
        this.getDashboardData(
          userId,
          currentMonth === 1 ? currentYear - 1 : currentYear,
          currentMonth === 1 ? 12 : currentMonth - 1
        ),
      ]);

      if (!currentResponse.success || !previousResponse.success) {
        throw new Error('Failed to fetch financial data');
      }

      const current = currentResponse.data!;
      const previous = previousResponse.data!;

      const metrics: FinancialMetrics = {
        current_month: {
          year: currentYear,
          month: currentMonth,
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
          income: this.calculateChange(
            current.summary.total_income,
            previous.summary.total_income
          ),
          expenses: this.calculateChange(
            current.summary.total_expenses,
            previous.summary.total_expenses
          ),
          savings: this.calculateChange(
            current.summary.total_savings,
            previous.summary.total_savings
          ),
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

  // 유틸리티 메서드
  private generateShareToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  private calculateChange(current: number, previous: number) {
    const amount = current - previous;
    const percentage = previous > 0 ? (amount / previous) * 100 : 0;
    
    let type: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (amount > 0) type = 'positive';
    else if (amount < 0) type = 'negative';

    return { amount, percentage, type };
  }
}

// 싱글톤 인스턴스 생성
export const databaseService = new DatabaseService();
export const serverDatabaseService = new DatabaseService(true);

