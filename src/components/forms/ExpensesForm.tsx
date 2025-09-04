'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useExpenses, useUpsertExpenses, useUpdateExpenses, useDeleteExpenses, type ExpensesFormData } from '@/hooks/useExpenses';
import { Loader2, Save, Trash2, Edit, X } from 'lucide-react';

interface ExpensesFormProps {
  userId: string;
  year: number;
  month: number;
  onClose?: () => void;
}

export default function ExpensesForm({ userId, year, month, onClose }: ExpensesFormProps) {
  const [formData, setFormData] = useState<ExpensesFormData>({
    housing: 0,
    food: 0,
    transportation: 0,
    utilities: 0,
    healthcare: 0,
    entertainment: 0,
    other_expenses: 0,
    notes: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // 지출 데이터 조회
  const { data: expenses, isLoading, error } = useExpenses(userId, year, month);
  
  // CRUD 뮤테이션
  const upsertExpenses = useUpsertExpenses();
  const updateExpenses = useUpdateExpenses();
  const deleteExpenses = useDeleteExpenses();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 기존 데이터가 있으면 폼에 로드
  useEffect(() => {
    if (expenses) {
      setFormData({
        housing: expenses.housing,
        food: expenses.food,
        transportation: expenses.transportation,
        utilities: expenses.utilities,
        healthcare: expenses.healthcare,
        entertainment: expenses.entertainment,
        other_expenses: expenses.other_expenses,
        notes: expenses.notes,
      });
      setIsEditing(true);
    }
  }, [expenses]);

  const handleInputChange = (field: keyof ExpensesFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? value : Number(value) || 0,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && expenses) {
      // 기존 데이터 수정
      await updateExpenses.mutateAsync({
        id: expenses.id,
        userId,
        year,
        month,
        data: formData,
      });
    } else {
      // 새 데이터 생성
      await upsertExpenses.mutateAsync({
        userId,
        year,
        month,
        data: formData,
      });
    }
  };

  const handleDelete = async () => {
    if (!expenses) return;
    
    if (confirm('정말로 이 지출 데이터를 삭제하시겠습니까?')) {
      await deleteExpenses.mutateAsync({
        id: expenses.id,
        userId,
        year,
        month,
      });
      
      // 폼 초기화
      setFormData({
        housing: 0,
        food: 0,
        transportation: 0,
        utilities: 0,
        healthcare: 0,
        entertainment: 0,
        other_expenses: 0,
        notes: '',
      });
      setIsEditing(false);
    }
  };

  const handleReset = () => {
    if (expenses) {
      setFormData({
        housing: expenses.housing,
        food: expenses.food,
        transportation: expenses.transportation,
        utilities: expenses.utilities,
        healthcare: expenses.healthcare,
        entertainment: expenses.entertainment,
        other_expenses: expenses.other_expenses,
        notes: expenses.notes,
      });
    } else {
      setFormData({
        housing: 0,
        food: 0,
        transportation: 0,
        utilities: 0,
        healthcare: 0,
        entertainment: 0,
        other_expenses: 0,
        notes: '',
      });
    }
  };

  const totalExpenses = Object.values(formData).reduce((sum, value) => {
    return sum + (typeof value === 'number' ? value : 0);
  }, 0);

  // 클라이언트 사이드 렌더링이 완료될 때까지 로딩 표시
  if (!isClient) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>로딩 중...</span>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>지출 데이터를 불러오는 중...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-red-600">
            <p>지출 데이터를 불러올 수 없습니다.</p>
            <p className="text-sm text-gray-500 mt-2">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{year}년 {month}월 지출 관리</span>
          <div className="flex items-center gap-2">
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={deleteExpenses.isPending}
                className="text-red-600 hover:text-red-700"
              >
                {deleteExpenses.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                삭제
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              <X className="h-4 w-4" />
              초기화
            </Button>
            {onClose && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                닫기
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 지출 항목들 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="housing">주거비</Label>
              <Input
                id="housing"
                type="number"
                value={formData.housing}
                onChange={(e) => handleInputChange('housing', e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="food">식비</Label>
              <Input
                id="food"
                type="number"
                value={formData.food}
                onChange={(e) => handleInputChange('food', e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="transportation">교통비</Label>
              <Input
                id="transportation"
                type="number"
                value={formData.transportation}
                onChange={(e) => handleInputChange('transportation', e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="utilities">공과금</Label>
              <Input
                id="utilities"
                type="number"
                value={formData.utilities}
                onChange={(e) => handleInputChange('utilities', e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="healthcare">의료비</Label>
              <Input
                id="healthcare"
                type="number"
                value={formData.healthcare}
                onChange={(e) => handleInputChange('healthcare', e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="entertainment">여가비</Label>
              <Input
                id="entertainment"
                type="number"
                value={formData.entertainment}
                onChange={(e) => handleInputChange('entertainment', e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="other_expenses">기타 지출</Label>
              <Input
                id="other_expenses"
                type="number"
                value={formData.other_expenses}
                onChange={(e) => handleInputChange('other_expenses', e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          {/* 총 지출 표시 */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">총 지출</span>
              <span className="text-2xl font-bold text-blue-600">
                {totalExpenses.toLocaleString()}원
              </span>
            </div>
          </div>

          {/* 메모 */}
          <div className="space-y-2">
            <Label htmlFor="notes">메모</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="지출에 대한 메모를 입력하세요..."
              rows={3}
            />
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-end gap-2">
            <Button
              type="submit"
              disabled={upsertExpenses.isPending || updateExpenses.isPending}
              className="gap-2"
            >
              {(upsertExpenses.isPending || updateExpenses.isPending) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isEditing ? '수정' : '저장'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
