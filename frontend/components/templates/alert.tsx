import { cn } from '@/lib/utils';

type AlertVariant = 'default' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
}

export function Alert({ variant = 'default', title, children, className, onClose }: AlertProps) {
  const variantClasses = {
    default: 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200',
    success: 'bg-emerald-100 dark:bg-emerald-900 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200',
    warning: 'bg-amber-100 dark:bg-amber-900 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200',
    error: 'bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700 text-red-900 dark:text-red-200',
  };

  const iconMap = {
    default: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  };

  return (
    <div className={cn('p-4 border rounded-md', variantClasses[variant], className)}>
      <div className="flex items-start">
        <span className="mr-3 mt-0.5">{iconMap[variant]}</span>
        <div className="flex-1">
          {title && <h4 className="font-medium mb-1">{title}</h4>}
          <div className="text-sm">{children}</div>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-2 text-current hover:opacity-70">
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
