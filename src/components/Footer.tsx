import React from 'react';
import { ShieldCheck, Clock, RefreshCw, Landmark, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  onResetDb?: () => void;
  resetting?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onResetDb, resetting = false }) => {
  return (
    <footer className="bg-slate-100 dark:bg-[#0A0F1D] border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs py-6 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Tagline */}
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-2xs">
              SC
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200">StartupConnect Gov</span>
          </div>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-600">|</span>
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">
            National Sandbox for Fast-Track Public Procurement & Innovation
          </span>
        </div>

        {/* Compliance Badges & DB Reset */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 text-[11px]">
          <div
            className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700/60 shadow-2xs"
            title="Recognized startups fast-tracked under DPIIT guidelines"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>DPIIT Recognized</span>
          </div>

          <div
            className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800/40 shadow-2xs"
            title="Automated alerts and escalations triggered if processing exceeds 10 days"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>10-Day SLA Directive</span>
          </div>

          <div
            className="flex items-center gap-1.5 text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800/40 shadow-2xs"
            title="Public Financial Management System / Treasury integration"
          >
            <Landmark className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>PFMS Treasury Direct</span>
          </div>

          {onResetDb && (
            <button
              onClick={onResetDb}
              disabled={resetting}
              className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 transition shadow-2xs"
              title="Reset database to fresh seed state with 5 depts, 15 startups, and 8 pilots"
            >
              <RefreshCw className={`w-3 h-3 text-slate-500 dark:text-slate-400 ${resetting ? 'animate-spin' : ''}`} />
              <span>{resetting ? 'Resetting DB...' : 'Reset Sandbox'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
        <p>© 2026 Maharashtra State Innovation Society (MSInS) • Department of Higher & Technical Education</p>
        <p className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3 h-3 text-teal-600 dark:text-teal-500" />
          <span>Compliant with Rule 149 & 170(i) GFR 2017 Startup Procurement Framework</span>
        </p>
      </div>
    </footer>
  );
};
