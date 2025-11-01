import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTE_PATHS } from '../../../core/routing/routes';
import Button from '../../../shared/components/ui/Button';
import Card from '../../../shared/components/ui/Card';
import { animationUtils } from '../../../design-system/variants';

export default function HomePage() {
  const { t } = useTranslation('home');

  const features = [
    { icon: '🚀', title: t('homePage.features.items.lightningFast.title'), description: t('homePage.features.items.lightningFast.description') },
    { icon: '🔒', title: t('homePage.features.items.secure.title'), description: t('homePage.features.items.secure.description') },
    { icon: '📱', title: t('homePage.features.items.responsive.title'), description: t('homePage.features.items.responsive.description') },
    { icon: '🎨', title: t('homePage.features.items.modernDesign.title'), description: t('homePage.features.items.modernDesign.description') },
    { icon: '⚡', title: t('homePage.features.items.realtime.title'), description: t('homePage.features.items.realtime.description') },
    { icon: '🔧', title: t('homePage.features.items.customizable.title'), description: t('homePage.features.items.customizable.description') },
  ];

  const stats = [
    { value: t('homePage.stats.activeUsers.value'), label: t('homePage.stats.activeUsers.label') },
    { value: t('homePage.stats.uptime.value'), label: t('homePage.stats.uptime.label') },
    { value: t('homePage.stats.support.value'), label: t('homePage.stats.support.label') },
    { value: t('homePage.stats.countries.value'), label: t('homePage.stats.countries.label') },
  ];
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium animate-pulse-slow">
              <span className="inline-block w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></span>
              {t('homePage.hero.badge')}
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-center mb-6 animate-slide-up">
            {t('homePage.hero.title')}
            <br />
            <span className="text-yellow-300">{t('homePage.hero.titleHighlight')}</span>
          </h1>

          <p className="text-xl md:text-2xl text-center text-white/90 mb-8 max-w-3xl mx-auto animate-slide-up animate-stagger-1">
            {t('homePage.hero.subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up animate-stagger-2">
            <Link to={ROUTE_PATHS.REGISTER}>
              <Button variant="secondary" size="lg" className="bg-white text-purple-600 hover:bg-gray-100 shadow-2xl">
                {t('homePage.hero.ctaPrimary')}
              </Button>
            </Link>
            <Link to="/showcase">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                {t('homePage.hero.ctaSecondary')}
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-scale-in animate-stagger-3">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-white/80 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">{t('homePage.features.title')}</h2>
            <p className="text-xl text-gray-600">{t('homePage.features.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} hover className={`group ${animationUtils.withStagger('animate-slide-up', index)}`}>
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">{t('homePage.cta.title')}</h2>
          <p className="text-xl mb-8 text-white/90">
            {t('homePage.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={ROUTE_PATHS.REGISTER}>
              <Button size="xl" className="bg-white text-purple-600 hover:bg-gray-100">
                {t('homePage.cta.ctaPrimary')}
              </Button>
            </Link>
            <Link to={ROUTE_PATHS.LOGIN}>
              <Button variant="outline" size="xl" className="border-white text-white hover:bg-white/10">
                {t('homePage.cta.ctaSecondary')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
