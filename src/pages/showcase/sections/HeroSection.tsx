import Badge from '@/components/Badge';
import { typographyVariants } from '@/design-system/variants';

export function HeroSection() {
  return (
    <section className="text-center space-y-6">
      <h1 className={`${typographyVariants.headings.h1} text-gradient`}>
        HTML Elements Showcase
      </h1>
      <p className={`${typographyVariants.body.xl} text-gray-600 max-w-3xl mx-auto`}>
        Comprehensive showcase of all HTML elements styled with Tailwind CSS v4.1.16 
        using our modern design system approach
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Badge variant="info">Tailwind v4.1.16</Badge>
        <Badge variant="success">React 19</Badge>
        <Badge variant="secondary">Vite 6</Badge>
        <Badge variant="primary">TypeScript</Badge>
      </div>
    </section>
  );
}
