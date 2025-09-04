'use client';

import { AccessibilityTester } from '@/components/accessibility/AccessibilityTester';

export default function AccessibilityPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">접근성 테스트</h1>
        <p className="text-gray-600">
          웹 애플리케이션의 접근성을 테스트하고 개선할 수 있는 도구입니다.
        </p>
      </div>
      
      <AccessibilityTester />
      
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">접근성 개선 사항</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">✅ 완료된 개선사항</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• ARIA 속성 및 역할 정의</li>
              <li>• 키보드 내비게이션 지원</li>
              <li>• 포커스 관리 및 표시</li>
              <li>• 색상 대비 검증</li>
              <li>• 스크린 리더 지원</li>
              <li>• 반응형 디자인</li>
              <li>• 터치 타겟 최소 크기</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">🔧 추가 개선 방향</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 자동 접근성 검사 도구 연동</li>
              <li>• Lighthouse 접근성 점수 측정</li>
              <li>• 실제 사용자 테스트</li>
              <li>• 접근성 문서화</li>
              <li>• 지속적인 모니터링</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

