import { useRef, useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { typographyVariants } from '../design-system/variants';
import { usePerformanceMetrics, useIntersectionObserver } from '../utils/performance';

// Modern HTML Semantics Data - Single Source of Truth
const modernHtmlData = {
  pageMetadata: {
    title: 'Modern HTML Semantics & CSS Features Showcase',
    description: 'Demonstrating the latest HTML5 semantic elements, accessibility features, and CSS capabilities',
    keywords: ['HTML5', 'CSS', 'Accessibility', 'Performance', 'Semantic Web'],
    lastModified: '2025-10-27',
    author: 'UserMN Development Team',
  },

  navigationSections: [
    { id: 'article-section', label: 'Featured Articles', icon: '📰' },
    { id: 'products-section', label: 'Product Catalog', icon: '🛍️' },
    { id: 'testimonials-section', label: 'Customer Reviews', icon: '💬' },
    { id: 'events-section', label: 'Upcoming Events', icon: '📅' },
    { id: 'resources-section', label: 'Learning Resources', icon: '📚' },
  ],

  articles: [
    {
      id: 1,
      headline: 'The Future of Web Development: 2025 Trends',
      subtitle: 'Exploring the latest technologies shaping modern web applications',
      author: 'Sarah Chen',
      publishDate: '2025-10-25',
      lastModified: '2025-10-26',
      readingTime: '8 min read',
      category: 'Technology',
      tags: ['Web Development', 'Trends', 'Innovation'],
      summary: 'An in-depth look at emerging web technologies including Web Components, Progressive Web Apps, and AI integration.',
      content: 'Modern web development continues to evolve at an unprecedented pace...',
      featured: true,
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
    },
    {
      id: 2,
      headline: 'Accessibility in Modern Web Design',
      subtitle: 'Creating inclusive digital experiences for everyone',
      author: 'Michael Rodriguez',
      publishDate: '2025-10-20',
      lastModified: '2025-10-21',
      readingTime: '12 min read',
      category: 'Accessibility',
      tags: ['A11y', 'Inclusive Design', 'WCAG'],
      summary: 'Comprehensive guide to implementing accessibility best practices in modern web applications.',
      content: 'Accessibility is not just a feature—it\'s a fundamental requirement...',
      featured: false,
      image: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&h=450&fit=crop',
    },
  ],

  products: [
    {
      id: 'prod-001',
      name: 'Premium Design System',
      category: 'UI Kit',
      price: { amount: 299, currency: 'USD', formatted: '$299' },
      rating: { value: 4.8, count: 127, max: 5 },
      availability: 'in-stock',
      description: 'Complete design system with React components, Figma files, and documentation',
      features: ['200+ Components', 'Dark/Light Mode', 'TypeScript Support', 'Figma Library'],
      releaseDate: '2025-09-15',
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
    },
    {
      id: 'prod-002',
      name: 'Advanced Analytics Dashboard',
      category: 'Software',
      price: { amount: 599, currency: 'USD', formatted: '$599' },
      rating: { value: 4.9, count: 89, max: 5 },
      availability: 'limited',
      description: 'Real-time analytics platform with AI-powered insights and custom reporting',
      features: ['Real-time Data', 'AI Insights', 'Custom Reports', 'API Integration'],
      releaseDate: '2025-10-01',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    },
  ],

  testimonials: [
    {
      id: 'test-001',
      reviewer: {
        name: 'Dr. Elena Vasquez',
        role: 'Chief Technology Officer',
        company: 'InnovateTech Solutions',
        avatar: '👩‍💼',
      },
      rating: 5,
      content: 'The level of detail and quality in their work is exceptional. Our user engagement increased by 200% after implementing their recommendations.',
      date: '2025-10-15',
      verified: true,
      helpful: { count: 23, total: 25 },
    },
    {
      id: 'test-002',
      reviewer: {
        name: 'James Park',
        role: 'Product Manager',
        company: 'Global Dynamics Corp',
        avatar: '👨‍💻',
      },
      rating: 5,
      content: 'Outstanding service and technical expertise. They delivered beyond our expectations and on schedule.',
      date: '2025-10-10',
      verified: true,
      helpful: { count: 18, total: 20 },
    },
  ],

  events: [
    {
      id: 'event-001',
      name: 'Modern Web Architecture Summit 2025',
      type: 'conference',
      startDate: '2025-11-15T09:00:00Z',
      endDate: '2025-11-17T18:00:00Z',
      location: {
        name: 'Tech Convention Center',
        address: '123 Innovation Blvd, San Francisco, CA',
        coordinates: { lat: 37.7749, lng: -122.4194 },
      },
      organizer: 'Web Standards Consortium',
      price: { amount: 299, currency: 'USD', formatted: '$299' },
      capacity: 500,
      registered: 387,
      description: 'Join industry leaders discussing the future of web architecture, performance optimization, and modern development practices.',
      speakers: ['Sarah Chen', 'Michael Rodriguez', 'Dr. Elena Vasquez'],
    },
    {
      id: 'event-002',
      name: 'Accessibility Workshop: Building Inclusive Experiences',
      type: 'workshop',
      startDate: '2025-11-08T14:00:00Z',
      endDate: '2025-11-08T17:00:00Z',
      location: {
        name: 'Online',
        address: 'Virtual Event',
        coordinates: null,
      },
      organizer: 'A11y Education Initiative',
      price: { amount: 0, currency: 'USD', formatted: 'Free' },
      capacity: 100,
      registered: 78,
      description: 'Hands-on workshop covering WCAG guidelines, screen reader testing, and inclusive design principles.',
      speakers: ['Michael Rodriguez'],
    },
  ],

  resources: [
    {
      id: 'res-001',
      title: 'Complete CSS Grid Mastery Course',
      type: 'course',
      format: 'video',
      duration: 'PT6H30M', // ISO 8601 duration
      difficulty: 'intermediate',
      price: { amount: 79, currency: 'USD', formatted: '$79' },
      rating: { value: 4.7, count: 234 },
      description: 'Master CSS Grid with practical examples and real-world projects',
      topics: ['CSS Grid Layout', 'Responsive Design', 'Browser Support', 'Performance'],
      instructor: 'Alex Thompson',
      lastUpdated: '2025-10-01',
    },
    {
      id: 'res-002',
      title: 'Modern JavaScript Performance Guide',
      type: 'guide',
      format: 'pdf',
      pages: 156,
      difficulty: 'advanced',
      price: { amount: 0, currency: 'USD', formatted: 'Free' },
      rating: { value: 4.9, count: 567 },
      description: 'Comprehensive guide to optimizing JavaScript performance in modern applications',
      topics: ['Bundle Optimization', 'Code Splitting', 'Memory Management', 'Web Workers'],
      author: 'Performance Team',
      lastUpdated: '2025-09-28',
    },
  ],
};

// Modern Image Component with WebP support, lazy loading, and performance optimization
interface ModernImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  itemProp?: string;
}

