'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wallet, DollarSign, CreditCard, PiggyBank, TrendingUp, Building2 } from 'lucide-react';
import { accountFormSchema, type AccountFormData } from '@/lib/validations/financial';

interface AccountFormProps {
  onSubmit: (data: AccountFormData) => void;
  initialData?: AccountFormData;
  loading?: boolean;
}

const accountTypeLabels = {
  checking: '입출금',
  savings: '저축',
  investment: '투자',
  credit: '신용카드',
};

const accountTypeIcons = {
  checking: Building2,
  savings: PiggyBank,
  investment: TrendingUp,
  credit: CreditCard,
};

export default function AccountForm({ onSubmit, initialData, loading = false }: AccountFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: initialData || {
      account_name: '',
      account_type: 'checking',
      balance: 0,
      currency: 'KRW',
    },
  });

  const watchedValues = watch();

  const formatCurrency = (value: number) => {
    return value.toLocaleString('ko-KR');
  };

  const parseCurrency = (value: string) => {
    return parseInt(value.replace(/[^\d]/g, '')) || 0;
  };

  const handleFormSubmit = (data: AccountFormData) => {
    onSubmit(data);
  };

  const selectedAccountType = watchedValues.account_type;
  const AccountTypeIcon = accountTypeIcons[selectedAccountType];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          계좌 정보 입력
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* 계좌명 */}
          <div className="space-y-2">
            <Label htmlFor="account_name">계좌명</Label>
            <Input
              id="account_name"
              {...register('account_name')}
              placeholder="예: 신한은행 입출금통장"
              required
            />
            {errors.account_name && (
              <p className="text-sm text-red-600">{errors.account_name.message}</p>
            )}
          </div>

          {/* 계좌 유형 */}
          <div className="space-y-2">
            <Label htmlFor="account_type">계좌 유형</Label>
            <Select
              value={watchedValues.account_type}
              onValueChange={(value) => setValue('account_type', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(accountTypeLabels).map(([value, label]) => {
                  const Icon = accountTypeIcons[value as keyof typeof accountTypeIcons];
                  return (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {errors.account_type && (
              <p className="text-sm text-red-600">{errors.account_type.message}</p>
            )}
          </div>

          {/* 잔액 */}
          <div className="space-y-2">
            <Label htmlFor="balance">현재 잔액</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="balance"
                type="text"
                value={formatCurrency(watchedValues.balance || 0)}
                onChange={(e) => setValue('balance', parseCurrency(e.target.value))}
                className="pl-10"
                placeholder="0"
                required
              />
            </div>
            {errors.balance && (
              <p className="text-sm text-red-600">{errors.balance.message}</p>
            )}
          </div>

          {/* 통화 */}
          <div className="space-y-2">
            <Label htmlFor="currency">통화</Label>
            <Select
              value={watchedValues.currency}
              onValueChange={(value) => setValue('currency', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="KRW">KRW (원)</SelectItem>
                <SelectItem value="USD">USD (달러)</SelectItem>
                <SelectItem value="EUR">EUR (유로)</SelectItem>
                <SelectItem value="JPY">JPY (엔)</SelectItem>
              </SelectContent>
            </Select>
            {errors.currency && (
              <p className="text-sm text-red-600">{errors.currency.message}</p>
            )}
          </div>

          {/* 계좌 정보 요약 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <AccountTypeIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  {watchedValues.account_name || '계좌명 미입력'}
                </h4>
                <p className="text-sm text-gray-600">
                  {accountTypeLabels[selectedAccountType]}
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">현재 잔액</span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(watchedValues.balance || 0)} {watchedValues.currency}
              </span>
            </div>
          </div>

          {/* 제출 버튼 */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!isValid || loading}
          >
            {loading ? '저장 중...' : '계좌 정보 저장'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

