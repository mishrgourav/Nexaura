import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db, supabase, supabaseConfig, supabaseUrl } from './server/db';
import { GoogleGenAI } from '@google/genai';
import {
  ProblemStatement,
  Pilot,
  Milestone,
  PaymentRecord,
  PilotPassport,
  Validator,
  User,
  UserRole,
} from './src/types';
import { calculatePilotPassportMetrics } from './src/utils/passportScore';

const app = express();
app.use(cors({
  origin: ['https://nexaura-pi.vercel.app', 'https://nexaura-startupconnect.ai.studio'],
  credentials: true
}));
const PORT = 3000;

app.use(express.json());

// Helper: Identify Requester and determine verified role
async function getRequesterUser(req: Request): Promise<{ user: User | null; role: UserRole }> {
  try {
    // 1. Check Bearer token with Supabase Auth
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (supabase && token) {
        try {
          const { data, error } = await supabase.auth.getUser(token);
          if (data?.user && !error) {
            const userRecord = await db.getUserByAuthId(data.user.id) || await db.getUserByEmail(data.user.email || '');
            if (userRecord) {
              return { user: userRecord, role: userRecord.role };
            }
          }
        } catch (authErr) {
          console.warn('[Server Auth Warning] Token verification failed:', authErr);
        }
      }
    }

    // 2. Check explicit auth headers (x-auth-id or x-user-id)
    const authId = req.headers['x-auth-id'] as string;
    if (authId) {
      const u = await db.getUserByAuthId(authId);
      if (u) return { user: u, role: u.role };
    }

    const userId = req.headers['x-user-id'] as string;
    if (userId) {
      const u = await db.getUserById(userId);
      if (u) return { user: u, role: u.role };
    }

    // 3. Check client session role header if passed by authorized client
    const headerRole = req.headers['x-user-role'] as UserRole;
    if (headerRole && ['department', 'startup', 'admin', 'validator'].includes(headerRole)) {
      return { user: null, role: headerRole };
    }
  } catch (err) {
    console.warn('[Server Auth] Error resolving requester:', err);
  }

  return { user: null, role: 'public' };
}

// Lazy-initialize Gemini AI if key is present
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (err) {
      console.warn('Gemini initialization skipped:', err);
    }
  }
  return aiClient;
}

// ----------------------------------------------------
// REST API ROUTES
// ----------------------------------------------------

// 1. System & Users
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Authentication Configuration (provides normalized Supabase URL & public anon key)
app.get('/api/auth/config', (req: Request, res: Response) => {
  res.json({
    supabaseUrl: supabaseUrl || (supabaseConfig ? supabaseConfig.url : ''),
    supabaseAnonKey: supabaseConfig ? supabaseConfig.key : (process.env.SUPABASE_ANON_KEY || ''),
    isConfigured: Boolean(supabaseConfig && supabaseConfig.url && supabaseConfig.key),
  });
});

// Sync or register user linked with Supabase Auth auth_id
app.post('/api/auth/sync-user', async (req: Request, res: Response) => {
  try {
    const {
      authId,
      email,
      name,
      role,
      organization,
      departmentId,
      departmentName,
      startupId,
      startupName,
      validatorId,
      designation,
    } = req.body;

    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role are required' });
    }

    // 1. Look up existing user by authId or email
    let existing: User | null = null;
    if (authId) {
      existing = await db.getUserByAuthId(authId);
    }
    if (!existing) {
      existing = await db.getUserByEmail(email);
    }

    if (existing) {
      const updates: Partial<User> = {};
      if (authId && existing.authId !== authId) updates.authId = authId;
      if (name && existing.name !== name) updates.name = name;
      if (role && existing.role !== role) updates.role = role;
      if (organization) updates.organization = organization;
      if (departmentId) updates.departmentId = departmentId;
      if (departmentName) updates.departmentName = departmentName;
      if (startupId) updates.startupId = startupId;
      if (startupName) updates.startupName = startupName;
      if (validatorId) updates.validatorId = validatorId;

      const updated = Object.keys(updates).length > 0
        ? await db.updateUser(existing.id, updates)
        : existing;

      return res.json({ success: true, user: updated, created: false });
    }

    // 2. Insert new user record
    const newUser: User = {
      id: `u-${Date.now()}`,
      authId: authId || undefined,
      name: name || email.split('@')[0],
      role: role as UserRole,
      email: email.toLowerCase().trim(),
      organization: organization || (
        role === 'department'
          ? (departmentName || 'Government Department')
          : role === 'startup'
          ? (startupName || 'Startup Innovator')
          : role === 'validator'
          ? 'Empanelled Quality Council'
          : 'MSInS State Directorate'
      ),
      departmentId,
      departmentName,
      startupId,
      startupName,
      validatorId,
      designation: designation || (
        role === 'department'
          ? 'Nodal Officer'
          : role === 'startup'
          ? 'Founder & Tech Lead'
          : role === 'validator'
          ? 'Lead Technical Auditor'
          : 'State Innovation Director'
      ),
    };

    const created = await db.createUser(newUser);
    res.status(201).json({ success: true, user: created, created: true });
  } catch (err: any) {
    console.error('Error syncing user:', err);
    res.status(500).json({ error: err.message });
  }
});

