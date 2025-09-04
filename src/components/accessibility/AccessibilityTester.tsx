'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  EyeOff, 
  Volume2, 
  VolumeX, 
  MousePointer, 
  Keyboard, 
  Smartphone,
  Monitor,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { validateAccessibilityColors } from '@/lib/design-tokens';

interface AccessibilityTestResult {
  test: string;
  passed: boolean;
  message: string;
  details?: string;
}

export function AccessibilityTester() {
  const [testResults, setTestResults] = useState<AccessibilityTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // 접근성 테스트 실행
  const runAccessibilityTests = () => {
    setIsRunning(true);
    const results: AccessibilityTestResult[] = [];

    // 1. 색상 대비 테스트
    try {
      const contrastTest = validateAccessibilityColors('#000000', '#FFFFFF');
      results.push({
        test: '색상 대비',
        passed: contrastTest.isValid,
        message: contrastTest.message,
        details: `대비율: ${contrastTest.contrastRatio.toFixed(2)}`
      });
    } catch (error) {
      results.push({
        test: '색상 대비',
        passed: false,
        message: '테스트 실행 실패',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }

    // 2. 포커스 관리 테스트
    const focusableElements = document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const hasFocusableElements = focusableElements.length > 0;
    results.push({
      test: '포커스 가능 요소',
      passed: hasFocusableElements,
      message: hasFocusableElements ? '포커스 가능한 요소가 존재합니다' : '포커스 가능한 요소가 없습니다',
      details: `${focusableElements.length}개의 포커스 가능 요소 발견`
    });

    // 3. ARIA 속성 테스트
    const ariaElements = document.querySelectorAll('[aria-label], [aria-describedby], [role]');
    const hasAriaAttributes = ariaElements.length > 0;
    results.push({
      test: 'ARIA 속성',
      passed: hasAriaAttributes,
      message: hasAriaAttributes ? 'ARIA 속성이 설정되어 있습니다' : 'ARIA 속성이 설정되지 않았습니다',
      details: `${ariaElements.length}개의 ARIA 속성 발견`
    });

    // 4. 이미지 대체 텍스트 테스트
    const images = document.querySelectorAll('img');
    const imagesWithAlt = Array.from(images).filter(img => img.alt && img.alt.trim() !== '');
    const allImagesHaveAlt = images.length === 0 || imagesWithAlt.length === images.length;
    results.push({
      test: '이미지 대체 텍스트',
      passed: allImagesHaveAlt,
      message: allImagesHaveAlt ? '모든 이미지에 대체 텍스트가 있습니다' : '일부 이미지에 대체 텍스트가 없습니다',
      details: `${imagesWithAlt.length}/${images.length} 이미지에 대체 텍스트 있음`
    });

    // 5. 키보드 접근성 테스트
    const interactiveElements = document.querySelectorAll('button, [role="button"], a, input, select, textarea');
    const hasKeyboardHandlers = Array.from(interactiveElements).some(el => 
      (el as HTMLElement).onkeydown !== null || (el as HTMLElement).onkeyup !== null || (el as HTMLElement).onkeypress !== null
    );
    results.push({
      test: '키보드 이벤트 핸들러',
      passed: hasKeyboardHandlers || interactiveElements.length === 0,
      message: hasKeyboardHandlers ? '키보드 이벤트 핸들러가 설정되어 있습니다' : '키보드 이벤트 핸들러가 부족합니다',
      details: `${interactiveElements.length}개의 상호작용 요소`
    });

    // 6. 반응형 디자인 테스트
    const viewport = window.innerWidth;
    const isResponsive = viewport >= 375; // 모바일 최소 너비
    results.push({
      test: '반응형 디자인',
      passed: isResponsive,
      message: isResponsive ? '최소 뷰포트 너비를 만족합니다' : '최소 뷰포트 너비를 만족하지 않습니다',
      details: `현재 뷰포트: ${viewport}px`
    });

    setTestResults(results);
    setIsRunning(false);
  };

  // 고대비 모드 토글
  const toggleHighContrast = () => {
    setHighContrastMode(!highContrastMode);
    document.documentElement.classList.toggle('high-contrast');
  };

  // 모션 감소 모드 토글
  const toggleReducedMotion = () => {
    setReducedMotion(!reducedMotion);
    document.documentElement.classList.toggle('reduced-motion');
  };

  // 접근성 점수 계산
  const calculateScore = () => {
    if (testResults.length === 0) return 0;
    const passedTests = testResults.filter(result => result.passed).length;
    return Math.round((passedTests / testResults.length) * 100);
  };

  const score = calculateScore();
  const scoreColor = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            접근성 테스터
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 제어 버튼들 */}
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={runAccessibilityTests}
              disabled={isRunning}
              variant="default"
              size="sm"
            >
              {isRunning ? '테스트 중...' : '접근성 테스트 실행'}
            </Button>
            
            <Button 
              onClick={toggleHighContrast}
              variant={highContrastMode ? "default" : "outline"}
              size="sm"
              className="gap-2"
            >
              {highContrastMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              고대비 모드
            </Button>
            
            <Button 
              onClick={toggleReducedMotion}
              variant={reducedMotion ? "default" : "outline"}
              size="sm"
              className="gap-2"
            >
              {reducedMotion ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              모션 감소
            </Button>
          </div>

          {/* 접근성 점수 */}
          {testResults.length > 0 && (
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">
                접근성 점수: <span className={scoreColor}>{score}점</span>
              </div>
              <div className="flex gap-2">
                <Badge variant={score >= 80 ? "default" : score >= 60 ? "secondary" : "destructive"}>
                  {score >= 80 ? '우수' : score >= 60 ? '보통' : '개선 필요'}
                </Badge>
              </div>
            </div>
          )}

          {/* 테스트 결과 */}
          {testResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">테스트 결과</h3>
              {testResults.map((result, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result.passed 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {result.passed ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="font-medium">{result.test}</span>
                    </div>
                    <Badge variant={result.passed ? "default" : "destructive"}>
                      {result.passed ? '통과' : '실패'}
                    </Badge>
                  </div>
                  <p className="text-sm mt-1">{result.message}</p>
                  {result.details && (
                    <p className="text-xs text-muted-foreground mt-1">{result.details}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 접근성 가이드라인 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">접근성 가이드라인</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 모든 상호작용 요소는 키보드로 접근 가능해야 합니다</li>
              <li>• 충분한 색상 대비를 제공해야 합니다 (WCAG AA 기준: 4.5:1)</li>
              <li>• 모든 이미지에는 적절한 대체 텍스트가 있어야 합니다</li>
              <li>• 포커스 표시가 명확해야 합니다</li>
              <li>• 스크린 리더 사용자를 위한 ARIA 속성을 제공해야 합니다</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
