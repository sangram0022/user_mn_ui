import { Link } from 'react-router-dom';
import { Button, Card } from '../components';
import { animationUtils } from '../design-system';

const features = [
  { icon: '🚀', title: 'Lightning Fast', description: 'Optimized performance with React 19 and Vite' },
  { icon: '🔒', title: 'Secure by Default', description: 'Enterprise-grade security built-in' },
  { icon: '📱', title: 'Fully Responsive', description: 'Perfect on all devices and screen sizes' },
  { icon: '🎨', title: 'Modern Design', description: 'Beautiful UI with Tailwind CSS v4.1.16' },
  { icon: '⚡', title: 'Real-time Updates', description: 'Live data synchronization' },
  { icon: '🔧', title: 'Easy to Customize', description: 'Flexible and extensible architecture' },
];

const stats = [
  { value: '50K+', label: 'Active Users' },
  { value: '99.9%', label: 'Uptime' },
  { value: '24/7', label: 'Support' },
  { value: '150+', label: 'Countries' },
];

export default function ModernHtmlPage() {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium animate-pulse-slow">
              <span className="inline-block w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></span>
              New: AI-Powered User Insights Available!
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-center mb-6 animate-slide-up">
            Manage Users with
            <br />
            <span className="text-yellow-300">Confidence & Style</span>
          </h1>

          <p className="text-xl md:text-2xl text-center text-white/90 mb-8 max-w-3xl mx-auto animate-slide-up animate-stagger-1">
            The modern solution for user management. Built with React 19, Vite, and Tailwind CSS v4.1.16
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up animate-stagger-2">
            <Link to="/register">
              <Button variant="secondary" size="lg" className="bg-white text-purple-600 hover:bg-gray-100 shadow-2xl">
                Start Free Trial →
              </Button>
            </Link>
            <Link to="/reference/html-showcase">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                View Demo
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-scale-in animate-stagger-3">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-white/80 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything You Need</h2>
            <p className="text-xl text-gray-600">Powerful features to manage your users effectively</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} hover className={`group ${animationUtils.withStagger('animate-slide-up', index)}`}>
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of teams already using UserMN to manage their users
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="xl" className="bg-white text-purple-600 hover:bg-gray-100">
                Create Free Account
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="xl" className="border-white text-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
