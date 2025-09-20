import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { serverApi } from './server-api';
import { User } from '@/types';

export interface AuthResult {
  user: User | null;
}

// Server-side authentication check
export async function getServerAuth(): Promise<AuthResult> {
  try {
    const response = await serverApi.users.getProfile();

    if (response.success) {
      return { user: response.data };
    }

    return { user: null };
  } catch (error) {
    return { user: null };
  }
}

// Require authentication for protected pages
export async function requireAuth(redirectTo: string = '/login'): Promise<AuthResult> {
  const auth = await getServerAuth();

  if (!auth.user) {
    redirect(redirectTo);
  }

  return auth;
}

// Redirect if already authenticated
export async function redirectIfAuthenticated(redirectTo: string = '/home'): Promise<void> {
  const auth = await getServerAuth();

  if (auth.user) {
    redirect(redirectTo);
  }
}

// Set authentication cookies (for server actions)
export async function setAuthCookies(token: string, refreshToken: string) {
  const cookieStore = await cookies();

  // Set access token (expires in 1 day)
  cookieStore.set('access_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60, // 1 day
  });

  // Set refresh token (expires in 7 days)
  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

// Clear authentication cookies (for server actions)
export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');
}
