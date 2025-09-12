import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ConfirmModal } from '@/components/templates/confirm-modal';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface ConfirmModalContextType {
  showConfirm: (
    options: ConfirmOptions,
    onConfirm: () => void | Promise<void>,
    onCancel?: () => void
  ) => void;
  hideConfirm: () => void;
}

const ConfirmModalContext = createContext<ConfirmModalContextType | undefined>(undefined);

export function useConfirmModal() {
  const context = useContext(ConfirmModalContext);
  if (context === undefined) {
    throw new Error('useConfirmModal must be used within a ConfirmModalProvider');
  }
  return context;
}

interface ConfirmModalProviderProps {
  children: ReactNode;
}

export function ConfirmModalProvider({ children }: ConfirmModalProviderProps) {
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'OK',
    cancelText: 'Cancel',
    variant: 'default',
  });

  const [isLoading, setIsLoading] = useState(false);

  const showConfirm = useCallback(
    (options: ConfirmOptions, onConfirm: () => void | Promise<void>, onCancel?: () => void) => {
      setConfirmState({
        isOpen: true,
        ...options,
        onConfirm,
        onCancel,
      });
    },
    []
  );

  const hideConfirm = useCallback(() => {
    setConfirmState((prev) => ({
      ...prev,
      isOpen: false,
    }));
    setIsLoading(false);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!confirmState.onConfirm) return;

    setIsLoading(true);
    try {
      await confirmState.onConfirm();
      hideConfirm();
    } catch (error) {
      console.error('Confirm action failed:', error);
      setIsLoading(false);
    }
  }, [confirmState.onConfirm, hideConfirm]);

  const handleCancel = useCallback(() => {
    if (confirmState.onCancel) {
      confirmState.onCancel();
    }
    hideConfirm();
  }, [confirmState.onCancel, hideConfirm]);

  return (
    <ConfirmModalContext.Provider value={{ showConfirm, hideConfirm }}>
      {children}

      {/* Global Confirm Modal */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={handleCancel}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        variant={confirmState.variant}
        isLoading={isLoading}
      />
    </ConfirmModalContext.Provider>
  );
}
