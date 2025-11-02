/**
 * PostCSS Configuration
 * 
 * Optimizations:
 * - Tailwind CSS processing
 * - Autoprefixer for browser compatibility
 * - cssnano for production minification (reduces CSS by ~50%)
 */

export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
    // Enable cssnano in production for aggressive CSS minification
    ...(process.env.NODE_ENV === 'production'
      ? {
          cssnano: {
            preset: [
              'default',
              {
                // Remove all comments
                discardComments: {
                  removeAll: true,
                },
                // Normalize whitespace
                normalizeWhitespace: true,
                // Minify font values
                minifyFontValues: true,
                // Minify gradients
                minifyGradients: true,
                // Minify selectors
                minifySelectors: true,
                // Merge rules
                mergeRules: true,
                // Convert values to shorter forms
                convertValues: true,
                // Reduce initial values
                reduceInitial: true,
                // Remove duplicates
                discardDuplicates: true,
                // Remove empty rules
                discardEmpty: true,
                // Normalize unicode
                normalizeUnicode: true,
                // Normalize display values
                normalizeDisplayValues: true,
                // Normalize positions
                normalizePositions: true,
                // Normalize repeat styles
                normalizeRepeatStyle: true,
                // Normalize strings
                normalizeString: true,
                // Normalize timing functions
                normalizeTimingFunctions: true,
                // Merge longhand properties
                mergeLonghand: true,
                // Ordered values
                orderedValues: true,
                // Unique selectors
                uniqueSelectors: true,
              },
            ],
          },
        }
      : {}),
  },
};
