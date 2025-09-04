import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';

export interface MonthlyExpenses {
  id: string;
  user_id: string;
  year: number;
  month: number;
  housing: number;
  food: number;
  transportation: number;
  utilities: number;
  healthcare: number;
  entertainment: number;
  other_expenses: number;
  total_expenses: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface ExpensesFormData {
  housing: number;
  food: number;
  transportation: number;
  utilities: number;
  healthcare: number;
  entertainment: number;
  other_expenses: number;
  notes: string;
}

// 지출 데이터 조회
export const useExpenses = (userId: string, year: number, month: number) => {
  return useQuery({
    queryKey: ['expenses', userId, year, month],
    queryFn: async (): Promise<MonthlyExpenses | null> => {
      const response = await fetch(
        `/api/expenses?userId=${userId}&year=${year}&month=${month}`
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // 데이터가 없는 경우
        }
        throw new Error('지출 데이터를 불러올 수 없습니다.');
      }
      
      return response.json();
    },
    enabled: !!userId && !!year && !!month,
    staleTime: 5 * 60 * 1000, // 5분
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

// 지출 데이터 생성/수정
export const useUpsertExpenses = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      userId,
      year,
      month,
      data,
    }: {
      userId: string;
      year: number;
      month: number;
      data: ExpensesFormData;
    }): Promise<MonthlyExpenses> => {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          year,
          month,
          ...data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '지출 데이터를 저장할 수 없습니다.');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // 캐시 무효화 및 업데이트
      queryClient.invalidateQueries({
        queryKey: ['expenses', variables.userId, variables.year, variables.month],
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboard', variables.userId],
      });
      
      toast({
        title: '성공',
        description: '지출 데이터가 저장되었습니다.',
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

// 지출 데이터 수정
export const useUpdateExpenses = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      userId,
      year,
      month,
      data,
    }: {
      id: string;
      userId: string;
      year: number;
      month: number;
      data: ExpensesFormData;
    }): Promise<MonthlyExpenses> => {
      const response = await fetch('/api/expenses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          userId,
          year,
          month,
          ...data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '지출 데이터를 수정할 수 없습니다.');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // 캐시 무효화 및 업데이트
      queryClient.invalidateQueries({
        queryKey: ['expenses', variables.userId, variables.year, variables.month],
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboard', variables.userId],
      });
      
      toast({
        title: '성공',
        description: '지출 데이터가 수정되었습니다.',
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

// 지출 데이터 삭제
export const useDeleteExpenses = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      userId,
      year,
      month,
    }: {
      id: string;
      userId: string;
      year: number;
      month: number;
    }): Promise<void> => {
      const response = await fetch(`/api/expenses?id=${id}&userId=${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '지출 데이터를 삭제할 수 없습니다.');
      }
    },
    onSuccess: (_, variables) => {
      // 캐시 무효화 및 업데이트
      queryClient.invalidateQueries({
        queryKey: ['expenses', variables.userId, variables.year, variables.month],
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboard', variables.userId],
      });
      
      toast({
        title: '성공',
        description: '지출 데이터가 삭제되었습니다.',
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
