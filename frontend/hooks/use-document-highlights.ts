'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getDocumentHighlightsAction,
  deleteHighlightAction,
  updateHighlightAction,
} from '@/lib/actions/highlights';
import { Highlight, HighlightFilters } from '@/types';

interface UseDocumentHighlightsReturn {
  highlights: Highlight[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  loadMore: () => void;
  refetch: () => void;
  deleteHighlight: (id: string) => Promise<boolean>;
  updateHighlight: (id: string, data: any) => Promise<boolean>;
  hasMore: boolean;
}

export function useDocumentHighlights(
  documentId: string,
  initialLimit: number = 20,
  filters: HighlightFilters = {}
): UseDocumentHighlightsReturn {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: initialLimit,
    total: 0,
    pages: 0,
  });
  const [loadingMore, setLoadingMore] = useState(false);

  // Use refs to store stable references and avoid dependency issues
  const limitRef = useRef(initialLimit);
  const filtersRef = useRef(filters);
  const paginationRef = useRef(pagination);

  // Update refs when values change
  useEffect(() => {
    limitRef.current = initialLimit;
  }, [initialLimit]);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  const fetchHighlights = useCallback(
    async (page: number = 1, append: boolean = false) => {
      try {
        if (!append) setLoading(true);
        else setLoadingMore(true);

        setError(null);

        const response = await getDocumentHighlightsAction(documentId, {
          ...filtersRef.current,
          page,
          limit: limitRef.current,
        });

        if (append) {
          setHighlights((prev) => [...prev, ...response.data]);
        } else {
          setHighlights(response.data);
        }

        setPagination(response.pagination);
      } catch (err) {
        setError('Failed to fetch highlights');
        console.error('Error fetching highlights:', err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [documentId] // Only stable documentId dependency
  );

  // Direct functions instead of useCallback chains
  const loadMore = () => {
    const currentPagination = paginationRef.current;
    if (!loadingMore && currentPagination.page < currentPagination.pages) {
      fetchHighlights(currentPagination.page + 1, true);
    }
  };

  const refetch = () => {
    fetchHighlights(1, false);
  };

  const deleteHighlight = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        // Optimistic update
        setHighlights((prev) => prev.filter((h) => h._id !== id));

        const response = await deleteHighlightAction(id);

        if (!response.success) {
          // Revert on failure by calling refetch directly
          fetchHighlights(1, false);
          setError(response.message || 'Failed to delete highlight');
          return false;
        }

        // Update pagination count
        setPagination((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
        }));

        return true;
      } catch (err) {
        // Revert on error by calling fetchHighlights directly
        fetchHighlights(1, false);
        setError('Failed to delete highlight');
        return false;
      }
    },
    [fetchHighlights] // Only depend on fetchHighlights, not refetch
  );

  const updateHighlight = useCallback(async (id: string, data: any): Promise<boolean> => {
    try {
      const response = await updateHighlightAction(id, data);

      if (response.success && response.data) {
        // Update local state
        setHighlights((prev) => prev.map((h) => (h._id === id ? { ...h, ...response.data } : h)));
        return true;
      } else {
        setError(response.message || 'Failed to update highlight');
        return false;
      }
    } catch (err) {
      setError('Failed to update highlight');
      return false;
    }
  }, []);

  useEffect(() => {
    if (documentId) {
      fetchHighlights(1, false);
    }
  }, [documentId, fetchHighlights]);

  // Reset state when documentId changes
  useEffect(() => {
    setHighlights([]);
    setError(null);
    setLoading(true);
    setPagination({
      page: 1,
      limit: initialLimit,
      total: 0,
      pages: 0,
    });
  }, [documentId, initialLimit]);

  return {
    highlights,
    loading,
    error,
    pagination,
    loadMore,
    refetch,
    deleteHighlight,
    updateHighlight,
    hasMore: pagination.page < pagination.pages,
  };
}
