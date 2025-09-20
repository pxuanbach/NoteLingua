'use client';

import { ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface FloatingButtonProps {
  children: ReactNode;
  onClick?: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline';
  disabled?: boolean;
  ariaLabel?: string;
  anchor?: boolean; // Nếu true, sử dụng absolute thay vì fixed
}

const FloatingButton = forwardRef<HTMLButtonElement, FloatingButtonProps>(
  (
    {
      children,
      onClick,
      position = 'bottom-right',
      size = 'md',
      variant = 'primary',
      disabled = false,
      ariaLabel,
      anchor = false,
      ...props
    },
    ref
  ) => {
    // Position classes cho fixed (viewport)
    const fixedPositionClasses = {
      'bottom-right': 'bottom-0 right-0 rounded-l-lg rounded-r-none',
      'bottom-left': 'bottom-0 left-0 rounded-r-lg rounded-l-none',
      'top-right': 'top-0 right-0 rounded-l-lg rounded-r-none',
      'top-left': 'top-0 left-0 rounded-r-lg rounded-l-none',
    };

    // Position classes cho absolute (relative to parent)
    const absolutePositionClasses = {
      'bottom-right': 'bottom-0 right-0',
      'bottom-left': 'bottom-0 left-0',
      'top-right': 'top-0 right-0',
      'top-left': 'top-0 left-0',
    };

    const positionClasses = anchor ? absolutePositionClasses : fixedPositionClasses;

    const sizeClasses = {
      sm: 'h-10 px-3',
      md: 'h-12 px-4',
      lg: 'h-14 px-5',
    };

    const variantClasses = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl',
      secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl',
      destructive: 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl',
      outline:
        'bg-white hover:bg-gray-50 border border-gray-300 text-gray-900 shadow-lg hover:shadow-xl',
    };

    return (
      <button
        ref={ref}
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        className={cn(
          // Base styles
          anchor ? 'absolute' : 'fixed',
          'z-50 flex items-center justify-center cursor-pointer',
          'focus:outline-none',

          // Rounded corners only for fixed positioning
          !anchor && 'rounded-lg',

          // Position
          positionClasses[position],

          // Size
          sizeClasses[size],

          // Variant
          variantClasses[variant],

          // Disabled state
          disabled && 'opacity-50 cursor-not-allowed hover:scale-100'
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

FloatingButton.displayName = 'FloatingButton';

export { FloatingButton };
