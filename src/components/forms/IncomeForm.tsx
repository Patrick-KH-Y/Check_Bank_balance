'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUpsertIncome } from '@/hooks/useIncome';
import { useIncome } from '@/hooks/useIncome';

interface IncomeFormProps {
  year: number;
  month: number;
  userId: string;
  initialData?: {
    경훈_월급: number;
    선화_월급: number;
    other_income: number;
    notes: string;
  };
  onFormChange?: () => void;
  onSaveSuccess?: () => void;
}

export default function IncomeForm({ year, month, userId, initialData, onFormChange, onSaveSuccess }: IncomeFormProps) {
  const [isClient, setIsClient] = useState(false);
  const [formData, setFormData] = useState({
    경훈_월급: initialData?.경훈_월급 || 0,
    선화_월급: initialData?.선화_월급 || 0,
    other_income: initialData?.other_income || 0,
    notes: initialData?.notes || '',
  });

  const { toast } = useToast();
  const upsertIncome = useUpsertIncome();

  // 이전 달 데이터 조회
  const getPreviousMonth = () => {
    let prevYear = year;
    let prevMonth = month - 1;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear -= 1;
    }
    return { year: prevYear, month: prevMonth };
  };

  const { year: prevYear, month: prevMonth } = getPreviousMonth();
  const { data: previousMonthData } = useIncome(userId, prevYear, prevMonth);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // initialData가 변경되면 폼 데이터 업데이트
  useEffect(() => {
    if (initialData) {
      setFormData({
        경훈_월급: initialData.경훈_월급 || 0,
        선화_월급: initialData.선화_월급 || 0,
        other_income: initialData.other_income || 0,
        notes: initialData.notes || '',
      });
    } else if (previousMonthData) {
      // 이전 달 데이터가 있으면 기본값으로 설정
      setFormData({
        경훈_월급: previousMonthData.경훈_월급 || 0,
        선화_월급: previousMonthData.선화_월급 || 0,
        other_income: 0, // 기타 수입은 0으로 초기화
        notes: '', // 메모는 빈 값으로 초기화
      });
    }
  }, [initialData, previousMonthData]);

  // 숫자를 콤마가 포함된 문자열로 변환
  const formatNumberWithComma = (value: number): string => {
    return value.toLocaleString('ko-KR');
  };

  // 콤마가 포함된 문자열을 숫자로 변환
  const parseNumberFromComma = (value: string): number => {
    return parseInt(value.replace(/[^\d]/g, '')) || 0;
  };

  const handleInputChange = (field: string, value: string) => {
    let numericValue: number;
    
    if (field === 'notes') {
      numericValue = 0; // 메모는 숫자가 아님
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    } else {
      numericValue = parseNumberFromComma(value);
      setFormData(prev => ({
        ...prev,
        [field]: numericValue
      }));
    }
    
    // 폼 변경 알림
    if (onFormChange) {
      onFormChange();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await upsertIncome.mutateAsync({
        userId,
        year,
        month,
        data: formData
      });
      
      toast({
        title: '성공',
        description: `${year}년 ${month}월 수입 정보가 저장되었습니다.`,
      });

      // 저장 성공 알림
      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (error) {
      console.error('수입 데이터 저장 오류:', error);
    }
  };

  const totalIncome = formData.경훈_월급 + formData.선화_월급 + formData.other_income;

  if (!isClient) {
    return (
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="경훈_월급">경훈 월급</Label>
          <Input
            id="경훈_월급"
            type="text"
            value={formatNumberWithComma(formData.경훈_월급)}
            onChange={(e) => handleInputChange('경훈_월급', e.target.value)}
            placeholder="0"
            className="text-right"
          />
          {previousMonthData && !initialData && (
            <p className="text-xs text-gray-500">
              이전 달({prevYear}년 {prevMonth}월) 기준: {formatNumberWithComma(previousMonthData.경훈_월급)}원
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="선화_월급">선화 월급</Label>
          <Input
            id="선화_월급"
            type="text"
            value={formatNumberWithComma(formData.선화_월급)}
            onChange={(e) => handleInputChange('선화_월급', e.target.value)}
            placeholder="0"
            className="text-right"
          />
          {previousMonthData && !initialData && (
            <p className="text-xs text-gray-500">
              이전 달({prevYear}년 {prevMonth}월) 기준: {formatNumberWithComma(previousMonthData.선화_월급)}원
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="other_income">기타 수입</Label>
        <Input
          id="other_income"
          type="text"
          value={formatNumberWithComma(formData.other_income)}
          onChange={(e) => handleInputChange('other_income', e.target.value)}
          placeholder="0"
          className="text-right"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">메모</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="수입에 대한 메모를 입력하세요"
          rows={3}
        />
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-semibold">총 수입:</span>
          <span className="text-lg font-bold text-green-600">
            {formatNumberWithComma(totalIncome)}원
          </span>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="submit"
          disabled={upsertIncome.isPending}
          className="w-full md:w-auto"
        >
          {upsertIncome.isPending ? '저장 중...' : '저장'}
        </Button>
      </div>
    </form>
  );
}
