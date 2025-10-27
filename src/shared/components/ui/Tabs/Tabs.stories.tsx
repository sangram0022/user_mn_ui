import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bell, CreditCard, Database, Settings, Shield, User } from 'lucide-react';
import { useState } from 'react';
import { Tabs } from './Tabs';

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Tabs Compound Component

A modern, accessible tabs component using the compound component pattern.

## Features

- **Compound Component Pattern**: Flexible composition with \`Tabs.List\`, \`Tabs.Tab\`, and \`Tabs.Panel\`
- **Keyboard Navigation**: Full support for Arrow keys, Home, End
- **ARIA Compliant**: Proper roles, states, and properties
- **Controlled & Uncontrolled**: Support for both modes
- **Multiple Variants**: Line, enclosed, and pills styles
- **Orientation Support**: Horizontal and vertical layouts
- **Dark Mode**: Full dark mode support
- **TypeScript**: Complete type safety

## Keyboard Navigation

- **Arrow Left/Up**: Previous tab
- **Arrow Right/Down**: Next tab  
- **Home**: First tab
- **End**: Last tab
- **Tab**: Move focus into/out of tab panel

## Accessibility

- Proper ARIA roles (\`tablist\`, \`tab\`, \`tabpanel\`)
- \`aria-selected\` state management
- \`aria-controls\` and \`aria-labelledby\` relationships
- Keyboard navigation support
- Focus management

## Usage

\`\`\`tsx
<Tabs defaultValue="profile">
  <Tabs.List>
    <Tabs.Tab value="profile">Profile</Tabs.Tab>
    <Tabs.Tab value="settings">Settings</Tabs.Tab>
  </Tabs.List>
  
  <Tabs.Panel value="profile">
    Profile content
  </Tabs.Panel>
  <Tabs.Panel value="settings">
    Settings content
  </Tabs.Panel>
</Tabs>
\`\`\`

## Controlled Mode

\`\`\`tsx
const [activeTab, setActiveTab] = useState('tab1');

<Tabs value={activeTab} onChange={setActiveTab}>
  {/* ... */}
</Tabs>
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'radio',
      options: ['line', 'enclosed', 'pills'],
      description: 'Visual variant of the tabs',
    },
    orientation: {
      control: 'radio',
      options: ['horizontal', 'vertical'],
      description: 'Tab orientation',
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default line variant with horizontal orientation.
 * Classic tab style with underline indicator.
 */
export const Default: Story = {
  render: () => (
    <div className="w-[600px]">
      <Tabs defaultValue="profile" variant="line" orientation="horizontal">
        <Tabs.List>
          <Tabs.Tab value="profile">Profile</Tabs.Tab>
          <Tabs.Tab value="settings">Settings</Tabs.Tab>
          <Tabs.Tab value="notifications">Notifications</Tabs.Tab>
        </Tabs.List>

        <div className="mt-6">
          <Tabs.Panel value="profile">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
                Profile Settings
              </h3>
              <p className="text-[color:var(--color-text-secondary)] dark:text-[color:var(--color-text-tertiary)]">
                Manage your profile information and preferences.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="first-name"
                    className="block text-sm font-medium text-[color:var(--color-text-primary)] dark:text-[color:var(--color-text-tertiary)] mb-1"
                  >
                    First Name
                  </label>
                  <input
                    id="first-name"
                    type="text"
                    className="w-full px-3 py-2 border border-[color:var(--color-border-primary)] dark:border-[color:var(--color-border-primary)] rounded-lg bg-[color:var(--color-white)] dark:bg-[color:var(--color-background-elevated)] text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)]"
                    defaultValue="John"
                  />
                </div>
                <div>
                  <label
                    htmlFor="last-name"
                    className="block text-sm font-medium text-[color:var(--color-text-primary)] dark:text-[color:var(--color-text-tertiary)] mb-1"
                  >
                    Last Name
                  </label>
                  <input
                    id="last-name"
                    type="text"
                    className="w-full px-3 py-2 border border-[color:var(--color-border-primary)] dark:border-[color:var(--color-border-primary)] rounded-lg bg-[color:var(--color-white)] dark:bg-[color:var(--color-background-elevated)] text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)]"
                    defaultValue="Doe"
                  />
                </div>
              </div>
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="settings">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
                Account Settings
              </h3>
              <p className="text-[color:var(--color-text-secondary)] dark:text-[color:var(--color-text-tertiary)]">
                Configure your account preferences and security options.
              </p>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="form-checkbox mr-2" defaultChecked />
                  <span className="text-sm text-[color:var(--color-text-primary)] dark:text-[color:var(--color-text-tertiary)]">
                    Enable two-factor authentication
                  </span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="form-checkbox mr-2" />
                  <span className="text-sm text-[color:var(--color-text-primary)] dark:text-[color:var(--color-text-tertiary)]">
                    Email notifications
                  </span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="form-checkbox mr-2" defaultChecked />
                  <span className="text-sm text-[color:var(--color-text-primary)] dark:text-[color:var(--color-text-tertiary)]">
                    Marketing emails
                  </span>
                </label>
              </div>
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="notifications">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
                Notification Preferences
              </h3>
              <p className="text-[color:var(--color-text-secondary)] dark:text-[color:var(--color-text-tertiary)]">
                Choose how you want to be notified about updates.
              </p>
              <div className="space-y-2">
                <div className="p-3 bg-[color:var(--color-background-secondary)] dark:bg-[color:var(--color-background-elevated)] rounded-lg">
                  <p className="text-sm font-medium text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
                    New Messages
                  </p>
                  <p className="text-xs text-[color:var(--color-text-secondary)] dark:text-[color:var(--color-text-tertiary)] mt-1">
                    Get notified when you receive new messages
                  </p>
                </div>
                <div className="p-3 bg-[color:var(--color-background-secondary)] dark:bg-[color:var(--color-background-elevated)] rounded-lg">
                  <p className="text-sm font-medium text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
                    Updates
                  </p>
                  <p className="text-xs text-[color:var(--color-text-secondary)] dark:text-[color:var(--color-text-tertiary)] mt-1">
                    Receive updates about your activity
                  </p>
                </div>
              </div>
            </div>
          </Tabs.Panel>
        </div>
      </Tabs>
    </div>
  ),
};

/**
 * Enclosed variant with boxed tabs.
 * Modern card-based tab style.
 */
export const Enclosed: Story = {
  render: () => (
    <div className="w-[600px]">
      <Tabs defaultValue="overview" variant="enclosed">
        <Tabs.List>
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
          <Tabs.Tab value="analytics">Analytics</Tabs.Tab>
          <Tabs.Tab value="reports">Reports</Tabs.Tab>
        </Tabs.List>

        <div className="mt-4">
          <Tabs.Panel value="overview">
            <div className="p-4 bg-[color:var(--color-white)] dark:bg-[color:var(--color-background-elevated)] border border-[color:var(--color-border-primary)] dark:border-[color:var(--color-border-secondary)] rounded-lg">
              <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)] mb-2">
                Dashboard Overview
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-[color:var(--color-primary-light)] dark:bg-[color:var(--color-primary-light)] rounded-lg">
                  <p className="text-sm text-[color:var(--color-primary)] dark:text-[color:var(--color-primary)]">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold text-[color:var(--color-primary)] dark:text-[color:var(--color-primary)]">
                    1,234
                  </p>
                </div>
                <div className="p-3 bg-[color:var(--color-primary-lighter)] dark:bg-[color:var(--color-primary-lighter)] rounded-lg">
                  <p className="text-sm text-[color:var(--color-success)] dark:text-[color:var(--color-success)]">
                    Active
                  </p>
                  <p className="text-2xl font-bold text-[color:var(--color-success)] dark:text-[color:var(--color-success)]">
                    892
                  </p>
                </div>
                <div className="p-3 bg-[var(--color-primary)] dark:bg-[var(--color-primary)]/20 rounded-lg">
                  <p className="text-sm text-[var(--color-primary)] dark:text-[var(--color-primary)]">
                    Pending
                  </p>
                  <p className="text-2xl font-bold text-[var(--color-primary)] dark:text-[var(--color-primary)]">
                    45
                  </p>
                </div>
              </div>
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="analytics">
            <div className="p-4 bg-[color:var(--color-white)] dark:bg-[color:var(--color-background-elevated)] border border-[color:var(--color-border-primary)] dark:border-[color:var(--color-border-secondary)] rounded-lg">
              <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)] mb-2">
                Analytics Data
              </h3>
              <p className="text-[color:var(--color-text-secondary)] dark:text-[color:var(--color-text-tertiary)]">
                Detailed analytics and metrics would be displayed here.
              </p>
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="reports">
            <div className="p-4 bg-[color:var(--color-white)] dark:bg-[color:var(--color-background-elevated)] border border-[color:var(--color-border-primary)] dark:border-[color:var(--color-border-secondary)] rounded-lg">
              <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)] mb-2">
                Reports
              </h3>
              <p className="text-[color:var(--color-text-secondary)] dark:text-[color:var(--color-text-tertiary)]">
                Generate and view reports here.
              </p>
            </div>
          </Tabs.Panel>
        </div>
      </Tabs>
    </div>
  ),
};

/**
 * Pills variant with rounded tab buttons.
 * Clean, modern pill-style tabs.
 */
export const Pills: Story = {
  render: () => (
    <div className="w-[600px]">
      <Tabs defaultValue="account" variant="pills">
        <Tabs.List>
          <Tabs.Tab value="account">Account</Tabs.Tab>
          <Tabs.Tab value="security">Security</Tabs.Tab>
          <Tabs.Tab value="billing">Billing</Tabs.Tab>
        </Tabs.List>

        <div className="mt-4">
          <Tabs.Panel value="account">
            <div className="p-6 bg-[color:var(--color-white)] dark:bg-[color:var(--color-background-elevated)] rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)] mb-4">
                Account Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="account-email"
                    className="block text-sm font-medium text-[color:var(--color-text-primary)] dark:text-[color:var(--color-text-tertiary)] mb-1"
                  >
                    Email
                  </label>
                  <input
                    id="account-email"
                    type="email"
                    className="w-full px-3 py-2 border border-[color:var(--color-border-primary)] dark:border-[color:var(--color-border-primary)] rounded-lg bg-[color:var(--color-white)] dark:bg-[color:var(--color-background-elevated)] text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)]"
                    defaultValue="john.doe@example.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="account-username"
                    className="block text-sm font-medium text-[color:var(--color-text-primary)] dark:text-[color:var(--color-text-tertiary)] mb-1"
                  >
                    Username
                  </label>
                  <input
                    id="account-username"
                    type="text"
                    className="w-full px-3 py-2 border border-[color:var(--color-border-primary)] dark:border-[color:var(--color-border-primary)] rounded-lg bg-[color:var(--color-white)] dark:bg-[color:var(--color-background-elevated)] text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)]"
                    defaultValue="johndoe"
                  />
                </div>
              </div>
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="security">
            <div className="p-6 bg-[color:var(--color-white)] dark:bg-[color:var(--color-background-elevated)] rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)] mb-4">
                Security Settings
              </h3>
              <button className="px-4 py-2 bg-[color:var(--color-primary)] text-[var(--color-text-primary)] rounded-lg hover:bg-[color:var(--color-primary-hover)] transition-colors">
                Change Password
              </button>
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="billing">
            <div className="p-6 bg-[color:var(--color-white)] dark:bg-[color:var(--color-background-elevated)] rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)] mb-4">
                Billing Details
              </h3>
              <p className="text-[color:var(--color-text-secondary)] dark:text-[color:var(--color-text-tertiary)]">
                Manage your billing information and payment methods.
              </p>
            </div>
          </Tabs.Panel>
        </div>
      </Tabs>
    </div>
  ),
};

/**
 * Vertical orientation for sidebar-style navigation.
 */
export const Vertical: Story = {
  render: () => (
    <div className="w-[700px] h-[400px]">
      <Tabs defaultValue="general" variant="pills" orientation="vertical">
        <Tabs.List className="min-w-[200px]">
          <Tabs.Tab value="general">
            <span className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              General
            </span>
          </Tabs.Tab>
          <Tabs.Tab value="profile">
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </span>
          </Tabs.Tab>
          <Tabs.Tab value="notifications">
            <span className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </span>
          </Tabs.Tab>
          <Tabs.Tab value="security">
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </span>
          </Tabs.Tab>
        </Tabs.List>

        <div className="flex-1">
          <Tabs.Panel value="general">
            <div className="p-6 bg-[color:var(--color-white)] dark:bg-[color:var(--color-background-elevated)] border border-[color:var(--color-border-primary)] dark:border-[color:var(--color-border-secondary)] rounded-lg h-full">
              <h2 className="text-xl font-bold text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)] mb-4">
                General Settings
              </h2>
              <p className="text-[color:var(--color-text-secondary)] dark:text-[color:var(--color-text-tertiary)]">
                Configure general application settings.
              </p>
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="profile">
            <div className="p-6 bg-[color:var(--color-white)] dark:bg-[color:var(--color-background-elevated)] border border-[color:var(--color-border-primary)] dark:border-[color:var(--color-border-secondary)] rounded-lg h-full">
              <h2 className="text-xl font-bold text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)] mb-4">
                Profile Settings
              </h2>
              <p className="text-[color:var(--color-text-secondary)] dark:text-[color:var(--color-text-tertiary)]">
                Manage your profile information.
              </p>
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="notifications">
            <div className="p-6 bg-[color:var(--color-white)] dark:bg-[color:var(--color-background-elevated)] border border-[color:var(--color-border-primary)] dark:border-[color:var(--color-border-secondary)] rounded-lg h-full">
              <h2 className="text-xl font-bold text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)] mb-4">
                Notification Settings
              </h2>
              <p className="text-[color:var(--color-text-secondary)] dark:text-[color:var(--color-text-tertiary)]">
                Control your notification preferences.
              </p>
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="security">
            <div className="p-6 bg-[color:var(--color-white)] dark:bg-[color:var(--color-background-elevated)] border border-[color:var(--color-border-primary)] dark:border-[color:var(--color-border-secondary)] rounded-lg h-full">
              <h2 className="text-xl font-bold text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)] mb-4">
                Security Settings
              </h2>
              <p className="text-[color:var(--color-text-secondary)] dark:text-[color:var(--color-text-tertiary)]">
                Enhance your account security.
              </p>
            </div>
          </Tabs.Panel>
        </div>
      </Tabs>
    </div>
  ),
};

/**
 * Controlled tabs - external state management.
 */
export const Controlled: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState('tab1');

    return (
      <div className="w-[600px] space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('tab1')}
            className="px-3 py-1.5 text-sm bg-[var(--color-surface-secondary)] dark:bg-[var(--color-surface-primary)] rounded hover:bg-[var(--color-border)] dark:hover:bg-[var(--color-surface-primary)]"
          >
            Switch to Tab 1
          </button>
          <button
            onClick={() => setActiveTab('tab2')}
            className="px-3 py-1.5 text-sm bg-[var(--color-surface-secondary)] dark:bg-[var(--color-surface-primary)] rounded hover:bg-[var(--color-border)] dark:hover:bg-[var(--color-surface-primary)]"
          >
            Switch to Tab 2
          </button>
          <button
            onClick={() => setActiveTab('tab3')}
            className="px-3 py-1.5 text-sm bg-[var(--color-surface-secondary)] dark:bg-[var(--color-surface-primary)] rounded hover:bg-[var(--color-border)] dark:hover:bg-[var(--color-surface-primary)]"
          >
            Switch to Tab 3
          </button>
        </div>

        <div className="p-3 bg-[color:var(--color-primary-light)] dark:bg-[color:var(--color-primary-light)] border border-[var(--color-primary)] dark:border-[var(--color-primary)] rounded-lg">
          <p className="text-sm text-[var(--color-primary)] dark:text-[var(--color-primary)]">
            Current tab: <strong>{activeTab}</strong>
          </p>
        </div>

        <Tabs value={activeTab} onChange={setActiveTab} variant="line">
          <Tabs.List>
            <Tabs.Tab value="tab1">Tab 1</Tabs.Tab>
            <Tabs.Tab value="tab2">Tab 2</Tabs.Tab>
            <Tabs.Tab value="tab3">Tab 3</Tabs.Tab>
          </Tabs.List>

          <div className="mt-4">
            <Tabs.Panel value="tab1">
              <div className="p-4 bg-[color:var(--color-background-secondary)] dark:bg-[color:var(--color-background-elevated)] rounded-lg">
                <p className="text-[color:var(--color-text-primary)] dark:text-[color:var(--color-text-tertiary)]">
                  Content for Tab 1
                </p>
              </div>
            </Tabs.Panel>
            <Tabs.Panel value="tab2">
              <div className="p-4 bg-[color:var(--color-background-secondary)] dark:bg-[color:var(--color-background-elevated)] rounded-lg">
                <p className="text-[color:var(--color-text-primary)] dark:text-[color:var(--color-text-tertiary)]">
                  Content for Tab 2
                </p>
              </div>
            </Tabs.Panel>
            <Tabs.Panel value="tab3">
              <div className="p-4 bg-[color:var(--color-background-secondary)] dark:bg-[color:var(--color-background-elevated)] rounded-lg">
                <p className="text-[color:var(--color-text-primary)] dark:text-[color:var(--color-text-tertiary)]">
                  Content for Tab 3
                </p>
              </div>
            </Tabs.Panel>
          </div>
        </Tabs>
      </div>
    );
  },
};

/**
 * Tabs with disabled state.
 */
export const WithDisabledTab: Story = {
  render: () => (
    <div className="w-[600px]">
      <Tabs defaultValue="enabled1" variant="line">
        <Tabs.List>
          <Tabs.Tab value="enabled1">Enabled 1</Tabs.Tab>
          <Tabs.Tab value="disabled" disabled>
            Disabled
          </Tabs.Tab>
          <Tabs.Tab value="enabled2">Enabled 2</Tabs.Tab>
        </Tabs.List>

        <div className="mt-4">
          <Tabs.Panel value="enabled1">
            <div className="p-4 bg-[color:var(--color-background-secondary)] dark:bg-[color:var(--color-background-elevated)] rounded-lg">
              <p className="text-[color:var(--color-text-primary)] dark:text-[color:var(--color-text-tertiary)]">
                First enabled tab
              </p>
            </div>
          </Tabs.Panel>
          <Tabs.Panel value="disabled">
            <div className="p-4 bg-[color:var(--color-background-secondary)] dark:bg-[color:var(--color-background-elevated)] rounded-lg">
              <p className="text-[color:var(--color-text-primary)] dark:text-[color:var(--color-text-tertiary)]">
                This tab is disabled
              </p>
            </div>
          </Tabs.Panel>
          <Tabs.Panel value="enabled2">
            <div className="p-4 bg-[color:var(--color-background-secondary)] dark:bg-[color:var(--color-background-elevated)] rounded-lg">
              <p className="text-[color:var(--color-text-primary)] dark:text-[color:var(--color-text-tertiary)]">
                Second enabled tab
              </p>
            </div>
          </Tabs.Panel>
        </div>
      </Tabs>
    </div>
  ),
};

/**
 * Tabs with icons for enhanced visual appeal.
 */
export const WithIcons: Story = {
  render: () => (
    <div className="w-[700px]">
      <Tabs defaultValue="database" variant="enclosed">
        <Tabs.List>
          <Tabs.Tab value="database">
            <span className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Database
            </span>
          </Tabs.Tab>
          <Tabs.Tab value="billing">
            <span className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Billing
            </span>
          </Tabs.Tab>
          <Tabs.Tab value="security">
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </span>
          </Tabs.Tab>
        </Tabs.List>

        <div className="mt-4">
          <Tabs.Panel value="database">
            <div className="p-6 bg-[color:var(--color-white)] dark:bg-[color:var(--color-background-elevated)] border border-[color:var(--color-border-primary)] dark:border-[color:var(--color-border-secondary)] rounded-lg">
              <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
                <Database className="w-5 h-5" />
                Database Configuration
              </h3>
              <p className="text-[color:var(--color-text-secondary)] dark:text-[color:var(--color-text-tertiary)]">
                Configure your database settings and connections.
              </p>
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="billing">
            <div className="p-6 bg-[color:var(--color-white)] dark:bg-[color:var(--color-background-elevated)] border border-[color:var(--color-border-primary)] dark:border-[color:var(--color-border-secondary)] rounded-lg">
              <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Billing & Payments
              </h3>
              <p className="text-[color:var(--color-text-secondary)] dark:text-[color:var(--color-text-tertiary)]">
                Manage your subscription and payment methods.
              </p>
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="security">
            <div className="p-6 bg-[color:var(--color-white)] dark:bg-[color:var(--color-background-elevated)] border border-[color:var(--color-border-primary)] dark:border-[color:var(--color-border-secondary)] rounded-lg">
              <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security & Privacy
              </h3>
              <p className="text-[color:var(--color-text-secondary)] dark:text-[color:var(--color-text-tertiary)]">
                Protect your account with advanced security features.
              </p>
            </div>
          </Tabs.Panel>
        </div>
      </Tabs>
    </div>
  ),
};

/**
 * Dark mode variant.
 */
export const DarkMode: Story = {
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="w-[600px]">
      <Tabs defaultValue="home" variant="pills">
        <Tabs.List>
          <Tabs.Tab value="home">Home</Tabs.Tab>
          <Tabs.Tab value="explore">Explore</Tabs.Tab>
          <Tabs.Tab value="library">Library</Tabs.Tab>
        </Tabs.List>

        <div className="mt-4">
          <Tabs.Panel value="home">
            <div className="p-6 bg-[color:var(--color-background-elevated)] border border-[color:var(--color-border-secondary)] rounded-lg">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                Home Feed
              </h3>
              <p className="text-[color:var(--color-text-tertiary)]">
                Your personalized home feed content.
              </p>
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="explore">
            <div className="p-6 bg-[color:var(--color-background-elevated)] border border-[color:var(--color-border-secondary)] rounded-lg">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                Explore
              </h3>
              <p className="text-[color:var(--color-text-tertiary)]">
                Discover new content and trending topics.
              </p>
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="library">
            <div className="p-6 bg-[color:var(--color-background-elevated)] border border-[color:var(--color-border-secondary)] rounded-lg">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                Library
              </h3>
              <p className="text-[color:var(--color-text-tertiary)]">
                Access your saved items and collections.
              </p>
            </div>
          </Tabs.Panel>
        </div>
      </Tabs>
    </div>
  ),
};
