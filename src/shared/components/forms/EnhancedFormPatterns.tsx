// ========================================
// Enhanced Form Components - Performance Optimized
// ========================================
// Modern form components with advanced features:
// - State persistence across sessions
// - Real-time validation with debouncing
// - Optimized re-renders
// - Progressive enhancement
// ========================================

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDebouncedCallback } from 'use-debounce';
import { z } from 'zod';

// ========================================
// Form Persistence Utility
// ========================================

class FormStateManager {
  private static PREFIX = 'form_persist_';

  static save(key: string, data: Record<string, unknown>, ttlHours = 24): void {
    try {
      const payload = {
        data,
        expiry: Date.now() + (ttlHours * 60 * 60 * 1000),
        timestamp: Date.now(),
      };
      localStorage.setItem(`${this.PREFIX}${key}`, JSON.stringify(payload));
    } catch (error) {
      console.warn('Form state persistence failed:', error);
    }
  }

  static load(key: string): Record<string, unknown> | null {
    try {
      const stored = localStorage.getItem(`${this.PREFIX}${key}`);
      if (!stored) return null;

      const { data, expiry } = JSON.parse(stored);
      if (Date.now() > expiry) {
        this.clear(key);
        return null;
      }
      return data;
    } catch (error) {
      console.warn('Form state loading failed:', error);
      return null;
    }
  }

  static clear(key: string): void {
    try {
      localStorage.removeItem(`${this.PREFIX}${key}`);
    } catch (error) {
      console.warn('Form state clearing failed:', error);
    }
  }
}

// ========================================
// Enhanced Contact Form Example
// ========================================

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long'),
  email: z.string().email('Invalid email address').max(100, 'Email too long'),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(100, 'Subject too long'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message too long'),
  phone: z.string().optional(),
  company: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function EnhancedContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [characterCounts, setCharacterCounts] = useState({
    subject: 0,
    message: 0,
  });

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
      phone: '',
      company: '',
    },
    mode: 'onChange',
  });

  const { register, handleSubmit, watch, setValue, formState: { errors, isValid, dirtyFields } } = form;

  // Watch form values for persistence and character counting
  const allValues = watch();
  
  // Load persisted state on mount
  useEffect(() => {
    const persisted = FormStateManager.load('contact_form');
    if (persisted) {
      Object.entries(persisted).forEach(([key, value]) => {
        setValue(key as keyof ContactFormData, value as string);
      });
    }
  }, [setValue]);

  // Debounced form persistence
  const persistFormData = useDebouncedCallback((values: ContactFormData) => {
    // Only persist if form has changes and is not being submitted
    if (Object.keys(dirtyFields).length > 0 && !isSubmitting) {
      FormStateManager.save('contact_form', values);
    }
  }, 1000);

  // Persist form on value changes
  useEffect(() => {
    persistFormData(allValues);
  }, [allValues, persistFormData]);

  // Update character counts
  useEffect(() => {
    setCharacterCounts({
      subject: allValues.subject?.length || 0,
      message: allValues.message?.length || 0,
    });
  }, [allValues.subject, allValues.message]);

  // Form submission
  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Form submitted:', data);
      setSubmitSuccess(true);
      
      // Clear persisted state on successful submission
      FormStateManager.clear('contact_form');
      
      // Reset form after delay
      setTimeout(() => {
        form.reset();
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-green-50 border border-green-200 rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Message Sent Successfully!</h2>
          <p className="text-green-600">Thank you for contacting us. We'll get back to you soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Enhanced Contact Form</h1>
        <p className="text-gray-600">
          Features form state persistence, real-time validation, and performance optimizations.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name and Email Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Full Name"
            error={errors.name?.message}
            required
          >
            <input
              {...register('name')}
              type="text"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your full name"
            />
          </FormField>

          <FormField
            label="Email Address"
            error={errors.email?.message}
            required
          >
            <input
              {...register('email')}
              type="email"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your email address"
            />
          </FormField>
        </div>

        {/* Phone and Company Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Phone Number"
            error={errors.phone?.message}
          >
            <input
              {...register('phone')}
              type="tel"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter your phone number (optional)"
            />
          </FormField>

          <FormField
            label="Company"
            error={errors.company?.message}
          >
            <input
              {...register('company')}
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter your company (optional)"
            />
          </FormField>
        </div>

        {/* Subject */}
        <FormField
          label="Subject"
          error={errors.subject?.message}
          required
        >
          <input
            {...register('subject')}
            type="text"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.subject ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="What's this about?"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Brief description of your inquiry</span>
            <span>{characterCounts.subject}/100 characters</span>
          </div>
        </FormField>

        {/* Message */}
        <FormField
          label="Message"
          error={errors.message?.message}
          required
        >
          <textarea
            {...register('message')}
            rows={5}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
              errors.message ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Tell us more about what you need help with..."
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Provide as much detail as possible</span>
            <span className={characterCounts.message > 800 ? 'text-orange-500' : ''}>
              {characterCounts.message}/1000 characters
            </span>
          </div>
        </FormField>

        {/* Form State Indicator */}
        {Object.keys(dirtyFields).length > 0 && (
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <div className="flex items-center text-blue-700">
              <span className="mr-2">💾</span>
              Form automatically saved
            </div>
            <button
              type="button"
              onClick={() => FormStateManager.clear('contact_form')}
              className="text-blue-600 hover:text-blue-800 text-xs underline"
            >
              Clear saved data
            </button>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className={`
              w-full px-8 py-4 rounded-lg font-semibold text-white text-lg
              transition-all duration-200 transform
              ${isValid && !isSubmitting
                ? 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] shadow-lg'
                : 'bg-gray-400 cursor-not-allowed'
              }
              ${isSubmitting ? 'animate-pulse' : ''}
            `}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                Sending Message...
              </div>
            ) : (
              'Send Message'
            )}
          </button>
        </div>

        {/* Form Analytics */}
        {import.meta.env.MODE === 'development' && (
          <details className="mt-8">
            <summary className="text-sm text-gray-500 cursor-pointer">Form Debug Info</summary>
            <div className="mt-2 p-4 bg-gray-50 rounded text-xs">
              <div>Valid: {isValid ? '✅' : '❌'}</div>
              <div>Dirty fields: {Object.keys(dirtyFields).length}</div>
              <div>Errors: {Object.keys(errors).length}</div>
              <div>Character counts: {JSON.stringify(characterCounts)}</div>
            </div>
          </details>
        )}
      </form>
    </div>
  );
}

