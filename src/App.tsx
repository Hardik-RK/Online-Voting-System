import React, { Component, ErrorInfo, ReactNode, useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { Layout } from './components/Layout';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { AuthPage } from './components/AuthPage';
import { ResultsPage } from './components/ResultsPage';
import { SecurityPage } from './components/SecurityPage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-bg-main p-4">
          <div className="bg-bg-card p-10 rounded-[2.5rem] shadow-xl max-w-md w-full text-center border border-border-main">
            <h2 className="text-2xl font-bold mb-4 text-text-main">Something went wrong</h2>
            <p className="text-text-muted mb-8">
              {this.state.error?.message.startsWith('{')
                ? 'A security or database error occurred. Please check your permissions.'
                : 'An unexpected error occurred. Please try refreshing the page.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-brand-primary text-white rounded-2xl font-bold"
            >
              Refresh Application
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

const AppContent: React.FC = () => {
  const { user, profile, loading, t } = useAuth();
  const [authMode, setAuthMode] = useState<'landing' | 'login' | 'register'>('landing');
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'stats' | 'security'>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-main">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-primary/10 border-t-brand-primary rounded-full animate-spin" />
          <span className="text-[10px] uppercase tracking-widest font-bold opacity-40 text-text-main">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    // Public pages
    if (currentPage === 'stats') return <ResultsPage />;
    if (currentPage === 'security') return <SecurityPage />;

    // Protected pages
    if (user && profile) {
      return <Dashboard />;
    }

    // Auth flow
    switch (authMode) {
      case 'login':
        return (
          <div className="flex justify-center py-20">
            <AuthPage />
          </div>
        );
      case 'register':
        return (
          <div className="flex justify-center py-20">
            <AuthPage isRegister />
          </div>
        );
      default:
        return (
          <LandingPage 
            onGetStarted={() => setAuthMode('login')} 
            onLearnMore={() => setCurrentPage('security')}
            onRegister={() => setAuthMode('register')}
          />
        );
    }
  };

  return (
    <Layout 
      currentPage={currentPage} 
      onNavigate={setCurrentPage}
      onAuth={() => setAuthMode('login')}
      onHome={() => {
        setAuthMode('landing');
        setCurrentPage('dashboard');
      }}
    >
      {renderContent()}
    </Layout>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
