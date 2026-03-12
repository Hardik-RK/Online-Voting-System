import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Lock, Fingerprint, Key, Database, Server, Globe, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../AuthContext';

export const SecurityPage: React.FC = () => {
  const { t } = useAuth();

  const features = [
    {
      title: t('security.features.encryption.title'),
      description: t('security.features.encryption.desc'),
      icon: Lock,
      image: 'https://picsum.photos/seed/encryption/800/600',
      color: 'bg-blue-500/10 text-blue-500'
    },
    {
      title: t('security.features.ledger.title'),
      description: t('security.features.ledger.desc'),
      icon: Database,
      image: 'https://picsum.photos/seed/blockchain/800/600',
      color: 'bg-teal-500/10 text-teal-500'
    },
    {
      title: t('security.features.identity.title'),
      description: t('security.features.identity.desc'),
      icon: Fingerprint,
      image: 'https://picsum.photos/seed/identity/800/600',
      color: 'bg-indigo-500/10 text-indigo-500'
    },
    {
      title: t('security.features.privacy.title'),
      description: t('security.features.privacy.desc'),
      icon: EyeOff,
      image: 'https://picsum.photos/seed/privacy/800/600',
      color: 'bg-emerald-500/10 text-emerald-500'
    }
  ];

  return (
    <div className="space-y-16">
      <header className="max-w-3xl">
        <h2 className="text-4xl font-bold tracking-tight text-text-main">{t('security.title')}</h2>
        <p className="text-text-muted mt-4 text-lg">
          {t('security.subtitle')}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group"
          >
            <div className="relative h-64 mb-8 overflow-hidden rounded-[2.5rem] shadow-lg border border-border-main">
              <img 
                src={feature.image} 
                alt={feature.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-8 flex items-center gap-3">
                <div className={`p-2 rounded-xl ${feature.color} bg-white/10 backdrop-blur-md`}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">{feature.title}</h3>
              </div>
            </div>
            <p className="text-text-muted leading-relaxed px-2">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="bg-bg-card p-12 rounded-[3rem] border border-border-main shadow-sm">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1 space-y-6">
            <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-500 w-fit">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-3xl font-bold text-text-main">{t('security.audit.title')}</h3>
            <p className="text-text-muted leading-relaxed">
              {t('security.audit.desc')}
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-bg-main rounded-full text-xs font-bold uppercase tracking-widest text-text-muted">
                <Server className="w-4 h-4" /> {t('security.audit.nodes')}
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-bg-main rounded-full text-xs font-bold uppercase tracking-widest text-text-muted">
                <Globe className="w-4 h-4" /> {t('security.audit.global')}
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-bg-main rounded-full text-xs font-bold uppercase tracking-widest text-text-muted">
                <Key className="w-4 h-4" /> {t('security.audit.keys')}
              </div>
            </div>
          </div>
          <div className="flex-1 w-full">
            <img 
              src="https://picsum.photos/seed/security_tech/800/600" 
              alt="Security Infrastructure"
              className="w-full rounded-[2.5rem] shadow-2xl border border-border-main"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
