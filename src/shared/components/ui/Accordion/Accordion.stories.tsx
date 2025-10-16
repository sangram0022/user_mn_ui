import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bell, Database, FileText, Lock, Mail, Settings, Shield, User } from 'lucide-react';
import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './Accordion';

/**
 * Accordion Component Stories
 *
 * The Accordion component provides a collapsible section pattern using the compound component design.
 * It supports both single and multiple expansion modes, controlled and uncontrolled usage,
 * keyboard navigation, and full ARIA compliance.
 *
 * ## Features
 * - Single/multiple expansion modes
 * - Controlled and uncontrolled usage
 * - Smooth height animations
 * - Full keyboard navigation
 * - ARIA compliant
 * - Dark mode support
 * - Disabled state
 * - Custom styling via className
 */
const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A flexible accordion component with compound component pattern for better composition and state management.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'radio',
      options: ['single', 'multiple'],
      description: 'Controls expansion behavior',
      table: {
        type: { summary: "'single' | 'multiple'" },
        defaultValue: { summary: 'single' },
      },
    },
    collapsible: {
      control: 'boolean',
      description: 'Allow closing the open item (only for single type)',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable all accordion items',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default single expansion mode - only one item can be open at a time
 */
export const Default: Story = {
  render: () => (
    <div style={{ width: '600px' }}>
      <Accordion type="single" defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>What is a compound component?</AccordionTrigger>
          <AccordionContent>
            <p>
              A compound component is a React design pattern where multiple components work together
              to form a cohesive interface. The parent component manages shared state via Context,
              while child components access this state without prop drilling.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger>How does keyboard navigation work?</AccordionTrigger>
          <AccordionContent>
            <p>
              You can use <kbd>Enter</kbd> or <kbd>Space</kbd> to toggle accordion items when
              focused. Tab through triggers to navigate between items. Full keyboard accessibility
              is built-in following ARIA patterns.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger>What about accessibility?</AccordionTrigger>
          <AccordionContent>
            <p>
              This accordion follows WAI-ARIA authoring practices with proper roles, states, and
              properties. It includes <code>aria-expanded</code>, <code>aria-controls</code>,{' '}
              <code>aria-labelledby</code>, and semantic HTML for screen reader support.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

/**
 * Multiple expansion mode - multiple items can be open simultaneously
 */
export const Multiple: Story = {
  render: () => (
    <div style={{ width: '600px' }}>
      <Accordion type="multiple" defaultValue={['item-1', 'item-3']}>
        <AccordionItem value="item-1">
          <AccordionTrigger>Account Settings</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <p>Manage your account settings and preferences.</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>Update profile information</li>
                <li>Change password</li>
                <li>Email preferences</li>
                <li>Privacy settings</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger>Notifications</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <p>Configure how you receive notifications.</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>Email notifications</li>
                <li>Push notifications</li>
                <li>SMS alerts</li>
                <li>Notification frequency</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger>Security</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <p>Keep your account secure with these features.</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>Two-factor authentication</li>
                <li>Active sessions</li>
                <li>Login history</li>
                <li>Connected apps</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

/**
 * Collapsible mode - allows closing the currently open item
 */
export const Collapsible: Story = {
  render: () => (
    <div style={{ width: '600px' }}>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Click to expand</AccordionTrigger>
          <AccordionContent>
            <p>
              In collapsible mode, you can close the currently open item by clicking it again. This
              is useful when you want to allow users to collapse all sections.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger>Try clicking this one</AccordionTrigger>
          <AccordionContent>
            <p>
              Notice how you can close this section after opening it. Without collapsible mode, at
              least one item must always be open.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger>And this one too</AccordionTrigger>
          <AccordionContent>
            <p>
              This provides more control over the accordion state, allowing a fully collapsed view.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

/**
 * Controlled mode - manage accordion state externally
 */
export const Controlled: Story = {
  render: () => {
    const ControlledDemo = () => {
      const [value, setValue] = useState<string>('item-1');

      return (
        <div style={{ width: '600px' }} className="space-y-4">
          <div className="flex gap-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <button
              type="button"
              onClick={() => setValue('item-1')}
              className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Open Item 1
            </button>
            <button
              type="button"
              onClick={() => setValue('item-2')}
              className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Open Item 2
            </button>
            <button
              type="button"
              onClick={() => setValue('item-3')}
              className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Open Item 3
            </button>
          </div>

          <Accordion type="single" value={value} onValueChange={setValue}>
            <AccordionItem value="item-1">
              <AccordionTrigger>Controlled Item 1</AccordionTrigger>
              <AccordionContent>
                <p>
                  This accordion's state is controlled by the parent component. The buttons above
                  can programmatically control which item is open.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>Controlled Item 2</AccordionTrigger>
              <AccordionContent>
                <p>
                  Controlled mode is useful when you need to synchronize the accordion state with
                  other parts of your application.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>Controlled Item 3</AccordionTrigger>
              <AccordionContent>
                <p>
                  You maintain full control over the state, which enables complex interactions and
                  state synchronization.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      );
    };

    return <ControlledDemo />;
  },
};

/**
 * With disabled items - individual or entire accordion
 */
export const WithDisabledItems: Story = {
  render: () => (
    <div style={{ width: '600px' }}>
      <Accordion type="single" defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>Active Item</AccordionTrigger>
          <AccordionContent>
            <p>This item is fully functional and can be interacted with normally.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2" disabled>
          <AccordionTrigger>Disabled Item</AccordionTrigger>
          <AccordionContent>
            <p>This content is not accessible because the item is disabled.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger>Another Active Item</AccordionTrigger>
          <AccordionContent>
            <p>You can disable individual items while keeping others interactive.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4" disabled>
          <AccordionTrigger>Another Disabled Item</AccordionTrigger>
          <AccordionContent>
            <p>Disabled items show visual feedback and are not keyboard-navigable.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

/**
 * Entire accordion disabled
 */
export const FullyDisabled: Story = {
  render: () => (
    <div style={{ width: '600px' }}>
      <Accordion type="single" disabled>
        <AccordionItem value="item-1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>
            <p>This entire accordion is disabled.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger>Item 2</AccordionTrigger>
          <AccordionContent>
            <p>None of these items can be interacted with.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger>Item 3</AccordionTrigger>
          <AccordionContent>
            <p>The disabled prop on the root applies to all items.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

/**
 * With custom icons and styling
 */
export const WithIcons: Story = {
  render: () => (
    <div style={{ width: '600px' }}>
      <Accordion type="single" defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span>General Settings</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 mt-0.5 text-gray-500" />
                <div>
                  <p className="font-medium text-sm">Profile</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Manage your personal information
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Bell className="w-4 h-4 mt-0.5 text-gray-500" />
                <div>
                  <p className="font-medium text-sm">Notifications</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Configure notification preferences
                  </p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Security & Privacy</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 mt-0.5 text-gray-500" />
                <div>
                  <p className="font-medium text-sm">Authentication</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Two-factor authentication and password
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 mt-0.5 text-gray-500" />
                <div>
                  <p className="font-medium text-sm">Privacy Policy</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    View and manage your privacy settings
                  </p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span>Data Management</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 text-gray-500" />
                <div>
                  <p className="font-medium text-sm">Export Data</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Download your data in various formats
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Database className="w-4 h-4 mt-0.5 text-gray-500" />
                <div>
                  <p className="font-medium text-sm">Data Retention</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Manage how long we keep your data
                  </p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

/**
 * Dark mode variant
 */
export const DarkMode: Story = {
  render: () => (
    <div style={{ width: '600px' }} className="dark">
      <div className="p-8 bg-gray-900 rounded-lg">
        <Accordion type="single" defaultValue="item-2">
          <AccordionItem value="item-1">
            <AccordionTrigger>Dark Mode Support</AccordionTrigger>
            <AccordionContent>
              <p>
                The accordion component fully supports dark mode with appropriate color adjustments
                for backgrounds, borders, and text.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>Automatic Theming</AccordionTrigger>
            <AccordionContent>
              <p>
                All colors automatically adjust based on the <code>dark:</code> class prefix in
                Tailwind CSS. No additional configuration needed.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>Contrast & Accessibility</AccordionTrigger>
            <AccordionContent>
              <p>
                Dark mode maintains proper contrast ratios for WCAG compliance and readability in
                low-light environments.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  ),
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

/**
 * Rich content with nested elements
 */
export const RichContent: Story = {
  render: () => (
    <div style={{ width: '700px' }}>
      <Accordion type="multiple" defaultValue={['item-1']}>
        <AccordionItem value="item-1">
          <AccordionTrigger>Installation Guide</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <p className="font-medium">Follow these steps to install the component:</p>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  Install dependencies:{' '}
                  <code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                    npm install lucide-react
                  </code>
                </li>
                <li>Copy the Accordion component to your project</li>
                <li>Import and use in your application</li>
              </ol>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  <strong>Note:</strong> Make sure Tailwind CSS is configured in your project.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger>API Reference</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm mb-2">Accordion Props</h4>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="text-left p-2">Prop</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Default</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="p-2">
                        <code>type</code>
                      </td>
                      <td className="p-2">'single' | 'multiple'</td>
                      <td className="p-2">'single'</td>
                    </tr>
                    <tr>
                      <td className="p-2">
                        <code>collapsible</code>
                      </td>
                      <td className="p-2">boolean</td>
                      <td className="p-2">false</td>
                    </tr>
                    <tr>
                      <td className="p-2">
                        <code>disabled</code>
                      </td>
                      <td className="p-2">boolean</td>
                      <td className="p-2">false</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger>Examples</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <p>Here's a basic example:</p>
              <pre className="p-3 bg-gray-900 text-gray-100 rounded text-xs overflow-x-auto">
                {`<Accordion type="single" defaultValue="item-1">
  <AccordionItem value="item-1">
    <AccordionTrigger>Title</AccordionTrigger>
    <AccordionContent>Content</AccordionContent>
  </AccordionItem>
</Accordion>`}
              </pre>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};
