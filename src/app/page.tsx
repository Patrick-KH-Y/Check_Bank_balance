'use client';

import { useState, useEffect } from 'react';
import DashboardHomeCards from '@/components/dashboard/DashboardHomeCards';
import IncomeExpenseChart from '@/components/dashboard/IncomeExpenseChart';
import SavingsTrendChart from '@/components/dashboard/SavingsTrendChart';
import AccountBalanceChart from '@/components/dashboard/AccountBalanceChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, PiggyBank, BarChart3, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useExpenses } from '@/hooks/useExpenses';
import { useIncome } from '@/hooks/useIncome';
import { useAccounts } from '@/hooks/useAccounts';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Home() {
  const { toast } = useToast();
  const router = useRouter();
  const [currentYear, setCurrentYear] = useState(2025);
  const [currentMonth, setCurrentMonth] = useState(9);
  
  // 임시 사용자 ID (실제로는 인증 시스템에서 가져와야 함)
  const tempUserId = 'temp-user-123';

  // 현재 월의 데이터 조회
  const { data: currentExpenses, isLoading: expensesLoading, error: expensesError } = useExpenses(tempUserId, currentYear, currentMonth);
  const { data: currentIncome, isLoading: incomeLoading, error: incomeError } = useIncome(tempUserId, currentYear, currentMonth);
  const { data: accounts, isLoading: accountsLoading, error: accountsError } = useAccounts(currentYear, currentMonth);

  // 이전 월 데이터 조회 (차트 비교용)
  const { data: previousExpenses } = useExpenses(tempUserId, currentYear, currentMonth - 1);
  const { data: previousIncome } = useIncome(tempUserId, currentYear, currentMonth - 1);

  // 더 많은 월 데이터 조회 (현재 월 포함 과거 6개월)
  const getRecentMonths = () => {
    const months = [];
    for (let i = 0; i < 6; i++) {
      const targetMonth = currentMonth - i;
      const targetYear = currentYear;
      let year = targetYear;
      let month = targetMonth;
      
      if (targetMonth < 1) {
        month = targetMonth + 12;
        year = targetYear - 1;
      }
      
      months.push({ year, month });
    }
    // 최신 월부터 오래된 월 순으로 정렬 (현재 월이 맨 오른쪽)
    return months.reverse();
  };

  const recentMonths = getRecentMonths();
  
  // 최근 6개월 데이터 조회
  const recentExpensesQueries = recentMonths.map(({ year, month }) => 
    useExpenses(tempUserId, year, month)
  );
  const recentIncomeQueries = recentMonths.map(({ year, month }) => 
    useIncome(tempUserId, year, month)
  );

  // 데이터 로딩 상태
  const loading = expensesLoading || incomeLoading || accountsLoading;
  const error = expensesError || incomeError || accountsError;

  // 실제 데이터가 있는지 확인
  const hasRealData = currentIncome || currentExpenses || (accounts && accounts.length > 0);

  // 대시보드 데이터 구성
  const dashboardData = {
    monthly_income: currentIncome || {
      id: 'temp-1',
      user_id: tempUserId,
      year: currentYear,
      month: currentMonth,
      경훈_월급: 0,
      선화_월급: 0,
      other_income: 0,
      total_income: 0,
      notes: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    monthly_expenses: currentExpenses || {
      id: 'temp-2',
      user_id: tempUserId,
      year: currentYear,
      month: currentMonth,
      housing: 0,
      food: 0,
      transportation: 0,
      utilities: 0,
      healthcare: 0,
      entertainment: 0,
      other_expenses: 0,
      total_expenses: 0,
      notes: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    accounts: accounts || [],
    summary: {
      total_income: currentIncome?.total_income || 0,
      total_expenses: currentExpenses?.total_expenses || 0,
      total_savings: (currentIncome?.total_income || 0) - (currentExpenses?.total_expenses || 0),
      savings_rate: currentIncome?.total_income && currentExpenses?.total_expenses ? 
        ((currentIncome.total_income - currentExpenses.total_expenses) / currentIncome.total_income) * 100 : 0,
    },
  };

  const financialMetrics = {
    current_month: {
      year: currentYear,
      month: currentMonth,
      income: dashboardData.monthly_income,
      expenses: dashboardData.monthly_expenses,
      total_income: dashboardData.summary.total_income,
      total_expenses: dashboardData.summary.total_expenses,
      total_savings: dashboardData.summary.total_savings,
      savings_rate: dashboardData.summary.savings_rate,
    },
    previous_month: {
      year: currentYear,
      month: currentMonth - 1,
      income: previousIncome || {
        id: 'temp-prev-1',
        user_id: tempUserId,
        year: currentYear,
        month: currentMonth - 1,
        경훈_월급: 0,
        선화_월급: 0,
        other_income: 0,
        total_income: 0,
        notes: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      expenses: previousExpenses || {
        id: 'temp-prev-2',
        user_id: tempUserId,
        year: currentYear,
        month: currentMonth - 1,
        housing: 0,
        food: 0,
        transportation: 0,
        utilities: 0,
        healthcare: 0,
        entertainment: 0,
        other_expenses: 0,
        total_expenses: 0,
        notes: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      total_income: previousIncome?.total_income || 0,
      total_expenses: previousExpenses?.total_expenses || 0,
      total_savings: (previousIncome?.total_income || 0) - (previousExpenses?.total_expenses || 0),
      savings_rate: previousIncome?.total_income && previousExpenses?.total_expenses ? 
        ((previousIncome.total_income - previousExpenses.total_expenses) / previousIncome.total_income) * 100 : 0,
    },
    change: {
      income: { 
        amount: dashboardData.summary.total_income - (previousIncome?.total_income || 0), 
        percentage: previousIncome?.total_income ? ((dashboardData.summary.total_income - previousIncome.total_income) / previousIncome.total_income) * 100 : 0, 
        type: dashboardData.summary.total_income > (previousIncome?.total_income || 0) ? 'positive' as const : 'negative' as const
      },
      expenses: { 
        amount: (currentExpenses?.total_expenses || 0) - (previousExpenses?.total_expenses || 0), 
        percentage: previousExpenses?.total_expenses ? (((currentExpenses?.total_expenses || 0) - (previousExpenses?.total_expenses || 0)) / previousExpenses.total_expenses) * 100 : 0, 
        type: (currentExpenses?.total_expenses || 0) > (previousExpenses?.total_expenses || 0) ? 'positive' as const : 'negative' as const
      },
      savings: { 
        amount: dashboardData.summary.total_savings - ((previousIncome?.total_income || 0) - (previousExpenses?.total_expenses || 0)), 
        percentage: ((previousIncome?.total_income || 0) - (previousExpenses?.total_expenses || 0)) ? 
          ((dashboardData.summary.total_savings - ((previousIncome?.total_income || 0) - (previousExpenses?.total_expenses || 0))) / ((previousIncome?.total_income || 0) - (previousExpenses?.total_expenses || 0))) * 100 : 0, 
        type: dashboardData.summary.total_savings > ((previousIncome?.total_income || 0) - (previousExpenses?.total_expenses || 0)) ? 'positive' as const : 'negative' as const
      },
    },
  };

  // 에러가 있는 경우 표시
  if (error) {
    console.error('Dashboard data error:', error);
  }

  // 날짜 변경 핸들러
  const handleYearChange = (year: string) => {
    setCurrentYear(parseInt(year));
  };

  const handleMonthChange = (month: string) => {
    setCurrentMonth(parseInt(month));
  };

  // 이전/다음 월 이동
  const goToPreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // 현재 월로 이동
  const goToCurrentMonth = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth() + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 월 선택 및 데이터 입력 섹션 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {currentYear}년 {currentMonth}월 재무 현황
              </h2>
              <p className="text-gray-600">월별 수입, 지출, 저축 현황을 한눈에 확인하세요</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => router.push(`/income/${currentYear}/${currentMonth}`)}
                className="gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                수입 입력
              </Button>
              <Button 
                onClick={() => router.push(`/expenses/${currentYear}/${currentMonth}`)}
                variant="outline"
                className="gap-2"
              >
                <Wallet className="h-4 w-4" />
                지출 입력
              </Button>
            </div>
          </div>

          {/* 날짜 선택기 */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousMonth}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    이전 달
                  </Button>

                  <div className="flex items-center gap-2">
                    <Select value={currentYear.toString()} onValueChange={handleYearChange}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => 2020 + i).map(year => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}년
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={currentMonth.toString()} onValueChange={handleMonthChange}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                          <SelectItem key={month} value={month.toString()}>
                            {month}월
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextMonth}
                    className="gap-2"
                  >
                    다음 달
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToCurrentMonth}
                  className="gap-2"
                >
                  이번 달
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-500">데이터를 불러오는 중...</span>
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-2">데이터를 불러올 수 없습니다.</p>
            <p className="text-sm text-gray-500 mb-4">{error.message}</p>
            <Button onClick={() => window.location.reload()}>
              다시 시도
            </Button>
          </div>
        )}

        {/* 데이터가 없는 경우 안내 */}
        {!loading && !error && !hasRealData && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                데이터가 없습니다
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                {currentYear}년 {currentMonth}월의 수입/지출 데이터가 없습니다. 
                데이터를 입력하여 재무 현황을 확인해보세요.
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={() => router.push(`/income/${currentYear}/${currentMonth}`)}
                  className="gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  수입 입력하기
                </Button>
                <Button 
                  onClick={() => router.push(`/expenses/${currentYear}/${currentMonth}`)}
                  variant="outline"
                  className="gap-2"
                >
                  <Wallet className="h-4 w-4" />
                  지출 입력하기
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 데이터가 로드된 경우에만 컴포넌트 렌더링 */}
        {!loading && !error && (
          <>
            {/* 요약 카드 섹션 */}
            <DashboardHomeCards
              dashboardData={dashboardData}
              financialMetrics={financialMetrics}
              loading={loading}
              error={error}
            />

            {/* 월별 수입/지출 비교 차트 - 현재 월 포함 과거 6개월 데이터 */}
            <div className="mb-8">
              <IncomeExpenseChart
                data={recentMonths.map(({ year, month }, index) => {
                  const monthExpenses = recentExpensesQueries[index]?.data;
                  const monthIncome = recentIncomeQueries[index]?.data;
                  
                  return {
                    month: `${month}월`,
                    income: monthIncome?.total_income || 0,
                    expense: monthExpenses?.total_expenses || 0
                  };
                })}
              />
            </div>

            {/* 누적 저축 추이 차트 */}
            <div className="mb-8">
              <SavingsTrendChart
                financialMetrics={financialMetrics}
                loading={loading}
                error={error}
              />
            </div>

            {/* 통장/계좌별 잔액 차트 */}
            <div className="mb-8">
              <AccountBalanceChart
                accounts={dashboardData.accounts}
                loading={loading}
                error={error}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
