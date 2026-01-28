'use client';

import { Ball } from '@/components/ui/ball';
import { cn } from '@/lib/utils';

interface DanTuoSelectorProps {
  max: number;
  dan: number[];
  tuo: number[];
  onDanChange: (dan: number[]) => void;
  onTuoChange: (tuo: number[]) => void;
  variant?: 'red' | 'blue' | 'front' | 'back';
  maxDan: number;
  minTotal: number;
}

export function DanTuoSelector({
  max,
  dan,
  tuo,
  onDanChange,
  onTuoChange,
  variant = 'red',
  maxDan,
  minTotal,
}: DanTuoSelectorProps) {
  const balls = Array.from({ length: max }, (_, i) => i + 1);

  const handleDanClick = (num: number) => {
    if (dan.includes(num)) {
      onDanChange(dan.filter(n => n !== num));
    } else if (tuo.includes(num)) {
      onTuoChange(tuo.filter(n => n !== num));
      if (dan.length < maxDan) {
        onDanChange([...dan, num].sort((a, b) => a - b));
      }
    } else {
      if (dan.length < maxDan) {
        onDanChange([...dan, num].sort((a, b) => a - b));
      }
    }
  };

  const handleTuoClick = (num: number) => {
    if (tuo.includes(num)) {
      onTuoChange(tuo.filter(n => n !== num));
    } else if (dan.includes(num)) {
      onDanChange(dan.filter(n => n !== num));
      onTuoChange([...tuo, num].sort((a, b) => a - b));
    } else {
      onTuoChange([...tuo, num].sort((a, b) => a - b));
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <div className="text-sm text-gray-600 mb-1.5">
          胆码 <span className="text-gray-400">(最多{maxDan}个，已选{dan.length}个)</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {balls.map(num => (
            <Ball
              key={num}
              number={num}
              selected={dan.includes(num)}
              variant={variant}
              onClick={() => handleDanClick(num)}
            />
          ))}
        </div>
      </div>
      <div>
        <div className="text-sm text-gray-600 mb-1.5">
          拖码 <span className="text-gray-400">(已选{tuo.length}个，需满足胆+拖≥{minTotal})</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {balls.map(num => (
            <Ball
              key={num}
              number={num}
              selected={tuo.includes(num)}
              variant={variant}
              onClick={() => handleTuoClick(num)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
