import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Globe, ArrowRight } from 'lucide-react';
import { useAuth } from '../AuthContext';

interface LandingPageProps {
  onGetStarted: () => void;
  onLearnMore: () => void;
  onRegister: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLearnMore, onRegister }) => {
  const { t } = useAuth();
  return (
    <div className="flex flex-col items-center">
      <section className="w-full py-20 flex flex-col items-center text-center min-h-[80vh] justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-text-muted mb-4 block">
            {t('landing.tagline')}
          </span>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] mb-8 text-text-main">
            {t('landing.title')} <br />
            <span className="italic font-serif font-light text-brand-primary">{t('landing.unstoppable')}</span>
          </h1>
          <p className="text-xl text-text-muted mb-10 max-w-xl mx-auto">
            {t('landing.description')}
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="group relative flex items-center gap-3 bg-brand-primary text-white px-8 py-4 rounded-full font-medium overflow-hidden transition-all hover:pr-12"
            >
              <span>{t('landing.getStarted')}</span>
              <ArrowRight className="w-5 h-5 absolute right-4 opacity-0 group-hover:opacity-100 transition-all" />
            </button>
            <button
              onClick={onLearnMore}
              className="px-8 py-4 rounded-full font-medium border border-border-main text-text-main hover:bg-bg-card transition-all"
            >
              {t('landing.learnMore')}
            </button>
            <button
              onClick={onRegister}
              className="px-8 py-4 rounded-full font-medium bg-bg-card text-text-main border border-border-main hover:border-brand-primary transition-all"
            >
              {t('landing.register')}
            </button>
          </div>
        </motion.div>
      </section>

      <section className="w-full py-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl">
        <FeatureCard 
          icon={<Shield className="w-6 h-6 text-brand-primary" />}
          title={t('landing.features.verifiable.title')}
          description={t('landing.features.verifiable.desc')}
        />
        <FeatureCard 
          icon={<Lock className="w-6 h-6 text-brand-primary" />}
          title={t('landing.features.immutable.title')}
          description={t('landing.features.immutable.desc')}
        />
        <FeatureCard 
          icon={<Globe className="w-6 h-6 text-brand-primary" />}
          title={t('landing.features.access.title')}
          description={t('landing.features.access.desc')}
        />
      </section>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="p-8 bg-bg-card rounded-[2rem] border border-border-main shadow-sm"
  >
    <div className="w-12 h-12 bg-bg-main rounded-2xl flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3 text-text-main">{title}</h3>
    <p className="text-text-muted text-sm leading-relaxed">{description}</p>
  </motion.div>
);
