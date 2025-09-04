'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateSelectorProps {
  year: number;
  month: number;
  onDateChange: (year: number, month: number) => void;
}

export default function DateSelector({ year, month, onDateChange }: DateSelectorProps) {
  const [selectedYear, setSelectedYear] = useState(year);
  const [selectedMonth, setSelectedMonth] = useState(month);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleYearChange = (newYear: string) => {
    const yearNum = parseInt(newYear);
    setSelectedYear(yearNum);
    onDateChange(yearNum, selectedMonth);
  };

  const handleMonthChange = (newMonth: string) => {
    const monthNum = parseInt(newMonth);
    setSelectedMonth(monthNum);
    onDateChange(selectedYear, monthNum);
  };

  const goToPreviousMonth = () => {
    let newYear = selectedYear;
    let newMonth = selectedMonth - 1;
    
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    
    setSelectedYear(newYear);
    setSelectedMonth(newMonth);
    onDateChange(newYear, newMonth);
  };

  const goToNextMonth = () => {
    let newYear = selectedYear;
    let newMonth = selectedMonth + 1;
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    
    setSelectedYear(newYear);
    setSelectedMonth(newMonth);
    onDateChange(newYear, newMonth);
  };

  const goToCurrentMonth = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    setSelectedYear(currentYear);
    setSelectedMonth(currentMonth);
    onDateChange(currentYear, currentMonth);
  };

  const getMonthName = (month: number) => {
    const monthNames = [
      '1월', '2월', '3월', '4월', '5월', '6월',
      '7월', '8월', '9월', '10월', '11월', '12월'
    ];
    return monthNames[month - 1];
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg border shadow-sm">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-gray-600" />
        <span className="font-medium text-gray-700">날짜 선택</span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousMonth}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="w-24 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}년
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedMonth.toString()} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m} value={m.toString()}>
                  {getMonthName(m)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={goToNextMonth}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={goToCurrentMonth}
        className="text-xs"
      >
        이번 달
      </Button>
    </div>
  );
}
