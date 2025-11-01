import Button from '../components/Button';
import Badge from '../components/Badge';
import Card from '../components/Card';
import { typographyVariants, animationUtils } from '../design-system/variants';
import type { BadgeVariant } from '../design-system/variants';
import { useEffect, useRef, useState } from 'react';

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
    {
      id: 5,
      name: 'Mobile App Strategy',
      category: 'Consulting',
      description: 'Strategic consulting for mobile app development and market positioning',
      features: [
        'Market Research & Analysis',
        'Technology Stack Recommendation',
        'User Experience Strategy',
        'Monetization Strategy',
        'Go-to-Market Planning',
        'Competitive Analysis',
      ],
      technologies: ['Research Tools', 'Analytics Platforms', 'Prototyping Tools'],
      startingPrice: 5000,
      timeline: '2-4 weeks',
      complexity: 'Advanced',
      image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop',
    },
    {
      id: 6,
      name: 'API Development',
      category: 'Development',
      description: 'Robust and scalable API development for modern applications',
      features: [
        'RESTful API Design',
        'GraphQL Implementation',
        'Authentication & Authorization',
        'Rate Limiting & Caching',
        'API Documentation',
        'Testing & Monitoring',
      ],
      technologies: ['Node.js', 'Express', 'GraphQL', 'MongoDB', 'Jest'],
      startingPrice: 4000,
      timeline: '4-8 weeks',
      complexity: 'Intermediate',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop',
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

// Modern Performance Hook - Intersection Observer for scroll animations
function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options,
    });

    const element = ref.current;
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [options]);

  return [ref, isIntersecting] as const;
}

// Modern Image Component with WebP support and lazy loading
interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

function OptimizedImage({ src, alt, className = '', width, height }: OptimizedImageProps) {
  const [imageRef, isVisible] = useIntersectionObserver();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Convert to WebP if browser supports it
  const webpSrc = src.replace(/\.(jpg|jpeg|png)(\?.*)?$/, '.webp$2');
  
  return (
    <figure ref={imageRef} className={`relative overflow-hidden ${className}`}>
      {isVisible && (
        <picture className="block w-full h-full">
          <source srcSet={webpSrc} type="image/webp" />
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            } ${imageError ? 'bg-gray-200' : ''}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        </picture>
      )}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" aria-hidden="true" />
      )}
    </figure>
  );
}

