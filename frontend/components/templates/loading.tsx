import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
  text?: string;
}

export function Loading({ size = 'md', variant = 'spinner', text }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  if (variant === 'spinner') {
    return (
      <div className="flex flex-col items-center justify-center">
        <svg
          className={cn('animate-spin text-primary', sizeClasses[size])}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="flex space-x-1">
          <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]"></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]"></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-primary"></div>
        </div>
        {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className={cn('animate-pulse rounded-full bg-primary', sizeClasses[size])}></div>
        {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
      </div>
    );
  }

  return null;
}
