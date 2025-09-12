import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { cookies } from 'next/headers';
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthData,
  Vocab,
  Document,
  Highlight,
  CreateHighlightRequest,
  UpdateHighlightRequest,
  HighlightFilters,
  ApiResponse,
  PaginatedResponse,
  UserStats,
  PaginationQuery,
  CreateVocabRequest,
  VocabQueryParams,
  UpdateVocabRequest,
} from '@/types';
import { makePaginatedRequestWrapper, makeRequestWrapper } from './utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance for server-side requests
const createServerApiClient = async (forcedToken?: string): Promise<AxiosInstance> => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    validateStatus: (status) => {
      // Accept all status codes to prevent axios from throwing errors
      return status >= 200 && status < 500;
    },
  });

  if (forcedToken) {
    client.defaults.headers.common['Authorization'] = `Bearer ${forcedToken}`;

    return client;
  }

  const token = await serverApi.getToken();
  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  return client;
};

// Server-side API functions
export const serverApi = {
  // Get token from server-side cookies
  getToken: async (
    type: 'access_token' | 'refresh_token' = 'access_token'
  ): Promise<string | undefined> => {
    try {
      const cookieStore = await cookies();
      return cookieStore.get(type)?.value || undefined;
    } catch {
      return undefined;
    }
  },

  // Auth endpoints
  auth: {
    login: async (data: LoginRequest): Promise<ApiResponse<AuthData>> => {
      const client = await createServerApiClient();
      const response = await makeRequestWrapper<AuthData>(() =>
        client.post('/api/auth/login', data)
      );
      return response;
    },

    register: async (data: RegisterRequest): Promise<ApiResponse<AuthData>> => {
      const client = await createServerApiClient();
      const response = await makeRequestWrapper<AuthData>(() =>
        client.post('/api/auth/register', data)
      );
      return response;
    },

    refresh: async (): Promise<ApiResponse<AuthData>> => {
      const refreshToken = await serverApi.getToken('refresh_token');
      const client = await createServerApiClient(refreshToken);
      const response = await makeRequestWrapper<AuthData>(() => client.post('/api/auth/refresh'));
      return response;
    },
  },

  // User endpoints
  users: {
    getProfile: async (): Promise<ApiResponse<User>> => {
      const client = await createServerApiClient();
      const response = await makeRequestWrapper<User>(() => client.get('/api/users/profile'));
      return response;
    },

    getStats: async (): Promise<ApiResponse<UserStats>> => {
      const client = await createServerApiClient();
      const response = await client.get('/api/users/stats');
      return response.data;
    },
  },

  // Vocabulary endpoints
  vocabs: {
    getMyVocabs: async (query: VocabQueryParams = {}): Promise<PaginatedResponse<Vocab>> => {
      const client = await createServerApiClient();
      const response = await makePaginatedRequestWrapper<Vocab>(() =>
        client.get('/api/vocabs/me', { params: query })
      );
      return response;
    },

    getById: async (id: string): Promise<ApiResponse<Vocab>> => {
      const client = await createServerApiClient();
      const response = await client.get(`/api/vocabs/${id}`);
      return response.data;
    },

    getStats: async (): Promise<ApiResponse<any>> => {
      const client = await createServerApiClient();
      const response = await client.get('/api/vocabs/stats');
      return response.data;
    },

    create: async (data: CreateVocabRequest): Promise<ApiResponse<Vocab>> => {
      const client = await createServerApiClient();
      const response = await makeRequestWrapper<Vocab>(() => client.post('/api/vocabs', data));

      return response;
    },

    update: async (id: string, data: UpdateVocabRequest): Promise<ApiResponse<Vocab>> => {
      const client = await createServerApiClient();
      const response = await makeRequestWrapper<Vocab>(() => client.put(`/api/vocabs/${id}`, data));

      return response;
    },

    delete: async (id: string): Promise<ApiResponse<null>> => {
      const client = await createServerApiClient();
      const response = await makeRequestWrapper<null>(() => client.delete(`/api/vocabs/${id}`));

      return response;
    },
  },

  // Document endpoints
  documents: {
    getMyDocuments: async (query: PaginationQuery = {}): Promise<PaginatedResponse<Document>> => {
      const client = await createServerApiClient();
      const response = await makePaginatedRequestWrapper<Document>(() =>
        client.get('/api/documents', { params: query })
      );
      return response;
    },

    getById: async (id: string): Promise<ApiResponse<Document>> => {
      const client = await createServerApiClient();
      const response = await makeRequestWrapper<Document>(() => client.get(`/api/documents/${id}`));
      return response;
    },

    import: async (formData: FormData): Promise<ApiResponse<Document>> => {
      const client = await createServerApiClient();
      const response = await makeRequestWrapper<Document>(() =>
        client.post('/api/documents/import', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      );
      return response;
    },

    delete: async (id: string): Promise<ApiResponse<null>> => {
      const client = await createServerApiClient();
      const response = await makeRequestWrapper<null>(() => client.delete(`/api/documents/${id}`));
      return response;
    },
  },

  // Highlight endpoints
  highlights: {
    getDocumentHighlights: async (
      documentId: string,
      filters: HighlightFilters = {}
    ): Promise<PaginatedResponse<Highlight>> => {
      const client = await createServerApiClient();
      const response = await makePaginatedRequestWrapper<Highlight>(() =>
        client.get(`/api/highlights/document/${documentId}`, { params: filters })
      );
      return response;
    },

    create: async (data: CreateHighlightRequest): Promise<ApiResponse<Highlight>> => {
      const client = await createServerApiClient();
      const response = await makeRequestWrapper<Highlight>(() =>
        client.post('/api/highlights', data)
      );
      return response;
    },

    update: async (id: string, data: UpdateHighlightRequest): Promise<ApiResponse<Highlight>> => {
      const client = await createServerApiClient();
      const response = await makeRequestWrapper<Highlight>(() =>
        client.put(`/api/highlights/${id}`, data)
      );
      return response;
    },

    delete: async (id: string): Promise<ApiResponse<null>> => {
      const client = await createServerApiClient();
      const response = await makeRequestWrapper<null>(() => client.delete(`/api/highlights/${id}`));
      return response;
    },
  },
};
