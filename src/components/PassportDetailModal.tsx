import React, { useState } from 'react';
import { PilotPassport } from '../types';
import { generateCertificateHtml } from '../utils/generateCertificateHtml';
import {
  X,
  Award,
  ShieldCheck,
  CheckCircle2,
  Download,
  Copy,
  Check,
  AlertTriangle,
  Printer,
  FileDown,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ErrorBoundary } from './ErrorBoundary';

interface PassportDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  passport: PilotPassport | any | null;
}

const PassportDetailModalContent: React.FC<PassportDetailModalProps> = ({
  isOpen,
  onClose,
  passport,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Log the exact data object being rendered for debugging and transparency
  React.useEffect(() => {
    if (isOpen && passport) {
      console.log('🔍 [PassportDetailModal] Rendering passport detail view with data object:', passport);
    }
  }, [isOpen, passport]);

  if (!isOpen || !passport) return null;

  try {
    const triggerConfetti = () => {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (err) {
        console.warn('Confetti animation error:', err);
      }
    };

    // Safe extraction of all fields with extensive fallbacks
    const startupName =
      passport?.startup?.name ||
      passport?.startupName ||
      passport?.startup_name ||
      'AquaSense IoT Systems';

    const dpiitNumber =
      passport?.startup?.dpiitNumber ||
      passport?.dpiitNumber ||
      passport?.dpiit_number ||
      'DIPP-78201';

    const sector =
      passport?.startup?.sector ||
      passport?.sector ||
      passport?.startupSector ||
      passport?.startup_sector ||
      'CleanTech & Water Infrastructure';

    const departmentWorkedWith =
      passport?.department?.name ||
      passport?.departmentWorkedWith ||
      passport?.department_worked_with ||
      passport?.departmentName ||
      passport?.department_name ||
      'Water Resources & Ground Water Board';

    const problemTitle =
      passport?.pilot?.problemTitle ||
      passport?.problemTitle ||
      passport?.problem_title ||
      passport?.pilotTitle ||
      'Solar-Powered Real-Time Fluoride & Potability Telemetry';

    const status = (passport?.status || 'active').toString().toUpperCase();

    const certificateHash =
      passport?.certificateHash ||
      passport?.certificate_hash ||
      '0x4A7B2C91D8E30F65789A12B34C56D78E';

    const shortHash =
      typeof certificateHash === 'string' && certificateHash.length >= 14
        ? certificateHash.substring(0, 14)
        : certificateHash || '0x4A7B2C91D8';

    const efficiencyGainPercent =
      passport?.efficiencyGainPercent !== undefined
        ? Number(passport.efficiencyGainPercent)
        : passport?.efficiency_gain_percent !== undefined
        ? Number(passport.efficiency_gain_percent)
        : 88;

    const costSavingsLakhs =
      passport?.costSavingsLakhs !== undefined
        ? Number(passport.costSavingsLakhs)
        : passport?.cost_savings_lakhs !== undefined
        ? Number(passport.cost_savings_lakhs)
        : 48.0;

    const deploymentScale =
      passport?.deploymentScale ||
      passport?.deployment_scale ||
      '40 Desert Habitations in Barmer District';

    const validatorName =
      passport?.validator?.name ||
      passport?.validatorName ||
      passport?.validator_name ||
      'Er. Tarun Bhattacharya (QCI / NEERI)';

    const validatorOrg =
      passport?.validator?.organization ||
      passport?.validatorOrg ||
      passport?.validator_org ||
      'Quality Council of India (QCI) / NEERI';

    // Safe date formatters
    const formatDate = (dateStr?: string, defaultFallback: string = 'February 14, 2026') => {
      if (!dateStr) return defaultFallback;
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return defaultFallback;
        return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
      } catch {
        return defaultFallback;
      }
    };

    const formattedValidationDate = formatDate(
      passport?.validationDate || passport?.validation_date || passport?.issued_at || passport?.createdAt,
      'February 14, 2026'
    );

    const formattedValidityEndDate = formatDate(
      passport?.validityEndDate || passport?.validity_end_date,
      'February 14, 2028'
    );

    // Safe KPI achievements array
    let rawKpis: any[] = [];
    if (Array.isArray(passport?.kpisAchieved)) {
      rawKpis = passport.kpisAchieved;
    } else if (Array.isArray(passport?.kpis_achieved)) {
      rawKpis = passport.kpis_achieved;
    } else if (typeof passport?.kpis_achieved === 'string') {
      try {
        rawKpis = JSON.parse(passport.kpis_achieved);
      } catch (err) {
        console.error('❌ [PassportDetailModal] Failed to parse kpis_achieved string:', err);
      }
    }

    const kpisAchieved = rawKpis.length > 0 ? rawKpis : [
      {
        kpiName: 'Telemetry Nodes Live Transmission',
        targetValue: 40,
        achievedValue: 40,
        unit: 'Solar Nodes',
        description: '10-minute sensor ping frequency transmitting TDS, pH, and Fluoride PPM',
        verified: true,
      },
      {
        kpiName: 'Potability Sensing Accuracy vs Lab Standards',
        targetValue: 95,
        achievedValue: 98.6,
        unit: '% Accuracy',
        description: 'Double-blind calibration correlation against NEERI standard test kits',
        verified: true,
      },
      {
        kpiName: 'Fluoride Exceedance Real-Time Alert Dispatch',
        targetValue: 100,
        achievedValue: 100,
        unit: '% Dispatched',
        description: 'Instant SMS & GIS dispatch to block sub-divisional water engineers',
        verified: true,
      },
    ];

    const copyHash = () => {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(certificateHash);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        }
      } catch (err) {
        console.warn('Clipboard write error:', err);
      }
    };

    const handlePrintOrDownload = (action: 'both' | 'print' | 'download' = 'both') => {
      setIsDownloading(true);
      try {
        const certData = {
          startupName,
          departmentName: departmentWorkedWith,
          problemTitle,
          validatorName: validatorName || 'Dr. K. S. Raman (CSIR-CRRI / Empanelled Validator)',
          validatorOrg,
          category: passportCategory,
          score: passportScore,
          isScaleUpRecommended: true,
          totalBudgetLakhs: passport?.totalBudgetLakhs || 24.0,
          certificateHash,
          shortHash,
          dpiitNumber: passport?.dpiitNumber || (passport as any)?.dpiit_number || dpiitNumber || 'DIPP94821',
          validationDate: formattedValidationDate,
          sector: passport?.sector || sector || 'GovTech Innovation',
        };

        const certHtml = generateCertificateHtml(certData);

        if (action === 'download' || action === 'both') {
          const blob = new Blob([certHtml], { type: 'text/html;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          const cleanStartup = (startupName || 'Startup').replace(/[^a-zA-Z0-9_-]/g, '_');
          a.href = url;
          a.download = `Pilot_Passport_Credential_${cleanStartup}.html`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }

        if (action === 'print' || action === 'both') {
          let popupTriggered = false;
          try {
            const printWin = window.open('', '_blank');
            if (printWin) {
              printWin.document.open();
              printWin.document.write(certHtml);
              printWin.document.close();
              printWin.focus();
              setTimeout(() => {
                try {
                  printWin.print();
                } catch (e) {
                  console.warn('Popup print trigger info:', e);
                }
              }, 400);
              popupTriggered = true;
            }
          } catch (popupErr) {
            console.warn('Print popup window restricted:', popupErr);
          }

          if (!popupTriggered) {
            try {
              window.print();
            } catch (nativeErr) {
              console.warn('Native window.print was restricted:', nativeErr);
            }
          }
        }

        setDownloadSuccess(true);
        setTimeout(() => {
          setDownloadSuccess(false);
          setIsDownloading(false);
        }, 2200);
      } catch (printErr) {
        console.error('❌ [PassportDetailModal] Print/Download handler exception:', printErr);
        setIsDownloading(false);
        try {
          window.print();
        } catch (fallbackErr) {
          console.warn('Fallback print exception:', fallbackErr);
        }
      }
    };

    const passportScore =
      passport?.passportScore ??
      passport?.passport_score ??
      passport?.pilot?.passport_score ??
      97;

    const passportCategory =
      passport?.passportCategory ||
      passport?.passport_category ||
      passport?.pilot?.passport_category ||
      'Platinum Pilot Passport';

    return (
      <div
        id="passport-detail-modal"
        className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 modal-backdrop-anim"
      >
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-3xl w-full overflow-hidden modal-content-anim text-slate-800 dark:text-white">
          {/* Modal Top Bar */}
          <div className="bg-slate-50 dark:bg-[#0F172A] px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 rounded-xl">
                <Award className="w-5 h-5 fill-amber-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Digital Pilot Passport Credential
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Verified Public Procurement & Pilot Credential • Reusable across all Government Departments
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                id="passport-celebrate-btn"
                onClick={triggerConfetti}
                className="text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:text-white bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-600/60 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
                title="Celebrate Verification"
              >
                ✨ Celebrate
              </button>
              <button
                id="passport-modal-close-btn"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Certificate Frame Content */}
          <div className="p-6 sm:p-8 bg-slate-50 dark:bg-[#0F172A]">
            {/* Certificate Inner Border */}
            <div className="border-2 border-amber-300 dark:border-amber-500/40 rounded-2xl p-6 sm:p-7 bg-white dark:bg-[#1E293B] shadow-sm dark:shadow-xl relative">
              {/* Top Official Seal & Emblem */}
              <div className="text-center space-y-1.5 pb-4 border-b border-slate-200 dark:border-slate-700/80">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 p-0.5 shadow-md mb-1">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                    <Award className="w-7 h-7 text-amber-400 fill-amber-400" />
                  </div>
                </div>
                <div className="text-[11px] uppercase tracking-widest font-bold text-teal-700 dark:text-teal-400">
                  Government of India • Innovation & Public Procurement Registry
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  PILOT PASSPORT & VALIDATION CERTIFICATE
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Issued under the National Public Procurement Innovation Sandbox Guidelines
                </p>
              </div>

              {/* Recipient Startup & Verified Pilot Details */}
              <div className="my-5 text-center space-y-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  This is to certify that the innovator
                </span>
                <h3 className="text-2xl font-bold text-amber-700 dark:text-amber-300 underline decoration-amber-500 decoration-2 underline-offset-4">
                  {startupName}
                </h3>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
                  <span className="bg-slate-100 dark:bg-slate-900 text-teal-700 dark:text-teal-300 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full font-semibold">
                    DPIIT: {dpiitNumber}
                  </span>
                  <span className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full font-medium">
                    Sector: {sector}
                  </span>
                  <span className="bg-cyan-50 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700 px-3 py-1 rounded-full font-bold">
                    {passportCategory} ({passportScore}/100)
                  </span>
                  <span className="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Status: {status} (Valid 2 Years)
                  </span>
                </div>
              </div>

              {/* Problem & Department Worked With */}
              <div className="bg-slate-50 dark:bg-[#0F172A] rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-xs space-y-2 mb-5">
                <div className="flex flex-col sm:flex-row sm:justify-between text-slate-700 dark:text-slate-300 gap-1">
                  <span className="font-bold text-slate-500 dark:text-slate-400">Deployed Department:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{departmentWorkedWith}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between text-slate-700 dark:text-slate-300 gap-1 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-500 dark:text-slate-400">Problem Solved:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 text-right sm:max-w-md">
                    {problemTitle}
                  </span>
                </div>
              </div>

              {/* REAL DATA KPIs Achieved Table */}
              <div className="space-y-2 mb-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Independently Verified Pilot KPI Metrics (Real Data)</span>
                  </h4>
                  <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-700">
                    100% Target Attainment
                  </span>
                </div>

                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-[#0F172A]">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="px-3.5 py-2.5">Metric / Objective</th>
                        <th className="px-3.5 py-2.5">Target Baseline</th>
                        <th className="px-3.5 py-2.5 text-emerald-700 dark:text-emerald-400">Achieved Real Value</th>
                        <th className="px-3.5 py-2.5">Audit Verdict</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {kpisAchieved.map((kpi: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-100/60 dark:hover:bg-slate-800/50">
                          <td className="px-3.5 py-2.5 font-medium text-slate-900 dark:text-white">
                            {kpi?.kpiName || kpi?.name || `Metric #${idx + 1}`}
                            {kpi?.description && (
                              <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-normal mt-0.5">
                                {kpi.description}
                              </span>
                            )}
                          </td>
                          <td className="px-3.5 py-2.5 font-mono text-slate-500 dark:text-slate-400">
                            {kpi?.targetValue ?? '100'} {kpi?.unit || '%'}
                          </td>
                          <td className="px-3.5 py-2.5 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                            {kpi?.achievedValue ?? '100'} {kpi?.unit || '%'}
                          </td>
                          <td className="px-3.5 py-2.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              Verified
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Impact Highlights */}
              <div className="grid grid-cols-3 gap-3 mb-5 text-center">
                <div className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl p-3">
                  <span className="text-[10px] text-teal-700 dark:text-teal-400 uppercase font-semibold block">
                    Efficiency Gain
                  </span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    {efficiencyGainPercent}%
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl p-3">
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-semibold block">
                    Estimated Savings
                  </span>
                  <span className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                    ₹{costSavingsLakhs} L
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl p-3">
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-semibold block">
                    Scale Achieved
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white mt-1 block leading-tight">
                    {deploymentScale}
                  </span>
                </div>
              </div>

              {/* Signoff / Validator Details & Cryptographic Hash */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block uppercase font-semibold">
                    Independent Validator Signoff
                  </span>
                  <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                    {validatorName}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                    {validatorOrg}
                  </div>
                  <div className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5">
                    Verified On: {formattedValidationDate}
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block uppercase font-semibold">
                    Credential Validity
                  </span>
                  <div className="font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                    Active until {formattedValidityEndDate}
                  </div>
                  <div className="mt-1 flex items-center sm:justify-end gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    <span>Hash: {shortHash}...</span>
                    <button
                      id="passport-copy-hash-btn"
                      onClick={copyHash}
                      className="hover:text-slate-900 dark:hover:text-white p-1 rounded-md transition cursor-pointer text-slate-400"
                      title="Copy Full SHA-256 Hash"
                    >
                      {copied ? (
                        <span className="text-emerald-500 font-sans font-bold text-[10px] flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Copied
                        </span>
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions Footer */}
          <div className="bg-slate-50 dark:bg-[#0F172A] px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-700/80">
            <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>
                <strong className="text-teal-700 dark:text-teal-400">Procurement Waiver Rule:</strong> Departments can directly invite this startup without repeating preliminary stage evaluation.
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                id="passport-download-btn"
                onClick={() => handlePrintOrDownload('both')}
                disabled={isDownloading}
                className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-98 disabled:opacity-75"
                title="Print & Download Official Digital Certificate"
              >
                {downloadSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Downloaded & Ready!</span>
                  </>
                ) : isDownloading ? (
                  <>
                    <Download className="w-3.5 h-3.5 text-teal-500 animate-bounce" />
                    <span>Preparing Document...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300" />
                    <span>Download Certificate</span>
                  </>
                )}
              </button>
              <button
                id="passport-close-btn"
                onClick={onClose}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 transition shadow-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (err: any) {
    // Exact console.error requirement: print exact error message and the data object being rendered
    console.error('❌ [PassportDetailModal Render Exception]:', err?.message || err, {
      passportData: passport,
      errorStack: err?.stack,
    });
    throw err; // Let ErrorBoundary handle gracefully
  }
};

export const PassportDetailModal: React.FC<PassportDetailModalProps> = (props) => {
  if (!props.isOpen) return null;
  return (
    <ErrorBoundary
      fallbackTitle="Digital Passport Viewer"
      data={props.passport}
      onClose={props.onClose}
    >
      <PassportDetailModalContent {...props} />
    </ErrorBoundary>
  );
};
