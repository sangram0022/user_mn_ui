import type { FC } from 'react';

interface Props {
  searchTerm: string;
  onSearchChange: (v: string) => void;
  sortBy: 'name' | 'level' | 'users' | 'updated';
  onSortChange: (v: 'name' | 'level' | 'users' | 'updated') => void;
}

const RolesFilters: FC<Props> = ({ searchTerm, onSearchChange, sortBy, onSortChange }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Roles Overview</h2>
        <div className="text-sm text-gray-600">{/* count displayed in parent */}</div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-64">
          <input
            type="text"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as Props['sortBy'])}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="level">Sort by Level</option>
            <option value="name">Sort by Name</option>
            <option value="users">Sort by User Count</option>
            <option value="updated">Sort by Updated</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default RolesFilters;
