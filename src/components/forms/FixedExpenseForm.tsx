'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useUpsertFixedExpense } from '@/hooks/useFixedExpenses';
import type { FixedExpense, FixedExpenseFormData } from '@/types/dashboard';

// 폼 스키마
const fixedExpenseSchema = z.object({
  category: z.string().min(1, '카테고리를 선택해주세요'),
  amount: z.number().min(0, '금액은 0 이상이어야 합니다'),
  description: z.string().optional(),
});

type FixedExpenseFormValues = z.infer<typeof fixedExpenseSchema>;

interface FixedExpenseFormProps {
  userId: string;
  year: number;
  month: number;
  initialData?: FixedExpense;
  onSaveSuccess: () => void;
  onCancel: () => void;
}

const CATEGORIES = [
  '주거비',
  '통신비',
  '보험료',
  '대출이자',
  '기타',
];

export default function FixedExpenseForm({
  userId,
  year,
  month,
  initialData,
  onSaveSuccess,
  onCancel,
}: FixedExpenseFormProps) {
  const { toast } = useToast();
  const upsertFixedExpense = useUpsertFixedExpense();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FixedExpenseFormValues>({
    resolver: zodResolver(fixedExpenseSchema),
    defaultValues: {
      category: initialData?.category || '',
      amount: initialData?.amount || 0,
      description: initialData?.description || '',
    },
  });

  const onSubmit = async (data: FixedExpenseFormValues) => {
    try {
      await upsertFixedExpense.mutateAsync({
        userId,
        year,
        month,
        data: {
          category: data.category,
          amount: data.amount,
          description: data.description,
        },
        id: initialData?.id,
      });

      toast({
        title: '성공',
        description: initialData ? '고정 지출이 수정되었습니다.' : '고정 지출이 추가되었습니다.',
      });

      onSaveSuccess();
    } catch (error) {
      toast({
        title: '오류',
        description: '고정 지출 저장 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category">카테고리</Label>
        <Select
          value={watch('category')}
          onValueChange={(value) => setValue('category', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="카테고리를 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-red-500">{errors.category.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">금액</Label>
        <Input
          id="amount"
          type="number"
          placeholder="금액을 입력하세요"
          {...register('amount', { valueAsNumber: true })}
        />
        {errors.amount && (
          <p className="text-sm text-red-500">{errors.amount.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">설명 (선택사항)</Label>
        <Textarea
          id="description"
          placeholder="설명을 입력하세요"
          {...register('description')}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '저장 중...' : initialData ? '수정' : '추가'}
        </Button>
      </div>
    </form>
  );
}
