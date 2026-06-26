import { NextResponse } from 'next/server';

// NEXON 메이플 Open API 공지 계열. 표시용(제목/날짜/링크)만 추출 → 본문 미저장(약관 안전).
const ENDPOINTS = [
  { id: 'notice', url: 'https://open.api.nexon.com/maplestory/v1/notice', listKey: 'notice' },
  { id: 'update', url: 'https://open.api.nexon.com/maplestory/v1/notice-update', listKey: 'update_notice' },
  { id: 'event', url: 'https://open.api.nexon.com/maplestory/v1/notice-event', listKey: 'event_notice' },
] as const;

const MAX_ITEMS = 15;

interface NexonNotice {
  title?: string;
  url?: string;
  date?: string;
  thumbnail_url?: string;
}

// '2026-06-26T14:00+09:00' → '2026.06.26.'
function formatDate(iso: string): string {
  const parts = iso.slice(0, 10).split('-');
  return parts.length === 3 ? `${parts[0]}.${parts[1]}.${parts[2]}.` : iso;
}

async function fetchNotice(url: string, listKey: string, apiKey: string) {
  try {
    // next.revalidate로 Vercel Data Cache에 30분 캐시 → 방문자 수와 무관하게 호출 고정.
    const res = await fetch(url, {
      headers: { 'x-nxopen-api-key': apiKey },
      next: { revalidate: 1800 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const list: NexonNotice[] = Array.isArray(json?.[listKey]) ? json[listKey] : [];
    return list.slice(0, MAX_ITEMS).map((it) => ({
      title: it.title ?? '',
      url: it.url ?? '',
      date: formatDate(it.date ?? ''),
      thumbnail: it.thumbnail_url ?? '',
    }));
  } catch {
    return [];
  }
}

// 빈 결과(넥슨 점검 등)는 캐시에 저장하지 않음(no-store) → CDN은 마지막 정상본을 계속 제공.
const EMPTY_RESPONSE = { error: 'no data', notice: [], update: [], event: [] } as const;
const EMPTY_HEADERS = { 'Cache-Control': 'no-store' };

export async function GET() {
  const apiKey = process.env.NEXON_API_KEY;
  if (!apiKey) {
    return NextResponse.json(EMPTY_RESPONSE, { status: 503, headers: EMPTY_HEADERS });
  }

  const [notice, update, event] = await Promise.all(
    ENDPOINTS.map((e) => fetchNotice(e.url, e.listKey, apiKey))
  );

  // 넥슨 점검 등으로 전부 비면 503 + no-store. CDN이 덮어쓰지 않고(stale-if-error)
  // 마지막 정상본을 계속 보여줌. 한 번이라도 정상이면 30분 캐시 + 만료 후 백그라운드 갱신.
  const hasData = notice.length > 0 || update.length > 0 || event.length > 0;
  if (!hasData) {
    return NextResponse.json(EMPTY_RESPONSE, { status: 503, headers: EMPTY_HEADERS });
  }

  return NextResponse.json(
    { notice, update, event },
    { headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400, stale-if-error=86400' } }
  );
}
