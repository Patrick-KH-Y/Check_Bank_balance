'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface IncomeExpenseChartProps {
  data: {
    month: string;
    income: number;
    expense: number;
  }[];
}

export default function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  const chartData = {
    labels: data.map(item => item.month),
    datasets: [
      {
        label: '수입',
        data: data.map(item => item.income),
        backgroundColor: '#10b981',
        borderColor: '#10b981',
        borderWidth: 1,
      },
      {
        label: '지출',
        data: data.map(item => item.expense),
        backgroundColor: '#ef4444',
        borderColor: '#ef4444',
        borderWidth: 1,
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>월별 수입/지출 현황</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: '300px' }}>
          <Bar data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
