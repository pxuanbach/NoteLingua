// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
}

// Pagination Query
export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}
