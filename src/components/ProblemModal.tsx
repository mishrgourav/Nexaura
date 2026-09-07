import React, { useState } from 'react';
import { Department, RiskLevel } from '../types';
import { X, Sparkles, AlertCircle, Building2, Layers, IndianRupee, ShieldAlert } from 'lucide-react';

interface ProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: Department[];
  currentDepartmentId?: string;
  onSubmit: (data: {
    departmentId: string;
    departmentName: string;
    title: string;
    description: string;
    category: string;
    budgetMinLakhs: number;
    budgetMaxLakhs: number;
    riskLevel: RiskLevel;
    expectedOutcome: string;
  }) => Promise<void>;
  loading: boolean;
}

export const ProblemModal: React.FC<ProblemModalProps> = ({
  isOpen,
  onClose,
  departments,
  currentDepartmentId,
  onSubmit,
  loading,
}) => {
  const [departmentId, setDepartmentId] = useState(currentDepartmentId || (departments[0]?.id || ''));
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Healthcare & Life Sciences');
  const [budgetMinLakhs, setBudgetMinLakhs] = useState<number>(15);
  const [budgetMaxLakhs, setBudgetMaxLakhs] = useState<number>(25);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('medium');
  const [expectedOutcome, setExpectedOutcome] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const categories = [
    'Healthcare & Life Sciences',
    'Urban Infrastructure & Transport',
    'Agriculture & Agritech',
    'Water, Sanitation & Environment',
    'Education & EdTech',
    'Energy & CleanTech',
    'Governance & CivicTech',
  ];

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide a problem statement title and detailed description.');
      return;
    }

    const selectedDept = departments.find(d => d.id === departmentId) || departments[0];

    try {
      await onSubmit({
        departmentId: selectedDept.id,
        departmentName: selectedDept.name,
        title: title.trim(),
        description: description.trim(),
        category,
        budgetMinLakhs: Number(budgetMinLakhs),
        budgetMaxLakhs: Number(budgetMaxLakhs),
        riskLevel,
        expectedOutcome: expectedOutcome.trim() || 'Successful validation and deployment of solution in field operations.',
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit problem statement');
    }
  };

  const handlePreloadTemplate = (type: 'health' | 'traffic' | 'water') => {
    if (type === 'health') {
      setTitle('Automated AI Triaging for Diabetic Retinopathy in Rural Primary Health Centers');
      setDescription('Deploy non-mydriatic fundus camera with integrated edge AI software in 20 remote sub-district hospitals to screen rural citizens for early stages of diabetic retinopathy without on-site ophthalmologists.');
      setCategory('Healthcare & Life Sciences');
      setBudgetMinLakhs(18);
      setBudgetMaxLakhs(30);
      setRiskLevel('medium');
      setExpectedOutcome('Screen >4,000 diabetic patients, achieve >92% sensitivity compared with tertiary hospital ophthalmologist diagnosis, and achieve sub-2 minute diagnostic report generation.');
    } else if (type === 'traffic') {
      setTitle('Dynamic Emergency Ambulance Green Corridor AI Routing');
      setDescription('Integrate GPS transponders on 50 108-Emergency ambulances with city optical traffic signals to automatically turn upcoming signals green 30 seconds prior to ambulance arrival across 18 major junctions.');
      setCategory('Urban Infrastructure & Transport');
      setBudgetMinLakhs(20);
      setBudgetMaxLakhs(35);
      setRiskLevel('low');
      setExpectedOutcome('Reduce average emergency ambulance transit time during peak rush hour by 32% with zero collision risk.');
    } else if (type === 'water') {
      setTitle('Subsurface Acoustic IoT Sensor for Non-Revenue Water (NRW) Leakage Localization');
      setDescription('Install non-invasive acoustic sensors on municipal water mains to identify concealed underground pipeline bursts and illegal tap connections across Ward 14 distribution network.');
      setCategory('Water, Sanitation & Environment');
      setBudgetMinLakhs(15);
      setBudgetMaxLakhs(25);
      setRiskLevel('high');
      setExpectedOutcome('Identify at least 85% of hidden underground pipeline leaks within 4 hours of occurrence, reducing physical water loss by 400,000 liters daily.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 modal-backdrop-anim">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-2xl w-full overflow-hidden modal-content-anim text-slate-800 dark:text-white">
        {/* Modal Header */}
        <div className="bg-slate-50 dark:bg-[#0F172A] px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-50 dark:bg-teal-500/15 border border-teal-200 dark:border-teal-500/30 rounded-xl text-teal-600 dark:text-teal-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Post New Problem Statement</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AI matching engine will immediately recommend top matching startups & pilot passports
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Sample Template Buttons */}
        <div className="bg-slate-100/70 dark:bg-slate-800/80 px-6 py-2.5 border-b border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between text-xs gap-2">
          <span className="text-teal-700 dark:text-teal-400 font-semibold flex items-center gap-1">
            <span>⚡ Quick Preload Templates:</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handlePreloadTemplate('health')}
              className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-medium transition shadow-2xs"
            >
              Diabetic Retinopathy AI
            </button>
            <button
              type="button"
              onClick={() => handlePreloadTemplate('traffic')}
              className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-medium transition shadow-2xs"
            >
              Ambulance Green Corridor
            </button>
            <button
              type="button"
              onClick={() => handlePreloadTemplate('water')}
              className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-medium transition shadow-2xs"
            >
              Acoustic Water Leakage
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-600/60 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Department Selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Government Department / Nodal Agency</span>
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full text-xs font-medium text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code}) - {d.state}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Problem Statement Title <span className="text-rose-500 dark:text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., AI-assisted Early Detection of Tuberculosis in Rural PHCs"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          {/* Category / Sector & Risk Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Sector / Category <span className="text-rose-500 dark:text-rose-400">*</span></span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Deployment Risk Level</span>
              </label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
                className="w-full text-xs text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="low">Low Risk (Digital workflow, analytics, non-invasive)</option>
                <option value="medium">Medium Risk (Field sensors, hardware integration, clinical triaging)</option>
                <option value="high">High Risk (Critical infrastructure, life safety, harsh telemetry)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Detailed Scope & Context <span className="text-rose-500 dark:text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe the operational challenge, field constraints, target location, and tech requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none placeholder-slate-400 dark:placeholder-slate-500 leading-relaxed"
            />
          </div>

          {/* Budget Min & Max */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Pilot Budget Range (₹ in Lakhs)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Min Budget:</span>
                <div className="relative mt-0.5">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs text-slate-500 dark:text-slate-400 font-semibold">₹</span>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={budgetMinLakhs}
                    onChange={(e) => setBudgetMinLakhs(Number(e.target.value))}
                    className="w-full text-xs text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl pl-7 pr-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[11px] text-slate-500 dark:text-slate-400">Lakhs</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Max Budget:</span>
                <div className="relative mt-0.5">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs text-slate-500 dark:text-slate-400 font-semibold">₹</span>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={budgetMaxLakhs}
                    onChange={(e) => setBudgetMaxLakhs(Number(e.target.value))}
                    className="w-full text-xs text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl pl-7 pr-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[11px] text-slate-500 dark:text-slate-400">Lakhs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Expected Outcome */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Expected Measurable Outcome / KPI Target
            </label>
            <input
              type="text"
              placeholder="e.g., Triage >5,000 citizens, achieve >90% sensitivity within 60 seconds per test"
              value={expectedOutcome}
              onChange={(e) => setExpectedOutcome(e.target.value)}
              className="w-full text-xs text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              * The recommendation engine will rank top 10 startups automatically on submission.
            </p>
            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-2xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 transition-all shadow-xs shadow-teal-500/20 disabled:opacity-50 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{loading ? 'Running AI Match...' : 'Post & Run AI Match'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
