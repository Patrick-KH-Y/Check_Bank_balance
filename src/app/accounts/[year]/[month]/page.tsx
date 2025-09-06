'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Plus, 
  Edit, 
  Save, 
  X, 
  Calendar, 
  Wallet,
  Search,
  ChevronLeft,
  Trash2,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAccounts } from '@/hooks/useAccounts';

import type { Account } from '@/types/dashboard';
import type { AccountFormData } from '@/hooks/useAccounts';

export default function AccountsPage({ 
  params 
}: { 
  params: Promise<{ year: string; month: string }> 
}) {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState<AccountFormData>({
    accountName: '',
    accountType: 'checking',
    balance: 0,
    currency: 'KRW',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // URL 파라미터에서 년도와 월 추출
  const [year, setYear] = useState<number>(2025);
  const [month, setMonth] = useState<number>(9);

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setYear(parseInt(resolvedParams.year));
      setMonth(parseInt(resolvedParams.month));
    };
    loadParams();
  }, [params]);

  // 계좌 데이터 훅 사용
  const {
    accounts,
    totalBalance,
    accountTypeCounts,
    isLoading,
    createAccount,
    updateAccount,
    deleteAccount,
    isCreating,
    isUpdating,
    isDeleting,
  } = useAccounts(year, month);

  const handleAdd = () => {
    setIsAdding(true);
    setFormData({
      accountName: '',
      accountType: 'checking',
      balance: 0,
      currency: 'KRW',
    });
  };

  const handleEdit = (account: Account) => {
    setIsEditing(account.id);
    setEditingAccount(account);
    setFormData({
      accountName: account.account_name,
      accountType: account.account_type,
      balance: account.balance,
      currency: account.currency,
    });
  };

  const handleDelete = (accountId: string) => {
    if (confirm('정말로 이 계좌를 삭제하시겠습니까?')) {
      deleteAccount({ id: accountId, userId: 'temp-user-123' });
    }
  };

  const handleSave = () => {
    if (isAdding) {
      // 새 계좌 추가
      createAccount({ userId: 'temp-user-123', data: formData });
      setIsAdding(false);
    } else if (isEditing && editingAccount) {
      // 기존 계좌 수정
      updateAccount({ id: editingAccount.id, userId: 'temp-user-123', data: formData });
      setIsEditing(null);
      setEditingAccount(null);
    }
    
    // 폼 초기화
    setFormData({
      accountName: '',
      accountType: 'checking',
      balance: 0,
      currency: 'KRW',
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setIsEditing(null);
    setEditingAccount(null);
    setFormData({
      accountName: '',
      accountType: 'checking',
      balance: 0,
      currency: 'KRW',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const getAccountTypeLabel = (type: string) => {
    const labels = {
      checking: '입출금',
      savings: '저축',
      investment: '투자',
      credit: '신용카드',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getAccountTypeColor = (type: string) => {
    const colors = {
      checking: 'bg-blue-100 text-blue-800',
      savings: 'bg-green-100 text-green-800',
      investment: 'bg-purple-100 text-purple-800',
      credit: 'bg-orange-100 text-orange-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredAccounts = accounts.filter(account =>
    account.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getAccountTypeLabel(account.account_type).includes(searchTerm)
  );

  // totalBalance는 useAccounts 훅에서 이미 제공됨

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            뒤로
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">통장 현황</h1>
            <p className="text-gray-600 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {year}년 {month}월
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-gray-600">총 잔액</p>
            <p className="text-2xl font-bold text-green-600">
              ₩{formatCurrency(totalBalance)}
            </p>
          </div>
          <Button onClick={handleAdd} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            계좌 추가
          </Button>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="계좌명 또는 유형으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="cursor-pointer">
                전체 ({accounts.length})
              </Badge>
              <Badge variant="outline" className="cursor-pointer">
                입출금 ({accountTypeCounts.checking || 0})
              </Badge>
              <Badge variant="outline" className="cursor-pointer">
                저축 ({accountTypeCounts.savings || 0})
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 계좌 현황 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            계좌별 현황
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              <span className="ml-2 text-gray-500">계좌 정보를 불러오는 중...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>계좌명</TableHead>
                    <TableHead>유형</TableHead>
                    <TableHead className="text-right">잔액</TableHead>
                    <TableHead className="text-right">월 배정금액</TableHead>
                    <TableHead className="text-center">상태</TableHead>
                    <TableHead className="text-center">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        계좌가 없습니다. 계좌를 추가해보세요.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAccounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">
                          {account.account_name}
                        </TableCell>
                        <TableCell>
                          <Badge className={getAccountTypeColor(account.account_type)}>
                            {getAccountTypeLabel(account.account_type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          ₩{formatCurrency(account.balance)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          ₩{formatCurrency(Math.floor(account.balance * 0.1))}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={account.is_active ? "default" : "secondary"}>
                            {account.is_active ? '활성' : '비활성'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(account)}
                              disabled={isUpdating}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(account.id)}
                              disabled={isDeleting}
                              className="text-red-600 hover:text-red-700"
                            >
                              {isDeleting ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 계좌 추가/수정 모달 */}
      <Sheet open={isAdding || !!isEditing} onOpenChange={() => handleCancel()}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {isAdding ? '새 계좌 추가' : '계좌 정보 수정'}
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-6 mt-6">
            {/* 계좌명 */}
            <div className="space-y-2">
              <Label htmlFor="accountName">계좌명</Label>
              <Input
                id="accountName"
                value={formData.accountName}
                onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                placeholder="예: 신한은행 입출금통장"
                required
              />
            </div>

            {/* 계좌 유형 */}
            <div className="space-y-2">
              <Label htmlFor="accountType">계좌 유형</Label>
              <select
                id="accountType"
                value={formData.accountType}
                onChange={(e) => setFormData(prev => ({ ...prev, accountType: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="checking">입출금</option>
                <option value="savings">저축</option>
                <option value="investment">투자</option>
                <option value="credit">신용카드</option>
              </select>
            </div>

            {/* 잔액 */}
            <div className="space-y-2">
              <Label htmlFor="balance">잔액</Label>
              <Input
                id="balance"
                type="number"
                value={formData.balance}
                onChange={(e) => setFormData(prev => ({ ...prev, balance: parseFloat(e.target.value) || 0 }))}
                placeholder="0"
                required
              />
            </div>

            {/* 통화 */}
            <div className="space-y-2">
              <Label htmlFor="currency">통화</Label>
              <select
                id="currency"
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="KRW">KRW (원)</option>
                <option value="USD">USD (달러)</option>
                <option value="EUR">EUR (유로)</option>
              </select>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleSave} 
                className="flex-1"
                disabled={isCreating || isUpdating}
              >
                {(isCreating || isUpdating) ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isAdding ? '추가' : '수정'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCancel} 
                className="flex-1"
                disabled={isCreating || isUpdating}
              >
                <X className="h-4 w-4 mr-2" />
                취소
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