export default function ServicesPage() {
  // Skip to main content for accessibility
  const mainContentRef = useRef<HTMLElement>(null);

  return (
    <>
      {/* Skip to main content link for screen readers */}
      <a 
        href="#main-content" 
        className="sr-only-focusable fixed top-4 left-4 z-tooltip bg-brand-primary text-white px-4 py-2 rounded-md"
        onClick={(e) => {
          e.preventDefault();
          mainContentRef.current?.focus();
        }}
      >
        Skip to main content
      </a>

      <main 
        ref={mainContentRef}
        id="main-content"
        className="container-query py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16 animate-fade-in"
        tabIndex={-1}
      >
        {/* Hero Section */}
        <header className="text-center space-y-8" role="banner">
          <h1 className={`${typographyVariants.headings.h1} text-gradient text-balance`}>
            Our Services
          </h1>
          <p className={`${typographyVariants.body.xl} text-secondary max-w-3xl mx-auto text-pretty`}>
            We provide comprehensive digital solutions to help your business grow and succeed in the modern world
          </p>
          
          {/* Quick Service Cards */}
          <section 
            className="grid md:grid-cols-3 gap-8 mt-12 cq-sm:grid-cols-2 cq-lg:grid-cols-3"
            aria-labelledby="featured-services"
          >
            <h2 id="featured-services" className="sr-only">Featured Services</h2>
            {servicesData.heroServices.map((service, index) => (
              <article 
                key={service.id} 
                className={`relative ${animationUtils.withStagger('scroll-reveal', index)}`}
                aria-labelledby={`service-${service.id}-title`}
              >
                <Card 
                  hover 
                  className={`interactive-card text-center h-full ${service.popular ? 'ring-2 ring-blue-500' : ''}`}
                  role="article"
                >
                  {service.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge variant="primary" aria-label="Most popular service">Most Popular</Badge>
                    </div>
                  )}
                  <div className="text-6xl mb-4" role="img" aria-label={`${service.name} icon`}>
                    {service.icon}
                  </div>
                  <h3 id={`service-${service.id}-title`} className="text-xl font-semibold mb-3 text-balance">
                    {service.name}
                  </h3>
                  <p className="text-secondary mb-4 text-pretty">{service.description}</p>
                  <div className="space-y-2 mb-6">
                    <div className="text-2xl font-bold text-brand-primary" aria-label={`Starting price: ${service.price}`}>
                      {service.price}
                    </div>
                    <div className="text-sm text-tertiary" aria-label={`Estimated duration: ${service.duration}`}>
                      {service.duration}
                    </div>
                  </div>
                  <Button 
                    variant="primary" 
                    size="md" 
                    fullWidth
                    aria-label={`Get started with ${service.name}`}
                  >
                    Get Started
                  </Button>
                </Card>
              </article>
            ))}
          </section>
        </header>

        {/* Detailed Services */}
        <section className="space-y-8" aria-labelledby="detailed-services">
          <header className="text-center">
            <h2 id="detailed-services" className={`${typographyVariants.headings.h2} text-balance`}>
              Complete Service Portfolio
            </h2>
            <p className={`${typographyVariants.body.lg} text-secondary mt-4 text-pretty`}>
              Explore our full range of professional services
            </p>
          </header>
          
          <div className="grid lg:grid-cols-2 gap-8 grid-auto-fit">
            {servicesData.detailedServices.map((service, index) => (
              <article 
                key={service.id} 
                className={`group scroll-reveal animate-stagger-${(index % 6) + 1}`}
                aria-labelledby={`detailed-service-${service.id}-title`}
              >
                <Card 
                  hover 
                  className="interactive-card h-full"
                  role="article"
                >
                  {/* Service Image */}
                  <div className="relative rounded-xl mb-6 h-48">
                    <OptimizedImage
                      src={service.image}
                      alt={`${service.name} - ${service.description}`}
                      className="rounded-xl"
                      width={600}
                      height={400}
                    />
                    <div className="absolute top-4 left-4">
                      <Badge variant={getCategoryColor(service.category)} aria-label={`Category: ${service.category}`}>
                        {service.category}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge variant={getComplexityColor(service.complexity)} aria-label={`Complexity level: ${service.complexity}`}>
                        {service.complexity}
                      </Badge>
                    </div>
                  </div>

                  {/* Service Content */}
                  <div className="space-y-4">
                    <h3 
                      id={`detailed-service-${service.id}-title`}
                      className="text-xl font-semibold group-hover:text-brand-primary transition-colors text-balance"
                    >
                      {service.name}
                    </h3>
                    <p className="text-secondary text-pretty">{service.description}</p>

                    {/* Features */}
                    <details className="group/features">
                      <summary className="font-medium mb-2 cursor-pointer focus-ring list-none">
                        <span className="flex items-center gap-2">
                          What's Included:
                          <svg 
                            className="w-4 h-4 transition-transform group-open/features:rotate-180" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </summary>
                      <ul className="grid grid-cols-1 gap-1" role="list">
                        {service.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-secondary">
                            <svg 
                              className="w-4 h-4 text-green-500 shrink-0" 
                              fill="currentColor" 
                              viewBox="0 0 20 20"
                              aria-hidden="true"
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
                      <div className="flex flex-wrap gap-2" role="list">
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
                        <dt className="text-sm text-tertiary">Starting at</dt>
                        <dd className="text-lg font-semibold text-brand-primary">
                          ${service.startingPrice.toLocaleString()}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-tertiary">Timeline</dt>
                        <dd className="text-lg font-semibold">{service.timeline}</dd>
                      </div>
                    </dl>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="flex-1"
                        aria-label={`Get quote for ${service.name}`}
                      >
                        Get Quote
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        aria-label={`Learn more about ${service.name}`}
                      >
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
        <section className="space-y-8" aria-labelledby="our-process">
          <header className="text-center">
            <h2 id="our-process" className={`${typographyVariants.headings.h2} text-balance`}>
              Our Process
            </h2>
            <p className={`${typographyVariants.body.lg} text-secondary mt-4 text-pretty`}>
              How we deliver exceptional results for your project
            </p>
          </header>
          
          <ol className="grid md:grid-cols-2 lg:grid-cols-4 gap-8" role="list">
            {servicesData.process.map((step, index) => (
              <li 
                key={step.step} 
                className={`scroll-reveal animate-stagger-${index + 1}`}
              >
                <Card className="interactive-card text-center relative h-full">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div 
                      className="w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center font-bold text-sm"
                      aria-label={`Step ${step.step}`}
                    >
                      {step.step}
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <div className="text-4xl mb-4" role="img" aria-label={`${step.title} icon`}>
                      {step.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-balance">{step.title}</h3>
                    <p className="text-secondary text-sm mb-3 text-pretty">{step.description}</p>
                    <Badge variant="info" className="text-xs" aria-label={`Duration: ${step.duration}`}>
                      {step.duration}
                    </Badge>
                  </div>
                </Card>
              </li>
            ))}
          </ol>
        </section>

        {/* Testimonials */}
        <section className="space-y-8" aria-labelledby="testimonials">
          <header className="text-center">
            <h2 id="testimonials" className={`${typographyVariants.headings.h2} text-balance`}>
              What Our Clients Say
            </h2>
            <p className={`${typographyVariants.body.lg} text-secondary mt-4 text-pretty`}>
              Don't just take our word for it - hear from satisfied customers
            </p>
          </header>
          
          <div className="grid md:grid-cols-3 gap-8 grid-auto-fit">
            {servicesData.testimonials.map((testimonial, index) => (
              <article 
                key={testimonial.id} 
                className={`scroll-scale animate-stagger-${index + 1}`}
                aria-labelledby={`testimonial-${testimonial.id}-name`}
              >
                <Card hover className="interactive-card text-center h-full">
                  <div className="text-4xl mb-4" role="img" aria-label={`${testimonial.name}'s avatar`}>
                    {testimonial.avatar}
                  </div>
                  
                  {/* Rating */}
                  <div className="flex justify-center mb-4" role="img" aria-label={`${testimonial.rating} out of 5 stars`}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  
                  <blockquote className="text-secondary italic mb-4 text-pretty">
                    "{testimonial.content}"
                  </blockquote>
                  
                  <footer>
                    <cite className="not-italic">
                      <div id={`testimonial-${testimonial.id}-name`} className="font-semibold">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-tertiary">{testimonial.role}</div>
                    </cite>
                  </footer>
                </Card>
              </article>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <aside 
          className="scroll-reveal"
          aria-labelledby="cta-heading"
        >
          <Card className="bg-linear-to-br from-blue-600 via-purple-600 to-pink-600 text-white text-center glass">
            <div className="space-y-6">
              <h2 id="cta-heading" className="text-4xl font-bold text-balance">
                Ready to Start Your Project?
              </h2>
              <p className="text-xl opacity-90 max-w-2xl mx-auto text-pretty">
                Let's discuss your requirements and create something amazing together
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="bg-white text-brand-primary hover:bg-gray-100 focus-ring"
                  aria-label="Get a free consultation to discuss your project"
                >
                  Get Free Consultation
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white text-white hover:bg-white/10 focus-ring"
                  aria-label="View our portfolio of completed projects"
                >
                  View Portfolio
                </Button>
              </div>
            </div>
          </Card>
        </aside>
      </main>
    </>
  );
}
