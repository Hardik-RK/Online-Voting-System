import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { BarChart3, Users, Vote, CheckCircle2, TrendingUp, PieChart } from 'lucide-react';
import { db, collection, query, onSnapshot } from '../firebase';
import { Election } from '../types';
import { useAuth } from '../AuthContext';

export const ResultsPage: React.FC = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const { language, t } = useAuth();

  useEffect(() => {
    const q = query(collection(db, 'elections'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Election));
      setElections(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="flex justify-center py-20 text-text-main">{t('common.loading')}</div>;

  const totalElections = elections.length;
  const activeElections = elections.filter(e => e.status === 'active').length;
  const closedElections = elections.filter(e => e.status === 'closed').length;
  
  const totalVotesCast = elections.reduce((acc, election) => {
    return acc + election.positions.reduce((pAcc, pos) => {
      return pAcc + pos.candidates.reduce((cAcc, cand) => cAcc + cand.voteCount, 0);
    }, 0);
  }, 0);

  const stats = [
    { label: t('results.stats.total'), value: totalElections, icon: Vote, color: 'text-blue-500' },
    { label: t('results.stats.active'), value: activeElections, icon: TrendingUp, color: 'text-teal-500' },
    { label: t('results.stats.completed'), value: closedElections, icon: CheckCircle2, color: 'text-emerald-500' },
    { label: t('results.stats.votes'), value: totalVotesCast, icon: BarChart3, color: 'text-indigo-500' },
  ];

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-text-main">{t('results.title')}</h2>
          <p className="text-text-muted mt-2">{t('results.subtitle')}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-bg-card p-8 rounded-3xl border border-border-main shadow-sm"
          >
            <div className={`p-3 rounded-2xl bg-bg-main w-fit mb-4 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-text-muted text-xs uppercase tracking-widest font-bold mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-text-main">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-bg-card p-8 rounded-3xl border border-border-main shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <PieChart className="w-6 h-6 text-brand-primary" />
            <h3 className="text-xl font-bold text-text-main">{t('results.distribution')}</h3>
          </div>
          <div className="space-y-6">
            {['active', 'upcoming', 'closed'].map(status => {
              const count = elections.filter(e => e.status === status).length;
              const percentage = totalElections > 0 ? (count / totalElections) * 100 : 0;
              const statusLabel = t(`common.status.${status}`);
              return (
                <div key={status} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize font-medium text-text-main">{statusLabel}</span>
                    <span className="text-text-muted">{count} ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 bg-bg-main rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className={`h-full rounded-full ${
                        status === 'active' ? 'bg-teal-500' : 
                        status === 'upcoming' ? 'bg-blue-500' : 'bg-slate-400'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-bg-card p-8 rounded-3xl border border-border-main shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <Users className="w-6 h-6 text-brand-secondary" />
            <h3 className="text-xl font-bold text-text-main">{t('results.activity')}</h3>
          </div>
          <div className="space-y-4">
            {elections.slice(0, 5).map(election => {
              const titles = election.titles || {};
              const title = titles[language] || titles['en'] || (election as any).title || '';
              return (
                <div key={election.id} className="flex items-center justify-between p-4 bg-bg-main rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${
                      election.status === 'active' ? 'bg-teal-500' : 'bg-slate-300'
                    }`} />
                    <span className="font-medium text-sm text-text-main">{title}</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted">
                    {t(`common.status.${election.status}`)}
                  </span>
                </div>
              );
            })}
            {elections.length === 0 && (
              <p className="text-center py-10 text-text-muted italic">{t('results.noActivity')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
