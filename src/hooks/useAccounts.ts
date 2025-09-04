import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { Account, AccountFormData } from '@/types/dashboard';

// 계좌 목록 조회
const fetchAccounts = async (year?: number, month?: number): Promise<Account[]> => {
  const params = new URLSearchParams();
  if (year) params.append('year', year.toString());
  if (month) params.append('month', month.toString());

  const response = await fetch(`/api/accounts?${params.toString()}`);
  if (!response.ok) {
    throw new Error('계좌 정보를 불러오는데 실패했습니다.');
  }

  const result = await response.json();
  return result.data || [];
};

// 새 계좌 생성
const createAccount = async (accountData: AccountFormData): Promise<Account> => {
  const response = await fetch('/api/accounts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(accountData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '계좌 생성에 실패했습니다.');
  }

  const result = await response.json();
  return result.data;
};

// 계좌 정보 수정
const updateAccount = async (accountData: AccountFormData & { id: string }): Promise<Account> => {
  const response = await fetch('/api/accounts', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(accountData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '계좌 수정에 실패했습니다.');
  }

  const result = await response.json();
  return result.data;
};

// 계좌 삭제
const deleteAccount = async (accountId: string): Promise<void> => {
  const response = await fetch(`/api/accounts?id=${accountId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '계좌 삭제에 실패했습니다.');
  }
};

export function useAccounts(year?: number, month?: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // 계좌 목록 조회
  const {
    data: accounts = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['accounts', year, month],
    queryFn: () => fetchAccounts(year, month),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });

  // 새 계좌 생성
  const createAccountMutation = useMutation({
    mutationFn: createAccount,
    onSuccess: (newAccount) => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast({
        title: '계좌 추가 완료',
        description: '새 계좌가 성공적으로 추가되었습니다.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: '계좌 추가 실패',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // 계좌 정보 수정
  const updateAccountMutation = useMutation({
    mutationFn: updateAccount,
    onSuccess: (updatedAccount) => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast({
        title: '계좌 수정 완료',
        description: '계좌 정보가 성공적으로 수정되었습니다.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: '계좌 수정 실패',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // 계좌 삭제
  const deleteAccountMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast({
        title: '계좌 삭제 완료',
        description: '계좌가 성공적으로 삭제되었습니다.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: '계좌 삭제 실패',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // 총 잔액 계산
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  // 계좌 유형별 개수
  const accountTypeCounts = accounts.reduce((counts, account) => {
    counts[account.account_type] = (counts[account.account_type] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  // 계좌 유형별 잔액
  const accountTypeBalances = accounts.reduce((balances, account) => {
    balances[account.account_type] = (balances[account.account_type] || 0) + account.balance;
    return balances;
  }, {} as Record<string, number>);

  return {
    // 데이터
    accounts,
    totalBalance,
    accountTypeCounts,
    accountTypeBalances,
    
    // 상태
    isLoading,
    error,
    
    // 액션
    refetch,
    createAccount: createAccountMutation.mutate,
    updateAccount: updateAccountMutation.mutate,
    deleteAccount: deleteAccountMutation.mutate,
    
    // 뮤테이션 상태
    isCreating: createAccountMutation.isPending,
    isUpdating: updateAccountMutation.isPending,
    isDeleting: deleteAccountMutation.isPending,
  };
}

