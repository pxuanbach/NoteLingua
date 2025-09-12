'use client';

import React, { ReactNode } from 'react';
import { Card } from '@/components/templates/card';
import { EmptyState } from '@/components/templates/empty-state';
import { Loading } from '@/components/templates/loading';
import { PaginationControls } from '@/components/templates/pagination-controls';
import { usePagination } from '@/hooks/use-pagination';
import { PaginatedResponse, PaginationQuery, Pagination } from '@/types';

interface PaginatedListProps<T> {
  // Controlled data (optional)
  data?: T[];
  pagination?: Pagination;
  loading?: boolean;
  error?: string | null;
  onPageChange?: (page: number) => void;

  // Uncontrolled (fetching)
  fetchFunction?: (query: PaginationQuery) => Promise<PaginatedResponse<T>>;
  initialPage?: number;
  initialLimit?: number;

  // Components
  ItemComponent: React.ComponentType<{ item: T; index?: number }>;
  EmptyComponent?: React.ComponentType<{ title?: string; description?: string }>;
  LoadingComponent?: React.ComponentType<{ message?: string }>;

  // Content
  emptyTitle?: string;
  emptyDescription?: string;
  loadingMessage?: string;

  // Layout
  className?: string;
  itemClassName?: string;
  showPagination?: boolean;

  // Callbacks
  onItemClick?: (item: T, index: number) => void;
  onDataChange?: (data: T[]) => void;
}

export function PaginatedList<T>({
  // Controlled props
  data: controlledData,
  pagination: controlledPagination,
  loading: controlledLoading,
  error: controlledError,
  onPageChange,

  // Uncontrolled props
  fetchFunction,
  initialPage = 1,
  initialLimit = 10,

  ItemComponent,
  EmptyComponent,
  LoadingComponent,
  emptyTitle = 'No items found',
  emptyDescription = 'There are no items to display at the moment.',
  loadingMessage = 'Loading...',
  className = '',
  itemClassName = '',
  showPagination = true,
  onItemClick,
  onDataChange,
}: PaginatedListProps<T>) {
  // If controlled props are provided, use them. Otherwise, use internal pagination logic.
  const isControlled =
    typeof controlledData !== 'undefined' &&
    typeof controlledPagination !== 'undefined' &&
    typeof controlledLoading !== 'undefined';

  // Internal pagination state (uncontrolled)
  const {
    data: internalData,
    pagination: internalPagination,
    loading: internalLoading,
    error: internalError,
    goToPage,
  } = fetchFunction
    ? usePagination({
        initialPage,
        initialLimit,
        fetchFunction,
        autoFetch: true,
      })
    : {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
        loading: false,
        error: null,
        goToPage: () => {},
      };

  // Notify parent when data changes (uncontrolled mode)
  React.useEffect(() => {
    if (!isControlled && onDataChange) {
      onDataChange(internalData);
    }
  }, [internalData, onDataChange, isControlled]);

  // Custom empty component
  const DefaultEmptyComponent = EmptyComponent || EmptyState;
  const DefaultLoadingComponent = LoadingComponent || Loading;

  // Select data/pagination/loading/error based on mode
  const data = isControlled ? controlledData! : internalData;
  const pagination = isControlled ? controlledPagination! : internalPagination;
  const loading = isControlled ? controlledLoading! : internalLoading;
  const error = isControlled ? controlledError! : internalError;

  // Loading state
  if (loading && data.length === 0) {
    return (
      <Card className={`p-8 ${className}`}>
        <DefaultLoadingComponent message={loadingMessage} />
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={`p-8 ${className}`}>
        <div className="text-center">
          <div className="text-red-600 mb-2">Error loading data</div>
          <div className="text-sm text-gray-600">{error}</div>
        </div>
      </Card>
    );
  }

  // Empty state
  if (!loading && data.length === 0) {
    return (
      <Card className={`p-8 ${className}`}>
        <DefaultEmptyComponent title={emptyTitle} description={emptyDescription} />
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Items list */}
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className={itemClassName} onClick={() => onItemClick?.(item, index)}>
            <ItemComponent item={item} index={index} />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {showPagination && pagination.pages > 1 && (
        <PaginationControls
          pagination={pagination}
          onPageChange={isControlled ? onPageChange || (() => {}) : goToPage}
          loading={loading}
        />
      )}
    </div>
  );
}
