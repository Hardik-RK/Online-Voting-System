import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart3,
  Users,
  Vote,
  CheckCircle2,
  TrendingUp,
  PieChart,
  X,
  Trophy,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { db, collection, query, onSnapshot } from '../firebase';
import { Election } from '../types';
import { useAuth } from '../AuthContext';

// ─── Individual Election Detail Modal ────────────────────────────────────────

const ElectionResultsModal: React.FC<{
  election: Election;
  onClose: () => void;
}> = ({ election, onClose }) => {
  const { language, t } = useAuth();

  const titles = election.titles || {};
  const title =
    titles[language] || titles["en"] || (election as any).title || "";

  const totalElectionVotes = election.positions.reduce(
    (acc, pos) =>
      acc + pos.candidates.reduce((cAcc, cand) => cAcc + cand.voteCount, 0),
    0,
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="relative bg-bg-card w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="min-w-0 pr-4">
            <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted">
              {t("results.electionResults")}
            </span>
            <h2 className="text-3xl font-bold text-text-main leading-tight mt-0.5">
              {title}
            </h2>
            <p className="text-xs text-text-muted mt-1.5 font-medium">
              {totalElectionVotes} {t("dashboard.choicesCast")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-2 hover:bg-bg-main rounded-full transition-colors text-text-main"
            aria-label={t("common.close")}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Positions */}
        <div className="space-y-10">
          {election.positions.map((position, posIndex) => {
            const totalPosVotes = position.candidates.reduce(
              (sum, c) => sum + c.voteCount,
              0,
            );
            const sortedCandidates = [...position.candidates].sort(
              (a, b) => b.voteCount - a.voteCount,
            );
            const winner = sortedCandidates[0];
            const posTitles = position.titles || {};
            const posTitle =
              posTitles[language] ||
              posTitles["en"] ||
              (position as any).title ||
              "";

            return (
              <motion.div
                key={position.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: posIndex * 0.08 }}
                className="space-y-4"
              >
                {/* Position header */}
                <div className="flex justify-between items-end border-b border-border-main pb-3">
                  <h3 className="text-lg font-bold text-text-main">
                    {posTitle}
                  </h3>
                  <span className="text-xs font-mono text-text-muted shrink-0 ml-4">
                    {totalPosVotes} {t("dashboard.choicesCast")}
                  </span>
                </div>

                {totalPosVotes === 0 ? (
                  <p className="text-sm text-text-muted italic py-4 text-center">
                    {t("results.noVotesCast")}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {sortedCandidates.map((candidate, index) => {
                      const percentage =
                        totalPosVotes > 0
                          ? (candidate.voteCount / totalPosVotes) * 100
                          : 0;
                      const isWinner =
                        candidate.id === winner?.id && totalPosVotes > 0;
                      const labels = candidate.labels || {};
                      const candLabel =
                        labels[language] ||
                        labels["en"] ||
                        (candidate as any).label ||
                        "";

                      return (
                        <motion.div
                          key={candidate.id}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: posIndex * 0.08 + index * 0.05 }}
                          className={`relative p-4 rounded-2xl transition-colors ${
                            isWinner
                              ? "bg-brand-primary/5 border border-brand-primary/20"
                              : "bg-bg-main"
                          }`}
                        >
                          {/* Candidate row */}
                          <div className="flex justify-between items-center mb-2.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xs font-bold text-text-muted w-5 shrink-0 tabular-nums">
                                #{index + 1}
                              </span>
                              <span
                                className={`font-bold truncate ${
                                  isWinner
                                    ? "text-text-main"
                                    : "text-text-muted"
                                }`}
                              >
                                {candLabel}
                              </span>
                              {isWinner && (
                                <span className="shrink-0 bg-emerald-100 text-emerald-700 text-[8px] uppercase font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Trophy className="w-2.5 h-2.5" />
                                  {t("results.winner")}
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-mono font-bold text-text-main shrink-0 ml-4">
                              {candidate.voteCount}{" "}
                              <span className="text-text-muted font-normal">
                                ({percentage.toFixed(1)}%)
                              </span>
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="h-2.5 bg-bg-card rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{
                                duration: 1,
                                ease: "easeOut",
                                delay: 0.2,
                              }}
                              className={`h-full rounded-full ${
                                isWinner
                                  ? "bg-brand-primary"
                                  : "bg-brand-primary/25"
                              }`}
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-10 py-4 bg-brand-primary text-white rounded-2xl font-bold text-sm hover:bg-brand-primary/90 transition-colors"
        >
          {t("common.close")}
        </button>
      </motion.div>
    </div>
  );
};

// ─── Results Page ─────────────────────────────────────────────────────────────

export const ResultsPage: React.FC = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedElection, setSelectedElection] = useState<Election | null>(
    null,
  );
  const { language, t } = useAuth();

  useEffect(() => {
    const q = query(collection(db, "elections"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Election,
      );
      setElections(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-20 text-text-main">
        {t("common.loading")}
      </div>
    );

  const totalElections = elections.length;
  const activeElections = elections.filter((e) => e.status === "active").length;
  const closedElections = elections.filter((e) => e.status === "closed").length;

  const totalVotesCast = elections.reduce((acc, election) => {
    return (
      acc +
      election.positions.reduce((pAcc, pos) => {
        return (
          pAcc + pos.candidates.reduce((cAcc, cand) => cAcc + cand.voteCount, 0)
        );
      }, 0)
    );
  }, 0);

  const stats = [
    {
      label: t("results.stats.total"),
      value: totalElections,
      icon: Vote,
      color: "text-blue-500",
    },
    {
      label: t("results.stats.active"),
      value: activeElections,
      icon: TrendingUp,
      color: "text-teal-500",
    },
    {
      label: t("results.stats.completed"),
      value: closedElections,
      icon: CheckCircle2,
      color: "text-emerald-500",
    },
    {
      label: t("results.stats.votes"),
      value: totalVotesCast,
      icon: BarChart3,
      color: "text-indigo-500",
    },
  ];

  const getElectionTitle = (election: Election) => {
    const titles = election.titles || {};
    return titles[language] || titles["en"] || (election as any).title || "";
  };

  return (
    <>
      <div className="space-y-12">
        {/* ── Page Header ── */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-text-main">
              {t("results.title")}
            </h2>
            <p className="text-text-muted mt-2">{t("results.subtitle")}</p>
          </div>
        </header>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-bg-card p-8 rounded-3xl border border-border-main shadow-sm"
            >
              <div
                className={`p-3 rounded-2xl bg-bg-main w-fit mb-4 ${stat.color}`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-text-muted text-xs uppercase tracking-widest font-bold mb-1">
                {stat.label}
              </p>
              <p className="text-3xl font-bold text-text-main">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Distribution + Activity ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Election Distribution */}
          <div className="bg-bg-card p-8 rounded-3xl border border-border-main shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <PieChart className="w-6 h-6 text-brand-primary" />
              <h3 className="text-xl font-bold text-text-main">
                {t("results.distribution")}
              </h3>
            </div>
            <div className="space-y-6">
              {(["active", "upcoming", "closed"] as const).map((status) => {
                const count = elections.filter(
                  (e) => e.status === status,
                ).length;
                const percentage =
                  totalElections > 0 ? (count / totalElections) * 100 : 0;
                const statusLabel = t(`common.status.${status}`);
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize font-medium text-text-main">
                        {statusLabel}
                      </span>
                      <span className="text-text-muted">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-bg-main rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                        className={`h-full rounded-full ${
                          status === "active"
                            ? "bg-teal-500"
                            : status === "upcoming"
                              ? "bg-blue-500"
                              : "bg-slate-400"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-bg-card p-8 rounded-3xl border border-border-main shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <Users className="w-6 h-6 text-brand-secondary" />
              <h3 className="text-xl font-bold text-text-main">
                {t("results.activity")}
              </h3>
            </div>
            <div className="space-y-3">
              {elections.slice(0, 5).map((election) => {
                const title = getElectionTitle(election);
                return (
                  <div
                    key={election.id}
                    className="flex items-center justify-between p-4 bg-bg-main rounded-2xl gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          election.status === "active"
                            ? "bg-teal-500"
                            : election.status === "upcoming"
                              ? "bg-amber-400"
                              : "bg-slate-300"
                        }`}
                      />
                      <span className="font-medium text-sm text-text-main truncate">
                        {title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted">
                        {t(`common.status.${election.status}`)}
                      </span>
                      {election.status === "closed" && (
                        <button
                          onClick={() => setSelectedElection(election)}
                          className="text-[10px] uppercase tracking-widest font-bold text-brand-primary hover:text-brand-primary/70 transition-colors flex items-center gap-0.5 ml-1"
                        >
                          {t("results.viewDetails")}
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {elections.length === 0 && (
                <p className="text-center py-10 text-text-muted italic">
                  {t("results.noActivity")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Completed Election Results ── */}
        {closedElections > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-text-main">
                {t("results.completedResults")}
              </h3>
              <span className="text-xs font-bold text-text-muted uppercase tracking-widest">
                {closedElections} {t("results.stats.completed")}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {elections
                .filter((e) => e.status === "closed")
                .map((election) => {
                  const title = getElectionTitle(election);
                  const electionTotalVotes = election.positions.reduce(
                    (acc, pos) =>
                      acc +
                      pos.candidates.reduce(
                        (cAcc, cand) => cAcc + cand.voteCount,
                        0,
                      ),
                    0,
                  );

                  return (
                    <motion.div
                      key={election.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-bg-card rounded-3xl border border-border-main shadow-sm flex flex-col overflow-hidden"
                    >
                      {/* Card header */}
                      <div className="p-6 pb-4 border-b border-border-main">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            <h4
                              className="font-bold text-text-main text-sm leading-snug truncate"
                              title={title}
                            >
                              {title}
                            </h4>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-text-muted">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="text-xs">
                              {election.endDate.toDate().toLocaleDateString()}
                            </span>
                          </div>
                          <span className="text-xs font-mono text-text-muted">
                            {electionTotalVotes} {t("dashboard.choicesCast")}
                          </span>
                        </div>
                      </div>

                      {/* Compact position preview */}
                      <div className="p-6 space-y-4 flex-1">
                        {election.positions.map((position) => {
                          const posTitles = position.titles || {};
                          const posTitle =
                            posTitles[language] ||
                            posTitles["en"] ||
                            "Position";
                          const totalVotes = position.candidates.reduce(
                            (sum, c) => sum + c.voteCount,
                            0,
                          );
                          const sortedCandidates = [
                            ...position.candidates,
                          ].sort((a, b) => b.voteCount - a.voteCount);

                          return (
                            <div key={position.id} className="space-y-2">
                              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                {posTitle}
                              </p>
                              <div className="space-y-1.5">
                                {sortedCandidates.map((candidate, idx) => {
                                  const candLabels = candidate.labels || {};
                                  const candName =
                                    candLabels[language] ||
                                    candLabels["en"] ||
                                    "Option";
                                  const percentage =
                                    totalVotes > 0
                                      ? (candidate.voteCount / totalVotes) * 100
                                      : 0;
                                  const isLeader = idx === 0 && totalVotes > 0;

                                  return (
                                    <div
                                      key={candidate.id}
                                      className="space-y-1"
                                    >
                                      <div className="flex justify-between text-xs">
                                        <span
                                          className={`font-medium truncate pr-2 ${
                                            isLeader
                                              ? "text-text-main"
                                              : "text-text-muted"
                                          }`}
                                        >
                                          {candName}
                                        </span>
                                        <span className="text-text-muted shrink-0">
                                          {candidate.voteCount}
                                        </span>
                                      </div>
                                      <div className="h-1.5 bg-bg-main border border-border-main rounded-full overflow-hidden">
                                        <motion.div
                                          initial={{ width: 0 }}
                                          animate={{ width: `${percentage}%` }}
                                          transition={{
                                            duration: 1,
                                            delay: 0.2,
                                          }}
                                          className={`h-full rounded-full ${
                                            isLeader
                                              ? "bg-brand-primary"
                                              : "bg-brand-primary/30"
                                          }`}
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

                      {/* View Details CTA */}
                      <div className="px-6 pb-6">
                        <button
                          onClick={() => setSelectedElection(election)}
                          className="w-full py-3 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-2xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                        >
                          <BarChart3 className="w-3.5 h-3.5" />
                          {t("results.viewDetails")}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* ── Election Detail Modal ── */}
      <AnimatePresence>
        {selectedElection && (
          <ElectionResultsModal
            election={selectedElection}
            onClose={() => setSelectedElection(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};
