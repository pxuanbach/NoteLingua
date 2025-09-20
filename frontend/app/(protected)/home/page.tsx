import { HomeDashboardTemplate } from '@/components/home';
import { Vocab, Document } from '@/types';
import { getUsersStatsAction } from '@/lib/actions/users';
import { getMyVocabsAction } from '@/lib/actions/vocabularies';

const TOTAL_VOCABULARIES_TO_SHOW = 5;

export default async function HomePage() {
  // Fetch user stats and recent vocabularies concurrently
  const [stats, recentVocabs] = await Promise.all([
    getUsersStatsAction(),
    getMyVocabsAction({ limit: TOTAL_VOCABULARIES_TO_SHOW }),
  ]);

  // Fetch recent documents
  const recentDocuments: Document[] = [];

  return (
    <HomeDashboardTemplate
      stats={stats.data || {}}
      recentVocabs={recentVocabs.data || []}
      recentDocuments={recentDocuments}
    />
  );
}
