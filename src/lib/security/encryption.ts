/**
 * 데이터 암호화 유틸리티
 * 민감한 데이터의 암호화 및 복호화를 위한 함수들
 */

import { createClient } from '@/lib/supabase/client';

// 암호화 키 관리
const ENCRYPTION_KEY_SIZE = 32; // 256 bits
const IV_SIZE = 16; // 128 bits

// 환경 변수에서 암호화 키 가져오기
function getEncryptionKey(): string {
  const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 
              process.env.DATABASE_ENCRYPTION_KEY || 
              'default-encryption-key-32-chars-long';
  
  // 키 길이가 부족한 경우 패딩
  if (key.length < ENCRYPTION_KEY_SIZE) {
    return key.padEnd(ENCRYPTION_KEY_SIZE, '0');
  }
  
  // 키 길이가 초과하는 경우 자르기
  return key.substring(0, ENCRYPTION_KEY_SIZE);
}

// 클라이언트 사이드 암호화 (Web Crypto API 사용)
export async function encryptDataClient(data: string): Promise<string> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('클라이언트 사이드에서만 사용 가능합니다');
    }

    const encoder = new TextEncoder();
    const keyData = encoder.encode(getEncryptionKey());
    
    // 암호화 키 생성
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );

    // 초기화 벡터 생성
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_SIZE));
    
    // 데이터 암호화
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      encoder.encode(data)
    );

    // IV와 암호화된 데이터를 결합하여 Base64로 인코딩
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('클라이언트 암호화 오류:', error);
    throw new Error('데이터 암호화에 실패했습니다');
  }
}

// 클라이언트 사이드 복호화
export async function decryptDataClient(encryptedData: string): Promise<string> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('클라이언트 사이드에서만 사용 가능합니다');
    }

    const decoder = new TextDecoder();
    const keyData = new TextEncoder().encode(getEncryptionKey());
    
    // 암호화 키 생성
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    // Base64 디코딩
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(char => char.charCodeAt(0))
    );

    // IV와 암호화된 데이터 분리
    const iv = combined.slice(0, IV_SIZE);
    const encrypted = combined.slice(IV_SIZE);

    // 데이터 복호화
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      encrypted
    );

    return decoder.decode(decrypted);
  } catch (error) {
    console.error('클라이언트 복호화 오류:', error);
    throw new Error('데이터 복호화에 실패했습니다');
  }
}

// 서버 사이드 암호화 (Supabase RPC 함수 사용)
export async function encryptDataServer(data: string): Promise<string> {
  try {
    const supabase = createClient();
    
    const { data: encryptedData, error } = await supabase.rpc(
      'encrypt_sensitive_data',
      {
        data: data,
        encryption_key: getEncryptionKey()
      }
    );

    if (error) {
      throw error;
    }

    return encryptedData;
  } catch (error) {
    console.error('서버 암호화 오류:', error);
    throw new Error('서버 암호화에 실패했습니다');
  }
}

// 서버 사이드 복호화
export async function decryptDataServer(encryptedData: string): Promise<string> {
  try {
    const supabase = createClient();
    
    const { data: decryptedData, error } = await supabase.rpc(
      'decrypt_sensitive_data',
      {
        encrypted_data: encryptedData,
        encryption_key: getEncryptionKey()
      }
    );

    if (error) {
      throw error;
    }

    return decryptedData;
  } catch (error) {
    console.error('서버 복호화 오류:', error);
    throw new Error('서버 복호화에 실패했습니다');
  }
}

// 하이브리드 암호화 (클라이언트에서 암호화 후 서버에서 추가 암호화)
export async function encryptDataHybrid(data: string): Promise<string> {
  try {
    // 1단계: 클라이언트에서 암호화
    const clientEncrypted = await encryptDataClient(data);
    
    // 2단계: 서버에서 추가 암호화
    const serverEncrypted = await encryptDataServer(clientEncrypted);
    
    return serverEncrypted;
  } catch (error) {
    console.error('하이브리드 암호화 오류:', error);
    throw new Error('하이브리드 암호화에 실패했습니다');
  }
}

// 하이브리드 복호화
export async function decryptDataHybrid(encryptedData: string): Promise<string> {
  try {
    // 1단계: 서버에서 복호화
    const serverDecrypted = await decryptDataServer(encryptedData);
    
    // 2단계: 클라이언트에서 복호화
    const clientDecrypted = await decryptDataClient(serverDecrypted);
    
    return clientDecrypted;
  } catch (error) {
    console.error('하이브리드 복호화 오류:', error);
    throw new Error('하이브리드 복호화에 실패했습니다');
  }
}

// 민감한 필드 암호화 함수
export async function encryptSensitiveFields<T extends Record<string, any>>(
  data: T,
  sensitiveFields: (keyof T)[],
  encryptionMethod: 'client' | 'server' | 'hybrid' = 'client'
): Promise<T> {
  try {
    const encryptedData = { ...data };
    
    for (const field of sensitiveFields) {
      if (data[field] && typeof data[field] === 'string') {
        let encryptedValue: string;
        
        switch (encryptionMethod) {
          case 'client':
            encryptedValue = await encryptDataClient(data[field]);
            break;
          case 'server':
            encryptedValue = await encryptDataServer(data[field]);
            break;
          case 'hybrid':
            encryptedValue = await encryptDataHybrid(data[field]);
            break;
          default:
            encryptedValue = await encryptDataClient(data[field]);
        }
        
        encryptedData[field] = encryptedValue;
      }
    }
    
    return encryptedData;
  } catch (error) {
    console.error('민감한 필드 암호화 오류:', error);
    throw new Error('민감한 필드 암호화에 실패했습니다');
  }
}

