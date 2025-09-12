import { ReactNode } from 'react';
import { ClientWrapper } from './client-wrapper';
import { requireAuth } from '@/lib/auth';

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default async function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { user } = await requireAuth();

  return <ClientWrapper user={user}>{children}</ClientWrapper>;
}
