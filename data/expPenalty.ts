// 경험치 패널티 — 표시(label/value/note)와 계산(penalty)을 한곳에서 관리하는 단일 출처.
// diff = 캐릭터 레벨 - 몬스터 레벨. 넥슨이 수치를 바꾸면 이 파일만 고치면 된다.

export interface PenaltySegment {
  label: string;                      // 표시: 레벨 차이 범위
  value: string;                      // 표시: 경험치 배율
  note?: string;                      // 표시: 비고
  test: (diff: number) => boolean;    // 이 구간에 해당하는지 (범위 겹침 없음)
  penalty: (diff: number) => number;  // 사냥터 효율 계산용 경험치 배율
}

export const PENALTY_SEGMENTS: PenaltySegment[] = [
  { label: '40 이상',   value: '0.70배',          test: d => d >= 40,              penalty: () => 0.70 },
  { label: '39 ~ 21',   value: '0.71배 ~ 0.89배', note: '1레벨 당 0.01씩 증가', test: d => d >= 21 && d <= 39,  penalty: d => 0.71 + (39 - d) * 0.01 },
  { label: '20 ~ 19',   value: '0.95배',          test: d => d >= 19 && d <= 20,   penalty: () => 0.95 },
  { label: '18 ~ 17',   value: '0.96배',          test: d => d >= 17 && d <= 18,   penalty: () => 0.96 },
  { label: '16 ~ 15',   value: '0.97배',          test: d => d >= 15 && d <= 16,   penalty: () => 0.97 },
  { label: '14 ~ 13',   value: '0.98배',          test: d => d >= 13 && d <= 14,   penalty: () => 0.98 },
  { label: '12 ~ 11',   value: '0.99배',          test: d => d >= 11 && d <= 12,   penalty: () => 0.99 },
  { label: '10',        value: '1.00배',          test: d => d === 10,             penalty: () => 1.00 },
  { label: '9 ~ 5',     value: '1.05배',          test: d => d >= 5 && d <= 9,     penalty: () => 1.05 },
  { label: '4 ~ 2',     value: '1.10배',          test: d => d >= 2 && d <= 4,     penalty: () => 1.10 },
  { label: '1 ~ -1',    value: '1.20배',          note: '최대 배율',            test: d => d >= -1 && d <= 1,    penalty: () => 1.20 },
  { label: '-2 ~ -4',   value: '1.10배',          test: d => d >= -4 && d <= -2,   penalty: () => 1.10 },
  { label: '-5 ~ -9',   value: '1.05배',          test: d => d >= -9 && d <= -5,   penalty: () => 1.05 },
  { label: '-10 ~ -20', value: '1.00배 ~ 0.90배', note: '1레벨 당 0.01씩 감소', test: d => d >= -20 && d <= -10, penalty: d => 1.00 + (d + 10) * 0.01 },
  { label: '-21 ~ -35', value: '0.70배 ~ 0.14배', note: '1레벨 당 0.04씩 감소', test: d => d >= -35 && d <= -21, penalty: d => 0.70 + (d + 21) * 0.04 },
  { label: '-36 이하',  value: '0.10배',          test: d => d <= -36 && d >= -39, penalty: () => 0.10 },
  { label: '-40 이하',  value: '최대 100',        test: d => d <= -40,             penalty: () => 0 },
];

// 레벨 차이에 따른 경험치 배율 (사냥터 효율 계산용). 위 표에서 파생된다.
export function getExpPenalty(diff: number): number {
  return PENALTY_SEGMENTS.find(s => s.test(diff))?.penalty(diff) ?? 0;
}
