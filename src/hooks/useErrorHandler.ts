'use client';

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface ErrorState {
  hasError: boolean;
  errorType: 'network' | 'validation' | 'conflict' | 'unauthorized' | 'unknown';
  message: string;
  retryCount: number;
  lastError: Error | null;
  canRetry: boolean;
}

export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  backoffMultiplier: 2,
};

export function useErrorHandler(retryConfig: Partial<RetryConfig> = {}) {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    errorType: 'unknown',
    message: '',
    retryCount: 0,
    lastError: null,
    canRetry: true,
  });

  const { toast } = useToast();
  const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };

  // 에러 타입 분류
  const classifyError = useCallback((error: Error): ErrorState['errorType'] => {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return 'network';
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return 'validation';
    }
    if (message.includes('conflict') || message.includes('duplicate') || message.includes('constraint')) {
      return 'conflict';
    }
    if (message.includes('unauthorized') || message.includes('auth') || message.includes('401')) {
      return 'unauthorized';
    }
    return 'unknown';
  }, []);

  // 에러 메시지 생성
  const getErrorMessage = useCallback((errorType: ErrorState['errorType'], error?: Error): string => {
    const baseMessages = {
      network: '네트워크 연결을 확인해주세요.',
      validation: '입력 데이터를 확인해주세요.',
      conflict: '데이터 충돌이 발생했습니다. 다시 시도해주세요.',
      unauthorized: '인증이 필요합니다. 다시 로그인해주세요.',
      unknown: '알 수 없는 오류가 발생했습니다.',
    };

    const baseMessage = baseMessages[errorType];
    
    // 개발 환경에서는 상세 에러 메시지 포함
    if (process.env.NODE_ENV === 'development' && error) {
      return `${baseMessage} (${error.message})`;
    }
    
    return baseMessage;
  }, []);

  // 에러 처리
  const handleError = useCallback((error: Error, context?: string) => {
    const errorType = classifyError(error);
    const message = getErrorMessage(errorType, error);
    
    const newErrorState: ErrorState = {
      hasError: true,
      errorType,
      message,
      retryCount: errorState.retryCount,
      lastError: error,
      canRetry: errorType === 'network' && errorState.retryCount < config.maxRetries,
    };

    setErrorState(newErrorState);

    // 토스트 메시지 표시
    toast({
      title: '오류 발생',
      description: message,
      variant: 'destructive',
    });

    // 에러 로깅 (개발 환경)
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${context || 'Unknown'}] Error:`, error);
      console.error('Error State:', newErrorState);
    }

    return newErrorState;
  }, [errorState.retryCount, config.maxRetries, classifyError, getErrorMessage, toast]);

  // 에러 초기화
  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      errorType: 'unknown',
      message: '',
      retryCount: 0,
      lastError: null,
      canRetry: true,
    });
  }, []);

  // 재시도 로직
  const retry = useCallback(async <T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    if (!errorState.canRetry) {
      toast({
        title: '재시도 불가',
        description: '최대 재시도 횟수를 초과했습니다.',
        variant: 'destructive',
      });
      return null;
    }

    const newRetryCount = errorState.retryCount + 1;
    const delay = config.retryDelay * Math.pow(config.backoffMultiplier, newRetryCount - 1);

    setErrorState(prev => ({
      ...prev,
      retryCount: newRetryCount,
      canRetry: newRetryCount < config.maxRetries,
    }));

    // 재시도 대기
    await new Promise(resolve => setTimeout(resolve, delay));

    try {
      const result = await operation();
      
      // 성공 시 에러 상태 초기화
      clearError();
      
      toast({
        title: '재시도 성공',
        description: '작업이 성공적으로 완료되었습니다.',
      });

      return result;
    } catch (error) {
      // 재시도 실패 시 에러 처리
      const retryError = error instanceof Error ? error : new Error('Unknown error');
      handleError(retryError, `${context} (재시도 ${newRetryCount}/${config.maxRetries})`);
      
      return null;
    }
  }, [errorState.canRetry, errorState.retryCount, config, clearError, handleError, toast]);

  // 네트워크 상태 감지
  useEffect(() => {
    const handleOnline = () => {
      if (errorState.errorType === 'network') {
        toast({
          title: '네트워크 연결 복구',
          description: '인터넷 연결이 복구되었습니다.',
        });
        clearError();
      }
    };

    const handleOffline = () => {
      if (!errorState.hasError) {
        handleError(new Error('Network offline'), 'Network Status');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [errorState.errorType, errorState.hasError, clearError, handleError, toast]);

  // 자동 재시도 (네트워크 에러의 경우)
  useEffect(() => {
    if (errorState.errorType === 'network' && errorState.canRetry && errorState.lastError) {
      const timer = setTimeout(() => {
        if (navigator.onLine) {
          toast({
            title: '자동 재시도',
            description: '네트워크 연결이 복구되어 자동으로 재시도합니다.',
          });
          clearError();
        }
      }, 5000); // 5초 후 자동 재시도

      return () => clearTimeout(timer);
    }
  }, [errorState.errorType, errorState.canRetry, errorState.lastError, clearError, toast]);

  return {
    errorState,
    handleError,
    clearError,
    retry,
    canRetry: errorState.canRetry,
    retryCount: errorState.retryCount,
    maxRetries: config.maxRetries,
  };
}

// 특정 에러 타입별 처리 훅
export function useNetworkErrorHandler() {
  return useErrorHandler({
    maxRetries: 5,
    retryDelay: 2000,
    backoffMultiplier: 1.5,
  });
}

export function useValidationErrorHandler() {
  return useErrorHandler({
    maxRetries: 1, // 검증 에러는 재시도하지 않음
    retryDelay: 0,
    backoffMultiplier: 1,
  });
}

export function useConflictErrorHandler() {
  return useErrorHandler({
    maxRetries: 2,
    retryDelay: 1000,
    backoffMultiplier: 1,
  });
}

