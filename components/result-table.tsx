"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Ball } from "@/components/ui/ball";
import type {
  LotteryType,
  WinningResult,
  SuperLottoRecord,
  SSQRecord,
} from "@/lib/types";
import { getLevelName } from "@/lib/lottery-engine";

interface ResultTableProps {
  type: LotteryType;
  results: WinningResult[];
}

const levelColors: Record<number, string> = {
  1: "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm shadow-amber-500/30",
  2: "bg-gradient-to-r from-orange-400 to-rose-500 text-white shadow-sm shadow-orange-500/30",
  3: "bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-sm shadow-rose-500/30",
  4: "bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-sm shadow-emerald-500/30",
  5: "bg-gradient-to-r from-teal-400 to-cyan-500 text-white shadow-sm shadow-teal-500/30",
  6: "bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-sm shadow-blue-500/30",
  7: "bg-gradient-to-r from-indigo-400 to-violet-500 text-white shadow-sm shadow-indigo-500/30",
  8: "bg-gradient-to-r from-violet-400 to-purple-500 text-white shadow-sm shadow-violet-500/30",
  9: "bg-gradient-to-r from-stone-400 to-stone-500 text-white",
};

export function ResultTable({ type, results }: ResultTableProps) {
  if (results.length === 0) {
    return (
      <div className="glass-card rounded-3xl p-10 text-center">
        <div className="text-stone-400 text-sm">暂无中奖记录</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-stone-600">
        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-400" />
        共 <span className="font-medium text-stone-800">{results.length}</span> 期中奖
      </div>
      <div className="glass-card rounded-3xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-stone-200/60 hover:bg-transparent">
              <TableHead className="text-stone-500 font-medium">奖级</TableHead>
              <TableHead className="text-stone-500 font-medium">期号</TableHead>
              <TableHead className="text-stone-500 font-medium">日期</TableHead>
              <TableHead className="text-stone-500 font-medium">开奖号码</TableHead>
              <TableHead className="text-right text-stone-500 font-medium">命中</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result, idx) => (
              <ResultRow key={idx} type={type} result={result} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function ResultRow({
  type,
  result,
}: {
  type: LotteryType;
  result: WinningResult;
}) {
  const { record, level, mainHit, specialHit, userMain, userSpecial } = result;

  const mainBalls =
    type === "super_lotto"
      ? (record as SuperLottoRecord).front_balls
      : (record as SSQRecord).red_balls;

  const specialBalls =
    type === "super_lotto"
      ? (record as SuperLottoRecord).back_balls
      : [(record as SSQRecord).blue_ball];

  return (
    <TableRow className="border-stone-100 hover:bg-stone-50/50 transition-colors">
      <TableCell>
        <span
          className={`px-2.5 py-1 rounded-lg text-xs font-medium ${levelColors[level]}`}
        >
          {getLevelName(type, level)}
        </span>
      </TableCell>
      <TableCell className="text-stone-700 font-medium">{record.period}</TableCell>
      <TableCell className="text-stone-400 text-sm">{record.date}</TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {mainBalls.map((num) => (
              <Ball
                key={num}
                number={num}
                size="sm"
                variant={type === "super_lotto" ? "front" : "red"}
                highlighted={userMain.includes(num)}
              />
            ))}
          </div>
          <div className="w-px h-5 bg-stone-200" />
          <div className="flex gap-1">
            {specialBalls.map((num) => (
              <Ball
                key={num}
                number={num}
                size="sm"
                variant={type === "super_lotto" ? "back" : "blue"}
                highlighted={userSpecial.includes(num)}
              />
            ))}
          </div>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <span className="text-stone-700 font-medium">
          {mainHit}+{specialHit}
        </span>
      </TableCell>
    </TableRow>
  );
}
