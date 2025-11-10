import React from 'react';
import Input from '../../../../shared/components/ui/Input';
import Button from '../../../../shared/components/ui/Button';
import type { UseFormReturn } from 'react-hook-form';

interface Props<T> {
  form: UseFormReturn<T> & { handleSubmit: (e?: any) => void };
  isEditing: boolean;
  onCancel: () => void;
}

export default function ProfileForm<T>({ form, isEditing, onCancel }: Props<T>) {
  const { register, formState } = form;

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
              <Input {...(register as any)('first_name')} error={(formState.errors as any).first_name?.message} disabled={formState.isSubmitting} />
            ) : (
              <p className="py-2 text-gray-900">{(form.getValues as any)('first_name') || ''}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            {isEditing ? (
              <Input {...(register as any)('last_name')} error={(formState.errors as any).last_name?.message} disabled={formState.isSubmitting} />
            ) : (
              <p className="py-2 text-gray-900">{(form.getValues as any)('last_name') || ''}</p>
            )}
          </div>

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
