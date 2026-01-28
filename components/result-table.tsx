'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Ball } from '@/components/ui/ball';
import type { LotteryType, WinningResult, SuperLottoRecord, SSQRecord } from '@/lib/types';
import { getLevelName } from '@/lib/lottery-engine';

interface ResultTableProps {
  type: LotteryType;
  results: WinningResult[];
}

const levelColors: Record<number, string> = {
  1: 'bg-red-500 text-white',
  2: 'bg-orange-500 text-white',
  3: 'bg-yellow-500 text-white',
  4: 'bg-green-500 text-white',
  5: 'bg-teal-500 text-white',
  6: 'bg-blue-500 text-white',
  7: 'bg-indigo-500 text-white',
  8: 'bg-purple-500 text-white',
  9: 'bg-gray-500 text-white',
};

export function ResultTable({ type, results }: ResultTableProps) {
  if (results.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        暂无中奖记录
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600">
        共 {results.length} 期中奖
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>奖级</TableHead>
            <TableHead>期号</TableHead>
            <TableHead>日期</TableHead>
            <TableHead>开奖号码</TableHead>
            <TableHead className="text-right">命中</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result, idx) => (
            <ResultRow key={idx} type={type} result={result} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ResultRow({ type, result }: { type: LotteryType; result: WinningResult }) {
  const { record, level, mainHit, specialHit, userMain, userSpecial } = result;

  const mainBalls = type === 'super_lotto'
    ? (record as SuperLottoRecord).front_balls
    : (record as SSQRecord).red_balls;

  const specialBalls = type === 'super_lotto'
    ? (record as SuperLottoRecord).back_balls
    : [(record as SSQRecord).blue_ball];

  return (
    <TableRow>
      <TableCell>
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${levelColors[level]}`}>
          {getLevelName(type, level)}
        </span>
      </TableCell>
      <TableCell className="text-gray-600">{record.period}</TableCell>
      <TableCell className="text-gray-500">{record.date}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {mainBalls.map(num => (
              <Ball
                key={num}
                number={num}
                size="sm"
                variant={type === 'super_lotto' ? 'front' : 'red'}
                highlighted={userMain.includes(num)}
              />
            ))}
          </div>
          <div className="w-px h-5 bg-gray-200" />
          <div className="flex gap-1">
            {specialBalls.map(num => (
              <Ball
                key={num}
                number={num}
                size="sm"
                variant={type === 'super_lotto' ? 'back' : 'blue'}
                highlighted={userSpecial.includes(num)}
              />
            ))}
          </div>
        </div>
      </TableCell>
      <TableCell className="text-right text-gray-600">
        {mainHit}+{specialHit}
      </TableCell>
    </TableRow>
  );
}
