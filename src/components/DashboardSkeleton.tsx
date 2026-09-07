import React from 'react';
import { ShieldCheck, Globe, Building2, Award, Landmark } from 'lucide-react';

interface DashboardSkeletonProps {
  showFullPage?: boolean;
}

export const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({ showFullPage = false }) => {
  const content = (
    <div className="space-y-6">
      {/* Banner Skeleton */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-6 w-72 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-3.5 w-96 bg-slate-100 dark:bg-slate-800/60 rounded animate-pulse" />
          </div>
          <div className="h-8 w-44 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
        </div>

        {/* 4 Stat Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="bg-slate-50 dark:bg-[#0F172A]/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center justify-between"
            >
              <div className="space-y-2">
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-7 w-16 bg-slate-300 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-2.5 w-20 bg-slate-100 dark:bg-slate-800/60 rounded animate-pulse" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Action Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-3 w-64 bg-slate-100 dark:bg-slate-800/60 rounded animate-pulse" />
        </div>
        <div className="h-9 w-36 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
      </div>

      {/* 4 Main Grid Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((card) => (
          <div
            key={card}
            className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
                  <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800/60 rounded-full animate-pulse" />
                </div>
                <div className="h-5 w-3/4 bg-slate-300 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              </div>
              <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse shrink-0" />
            </div>

            {/* Progress Bar Skeleton */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between">
                <div className="h-2.5 w-28 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-2.5 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-slate-300 dark:bg-slate-700 h-full w-2/3 rounded-full animate-pulse" />
              </div>
            </div>

            {/* Card Footer Button Skeleton */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800/60 rounded animate-pulse" />
              <div className="h-8 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (!showFullPage) {
    return content;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col font-sans text-slate-800 dark:text-slate-100">
      {/* Top Header Placeholder */}
      <header className="bg-white dark:bg-[#1E293B] border-b border-slate-200 dark:border-slate-800 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-slate-400 dark:text-slate-600" />
            </div>
            <div className="space-y-1.5">
              <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              <div className="h-2.5 w-60 bg-slate-100 dark:bg-slate-800/60 rounded animate-pulse" />
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-2">
            <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
            <div className="h-8 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
            <div className="h-8 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
            <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          </div>

          <div className="h-9 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        </div>
      </header>

      {/* Main Skeleton Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {content}
      </main>
    </div>
  );
};
