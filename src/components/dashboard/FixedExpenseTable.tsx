'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit, Trash2, Plus, Calendar } from 'lucide-react';
import { useFixedExpenses, useDeleteFixedExpense } from '@/hooks/useFixedExpenses';
import FixedExpenseForm from '@/components/forms/FixedExpenseForm';
import type { FixedExpense } from '@/types/dashboard';

interface FixedExpenseTableProps {
  userId: string;
  year: number;
  month: number;
}

export default function FixedExpenseTable({ userId, year, month }: FixedExpenseTableProps) {
  const [selectedExpense, setSelectedExpense] = useState<FixedExpense | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: fixedExpenses = [], isLoading, error, refetch } = useFixedExpenses(userId, year, month);
  const deleteFixedExpense = useDeleteFixedExpense();

  const handleEdit = (expense: FixedExpense) => {
    setSelectedExpense(expense);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (expense: FixedExpense) => {
    if (confirm('정말로 이 고정 지출을 삭제하시겠습니까?')) {
      try {
        await deleteFixedExpense.mutateAsync({
          id: expense.id,
          userId: expense.user_id,
        });
      } catch (error) {
        console.error('고정 지출 삭제 중 오류:', error);
      }
    }
  };

  const handleSaveSuccess = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setSelectedExpense(null);
    refetch();
  };

  const totalAmount = fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">고정 지출 데이터를 불러올 수 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-medium">고정 지출 내역</CardTitle>
          <p className="text-sm text-gray-500">
            {year}년 {month}월
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            총 {totalAmount.toLocaleString()}원
          </Badge>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                추가
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>새 고정 지출 추가</DialogTitle>
              </DialogHeader>
              <FixedExpenseForm
                userId={userId}
                year={year}
                month={month}
                onSaveSuccess={handleSaveSuccess}
                onCancel={() => setIsAddDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {fixedExpenses.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">등록된 고정 지출이 없습니다.</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              첫 고정 지출 추가하기
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>카테고리</TableHead>
                <TableHead>설명</TableHead>
                <TableHead className="text-right">금액</TableHead>
                <TableHead className="text-center">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fixedExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    <Badge variant="outline">{expense.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-600">
                      {expense.description || '설명 없음'}
                    </p>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {expense.amount.toLocaleString()}원
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-1">
                      <Dialog open={isEditDialogOpen && selectedExpense?.id === expense.id} onOpenChange={(open) => {
                        if (open) {
                          setSelectedExpense(expense);
                          setIsEditDialogOpen(true);
                        } else {
                          setIsEditDialogOpen(false);
                          setSelectedExpense(null);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => handleEdit(expense)}
                          >
                            <Edit className="h-3 w-3" />
                            수정
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>고정 지출 수정</DialogTitle>
                          </DialogHeader>
                          <FixedExpenseForm
                            userId={userId}
                            year={year}
                            month={month}
                            initialData={expense}
                            onSaveSuccess={handleSaveSuccess}
                            onCancel={() => {
                              setIsEditDialogOpen(false);
                              setSelectedExpense(null);
                            }}
                          />
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(expense)}
                        disabled={deleteFixedExpense.isPending}
                      >
                        <Trash2 className="h-3 w-3" />
                        삭제
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

