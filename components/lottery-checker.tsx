"use client";

import { useState, useMemo } from "react";
import { BallSelector } from "@/components/ball-selector";
import { DanTuoSelector } from "@/components/dantuo-selector";
import { ResultTable } from "@/components/result-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  LotteryType,
  BetMode,
  UserSelection,
  SuperLottoRecord,
  SSQRecord,
} from "@/lib/types";
import { calculateResults } from "@/lib/lottery-engine";

interface LotteryCheckerProps {
  superLottoData: SuperLottoRecord[];
  ssqData: SSQRecord[];
}

export function LotteryChecker({
  superLottoData,
  ssqData,
}: LotteryCheckerProps) {
  const [lotteryType, setLotteryType] = useState<LotteryType>("super_lotto");
  const [betMode, setBetMode] = useState<BetMode>("single");

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
  const config =
    lotteryType === "super_lotto"
      ? {
          mainMax: 35,
          specialMax: 12,
          mainCount: 5,
          specialCount: 2,
          mainMaxDan: 4,
          specialMaxDan: 1,
        }
      : {
          mainMax: 33,
          specialMax: 16,
          mainCount: 6,
          specialCount: 1,
          mainMaxDan: 5,
          specialMaxDan: 0,
        };

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
    if (betMode === "dantuo") {
      return {
        mode: "dantuo",
        mainDan,
        mainTuo,
        specialDan,
        specialTuo,
      };
    }
    return {
      mode:
        mainBalls.length > config.mainCount ||
        specialBalls.length > config.specialCount
          ? "multiple"
          : "single",
      main: mainBalls,
      special: specialBalls,
    };
  }, [
    betMode,
    mainBalls,
    specialBalls,
    mainDan,
    mainTuo,
    specialDan,
    specialTuo,
    config,
  ]);

  // 验证选号是否完整
  const isValid = useMemo(() => {
    if (betMode === "dantuo") {
      const mainTotal = mainDan.length + mainTuo.length;
      const specialTotal = specialDan.length + specialTuo.length;
      return (
        mainDan.length >= 1 &&
        mainTotal >= config.mainCount &&
        specialTotal >= config.specialCount
      );
    }
    return (
      mainBalls.length >= config.mainCount &&
      specialBalls.length >= config.specialCount
    );
  }, [
    betMode,
    mainBalls,
    specialBalls,
    mainDan,
    mainTuo,
    specialDan,
    specialTuo,
    config,
  ]);

  // 计算结果
  const results = useMemo(() => {
    if (!hasSearched || !isValid) return [];
    const records = lotteryType === "super_lotto" ? superLottoData : ssqData;
    return calculateResults(lotteryType, selection, records);
  }, [hasSearched, isValid, lotteryType, selection, superLottoData, ssqData]);

  return (
    <div className="space-y-6">
      {/* 彩种切换 + 投注方式 */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-3">
          <button
            onClick={() => handleTypeChange("super_lotto")}
            className={`px-6 py-2.5 rounded-2xl font-medium transition-all duration-300 ${
              lotteryType === "super_lotto"
                ? "glass-button-active text-stone-800"
                : "glass-button text-stone-500 hover:text-stone-700"
            }`}
          >
            大乐透
          </button>
          <button
            onClick={() => handleTypeChange("ssq")}
            className={`px-6 py-2.5 rounded-2xl font-medium transition-all duration-300 ${
              lotteryType === "ssq"
                ? "glass-button-active text-stone-800"
                : "glass-button text-stone-500 hover:text-stone-700"
            }`}
          >
            双色球
          </button>
        </div>

        <Select
          value={betMode}
          onValueChange={(v) => handleModeChange(v as BetMode)}
        >
          <SelectTrigger className="w-[180px] rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">单式/复式</SelectItem>
            <SelectItem value="dantuo">胆拖</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 选号区 */}
      <div className="space-y-4">
        {betMode === "dantuo" ? (
          <>
            <div className="glass-card rounded-3xl p-6">
              <div className="text-sm font-medium mb-4 text-stone-700">
                {lotteryType === "super_lotto" ? "前区" : "红球"}
              </div>
              <DanTuoSelector
                max={config.mainMax}
                dan={mainDan}
                tuo={mainTuo}
                onDanChange={setMainDan}
                onTuoChange={setMainTuo}
                variant={lotteryType === "super_lotto" ? "front" : "red"}
                maxDan={config.mainMaxDan}
                minTotal={config.mainCount}
              />
            </div>
            <div className="glass-card rounded-3xl p-6">
              <div className="text-sm font-medium mb-4 text-stone-700">
                {lotteryType === "super_lotto" ? "后区" : "蓝球"}
              </div>
              {lotteryType === "super_lotto" ? (
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
            <div className="glass-card rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-stone-700">
                  {lotteryType === "super_lotto"
                    ? `前区 (选${config.mainCount}+)`
                    : `红球 (选${config.mainCount}+)`}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-stone-100 text-stone-500">
                  已选 {mainBalls.length} 个
                </span>
              </div>
              <BallSelector
                max={config.mainMax}
                selected={mainBalls}
                onChange={setMainBalls}
                variant={lotteryType === "super_lotto" ? "front" : "red"}
              />
            </div>
            <div className="glass-card rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-stone-700">
                  {lotteryType === "super_lotto"
                    ? `后区 (选${config.specialCount}+)`
                    : `蓝球 (选${config.specialCount}+)`}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-stone-100 text-stone-500">
                  已选 {specialBalls.length} 个
                </span>
              </div>
              <BallSelector
                max={config.specialMax}
                selected={specialBalls}
                onChange={setSpecialBalls}
                variant={lotteryType === "super_lotto" ? "back" : "blue"}
              />
            </div>
          </>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <button
          onClick={() => setHasSearched(true)}
          disabled={!isValid}
          className={`flex-1 py-3.5 rounded-2xl font-medium transition-all duration-300 ${
            isValid
              ? "glass-primary"
              : "bg-stone-200 text-stone-400 cursor-not-allowed"
          }`}
        >
          查询历史中奖
        </button>
        <button
          onClick={clearSelection}
          className="px-6 py-3.5 rounded-2xl font-medium glass-button text-stone-500 hover:text-stone-700"
        >
          清空
        </button>
      </div>

      {/* 结果展示 */}
      {hasSearched && <ResultTable type={lotteryType} results={results} />}
    </div>
  );
}
