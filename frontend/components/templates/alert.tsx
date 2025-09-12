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
    default: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
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
