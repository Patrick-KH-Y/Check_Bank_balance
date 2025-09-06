'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  PiggyBank
} from 'lucide-react';
import { useSavings } from '@/hooks/useSavings';
import { useAccounts } from '@/hooks/useAccounts';
import { SavingsForm } from '@/components/forms/SavingsForm';
import type { MonthlySavings, SavingsFormData, Account } from '@/types/dashboard';

interface PageProps {
  params: Promise<{
    year: string;
    month: string;
  }>;
}

export default function SavingsPage({ params }: PageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ year: number; month: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingSavings, setEditingSavings] = useState<MonthlySavings | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string>('all');

  // 파라미터 해결
  useEffect(() => {
    params.then(({ year, month }) => {
      setResolvedParams({
        year: parseInt(year),
        month: parseInt(month)
      });
    });
  }, [params]);

  // 저축 데이터 및 계좌 데이터 조회
  const { 
    savings, 
    totalTargetAmount, 
    totalActualAmount, 
    totalAchievementRate, 
    achievedCount,
    savingsTypeCounts,
    isLoading,
    createSavings,
    updateSavings,
    deleteSavings,
    isCreating,
    isUpdating,
    isDeleting
  } = useSavings(resolvedParams?.year, resolvedParams?.month, selectedAccount === 'all' ? undefined : selectedAccount);

  const { accounts } = useAccounts(resolvedParams?.year || 2025, resolvedParams?.month || 9);

  // 검색 및 필터링된 저축 데이터
  const filteredSavings = savings.filter(saving => {
    const matchesSearch = 
      saving.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      saving.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      saving.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || saving.savings_type === selectedType;
    
    return matchesSearch && matchesType;
  });

  // 폼 제출 처리
  const handleFormSubmit = (data: SavingsFormData) => {
    if (editingSavings) {
      updateSavings({ ...data, id: editingSavings.id });
    } else {
      createSavings(data);
    }
    setShowForm(false);
    setEditingSavings(null);
  };

  // 편집 모드 시작
  const handleEdit = (savings: MonthlySavings) => {
    setEditingSavings(savings);
    setShowForm(true);
  };

  // 삭제 확인 및 처리
  const handleDelete = (savings: MonthlySavings) => {
    if (confirm('정말로 이 저축 데이터를 삭제하시겠습니까?')) {
      deleteSavings(savings.id);
    }
  };

  // 폼 닫기
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingSavings(null);
  };

  // 저축 유형별 색상 및 라벨
  const getSavingsTypeInfo = (type: string) => {
    const info = {
      regular: { label: '일반 저축', color: 'bg-blue-100 text-blue-800' },
      emergency: { label: '비상금', color: 'bg-red-100 text-red-800' },
      investment: { label: '투자', color: 'bg-green-100 text-green-800' },
      goal: { label: '목표 저축', color: 'bg-purple-100 text-purple-800' },
    };
    return info[type as keyof typeof info] || { label: type, color: 'bg-gray-100 text-gray-800' };
  };

  // 계좌명 가져오기
  const getAccountName = (accountId?: string) => {
    if (!accountId) return '계좌 없음';
    const account = accounts.find(acc => acc.id === accountId);
    return account ? account.account_name : '알 수 없음';
  };

  if (!resolvedParams) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const { year, month } = resolvedParams;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {year}년 {month}월 저축 현황
          </h1>
          <p className="text-gray-600 mt-2">
            월별 저축 목표 및 실적을 관리하세요
          </p>
        </div>
        
        <Sheet open={showForm} onOpenChange={setShowForm}>
          <SheetTrigger asChild>
            <Button onClick={() => setEditingSavings(null)}>
              <Plus className="h-4 w-4 mr-2" />
              새 저축 추가
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>
                {editingSavings ? '저축 데이터 수정' : '새 저축 데이터 추가'}
              </SheetTitle>
            </SheetHeader>
            <SavingsForm
              savings={editingSavings || undefined}
              accounts={accounts}
              year={year}
              month={month}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              loading={isCreating || isUpdating}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 목표 금액</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTargetAmount.toLocaleString()}원</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 실제 저축액</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActualAmount.toLocaleString()}원</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">달성률</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAchievementRate.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">달성 목표</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{achievedCount}개</div>
          </CardContent>
        </Card>
      </div>

      {/* 저축 유형별 통계 */}
      <Card>
        <CardHeader>
          <CardTitle>저축 유형별 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(savingsTypeCounts).map(([type, count]) => {
              const typeInfo = getSavingsTypeInfo(type);
              return (
                <Badge key={type} className={typeInfo.color}>
                  {typeInfo.label}: {count}개
                </Badge>
              );
            })}
            {Object.keys(savingsTypeCounts).length === 0 && (
              <span className="text-gray-500">저축 데이터가 없습니다.</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 검색 및 필터 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="저축 설명, 카테고리, 메모로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">모든 유형</option>
                <option value="regular">일반 저축</option>
                <option value="emergency">비상금</option>
                <option value="investment">투자</option>
                <option value="goal">목표 저축</option>
              </select>

              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">모든 계좌</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.account_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 저축 데이터 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>저축 상세 내역</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredSavings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || selectedType !== 'all' || selectedAccount !== 'all' 
                ? '검색 조건에 맞는 저축 데이터가 없습니다.' 
                : '저축 데이터가 없습니다. 새로 추가해보세요!'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>저축 유형</TableHead>
                    <TableHead>계좌</TableHead>
                    <TableHead>카테고리</TableHead>
                    <TableHead>목표 금액</TableHead>
                    <TableHead>실제 저축액</TableHead>
                    <TableHead>달성률</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>설명</TableHead>
                    <TableHead>액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSavings.map((saving) => {
                    const typeInfo = getSavingsTypeInfo(saving.savings_type);
                    const achievementRate = saving.target_amount > 0 
                      ? (saving.actual_amount / saving.target_amount) * 100 
                      : 0;
                    
                    return (
                      <TableRow key={saving.id}>
                        <TableCell>
                          <Badge className={typeInfo.color}>
                            {typeInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{getAccountName(saving.account_id)}</TableCell>
                        <TableCell>{saving.category || '-'}</TableCell>
                        <TableCell className="font-mono">
                          {saving.target_amount.toLocaleString()}원
                        </TableCell>
                        <TableCell className="font-mono">
                          {saving.actual_amount.toLocaleString()}원
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {achievementRate.toFixed(1)}%
                            </span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  achievementRate >= 100 ? 'bg-green-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${Math.min(achievementRate, 100)}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {saving.is_achieved ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              달성
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              진행중
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={saving.description}>
                            {saving.description || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(saving)}
                              disabled={isUpdating}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(saving)}
                              disabled={isDeleting}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

