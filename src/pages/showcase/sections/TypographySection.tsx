import Card from '@/components/Card';
import { typographyVariants } from '@/design-system/variants';

export function TypographySection() {
  return (
    <Card className="space-y-8">
      <h2 className={`${typographyVariants.headings.h2} border-b-2 border-blue-500 pb-4`}>
        Typography System
      </h2>
      
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-4">Headings</h3>
          <h1 className={typographyVariants.headings.h1}>Heading 1</h1>
          <h2 className={typographyVariants.headings.h2}>Heading 2</h2>
          <h3 className={typographyVariants.headings.h3}>Heading 3</h3>
          <h4 className={typographyVariants.headings.h4}>Heading 4</h4>
          <h5 className={typographyVariants.headings.h5}>Heading 5</h5>
          <h6 className={typographyVariants.headings.h6}>Heading 6</h6>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-4">Text Elements</h3>
          <p className={typographyVariants.body.base}>
            This is a <strong>paragraph</strong> with <em>emphasized text</em> and{' '}
            <mark className="bg-yellow-200 px-1 rounded">highlighted content</mark>.
          </p>
          <p className={typographyVariants.body.sm}>
            <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
              Inline code example
            </code>
          </p>
          <blockquote className="border-l-4 border-blue-500 pl-6 italic text-gray-700 bg-blue-50 p-4 rounded-r-lg">
            "Design is not just what it looks like and feels like. Design is how it works."
            <cite className="block text-sm text-gray-500 mt-2">— Steve Jobs</cite>
          </blockquote>
        </div>
      </div>
    </Card>
  );
}
