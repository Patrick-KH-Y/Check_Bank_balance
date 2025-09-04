'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, DollarSign, Home, Utensils, Car, Zap, Heart, Gamepad2, Plus } from 'lucide-react';
import { expenseFormSchema, type ExpenseFormData } from '@/lib/validations/financial';

interface ExpenseFormProps {
  onSubmit: (data: ExpenseFormData) => void;
  initialData?: ExpenseFormData;
  loading?: boolean;
}

export default function ExpenseForm({ onSubmit, initialData, loading = false }: ExpenseFormProps) {
  const [showOtherExpenses, setShowOtherExpenses] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: initialData || {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      housing: 0,
      food: 0,
      transportation: 0,
      utilities: 0,
      healthcare: 0,
      entertainment: 0,
      other_expenses: 0,
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

  const handleFormSubmit = (data: ExpenseFormData) => {
    onSubmit(data);
  };

  const totalExpenses = Object.entries(watchedValues).reduce((sum, [key, value]) => {
    // 숫자 필드만 계산에 포함 (notes 등은 제외)
    const numericFields = ['housing', 'food', 'transportation', 'utilities', 'healthcare', 'entertainment', 'other_expenses'];
    if (numericFields.includes(key) && typeof value === 'number' && value > 0) {
      return sum + value;
    }
    return sum;
  }, 0);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          월별 지출 정보 입력
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* 연도 및 월 선택 */}
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

          {/* 지출 카테고리별 입력 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 주거비 */}
            <div className="space-y-2">
              <Label htmlFor="housing" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                주거비
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="housing"
                  type="text"
                  value={formatCurrency(watchedValues.housing || 0)}
                  onChange={(e) => setValue('housing', parseCurrency(e.target.value))}
                  className="pl-10"
                  placeholder="0"
                />
              </div>
              {errors.housing && (
                <p className="text-sm text-red-600">{errors.housing.message}</p>
              )}
            </div>

            {/* 식비 */}
            <div className="space-y-2">
              <Label htmlFor="food" className="flex items-center gap-2">
                <Utensils className="h-4 w-4" />
                식비
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="food"
                  type="text"
                  value={formatCurrency(watchedValues.food || 0)}
                  onChange={(e) => setValue('food', parseCurrency(e.target.value))}
                  className="pl-10"
                  placeholder="0"
                />
              </div>
              {errors.food && (
                <p className="text-sm text-red-600">{errors.food.message}</p>
              )}
            </div>

            {/* 교통비 */}
            <div className="space-y-2">
              <Label htmlFor="transportation" className="flex items-center gap-2">
                <Car className="h-4 w-4" />
                교통비
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="transportation"
                  type="text"
                  value={formatCurrency(watchedValues.transportation || 0)}
                  onChange={(e) => setValue('transportation', parseCurrency(e.target.value))}
                  className="pl-10"
                  placeholder="0"
                />
              </div>
              {errors.transportation && (
                <p className="text-sm text-red-600">{errors.transportation.message}</p>
              )}
            </div>

            {/* 공과금 */}
            <div className="space-y-2">
              <Label htmlFor="utilities" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                공과금
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="utilities"
                  type="text"
                  value={formatCurrency(watchedValues.utilities || 0)}
                  onChange={(e) => setValue('utilities', parseCurrency(e.target.value))}
                  className="pl-10"
                  placeholder="0"
                />
              </div>
              {errors.utilities && (
                <p className="text-sm text-red-600">{errors.utilities.message}</p>
              )}
            </div>

            {/* 의료비 */}
            <div className="space-y-2">
              <Label htmlFor="healthcare" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                의료비
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="healthcare"
                  type="text"
                  value={formatCurrency(watchedValues.healthcare || 0)}
                  onChange={(e) => setValue('healthcare', parseCurrency(e.target.value))}
                  className="pl-10"
                  placeholder="0"
                />
              </div>
              {errors.healthcare && (
                <p className="text-sm text-red-600">{errors.healthcare.message}</p>
              )}
            </div>

            {/* 여가비 */}
            <div className="space-y-2">
              <Label htmlFor="entertainment" className="flex items-center gap-2">
                <Gamepad2 className="h-4 w-4" />
                여가비
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="entertainment"
                  type="text"
                  value={formatCurrency(watchedValues.entertainment || 0)}
                  onChange={(e) => setValue('entertainment', parseCurrency(e.target.value))}
                  className="pl-10"
                  placeholder="0"
                />
              </div>
              {errors.entertainment && (
                <p className="text-sm text-red-600">{errors.entertainment.message}</p>
              )}
            </div>
          </div>

          {/* 기타 지출 */}
          <div className="space-y-2">
            <Label htmlFor="other_expenses" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              기타 지출
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="other_expenses"
                type="text"
                value={formatCurrency(watchedValues.other_expenses || 0)}
                onChange={(e) => setValue('other_expenses', parseCurrency(e.target.value))}
                className="pl-10"
                placeholder="0"
              />
            </div>
            {errors.other_expenses && (
              <p className="text-sm text-red-600">{errors.other_expenses.message}</p>
            )}
          </div>

          {/* 메모 */}
          <div className="space-y-2">
            <Label htmlFor="notes">메모</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="지출에 대한 추가 메모를 입력하세요"
              rows={3}
            />
            {errors.notes && (
              <p className="text-sm text-red-600">{errors.notes.message}</p>
            )}
          </div>

          {/* 총 지출 요약 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-700">총 지출</span>
              <span className="text-2xl font-bold text-red-600">
                {formatCurrency(totalExpenses)}원
              </span>
            </div>
          </div>

          {/* 제출 버튼 */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!isValid || loading}
          >
            {loading ? '저장 중...' : '지출 정보 저장'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

