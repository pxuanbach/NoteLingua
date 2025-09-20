import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
} from '@/components/templates';
import Link from 'next/link';
import { Vocab, Document } from '@/types';

interface RecentActivityProps {
  recentVocabs?: Vocab[];
  recentDocuments?: Document[];
}

export function RecentActivity({ recentVocabs = [], recentDocuments = [] }: RecentActivityProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Recent Vocabularies</CardTitle>
          <CardDescription>Your latest vocabulary additions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentVocabs.length > 0 ? (
              <>
                {recentVocabs.map((vocab) => (
                  <div key={vocab._id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{vocab.word}</p>
                      <p className="text-sm text-muted-foreground">{vocab.meaning}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(vocab.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                <Link href="/vocabularies">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No vocabularies yet</p>
                <Link href="/vocabularies">
                  <Button size="sm">Add Your First Word</Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Documents</CardTitle>
          <CardDescription>Your recently imported documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentDocuments.length > 0 ? (
              <>
                {recentDocuments.map((doc) => (
                  <div key={doc._id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{doc.file_name}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                <Button variant="outline" size="sm">
                  View All Documents
                </Button>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No documents yet</p>
                <Button size="sm">Import Your First Document</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
