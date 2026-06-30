import type { MetadataRoute } from 'next';

// 검색엔진 크롤러 안내(착한 크롤러 한정, 강제력 없음).
// /api/ 는 막아 크롤러가 NEXON 호출·함수 호출을 유발하지 않게 한다.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
  };
}
