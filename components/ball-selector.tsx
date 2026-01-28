'use client';

import { Ball } from '@/components/ui/ball';

interface BallSelectorProps {
  max: number;
  selected: number[];
  onChange: (selected: number[]) => void;
  variant?: 'red' | 'blue' | 'front' | 'back';
  maxSelect?: number;
  disabled?: boolean;
}

export function BallSelector({
  max,
  selected,
  onChange,
  variant = 'red',
  maxSelect,
  disabled = false,
}: BallSelectorProps) {
  const balls = Array.from({ length: max }, (_, i) => i + 1);

  const handleClick = (num: number) => {
    if (disabled) return;
    if (selected.includes(num)) {
      onChange(selected.filter(n => n !== num));
    } else {
      if (maxSelect && selected.length >= maxSelect) return;
      onChange([...selected, num].sort((a, b) => a - b));
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {balls.map(num => (
        <Ball
          key={num}
          number={num}
          selected={selected.includes(num)}
          variant={variant}
          onClick={() => handleClick(num)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
