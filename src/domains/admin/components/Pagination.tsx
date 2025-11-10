/**
 * Pagination Component
 * Reusable pagination UI
 */

import Button from '@/shared/components/ui/Button';

interface PaginationData {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_prev: boolean;
  has_next: boolean;
}

interface PaginationProps {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
}

export default function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, page_size, total_items, has_prev, has_next } = pagination;

  const startItem = (page - 1) * page_size + 1;
  const endItem = Math.min(page * page_size, total_items);

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">
      <span className="text-sm text-gray-700">
        Showing {startItem} to {endItem} of {total_items} results
      </span>
      <div className="flex gap-2">
        <Button
          onClick={() => onPageChange(page - 1)}
          disabled={!has_prev}
          variant="outline"
          size="sm"
        >
          Previous
        </Button>
        <Button
          onClick={() => onPageChange(page + 1)}
          disabled={!has_next}
          variant="outline"
          size="sm"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
