import { useState, useCallback } from 'react';
import { Vocab, Pagination, VocabQueryParams } from '@/types';
import { getMyVocabsAction } from '@/lib/actions/vocabularies';

export function useMyVocabularies({ page = 1, limit = 20, ...otherParams }: VocabQueryParams) {
  const [data, setData] = useState<Vocab[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page,
    limit,
    total: 0,
    pages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { page, limit, ...otherParams };
      const result = await getMyVocabsAction(params);
      setData(result.data || []);
      setPagination(result.pagination || pagination);
    } finally {
      setIsLoading(false);
    }
  }, [pagination, otherParams]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    pagination,
    refresh,
    isLoading,
    fetchData,
  };
}
