import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from './types';
import en from './i18n/en.json';
import ta from './i18n/ta.json';
import hi from './i18n/hi.json';

export type Language = 'en' | 'ta' | 'hi';

const translations = { en, ta, hi };

interface AuthContextType {
  user: { email: string; uid: string } | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ email: string; uid: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang) setLanguageState(savedLang);

    const savedUser = localStorage.getItem('mock_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setProfile({
        uid: parsed.uid,
        email: parsed.email,
        displayName: parsed.email.split('@')[0],
        role: parsed.email === 'admin@a.com' ? 'admin' : 'voter',
        createdAt: { toDate: () => new Date() } as any,
      });
    }
    setLoading(false);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string, variables?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        return key; // Fallback to key if not found
      }
    }

    if (typeof value !== 'string') return key;

    if (variables) {
      Object.entries(variables).forEach(([k, v]) => {
        value = value.replace(`{${k}}`, String(v));
      });
    }

    return value;
  };

  const login = (email: string) => {
    const newUser = { email, uid: `user-${Date.now()}` };
    setUser(newUser);
    localStorage.setItem('mock_user', JSON.stringify(newUser));
    setProfile({
      uid: newUser.uid,
      email: newUser.email,
      displayName: newUser.email.split('@')[0],
      role: newUser.email === 'admin@a.com' ? 'admin' : 'voter',
      createdAt: { toDate: () => new Date() } as any,
    });
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('mock_user');
  };

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    language,
    setLanguage,
    t,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
