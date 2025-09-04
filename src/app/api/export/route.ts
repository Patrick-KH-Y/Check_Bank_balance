import { NextRequest, NextResponse } from 'next/server';
import { PDFExportService, CSVExportService } from '@/lib/export-services';
import { createClient } from '@/lib/supabase/server';
import type { MonthlySummary } from '@/types/dashboard';

export async function POST(request: NextRequest) {
  try {
    const { userId, year, month, format, reportType } = await request.json();

    if (!userId || !year || !month || !format || !reportType) {
      return NextResponse.json(
        { error: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // Supabase 클라이언트 생성
    const supabase = await createClient();

    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.id !== userId) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }

    let fileData: Blob | string;
    let fileName: string;
    let contentType: string;

    if (reportType === 'monthly') {
      // 월별 재무 데이터 조회
      const { data: monthlyData, error: dataError } = await supabase
        .from('monthly_income')
        .select('*')
        .eq('user_id', userId)
        .eq('year', year)
        .eq('month', month)
        .single();

      if (dataError || !monthlyData) {
        return NextResponse.json(
          { error: '해당 월의 데이터를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      // 월별 지출 데이터 조회
      const { data: expenseData, error: expenseError } = await supabase
        .from('monthly_expenses')
        .select('*')
        .eq('user_id', userId)
        .eq('year', year)
        .eq('month', month)
        .single();

      if (expenseError || !expenseData) {
        return NextResponse.json(
          { error: '해당 월의 지출 데이터를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      // MonthlySummary 객체 구성
      const monthlySummary: MonthlySummary = {
        year,
        month,
        income: monthlyData,
        expenses: expenseData,
        total_income: monthlyData.total_income,
        total_expenses: expenseData.total_expenses,
        total_savings: monthlyData.total_income - expenseData.total_expenses,
        savings_rate: expenseData.total_expenses > 0 
          ? ((monthlyData.total_income - expenseData.total_expenses) / monthlyData.total_income) * 100
          : 0
      };

      if (format === 'pdf') {
        const pdfService = new PDFExportService();
        fileData = pdfService.generateMonthlyReport(monthlySummary);
        fileName = `${year}년_${month}월_재무요약.pdf`;
        contentType = 'application/pdf';
      } else if (format === 'csv') {
        const csvService = new CSVExportService();
        fileData = csvService.generateMonthlyCSV(monthlySummary);
        fileName = `${year}년_${month}월_재무요약.csv`;
        contentType = 'text/csv';
      } else {
        return NextResponse.json(
          { error: '지원하지 않는 형식입니다.' },
          { status: 400 }
        );
      }
    } else if (reportType === 'accounts') {
      // 통장/계좌 데이터 조회
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (accountsError || !accounts) {
        return NextResponse.json(
          { error: '계좌 데이터를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      if (format === 'pdf') {
        const pdfService = new PDFExportService();
        fileData = pdfService.generateAccountReport(accounts);
        fileName = `통장잔액현황_${new Date().toISOString().split('T')[0]}.pdf`;
        contentType = 'application/pdf';
      } else if (format === 'csv') {
        const csvService = new CSVExportService();
        fileData = csvService.generateAccountCSV(accounts);
        fileName = `통장잔액현황_${new Date().toISOString().split('T')[0]}.csv`;
        contentType = 'text/csv';
      } else {
        return NextResponse.json(
          { error: '지원하지 않는 형식입니다.' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: '지원하지 않는 리포트 타입입니다.' },
        { status: 400 }
      );
    }

    // 파일 다운로드 응답 생성
    if (format === 'pdf') {
      return new NextResponse(fileData as Blob, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Length': (fileData as Blob).size.toString(),
        },
      });
    } else {
      // CSV 파일 다운로드
      const csvBlob = new Blob([fileData as string], { type: 'text/csv;charset=utf-8;' });
      return new NextResponse(csvBlob, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Length': csvBlob.size.toString(),
        },
      });
    }
  } catch (error) {
    console.error('Export API Error:', error);
    return NextResponse.json(
      { error: '내보내기 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

