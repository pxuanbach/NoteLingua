import { ApiResponse, PaginatedResponse } from '@/types';
import { AxiosResponse } from 'axios';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const makeRequestWrapper = async <T>(
  requestFunc: () => Promise<AxiosResponse<ApiResponse<T>>>
): Promise<ApiResponse<T>> => {
  try {
    return (await requestFunc()).data;
  } catch (error) {
    return {
      data: {
        success: false,
        message: 'An unexpected error occurred',
      },
    } as ApiResponse<T>;
  }
};

export const makePaginatedRequestWrapper = async <T>(
  requestFunc: () => Promise<AxiosResponse<PaginatedResponse<T>>>
): Promise<PaginatedResponse<T>> => {
  try {
    return (await requestFunc()).data;
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
