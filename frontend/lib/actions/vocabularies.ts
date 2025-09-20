'use server';

import { serverApi } from '../server-api';
import { CreateVocabRequest, VocabQueryParams } from '@/types';

export async function getMyVocabsAction({
  tags,
  source_type,
  page = 1,
  limit = 10,
  ...otherPagiParams
}: VocabQueryParams) {
  const response = await serverApi.vocabs.getMyVocabs({
    tags,
    source_type,
    page,
    limit,
    ...otherPagiParams,
  });

  if (response.success) {
    return { data: response.data, pagination: response.pagination };
  } else {
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

export async function createVocabAction(data: CreateVocabRequest) {
  const response = await serverApi.vocabs.create(data);

  if (response.success) {
    return { data: response.data };
  } else {
    return { error: 'Failed to create vocabulary' };
  }
}

export async function updateVocabAction(id: string, data: CreateVocabRequest) {
  const response = await serverApi.vocabs.update(id, data);

  if (response.success) {
    return { data: response.data };
  } else {
    return { error: 'Failed to update vocabulary' };
  }
}

export async function deleteVocabAction(id: string) {
  const response = await serverApi.vocabs.delete(id);

  if (response.success) {
    return { data: response.data };
  } else {
    return { error: 'Failed to delete vocabulary' };
  }
}
