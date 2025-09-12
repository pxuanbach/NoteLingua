'use client';

import { Vocab, Document, UserStats } from '@/types';
import { WelcomeSection } from './welcome-section';
import { StatsCards } from './stats-cards';
import { QuickActions } from './quick-actions';
import { RecentActivity } from './recent-activity';
import { useAuth } from '@/contexts';

interface Props {
  stats?: Partial<UserStats>;
  recentVocabs?: Vocab[];
  recentDocuments?: Document[];
}

export function HomeDashboardTemplate({ stats, recentVocabs = [], recentDocuments = [] }: Props) {
  const { user } = useAuth();

  if (!user) {
    return <></>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <WelcomeSection userName={user.firstName} />
      <StatsCards stats={stats} />
      <QuickActions />
      <RecentActivity recentVocabs={recentVocabs} recentDocuments={recentDocuments} />
    </div>
  );
}
