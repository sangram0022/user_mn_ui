import React from 'react';

interface SkeletonProps { className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: number | string;
  height?: number | string; }

export const Skeleton: React.FC<SkeletonProps> = ({ className = '',
  variant = 'text',
  width,
  height, }) => {
  const style: React.CSSProperties = {};

  if (width) {
    style.width = typeof width === 'number' ? `${width}px` : width;
  }

  if (height) {
    style.height = typeof height === 'number' ? `${height}px` : height;
  }

  const variantClasses = { text: 'h-4 rounded-md',
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
  } as const;

  return (
    <span
      className={`animate-pulse bg-slate-200 ${variantClasses[variant]} ${className}`.trim()}
      style={style}
      aria-hidden="true"
      data-testid="skeleton"
    />
  );
};

interface PageSkeletonProps { heading?: string;
  descriptionLines?: number;
  actionCount?: number; }

export const PageSkeleton: React.FC<PageSkeletonProps> = ({ heading = 'Loading content',
  descriptionLines = 3,
  actionCount = 2, }) => {
  return (
    <section className="min-h-[50vh] px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">{heading}</p>
          <div className="space-y-3">
            <Skeleton variant="text" className="w-64 h-8" />
            {Array.from({ length: descriptionLines }).map((_, index) => (
              <Skeleton key={index} variant="text" className="w-full h-4" />
            ))}
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: actionCount }).map((_, index) => (
            <div key={index} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <Skeleton variant="text" className="mb-4 h-6 w-52" />
              <div className="space-y-2">
                <Skeleton variant="text" className="h-4 w-full" />
                <Skeleton variant="text" className="h-4 w-3/4" />
                <Skeleton variant="text" className="h-4 w-2/3" />
              </div>
              <Skeleton variant="rectangular" className="mt-6 h-10 w-32" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

interface TableSkeletonProps { columns?: number;
  rows?: number; }

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ columns = 4, rows = 5 }) => { return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="grid grid-cols-1 gap-3 border-b border-slate-200 bg-slate-50 p-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} variant="text" className="h-4 w-3/4" />
        ))}
      </div>
      <div className="divide-y divide-slate-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid gap-3 px-4 py-3 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={`${rowIndex}-${colIndex}`} variant="text" className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-8 px-6 py-10">
    <Skeleton variant="text" className="h-10 w-48" />
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <Skeleton variant="rectangular" className="mb-4 h-12 w-12 rounded-full" />
          <Skeleton variant="text" className="mb-2 h-5 w-32" />
          <Skeleton variant="text" className="h-4 w-24" />
        </div>
      ))}
    </div>
    <TableSkeleton rows={4} />
  </div>
);

export default Skeleton;
