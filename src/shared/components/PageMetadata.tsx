/**
 * PageMetadata Component
 *
 * React 19's declarative metadata support.
 * Renders <title>, <meta>, and <link> tags directly in components.
 *
 * Benefits over manual document.title:
 * - SSR-ready
 * - Component co-location
 * - Automatic cleanup on unmount
 * - Reactive to props/state changes
 * - Works with Suspense boundaries
 * - Type-safe
 *
 * React 19: No memoization needed - React Compiler handles optimization
 */

export interface PageMetadataProps {
  /**
   * Page title (will be suffixed with " | User Management")
   */
  title: string;

  /**
   * Meta description for SEO
   */
  description?: string;

  /**
   * Open Graph title (defaults to title if not provided)
   */
  ogTitle?: string;

  /**
   * Open Graph description (defaults to description if not provided)
   */
  ogDescription?: string;

  /**
   * Open Graph image URL
   */
  ogImage?: string;

  /**
   * Open Graph type (default: website)
   */
  ogType?: 'website' | 'article' | 'profile';

  /**
   * Twitter card type (default: summary)
   */
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';

  /**
   * Canonical URL for SEO
   */
  canonicalUrl?: string;

  /**
   * Keywords for SEO (comma-separated)
   */
  keywords?: string;

  /**
   * Robots meta tag (default: index,follow)
   */
  robots?: string;

  /**
   * Additional custom meta tags
   */
  customMeta?: Array<{
    name?: string;
    property?: string;
    content: string;
  }>;
}

/**
 * PageMetadata Component
 *
 * React 19: Declarative metadata in components
 *
 * @example
 * ```tsx
 * <PageMetadata
 *   title="Users"
 *   description="Manage your users efficiently"
 *   ogImage="/images/users-og.jpg"
 * />
 * ```
 */
export const PageMetadata = ({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website',
  twitterCard = 'summary',
  canonicalUrl,
  keywords,
  robots = 'index,follow',
  customMeta,
}: PageMetadataProps) => {
  const fullTitle = `${title} | User Management`;
  const finalOgTitle = ogTitle || title;
  const finalOgDescription = ogDescription || description;

  return (
    <>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={robots} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={finalOgTitle} />
      {finalOgDescription && <meta property="og:description" content={finalOgDescription} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={finalOgTitle} />
      {finalOgDescription && <meta name="twitter:description" content={finalOgDescription} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Custom Meta Tags */}
      {customMeta?.map((meta, index) => (
        <meta
          key={index}
          {...(meta.name ? { name: meta.name } : {})}
          {...(meta.property ? { property: meta.property } : {})}
          content={meta.content}
        />
      ))}
    </>
  );
};

/**
 * Metadata presets for common pages
 */
export const MetadataPresets = {
  dashboard: {
    title: 'Dashboard',
    description: 'Overview of your user management system',
    keywords: 'dashboard, analytics, user management, overview',
  },
  users: {
    title: 'Users',
    description: 'Manage your users efficiently with advanced filtering and search',
    keywords: 'users, user management, user list, user administration',
  },
  profile: {
    title: 'Profile',
    description: 'View and edit your profile information',
    keywords: 'profile, user profile, account settings',
  },
  settings: {
    title: 'Settings',
    description: 'Configure your application settings and preferences',
    keywords: 'settings, preferences, configuration',
  },
  admin: {
    title: 'Admin Dashboard',
    description: 'Administrative controls and system management',
    keywords: 'admin, administration, system management',
  },
} as const;

/**
 * Hook for dynamic metadata generation
 * Useful when metadata depends on fetched data
 *
 * @example
 * ```tsx
 * const UserProfilePage = ({ userId }: { userId: string }) => {
 *   const user = use(fetchUser(userId));
 *
 *   return (
 *     <>
 *       <PageMetadata
 *         title={user.name}
 *         description={`${user.name}'s profile`}
 *         ogImage={user.avatar}
 *       />
 *       <UserProfile user={user} />
 *     </>
 *   );
 * };
 * ```
 */
// eslint-disable-next-line react-refresh/only-export-components
export const usePageMetadata = (metadata: PageMetadataProps) =>
  // React 19: Metadata is reactive to state changes
  // No need for useEffect - React handles updates automatically
  metadata;
