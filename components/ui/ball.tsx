'use client';

import { cn } from '@/lib/utils';

interface BallProps {
  number: number;
  selected?: boolean;
  highlighted?: boolean;
  variant?: 'red' | 'blue' | 'front' | 'back';
  size?: 'sm' | 'md';
  onClick?: () => void;
  disabled?: boolean;
}

// 浅色背景优化的样式系统
const variantStyles = {
  red: {
    default: 'bg-gradient-to-b from-white to-stone-50 text-stone-500 border-stone-200/80 shadow-sm hover:border-rose-300 hover:text-rose-600 hover:shadow-md hover:shadow-rose-100',
    selected: 'bg-gradient-to-br from-rose-500 via-red-500 to-rose-600 text-white border-rose-400/50 shadow-lg shadow-rose-500/30 ring-2 ring-rose-400/20',
    highlighted: 'bg-gradient-to-br from-rose-500 via-red-500 to-rose-600 text-white border-amber-300 shadow-xl shadow-rose-500/40 ring-2 ring-amber-400/80',
  },
  blue: {
    default: 'bg-gradient-to-b from-white to-stone-50 text-stone-500 border-stone-200/80 shadow-sm hover:border-blue-300 hover:text-blue-600 hover:shadow-md hover:shadow-blue-100',
    selected: 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white border-blue-400/50 shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/20',
    highlighted: 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white border-amber-300 shadow-xl shadow-blue-500/40 ring-2 ring-amber-400/80',
  },
  front: {
    default: 'bg-gradient-to-b from-white to-stone-50 text-stone-500 border-stone-200/80 shadow-sm hover:border-rose-300 hover:text-rose-600 hover:shadow-md hover:shadow-rose-100',
    selected: 'bg-gradient-to-br from-rose-500 via-red-500 to-rose-600 text-white border-rose-400/50 shadow-lg shadow-rose-500/30 ring-2 ring-rose-400/20',
    highlighted: 'bg-gradient-to-br from-rose-500 via-red-500 to-rose-600 text-white border-amber-300 shadow-xl shadow-rose-500/40 ring-2 ring-amber-400/80',
  },
  back: {
    default: 'bg-gradient-to-b from-white to-stone-50 text-stone-500 border-stone-200/80 shadow-sm hover:border-blue-300 hover:text-blue-600 hover:shadow-md hover:shadow-blue-100',
    selected: 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white border-blue-400/50 shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/20',
    highlighted: 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white border-amber-300 shadow-xl shadow-blue-500/40 ring-2 ring-amber-400/80',
  },
};

export function Ball({
  number,
  selected = false,
  highlighted = false,
  variant = 'red',
  size = 'md',
  onClick,
  disabled = false,
}: BallProps) {
  const styles = variantStyles[variant];
  const state = highlighted ? 'highlighted' : selected ? 'selected' : 'default';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'rounded-full font-semibold transition-all duration-200 select-none border-2',
        size === 'sm' ? 'w-7 h-7 text-xs' : 'w-10 h-10 text-sm',
        styles[state],
        onClick && !disabled && 'cursor-pointer active:scale-90',
        disabled && 'opacity-40 cursor-not-allowed',
      )}
    >
      {number.toString().padStart(2, '0')}
    </button>
  );
}
