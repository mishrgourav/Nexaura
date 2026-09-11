import React, { useState, useEffect } from 'react';
import { ProblemStatement, Startup, StartupMatch, PilotPassport } from '../types';
import {
  X,
  Sparkles,
  Building2,
  DollarSign,
  AlertTriangle,
  Target,
  Rocket,
  ShieldCheck,
  Award,
  ChevronRight,
  Bot,
  Layers,
  CheckCircle2,
  FileText,
  Activity,
} from 'lucide-react';
import { apiUrl } from '../lib/api';

interface ProblemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  problem: ProblemStatement | null;
  startups?: Startup[];
  passports?: PilotPassport[];
  onProposePilot: (problem: ProblemStatement, startup: Startup, score: number, reason: string) => void;
  onViewPassport?: (startupId: string) => void;
}

export const ProblemDetailModal: React.FC<ProblemDetailModalProps> = ({
  isOpen,
  onClose,
  problem,
  startups = [],
  passports = [],
  onProposePilot,
  onViewPassport,
}) => {
  const [matches, setMatches] = useState<StartupMatch[]>([]);
  const [loadingMatches, setLoadingMatches] = useState<boolean>(false);
  const [proposingStartupId, setProposingStartupId] = useState<string | null>(null);
  const [actionSuccessStartupId, setActionSuccessStartupId] = useState<string | null>(null);

  // Semantic similarity and keyword overlap calculation
  const calculateLocalMatches = (prob: ProblemStatement, startupList: Startup[]): StartupMatch[] => {
    console.log(`[ProblemDetailModal] 🔍 Calculating semantic matches for Problem #${prob.id}: "${prob.title}"`);
    console.log(`[ProblemDetailModal] Problem Category: "${prob.category}", KPI: "${prob.expectedOutcome}"`);

    const stopWords = new Set([
      'the', 'and', 'for', 'with', 'that', 'this', 'from', 'are', 'have', 'been',
      'across', 'between', 'into', 'over', 'after', 'under', 'using', 'used',
      'such', 'their', 'which', 'than', 'more', 'also', 'will', 'each', 'about',
      'without', 'within', 'both', 'through', 'where', 'when', 'what', 'these',
      'must', 'should', 'would', 'could', 'per', 'all'
    ]);

    const tokenize = (str: string): string[] => {
      return (str || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length >= 3 && !stopWords.has(w));
    };

    const probCategoryLower = (prob.category || '').toLowerCase();
    const probDescLower = (prob.description || '').toLowerCase();
    const probKpiLower = (prob.expectedOutcome || '').toLowerCase();
    const probTitleLower = (prob.title || '').toLowerCase();
    const combinedProbText = `${probTitleLower} ${probCategoryLower} ${probDescLower} ${probKpiLower}`;
    const probTokens = new Set([...tokenize(probDescLower), ...tokenize(probTitleLower)]);
    const kpiTokens = new Set(tokenize(probKpiLower));

    const scored = startupList.map((startup) => {
      let score = 0;
      const matchedKeywords: string[] = [];
      const matchedDescTerms: string[] = [];
      const matchedKpiTerms: string[] = [];

      const startupSectorLower = (startup.sector || '').toLowerCase();
      const startupDescLower = (startup.description || '').toLowerCase();
      const startupDescTokens = tokenize(startupDescLower);

      // 1. Sector / Category Matching (Up to 35 pts)
      let sectorScore = 0;
      const directSectorMatch = probCategoryLower.includes(startupSectorLower) ||
        startupSectorLower.includes(probCategoryLower);

      if (directSectorMatch) {
        sectorScore = 35;
      } else {
        const categoryPairs = [
          { cats: ['health', 'life sciences', 'medical', 'clinical', 'hospital', 'disease'], tech: ['health', 'diagnostic', 'retinopathy', 'tuberculosis', 'patient', 'telemedicine', 'pathology'] },
          { cats: ['transport', 'urban', 'mobility', 'infrastructure', 'traffic'], tech: ['traffic', 'mobility', 'transit', 'corridor', 'pothole', 'vehicle', 'gps', 'drone', 'flyover', 'sensor'] },
          { cats: ['water', 'sanitation', 'environment', 'pollution'], tech: ['water', 'leak', 'potability', 'fluoride', 'pipeline', 'sensor', 'acoustic', 'iot', 'sewage', 'jal'] },
          { cats: ['agri', 'farming', 'crop'], tech: ['crop', 'pest', 'farm', 'drone', 'soil', 'satellite', 'yield', 'farmer', 'irrigation'] },
          { cats: ['education', 'edtech', 'school', 'skill'], tech: ['school', 'learn', 'student', 'voice', 'tutor', 'literacy', 'vernacular', 'arithmetic'] },
          { cats: ['energy', 'cleantech', 'power', 'solar'], tech: ['solar', 'energy', 'battery', 'power', 'grid', 'clean'] },
          { cats: ['civic', 'governance', 'public'], tech: ['citizen', 'grievance', 'workflow', 'transparency', 'audit'] },
        ];

        for (const pair of categoryPairs) {
          const hasProbCat = pair.cats.some(c => probCategoryLower.includes(c) || probTitleLower.includes(c));
          const hasStartupDomain = pair.tech.some(t => startupSectorLower.includes(t) || (startup.keywords || []).some(k => k.toLowerCase().includes(t)));
          if (hasProbCat && hasStartupDomain) {
            sectorScore = 26;
            break;
          }
        }
      }
      score += sectorScore;

      // 2. Technology tags overlap (Up to 30 pts)
      let tagPoints = 0;
      for (const tag of startup.keywords || []) {
        const lowerTag = tag.toLowerCase();
        if (combinedProbText.includes(lowerTag)) {
          matchedKeywords.push(tag);
          tagPoints += 8;
        } else {
          const tagTokens = tokenize(lowerTag);
          if (tagTokens.some(tok => combinedProbText.includes(tok))) {
            matchedKeywords.push(tag);
            tagPoints += 5;
          }
        }
      }
      score += Math.min(30, tagPoints);

      // 3. Description keyword overlap (Up to 15 pts)
      for (const tok of startupDescTokens) {
        if (probTokens.has(tok) && !matchedDescTerms.includes(tok)) {
          matchedDescTerms.push(tok);
        }
      }
      score += Math.min(15, matchedDescTerms.length * 3);

      // 4. KPI Target alignment (Up to 10 pts)
      for (const tok of [...startupDescTokens, ...(startup.keywords || []).flatMap(k => tokenize(k))]) {
        if (kpiTokens.has(tok) && !matchedKpiTerms.includes(tok)) {
          matchedKpiTerms.push(tok);
        }
      }
      score += Math.min(10, matchedKpiTerms.length * 3.5);

      // 5. Verified Passport & DPIIT bonus
      const hasPassport = (passports || []).some(p => p.startupId === startup.id && p.status === 'active') || startup.hasVerifiedPassport;
      if (hasPassport) score += 6;
      if (startup.pastPilotCount > 0) {
        score += Math.min(4, startup.pastPilotCount * 1.5);
      }

      // Final score percentage
      const finalScore = Math.min(98, Math.max(30, Math.round(score)));

      // Structured reason
      const reasons: string[] = [];
      if (directSectorMatch) {
        reasons.push(`Direct Sector Match (${startup.sector})`);
      } else if (sectorScore > 0) {
        reasons.push(`Sector Alignment (${startup.sector})`);
      }
      if (matchedKeywords.length > 0) {
        reasons.push(`Matching Tech: ${matchedKeywords.slice(0, 3).join(', ')}`);
      }
      if (matchedKpiTerms.length > 0) {
        reasons.push(`KPI Target Alignment on "${matchedKpiTerms.slice(0, 2).join(', ')}"`);
      } else if (matchedDescTerms.length > 0) {
        reasons.push(`Keyword overlap: ${matchedDescTerms.slice(0, 2).join(', ')}`);
      }
      if (hasPassport) {
        reasons.push('Active Verified Pilot Passport');
      }

      const reasonText = reasons.join(' • ') || `Technology alignment in ${startup.sector}`;

      return {
        id: `match-${prob.id}-${startup.id}`,
        problemId: prob.id,
        startupId: startup.id,
        startup,
        matchScore: finalScore,
        reason: reasonText,
        details: {
          sectorMatch: directSectorMatch || sectorScore > 0,
          keywordMatches: matchedKeywords,
          pastExperienceScore: Math.min(10, startup.pastPilotCount * 4),
          dpiitBonus: startup.dpiitStatus === 'Recognized' ? 10 : 3,
          passportBonus: hasPassport ? 15 : 0,
          riskAlignmentScore: prob.riskLevel === 'high' ? 10 : 8,
        },
        createdAt: new Date().toISOString(),
      };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);
    const top10 = scored.slice(0, 10);

    console.log(`[ProblemDetailModal] ✅ Calculated ${top10.length} ranked matches:`);
    top10.forEach((m, idx) => {
      console.log(`  [Rank #${idx + 1}] ${m.startup?.name} (${m.matchScore}% Match) - Reason: ${m.reason}`);
    });

    return top10;
  };

  useEffect(() => {
    if (!isOpen || !problem) {
      setMatches([]);
      return;
    }

    // Step 1: Immediately calculate local approximation so UI displays instantly
    if (startups && startups.length > 0) {
      const initial = calculateLocalMatches(problem, startups);
      setMatches(initial);
    }

    // Step 2: Fetch matches from server
    setLoadingMatches(true);
    fetch(apiUrl(`/api/matches/${problem.id}`))
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((data: StartupMatch[]) => {
        if (Array.isArray(data) && data.length > 0) {
          console.log('[ProblemDetailModal] Server returned matches:', data.length);
          // Hydrate with full startup objects if missing
          const hydrated = data.map((m) => {
            const st = m.startup || startups.find((s) => s.id === m.startupId);
            return { ...m, startup: st };
          });
          setMatches(hydrated.slice(0, 10));
        }
      })
      .catch((err) => {
        console.warn('[ProblemDetailModal] API fetch fallback to local calculation:', err.message);
      })
      .finally(() => {
        setLoadingMatches(false);
      });
  }, [isOpen, problem?.id]);

  if (!isOpen || !problem) return null;

  const handleInitiateClick = async (match: StartupMatch) => {
    if (!match.startup) return;
    const startup = match.startup;
    setProposingStartupId(startup.id);

    console.log(`[ProblemDetailModal] 👉 Initiating match row creation in matches table for problem: ${problem.id} and startup: ${startup.id}`);

    try {
      // Call backend to insert/upsert match row in matches table
      const res = await fetch(apiUrl('/api/matches'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: problem.id,
          startupId: startup.id,
          matchScore: match.matchScore,
          reason: match.reason,
          details: match.details,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        console.log('✅ [ProblemDetailModal] Match row successfully created in database:', result);
      }
    } catch (e) {
      console.warn('[ProblemDetailModal] Error inserting match row:', e);
    }

    setActionSuccessStartupId(startup.id);
    setTimeout(() => {
      setProposingStartupId(null);
      // Move into pilot pipeline
      onProposePilot(problem, startup, match.matchScore, match.reason);
    }, 450);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) {
      return {
        badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
        text: 'text-emerald-600 dark:text-emerald-400',
        label: 'Outstanding Match',
      };
    }
    if (score >= 75) {
      return {
        badge: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30',
        text: 'text-sky-600 dark:text-sky-400',
        label: 'Strong Fit',
      };
    }
    if (score >= 60) {
      return {
        badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
        text: 'text-amber-600 dark:text-amber-400',
        label: 'Potential Fit',
      };
    }
    return {
      badge: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30',
      text: 'text-slate-600 dark:text-slate-400',
      label: 'Moderate Alignment',
    };
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-700/80 flex items-start justify-between gap-4 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="space-y-1.5 flex-1 pr-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700/80">
                {problem.category}
              </span>
              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  problem.riskLevel === 'high'
                    ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-700'
                    : problem.riskLevel === 'medium'
                    ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700'
                    : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700'
                }`}
              >
                Risk: {problem.riskLevel}
              </span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                ID: {problem.id}
              </span>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                Status: {problem.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
              {problem.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <Building2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{problem.departmentName}</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span>Posted: {problem.createdAt}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* SECTION 1: Full Problem Statement Details */}
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-5 border border-slate-200 dark:border-slate-700/80 space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700/60 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Problem Statement Specifications</span>
              </h3>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white font-mono bg-white dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                <DollarSign className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Sandbox Budget: ₹{problem.budgetMinLakhs}L - ₹{problem.budgetMaxLakhs}L</span>
              </div>
            </div>

            {/* Detailed Scope */}
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Detailed Scope & Operational Challenge
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {problem.description}
              </p>
            </div>

            {/* Expected Measurable Outcome & KPI Target */}
            <div className="p-3.5 bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900 dark:text-teal-200">
                <Target className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Target KPI & Measurable Validation Benchmark</span>
              </div>
              <p className="text-xs text-teal-800 dark:text-teal-300 leading-relaxed">
                {problem.expectedOutcome}
              </p>
            </div>
          </div>

          {/* SECTION 2: Ranked Matched Startups */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-700/80">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Ranked Matched Startups (Top 10)
                </h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700">
                  Semantic Similarity & Tech Tag Match
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Sorted by Match Percentage (Highest First)
              </span>
            </div>

            {loadingMatches && matches.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-teal-600 dark:text-teal-400 animate-spin mx-auto" />
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Calculating semantic vector alignment against startup database...
                </p>
              </div>
            ) : matches.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs text-slate-500 dark:text-slate-400">
                No matched startups found for this problem category.
              </div>
            ) : (
              <div className="space-y-3.5">
                {matches.map((match, idx) => {
                  const startup = match.startup;
                  if (!startup) return null;
                  const scoreConfig = getScoreColor(match.matchScore);
                  const isProposing = proposingStartupId === startup.id;
                  const isSuccess = actionSuccessStartupId === startup.id;

                  return (
                    <div
                      key={match.id || startup.id}
                      className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 sm:p-5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-600 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          {/* Rank indicator */}
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-teal-600 dark:text-teal-400 font-bold text-xs flex items-center justify-center shrink-0">
                            #{idx + 1}
                          </div>

                          <div className="space-y-1.5 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                {startup.name}
                              </h4>
                              {startup.dpiitStatus === 'Recognized' && (
                                <span className="inline-flex items-center gap-1 bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-700/60 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                  <ShieldCheck className="w-3 h-3 text-sky-600" />
                                  DPIIT Recognized
                                </span>
                              )}
                              {startup.hasVerifiedPassport && (
                                <button
                                  type="button"
                                  onClick={() => onViewPassport && onViewPassport(startup.id)}
                                  className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-600/60 text-[10px] font-bold px-2 py-0.5 rounded-full hover:bg-amber-100 transition"
                                >
                                  <Award className="w-3 h-3 text-amber-500" />
                                  <span>Verified Pilot Passport</span>
                                </button>
                              )}
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                              {startup.description}
                            </p>
                          </div>
                        </div>

                        {/* Match Percentage Badge */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 gap-1 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200 dark:border-slate-700/60">
                          <div className={`px-2.5 py-1 rounded-lg border font-bold text-xs flex items-center gap-1.5 ${scoreConfig.badge}`}>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span className="text-sm font-extrabold">{match.matchScore}%</span>
                            <span className="text-[10px] uppercase font-bold tracking-wider">Match</span>
                          </div>
                          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                            {scoreConfig.label}
                          </span>
                        </div>
                      </div>

                      {/* Match Reason Rationale */}
                      <div className="mt-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/60 rounded-lg p-2.5 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                        <Bot className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">Match Rationale: </span>
                          <span className="text-slate-600 dark:text-slate-300">{match.reason}</span>
                        </div>
                      </div>

                      {/* Technology & Sector Tags */}
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">
                          Tags:
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          Sector: {startup.sector}
                        </span>
                        {(startup.keywords || []).map((tag, tIdx) => {
                          const isMatched = match.details?.keywordMatches?.some(
                            (k) => k.toLowerCase() === tag.toLowerCase()
                          );
                          return (
                            <span
                              key={tIdx}
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                                isMatched
                                  ? 'bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-700'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              {tag}
                            </span>
                          );
                        })}
                      </div>

                      {/* Footer Actions: Propose Pilot / Initiate Match button */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          Track Record:{' '}
                          <strong className="text-slate-700 dark:text-slate-300">
                            {startup.pastPilotCount} Gov Pilots ({startup.successRatePercent}% Validated)
                          </strong>
                        </div>

                        <div className="flex items-center gap-2">
                          {startup.hasVerifiedPassport && onViewPassport && (
                            <button
                              type="button"
                              onClick={() => onViewPassport(startup.id)}
                              className="text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                            >
                              <Award className="w-3.5 h-3.5 text-amber-500" />
                              <span>View Passport</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleInitiateClick(match)}
                            disabled={isProposing}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white transition shadow-xs ${
                              isSuccess
                                ? 'bg-emerald-600 hover:bg-emerald-500'
                                : 'bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 shadow-teal-500/20'
                            }`}
                          >
                            {isProposing ? (
                              <>
                                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                                <span>Linking Pipeline...</span>
                              </>
                            ) : isSuccess ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Match Linked!</span>
                              </>
                            ) : (
                              <>
                                <Rocket className="w-3.5 h-3.5" />
                                <span>Propose Pilot</span>
                                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Clicking <strong>Propose Pilot</strong> creates a match entry and proceeds to standard 4-milestone pilot deployment.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
