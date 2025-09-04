'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
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
  Trash2, 
  Save, 
  X, 
  Calendar, 
  DollarSign,
  Home,
  Utensils,
  Car,
  Zap,
  Heart,
  Gamepad2,
  Package
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import type { ExpenseItem, ExpenseItemFormData } from '@/types/dashboard';

const expenseCategories = [
  { value: 'housing', label: '주거비', icon: Home, color: 'bg-blue-100 text-blue-800' },
  { value: 'food', label: '식비', icon: Utensils, color: 'bg-green-100 text-green-800' },
  { value: 'transportation', label: '교통비', icon: Car, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'utilities', label: '공과금', icon: Zap, color: 'bg-purple-100 text-purple-800' },
  { value: 'healthcare', label: '의료비', icon: Heart, color: 'bg-red-100 text-red-800' },
  { value: 'entertainment', label: '여가비', icon: Gamepad2, color: 'bg-pink-100 text-pink-800' },
  { value: 'other', label: '기타', icon: Package, color: 'bg-gray-100 text-gray-800' },
];

export default function ExpensesPage({ 
  params 
}: { 
  params: Promise<{ year: string; month: string }> 
}) {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ExpenseItemFormData>({
    category: 'housing',
    amount: 0,
    description: '',
    is_fixed: false,
    date: new Date().toISOString().split('T')[0],
  });
  const { toast } = useToast();

  // URL 파라미터에서 년도와 월 추출
  const [year, setYear] = useState<number>(2025);
  const [month, setMonth] = useState<number>(9);

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setYear(parseInt(resolvedParams.year));
      setMonth(parseInt(resolvedParams.month));
      loadExpenses(parseInt(resolvedParams.year), parseInt(resolvedParams.month));
    };
    loadParams();
  }, [params]);

  // 임시 더미 데이터 로드 (실제로는 API 호출)
  const loadExpenses = (year: number, month: number) => {
    const dummyExpenses: ExpenseItem[] = [
      {
        id: '1',
        user_id: 'dummy-user-id',
        category: 'housing',
        amount: 2000000,
        description: '월세',
        is_fixed: true,
        date: `${year}-${month.toString().padStart(2, '0')}-01`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        user_id: 'dummy-user-id',
        category: 'food',
        amount: 1500000,
        description: '식료품',
        is_fixed: false,
        date: `${year}-${month.toString().padStart(2, '0')}-01`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '3',
        user_id: 'dummy-user-id',
        category: 'transportation',
        amount: 500000,
        description: '대중교통',
        is_fixed: true,
        date: `${year}-${month.toString().padStart(2, '0')}-01`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    setExpenses(dummyExpenses);
  };

  const handleAddExpense = () => {
    if (!formData.category || formData.amount <= 0) {
      toast({
        title: '입력 오류',
        description: '카테고리와 금액을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    const newExpense: ExpenseItem = {
      id: Date.now().toString(),
      user_id: 'dummy-user-id',
      ...formData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setExpenses([...expenses, newExpense]);
    setFormData({
      category: 'housing',
      amount: 0,
      description: '',
      is_fixed: false,
      date: new Date().toISOString().split('T')[0],
    });
    setIsAddingExpense(false);

    toast({
      title: '성공',
      description: '지출 항목이 추가되었습니다.',
    });
  };

  const handleEditExpense = (expense: ExpenseItem) => {
    setEditingExpenseId(expense.id);
    setFormData({
      category: expense.category,
      amount: expense.amount,
      description: expense.description,
      is_fixed: expense.is_fixed,
      date: expense.date,
    });
  };

  const handleUpdateExpense = () => {
    if (!editingExpenseId) return;

    setExpenses(expenses.map(expense => 
      expense.id === editingExpenseId 
        ? { ...expense, ...formData, updated_at: new Date().toISOString() }
        : expense
    ));

    setEditingExpenseId(null);
    setFormData({
      category: 'housing',
      amount: 0,
      description: '',
      is_fixed: false,
      date: new Date().toISOString().split('T')[0],
    });

    toast({
      title: '성공',
      description: '지출 항목이 수정되었습니다.',
    });
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
    toast({
      title: '성공',
      description: '지출 항목이 삭제되었습니다.',
    });
  };

  const handleCancelEdit = () => {
    setEditingExpenseId(null);
    setFormData({
      category: 'housing',
      amount: 0,
      description: '',
      is_fixed: false,
      date: new Date().toISOString().split('T')[0],
    });
  };

  const getCategoryInfo = (category: string) => {
    return expenseCategories.find(cat => cat.value === category) || expenseCategories[6];
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const fixedExpenses = expenses.filter(expense => expense.is_fixed);
  const variableExpenses = expenses.filter(expense => !expense.is_fixed);

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
                월별 지출 항목을 관리하고 고정 지출을 설정하세요
              </p>
            </div>
            
            <Button 
              onClick={() => setIsAddingExpense(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              지출 추가
            </Button>
          </div>

          {/* 요약 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                    <p className="text-sm text-gray-600">고정 지출</p>
                    <p className="text-2xl font-bold text-green-600">
                      {fixedExpenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}원
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">변동 지출</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {variableExpenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}원
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 지출 추가/수정 폼 */}
        {(isAddingExpense || editingExpenseId) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {editingExpenseId ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                {editingExpenseId ? '지출 수정' : '지출 추가'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">카테고리</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center gap-2">
                            <category.icon className="h-4 w-4" />
                            {category.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">금액</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">날짜</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="is_fixed">고정 지출</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                      id="is_fixed"
                      checked={formData.is_fixed}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, is_fixed: checked as boolean })
                      }
                    />
                    <Label htmlFor="is_fixed" className="text-sm">매월 반복</Label>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="지출에 대한 상세 설명을 입력하세요"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Button 
                  onClick={editingExpenseId ? handleUpdateExpense : handleAddExpense}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {editingExpenseId ? '수정' : '추가'}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={editingExpenseId ? handleCancelEdit : () => setIsAddingExpense(false)}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  취소
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 지출 내역 테이블 */}
        <Card>
          <CardHeader>
            <CardTitle>지출 내역</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>카테고리</TableHead>
                  <TableHead>금액</TableHead>
                  <TableHead>설명</TableHead>
                  <TableHead>날짜</TableHead>
                  <TableHead>고정 지출</TableHead>
                  <TableHead>작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      지출 내역이 없습니다. 지출을 추가해보세요.
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map((expense) => {
                    const categoryInfo = getCategoryInfo(expense.category);
                    const IconComponent = categoryInfo.icon;
                    
                    return (
                      <TableRow key={expense.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge className={categoryInfo.color}>
                              <IconComponent className="h-3 w-3 mr-1" />
                              {categoryInfo.label}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {expense.amount.toLocaleString()}원
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {expense.description || '-'}
                        </TableCell>
                        <TableCell>
                          {new Date(expense.date).toLocaleDateString('ko-KR')}
                        </TableCell>
                        <TableCell>
                          {expense.is_fixed ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              고정
                            </Badge>
                          ) : (
                            <Badge variant="outline">변동</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditExpense(expense)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
