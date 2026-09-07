import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Rocket,
  ShieldCheck,
  CheckCircle2,
  Globe,
  Lock,
  Mail,
  User as UserIcon,
  Briefcase,
  AlertCircle,
  Loader2,
  X,
  Sparkles,
  ArrowRight,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Department } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  initialRole?: 'department' | 'startup' | 'validator' | 'admin';
  departments?: Department[];
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  initialRole = 'department',
  departments = [],
  onSuccess,
}) => {
  const { login, signup, loginAsDemo } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<'department' | 'startup' | 'validator' | 'admin'>(initialRole);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [designation, setDesignation] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Preset demo accounts for quick testing
  const demoAccounts = [
    {
      role: 'department' as const,
      label: 'Gov Department',
      email: 'officer.pwd@maharashtra.gov.in',
      password: 'DemoPassword123!',
      name: 'Dr. Rajesh Sharma',
      org: 'Public Works & Urban Infrastructure',
      desig: 'Nodal Officer & Chief Engineer',
      icon: Building2,
      color: 'border-sky-300 text-sky-700 bg-sky-50 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
    },
    {
      role: 'startup' as const,
      label: 'Startup Innovator',
      email: 'founder@urbanpulse.ai',
      password: 'DemoPassword123!',
      name: 'Aarav Mehta',
      org: 'UrbanPulse Mobility Systems',
      desig: 'Founder & CEO',
      icon: Rocket,
      color: 'border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    },
    {
      role: 'validator' as const,
      label: 'Independent Validator',
      email: 'validator.crri@csir.res.in',
      password: 'DemoPassword123!',
      name: 'Dr. K. S. Raman',
      org: 'CSIR - Central Road Research Institute',
      desig: 'Lead Technical Auditor',
      icon: CheckCircle2,
      color: 'border-amber-300 text-amber-800 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    },
    {
      role: 'admin' as const,
      label: 'Admin / MSInS',
      email: 'admin.msins@gov.in',
      password: 'DemoPassword123!',
      name: 'Pooja Kulkarni',
      org: 'MSInS State Innovation Directorate',
      desig: 'Mission Director',
      icon: ShieldCheck,
      color: 'border-purple-300 text-purple-700 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    },
  ];

  const handleApplyDemo = async (demo: typeof demoAccounts[0]) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await loginAsDemo({
        email: demo.email,
        password: demo.password,
        role: demo.role,
        name: demo.name,
        organization: demo.org,
        designation: demo.desig,
      });

      if (res.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setErrorMessage(res.error || 'Demo login failed');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    setErrorMessage(null);

    // Step 1: Log form submit triggered
    console.log('[AuthModal Step 1] form submit triggered:', {
      mode,
      role: selectedRole,
      name: name.trim(),
      email: email.trim(),
      organization: organization.trim(),
      departmentId,
    });

    if (loading) return;

    // Form Validation with explicit error messages
    if (mode === 'signup') {
      if (!selectedRole) {
        const err = 'Please select your platform role before proceeding.';
        console.warn('[AuthModal] Validation failed:', err);
        setErrorMessage(err);
        return;
      }

      if (!name || !name.trim()) {
        const err = 'Please enter your full name.';
        console.warn('[AuthModal] Validation failed:', err);
        setErrorMessage(err);
        return;
      }
    }

    if (!email || !email.trim()) {
      const err = 'Please enter your email address.';
      console.warn('[AuthModal] Validation failed:', err);
      setErrorMessage(err);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      const err = 'Please enter a valid email address (e.g. officer@gov.in or founder@startup.in).';
      console.warn('[AuthModal] Validation failed:', err);
      setErrorMessage(err);
      return;
    }

    if (!password) {
      const err = 'Please enter a password.';
      console.warn('[AuthModal] Validation failed:', err);
      setErrorMessage(err);
      return;
    }

    if (password.length < 6) {
      const err = 'Password must be at least 6 characters long.';
      console.warn('[AuthModal] Validation failed:', err);
      setErrorMessage(err);
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email.trim(), password);
        if (res.success) {
          if (onSuccess) onSuccess();
          onClose();
        } else {
          setErrorMessage(res.error || 'Invalid email or password.');
        }
      } else {
        const selectedDept = departments.find((d) => d.id === departmentId);
        const res = await signup({
          email: email.trim(),
          password,
          role: selectedRole,
          name: name.trim(),
          organization:
            organization.trim() ||
            (selectedRole === 'department'
              ? selectedDept?.name || 'Public Infrastructure Division'
              : selectedRole === 'startup'
              ? 'GovTech Innovation Labs'
              : selectedRole === 'validator'
              ? 'Empanelled Quality Council'
              : 'MSInS State Directorate'),
          departmentId: selectedRole === 'department' ? departmentId || 'dept-1' : undefined,
          departmentName: selectedRole === 'department' ? selectedDept?.name || 'Department of Public Works' : undefined,
          designation:
            designation.trim() ||
            (selectedRole === 'department'
              ? 'Nodal Officer'
              : selectedRole === 'startup'
              ? 'Founder & Tech Lead'
              : selectedRole === 'validator'
              ? 'Lead Technical Auditor'
              : 'State Innovation Director'),
        });

        if (res.success) {
          if (onSuccess) onSuccess();
          onClose();
        } else {
          if (
            res.error?.toLowerCase().includes('already exists') ||
            res.error?.toLowerCase().includes('already registered')
          ) {
            setErrorMessage('An account with this email address already exists. We have switched you to the Sign In tab so you can enter your password.');
            setMode('login');
          } else {
            setErrorMessage(res.error || 'Account creation failed. Please check your details.');
          }
        }
      }
    } catch (err: any) {
      console.error('[AuthModal] Unexpected error in handleSubmit:', err);
      setErrorMessage(err.message || 'Authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const roleCards = [
    {
      id: 'department' as const,
      title: 'Government Department',
      subtitle: 'Post challenges & deploy pilots',
      icon: Building2,
      border: 'hover:border-sky-500',
      activeBg: 'bg-sky-50 border-sky-500 dark:bg-sky-950/50 dark:border-sky-400',
      text: 'text-sky-700 dark:text-sky-300',
    },
    {
      id: 'startup' as const,
      title: 'Startup Innovator',
      subtitle: 'Apply, submit telemetry & pilots',
      icon: Rocket,
      border: 'hover:border-emerald-500',
      activeBg: 'bg-emerald-50 border-emerald-500 dark:bg-emerald-950/50 dark:border-emerald-400',
      text: 'text-emerald-700 dark:text-emerald-300',
    },
    {
      id: 'validator' as const,
      title: 'Independent Validator',
      subtitle: 'Verify KPIs & mint passports',
      icon: CheckCircle2,
      border: 'hover:border-amber-500',
      activeBg: 'bg-amber-50 border-amber-500 dark:bg-amber-950/50 dark:border-amber-400',
      text: 'text-amber-800 dark:text-amber-300',
    },
    {
      id: 'admin' as const,
      title: 'Admin',
      subtitle: 'Approve payments & empanelment',
      icon: ShieldCheck,
      border: 'hover:border-purple-500',
      activeBg: 'bg-purple-50 border-purple-500 dark:bg-purple-950/50 dark:border-purple-400',
      text: 'text-purple-700 dark:text-purple-300',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 modal-backdrop-anim">
      <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden modal-content-anim my-8">
        {/* Header with Title and Mode Switcher */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {mode === 'login' ? 'Sign In to NEXAURA' : 'Create Sandbox Account'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Secured with Supabase Auth & Role-Based Access Control
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector: Sign In vs Sign Up */}
        <div className="flex border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 p-1.5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              mode === 'signup'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            Sign Up (Choose Role)
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start space-x-2 text-xs text-rose-800 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Demo Logins Bar (Helpful for instant evaluation) */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                Quick 1-Click Demo Accounts
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((demo) => {
                const Icon = demo.icon;
                return (
                  <button
                    key={demo.role}
                    type="button"
                    disabled={loading}
                    onClick={() => handleApplyDemo(demo)}
                    className={`flex items-center space-x-2 px-2.5 py-2 rounded-xl border text-xs font-semibold text-left transition hover:scale-[1.01] ${demo.color}`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <div className="truncate">
                      <p className="font-bold leading-tight truncate">{demo.label}</p>
                      <p className="text-[10px] opacity-75 truncate">{demo.name.split(' ')[0]}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
            <span className="shrink mx-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              or enter credentials
            </span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* If Signup: Role Selection Grid */}
            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Select Your Platform Role <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {roleCards.map((rc) => {
                    const Icon = rc.icon;
                    const isSelected = selectedRole === rc.id;
                    return (
                      <button
                        key={rc.id}
                        type="button"
                        onClick={() => {
                          setSelectedRole(rc.id);
                          setErrorMessage(null);
                        }}
                        className={`p-3 rounded-2xl border text-left transition relative flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? rc.activeBg
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <Icon className={`w-4 h-4 ${rc.text}`} />
                          {isSelected && <span className="w-2 h-2 rounded-full bg-teal-500"></span>}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                            {rc.title}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {rc.subtitle}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Full Name for Signup */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="e.g. Dr. Rajesh Sharma"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Official Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="name@department.gov.in"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role specific signup fields */}
            {mode === 'signup' && selectedRole === 'department' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Department / Ministry
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select Government Department...</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.state})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Organization / Entity Name
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder={
                      selectedRole === 'department'
                        ? 'e.g. Ministry of Urban Development'
                        : selectedRole === 'startup'
                        ? 'e.g. AquaPure IoT Solutions Pvt Ltd'
                        : selectedRole === 'validator'
                        ? 'e.g. IIT Bombay / CSIR'
                        : 'MSInS Directorate'
                    }
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            )}

            {/* Prominent Error Notice directly above Submit Action */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start space-x-2.5 text-xs text-rose-800 dark:text-rose-300 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                <div className="flex-1">
                  <p className="font-semibold">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                id="auth-submit-btn"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{mode === 'login' ? 'Signing In...' : 'Creating Account & Synchronizing...'}</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In' : 'Create Account & Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Public Transparency Note */}
          <div className="pt-2 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Exploring public transparency data?{' '}
              <button
                type="button"
                onClick={onClose}
                className="text-teal-600 dark:text-teal-400 font-bold hover:underline"
              >
                Browse as Public Guest (Read-Only)
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
