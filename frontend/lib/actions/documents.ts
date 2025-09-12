'use server';

import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { serverApi } from '@/lib/server-api';
import { Document } from '@/types';

export async function importDocumentAction(formData: FormData) {
  const file = formData.get('document') as File;

  if (!file) {
    return {
      success: false,
      message: 'No file provided',
    };
  }

  // Validate file type
  const allowedTypes = ['application/pdf', 'text/plain'];
  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      message: 'Only PDF and text files are allowed',
    };
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      success: false,
      message: 'File size must be less than 10MB',
    };
  }

  const apiFormData = new FormData();
  apiFormData.append('document', file);

  const response = await serverApi.documents.import(apiFormData);

  if (response.success) {
    revalidatePath('/imports');
    return {
      success: true,
      message: 'Document imported successfully',
      data: response.data,
    };
  } else {
    return {
      success: false,
      message: response.message || 'Import failed',
    };
  }
}

export async function getMyDocumentsAction(params: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const { page = 1, limit = 10, search = '' } = params;

  try {
    const query: any = { page, limit };
    if (search) {
      query.search = search;
    }

    const response = await serverApi.documents.getMyDocuments(query);

    return {
      data: response.data || [],
      pagination: response.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
      },
    };
  } catch (error) {
    console.error('Get documents action error:', error);
    return {
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
      },
    };
  }
}

export async function deleteDocumentAction(id: string) {
  const response = await serverApi.documents.delete(id);

  if (response.success) {
    revalidatePath('/imports');
    return {
      success: true,
      message: 'Document deleted successfully',
    };
  } else {
    return {
      success: false,
      message: response.message || 'Delete failed',
    };
  }
}

export async function getDocumentByIdAction(id: string): Promise<{ data: Document }> {
  const response = await serverApi.documents.getById(id);

  if (response.success) {
    return {
      data: response.data,
    };
  } else {
    notFound();
  }
}
