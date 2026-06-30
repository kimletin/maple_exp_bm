import { NextRequest, NextResponse } from 'next/server';

// 인메모리 IP 레이트리밋 (과속방지턱 수준).
// 서버리스/엣지는 인스턴스마다 메모리가 분리되므로 작정한 분산 공격은 막지 못하지만,
// 캐주얼한 남용·스크립트성 폭주(초당 수십~수백 호출)는 차단한다.
// 더 강한 보호가 필요하면 Upstash Redis 등 외부 저장소 기반으로 승급할 것.
// (Next 16: middleware → proxy 컨벤션)

const WINDOW_MS = 10_000;   // 10초 창
const MAX_REQUESTS = 60;    // IP당 10초에 60회 (정상 사용: 6슬롯 일괄갱신 ~24회 << 60)

const hits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    // 만료된 엔트리 정리(메모리 누수 방지)
    if (hits.size > 5000) {
      for (const [k, v] of hits) if (now > v.resetAt) hits.delete(k);
    }
    return false;
  }
  entry.count++;
  return entry.count > MAX_REQUESTS;
}

export function proxy(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요' },
      { status: 429, headers: { 'Retry-After': '10' } }
    );
  }
  return NextResponse.next();
}

// API 라우트에만 적용
export const config = {
  matcher: '/api/:path*',
};
