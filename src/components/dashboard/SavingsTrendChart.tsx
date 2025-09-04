'use client';

import { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, PiggyBank, Calendar, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import type { FinancialMetrics } from '@/types/dashboard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SavingsTrendChartProps {
  financialMetrics: FinancialMetrics | null;
  loading?: boolean;
  error?: Error | null;
}

type ChartType = 'line' | 'area' | 'composed';

export default function SavingsTrendChart({
  financialMetrics,
  loading = false,
  error = null,
}: SavingsTrendChartProps) {
  const [chartType, setChartType] = useState<ChartType>('line');

  // 간단한 데이터 처리 - useMemo 제거
  const cumulativeSavingsData = (() => {
    if (!financialMetrics) return [];

    const { current_month, previous_month } = financialMetrics;
    
    const months = [];
    let cumulativeSavings = 0;
    
    // 이전 달 데이터가 있는 경우
    if (previous_month && previous_month.total_savings > 0) {
      months.push({
        month: `${previous_month.year}년 ${previous_month.month}월`,
        year: previous_month.year,
        monthNum: previous_month.month,
        savings: previous_month.total_savings,
        cumulativeSavings: previous_month.total_savings,
        income: previous_month.total_income,
        expenses: previous_month.total_expenses,
      });
      cumulativeSavings = previous_month.total_savings;
    }
    
    // 현재 달 데이터
    if (current_month) {
      months.push({
        month: `${current_month.year}년 ${current_month.month}월`,
        year: current_month.year,
        monthNum: current_month.month,
        savings: current_month.total_savings,
        cumulativeSavings: cumulativeSavings + current_month.total_savings,
        income: current_month.total_income,
        expenses: current_month.total_expenses,
      });
    }

    return months;
  })();

  const chartData = {
    labels: cumulativeSavingsData.map(item => item.month),
    datasets: [
      {
        label: '누적 저축',
        data: cumulativeSavingsData.map(item => item.cumulativeSavings),
        borderColor: '#3b82f6',
        backgroundColor: chartType === 'area' ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
        borderWidth: 3,
        fill: chartType === 'area',
        tension: 0.4,
      },
      {
        label: '월 저축',
        data: cumulativeSavingsData.map(item => item.savings),
        borderColor: '#10b981',
        backgroundColor: chartType === 'area' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: chartType === 'area',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            if (value >= 10000000) {
              return `${(value / 10000000).toFixed(1)}천만`;
            } else if (value >= 10000) {
              return `${(value / 10000).toFixed(0)}만`;
            }
            return value.toLocaleString();
          }
        }
      },
    },
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            누적 저축 추이
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
            <div className="text-gray-500">차트 로딩 중...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            누적 저축 추이
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-red-50 border-2 border-dashed border-red-300 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <PiggyBank className="h-12 w-12 text-red-500 mx-auto mb-2" />
              <p className="text-red-600 font-medium">차트를 불러올 수 없습니다</p>
              <p className="text-red-500 text-sm mt-1">{error.message}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!financialMetrics || cumulativeSavingsData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            누적 저축 추이
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <PiggyBank className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 font-medium">데이터가 없습니다</p>
              <p className="text-gray-400 text-sm mt-1">월별 데이터를 입력해주세요</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 총 저축 및 변화율 계산
  const totalSavings = cumulativeSavingsData[cumulativeSavingsData.length - 1]?.cumulativeSavings || 0;
  const previousTotalSavings = cumulativeSavingsData[0]?.cumulativeSavings || 0;
  const savingsChange = totalSavings - previousTotalSavings;
  const savingsChangePercentage = previousTotalSavings > 0 ? (savingsChange / previousTotalSavings) * 100 : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            누적 저축 추이
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={chartType === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('line')}
              className="text-xs"
            >
              라인 차트
            </Button>
            <Button
              variant={chartType === 'area' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('area')}
              className="text-xs"
            >
              영역 차트
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <Line data={chartData} options={options} />
        </div>
        
        {/* 요약 정보 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <PiggyBank className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">총 누적 저축</span>
            </div>
            <div className="text-lg font-bold text-blue-800">
              {formatCurrency(totalSavings)}
            </div>
            <div className="text-xs text-blue-600">
              {cumulativeSavingsData.length}개월 누적
            </div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">저축 변화</span>
            </div>
            <div className="text-lg font-bold text-green-800">
              {savingsChange >= 0 ? '+' : ''}
              {formatCurrency(savingsChange)}
            </div>
            <div className="text-xs text-green-600">
              {savingsChangePercentage >= 0 ? '+' : ''}
              {savingsChangePercentage.toFixed(1)}%
            </div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">평균 월 저축</span>
            </div>
            <div className="text-lg font-bold text-purple-800">
              {formatCurrency(totalSavings / Math.max(cumulativeSavingsData.length, 1))}
            </div>
            <div className="text-xs text-purple-600">
              월 평균
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
