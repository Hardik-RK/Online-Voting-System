import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Clock, CheckCircle2, AlertCircle, BarChart3, Trash2, ChevronRight, Play, Square, UserPlus } from 'lucide-react';
import { db, collection, query, onSnapshot, doc, setDoc, Timestamp } from '../firebase';
import { useAuth } from '../AuthContext';
import { Election, ElectionStatus, Position, ElectionOption } from '../types';

export const Dashboard: React.FC = () => {
  const { isAdmin, t } = useAuth();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'elections'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Election));
      setElections(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="flex justify-center py-20 text-text-main">{t('dashboard.loading')}</div>;

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-text-main">{t('dashboard.title')}</h2>
          <p className="text-text-muted">{t('dashboard.subtitle')}</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-brand-primary text-white px-6 py-3 rounded-2xl font-medium hover:scale-[1.02] transition-transform"
          >
            <Plus className="w-5 h-5" />
            <span>{t('dashboard.createElection')}</span>
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {elections.map((election) => (
          <ElectionCard key={election.id} election={election} />
        ))}
        {elections.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-border-main rounded-3xl">
            <p className="text-text-muted">{t('dashboard.noElections')}</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <CreateElectionModal onClose={() => setShowCreateModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

const ElectionCard: React.FC<{ election: Election }> = ({ election }) => {
  const { profile, isAdmin, language, t } = useAuth();
  const [hasVoted, setHasVoted] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const voteId = `${profile.uid}_${election.id}`;
    const unsubscribe = onSnapshot(doc(db, 'votes', voteId), (doc) => {
      setHasVoted(doc.exists());
    });
    return () => unsubscribe();
  }, [profile, election.id]);

  const updateStatus = async (newStatus: ElectionStatus) => {
    try {
      await setDoc(doc(db, 'elections', election.id), { ...election, status: newStatus });
    } catch (err) {
      console.error(err);
    }
  };

  const statusColors = {
    active: 'bg-emerald-500',
    upcoming: 'bg-amber-500',
    closed: 'bg-rose-500'
  };

  const totalVotes = election.positions.reduce((acc, pos) => 
    acc + pos.candidates.reduce((cAcc, cand) => cAcc + cand.voteCount, 0), 0
  );

  const titles = election.titles || {};
  const descriptions = election.descriptions || {};
  const title = titles[language] || titles['en'] || (election as any).title || '';
  const description = descriptions[language] || descriptions['en'] || (election as any).description || '';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-bg-card rounded-3xl p-8 border border-border-main shadow-sm flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-6">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white ${statusColors[election.status]}`}>
          {t(`common.status.${election.status}`)}
        </span>
        {isAdmin && (
          <div className="flex items-center gap-2 text-text-muted">
            <BarChart3 className="w-4 h-4" />
            <span className="text-xs font-mono">
              {totalVotes} {t('dashboard.choicesCast')}
            </span>
          </div>
        )}
      </div>

      <h3 className="text-2xl font-bold mb-2 leading-tight text-text-main">{title}</h3>
      <p className="text-sm text-text-muted mb-6 line-clamp-3">{description}</p>

      <div className="mt-auto space-y-4">
        <div className="flex items-center gap-2 text-xs text-text-muted font-medium">
          <Clock className="w-4 h-4" />
          <span>{t('dashboard.ends')} {election.endDate.toDate().toLocaleDateString()}</span>
        </div>

        {isAdmin ? (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              {election.status === 'upcoming' && (
                <button 
                  onClick={() => updateStatus('active')}
                  className="flex-1 py-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" /> {t('dashboard.admin.start')}
                </button>
              )}
              {election.status === 'active' && (
                <button 
                  onClick={() => updateStatus('closed')}
                  className="flex-1 py-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Square className="w-4 h-4" /> {t('dashboard.admin.end')}
                </button>
              )}
              {election.status === 'closed' && (
                <button 
                  onClick={() => updateStatus('active')}
                  className="flex-1 py-3 bg-amber-50 text-amber-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" /> {t('dashboard.admin.reopen')}
                </button>
              )}
            </div>
            {election.status === 'closed' && (
              <button
                onClick={() => setShowResultsModal(true)}
                className="w-full py-3 bg-brand-primary text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                <BarChart3 className="w-4 h-4" /> {t('dashboard.viewResults')}
              </button>
            )}
          </div>
        ) : election.status === 'closed' ? (
          <button
            onClick={() => setShowResultsModal(true)}
            className="w-full py-4 bg-brand-primary text-white rounded-2xl font-bold text-sm hover:bg-brand-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <BarChart3 className="w-5 h-5" />
            {t('dashboard.viewResults')}
          </button>
        ) : hasVoted ? (
          <div className="w-full py-4 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>{t('dashboard.voteCast')}</span>
          </div>
        ) : election.status === 'active' ? (
          <button
            onClick={() => setShowVoteModal(true)}
            className="w-full py-4 bg-brand-primary text-white rounded-2xl font-bold text-sm hover:bg-brand-primary/90 transition-colors"
          >
            {t('dashboard.castVote')}
          </button>
        ) : (
          <div className="w-full py-4 bg-bg-main text-text-muted rounded-2xl flex items-center justify-center gap-2 font-bold text-sm">
            <AlertCircle className="w-5 h-5" />
            <span>{election.status === 'upcoming' ? t('common.status.upcoming') : t('common.status.closed')}</span>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showVoteModal && (
          <VoteModal election={election} onClose={() => setShowVoteModal(false)} />
        )}
        {showResultsModal && (
          <ResultsModal election={election} onClose={() => setShowResultsModal(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const VoteModal: React.FC<{ election: Election; onClose: () => void }> = ({ election, onClose }) => {
  const { profile, language, t } = useAuth();
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentPosition = election.positions[currentPositionIndex];
  const isLastPosition = currentPositionIndex === election.positions.length - 1;

  const handleNext = () => {
    if (isLastPosition) {
      handleVote();
    } else {
      setCurrentPositionIndex(currentPositionIndex + 1);
    }
  };

  const handleVote = async () => {
    if (!profile || Object.keys(selections).length !== election.positions.length) return;
    setIsSubmitting(true);
    try {
      const voteId = `${profile.uid}_${election.id}`;
      await setDoc(doc(db, 'votes', voteId), {
        voterUid: profile.uid,
        electionId: election.id,
        selections,
        timestamp: Timestamp.now()
      });
      
      const updatedPositions = election.positions.map(pos => {
        const selectedCandidateId = selections[pos.id];
        return {
          ...pos,
          candidates: pos.candidates.map(cand => 
            cand.id === selectedCandidateId ? { ...cand, voteCount: cand.voteCount + 1 } : cand
          )
        };
      });
      
      await setDoc(doc(db, 'elections', election.id), { ...election, positions: updatedPositions });
      onClose();
    } catch (err) {
      console.error(err);
      alert(t('dashboard.voting.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const titles = currentPosition.titles || {};
  const posTitle = titles[language] || titles['en'] || (currentPosition as any).title || '';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-bg-card w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted">
            {t('dashboard.voting.position')} {currentPositionIndex + 1} {t('dashboard.voting.of')} {election.positions.length}
          </span>
          <div className="flex gap-1">
            {election.positions.map((_, i) => (
              <div key={i} className={`w-6 h-1 rounded-full ${i <= currentPositionIndex ? 'bg-brand-primary' : 'bg-border-main'}`} />
            ))}
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-2 text-text-main">{posTitle}</h2>
        <p className="text-text-muted text-sm mb-8">{t('dashboard.voting.selectCandidate')}</p>

        <div className="space-y-3 mb-10">
          {currentPosition.candidates.map((candidate) => {
            const labels = candidate.labels || {};
            const candLabel = labels[language] || labels['en'] || (candidate as any).label || '';
            return (
              <button
                key={candidate.id}
                onClick={() => {
                  setSelections({ ...selections, [currentPosition.id]: candidate.id });
                }}
                className={`w-full p-5 rounded-2xl border-2 transition-all text-left flex justify-between items-center ${
                  selections[currentPosition.id] === candidate.id
                    ? 'border-brand-primary bg-brand-primary/5 text-text-main'
                    : 'border-border-main hover:border-brand-primary/20 text-text-main'
                }`}
              >
                <span className="font-bold">{candLabel}</span>
                {selections[currentPosition.id] === candidate.id && <CheckCircle2 className="w-5 h-5 text-brand-primary" />}
              </button>
            );
          })}
        </div>

        <div className="flex gap-4">
          {currentPositionIndex > 0 && (
            <button
              onClick={() => {
                setCurrentPositionIndex(currentPositionIndex - 1);
              }}
              className="px-6 py-4 rounded-2xl font-bold text-sm border border-border-main hover:bg-bg-main transition-colors text-text-main"
            >
              {t('dashboard.voting.back')}
            </button>
          )}
          <button
            disabled={!selections[currentPosition.id] || isSubmitting}
            onClick={handleNext}
            className="flex-1 py-4 bg-brand-primary text-white rounded-2xl font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? t('dashboard.voting.verifying') : isLastPosition ? t('dashboard.voting.confirm') : t('dashboard.voting.next')}
            {!isLastPosition && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const ResultsModal: React.FC<{ election: Election; onClose: () => void }> = ({ election, onClose }) => {
  const { language, t } = useAuth();
  const titles = election.titles || {};
  const title = titles[language] || titles['en'] || (election as any).title || '';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-bg-card w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-start mb-8">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted">{t('results.title')}</span>
            <h2 className="text-3xl font-bold text-text-main">{title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-bg-main rounded-full transition-colors text-text-main"
          >
            <Plus className="w-6 h-6 rotate-45" />
          </button>
        </div>

        <div className="space-y-10">
          {election.positions.map((position) => {
            const totalPosVotes = position.candidates.reduce((sum, c) => sum + c.voteCount, 0);
            const sortedCandidates = [...position.candidates].sort((a, b) => b.voteCount - a.voteCount);
            const winner = sortedCandidates[0];
            const posTitles = position.titles || {};
            const posTitle = posTitles[language] || posTitles['en'] || (position as any).title || '';

            return (
              <div key={position.id} className="space-y-4">
                <div className="flex justify-between items-end">
                  <h3 className="text-xl font-bold text-text-main">{posTitle}</h3>
                  <span className="text-xs font-mono text-text-muted">{totalPosVotes} {t('dashboard.choicesCast')}</span>
                </div>
                <div className="space-y-3">
                  {sortedCandidates.map((candidate) => {
                    const percentage = totalPosVotes > 0 ? (candidate.voteCount / totalPosVotes) * 100 : 0;
                    const isWinner = candidate.id === winner.id && totalPosVotes > 0;
                    const labels = candidate.labels || {};
                    const candLabel = labels[language] || labels['en'] || (candidate as any).label || '';

                    return (
                      <div key={candidate.id} className="relative">
                        <div className="flex justify-between items-center mb-1 px-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${isWinner ? 'text-text-main' : 'text-text-muted'}`}>
                              {candLabel}
                            </span>
                            {isWinner && (
                              <span className="bg-emerald-100 text-emerald-700 text-[8px] uppercase font-black px-2 py-0.5 rounded-full">
                                {t('results.winner')}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-mono font-bold text-text-main">
                            {candidate.voteCount} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-3 bg-bg-main rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full rounded-full ${isWinner ? 'bg-brand-primary' : 'bg-brand-primary/20'}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-10 py-4 bg-brand-primary text-white rounded-2xl font-bold text-sm"
        >
          {t('common.close')}
        </button>
      </motion.div>
    </div>
  );
};

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'Tamil' },
  { code: 'hi', label: 'Hindi' }
] as const;

const CreateElectionModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t } = useAuth();
  const [activeLang, setActiveLang] = useState<typeof LANGUAGES[number]['code']>('en');
  const [titles, setTitles] = useState<Record<string, string>>({ en: '', ta: '', hi: '' });
  const [descriptions, setDescriptions] = useState<Record<string, string>>({ en: '', ta: '', hi: '' });
  const [positions, setPositions] = useState<Position[]>([
    { id: 'pos-1', titles: { en: '', ta: '', hi: '' }, candidates: [{ id: 'cand-1', labels: { en: '', ta: '', hi: '' }, voteCount: 0 }] }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addPosition = () => {
    setPositions([...positions, { 
      id: `pos-${Date.now()}`, 
      titles: { en: '', ta: '', hi: '' }, 
      candidates: [{ id: `cand-${Date.now()}`, labels: { en: '', ta: '', hi: '' }, voteCount: 0 }] 
    }]);
  };

  const removePosition = (id: string) => {
    if (positions.length <= 1) return;
    setPositions(positions.filter(p => p.id !== id));
  };

  const addCandidate = (posIndex: number) => {
    const newPositions = [...positions];
    newPositions[posIndex].candidates.push({ id: `cand-${Date.now()}`, labels: { en: '', ta: '', hi: '' }, voteCount: 0 });
    setPositions(newPositions);
  };

  const removeCandidate = (posIndex: number, candId: string) => {
    const newPositions = [...positions];
    if (newPositions[posIndex].candidates.length <= 1) return;
    newPositions[posIndex].candidates = newPositions[posIndex].candidates.filter(c => c.id !== candId);
    setPositions(newPositions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate that at least English title is present
    if (!titles.en.trim()) {
      alert(t('dashboard.admin.error'));
      return;
    }
    
    setIsSubmitting(true);
    try {
      const electionId = Date.now().toString();
      const startDate = Timestamp.now();
      const endDate = new Timestamp(startDate.seconds + (24 * 60 * 60), 0);
      
      await setDoc(doc(db, 'elections', electionId), {
        titles,
        descriptions,
        status: 'active',
        startDate,
        endDate,
        positions,
        createdAt: Timestamp.now()
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert(t('dashboard.admin.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-bg-card w-full max-w-4xl rounded-[2.5rem] p-10 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-text-main">{t('dashboard.admin.createTitle')}</h2>
          <div className="flex bg-bg-main p-1 rounded-xl border border-border-main">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setActiveLang(lang.code)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeLang === lang.code 
                    ? 'bg-brand-primary text-white shadow-md' 
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted block">
                {t('dashboard.admin.electionTitle')} ({LANGUAGES.find(l => l.code === activeLang)?.label})
              </label>
              <input
                required={activeLang === 'en'}
                value={titles[activeLang] || ''}
                onChange={e => setTitles({ ...titles, [activeLang]: e.target.value })}
                className="w-full p-4 rounded-2xl border border-border-main bg-bg-main text-text-main focus:border-brand-primary outline-none transition-colors"
                placeholder={t('dashboard.admin.electionTitle')}
              />
            </div>

            <div className="space-y-6">
              <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted block">
                {t('dashboard.admin.electionDesc')} ({LANGUAGES.find(l => l.code === activeLang)?.label})
              </label>
              <input
                value={descriptions[activeLang] || ''}
                onChange={e => setDescriptions({ ...descriptions, [activeLang]: e.target.value })}
                className="w-full p-4 rounded-2xl border border-border-main bg-bg-main text-text-main focus:border-brand-primary outline-none transition-colors"
                placeholder={t('dashboard.admin.electionDesc')}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-border-main pb-4">
              <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">{t('dashboard.admin.positions')}</label>
              <button
                type="button"
                onClick={addPosition}
                className="text-xs font-bold flex items-center gap-1 hover:underline text-brand-primary"
              >
                <Plus className="w-3 h-3" /> {t('dashboard.admin.addPosition')}
              </button>
            </div>

            {positions.map((position, posIndex) => (
              <div key={position.id} className="p-8 bg-bg-main rounded-[2rem] space-y-8 border border-border-main relative group">
                <button
                  type="button"
                  onClick={() => removePosition(position.id)}
                  className="absolute top-6 right-6 p-2 text-rose-500 hover:bg-rose-100 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="space-y-4">
                  <label className="text-[8px] uppercase tracking-widest font-bold text-text-muted">
                    Position Title ({LANGUAGES.find(l => l.code === activeLang)?.label})
                  </label>
                  <input
                    required={activeLang === 'en'}
                    value={position.titles[activeLang] || ''}
                    onChange={e => {
                      const newPositions = [...positions];
                      newPositions[posIndex].titles[activeLang] = e.target.value;
                      setPositions(newPositions);
                    }}
                    className="w-full p-4 rounded-xl border border-border-main bg-bg-card text-text-main focus:border-brand-primary outline-none transition-colors font-bold"
                    placeholder="e.g. President"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[8px] uppercase tracking-widest font-bold text-text-muted block">Candidates</label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {position.candidates.map((candidate, candIndex) => (
                      <div key={candidate.id} className="p-5 bg-bg-card rounded-2xl border border-border-main space-y-3 relative group/cand">
                        <button
                          type="button"
                          onClick={() => removeCandidate(posIndex, candidate.id)}
                          className="absolute top-4 right-4 p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors opacity-0 group-hover/cand:opacity-100"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <label className="text-[8px] font-bold text-text-muted uppercase">Candidate {candIndex + 1} ({LANGUAGES.find(l => l.code === activeLang)?.label})</label>
                        <input
                          required={activeLang === 'en'}
                          value={candidate.labels[activeLang] || ''}
                          onChange={e => {
                            const newPositions = [...positions];
                            newPositions[posIndex].candidates[candIndex].labels[activeLang] = e.target.value;
                            setPositions(newPositions);
                          }}
                          className="w-full p-3 rounded-xl border border-border-main bg-bg-main text-text-main focus:border-brand-primary outline-none transition-colors text-sm font-medium"
                          placeholder="Candidate Name"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addCandidate(posIndex)}
                      className="h-full min-h-[100px] border-2 border-dashed border-border-main rounded-2xl text-xs font-bold text-text-muted hover:text-brand-primary hover:border-brand-primary transition-all flex flex-col items-center justify-center gap-2"
                    >
                      <UserPlus className="w-5 h-5" />
                      {t('dashboard.admin.addCandidate')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 pt-6 border-t border-border-main">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl font-bold text-sm border border-border-main hover:bg-bg-main transition-colors text-text-main"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-4 bg-brand-primary text-white rounded-2xl font-bold text-sm hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-50"
            >
              {isSubmitting ? t('dashboard.admin.creating') : t('dashboard.admin.launch')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
