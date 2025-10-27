/**
 * Container Queries Demo Page
 *
 * Demonstrates modern CSS container queries for component-based responsive design.
 * Resize the browser or individual containers to see components adapt.
 */

import { Card } from '@shared/components/ui/Card';
import { Modal } from '@shared/components/ui/Modal/Modal';
import type React from 'react';
import { useState } from 'react';

export const ContainerQueriesDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [containerWidth, setContainerWidth] = useState<'small' | 'medium' | 'large'>('large');

  const containerWidths = {
    small: 'max-w-sm',
    medium: 'max-w-2xl',
    large: 'max-w-6xl',
  };

  return (
    <div className="min-h-screen bg-[color:var(--color-background-secondary)] dark:bg-[var(--color-surface-primary)] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)] mb-4">
            Container Queries Demo
          </h1>
          <p className="text-lg text-[color:var(--color-text-secondary)] dark:text-[color:var(--color-text-tertiary)] mb-6">
            Resize the containers below to see components adapt to their parent&apos;s size, not the
            viewport.
          </p>

          {/* Container Width Controls */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setContainerWidth('small')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                containerWidth === 'small'
                  ? 'bg-[var(--color-primary)] text-[var(--color-text-primary)]'
                  : 'bg-[var(--color-surface-primary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
              }`}
            >
              Small (384px)
            </button>
            <button
              onClick={() => setContainerWidth('medium')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                containerWidth === 'medium'
                  ? 'bg-[var(--color-primary)] text-[var(--color-text-primary)]'
                  : 'bg-[var(--color-surface-primary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
              }`}
            >
              Medium (672px)
            </button>
            <button
              onClick={() => setContainerWidth('large')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                containerWidth === 'large'
                  ? 'bg-[var(--color-primary)] text-[var(--color-text-primary)]'
                  : 'bg-[var(--color-surface-primary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
              }`}
            >
              Large (1152px)
            </button>
          </div>

          {/* Browser Support Notice */}
          <div className="bg-[color:var(--color-primary-50)] dark:bg-[var(--color-primary)]/20 border border-[var(--color-primary)] dark:border-[var(--color-primary)] rounded-lg p-4 mb-6">
            <p className="text-sm text-[var(--color-primary)] dark:text-[var(--color-primary)]">
              <strong>Browser Support:</strong> Container queries are supported in Chrome 105+,
              Safari 16+, Firefox 110+. Your browser{' '}
              <span className="font-semibold">
                {CSS.supports('container-type: inline-size') ? 'supports' : 'does not support'}
              </span>{' '}
              container queries.
            </p>
          </div>
        </div>

        {/* Demo Container */}
        <div className={`mx-auto transition-all duration-500 ${containerWidths[containerWidth]}`}>
          {/* Card Examples */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)] mb-4">
              Responsive Cards
            </h2>
            <p className="text-[color:var(--color-text-secondary)] dark:text-[color:var(--color-text-tertiary)] mb-6">
              Cards adapt their layout based on container width. Try resizing!
            </p>

            <div className="grid gap-6">
              {/* Card with Header and Actions */}
              <Card responsive variant="elevated">
                <div className="card-header flex justify-between items-start mb-4">
                  <div>
                    <h3 className="card-title text-xl font-semibold text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
                      User Profile
                    </h3>
                    <p className="text-sm text-[color:var(--color-text-secondary)] dark:text-[color:var(--color-text-tertiary)] mt-1">
                      Updated 2 hours ago
                    </p>
                  </div>
                  <div className="card-actions flex gap-2">
                    <button className="px-3 py-1.5 text-sm bg-[color:var(--color-background-secondary)] dark:bg-[var(--color-surface-primary)] text-[color:var(--color-text-primary)] dark:text-[var(--color-text-tertiary)] rounded-lg hover:bg-[var(--color-border)] dark:hover:bg-[var(--color-surface-primary)] transition-colors">
                      Edit
                    </button>
                    <button className="px-3 py-1.5 text-sm bg-[var(--color-primary)] text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors">
                      Save
                    </button>
                  </div>
                </div>

                <div className="card-body space-y-4">
                  <div>
                    <label
                      htmlFor="profile-full-name"
                      className="block text-sm font-medium text-[color:var(--color-text-primary)] dark:text-[var(--color-text-tertiary)] mb-1"
                    >
                      Full Name
                    </label>
                    <input
                      id="profile-full-name"
                      type="text"
                      value="John Doe"
                      readOnly
                      className="w-full px-3 py-2 border border-[color:var(--color-border-primary)] dark:border-[var(--color-border)] rounded-lg bg-[var(--color-surface-primary)] dark:bg-[color:var(--color-background-elevated)] text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="profile-email"
                      className="block text-sm font-medium text-[color:var(--color-text-primary)] dark:text-[var(--color-text-tertiary)] mb-1"
                    >
                      Email
                    </label>
                    <input
                      id="profile-email"
                      type="email"
                      value="john@example.com"
                      readOnly
                      className="w-full px-3 py-2 border border-[color:var(--color-border-primary)] dark:border-[var(--color-border)] rounded-lg bg-[var(--color-surface-primary)] dark:bg-[color:var(--color-background-elevated)] text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)]"
                    />
                  </div>

                  <div className="card-meta flex gap-4 text-sm text-[color:var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                    <span>Member since 2024</span>
                    <span />
                    <span>Last login: Today</span>
                  </div>
                </div>
              </Card>

              {/* Card with Image */}
              <Card responsive variant="bordered">
                <div className="card-image mb-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)] rounded-lg flex items-center justify-center text-[var(--color-text-primary)] font-semibold text-lg">
                  Featured Image
                </div>

                <h3 className="card-title text-xl font-semibold text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)] mb-2">
                  Article Title
                </h3>

                <div className="card-body text-[color:var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                  <p>
                    This is a responsive card that adapts its layout based on the container width.
                    The image aspect ratio changes from 16:9 to 21:9 on larger containers, and the
                    content can flow into columns when space allows.
                  </p>
                  <p className="mt-4">
                    Container queries enable true component-based responsive design, where
                    components respond to their immediate container rather than the viewport.
                  </p>
                </div>

                <div className="card-actions flex gap-2 mt-4">
                  <button className="flex-1 px-4 py-2 bg-[var(--color-primary)] text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors">
                    Read More
                  </button>
                  <button className="flex-1 px-4 py-2 bg-[color:var(--color-background-secondary)] dark:bg-[var(--color-surface-primary)] text-[color:var(--color-text-primary)] dark:text-[var(--color-text-tertiary)] rounded-lg hover:bg-[var(--color-border)] dark:hover:bg-[var(--color-surface-primary)] transition-colors">
                    Share
                  </button>
                </div>
              </Card>
            </div>
          </section>

          {/* Table Example */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)] mb-4">
              Responsive Table
            </h2>
            <p className="text-[color:var(--color-text-secondary)] dark:text-[color:var(--color-text-tertiary)] mb-6">
              Tables convert to card layout on narrow containers, horizontal scroll on medium
              containers.
            </p>

            <div className="container-table bg-[var(--color-surface-primary)] dark:bg-[color:var(--color-background-elevated)] rounded-lg shadow-lg overflow-hidden">
              <table className="table-responsive w-full">
                <thead className="bg-[color:var(--color-background-secondary)] dark:bg-[var(--color-surface-primary)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[var(--color-surface-primary)] dark:bg-[color:var(--color-background-elevated)] divide-y divide-[var(--color-border)] dark:divide-[var(--color-border)]">
                  {[
                    {
                      name: 'John Doe',
                      email: 'john@example.com',
                      role: 'Admin',
                      status: 'Active',
                    },
                    {
                      name: 'Jane Smith',
                      email: 'jane@example.com',
                      role: 'User',
                      status: 'Active',
                    },
                    {
                      name: 'Bob Johnson',
                      email: 'bob@example.com',
                      role: 'User',
                      status: 'Inactive',
                    },
                  ].map((user, index) => (
                    <tr key={index}>
                      <td
                        data-label="Name"
                        className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)]"
                      >
                        {user.name}
                      </td>
                      <td
                        data-label="Email"
                        className="px-6 py-4 whitespace-nowrap text-sm text-[color:var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]"
                      >
                        {user.email}
                      </td>
                      <td
                        data-label="Role"
                        className="px-6 py-4 whitespace-nowrap text-sm text-[color:var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]"
                      >
                        {user.role}
                      </td>
                      <td
                        data-label="Status"
                        className="px-6 py-4 whitespace-nowrap text-sm text-[color:var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]"
                      >
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === 'Active'
                              ? 'bg-[var(--color-success-light)] text-[var(--color-success)] dark:bg-[var(--color-success)]/30 dark:text-[var(--color-success)]'
                              : 'bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] dark:bg-[var(--color-surface-primary)] dark:text-[var(--color-text-tertiary)]'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Form Example */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)] mb-4">
              Responsive Form
            </h2>
            <p className="text-[color:var(--color-text-secondary)] dark:text-[color:var(--color-text-tertiary)] mb-6">
              Forms adapt from 1 column to 2 columns to 3 columns based on container width.
            </p>

            <Card responsive variant="elevated">
              <form className="container-form form-responsive">
                <div className="form-group">
                  <label
                    htmlFor="form-first-name"
                    className="block text-sm font-medium text-[color:var(--color-text-primary)] dark:text-[var(--color-text-tertiary)] mb-1"
                  >
                    First Name
                  </label>
                  <input
                    id="form-first-name"
                    type="text"
                    className="w-full px-3 py-2 border border-[color:var(--color-border-primary)] dark:border-[var(--color-border)] rounded-lg bg-[var(--color-surface-primary)] dark:bg-[color:var(--color-background-elevated)] text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)]"
                    placeholder="John"
                  />
                </div>

                <div className="form-group">
                  <label
                    htmlFor="form-last-name"
                    className="block text-sm font-medium text-[color:var(--color-text-primary)] dark:text-[var(--color-text-tertiary)] mb-1"
                  >
                    Last Name
                  </label>
                  <input
                    id="form-last-name"
                    type="text"
                    className="w-full px-3 py-2 border border-[color:var(--color-border-primary)] dark:border-[var(--color-border)] rounded-lg bg-[var(--color-surface-primary)] dark:bg-[color:var(--color-background-elevated)] text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)]"
                    placeholder="Doe"
                  />
                </div>

                <div className="form-group">
                  <label
                    htmlFor="form-phone"
                    className="block text-sm font-medium text-[color:var(--color-text-primary)] dark:text-[var(--color-text-tertiary)] mb-1"
                  >
                    Phone
                  </label>
                  <input
                    id="form-phone"
                    type="tel"
                    className="w-full px-3 py-2 border border-[color:var(--color-border-primary)] dark:border-[var(--color-border)] rounded-lg bg-[var(--color-surface-primary)] dark:bg-[color:var(--color-background-elevated)] text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)]"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="form-group form-group-full">
                  <label
                    htmlFor="form-email"
                    className="block text-sm font-medium text-[color:var(--color-text-primary)] dark:text-[var(--color-text-tertiary)] mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    id="form-email"
                    type="email"
                    className="w-full px-3 py-2 border border-[color:var(--color-border-primary)] dark:border-[var(--color-border)] rounded-lg bg-[var(--color-surface-primary)] dark:bg-[color:var(--color-background-elevated)] text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)]"
                    placeholder="john.doe@example.com"
                  />
                </div>

                <div className="form-group form-group-full">
                  <label
                    htmlFor="form-message"
                    className="block text-sm font-medium text-[color:var(--color-text-primary)] dark:text-[var(--color-text-tertiary)] mb-1"
                  >
                    Message
                  </label>
                  <textarea
                    id="form-message"
                    rows={4}
                    className="w-full px-3 py-2 border border-[color:var(--color-border-primary)] dark:border-[var(--color-border)] rounded-lg bg-[var(--color-surface-primary)] dark:bg-[color:var(--color-background-elevated)] text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)]"
                    placeholder="Your message here..."
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="px-6 py-2 bg-[color:var(--color-background-secondary)] dark:bg-[var(--color-surface-primary)] text-[color:var(--color-text-primary)] dark:text-[var(--color-text-tertiary)] rounded-lg hover:bg-[var(--color-border)] dark:hover:bg-[var(--color-surface-primary)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[var(--color-primary)] text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </Card>
          </section>

          {/* Modal Demo */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)] mb-4">
              Responsive Modal
            </h2>
            <p className="text-[color:var(--color-text-secondary)] dark:text-[color:var(--color-text-tertiary)] mb-6">
              Modals adapt their padding and button layout based on available space.
            </p>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-[var(--color-primary)] text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors font-medium"
            >
              Open Responsive Modal
            </button>
          </section>
        </div>

        {/* Documentation */}
        <section className="max-w-4xl mx-auto mt-16 bg-[var(--color-surface-primary)] dark:bg-[color:var(--color-background-elevated)] rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)] mb-6">
            Implementation Guide
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)] mb-2">
                1. Enable Container Queries
              </h3>
              <p className="text-[color:var(--color-text-secondary)] dark:text-[color:var(--color-text-tertiary)] mb-3">
                Add{' '}
                <code className="px-2 py-1 bg-[color:var(--color-background-secondary)] dark:bg-[var(--color-surface-primary)] rounded text-sm">
                  responsive
                </code>{' '}
                prop to components:
              </p>
              <pre className="bg-[color:var(--color-background-secondary)] dark:bg-[var(--color-surface-primary)] p-4 rounded-lg overflow-x-auto">
                <code className="text-sm text-[color:var(--color-text-primary)] dark:text-[var(--color-text-secondary)]">{`<Card responsive variant="elevated">
  {children}
