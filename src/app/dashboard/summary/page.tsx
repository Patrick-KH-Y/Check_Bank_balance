'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, PiggyBank, Wallet, BarChart3, Building2, AlertCircle, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import { ExportButton } from '@/components/dashboard/ExportButton';
import type { DashboardData, FinancialMetrics } from '@/types/dashboard';

export default function DashboardSummaryPage() {
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(9);
  
  // 임시 사용자 ID (실제로는 인증 시스템에서 가져와야 함)
  const tempUserId = 'temp-user-123';
  
  // 임시로 더미 데이터 사용 (데이터베이스 연결 문제 해결 후 실제 데이터 사용)
  const dashboardData: DashboardData = {
    monthly_income: {
      id: 'temp-1',
      user_id: tempUserId,
      year: 2025,
      month: 9,
      경훈_월급: 5000000,
      선화_월급: 6000000,
      other_income: 0,
      total_income: 11000000,
      notes: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    monthly_expenses: {
      id: 'temp-2',
      user_id: tempUserId,
      year: 2025,
      month: 9,
      housing: 2000000,
      food: 1500000,
      transportation: 500000,
      utilities: 300000,
      healthcare: 200000,
      entertainment: 300000,
      other_expenses: 200000,
      total_expenses: 5000000,
      notes: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    accounts: [
      {
        id: 'temp-3',
        user_id: tempUserId,
        account_name: '주거래은행',
        account_type: 'checking' as const,
        balance: 15000000,
        currency: 'KRW',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'temp-4',
        user_id: tempUserId,
        account_name: '저축은행',
        account_type: 'savings' as const,
        balance: 50000000,
        currency: 'KRW',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ],
    summary: {
      total_income: 11000000,
      total_expenses: 5000000,
      total_savings: 6000000,
      savings_rate: 54.5,
    },
  };

  const financialMetrics: FinancialMetrics = {
    current_month: {
      year: 2025,
      month: 9,
      income: dashboardData.monthly_income,
      expenses: dashboardData.monthly_expenses,
      total_income: 11000000,
      total_expenses: 5000000,
      total_savings: 6000000,
      savings_rate: 54.5,
    },
    previous_month: {
      year: 2025,
      month: 8,
      income: dashboardData.monthly_income,
      expenses: dashboardData.monthly_expenses,
      total_income: 10500000,
      total_expenses: 4800000,
      total_savings: 5700000,
      savings_rate: 54.3,
    },
    change: {
      income: { amount: 500000, percentage: 4.8, type: 'positive' as const },
      expenses: { amount: 200000, percentage: 4.2, type: 'positive' as const },
      savings: { amount: 300000, percentage: 5.3, type: 'positive' as const },
    },
  };

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

  // 변화율 정보 가져오기
  const incomeChange = getChangeInfo(summary.total_income, financialMetrics.previous_month.total_income);
  const expensesChange = getChangeInfo(summary.total_expenses, financialMetrics.previous_month.total_expenses);
  const savingsChange = getChangeInfo(summary.total_savings, financialMetrics.previous_month.total_savings);

  // 년도 옵션 생성 (현재 년도부터 3년 전까지)
  const yearOptions = Array.from({ length: 4 }, (_, i) => 2025 - i);
  
  // 월 옵션 생성
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                월별 누적 현황 대시보드
              </h1>
              <p className="text-gray-600 mt-2">
                월별 수입, 지출, 저축, 통장 현황을 한눈에 확인하고 분석하세요
              </p>
            </div>
            
            {/* 월 선택 */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">년도:</label>
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}년
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">월:</label>
                <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((month) => (
                      <SelectItem key={month} value={month.toString()}>
                        {month}월
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* 요약 카드 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* 월별 수입 카드 */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500 hover:border-l-green-600 hover:-translate-y-1 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors flex items-center gap-2">
                월별 수입
                <div className="relative group/tooltip">
                  <Info className="h-3 w-3 text-gray-400 group-hover/tooltip:text-gray-600 transition-colors" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-pre-line z-10">
                    경훈 월급: {formatCurrency(monthly_income.경훈_월급)}
                    선화 월급: {formatCurrency(monthly_income.선화_월급)}
                    기타 수입: {formatCurrency(monthly_income.other_income)}
                  </div>
                </div>
              </CardTitle>
              <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                <Wallet className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                {formatCurrency(summary.total_income)}
              </div>
              <p className="text-xs text-gray-500 mt-1 group-hover:text-gray-600 transition-colors">
                {currentMonth} 기준
              </p>
              <div className={`flex items-center text-xs mt-2 ${incomeChange.type === 'positive' ? 'text-green-600' : incomeChange.type === 'negative' ? 'text-red-600' : 'text-gray-600'}`}>
                {incomeChange.type === 'positive' ? <TrendingUp className="h-4 w-4" /> : incomeChange.type === 'negative' ? <TrendingDown className="h-4 w-4" /> : null}
                <span className="ml-1">{incomeChange.text}</span>
              </div>
            </CardContent>
          </Card>

          {/* 월별 지출 카드 */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-red-500 hover:border-l-red-600 hover:-translate-y-1 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors flex items-center gap-2">
                월별 지출
                <div className="relative group/tooltip">
                  <Info className="h-3 w-3 text-gray-400 group-hover/tooltip:text-gray-600 transition-colors" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-pre-line z-10">
                    주거비: {formatCurrency(monthly_expenses.housing)}
                    식비: {formatCurrency(monthly_expenses.food)}
                    교통비: {formatCurrency(monthly_expenses.transportation)}
                    기타: {formatCurrency(monthly_expenses.other_expenses)}
                  </div>
                </div>
              </CardTitle>
              <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                <BarChart3 className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 group-hover:text-red-700 transition-colors">
                {formatCurrency(summary.total_expenses)}
              </div>
              <p className="text-xs text-gray-500 mt-1 group-hover:text-gray-600 transition-colors">
                {currentMonth} 기준
              </p>
              <div className={`flex items-center text-xs mt-2 ${expensesChange.type === 'positive' ? 'text-green-600' : expensesChange.type === 'negative' ? 'text-red-600' : 'text-gray-600'}`}>
                {expensesChange.type === 'positive' ? <TrendingUp className="h-4 w-4" /> : expensesChange.type === 'negative' ? <TrendingDown className="h-4 w-4" /> : null}
                <span className="ml-1">{expensesChange.text}</span>
              </div>
            </CardContent>
          </Card>

          {/* 월별 저축 카드 */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500 hover:border-l-blue-600 hover:-translate-y-1 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors flex items-center gap-2">
                월별 저축
                <div className="relative group/tooltip">
                  <Info className="h-3 w-3 text-gray-400 group-hover/tooltip:text-gray-600 transition-colors" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-pre-line z-10">
                    저축률: {summary.savings_rate.toFixed(1)}%
                    목표 달성률: {summary.savings_rate >= 20 ? '✅' : '⚠️'}
                  </div>
                </div>
              </CardTitle>
              <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                <PiggyBank className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                {formatCurrency(summary.total_savings)}
              </div>
              <p className="text-xs text-gray-500 mt-1 group-hover:text-gray-600 transition-colors">
                저축률: {summary.savings_rate.toFixed(1)}%
              </p>
              <div className={`flex items-center text-xs mt-2 ${savingsChange.type === 'positive' ? 'text-green-600' : savingsChange.type === 'negative' ? 'text-red-600' : 'text-gray-600'}`}>
                {savingsChange.type === 'positive' ? <TrendingUp className="h-4 w-4" /> : savingsChange.type === 'negative' ? <TrendingDown className="h-4 w-4" /> : null}
                <span className="ml-1">{savingsChange.text}</span>
              </div>
            </CardContent>
          </Card>

          {/* 통장 잔액 카드 */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500 hover:border-l-purple-600 hover:-translate-y-1 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors flex items-center gap-2">
                통장 잔액
                <div className="relative group/tooltip">
                  <Info className="h-3 w-3 text-gray-400 group-hover/tooltip:text-gray-600 transition-colors" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-pre-line z-10">
                    활성 계좌: {activeAccounts.length}개
                    총 자산: {formatCurrency(totalBalance)}
                  </div>
                </div>
              </CardTitle>
              <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                <Building2 className="h-5 w-5 text-purple-600" />
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
        </div>

        {/* Export Button */}
        <div className="mb-8">
          <ExportButton
            userId={tempUserId}
            currentYear={selectedYear}
            currentMonth={selectedMonth}
            onExport={() => {
              console.log('Export completed');
            }}
          />
        </div>

        {/* 상세 정보 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                월별 수입 상세
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">경훈 월급</span>
                <span className="font-semibold">{monthly_income.경훈_월급.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">선화 월급</span>
                <span className="font-semibold">{monthly_income.선화_월급.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">기타 수입</span>
                <span className="font-semibold">{monthly_income.other_income.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between items-center py-2 bg-green-50 p-3 rounded-lg">
                <span className="text-gray-700 font-medium">총 수입</span>
                <span className="text-green-600 font-bold text-lg">{monthly_income.total_income.toLocaleString()}원</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                월별 지출 분석
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">주거비</span>
                <span className="font-semibold">{monthly_expenses.housing.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">식비</span>
                <span className="font-semibold">{monthly_expenses.food.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">교통비</span>
                <span className="font-semibold">{monthly_expenses.transportation.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">공과금</span>
                <span className="font-semibold">{monthly_expenses.utilities.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">의료비</span>
                <span className="font-semibold">{monthly_expenses.healthcare.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">여가비</span>
                <span className="font-semibold">{monthly_expenses.entertainment.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">기타 지출</span>
                <span className="font-semibold">{monthly_expenses.other_expenses.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between items-center py-2 bg-red-50 p-3 rounded-lg">
                <span className="text-gray-700 font-medium">총 지출</span>
                <span className="text-red-600 font-bold text-lg">{monthly_expenses.total_expenses.toLocaleString()}원</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

