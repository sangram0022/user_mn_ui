import { Button, Input, Badge, Card } from '../components';
import { typographyVariants } from '../design-system';

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

/**
 * REFERENCE PAGE - For UI Style Comparison
 * This is a copy from the backup non-react project for visual reference.
 * Keep this file during development for styling consistency checks.
 */
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
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          <div className="space-y-3">
            <fieldset>
              <legend className="text-sm font-medium text-gray-700 mb-3">Preferences</legend>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-2 focus:ring-blue-500 transition-colors" 
                  />
                  <span className="group-hover:text-brand-primary transition-colors">Email notifications</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-2 focus:ring-blue-500 transition-colors" 
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
                    className="w-4 h-4 text-brand-primary border-gray-300 focus:ring-2 focus:ring-blue-500 transition-colors" 
                  />
                  <span className="group-hover:text-brand-primary transition-colors">Personal</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="account" 
                    className="w-4 h-4 text-brand-primary border-gray-300 focus:ring-2 focus:ring-blue-500 transition-colors" 
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

      {/* Rest of the showcase - truncated for brevity - includes tables, media, notifications, etc. */}
      <Card>
        <p className="text-center text-gray-600">
          <strong>NOTE:</strong> This is a reference page from the backup project. 
          Use it for visual comparison during development.
        </p>
      </Card>
    </div>
  );
}
