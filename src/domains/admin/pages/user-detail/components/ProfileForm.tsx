import React from 'react';
import Input from '../../../../shared/components/ui/Input';
import Button from '../../../../shared/components/ui/Button';
import type { UseFormReturn } from 'react-hook-form';
import type { UserEditFormData } from '../../../../../core/validation/schemas';
import type { DateInput } from '../../../../../shared/utils/dateFormatters';
import { GENDER_OPTIONS } from '../utils';
import { formatShortDate } from '../../../../../shared/utils/dateFormatters';

interface Props {
  form: Omit<UseFormReturn<UserEditFormData>, 'handleSubmit'> & { handleSubmit: (e?: React.BaseSyntheticEvent) => void | Promise<void> };
  isEditing: boolean;
  onCancel: () => void;
}

export default function ProfileForm({ form, isEditing, onCancel }: Props) {
  const { register, formState, getValues } = form;
  const dob = getValues('date_of_birth');

  return (
    <div className="bg-white shadow-sm rounded-lg border">
      <div className="px-6 py-4 border-b">
        <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
      </div>
      <form onSubmit={form.handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            {isEditing ? (
              <Input {...register('first_name')} error={formState.errors.first_name?.message} disabled={formState.isSubmitting} />
            ) : (
              <p className="py-2 text-gray-900">{getValues('first_name') || ''}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            {isEditing ? (
              <Input {...register('last_name')} error={formState.errors.last_name?.message} disabled={formState.isSubmitting} />
            ) : (
              <p className="py-2 text-gray-900">{getValues('last_name') || ''}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            {isEditing ? (
              <Input type="email" {...register('email')} error={formState.errors.email?.message} disabled={formState.isSubmitting} />
            ) : (
              <p className="py-2 text-gray-900">{getValues('email') || ''}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            {isEditing ? (
              <Input {...register('username')} error={formState.errors.username?.message} disabled={formState.isSubmitting} />
            ) : (
              <p className="py-2 text-gray-900">{getValues('username') || 'N/A'}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            {isEditing ? (
              <Input type="tel" {...register('phone_number')} error={formState.errors.phone_number?.message} disabled={formState.isSubmitting} />
            ) : (
              <p className="py-2 text-gray-900">{getValues('phone_number') || 'N/A'}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
            {isEditing ? (
              <Input type="date" {...register('date_of_birth')} error={formState.errors.date_of_birth?.message} disabled={formState.isSubmitting} />
            ) : (
              <p className="py-2 text-gray-900">{dob ? formatShortDate(dob as DateInput) : 'N/A'}</p>
            )}
          </div>

          {/* Gender */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            {isEditing ? (
              <select {...register('gender')} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={formState.isSubmitting}>
                <option value="">Select gender</option>
                {GENDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            ) : (
              <p className="py-2 text-gray-900">{getValues('gender') ? GENDER_OPTIONS.find(opt => opt.value === getValues('gender'))?.label : 'N/A'}</p>
            )}
            { formState.errors.gender && <p className="mt-1 text-sm text-red-600">{formState.errors.gender.message}</p> }
          </div>

          {/* Bio */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
            {isEditing ? (
              <textarea {...register('bio')} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={formState.isSubmitting} placeholder="Tell us about yourself..." />
            ) : (
              <p className="py-2 text-gray-900 whitespace-pre-wrap">{getValues('bio') || 'No bio provided'}</p>
            )}
            { formState.errors.bio && <p className="mt-1 text-sm text-red-600">{formState.errors.bio.message}</p> }
          </div>

          {/* Status checkboxes in edit mode */}
          {isEditing && (
            <div className="md:col-span-2 grid grid-cols-3 gap-4">
              <label className="flex items-center gap-3"><input type="checkbox" {...register('is_active')} className="mt-1" /> <span className="text-sm text-gray-700">Active</span></label>
              <label className="flex items-center gap-3"><input type="checkbox" {...register('is_verified')} className="mt-1" /> <span className="text-sm text-gray-700">Verified</span></label>
              <label className="flex items-center gap-3"><input type="checkbox" {...register('is_approved')} className="mt-1" /> <span className="text-sm text-gray-700">Approved</span></label>
            </div>
          )}

          {/* Other fields are handled similarly in the original page; keep rendering minimal here */}
        </div>

        {/* Form Actions */}
        {isEditing && (
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
            <Button type="button" variant="secondary" onClick={onCancel} disabled={formState.isSubmitting}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={formState.isSubmitting} loading={formState.isSubmitting}>Save Changes</Button>
          </div>
        )}
      </form>
    </div>
  );
}
