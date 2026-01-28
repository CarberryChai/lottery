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

const variantStyles = {
  red: {
    default: 'bg-gray-100 text-gray-700 hover:bg-red-100',
    selected: 'bg-red-500 text-white',
    highlighted: 'bg-red-500 text-white ring-2 ring-yellow-400',
  },
  blue: {
    default: 'bg-gray-100 text-gray-700 hover:bg-blue-100',
    selected: 'bg-blue-500 text-white',
    highlighted: 'bg-blue-500 text-white ring-2 ring-yellow-400',
  },
  front: {
    default: 'bg-gray-100 text-gray-700 hover:bg-red-100',
    selected: 'bg-red-500 text-white',
    highlighted: 'bg-red-500 text-white ring-2 ring-yellow-400',
  },
  back: {
    default: 'bg-gray-100 text-gray-700 hover:bg-blue-100',
    selected: 'bg-blue-500 text-white',
    highlighted: 'bg-blue-500 text-white ring-2 ring-yellow-400',
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
        'rounded-full font-medium transition-all select-none',
        size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm',
        styles[state],
        onClick && !disabled && 'cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      {number.toString().padStart(2, '0')}
    </button>
  );
}
