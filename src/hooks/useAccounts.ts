import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';

export interface Account {
  id: string;
  user_id: string;
  account_name: string;
  account_type: 'checking' | 'savings' | 'investment' | 'credit';
  balance: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccountFormData {
  accountName: string;
  accountType: 'checking' | 'savings' | 'investment' | 'credit';
  balance: number;
  currency: string;
}

// 통장 데이터 조회
export const useAccounts = (year: number, month: number) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const query = useQuery({
    queryKey: ['accounts', year, month],
    queryFn: async (): Promise<Account[]> => {
      const response = await fetch(
        `/api/accounts?year=${year}&month=${month}`
      );
      
      if (!response.ok) {
        throw new Error('통장 데이터를 불러올 수 없습니다.');
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5분
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();
  const deleteAccount = useDeleteAccount();

  // 계산된 값들
  const accounts = query.data || [];
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const accountTypeCounts = accounts.reduce((counts, account) => {
    counts[account.account_type] = (counts[account.account_type] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  return {
    ...query,
    accounts,
    totalBalance,
    accountTypeCounts,
    createAccount: createAccount.mutateAsync,
    updateAccount: updateAccount.mutateAsync,
    deleteAccount: deleteAccount.mutateAsync,
    isCreating: createAccount.isPending,
    isUpdating: updateAccount.isPending,
    isDeleting: deleteAccount.isPending,
  };
};

// 통장 데이터 생성
export const useCreateAccount = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string;
      data: AccountFormData;
    }): Promise<Account> => {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '통장 데이터를 저장할 수 없습니다.');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // 캐시 무효화 및 업데이트
      queryClient.invalidateQueries({
        queryKey: ['accounts'],
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboard'],
      });
      
      toast({
        title: '성공',
        description: '통장이 추가되었습니다.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: '오류',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// 통장 데이터 수정
export const useUpdateAccount = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      userId,
      data,
    }: {
      id: string;
      userId: string;
      data: AccountFormData;
    }): Promise<Account> => {
      const response = await fetch('/api/accounts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          userId,
          ...data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '통장 데이터를 수정할 수 없습니다.');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // 캐시 무효화 및 업데이트
      queryClient.invalidateQueries({
        queryKey: ['accounts'],
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboard'],
      });
      
      toast({
        title: '성공',
        description: '통장 정보가 수정되었습니다.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: '오류',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// 통장 데이터 삭제
export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      userId,
    }: {
      id: string;
      userId: string;
    }): Promise<void> => {
      const response = await fetch(`/api/accounts?id=${id}&userId=${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '통장 데이터를 삭제할 수 없습니다.');
      }
    },
    onSuccess: (_, variables) => {
      // 캐시 무효화 및 업데이트
      queryClient.invalidateQueries({
        queryKey: ['accounts'],
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboard'],
      });
      
      toast({
        title: '성공',
        description: '통장이 삭제되었습니다.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: '오류',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

