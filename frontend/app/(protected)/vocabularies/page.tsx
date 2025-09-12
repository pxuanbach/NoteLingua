import { VocabulariesTemplate } from '@/components/vocabularies';
import { getMyVocabsAction } from '@/lib/actions/vocabularies';

export default async function VocabulariesPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const page = Number((await searchParams)?.page) || 1;
  const limit = Number((await searchParams)?.limit) || 20;
  const search = (await searchParams)?.search || '';

  const { data, pagination } = await getMyVocabsAction({
    page: page,
    limit: limit,
    search: String(search),
  });

  return <VocabulariesTemplate data={data} pagination={pagination} />;
}
