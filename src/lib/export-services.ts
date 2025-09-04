'use client';

import jsPDF from 'jspdf';
import Papa from 'papaparse';
import type { MonthlyIncome, MonthlyExpenses, Account, MonthlySummary } from '@/types/dashboard';

// PDF 생성 서비스
export class PDFExportService {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF();
  }

  // 월별 요약 리포트 PDF 생성
  generateMonthlyReport(data: MonthlySummary): Blob {
    this.doc = new jsPDF();
    
    // 제목
    this.doc.setFontSize(20);
    this.doc.text(`${data.year}년 ${data.month}월 재무 요약 리포트`, 20, 20);
    
    // 수입 정보
    this.doc.setFontSize(14);
    this.doc.text('수입 현황', 20, 40);
    this.doc.setFontSize(12);
    this.doc.text(`경훈 월급: ${data.income.경훈_월급.toLocaleString()}원`, 20, 55);
    this.doc.text(`선화 월급: ${data.income.선화_월급.toLocaleString()}원`, 20, 65);
    this.doc.text(`기타 수입: ${data.income.other_income.toLocaleString()}원`, 20, 75);
    this.doc.text(`총 수입: ${data.total_income.toLocaleString()}원`, 20, 85);
    
    // 지출 정보
    this.doc.setFontSize(14);
    this.doc.text('지출 현황', 20, 105);
    this.doc.setFontSize(12);
    this.doc.text(`주거비: ${data.expenses.housing.toLocaleString()}원`, 20, 120);
    this.doc.text(`식비: ${data.expenses.food.toLocaleString()}원`, 20, 130);
    this.doc.text(`교통비: ${data.expenses.transportation.toLocaleString()}원`, 20, 140);
    this.doc.text(`공과금: ${data.expenses.utilities.toLocaleString()}원`, 20, 150);
    this.doc.text(`의료비: ${data.expenses.healthcare.toLocaleString()}원`, 20, 160);
    this.doc.text(`여가비: ${data.expenses.entertainment.toLocaleString()}원`, 20, 170);
    this.doc.text(`기타 지출: ${data.expenses.other_expenses.toLocaleString()}원`, 20, 180);
    this.doc.text(`총 지출: ${data.total_expenses.toLocaleString()}원`, 20, 190);
    
    // 저축 정보
    this.doc.setFontSize(14);
    this.doc.text('저축 현황', 20, 210);
    this.doc.setFontSize(12);
    this.doc.text(`총 저축: ${data.total_savings.toLocaleString()}원`, 20, 225);
    this.doc.text(`저축률: ${data.savings_rate.toFixed(1)}%`, 20, 235);
    
    // 생성일시
    this.doc.setFontSize(10);
    this.doc.text(`생성일시: ${new Date().toLocaleString('ko-KR')}`, 20, 250);
    
    return this.doc.output('blob');
  }

  // 통장 잔액 리포트 PDF 생성
  generateAccountReport(accounts: Account[]): Blob {
    this.doc = new jsPDF();
    
    // 제목
    this.doc.setFontSize(20);
    this.doc.text('통장/계좌별 잔액 현황', 20, 20);
    
    // 계좌 정보
    this.doc.setFontSize(14);
    this.doc.text('계좌 현황', 20, 40);
    
    let yPosition = 55;
    accounts.forEach((account, index) => {
      if (yPosition > 250) {
        this.doc.addPage();
        yPosition = 20;
      }
      
      this.doc.setFontSize(12);
      this.doc.text(`${account.account_name} (${account.account_type})`, 20, yPosition);
      this.doc.text(`${account.balance.toLocaleString()}원`, 120, yPosition);
      yPosition += 15;
    });
    
    // 총 잔액
    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
    this.doc.setFontSize(14);
    this.doc.text('총 잔액', 20, yPosition + 10);
    this.doc.text(`${totalBalance.toLocaleString()}원`, 120, yPosition + 10);
    
    // 생성일시
    this.doc.setFontSize(10);
    this.doc.text(`생성일시: ${new Date().toLocaleString('ko-KR')}`, 20, 250);
    
    return this.doc.output('blob');
  }
}

// CSV 생성 서비스
export class CSVExportService {
  // 월별 수입/지출 CSV 생성
  generateMonthlyCSV(data: MonthlySummary): string {
    const csvData = [
      {
        구분: '수입',
        항목: '경훈 월급',
        금액: data.income.경훈_월급,
        비고: ''
      },
      {
        구분: '수입',
        항목: '선화 월급',
        금액: data.income.선화_월급,
        비고: ''
      },
      {
        구분: '수입',
        항목: '기타 수입',
        금액: data.income.other_income,
        비고: ''
      },
      {
        구분: '수입',
        항목: '총 수입',
        금액: data.total_income,
        비고: ''
      },
      {
        구분: '지출',
        항목: '주거비',
        금액: data.expenses.housing,
        비고: ''
      },
      {
        구분: '지출',
        항목: '식비',
        금액: data.expenses.food,
        비고: ''
      },
      {
        구분: '지출',
        항목: '교통비',
        금액: data.expenses.transportation,
        비고: ''
      },
      {
        구분: '지출',
        항목: '공과금',
        금액: data.expenses.utilities,
        비고: ''
      },
      {
        구분: '지출',
        항목: '의료비',
        금액: data.expenses.healthcare,
        비고: ''
      },
      {
        구분: '지출',
        항목: '여가비',
        금액: data.expenses.entertainment,
        비고: ''
      },
      {
        구분: '지출',
        항목: '기타 지출',
        금액: data.expenses.other_expenses,
        비고: ''
      },
      {
        구분: '지출',
        항목: '총 지출',
        금액: data.total_expenses,
        비고: ''
      },
      {
        구분: '저축',
        항목: '총 저축',
        금액: data.total_savings,
        비고: ''
      },
      {
        구분: '저축',
        항목: '저축률',
        금액: data.savings_rate,
        비고: '%'
      }
    ];

    return Papa.unparse(csvData);
  }

  // 통장 잔액 CSV 생성
  generateAccountCSV(accounts: Account[]): string {
    const csvData = accounts.map(account => ({
      계좌명: account.account_name,
      계좌유형: account.account_type,
      잔액: account.balance,
      통화: account.currency,
      활성상태: account.is_active ? '활성' : '비활성'
    }));

    return Papa.unparse(csvData);
  }
}

// 데이터 포맷팅 유틸리티
export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('ko-KR');
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('ko-KR');
};

