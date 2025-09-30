'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

// Forgot password schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ResetPasswordFormProps {
  onSuccess?: () => void;
  onBackToSignIn?: () => void;
}

export default function ResetPasswordForm({
  onSuccess,
  onBackToSignIn,
}: ResetPasswordFormProps) {
  const { recoverPassword, isLoading } = useAuth();

  const forgotPasswordForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    const response = await recoverPassword(data.email);

    // If password recovery was successful, call onSuccess callback
    if (response.success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <form
      onSubmit={forgotPasswordForm.handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <div>
        <label
          htmlFor="forgotEmail"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Email Address
        </label>
        <Input
          type="email"
          id="forgotEmail"
          {...forgotPasswordForm.register('email')}
          placeholder="your@email.com"
          className={
            forgotPasswordForm.formState.errors.email ? 'border-red-500' : ''
          }
        />
        {forgotPasswordForm.formState.errors.email && (
          <p className="mt-1 text-sm text-red-600">
            {forgotPasswordForm.formState.errors.email.message}
          </p>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
        <p className="text-sm text-amber-700">
          <strong>📧 Password Reset Instructions</strong>
          <br />
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </p>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Sending...' : 'Send Reset Link'}
      </Button>

      {onBackToSignIn && (
        <Button
          type="button"
          variant="outline"
          onClick={onBackToSignIn}
          className="w-full"
        >
          Back to Sign In
        </Button>
      )}
    </form>
  );
}