</Card>

<Modal responsive size="lg" isOpen={isOpen} onClose={onClose}>
  {content}
</Modal>`}</code>
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)] mb-2">
                2. Browser Support
              </h3>
              <ul className="list-disc list-inside space-y-2 text-[color:var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                <li>Chrome/Edge 105+ (September 2022)</li>
                <li>Safari 16+ (September 2022)</li>
                <li>Firefox 110+ (February 2023)</li>
                <li>~92% global browser support as of 2025</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)] mb-2">
                3. Benefits
              </h3>
              <ul className="list-disc list-inside space-y-2 text-[color:var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                <li>True component-based responsive design</li>
                <li>Components work in any layout context</li>
                <li>No media query breakpoint proliferation</li>
                <li>Better reusability across different page layouts</li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* Responsive Modal */}
      <Modal
        responsive
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Responsive Modal Example"
        size="lg"
        footer={
          <>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-[color:var(--color-background-secondary)] dark:bg-[var(--color-surface-primary)] text-[color:var(--color-text-primary)] dark:text-[var(--color-text-tertiary)] rounded-lg hover:bg-[var(--color-border)] dark:hover:bg-[var(--color-surface-primary)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              Confirm
            </button>
          </>
        }
      >
        <div className="modal-body space-y-4">
          <p className="text-[color:var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
            This modal uses container queries to adapt its layout. Try resizing your browser window
            to see how the modal&apos;s padding, footer button layout, and overall structure
            changes.
          </p>

          <div className="bg-[color:var(--color-primary-50)] dark:bg-[var(--color-primary)]/20 border border-[var(--color-primary)] dark:border-[var(--color-primary)] rounded-lg p-4">
            <h4 className="font-semibold text-[var(--color-primary)] dark:text-[var(--color-primary)] mb-2">
              Key Features:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-[var(--color-primary)] dark:text-[var(--color-primary)]">
              <li>Compact layout (&lt; 500px): Full-width buttons, reduced padding</li>
              <li>Medium layout (500px - 768px): Horizontal footer, moderate padding</li>
              <li>Large layout (&gt; 768px): Optimal spacing, full padding</li>
            </ul>
          </div>

          <p className="text-[color:var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
            Container queries enable this modal to be truly responsive regardless of where it&apos;s
            used in the application. The same component works perfectly in narrow sidebars, wide
            dashboards, or full-screen views.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default ContainerQueriesDemo;
