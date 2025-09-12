import { VocabQueryParams } from '@/types';
import { serverApi } from '../server-api';

export async function getUsersStatsAction() {
  const response = await serverApi.users.getStats();

  if (response.success) {
    return { data: response.data };
  } else {
    return { error: response.message || 'Failed to fetch user stats' };
  }
}

export async function getProfileAction() {
  const response = await serverApi.users.getProfile();

  if (response.success) {
    return { data: response.data };
  } else {
    return { error: response.message || 'Failed to fetch user profile' };
  }
}
