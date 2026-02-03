'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getDocumentHighlightsAction,
  deleteHighlightAction,
  updateHighlightAction,
  createHighlightAction,
} from '@/lib/actions/highlights';
import {
  CreateHighlightRequest,
  Highlight,
  HighlightFilters,
  IHighlightWithVocab,
  UpdateHighlightRequest,
} from '@/types';

interface UseDocumentHighlightsProps {
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
  updateHighlight: (id: string, data: UpdateHighlightRequest) => Promise<boolean>;
  createHighlight: (data: CreateHighlightRequest) => Promise<void>;
  hasMore: boolean;
}

export function useDocumentHighlights(
  documentId: string,
  initialLimit: number = 20,
  filters: HighlightFilters = {}
): UseDocumentHighlightsProps {
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

  const fetchHighlights = useCallback(
    async (page: number = 1, append: boolean = false) => {
      try {
        if (!append) setLoading(true);
        else setLoadingMore(true);

        setError(null);

        const response = await getDocumentHighlightsAction(documentId, {
          ...filters,
          page,
          limit: initialLimit,
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
    [documentId]
  );

  const loadMore = () => {
    if (!loadingMore && pagination.page < pagination.pages) {
      fetchHighlights(pagination.page + 1, true);
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
          fetchHighlights(1, false);
          setError(response.message || 'Failed to delete highlight');
          return false;
        }

        setPagination((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
        }));

        return true;
      } catch (err) {
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

  const createHighlight = useCallback(async (data: CreateHighlightRequest) => {
    try {
      const response = await createHighlightAction(data);

      if (response.success) {
        setHighlights((prev) => [response.data, ...prev]);
      } else {
        setError(response.message || 'Failed to create highlight');
      }
    } catch (err) {
      setError('Failed to create highlight');
    }
  }, []);

  useEffect(() => {
    if (documentId) {
      fetchHighlights(1, false);
    }
  }, [documentId, fetchHighlights]);

  return {
    highlights,
    loading,
    error,
    pagination,
    loadMore,
    refetch,
    deleteHighlight,
    updateHighlight,
    createHighlight,
    hasMore: pagination.page < pagination.pages,
  };
}
