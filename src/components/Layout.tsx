import React, { useState } from 'react';
import { LogOut, Vote as VoteIcon, User, ShieldCheck, Settings, BarChart3, Shield, Sun, Moon, Accessibility, Volume2, VolumeX, Menu, X, Languages } from 'lucide-react';
import { useAuth, Language } from '../AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: 'dashboard' | 'stats' | 'security';
  onNavigate: (page: 'dashboard' | 'stats' | 'security') => void;
  onAuth: () => void;
  onHome: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate, onAuth, onHome }) => {
  const { 
    user, profile, isAdmin, logout, 
    language, setLanguage, t 
  } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = () => {
    logout();
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  const handleLogoClick = () => {
    onHome();
  };

  const navItems = [
    { id: 'dashboard', label: t('nav.elections'), icon: VoteIcon, public: false },
    { id: 'stats', label: t('nav.results'), icon: BarChart3, public: true },
    { id: 'security', label: t('nav.security'), icon: Shield, public: true },
  ] as const;

  const visibleNavItems = navItems.filter(item => item.public || user);

  return (
    <div className={`min-h-screen bg-bg-main text-text-main font-sans transition-colors duration-300`}>
      <nav className="border-b border-border-main bg-bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-8">
              <button 
                onClick={handleLogoClick}
                className="flex items-center gap-3 select-none group focus:outline-none"
              >
                <div className="p-2.5 rounded-2xl bg-brand-primary shadow-lg shadow-brand-primary/20 group-hover:scale-110 transition-transform">
                  <VoteIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-black tracking-tighter text-text-main">VeriVote</span>
              </button>

              <div className="hidden lg:flex items-center gap-1">
                {visibleNavItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id as any)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                      currentPage === item.id 
                        ? 'bg-brand-primary/10 text-brand-primary' 
                        : 'text-text-muted hover:bg-bg-main hover:text-text-main'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 mr-4 pr-4 border-r border-border-main">
                <div className="relative flex items-center gap-2 bg-bg-main px-3 py-2 rounded-xl border border-border-main">
                  <Languages className="w-4 h-4 text-text-muted" />
                  <select 
                    id="languageSelector"
                    value={language}
                    onChange={handleLanguageChange}
                    className="bg-transparent text-xs font-bold text-text-main outline-none appearance-none pr-4 cursor-pointer"
                  >
                    <option value="en">English</option>
                    <option value="ta">Tamil</option>
                    <option value="hi">Hindi</option>
                  </select>
                </div>
              </div>

              {user ? (
                <div className="flex items-center gap-4">
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-sm font-bold text-text-main">{profile?.displayName}</span>
                    <span className="text-[10px] uppercase tracking-widest font-black opacity-40 flex items-center gap-1 text-brand-secondary">
                      {isAdmin && <ShieldCheck className="w-3 h-3" />}
                      {profile?.role}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="p-2.5 bg-bg-main text-text-muted hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    title={t('nav.signOut')}
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onAuth}
                  className="px-6 py-2.5 bg-brand-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-primary/20 hover:scale-105 transition-all"
                >
                  {t('nav.signIn')}
                </button>
              )}

              <button 
                className="lg:hidden p-2.5 bg-bg-main rounded-xl"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-border-main bg-bg-card p-4 space-y-2">
            {visibleNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id as any);
                  setIsMenuOpen(false);
                }}
                className={`w-full px-5 py-4 rounded-xl text-sm font-bold transition-all flex items-center gap-3 ${
                  currentPage === item.id 
                    ? 'bg-brand-primary/10 text-brand-primary' 
                    : 'text-text-muted hover:bg-bg-main'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
            <div className="pt-4 flex gap-2">
              <div className="flex-1 bg-bg-main rounded-xl flex items-center justify-center px-4 py-3 border border-border-main">
                <Languages className="w-4 h-4 mr-2 text-text-muted" />
                <select 
                  value={language}
                  onChange={handleLanguageChange}
                  className="bg-transparent text-xs font-bold text-text-main outline-none w-full"
                >
                  <option value="en">English</option>
                  <option value="ta">Tamil</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </main>
      
      <footer className="border-t border-border-main py-12 bg-bg-card/50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-8">
          <div className="flex flex-col md:flex-row justify-between items-center w-full gap-8">
            <div className="flex items-center gap-3 opacity-40 grayscale">
              <VoteIcon className="w-6 h-6" />
              <span className="text-xl font-black tracking-tighter">VeriVote</span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-black opacity-30 text-center">
              {t('common.copyright')}
            </p>
            <div className="flex gap-6">
              <button onClick={() => onNavigate('security')} className="text-xs font-bold text-text-muted hover:text-brand-primary transition-colors">{t('nav.security')}</button>
              <button onClick={() => onNavigate('stats')} className="text-xs font-bold text-text-muted hover:text-brand-primary transition-colors">{t('nav.results')}</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

