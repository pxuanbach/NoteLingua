'use client';

import { useDocumentContext } from '@/contexts/document-context';
import { Button, Card, CardContent, Loading } from '@/components/templates';
import { Highlight } from '@/types';
import { useEffect } from 'react';
import { HighlightItem } from './highlight-item';

interface SidebarProps {
  onHighlightEdit?: (highlight: Highlight) => void;
  onHighlightDelete?: (highlightId: string) => void;
}

export function Sidebar({ onHighlightEdit, onHighlightDelete }: SidebarProps) {
  const { highlights, loading, loadMore, hasMore, updateHash
  } = useDocumentContext();

  useEffect(() => {
    console.log('🚀 ~ Sidebar ~ highlights:', highlights);
  }, [highlights])

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 w-full overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="font-semibold text-lg">Vocabulary</h2>
        <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-gray-500">
          {highlights.length} items
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {highlights.length === 0 && !loading ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-sm">No vocabulary selected yet.</p>
            <p className="text-xs mt-1">Highlight text in the PDF to start.</p>
          </div>
        ) : (
          <>
            {highlights.map((highlight) => (
              <HighlightItem
                key={highlight._id}
                highlight={highlight}
                onEdit={() => onHighlightEdit?.(highlight)}
                onDelete={(id) => onHighlightDelete?.(id)}
                onClick={() => updateHash(highlight._id)}
              />
            ))}

            {hasMore && (
              <div className="pt-2 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadMore}
                  disabled={loading}
                  className="text-xs w-full"
                >
                  {loading ? <Loading size="sm" /> : 'Load more items'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
