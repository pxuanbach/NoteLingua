'use client';

import { ReactNode } from 'react';
import { AlertProvider, ConfirmModalProvider, AuthProvider } from '@/contexts';
import { User } from '@/types';

interface ClientWrapperProps {
  children: ReactNode;
  user: User | null;
}

export function ClientWrapper({ children, user }: ClientWrapperProps) {
  return (
    <AuthProvider initialUser={user}>
      <AlertProvider>
        <ConfirmModalProvider>{children}</ConfirmModalProvider>
      </AlertProvider>
    </AuthProvider>
  );
}
