/**
 * Form Patterns Reference
 * 
 * Complete collection of form patterns, validation examples,
 * and best practices for building forms.
 */

import { useState } from 'react';
import { Button, Input, Card } from '../components';
import { isValidEmail, isValidPassword } from '../core/validation';

// Legacy validators wrapper for reference compatibility
const validators = {
  email: (value: string) => !isValidEmail(value) ? 'Invalid email address' : '',
  password: (value: string) => !isValidPassword(value) ? 'Password must be at least 8 characters' : '',
  confirmPassword: (password: string, confirmPassword: string) => password !== confirmPassword ? 'Passwords do not match' : '',
};

export default function FormPatternsReference() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    const emailError = validators.email(formData.email);
    if (emailError) newErrors.email = emailError;
    
    const passwordError = validators.password(formData.password);
    if (passwordError) newErrors.password = passwordError;
    
    const confirmError = validators.confirmPassword(formData.password, formData.confirmPassword);
    if (confirmError) newErrors.confirmPassword = confirmError;
    
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      alert('Form submitted successfully!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Form Patterns Reference</h1>
          <p className="text-xl text-gray-600">Complete guide to form patterns and validation</p>
        </div>

        <div className="space-y-12">
          {/* Basic Form */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">Basic Form</h2>
            <Card>
              <form className="space-y-4">
                <Input 
                  type="text" 
                  label="Full Name" 
                  placeholder="John Doe"
                  required
                />
                <Input 
                  type="email" 
                  label="Email Address" 
                  placeholder="john@example.com"
                  required
                />
                <Input 
                  type="password" 
                  label="Password" 
                  placeholder="••••••••"
                  required
                />
                <Button type="submit" className="w-full">Submit</Button>
              </form>
            </Card>
          </section>

          {/* Form with Validation */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">Form with Validation</h2>
            <Card>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input 
                    type="email" 
                    name="email"
                    label="Email" 
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    required
                  />
                </div>
                
                <div>
                  <Input 
                    type="password" 
                    name="password"
                    label="Password" 
                    placeholder="Min 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    required
                  />
                </div>
                
                <div>
                  <Input 
                    type="password" 
                    name="confirmPassword"
                    label="Confirm Password" 
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    required
                  />
                </div>
                
                <div>
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">I accept the terms and conditions</span>
                  </label>
                  {errors.acceptTerms && (
                    <p className="text-red-600 text-sm mt-1">{errors.acceptTerms}</p>
                  )}
                </div>
                
                <Button type="submit" className="w-full">Create Account</Button>
              </form>
            </Card>
          </section>

          {/* Multi-step Form */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">Multi-step Form Example</h2>
            <Card>
              <MultiStepFormExample />
            </Card>
          </section>

          {/* Input Variations */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">Input Field Variations</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-lg font-semibold mb-4">Text Input States</h3>
                <div className="space-y-4">
                  <Input label="Normal" placeholder="Type here..." />
                  <Input label="With Value" value="Some text" />
                  <Input label="Disabled" placeholder="Can't type" disabled />
                  <Input label="Read-only" value="Read only text" readOnly />
                  <Input label="With Error" error="This field is required" />
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold mb-4">Input with Icons</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Search</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Search..."
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <div className="relative">
                      <input 
                        type="email" 
                        placeholder="you@example.com"
                        className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <svg className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* Form Layouts */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">Form Layouts</h2>
            
            <div className="space-y-6">
              <Card>
                <h3 className="text-lg font-semibold mb-4">Inline Form</h3>
                <form className="flex flex-wrap gap-3 items-end">
                  <div className="flex-1 min-w-[200px]">
                    <Input label="First Name" placeholder="John" />
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <Input label="Last Name" placeholder="Doe" />
                  </div>
                  <Button>Submit</Button>
                </form>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold mb-4">Two-Column Form</h3>
                <form className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input label="First Name" placeholder="John" />
                    <Input label="Last Name" placeholder="Doe" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input type="email" label="Email" placeholder="john@example.com" />
                    <Input type="tel" label="Phone" placeholder="(123) 456-7890" />
                  </div>
                  <Input label="Address" placeholder="123 Main St" />
                  <div className="grid md:grid-cols-3 gap-4">
                    <Input label="City" placeholder="New York" />
                    <Input label="State" placeholder="NY" />
                    <Input label="ZIP" placeholder="10001" />
                  </div>
                  <Button className="w-full">Submit Form</Button>
                </form>
              </Card>
            </div>
          </section>

          {/* Advanced Form Elements */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">Advanced Form Elements</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-lg font-semibold mb-4">File Upload</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
                  <input type="file" className="hidden" />
                  <Button size="sm" className="mt-4">Choose File</Button>
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold mb-4">Rating Input</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Star Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="text-yellow-400 hover:text-yellow-500 transition-colors"
                        >
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Slider</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      defaultValue="50"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>0</span>
                      <span>50</span>
                      <span>100</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* Form Validation Patterns */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">Validation Patterns</h2>
            <Card>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Common Validation Messages</h3>
                
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">❌ This field is required</p>
                  </div>
                  
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">❌ Please enter a valid email address</p>
                  </div>
                  
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">❌ Password must be at least 8 characters</p>
                  </div>
                  
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">❌ Passwords do not match</p>
                  </div>
                  
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">✓ This field is valid</p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">ℹ This field is optional</p>
                  </div>
                </div>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}

// Multi-step form component
function MultiStepFormExample() {
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center flex-1">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              s <= step ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-400'
            }`}>
              {s}
            </div>
            {s < totalSteps && (
              <div className={`flex-1 h-1 mx-2 ${
                s < step ? 'bg-blue-600' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div>
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 1: Personal Information</h3>
            <Input label="First Name" placeholder="John" />
            <Input label="Last Name" placeholder="Doe" />
            <Input type="email" label="Email" placeholder="john@example.com" />
          </div>
        )}
        
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 2: Account Details</h3>
            <Input label="Username" placeholder="johndoe" />
            <Input type="password" label="Password" placeholder="••••••••" />
            <Input type="password" label="Confirm Password" placeholder="••••••••" />
          </div>
        )}
        
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 3: Preferences</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Email notifications</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 text-blue-600" />
                <span className="text-sm">SMS notifications</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 text-blue-600" defaultChecked />
                <span className="text-sm">Newsletter subscription</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button 
          variant="outline" 
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
        >
          Previous
        </Button>
        {step < totalSteps ? (
          <Button onClick={() => setStep(Math.min(totalSteps, step + 1))}>
            Next
          </Button>
        ) : (
          <Button variant="success">Submit</Button>
        )}
      </div>
    </div>
  );
}