// ========================================
// Reusable Form Field Component
// ========================================

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
  helpText?: string;
}

function FormField({ label, children, error, required, helpText }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <span className="mr-1">⚠️</span>
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  );
}

// ========================================
// Enhanced User Registration Form
// ========================================

const userSchema = z.object({
  firstName: z.string().min(2, 'First name too short').max(30, 'First name too long'),
  lastName: z.string().min(2, 'Last name too short').max(30, 'Last name too long'),
  email: z.string().email('Invalid email').max(100, 'Email too long'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(50, 'Password too long'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type UserFormData = z.infer<typeof userSchema>;

export function EnhancedRegistrationForm() {
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: '' });
  const [showPassword, setShowPassword] = useState(false);

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
    console.log('Registration data:', data);
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
              className={`w-full px-3 py-2 border rounded-lg ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="First name"
            />
          </FormField>

          <FormField label="Last Name" error={errors.lastName?.message} required>
            <input
              {...register('lastName')}
              className={`w-full px-3 py-2 border rounded-lg ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Last name"
            />
          </FormField>
        </div>

        {/* Email */}
        <FormField label="Email" error={errors.email?.message} required>
          <input
            {...register('email')}
            type="email"
            className={`w-full px-3 py-2 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="your@email.com"
          />
        </FormField>

        {/* Password with Strength Indicator */}
        <FormField label="Password" error={errors.password?.message} required>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              className={`w-full px-3 py-2 pr-10 border rounded-lg ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
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
            className={`w-full px-3 py-2 border rounded-lg ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
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

export { FormStateManager };