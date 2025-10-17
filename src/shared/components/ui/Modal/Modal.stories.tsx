import { Modal } from '@shared/components/ui/Modal';
import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';

/**
 * Modal Component Documentation
 *
 * A flexible modal dialog component with:
 * - Multiple sizes (sm, md, lg, xl, full)
 * - Focus trap and accessibility
 * - Escape key and backdrop click handling
 * - Animation support
 * - Portal-based rendering
 * - Dark mode compatible
 * - Customizable header, body, and footer
 */
const meta = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A modal dialog component with built-in accessibility features, focus management, and multiple size options.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Controls modal visibility',
      table: {
        type: { summary: 'boolean' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
      description: 'Modal size',
      table: {
        type: { summary: 'ModalSize' },
        defaultValue: { summary: 'md' },
      },
    },
    title: {
      control: 'text',
      description: 'Modal title',
    },
    closeOnBackdropClick: {
      control: 'boolean',
      description: 'Close modal when clicking backdrop',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
    closeOnEscape: {
      control: 'boolean',
      description: 'Close modal when pressing Escape key',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
    showCloseButton: {
      control: 'boolean',
      description: 'Show close button in header',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// Helper Component for Interactive Stories
// ============================================================================

interface ModalWrapperProps {
  children: (isOpen: boolean, onClose: () => void, onOpen: () => void) => React.ReactNode;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      {children(
        isOpen,
        () => setIsOpen(false),
        () => setIsOpen(true)
      )}
    </>
  );
};

// ============================================================================
// Basic Examples
// ============================================================================

export const Default: Story = {
  render: () => (
    <ModalWrapper>
      {(isOpen, onClose, onOpen) => (
        <>
          <button
            onClick={onOpen}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Open Modal
          </button>
          <Modal isOpen={isOpen} onClose={onClose} title="Default Modal">
            <p>This is a basic modal with default settings.</p>
            <p className="mt-2">Click outside, press Escape, or use the close button to dismiss.</p>
          </Modal>
        </>
      )}
    </ModalWrapper>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <ModalWrapper>
      {(isOpen, onClose, onOpen) => (
        <>
          <button
            onClick={onOpen}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Open Modal with Footer
          </button>
          <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Confirm Action"
            footer={
              <div className="flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Confirmed!');
                    onClose();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Confirm
                </button>
              </div>
            }
          >
            <p>Are you sure you want to proceed with this action?</p>
            <p className="mt-2 text-sm text-gray-600">This action cannot be undone.</p>
          </Modal>
        </>
      )}
    </ModalWrapper>
  ),
};

// ============================================================================
// Sizes
// ============================================================================

export const SmallSize: Story = {
  render: () => (
    <ModalWrapper>
      {(isOpen, onClose, onOpen) => (
        <>
          <button
            onClick={onOpen}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Small Modal
          </button>
          <Modal isOpen={isOpen} onClose={onClose} title="Small Modal" size="sm">
            <p>This is a small modal, perfect for simple confirmations.</p>
          </Modal>
        </>
      )}
    </ModalWrapper>
  ),
};

export const MediumSize: Story = {
  render: () => (
    <ModalWrapper>
      {(isOpen, onClose, onOpen) => (
        <>
          <button
            onClick={onOpen}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Medium Modal
          </button>
          <Modal isOpen={isOpen} onClose={onClose} title="Medium Modal" size="md">
            <p>This is a medium modal - the default size.</p>
            <p className="mt-2">
              It works well for most use cases like forms and detailed information.
            </p>
          </Modal>
        </>
      )}
    </ModalWrapper>
  ),
};

export const LargeSize: Story = {
  render: () => (
    <ModalWrapper>
      {(isOpen, onClose, onOpen) => (
        <>
          <button
            onClick={onOpen}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Large Modal
          </button>
          <Modal isOpen={isOpen} onClose={onClose} title="Large Modal" size="lg">
            <div className="space-y-4">
              <p>This is a large modal for more complex content.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded">
                  <h3 className="font-semibold mb-2">Section 1</h3>
                  <p className="text-sm">Content for section 1</p>
                </div>
                <div className="p-4 border rounded">
                  <h3 className="font-semibold mb-2">Section 2</h3>
                  <p className="text-sm">Content for section 2</p>
                </div>
              </div>
            </div>
          </Modal>
        </>
      )}
    </ModalWrapper>
  ),
};

export const ExtraLargeSize: Story = {
  render: () => (
    <ModalWrapper>
      {(isOpen, onClose, onOpen) => (
        <>
          <button
            onClick={onOpen}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Extra Large Modal
          </button>
          <Modal isOpen={isOpen} onClose={onClose} title="Extra Large Modal" size="xl">
            <div className="space-y-4">
              <p>This is an extra large modal for very complex layouts.</p>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="p-4 border rounded">
                    <h3 className="font-semibold mb-2">Item {i}</h3>
                    <p className="text-sm">Description for item {i}</p>
                  </div>
                ))}
              </div>
            </div>
          </Modal>
        </>
      )}
    </ModalWrapper>
  ),
};

