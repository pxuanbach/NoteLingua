'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/templates';
import { Document, Pagination, SearchParams } from '@/types';
import { DocumentsList } from './documents-list';
import { DocumentUploadModal } from './document-upload-modal';
import queryString from 'query-string';

interface DocumentsTemplateProps {
  searchData?: SearchParams;
  data: Document[];
  pagination: Pagination;
}

export function DocumentsTemplate({ searchData, data, pagination }: DocumentsTemplateProps) {
  const router = useRouter();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  const handleUploadSuccess = () => {
    setIsUploadModalOpen(false);
    router.refresh();
  };

  const handleViewDocument = (document: Document) => {
    router.push(`/imports/${document._id}`);
  };

  const handleOpenModal = () => {
    setIsUploadModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsUploadModalOpen(false);
  };

  const handlePagination = (page: number) => {
    const params = {
      ...searchData,
      page,
    };

    router.push(pathname + `?${queryString.stringify(params)}`);
  };

  const handlePageChange = async (page: number) => {
    setIsLoading(true);
    try {
      await handlePagination(page);
    } catch (error) {
      console.error('Error changing page:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Documents</h1>
            <p className="text-muted-foreground">
              Manage your imported documents and create highlights for vocabulary learning.
            </p>
          </div>
          <Button onClick={handleOpenModal}>Import Document</Button>
        </div>
      </div>

      {/* Documents List */}
      <DocumentsList
        data={data}
        pagination={pagination}
        onViewDocument={handleViewDocument}
        onPageChange={handlePageChange}
        isLoading={isLoading}
      />

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={handleCloseModal}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
