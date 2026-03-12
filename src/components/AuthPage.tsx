import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Vote, Lock, Mail } from 'lucide-react';
import { useAuth } from '../AuthContext';

interface AuthPageProps {
  isRegister?: boolean;
}

export const AuthPage: React.FC<AuthPageProps> = ({ isRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, t } = useAuth();

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      // Mock registration
      login(email);
      return;
    }
    const validEmails = ['admin@a.com', 'voter1@v.com', 'voter2@v.com'];
    
    if (validEmails.includes(email) && password === 'q') {
      login(email);
    } else {
      const errorMsg = t('auth.error');
      setError(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-card w-full max-w-5xl rounded-[2.5rem] shadow-2xl border border-border-main overflow-hidden flex flex-col lg:flex-row"
      >
        {/* Branding Side */}
        <div className="lg:w-1/2 bg-brand-primary p-12 flex flex-col justify-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8">
              <Vote className="text-white w-8 h-8" />
            </div>
            <h2 className="text-4xl font-black tracking-tighter mb-4">VeriVote</h2>
            <p className="text-white/80 text-lg font-medium leading-relaxed max-w-sm">
              {isRegister ? t('landing.hero.subtitle') : t('auth.subtitle')}
            </p>
            
            <div className="mt-12 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold">{t('landing.features.secure.title')}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold">{t('landing.features.transparent.title')}</span>
              </div>
            </div>
          </div>
          
          {/* Decorative circles */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        </div>

        {/* Form Side */}
        <div className="lg:w-1/2 p-12 lg:p-16">
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-text-main">
              {isRegister ? t('landing.register') : t('auth.title')}
            </h1>
            <p className="text-text-muted text-sm mt-2">
              {isRegister ? t('auth.subtitle') : t('auth.subtitle')}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted ml-1">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted opacity-20" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-border-main bg-bg-main text-text-main focus:border-brand-primary outline-none transition-colors"
                  placeholder="admin@a.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted ml-1">{t('auth.password')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted opacity-20" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-border-main bg-bg-main text-text-main focus:border-brand-primary outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <p className="text-rose-500 text-xs font-medium bg-rose-50 p-3 rounded-xl border border-rose-100">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-brand-primary text-white rounded-2xl font-bold text-sm hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/20"
            >
              {isRegister ? t('landing.register') : t('auth.signIn')}
            </button>
          </form>

          {!isRegister && (
            <div className="mt-8 pt-8 border-t border-border-main">
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mb-4">
                {t('auth.demoAccounts')}
              </p>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { email: 'admin@a.com', label: 'Admin Access' },
                  { email: 'voter1@v.com', label: 'Voter 1' },
                  { email: 'voter2@v.com', label: 'Voter 2' }
                ].map((account) => (
                  <button
                    key={account.email}
                    onClick={() => {
                      setEmail(account.email);
                      setPassword('q');
                      setTimeout(() => login(account.email), 100);
                    }}
                    className="w-full py-3 px-4 bg-bg-main hover:bg-brand-primary hover:text-white rounded-xl text-xs font-bold transition-all flex justify-between items-center group text-text-main"
                  >
                    <span>{account.label}</span>
                    <span className="opacity-40 group-hover:opacity-100">{account.email}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
