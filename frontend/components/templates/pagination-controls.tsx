'use client';

import { Button } from '@/components/templates/button';
import { Pagination } from '@/types';

interface PaginationControlsProps {
  pagination: Pagination;
  onPageChange: (page: number) => void;
  loading?: boolean;
  className?: string;
}

export function PaginationControls({
  pagination,
  onPageChange,
  loading = false,
  className = '',
}: PaginationControlsProps) {
  const { page, pages, total } = pagination;

  if (pages <= 1) return null;

  const handlePageClick = (pageNum: number) => {
    if (!loading && pageNum >= 1 && pageNum <= pages) {
      onPageChange(pageNum);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (pages <= maxVisiblePages) {
      // Show all pages if total pages is small
      for (let i = 1; i <= pages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show pages with ellipsis
      if (page <= 3) {
        // Near the beginning
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(pages);
      } else if (page >= pages - 2) {
        // Near the end
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = pages - 3; i <= pages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // In the middle
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = page - 1; i <= page + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(pages);
      }
    }

    return pageNumbers.map((pageNum, index) => {
      if (pageNum === '...') {
        return (
          <span key={`ellipsis-${index}`} className="px-2 py-1 text-gray-500">
            ...
          </span>
        );
      }

      return (
        <Button
          key={pageNum}
          variant={pageNum === page ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePageClick(pageNum as number)}
          disabled={loading}
        >
          {pageNum}
        </Button>
      );
    });
  };

  return (
    <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 ${className}`}>
      {/* Results info */}
      <div className="text-sm text-gray-600">
        Showing page {page} of {pages} ({total} total items)
      </div>

      {/* Pagination controls */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageClick(page - 1)}
          disabled={loading || page <= 1}
        >
          Previous
        </Button>

        <div className="flex space-x-1">{renderPageNumbers()}</div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageClick(page + 1)}
          disabled={loading || page >= pages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
