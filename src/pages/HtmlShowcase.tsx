import { Button } from '../components';
import Input from '../components/Input';
import Badge from '../components/Badge';
import Card from '../components/Card';
import { typographyVariants, animationUtils } from '../design-system/variants';

// Sample data - Single source of truth
const sampleData = {
  buttons: [
    { variant: 'primary' as const, label: 'Primary' },
    { variant: 'secondary' as const, label: 'Secondary' },
    { variant: 'accent' as const, label: 'Accent' },
    { variant: 'success' as const, label: 'Success' },
    { variant: 'danger' as const, label: 'Danger' },
    { variant: 'outline' as const, label: 'Outline' },
    { variant: 'ghost' as const, label: 'Ghost' },
  ],

  badges: [
    { variant: 'primary' as const, label: 'Primary' },
    { variant: 'secondary' as const, label: 'Secondary' },
    { variant: 'success' as const, label: 'Success' },
    { variant: 'danger' as const, label: 'Danger' },
    { variant: 'warning' as const, label: 'Warning' },
    { variant: 'info' as const, label: 'Info' },
    { variant: 'gray' as const, label: 'Gray' },
  ],

  tableData: [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', avatar: '👨‍💼' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', status: 'Active', avatar: '👩‍💻' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive', avatar: '👨‍🎨' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Manager', status: 'Active', avatar: '👩‍🚀' },
  ],

  mediaItems: [
    {
      type: 'image',
      src: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400&h=300&fit=crop',
      alt: 'Modern workspace with laptop and coffee',
      caption: 'Modern workspace design'
    },
    {
      type: 'image', 
      src: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
      alt: 'Abstract geometric pattern',
      caption: 'Creative geometric design'
    },
    {
      type: 'image',
      src: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop',
      alt: 'Team collaboration workspace',
      caption: 'Team collaboration space'
    },
  ],

  notifications: [
    { type: 'info', title: 'Information', message: 'This is an informational message for your reference.' },
    { type: 'success', title: 'Success', message: 'Your action was completed successfully! Well done.' },
    { type: 'warning', title: 'Warning', message: 'Please review this important information before proceeding.' },
    { type: 'error', title: 'Error', message: 'Something went wrong. Please check your input and try again.' },
  ],

  progressItems: [
    { label: 'Project Alpha', value: 85, color: 'bg-blue-500' },
    { label: 'Design System', value: 92, color: 'bg-green-500' },
    { label: 'Testing Phase', value: 67, color: 'bg-yellow-500' },
    { label: 'Documentation', value: 34, color: 'bg-purple-500' },
  ],

  featuresGrid: [
    { icon: '🚀', title: 'Performance', description: 'Lightning-fast loading times' },
    { icon: '🔒', title: 'Security', description: 'Enterprise-grade protection' },
    { icon: '📱', title: 'Responsive', description: 'Perfect on all devices' },
    { icon: '🎨', title: 'Design', description: 'Beautiful modern interface' },
    { icon: '⚡', title: 'Speed', description: 'Optimized for performance' },
    { icon: '🔧', title: 'Flexible', description: 'Highly customizable' },
  ],
};

