'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useAuth } from '@/contexts/AuthContext';
import type { User } from '@/types/shopify';

// Profile edit schema
const profileEditSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .optional()
    .refine(
      (phone) => {
        if (!phone || phone.trim() === '') return true; // Optional field
        // Remove all non-numeric characters
        const cleanPhone = phone.replace(/\D/g, '');
        // International phone numbers typically have 7-15 digits
        return cleanPhone.length >= 7 && cleanPhone.length <= 15;
      },
      {
        message: 'Please enter a valid phone number (7-15 digits)',
      }
    ),
});

type ProfileEditFormData = z.infer<typeof profileEditSchema>;

// Function to format international phone number
const formatPhoneForShopify = (
  phone: string | undefined
): string | undefined => {
  if (!phone || phone.trim() === '') return undefined;

  // Remove all non-numeric characters
  const cleanPhone = phone.replace(/\D/g, '');

  // If phone already starts with +, keep it as is (already formatted)
  if (phone.startsWith('+')) {
    return phone.replace(/[^+\d]/g, ''); // Keep only + and digits
  }

  // If phone doesn't start with + and has valid length, add + prefix
  if (cleanPhone.length >= 7 && cleanPhone.length <= 15) {
    return `+${cleanPhone}`;
  }

  // Return the cleaned phone number as fallback
  return cleanPhone || undefined;
};

interface AccountProfileProps {
  user: User;
}

export default function AccountProfile({ user }: AccountProfileProps) {
  const { updateUser } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Profile edit form
  const profileForm = useForm<ProfileEditFormData>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  // Update form values when user changes
  useEffect(() => {
    if (user) {
      profileForm.reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user, profileForm]);

  // Handle profile update
  const onProfileSubmit = async (data: ProfileEditFormData) => {
    setIsUpdatingProfile(true);

    try {
      await updateUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: formatPhoneForShopify(data.phone),
      });

      toast.success('Profile updated successfully!');
      setIsEditingProfile(false);
    } catch (error) {
      toast.error('Error updating profile. Please try again.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    if (user) {
      profileForm.reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Profile Information
          </h3>
          {!isEditingProfile && (
            <Button onClick={() => setIsEditingProfile(true)} variant="outline">
              Edit Profile
            </Button>
          )}
        </div>
      </div>
      <div className="px-6 py-6">
        {isEditingProfile ? (
          <form
            onSubmit={profileForm.handleSubmit(onProfileSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <Input
                  type="text"
                  {...profileForm.register('firstName')}
                  className={
                    profileForm.formState.errors.firstName
                      ? 'border-red-500'
                      : ''
                  }
                />
                {profileForm.formState.errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">
                    {profileForm.formState.errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <Input
                  type="text"
                  {...profileForm.register('lastName')}
                  className={
                    profileForm.formState.errors.lastName
                      ? 'border-red-500'
                      : ''
                  }
                />
                {profileForm.formState.errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">
                    {profileForm.formState.errors.lastName.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  {...profileForm.register('email')}
                  className={
                    profileForm.formState.errors.email ? 'border-red-500' : ''
                  }
                />
                {profileForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {profileForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone (Optional)
                </label>
                <Input
                  type="tel"
                  {...profileForm.register('phone')}
                  placeholder="+1234567890 (international format)"
                  className={
                    profileForm.formState.errors.phone ? 'border-red-500' : ''
                  }
                />
                {profileForm.formState.errors.phone && (
                  <p className="mt-1 text-sm text-red-600">
                    {profileForm.formState.errors.phone.message}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Enter with country code (e.g., +1 for US, +55 for Brazil)
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                type="submit"
                disabled={isUpdatingProfile}
                className="flex-1 sm:flex-none"
              >
                {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isUpdatingProfile}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <Input
                type="text"
                value={user.firstName}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <Input
                type="text"
                value={user.lastName}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={user.email}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <Input
                type="tel"
                value={user.phone || ''}
                placeholder="No phone number registered"
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
