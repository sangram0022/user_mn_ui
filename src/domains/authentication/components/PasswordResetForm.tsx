import React, { useState } from 'react';

interface PasswordResetFormProps {
  onSubmit: (data: { token: string; password: string }) => void;
  isLoading?: boolean;
  error?: string;
  token?: string;
}

export const PasswordResetForm: React.FC<PasswordResetFormProps> = ({
  onSubmit,
  isLoading,
  error,
  token = '',
}) => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setValidationError('Password must be at least 8 characters long');
      return;
    }

    onSubmit({
      token,
      password: formData.password,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {(error || validationError) && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || validationError}
        </div>
      )}

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          New Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="New password"
          value={formData.password}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm New Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Confirm new password"
          value={formData.confirmPassword}
          onChange={handleChange}
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Resetting...' : 'Reset password'}
        </button>
      </div>
    </form>
  );
};

export default PasswordResetForm;
