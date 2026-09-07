import React, { useState, useEffect } from 'react';
import {
  UserRole,
  User,
  Department,
  Startup,
  ProblemStatement,
  Pilot,
  Milestone,
  PaymentRecord,
  PilotPassport,
  PlatformAnalytics,
  Validator,
} from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { RoleSelectionLanding } from './components/RoleSelectionLanding';
import { DepartmentDashboard } from './components/DepartmentDashboard';
import { StartupDashboard } from './components/StartupDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ValidatorDashboard } from './components/ValidatorDashboard';
import { PublicDashboard } from './components/PublicDashboard';
import { ProblemModal } from './components/ProblemModal';
import { CreatePilotModal } from './components/CreatePilotModal';
import { SubmitMilestoneModal } from './components/SubmitMilestoneModal';
import { PilotDetailModal } from './components/PilotDetailModal';
import { PassportDetailModal } from './components/PassportDetailModal';
import { PilotPassportModal } from './components/PilotPassportModal';
import { PassportEvaluationModal } from './components/PassportEvaluationModal';
import { PassportEvaluationInputs } from './utils/passportScore';
import { ProblemDetailModal } from './components/ProblemDetailModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AlertCircle, CheckCircle2, Info, Loader2 } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { DashboardSkeleton } from './components/DashboardSkeleton';

