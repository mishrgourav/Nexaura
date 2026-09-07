export interface CertificateData {
  startupName: string;
  departmentName: string;
  problemTitle: string;
  validatorName: string;
  validatorOrg?: string;
  category: string;
  score: number;
  isScaleUpRecommended: boolean;
  totalBudgetLakhs: number | string;
  certificateHash: string;
  shortHash: string;
  dpiitNumber?: string;
  validationDate?: string;
  sector?: string;
}

export function generateCertificateHtml(data: CertificateData): string {
  const dateStr = data.validationDate || new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pilot Passport Credential - ${data.startupName}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 10mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #FAF7F0;
      color: #0F172A;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .certificate-card {
      background: #FFFFFF;
      width: 100%;
      max-width: 960px;
      border: 8px solid #B45309;
      outline: 2px solid #D97706;
      outline-offset: -12px;
      padding: 36px 44px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.08);
      position: relative;
      background-image: 
        radial-gradient(#d9770615 1px, transparent 1px),
        linear-gradient(to right, rgba(251, 146, 60, 0.05), rgba(255, 255, 255, 0.9), rgba(34, 197, 94, 0.05));
    }
    .header-bar {
      text-align: center;
      border-bottom: 2px solid #E2E8F0;
      padding-bottom: 16px;
      margin-bottom: 20px;
      position: relative;
    }
    .tricolor-stripe {
      height: 4px;
      background: linear-gradient(to right, #FF9933 33%, #FFFFFF 33%, #FFFFFF 66%, #138808 66%);
      border-radius: 2px;
      margin-bottom: 12px;
      border: 1px solid #CBD5E1;
    }
    .national-emblem {
      display: inline-block;
      font-size: 28px;
      line-height: 1;
      margin-bottom: 4px;
    }
    .super-title {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      color: #0F766E;
    }
    .main-title {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #1E293B;
      margin-top: 4px;
    }
    .sub-title {
      font-size: 12px;
      color: #64748B;
      margin-top: 2px;
    }
    .cert-body {
      text-align: center;
      margin: 20px 0;
    }
    .certifies-text {
      font-size: 13px;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 600;
    }
    .startup-name {
      font-size: 28px;
      font-weight: 800;
      color: #B45309;
      text-decoration: underline;
      text-decoration-color: #F59E0B;
      text-underline-offset: 6px;
      margin: 10px 0 14px;
    }
    .badge-row {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .badge {
      font-size: 11px;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 9999px;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }
    .badge-dpiit {
      background: #F1F5F9;
      color: #0F766E;
      border: 1px solid #CBD5E1;
    }
    .badge-tier {
      background: #FEF3C7;
      color: #92400E;
      border: 1px solid #FCD34D;
    }
    .badge-scaleup {
      background: #DCFCE7;
      color: #166534;
      border: 1px solid #86EFAC;
    }
    .details-table {
      width: 100%;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 14px 18px;
      margin-bottom: 24px;
      font-size: 12px;
      line-height: 1.6;
      text-align: left;
    }
    .details-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px solid #EEF2F6;
    }
    .details-row:last-child {
      border-bottom: none;
    }
    .details-label {
      font-weight: 700;
      color: #64748B;
      min-width: 160px;
    }
    .details-val {
      font-weight: 600;
      color: #1E293B;
      text-align: right;
    }
    .footer-grid {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-top: 1px solid #E2E8F0;
      padding-top: 16px;
      font-size: 11px;
    }
    .validator-block {
      text-align: left;
    }
    .validator-title {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748B;
      letter-spacing: 0.5px;
    }
    .validator-name {
      font-size: 14px;
      font-weight: 800;
      color: #0F172A;
      margin-top: 2px;
    }
    .validator-note {
      color: #64748B;
      font-size: 10px;
      margin-top: 2px;
    }
    .hash-block {
      text-align: right;
    }
    .hash-val {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      color: #334155;
      background: #F1F5F9;
      padding: 4px 8px;
      border-radius: 4px;
      display: inline-block;
      margin-top: 4px;
      border: 1px solid #CBD5E1;
    }
    .print-bar {
      margin-top: 20px;
      text-align: center;
    }
    .print-btn {
      background: #0D9488;
      color: #FFFFFF;
      border: none;
      padding: 10px 20px;
      font-size: 13px;
      font-weight: 700;
      border-radius: 8px;
      cursor: pointer;
      box-shadow: 0 4px 10px rgba(13, 148, 136, 0.3);
    }
    .print-btn:hover {
      background: #0F766E;
    }
    @media print {
      body {
        background: #FFFFFF !important;
        padding: 0 !important;
      }
      .certificate-card {
        border-width: 6px !important;
        box-shadow: none !important;
        margin: 0 auto !important;
      }
      .print-bar {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="certificate-card">
    <div class="header-bar">
      <div class="tricolor-stripe"></div>
      <div class="super-title">Government of India • National Innovation & Public Procurement Registry</div>
      <h1 class="main-title">OFFICIAL PILOT PASSPORT CREDENTIAL</h1>
      <p class="sub-title">National Innovation Procurement Sandbox Guidelines • General Financial Rules (GFR) Rule 149 Exemption</p>
    </div>

    <div class="cert-body">
      <p class="certifies-text">This certifies that the innovation solution by</p>
      <h2 class="startup-name">${escapeHtml(data.startupName)}</h2>

      <div class="badge-row">
        <span class="badge badge-dpiit">DPIIT Registered: ${escapeHtml(data.dpiitNumber || 'DIPP94821')}</span>
        <span class="badge badge-tier">${escapeHtml(data.category)} (${data.score}/100)</span>
        <span class="badge badge-scaleup">Scale-Up Certified: ${data.isScaleUpRecommended ? 'YES (Scale-Up Approved)' : 'NO (Review Required)'}</span>
      </div>

      <div class="details-table">
        <div class="details-row">
          <span class="details-label">Host Department:</span>
          <span class="details-val">${escapeHtml(data.departmentName)}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Problem Statement Addressed:</span>
          <span class="details-val">${escapeHtml(data.problemTitle)}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Audited Pilot Budget Outlay:</span>
          <span class="details-val">₹${data.totalBudgetLakhs} Lakhs (100% PFMS Audited)</span>
        </div>
        <div class="details-row">
          <span class="details-label">Evaluation Date:</span>
          <span class="details-val">${dateStr}</span>
        </div>
      </div>

      <div class="footer-grid">
        <div class="validator-block">
          <div class="validator-title">Empanelled Technical Validator</div>
          <div class="validator-name">${escapeHtml(data.validatorName)}</div>
          <div class="validator-note">CSIR / QCI Empanelled Technical Evaluation Council • Verified Completed</div>
        </div>

        <div class="hash-block">
          <div class="validator-title">Cryptographic SHA-256 Ledger Seal</div>
          <div class="hash-val">${escapeHtml(data.certificateHash)}</div>
        </div>
      </div>
    </div>

    <div class="print-bar">
      <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
    </div>
  </div>

  <script>
    // Automatically trigger print dialog when opened in new tab or popup
    if (window.location.protocol !== 'file:') {
      setTimeout(function() {
        try { window.print(); } catch (e) { console.log(e); }
      }, 350);
    }
  </script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