// Current Authenticated User profile
app.get('/api/auth/me', async (req: Request, res: Response) => {
  try {
    const { user, role } = await getRequesterUser(req);
    res.json({ user, role });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users', async (req: Request, res: Response) => {
  try {
    const users = await db.getUsers();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/db/reset', async (req: Request, res: Response) => {
  try {
    await db.seed();
    res.json({ success: true, message: 'Database reset to initial demo state with 5 departments, 15 startups, and 8 pilots.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reset', async (req: Request, res: Response) => {
  try {
    await db.seed();
    res.json({ success: true, message: 'Database reset to initial demo state with 5 departments, 15 startups, and 8 pilots.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Analytics & Public Transparency
app.get('/api/analytics', async (req: Request, res: Response) => {
  try {
    const analytics = await db.getAnalytics();
    res.json(analytics);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Departments
app.get('/api/departments', async (req: Request, res: Response) => {
  try {
    const departments = await db.getDepartments();
    res.json(departments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/departments/:id', async (req: Request, res: Response) => {
  try {
    const dept = await db.getDepartmentById(req.params.id);
    if (!dept) return res.status(404).json({ error: 'Department not found' });
    const problems = await db.getProblemStatements({ departmentId: dept.id });
    const pilots = await db.getPilots({ departmentId: dept.id });
    res.json({ ...dept, problems, pilots });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Startups
app.get('/api/startups', async (req: Request, res: Response) => {
  try {
    const sector = req.query.sector as string;
    const dpiitOnly = req.query.dpiit === 'true';
    const passportOnly = req.query.passport === 'true';

    const list = await db.getStartups({ sector, dpiitOnly, passportOnly });
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/startups/:id', async (req: Request, res: Response) => {
  try {
    const startup = await db.getStartupById(req.params.id);
    if (!startup) return res.status(404).json({ error: 'Startup not found' });
    const passports = await db.getPassports({ startupId: startup.id });
    const pilots = await db.getPilots({ startupId: startup.id });
    res.json({ ...startup, passports, pilots });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Validators (MSInS Empanelled)
app.get('/api/validators', async (req: Request, res: Response) => {
  try {
    const validators = await db.getValidators();
    res.json(validators);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/validators', async (req: Request, res: Response) => {
  try {
    const { role } = await getRequesterUser(req);
    if (role !== 'admin') {
      return res.status(403).json({ error: "Access Denied: Only 'Admin' role can empanel new validators." });
    }

    const { name, organization, sectorExpertise, email } = req.body;
    if (!name || !organization || !email) {
      return res.status(400).json({ error: 'Missing required validator fields' });
    }

    const newValidator: Validator = {
      id: `val-${Date.now()}`,
      name,
      organization,
      sectorExpertise: sectorExpertise || ['General Innovation', 'Emerging Tech'],
      empanelledDate: new Date().toISOString().split('T')[0],
      verifiedPilotsCount: 0,
      status: 'Active',
      email,
      credentialHash: '0x' + Math.random().toString(16).substring(2, 12).toUpperCase(),
    };

    const created = await db.createValidator(newValidator);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Problem Statements (Department Posts)
const getProblemStatementsHandler = async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    const status = req.query.status as string;
    const departmentId = req.query.departmentId as string;

    const results = await db.getProblemStatements({ category, status, departmentId });
    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

const getProblemByIdHandler = async (req: Request, res: Response) => {
  try {
    const prob = await db.getProblemById(req.params.id);
    if (!prob) return res.status(404).json({ error: 'Problem statement not found' });
    const matches = await db.getRankedMatchesForProblem(prob.id);
    res.json({ ...prob, matches });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

const createProblemHandler = async (req: Request, res: Response) => {
  try {
    const { user, role } = await getRequesterUser(req);
    if (role !== 'department' && role !== 'admin') {
      return res.status(403).json({
        error: "Access Denied: Only 'Government Department' role can create or edit problem statements for their department.",
      });
    }

    const {
      departmentId,
      departmentName,
      title,
      description,
      category,
      budgetMinLakhs,
      budgetMaxLakhs,
      riskLevel,
      expectedOutcome,
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ error: 'Title, description, and sector category are required' });
    }

    const depts = await db.getDepartments();
    const dept = depts.find(d => d.id === departmentId) || depts[0] || { id: 'dept-1', name: 'Ministry of Health & Family Welfare' };

    const newProblem: ProblemStatement = {
      id: `prob-${Date.now()}`,
      departmentId: dept.id,
      departmentName: departmentName || dept.name,
      title,
      description,
      category,
      budgetMinLakhs: Number(budgetMinLakhs) || 10.0,
      budgetMaxLakhs: Number(budgetMaxLakhs) || 25.0,
      riskLevel: riskLevel || 'medium',
      expectedOutcome: expectedOutcome || 'Successful pilot deployment and validation against baseline KPIs.',
      status: 'open',
      createdAt: new Date().toISOString().split('T')[0],
      applicationsCount: 0,
    };

    const created = await db.createProblemStatement(newProblem);

    // Auto-run matching recommendation engine
    const matches = await db.getRankedMatchesForProblem(created.id);
    res.status(201).json({ ...created, problem: created, matches });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

app.get('/api/problem-statements', getProblemStatementsHandler);
app.get('/api/problems', getProblemStatementsHandler);
app.get('/api/problem-statements/:id', getProblemByIdHandler);
app.get('/api/problems/:id', getProblemByIdHandler);
app.post('/api/problem-statements', createProblemHandler);
app.post('/api/problems', createProblemHandler);

// 7. Matching Recommendation Engine (Feature 1)
app.get('/api/matches/:problemId', async (req: Request, res: Response) => {
  try {
    const matches = await db.getRankedMatchesForProblem(req.params.problemId);
    res.json(matches);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/matches', async (req: Request, res: Response) => {
  try {
    const { problemId, problem_id, startupId, startup_id, matchScore, match_score, reason, details } = req.body;
    const pId = problemId || problem_id;
    const sId = startupId || startup_id;

    if (!pId || !sId) {
      return res.status(400).json({ error: 'problemId and startupId are required' });
    }

    console.log(`[API /api/matches] Creating match row linking problem: ${pId} and startup: ${sId}`);
    const match = await db.createOrUpdateMatch({
      problemId: pId,
      startupId: sId,
      matchScore: Number(matchScore || match_score) || undefined,
      reason: reason || undefined,
      details: details || undefined,
    });

    res.status(201).json({
      success: true,
      match,
      message: 'Match successfully created in matches table and added to pilot pipeline',
    });
  } catch (err: any) {
    console.error('[API /api/matches] Error creating match:', err);
    res.status(500).json({ error: err.message });
  }
});

// AI deep match evaluation narrative
app.post('/api/ai-match/explain', async (req: Request, res: Response) => {
  try {
    const { problemId, startupId } = req.body;
    const prob = await db.getProblemById(problemId);
    const startup = await db.getStartupById(startupId);

    if (!prob || !startup) {
      return res.status(404).json({ error: 'Problem or startup not found' });
    }

    const baseMatch = db.calculateMatchScore(prob, startup);
    const startupPassports = await db.getPassports({ startupId: startup.id });
    const hasPassport = startupPassports.some(p => p.status === 'active') || startup.hasVerifiedPassport;

    const ai = getAI();
    let aiSummary = '';

    if (ai) {
      try {
        const prompt = `You are the AI Procurement Evaluation Engine for the Government Startup Pilot Program.
Analyze the fit between this government problem and the startup:
GOVERNMENT PROBLEM:
Title: ${prob.title}
Department: ${prob.departmentName}
Sector: ${prob.category}
Budget: ₹${prob.budgetMinLakhs} - ${prob.budgetMaxLakhs} Lakhs
Risk Level: ${prob.riskLevel}
Expected Outcome: ${prob.expectedOutcome}

STARTUP PROFILE:
Name: ${startup.name}
Sector: ${startup.sector}
DPIIT Status: ${startup.dpiitStatus} (${startup.dpiitNumber})
Tech Keywords: ${startup.keywords.join(', ')}
Past Pilot Track Record: ${startup.pastPilotCount} pilots (${startup.successRatePercent}% success)
Has Verified Pilot Passport: ${hasPassport ? 'YES' : 'NO'}
Description: ${startup.description}

Provide a 3-bullet concise assessment for the government evaluation committee:
1. Technical Compatibility & Innovation fit
2. Procurement Risk & Pilot Readiness (cite DPIIT & Passport if verified)
3. Recommended Pilot Validation Metric`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        aiSummary = response.text || '';
      } catch (err) {
        console.warn('Gemini evaluation fallback:', err);
      }
    }

    if (!aiSummary) {
      aiSummary = `• Technical Alignment: ${startup.name} provides proven capability in ${startup.keywords.slice(0, 3).join(', ')}, matching the core scope of "${prob.title}".
• Procurement & Risk Assessment: Startup holds ${startup.dpiitStatus} DPIIT registration with ${startup.pastPilotCount} prior government deployments. ${hasPassport ? 'Startup holds an active Verified Pilot Passport, enabling expedited evaluation under government innovation guidelines.' : 'Standard pilot verification milestones recommended.'}
• Recommended Target: Focus pilot on verifying expected outcome of "${prob.expectedOutcome.substring(0, 100)}..." within ${prob.riskLevel === 'high' ? 'stringent' : 'standard'} 6-month timeline.`;
    }

    res.json({
      matchScore: baseMatch.matchScore,
      reason: baseMatch.reason,
      details: baseMatch.details,
      aiNarrative: aiSummary,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Pilots Management
app.get('/api/pilots', async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string;
    const departmentId = req.query.departmentId as string;
    const startupId = req.query.startupId as string;

    const list = await db.getPilots({ status, departmentId, startupId });
    const [allMilestones, allPayments] = await Promise.all([
      db.getMilestones(),
      db.getPayments(),
    ]);

    // Attach milestones and payment status
    const hydrated = list.map(pilot => {
      const milestones = allMilestones.filter(m => m.pilotId === pilot.id);
      const payments = allPayments.filter(pay => pay.pilotId === pilot.id);
      return { ...pilot, milestones, payments };
    });

    res.json(hydrated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/pilots/:id', async (req: Request, res: Response) => {
  try {
    const pilot = await db.getPilotById(req.params.id);
    if (!pilot) return res.status(404).json({ error: 'Pilot not found' });

    const [pilotMilestones, allPayments, allPassports] = await Promise.all([
      db.getMilestones(pilot.id),
      db.getPayments(),
      db.getPassports(),
    ]);

    const milestones = pilotMilestones.map(m => {
      const payment = allPayments.find(p => p.milestoneId === m.id);
      return { ...m, payment };
    });

    const payments = allPayments.filter(p => p.pilotId === pilot.id);
    const passport = allPassports.find(p => p.pilotId === pilot.id);

    res.json({ ...pilot, milestones, payments, passport });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create new pilot agreement from a problem statement & matched startup
app.post('/api/pilots', async (req: Request, res: Response) => {
  try {
    const {
      problemId,
      startupId,
      totalBudgetLakhs,
      validatorId,
      startDate,
      endDate,
      scopeSummary,
      customMilestones,
    } = req.body;

    const prob = await db.getProblemById(problemId);
    const startup = await db.getStartupById(startupId);
    const validators = await db.getValidators();
    const validator = validators.find(v => v.id === validatorId) || validators[0] || { id: 'val-1', name: 'Prof. S. Krishnan', organization: 'IIT Bombay' };

    if (!prob || !startup) {
      return res.status(400).json({ error: 'Valid problem statement and startup are required' });
    }

    const budget = Number(totalBudgetLakhs) || prob.budgetMinLakhs || 20.0;
    const newPilotId = `pilot-${Date.now()}`;

    const newPilot: Pilot = {
      id: newPilotId,
      problemId: prob.id,
      problemTitle: prob.title,
      departmentId: prob.departmentId,
      departmentName: prob.departmentName,
      startupId: startup.id,
      startupName: startup.name,
      status: 'active',
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
      totalBudgetLakhs: budget,
      disbursedBudgetLakhs: 0,
      validatorId: validator.id,
      validatorName: `${validator.name} (${validator.organization})`,
      scopeSummary: scopeSummary || `Pilot deployment to solve "${prob.title}" in live operational field environment.`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    await db.createPilot(newPilot);
    await db.updateProblemStatus(prob.id, 'pilot_active');

    // Default editable 4-Milestone Template:
    const defaultMilestones = customMilestones && customMilestones.length > 0
      ? customMilestones
      : [
          {
            milestoneNumber: 1,
            title: 'Milestone 1: Deployment & Baseline Setup',
            description: 'Deploy solution hardware/software in the field and complete baseline training.',
            targetKpiDescription: 'Target units / locations deployed and functional',
            targetKpiValue: 10,
            kpiUnit: 'Units/Nodes',
            weightPercent: 20,
          },
          {
            milestoneNumber: 2,
            title: 'Milestone 2: Live Usage & Data Submission',
            description: 'Stream live operational telemetry and demonstrate sustained system uptime.',
            targetKpiDescription: 'Operational days with live telemetry',
            targetKpiValue: 30,
            kpiUnit: 'Days',
            weightPercent: 30,
          },
          {
            milestoneNumber: 3,
            title: 'Milestone 3: Core KPI Target Achieved',
            description: 'Achieve primary efficacy threshold agreed with the department in live operations.',
            targetKpiDescription: 'Target performance/efficiency outcome',
            targetKpiValue: 85,
            kpiUnit: '% Efficacy',
            weightPercent: 30,
          },
          {
            milestoneNumber: 4,
            title: 'Milestone 4: Independent Validation & Pilot Closure',
            description: 'Empanelled validator sign-off and final handover verification protocol.',
            targetKpiDescription: 'Independent validator compliance benchmark score',
            targetKpiValue: 100,
            kpiUnit: '% Complete',
            weightPercent: 20,
          },
        ];

    const startMs = new Date(newPilot.startDate).getTime();
    const endMs = new Date(newPilot.endDate).getTime();
    const quarterMs = (endMs - startMs) / Math.max(defaultMilestones.length, 1);

    const createdMilestones: Milestone[] = defaultMilestones.map((m: any, idx: number) => {
      const weight = Number(m.weightPercent) || 25;
      const amount = Math.round(((budget * weight) / 100) * 100) / 100;
      const milestoneDeadline = new Date(startMs + quarterMs * (idx + 1)).toISOString().split('T')[0];

      return {
        id: `m-${newPilotId}-${idx + 1}`,
        pilotId: newPilotId,
        milestoneNumber: idx + 1,
        title: m.title || `Milestone ${idx + 1}`,
        description: m.description || '',
        targetKpiDescription: m.targetKpiDescription || 'KPI Target',
        targetKpiValue: Number(m.targetKpiValue) || 100,
        kpiUnit: m.kpiUnit || 'Units',
        weightPercent: weight,
        amountLakhs: amount,
        status: 'pending',
        deadline: m.deadline || milestoneDeadline,
      };
    });

    await db.createMilestones(createdMilestones);

    res.status(201).json({ pilot: newPilot, milestones: createdMilestones });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Milestone Submission & Rule-Based Verification (Feature 3)
app.post('/api/milestones/:id/submit', async (req: Request, res: Response) => {
  try {
    const { user, role } = await getRequesterUser(req);
    if (role !== 'startup' && role !== 'admin') {
      return res.status(403).json({
        error: "Access Denied: Only 'Startup Innovator' role can submit solutions and update pilot progress.",
      });
    }

    const milestone = await db.getMilestoneById(req.params.id);
    if (!milestone) return res.status(404).json({ error: 'Milestone not found' });

    const { submittedValue, submittedProofUrl, submittedNotes } = req.body;

    const updated = await db.updateMilestone(milestone.id, {
      submittedValue: Number(submittedValue),
      submittedProofUrl: submittedProofUrl || 'https://gov.startupconnect.in/proofs/sample-verification-report.pdf',
      submittedNotes: submittedNotes || 'Telemetry data logs and deployment acceptance signed off.',
      submittedAt: new Date().toISOString(),
      status: 'submitted',
    });

    res.json({ success: true, milestone: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/milestones/:id/verify', async (req: Request, res: Response) => {
  try {
    const { user, role } = await getRequesterUser(req);
    if (role !== 'validator' && role !== 'admin') {
      return res.status(403).json({
        error: "Access Denied: Only 'Independent Validator' role can verify milestones.",
      });
    }

    const milestone = await db.getMilestoneById(req.params.id);
    if (!milestone) return res.status(404).json({ error: 'Milestone not found' });

    const pilot = await db.getPilotById(milestone.pilotId);
    if (!pilot) return res.status(404).json({ error: 'Pilot not found' });

    const { validatorName, notes, overridePass } = req.body;

    // Rule-based check: submitted_value >= target_kpi_value (or manual pass)
    const isTargetAchieved = (milestone.submittedValue !== undefined && milestone.submittedValue >= milestone.targetKpiValue) || overridePass === true;

    if (!isTargetAchieved) {
      return res.status(400).json({
        error: 'Rule-based check failed: Submitted KPI value does not meet target threshold.',
        submittedValue: milestone.submittedValue,
        targetValue: milestone.targetKpiValue,
        unit: milestone.kpiUnit,
      });
    }

    const updatedMilestone = await db.updateMilestone(milestone.id, {
      status: 'verified',
      verifiedAt: new Date().toISOString(),
      verifiedBy: validatorName || pilot.validatorName,
      verificationNotes: notes || 'Rule-based validation criteria satisfied and ground-truth telemetry matched.',
    });

    // Check if a payment record already exists for this milestone, or generate new payment instruction
    const payments = await db.getPayments();
    let payment = payments.find(p => p.milestoneId === milestone.id);
    if (!payment) {
      const newPayment: PaymentRecord = {
        id: `pay-${Date.now()}`,
        milestoneId: milestone.id,
        milestoneTitle: milestone.title,
        pilotId: pilot.id,
        pilotTitle: pilot.problemTitle,
        departmentId: pilot.departmentId,
        departmentName: pilot.departmentName,
        startupId: pilot.startupId,
        startupName: pilot.startupName,
        amountLakhs: milestone.amountLakhs,
        status: 'verified', // Ready for Officer 1-click Approval!
        requestedAt: new Date().toISOString(),
        isDelayed: false,
        slaDays: 10,
        elapsedDays: 0,
      };
      payment = await db.createPayment(newPayment);
    }

    // Check if all milestones are verified/paid -> complete pilot!
    const pilotMilestones = await db.getMilestones(pilot.id);
    const allVerifiedOrPaid = pilotMilestones.every(m => m.id === milestone.id ? true : (m.status === 'verified' || m.status === 'paid'));

    let currentPilotStatus = pilot.status;
    if (allVerifiedOrPaid && pilot.status !== 'completed') {
      currentPilotStatus = 'completed';
      const breakdown = calculatePilotPassportMetrics(pilot, pilotMilestones);
      await db.updatePilot(pilot.id, {
        status: 'completed',
        completedAt: new Date().toISOString().split('T')[0],
        kpi_achievement_pct: breakdown.kpiAchievementPct,
        on_time_completion_pct: breakdown.onTimeCompletionPct,
        compliance_score: breakdown.complianceScore,
        reliability_score: breakdown.reliabilityScore,
        user_feedback_score: breakdown.userFeedbackScore,
        expert_validation_score: breakdown.expertValidationScore,
        passport_score: breakdown.passportScore,
        passport_category: breakdown.passportCategory,
        scale_up_recommended: breakdown.scaleUpRecommended,
      });
    }

    res.json({ success: true, milestone: updatedMilestone, payment, pilotStatus: currentPilotStatus });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Payment Engine (PFMS/Treasury Verification Layer)
app.get('/api/payments', async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string;
    const delayedOnly = req.query.delayed === 'true';

    const list = await db.getPayments({ status, delayedOnly });
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Officer 1-click "Approve & Send to Treasury"
app.post('/api/payments/:id/approve', async (req: Request, res: Response) => {
  try {
    const { role } = await getRequesterUser(req);
    if (role !== 'admin') {
      return res.status(403).json({
        error: "Access Denied: Only 'Admin' role can approve payments and govern treasury payouts.",
      });
    }

    const payment = await db.getPaymentById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment request not found' });

    const now = new Date();
    const treasuryRef = `PFMS/${now.getFullYear()}/${payment.departmentName.split(' ')[0].toUpperCase()}/${Math.floor(100000 + Math.random() * 900000)}`;

    const updated = await db.updatePayment(payment.id, {
      status: 'sent_to_treasury',
      approvedAt: now.toISOString(),
      sentToTreasuryAt: now.toISOString(),
      treasuryRefNumber: treasuryRef,
      elapsedDays: 0,
      isDelayed: false,
    });

    res.json({
      success: true,
      message: `Payment instruction of ₹${payment.amountLakhs} Lakhs approved and dispatched to PFMS/Treasury.`,
      payment: updated,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Mark Payment as Paid (Simulate Treasury Settlement)
const markPaymentPaidHandler = async (req: Request, res: Response) => {
  try {
    const { role } = await getRequesterUser(req);
    if (role !== 'admin') {
      return res.status(403).json({
        error: "Access Denied: Only 'Admin' role can record or settle treasury payments.",
      });
    }

    const payment = await db.getPaymentById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment request not found' });

    const updatedPayment = await db.updatePayment(payment.id, {
      status: 'paid',
      paidAt: new Date().toISOString(),
      isDelayed: false,
    });

    // Update milestone status to 'paid'
    await db.updateMilestone(payment.milestoneId, { status: 'paid' });

    // Update pilot disbursed budget
    const allPayments = await db.getPayments();
    const paidSum = allPayments
      .filter(p => p.pilotId === payment.pilotId && (p.id === payment.id || p.status === 'paid'))
      .reduce((acc, cur) => acc + cur.amountLakhs, 0);

    const pilot = await db.getPilotById(payment.pilotId);
    if (pilot) {
      await db.updatePilot(pilot.id, {
        disbursedBudgetLakhs: Math.round(paidSum * 10) / 10,
      });
    }

    res.json({ success: true, message: 'Payment marked as settled by Treasury.', payment: updatedPayment });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

app.post('/api/payments/:id/mark-paid', markPaymentPaidHandler);
app.post('/api/payments/:id/paid', markPaymentPaidHandler);

// 11. Digital Pilot Passport (Feature 2)
app.get('/api/passports', async (req: Request, res: Response) => {
  try {
    const startupId = req.query.startupId as string;
    const sector = req.query.sector as string;

    const list = await db.getPassports({ startupId, sector });
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/passports/:id', async (req: Request, res: Response) => {
  try {
    const passport = await db.getPassportById(req.params.id);
    if (!passport) return res.status(404).json({ error: 'Pilot Passport not found' });
    const pilot = await db.getPilotById(passport.pilotId);
    const startup = await db.getStartupById(passport.startupId);
    res.json({ ...passport, pilot, startup });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Auto-generate or issue digital Pilot Passport upon pilot completion
app.post('/api/passports/generate', async (req: Request, res: Response) => {
  try {
    const { role } = await getRequesterUser(req);
    if (role !== 'validator' && role !== 'admin') {
      return res.status(403).json({
        error: "Access Denied: Only 'Independent Validator' role can mint or issue Pilot Passports.",
      });
    }

    const { pilotId, customKpis, validatorName, validatorOrg, ...metricInputs } = req.body;

    const pilot = await db.getPilotById(pilotId);
    if (!pilot) return res.status(404).json({ error: 'Pilot record not found' });

    const startup = await db.getStartupById(pilot.startupId);
    if (!startup) return res.status(404).json({ error: 'Startup not found' });

    const pilotMilestones = await db.getMilestones(pilot.id);

    // Calculate the weighted formula for Pilot Passport score
    const breakdown = calculatePilotPassportMetrics(pilot, pilotMilestones, metricInputs);

    // Update pilot with the 6 factor scores and passport metadata
    const updatedPilot = await db.updatePilot(pilot.id, {
      status: 'completed',
      completedAt: pilot.completedAt || new Date().toISOString().split('T')[0],
      kpi_achievement_pct: breakdown.kpiAchievementPct,
      on_time_completion_pct: breakdown.onTimeCompletionPct,
      compliance_score: breakdown.complianceScore,
      reliability_score: breakdown.reliabilityScore,
      user_feedback_score: breakdown.userFeedbackScore,
      expert_validation_score: breakdown.expertValidationScore,
      passport_score: breakdown.passportScore,
      passport_category: breakdown.passportCategory,
      scale_up_recommended: breakdown.scaleUpRecommended,
    });

    // Check if passport already exists
    const existingPassports = await db.getPassports({ startupId: startup.id });
    const existing = existingPassports.find(p => p.pilotId === pilot.id);
    if (existing) {
      return res.json({
        message: 'Pilot passport score updated for this pilot.',
        passport: existing,
        pilot: updatedPilot,
        breakdown,
      });
    }

    const kpisAchieved = customKpis && customKpis.length > 0
      ? customKpis
      : pilotMilestones.map(m => ({
          kpiName: m.title.replace(/^Milestone \d+:\s*/, ''),
          targetValue: m.targetKpiValue,
          achievedValue: m.submittedValue || m.targetKpiValue,
          unit: m.kpiUnit,
          description: m.description,
          verified: true,
        }));

    const hash = '0x' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
    const passId = `pass-${Date.now()}`;

    const passport: PilotPassport = {
      id: passId,
      startupId: startup.id,
      startupName: startup.name,
      startupSector: startup.sector,
      dpiitNumber: startup.dpiitNumber,
      pilotId: pilot.id,
      problemTitle: pilot.problemTitle,
      departmentWorkedWith: pilot.departmentName,
      sector: startup.sector,
      kpisAchieved,
      validatorName: validatorName || pilot.validatorName.split('(')[0].trim(),
      validatorOrg: validatorOrg || 'Empanelled Quality & Tech Evaluation Council',
      validationDate: new Date().toISOString().split('T')[0],
      validityEndDate: new Date(Date.now() + 2 * 365 * 86400000).toISOString().split('T')[0], // 2 years
      status: 'active',
      certificateHash: hash,
      qrPayload: `https://gov.startupconnect.in/passport/${passId}?hash=${hash}`,
      efficiencyGainPercent: Math.round(breakdown.kpiAchievementPct * 0.78),
      costSavingsLakhs: Math.round(pilot.totalBudgetLakhs * 1.8 * 10) / 10,
      deploymentScale: 'Empanelled High-Confidence Scale-Up Certified',
    };

    await db.createPassport(passport);

    res.status(201).json({
      ...passport,
      success: true,
      message: 'Digital Pilot Passport successfully minted and recorded.',
      passport,
      pilot: updatedPilot,
      breakdown,
    });
  } catch (err: any) {
    console.error('Error generating passport:', err);
    res.status(500).json({ error: err.message });
  }
});

// Dedicated endpoint to submit/update Pilot Passport evaluation metrics
app.post('/api/pilots/:id/passport-score', async (req: Request, res: Response) => {
  try {
    const { role } = await getRequesterUser(req);
    if (role !== 'validator' && role !== 'admin') {
      return res.status(403).json({
        error: "Access Denied: Only 'Independent Validator' role can enter compliance scores, reliability metrics, and expert validation scores.",
      });
    }

    const pilotId = req.params.id;
    const pilot = await db.getPilotById(pilotId);
    if (!pilot) return res.status(404).json({ error: 'Pilot record not found' });

    const milestones = await db.getMilestones(pilotId);
    const inputs = req.body;

    // Calculate score using weighted formula
    const breakdown = calculatePilotPassportMetrics(pilot, milestones, inputs);

    // Update pilot columns in Supabase
    const updatedPilot = await db.updatePilot(pilotId, {
      status: 'completed',
      completedAt: pilot.completedAt || new Date().toISOString().split('T')[0],
      kpi_achievement_pct: breakdown.kpiAchievementPct,
      on_time_completion_pct: breakdown.onTimeCompletionPct,
      compliance_score: breakdown.complianceScore,
      reliability_score: breakdown.reliabilityScore,
      user_feedback_score: breakdown.userFeedbackScore,
      expert_validation_score: breakdown.expertValidationScore,
      passport_score: breakdown.passportScore,
      passport_category: breakdown.passportCategory,
      scale_up_recommended: breakdown.scaleUpRecommended,
    });

    // Create or update corresponding passport record
    const startup = await db.getStartupById(pilot.startupId);
    let passport: PilotPassport | null = null;
    if (startup) {
      const existingPassports = await db.getPassports({ startupId: startup.id });
      const existing = existingPassports.find(p => p.pilotId === pilot.id);
      const hash = existing?.certificateHash || ('0x' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase());
      const passId = existing?.id || `pass-${Date.now()}`;

      const kpisAchieved = milestones.map(m => ({
        kpiName: m.title.replace(/^Milestone \d+:\s*/, ''),
        targetValue: m.targetKpiValue,
        achievedValue: m.submittedValue || m.targetKpiValue,
        unit: m.kpiUnit,
        description: m.description,
        verified: true,
      }));

      passport = {
        id: passId,
        startupId: startup.id,
        startupName: startup.name,
        startupSector: startup.sector,
        dpiitNumber: startup.dpiitNumber,
        pilotId: pilot.id,
        problemTitle: pilot.problemTitle,
        departmentWorkedWith: pilot.departmentName,
        sector: startup.sector,
        kpisAchieved,
        validatorName: inputs.validatorName || pilot.validatorName?.split('(')[0]?.trim() || 'Dr. K. S. Raman',
        validatorOrg: inputs.validatorOrg || 'Empanelled Quality & Tech Evaluation Council',
        validationDate: new Date().toISOString().split('T')[0],
        validityEndDate: new Date(Date.now() + 2 * 365 * 86400000).toISOString().split('T')[0],
        status: 'active',
        certificateHash: hash,
        qrPayload: `https://gov.startupconnect.in/passport/${passId}?hash=${hash}`,
        efficiencyGainPercent: Math.round(breakdown.kpiAchievementPct * 0.78),
        costSavingsLakhs: Math.round(pilot.totalBudgetLakhs * 1.8 * 10) / 10,
        deploymentScale: 'Empanelled High-Confidence Scale-Up Certified',
      };

      await db.createPassport(passport);
    }

    res.json({
      success: true,
      pilot: updatedPilot,
      passport,
      breakdown,
      message: 'Pilot Passport score successfully calculated and persisted to Supabase.',
    });
  } catch (err: any) {
    console.error('Error saving passport score:', err);
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// HELP ASSISTANT: Scoped Platform Guide Endpoint (Gemini 3.8 Flash)
// ----------------------------------------------------
const NEXORA_GUIDE_SYSTEM_INSTRUCTION = `You are the NEXORA Platform Guide and Help Assistant.
Your sole job is to explain how NEXORA (the Maharashtra GovTech Procurement Sandbox) works and answer questions about the platform itself.

STRICT SCOPE & KNOWLEDGE BASE:
1. THE 5 USER ROLES:
   - Gov Department: Publishes municipal and state problem statements, reviews startup applications, approves milestone deliverables, monitors pilot telemetry, and authorizes milestone-linked payments via PFMS.
   - Startup Innovator: DPIIT-registered innovative startups who discover challenges, submit bids with zero EMD, execute sandbox pilots, upload proof of milestone completion, and earn digital Pilot Passports.
   - Independent Validator: Empanelled third-party technical evaluation councils (such as CSIR, QCI, NEERI) who independently verify test benchmarks, audit deliverables on-site, and calculate objective validation scores.
   - Admin / MSInS: Maharashtra State Innovation Society directorate overseeing sandbox operations, maintaining departmental and startup registries, monitoring compliance, and certifying state-wide scale-up procurement under GFR Rule 149.
   - Public Transparency: An open-access portal enabling citizens, civil society, and researchers to track active pilot deployments, disbursed public funds, success rates, and verified digital passports with zero login required.

2. PILOT PASSPORT & SCORING:
   - What it is: A standardized, tamper-evident digital credential issued upon successful pilot completion that certifies public procurement readiness and qualifies startups for General Financial Rules (GFR) Rule 149 exemption and scale-up procurement across government departments.
   - Exact Scoring Weights (Total: 100%):
     • KPI Achievement Delivery: 30%
     • Milestone & Timeline Adherence: 20%
     • Statutory & Safety Compliance: 15%
     • System Reliability & Uptime: 15%
     • Host Department User Feedback: 10%
     • Independent Technical Validation: 10%
   - Performance Tiers:
     • Platinum (Score 90–100): Exceptional performance; fast-tracked for state-wide deployment.
     • Gold (Score 80–89): High quality; eligible for immediate multi-department scale-up.
     • Silver (Score 70–79): Satisfactory outcome; approved for standard deployment.
     • Needs Review (Score below 70): Requires remediation before scale-up eligibility.

3. AI PILOT MONITORING & RISK BADGES:
   - What it is: Automated continuous monitoring system tracking milestone deadlines, telemetry metrics, and PFMS budget burn rates in real time.
   - Risk Badges:
     • Low Risk: Pilot is on schedule, telemetry within healthy thresholds.
     • Medium Risk: Minor schedule delay (<14 days) or pending documentation.
     • High Risk: Critical milestone delay or KPI gap needing active attention.
     • Critical Risk: Significant contractual or performance breach requiring nodal officer escalation.

4. PUBLIC TRANSPARENCY PORTAL:
   - Displays aggregated state-wide statistics: total pilots conducted, budget allocated and disbursed, pilot success rates, departmental breakdowns, and a verifiable public registry of digital Pilot Passports with cryptographic SHA-256 seals.

CRITICAL INSTRUCTIONS & FORMATTING RULES:
- If the user asks about anything unrelated to the NEXORA platform (e.g. general knowledge, coding help, math, trivia, personal questions, recipes, weather, politics), you MUST politely refuse and reply ONLY with:
  "I can only help with questions about how NEXORA works — try asking about roles, passports, or pilots."
- Keep your answers short, concise, and focused (between 2 to 4 sentences maximum).
- Use plain, friendly, conversational language.
- DO NOT use markdown headers (strictly do not use #, ##, or ###).
- This is a quick-help widget, not a full report generator.`;

function getHelpAssistantFallback(userQuery: string): string {
  const query = userQuery.toLowerCase().trim();

  // Explicit off-topic check
  const hasPlatformTerms = /nexora|pilot|passport|role|startup|department|validator|admin|transparency|kpi|scoring|milestone|sandbox|procurement|msins|gfr|pfms|risk|badge|telemetry/i.test(query);
  const unrelatedKeywords = [
    'weather', 'code', 'python', 'javascript', 'react', 'java', 'c++', 'html', 'css', 'recipe', 'cook',
    'joke', 'poem', 'who is', 'president', 'prime minister', 'capital of', 'math', 'calculate', 'movie', 'song',
    'write a story', 'translate', 'dating', 'stock', 'bitcoin', 'crypto', 'game', 'sports', 'cricket', 'football'
  ];

  if (!hasPlatformTerms && unrelatedKeywords.some(w => query.includes(w))) {
    return "I can only help with questions about how NEXORA works — try asking about roles, passports, or pilots.";
  }

  if (/role|user|who can use|actor|stakeholder/i.test(query)) {
    return "NEXORA features 5 user roles: Government Departments (post problem statements and fund pilots), Startup Innovators (deploy solutions and submit milestones), Independent Validators (3rd-party auditors like CSIR/QCI), Admin/MSInS (state innovation directorate), and Public Transparency (an open view for citizens to monitor progress).";
  }

  if (/passport|score|scoring|weight|formula|percentage|platinum|gold|silver/i.test(query)) {
    return "A Pilot Passport is a verified credential proving public procurement readiness under GFR Rule 149. It is scored out of 100 based on KPI Delivery (30%), Milestones (20%), Compliance (15%), Reliability (15%), Department Feedback (10%), and Expert Validation (10%), categorized into Platinum (90+), Gold (80-89), and Silver (70-79).";
  }

  if (/risk|badge|monitoring|telemetry|alert|ai pilot/i.test(query)) {
    return "AI Pilot Monitoring continuously analyzes milestone deadlines, telemetry data, and budget burn rate. Pilots are tagged with risk badges ranging from Low Risk (on track) and Medium Risk (minor delay) to High and Critical Risk, alerting nodal officers when contractual intervention is needed.";
  }

  if (/transparency|portal|public|citizen|open access/i.test(query)) {
    return "The Public Transparency Portal is an unauthenticated open dashboard showing aggregate pilot statistics, total state funds disbursed via PFMS, success ratios, and verified digital Pilot Passports with SHA-256 seals for full public accountability.";
  }

  if (/what is nexora|how does (this|it) work|about nexora|overview|platform/i.test(query)) {
    return "NEXORA is Maharashtra's GovTech Innovation Procurement Sandbox that connects government departments with DPIIT startups for fast-track 6-month pilots. Once validated by third-party experts, successful startups receive a digital Pilot Passport for direct state-wide scale-up without repeat tenders.";
  }

  if (!hasPlatformTerms) {
    return "I can only help with questions about how NEXORA works — try asking about roles, passports, or pilots.";
  }

  return "NEXORA facilitates fast-track government pilots for DPIIT startups with 5 distinct user roles, automated AI risk monitoring, and verified Pilot Passports for direct procurement. Try asking about specific roles, passport scoring weights, or the Public Transparency Portal!";
}

app.post(['/api/help-assistant/chat', '/api/chat/assistant'], async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const trimmedMsg = message.trim();
    const ai = getAI();

    if (ai) {
      try {
        const contents: any[] = [];
        if (Array.isArray(history) && history.length > 0) {
          for (const item of history.slice(-6)) {
            const role = (item.role === 'assistant' || item.role === 'model') ? 'model' : 'user';
            const text = item.text || item.content || '';
            if (text) {
              contents.push({ role, parts: [{ text }] });
            }
          }
        }
        contents.push({ role: 'user', parts: [{ text: trimmedMsg }] });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini request timed out')), 7000)
        );

        const response = await Promise.race([
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents,
            config: {
              systemInstruction: NEXORA_GUIDE_SYSTEM_INSTRUCTION,
              temperature: 0.2,
            },
          }),
          timeoutPromise,
        ]);

        const reply = response.text?.trim();
        if (reply) {
          return res.json({ reply, source: 'gemini' });
        }
      } catch (geminiErr) {
        console.warn('Gemini help assistant error, using fallback:', geminiErr);
      }
    }

    const fallbackReply = getHelpAssistantFallback(trimmedMsg);
    return res.json({ reply: fallbackReply, source: 'fallback' });
  } catch (err: any) {
    console.error('Help assistant endpoint exception:', err);
    res.json({
      reply: "I can only help with questions about how NEXORA works — try asking about roles, passports, or pilots.",
      source: 'error-fallback',
    });
  }
});

// ----------------------------------------------------
// VITE / SPA MIDDLEWARE
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StartupConnect Gov Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
