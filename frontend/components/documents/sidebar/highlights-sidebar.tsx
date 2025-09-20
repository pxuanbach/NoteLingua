'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, Loading } from '@/components/templates';
import { HighlightItem } from './highlight-item';
import { useDocumentHighlights } from '@/hooks/use-document-highlights';
import { Document, Highlight, UpdateHighlightRequest } from '@/types';

interface HighlightsSidebarProps {
  highlights: Highlight[];
  loading: boolean;
  loadMore: () => void;
  onHighlightEdit: (highlight: Highlight) => void;
  onHighlightDelete: (id: string) => void;
  hasMore?: boolean;
}

export function HighlightsSidebar({
  highlights,
  loading,
  loadMore,
  onHighlightEdit,
  onHighlightDelete,
  hasMore = false,
}: HighlightsSidebarProps) {
  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadMore();
    }
  };

  return (
    <div className={`flex flex-col h-full`}>
      <div className="flex items-center gap-1 p-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold">Highlights</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">({highlights.length})</div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {loading && highlights.length === 0 ? (
          <div className="flex items-center justify-center h-20">
            <Loading />
          </div>
        ) : highlights.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No highlights found for this document.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {highlights.map((highlight) => (
              <HighlightItem
                key={highlight._id}
                highlight={highlight}
                onEdit={onHighlightEdit}
                onDelete={onHighlightDelete}
              />
            ))}
          </>
        )}
      </div>

      {hasMore && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={handleLoadMore} disabled={loading}>
            {loading ? <Loading size="sm" /> : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
}
