'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';

export interface ConflictData {
  local: any;
  remote: any;
  lastModified: {
    local: string;
    remote: string;
  };
  conflictType: 'income' | 'expenses' | 'accounts';
}

export interface ConflictResolverProps {
  conflict: ConflictData;
  onResolve: (resolution: 'local' | 'remote' | 'merge') => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConflictResolver({ conflict, onResolve, onCancel, loading = false }: ConflictResolverProps) {
  const [selectedResolution, setSelectedResolution] = useState<'local' | 'remote' | 'merge' | null>(null);

  const getConflictTypeLabel = (type: string) => {
    const labels = {
      income: '수입 정보',
      expenses: '지출 정보',
      accounts: '계좌 정보',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getConflictTypeColor = (type: string) => {
    const colors = {
      income: 'bg-green-100 text-green-800',
      expenses: 'bg-red-100 text-red-800',
      accounts: 'bg-blue-100 text-blue-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleResolve = () => {
    if (selectedResolution) {
      onResolve(selectedResolution);
    }
  };

  const getDataPreview = (data: any, type: string) => {
    switch (type) {
      case 'income':
        return {
          title: '수입 정보',
          fields: [
            { label: '경훈 월급', value: data.경훈_월급?.toLocaleString() || '0' },
            { label: '선화 월급', value: data.선화_월급?.toLocaleString() || '0' },
            { label: '기타 수입', value: data.other_income?.toLocaleString() || '0' },
            { label: '총 수입', value: data.total_income?.toLocaleString() || '0' },
          ],
        };
      case 'expenses':
        return {
          title: '지출 정보',
          fields: [
            { label: '주거비', value: data.housing?.toLocaleString() || '0' },
            { label: '식비', value: data.food?.toLocaleString() || '0' },
            { label: '교통비', value: data.transportation?.toLocaleString() || '0' },
            { label: '총 지출', value: data.total_expenses?.toLocaleString() || '0' },
          ],
        };
      case 'accounts':
        return {
          title: '계좌 정보',
          fields: [
            { label: '계좌명', value: data.account_name || 'N/A' },
            { label: '유형', value: data.account_type || 'N/A' },
            { label: '잔액', value: data.balance?.toLocaleString() || '0' },
          ],
        };
      default:
        return {
          title: '데이터 정보',
          fields: Object.entries(data).slice(0, 4).map(([key, value]) => ({
            label: key,
            value: typeof value === 'number' ? value.toLocaleString() : String(value || 'N/A'),
          })),
        };
    }
  };

  const localPreview = getDataPreview(conflict.local, conflict.conflictType);
  const remotePreview = getDataPreview(conflict.remote, conflict.conflictType);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            데이터 충돌 발생
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getConflictTypeColor(conflict.conflictType)}>
              {getConflictTypeLabel(conflict.conflictType)}
            </Badge>
            <span className="text-sm text-gray-600">
              동일한 데이터가 다른 시간에 수정되었습니다.
            </span>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* 충돌 정보 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 로컬 데이터 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <h3 className="font-semibold text-blue-600">로컬 데이터 (현재)</h3>
              </div>
              <div className="text-xs text-gray-500">
                마지막 수정: {formatDate(conflict.lastModified.local)}
              </div>
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-4">
                  <h4 className="font-medium text-blue-800 mb-2">{localPreview.title}</h4>
                  <div className="space-y-1">
                    {localPreview.fields.map((field, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-blue-700">{field.label}:</span>
                        <span className="font-mono text-blue-800">{field.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 원격 데이터 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-green-600" />
                <h3 className="font-semibold text-green-600">원격 데이터 (서버)</h3>
              </div>
              <div className="text-xs text-gray-500">
                마지막 수정: {formatDate(conflict.lastModified.remote)}
              </div>
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-4">
                  <h4 className="font-medium text-green-800 mb-2">{remotePreview.title}</h4>
                  <div className="space-y-1">
                    {remotePreview.fields.map((field, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-green-700">{field.label}:</span>
                        <span className="font-mono text-green-800">{field.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 해결 방법 선택 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">해결 방법을 선택해주세요:</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* 로컬 데이터 유지 */}
              <Button
                variant={selectedResolution === 'local' ? 'default' : 'outline'}
                className={`h-auto p-4 flex flex-col items-center gap-2 ${
                  selectedResolution === 'local' ? 'bg-blue-600 text-white' : ''
                }`}
                onClick={() => setSelectedResolution('local')}
                disabled={loading}
              >
                <CheckCircle className="h-5 w-5" />
                <div className="text-center">
                  <div className="font-medium">로컬 데이터 유지</div>
                  <div className="text-xs opacity-80">현재 입력한 데이터를 사용</div>
                </div>
              </Button>

              {/* 원격 데이터 사용 */}
              <Button
                variant={selectedResolution === 'remote' ? 'default' : 'outline'}
                className={`h-auto p-4 flex flex-col items-center gap-2 ${
                  selectedResolution === 'remote' ? 'bg-green-600 text-white' : ''
                }`}
                onClick={() => setSelectedResolution('remote')}
                disabled={loading}
              >
                <RefreshCw className="h-5 w-5" />
                <div className="text-center">
                  <div className="font-medium">원격 데이터 사용</div>
                  <div className="text-xs opacity-80">서버의 최신 데이터를 사용</div>
                </div>
              </Button>

              {/* 데이터 병합 */}
              <Button
                variant={selectedResolution === 'merge' ? 'default' : 'outline'}
                className={`h-auto p-4 flex flex-col items-center gap-2 ${
                  selectedResolution === 'merge' ? 'bg-purple-600 text-white' : ''
                }`}
                onClick={() => setSelectedResolution('merge')}
                disabled={loading}
              >
                <AlertTriangle className="h-5 w-5" />
                <div className="text-center">
                  <div className="font-medium">데이터 병합</div>
                  <div className="text-xs opacity-80">두 데이터를 결합 (권장하지 않음)</div>
                </div>
              </Button>
            </div>
          </div>

          {/* 주의사항 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">주의사항:</p>
                <ul className="mt-1 space-y-1">
                  <li>• 데이터 충돌은 동시 편집이나 네트워크 지연으로 발생할 수 있습니다.</li>
                  <li>• 로컬 데이터 유지를 선택하면 서버의 최신 변경사항이 손실될 수 있습니다.</li>
                  <li>• 원격 데이터 사용을 선택하면 현재 입력한 데이터가 손실됩니다.</li>
                  <li>• 데이터 병합은 예상치 못한 결과를 초래할 수 있습니다.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onCancel} disabled={loading}>
              <XCircle className="h-4 w-4 mr-2" />
              취소
            </Button>
            <Button
              onClick={handleResolve}
              disabled={!selectedResolution || loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              충돌 해결
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

