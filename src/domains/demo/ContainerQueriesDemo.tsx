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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Container Queries Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Resize the containers below to see components adapt to their parent's size, not the
            viewport.
          </p>

          {/* Container Width Controls */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setContainerWidth('small')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                containerWidth === 'small'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Small (384px)
            </button>
            <button
              onClick={() => setContainerWidth('medium')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                containerWidth === 'medium'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Medium (672px)
            </button>
            <button
              onClick={() => setContainerWidth('large')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                containerWidth === 'large'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Large (1152px)
            </button>
          </div>

          {/* Browser Support Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 dark:text-blue-300">
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Responsive Cards
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Cards adapt their layout based on container width. Try resizing!
            </p>

            <div className="grid gap-6">
              {/* Card with Header and Actions */}
              <Card responsive variant="elevated">
                <div className="card-header flex justify-between items-start mb-4">
                  <div>
                    <h3 className="card-title text-xl font-semibold text-gray-900 dark:text-white">
                      User Profile
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Updated 2 hours ago
                    </p>
                  </div>
                  <div className="card-actions flex gap-2">
                    <button className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      Edit
                    </button>
                    <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Save
                    </button>
                  </div>
                </div>

                <div className="card-body space-y-4">
                  <div>
                    <label
                      htmlFor="profile-full-name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Full Name
                    </label>
                    <input
                      id="profile-full-name"
                      type="text"
                      value="John Doe"
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="profile-email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Email
                    </label>
                    <input
                      id="profile-email"
                      type="email"
                      value="john@example.com"
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="card-meta flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>Member since 2024</span>
                    <span />
                    <span>Last login: Today</span>
                  </div>
                </div>
              </Card>

              {/* Card with Image */}
              <Card responsive variant="bordered">
                <div className="card-image mb-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-semibold text-lg">
                  Featured Image
                </div>

                <h3 className="card-title text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Article Title
                </h3>

                <div className="card-body text-gray-600 dark:text-gray-400">
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
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Read More
                  </button>
                  <button className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    Share
                  </button>
                </div>
              </Card>
            </div>
          </section>

          {/* Table Example */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Responsive Table
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Tables convert to card layout on narrow containers, horizontal scroll on medium
              containers.
            </p>

            <div className="container-table bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <table className="table-responsive w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
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
                        className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white"
                      >
                        {user.name}
                      </td>
                      <td
                        data-label="Email"
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
                      >
                        {user.email}
                      </td>
                      <td
                        data-label="Role"
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
                      >
                        {user.role}
                      </td>
                      <td
                        data-label="Status"
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
                      >
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === 'Active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Responsive Form
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Forms adapt from 1 column to 2 columns to 3 columns based on container width.
            </p>

            <Card responsive variant="elevated">
              <form className="container-form form-responsive">
                <div className="form-group">
                  <label
                    htmlFor="form-first-name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    First Name
                  </label>
                  <input
                    id="form-first-name"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="John"
                  />
                </div>

                <div className="form-group">
                  <label
                    htmlFor="form-last-name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Last Name
                  </label>
                  <input
                    id="form-last-name"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Doe"
                  />
                </div>

                <div className="form-group">
                  <label
                    htmlFor="form-phone"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Phone
                  </label>
                  <input
                    id="form-phone"
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="form-group form-group-full">
                  <label
                    htmlFor="form-email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    id="form-email"
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="john.doe@example.com"
                  />
                </div>

                <div className="form-group form-group-full">
                  <label
                    htmlFor="form-message"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Message
                  </label>
                  <textarea
                    id="form-message"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Your message here..."
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </Card>
          </section>

          {/* Modal Demo */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Responsive Modal
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Modals adapt their padding and button layout based on available space.
            </p>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Open Responsive Modal
            </button>
          </section>
        </div>

        {/* Documentation */}
        <section className="max-w-4xl mx-auto mt-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Implementation Guide
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                1. Enable Container Queries
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                Add{' '}
                <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                  responsive
                </code>{' '}
                prop to components:
              </p>
              <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
                <code className="text-sm text-gray-800 dark:text-gray-200">{`<Card responsive variant="elevated">
  {children}
</Card>

<Modal responsive size="lg" isOpen={isOpen} onClose={onClose}>
  {content}
</Modal>`}</code>
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                2. Browser Support
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                <li>Chrome/Edge 105+ (September 2022)</li>
                <li>Safari 16+ (September 2022)</li>
                <li>Firefox 110+ (February 2023)</li>
                <li>~92% global browser support as of 2025</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                3. Benefits
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
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
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Confirm
            </button>
          </>
        }
      >
        <div className="modal-body space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            This modal uses container queries to adapt its layout. Try resizing your browser window
            to see how the modal's padding, footer button layout, and overall structure changes.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Key Features:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <li>Compact layout (&lt; 500px): Full-width buttons, reduced padding</li>
              <li>Medium layout (500px - 768px): Horizontal footer, moderate padding</li>
              <li>Large layout (&gt; 768px): Optimal spacing, full padding</li>
            </ul>
          </div>

          <p className="text-gray-600 dark:text-gray-400">
            Container queries enable this modal to be truly responsive regardless of where it's used
            in the application. The same component works perfectly in narrow sidebars, wide
            dashboards, or full-screen views.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default ContainerQueriesDemo;
