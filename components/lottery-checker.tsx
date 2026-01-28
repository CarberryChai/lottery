'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { BallSelector } from '@/components/ball-selector';
import { DanTuoSelector } from '@/components/dantuo-selector';
import { ResultTable } from '@/components/result-table';
import type { LotteryType, BetMode, UserSelection, SuperLottoRecord, SSQRecord } from '@/lib/types';
import { calculateResults } from '@/lib/lottery-engine';

interface LotteryCheckerProps {
  superLottoData: SuperLottoRecord[];
  ssqData: SSQRecord[];
}

export function LotteryChecker({ superLottoData, ssqData }: LotteryCheckerProps) {
  const [lotteryType, setLotteryType] = useState<LotteryType>('super_lotto');
  const [betMode, setBetMode] = useState<BetMode>('single');

  // 单式/复式选号
  const [mainBalls, setMainBalls] = useState<number[]>([]);
  const [specialBalls, setSpecialBalls] = useState<number[]>([]);

  // 胆拖选号
  const [mainDan, setMainDan] = useState<number[]>([]);
  const [mainTuo, setMainTuo] = useState<number[]>([]);
  const [specialDan, setSpecialDan] = useState<number[]>([]);
  const [specialTuo, setSpecialTuo] = useState<number[]>([]);

  // 是否已查询
  const [hasSearched, setHasSearched] = useState(false);

  // 配置
  const config = lotteryType === 'super_lotto'
    ? { mainMax: 35, specialMax: 12, mainCount: 5, specialCount: 2, mainMaxDan: 4, specialMaxDan: 1 }
    : { mainMax: 33, specialMax: 16, mainCount: 6, specialCount: 1, mainMaxDan: 5, specialMaxDan: 0 };

  // 清空选号
  const clearSelection = () => {
    setMainBalls([]);
    setSpecialBalls([]);
    setMainDan([]);
    setMainTuo([]);
    setSpecialDan([]);
    setSpecialTuo([]);
    setHasSearched(false);
  };

  // 切换彩种
  const handleTypeChange = (type: LotteryType) => {
    setLotteryType(type);
    clearSelection();
  };

  // 切换模式
  const handleModeChange = (mode: BetMode) => {
    setBetMode(mode);
    clearSelection();
  };

  // 构建选号
  const selection: UserSelection = useMemo(() => {
    if (betMode === 'dantuo') {
      return {
        mode: 'dantuo',
        mainDan,
        mainTuo,
        specialDan,
        specialTuo,
      };
    }
    return {
      mode: mainBalls.length > config.mainCount || specialBalls.length > config.specialCount ? 'multiple' : 'single',
      main: mainBalls,
      special: specialBalls,
    };
  }, [betMode, mainBalls, specialBalls, mainDan, mainTuo, specialDan, specialTuo, config]);

  // 验证选号是否完整
  const isValid = useMemo(() => {
    if (betMode === 'dantuo') {
      const mainTotal = mainDan.length + mainTuo.length;
      const specialTotal = specialDan.length + specialTuo.length;
      return mainDan.length >= 1 && mainTotal >= config.mainCount && specialTotal >= config.specialCount;
    }
    return mainBalls.length >= config.mainCount && specialBalls.length >= config.specialCount;
  }, [betMode, mainBalls, specialBalls, mainDan, mainTuo, specialDan, specialTuo, config]);

  // 计算结果
  const results = useMemo(() => {
    if (!hasSearched || !isValid) return [];
    const records = lotteryType === 'super_lotto' ? superLottoData : ssqData;
    return calculateResults(lotteryType, selection, records);
  }, [hasSearched, isValid, lotteryType, selection, superLottoData, ssqData]);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* 彩种切换 */}
      <div className="flex gap-2">
        <Button
          variant={lotteryType === 'super_lotto' ? 'default' : 'outline'}
          onClick={() => handleTypeChange('super_lotto')}
        >
          大乐透
        </Button>
        <Button
          variant={lotteryType === 'ssq' ? 'default' : 'outline'}
          onClick={() => handleTypeChange('ssq')}
        >
          双色球
        </Button>
      </div>

      {/* 投注方式切换 */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={betMode === 'single' ? 'default' : 'outline'}
          onClick={() => handleModeChange('single')}
        >
          单式/复式
        </Button>
        <Button
          size="sm"
          variant={betMode === 'dantuo' ? 'default' : 'outline'}
          onClick={() => handleModeChange('dantuo')}
        >
          胆拖
        </Button>
      </div>

      {/* 选号区 */}
      <div className="space-y-4">
        {betMode === 'dantuo' ? (
          <>
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="text-sm font-medium mb-2">
                {lotteryType === 'super_lotto' ? '前区' : '红球'}
              </div>
              <DanTuoSelector
                max={config.mainMax}
                dan={mainDan}
                tuo={mainTuo}
                onDanChange={setMainDan}
                onTuoChange={setMainTuo}
                variant={lotteryType === 'super_lotto' ? 'front' : 'red'}
                maxDan={config.mainMaxDan}
                minTotal={config.mainCount}
              />
            </div>
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="text-sm font-medium mb-2">
                {lotteryType === 'super_lotto' ? '后区' : '蓝球'}
              </div>
              {lotteryType === 'super_lotto' ? (
                <DanTuoSelector
                  max={config.specialMax}
                  dan={specialDan}
                  tuo={specialTuo}
                  onDanChange={setSpecialDan}
                  onTuoChange={setSpecialTuo}
                  variant="back"
                  maxDan={config.specialMaxDan}
                  minTotal={config.specialCount}
                />
              ) : (
                <BallSelector
                  max={config.specialMax}
                  selected={specialTuo}
                  onChange={setSpecialTuo}
                  variant="blue"
                />
              )}
            </div>
          </>
        ) : (
          <>
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="text-sm font-medium mb-2">
                {lotteryType === 'super_lotto' ? `前区 (选${config.mainCount}+)` : `红球 (选${config.mainCount}+)`}
                <span className="text-gray-400 ml-2">已选 {mainBalls.length} 个</span>
              </div>
              <BallSelector
                max={config.mainMax}
                selected={mainBalls}
                onChange={setMainBalls}
                variant={lotteryType === 'super_lotto' ? 'front' : 'red'}
              />
            </div>
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="text-sm font-medium mb-2">
                {lotteryType === 'super_lotto' ? `后区 (选${config.specialCount}+)` : `蓝球 (选${config.specialCount}+)`}
                <span className="text-gray-400 ml-2">已选 {specialBalls.length} 个</span>
              </div>
              <BallSelector
                max={config.specialMax}
                selected={specialBalls}
                onChange={setSpecialBalls}
                variant={lotteryType === 'super_lotto' ? 'back' : 'blue'}
              />
            </div>
          </>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-2">
        <Button
          onClick={() => setHasSearched(true)}
          disabled={!isValid}
          className="flex-1"
        >
          查询历史中奖
        </Button>
        <Button variant="outline" onClick={clearSelection}>
          清空
        </Button>
      </div>

      {/* 结果展示 */}
      {hasSearched && (
        <ResultTable type={lotteryType} results={results} />
      )}
    </div>
  );
}
