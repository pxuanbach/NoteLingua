import { DocumentViewTemplate } from '@/components/documents/document-view-template';
import { getDocumentByIdAction } from '@/lib/actions/documents';
import { getDocumentHighlightsAction } from '@/lib/actions/highlights';

interface DocumentViewPageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentViewPage({ params }: DocumentViewPageProps) {
  const { id } = await params;

  // Fetch document and highlights data on server
  const [documentResult, highlightsResult] = await Promise.all([
    getDocumentByIdAction(id),
    getDocumentHighlightsAction(id),
  ]);

  // Pass data to client template
  return (
    <DocumentViewTemplate
      document={documentResult.data}
      initialHighlights={highlightsResult.data}
    />
  );
}
