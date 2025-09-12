import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Alert } from '@/components/templates/alert';

type AlertVariant = 'default' | 'success' | 'warning' | 'error';

interface AlertState {
  isVisible: boolean;
  variant: AlertVariant;
  title?: string;
  message: string;
}

interface AlertContextType {
  showAlert: (variant: AlertVariant, message: string, title?: string) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}

interface AlertProviderProps {
  children: ReactNode;
}

export function AlertProvider({ children }: AlertProviderProps) {
  const [alertState, setAlertState] = useState<AlertState>({
    isVisible: false,
    variant: 'default',
    title: undefined,
    message: '',
  });

  const showAlert = useCallback((variant: AlertVariant, message: string, title?: string) => {
    setAlertState({
      isVisible: true,
      variant,
      title,
      message,
    });

    // Auto hide after 5 seconds for non-error alerts
    if (variant !== 'error') {
      setTimeout(() => {
        setAlertState(prev => ({ ...prev, isVisible: false }));
      }, 5000);
    }
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState(prev => ({
      ...prev,
      isVisible: false,
    }));
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}

      {/* Global Alert Container */}
      <div className="fixed top-4 right-4 z-50 max-w-sm">
        {alertState.isVisible && (
          <Alert
            variant={alertState.variant}
            title={alertState.title}
            onClose={hideAlert}
          >
            {alertState.message}
          </Alert>
        )}
      </div>
    </AlertContext.Provider>
  );
}