// 민감한 필드 복호화 함수
export async function decryptSensitiveFields<T extends Record<string, any>>(
  data: T,
  sensitiveFields: (keyof T)[],
  decryptionMethod: 'client' | 'server' | 'hybrid' = 'client'
): Promise<T> {
  try {
    const decryptedData = { ...data };
    
    for (const field of sensitiveFields) {
      if (data[field] && typeof data[field] === 'string') {
        let decryptedValue: string;
        
        switch (decryptionMethod) {
          case 'client':
            decryptedValue = await decryptDataClient(data[field]);
            break;
          case 'server':
            decryptedValue = await decryptDataServer(data[field]);
            break;
          case 'hybrid':
            decryptedValue = await decryptDataHybrid(data[field]);
            break;
          default:
            decryptedValue = await decryptDataClient(data[field]);
        }
        
        decryptedData[field] = decryptedValue;
      }
    }
    
    return decryptedData;
  } catch (error) {
    console.error('민감한 필드 복호화 오류:', error);
    throw new Error('민감한 필드 복호화에 실패했습니다');
  }
}

// 암호화 키 순환 함수
export async function rotateEncryptionKey(
  oldKey: string,
  newKey: string
): Promise<boolean> {
  try {
    const supabase = createClient();
    
    // 새로운 암호화 키로 기존 데이터 재암호화
    const { error } = await supabase.rpc(
      'rotate_encryption_key',
      {
        old_key: oldKey,
        new_key: newKey
      }
    );

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('암호화 키 순환 오류:', error);
    return false;
  }
}

// 암호화 상태 확인 함수
export function isDataEncrypted(data: string): boolean {
  try {
    // Base64 디코딩 시도
    const decoded = atob(data);
    const bytes = new Uint8Array(decoded.length);
    
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i);
    }
    
    // 최소 길이 확인 (IV + 암호화된 데이터)
    return bytes.length >= IV_SIZE + 16;
  } catch {
    return false;
  }
}

// 암호화 강도 테스트 함수
export async function testEncryptionStrength(): Promise<{
  clientEncryption: boolean;
  serverEncryption: boolean;
  hybridEncryption: boolean;
  keyStrength: number;
}> {
  const testData = 'test-encryption-data';
  const results = {
    clientEncryption: false,
    serverEncryption: false,
    hybridEncryption: false,
    keyStrength: 0
  };

  try {
    // 클라이언트 암호화 테스트
    const clientEncrypted = await encryptDataClient(testData);
    const clientDecrypted = await decryptDataClient(clientEncrypted);
    results.clientEncryption = clientDecrypted === testData;
  } catch (error) {
    console.error('클라이언트 암호화 테스트 실패:', error);
  }

  try {
    // 서버 암호화 테스트
    const serverEncrypted = await encryptDataServer(testData);
    const serverDecrypted = await decryptDataServer(serverEncrypted);
    results.serverEncryption = serverDecrypted === testData;
  } catch (error) {
    console.error('서버 암호화 테스트 실패:', error);
  }

  try {
    // 하이브리드 암호화 테스트
    const hybridEncrypted = await encryptDataHybrid(testData);
    const hybridDecrypted = await decryptDataHybrid(hybridEncrypted);
    results.hybridEncryption = hybridDecrypted === testData;
  } catch (error) {
    console.error('하이브리드 암호화 테스트 실패:', error);
  }

  // 키 강도 계산
  const key = getEncryptionKey();
  results.keyStrength = Math.min(
    100,
    Math.floor((key.length / ENCRYPTION_KEY_SIZE) * 100)
  );

  return results;
}

// 암호화 설정 유효성 검사
export function validateEncryptionConfig(): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  const key = getEncryptionKey();

  if (key === 'default-encryption-key-32-chars-long') {
    issues.push('기본 암호화 키를 사용하고 있습니다. 운영환경에서는 환경변수를 설정하세요.');
  }

  if (key.length < ENCRYPTION_KEY_SIZE) {
    issues.push(`암호화 키가 너무 짧습니다. 최소 ${ENCRYPTION_KEY_SIZE}자 필요합니다.`);
  }

  if (!process.env.NEXT_PUBLIC_ENCRYPTION_KEY && !process.env.DATABASE_ENCRYPTION_KEY) {
    issues.push('암호화 키 환경변수가 설정되지 않았습니다.');
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}

// 암호화 성능 측정
export async function measureEncryptionPerformance(
  dataSize: number = 1000,
  iterations: number = 100
): Promise<{
  clientTime: number;
  serverTime: number;
  hybridTime: number;
}> {
  const testData = 'a'.repeat(dataSize);
  const results = {
    clientTime: 0,
    serverTime: 0,
    hybridTime: 0
  };

  // 클라이언트 암호화 성능 측정
  const clientStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    try {
      await encryptDataClient(testData);
    } catch (error) {
      console.error('클라이언트 암호화 성능 측정 오류:', error);
    }
  }
  results.clientTime = performance.now() - clientStart;

  // 서버 암호화 성능 측정
  const serverStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    try {
      await encryptDataServer(testData);
    } catch (error) {
      console.error('서버 암호화 성능 측정 오류:', error);
    }
  }
  results.serverTime = performance.now() - serverStart;

  // 하이브리드 암호화 성능 측정
  const hybridStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    try {
      await encryptDataHybrid(testData);
    } catch (error) {
      console.error('하이브리드 암호화 성능 측정 오류:', error);
    }
  }
  results.hybridTime = performance.now() - hybridStart;

  return results;
}

