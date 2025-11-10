import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import Card from '../../../shared/components/ui/Card';
import Badge from '../../../shared/components/ui/Badge';
import { typographyVariants } from '../../../design-system/variants';
import type { BadgeVariant } from '../../../design-system/variants';
import { useContactForm } from '../../../core/validation';
import { useStandardErrorHandler } from '@/shared/hooks/useStandardErrorHandler';
import { logger } from '@/core/logging';
import { useToast } from '@/hooks/useToast';

// Contact data - Single source of truth
const contactData = {
  contactInfo: [
    {
      id: 1,
      title: 'Email Us',
      description: 'Send us an email and we\'ll respond within 24 hours',
      value: 'hello@usermn.com',
      icon: '📧',
      action: 'mailto:hello@usermn.com',
      actionText: 'Send Email',
    },
    {
      id: 2,
      title: 'Call Us',
      description: 'Speak directly with our team during business hours',
      value: '+1 (555) 123-4567',
      icon: '📞',
      action: 'tel:+15551234567',
      actionText: 'Call Now',
    },
    {
      id: 3,
      title: 'Visit Office',
      description: 'Come visit us at our headquarters',
      value: '123 Business Ave, Suite 100\nSan Francisco, CA 94105',
      icon: '📍',
      action: 'https://maps.google.com',
      actionText: 'Get Directions',
    },
    {
      id: 4,
      title: 'Live Chat',
      description: 'Chat with our support team in real-time',
      value: 'Available 9 AM - 6 PM PST',
      icon: '💬',
      action: '#',
      actionText: 'Start Chat',
    },
  ],

  officeHours: [
    { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM PST' },
    { day: 'Saturday', hours: '10:00 AM - 4:00 PM PST' },
    { day: 'Sunday', hours: 'Closed' },
  ],

  departments: [
    { name: 'General Inquiry', email: 'info@usermn.com' },
    { name: 'Sales', email: 'sales@usermn.com' },
    { name: 'Support', email: 'support@usermn.com' },
    { name: 'Partnerships', email: 'partners@usermn.com' },
    { name: 'Press & Media', email: 'press@usermn.com' },
  ],

  teamMembers: [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Head of Customer Success',
      email: 'sarah@usermn.com',
      avatar: '👩‍💼',
      bio: 'Sarah ensures every customer has an exceptional experience with our platform.',
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Technical Support Lead',
      email: 'michael@usermn.com',
      avatar: '👨‍💻',
      bio: 'Michael leads our technical support team and loves solving complex problems.',
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      role: 'Sales Director',
      email: 'emily@usermn.com',
      avatar: '👩‍🚀',
      bio: 'Emily helps businesses find the perfect solution for their user management needs.',
    },
  ],

  faqs: [
    {
      id: 1,
      question: 'How quickly can you respond to support requests?',
      answer: 'We typically respond to all support requests within 2-4 hours during business hours. For urgent issues, our premium support plan offers 1-hour response times.',
    },
    {
      id: 2,
      question: 'Do you offer custom development services?',
      answer: 'Yes! We provide custom development services for enterprise clients. Contact our sales team to discuss your specific requirements and get a tailored solution.',
    },
    {
      id: 3,
      question: 'What are your implementation timelines?',
      answer: 'Implementation timelines vary based on project complexity. Simple integrations take 1-2 weeks, while complex enterprise solutions can take 8-12 weeks. We\'ll provide a detailed timeline during consultation.',
    },
    {
      id: 4,
      question: 'Do you provide training for new users?',
      answer: 'Absolutely! We offer comprehensive training programs including video tutorials, documentation, live webinars, and one-on-one training sessions for enterprise customers.',
    },
  ],
};

