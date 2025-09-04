'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, TrendingUp } from 'lucide-react';
import { useIncome } from '@/hooks/useIncome';
import IncomeForm from '@/components/forms/IncomeForm';
import DateSelector from '@/components/ui/date-selector';

export default function IncomePage() {
  const [isClient, setIsClient] = useState(false);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(9);
  const [isFormDirty, setIsFormDirty] = useState(false);
  
  const params = useParams();
  const router = useRouter();
  const tempUserId = 'temp-user-123';

  // URL 파라미터에서 초기 날짜 설정
  useEffect(() => {
    if (params.year && params.month) {
      setSelectedYear(parseInt(params.year as string));
      setSelectedMonth(parseInt(params.month as string));
    }
  }, [params]);

  const { data: incomeData, isLoading, error, refetch } = useIncome(tempUserId, selectedYear, selectedMonth);

  // 이전 달 데이터 조회
  const getPreviousMonth = () => {
    let prevYear = selectedYear;
    let prevMonth = selectedMonth - 1;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear -= 1;
    }
    return { year: prevYear, month: prevMonth };
  };

  const { year: prevYear, month: prevMonth } = getPreviousMonth();
  const { data: previousMonthData } = useIncome(tempUserId, prevYear, prevMonth);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDateChange = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    // URL 업데이트
    router.push(`/income/${year}/${month}`);
  };

  const handleFormChange = () => {
    setIsFormDirty(true);
  };

  const handleSaveSuccess = () => {
    setIsFormDirty(false);
    refetch(); // 데이터 다시 불러오기
  };

  const goBack = () => {
    router.push('/');
  };

  // 숫자 포맷팅 함수
  const formatNumberWithComma = (value: number): string => {
    return value.toLocaleString('ko-KR');
  };

  if (!isClient) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">오류 발생</CardTitle>
          </CardHeader>
          <CardContent>
            <p>수입 데이터를 불러올 수 없습니다: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 섹션 */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={goBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            뒤로 가기
          </Button>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">월별 수입 현황</h1>
            <p className="text-gray-600">월별 수입 정보를 입력하고 관리하세요</p>
          </div>

          {isFormDirty && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              <Save className="h-3 w-3 mr-1" />
              저장 필요
            </Badge>
          )}
        </div>

        {/* 날짜 선택기 */}
        <DateSelector
          year={selectedYear}
          month={selectedMonth}
          onDateChange={handleDateChange}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 수입 입력 폼 */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>{selectedYear}년 {selectedMonth}월 수입 입력</CardTitle>
            </CardHeader>
            <CardContent>
              <IncomeForm
                year={selectedYear}
                month={selectedMonth}
                userId={tempUserId}
                initialData={incomeData || undefined}
                onFormChange={handleFormChange}
                onSaveSuccess={handleSaveSuccess}
              />
            </CardContent>
          </Card>
        </div>

        {/* 현재 수입 현황 */}
        <div className="space-y-6">
          {/* 현재 달 현황 */}
          <Card>
            <CardHeader>
              <CardTitle>현재 수입 현황</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {incomeData ? (
                <>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">경훈 월급</span>
                      <Badge variant="secondary">
                        {formatNumberWithComma(incomeData.경훈_월급)}원
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">선화 월급</span>
                      <Badge variant="secondary">
                        {formatNumberWithComma(incomeData.선화_월급)}원
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <span className="font-medium">기타 수입</span>
                      <Badge variant="secondary">
                        {formatNumberWithComma(incomeData.other_income)}원
                      </Badge>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">총 수입</span>
                      <span className="text-2xl font-bold text-green-600">
                        {formatNumberWithComma(incomeData.total_income)}원
                      </span>
                    </div>
                  </div>

                  {incomeData.notes && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">메모</h4>
                      <p className="text-gray-600 text-sm">{incomeData.notes}</p>
                    </div>
                  )}

                  <div className="border-t pt-4 text-xs text-gray-500">
                    <p>마지막 수정: {new Date(incomeData.updated_at).toLocaleString('ko-KR')}</p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">아직 수입 데이터가 없습니다.</p>
                  <p className="text-sm text-gray-400">왼쪽 폼에서 수입 정보를 입력해주세요.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 이전 달 현황 */}
          {previousMonthData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  이전 달 현황 ({prevYear}년 {prevMonth}월)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">경훈 월급</span>
                  <span className="font-medium">{formatNumberWithComma(previousMonthData.경훈_월급)}원</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">선화 월급</span>
                  <span className="font-medium">{formatNumberWithComma(previousMonthData.선화_월급)}원</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">기타 수입</span>
                  <span className="font-medium">{formatNumberWithComma(previousMonthData.other_income)}원</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">총 수입</span>
                    <span className="font-bold text-green-600">
                      {formatNumberWithComma(previousMonthData.total_income)}원
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
