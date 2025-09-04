import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';

export interface MonthlyIncome {
  id: string;
  user_id: string;
  year: number;
  month: number;
  경훈_월급: number;
  선화_월급: number;
  other_income: number;
  total_income: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface IncomeFormData {
  경훈_월급: number;
  선화_월급: number;
  other_income: number;
  notes: string;
}

// 수입 데이터 조회
export const useIncome = (userId: string, year: number, month: number) => {
  return useQuery({
    queryKey: ['income', userId, year, month],
    queryFn: async (): Promise<MonthlyIncome | null> => {
      console.log(`[useIncome] 데이터 조회 시작: userId=${userId}, year=${year}, month=${month}`);
      
      const response = await fetch(
        `/api/income?userId=${userId}&year=${year}&month=${month}`
      );
      
      console.log(`[useIncome] API 응답 상태: ${response.status}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`[useIncome] 데이터 없음: ${year}년 ${month}월`);
          return null; // 데이터가 없는 경우
        }
        const errorText = await response.text();
        console.error(`[useIncome] API 오류: ${response.status} - ${errorText}`);
        throw new Error('수입 데이터를 불러올 수 없습니다.');
      }
      
      const data = await response.json();
      console.log(`[useIncome] 조회된 데이터:`, data);
      return data;
    },
    enabled: !!userId && !!year && !!month,
    staleTime: 5 * 60 * 1000, // 5분
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

// 수입 데이터 생성/수정
export const useUpsertIncome = () => {
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
      data: IncomeFormData;
    }): Promise<MonthlyIncome> => {
      console.log(`[useUpsertIncome] 데이터 저장 시작:`, { userId, year, month, data });
      
      const response = await fetch('/api/income', {
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
        console.error(`[useUpsertIncome] 저장 오류: ${response.status} -`, errorData);
        throw new Error(errorData.error || '수입 데이터를 저장할 수 없습니다.');
      }

      const result = await response.json();
      console.log(`[useUpsertIncome] 저장 완료:`, result);
      return result;
    },
    onSuccess: (data, variables) => {
      // 캐시 무효화 및 업데이트
      queryClient.invalidateQueries({
        queryKey: ['income'],
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboard'],
      });
      
      console.log(`[useUpsertIncome] 캐시 무효화 완료: ${variables.year}년 ${variables.month}월`);
      
      toast({
        title: '성공',
        description: `${variables.year}년 ${variables.month}월 수입 정보가 저장되었습니다.`,
      });
    },
    onError: (error: Error) => {
      console.error(`[useUpsertIncome] 뮤테이션 오류:`, error);
      toast({
        title: '오류',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// 수입 데이터 수정
export const useUpdateIncome = () => {
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
      data: IncomeFormData;
    }): Promise<MonthlyIncome> => {
      const response = await fetch('/api/income', {
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
        throw new Error(errorData.error || '수입 데이터를 수정할 수 없습니다.');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // 캐시 무효화 및 업데이트
      queryClient.invalidateQueries({
        queryKey: ['income'],
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboard'],
      });
      
      toast({
        title: '성공',
        description: '수입 정보가 수정되었습니다.',
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

// 수입 데이터 삭제
export const useDeleteIncome = () => {
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
      const response = await fetch(`/api/income?id=${id}&userId=${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '수입 데이터를 삭제할 수 없습니다.');
      }
    },
    onSuccess: (_, variables) => {
      // 캐시 무효화 및 업데이트
      queryClient.invalidateQueries({
        queryKey: ['income'],
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboard'],
      });
      
      toast({
        title: '성공',
        description: '수입 데이터가 삭제되었습니다.',
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
