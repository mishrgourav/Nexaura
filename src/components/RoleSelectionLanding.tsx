import React from 'react';
import { UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Rocket,
  ShieldCheck,
  CheckCircle2,
  Globe,
  ArrowRight,
  Sparkles,
  Zap,
  Award,
  Clock,
  Lock,
  Check,
} from 'lucide-react';

interface RoleSelectionLandingProps {
  onSelectRole: (role: UserRole) => void;
  selectedRole?: UserRole;
  onOpenAuthModal?: (role: 'department' | 'startup' | 'validator' | 'admin') => void;
}

interface RoleCardConfig {
  role: UserRole;
  name: string;
  badge: string;
  tagline: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  accentBorder: string;
  hoverGlow: string;
  features: string[];
  recommendedFor: string;
}

export const RoleSelectionLanding: React.FC<RoleSelectionLandingProps> = ({
  onSelectRole,
  selectedRole,
  onOpenAuthModal,
}) => {
  const { currentUser, exitPublicMode } = useAuth();

  const roles: RoleCardConfig[] = [
    {
      role: 'department',
      name: 'Government Department',
      badge: 'Public Sector Buyer',
      tagline: 'Post operational challenges, discover AI-ranked startups, and launch fast-track sandbox pilots.',
      description: 'Define problem statements, evaluate automated AI match scores, sign 4-milestone agreements, and authorize Treasury payouts with 1-click.',
      icon: Building2,
      iconBg: 'bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/30 text-sky-600 dark:text-sky-400',
      iconColor: 'text-sky-600 dark:text-sky-400',
      accentBorder: 'hover:border-sky-500/60 group-hover:border-sky-500/60',
      hoverGlow: 'hover:shadow-sky-500/10',
      features: [
        'AI Problem-to-Startup matching engine',
        'AI Procurement Committee evaluation narratives',
        'Direct 1-click PFMS Treasury approval',
      ],
      recommendedFor: 'Nodal Officers, Procurement Directors, City Engineers',
    },
    {
      role: 'startup',
      name: 'Startup Innovator',
      badge: 'DPIIT Innovator',
      tagline: 'Browse public challenges, upload telemetry proof for rule-checks, and earn reusable Pilot Passports.',
      description: 'Apply to government reverse marketplace challenges, submit sensor telemetry data for automated milestone verification, and track timely payments.',
      icon: Rocket,
      iconBg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      accentBorder: 'hover:border-emerald-500/60 group-hover:border-emerald-500/60',
      hoverGlow: 'hover:shadow-emerald-500/10',
      features: [
        'Reverse marketplace pilot discovery',
        'Automated telemetry & KPI rule verification',
        'Reusable Digital Pilot Passports',
      ],
      recommendedFor: 'Founders, Product Leads, Tech Innovators',
    },
    {
      role: 'admin',
      name: 'Admin / MSInS Directorate',
      badge: 'Innovation Mission',
      tagline: 'Empanel independent auditors, monitor platform-wide payment SLAs, and govern public sandbox pilots.',
      description: 'Oversee multi-department pilot operations, enforce the strict 10-day payment directive with automated escalation warnings, and track state innovation metrics.',
      icon: ShieldCheck,
      iconBg: 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-400',
      iconColor: 'text-purple-600 dark:text-purple-400',
      accentBorder: 'hover:border-purple-500/60 group-hover:border-purple-500/60',
      hoverGlow: 'hover:shadow-purple-500/10',
      features: [
        'Validator empanelment and domain tagging',
        '10-Day SLA breach escalation monitor',
        'Platform-wide taxpayer ROI analytics',
      ],
      recommendedFor: 'State Innovation Directors, Sandbox Administrators',
    },
    {
      role: 'validator',
      name: 'Independent Validator',
      badge: 'Auditing Institution',
      tagline: 'Audit live pilot sensor telemetry against agreed KPI benchmarks and issue official Pilot Passports.',
      description: 'Review empirical telemetry submissions, certify threshold achievements using rule checks, and mint cryptographic SHA-256 Digital Pilot Passports.',
      icon: CheckCircle2,
      iconBg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400',
      iconColor: 'text-amber-600 dark:text-amber-400',
      accentBorder: 'hover:border-amber-500/60 group-hover:border-amber-500/60',
      hoverGlow: 'hover:shadow-amber-500/10',
      features: [
        'Empirical telemetry audit console',
        'Target vs achieved benchmark verification',
        'SHA-256 Digital Pilot Passport minting',
      ],
      recommendedFor: 'IITs, CSIR Labs, Empanelled Testing Agencies',
    },
    {
      role: 'public',
      name: 'Public Transparency',
      badge: 'Open Data Portal',
      tagline: 'Verify cryptographic certificate hashes and inspect state innovation ROI with full transparency.',
      description: 'Public explorer for citizens, journalists, and government agencies to verify startup credentials, inspect past pilot outcomes, and review taxpayer savings.',
      icon: Globe,
      iconBg: 'bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/30 text-cyan-600 dark:text-cyan-400',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      accentBorder: 'hover:border-cyan-500/60 group-hover:border-cyan-500/60',
      hoverGlow: 'hover:shadow-cyan-500/10',
      features: [
        'Cryptographic hash verification tool',
        'Citizen impact & taxpayer savings metrics',
        'Open challenge catalog explorer',
      ],
      recommendedFor: 'Citizens, Procurement Officers, Researchers',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-800 dark:text-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-6xl mx-auto w-full space-y-10">
        {/* Welcome Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-slate-800/90 border border-teal-200 dark:border-slate-700 text-xs font-semibold text-teal-700 dark:text-teal-300 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Govt. Public Procurement & Innovation Sandbox</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Select Your Role to Enter the Platform
          </h1>
          
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Choose your persona below to experience tailored dashboards for problem publishing, AI startup matching, empirical telemetry audits, and fast-track disbursements.
          </p>
        </div>

        {/* 5 Large Interactive Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedRole === item.role;
            const isUserOwnRole = currentUser && currentUser.role === item.role;
            const isLockedForUser = currentUser && currentUser.role !== item.role && item.role !== 'public';

            const handleCardClick = () => {
              if (item.role === 'public') {
                onSelectRole('public');
                return;
              }

              if (isUserOwnRole) {
                exitPublicMode();
                onSelectRole(item.role);
                return;
              }

              if (onOpenAuthModal) {
                onOpenAuthModal(item.role);
              } else {
                onSelectRole(item.role);
              }
            };

            return (
              <div
                key={item.role}
                id={`role-card-${item.role}`}
                onClick={handleCardClick}
                className={`group relative bg-white dark:bg-[#1E293B] rounded-2xl p-6 border transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-xs dark:shadow-lg dark:shadow-black/25 hover:shadow-md dark:hover:shadow-xl ${item.hoverGlow} ${
                  isUserOwnRole
                    ? 'border-teal-500 ring-2 ring-teal-500/30'
                    : isSelected
                    ? 'border-slate-400 dark:border-slate-500 ring-1 ring-slate-400/20'
                    : 'border-slate-200 dark:border-slate-700/80 hover:border-teal-500/50 dark:hover:border-slate-500'
                }`}
              >
                <div className="space-y-4">
                  {/* Top row: Icon + Badge + Auth State */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${item.iconBg}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {isUserOwnRole && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700 flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          My Account
                        </span>
                      )}
                      {isLockedForUser && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          Locked
                        </span>
                      )}
                      {!currentUser && item.role !== 'public' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          Sign In
                        </span>
                      )}
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                        {item.badge}
                      </span>
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {item.tagline}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-400/90 leading-relaxed border-t border-slate-100 dark:border-slate-700/60 pt-3">
                    {item.description}
                  </p>

                  {/* Key Features List */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Key Capabilities:
                    </span>
                    <ul className="space-y-1">
                      {item.features.map((feat, idx) => (
                        <li key={idx} className="text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-teal-400/80 shrink-0"></span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card CTA Action */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[170px]">
                    {item.recommendedFor}
                  </span>
                  
                  <button
                    type="button"
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                      isUserOwnRole
                        ? 'text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 shadow-teal-500/20'
                        : isLockedForUser
                        ? 'text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700'
                        : item.role === 'public'
                        ? 'text-white bg-cyan-600 hover:bg-cyan-700'
                        : 'text-white bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600'
                    }`}
                  >
                    <span>
                      {isUserOwnRole
                        ? 'Enter Dashboard'
                        : isLockedForUser
                        ? 'Switch Account'
                        : item.role === 'public'
                        ? 'Open Portal'
                        : 'Sign In to Role'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Platform Highlight Strip */}
        <div className="bg-white/80 dark:bg-[#1E293B]/70 border border-slate-200 dark:border-slate-700/70 rounded-2xl p-5 shadow-xs dark:shadow-lg flex flex-wrap items-center justify-around gap-4 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Integrated with DPIIT Startup India</span>
          </div>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Strict 10-Day SLA Payment Enforcement</span>
          </div>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>Digital Pilot Passports (SHA-256 Verified)</span>
          </div>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>AI Automated Matching & Procurement Briefs</span>
          </div>
        </div>
      </div>
    </div>
  );
};
