'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  DollarSign,
  User,
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import type { IncomeItem, IncomeFormData } from '@/types/dashboard';

export default function IncomePage({ 
  params 
}: { 
  params: Promise<{ year: string; month: string }> 
}) {
  const [incomeData, setIncomeData] = useState<IncomeItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<IncomeFormData>({
    year: 2025,
    month: 9,
    경훈_월급: 0,
    선화_월급: 0,
    other_income: 0,
    notes: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  // URL 파라미터에서 년도와 월 추출
  const [year, setYear] = useState<number>(2025);
  const [month, setMonth] = useState<number>(9);

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setYear(parseInt(resolvedParams.year));
      setMonth(parseInt(resolvedParams.month));
      loadIncomeData(parseInt(resolvedParams.year), parseInt(resolvedParams.month));
    };
    loadParams();
  }, [params]);

  // 임시 더미 데이터 로드 (실제로는 API 호출)
  const loadIncomeData = async (year: number, month: number) => {
    const dummyIncome: IncomeItem = {
      id: 'temp-1',
      user_id: 'temp-user-123',
      year,
      month,
      경훈_월급: 5000000,
      선화_월급: 6000000,
      other_income: 500000,
      total_income: 11500000,
      notes: '9월 수입 내역입니다.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setIncomeData(dummyIncome);
    const resolvedParams = await params;
    setFormData({
      year: parseInt(resolvedParams.year),
      month: parseInt(resolvedParams.month),
      경훈_월급: dummyIncome.경훈_월급,
      선화_월급: dummyIncome.선화_월급,
      other_income: dummyIncome.other_income,
      notes: dummyIncome.notes || '',
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!incomeData) return;

    const totalIncome = formData.경훈_월급 + formData.선화_월급 + formData.other_income;
    
    const updatedIncome: IncomeItem = {
      ...incomeData,
      ...formData,
      total_income: totalIncome,
      updated_at: new Date().toISOString(),
    };

    setIncomeData(updatedIncome);
    setIsEditing(false);

    toast({
      title: '성공',
      description: '수입 정보가 수정되었습니다.',
    });
  };

  const handleCancel = async () => {
    if (!incomeData) return;
    
    const resolvedParams = await params;
    setFormData({
      year: parseInt(resolvedParams.year),
      month: parseInt(resolvedParams.month),
      경훈_월급: incomeData.경훈_월급,
      선화_월급: incomeData.선화_월급,
      other_income: incomeData.other_income,
      notes: incomeData.notes || '',
    });
    setIsEditing(false);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('ko-KR');
  };

  const getIncomeChange = () => {
    // 임시로 이전 달 대비 변화율 계산 (실제로는 API에서 가져와야 함)
    const previousMonthIncome = 11000000; // 8월 수입
    const currentIncome = incomeData?.total_income || 0;
    const change = currentIncome - previousMonthIncome;
    const percentage = (change / previousMonthIncome) * 100;
    
    return {
      amount: change,
      percentage: Math.abs(percentage),
      type: change > 0 ? 'positive' as const : change < 0 ? 'negative' as const : 'neutral' as const,
    };
  };

  const incomeChange = getIncomeChange();

  if (!incomeData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">수입 데이터를 불러오는 중...</p>
        </div>
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
                {year}년 {month}월 수입 상세
              </h1>
              <p className="text-gray-600 mt-2">
                월별 수입 내역을 조회하고 관리하세요
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {!isEditing ? (
                <Button 
                  onClick={handleEdit}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  수정
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={handleSave}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    저장
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleCancel}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    취소
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* 요약 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">총 수입</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(incomeData.total_income)}원
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">이전 달 대비</p>
                    <p className={`text-2xl font-bold ${
                      incomeChange.type === 'positive' ? 'text-green-600' : 
                      incomeChange.type === 'negative' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {incomeChange.type === 'positive' ? '+' : incomeChange.type === 'negative' ? '-' : ''}
                      {formatCurrency(Math.abs(incomeChange.amount))}원
                    </p>
                    <p className="text-sm text-gray-500">
                      ({incomeChange.type === 'positive' ? '+' : incomeChange.type === 'negative' ? '-' : ''}{incomeChange.percentage.toFixed(1)}%)
                    </p>
                  </div>
                  <TrendingUp className={`h-8 w-8 ${
                    incomeChange.type === 'positive' ? 'text-green-600' : 
                    incomeChange.type === 'negative' ? 'text-red-600' : 'text-gray-600'
                  }`} />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">수입 항목</p>
                    <p className="text-2xl font-bold text-blue-600">3개</p>
                    <p className="text-sm text-gray-500">경훈, 선화, 기타</p>
                  </div>
                  <User className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>검색 및 필터</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="수입 항목 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                초기화
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 수입 상세 테이블 */}
        <Card>
          <CardHeader>
            <CardTitle>수입 상세 내역</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>구분</TableHead>
                  <TableHead>금액</TableHead>
                  <TableHead>비율</TableHead>
                  <TableHead>설명</TableHead>
                  <TableHead>최종 수정일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">경훈 월급</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {isEditing ? (
                      <Input
                        type="number"
                        value={formData.경훈_월급}
                        onChange={(e) => setFormData({
                          ...formData,
                          경훈_월급: parseInt(e.target.value) || 0
                        })}
                        className="w-32"
                      />
                    ) : (
                      <span className="text-green-600">
                        {formatCurrency(incomeData.경훈_월급)}원
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {((incomeData.경훈_월급 / incomeData.total_income) * 100).toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    {isEditing ? (
                      <Textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({
                          ...formData,
                          notes: e.target.value
                        })}
                        placeholder="설명을 입력하세요"
                        rows={2}
                        className="w-full"
                      />
                    ) : (
                      <span className="text-gray-600">
                        {incomeData.notes || '경훈님의 월급입니다.'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(incomeData.updated_at).toLocaleDateString('ko-KR')}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-green-600" />
                      <span className="font-medium">선화 월급</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {isEditing ? (
                      <Input
                        type="number"
                        value={formData.선화_월급}
                        onChange={(e) => setFormData({
                          ...formData,
                          선화_월급: parseInt(e.target.value) || 0
                        })}
                        className="w-32"
                      />
                    ) : (
                      <span className="text-green-600">
                        {formatCurrency(incomeData.선화_월급)}원
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {((incomeData.선화_월급 / incomeData.total_income) * 100).toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <span className="text-gray-600">
                      선화님의 월급입니다.
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(incomeData.updated_at).toLocaleDateString('ko-KR')}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">기타 수입</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {isEditing ? (
                      <Input
                        type="number"
                        value={formData.other_income}
                        onChange={(e) => setFormData({
                          ...formData,
                          other_income: parseInt(e.target.value) || 0
                        })}
                        className="w-32"
                      />
                    ) : (
                      <span className="text-green-600">
                        {formatCurrency(incomeData.other_income)}원
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      {((incomeData.other_income / incomeData.total_income) * 100).toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <span className="text-gray-600">
                      부업, 투자 수익 등
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(incomeData.updated_at).toLocaleDateString('ko-KR')}
                  </TableCell>
                </TableRow>

                {/* 총계 행 */}
                <TableRow className="bg-gray-50">
                  <TableCell className="font-semibold">총계</TableCell>
                  <TableCell className="font-bold text-lg text-green-600">
                    {isEditing ? (
                      <span>
                        {formatCurrency(formData.경훈_월급 + formData.선화_월급 + formData.other_income)}원
                      </span>
                    ) : (
                      <span>{formatCurrency(incomeData.total_income)}원</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-gray-100 text-gray-800">
                      100%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">월별 총 수입</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 페이징 (현재는 단일 페이지이지만 향후 확장 가능) */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600">
            총 1개 항목 중 1-1번째
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              이전
            </Button>
            <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded">
              {currentPage}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={true} // 현재는 단일 페이지
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              다음
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
