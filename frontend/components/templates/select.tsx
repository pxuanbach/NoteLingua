'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps {
  value: string | number;
  onChange: (e: { target: { value: string | number } }) => void;
  options: Array<{ value: string | number; label: string; disabled?: boolean }>;
  placeholder?: string;
  className?: string;
}

export function Select({ value, onChange, options, placeholder, className }: SelectProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((opt) => opt.value === value);

  return (
    <div className={cn('relative w-full', className)}>
      <button
        type="button"
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-1',
          open ? 'ring-2 ring-primary' : ''
        )}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{selected ? selected.label : placeholder || 'Select...'}</span>
        <svg
          className="ml-2 h-4 w-4 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <ul
          className="absolute z-10 mt-1 w-full rounded-md bg-white dark:text-white dark:bg-black border border-input shadow-lg max-h-60 overflow-auto"
          tabIndex={-1}
          role="listbox"
        >
          {options.map((option) => (
            <li
              key={option.value}
              className={cn(
                'cursor-pointer select-none px-4 py-2 text-sm',
                option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/10',
                value === option.value ? 'bg-primary/20 font-semibold' : ''
              )}
              aria-selected={value === option.value}
              onClick={() => {
                if (!option.disabled) {
                  onChange({ target: { value: option.value } });
                  setOpen(false);
                }
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
