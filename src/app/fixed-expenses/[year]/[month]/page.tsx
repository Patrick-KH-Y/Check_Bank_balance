'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar } from 'lucide-react';
import FixedExpenseTable from '@/components/dashboard/FixedExpenseTable';
import DateSelector from '@/components/ui/date-selector';

export default function FixedExpensesPage() {
  const params = useParams();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [currentYear, setCurrentYear] = useState(2025);
  const [currentMonth, setCurrentMonth] = useState(9);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (params.year && params.month) {
      setCurrentYear(parseInt(params.year as string));
      setCurrentMonth(parseInt(params.month as string));
    }
  }, [params.year, params.month]);

  const handleDateChange = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
    router.push(`/fixed-expenses/${year}/${month}`);
  };

  const goToPreviousMonth = () => {
    let newYear = currentYear;
    let newMonth = currentMonth - 1;
    
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    
    handleDateChange(newYear, newMonth);
  };

  const goToNextMonth = () => {
    let newYear = currentYear;
    let newMonth = currentMonth + 1;
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    
    handleDateChange(newYear, newMonth);
  };

  const goToCurrentMonth = () => {
    const now = new Date();
    handleDateChange(now.getFullYear(), now.getMonth() + 1);
  };

  if (!isClient) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            뒤로 가기
          </Button>
          <div>
            <h1 className="text-2xl font-bold">고정 지출 관리</h1>
            <p className="text-gray-500">월별 고정 지출을 관리하세요</p>
          </div>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {currentYear}년 {currentMonth}월
        </Badge>
      </div>

      {/* 날짜 선택기 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">날짜 선택</CardTitle>
        </CardHeader>
        <CardContent>
          <DateSelector
            year={currentYear}
            month={currentMonth}
            onDateChange={handleDateChange}
          />
        </CardContent>
      </Card>

      {/* 고정 지출 테이블 */}
      <FixedExpenseTable
        userId="temp-user-123"
        year={currentYear}
        month={currentMonth}
      />
    </div>
  );
}

