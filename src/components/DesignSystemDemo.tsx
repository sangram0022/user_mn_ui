/**
 * Design System Demo Component
 * Comprehensive showcase of the modern design system components
 */

import { logger } from './../shared/utils/logger';
import React, { useState } from 'react';
import { Button,
  Card,
  Alert,
  Badge,
  Modal,
  Spinner,
  Container,
  Grid,
  Stack,
  HStack,
  FormInput,
  Select,
  Textarea,
  Checkbox,
  RadioGroup,
  Toggle } from '../shared/design';
import type { SelectOption, RadioOption } from '../shared/design';

export const DesignSystemDemo: React.FC = () => { const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    bio: '',
    newsletter: false,
    theme: 'light',
    notifications: true
  });

  const roleOptions: SelectOption[] = [
    { value: 'admin', label: 'Administrator' },
    { value: 'user', label: 'User' },
    { value: 'moderator', label: 'Moderator' }
  ];

  const themeOptions: RadioOption[] = [
    { value: 'light', label: 'Light Theme', description: 'Clean and bright interface' },
    { value: 'dark', label: 'Dark Theme', description: 'Easy on the eyes' },
    { value: 'auto', label: 'Auto Theme', description: 'Follows system preference' }
  ];

  return (
    <Container maxWidth="xl" className="py-8">
      <Stack spacing={8}>
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-secondary-900 mb-2">
            Design System Demo
          </h1>
          <p className="text-lg text-secondary-600">
            A comprehensive showcase of our modern React design system
          </p>
        </div>

        {/* Buttons Section */}
        <Card>
          <h2 className="text-2xl font-semibold text-secondary-900 mb-6">Buttons</h2>
          <Grid cols={2} gap={6} responsive={{ sm: 1, md: 2, lg: 3 }}>
            <Stack spacing={4}>
              <h3 className="text-lg font-medium text-secondary-700">Primary Variants</h3>
              <HStack spacing={4} wrap>
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </HStack>
            </Stack>
            
            <Stack spacing={4}>
              <h3 className="text-lg font-medium text-secondary-700">Semantic Variants</h3>
              <HStack spacing={4} wrap>
                <Button variant="success">Success</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="error">Error</Button>
              </HStack>
            </Stack>
            
            <Stack spacing={4}>
              <h3 className="text-lg font-medium text-secondary-700">Sizes & States</h3>
              <HStack spacing={4} wrap>
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button loading>Loading</Button>
                <Button disabled>Disabled</Button>
              </HStack>
            </Stack>
          </Grid>
        </Card>

        {/* Alerts Section */}
        <Card>
          <h2 className="text-2xl font-semibold text-secondary-900 mb-6">Alerts</h2>
          <Stack spacing={4}>
            <Alert 
              variant="success" 
              title="Success!"
              icon={<CheckIcon />}
              dismissible
              onDismiss={() => logger.info('Success alert dismissed')}
            >
              Your changes have been saved successfully.
            </Alert>
            <Alert 
              variant="warning" 
              title="Warning"
              icon={<WarningIcon />}
            >
              Please review your information before submitting.
            </Alert>
            <Alert 
              variant="error" 
              title="Error"
              icon={<ErrorIcon />}
            >
              There was an error processing your request. Please try again.
            </Alert>
            <Alert 
              variant="info" 
              title="Information"
              icon={<InfoIcon />}
            >
              This feature is currently in beta. Please report any issues.
            </Alert>
          </Stack>
        </Card>

        {/* Badges Section */}
        <Card>
          <h2 className="text-2xl font-semibold text-secondary-900 mb-6">Badges</h2>
          <Stack spacing={4}>
            <div>
              <h3 className="text-lg font-medium text-secondary-700 mb-3">Standard Badges</h3>
              <HStack spacing={4} wrap>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="error">Error</Badge>
              </HStack>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-secondary-700 mb-3">Status Dots</h3>
              <HStack spacing={4} wrap>
                <HStack spacing={2}>
                  <Badge variant="success" dot />
                  <span className="text-sm">Online</span>
                </HStack>
                <HStack spacing={2}>
                  <Badge variant="warning" dot />
                  <span className="text-sm">Away</span>
                </HStack>
                <HStack spacing={2}>
                  <Badge variant="error" dot />
                  <span className="text-sm">Offline</span>
                </HStack>
              </HStack>
            </div>
          </Stack>
        </Card>

        {/* Form Components Section */}
        <Card>
          <h2 className="text-2xl font-semibold text-secondary-900 mb-6">Form Components</h2>
          <form className="space-y-6">
            <Grid cols={1} gap={6} responsive={{ md: 2 }}>
              <FormInput
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                validation={{ required: true, minLength: 2 }}
                helperText="This will be displayed on your profile"
              />
              
              <FormInput
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                validation={{ required: true, 
                  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 
                }}
                leftIcon={<EmailIcon />}
              />
            </Grid>

            <Select
              label="Role"
              placeholder="Select your role"
              options={roleOptions}
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />

            <Textarea
              label="Bio"
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              maxLength={500}
              showCharCount
              helperText="A brief description about yourself"
            />

            <Checkbox
              label="Subscribe to newsletter"
              description="Get updates about new features and improvements"
              checked={formData.newsletter}
              onChange={(e) => setFormData({ ...formData, newsletter: e.target.checked })}
            />

            <RadioGroup
              name="theme"
              label="Theme Preference"
              value={formData.theme}
              onChange={(value) => setFormData({ ...formData, theme: value })}
              options={themeOptions}
            />

            <Toggle
              label="Push Notifications"
              description="Receive notifications on your device"
              checked={formData.notifications}
              onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })}
            />

            <HStack spacing={4}>
              <Button type="submit" variant="primary">
                Save Changes
              </Button>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </HStack>
          </form>
        </Card>

        {/* Modal Section */}
        <Card>
          <h2 className="text-2xl font-semibold text-secondary-900 mb-6">Modal</h2>
          <Button onClick={() => setShowModal(true)}>
            Open Modal
          </Button>
        </Card>

        {/* Loading States */}
        <Card>
          <h2 className="text-2xl font-semibold text-secondary-900 mb-6">Loading States</h2>
          <HStack spacing={8}>
            <Stack spacing={2} align="center">
              <Spinner size="sm" />
              <span className="text-sm text-secondary-600">Small</span>
            </Stack>
            <Stack spacing={2} align="center">
              <Spinner size="md" />
              <span className="text-sm text-secondary-600">Medium</span>
            </Stack>
            <Stack spacing={2} align="center">
              <Spinner size="lg" />
              <span className="text-sm text-secondary-600">Large</span>
            </Stack>
          </HStack>
        </Card>

        {/* Utility Classes Demo */}
        <Card>
          <h2 className="text-2xl font-semibold text-secondary-900 mb-6">Utility Classes</h2>
          <Stack spacing={4}>
            <div>
              <h3 className="text-lg font-medium text-secondary-700 mb-3">Typography</h3>
              <Stack spacing={2}>
                <p className="text-xs text-secondary-600">Extra small text (xs)</p>
                <p className="text-sm text-secondary-600">Small text (sm)</p>
                <p className="text-base text-secondary-700">Base text (base)</p>
                <p className="text-lg text-secondary-800">Large text (lg)</p>
                <p className="text-xl font-semibold text-secondary-900">Extra large text (xl)</p>
              </Stack>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-secondary-700 mb-3">Colors</h3>
              <Grid cols={4} gap={2} responsive={{ sm: 2, md: 4, lg: 6 }}>
                <div className="h-16 bg-primary-500 rounded-md flex items-center justify-center text-white text-sm font-medium">
                  Primary
                </div>
                <div className="h-16 bg-success-500 rounded-md flex items-center justify-center text-white text-sm font-medium">
                  Success
                </div>
                <div className="h-16 bg-warning-500 rounded-md flex items-center justify-center text-white text-sm font-medium">
                  Warning
                </div>
                <div className="h-16 bg-error-500 rounded-md flex items-center justify-center text-white text-sm font-medium">
                  Error
                </div>
              </Grid>
            </div>
          </Stack>
        </Card>
      </Stack>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Example Modal"
        size="md"
      >
        <Stack spacing={4}>
          <p className="text-secondary-600">
            This is an example modal dialog. It demonstrates the modal component
            with proper accessibility features and smooth animations.
          </p>
          <Alert variant="info" title="Modal Content">
            You can place any content inside modals, including forms, images, or other components.
          </Alert>
          <HStack spacing={3} justify="end">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setShowModal(false)}>
              Confirm
            </Button>
          </HStack>
        </Stack>
      </Modal>
    </Container>
  );
};

// Simple icons for the demo
const CheckIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const WarningIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const ErrorIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
  </svg>
);

const InfoIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
  </svg>
);

const EmailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

export default DesignSystemDemo;