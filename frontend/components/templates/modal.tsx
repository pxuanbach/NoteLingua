import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, size = 'md', className }: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 dark:bg-black/80 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative bg-background dark:bg-background rounded-lg shadow-lg w-full mx-4 border border-border dark:border-border',
          sizeClasses[size],
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-border dark:border-border">
            <h2 className="text-lg font-semibold text-foreground dark:text-foreground">{title}</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-foreground cursor-pointer transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
