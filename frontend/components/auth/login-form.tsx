'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Button,
  Input,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/templates';
import { loginAction } from '@/lib/actions/auth';
import { FormState } from '@/types';

export function LoginForm() {
  const [formState, setFormState] = useState<FormState>({
    isLoading: false,
  });

  const handleSubmit = async (formData: FormData) => {
    setFormState({ isLoading: true, error: undefined });

    try {
      const result = await loginAction(formData);

      if (result?.error) {
        setFormState({
          isLoading: false,
          error: result.error,
        });
      } else {
        setFormState({ isLoading: false, success: 'Login successful!' });
      }
    } catch (error) {
      setFormState({
        isLoading: false,
        error: 'An unexpected error occurred',
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to your account to continue learning</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input id="email" name="email" type="email" placeholder="Enter your email" required />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              required
            />
          </div>

          {formState.error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{formState.error}</div>
          )}

          {formState.success && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
              {formState.success}
            </div>
          )}

          <Button type="submit" disabled={formState.isLoading}>
            {formState.isLoading ? 'Signing In...' : 'Sign In'}
          </Button>

          <div className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
