'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import DashboardHomeCards from '@/components/dashboard/DashboardHomeCards';
import IncomeExpenseChart from '@/components/dashboard/IncomeExpenseChart';
import SavingsTrendChart from '@/components/dashboard/SavingsTrendChart';
import AccountBalanceChart from '@/components/dashboard/AccountBalanceChart';
import IncomeForm from '@/components/forms/IncomeForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, PiggyBank, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCurrentMonthDashboard } from '@/hooks/useDashboardData';

// 임시 데이터 (나중에 실제 데이터베이스로 교체)
const mockData = {
  currentMonth: {
    year: 2025,
    month: 9,
    경훈_월급: 5000000,
    선화_월급: 6000000,
    totalIncome: 11000000,
    expenses: 8000000,
    savings: 3000000,
  },
  previousMonth: {
    totalIncome: 10500000,
    expenses: 7500000,
    savings: 3000000,
  }
};

export default function Home() {
  const { toast } = useToast();
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [incomeData, setIncomeData] = useState(mockData.currentMonth);
  
  // 임시 사용자 ID (실제로는 인증 시스템에서 가져와야 함)
  const tempUserId = 'temp-user-123';
  // const { dashboardData, financialMetrics, loading, error } = useCurrentMonthDashboard(tempUserId);
  
  // 임시로 더미 데이터 사용 (데이터베이스 연결 문제 해결 후 실제 데이터 사용)
  const dashboardData = {
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
  
  const financialMetrics = {
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
      income: {
        id: 'temp-prev-1',
        user_id: tempUserId,
        year: 2025,
        month: 8,
        경훈_월급: 4800000,
        선화_월급: 5700000,
        other_income: 0,
        total_income: 10500000,
        notes: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      expenses: {
        id: 'temp-prev-2',
        user_id: tempUserId,
        year: 2025,
        month: 8,
        housing: 1900000,
        food: 1400000,
        transportation: 480000,
        utilities: 280000,
        healthcare: 180000,
        entertainment: 280000,
        other_expenses: 180000,
        total_expenses: 4800000,
        notes: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
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
  
  const loading = false;
  const error = null;

  const handleIncomeSubmit = (data: { year?: number; month?: number; 경훈_월급?: number; 선화_월급?: number; other_income?: number; notes?: string }) => {
    // 임시로 로컬 상태 업데이트 (나중에 데이터베이스 연동)
    setIncomeData(prev => ({
      ...prev,
      ...data,
      totalIncome: data.경훈_월급 + data.선화_월급
    }));
    
    setShowIncomeForm(false);
    toast({
      description: '월급 정보가 성공적으로 저장되었습니다.',
    });
  };



  // 에러가 있는 경우 표시
  if (error) {
    console.error('Dashboard data error:', error);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 월 선택 및 데이터 입력 섹션 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {incomeData.year}년 {incomeData.month}월 재무 현황
              </h2>
              <p className="text-gray-600">월별 수입, 지출, 저축 현황을 한눈에 확인하세요</p>
            </div>
            <Button 
              onClick={() => setShowIncomeForm(!showIncomeForm)}
              className="gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              {showIncomeForm ? '입력 폼 닫기' : '월급 입력'}
            </Button>
          </div>

          {showIncomeForm && (
            <div className="mb-6">
              <IncomeForm 
                onSubmit={handleIncomeSubmit}
                initialData={incomeData}
              />
            </div>
          )}
        </div>

        {/* 요약 카드 섹션 */}
        <DashboardHomeCards
          dashboardData={dashboardData}
          financialMetrics={financialMetrics}
          loading={loading}
          error={error}
        />

        {/* 월별 수입/지출 비교 차트 */}
        <div className="mb-8">
          <IncomeExpenseChart
            data={[
              { month: '1월', income: financialMetrics?.current_month?.total_income || 0, expense: financialMetrics?.current_month?.total_expenses || 0 },
              { month: '2월', income: financialMetrics?.previous_month?.total_income || 0, expense: financialMetrics?.previous_month?.total_expenses || 0 },
            ]}
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

        {/* 계좌별 잔액 현황 */}
        <div className="mb-8">
          <AccountBalanceChart
            accounts={dashboardData?.accounts || []}
            loading={loading}
            error={error}
          />
        </div>

        {/* 상세 정보 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                월급 상세 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">경훈 월급</span>
                <span className="font-semibold">{incomeData.경훈_월급.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">선화 월급</span>
                <span className="font-semibold">{incomeData.선화_월급.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between items-center py-2 bg-blue-50 p-3 rounded-lg">
                <span className="text-gray-700 font-medium">총 월급</span>
                <span className="text-blue-600 font-bold text-lg">{incomeData.totalIncome.toLocaleString()}원</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                지출 분석
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">총 수입</span>
                <span className="font-semibold text-green-600">{incomeData.totalIncome.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">총 지출</span>
                <span className="font-semibold text-red-600">{incomeData.expenses.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between items-center py-2 bg-green-50 p-3 rounded-lg">
                <span className="text-gray-700 font-medium">순 저축</span>
                <span className="text-green-600 font-bold text-lg">{incomeData.savings.toLocaleString()}원</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
