import { ReactNode, Suspense } from 'react';
import { ClientWrapper } from './client-wrapper';
import { requireAuth } from '@/lib/auth';
import { Loading } from '@/components/templates';

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default async function ProtectedLayout({ children }: ProtectedLayoutProps) {
  console.log('ProtectedLayout rendered');
  const { user } = await requireAuth();

  return (
    <Suspense fallback={<Loading />}>
      <ClientWrapper user={user}>{children}</ClientWrapper>
    </Suspense>
  );
}
