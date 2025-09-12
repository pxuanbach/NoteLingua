import { cn } from '@/lib/utils';
import { Button } from './button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  isLoading?: boolean;
  className?: string;
}

export function ConfirmModal({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Cancel',
  variant = 'default',
  isLoading = false,
  className,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  const confirmButtonVariant = variant === 'danger' ? 'destructive' : 'default';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div
        className={cn(
          'relative bg-white dark:bg-zinc-900 rounded-lg shadow-lg w-full mx-4 max-w-md',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={handleCancel}
            className="text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-50"
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-sm text-muted-foreground mb-6">{message}</p>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
              {cancelText}
            </Button>
            <Button
              variant={confirmButtonVariant}
              onClick={handleConfirm}
              disabled={isLoading}
              isLoading={isLoading}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
