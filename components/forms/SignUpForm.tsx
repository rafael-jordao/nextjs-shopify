'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

// Register schema with password
const registerSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password confirmation is required'),
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    phone: z
      .string()
      .min(1, 'Phone number is required')
      .refine(
        (phone) => {
          if (!phone || phone.trim() === '') return false;
          // Remove all non-numeric characters
          const cleanPhone = phone.replace(/\D/g, '');
          // Should be a valid international format (at least 10 digits)
          return cleanPhone.length >= 10 && cleanPhone.length <= 15;
        },
        {
          message: 'Please enter a valid phone number (10-15 digits)',
        }
      ),
    acceptsMarketing: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface SignUpFormProps {
  onSuccess?: () => void;
}

export default function SignUpForm({ onSuccess }: SignUpFormProps) {
  const { register, isLoading } = useAuth();

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Function to format phone for Shopify
  const formatPhoneForShopify = (phone: string): string => {
    // Remove all non-numeric characters
    const cleanPhone = phone.replace(/\D/g, '');

    // If it has 11 digits, add +55 (Brazil)
    if (cleanPhone.length === 11) {
      return `+55${cleanPhone}`;
    }

    // If it has 13 digits and starts with 55, add +
    if (cleanPhone.length === 13 && cleanPhone.startsWith('55')) {
      return `+${cleanPhone}`;
    }

    // If it already starts with +55, clean and format
    if (phone.startsWith('+55')) {
      return phone.replace(/\D/g, '').replace(/^55/, '+55');
    }

    // For other countries, assume it's correctly formatted
    if (cleanPhone.length >= 10) {
      return `+${cleanPhone}`;
    }

    // Return as received if can't format
    return phone;
  };

  const onSubmit = async (data: RegisterFormData) => {
    const response = await register({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: formatPhoneForShopify(data.phone),
      acceptsMarketing: data.acceptsMarketing || false,
    });

    // If registration was successful, call onSuccess callback
    if (response.success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={registerForm.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            First Name
          </label>
          <Input
            type="text"
            id="firstName"
            {...registerForm.register('firstName')}
            placeholder="John"
            className={
              registerForm.formState.errors.firstName ? 'border-red-500' : ''
            }
          />
          {registerForm.formState.errors.firstName && (
            <p className="mt-1 text-sm text-red-600">
              {registerForm.formState.errors.firstName.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Last Name
          </label>
          <Input
            type="text"
            id="lastName"
            {...registerForm.register('lastName')}
            placeholder="Doe"
            className={
              registerForm.formState.errors.lastName ? 'border-red-500' : ''
            }
          />
          {registerForm.formState.errors.lastName && (
            <p className="mt-1 text-sm text-red-600">
              {registerForm.formState.errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="registerEmail"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Email Address
        </label>
        <Input
          type="email"
          id="registerEmail"
          {...registerForm.register('email')}
          placeholder="your@email.com"
          className={
            registerForm.formState.errors.email ? 'border-red-500' : ''
          }
        />
        {registerForm.formState.errors.email && (
          <p className="mt-1 text-sm text-red-600">
            {registerForm.formState.errors.email.message}
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
          {...registerForm.register('password')}
          placeholder="Create a password"
          className={
            registerForm.formState.errors.password ? 'border-red-500' : ''
          }
        />
        {registerForm.formState.errors.password && (
          <p className="mt-1 text-sm text-red-600">
            {registerForm.formState.errors.password.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Confirm Password
        </label>
        <Input
          type="password"
          id="confirmPassword"
          {...registerForm.register('confirmPassword')}
          placeholder="Confirm your password"
          className={
            registerForm.formState.errors.confirmPassword
              ? 'border-red-500'
              : ''
          }
        />
        {registerForm.formState.errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">
            {registerForm.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Phone Number
        </label>
        <Input
          type="tel"
          id="phone"
          {...registerForm.register('phone')}
          placeholder="5511999999999"
          className={
            registerForm.formState.errors.phone ? 'border-red-500' : ''
          }
        />
        {registerForm.formState.errors.phone && (
          <p className="mt-1 text-sm text-red-600">
            {registerForm.formState.errors.phone.message}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Will be formatted as +5511999999999
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="acceptsMarketing"
          {...registerForm.register('acceptsMarketing')}
          className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
        />
        <label htmlFor="acceptsMarketing" className="text-sm text-gray-700">
          I want to receive marketing emails and updates
        </label>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );
}
