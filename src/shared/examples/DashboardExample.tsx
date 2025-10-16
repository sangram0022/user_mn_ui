/**
 * Example Dashboard Component
 *
 * Demonstrates the new CSS architecture:
 * - Zero inline styles
 * - Layout compositions
 * - Design tokens
 * - Dark mode support
 * - Polymorphic components
 */

import { Button, ButtonGroup } from '@shared/components/ui/Button/Button';
import { AlertCircle, CheckCircle, TrendingUp, Users } from 'lucide-react';
import { type FC } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  variant?: 'primary' | 'success' | 'warning' | 'error';
}

const StatCard: FC<StatCardProps> = ({ title, value, icon, trend, variant = 'primary' }) => {
  return (
    <div className="card" data-variant={variant}>
      <div className="card-body">
        {/* Using Cluster for horizontal layout */}
        <div className="cluster" data-align="between">
          <div className="stack" data-gap="xs">
            <h3 className="text-sm font-medium text-secondary">{title}</h3>
            <p className="text-3xl font-bold">{value}</p>
            {trend !== undefined && (
              <div className="cluster" data-gap="xs">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-sm text-success">+{trend}%</span>
              </div>
            )}
          </div>
          <div className="text-primary">{icon}</div>
        </div>
      </div>
    </div>
  );
};

export const DashboardExample: FC = () => {
  return (
    // Container with max-width
    <div className="container" data-size="xl">
      {/* Vertical spacing */}
      <div className="stack" data-gap="lg">
        {/* Header section */}
        <div className="cluster" data-align="between">
          <div className="stack" data-gap="xs">
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <p className="text-secondary">Welcome back! Here's what's happening.</p>
          </div>

          {/* Button group */}
          <ButtonGroup>
            <Button variant="outline" size="md">
              Export
            </Button>
            <Button variant="primary" size="md">
              Create Report
            </Button>
          </ButtonGroup>
        </div>

        {/* Stats grid - automatically responsive */}
        <div className="auto-grid" data-gap="md" data-columns="4">
          <StatCard
            title="Total Users"
            value="12,345"
            icon={<Users className="w-8 h-8" />}
            trend={12.5}
            variant="primary"
          />
          <StatCard
            title="Active Sessions"
            value="1,234"
            icon={<CheckCircle className="w-8 h-8" />}
            trend={5.2}
            variant="success"
          />
          <StatCard
            title="Pending"
            value="45"
            icon={<AlertCircle className="w-8 h-8" />}
            variant="warning"
          />
          <StatCard
            title="Success Rate"
            value="98.5%"
            icon={<TrendingUp className="w-8 h-8" />}
            trend={2.1}
            variant="success"
          />
        </div>

        {/* Two column layout */}
        <div className="with-sidebar">
          <aside className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold">Recent Activity</h2>
            </div>
            <div className="card-body">
              <div className="stack" data-gap="sm">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="cluster" data-gap="sm">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-sm">Activity item {i}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <main className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold">Main Content</h2>
            </div>
            <div className="card-body">
              <div className="stack" data-gap="md">
                <p>This is an example of the new CSS architecture. Notice how we're using:</p>
                <ul className="list-disc list-inside stack" data-gap="xs">
                  <li>Layout compositions (stack, cluster, auto-grid)</li>
                  <li>Design tokens for colors and spacing</li>
                  <li>Component classes (card, btn)</li>
                  <li>Data attributes for variants</li>
                  <li>Zero inline styles</li>
                </ul>
              </div>
            </div>
          </main>
        </div>

        {/* Centered call-to-action */}
        <div className="center" data-text data-intrinsic>
          <div className="stack" data-gap="md">
            <h2 className="text-2xl font-bold">Ready to get started?</h2>
            <p className="text-secondary">Join thousands of developers using our platform</p>
            <ButtonGroup>
              <Button variant="primary" size="lg">
                Get Started
              </Button>
              <Button variant="outline" size="lg" as="a" href="/learn-more">
                Learn More
              </Button>
            </ButtonGroup>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * CSS for this component (in separate file)
 *
 * Notice: No component-specific styles needed!
 * Everything uses design system tokens and compositions.
 *
 * Optional custom styles:
 */

// In component.css (if needed)
/*
@layer components {
  .dashboard-stat-icon {
    width: var(--size-icon-xl);
    height: var(--size-icon-xl);
    color: rgb(var(--color-brand-primary));
  }

  .dashboard-stat-icon[data-variant="success"] {
    color: rgb(var(--color-success-solid));
  }

  .dashboard-stat-icon[data-variant="warning"] {
    color: rgb(var(--color-warning-solid));
  }

  .dashboard-stat-icon[data-variant="error"] {
    color: rgb(var(--color-error-solid));
  }

  / * Dark mode automatically handled by tokens! * /
}
*/

/**
 * Benefits Demonstrated:
 *
 * 1. ✅ Zero inline styles
 * 2. ✅ Composition-based layouts
 * 3. ✅ Automatic dark mode
 * 4. ✅ Responsive by default
 * 5. ✅ Accessible structure
 * 6. ✅ Easy to maintain
 * 7. ✅ Type-safe components
 * 8. ✅ Performance optimized
 */
