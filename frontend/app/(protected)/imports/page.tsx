import { DocumentsTemplate } from '@/components/documents/documents-template';
import { getMyDocumentsAction } from '@/lib/actions/documents';
import { SearchParams } from '@/types';

interface ImportsPageProps {
  searchParams?: Promise<SearchParams>;
}

export default async function ImportsPage({ searchParams }: ImportsPageProps) {
  const searchData = await searchParams;
  const page = Number(searchData?.page) || 1;
  const limit = Number(searchData?.limit) || 10;
  const search = String(searchData?.search || '');

  const { data, pagination } = await getMyDocumentsAction({
    page,
    limit,
    search,
  });

  return <DocumentsTemplate searchData={searchData} data={data} pagination={pagination} />;
}
