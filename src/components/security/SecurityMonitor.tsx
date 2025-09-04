'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, AlertTriangle, Eye, Clock, User, Database, Activity, RefreshCw, TrendingUp, TrendingDown,
  Lock, Unlock, AlertCircle, CheckCircle, XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  useSecurityStatistics, 
  useAuditLogs, 
  useSecurityScore, 
  useSecurityRecommendations,
  useSecurityActivityTrend,
  useTableSecurityActivity,
  type SecurityStatistics,
  type AuditLog
} from '@/hooks/useSecurity';

export function SecurityMonitor() {
  const [activeTab, setActiveTab] = useState<'overview' | 'audit' | 'events' | 'suspicious'>('overview');
  const [period, setPeriod] = useState<number>(30);
  const [auditParams, setAuditParams] = useState<{
    table_name: string;
    action: 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN_FAILED' | undefined;
    limit: number;
    offset: number;
  }>({
    table_name: '',
    action: undefined,
    limit: 50,
    offset: 0,
  });
  
  const { toast } = useToast();
  
  // 보안 통계 조회
  const { 
    data: statistics, 
    isLoading: statsLoading, 
    error: statsError,
    refetch: refetchStats 
  } = useSecurityStatistics(period);
  
  // 감사 로그 조회
  const { 
    data: auditLogsData, 
    isLoading: auditLoading, 
    error: auditError,
    refetch: refetchAudit 
  } = useAuditLogs(auditParams);
  
  // 보안 점수 분석
  const securityScore = useSecurityScore(statistics);
  
  // 보안 권장사항
  const recommendations = useSecurityRecommendations(statistics);
  
  // 보안 활동 추이
  const activityTrend = useSecurityActivityTrend(statistics);
  
  // 테이블별 보안 활동
  const tableActivity = useTableSecurityActivity(statistics);
  
  // 데이터 새로고침
  const refreshData = async () => {
    try {
      await Promise.all([refetchStats(), refetchAudit()]);
      toast({
        title: '데이터 새로고침 완료',
        description: '보안 정보가 최신 상태로 업데이트되었습니다.',
      });
    } catch (error) {
      toast({
        title: '데이터 새로고침 실패',
        description: '데이터를 새로고침하는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };
  
  // 오류 처리
  useEffect(() => {
    if (statsError) {
      toast({
        title: '보안 통계 조회 실패',
        description: statsError.message,
        variant: 'destructive',
      });
    }
    
    if (auditError) {
      toast({
        title: '감사 로그 조회 실패',
        description: auditError.message,
        variant: 'destructive',
      });
    }
  }, [statsError, auditError, toast]);
  
  // 로딩 상태
  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>보안 정보를 불러오는 중...</span>
        </div>
      </div>
    );
  }
  
  // 오류 상태
  if (statsError && !statistics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">보안 정보를 불러올 수 없습니다</h3>
          <p className="text-gray-600 mb-4">{statsError.message}</p>
          <Button onClick={refreshData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            다시 시도
          </Button>
        </div>
      </div>
    );
  }
  
  const auditLogs = auditLogsData?.data || [];
  const pagination = auditLogsData?.pagination;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">보안 모니터링</h1>
          <p className="text-gray-600 mt-2">애플리케이션 보안 상태 및 활동을 모니터링합니다</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={period.toString()} onValueChange={(value) => setPeriod(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">최근 7일</SelectItem>
              <SelectItem value="30">최근 30일</SelectItem>
              <SelectItem value="90">최근 90일</SelectItem>
              <SelectItem value="365">최근 1년</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </Button>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: '개요', icon: Shield },
            { id: 'audit', label: '감사 로그', icon: Eye },
            { id: 'events', label: '보안 이벤트', icon: AlertTriangle },
            { id: 'suspicious', label: '의심스러운 활동', icon: AlertCircle },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 보안 점수 카드 */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  보안 점수
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold">{securityScore.icon}</div>
                  <div>
                    <div className={`text-3xl font-bold ${securityScore.color}`}>
                      {securityScore.score}점
                    </div>
                    <div className="text-gray-600">{securityScore.label}</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-sm text-gray-500">최근 {period}일 기준</div>
                    <div className="text-sm text-gray-500">
                      {statistics?.lastUpdated ? new Date(statistics.lastUpdated).toLocaleDateString('ko-KR') : ''}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* 주요 지표 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">총 이벤트</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statistics?.metrics.totalEvents || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    최근 {period}일간의 모든 보안 이벤트
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">의심스러운 활동</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {statistics?.metrics.suspiciousActivities || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    주의가 필요한 활동
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">실패한 로그인</CardTitle>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {statistics?.metrics.failedLogins || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    인증 실패 시도
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">암호화 상태</CardTitle>
                  {statistics?.encryption.enabled ? (
                    <Lock className="h-4 w-4 text-green-600" />
                  ) : (
                    <Unlock className="h-4 w-4 text-red-600" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${
                    statistics?.encryption.enabled ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {statistics?.encryption.enabled ? '활성화' : '비활성화'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    데이터 암호화 상태
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* 보안 권장사항 */}
            {recommendations.totalCount > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    보안 권장사항
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recommendations.priority.map((rec, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <span className="text-red-800">{rec}</span>
                      </div>
                    ))}
                    {recommendations.general.map((rec, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-blue-800">{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* 활동 추이 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  활동 추이 (최근 7일)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-600">
                    총 활동: {activityTrend.totalActivity}회
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">변화율:</span>
                    <Badge variant={activityTrend.isIncreasing ? 'default' : activityTrend.isDecreasing ? 'destructive' : 'secondary'}>
                      {activityTrend.changeRate > 0 ? '+' : ''}{activityTrend.changeRate.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {activityTrend.trend.map(({ date, count }) => (
                    <div key={date} className="text-center">
                      <div className="text-xs text-gray-500 mb-1">
                        {new Date(date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-lg font-semibold">{count}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {activeTab === 'audit' && (
          <div className="space-y-6">
            {/* 필터 */}
            <Card>
              <CardHeader>
                <CardTitle>감사 로그 필터</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Select 
                    value={auditParams.table_name} 
                    onValueChange={(value) => setAuditParams(prev => ({ ...prev, table_name: value }))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="테이블 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">모든 테이블</SelectItem>
                      <SelectItem value="accounts">계좌</SelectItem>
                      <SelectItem value="monthly_income">수입</SelectItem>
                      <SelectItem value="monthly_expenses">지출</SelectItem>
                      <SelectItem value="monthly_savings">저축</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select 
                    value={auditParams.action || ''} 
                    onValueChange={(value) => setAuditParams(prev => ({ 
                      ...prev, 
                      action: value === '' ? undefined : value as 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN_FAILED'
                    }))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="작업 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">모든 작업</SelectItem>
                      <SelectItem value="INSERT">생성</SelectItem>
                      <SelectItem value="UPDATE">수정</SelectItem>
                      <SelectItem value="DELETE">삭제</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    onClick={() => {
                      setAuditParams({ table_name: '', action: undefined, limit: 50, offset: 0 });
                    }}
                    variant="outline"
                    size="sm"
                  >
                    필터 초기화
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* 감사 로그 테이블 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>감사 로그</span>
                  <div className="text-sm text-gray-500">
                    총 {pagination?.total || 0}개 항목
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {auditLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                    로그를 불러오는 중...
                  </div>
                ) : auditLogs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    해당 조건의 감사 로그가 없습니다.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>시간</TableHead>
                          <TableHead>테이블</TableHead>
                          <TableHead>작업</TableHead>
                          <TableHead>레코드 ID</TableHead>
                          <TableHead>IP 주소</TableHead>
                          <TableHead>상세</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {auditLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="text-sm">
                              {new Date(log.created_at).toLocaleString('ko-KR')}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{log.table_name}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  log.action === 'DELETE' ? 'destructive' : 
                                  log.action === 'UPDATE' ? 'secondary' : 'default'
                                }
                              >
                                {log.action}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {log.record_id.slice(0, 8)}...
                            </TableCell>
                            <TableCell className="text-sm">
                              {log.ip_address || '-'}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    {/* 페이지네이션 */}
                    {pagination && pagination.total > pagination.limit && (
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, pagination.total)} / {pagination.total}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.offset === 0}
                            onClick={() => setAuditParams(prev => ({ 
                              ...prev, 
                              offset: Math.max(0, prev.offset - prev.limit) 
                            }))}
                          >
                            이전
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!pagination.hasMore}
                            onClick={() => setAuditParams(prev => ({ 
                              ...prev, 
                              offset: prev.offset + prev.limit 
                            }))}
                          >
                            다음
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        
        {activeTab === 'events' && (
          <div className="space-y-6">
            {/* 테이블별 활동 분석 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  테이블별 보안 활동
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tableActivity.sortedByRisk.map((table) => (
                    <div key={table.table} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold capitalize">{table.table}</h4>
                        <Badge 
                          variant={
                            table.riskLevel === 'high' ? 'destructive' : 
                            table.riskLevel === 'medium' ? 'secondary' : 'default'
                          }
                        >
                          {table.riskLevel === 'high' ? '높음' : 
                           table.riskLevel === 'medium' ? '보통' : '낮음'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">{table.INSERT}</div>
                          <div className="text-gray-500">생성</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-600">{table.UPDATE}</div>
                          <div className="text-gray-500">수정</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-red-600">{table.DELETE}</div>
                          <div className="text-gray-500">삭제</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">{table.total}</div>
                          <div className="text-gray-500">총합</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {activeTab === 'suspicious' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  의심스러운 활동
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statistics?.metrics.suspiciousActivities === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">의심스러운 활동이 없습니다</h3>
                    <p className="text-gray-600">현재 보안 상태가 양호합니다.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        <span className="font-semibold text-orange-800">
                          {statistics?.metrics.suspiciousActivities}개의 의심스러운 활동이 감지되었습니다
                        </span>
                      </div>
                      <p className="text-orange-700 text-sm">
                        이러한 활동들은 잠재적인 보안 위험을 나타낼 수 있습니다. 
                        상세한 분석을 위해 감사 로그를 확인하시기 바랍니다.
                      </p>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p>• 의심스러운 활동은 비정상적인 데이터 접근 패턴,</p>
                      <p>• 예상치 못한 데이터 변경, 또는</p>
                      <p>• 보안 정책 위반 등을 포함할 수 있습니다.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
