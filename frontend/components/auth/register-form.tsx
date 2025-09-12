'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/templates';
import { registerAction } from '@/lib/actions/auth';
import { FormState } from '@/types';

export function RegisterForm() {
  const [formState, setFormState] = useState<FormState>({
    isLoading: false,
  });

  const handleSubmit = async (formData: FormData) => {
    setFormState({ isLoading: true, error: undefined });

    try {
      const result = await registerAction(formData);
      
      if (result?.error) {
        setFormState({ 
          isLoading: false, 
          error: result.error 
        });
      } else {
        setFormState({ isLoading: false, success: 'Registration successful!' });
        // registerAction will handle redirect
      }
    } catch (error) {
      setFormState({ 
        isLoading: false, 
        error: 'An unexpected error occurred' 
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Sign up to start your vocabulary learning journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium">
                First Name
              </label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="John"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium">
                Last Name
              </label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Doe"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Create a strong password"
              required
            />
          </div>
          
          {formState.error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {formState.error}
            </div>
          )}
          
          {formState.success && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
              {formState.success}
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={formState.isLoading}
          >
            {formState.isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
          
          <div className="text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
