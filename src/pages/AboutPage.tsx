// ========================================
// Modern About Page - Company Information
// ========================================
// Comprehensive about page with:
// - Company mission and values
// - Team information
// - Technology stack showcase
// - Performance metrics
// - Accessibility features
// ========================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLiveRegion } from '../shared/components/accessibility/AccessibilityEnhancements';

interface TeamMember {
  id: string;
  name: string;
  position: string;
  bio: string;
  avatar: string;
  social: {
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
}

interface Technology {
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'tools';
  icon: string;
  description: string;
}

export default function AboutPage() {
  const [activeSection, setActiveSection] = useState('company');
  const { announce, LiveRegion } = useLiveRegion();

  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      position: 'CEO & Co-Founder',
      bio: 'Visionary leader with 15+ years in tech startups. Passionate about building products that make a difference.',
      avatar: '/avatars/sarah.jpg',
      social: {
        linkedin: 'https://linkedin.com/in/sarah-johnson',
        twitter: 'https://twitter.com/sarahj'
      }
    },
    {
      id: '2', 
      name: 'Michael Chen',
      position: 'CTO & Co-Founder',
      bio: 'Full-stack architect and React enthusiast. Loves building scalable systems and mentoring developers.',
      avatar: '/avatars/michael.jpg',
      social: {
        github: 'https://github.com/mchen',
        linkedin: 'https://linkedin.com/in/michael-chen'
      }
    },
    {
      id: '3',
      name: 'Emily Rodriguez', 
      position: 'Lead Designer',
      bio: 'UX/UI designer focused on accessibility and user-centered design. Advocate for inclusive technology.',
      avatar: '/avatars/emily.jpg',
      social: {
        linkedin: 'https://linkedin.com/in/emily-rodriguez'
      }
    }
  ];

  const technologies: Technology[] = [
    { name: 'React 19', category: 'frontend', icon: '⚛️', description: 'Modern UI library with concurrent features' },
    { name: 'TypeScript', category: 'frontend', icon: '📘', description: 'Type-safe JavaScript for better development' },
    { name: 'Tailwind CSS', category: 'frontend', icon: '🎨', description: 'Utility-first CSS framework' },
    { name: 'Vite', category: 'tools', icon: '⚡', description: 'Lightning fast build tool' },
    { name: 'TanStack Query', category: 'frontend', icon: '🔄', description: 'Powerful data fetching library' },
    { name: 'Node.js', category: 'backend', icon: '🟢', description: 'JavaScript runtime for server-side development' },
    { name: 'PostgreSQL', category: 'database', icon: '🐘', description: 'Advanced open source database' },
    { name: 'Docker', category: 'tools', icon: '🐳', description: 'Containerization platform' },
  ];

  useEffect(() => {
    document.title = 'About Us - User Management';
  }, []);

  const sections = [
    { id: 'company', label: 'Company', icon: '🏢' },
    { id: 'team', label: 'Team', icon: '👥' },
    { id: 'technology', label: 'Technology', icon: '💻' },
    { id: 'values', label: 'Values', icon: '⭐' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <LiveRegion />

      {/* Hero Section */}
      <div className="bg-linear-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              About Our Company
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              We're building the future of user management with modern React patterns, 
              accessibility-first design, and performance optimization at the core.
            </p>
            
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold">2023</div>
                <div className="text-blue-200">Founded</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">10K+</div>
                <div className="text-blue-200">Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">99.9%</div>
                <div className="text-blue-200">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id);
                  announce(`Viewing ${section.label} section`);
                }}
                className={`
                  flex items-center space-x-2 py-4 px-2 border-b-2 text-sm font-medium whitespace-nowrap
                  ${activeSection === section.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span className="text-lg">{section.icon}</span>
                <span>{section.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Company Section */}
        {activeSection === 'company' && (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                We believe that user management should be intuitive, accessible, and performant. 
                Our platform combines cutting-edge React technologies with thoughtful design to 
                create experiences that delight both developers and end users.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">What We Do</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Modern React 19 application development
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Accessibility-first design (WCAG 2.1 AA)
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Performance optimization and monitoring
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      User experience research and design
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Our Approach</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">🎯</span>
                      User-centered design principles
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">⚡</span>
                      Performance-first development
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">♿</span>
                      Inclusive and accessible interfaces
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">🔄</span>
                      Continuous improvement and iteration
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p>
                  Founded in 2023, our company emerged from a simple observation: most user management 
                  systems were either too complex for developers or too limiting for users. We set out 
                  to bridge that gap with modern web technologies and thoughtful design.
                </p>
                <p>
                  Starting with React's latest features and building upon proven accessibility standards, 
                  we've created a platform that demonstrates how modern development practices can create 
                  better experiences for everyone.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Team Section */}
        {activeSection === 'team' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
              <p className="text-lg text-gray-600">
                Passionate professionals dedicated to building exceptional user experiences.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member) => (
                <div key={member.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/avatars/user-placeholder.jpg';
                    }}
                  />
                  <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{member.position}</p>
                  <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
                  
                  <div className="flex justify-center space-x-3">
                    {member.social.linkedin && (
                      <a
                        href={member.social.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        aria-label={`${member.name} LinkedIn profile`}
                      >
                        🔗
                      </a>
                    )}
                    {member.social.github && (
                      <a
                        href={member.social.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-800 transition-colors"
                        aria-label={`${member.name} GitHub profile`}
                      >
                        🐱
                      </a>
                    )}
                    {member.social.twitter && (
                      <a
                        href={member.social.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-600 transition-colors"
                        aria-label={`${member.name} Twitter profile`}
                      >
                        🐦
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technology Section */}
        {activeSection === 'technology' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Technology Stack</h2>
              <p className="text-lg text-gray-600">
                Modern tools and frameworks that power our platform.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {technologies.map((tech) => (
                <div key={tech.name} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
                  <div className="text-4xl mb-3">{tech.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{tech.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{tech.description}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    tech.category === 'frontend' ? 'bg-blue-100 text-blue-800' :
                    tech.category === 'backend' ? 'bg-green-100 text-green-800' :
                    tech.category === 'database' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {tech.category}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Why These Technologies?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Performance First</h4>
                  <p className="text-gray-600 text-sm">
                    We choose tools that prioritize performance, from Vite's lightning-fast builds 
                    to React 19's concurrent features.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Developer Experience</h4>
                  <p className="text-gray-600 text-sm">
                    TypeScript and modern tooling ensure our developers can build quickly 
                    and confidently with excellent IDE support.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Accessibility</h4>
                  <p className="text-gray-600 text-sm">
                    Every technology choice is evaluated for its ability to support 
                    accessible, inclusive user experiences.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Maintainability</h4>
                  <p className="text-gray-600 text-sm">
                    We prioritize tools with strong communities, documentation, 
                    and long-term support commitments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Values Section */}
        {activeSection === 'values' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Values</h2>
              <p className="text-lg text-gray-600">
                The principles that guide everything we do.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <div className="text-4xl mb-4">♿</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Accessibility First</h3>
                <p className="text-gray-600">
                  We believe technology should be usable by everyone. Every feature we build 
                  starts with accessibility considerations, not as an afterthought.
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Performance Matters</h3>
                <p className="text-gray-600">
                  Fast applications create better user experiences. We optimize for Core Web Vitals 
                  and monitor performance continuously.
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <div className="text-4xl mb-4">🔄</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Continuous Learning</h3>
                <p className="text-gray-600">
                  Technology evolves rapidly, and so do we. We embrace new patterns and 
                  practices that improve user and developer experiences.
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">User-Centered Design</h3>
                <p className="text-gray-600">
                  Every decision is made with our users in mind. We research, test, and 
                  iterate based on real user feedback and behavior.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-8 rounded-lg border border-blue-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                Ready to Experience Modern User Management?
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
                >
                  Get Started Today
                </Link>
                <Link
                  to="/dashboard"
                  className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors text-center"
                >
                  View Demo
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}