'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

// Login schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface SignInFormProps {
  onSuccess?: () => void;
  onForgotPassword?: () => void;
}

export default function SignInForm({
  onSuccess,
  onForgotPassword,
}: SignInFormProps) {
  const { login, isLoading } = useAuth();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    const response = await login(data.email, data.password);

    // If login was successful, call onSuccess callback
    if (response.success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={loginForm.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Email Address
        </label>
        <Input
          type="email"
          id="email"
          {...loginForm.register('email')}
          placeholder="your@email.com"
          className={loginForm.formState.errors.email ? 'border-red-500' : ''}
        />
        {loginForm.formState.errors.email && (
          <p className="mt-1 text-sm text-red-600">
            {loginForm.formState.errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Password
        </label>
        <Input
          type="password"
          id="password"
          {...loginForm.register('password')}
          placeholder="Your password"
          className={
            loginForm.formState.errors.password ? 'border-red-500' : ''
          }
        />
        {loginForm.formState.errors.password && (
          <p className="mt-1 text-sm text-red-600">
            {loginForm.formState.errors.password.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Signing In...' : 'Sign In'}
      </Button>

      {onForgotPassword && (
        <Button
          type="button"
          variant="link"
          onClick={onForgotPassword}
          className="w-full text-sm"
        >
          Forgot your password?
        </Button>
      )}
    </form>
  );
}
