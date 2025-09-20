'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Loading, EmptyState } from '@/components/templates';
import { PaginationControls } from '@/components/templates/pagination-controls';
import { useAlert, useConfirmModal } from '@/contexts';
import { deleteDocumentAction } from '@/lib/actions/documents';
import { Document, Pagination } from '@/types';
import { formatDate } from '@/utils/format';

interface DocumentsListProps {
  data: Document[];
  pagination: Pagination;
  onViewDocument?: (document: Document) => void;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
}

export function DocumentsList({
  data,
  pagination,
  onViewDocument,
  onPageChange,
  isLoading = false,
}: DocumentsListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { showAlert } = useAlert();
  const { showConfirm } = useConfirmModal();

  const handleDelete = async (document: Document) => {
    showConfirm(
      {
        title: 'Delete Document',
        message: `Are you sure you want to delete "${document.file_name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        variant: 'danger',
      },
      async () => {
        try {
          setDeletingId(document._id);
          const response = await deleteDocumentAction(document._id);

          if (response.success) {
            showAlert('success', 'Document deleted successfully');
            // Refresh page to show updated data
            router.refresh();
          } else {
            showAlert('error', response.message || 'Delete failed');
          }
        } catch (error) {
          console.error('Delete error:', error);
          showAlert('error', 'An unexpected error occurred');
        } finally {
          setDeletingId(null);
        }
      }
    );
  };

  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();

    if (extension === 'pdf') {
      return (
        <svg
          className="w-8 h-8 text-red-600 dark:text-red-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h4v4H4V5zm6 0h6v2h-6V5zm0 4h6v2h-6V9zm0 4h4v2h-4v-2zM4 13h4v2H4v-2z" />
        </svg>
      );
    }

    return (
      <svg
        className="w-8 h-8 text-gray-600 dark:text-gray-400"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5z" />
      </svg>
    );
  };

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex justify-center">
          <Loading />
        </div>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title="No documents imported"
        description="Start by importing your first PDF or text document."
        action={<Button onClick={() => router.refresh()}>Refresh</Button>}
      />
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">My Documents</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {pagination.total} document{pagination.total !== 1 ? 's' : ''} total
        </p>
      </div>

      <div className="space-y-4">
        {data.map((document) => (
          <div
            key={document._id}
            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors bg-white dark:bg-gray-800"
          >
            <div className="flex items-center space-x-4">
              {getFileIcon(document.file_name)}

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {document.file_name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Imported {formatDate(document.created_at)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDocument?.(document)}
                disabled={deletingId === document._id}
              >
                View
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(document)}
                disabled={deletingId === document._id}
                isLoading={deletingId === document._id}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {pagination.pages > 1 && (
        <PaginationControls
          pagination={pagination}
          onPageChange={handlePageChange}
          className="mt-6"
        />
      )}
    </Card>
  );
}
