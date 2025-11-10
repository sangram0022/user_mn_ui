/**
 * Sample data for HTML Showcase components
 * Single source of truth for all showcase sections
 */

export const showcaseData = {
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

  accordionItems: [
    { 
      title: 'What is React 19?', 
      content: 'React 19 introduces new features like the React Compiler, improved Server Components, and enhanced performance optimizations.' 
    },
    { 
      title: 'Tailwind CSS v4 Benefits', 
      content: 'Version 4 brings CSS-first configuration, improved performance, and better developer experience with enhanced IntelliSense.' 
    },
    { 
      title: 'Vite 6 Features', 
      content: 'Vite 6 offers faster cold starts, improved HMR, and better support for modern JavaScript features.' 
    },
  ],
};
