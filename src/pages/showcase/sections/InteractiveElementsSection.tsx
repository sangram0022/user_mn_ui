import { Button } from '@/components';
import Badge from '@/components/Badge';
import Card from '@/components/Card';
import { typographyVariants } from '@/design-system/variants';
import { showcaseData } from '../data/showcaseData';

export function InteractiveElementsSection() {
  return (
    <Card className="space-y-6">
      <h2 className={`${typographyVariants.headings.h2} border-b-2 border-purple-500 pb-4`}>
        Interactive Elements
      </h2>
      
      <div className="space-y-8">
        <div>
          <h3 className="text-xl font-semibold mb-4">Button Variants</h3>
          <div className="flex flex-wrap gap-3 mb-6">
            {showcaseData.buttons.map(({variant, label}) => (
              <Button key={variant} variant={variant} size="md">
                {label}
              </Button>
            ))}
          </div>
          
          <h4 className="text-lg font-semibold mb-3">Button Sizes</h4>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="md">Medium</Button>
            <Button variant="primary" size="lg">Large</Button>
            <Button variant="primary" size="xl">Extra Large</Button>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Badge Collection</h3>
          <div className="flex flex-wrap gap-3">
            {showcaseData.badges.map(({variant, label}) => (
              <Badge key={variant} variant={variant}>
                {label}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