export default function HtmlShowcase() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16 animate-fade-in">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <h1 className={`${typographyVariants.headings.h1} text-gradient`}>
          HTML Elements Showcase
        </h1>
        <p className={`${typographyVariants.body.xl} text-gray-600 max-w-3xl mx-auto`}>
          Comprehensive showcase of all HTML elements styled with Tailwind CSS v4.1.16 
          using our modern design system approach
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Badge variant="info">Tailwind v4.1.16</Badge>
          <Badge variant="success">React 19</Badge>
          <Badge variant="secondary">Vite 6</Badge>
          <Badge variant="primary">TypeScript</Badge>
        </div>
      </section>

      {/* Typography Showcase */}
      <Card className="space-y-8">
        <h2 className={`${typographyVariants.headings.h2} border-b-2 border-blue-500 pb-4`}>
          Typography System
        </h2>
        
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Headings</h3>
            <h1 className={typographyVariants.headings.h1}>Heading 1</h1>
            <h2 className={typographyVariants.headings.h2}>Heading 2</h2>
            <h3 className={typographyVariants.headings.h3}>Heading 3</h3>
            <h4 className={typographyVariants.headings.h4}>Heading 4</h4>
            <h5 className={typographyVariants.headings.h5}>Heading 5</h5>
            <h6 className={typographyVariants.headings.h6}>Heading 6</h6>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Text Elements</h3>
            <p className={typographyVariants.body.base}>
              This is a <strong>paragraph</strong> with <em>emphasized text</em> and{' '}
              <mark className="bg-yellow-200 px-1 rounded">highlighted content</mark>.
            </p>
            <p className={typographyVariants.body.sm}>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                Inline code example
              </code>
            </p>
            <blockquote className="border-l-4 border-blue-500 pl-6 italic text-gray-700 bg-blue-50 p-4 rounded-r-lg">
              "Design is not just what it looks like and feels like. Design is how it works."
              <cite className="block text-sm text-gray-500 mt-2">— Steve Jobs</cite>
            </blockquote>
          </div>
        </div>
      </Card>

      {/* Interactive Elements - Buttons */}
      <Card className="space-y-6">
        <h2 className={`${typographyVariants.headings.h2} border-b-2 border-purple-500 pb-4`}>
          Interactive Elements
        </h2>
        
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Button Variants</h3>
            <div className="flex flex-wrap gap-3 mb-6">
              {sampleData.buttons.map(({variant, label}) => (
                <Button key={variant} variant={variant} size="md">
                  {label}
                </Button>
              ))}
            </div>
            
            <h4 className="text-lg font-semibold mb-3">Button Sizes</h4>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" size="sm">Small</Button>
              <Button variant="primary" size="md">Medium</Button>
              <Button variant="primary" size="lg">Large</Button>
              <Button variant="primary" size="xl">Extra Large</Button>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Badge Collection</h3>
            <div className="flex flex-wrap gap-3">
              {sampleData.badges.map(({variant, label}) => (
                <Badge key={variant} variant={variant}>
                  {label}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Form Elements */}
      <Card className="space-y-6">
        <h2 className={`${typographyVariants.headings.h2} border-b-2 border-green-500 pb-4`}>
          Form Elements
        </h2>
        
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid md:grid-cols-2 gap-6">
            <Input 
              type="text" 
              label="Full Name" 
              placeholder="Enter your full name"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />
            <Input 
              type="email" 
              label="Email Address" 
              placeholder="your@email.com"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Option</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all">
                <option>Choose an option</option>
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>
            <Input 
              type="number" 
              label="Quantity" 
              placeholder="1"
              min="1"
              max="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              rows={4}
              placeholder="Enter your message here..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all resize-none"
            />
          </div>

          <div className="space-y-3">
            <fieldset>
              <legend className="text-sm font-medium text-gray-700 mb-3">Preferences</legend>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-2 focus:ring-brand-primary transition-colors" 
                  />
                  <span className="group-hover:text-brand-primary transition-colors">Email notifications</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-2 focus:ring-brand-primary transition-colors" 
                  />
                  <span className="group-hover:text-brand-primary transition-colors">SMS updates</span>
                </label>
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-medium text-gray-700 mb-3">Account Type</legend>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="account" 
                    className="w-4 h-4 text-brand-primary border-gray-300 focus:ring-2 focus:ring-brand-primary transition-colors" 
                  />
                  <span className="group-hover:text-brand-primary transition-colors">Personal</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="account" 
                    className="w-4 h-4 text-brand-primary border-gray-300 focus:ring-2 focus:ring-brand-primary transition-colors" 
                  />
                  <span className="group-hover:text-brand-primary transition-colors">Business</span>
                </label>
              </div>
            </fieldset>
          </div>

          <div className="flex gap-4">
            <Button type="submit" variant="primary" size="md">Submit Form</Button>
            <Button type="reset" variant="outline" size="md">Reset</Button>
            <Button type="button" variant="ghost" size="md" disabled>Disabled</Button>
          </div>
        </form>
      </Card>

      {/* Data Display - Tables */}
      <Card className="space-y-6">
        <h2 className={`${typographyVariants.headings.h2} border-b-2 border-indigo-500 pb-4`}>
          Data Tables
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-linear-to-r from-blue-50 to-purple-50 border-b-2 border-blue-100">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sampleData.tableData.map((user) => (
                <tr key={user.id} className="hover:bg-blue-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-lg">
                        {user.avatar}
                      </div>
                      <span className="font-medium text-gray-900 group-hover:text-brand-primary transition-colors">
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <Badge variant={
                      user.role === 'Admin' ? 'primary' : 
                      user.role === 'Manager' ? 'secondary' :
                      user.role === 'Editor' ? 'info' : 'gray'
                    }>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={user.status === 'Active' ? 'success' : 'gray'}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-2 text-brand-primary hover-bg-brand-light rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button className="p-2 text-semantic-error hover:bg-red-100 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Media Elements */}
      <Card className="space-y-6">
        <h2 className={`${typographyVariants.headings.h2} border-b-2 border-pink-500 pb-4`}>
          Media Elements
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {sampleData.mediaItems.map((item, index) => (
            <figure key={index} className="group">
              <div className="overflow-hidden rounded-xl shadow-lg">
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <figcaption className="text-sm text-gray-600 mt-3 text-center font-medium">
                {item.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </Card>

      {/* Notifications & Alerts */}
      <Card className="space-y-6">
        <h2 className={`${typographyVariants.headings.h2} border-b-2 border-yellow-500 pb-4`}>
          Notifications & Alerts
        </h2>
        
        <div className="space-y-4">
          {sampleData.notifications.map((notification, index) => {
            const colors = {
              info: 'bg-blue-50 border-blue-200 text-blue-900',
              success: 'bg-green-50 border-green-200 text-green-900',
              warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
              error: 'bg-red-50 border-red-200 text-red-900',
            };
            
            return (
              <div
                key={index}
                className={`p-4 border-l-4 rounded-r-lg ${colors[notification.type as keyof typeof colors]} ${animationUtils.withStagger('animate-slide-left', index)}`}
              >
                <div className="flex items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{notification.title}</h4>
                    <p className="text-sm opacity-90">{notification.message}</p>
                  </div>
                  <button className="ml-4 opacity-70 hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Progress & Metrics */}
      <Card className="space-y-6">
        <h2 className={`${typographyVariants.headings.h2} border-b-2 border-teal-500 pb-4`}>
          Progress & Metrics
        </h2>
        
        <div className="space-y-6">
          {sampleData.progressItems.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                <span className="text-sm text-gray-500">{item.value}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out ${animationUtils.withStagger('animate-scale-in', index * 2)}`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Interactive Features Grid */}
      <Card className="space-y-6">
        <h2 className={`${typographyVariants.headings.h2} border-b-2 border-purple-500 pb-4`}>
          Interactive Grid
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleData.featuresGrid.map((feature, index) => (
            <div
              key={index}
              className={`group p-6 bg-linear-to-br from-white to-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer ${animationUtils.withStagger('animate-scale-in', index)}`}
            >
              <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-brand-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Advanced Elements */}
      <Card className="space-y-6">
        <h2 className={`${typographyVariants.headings.h2} border-b-2 border-red-500 pb-4`}>
          Advanced Elements
        </h2>
        
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Accordion/Details</h3>
            <div className="space-y-3">
              {[
                { title: 'What is React 19?', content: 'React 19 introduces new features like the React Compiler, improved Server Components, and enhanced performance optimizations.' },
                { title: 'Tailwind CSS v4 Benefits', content: 'Version 4 brings CSS-first configuration, improved performance, and better developer experience with enhanced IntelliSense.' },
                { title: 'Vite 6 Features', content: 'Vite 6 offers faster cold starts, improved HMR, and better support for modern JavaScript features.' },
              ].map((item, index) => (
                <details key={index} className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 group">
                  <summary className="px-4 py-3 cursor-pointer font-medium hover:bg-gray-100 transition-colors flex items-center justify-between">
                    <span>{item.title}</span>
                    <svg className="w-5 h-5 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-4 py-3 text-gray-700 border-t border-gray-200 bg-white">
                    {item.content}
                  </div>
                </details>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Interactive Elements</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Range Slider</label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  defaultValue="50"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color Picker</label>
                <input 
                  type="color" 
                  defaultValue="#3b82f6"
                  className="w-16 h-10 border-2 border-gray-300 rounded-lg cursor-pointer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Input</label>
                <input 
                  type="date"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">File Upload</label>
                <input 
                  type="file"
                  multiple
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Call to Action */}
      <Card className="text-center bg-linear-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="space-y-6">
          <h2 className="text-4xl font-bold">Ready to Build Amazing UIs?</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Use this showcase as reference for your next project. All components follow clean code principles 
            and modern best practices.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="secondary" size="lg" className="bg-white text-brand-primary hover:bg-gray-100">
              View Source Code
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              Documentation
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
