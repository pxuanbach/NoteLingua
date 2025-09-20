import { DocumentDetailTemplate } from '@/components/documents/document-detail-template';
import { getDocumentByIdAction } from '@/lib/actions/documents';
import { getDocumentHighlightsAction } from '@/lib/actions/highlights';

interface DocumentViewPageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentViewPage({ params }: DocumentViewPageProps) {
  const { id } = await params;

  // Fetch document and highlights data on server
  const documentResult = await getDocumentByIdAction(id);

  // Pass data to client template
  return <DocumentDetailTemplate document={documentResult.data} />;
}
