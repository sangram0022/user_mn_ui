import Button from '@/shared/components/ui/Button';
import Badge from '@/shared/components/ui/Badge';

interface UserFiltersProps {
  searchInput: string;
  setSearchInput: (value: string) => void;
  appliedSearch: string;
  roleFilter: string;
  setRoleFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  onSearch: () => void;
  onClearFilters: () => void;
  onClearSearch: () => void;
  onClearRoleFilter: () => void;
  onClearStatusFilter: () => void;
  onExport: (format: 'csv' | 'json' | 'xlsx') => void;
  isLoading: boolean;
  isExporting: boolean;
}

export function UserFilters({
  searchInput,
  setSearchInput,
  appliedSearch,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  onSearch,
  onClearFilters,
  onClearSearch,
  onClearRoleFilter,
  onClearStatusFilter,
  onExport,
  isLoading,
  isExporting,
}: UserFiltersProps) {
  const hasActiveFilters = appliedSearch || roleFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">
          Search & Filter Users
        </h3>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearFilters}
          >
            🔄 Clear All Filters
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Search - Takes 4 columns */}
        <div className="md:col-span-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Users
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              placeholder="Name, email, username..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Button 
              variant="primary" 
              size="md"
              onClick={onSearch}
              disabled={isLoading}
            >
              🔍 Search
            </Button>
          </div>
        </div>
        
        {/* Role Filter - Takes 3 columns */}
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="user">User</option>
          </select>
        </div>
        
        {/* Status Filter - Takes 3 columns */}
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        
        {/* Export Buttons - Takes 2 columns */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Export
          </label>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onExport('csv')}
              disabled={isExporting}
            >
              CSV
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onExport('json')}
              disabled={isExporting}
            >
              JSON
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onExport('xlsx')}
              disabled={isExporting}
            >
              Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Active filters:</span>
            {appliedSearch && (
              <Badge variant="info">
                Search: "{appliedSearch}"
                <button 
                  onClick={onClearSearch}
                  className="ml-2 hover:text-red-600 font-bold"
                  type="button"
                  aria-label="Clear search"
                >
                  ×
                </button>
              </Badge>
            )}
            {roleFilter !== 'all' && (
              <Badge variant="info">
                Role: {roleFilter}
                <button 
                  onClick={onClearRoleFilter}
                  className="ml-2 hover:text-red-600 font-bold"
                  type="button"
                  aria-label="Clear role filter"
                >
                  ×
                </button>
              </Badge>
            )}
            {statusFilter !== 'all' && (
              <Badge variant="info">
                Status: {statusFilter}
                <button 
                  onClick={onClearStatusFilter}
                  className="ml-2 hover:text-red-600 font-bold"
                  type="button"
                  aria-label="Clear status filter"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
