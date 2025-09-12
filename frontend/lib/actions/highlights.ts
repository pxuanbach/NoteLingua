'use server';

import { serverApi } from '@/lib/server-api';
import {
  Highlight,
  CreateHighlightRequest,
  UpdateHighlightRequest,
  HighlightFilters,
} from '@/types';

export async function getDocumentHighlightsAction(
  documentId: string,
  filters: HighlightFilters = {}
) {
  try {
    const response = await serverApi.highlights.getDocumentHighlights(documentId, filters);

    return {
      data: response.data || [],
      pagination: response.pagination || {
        page: 1,
        limit: 50,
        total: 0,
        pages: 0,
      },
    };
  } catch (error) {
    console.error('Failed to fetch document highlights:', error);
    return {
      data: [],
      pagination: {
        page: 1,
        limit: 50,
        total: 0,
        pages: 0,
      },
    };
  }
}

export async function createHighlightAction(data: CreateHighlightRequest) {
  try {
    const response = await serverApi.highlights.create(data);

    return {
      success: response.success,
      data: response.data,
      message: response.message,
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Failed to create highlight',
    };
  }
}

export async function updateHighlightAction(id: string, data: UpdateHighlightRequest) {
  try {
    const response = await serverApi.highlights.update(id, data);

    return {
      success: response.success,
      data: response.data,
      message: response.message,
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Failed to update highlight',
    };
  }
}

export async function deleteHighlightAction(id: string) {
  try {
    const response = await serverApi.highlights.delete(id);

    return {
      success: response.success,
      message: response.message,
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Failed to delete highlight',
    };
  }
}
