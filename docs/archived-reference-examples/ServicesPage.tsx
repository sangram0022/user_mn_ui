import { Button, Badge, Card } from '../components';
import { typographyVariants, animationUtils } from '../design-system';
import type { BadgeVariant } from '../design-system';

// Services data - Single source of truth
const servicesData = {
  heroServices: [
    {
      id: 1,
      name: 'Web Development',
      description: 'Modern, responsive websites built with latest technologies',
      icon: '💻',
      price: 'From $2,999',
      duration: '2-4 weeks',
      popular: true,
    },
    {
      id: 2,
      name: 'Mobile App Development',
      description: 'Native and cross-platform mobile applications',
      icon: '📱',
      price: 'From $4,999',
      duration: '6-12 weeks',
      popular: false,
    },
    {
      id: 3,
      name: 'UI/UX Design',
      description: 'User-centered design that converts and delights',
      icon: '🎨',
      price: 'From $1,999',
      duration: '1-3 weeks',
      popular: false,
    },
  ],

  detailedServices: [
    {
      id: 1,
      name: 'Enterprise Solutions',
      category: 'Development',
      description: 'Scalable enterprise applications with advanced security and performance',
      features: [
        'Custom Architecture Design',
        'Advanced Security Implementation',
        'Performance Optimization',
        'Third-party Integrations',
        'Cloud Deployment',
        '24/7 Support & Maintenance',
      ],
      technologies: ['React', 'Node.js', 'AWS', 'Docker', 'TypeScript'],
      startingPrice: 15000,
      timeline: '12-24 weeks',
      complexity: 'Advanced',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
    },
    {
      id: 2,
      name: 'E-commerce Development',
      category: 'Development',
      description: 'Complete e-commerce solutions with payment processing and inventory management',
      features: [
        'Custom Shopping Cart',
        'Payment Gateway Integration',
        'Inventory Management',
        'Order Processing System',
        'Customer Analytics',
        'SEO Optimization',
      ],
      technologies: ['Next.js', 'Stripe', 'PostgreSQL', 'Redis', 'Tailwind'],
      startingPrice: 8000,
      timeline: '8-16 weeks',
      complexity: 'Intermediate',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
    },
    {
      id: 3,
      name: 'Brand Identity Design',
      category: 'Design',
      description: 'Complete brand identity including logo, guidelines, and marketing materials',
      features: [
        'Logo Design & Variations',
        'Brand Guidelines',
        'Color Palette & Typography',
        'Business Card Design',
        'Letterhead & Stationery',
        'Social Media Templates',
      ],
      technologies: ['Figma', 'Adobe Creative Suite', 'Sketch', 'Principle'],
      startingPrice: 3000,
      timeline: '3-6 weeks',
      complexity: 'Beginner',
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop',
    },
    {
      id: 4,
      name: 'Digital Marketing',
      category: 'Marketing',
      description: 'Comprehensive digital marketing strategy to grow your online presence',
      features: [
        'SEO Strategy & Implementation',
        'Social Media Management',
        'Content Marketing',
        'PPC Campaign Management',
        'Email Marketing Automation',
        'Analytics & Reporting',
      ],
      technologies: ['Google Analytics', 'SEMrush', 'Mailchimp', 'Hootsuite'],
      startingPrice: 2500,
      timeline: '4-8 weeks',
      complexity: 'Intermediate',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
    },
  ],

  process: [
    {
      step: 1,
      title: 'Discovery & Planning',
      description: 'We understand your needs and create a detailed project roadmap',
      icon: '🔍',
      duration: '1-2 weeks',
    },
    {
      step: 2,
      title: 'Design & Prototyping',
      description: 'Create wireframes, mockups, and interactive prototypes',
      icon: '✏️',
      duration: '2-3 weeks',
    },
    {
      step: 3,
      title: 'Development & Testing',
      description: 'Build your solution with rigorous testing and quality assurance',
      icon: '⚡',
      duration: '4-12 weeks',
    },
    {
      step: 4,
      title: 'Launch & Support',
      description: 'Deploy your project and provide ongoing maintenance',
      icon: '🚀',
      duration: 'Ongoing',
    },
  ],

  testimonials: [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'CEO, TechStart Inc.',
      content: 'Exceptional service and outstanding results. Our new website increased conversions by 150%.',
      avatar: '👩‍💼',
      rating: 5,
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Product Manager, InnovaCorp',
      content: 'Professional team that delivered exactly what we needed, on time and within budget.',
      avatar: '👨‍💻',
      rating: 5,
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      role: 'Marketing Director, GrowthCo',
      content: 'Their digital marketing strategy helped us reach new markets and double our online presence.',
      avatar: '👩‍🚀',
      rating: 5,
    },
  ],
};

const getComplexityColor = (complexity: string): BadgeVariant => {
  switch (complexity) {
    case 'Beginner': return 'success';
    case 'Intermediate': return 'warning';
    case 'Advanced': return 'danger';
    default: return 'gray';
  }
};

const getCategoryColor = (category: string): BadgeVariant => {
  switch (category) {
    case 'Development': return 'primary';
    case 'Design': return 'secondary';
    case 'Marketing': return 'info';
    case 'Consulting': return 'warning';
    default: return 'gray';
  }
};

/**
 * REFERENCE PAGE - Services Page from Backup Project
 * For visual comparison and styling reference only
 */
