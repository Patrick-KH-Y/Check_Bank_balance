'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Calendar, 
  DollarSign,
  Home,
  Utensils,
  Car,
  Zap,
  Heart,
  Gamepad2,
  Package,
  Loader2
} from 'lucide-react';
import { useExpenses } from '@/hooks/useExpenses';
import ExpensesForm from '@/components/forms/ExpensesForm';

export default function ExpensesPage({ 
  params 
}: { 
  params: Promise<{ year: string; month: string }> 
}) {
  const [year, setYear] = useState<number>(2025);
  const [month, setMonth] = useState<number>(9);
  const [showForm, setShowForm] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // 임시 사용자 ID (실제로는 인증 시스템에서 가져와야 함)
  const tempUserId = 'temp-user-123';

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setYear(parseInt(resolvedParams.year));
      setMonth(parseInt(resolvedParams.month));
    };
    loadParams();
  }, [params]);

  // 지출 데이터 조회
  const { data: expenses, isLoading, error } = useExpenses(tempUserId, year, month);

  const expenseCategories = [
    { key: 'housing', label: '주거비', icon: Home, color: 'bg-blue-100 text-blue-800' },
    { key: 'food', label: '식비', icon: Utensils, color: 'bg-green-100 text-green-800' },
    { key: 'transportation', label: '교통비', icon: Car, color: 'bg-yellow-100 text-yellow-800' },
    { key: 'utilities', label: '공과금', icon: Zap, color: 'bg-purple-100 text-purple-800' },
    { key: 'healthcare', label: '의료비', icon: Heart, color: 'bg-red-100 text-red-800' },
    { key: 'entertainment', label: '여가비', icon: Gamepad2, color: 'bg-pink-100 text-pink-800' },
    { key: 'other_expenses', label: '기타', icon: Package, color: 'bg-gray-100 text-gray-800' },
  ];

  const totalExpenses = expenses ? expenses.total_expenses : 0;

  // 클라이언트 사이드 렌더링이 완료될 때까지 로딩 표시
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {year}년 {month}월 지출 내역
              </h1>
              <p className="text-gray-600 mt-2">
                월별 지출 항목을 관리하고 분석하세요
              </p>
            </div>
            
            <Button 
              onClick={() => setShowForm(!showForm)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {showForm ? '폼 닫기' : '지출 관리'}
            </Button>
          </div>

          {/* 요약 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">총 지출</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalExpenses.toLocaleString()}원
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">월별 평균</p>
                    <p className="text-2xl font-bold text-green-600">
                      {expenses ? (totalExpenses / 7).toLocaleString() : 0}원
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 지출 관리 폼 */}
        {showForm && (
          <div className="mb-8">
            <ExpensesForm
              userId={tempUserId}
              year={year}
              month={month}
              onClose={() => setShowForm(false)}
            />
          </div>
        )}

        {/* 지출 상세 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              지출 상세 분석
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                <span className="ml-2 text-gray-500">지출 데이터를 불러오는 중...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                <p>지출 데이터를 불러올 수 없습니다.</p>
                <p className="text-sm text-gray-500 mt-2">{error.message}</p>
              </div>
            ) : expenses ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {expenseCategories.map((category) => {
                  const IconComponent = category.icon;
                  const amount = expenses[category.key as keyof typeof expenses] as number;
                  const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
                  
                  return (
                    <Card key={category.key} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-5 w-5 text-gray-600" />
                            <span className="font-medium text-gray-700">{category.label}</span>
                          </div>
                          <Badge className={category.color}>
                            {percentage.toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          {amount.toLocaleString()}원
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          월 평균: {(amount / 1).toLocaleString()}원
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>지출 데이터가 없습니다.</p>
                <p className="text-sm mt-2">지출 관리 버튼을 클릭하여 데이터를 입력하세요.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 메모 섹션 */}
        {expenses && expenses.notes && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>메모</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{expenses.notes}</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
