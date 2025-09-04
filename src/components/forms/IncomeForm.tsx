'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, DollarSign, User, Plus } from 'lucide-react';
import { incomeFormSchema, type IncomeFormData } from '@/lib/validations/financial';

interface IncomeFormProps {
  onSubmit: (data: IncomeFormData) => void;
  initialData?: IncomeFormData;
  loading?: boolean;
}

export default function IncomeForm({ onSubmit, initialData, loading = false }: IncomeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: initialData || {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      경훈_월급: 0,
      선화_월급: 0,
      other_income: 0,
      notes: '',
    },
  });

  const watchedValues = watch();

  const formatCurrency = (value: number) => {
    return value.toLocaleString('ko-KR');
  };

  const parseCurrency = (value: string) => {
    return parseInt(value.replace(/[^\d]/g, '')) || 0;
  };

  const handleFormSubmit = (data: IncomeFormData) => {
    onSubmit(data);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          월급 정보 입력
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">연도</Label>
              <Input
                id="year"
                type="number"
                {...register('year', { valueAsNumber: true })}
                min={2020}
                max={2030}
                required
              />
              {errors.year && (
                <p className="text-sm text-red-600">{errors.year.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="month">월</Label>
              <Input
                id="month"
                type="number"
                {...register('month', { valueAsNumber: true })}
                min={1}
                max={12}
                required
              />
              {errors.month && (
                <p className="text-sm text-red-600">{errors.month.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="경훈_월급" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              경훈 월급
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="경훈_월급"
                type="text"
                value={formatCurrency(watchedValues.경훈_월급 || 0)}
                onChange={(e) => setValue('경훈_월급', parseCurrency(e.target.value))}
                className="pl-10"
                placeholder="0"
                required
              />
            </div>
            {errors.경훈_월급 && (
              <p className="text-sm text-red-600">{errors.경훈_월급.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="선화_월급" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              선화 월급
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="선화_월급"
                type="text"
                value={formatCurrency(watchedValues.선화_월급 || 0)}
                onChange={(e) => setValue('선화_월급', parseCurrency(e.target.value))}
                className="pl-10"
                placeholder="0"
                required
              />
            </div>
            {errors.선화_월급 && (
              <p className="text-sm text-red-600">{errors.선화_월급.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="other_income" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              기타 수입
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="other_income"
                type="text"
                value={formatCurrency(watchedValues.other_income || 0)}
                onChange={(e) => setValue('other_income', parseCurrency(e.target.value))}
                className="pl-10"
                placeholder="0"
              />
            </div>
            {errors.other_income && (
              <p className="text-sm text-red-600">{errors.other_income.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">메모</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="수입에 대한 추가 메모를 입력하세요"
              rows={3}
            />
            {errors.notes && (
              <p className="text-sm text-red-600">{errors.notes.message}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={!isValid || loading}
          >
            {loading ? '저장 중...' : '월급 저장'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