function ModernImage({ src, alt, width, height, className = '', priority = false, sizes, itemProp }: ModernImageProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Use performance hook for lazy loading
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
  });
  
  // Generate WebP source with fallback
  const webpSrc = src.replace(/\.(jpg|jpeg|png)(\?.*)?$/, '.webp$2');
  
  return (
    <picture className={`block ${className}`} ref={ref}>
      <source srcSet={webpSrc} type="image/webp" sizes={sizes} />
      <img
        ref={imageRef}
        src={isIntersecting || priority ? src : ''}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={`w-full h-full object-cover transition-all duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${hasError ? 'bg-gray-200' : ''}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        sizes={sizes}
        itemProp={itemProp}
      />
      {!isLoaded && (isIntersecting || priority) && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" aria-hidden="true" />
      )}
    </picture>
  );
}

// Time component with proper semantic markup
interface TimeComponentProps {
  dateTime: string;
  children: React.ReactNode;
  className?: string;
  itemProp?: string;
}

function TimeComponent({ dateTime, children, className = '', itemProp }: TimeComponentProps) {
  return (
    <time dateTime={dateTime} className={className} itemProp={itemProp}>
      {children}
    </time>
  );
}

// Progress indicator component
interface ProgressProps {
  value: number;
  max: number;
  label: string;
  className?: string;
}

function Progress({ value, max, label, className = '' }: ProgressProps) {
  const percentage = (value / max) * 100;
  
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>{value}/{max}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-brand-primary h-2 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
        />
      </div>
    </div>
  );
}

export default function ModernHtmlPage() {
  const mainRef = useRef<HTMLElement>(null);
  const [currentSection, setCurrentSection] = useState('article-section');
  
  // Performance monitoring
  const performanceMetrics = usePerformanceMetrics();
  
  // Skip to content functionality
  const skipToContent = () => {
    mainRef.current?.focus();
    mainRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Section intersection observer for navigation
  useEffect(() => {
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setCurrentSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: '-20% 0px -80% 0px',
    });

    modernHtmlData.navigationSections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Skip to main content for accessibility */}
      <a 
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          skipToContent();
        }}
        className="sr-only-focusable fixed top-4 left-4 z-tooltip bg-brand-primary text-white px-4 py-2 rounded-md focus-ring"
      >
        Skip to main content
      </a>

      {/* Page Header with proper semantic structure */}
      <header className="bg-surface-elevated border-b border-gray-200 sticky top-0 z-sticky">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <hgroup>
              <h1 className={`${typographyVariants.headings.h1} text-balance`}>
                {modernHtmlData.pageMetadata.title}
              </h1>
              <p className="text-secondary mt-2 text-pretty">
                {modernHtmlData.pageMetadata.description}
              </p>
            </hgroup>
            
            {/* Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm" role="list">
                <li><a href="/" className="text-brand-primary hover:opacity-80 transition-opacity">Home</a></li>
                <li className="text-gray-500">/</li>
                <li><a href="/showcase" className="text-brand-primary hover:opacity-80 transition-opacity">Showcase</a></li>
                <li className="text-gray-500">/</li>
                <li className="text-gray-900" aria-current="page">Modern HTML</li>
              </ol>
            </nav>
          </div>
        </div>
      </header>

      {/* Table of Contents Navigation */}
      <nav 
        className="bg-surface-secondary border-b border-gray-200 sticky top-[88px] z-docked"
        aria-label="Page sections"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex overflow-x-auto space-x-6 py-3" role="list">
            {modernHtmlData.navigationSections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className={`flex items-center gap-2 whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentSection === section.id
                      ? 'bg-brand-primary text-white'
                      : 'text-gray-600 hover:text-brand-primary hover:bg-gray-100'
                  }`}
                  aria-current={currentSection === section.id ? 'page' : undefined}
                >
                  <span role="img" aria-hidden="true">{section.icon}</span>
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Main Content with semantic structure */}
      <main 
        ref={mainRef}
        id="main-content"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16"
        tabIndex={-1}
      >
        {/* Featured Articles Section */}
        <section 
          id="article-section" 
          className="scroll-reveal"
          aria-labelledby="articles-heading"
        >
          <header className="mb-8">
            <h2 id="articles-heading" className={`${typographyVariants.headings.h2} text-balance`}>
              Featured Articles
            </h2>
            <p className="text-secondary mt-2 text-pretty">
              Latest insights and in-depth analysis from our team
            </p>
          </header>

          <div className="grid lg:grid-cols-2 gap-8">
            {modernHtmlData.articles.map((article, index) => (
              <article 
                key={article.id}
                className={`interactive-card scroll-reveal animate-stagger-${index + 1}`}
                aria-labelledby={`article-${article.id}-headline`}
              >
                <Card hover className="h-full">
                  {/* Article Image */}
                  <figure className="relative h-48 mb-6">
                    <ModernImage
                      src={article.image}
                      alt={`Cover image for ${article.headline}`}
                      className="rounded-lg"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
                    />
                    {article.featured && (
                      <div className="absolute top-4 left-4">
                        <Badge variant="primary">Featured</Badge>
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary">{article.category}</Badge>
                    </div>
                  </figure>

                  {/* Article Header */}
                  <header className="mb-4">
                    <h3 
                      id={`article-${article.id}-headline`}
                      className="text-xl font-bold mb-2 text-balance group-hover:text-brand-primary transition-colors"
                    >
                      {article.headline}
                    </h3>
                    <p className="text-lg text-secondary text-pretty">{article.subtitle}</p>
                  </header>

                  {/* Article Metadata */}
                  <div className="flex items-center gap-4 text-sm text-secondary mb-4">
                    <address className="flex items-center gap-2 not-italic">
                      <span>By</span>
                      <span className="font-medium">{article.author}</span>
                    </address>
                    <TimeComponent dateTime={article.publishDate}>
                      {new Date(article.publishDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </TimeComponent>
                    <span aria-label={`Estimated reading time: ${article.readingTime}`}>
                      {article.readingTime}
                    </span>
                  </div>

                  {/* Article Summary */}
                  <p className="text-secondary mb-4 text-pretty">{article.summary}</p>

                  {/* Article Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {article.tags.map((tag) => (
                      <Badge key={tag} variant="gray" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Article Actions */}
                  <footer className="flex gap-3">
                    <Button variant="primary" size="sm" className="flex-1">
                      Read Article
                    </Button>
                    <Button variant="outline" size="sm">
                      Share
                    </Button>
                  </footer>
                </Card>
              </article>
            ))}
          </div>
        </section>

        {/* Products Catalog Section */}
        <section 
          id="products-section" 
          className="scroll-reveal"
          aria-labelledby="products-heading"
        >
          <header className="mb-8">
            <h2 id="products-heading" className={`${typographyVariants.headings.h2} text-balance`}>
              Product Catalog
            </h2>
            <p className="text-secondary mt-2 text-pretty">
              Professional tools and resources for modern development
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-8">
            {modernHtmlData.products.map((product, index) => (
              <article 
                key={product.id}
                className={`scroll-reveal animate-stagger-${index + 1}`}
                aria-labelledby={`product-${product.id}-name`}
                itemScope
                itemType="https://schema.org/Product"
              >
                <Card hover className="interactive-card h-full">
                  {/* Product Image */}
                  <figure className="relative h-48 mb-6">
                    <ModernImage
                      src={product.image}
                      alt={`${product.name} - ${product.description}`}
                      className="rounded-lg"
                      itemProp="image"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge 
                        variant={product.availability === 'in-stock' ? 'success' : 'warning'}
                      >
                        {product.availability === 'in-stock' ? 'In Stock' : 'Limited'}
                      </Badge>
                    </div>
                  </figure>

                  {/* Product Header */}
                  <header className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 
                        id={`product-${product.id}-name`}
                        className="text-xl font-bold text-balance"
                        itemProp="name"
                      >
                        {product.name}
                      </h3>
                      <div className="text-right">
                        <div 
                          className="text-2xl font-bold text-brand-primary"
                          itemProp="offers"
                          itemScope
                          itemType="https://schema.org/Offer"
                        >
                          <span itemProp="price" content={product.price.amount.toString()}>
                            {product.price.formatted}
                          </span>
                          <meta itemProp="priceCurrency" content={product.price.currency} />
                        </div>
                        <Badge variant="info" className="text-xs">{product.category}</Badge>
                      </div>
                    </div>
                    
                    {/* Product Rating */}
                    <div 
                      className="flex items-center gap-2"
                      itemProp="aggregateRating"
                      itemScope
                      itemType="https://schema.org/AggregateRating"
                    >
                      <div className="flex" role="img" aria-label={`${product.rating.value} out of ${product.rating.max} stars`}>
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(product.rating.value) ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-secondary">
                        <span itemProp="ratingValue">{product.rating.value}</span>
                        {' '}({<span itemProp="reviewCount">{product.rating.count}</span>} reviews)
                      </span>
                      <meta itemProp="bestRating" content={product.rating.max.toString()} />
                    </div>
                  </header>

                  {/* Product Description */}
                  <p className="text-secondary mb-4 text-pretty" itemProp="description">
                    {product.description}
                  </p>

                  {/* Product Features */}
                  <details className="mb-4">
                    <summary className="font-medium cursor-pointer focus-ring">
                      Key Features
                    </summary>
                    <ul className="mt-2 space-y-1" role="list">
                      {product.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-secondary">
                          <svg className="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </details>

                  {/* Product Metadata */}
                  <dl className="grid grid-cols-2 gap-4 text-sm mb-6">
                    <div>
                      <dt className="text-tertiary">Product ID</dt>
                      <dd className="font-mono text-xs" itemProp="sku">{product.id}</dd>
                    </div>
                    <div>
                      <dt className="text-tertiary">Release Date</dt>
                      <dd>
                        <TimeComponent dateTime={product.releaseDate} itemProp="datePublished">
                          {new Date(product.releaseDate).toLocaleDateString()}
                        </TimeComponent>
                      </dd>
                    </div>
                  </dl>

                  {/* Product Actions */}
                  <footer className="flex gap-3">
                    <Button variant="primary" size="sm" className="flex-1">
                      Add to Cart
                    </Button>
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </footer>
                </Card>
              </article>
            ))}
          </div>
        </section>

        {/* Customer Testimonials Section */}
        <section 
          id="testimonials-section" 
          className="scroll-reveal"
          aria-labelledby="testimonials-heading"
        >
          <header className="mb-8">
            <h2 id="testimonials-heading" className={`${typographyVariants.headings.h2} text-balance`}>
              Customer Testimonials
            </h2>
            <p className="text-secondary mt-2 text-pretty">
              What our clients say about working with us
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-8">
            {modernHtmlData.testimonials.map((testimonial, index) => (
              <article 
                key={testimonial.id}
                className={`scroll-scale animate-stagger-${index + 1}`}
                aria-labelledby={`testimonial-${testimonial.id}-reviewer`}
                itemScope
                itemType="https://schema.org/Review"
              >
                <Card hover className="interactive-card h-full">
                  {/* Testimonial Header */}
                  <header className="flex items-start gap-4 mb-4">
                    <div className="text-4xl" role="img" aria-label={`${testimonial.reviewer.name}'s avatar`}>
                      {testimonial.reviewer.avatar}
                    </div>
                    <div className="flex-1">
                      <h3 
                        id={`testimonial-${testimonial.id}-reviewer`}
                        className="font-bold"
                        itemProp="author"
                        itemScope
                        itemType="https://schema.org/Person"
                      >
                        <span itemProp="name">{testimonial.reviewer.name}</span>
                        {testimonial.verified && (
                          <Badge variant="success" className="ml-2 text-xs">
                            Verified
                          </Badge>
                        )}
                      </h3>
                      <div className="text-sm text-secondary">
                        <span itemProp="jobTitle">{testimonial.reviewer.role}</span>
                        {' at '}
                        <span itemProp="worksFor" itemScope itemType="https://schema.org/Organization">
                          <span itemProp="name">{testimonial.reviewer.company}</span>
                        </span>
                      </div>
                    </div>
                  </header>

                  {/* Rating */}
                  <div 
                    className="flex items-center gap-2 mb-4"
                    itemProp="reviewRating"
                    itemScope
                    itemType="https://schema.org/Rating"
                  >
                    <div className="flex" role="img" aria-label={`${testimonial.rating} out of 5 stars`}>
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <TimeComponent 
                      dateTime={testimonial.date}
                      className="text-sm text-secondary"
                      itemProp="datePublished"
                    >
                      {new Date(testimonial.date).toLocaleDateString()}
                    </TimeComponent>
                    <meta itemProp="ratingValue" content={testimonial.rating.toString()} />
                    <meta itemProp="bestRating" content="5" />
                  </div>

                  {/* Testimonial Content */}
                  <blockquote 
                    className="text-secondary italic mb-4 text-pretty"
                    itemProp="reviewBody"
                  >
                    "{testimonial.content}"
                  </blockquote>

                  {/* Helpful Rating */}
                  <footer className="flex items-center justify-between text-sm">
                    <div className="text-tertiary">
                      Was this helpful?
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        👍 Yes ({testimonial.helpful.count})
                      </Button>
                      <Button variant="ghost" size="sm">
                        👎 No ({testimonial.helpful.total - testimonial.helpful.count})
                      </Button>
                    </div>
                  </footer>
                </Card>
              </article>
            ))}
          </div>
        </section>

        {/* Events Section */}
        <section 
          id="events-section" 
          className="scroll-reveal"
          aria-labelledby="events-heading"
        >
          <header className="mb-8">
            <h2 id="events-heading" className={`${typographyVariants.headings.h2} text-balance`}>
              Upcoming Events
            </h2>
            <p className="text-secondary mt-2 text-pretty">
              Join us at conferences, workshops, and community events
            </p>
          </header>

          <div className="space-y-6">
            {modernHtmlData.events.map((event, index) => (
              <article 
                key={event.id}
                className={`scroll-reveal animate-stagger-${index + 1}`}
                aria-labelledby={`event-${event.id}-name`}
                itemScope
                itemType="https://schema.org/Event"
              >
                <Card hover className="interactive-card">
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Event Date */}
                    <div className="md:border-r md:border-gray-200 md:pr-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-brand-primary">
                          {new Date(event.startDate).getDate()}
                        </div>
                        <div className="text-sm text-secondary">
                          {new Date(event.startDate).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                        <Badge variant="info" className="mt-2 text-xs">
                          {event.type}
                        </Badge>
                      </div>
                      
                      {/* Registration Progress */}
                      <div className="mt-4">
                        <Progress
                          value={event.registered}
                          max={event.capacity}
                          label="Registration"
                          className="text-xs"
                        />
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="md:col-span-2">
                      <header className="mb-4">
                        <h3 
                          id={`event-${event.id}-name`}
                          className="text-xl font-bold mb-2 text-balance"
                          itemProp="name"
                        >
                          {event.name}
                        </h3>
                        
                        {/* Event Metadata */}
                        <dl className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <dt className="text-tertiary">Date & Time</dt>
                            <dd>
                              <TimeComponent 
                                dateTime={event.startDate}
                                itemProp="startDate"
                              >
                                {new Date(event.startDate).toLocaleString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit'
                                })}
                              </TimeComponent>
                              <meta itemProp="endDate" content={event.endDate} />
                            </dd>
                          </div>
                          <div>
                            <dt className="text-tertiary">Location</dt>
                            <dd 
                              itemProp="location"
                              itemScope
                              itemType="https://schema.org/Place"
                            >
                              <span itemProp="name">{event.location.name}</span>
                              {event.location.address !== 'Virtual Event' && (
                                <div className="text-xs text-secondary" itemProp="address">
                                  {event.location.address}
                                </div>
                              )}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-tertiary">Organizer</dt>
                            <dd 
                              itemProp="organizer"
                              itemScope
                              itemType="https://schema.org/Organization"
                            >
                              <span itemProp="name">{event.organizer}</span>
                            </dd>
                          </div>
                          <div>
                            <dt className="text-tertiary">Price</dt>
                            <dd 
                              className="font-semibold text-brand-primary"
                              itemProp="offers"
                              itemScope
                              itemType="https://schema.org/Offer"
                            >
                              <span itemProp="price" content={event.price.amount.toString()}>
                                {event.price.formatted}
                              </span>
                              <meta itemProp="priceCurrency" content={event.price.currency} />
                            </dd>
                          </div>
                        </dl>
                      </header>

                      {/* Event Description */}
                      <p className="text-secondary mb-4 text-pretty" itemProp="description">
                        {event.description}
                      </p>

                      {/* Speakers */}
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Featured Speakers:</h4>
                        <div className="flex flex-wrap gap-2">
                          {event.speakers.map((speaker) => (
                            <Badge key={speaker} variant="gray" className="text-xs">
                              {speaker}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Event Actions */}
                      <footer className="flex gap-3">
                        <Button variant="primary" size="sm">
                          Register Now
                        </Button>
                        <Button variant="outline" size="sm">
                          Learn More
                        </Button>
                        <Button variant="ghost" size="sm">
                          Add to Calendar
                        </Button>
                      </footer>
                    </div>
                  </div>
                </Card>
              </article>
            ))}
          </div>
        </section>

        {/* Learning Resources Section */}
        <section 
          id="resources-section" 
          className="scroll-reveal"
          aria-labelledby="resources-heading"
        >
          <header className="mb-8">
            <h2 id="resources-heading" className={`${typographyVariants.headings.h2} text-balance`}>
              Learning Resources
            </h2>
            <p className="text-secondary mt-2 text-pretty">
              Courses, guides, and tutorials to advance your skills
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-8">
            {modernHtmlData.resources.map((resource, index) => (
              <article 
                key={resource.id}
                className={`scroll-reveal animate-stagger-${index + 1}`}
                aria-labelledby={`resource-${resource.id}-title`}
                itemScope
                itemType="https://schema.org/Course"
              >
                <Card hover className="interactive-card h-full">
                  <header className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 
                        id={`resource-${resource.id}-title`}
                        className="text-xl font-bold text-balance"
                        itemProp="name"
                      >
                        {resource.title}
                      </h3>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-brand-primary">
                          {resource.price.formatted}
                        </div>
                        <Badge variant="info" className="text-xs">{resource.type}</Badge>
                      </div>
                    </div>
                    
                    {/* Resource Rating */}
                    <div 
                      className="flex items-center gap-2"
                      itemProp="aggregateRating"
                      itemScope
                      itemType="https://schema.org/AggregateRating"
                    >
                      <div className="flex" role="img" aria-label={`${resource.rating.value} out of 5 stars`}>
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(resource.rating.value) ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-secondary">
                        <span itemProp="ratingValue">{resource.rating.value}</span>
                        {' '}({<span itemProp="reviewCount">{resource.rating.count}</span>} reviews)
                      </span>
                    </div>
                  </header>

                  {/* Resource Description */}
                  <p className="text-secondary mb-4 text-pretty" itemProp="description">
                    {resource.description}
                  </p>

                  {/* Resource Metadata */}
                  <dl className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <dt className="text-tertiary">Format</dt>
                      <dd className="capitalize">{resource.format}</dd>
                    </div>
                    <div>
                      <dt className="text-tertiary">Difficulty</dt>
                      <dd className="capitalize">
                        <Badge variant={
                          resource.difficulty === 'beginner' ? 'success' :
                          resource.difficulty === 'intermediate' ? 'warning' : 'danger'
                        } className="text-xs">
                          {resource.difficulty}
                        </Badge>
                      </dd>
                    </div>
                    {resource.duration && (
                      <div>
                        <dt className="text-tertiary">Duration</dt>
                        <dd>{resource.duration.replace('PT', '').replace('H', 'h ').replace('M', 'm')}</dd>
                      </div>
                    )}
                    {resource.pages && (
                      <div>
                        <dt className="text-tertiary">Pages</dt>
                        <dd>{resource.pages} pages</dd>
                      </div>
                    )}
                  </dl>

                  {/* Topics */}
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Topics Covered:</h4>
                    <div className="flex flex-wrap gap-2">
                      {resource.topics.map((topic) => (
                        <Badge key={topic} variant="gray" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Instructor/Author */}
                  <div className="mb-4 text-sm">
                    <span className="text-tertiary">
                      {resource.instructor ? 'Instructor' : 'Author'}:
                    </span>
                    {' '}
                    <span className="font-medium">
                      {resource.instructor || resource.author}
                    </span>
                  </div>

                  {/* Last Updated */}
                  <div className="mb-6 text-sm text-secondary">
                    Last updated:{' '}
                    <TimeComponent dateTime={resource.lastUpdated}>
                      {new Date(resource.lastUpdated).toLocaleDateString()}
                    </TimeComponent>
                  </div>

                  {/* Resource Actions */}
                  <footer className="flex gap-3">
                    <Button variant="primary" size="sm" className="flex-1">
                      {resource.price.amount === 0 ? 'Download Free' : 'Purchase'}
                    </Button>
                    <Button variant="outline" size="sm">
                      Preview
                    </Button>
                  </footer>
                </Card>
              </article>
            ))}
          </div>
        </section>

        {/* Performance Metrics Section (for demonstration) */}
        {performanceMetrics && (
          <aside 
            className="scroll-reveal"
            aria-labelledby="performance-heading"
          >
            <Card className="bg-gray-50">
              <header className="mb-4">
                <h2 id="performance-heading" className="text-lg font-bold">
                  Page Performance Metrics
                </h2>
                <p className="text-sm text-secondary">
                  Real-time performance monitoring using modern web APIs
                </p>
              </header>
              
              <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <dt className="text-tertiary">LCP</dt>
                  <dd className="font-mono text-lg">
                    {performanceMetrics.lcp ? `${Math.round(performanceMetrics.lcp)}ms` : 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-tertiary">FID</dt>
                  <dd className="font-mono text-lg">
                    {performanceMetrics.fid ? `${Math.round(performanceMetrics.fid)}ms` : 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-tertiary">CLS</dt>
                  <dd className="font-mono text-lg">
                    {performanceMetrics.cls ? performanceMetrics.cls.toFixed(3) : 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-tertiary">TTFB</dt>
                  <dd className="font-mono text-lg">
                    {performanceMetrics.ttfb ? `${Math.round(performanceMetrics.ttfb)}ms` : 'N/A'}
                  </dd>
                </div>
              </dl>
            </Card>
          </aside>
        )}
      </main>

      {/* Page Footer with structured data */}
      <footer className="bg-surface-secondary border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-secondary">
            <p>
              Last modified:{' '}
              <TimeComponent dateTime={modernHtmlData.pageMetadata.lastModified}>
                {new Date(modernHtmlData.pageMetadata.lastModified).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </TimeComponent>
            </p>
            <p className="mt-2">
              Created by {modernHtmlData.pageMetadata.author}
            </p>
          </div>
        </div>
      </footer>

      {/* Schema.org structured data */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": modernHtmlData.pageMetadata.title,
            "description": modernHtmlData.pageMetadata.description,
            "keywords": modernHtmlData.pageMetadata.keywords.join(', '),
            "dateModified": modernHtmlData.pageMetadata.lastModified,
            "author": {
              "@type": "Organization",
              "name": modernHtmlData.pageMetadata.author
            },
            "mainEntity": {
              "@type": "ItemList",
              "itemListElement": modernHtmlData.articles.map((article, index) => ({
                "@type": "Article",
                "position": index + 1,
                "headline": article.headline,
                "description": article.summary,
                "author": {
                  "@type": "Person",
                  "name": article.author
                },
                "datePublished": article.publishDate,
                "dateModified": article.lastModified
              }))
            }
          })
        }}
      />
    </>
  );
}
