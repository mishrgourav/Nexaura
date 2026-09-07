import React, { useState } from 'react';
import { StartupMatch } from '../types';
import { Sparkles, Award, ShieldCheck, Info, Bot, ChevronRight, Zap, Rocket } from 'lucide-react';

interface AiMatchCardProps {
  match: StartupMatch;
  rank: number;
  onInitiatePilot: (startupId: string) => void;
  onViewPassport?: (startupId: string) => void;
  onExplainWithAi?: (problemId: string, startupId: string) => void;
}

export const AiMatchCard: React.FC<AiMatchCardProps> = ({
  match,
  rank,
  onInitiatePilot,
  onViewPassport,
  onExplainWithAi,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const startup = match.startup;

  // Match score color badge styling
  const getScoreBadge = (score: number) => {
    if (score >= 90) {
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500/30',
        label: 'Outstanding Match',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
      };
    }
    if (score >= 75) {
      return {
        bg: 'bg-sky-50 dark:bg-sky-500/15 border-sky-200 dark:border-sky-500/40 text-sky-800 dark:text-sky-300 ring-1 ring-sky-500/30',
        label: 'Strong Fit',
        iconColor: 'text-sky-600 dark:text-sky-400',
      };
    }
    if (score >= 60) {
      return {
        bg: 'bg-amber-50 dark:bg-amber-500/15 border-amber-200 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 ring-1 ring-amber-500/30',
        label: 'Potential Fit',
        iconColor: 'text-amber-600 dark:text-amber-400',
      };
    }
    return {
      bg: 'bg-slate-50 dark:bg-slate-500/15 border-slate-200 dark:border-slate-500/40 text-slate-700 dark:text-slate-300',
      label: 'Moderate Fit',
      iconColor: 'text-slate-500 dark:text-slate-400',
    };
  };

  const scoreBadge = getScoreBadge(match.matchScore);

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs dark:shadow-lg dark:shadow-black/20 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 overflow-hidden card-hover">
      <div className="p-6">
        {/* Top Header: Rank + Startup Info + Match Score */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            {/* Rank Indicator */}
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-teal-600 dark:text-teal-400 font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
              #{rank}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">{startup.name}</h4>
                
                {/* DPIIT Status Badge */}
                {startup.dpiitStatus === 'Recognized' && (
                  <span className="inline-flex items-center gap-1 bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-700/60 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                    DPIIT {startup.dpiitNumber}
                  </span>
                )}

                {/* Verified Pilot Passport Badge */}
                {startup.hasVerifiedPassport && (
                  <button
                    type="button"
                    onClick={() => onViewPassport && onViewPassport(startup.id)}
                    className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-600/60 text-[11px] font-bold px-2.5 py-0.5 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/60 transition shadow-2xs cursor-pointer"
                    title="This startup already holds a validated government Pilot Passport! Click to inspect credential."
                  >
                    <Award className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>Verified Pilot Passport</span>
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                {startup.description}
              </p>
            </div>
          </div>

          {/* Match Score Indicator */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 gap-1 bg-slate-50 dark:bg-slate-900/60 p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 ${scoreBadge.bg}`}>
              <Sparkles className={`w-4 h-4 ${scoreBadge.iconColor}`} />
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold">{match.matchScore}%</span>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-90">Match</span>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:inline font-medium">
              {scoreBadge.label}
            </span>
          </div>
        </div>

        {/* AI Recommendation Reason Bar */}
        <div className="mt-4 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5 shadow-2xs">
          <Bot className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-slate-900 dark:text-white">AI Evaluation Rationale: </span>
            <span className="text-slate-700 dark:text-slate-300">{match.reason}</span>
          </div>
        </div>

        {/* Tech Keywords Tags */}
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mr-1">Matched Keywords:</span>
          {startup.keywords.map((kw, idx) => {
            const isMatched = match.details.keywordMatches?.some(
              (m) => m.toLowerCase() === kw.toLowerCase()
            );
            return (
              <span
                key={idx}
                className={`text-[11px] px-2.5 py-0.5 rounded-lg font-medium transition ${
                  isMatched
                    ? 'bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700/80 font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60'
                }`}
              >
                {kw}
              </span>
            );
          })}
        </div>

        {/* Past Gov Pilot Metric Strip */}
        <div className="mt-4 pt-3.5 border-t border-slate-200 dark:border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold block">Sector Domain</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{startup.sector}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold block">Gov Pilots Completed</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {startup.pastPilotCount} {startup.pastPilotCount === 1 ? 'pilot' : 'pilots'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold block">Track Record Rate</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {startup.successRatePercent > 0 ? `${startup.successRatePercent}% Validated` : 'New Sandbox Innovator'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold block">HQ Location & Stage</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{startup.city} • {startup.stage}</span>
          </div>
        </div>

        {/* Expandable Score Breakdown */}
        {showDetails && (
          <div className="mt-4 p-4 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Multi-Factor Algorithmic Scoring Breakdown</span>
              </span>
              <span className="text-teal-600 dark:text-teal-400 font-mono font-bold">Total: {match.matchScore} / 100</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-slate-700 dark:text-slate-300 text-[11px] pt-1">
              <div className="flex justify-between bg-white dark:bg-slate-800/40 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">• Domain Sector Fit ({startup.sector}):</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {match.details.sectorMatch ? '+35 pts' : '+25 pts'}
                </span>
              </div>
              <div className="flex justify-between bg-white dark:bg-slate-800/40 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">• Technical Keyword Relevance:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  +{match.details.keywordMatches?.length * 8 || 0} pts
                </span>
              </div>
              <div className="flex justify-between bg-white dark:bg-slate-800/40 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">• Verified Pilot Passport Credential:</span>
                <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                  {match.details.passportBonus ? '+15 pts (Fast-Tracked)' : '0 pts'}
                </span>
              </div>
              <div className="flex justify-between bg-white dark:bg-slate-800/40 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">• DPIIT Recognition Score:</span>
                <span className="font-mono text-sky-600 dark:text-sky-400 font-bold">+{match.details.dpiitBonus} pts</span>
              </div>
              <div className="flex justify-between bg-white dark:bg-slate-800/40 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">• Past Pilot Track Record:</span>
                <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">+{match.details.pastExperienceScore} pts</span>
              </div>
              <div className="flex justify-between bg-white dark:bg-slate-800/40 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">• Operational Risk Alignment:</span>
                <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">+{match.details.riskAlignmentScore} pts</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons: Visual Hierarchy */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
          {/* Secondary quiet actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition"
            >
              <Info className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>{showDetails ? 'Hide Score Breakdown' : 'Explain Match Score'}</span>
            </button>

            {startup.hasVerifiedPassport && onViewPassport && (
              <button
                type="button"
                onClick={() => onViewPassport(startup.id)}
                className="text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800/60 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>View Pilot Passport</span>
              </button>
            )}

            {onExplainWithAi && (
              <button
                type="button"
                onClick={() => onExplainWithAi(match.problemId, startup.id)}
                className="text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 border border-sky-200 dark:border-sky-800/60 px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition"
                title="Generate AI Procurement Committee evaluation brief"
              >
                <Bot className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>AI Committee Brief</span>
              </button>
            )}
          </div>

          {/* Primary Action Button: Large, Bright Gradient Accent */}
          <button
            type="button"
            onClick={() => onInitiatePilot(startup.id)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 transition-all shadow-xs shadow-teal-500/20 hover:shadow-teal-500/30 btn-hover"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Propose Pilot</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
