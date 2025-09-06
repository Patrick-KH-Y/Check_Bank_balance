import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';
import type { FixedExpense, FixedExpenseFormData } from '@/types/dashboard';

// 고정 지출 목록 조회
export const useFixedExpenses = (userId: string, year?: number, month?: number) => {
  return useQuery({
    queryKey: ['fixed-expenses', userId, year, month],
    queryFn: async (): Promise<FixedExpense[]> => {
      console.log(`[useFixedExpenses] 데이터 조회 시작: userId=${userId}, year=${year}, month=${month}`);
      
      const params = new URLSearchParams({ userId });
      if (year && month) {
        params.append('year', year.toString());
        params.append('month', month.toString());
      }
      
      const response = await fetch(`/api/fixed-expenses?${params}`);
      
      console.log(`[useFixedExpenses] API 응답 상태: ${response.status}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`[useFixedExpenses] API 오류: ${response.status} -`, errorData);
        throw new Error(errorData.error || '고정 지출 데이터를 불러올 수 없습니다.');
      }
      
      const result = await response.json();
      console.log(`[useFixedExpenses] 조회된 데이터:`, result);
      return result.data || result; // 새로운 형식과 기존 형식 모두 지원
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5분
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

// 고정 지출 생성
export const useCreateFixedExpense = () => {
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
      data: FixedExpenseFormData;
    }): Promise<FixedExpense> => {
      console.log(`[useCreateFixedExpense] 데이터 생성 시작:`, { userId, year, month, data });
      
      const response = await fetch('/api/fixed-expenses', {
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
        console.error(`[useCreateFixedExpense] 생성 오류: ${response.status} -`, errorData);
        throw new Error(errorData.error || '고정 지출을 생성할 수 없습니다.');
      }

      const result = await response.json();
      console.log(`[useCreateFixedExpense] 생성 완료:`, result);
      return result.data || result; // 새로운 형식과 기존 형식 모두 지원
    },
    onSuccess: (data, variables) => {
      // 캐시 무효화 및 업데이트
      queryClient.invalidateQueries({
        queryKey: ['fixed-expenses'],
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboard'],
      });
      
      console.log(`[useCreateFixedExpense] 캐시 무효화 완료: ${variables.year}년 ${variables.month}월`);
      
      toast({
        title: '성공',
        description: '고정 지출이 생성되었습니다.',
      });
    },
    onError: (error: Error) => {
      console.error(`[useCreateFixedExpense] 뮤테이션 오류:`, error);
      toast({
        title: '오류',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// 고정 지출 수정
export const useUpdateFixedExpense = () => {
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
      data: FixedExpenseFormData;
    }): Promise<FixedExpense> => {
      const response = await fetch('/api/fixed-expenses', {
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
        throw new Error(errorData.error || '고정 지출을 수정할 수 없습니다.');
      }

      const result = await response.json();
      return result.data || result; // 새로운 형식과 기존 형식 모두 지원
    },
    onSuccess: (data, variables) => {
      // 캐시 무효화 및 업데이트
      queryClient.invalidateQueries({
        queryKey: ['fixed-expenses'],
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboard'],
      });
      
      toast({
        title: '성공',
        description: '고정 지출이 수정되었습니다.',
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

// 고정 지출 삭제
export const useDeleteFixedExpense = () => {
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
      const response = await fetch(`/api/fixed-expenses?id=${id}&userId=${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '고정 지출을 삭제할 수 없습니다.');
      }
    },
    onSuccess: (_, variables) => {
      // 캐시 무효화 및 업데이트
      queryClient.invalidateQueries({
        queryKey: ['fixed-expenses'],
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboard'],
      });
      
      toast({
        title: '성공',
        description: '고정 지출이 삭제되었습니다.',
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

// 고정 지출 생성/수정 (upsert)
export const useUpsertFixedExpense = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      userId,
      year,
      month,
      data,
      id,
    }: {
      userId: string;
      year: number;
      month: number;
      data: FixedExpenseFormData;
      id?: string;
    }): Promise<FixedExpense> => {
      const isUpdate = !!id;
      const method = isUpdate ? 'PUT' : 'POST';
      
      const response = await fetch('/api/fixed-expenses', {
        method,
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
        throw new Error(errorData.error || `고정 지출을 ${isUpdate ? '수정' : '생성'}할 수 없습니다.`);
      }

      const result = await response.json();
      return result.data || result;
    },
    onSuccess: (data, variables) => {
      // 캐시 무효화 및 업데이트
      queryClient.invalidateQueries({
        queryKey: ['fixed-expenses'],
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboard'],
      });
      
      toast({
        title: '성공',
        description: variables.id ? '고정 지출이 수정되었습니다.' : '고정 지출이 생성되었습니다.',
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
