/**
 * Complete UI Elements Reference
 * 
 * Comprehensive showcase of all HTML5 elements and UI patterns
 * for quick reference during development.
 */

import { useState } from 'react';
import { Button, Input, Badge, Card, LoadingSpinner, SkeletonText } from '../components';

export default function UIElementsShowcase() {
  const [selectedTab, setSelectedTab] = useState<string>('typography');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">UI Elements Reference</h1>
          <p className="text-xl text-gray-600">Complete showcase of HTML5 elements and UI patterns</p>
          <Badge variant="warning" className="mt-2">Development Reference Only</Badge>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-4">
          {[
            { id: 'typography', label: 'Typography' },
            { id: 'forms', label: 'Form Elements' },
            { id: 'buttons', label: 'Buttons & Actions' },
            { id: 'tables', label: 'Tables & Lists' },
            { id: 'media', label: 'Media Elements' },
            { id: 'semantic', label: 'Semantic HTML' },
            { id: 'interactive', label: 'Interactive' },
            { id: 'layouts', label: 'Layout Patterns' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          {/* Typography Section */}
          {selectedTab === 'typography' && (
            <section className="space-y-8">
              <SectionHeader title="Typography Elements" />
              
              {/* Headings */}
              <Card>
                <h3 className="text-xl font-semibold mb-4">Headings (h1-h6)</h3>
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold">Heading 1 - Main Title</h1>
                  <h2 className="text-3xl font-bold">Heading 2 - Section Title</h2>
                  <h3 className="text-2xl font-semibold">Heading 3 - Subsection</h3>
                  <h4 className="text-xl font-semibold">Heading 4 - Minor Heading</h4>
                  <h5 className="text-lg font-medium">Heading 5 - Small Heading</h5>
                  <h6 className="text-base font-medium">Heading 6 - Smallest Heading</h6>
                </div>
              </Card>

              {/* Text Elements */}
              <Card>
                <h3 className="text-xl font-semibold mb-4">Text Elements</h3>
                <div className="space-y-3">
                  <p className="text-base">
                    This is a <strong>paragraph</strong> with <em>emphasized text</em>, 
                    <mark className="bg-yellow-200 px-1">highlighted text</mark>, 
                    <del>deleted text</del>, <ins className="underline">inserted text</ins>, 
                    <small className="text-sm">small text</small>, and 
                    <code className="bg-gray-100 px-1 py-0.5 rounded">inline code</code>.
                  </p>
                  <p>
                    <abbr title="Hypertext Markup Language">HTML</abbr> and 
                    <abbr title="Cascading Style Sheets">CSS</abbr> are fundamental web technologies.
                  </p>
                  <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700">
                    "This is a blockquote element used for quotations and citations."
                  </blockquote>
                  <p>
                    Mathematical expression: E = mc<sup>2</sup> and chemical formula: H<sub>2</sub>O
                  </p>
                </div>
              </Card>

              {/* Code Blocks */}
              <Card>
                <h3 className="text-xl font-semibold mb-4">Code Blocks</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <code>{`function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

const message = greet("World");
console.log(message);`}</code>
                </pre>
              </Card>
            </section>
          )}

          {/* Forms Section */}
          {selectedTab === 'forms' && (
            <section className="space-y-8">
              <SectionHeader title="Form Elements" />
              
              <Card>
                <h3 className="text-xl font-semibold mb-4">Text Inputs</h3>
                <div className="space-y-4">
                  <Input type="text" placeholder="Text input" label="Text" />
                  <Input type="email" placeholder="email@example.com" label="Email" />
                  <Input type="password" placeholder="••••••••" label="Password" />
                  <Input type="number" placeholder="123" label="Number" />
                  <Input type="tel" placeholder="(123) 456-7890" label="Phone" />
                  <Input type="url" placeholder="https://example.com" label="URL" />
                  <Input type="date" label="Date" />
                  <Input type="time" label="Time" />
                  <Input type="datetime-local" label="Date & Time" />
                  <Input type="search" placeholder="Search..." label="Search" />
                </div>
              </Card>

              <Card>
                <h3 className="text-xl font-semibold mb-4">Textarea & Select</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Textarea</label>
                    <textarea 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                      rows={4}
                      placeholder="Enter multiple lines of text..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Dropdown</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option>Option 1</option>
                      <option>Option 2</option>
                      <option>Option 3</option>
                      <option disabled>Disabled Option</option>
                    </select>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-xl font-semibold mb-4">Checkboxes & Radio Buttons</h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium mb-2">Checkboxes:</p>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="w-4 h-4 text-blue-600" defaultChecked />
                        <span>Option 1 (checked)</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="w-4 h-4 text-blue-600" />
                        <span>Option 2</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="w-4 h-4 text-blue-600" disabled />
                        <span className="text-gray-400">Option 3 (disabled)</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium mb-2">Radio Buttons:</p>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="radio" name="radio" className="w-4 h-4 text-blue-600" defaultChecked />
                        <span>Choice 1 (selected)</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="radio" className="w-4 h-4 text-blue-600" />
                        <span>Choice 2</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="radio" className="w-4 h-4 text-blue-600" disabled />
                        <span className="text-gray-400">Choice 3 (disabled)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-xl font-semibold mb-4">Range & File Input</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Range Slider</label>
                    <input type="range" min="0" max="100" defaultValue="50" className="w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">File Upload</label>
                    <input type="file" className="w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Color Picker</label>
                    <input type="color" defaultValue="#3b82f6" className="w-20 h-10" />
                  </div>
                </div>
              </Card>
            </section>
          )}

          {/* Buttons Section */}
          {selectedTab === 'buttons' && (
            <section className="space-y-8">
              <SectionHeader title="Buttons & Actions" />
              
              <Card>
                <h3 className="text-xl font-semibold mb-4">Button Variants</h3>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">Primary Button</Button>
                  <Button variant="secondary">Secondary Button</Button>
                  <Button variant="accent">Accent Button</Button>
                  <Button variant="success">Success Button</Button>
                  <Button variant="danger">Danger Button</Button>
                  <Button variant="outline">Outline Button</Button>
                  <Button variant="ghost">Ghost Button</Button>
                </div>
              </Card>

              <Card>
                <h3 className="text-xl font-semibold mb-4">Button Sizes</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                  <Button size="xl">Extra Large</Button>
                </div>
              </Card>

              <Card>
                <h3 className="text-xl font-semibold mb-4">Button States</h3>
                <div className="flex flex-wrap gap-3">
                  <Button>Normal</Button>
                  <Button disabled>Disabled</Button>
                  <Button className="opacity-50 cursor-wait">Loading...</Button>
                </div>
              </Card>

              <Card>
                <h3 className="text-xl font-semibold mb-4">Icon Buttons</h3>
                <div className="flex flex-wrap gap-3">
                  <button className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <button className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <button className="p-2 rounded-lg bg-green-600 text-white hover:bg-green-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </div>
              </Card>
            </section>
          )}

          {/* Tables Section */}
          {selectedTab === 'tables' && (
            <section className="space-y-8">
              <SectionHeader title="Tables & Lists" />
              
              <Card>
                <h3 className="text-xl font-semibold mb-4">Data Table</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Role</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">1</td>
                        <td className="px-4 py-3 text-sm font-medium">John Doe</td>
                        <td className="px-4 py-3 text-sm">john@example.com</td>
                        <td className="px-4 py-3 text-sm">Admin</td>
                        <td className="px-4 py-3"><Badge variant="success">Active</Badge></td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">2</td>
                        <td className="px-4 py-3 text-sm font-medium">Jane Smith</td>
                        <td className="px-4 py-3 text-sm">jane@example.com</td>
                        <td className="px-4 py-3 text-sm">Editor</td>
                        <td className="px-4 py-3"><Badge variant="success">Active</Badge></td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">3</td>
                        <td className="px-4 py-3 text-sm font-medium">Bob Johnson</td>
                        <td className="px-4 py-3 text-sm">bob@example.com</td>
                        <td className="px-4 py-3 text-sm">User</td>
                        <td className="px-4 py-3"><Badge variant="gray">Inactive</Badge></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card>
                <h3 className="text-xl font-semibold mb-4">Lists</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="font-medium mb-2">Unordered List:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>First item</li>
                      <li>Second item</li>
                      <li>Third item
                        <ul className="list-circle list-inside ml-6 mt-1">
                          <li>Nested item 1</li>
                          <li>Nested item 2</li>
                        </ul>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-2">Ordered List:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>First step</li>
                      <li>Second step</li>
                      <li>Third step
                        <ol className="list-decimal list-inside ml-6 mt-1">
                          <li>Sub-step A</li>
                          <li>Sub-step B</li>
                        </ol>
                      </li>
                    </ol>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-xl font-semibold mb-4">Description List</h3>
                <dl className="space-y-2">
                  <div className="flex gap-4">
                    <dt className="font-semibold w-32">Term 1:</dt>
                    <dd className="text-gray-700">Description for the first term</dd>
                  </div>
                  <div className="flex gap-4">
                    <dt className="font-semibold w-32">Term 2:</dt>
                    <dd className="text-gray-700">Description for the second term</dd>
                  </div>
                  <div className="flex gap-4">
                    <dt className="font-semibold w-32">Term 3:</dt>
                    <dd className="text-gray-700">Description for the third term</dd>
                  </div>
                </dl>
              </Card>
            </section>
          )}

          {/* Media Section */}
          {selectedTab === 'media' && (
            <section className="space-y-8">
              <SectionHeader title="Media Elements" />
              
              <Card>
                <h3 className="text-xl font-semibold mb-4">Images</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <img 
                      src="https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400&h=300&fit=crop" 
                      alt="Workspace" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <p className="text-sm text-gray-600 mt-2">Regular image</p>
                  </div>
                  <div>
                    <img 
                      src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop" 
                      alt="Abstract" 
                      className="w-full h-48 object-cover rounded-lg shadow-lg"
                    />
                    <p className="text-sm text-gray-600 mt-2">With shadow</p>
                  </div>
                  <div>
                    <img 
                      src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop" 
                      alt="Team" 
                      className="w-full h-48 object-cover rounded-full"
                    />
                    <p className="text-sm text-gray-600 mt-2">Rounded full</p>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-xl font-semibold mb-4">Figure & Figcaption</h3>
                <figure className="max-w-md">
                  <img 
                    src="https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=600&h=400&fit=crop" 
                    alt="Modern workspace" 
                    className="w-full rounded-lg"
                  />
                  <figcaption className="text-sm text-gray-600 mt-2 italic">
                    Figure 1: A modern workspace setup with laptop and accessories
                  </figcaption>
                </figure>
              </Card>

              <Card>
                <h3 className="text-xl font-semibold mb-4">SVG Icons</h3>
                <div className="flex flex-wrap gap-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </Card>

              <Card>
                <h3 className="text-xl font-semibold mb-4">Progress & Meter</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Progress Bar (60%)</label>
                    <progress value="60" max="100" className="w-full h-4" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Meter (75%)</label>
                    <meter value="0.75" className="w-full h-4" />
                  </div>
                </div>
              </Card>
            </section>
          )}

          {/* Semantic HTML Section */}
          {selectedTab === 'semantic' && (
            <section className="space-y-8">
              <SectionHeader title="Semantic HTML5 Elements" />
              
              <Card>
                <h3 className="text-xl font-semibold mb-4">Article & Section</h3>
                <article className="border-l-4 border-blue-500 pl-4">
                  <header className="mb-2">
                    <h4 className="text-lg font-semibold">Article Title</h4>
                    <p className="text-sm text-gray-600">Published on October 28, 2025</p>
                  </header>
                  <section className="mb-3">
                    <p>This is the first section of the article content...</p>
                  </section>
                  <section>
                    <p>This is the second section of the article content...</p>
                  </section>
                  <footer className="mt-2 text-sm text-gray-600">
                    Author: John Doe
                  </footer>
                </article>
              </Card>

              <Card>
                <h3 className="text-xl font-semibold mb-4">Navigation</h3>
                <nav className="flex gap-4">
                  <a href="#" className="text-blue-600 hover:underline">Home</a>
                  <a href="#" className="text-blue-600 hover:underline">About</a>
                  <a href="#" className="text-blue-600 hover:underline">Services</a>
                  <a href="#" className="text-blue-600 hover:underline">Contact</a>
                </nav>
              </Card>

              <Card>
                <h3 className="text-xl font-semibold mb-4">Details & Summary</h3>
                <details className="border border-gray-300 rounded-lg p-4">
                  <summary className="cursor-pointer font-medium">Click to expand</summary>
                  <p className="mt-3 text-gray-700">
                    This is the hidden content that appears when you click the summary.
                    Details and summary elements are great for FAQs and collapsible sections.
                  </p>
                </details>
              </Card>

              <Card>
                <h3 className="text-xl font-semibold mb-4">Aside & Main</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <main className="md:col-span-3 bg-gray-50 p-4 rounded-lg">
                    <p><strong>Main Content:</strong> This is the primary content area using the &lt;main&gt; element.</p>
                  </main>
                  <aside className="bg-blue-50 p-4 rounded-lg">
                    <p className="font-medium mb-2">Sidebar</p>
                    <p className="text-sm">Related links and additional information</p>
                  </aside>
                </div>
              </Card>

              <Card>
                <h3 className="text-xl font-semibold mb-4">Time & Address</h3>
                <div className="space-y-3">
                  <p>
                    <strong>Time element:</strong>{' '}
                    <time dateTime="2025-10-28">October 28, 2025</time>
                  </p>
                  <address className="not-italic text-gray-700">
                    <strong>Contact Information:</strong><br />
                    1234 Main Street<br />
                    City, State 12345<br />
                    Email: <a href="mailto:info@example.com" className="text-blue-600">info@example.com</a>
                  </address>
                </div>
              </Card>
            </section>
          )}

          {/* Interactive Section */}
          {selectedTab === 'interactive' && (
            <section className="space-y-8">
              <SectionHeader title="Interactive Elements" />
              
              <Card>
                <h3 className="text-xl font-semibold mb-4">Alerts & Notifications</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-medium text-blue-900">Information</p>
                      <p className="text-sm text-blue-700">This is an informational message</p>
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <p className="font-medium text-green-900">Success</p>
                      <p className="text-sm text-green-700">Operation completed successfully</p>
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="font-medium text-yellow-900">Warning</p>
                      <p className="text-sm text-yellow-700">Please review before proceeding</p>
                    </div>
                  </div>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <div>
                      <p className="font-medium text-red-900">Error</p>
                      <p className="text-sm text-red-700">An error occurred during processing</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-xl font-semibold mb-4">Badges & Tags</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="primary">Primary</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="danger">Danger</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="info">Info</Badge>
                  <Badge variant="gray">Gray</Badge>
                </div>
              </Card>

              <Card>
                <h3 className="text-xl font-semibold mb-4">Tooltips (Title Attribute)</h3>
                <div className="space-x-4">
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    title="This is a tooltip message"
                  >
                    Hover over me
                  </button>
                  <span 
                    className="text-blue-600 underline cursor-help"
                    title="Additional information appears here"
                  >
                    Hover for info
                  </span>
                </div>
              </Card>

              <Card>
                <h3 className="text-xl font-semibold mb-4">Loading States</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <LoadingSpinner size="md" />
                    <span>Spinner</span>
                  </div>
                  <div className="space-y-2">
                    <SkeletonText lines={3} />
                  </div>
                </div>
              </Card>
            </section>
          )}

          {/* Layouts Section */}
          {selectedTab === 'layouts' && (
            <section className="space-y-8">
              <SectionHeader title="Layout Patterns" />
              
              <Card>
                <h3 className="text-xl font-semibold mb-4">Grid Layout</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-blue-100 p-6 rounded-lg text-center">
                      Grid Item {i}
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h3 className="text-xl font-semibold mb-4">Flexbox Layout</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px] bg-green-100 p-6 rounded-lg text-center">Flex Item 1</div>
                  <div className="flex-1 min-w-[200px] bg-green-100 p-6 rounded-lg text-center">Flex Item 2</div>
                  <div className="flex-1 min-w-[200px] bg-green-100 p-6 rounded-lg text-center">Flex Item 3</div>
                </div>
              </Card>

              <Card>
                <h3 className="text-xl font-semibold mb-4">Card Layout</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold mb-2">Card Title</h4>
                    <p className="text-gray-600 mb-4">Card description goes here with some details about the content.</p>
                    <Button size="sm">Action</Button>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold mb-2">Another Card</h4>
                    <p className="text-gray-600 mb-4">More card content with additional information and details.</p>
                    <Button size="sm" variant="secondary">Learn More</Button>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-xl font-semibold mb-4">Hero Section</h3>
                <div className="bg-linear-to-br from-blue-600 to-purple-600 text-white rounded-lg p-12 text-center">
                  <h2 className="text-4xl font-bold mb-4">Hero Headline</h2>
                  <p className="text-xl mb-6 opacity-90">Compelling subtitle or description text</p>
                  <div className="flex gap-4 justify-center">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                      Primary CTA
                    </Button>
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                      Secondary CTA
                    </Button>
                  </div>
                </div>
              </Card>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="border-b border-gray-300 pb-2 mb-6">
      <h2 className="text-2xl font-bold">{title}</h2>
    </div>
  );
}
