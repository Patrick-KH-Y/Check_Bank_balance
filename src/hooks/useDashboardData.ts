'use client';

import { useDatabase } from './useDatabase';
import type { DashboardData, FinancialMetrics } from '@/types/dashboard';

export function useDashboardData(userId: string, year: number, month: number) {
  const { useDashboardData: useDashboardDataQuery, useFinancialMetrics: useFinancialMetricsQuery } = useDatabase();

  // 대시보드 데이터 조회
  const dashboardQuery = useDashboardDataQuery(userId, year, month);

  // 재무 지표 조회
  const metricsQuery = useFinancialMetricsQuery(userId, year, month);

  return {
    dashboardData: dashboardQuery.data?.data || null,
    financialMetrics: metricsQuery.data?.data || null,
    loading: dashboardQuery.isLoading || metricsQuery.isLoading,
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

