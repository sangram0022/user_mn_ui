import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDebouncedCallback } from 'use-debounce';
import { logger } from '@/core/logging';
import { useToast } from '@/hooks/useToast';
import { useStandardErrorHandler } from '@/shared/hooks/useStandardErrorHandler';
import { FormField } from './FormField';
import { FormStateManager } from '../utils/FormStateManager';
import { contactSchema, type ContactFormData } from '../utils/contactSchema';
import { isDevelopment } from '@/core/config';

export function EnhancedContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [characterCounts, setCharacterCounts] = useState({
    subject: 0,
    message: 0,
  });

  const toast = useToast();
  const handleError = useStandardErrorHandler();

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
      
      logger().info('Contact form submitted', { name: data.name, email: data.email });
      toast.success('Message sent successfully!');
      setSubmitSuccess(true);
      
      // Clear persisted state on successful submission
      FormStateManager.clear('contact_form');
      
      // Reset form after delay
      setTimeout(() => {
        form.reset();
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      handleError(error, {
        context: {
          operation: 'submitContactForm',
          formData: { name: data.name, email: data.email },
        },
        showToast: true,
      });
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
        {isDevelopment() && (
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