export const FullSize: Story = {
  render: () => (
    <ModalWrapper>
      {(isOpen, onClose, onOpen) => (
        <>
          <button
            onClick={onOpen}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Full Size Modal
          </button>
          <Modal isOpen={isOpen} onClose={onClose} title="Full Size Modal" size="full">
            <div className="space-y-4">
              <p>This modal takes up almost the entire viewport.</p>
              <p>Perfect for immersive experiences or complex data tables.</p>
              <div className="h-96 border rounded p-4 overflow-auto">
                <h3 className="font-semibold mb-4">Large Content Area</h3>
                {Array.from({ length: 20 }).map((_, i) => (
                  <p key={i} className="mb-2">
                    Line {i + 1}: This is scrollable content within the modal.
                  </p>
                ))}
              </div>
            </div>
          </Modal>
        </>
      )}
    </ModalWrapper>
  ),
};

// ============================================================================
// Behavior Variations
// ============================================================================

export const NoBackdropClose: Story = {
  render: () => (
    <ModalWrapper>
      {(isOpen, onClose, onOpen) => (
        <>
          <button
            onClick={onOpen}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Open (No Backdrop Close)
          </button>
          <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Persistent Modal"
            closeOnBackdropClick={false}
          >
            <p>This modal cannot be closed by clicking the backdrop.</p>
            <p className="mt-2">You must use the close button or Escape key.</p>
          </Modal>
        </>
      )}
    </ModalWrapper>
  ),
};

export const NoEscapeClose: Story = {
  render: () => (
    <ModalWrapper>
      {(isOpen, onClose, onOpen) => (
        <>
          <button
            onClick={onOpen}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Open (No Escape Close)
          </button>
          <Modal isOpen={isOpen} onClose={onClose} title="No Escape Modal" closeOnEscape={false}>
            <p>This modal cannot be closed with the Escape key.</p>
            <p className="mt-2">You must use the close button or click the backdrop.</p>
          </Modal>
        </>
      )}
    </ModalWrapper>
  ),
};

export const NoCloseButton: Story = {
  render: () => (
    <ModalWrapper>
      {(isOpen, onClose, onOpen) => (
        <>
          <button
            onClick={onOpen}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Open (No Close Button)
          </button>
          <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Custom Close Modal"
            showCloseButton={false}
            footer={
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Got It!
              </button>
            }
          >
            <p>This modal has no close button in the header.</p>
            <p className="mt-2">Use the custom footer button, backdrop click, or Escape key.</p>
          </Modal>
        </>
      )}
    </ModalWrapper>
  ),
};

// ============================================================================
// Real-World Examples
// ============================================================================

export const FormModal: Story = {
  render: () => (
    <ModalWrapper>
      {(isOpen, onClose, onOpen) => (
        <>
          <button
            onClick={onOpen}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create New User
          </button>
          <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create New User"
            footer={
              <div className="flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('User created!');
                    onClose();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            }
          >
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label htmlFor="user-name" className="block text-sm font-medium mb-1">
                  Name
                </label>
                <input
                  id="user-name"
                  type="text"
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label htmlFor="user-email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  id="user-email"
                  type="email"
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label htmlFor="user-role" className="block text-sm font-medium mb-1">
                  Role
                </label>
                <select
                  id="user-role"
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option>User</option>
                  <option>Admin</option>
                  <option>Manager</option>
                </select>
              </div>
            </form>
          </Modal>
        </>
      )}
    </ModalWrapper>
  ),
};

export const ConfirmationModal: Story = {
  render: () => (
    <ModalWrapper>
      {(isOpen, onClose, onOpen) => (
        <>
          <button
            onClick={onOpen}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete Account
          </button>
          <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Confirm Deletion"
            size="sm"
            closeOnBackdropClick={false}
            footer={
              <div className="flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Account deleted');
                    onClose();
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            }
          >
            <p className="text-gray-700">Are you sure you want to delete your account?</p>
            <p className="mt-2 text-sm text-red-600 font-semibold">This action cannot be undone.</p>
          </Modal>
        </>
      )}
    </ModalWrapper>
  ),
};

export const ScrollableContent: Story = {
  render: () => (
    <ModalWrapper>
      {(isOpen, onClose, onOpen) => (
        <>
          <button
            onClick={onOpen}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            View Terms & Conditions
          </button>
          <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Terms and Conditions"
            size="lg"
            footer={
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                I Agree
              </button>
            }
          >
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              <h3 className="font-semibold">1. Introduction</h3>
              <p className="text-sm text-gray-700">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua.
              </p>

              <h3 className="font-semibold">2. User Responsibilities</h3>
              <p className="text-sm text-gray-700">
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                ex ea commodo consequat.
              </p>

              <h3 className="font-semibold">3. Privacy Policy</h3>
              <p className="text-sm text-gray-700">
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
                fugiat nulla pariatur.
              </p>

              {/* Repeat sections for scrollable content */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i}>
                  <h3 className="font-semibold">{i + 4}. Additional Section</h3>
                  <p className="text-sm text-gray-700">
                    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
                    deserunt mollit anim id est laborum.
                  </p>
                </div>
              ))}
            </div>
          </Modal>
        </>
      )}
    </ModalWrapper>
  ),
};

// ============================================================================
// Dark Mode
// ============================================================================

export const DarkMode: Story = {
  render: () => (
    <ModalWrapper>
      {(isOpen, onClose, onOpen) => (
        <>
          <button
            onClick={onOpen}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Open Modal (Dark Mode)
          </button>
          <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Dark Mode Modal"
            footer={
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            }
          >
            <p>This modal supports dark mode automatically.</p>
            <p className="mt-2">Toggle the theme in the Storybook toolbar to see it in action.</p>
          </Modal>
        </>
      )}
    </ModalWrapper>
  ),
  parameters: {
    backgrounds: { default: 'dark' },
  },
};