export default function ContactPage() {
  const toast = useToast();
  const handleError = useStandardErrorHandler();

  // React Hook Form for contact form
  const form = useContactForm({
    onSuccess: async (data) => {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      logger().info('Contact form submitted', { name: data.name, email: data.email });
      
      // Show success message and reset form
      toast.success('Thank you for your message! We\'ll get back to you soon.');
      form.reset();
    },
    onError: (error) => {
      // Use standard error handler for consistent error UX
      handleError(error, {
        context: { operation: 'submitContactForm', page: 'ContactPage' },
        customMessage: 'Failed to send message. Please try again.',
      });
    },
    successMessage: 'Message sent successfully!',
    errorMessage: 'Failed to send message'
  });

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16 animate-fade-in">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <h1 className={`${typographyVariants.headings.h1} text-gradient`}>
          Get in Touch
        </h1>
        <p className={`${typographyVariants.body.xl} text-gray-600 max-w-3xl mx-auto`}>
          We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Badge variant="success">24/7 Support Available</Badge>
          <Badge variant="info">Average 2-hour Response</Badge>
          <Badge variant="primary">Free Consultation</Badge>
        </div>
      </section>

      {/* Contact Methods */}
      <section>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactData.contactInfo.map((contact) => (
            <Card 
              key={contact.id} 
              hover 
              className={`text-center group animate-scale-in`}
            >
              <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                {contact.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-brand-primary transition-colors">
                {contact.title}
              </h3>
              <p className="text-gray-600 text-sm mb-3">{contact.description}</p>
              <div className="text-sm font-medium mb-4 whitespace-pre-line">
                {contact.value}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  if (contact.action.startsWith('http') || contact.action.startsWith('mailto') || contact.action.startsWith('tel')) {
                    window.open(contact.action, '_blank');
                  }
                }}
              >
                {contact.actionText}
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="grid lg:grid-cols-3 gap-12">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card className="animate-slide-up">
            <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
            
            <form onSubmit={form.handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  type="text"
                  label="Full Name *"
                  placeholder="John Doe"
                  {...form.register('name')}
                  error={form.formState.errors.name?.message}
                  disabled={form.formState.isSubmitting}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                />
                <Input
                  type="email"
                  label="Email Address *"
                  placeholder="john@company.com"
                  {...form.register('email')}
                  error={form.formState.errors.email?.message}
                  disabled={form.formState.isSubmitting}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  }
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  type="text"
                  label="Company"
                  placeholder="Company Name"
                  {...form.register('company')}
                  error={form.formState.errors.company?.message}
                  disabled={form.formState.isSubmitting}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  }
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <select
                    {...form.register('department')}
                    disabled={form.formState.isSubmitting}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select Department</option>
                    {contactData.departments.map((dept) => (
                      <option key={dept.name} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.department && (
                    <p className="mt-1 text-sm text-red-600">{form.formState.errors.department.message}</p>
                  )}
                </div>
              </div>

              <Input
                type="text"
                label="Subject *"
                placeholder="How can we help you?"
                {...form.register('subject')}
                error={form.formState.errors.subject?.message}
                disabled={form.formState.isSubmitting}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                <textarea
                  rows={6}
                  placeholder="Tell us more about your inquiry..."
                  {...form.register('message')}
                  disabled={form.formState.isSubmitting}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
                {form.formState.errors.message && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.message.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
                <div className="flex gap-4">
                  {[
                    { value: 'low', label: 'Low', color: 'success' as BadgeVariant },
                    { value: 'normal', label: 'Normal', color: 'primary' as BadgeVariant },
                    { value: 'high', label: 'High', color: 'warning' as BadgeVariant },
                    { value: 'urgent', label: 'Urgent', color: 'danger' as BadgeVariant },
                  ].map((priority) => (
                    <label key={priority.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value={priority.value}
                        {...form.register('priority')}
                        disabled={form.formState.isSubmitting}
                        className="w-4 h-4 text-brand-primary border-gray-300 focus:ring-2 focus:ring-blue-500"
                      />
                      <Badge variant={priority.color} className="text-xs">
                        {priority.label}
                      </Badge>
                    </label>
                  ))}
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...form.register('newsletter')}
                  disabled={form.formState.isSubmitting}
                  className="mt-1 w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  I'd like to receive updates about new features, products, and special offers.
                  You can unsubscribe at any time.
                </span>
              </label>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={form.formState.isSubmitting}
                  loading={form.formState.isSubmitting}
                  className="flex-1"
                >
                  Send Message
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="lg"
                  onClick={() => form.reset()}
                  disabled={form.formState.isSubmitting}
                >
                  Clear Form
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="space-y-6">
          {/* Office Hours */}
          <Card className="animate-slide-right">
            <h3 className="text-lg font-semibold mb-4">Office Hours</h3>
            <div className="space-y-3">
              {contactData.officeHours.map((schedule, index) => (
                <div key={index} className="flex justify-between items-center py-2">
                  <span className="text-gray-700">{schedule.day}</span>
                  <span className="text-gray-600 font-medium">{schedule.hours}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Team Members */}
          <Card className="animate-slide-right animate-stagger-1">
            <h3 className="text-lg font-semibold mb-4">Meet Our Team</h3>
            <div className="space-y-4">
              {contactData.teamMembers.map((member) => (
                <div key={member.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="text-2xl">{member.avatar}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{member.name}</h4>
                    <p className="text-sm text-brand-primary">{member.role}</p>
                    <p className="text-xs text-gray-600 mt-1">{member.bio}</p>
                    <a
                      href={`mailto:${member.email}`}
                      className="text-xs text-brand-primary hover:opacity-80 mt-1 inline-block"
                    >
                      {member.email}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Links */}
          <Card className="animate-slide-right animate-stagger-2">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              {[
                { name: 'Knowledge Base', icon: '📚' },
                { name: 'Video Tutorials', icon: '🎥' },
                { name: 'API Documentation', icon: '⚡' },
                { name: 'Community Forum', icon: '👥' },
                { name: 'System Status', icon: '🟢' },
              ].map((link, index) => (
                <a
                  key={index}
                  href="#"
                  className="flex items-center gap-3 p-2 text-gray-700 hover:text-brand-primary hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <span>{link.icon}</span>
                  <span className="text-sm">{link.name}</span>
                  <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className={`${typographyVariants.headings.h2}`}>Frequently Asked Questions</h2>
          <p className={`${typographyVariants.body.lg} text-gray-600 mt-4`}>
            Find quick answers to common questions
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {contactData.faqs.map((faq) => (
            <Card 
              key={faq.id} 
              className={`animate-slide-up`}
            >
              <h3 className="font-semibold text-lg mb-3 text-gray-900">
                {faq.question}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {faq.answer}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Map Section */}
      <section>
        <Card className="overflow-hidden">
          <div className="relative h-64 bg-linear-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <h3 className="text-xl font-semibold text-gray-700">Interactive Map</h3>
              <p className="text-gray-600">Find us at our San Francisco headquarters</p>
              <Button variant="primary" size="sm" className="mt-4">
                View on Google Maps
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
