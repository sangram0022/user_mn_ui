import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { logger } from '@/core/logging';
import { useToast } from '@/hooks/useToast';
import { FormField } from './FormField';
import { userSchema, type UserFormData } from '../utils/userSchema';

export function EnhancedRegistrationForm() {
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: '' });
  const [showPassword, setShowPassword] = useState(false);
  
  const toast = useToast();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
    mode: 'onChange',
  });

  const { register, handleSubmit, watch, formState: { errors, isValid } } = form;
  
  const password = watch('password');

  // Calculate password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength({ score: 0, feedback: '' });
      return;
    }

    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) score += 20;
    else feedback.push('At least 8 characters');

    if (/[a-z]/.test(password)) score += 20;
    else feedback.push('Lowercase letter');

    if (/[A-Z]/.test(password)) score += 20;
    else feedback.push('Uppercase letter');

    if (/\d/.test(password)) score += 20;
    else feedback.push('Number');

    if (/[^a-zA-Z0-9]/.test(password)) score += 20;
    else feedback.push('Special character');

    setPasswordStrength({
      score,
      feedback: feedback.length > 0 ? `Missing: ${feedback.join(', ')}` : 'Strong password!',
    });
  }, [password]);

  const onSubmit = async (data: UserFormData) => {
    logger().info('User registration submitted', { 
      email: data.email, 
      name: `${data.firstName} ${data.lastName}` 
    });
    toast.success('Registration successful! Welcome aboard.');
    // Handle registration
  };

  const getStrengthColor = (score: number) => {
    if (score < 40) return 'bg-red-500';
    if (score < 60) return 'bg-yellow-500';
    if (score < 80) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="max-w-md mx-auto p-8">
      <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label="First Name" error={errors.firstName?.message} required>
            <input
              {...register('firstName')}
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="First name"
            />
          </FormField>

          <FormField label="Last Name" error={errors.lastName?.message} required>
            <input
              {...register('lastName')}
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Last name"
            />
          </FormField>
        </div>

        {/* Email */}
        <FormField label="Email" error={errors.email?.message} required>
          <input
            {...register('email')}
            type="email"
            className={`w-full px-3 py-2 border rounded-lg ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="your@email.com"
          />
        </FormField>

        {/* Password with Strength Indicator */}
        <FormField label="Password" error={errors.password?.message} required>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              className={`w-full px-3 py-2 pr-10 border rounded-lg ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          
          {password && (
            <div className="mt-2">
              <div className="flex items-center mb-1">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getStrengthColor(passwordStrength.score)}`}
                    style={{ width: `${passwordStrength.score}%` }}
                  />
                </div>
                <span className="ml-2 text-xs text-gray-600">{passwordStrength.score}/100</span>
              </div>
              <p className="text-xs text-gray-600">{passwordStrength.feedback}</p>
            </div>
          )}
        </FormField>

        {/* Confirm Password */}
        <FormField label="Confirm Password" error={errors.confirmPassword?.message} required>
          <input
            {...register('confirmPassword')}
            type="password"
            className={`w-full px-3 py-2 border rounded-lg ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Confirm password"
          />
        </FormField>

        {/* Terms Acceptance */}
        <FormField label="" error={errors.acceptTerms?.message}>
          <label className="flex items-start space-x-3">
            <input
              {...register('acceptTerms')}
              type="checkbox"
              className="mt-1"
            />
            <span className="text-sm text-gray-700">
              I accept the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and{' '}
              <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
            </span>
          </label>
        </FormField>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isValid}
          className={`w-full py-3 rounded-lg font-semibold text-white ${
            isValid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Create Account
        </button>
      </form>
    </div>
  );
}
