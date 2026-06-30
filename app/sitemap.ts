import type { MetadataRoute } from 'next';

// layout.tsx와 동일한 기준 주소 (env 미설정 시 haru1sojae.kr)
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://haru1sojae.kr';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const route = (
    path: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
  ) => ({ url: `${SITE_URL}${path}`, lastModified: now, changeFrequency, priority });

  return [
    route('', 1.0, 'weekly'),        // 홈
    route('/table', 0.9, 'weekly'),  // 효율표
    route('/cont', 0.8, 'weekly'),   // 경험치 콘텐츠
    route('/exp', 0.8, 'monthly'),   // 경험치 정보
    route('/hunt', 0.8, 'weekly'),   // 사냥터
    route('/info', 0.6, 'weekly'),   // 정보 센터
    route('/privacy', 0.2, 'yearly'),// 개인정보처리방침
  ];
}
