'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, BarChart3, Share2, CreditCard, PiggyBank, Eye, Home, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();

  const handleHomeClick = () => {
    router.push('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">자산 대시보드</h1>
              <p className="text-sm text-gray-600">가계 재무 현황 관리</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={handleHomeClick}
            >
              <Home className="h-4 w-4" />
              홈
            </Button>
            <Link href="/dashboard/summary">
              <Button variant="outline" size="sm" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                대시보드
              </Button>
            </Link>
            <Link href="/accounts/2025/9">
              <Button variant="outline" size="sm" className="gap-2">
                <CreditCard className="h-4 w-4" />
                통장 현황
              </Button>
            </Link>
            <Link href="/savings/2025/9">
              <Button variant="outline" size="sm" className="gap-2">
                <PiggyBank className="h-4 w-4" />
                저축 현황
              </Button>
            </Link>
            <Link href="/fixed-expenses/2025/9">
              <Button variant="outline" size="sm" className="gap-2">
                <Calendar className="h-4 w-4" />
                고정 지출
              </Button>
            </Link>
            <Link href="/accessibility">
              <Button variant="outline" size="sm" className="gap-2">
                <Eye className="h-4 w-4" />
                접근성
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              공유
            </Button>
            <Button size="sm" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              데이터 입력
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