export function App() {
  const {
    currentUser,
    currentRole,
    isLoading: authLoading,
    authenticatedFetch,
    isPublicMode,
  } = useAuth();

  // Role Selection Screen State
  const [showRoleSelection, setShowRoleSelection] = useState<boolean>(false);

  // Application Data State
  const [departments, setDepartments] = useState<Department[]>([]);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [problemStatements, setProblemStatements] = useState<ProblemStatement[]>([]);
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [passports, setPassports] = useState<PilotPassport[]>([]);
  const [validators, setValidators] = useState<Validator[]>([]);
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [resettingDb, setResettingDb] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [authModalRole, setAuthModalRole] = useState<'department' | 'startup' | 'validator' | 'admin'>('department');

  const handleOpenAuthModal = (
    mode: 'login' | 'signup' = 'login',
    role: 'department' | 'startup' | 'validator' | 'admin' = 'department'
  ) => {
    setAuthModalMode(mode);
    setAuthModalRole(role);
    setIsAuthModalOpen(true);
  };

  // Modal States
  const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
  const [isProblemDetailModalOpen, setIsProblemDetailModalOpen] = useState(false);
  const [selectedProblemForDetail, setSelectedProblemForDetail] = useState<ProblemStatement | null>(null);
  const [isCreatePilotModalOpen, setIsCreatePilotModalOpen] = useState(false);
  const [selectedProblemForPilot, setSelectedProblemForPilot] = useState<ProblemStatement | null>(null);
  const [selectedStartupForPilot, setSelectedStartupForPilot] = useState<Startup | null>(null);

  const [isSubmitMilestoneModalOpen, setIsSubmitMilestoneModalOpen] = useState(false);
  const [selectedMilestoneForSubmit, setSelectedMilestoneForSubmit] = useState<Milestone | null>(null);

  const [isPilotDetailModalOpen, setIsPilotDetailModalOpen] = useState(false);
  const [selectedPilotForDetail, setSelectedPilotForDetail] = useState<Pilot | null>(null);

  const [isPassportModalOpen, setIsPassportModalOpen] = useState(false);
  const [selectedPassportForDetail, setSelectedPassportForDetail] = useState<PilotPassport | null>(null);

  const [isPilotPassportModalOpen, setIsPilotPassportModalOpen] = useState(false);
  const [selectedPilotForPassport, setSelectedPilotForPassport] = useState<Pilot | null>(null);

  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [selectedPilotForEvaluation, setSelectedPilotForEvaluation] = useState<Pilot | null>(null);
  const [submittingEvaluation, setSubmittingEvaluation] = useState(false);

  // Operation In-Progress Flags
  const [submittingProblem, setSubmittingProblem] = useState(false);
  const [submittingPilot, setSubmittingPilot] = useState(false);
  const [submittingMilestoneProof, setSubmittingMilestoneProof] = useState(false);
  const [verifyingMilestoneId, setVerifyingMilestoneId] = useState<string | null>(null);
  const [approvingPaymentId, setApprovingPaymentId] = useState<string | null>(null);
  const [markingPaidPaymentId, setMarkingPaidPaymentId] = useState<string | null>(null);
  const [generatingPassport, setGeneratingPassport] = useState(false);

  // Show auto-dismissing toast notifications (3 seconds duration)
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Safe JSON fetching helper
  const safeFetchJson = async (url: string, fallback: any = []) => {
    try {
      const res = await fetch(url);
      if (!res.ok) return fallback;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await res.json();
      }
      return fallback;
    } catch (e) {
      console.warn(`Fetch error for ${url}:`, e);
      return fallback;
    }
  };

  // Fetch all core datasets from REST APIs
  const fetchAllData = async () => {
    try {
      const [
        deptsRes,
        startupsRes,
        probsRes,
        pilotsRes,
        paymentsRes,
        passportsRes,
        validatorsRes,
        analyticsRes,
      ] = await Promise.all([
        safeFetchJson('/api/departments', []),
        safeFetchJson('/api/startups', []),
        safeFetchJson('/api/problem-statements', []),
        safeFetchJson('/api/pilots', []),
        safeFetchJson('/api/payments', []),
        safeFetchJson('/api/passports', []),
        safeFetchJson('/api/validators', []),
        safeFetchJson('/api/analytics', null),
      ]);

      if (Array.isArray(deptsRes)) setDepartments(deptsRes);
      if (Array.isArray(startupsRes)) setStartups(startupsRes);
      if (Array.isArray(probsRes)) setProblemStatements(probsRes);
      if (Array.isArray(pilotsRes)) setPilots(pilotsRes);
      if (Array.isArray(paymentsRes)) setPayments(paymentsRes);
      if (Array.isArray(passportsRes)) setPassports(passportsRes);
      if (Array.isArray(validatorsRes)) setValidators(validatorsRes);
      if (analyticsRes) setAnalytics(analyticsRes);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load platform data:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Effective user for dashboard display and permission checks
  const effectiveUser: User = currentUser || {
    id: 'guest-public',
    name: 'Public Citizen / Explorer',
    role: 'public',
    organization: 'Citizen Transparency Portal',
    email: 'citizen@transparency.gov.in',
  };

  // Handler 1: Post New Problem Statement (Restricted to Government Department & Admin)
  const handleCreateProblem = async (problemData: any) => {
    if (!currentUser) {
      showToast('Please sign in to publish a problem statement.', 'info');
      handleOpenAuthModal('login', 'department');
      return;
    }
    if (currentUser.role !== 'department' && currentUser.role !== 'admin') {
      showToast("Access Denied: Only 'Government Department' officers can publish problem statements.", 'error');
      return;
    }

    setSubmittingProblem(true);
    try {
      const payload = {
        ...problemData,
        departmentId: currentUser.departmentId || problemData.departmentId || departments[0]?.id || 'dept-1',
        departmentName: currentUser.departmentName || departments.find((d) => d.id === currentUser.departmentId)?.name || problemData.departmentName,
      };

      const res = await authenticatedFetch('/api/problem-statements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to post problem statement');
      }
      const data = await res.json();
      const newProblem = data.problem || data;
      setProblemStatements((prev) => [newProblem, ...prev]);
      showToast(`Problem Statement "${newProblem.title}" published! AI matching is active.`, 'success');
      setIsProblemModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Error posting problem', 'error');
    } finally {
      setSubmittingProblem(false);
    }
  };

  // Handler 2: Launch New Pilot Agreement (Restricted to Government Department & Admin)
  const handleInitiatePilot = (problem: ProblemStatement, startup: Startup) => {
    if (!currentUser) {
      showToast('Please sign in to initiate a sandbox pilot agreement.', 'info');
      handleOpenAuthModal('login', 'department');
      return;
    }
    if (currentUser.role !== 'department' && currentUser.role !== 'admin') {
      showToast("Access Denied: Only 'Government Department' can launch pilot agreements.", 'error');
      return;
    }
    setSelectedProblemForPilot(problem);
    setSelectedStartupForPilot(startup);
    setIsCreatePilotModalOpen(true);
  };

  // Handler 2b: Open Problem Detail View with Ranked Startup Matches
  const handleSelectProblemForDetail = (problem: ProblemStatement) => {
    console.log('[App] Opening ProblemDetailModal for problem:', problem.id, problem.title);
    setSelectedProblemForDetail(problem);
    setIsProblemDetailModalOpen(true);
  };

  // Handler 2c: Propose Pilot directly from Problem Detail View
  const handleProposePilotFromDetail = (
    problem: ProblemStatement,
    startup: Startup,
    score: number,
    reason: string
  ) => {
    console.log(`[App] Propose Pilot clicked from detail view: problem=${problem.id}, startup=${startup.id}, score=${score}%, reason=${reason}`);
    setIsProblemDetailModalOpen(false);
    handleInitiatePilot(problem, startup);
  };

  const handleCreatePilot = async (pilotData: any) => {
    if (!currentUser) {
      showToast('Please sign in to launch pilot agreement.', 'info');
      handleOpenAuthModal('login', 'department');
      return;
    }
    if (currentUser.role !== 'department' && currentUser.role !== 'admin') {
      showToast("Access Denied: Only 'Government Department' or 'Admin' can launch pilot agreements.", 'error');
      return;
    }

    setSubmittingPilot(true);
    try {
      const res = await authenticatedFetch('/api/pilots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pilotData),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to launch pilot agreement');
      }
      await fetchAllData();
      showToast('Pilot agreement successfully executed with 4-milestone template!', 'success');
      setIsCreatePilotModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Error creating pilot', 'error');
    } finally {
      setSubmittingPilot(false);
    }
  };

  // Handler 3: Submit Milestone Proof (Restricted to Startup Innovator & Admin)
  const handleOpenSubmitMilestone = (milestone: Milestone) => {
    if (!currentUser) {
      showToast('Please sign in as a Startup Innovator to submit milestone telemetry.', 'info');
      handleOpenAuthModal('login', 'startup');
      return;
    }
    if (currentUser.role !== 'startup' && currentUser.role !== 'admin') {
      showToast("Access Denied: Only 'Startup Innovator' can submit milestone telemetry.", 'error');
      return;
    }
    setSelectedMilestoneForSubmit(milestone);
    setIsSubmitMilestoneModalOpen(true);
  };

  const handleSubmitMilestoneProof = async (data: {
    milestoneId: string;
    submittedValue: number;
    submittedProofUrl: string;
    submittedNotes: string;
  }) => {
    if (!currentUser) {
      showToast('Please sign in as a Startup Innovator to submit milestone telemetry.', 'info');
      handleOpenAuthModal('login', 'startup');
      return;
    }
    if (currentUser.role !== 'startup' && currentUser.role !== 'admin') {
      showToast("Access Denied: Only 'Startup Innovator' role can submit solutions and update pilot progress.", 'error');
      return;
    }

    setSubmittingMilestoneProof(true);
    try {
      const res = await authenticatedFetch(`/api/milestones/${data.milestoneId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to submit milestone proof');
      }
      await fetchAllData();
      showToast('Milestone telemetry proof submitted! Rule-based check triggered.', 'success');
      setIsSubmitMilestoneModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Error submitting milestone proof', 'error');
    } finally {
      setSubmittingMilestoneProof(false);
    }
  };

  // Handler 4: Rule-based KPI Check & Verification (Restricted to Independent Validator & Admin)
  const handleVerifyMilestone = async (milestoneId: string) => {
    if (!currentUser) {
      showToast('Please sign in as an Independent Validator to verify milestones.', 'info');
      handleOpenAuthModal('login', 'validator');
      return;
    }
    if (currentUser.role !== 'validator' && currentUser.role !== 'admin') {
      showToast("Access Denied: Only 'Independent Validator' role can verify milestones.", 'error');
      return;
    }

    setVerifyingMilestoneId(milestoneId);
    try {
      const res = await authenticatedFetch(`/api/milestones/${milestoneId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verifiedBy: currentUser.name, validatorName: currentUser.name }),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Verification check failed');
      }
      await fetchAllData();
      showToast('Rule check passed! Milestone verified and payment instruction queued for Treasury.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Verification failed', 'error');
    } finally {
      setVerifyingMilestoneId(null);
    }
  };

  // Handler 5: Approve & Send to Treasury (Restricted to Admin / MSInS Directorate)
  const handleApprovePayment = async (paymentId: string) => {
    if (!currentUser) {
      showToast('Please sign in as Admin to authorize Treasury payouts.', 'info');
      handleOpenAuthModal('login', 'admin');
      return;
    }
    if (currentUser.role !== 'admin') {
      showToast("Access Denied: Only 'Admin' role can approve payments and govern treasury payouts.", 'error');
      return;
    }

    setApprovingPaymentId(paymentId);
    try {
      const res = await authenticatedFetch(`/api/payments/${paymentId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to approve payment');
      }
      const updated = await res.json();
      const refNumber = updated.payment?.treasuryRefNumber || updated.treasuryRefNumber || 'PFMS-PROCESSED';
      await fetchAllData();
      showToast(`Payment approved and dispatched to State Treasury (Ref: ${refNumber})!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Approval failed', 'error');
    } finally {
      setApprovingPaymentId(null);
    }
  };

  // Handler 6: Simulate Treasury Settlement / Mark Paid (Restricted to Admin)
  const handleMarkPaymentPaid = async (paymentId: string) => {
    if (!currentUser) {
      showToast('Please sign in as Admin to record treasury settlements.', 'info');
      handleOpenAuthModal('login', 'admin');
      return;
    }
    if (currentUser.role !== 'admin') {
      showToast("Access Denied: Only 'Admin' role can record or settle treasury payments.", 'error');
      return;
    }

    setMarkingPaidPaymentId(paymentId);
    try {
      const res = await authenticatedFetch(`/api/payments/${paymentId}/paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to settle payment');
      }
      await fetchAllData();
      showToast('Disbursement completed! Funds credited directly to startup bank account via PFMS.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Settlement failed', 'error');
    } finally {
      setMarkingPaidPaymentId(null);
    }
  };

  // Handler 7: Mint Digital Pilot Passport with full weighted scoring (Restricted to Validator & Admin)
  const handleGeneratePassport = async (pilotId: string) => {
    if (!currentUser) {
      showToast('Please sign in as an Independent Validator to mint Pilot Passports.', 'info');
      handleOpenAuthModal('login', 'validator');
      return;
    }
    if (currentUser.role !== 'validator' && currentUser.role !== 'admin') {
      showToast("Access Denied: Only 'Independent Validator' role can mint or issue Pilot Passports.", 'error');
      return;
    }

    setGeneratingPassport(true);
    try {
      const res = await authenticatedFetch('/api/passports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pilotId }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to issue passport');
      }
      const data = await res.json();
      const newPassport = data.passport || data;
      await fetchAllData();
      const matchedPilot = pilots.find((p) => p.id === pilotId);
      if (matchedPilot) {
        setSelectedPilotForPassport(matchedPilot);
        setSelectedPassportForDetail(newPassport);
        setIsPilotPassportModalOpen(true);
      } else {
        setSelectedPassportForDetail(newPassport);
        setIsPassportModalOpen(true);
      }
      showToast(`🎉 Digital Pilot Passport successfully minted for ${newPassport.startupName}! Score: ${data.metrics?.passportScore || matchedPilot?.passport_score || 88}/100`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to mint passport', 'error');
    } finally {
      setGeneratingPassport(false);
    }
  };

  // Handler 8: View Passport Credential Modal (inspect full 6-factor scorecard)
  const handleViewPassportByStartup = async (identifier: string) => {
    console.log('🔍 [App] handleViewPassportByStartup triggered with identifier:', identifier);
    if (!identifier) {
      showToast('Identifier required to view passport.', 'info');
      return;
    }

    const cleanId = identifier.trim();
    // Match by startupId, pilotId, or record id (case-insensitive)
    const matchedPilot = pilots.find(
      (p) =>
        p.startupId === cleanId ||
        p.id === cleanId ||
        p.startupId?.toLowerCase() === cleanId.toLowerCase() ||
        p.id?.toLowerCase() === cleanId.toLowerCase()
    );

    let passport = passports.find(
      (p) =>
        p.startupId === cleanId ||
        p.pilotId === cleanId ||
        p.id === cleanId ||
        p.startupId?.toLowerCase() === cleanId.toLowerCase() ||
        p.pilotId?.toLowerCase() === cleanId.toLowerCase() ||
        p.id?.toLowerCase() === cleanId.toLowerCase()
    );

    if (!passport && matchedPilot) {
      passport = passports.find(
        (p) =>
          p.pilotId === matchedPilot.id ||
          p.startupId === matchedPilot.startupId
      );
    }

    // If passport not in local cache, fetch from API endpoint
    if (!passport) {
      try {
        const queryId = matchedPilot?.id || cleanId;
        const res = await fetch(`/api/passports/${queryId}`);
        if (res.ok) {
          const fetched = await res.json();
          if (fetched && (fetched.id || fetched.pilotId)) {
            passport = fetched;
          }
        }
      } catch (fetchErr) {
        console.warn('⚠️ [App] Secondary passport API fetch failed gracefully:', fetchErr);
      }
    }

    if (matchedPilot) {
      setSelectedPilotForPassport(matchedPilot);
      setSelectedPassportForDetail(passport || null);
      setIsPilotPassportModalOpen(true);
    } else if (passport) {
      // If passport is found, check if we can locate matching pilot
      const linkedPilot = pilots.find(
        (p) => p.id === passport?.pilotId || p.startupId === passport?.startupId
      );
      if (linkedPilot) {
        setSelectedPilotForPassport(linkedPilot);
        setSelectedPassportForDetail(passport);
        setIsPilotPassportModalOpen(true);
      } else {
        setSelectedPassportForDetail(passport);
        setIsPassportModalOpen(true);
      }
    } else {
      showToast('No active passport found for this pilot or startup yet.', 'info');
    }
  };

  // Handler 9: Open Pilot Passport Modal directly from Pilot Record
  const handleOpenPilotPassport = (pilot: Pilot) => {
    console.log('🔍 [App] handleOpenPilotPassport triggered with pilot:', pilot?.id, pilot?.startupName);
    const passport = passports.find(
      (p) =>
        p.pilotId === pilot?.id ||
        p.startupId === pilot?.startupId ||
        p.pilotId?.toLowerCase() === pilot?.id?.toLowerCase()
    );
    setSelectedPilotForPassport(pilot);
    setSelectedPassportForDetail(passport || null);
    setIsPilotPassportModalOpen(true);
  };

  // Handler 10: Open Validator Evaluation Modal
  const handleOpenEvaluationModal = (pilot: Pilot) => {
    setSelectedPilotForEvaluation(pilot);
    setIsEvaluationModalOpen(true);
  };

  // Handler 11: Submit Validator Metrics & Persist to Supabase (Restricted to Validator & Admin)
  const handleSubmitEvaluation = async (pilotId: string, evaluation: PassportEvaluationInputs) => {
    if (!currentUser) {
      showToast('Please sign in as an Independent Validator to submit passport metrics.', 'info');
      handleOpenAuthModal('login', 'validator');
      return;
    }
    if (currentUser.role !== 'validator' && currentUser.role !== 'admin') {
      showToast("Access Denied: Only 'Independent Validator' role can enter compliance scores, reliability metrics, and expert validation scores.", 'error');
      return;
    }

    setSubmittingEvaluation(true);
    try {
      const res = await authenticatedFetch(`/api/pilots/${pilotId}/passport-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evaluation),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to persist passport metrics');
      }
      const data = await res.json();
      await fetchAllData();
      setIsEvaluationModalOpen(false);

      const updatedPilot = data.pilot || pilots.find((p) => p.id === pilotId);
      if (updatedPilot) {
        setSelectedPilotForPassport(updatedPilot);
        const pass = data.passport || passports.find((p) => p.pilotId === pilotId || p.startupId === updatedPilot.startupId);
        setSelectedPassportForDetail(pass || null);
        setIsPilotPassportModalOpen(true);
      }

      showToast(
        `🎉 Pilot Passport minted! Category: ${data.breakdown?.passportCategory || 'Verified'} (${data.breakdown?.passportScore || 'Score Updated'}/100)`,
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Error generating passport evaluation', 'error');
    } finally {
      setSubmittingEvaluation(false);
    }
  };

  // Handler 12: Direct Passport Minted Callback from MintPassportModal
  const handlePassportMinted = (newPassport: PilotPassport, updatedPilot: Pilot) => {
    setPassports((prev) => {
      const exists = prev.some((p) => p.id === newPassport.id || p.pilotId === newPassport.pilotId);
      if (exists) {
        return prev.map((p) => (p.id === newPassport.id || p.pilotId === newPassport.pilotId ? newPassport : p));
      }
      return [newPassport, ...prev];
    });

    setPilots((prev) =>
      prev.map((p) => (p.id === updatedPilot.id ? updatedPilot : p))
    );

    showToast(
      `🎉 Official Pilot Passport successfully minted for ${newPassport.startupName}! Score: ${newPassport.passportScore || updatedPilot.passport_score || 90}/100`,
      'success'
    );
    fetchAllData();
  };

  // Reset Database Handler
  const handleResetDatabase = async () => {
    setResettingDb(true);
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (!res.ok) throw new Error('Reset failed');
      await fetchAllData();
      showToast('Sandbox database successfully reset to clean demo seed state!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error resetting DB', 'error');
    } finally {
      setResettingDb(false);
    }
  };

  // Open Pilot Console Modal
  const handleViewPilotDetail = (pilot: Pilot) => {
    const current = pilots.find((p) => p.id === pilot.id) || pilot;
    setSelectedPilotForDetail(current);
    setIsPilotDetailModalOpen(true);
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col font-sans text-slate-800 dark:text-slate-100 selection:bg-teal-500 selection:text-white transition-colors duration-150">
      {/* Toast Alert Notification (Slide in from top, 3s auto-dismiss) */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-4 duration-200 ease-out max-w-md">
          <div
            className={`relative overflow-hidden flex items-center space-x-3 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold backdrop-blur-md ${
              toastMessage.type === 'success'
                ? 'bg-emerald-50/95 dark:bg-emerald-950/90 text-emerald-950 dark:text-emerald-100 border-emerald-300 dark:border-emerald-700 shadow-emerald-900/10'
                : toastMessage.type === 'error'
                ? 'bg-rose-50/95 dark:bg-rose-950/90 text-rose-950 dark:text-rose-100 border-rose-300 dark:border-rose-700 shadow-rose-900/10'
                : 'bg-white/95 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700 shadow-black/10'
            }`}
          >
            {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
            {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />}
            {toastMessage.type === 'info' && <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />}
            <span className="leading-snug pr-2">{toastMessage.text}</span>
            {/* Auto-dismiss progress bar (3 seconds) */}
            <div
              className={`absolute bottom-0 left-0 h-0.5 w-full ${
                toastMessage.type === 'success'
                  ? 'bg-emerald-500'
                  : toastMessage.type === 'error'
                  ? 'bg-rose-500'
                  : 'bg-teal-500'
              }`}
              style={{ animation: 'toastProgress 3000ms linear forwards' }}
            />
          </div>
        </div>
      )}

      {/* Top Header with Role Switcher & Onboarding Trigger */}
      <Header
        currentRole={currentRole}
        currentUser={currentUser}
        onOpenRoleSelection={() => setShowRoleSelection(true)}
        onOpenAuthModal={(mode) => handleOpenAuthModal(mode || 'login')}
      />

      {/* Main View Area */}
      {loading ? (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <DashboardSkeleton />
        </main>
      ) : showRoleSelection ? (
        <RoleSelectionLanding
          selectedRole={currentRole}
          onSelectRole={(role) => {
            setShowRoleSelection(false);
          }}
          onOpenAuthModal={(role) => {
            handleOpenAuthModal('login', role);
          }}
        />
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div key={currentRole} className="dashboard-view-anim">
            {currentRole === 'department' && (
            <DepartmentDashboard
              currentUser={effectiveUser}
              departments={departments}
              problemStatements={problemStatements}
              pilots={pilots}
              payments={payments}
              startups={startups}
              passports={passports}
              onOpenNewProblem={() => {
                if (!currentUser) {
                  showToast('Please sign in to publish a problem statement.', 'info');
                  handleOpenAuthModal('login', 'department');
                  return;
                }
                if (currentUser.role !== 'department' && currentUser.role !== 'admin') {
                  showToast("Access Denied: Only 'Government Department' can publish problem statements.", 'error');
                  return;
                }
                setIsProblemModalOpen(true);
              }}
              onSelectProblem={handleSelectProblemForDetail}
              onInitiatePilot={handleInitiatePilot}
              onViewPilotDetail={handleViewPilotDetail}
              onViewPassport={handleViewPassportByStartup}
              onApprovePayment={handleApprovePayment}
              onMarkPaymentPaid={handleMarkPaymentPaid}
              approvingPaymentId={approvingPaymentId}
              markingPaidPaymentId={markingPaidPaymentId}
            />
          )}

          {currentRole === 'startup' && (
            <StartupDashboard
              currentUser={effectiveUser}
              startup={
                (currentUser?.startupId ? startups.find((s) => s.id === currentUser.startupId) : null) ||
                startups[0] ||
                ({ id: 'st-1', name: currentUser?.organization || 'Innovator Hub', sector: 'GovTech' } as Startup)
              }
              startups={startups}
              problemStatements={problemStatements}
              pilots={pilots}
              payments={payments}
              passports={passports}
              onOpenSubmitMilestone={handleOpenSubmitMilestone}
              onViewPilotDetail={handleViewPilotDetail}
              onViewPassport={handleViewPassportByStartup}
              onApplyProblem={(prob) => showToast(`Application logged for "${prob.title}"!`, 'success')}
            />
          )}

          {currentRole === 'admin' && (
            <AdminDashboard
              currentUser={effectiveUser}
              validators={validators}
              analytics={analytics}
              pilots={pilots}
              payments={payments}
              departments={departments}
              startups={startups}
              onAddValidator={async (val) => {
                if (!currentUser || currentUser.role !== 'admin') {
                  showToast("Access Denied: Only 'Admin' role can empanel validators.", 'error');
                  return;
                }
                const res = await authenticatedFetch('/api/validators', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(val),
                });
                if (!res.ok) {
                  const errData = await res.json().catch(() => ({}));
                  showToast(errData.error || 'Failed to empanel validator', 'error');
                  return;
                }
                const newVal = await res.json();
                setValidators((prev) => [...prev, newVal]);
                showToast(`Validator "${newVal.name}" successfully empanelled!`, 'success');
              }}
              onApprovePayment={handleApprovePayment}
              onMarkPaymentPaid={handleMarkPaymentPaid}
            />
          )}

          {currentRole === 'validator' && (
            <ValidatorDashboard
              currentUser={effectiveUser}
              validator={
                (currentUser?.validatorId ? validators.find((v) => v.id === currentUser.validatorId) : null) ||
                validators[0] ||
                ({ id: 'val-1', name: currentUser?.name || 'Dr. K. S. Raman', organization: currentUser?.organization || 'CSIR-CRRI' } as Validator)
              }
              pilots={pilots}
              passports={passports}
              onVerifyMilestone={(_p, m) => handleVerifyMilestone(m.id)}
              onOpenAuditMilestone={(_p, m) => handleVerifyMilestone(m.id)}
              onGeneratePassport={handleGeneratePassport}
              onOpenMintPassport={handleOpenEvaluationModal}
              onPassportMinted={handlePassportMinted}
              onViewPassport={handleViewPassportByStartup}
              onViewPilotDetail={handleViewPilotDetail}
              verifyingId={verifyingMilestoneId}
              generatingPassport={generatingPassport}
              authenticatedFetch={authenticatedFetch}
            />
          )}

          {currentRole === 'public' && (
            <PublicDashboard
              pilots={pilots}
              payments={payments}
              passports={passports}
              analytics={analytics}
              problemStatements={problemStatements}
              startups={startups}
              onViewPassport={handleViewPassportByStartup}
              onViewPilotDetail={handleViewPilotDetail}
              onViewPilotPassport={handleOpenPilotPassport}
            />
          )}
          </div>
        </main>
      )}

      {/* Footer with Compliance details and DB reset */}
      <Footer onResetDb={handleResetDatabase} resetting={resettingDb} />

      {/* Modals */}
      <ProblemDetailModal
        isOpen={isProblemDetailModalOpen}
        onClose={() => setIsProblemDetailModalOpen(false)}
        problem={selectedProblemForDetail}
        startups={startups}
        passports={passports}
        onProposePilot={handleProposePilotFromDetail}
        onViewPassport={handleViewPassportByStartup}
      />

      <ProblemModal
        isOpen={isProblemModalOpen}
        onClose={() => setIsProblemModalOpen(false)}
        onSubmit={handleCreateProblem}
        departments={departments}
        loading={submittingProblem}
      />

      <CreatePilotModal
        isOpen={isCreatePilotModalOpen}
        onClose={() => setIsCreatePilotModalOpen(false)}
        problem={selectedProblemForPilot}
        startup={selectedStartupForPilot}
        validators={validators}
        onSubmit={handleCreatePilot}
        loading={submittingPilot}
      />

      <SubmitMilestoneModal
        isOpen={isSubmitMilestoneModalOpen}
        onClose={() => setIsSubmitMilestoneModalOpen(false)}
        milestone={selectedMilestoneForSubmit}
        onSubmit={handleSubmitMilestoneProof}
        loading={submittingMilestoneProof}
      />

      <PilotDetailModal
        isOpen={isPilotDetailModalOpen}
        onClose={() => setIsPilotDetailModalOpen(false)}
        pilot={selectedPilotForDetail ? pilots.find((p) => p.id === selectedPilotForDetail.id) || selectedPilotForDetail : null}
        currentRole={currentRole}
        onOpenSubmitMilestone={handleOpenSubmitMilestone}
        onVerifyMilestone={handleVerifyMilestone}
        onApprovePayment={handleApprovePayment}
        onMarkPaymentPaid={handleMarkPaymentPaid}
        onGeneratePassport={handleGeneratePassport}
        onViewPassport={handleViewPassportByStartup}
        onViewPilotPassport={handleOpenPilotPassport}
        onOpenPassportEvaluation={handleOpenEvaluationModal}
        verifyingId={verifyingMilestoneId}
        approvingId={approvingPaymentId}
        generatingPassport={generatingPassport}
      />

      <ErrorBoundary
        fallbackTitle="Digital Pilot Passport View"
        data={selectedPassportForDetail}
        onClose={() => setIsPassportModalOpen(false)}
      >
        <PassportDetailModal
          isOpen={isPassportModalOpen}
          onClose={() => setIsPassportModalOpen(false)}
          passport={selectedPassportForDetail}
        />
      </ErrorBoundary>

      <ErrorBoundary
        fallbackTitle="Pilot Passport & Scorecard View"
        data={{ pilot: selectedPilotForPassport, passport: selectedPassportForDetail }}
        onClose={() => setIsPilotPassportModalOpen(false)}
      >
        <PilotPassportModal
          isOpen={isPilotPassportModalOpen}
          onClose={() => setIsPilotPassportModalOpen(false)}
          pilot={selectedPilotForPassport}
          passport={selectedPassportForDetail}
          canEvaluate={currentRole === 'validator' || currentRole === 'admin'}
          currentRole={currentRole}
          onOpenEvaluation={() => {
            setIsPilotPassportModalOpen(false);
            if (selectedPilotForPassport) {
              handleOpenEvaluationModal(selectedPilotForPassport);
            }
          }}
        />
      </ErrorBoundary>

      <PassportEvaluationModal
        isOpen={isEvaluationModalOpen}
        onClose={() => setIsEvaluationModalOpen(false)}
        pilot={selectedPilotForEvaluation}
        onSubmit={handleSubmitEvaluation}
        submitting={submittingEvaluation}
      />

      {/* Supabase Real Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        initialRole={authModalRole}
        onSuccess={() => {
          showToast('Authentication successful!', 'success');
          setShowRoleSelection(false);
          fetchAllData();
        }}
      />
    </div>
  );
}
export default App;
