'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PDFViewer } from '@/components/documents/pdf-viewer';
import { Button, Loading } from '@/components/templates';
import { Document, Highlight } from '@/types';

interface DocumentViewTemplateProps {
  document: Document;
  initialHighlights?: Highlight[];
}

export function DocumentViewTemplate({
  document,
  initialHighlights = [],
}: DocumentViewTemplateProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setIsLoading(true);
    router.push('/imports');
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loading />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900">
      <PDFViewer document={document} initialHighlights={initialHighlights} onClose={handleClose} />
    </div>
  );
}
