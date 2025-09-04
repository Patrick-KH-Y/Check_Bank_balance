'use client';

import { useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  Building2, 
  CreditCard, 
  PiggyBank, 
  TrendingUp,
  AlertCircle,
  Info
} from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/utils/format';
import type { Account } from '@/types/dashboard';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface AccountBalanceChartProps {
  accounts: Account[];
  loading?: boolean;
  error?: Error | null;
}

type ChartView = 'pie' | 'list' | 'both';

// 계좌 타입별 색상 및 아이콘 매핑
const accountTypeConfig = {
  checking: {
    color: '#3b82f6',
    icon: Wallet,
    label: '입출금',
  },
  savings: {
    color: '#10b981',
    icon: PiggyBank,
    label: '저축',
  },
  credit: {
    color: '#f59e0b',
    icon: CreditCard,
    label: '신용카드',
  },
  investment: {
    color: '#8b5cf6',
    icon: TrendingUp,
    label: '투자',
  },
  other: {
    color: '#6b7280',
    icon: Building2,
    label: '기타',
  },
};

export default function AccountBalanceChart({
  accounts,
  loading = false,
  error = null,
}: AccountBalanceChartProps) {
  const [viewType, setViewType] = useState<ChartView>('both');

  // 계좌 데이터 처리 및 계산 - useMemo 제거
  const accountData = (() => {
    if (!accounts || accounts.length === 0) return { chartData: null, totalBalance: 0, summary: [] };

    const activeAccounts = accounts.filter(account => account.is_active);
    const totalBalance = activeAccounts.reduce((sum, account) => sum + account.balance, 0);

    // 파이차트용 데이터
    const chartData = {
      labels: activeAccounts.map(account => account.account_name),
      datasets: [
        {
          data: activeAccounts.map(account => account.balance),
          backgroundColor: activeAccounts.map(account => {
            const config = accountTypeConfig[account.account_type] || accountTypeConfig.other;
            return config.color;
          }),
          borderColor: activeAccounts.map(account => {
            const config = accountTypeConfig[account.account_type] || accountTypeConfig.other;
            return config.color;
          }),
          borderWidth: 2,
        },
      ],
    };

    // 요약 정보
    const summary = activeAccounts.map(account => {
      const percentage = totalBalance > 0 ? (account.balance / totalBalance) * 100 : 0;
      const config = accountTypeConfig[account.account_type] || accountTypeConfig.other;
      
      return {
        ...account,
        percentage,
        color: config.color,
        icon: config.icon,
        label: config.label,
      };
    });

    return { chartData, totalBalance, summary };
  })();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
          }
        }
      }
    },
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            계좌별 잔액 현황
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
            <div className="text-gray-500">데이터 로딩 중...</div>
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
            <Wallet className="h-5 w-5" />
            계좌별 잔액 현황
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-red-50 border-2 border-dashed border-red-300 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
              <p className="text-red-600 font-medium">데이터를 불러올 수 없습니다</p>
              <p className="text-red-500 text-sm mt-1">{error.message}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!accounts || accounts.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            계좌별 잔액 현황
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 font-medium">계좌 정보가 없습니다</p>
              <p className="text-gray-400 text-sm mt-1">계좌 정보를 입력해주세요</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { chartData, totalBalance, summary } = accountData;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            계좌별 잔액 현황
          </CardTitle>
          <div className="flex gap-2">
            <Badge
              variant={viewType === 'pie' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setViewType('pie')}
            >
              파이차트
            </Badge>
            <Badge
              variant={viewType === 'list' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setViewType('list')}
            >
              리스트
            </Badge>
            <Badge
              variant={viewType === 'both' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setViewType('both')}
            >
              전체보기
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* 총 잔액 요약 */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">총 자산</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-800">
                {formatCurrency(totalBalance)}
              </div>
              <div className="text-xs text-blue-600">
                {accounts.filter(a => a.is_active).length}개 계좌
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 파이차트 */}
          {(viewType === 'pie' || viewType === 'both') && chartData && (
            <div className="h-80">
              <Pie data={chartData} options={options} />
            </div>
          )}

          {/* 계좌 리스트 */}
          {(viewType === 'list' || viewType === 'both') && (
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-700 mb-3">계좌 상세</div>
              {summary.map((account, index) => {
                const IconComponent = account.icon;
                return (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: account.color }}
                      />
                      <IconComponent className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {account.account_name}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          <span>{account.label}</span>
                          <span>•</span>
                          <span>{account.currency}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(account.balance)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {account.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 계좌 타입별 요약 */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(accountTypeConfig).map(([type, config]) => {
            const typeAccounts = summary.filter(account => account.account_type === type);
            const typeTotal = typeAccounts.reduce((sum, account) => sum + account.balance, 0);
            const typePercentage = totalBalance > 0 ? (typeTotal / totalBalance) * 100 : 0;
            const IconComponent = config.icon;

            if (typeTotal === 0) return null;

            return (
              <div key={type} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <IconComponent className="h-4 w-4" style={{ color: config.color }} />
                  <span className="text-sm font-medium text-gray-700">{config.label}</span>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {formatCurrency(typeTotal)}
                </div>
                <div className="text-xs text-gray-500">
                  {typePercentage.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {typeAccounts.length}개 계좌
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}


