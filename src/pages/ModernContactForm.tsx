/**
 * Modern Contact Form - React Hook Form Implementation
 * Shows how React Hook Form improves form handling with complex validation
 * and better performance for large forms
 */

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../components';
import Input from '../components/Input';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { useToast } from '../hooks/useToast';
import { contactFormSchema, type ContactFormData } from '../core/validation/schemas';

const DEPARTMENT_OPTIONS = [
  { value: '', label: 'Select Department' },
  { value: 'sales', label: 'Sales' },
  { value: 'support', label: 'Technical Support' },
  { value: 'billing', label: 'Billing' },
  { value: 'general', label: 'General Inquiry' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', variant: 'info' as const },
  { value: 'normal', label: 'Normal', variant: 'gray' as const },
  { value: 'high', label: 'High', variant: 'warning' as const },
];

export function ModernContactForm() {
  const toast = useToast();

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty, isValid, touchedFields },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
      department: '',
      subject: '',
      message: '',
      priority: 'normal',
      newsletter: false,
    },
    mode: 'onBlur', // Validate on blur for better UX
  });

  // Watch priority for dynamic styling
  const priority = watch('priority');
  const messageLength = watch('message')?.length || 0;

  const onSubmit = async (data: ContactFormData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Form submitted:', data);
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      reset(); // Reset form after successful submission
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have a question or need support? Send us a message and we'll respond within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      {...register('name')}
                      label="Full Name"
                      placeholder="John Doe"
                      error={errors.name?.message}
                      className={touchedFields.name && !errors.name ? 'border-green-300' : ''}
                      data-testid="contact-name-input"
                    />
                  </div>
                  <div>
                    <Input
                      {...register('email')}
                      type="email"
                      label="Email Address"
                      placeholder="john@example.com"
                      error={errors.email?.message}
                      className={touchedFields.email && !errors.email ? 'border-green-300' : ''}
                      data-testid="contact-email-input"
                    />
                  </div>
                </div>

                {/* Company Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      {...register('company')}
                      label="Company (Optional)"
                      placeholder="Acme Corporation"
                      error={errors.company?.message}
                      data-testid="contact-company-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <select
                      {...register('department')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      data-testid="contact-department-select"
                    >
                      {DEPARTMENT_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.department && (
                      <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
                    )}
                  </div>
                </div>

                {/* Message Details */}
                <div>
                  <Input
                    {...register('subject')}
                    label="Subject"
                    placeholder="How can we help you?"
                    error={errors.subject?.message}
                    className={touchedFields.subject && !errors.subject ? 'border-green-300' : ''}
                    data-testid="contact-subject-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                    <span className="text-gray-500 text-xs ml-2">
                      ({messageLength}/2000 characters)
                    </span>
                  </label>
                  <textarea
                    {...register('message')}
                    rows={6}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.message ? 'border-red-300' : 'border-gray-300'
                    } ${touchedFields.message && !errors.message ? 'border-green-300' : ''}`}
                    placeholder="Tell us more about your inquiry..."
                    data-testid="contact-message-textarea"
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                  )}
                </div>

                {/* Priority Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Priority Level
                  </label>
                  <Controller
                    name="priority"
                    control={control}
                    render={({ field }) => (
                      <div className="flex gap-3">
                        {PRIORITY_OPTIONS.map(option => (
                          <label
                            key={option.value}
                            className={`flex items-center cursor-pointer p-3 border rounded-lg transition-all ${
                              field.value === option.value 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <input
                              type="radio"
                              value={option.value}
                              checked={field.value === option.value}
                              onChange={field.onChange}
                              className="sr-only"
                            />
                            <Badge 
                              variant={option.variant} 
                              className="mr-2"
                            >
                              {option.label}
                            </Badge>
                          </label>
                        ))}
                      </div>
                    )}
                  />
                </div>

                {/* Newsletter Checkbox */}
                <div className="flex items-center">
                  <input
                    {...register('newsletter')}
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    data-testid="contact-newsletter-checkbox"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Subscribe to our newsletter for updates and tips
                  </label>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    loading={isSubmitting}
                    className="px-8 py-2"
                    data-testid="contact-submit-button"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>

                {/* Form Debug Info (Development Only) */}
                {import.meta.env.DEV && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-semibold mb-2">Form Debug Info</h4>
                    <div className="text-xs space-y-1">
                      <div>Valid: {isValid.toString()}, Dirty: {isDirty.toString()}</div>
                      <div>Errors: {Object.keys(errors).length}</div>
                      <div>Priority: {priority}</div>
                      <div>Message Length: {messageLength}/2000</div>
                    </div>
                  </div>
                )}
              </form>
            </Card>
          </div>

          {/* Contact Information Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div>
                  <div className="font-medium">Email</div>
                  <div className="text-gray-600">hello@usermn.com</div>
                </div>
                <div>
                  <div className="font-medium">Phone</div>
                  <div className="text-gray-600">+1 (555) 123-4567</div>
                </div>
                <div>
                  <div className="font-medium">Office Hours</div>
                  <div className="text-gray-600">Monday - Friday<br />9:00 AM - 6:00 PM PST</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Response Time</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>General Inquiries</span>
                  <Badge variant="info">24 hours</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Technical Support</span>
                  <Badge variant="warning">4-8 hours</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Sales Questions</span>
                  <Badge variant="success">2-4 hours</Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}