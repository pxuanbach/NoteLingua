import { requireAuth } from '@/lib/auth';
import { DocumentsTemplate, DocumentUpload } from '@/components/documents';
import { getMyDocumentsAction } from '@/lib/actions/documents';

interface ImportsPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ImportsPage({ searchParams }: ImportsPageProps) {
  const page = Number((await searchParams)?.page) || 1;
  const limit = Number((await searchParams)?.limit) || 10;
  const search = String((await searchParams)?.search || '');

  const { data, pagination } = await getMyDocumentsAction({
    page,
    limit,
    search,
  });

  return <DocumentsTemplate data={data} pagination={pagination} />;
}
