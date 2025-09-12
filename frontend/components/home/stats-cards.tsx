import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/templates';
import { UserStats } from '@/types';
import { formatDate } from '@/utils/format';

interface StatsCardsProps {
  stats?: Partial<UserStats>;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Vocabularies</CardTitle>
          <span className="text-2xl">📚</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalVocabulary || 0}</div>
          <p className="text-xs text-muted-foreground">Words in your collection</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Documents</CardTitle>
          <span className="text-2xl">📄</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalDocuments || 0}</div>
          <p className="text-xs text-muted-foreground">Documents imported</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Notes</CardTitle>
          <span className="text-2xl">🔥</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalNotes || 0}</div>
          <p className="text-xs text-muted-foreground">Notes taken</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Registration Date</CardTitle>
          <span className="text-2xl">🔥</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatDate(stats?.joinedDate)}</div>
          <p className="text-xs text-muted-foreground">Days in a row</p>
        </CardContent>
      </Card>
    </div>
  );
}
