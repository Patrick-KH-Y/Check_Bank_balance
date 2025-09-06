'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { clientDatabaseService } from '@/lib/supabase/client-database';
import type {
  MonthlyIncome,
  MonthlyExpenses,
  DashboardData,
  FinancialMetrics,
  IncomeFormData,
  ExpenseFormData,
  ApiResponse,
} from '@/types/dashboard';

// 재시도 설정
const RETRY_CONFIG = {
  retry: 3,
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
};

// 에러 메시지 매핑
const ERROR_MESSAGES = {
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  VALIDATION_ERROR: '입력 데이터를 확인해주세요.',
  CONFLICT_ERROR: '데이터 충돌이 발생했습니다. 다시 시도해주세요.',
  UNAUTHORIZED: '인증이 필요합니다.',
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
};

export function useDatabase() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // 월별 수입 데이터 조회
  const useMonthlyIncome = (userId: string, year: number, month: number) => {
    return useQuery({
      queryKey: ['monthly-income', userId, year, month],
      queryFn: () => clientDatabaseService.getMonthlyIncome(userId, year, month),
      enabled: !!userId,
      staleTime: 5 * 60 * 1000, // 5분
      gcTime: 10 * 60 * 1000, // 10분
      ...RETRY_CONFIG,
    });
  };

  // 월별 수입 데이터 저장/업데이트
  const useSaveMonthlyIncome = () => {
    return useMutation({
      mutationFn: ({ userId, incomeData }: { userId: string; incomeData: IncomeFormData }) =>
        clientDatabaseService.upsertMonthlyIncome(userId, incomeData),
      
      // Optimistic Update
      onMutate: async ({ userId, incomeData }) => {
        // 진행 중인 쿼리 취소
        await queryClient.cancelQueries({ queryKey: ['monthly-income', userId, incomeData.year, incomeData.month] });
        await queryClient.cancelQueries({ queryKey: ['dashboard', userId, incomeData.year, incomeData.month] });
        await queryClient.cancelQueries({ queryKey: ['financial-metrics', userId, incomeData.year, incomeData.month] });

        // 이전 값 저장
        const previousIncome = queryClient.getQueryData(['monthly-income', userId, incomeData.year, incomeData.month]);
        const previousDashboard = queryClient.getQueryData(['dashboard', userId, incomeData.year, incomeData.month]);

        // Optimistic update
        const optimisticIncome: MonthlyIncome = {
          id: `temp-${Date.now()}`,
          user_id: userId,
          year: incomeData.year,
          month: incomeData.month,
          경훈_월급: incomeData.경훈_월급,
          선화_월급: incomeData.선화_월급,
          other_income: incomeData.other_income || 0,
          total_income: (incomeData.경훈_월급 + incomeData.선화_월급 + (incomeData.other_income || 0)),
          notes: incomeData.notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        queryClient.setQueryData(['monthly-income', userId, incomeData.year, incomeData.month], {
          data: optimisticIncome,
          error: null,
          success: true,
        });

        // 대시보드 데이터도 업데이트
        if (previousDashboard && typeof previousDashboard === 'object' && 'summary' in previousDashboard && 
            previousDashboard.summary && typeof previousDashboard.summary === 'object') {
          const summary = previousDashboard.summary as any;
          const updatedDashboard = {
            ...previousDashboard,
            monthly_income: optimisticIncome,
            summary: {
              ...summary,
              total_income: optimisticIncome.total_income,
              total_savings: optimisticIncome.total_income - summary.total_expenses,
              savings_rate: summary.total_expenses > 0 
                ? ((optimisticIncome.total_income - summary.total_expenses) / optimisticIncome.total_income) * 100 
                : 0,
            },
          };
          queryClient.setQueryData(['dashboard', userId, incomeData.year, incomeData.month], updatedDashboard);
        }

        return { previousIncome, previousDashboard };
      },

      // 성공 시 처리
      onSuccess: (result, { userId, incomeData }) => {
        if (result.success && result.data) {
          // 쿼리 무효화하여 최신 데이터 가져오기
          queryClient.invalidateQueries({ queryKey: ['monthly-income', userId, incomeData.year, incomeData.month] });
          queryClient.invalidateQueries({ queryKey: ['dashboard', userId, incomeData.year, incomeData.month] });
          queryClient.invalidateQueries({ queryKey: ['financial-metrics', userId, incomeData.year, incomeData.month] });
          
          toast({
            title: '수입 정보 저장 완료',
            description: '수입 정보가 성공적으로 저장되었습니다.',
          });
        }
      },

      // 에러 시 처리
      onError: (error, { userId, incomeData }, context) => {
        // Optimistic update 롤백
        if (context?.previousIncome) {
          queryClient.setQueryData(['monthly-income', userId, incomeData.year, incomeData.month], context.previousIncome);
        }
        if (context?.previousDashboard) {
          queryClient.setQueryData(['dashboard', userId, incomeData.year, incomeData.month], context.previousDashboard);
        }

        // 에러 메시지 표시
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        toast({
          title: '수입 정보 저장 실패',
          description: getErrorMessage(errorMessage),
          variant: 'destructive',
        });
      },

      // 완료 시 처리
      onSettled: (_, __, { userId, incomeData }) => {
        // 쿼리 상태 정리
        queryClient.invalidateQueries({ queryKey: ['monthly-income', userId, incomeData.year, incomeData.month] });
      },
    });
  };

  // 월별 지출 데이터 조회
  const useMonthlyExpenses = (userId: string, year: number, month: number) => {
    return useQuery({
      queryKey: ['monthly-expenses', userId, year, month],
      queryFn: () => clientDatabaseService.getMonthlyExpenses(userId, year, month),
      enabled: !!userId,
      staleTime: 5 * 60 * 1000, // 5분
      gcTime: 10 * 60 * 1000, // 10분
      ...RETRY_CONFIG,
    });
  };

  // 월별 지출 데이터 저장/업데이트
  const useSaveMonthlyExpenses = () => {
    return useMutation({
      mutationFn: ({ userId, expenseData }: { userId: string; expenseData: ExpenseFormData }) =>
        clientDatabaseService.upsertMonthlyExpenses(userId, expenseData),
      
      // Optimistic Update
      onMutate: async ({ userId, expenseData }) => {
        await queryClient.cancelQueries({ queryKey: ['monthly-expenses', userId, expenseData.year, expenseData.month] });
        await queryClient.cancelQueries({ queryKey: ['dashboard', userId, expenseData.year, expenseData.month] });
        await queryClient.cancelQueries({ queryKey: ['financial-metrics', userId, expenseData.year, expenseData.month] });

        const previousExpenses = queryClient.getQueryData(['monthly-expenses', userId, expenseData.year, expenseData.month]);
        const previousDashboard = queryClient.getQueryData(['dashboard', userId, expenseData.year, expenseData.month]);

        const optimisticExpenses: MonthlyExpenses = {
          id: `temp-${Date.now()}`,
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
          total_expenses: (
            expenseData.housing + expenseData.food + expenseData.transportation + 
            expenseData.utilities + expenseData.healthcare + expenseData.entertainment + 
            expenseData.other_expenses
          ),
          notes: expenseData.notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        queryClient.setQueryData(['monthly-expenses', userId, expenseData.year, expenseData.month], {
          data: optimisticExpenses,
          error: null,
          success: true,
        });

        if (previousDashboard && typeof previousDashboard === 'object' && 'summary' in previousDashboard && 
            previousDashboard.summary && typeof previousDashboard.summary === 'object') {
          const summary = previousDashboard.summary as any;
          const updatedDashboard = {
            ...previousDashboard,
            monthly_expenses: optimisticExpenses,
            summary: {
              ...summary,
              total_expenses: optimisticExpenses.total_expenses,
              total_savings: summary.total_income - optimisticExpenses.total_expenses,
              savings_rate: summary.total_income > 0 
                ? ((summary.total_income - optimisticExpenses.total_expenses) / summary.total_income) * 100 
                : 0,
            },
          };
          queryClient.setQueryData(['dashboard', userId, expenseData.year, expenseData.month], updatedDashboard);
        }

        return { previousExpenses, previousDashboard };
      },

      onSuccess: (result, { userId, expenseData }) => {
        if (result.success && result.data) {
          queryClient.invalidateQueries({ queryKey: ['monthly-expenses', userId, expenseData.year, expenseData.month] });
          queryClient.invalidateQueries({ queryKey: ['dashboard', userId, expenseData.year, expenseData.month] });
          queryClient.invalidateQueries({ queryKey: ['financial-metrics', userId, expenseData.year, expenseData.month] });
          
          toast({
            title: '지출 정보 저장 완료',
            description: '지출 정보가 성공적으로 저장되었습니다.',
          });
        }
      },

      onError: (error, { userId, expenseData }, context) => {
        if (context?.previousExpenses) {
          queryClient.setQueryData(['monthly-expenses', userId, expenseData.year, expenseData.month], context.previousExpenses);
        }
        if (context?.previousDashboard) {
          queryClient.setQueryData(['dashboard', userId, expenseData.year, expenseData.month], context.previousDashboard);
        }

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        toast({
          title: '지출 정보 저장 실패',
          description: getErrorMessage(errorMessage),
          variant: 'destructive',
        });
      },

      onSettled: (_, __, { userId, expenseData }) => {
        queryClient.invalidateQueries({ queryKey: ['monthly-expenses', userId, expenseData.year, expenseData.month] });
      },
    });
  };

  // 대시보드 데이터 조회
  const useDashboardData = (userId: string, year: number, month: number) => {
    return useQuery({
      queryKey: ['dashboard', userId, year, month],
      queryFn: () => clientDatabaseService.getDashboardData(userId, year, month),
      enabled: !!userId,
      staleTime: 5 * 60 * 1000, // 5분
      gcTime: 10 * 60 * 1000, // 10분
      ...RETRY_CONFIG,
    });
  };

  // 재무 지표 조회
  const useFinancialMetrics = (userId: string, currentYear: number, currentMonth: number) => {
    return useQuery({
      queryKey: ['financial-metrics', userId, currentYear, currentMonth],
      queryFn: () => clientDatabaseService.getFinancialMetrics(userId, currentYear, currentMonth),
      enabled: !!userId,
      staleTime: 5 * 60 * 1000, // 5분
      gcTime: 10 * 60 * 1000, // 10분
      ...RETRY_CONFIG,
    });
  };

  // 에러 메시지 변환
  const getErrorMessage = (error: string): string => {
    if (error.includes('network') || error.includes('fetch')) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    if (error.includes('validation') || error.includes('invalid')) {
      return ERROR_MESSAGES.VALIDATION_ERROR;
    }
    if (error.includes('conflict') || error.includes('duplicate')) {
      return ERROR_MESSAGES.CONFLICT_ERROR;
    }
    if (error.includes('unauthorized') || error.includes('auth')) {
      return ERROR_MESSAGES.UNAUTHORIZED;
    }
    return ERROR_MESSAGES.UNKNOWN_ERROR;
  };

  return {
    // Query hooks
    useMonthlyIncome,
    useMonthlyExpenses,
    useDashboardData,
    useFinancialMetrics,
    
    // Mutation hooks
    useSaveMonthlyIncome,
    useSaveMonthlyExpenses,
    
    // Utility functions
    getErrorMessage,
  };
}

