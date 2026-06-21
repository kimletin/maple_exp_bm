// 모달 오픈 시 배경 스크롤 잠금 + 스크롤바 폭만큼 보정해 레이아웃 밀림 방지
export function lockScroll() {
  const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  // 스크롤바가 있었을 때만 그 폭만큼 보정 (없으면 보정 안 해서 띠가 안 생김)
  if (scrollbarW > 0) document.body.style.paddingRight = `${scrollbarW}px`;
}

export function unlockScroll() {
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
}
