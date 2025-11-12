/**
 * RoleFilters Component
 * Filters for role list (search, level, sorting)
 */

interface RoleFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  levelFilter: { min?: number; max?: number };
  onLevelFilterChange: (filter: { min?: number; max?: number }) => void;
  sortField: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: string) => void;
}

export default function RoleFilters({
  searchTerm,
  onSearchChange,
  levelFilter,
  onLevelFilterChange,
  sortField,
  sortOrder,
  onSortChange,
}: RoleFiltersProps) {
  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Search */}
      <div>
        <label htmlFor="search" className="mb-1 block text-sm font-medium">
          Search
        </label>
        <input
          id="search"
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Role name or display name..."
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      {/* Min Level */}
      <div>
        <label htmlFor="min-level" className="mb-1 block text-sm font-medium">
          Min Level
        </label>
        <input
          id="min-level"
          type="number"
          min="0"
          max="100"
          value={levelFilter.min ?? ''}
          onChange={(e) =>
            onLevelFilterChange({
              ...levelFilter,
              min: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          placeholder="0"
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      {/* Max Level */}
      <div>
        <label htmlFor="max-level" className="mb-1 block text-sm font-medium">
          Max Level
        </label>
        <input
          id="max-level"
          type="number"
          min="0"
          max="100"
          value={levelFilter.max ?? ''}
          onChange={(e) =>
            onLevelFilterChange({
              ...levelFilter,
              max: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          placeholder="100"
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      {/* Sort */}
      <div>
        <label htmlFor="sort" className="mb-1 block text-sm font-medium">
          Sort By
        </label>
        <select
          id="sort"
          value={`${sortField}-${sortOrder}`}
          onChange={(e) => {
            const [field] = e.target.value.split('-');
            onSortChange(field);
          }}
          className="w-full rounded border border-gray-300 px-3 py-2"
        >
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="level-asc">Level (Low-High)</option>
          <option value="level-desc">Level (High-Low)</option>
        </select>
      </div>
    </div>
  );
}
