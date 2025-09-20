'use client';

import { useCallback, useRef } from 'react';
import { refreshTokenAction } from '@/lib/actions/auth';

export function useRefreshToken() {
  const refreshPromiseRef = useRef<Promise<boolean> | null>(null);

  const withRefresh = useCallback(async <T>(callableRequest: () => Promise<T>): Promise<T> => {
    // Execute the server action first
    const result = await callableRequest();
    console.log('🚀 ~ useRefreshToken ~ result:', result);

    // Check if it's an authentication error
    const hasAuthError =
      result &&
      typeof result === 'object' &&
      'error' in result &&
      (String(result.error).toLowerCase().includes('token') ||
        String(result.error).toLowerCase().includes('unauthorized') ||
        String(result.error).toLowerCase().includes('authentication'));

    // If auth error, try to refresh token and retry once
    if (hasAuthError) {
      // Use shared promise to avoid multiple refresh calls
      if (!refreshPromiseRef.current) {
        refreshPromiseRef.current = refreshTokenAction().finally(() => {
          refreshPromiseRef.current = null;
        });
      }

      const refreshSuccess = await refreshPromiseRef.current;

      if (refreshSuccess) {
        // Retry the original action once
        return await callableRequest();
      }
    }

    return result;
  }, []);

  return withRefresh;
}
