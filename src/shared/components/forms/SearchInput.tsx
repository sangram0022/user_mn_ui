/**
 * SearchInput Component with React 19 Features
 * - useTransition for non-urgent updates
 * - useDeferredValue for expensive filtering
 * 
 * React 19 Optimizations:
 * - Immediate UI feedback with transitions
 * - Deferred expensive computations
 * - Smooth user experience during filtering
 */

import { useState, useDeferredValue, useTransition, type ChangeEvent } from 'react';
import Input from '../ui/Input';

interface SearchInputProps<T> {
  data: T[];
  onFilteredResults: (results: T[]) => void;
  filterFn: (item: T, query: string) => boolean;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export function SearchInput<T>({
  data,
  onFilteredResults,
  filterFn,
  placeholder = 'Search...',
  className = '',
}: SearchInputProps<T>) {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  
  // React 19: Defer expensive computation
  const deferredQuery = useDeferredValue(query);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value); // Immediate UI update

    // React 19: Mark filtering as non-urgent transition
    startTransition(() => {
      const filtered = data.filter(item => filterFn(item, value));
      onFilteredResults(filtered);
    });
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Input
          type="search"
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-4"
          aria-label="Search"
          aria-busy={isPending}
        />
        {/* Search icon */}
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        {/* Loading spinner - shown during transition */}
        {isPending && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Search feedback */}
      {deferredQuery && (
        <p className="mt-2 text-sm text-gray-600">
          {isPending ? (
            <span className="text-blue-600">Searching for "{deferredQuery}"...</span>
          ) : (
            <span>Showing results for "{deferredQuery}"</span>
          )}
        </p>
      )}
    </div>
  );
}

// ========================================
// Advanced Search with Multiple Filters
// ========================================

interface FilterOption {
  id: string;
  label: string;
  value: string;
}

interface AdvancedSearchProps<T> {
  data: T[];
  onFilteredResults: (results: T[]) => void;
  searchFilterFn: (item: T, query: string) => boolean;
  additionalFilters?: {
    id: string;
    label: string;
    options: FilterOption[];
    filterFn: (item: T, value: string) => boolean;
  }[];
  placeholder?: string;
  className?: string;
}

export function AdvancedSearch<T>({
  data,
  onFilteredResults,
  searchFilterFn,
  additionalFilters = [],
  placeholder = 'Search...',
  className = '',
}: AdvancedSearchProps<T>) {
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  
  // React 19: Defer query for smooth UI
  const deferredQuery = useDeferredValue(query);

  const applyFilters = (searchQuery: string, filters: Record<string, string>) => {
    startTransition(() => {
      let results = data;

      // Apply search query
      if (searchQuery) {
        results = results.filter(item => searchFilterFn(item, searchQuery));
      }

      // Apply additional filters
      Object.entries(filters).forEach(([filterId, value]) => {
        if (value) {
          const filter = additionalFilters.find(f => f.id === filterId);
          if (filter) {
            results = results.filter(item => filter.filterFn(item, value));
          }
        }
      });

      onFilteredResults(results);
    });
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    applyFilters(value, activeFilters);
  };

  const handleFilterChange = (filterId: string, value: string) => {
    const newFilters = { ...activeFilters, [filterId]: value };
    setActiveFilters(newFilters);
    applyFilters(query, newFilters);
  };

  const clearFilters = () => {
    setQuery('');
    setActiveFilters({});
    startTransition(() => {
      onFilteredResults(data);
    });
  };

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Input
          type="search"
          value={query}
          onChange={handleSearchChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-4"
          aria-label="Search"
          aria-busy={isPending}
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {isPending && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Additional Filters */}
      {additionalFilters.length > 0 && (
        <div className="flex flex-wrap gap-4 items-center">
          {additionalFilters.map(filter => (
            <div key={filter.id} className="min-w-[150px]">
              <select
                value={activeFilters[filter.id] || ''}
                onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={filter.label}
              >
                <option value="">{filter.label}</option>
                {filter.options.map(option => (
                  <option key={option.id} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {/* Clear Filters Button */}
          {(activeFilterCount > 0 || query) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              aria-label="Clear all filters"
            >
              Clear {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
          )}
        </div>
      )}

      {/* Status Message */}
      {(deferredQuery || activeFilterCount > 0) && (
        <div className="text-sm text-gray-600" role="status" aria-live="polite">
          {isPending ? (
            <span className="text-blue-600">Filtering results...</span>
          ) : (
            <span>
              Showing filtered results
              {deferredQuery && ` for "${deferredQuery}"`}
              {activeFilterCount > 0 && ` with ${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''}`}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
