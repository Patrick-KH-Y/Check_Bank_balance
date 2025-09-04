'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { MonthlySavings, SavingsFormData, SavingsStatistics } from '@/types/dashboard';

// 저축 목록 조회
const fetchSavings = async (year?: number, month?: number, accountId?: string): Promise<MonthlySavings[]> => {
  const params = new URLSearchParams();
  if (year) params.append('year', year.toString());
  if (month) params.append('month', month.toString());
  if (accountId) params.append('accountId', accountId);

  const response = await fetch(`/api/savings?${params.toString()}`);
  if (!response.ok) {
    throw new Error('저축 정보를 불러오는데 실패했습니다.');
  }

  const result = await response.json();
  return result.data || [];
};

// 저축 통계 조회
const fetchSavingsStatistics = async (year?: number, month?: number): Promise<SavingsStatistics> => {
  const params = new URLSearchParams();
  if (year) params.append('year', year.toString());
  if (month) params.append('month', month.toString());

  const response = await fetch(`/api/savings/statistics?${params.toString()}`);
  if (!response.ok) {
    throw new Error('저축 통계를 불러오는데 실패했습니다.');
  }

  const result = await response.json();
  return result.data;
};

// 새 저축 데이터 생성
const createSavings = async (savingsData: SavingsFormData): Promise<MonthlySavings> => {
  const response = await fetch('/api/savings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(savingsData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '저축 데이터 생성에 실패했습니다.');
  }

  const result = await response.json();
  return result.data;
};

// 저축 데이터 수정
const updateSavings = async (savingsData: SavingsFormData & { id: string }): Promise<MonthlySavings> => {
  const response = await fetch('/api/savings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(savingsData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '저축 데이터 수정에 실패했습니다.');
  }

  const result = await response.json();
  return result.data;
};

// 저축 데이터 삭제
const deleteSavings = async (savingsId: string): Promise<void> => {
  const response = await fetch(`/api/savings?id=${savingsId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '저축 데이터 삭제에 실패했습니다.');
  }
};

export function useSavings(year?: number, month?: number, accountId?: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // 저축 목록 조회
  const {
    data: savings = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['savings', year, month, accountId],
    queryFn: () => fetchSavings(year, month, accountId),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });

  // 저축 통계 조회
  const {
    data: statistics,
    isLoading: statisticsLoading,
    error: statisticsError,
  } = useQuery({
    queryKey: ['savings-statistics', year, month],
    queryFn: () => fetchSavingsStatistics(year, month),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });

  // 새 저축 데이터 생성
  const createSavingsMutation = useMutation({
    mutationFn: createSavings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] });
      queryClient.invalidateQueries({ queryKey: ['savings-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: '저축 데이터 추가 완료',
        description: '새 저축 데이터가 성공적으로 추가되었습니다.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: '저축 데이터 추가 실패',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // 저축 데이터 수정
  const updateSavingsMutation = useMutation({
    mutationFn: updateSavings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] });
      queryClient.invalidateQueries({ queryKey: ['savings-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: '저축 데이터 수정 완료',
        description: '저축 데이터가 성공적으로 수정되었습니다.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: '저축 데이터 수정 실패',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // 저축 데이터 삭제
  const deleteSavingsMutation = useMutation({
    mutationFn: deleteSavings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] });
      queryClient.invalidateQueries({ queryKey: ['savings-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: '저축 데이터 삭제 완료',
        description: '저축 데이터가 성공적으로 삭제되었습니다.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: '저축 데이터 삭제 실패',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // 계산된 값들
  const totalTargetAmount = savings.reduce((sum, saving) => sum + saving.target_amount, 0);
  const totalActualAmount = savings.reduce((sum, saving) => sum + saving.actual_amount, 0);
  const totalAchievementRate = totalTargetAmount > 0 ? (totalActualAmount / totalTargetAmount) * 100 : 0;
  const achievedCount = savings.filter(saving => saving.is_achieved).length;

  // 저축 유형별 개수
  const savingsTypeCounts = savings.reduce((counts, saving) => {
    counts[saving.savings_type] = (counts[saving.savings_type] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  // 계좌별 저축 현황
  const accountSavings = savings.reduce((accounts, saving) => {
    if (saving.accounts) {
      const accountId = saving.accounts.id;
      if (!accounts[accountId]) {
        accounts[accountId] = {
          account: saving.accounts,
          targetAmount: 0,
          actualAmount: 0,
          count: 0,
        };
      }
      accounts[accountId].targetAmount += saving.target_amount;
      accounts[accountId].actualAmount += saving.actual_amount;
      accounts[accountId].count += 1;
    }
    return accounts;
  }, {} as Record<string, {
    account: any;
    targetAmount: number;
    actualAmount: number;
    count: number;
  }>);

  return {
    // 데이터
    savings,
    statistics,
    
    // 계산된 값들
    totalTargetAmount,
    totalActualAmount,
    totalAchievementRate,
    achievedCount,
    savingsTypeCounts,
    accountSavings,
    
    // 상태
    isLoading,
    statisticsLoading,
    error,
    statisticsError,
    
    // 액션
    refetch,
    createSavings: createSavingsMutation.mutate,
    updateSavings: updateSavingsMutation.mutate,
    deleteSavings: deleteSavingsMutation.mutate,
    
    // 뮤테이션 상태
    isCreating: createSavingsMutation.isPending,
    isUpdating: updateSavingsMutation.isPending,
    isDeleting: deleteSavingsMutation.isPending,
  };
}

