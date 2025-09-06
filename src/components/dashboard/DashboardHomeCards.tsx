'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, PiggyBank, Wallet, BarChart3, Building2, AlertCircle, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import Link from 'next/link';
import type { DashboardData, FinancialMetrics } from '@/types/dashboard';
import { ariaUtils, screenReader } from '@/lib/accessibility';

interface DashboardHomeCardsProps {
  dashboardData: DashboardData | null;
  financialMetrics: FinancialMetrics | null;
  loading?: boolean;
  error?: Error | null;
  userId?: string;
}

export default function DashboardHomeCards({
  dashboardData,
  financialMetrics,
  loading = false,
  error = null,
  userId
}: DashboardHomeCardsProps) {
  if (loading) {
    return (
      <div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        role="region"
        aria-label="대시보드 카드 로딩 중"
        aria-live="polite"
      >
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        role="alert"
        aria-live="assertive"
      >
        <Card className="border-dashed border-2 border-red-300 col-span-full">
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" aria-hidden="true" />
              <p className="text-red-600 font-medium">데이터를 불러올 수 없습니다</p>
              <p className="text-red-500 text-sm mt-1">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        role="region"
        aria-label="대시보드 데이터 없음"
      >
        <Card className="border-dashed border-2 border-gray-300 col-span-full">
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" aria-hidden="true" />
              <p className="text-gray-500 font-medium">데이터가 없습니다</p>
              <p className="text-gray-400 text-sm mt-1">월별 데이터를 입력해주세요</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { monthly_income, monthly_expenses, accounts, summary } = dashboardData;
  const currentMonth = `${monthly_income.year}년 ${monthly_income.month}월`;

  // 통장 잔액 계산
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const activeAccounts = accounts.filter(account => account.is_active);

  // 변화율 계산
  const getChangeInfo = (current: number, previous: number) => {
    if (previous === 0) return { type: 'neutral' as const, text: '이전 데이터 없음', percentage: 0 };
    
    const change = current - previous;
    const percentage = (change / previous) * 100;
    
    if (change > 0) {
      return { 
        type: 'positive' as const, 
        text: `+${formatCurrency(change)} (+${percentage.toFixed(1)}%)`, 
        percentage 
      };
    } else if (change < 0) {
      return { 
        type: 'negative' as const, 
        text: `${formatCurrency(change)} (${percentage.toFixed(1)}%)`, 
        percentage 
      };
    } else {
      return { type: 'neutral' as const, text: '변화 없음', percentage: 0 };
    }
  };

  // 이전 달 데이터가 있는 경우 변화율 계산
  const previousMonthData = financialMetrics?.previous_month;
  const incomeChange = previousMonthData 
    ? getChangeInfo(summary.total_income, previousMonthData.total_income)
    : { type: 'neutral' as const, text: '이전 데이터 없음', percentage: 0 };
  
  const expensesChange = previousMonthData 
    ? getChangeInfo(summary.total_expenses, previousMonthData.total_expenses)
    : { type: 'negative' as const, text: '이전 데이터 없음', percentage: 0 };
  
  const savingsChange = previousMonthData 
    ? getChangeInfo(summary.total_savings, previousMonthData.total_savings)
    : { type: 'neutral' as const, text: '이전 데이터 없음', percentage: 0 };

  // 카드별 상세 정보 툴팁
  const getCardTooltip = (cardType: string) => {
    switch (cardType) {
      case 'income':
        return `경훈 월급: ${formatCurrency(monthly_income.경훈_월급)}\n선화 월급: ${formatCurrency(monthly_income.선화_월급)}\n기타 수입: ${formatCurrency(monthly_income.other_income || 0)}`;
      case 'expenses':
        return `주거비: ${formatCurrency(monthly_expenses.housing)}\n식비: ${formatCurrency(monthly_expenses.food)}\n교통비: ${formatCurrency(monthly_expenses.transportation)}\n기타: ${formatCurrency(monthly_expenses.other_expenses)}`;
      case 'savings':
        return `저축률: ${summary.savings_rate.toFixed(1)}%\n목표 달성률: ${summary.savings_rate >= 20 ? '✅' : '⚠️'}`;
      case 'balance':
        return `활성 계좌: ${activeAccounts.length}개\n총 자산: ${formatCurrency(totalBalance)}`;
      default:
        return '';
    }
  };

  return (
    <div 
      className="space-y-8"
      role="region"
      aria-label={`${currentMonth} 재무 현황`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* 월별 수입 카드 */}
        <Link href={`/income/${monthly_income.year}/${monthly_income.month}`}>
          <Card 
            className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500 hover:border-l-green-600 hover:-translate-y-1 cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label={`${currentMonth} 수입: ${formatCurrency(summary.total_income)}. ${incomeChange.text}. 클릭하여 상세 보기`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors flex items-center gap-2">
                월별 수입
                <div className="relative group/tooltip">
                  <Info className="h-3 w-3 text-gray-400 group-hover/tooltip:text-gray-600 transition-colors" aria-hidden="true" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-pre-line z-10">
                    {getCardTooltip('income')}
                  </div>
                </div>
              </CardTitle>
              <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                <Wallet className="h-5 w-5 text-green-600" aria-hidden="true" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                {formatCurrency(summary.total_income)}
              </div>
              <p className="text-xs text-gray-500 mt-1 group-hover:text-gray-600 transition-colors">
                {currentMonth} 기준
              </p>
              <div className={`flex items-center text-xs mt-2 ${getChangeColor(incomeChange.type)}`}>
                {getChangeIcon(incomeChange.type)}
                <span className="ml-1">{incomeChange.text}</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* 월별 지출 카드 */}
        <Link href={`/expenses/${monthly_expenses.year}/${monthly_expenses.month}`}>
          <Card 
            className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-red-500 hover:border-l-red-600 hover:-translate-y-1 cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label={`${currentMonth} 지출: ${formatCurrency(summary.total_expenses)}. ${expensesChange.text}. 클릭하여 상세 보기`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors flex items-center gap-2">
                월별 지출
                <div className="relative group/tooltip">
                  <Info className="h-3 w-3 text-gray-400 group-hover/tooltip:text-gray-600 transition-colors" aria-hidden="true" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-pre-line z-10">
                    {getCardTooltip('expenses')}
                  </div>
                </div>
              </CardTitle>
              <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                <BarChart3 className="h-5 w-5 text-red-600" aria-hidden="true" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 group-hover:text-red-700 transition-colors">
                {formatCurrency(summary.total_expenses)}
              </div>
              <p className="text-xs text-gray-500 mt-1 group-hover:text-gray-600 transition-colors">
                {currentMonth} 기준
              </p>
              <div className={`flex items-center text-xs mt-2 ${getChangeColor(expensesChange.type)}`}>
                {getChangeIcon(expensesChange.type)}
                <span className="ml-1">{expensesChange.text}</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* 월별 저축 카드 */}
        <Link href={`/savings/${monthly_income.year}/${monthly_income.month}`}>
          <Card 
            className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500 hover:border-l-blue-600 hover:-translate-y-1 cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label={`${currentMonth} 저축: ${formatCurrency(summary.total_savings)}. ${savingsChange.text}. 클릭하여 상세 보기`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors flex items-center gap-2">
                월별 저축
                <div className="relative group/tooltip">
                  <Info className="h-3 w-3 text-gray-400 group-hover/tooltip:text-gray-600 transition-colors" aria-hidden="true" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-pre-line z-10">
                    {getCardTooltip('savings')}
                  </div>
                </div>
              </CardTitle>
              <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                <PiggyBank className="h-5 w-5 text-blue-600" aria-hidden="true" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                {formatCurrency(summary.total_savings)}
              </div>
              <p className="text-xs text-gray-500 mt-1 group-hover:text-gray-600 transition-colors">
                저축률: {summary.savings_rate.toFixed(1)}%
              </p>
              <div className={`flex items-center text-xs mt-2 ${getChangeColor(savingsChange.type)}`}>
                {getChangeIcon(savingsChange.type)}
                <span className="ml-1">{savingsChange.text}</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* 통장 잔액 카드 */}
        <Link href={`/accounts/${monthly_income.year}/${monthly_income.month}`}>
          <Card 
            className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500 hover:border-l-purple-600 hover:-translate-y-1 cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label={`통장 잔액: ${formatCurrency(totalBalance)}. 활성 계좌 ${activeAccounts.length}개. 클릭하여 상세 보기`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors flex items-center gap-2">
                통장 잔액
                <div className="relative group/tooltip">
                  <Info className="h-3 w-3 text-gray-400 group-hover/tooltip:text-gray-600 transition-colors" aria-hidden="true" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-pre-line z-10">
                    {getCardTooltip('balance')}
                  </div>
                </div>
              </CardTitle>
              <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                <Building2 className="h-5 w-5 text-purple-600" aria-hidden="true" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                {formatCurrency(totalBalance)}
              </div>
              <p className="text-xs text-gray-500 mt-1 group-hover:text-gray-600 transition-colors">
                활성 계좌: {activeAccounts.length}개
              </p>
              <div className="text-xs text-gray-600 mt-2 group-hover:text-gray-700 transition-colors">
                총 자산 현황
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

// 변화 타입에 따른 색상 반환
function getChangeColor(changeType: 'positive' | 'negative' | 'neutral') {
  switch (changeType) {
    case 'positive':
      return 'text-green-600';
    case 'negative':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

// 변화 타입에 따른 아이콘 반환
function getChangeIcon(changeType: 'positive' | 'negative' | 'neutral') {
  switch (changeType) {
    case 'positive':
      return <TrendingUp className="h-4 w-4" />;
    case 'negative':
      return <TrendingDown className="h-4 w-4" />;
    default:
      return null;
  }
}

