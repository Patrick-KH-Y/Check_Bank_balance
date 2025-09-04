'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, X } from 'lucide-react';
import type { MonthlySavings, SavingsFormData, Account } from '@/types/dashboard';

interface SavingsFormProps {
  savings?: MonthlySavings;
  accounts: Account[];
  year: number;
  month: number;
  onSubmit: (data: SavingsFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function SavingsForm({ 
  savings, 
  accounts, 
  year, 
  month, 
  onSubmit, 
  onCancel, 
  loading = false 
}: SavingsFormProps) {
  const [formData, setFormData] = useState<SavingsFormData>({
    year,
    month,
    account_id: '',
    target_amount: 0,
    actual_amount: 0,
    savings_type: 'regular',
    category: '',
    description: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 편집 모드일 때 기존 데이터로 폼 초기화
  useEffect(() => {
    if (savings) {
      setFormData({
        year: savings.year,
        month: savings.month,
        account_id: savings.account_id || '',
        target_amount: savings.target_amount,
        actual_amount: savings.actual_amount,
        savings_type: savings.savings_type,
        category: savings.category || '',
        description: savings.description || '',
        notes: savings.notes || '',
      });
    }
  }, [savings]);

  // 폼 데이터 변경 처리
  const handleInputChange = (field: keyof SavingsFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 에러 메시지 초기화
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 폼 검증
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.target_amount || formData.target_amount <= 0) {
      newErrors.target_amount = '목표 금액을 입력해주세요.';
    }

    if (formData.actual_amount < 0) {
      newErrors.actual_amount = '실제 저축액은 0 이상이어야 합니다.';
    }

    if (!formData.savings_type) {
      newErrors.savings_type = '저축 유형을 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출 처리
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const getSavingsTypeLabel = (type: string) => {
    const labels = {
      regular: '일반 저축',
      emergency: '비상금',
      investment: '투자',
      goal: '목표 저축',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getSavingsTypeColor = (type: string) => {
    const colors = {
      regular: 'bg-blue-100 text-blue-800',
      emergency: 'bg-red-100 text-red-800',
      investment: 'bg-green-100 text-green-800',
      goal: 'bg-purple-100 text-purple-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{savings ? '저축 데이터 수정' : '새 저축 데이터 추가'}</span>
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={loading}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="year">년도</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div>
              <Label htmlFor="month">월</Label>
              <Input
                id="month"
                type="number"
                value={formData.month}
                onChange={(e) => handleInputChange('month', parseInt(e.target.value))}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>

          {/* 계좌 선택 */}
          <div>
            <Label htmlFor="account_id">계좌 (선택사항)</Label>
            <Select
              value={formData.account_id}
              onValueChange={(value) => handleInputChange('account_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="계좌를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">계좌 없음</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.account_name} ({account.account_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 금액 정보 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target_amount">
                목표 금액 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="target_amount"
                type="number"
                value={formData.target_amount}
                onChange={(e) => handleInputChange('target_amount', parseFloat(e.target.value) || 0)}
                placeholder="0"
                className={errors.target_amount ? 'border-red-500' : ''}
              />
              {errors.target_amount && (
                <p className="text-sm text-red-500 mt-1">{errors.target_amount}</p>
              )}
            </div>
            <div>
              <Label htmlFor="actual_amount">실제 저축액</Label>
              <Input
                id="actual_amount"
                type="number"
                value={formData.actual_amount}
                onChange={(e) => handleInputChange('actual_amount', parseFloat(e.target.value) || 0)}
                placeholder="0"
                className={errors.actual_amount ? 'border-red-500' : ''}
              />
              {errors.actual_amount && (
                <p className="text-sm text-red-500 mt-1">{errors.actual_amount}</p>
              )}
            </div>
          </div>

          {/* 저축 유형 및 카테고리 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="savings_type">
                저축 유형 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.savings_type}
                onValueChange={(value) => handleInputChange('savings_type', value as any)}
              >
                <SelectTrigger className={errors.savings_type ? 'border-red-500' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">일반 저축</SelectItem>
                  <SelectItem value="emergency">비상금</SelectItem>
                  <SelectItem value="investment">투자</SelectItem>
                  <SelectItem value="goal">목표 저축</SelectItem>
                </SelectContent>
              </Select>
              {errors.savings_type && (
                <p className="text-sm text-red-500 mt-1">{errors.savings_type}</p>
              )}
            </div>
            <div>
              <Label htmlFor="category">카테고리</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="주택, 교육, 여행 등"
              />
            </div>
          </div>

          {/* 설명 */}
          <div>
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="저축 목적이나 메모를 입력하세요"
              rows={3}
            />
          </div>

          {/* 메모 */}
          <div>
            <Label htmlFor="notes">메모</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="추가 메모를 입력하세요"
              rows={2}
            />
          </div>

          {/* 달성률 표시 */}
          {formData.target_amount > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">달성률</span>
                <span className="text-lg font-bold">
                  {((formData.actual_amount / formData.target_amount) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min((formData.actual_amount / formData.target_amount) * 100, 100)}%`
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>목표: {formData.target_amount.toLocaleString()}원</span>
                <span>실제: {formData.actual_amount.toLocaleString()}원</span>
              </div>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              취소
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {savings ? '수정' : '추가'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

