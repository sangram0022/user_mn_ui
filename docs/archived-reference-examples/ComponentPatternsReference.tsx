/**
 * Component Patterns Reference
 * 
 * Collection of reusable UI component patterns and best practices
 * for building consistent, accessible interfaces.
 */

import { useState } from 'react';
import { Button, Card, LoadingSpinner, SkeletonText } from '../components';

export default function ComponentPatternsReference() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Component Patterns Reference</h1>
          <p className="text-xl text-gray-600">Reusable UI patterns and component examples</p>
        </div>

        <div className="space-y-12">
          {/* Modal Pattern */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">Modal / Dialog</h2>
            <Card>
              <ModalExample />
            </Card>
          </section>

          {/* Tabs Pattern */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">Tabs</h2>
            <Card>
              <TabsExample />
            </Card>
          </section>

          {/* Accordion Pattern */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">Accordion / Collapsible</h2>
            <Card>
              <AccordionExample />
            </Card>
          </section>

          {/* Dropdown Pattern */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">Dropdown Menu</h2>
            <Card>
              <DropdownExample />
            </Card>
          </section>

          {/* Toast Notifications */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">Toast Notifications</h2>
            <Card>
              <ToastExample />
            </Card>
          </section>

          {/* Breadcrumb */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">Breadcrumb Navigation</h2>
            <Card>
              <BreadcrumbExample />
            </Card>
          </section>

          {/* Pagination */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">Pagination</h2>
            <Card>
              <PaginationExample />
            </Card>
          </section>

          {/* Card Variations */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">Card Variations</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <h3 className="text-lg font-semibold mb-2">Simple Card</h3>
                <p className="text-gray-600 mb-4">Basic card with title and description</p>
                <Button size="sm">Action</Button>
              </Card>

              <Card>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    JD
                  </div>
                  <div>
                    <h3 className="font-semibold">John Doe</h3>
                    <p className="text-sm text-gray-600">Software Engineer</p>
                  </div>
                </div>
                <p className="text-gray-600">Card with avatar and user info</p>
              </Card>

              <Card>
                <div className="aspect-video bg-gray-200 rounded-lg mb-3"></div>
                <h3 className="text-lg font-semibold mb-2">Image Card</h3>
                <p className="text-gray-600">Card with image placeholder</p>
              </Card>
            </div>
          </section>

          {/* Empty States */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">Empty States</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <div className="text-center py-12">
                  <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <h3 className="mt-4 text-lg font-semibold">No items yet</h3>
                  <p className="mt-2 text-gray-600">Get started by creating your first item</p>
                  <Button size="sm" className="mt-4">Create Item</Button>
                </div>
              </Card>

              <Card>
                <div className="text-center py-12">
                  <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-semibold">No results found</h3>
                  <p className="mt-2 text-gray-600">Try adjusting your search or filters</p>
                  <Button size="sm" variant="outline" className="mt-4">Clear Filters</Button>
                </div>
              </Card>
            </div>
          </section>

          {/* Loading States */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">Loading States</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <h3 className="text-lg font-semibold mb-4">Spinner</h3>
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold mb-4">Skeleton</h3>
                <div className="space-y-3">
                  <SkeletonText lines={3} />
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold mb-4">Progress Bar</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Loading...</span>
                      <span className="text-sm">75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* Avatar Patterns */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">Avatar Patterns</h2>
            <Card>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    JD
                  </div>
                  <span>Small</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                    AS
                  </div>
                  <span>Medium</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    MK
                  </div>
                  <span>Large</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center text-white font-semibold text-sm">
                      J
                    </div>
                    <div className="w-10 h-10 bg-green-600 rounded-full border-2 border-white flex items-center justify-center text-white font-semibold text-sm">
                      A
                    </div>
                    <div className="w-10 h-10 bg-purple-600 rounded-full border-2 border-white flex items-center justify-center text-white font-semibold text-sm">
                      M
                    </div>
                  </div>
                  <span>Avatar Group</span>
                </div>
              </div>
            </Card>
          </section>

          {/* Status Indicators */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">Status Indicators</h2>
            <Card>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Away</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Busy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span>Offline</span>
                </div>
              </div>
            </Card>
          </section>

          {/* Stat Cards */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">Stat Cards</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { label: 'Total Users', value: '12,345', change: '+12%', positive: true },
                { label: 'Revenue', value: '$45,678', change: '+8%', positive: true },
                { label: 'Active Sessions', value: '1,234', change: '-3%', positive: false },
                { label: 'Conversion Rate', value: '3.24%', change: '+0.5%', positive: true },
              ].map((stat, index) => (
                <Card key={index}>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <div className="flex items-center gap-1">
                      <span className={`text-sm font-medium ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change}
                      </span>
                      <span className="text-xs text-gray-500">vs last month</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// Modal Example Component
function ModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">Modal Title</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-600 mb-6">This is the modal content. You can put any content here.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsOpen(false)}>Confirm</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Tabs Example Component
function TabsExample() {
  const [activeTab, setActiveTab] = useState('tab1');

  return (
    <div>
      <div className="flex gap-2 border-b border-gray-200 mb-4">
        {[
          { id: 'tab1', label: 'Tab 1' },
          { id: 'tab2', label: 'Tab 2' },
          { id: 'tab3', label: 'Tab 3' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className="p-4">
        {activeTab === 'tab1' && <p>Content for Tab 1</p>}
        {activeTab === 'tab2' && <p>Content for Tab 2</p>}
        {activeTab === 'tab3' && <p>Content for Tab 3</p>}
      </div>
    </div>
  );
}

// Accordion Example Component
function AccordionExample() {
  const [openItems, setOpenItems] = useState<number[]>([0]);

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const items = [
    { title: 'Section 1', content: 'Content for section 1' },
    { title: 'Section 2', content: 'Content for section 2' },
    { title: 'Section 3', content: 'Content for section 3' },
  ];

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleItem(index)}
            className="w-full flex justify-between items-center p-4 text-left font-medium hover:bg-gray-50"
          >
            <span>{item.title}</span>
            <svg
              className={`w-5 h-5 transition-transform ${openItems.includes(index) ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openItems.includes(index) && (
            <div className="p-4 pt-0 text-gray-600">
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Dropdown Example Component
function DropdownExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <Button onClick={() => setIsOpen(!isOpen)}>
        Dropdown Menu
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>
      
      {isOpen && (
        <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-lg">
            Option 1
          </button>
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100">
            Option 2
          </button>
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-lg">
            Option 3
          </button>
        </div>
      )}
    </div>
  );
}

// Toast Example Component
function ToastExample() {
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: string }>>([]);

  const showToast = (type: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message: `${type} toast notification`, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => showToast('success')}>Show Success</Button>
        <Button size="sm" variant="danger" onClick={() => showToast('error')}>Show Error</Button>
        <Button size="sm" variant="secondary" onClick={() => showToast('info')}>Show Info</Button>
      </div>
      
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`p-4 rounded-lg shadow-lg min-w-[300px] ${
              toast.type === 'success' ? 'bg-green-600' :
              toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
            } text-white`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}

// Breadcrumb Example Component
function BreadcrumbExample() {
  return (
    <nav className="flex items-center gap-2 text-sm">
      <a href="#" className="text-blue-600 hover:underline">Home</a>
      <span className="text-gray-400">/</span>
      <a href="#" className="text-blue-600 hover:underline">Products</a>
      <span className="text-gray-400">/</span>
      <a href="#" className="text-blue-600 hover:underline">Category</a>
      <span className="text-gray-400">/</span>
      <span className="text-gray-600">Current Page</span>
    </nav>
  );
}

// Pagination Example Component
function PaginationExample() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      
      {[...Array(totalPages)].map((_, i) => {
        const page = i + 1;
        if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
          return (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 border rounded-lg ${
                currentPage === page
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          );
        } else if (page === currentPage - 2 || page === currentPage + 2) {
          return <span key={page}>...</span>;
        }
        return null;
      })}
      
      <button
        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}
