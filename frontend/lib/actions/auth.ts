'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { serverApi } from '../server-api';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }
  const response = await serverApi.auth.login({ email, password });

  if (response.success) {
    const cookieStore = await cookies();
    
    // Set access token (expires in 1 day)
    cookieStore.set('access_token', response.data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 1 day
    });
    
    // Set refresh token (expires in 7 days)
    cookieStore.set('refresh_token', response.data.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return { success: true };
  } else {
    return { error: response.message || 'Login failed' };
  }
}

export async function registerAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;

  if (!email || !password || !firstName || !lastName) {
    return { error: 'Email, password, first name, and last name are required' };
  }

  const registerData = {
    email,
    password,
    firstName,
    lastName,
  };

  const response = await serverApi.auth.register(registerData);

  if (response.success) {
    redirect('/login');
  } else {
    return { error: response.message || 'Registration failed' };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');
  redirect('/login');
}
