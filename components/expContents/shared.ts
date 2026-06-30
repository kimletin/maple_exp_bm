// 경험치 콘텐츠 표 공용 — pctNoSign 헬퍼 + 공용 타입.
import { LEVEL_EXP } from '@/data/levelExp';

// 퍼센트 표시 (메인 값)
export function pctNoSign(exp: number, level: number) {
  const req = LEVEL_EXP[level]?.required;
  if (!req) return '';
  return ((exp / req) * 100).toFixed(3) + '%';
}

export interface ExpTableProps {
  title: string;
  headerColor: string;
  titleColor: string;
  rows: { level: number; value: number; isMe: boolean; badgeColor: string; textColor: string; rowBg: string }[];
  levelLabel: string;
  valueLabel?: string;
}

export interface BonusEntry { name: string; pct: number; }
