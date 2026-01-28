import type { LotteryType, SuperLottoRecord, SSQRecord, UserSelection, WinningResult } from './types';

// 大乐透奖级判定
function getSuperLottoLevel(mainHit: number, specHit: number): number {
  if (mainHit === 5 && specHit === 2) return 1;
  if (mainHit === 5 && specHit === 1) return 2;
  if (mainHit === 5 && specHit === 0) return 3;
  if (mainHit === 4 && specHit === 2) return 4;
  if (mainHit === 4 && specHit === 1) return 5;
  if (mainHit === 3 && specHit === 2) return 6;
  if (mainHit === 4 && specHit === 0) return 7;
  if ((mainHit === 3 && specHit === 1) || (mainHit === 2 && specHit === 2)) return 8;
  if ((mainHit === 3 && specHit === 0) || (mainHit === 2 && specHit === 1) ||
      (mainHit === 1 && specHit === 2) || (mainHit === 0 && specHit === 2)) return 9;
  return 0;
}

// 双色球奖级判定
function getSSQLevel(mainHit: number, specHit: number): number {
  if (mainHit === 6 && specHit === 1) return 1;
  if (mainHit === 6 && specHit === 0) return 2;
  if (mainHit === 5 && specHit === 1) return 3;
  if ((mainHit === 5 && specHit === 0) || (mainHit === 4 && specHit === 1)) return 4;
  if ((mainHit === 4 && specHit === 0) || (mainHit === 3 && specHit === 1)) return 5;
  if (specHit === 1 && mainHit <= 2) return 6;
  return 0;
}

// 组合生成：从 arr 中选 k 个
function combinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  const [first, ...rest] = arr;
  const withFirst = combinations(rest, k - 1).map(c => [first, ...c]);
  const withoutFirst = combinations(rest, k);
  return [...withFirst, ...withoutFirst];
}

// 展开用户选号为所有组合
export function expandSelection(
  type: LotteryType,
  selection: UserSelection
): { main: number[]; special: number[] }[] {
  const mainCount = type === 'super_lotto' ? 5 : 6;
  const specCount = type === 'super_lotto' ? 2 : 1;

  if (selection.mode === 'dantuo') {
    const mainDan = selection.mainDan || [];
    const mainTuo = selection.mainTuo || [];
    const specDan = selection.specialDan || [];
    const specTuo = selection.specialTuo || [];

    const mainCombos = combinations(mainTuo, mainCount - mainDan.length)
      .map(tuo => [...mainDan, ...tuo].sort((a, b) => a - b));

    let specCombos: number[][];
    if (type === 'ssq') {
      // 双色球蓝球：胆码+拖码组合，或直接多选
      if (specDan.length > 0) {
        specCombos = specTuo.length > 0
          ? combinations(specTuo, specCount - specDan.length).map(t => [...specDan, ...t])
          : [specDan];
      } else {
        specCombos = specTuo.length > 0 ? specTuo.map(n => [n]) : [];
      }
    } else {
      specCombos = combinations(specTuo, specCount - specDan.length)
        .map(tuo => [...specDan, ...tuo].sort((a, b) => a - b));
    }

    const result: { main: number[]; special: number[] }[] = [];
    for (const main of mainCombos) {
      for (const special of specCombos) {
        result.push({ main, special });
      }
    }
    return result;
  }

  // 单式或复式
  const mainBalls = selection.main || [];
  const specBalls = selection.special || [];

  const mainCombos = mainBalls.length <= mainCount
    ? [mainBalls]
    : combinations(mainBalls, mainCount);

  let specCombos: number[][];
  if (type === 'ssq') {
    specCombos = specBalls.map(n => [n]);
  } else {
    specCombos = specBalls.length <= specCount
      ? [specBalls]
      : combinations(specBalls, specCount);
  }

  const result: { main: number[]; special: number[] }[] = [];
  for (const main of mainCombos) {
    for (const special of specCombos) {
      result.push({ main: main.sort((a, b) => a - b), special: special.sort((a, b) => a - b) });
    }
  }
  return result;
}

// 计算单注与单期的中奖情况
function checkSingle(
  type: LotteryType,
  userMain: number[],
  userSpecial: number[],
  record: SuperLottoRecord | SSQRecord
): { level: number; mainHit: number; specialHit: number } {
  if (type === 'super_lotto') {
    const r = record as SuperLottoRecord;
    const mainHit = userMain.filter(n => r.front_balls.includes(n)).length;
    const specHit = userSpecial.filter(n => r.back_balls.includes(n)).length;
    return { level: getSuperLottoLevel(mainHit, specHit), mainHit, specialHit: specHit };
  } else {
    const r = record as SSQRecord;
    const mainHit = userMain.filter(n => r.red_balls.includes(n)).length;
    const specHit = userSpecial.includes(r.blue_ball) ? 1 : 0;
    return { level: getSSQLevel(mainHit, specHit), mainHit, specialHit: specHit };
  }
}

// 批量计算中奖结果
export function calculateResults(
  type: LotteryType,
  selection: UserSelection,
  records: (SuperLottoRecord | SSQRecord)[]
): WinningResult[] {
  const combos = expandSelection(type, selection);
  const results: WinningResult[] = [];

  for (const record of records) {
    let bestResult: WinningResult | null = null;

    for (const combo of combos) {
      const { level, mainHit, specialHit } = checkSingle(type, combo.main, combo.special, record);
      if (level > 0) {
        if (!bestResult || level < bestResult.level) {
          bestResult = {
            record,
            level,
            mainHit,
            specialHit,
            userMain: combo.main,
            userSpecial: combo.special,
          };
        }
      }
    }

    if (bestResult) {
      results.push(bestResult);
    }
  }

  // 排序：先按奖级升序，再按日期倒序
  results.sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    return b.record.date.localeCompare(a.record.date);
  });

  return results;
}

// 获取奖级名称
export function getLevelName(type: LotteryType, level: number): string {
  if (level === 0) return '未中奖';
  const names = ['', '一等奖', '二等奖', '三等奖', '四等奖', '五等奖', '六等奖', '七等奖', '八等奖', '九等奖'];
  return names[level] || `${level}等奖`;
}
