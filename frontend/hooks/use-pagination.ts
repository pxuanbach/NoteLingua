'use client';

import { PaginationQuery, Pagination, PaginatedResponse } from '@/types';
import { useState, useEffect, useCallback } from 'react';

export interface UsePaginationOptions<T> {
  initialPage?: number;
  initialLimit?: number;
  fetchFunction: (query: PaginationQuery) => Promise<PaginatedResponse<T>>;
  autoFetch?: boolean;
}

export function usePagination<T>({
  initialPage = 1,
  initialLimit = 10,
  fetchFunction,
  autoFetch = true,
}: UsePaginationOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (query: PaginationQuery = {}) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchFunction({
          page: pagination.page,
          limit: pagination.limit,
          ...query,
        });

        setData(response.data);
        setPagination(response.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Pagination fetch error:', err);
      } finally {
        setLoading(false);
      }
    },
    [fetchFunction, pagination.page, pagination.limit]
  );

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= pagination.pages) {
        setPagination((prev) => ({ ...prev, page }));
      }
    },
    [pagination.pages]
  );

  const changeLimit = useCallback((limit: number) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const nextPage = useCallback(() => {
    goToPage(pagination.page + 1);
  }, [goToPage, pagination.page]);

  const prevPage = useCallback(() => {
    goToPage(pagination.page - 1);
  }, [goToPage, pagination.page]);

  // Auto fetch on mount or when pagination changes
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [pagination.page, pagination.limit, autoFetch, fetchData]);

  return {
    data,
    pagination,
    loading,
    error,
    goToPage,
    changeLimit,
    refresh,
    nextPage,
    prevPage,
    fetchData,
  };
}
