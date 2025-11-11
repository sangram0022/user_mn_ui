/**
 * Reference UI Pages Index
 * 
 * This folder contains reference pages from usermn_backup_non_react project
 * for visual comparison and styling consistency during development.
 * 
 * Access via: http://localhost:5179/reference/*
 * 
 * Pages Available:
 * - /reference/html-showcase - Complete HTML elements showcase
 * - /reference/modern-html - Modern HTML semantics with performance
 * - /reference/products - Product listing page example
 * - /reference/services - Services portfolio example
 * - /reference/ui-elements - Complete UI elements library (NEW)
 * - /reference/form-patterns - Form patterns and validation (NEW)
 * - /reference/component-patterns - Reusable component patterns (NEW)
 * 
 * TO DELETE: Remove this entire folder at project completion
 */

import { Link } from 'react-router-dom';
import { Card, Badge } from '../components';

export default function ReferenceIndex() {
  const referencePages = [
    {
      path: '/reference/html-showcase',
      name: 'HTML Showcase',
      description: 'Complete showcase of all HTML elements, forms, tables, and components',
      badge: 'Components',
      badgeVariant: 'primary' as const,
    },
    {
      path: '/reference/modern-html',
      name: 'Modern HTML Page',
      description: 'Modern HTML5 semantics, accessibility features, and performance optimization',
      badge: 'Advanced',
      badgeVariant: 'secondary' as const,
    },
    {
      path: '/reference/products',
      name: 'Products Page',
      description: 'E-commerce product listing with filters, ratings, and cart functionality',
      badge: 'E-commerce',
      badgeVariant: 'info' as const,
    },
    {
      path: '/reference/services',
      name: 'Services Page',
      description: 'Professional services portfolio with detailed descriptions and testimonials',
      badge: 'Business',
      badgeVariant: 'success' as const,
    },
    {
      path: '/reference/ui-elements',
      name: 'UI Elements Showcase',
      description: 'Complete reference of all HTML5 elements: typography, forms, buttons, tables, media, and layouts',
      badge: 'UI Library',
      badgeVariant: 'warning' as const,
    },
    {
      path: '/reference/form-patterns',
      name: 'Form Patterns',
      description: 'Form patterns, validation examples, multi-step forms, and input variations',
      badge: 'Forms',
      badgeVariant: 'success' as const,
    },
    {
      path: '/reference/component-patterns',
      name: 'Component Patterns',
      description: 'Reusable UI patterns: modals, tabs, accordion, dropdowns, pagination, and more',
      badge: 'Patterns',
      badgeVariant: 'info' as const,
    },
  ];

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full mb-4">
          <span className="text-xl">⚠️</span>
          <span className="text-sm font-medium">Reference Only - Delete Before Production</span>
        </div>
        <h1 className="text-4xl font-bold mb-4">Backup Project Reference Pages</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          These pages are copied from <code className="bg-gray-100 px-2 py-1 rounded">usermn_backup_non_react</code> project
          for visual styling reference during development.
        </p>
      </div>

      {/* Reference Pages Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {referencePages.map((page) => (
          <Link key={page.path} to={page.path} className="block">
            <Card hover className="h-full group">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold group-hover:text-brand-primary transition-colors">
                  {page.name}
                </h3>
                <Badge variant={page.badgeVariant}>{page.badge}</Badge>
              </div>
              <p className="text-gray-600 mb-4">{page.description}</p>
              <div className="flex items-center text-brand-primary text-sm font-medium">
                View Reference Page
                <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <h2 className="text-lg font-semibold mb-3">Usage Instructions</h2>
        <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
          <li>Use these pages to compare visual styling with current project pages</li>
          <li>All components use the same design system and CSS files</li>
          <li>Import paths have been updated to work with current project structure</li>
          <li><strong>Do NOT modify</strong> these reference files - they are for comparison only</li>
          <li><strong>Delete this entire folder</strong> (<code className="bg-gray-100 px-1 rounded">src/_reference_backup_ui/</code>) when project is complete</li>
        </ol>
      </Card>

      {/* Back to Home */}
      <div className="text-center mt-12">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-brand-primary transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
