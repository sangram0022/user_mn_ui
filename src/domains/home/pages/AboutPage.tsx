import { useTranslation } from 'react-i18next';
import Card from '../../../shared/components/ui/Card';
import Badge from '../../../shared/components/ui/Badge';
import { typographyVariants } from '../../../design-system/variants';

export default function AboutPage() {
  const { t } = useTranslation('home');

  const technologies = [
    { name: t('aboutPage.technologyStack.technologies.react.name'), badge: t('aboutPage.technologyStack.technologies.react.badge'), icon: '⚛️' },
    { name: t('aboutPage.technologyStack.technologies.typescript.name'), badge: t('aboutPage.technologyStack.technologies.typescript.badge'), icon: '📘' },
    { name: t('aboutPage.technologyStack.technologies.reactRouter.name'), badge: t('aboutPage.technologyStack.technologies.reactRouter.badge'), icon: '🛣️' },
    { name: t('aboutPage.technologyStack.technologies.reactQuery.name'), badge: t('aboutPage.technologyStack.technologies.reactQuery.badge'), icon: '🔄' },
    { name: t('aboutPage.technologyStack.technologies.zustand.name'), badge: t('aboutPage.technologyStack.technologies.zustand.badge'), icon: '🐻' },
    { name: t('aboutPage.technologyStack.technologies.i18next.name'), badge: t('aboutPage.technologyStack.technologies.i18next.badge'), icon: '🌍' },
    { name: t('aboutPage.technologyStack.technologies.tailwind.name'), badge: t('aboutPage.technologyStack.technologies.tailwind.badge'), icon: '🎨' },
    { name: t('aboutPage.technologyStack.technologies.vite.name'), badge: t('aboutPage.technologyStack.technologies.vite.badge'), icon: '⚡' },
  ];

  const features = [
    { title: t('aboutPage.features.items.secureAuth.title'), description: t('aboutPage.features.items.secureAuth.description'), icon: '🔐', color: 'success' },
    { title: t('aboutPage.features.items.rbac.title'), description: t('aboutPage.features.items.rbac.description'), icon: '👥', color: 'primary' },
    { title: t('aboutPage.features.items.userManagement.title'), description: t('aboutPage.features.items.userManagement.description'), icon: '⚙️', color: 'info' },
    { title: t('aboutPage.features.items.auditLogging.title'), description: t('aboutPage.features.items.auditLogging.description'), icon: '📝', color: 'warning' },
    { title: t('aboutPage.features.items.gdpr.title'), description: t('aboutPage.features.items.gdpr.description'), icon: '🔒', color: 'success' },
    { title: t('aboutPage.features.items.monitoring.title'), description: t('aboutPage.features.items.monitoring.description'), icon: '📊', color: 'primary' },
    { title: t('aboutPage.features.items.multiLanguage.title'), description: t('aboutPage.features.items.multiLanguage.description'), icon: '🗣️', color: 'info' },
    { title: t('aboutPage.features.items.darkMode.title'), description: t('aboutPage.features.items.darkMode.description'), icon: '🌙', color: 'secondary' },
  ];

  const principles = [
    t('aboutPage.architecture.principles.ddd'),
    t('aboutPage.architecture.principles.sot'),
    t('aboutPage.architecture.principles.dry'),
    t('aboutPage.architecture.principles.apiMapping'),
    t('aboutPage.architecture.principles.verticalSlice'),
  ];

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16 animate-fade-in">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl mb-4 shadow-2xl shadow-purple-500/30 animate-scale-in">
          <span className="text-4xl">🚀</span>
        </div>
        <h1 className={`${typographyVariants.headings.h1} text-gradient`}>
          {t('aboutPage.title')}
        </h1>
        <p className={`${typographyVariants.body.xl} text-gray-600 max-w-3xl mx-auto`}>
          {t('aboutPage.subtitle')}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Badge variant="success">{t('aboutPage.badges.productionReady')}</Badge>
          <Badge variant="primary">{t('aboutPage.badges.typeSafe')}</Badge>
          <Badge variant="info">{t('aboutPage.badges.cloudNative')}</Badge>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className={`${typographyVariants.headings.h2}`}>{t('aboutPage.technologyStack.title')}</h2>
          <p className={`${typographyVariants.body.lg} text-gray-600 mt-4`}>
            {t('aboutPage.technologyStack.subtitle')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {technologies.map((tech, index) => (
            <Card 
              key={tech.name} 
              hover 
              className={`text-center group animate-slide-up animate-stagger-${index % 4 + 1}`}
            >
              <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                {tech.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-brand-primary transition-colors">
                {tech.name}
              </h3>
              <Badge variant="secondary" className="text-xs">
                {tech.badge}
              </Badge>
            </Card>
          ))}
        </div>
      </section>

      {/* Architecture Principles */}
      <section className="bg-linear-to-br from-blue-50 to-purple-50 rounded-3xl p-8 md:p-12 animate-slide-up">
        <div className="text-center mb-8">
          <h2 className={`${typographyVariants.headings.h2}`}>{t('aboutPage.architecture.title')}</h2>
          <p className={`${typographyVariants.body.lg} text-gray-600 mt-4`}>
            {t('aboutPage.architecture.subtitle')}
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {principles.map((principle, index) => (
            <Card key={index} className="flex items-start gap-4 group hover:shadow-lg transition-shadow">
              <div className="shrink-0 w-8 h-8 bg-linear-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold">
                {index + 1}
              </div>
              <p className="text-gray-700 pt-1 group-hover:text-gray-900 transition-colors">
                {principle}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Key Features */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className={`${typographyVariants.headings.h2}`}>{t('aboutPage.features.title')}</h2>
          <p className={`${typographyVariants.body.lg} text-gray-600 mt-4`}>
            {t('aboutPage.features.subtitle')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              hover 
              className={`group animate-slide-up animate-stagger-${index % 4 + 1}`}
            >
              <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2 group-hover:text-brand-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                {feature.description}
              </p>
              <Badge variant={feature.color as 'success' | 'primary' | 'info' | 'warning' | 'secondary'} className="text-xs">
                {feature.title}
              </Badge>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-6 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-white animate-slide-up">
        <h2 className="text-3xl font-bold">{t('aboutPage.cta.title')}</h2>
        <p className="text-lg opacity-90 max-w-2xl mx-auto">
          {t('aboutPage.cta.subtitle')}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button className="px-8 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            {t('aboutPage.cta.ctaPrimary')}
          </button>
          <button className="px-8 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/30 transition-colors border border-white/30">
            {t('aboutPage.cta.ctaSecondary')}
          </button>
        </div>
      </section>
    </div>
  );
}
