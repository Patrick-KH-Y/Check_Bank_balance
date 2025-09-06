'use client';

import { useDatabase } from './useDatabase';
import { useFixedExpenses } from './useFixedExpenses';
import type { DashboardData, FinancialMetrics } from '@/types/dashboard';

export function useDashboardData(userId: string, year: number, month: number) {
  const { useDashboardData: useDashboardDataQuery, useFinancialMetrics: useFinancialMetricsQuery } = useDatabase();
  const { data: fixedExpenses = [], isLoading: fixedExpensesLoading } = useFixedExpenses(userId, year, month);

  // 대시보드 데이터 조회
  const dashboardQuery = useDashboardDataQuery(userId, year, month);

  // 재무 지표 조회
  const metricsQuery = useFinancialMetricsQuery(userId, year, month);

  // 고정 지출 총액 계산
  const totalFixedExpenses = fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // 대시보드 데이터에 고정 지출 포함
  const enhancedDashboardData = dashboardQuery.data?.data ? {
    ...dashboardQuery.data.data,
    fixed_expenses: fixedExpenses,
    total_fixed_expenses: totalFixedExpenses,
    summary: {
      ...dashboardQuery.data.data.summary,
      total_expenses_with_fixed: (dashboardQuery.data.data.summary?.total_expenses || 0) + totalFixedExpenses,
      total_savings_with_fixed: (dashboardQuery.data.data.summary?.total_income || 0) - ((dashboardQuery.data.data.summary?.total_expenses || 0) + totalFixedExpenses),
    }
  } : null;

  // 재무 지표에 고정 지출 포함
  const enhancedFinancialMetrics = metricsQuery.data?.data ? {
    ...metricsQuery.data.data,
    fixed_expenses: fixedExpenses,
    total_fixed_expenses: totalFixedExpenses,
  } : null;

  return {
    dashboardData: enhancedDashboardData,
    financialMetrics: enhancedFinancialMetrics,
    fixedExpenses: fixedExpenses,
    totalFixedExpenses: totalFixedExpenses,
    loading: dashboardQuery.isLoading || metricsQuery.isLoading || fixedExpensesLoading,
    error: dashboardQuery.error || metricsQuery.error,
    refetch: () => {
      dashboardQuery.refetch();
      metricsQuery.refetch();
    },
  };
}

// 현재 월 기준 대시보드 데이터 조회
export function useCurrentMonthDashboard(userId: string) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  return useDashboardData(userId, currentYear, currentMonth);
}

// 특정 월 기준 대시보드 데이터 조회
export function useMonthDashboard(userId: string, year: number, month: number) {
  return useDashboardData(userId, year, month);
}

