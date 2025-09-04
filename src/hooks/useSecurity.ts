import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

// 보안 통계 타입
export interface SecurityStatistics {
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
  metrics: {
    totalEvents: number;
    suspiciousActivities: number;
    failedLogins: number;
    securityScore: number;
  };
  dataActivity: {
    tableActivity: Record<string, { INSERT: number; UPDATE: number; DELETE: number; total: number }>;
    dailyActivity: Record<string, number>;
    totalChanges: number;
  };
  encryption: {
    status: string;
    enabled: boolean;
  };
  recommendations: string[];
  lastUpdated: string;
}

// 감사 로그 타입
export interface AuditLog {
  id: string;
  user_id: string;
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN_FAILED';
  old_values: any;
  new_values: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// 감사 로그 쿼리 파라미터
export interface AuditLogQueryParams {
  year?: number;
  month?: number;
  table_name?: string;
  action?: 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN_FAILED';
  limit?: number;
  offset?: number;
}

// 보안 통계 조회
export function useSecurityStatistics(period: number = 30) {
  return useQuery({
    queryKey: ['security', 'statistics', period],
    queryFn: async (): Promise<SecurityStatistics> => {
      const response = await fetch(`/api/security/statistics?period=${period}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '보안 통계 조회에 실패했습니다.');
      }
      
      const result = await response.json();
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
}

// 감사 로그 조회
export function useAuditLogs(params: AuditLogQueryParams = {}) {
  const { year, month, table_name, action, limit = 50, offset = 0 } = params;
  
  const queryParams = new URLSearchParams();
  if (year) queryParams.append('year', year.toString());
  if (month) queryParams.append('month', month.toString());
  if (table_name) queryParams.append('table_name', table_name);
  if (action) queryParams.append('action', action);
  queryParams.append('limit', limit.toString());
  queryParams.append('offset', offset.toString());
  
  return useQuery({
    queryKey: ['security', 'audit-logs', params],
    queryFn: async (): Promise<{ data: AuditLog[]; pagination: any }> => {
      const response = await fetch(`/api/security/audit-logs?${queryParams.toString()}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '감사 로그 조회에 실패했습니다.');
      }
      
      return await response.json();
    },
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 5 * 60 * 1000, // 5분
  });
}

// 감사 로그 생성
export function useCreateAuditLog() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (auditLogData: Omit<AuditLog, 'id' | 'user_id' | 'created_at'>) => {
      const response = await fetch('/api/security/audit-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(auditLogData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '감사 로그 생성에 실패했습니다.');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['security', 'audit-logs'] });
      queryClient.invalidateQueries({ queryKey: ['security', 'statistics'] });
      
      toast({
        title: '감사 로그 생성 완료',
        description: '보안 이벤트가 기록되었습니다.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: '감사 로그 생성 실패',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// 보안 점수 계산
export function useSecurityScore(statistics: SecurityStatistics | undefined) {
  const score = statistics?.metrics.securityScore || 0;
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };
  
  const getScoreLabel = (score: number) => {
    if (score >= 90) return '우수';
    if (score >= 70) return '양호';
    if (score >= 50) return '주의';
    return '위험';
  };
  
  const getScoreIcon = (score: number) => {
    if (score >= 90) return '🟢';
    if (score >= 70) return '🟡';
    if (score >= 50) return '🟠';
    return '🔴';
  };
  
  return {
    score,
    color: getScoreColor(score),
    label: getScoreLabel(score),
    icon: getScoreIcon(score),
    isGood: score >= 70,
    isWarning: score >= 50 && score < 70,
    isDanger: score < 50,
  };
}

// 보안 권장사항 필터링
export function useSecurityRecommendations(statistics: SecurityStatistics | undefined) {
  const recommendations = statistics?.recommendations || [];
  
  const priorityRecommendations = recommendations.filter(rec => 
    rec.includes('위험') || rec.includes('주의') || rec.includes('의심스러운')
  );
  
  const generalRecommendations = recommendations.filter(rec => 
    !rec.includes('위험') && !rec.includes('주의') && !rec.includes('의심스러운')
  );
  
  return {
    all: recommendations,
    priority: priorityRecommendations,
    general: generalRecommendations,
    hasPriority: priorityRecommendations.length > 0,
    totalCount: recommendations.length,
  };
}

// 보안 활동 추이 분석
export function useSecurityActivityTrend(statistics: SecurityStatistics | undefined) {
  const dailyActivity = statistics?.dataActivity.dailyActivity || {};
  
  // 최근 7일 활동 추이
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();
  
  const activityTrend = last7Days.map(date => ({
    date,
    count: dailyActivity[date] || 0,
  }));
  
  // 활동 증가율 계산
  const totalActivity = Object.values(dailyActivity).reduce((sum, count) => sum + count, 0);
  const averageActivity = totalActivity / Math.max(Object.keys(dailyActivity).length, 1);
  
  const recentActivity = last7Days.slice(-3).reduce((sum, { count }) => sum + count, 0);
  const previousActivity = last7Days.slice(0, -3).reduce((sum, { count }) => sum + count, 0);
  
  const changeRate = previousActivity > 0 
    ? ((recentActivity - previousActivity) / previousActivity) * 100 
    : 0;
  
  return {
    trend: activityTrend,
    totalActivity,
    averageActivity,
    changeRate,
    isIncreasing: changeRate > 0,
    isDecreasing: changeRate < 0,
    isStable: changeRate === 0,
  };
}

// 테이블별 보안 활동 분석
export function useTableSecurityActivity(statistics: SecurityStatistics | undefined) {
  const tableActivity = statistics?.dataActivity.tableActivity || {};
  
  const tableStats = Object.entries(tableActivity).map(([table, activity]) => ({
    table,
    ...activity,
    riskLevel: getTableRiskLevel(activity),
  }));
  
  // 위험도별 정렬
  const sortedByRisk = tableStats.sort((a, b) => {
    const riskOrder = { high: 3, medium: 2, low: 1 };
    return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
  });
  
  return {
    all: tableStats,
    sortedByRisk,
    highRisk: tableStats.filter(t => t.riskLevel === 'high'),
    mediumRisk: tableStats.filter(t => t.riskLevel === 'medium'),
    lowRisk: tableStats.filter(t => t.riskLevel === 'low'),
  };
}

// 테이블 위험도 계산
function getTableRiskLevel(activity: { INSERT: number; UPDATE: number; DELETE: number; total: number }) {
  const { INSERT, UPDATE, DELETE, total } = activity;
  
  // DELETE 비율이 높으면 위험
  if (DELETE / total > 0.3) return 'high';
  
  // UPDATE 비율이 높으면 주의
  if (UPDATE / total > 0.5) return 'medium';
  
  return 'low';
}

