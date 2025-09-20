import { ApiResponse, PaginatedResponse } from '@/types';
import { AxiosInstance, AxiosResponse } from 'axios';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getNewTokensAction } from './actions/auth';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const makeRequestWrapper = async <T>(
  requestFunc: () => Promise<AxiosResponse<ApiResponse<T>>>
): Promise<ApiResponse<T>> => {
  try {
    const response = await requestFunc();

    return response.data;
  } catch (error) {
    return {
      success: false,
      message: 'An unexpected error occurred',
      data: null as any,
    } as ApiResponse<T>;
  }
};

export const makePaginatedRequestWrapper = async <T>(
  requestFunc: () => Promise<AxiosResponse<PaginatedResponse<T>>>
): Promise<PaginatedResponse<T>> => {
  try {
    const response = await requestFunc();

    return response.data;
  } catch (error) {
    return {
      success: false,
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
      },
    } as PaginatedResponse<T>;
  }
};

export const refreshTokenInterceptor = async (
  instance: AxiosInstance,
  onTokenRefresh?: (access_token: string, refresh_token: string) => void
) => {
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (
        error.response &&
        (error.response.status === 401 ||
          (error.response.status === 403 && error.response.data.error === 'Invalid Token')) &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        const { access_token, refresh_token, error: refreshError } = await getNewTokensAction();

        if (refreshError) {
          return Promise.reject(refreshError);
        }

        // Call the callback to set tokens (e.g., in cookies on client-side)
        if (onTokenRefresh && access_token && refresh_token) {
          onTokenRefresh(access_token, refresh_token);
        }

        // Update the axios instance with new token
        const bearer = `Bearer ${access_token}`;
        originalRequest.headers['Authorization'] = bearer;
        instance.defaults.headers.common['Authorization'] = bearer;

        // Retry the original request
        return instance(originalRequest);
      }

      return Promise.reject(error);
    }
  );
};