export default function ServicesPage() {
  return (
    <main className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16 animate-fade-in">
      {/* Hero Section */}
      <header className="text-center space-y-8">
        <h1 className={`${typographyVariants.headings.h1} text-gradient`}>
          Our Services
        </h1>
        <p className={`${typographyVariants.body.xl} text-gray-600 max-w-3xl mx-auto`}>
          We provide comprehensive digital solutions to help your business grow and succeed in the modern world
        </p>
        
        {/* Quick Service Cards */}
        <section className="grid md:grid-cols-3 gap-8 mt-12">
          {servicesData.heroServices.map((service, index) => (
            <article 
              key={service.id} 
              className={`relative ${animationUtils.withStagger('animate-scale-in', index)}`}
            >
              <Card 
                hover 
                className={`text-center h-full ${service.popular ? 'ring-2 ring-blue-500' : ''}`}
              >
                {service.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge variant="primary">Most Popular</Badge>
                  </div>
                )}
                <div className="text-6xl mb-4">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  {service.name}
                </h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <div className="space-y-2 mb-6">
                  <div className="text-2xl font-bold text-brand-primary">
                    {service.price}
                  </div>
                  <div className="text-sm text-gray-500">
                    {service.duration}
                  </div>
                </div>
                <Button variant="primary" size="md" fullWidth>
                  Get Started
                </Button>
              </Card>
            </article>
          ))}
        </section>
      </header>

      {/* Detailed Services */}
      <section className="space-y-8">
        <header className="text-center">
          <h2 className={`${typographyVariants.headings.h2}`}>
            Complete Service Portfolio
          </h2>
          <p className={`${typographyVariants.body.lg} text-gray-600 mt-4`}>
            Explore our full range of professional services
          </p>
        </header>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {servicesData.detailedServices.map((service, index) => (
            <article 
              key={service.id} 
              className={`group ${animationUtils.withStagger('animate-slide-up', index)}`}
            >
              <Card hover className="h-full">
                {/* Service Image */}
                <div className="relative rounded-xl mb-6 h-48 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant={getCategoryColor(service.category)}>
                      {service.category}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge variant={getComplexityColor(service.complexity)}>
                      {service.complexity}
                    </Badge>
                  </div>
                </div>

                {/* Service Content */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold group-hover:text-brand-primary transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-gray-600">{service.description}</p>

                  {/* Features */}
                  <details className="group/features">
                    <summary className="font-medium mb-2 cursor-pointer list-none">
                      <span className="flex items-center gap-2">
                        What's Included:
                        <svg 
                          className="w-4 h-4 transition-transform group-open/features:rotate-180" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </summary>
                    <ul className="grid grid-cols-1 gap-1">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <svg 
                            className="w-4 h-4 text-green-500 shrink-0" 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </details>

                  {/* Technologies */}
                  <div>
                    <h4 className="font-medium mb-2">Technologies:</h4>
                    <div className="flex flex-wrap gap-2">
                      {service.technologies.map((tech, i) => (
                        <Badge key={i} variant="gray" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Service Details */}
                  <dl className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <dt className="text-sm text-gray-500">Starting at</dt>
                      <dd className="text-lg font-semibold text-brand-primary">
                        ${service.startingPrice.toLocaleString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Timeline</dt>
                      <dd className="text-lg font-semibold">{service.timeline}</dd>
                    </div>
                  </dl>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <Button variant="primary" size="sm" className="flex-1">
                      Get Quote
                    </Button>
                    <Button variant="outline" size="sm">
                      Learn More
                    </Button>
                  </div>
                </div>
              </Card>
            </article>
          ))}
        </div>
      </section>

      {/* Process Section */}
      <section className="space-y-8">
        <header className="text-center">
          <h2 className={`${typographyVariants.headings.h2}`}>
            Our Process
          </h2>
          <p className={`${typographyVariants.body.lg} text-gray-600 mt-4`}>
            How we deliver exceptional results for your project
          </p>
        </header>
        
        <ol className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {servicesData.process.map((step, index) => (
            <li 
              key={step.step} 
              className={animationUtils.withStagger('animate-scale-in', index)}
            >
              <Card className="text-center relative h-full">
                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {step.step}
                  </div>
                </div>
                
                <div className="pt-4">
                  <div className="text-4xl mb-4">{step.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{step.description}</p>
                  <Badge variant="info" className="text-xs">
                    {step.duration}
                  </Badge>
                </div>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      {/* Testimonials */}
      <section className="space-y-8">
        <header className="text-center">
          <h2 className={`${typographyVariants.headings.h2}`}>
            What Our Clients Say
          </h2>
          <p className={`${typographyVariants.body.lg} text-gray-600 mt-4`}>
            Don't just take our word for it - hear from satisfied customers
          </p>
        </header>
        
        <div className="grid md:grid-cols-3 gap-8">
          {servicesData.testimonials.map((testimonial, index) => (
            <article 
              key={testimonial.id} 
              className={animationUtils.withStagger('animate-slide-up', index)}
            >
              <Card hover className="text-center h-full">
                <div className="text-4xl mb-4">{testimonial.avatar}</div>
                
                {/* Rating */}
                <div className="flex justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                
                <blockquote className="text-gray-600 italic mb-4">
                  "{testimonial.content}"
                </blockquote>
                
                <footer>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </footer>
              </Card>
            </article>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <aside>
        <Card className="bg-linear-to-br from-blue-600 via-purple-600 to-pink-600 text-white text-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold">
              Ready to Start Your Project?
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Let's discuss your requirements and create something amazing together
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg" className="bg-white text-brand-primary hover:bg-gray-100">
                Get Free Consultation
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                View Portfolio
              </Button>
            </div>
          </div>
        </Card>
      </aside>
    </main>
  );
}
