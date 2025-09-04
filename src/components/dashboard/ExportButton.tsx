'use client';

import { useState } from 'react';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { MonthlySummary } from '@/types/dashboard';

interface ExportButtonProps {
  userId: string;
  currentYear: number;
  currentMonth: number;
  onExport?: () => void;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export function ExportButton({ 
  userId, 
  currentYear = new Date().getFullYear(), 
  currentMonth = new Date().getMonth() + 1, 
  onExport,
  ariaLabel = "재무 데이터 내보내기",
  ariaDescribedBy
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'csv'>('pdf');
  const [selectedReportType, setSelectedReportType] = useState<'monthly' | 'accounts'>('monthly');
  const { toast } = useToast();

  // 년도 옵션 생성 (현재 년도부터 3년 전까지)
  const yearOptions = Array.from({ length: 4 }, (_, i) => currentYear - i);
  
  // 월 옵션 생성
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleExport = async () => {
    if (!userId) {
      toast({
        title: '오류',
        description: '사용자 정보를 찾을 수 없습니다.',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);

    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          year: selectedYear,
          month: selectedMonth,
          format: selectedFormat,
          reportType: selectedReportType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '내보내기 중 오류가 발생했습니다.');
      }

      // 파일 다운로드 처리
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || `report.${selectedFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: '성공',
        description: `${selectedFormat.toUpperCase()} 파일이 성공적으로 다운로드되었습니다.`,
      });

      onExport?.();
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '내보내기 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getFormatIcon = () => {
    return selectedFormat === 'pdf' ? <FileText className="h-4 w-4" /> : <FileSpreadsheet className="h-4 w-4" />;
  };

  const getFormatLabel = () => {
    return selectedFormat === 'pdf' ? 'PDF' : 'CSV';
  };

  const getReportTypeLabel = () => {
    return selectedReportType === 'monthly' ? '월별 요약' : '통장 잔액';
  };

  return (
    <div className="flex flex-col space-y-4 p-4 bg-white rounded-lg border shadow-sm">
      <div className="flex items-center space-x-2">
        <Download className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">리포트 내보내기</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* 년도 선택 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">년도</label>
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}년
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 월 선택 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">월</label>
          <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((month) => (
                <SelectItem key={month} value={month.toString()}>
                  {month}월
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 리포트 타입 선택 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">리포트 타입</label>
          <Select value={selectedReportType} onValueChange={(value: 'monthly' | 'accounts') => setSelectedReportType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">월별 요약</SelectItem>
              <SelectItem value="accounts">통장 잔액</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 파일 형식 선택 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">파일 형식</label>
          <Select value={selectedFormat} onValueChange={(value: 'pdf' | 'csv') => setSelectedFormat(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 내보내기 버튼 */}
      <Button
        onClick={handleExport}
        disabled={isExporting}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        {isExporting ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>내보내는 중...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            {getFormatIcon()}
            <span>{getReportTypeLabel()} {getFormatLabel()}로 내보내기</span>
          </div>
        )}
      </Button>

      {/* 선택된 옵션 미리보기 */}
      <div className="text-xs text-gray-500 text-center">
        {selectedYear}년 {selectedMonth}월 {getReportTypeLabel()}을 {getFormatLabel()} 형식으로 내보냅니다.
      </div>
    </div>
  );
}

