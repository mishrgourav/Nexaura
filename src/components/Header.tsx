import React, { useState, useRef, useEffect } from 'react';
import { UserRole, User } from '../types';
import { useTheme } from '../lib/theme';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Rocket,
  ShieldCheck,
  CheckCircle2,
  Globe,
  ChevronDown,
  Sparkles,
  Info,
  Layers,
  Sun,
  Moon,
  User as UserIcon,
  LogOut,
  KeyRound,
  Lock,
  ExternalLink,
} from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
  currentRole: UserRole;
  onOpenRoleSelection: () => void;
  onOpenAuthModal: (mode?: 'login' | 'signup') => void;
  onOpenNewProblem?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  currentRole,
  onOpenRoleSelection,
  onOpenAuthModal,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { logout, isPublicMode, switchToPublicMode, exitPublicMode } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleConfig: Record<
    UserRole,
    {
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      badgeBg: string;
      badgeText: string;
      badgeBorder: string;
      dotColor: string;
    }
  > = {
    department: {
      label: 'Gov Department',
      icon: Building2,
      badgeBg: 'bg-sky-50 dark:bg-sky-500/15',
      badgeText: 'text-sky-700 dark:text-sky-300',
      badgeBorder: 'border-sky-300 dark:border-sky-500/40',
      dotColor: 'bg-sky-500',
    },
    startup: {
      label: 'Startup Innovator',
      icon: Rocket,
      badgeBg: 'bg-emerald-50 dark:bg-emerald-500/15',
      badgeText: 'text-emerald-700 dark:text-emerald-300',
      badgeBorder: 'border-emerald-300 dark:border-emerald-500/40',
      dotColor: 'bg-emerald-500',
    },
    admin: {
      label: 'Admin / MSInS',
      icon: ShieldCheck,
      badgeBg: 'bg-purple-50 dark:bg-purple-500/15',
      badgeText: 'text-purple-700 dark:text-purple-300',
      badgeBorder: 'border-purple-300 dark:border-purple-500/40',
      dotColor: 'bg-purple-500',
    },
    validator: {
      label: 'Independent Validator',
      icon: CheckCircle2,
      badgeBg: 'bg-amber-50 dark:bg-amber-500/15',
      badgeText: 'text-amber-800 dark:text-amber-300',
      badgeBorder: 'border-amber-300 dark:border-amber-500/40',
      dotColor: 'bg-amber-500',
    },
    public: {
      label: 'Public Transparency',
      icon: Globe,
      badgeBg: 'bg-cyan-50 dark:bg-cyan-500/15',
      badgeText: 'text-cyan-800 dark:text-cyan-300',
      badgeBorder: 'border-cyan-300 dark:border-cyan-500/40',
      dotColor: 'bg-cyan-500',
    },
  };

  const current = roleConfig[currentRole] || roleConfig.public;
  const CurrentIcon = current.icon;

  return (
    <header className="bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-xs dark:shadow-md dark:shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Simple Tagline */}
          <div
            onClick={onOpenRoleSelection}
            className="flex items-center space-x-3 cursor-pointer group select-none"
            title="Return to Portal Navigation"
          >
            <div className="w-9 h-9 rounded-xl border-2 border-blue-500/80 dark:border-blue-400/80 bg-white dark:bg-slate-900 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <Building2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                  StartupConnect
                </span>
                <span className="inline-block w-6 h-4 bg-gradient-to-r from-teal-400 to-blue-600 rounded-xs shadow-2xs"></span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block font-normal">
                Connecting Government Challenges with Startup Innovation
              </p>
            </div>
          </div>

          {/* Right Action Toolbar: Theme Toggle + Auth / Profile Dropdown */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            {/* Info Tooltip for Compliance & Directives */}
            <div className="relative hidden md:block">
              <button
                onMouseEnter={() => setShowInfoTooltip(true)}
                onMouseLeave={() => setShowInfoTooltip(false)}
                onClick={() => setShowInfoTooltip(!showInfoTooltip)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition"
                title="Sandbox Directives & Framework"
                aria-label="Compliance Information"
              >
                <Info className="w-4 h-4" />
              </button>

              {showInfoTooltip && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 shadow-xl text-xs text-slate-600 dark:text-slate-300 z-50 animate-in fade-in duration-150">
                  <div className="font-semibold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" />
                    <span>Sandbox Compliance Framework</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <li>• <strong className="text-slate-800 dark:text-slate-200">Supabase Auth:</strong> Real role-based access & RLS security.</li>
                    <li>• <strong className="text-amber-700 dark:text-amber-300">10-Day Payment Directive:</strong> Automated SLA escalation.</li>
                    <li>• <strong className="text-teal-700 dark:text-teal-300">Digital Pilot Passports:</strong> Cryptographic SHA-256 validation.</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Light / Dark Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700/80 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-700 transition flex items-center justify-center shadow-2xs"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-slate-700" />
              ) : (
                <Sun className="w-4 h-4 text-amber-300" />
              )}
            </button>

            {/* Authentication State & User Profile Controls */}
            {currentUser ? (
              /* Authenticated User Pill with Profile & Logout Menu */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition shadow-2xs ${current.badgeBg} ${current.badgeText} ${current.badgeBorder} hover:brightness-95 dark:hover:brightness-110`}
                  title="Authenticated Profile Options"
                >
                  <span className={`w-2 h-2 rounded-full ${current.dotColor} shrink-0`}></span>
                  <CurrentIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline font-bold">{current.label}</span>
                  <span className="sm:hidden font-mono font-bold capitalize">{currentRole}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile & Session Management Dropdown */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-2xl p-3 shadow-xl dark:shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                    {/* User Profile Header */}
                    <div className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl mb-2.5 border border-slate-200/80 dark:border-slate-700/60">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                          Authenticated Account
                        </span>
                        <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Verified
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</p>
                      {currentUser.organization && (
                        <p className="text-[10px] text-teal-600 dark:text-teal-400 font-medium truncate mt-0.5">
                          {currentUser.organization}
                        </p>
                      )}
                    </div>

                    {/* Active Role Notice */}
                    <div className="px-3 py-2 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 rounded-xl mb-2.5 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                      <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                      <div>
                        <p className="font-bold">Role: {roleConfig[currentUser.role]?.label}</p>
                        <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-tight">
                          Permissions are bound to this account. To change roles, log in with a different account.
                        </p>
                      </div>
                    </div>

                    {/* View Controls */}
                    <div className="space-y-1 text-xs">
                      {isPublicMode ? (
                        <button
                          onClick={() => {
                            exitPublicMode();
                            setIsDropdownOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 font-semibold transition"
                        >
                          <div className="flex items-center space-x-2">
                            <CurrentIcon className="w-3.5 h-3.5" />
                            <span>Return to My Role Dashboard</span>
                          </div>
                          <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            switchToPublicMode();
                            setIsDropdownOpen(false);
                          }}
                          className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                          <span>Preview Public Transparency View</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onOpenRoleSelection();
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span>Role Portal Directory</span>
                      </button>
                    </div>

                    {/* Logout Action */}
                    <div className="mt-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-700/80">
                      <button
                        onClick={async () => {
                          setIsDropdownOpen(false);
                          await logout();
                        }}
                        className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50/70 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition border border-rose-200/60 dark:border-rose-800/40"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Guest / Public Mode Actions */
              <div className="flex items-center space-x-2">
                <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border border-cyan-200 dark:border-cyan-800/60 bg-cyan-50/70 dark:bg-cyan-950/30 text-cyan-800 dark:text-cyan-300 text-xs font-semibold">
                  <Globe className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>Public Portal (Read-Only)</span>
                </div>

                <button
                  onClick={() => onOpenAuthModal('login')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition hover:scale-[1.02]"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={() => onOpenAuthModal('signup')}
                  className="hidden md:flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition"
                >
                  <span>Register</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
