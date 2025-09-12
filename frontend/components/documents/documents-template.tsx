'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/templates';
import { Document, Pagination } from '@/types';
import { DocumentsList } from './documents-list';
import { DocumentUploadModal } from './document-upload-modal';

interface DocumentsTemplateProps {
  data: Document[];
  pagination: Pagination;
  onPageChange?: (page: number) => void;
}

export function DocumentsTemplate({ data, pagination, onPageChange }: DocumentsTemplateProps) {
  const router = useRouter();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleUploadSuccess = () => {
    // Trigger refresh of documents list
    window.location.reload();
  };

  const handleViewDocument = (document: Document) => {
    // Navigate to document view page
    router.push(`/imports/${document._id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header with Upload Button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Documents</h1>
        <Button onClick={() => setIsUploadModalOpen(true)}>Import Document</Button>
      </div>

      <DocumentsList
        data={data}
        pagination={pagination}
        onViewDocument={handleViewDocument}
        onPageChange={onPageChange}
      />

      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
