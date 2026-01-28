export type LotteryType = 'super_lotto' | 'ssq';
export type BetMode = 'single' | 'multiple' | 'dantuo';

export interface SuperLottoRecord {
  period: string;
  date: string;
  front_balls: number[];
  back_balls: number[];
}

export interface SSQRecord {
  period: string;
  date: string;
  red_balls: number[];
  blue_ball: number;
}

export interface UserSelection {
  mode: BetMode;
  main?: number[];
  special?: number[];
  mainDan?: number[];
  mainTuo?: number[];
  specialDan?: number[];
  specialTuo?: number[];
}

export interface WinningResult {
  record: SuperLottoRecord | SSQRecord;
  level: number;
  mainHit: number;
  specialHit: number;
  userMain: number[];
  userSpecial: number[];
}
