import React, { useState } from 'react';
import { Download, Sparkles, CheckSquare, Square, RefreshCw, HelpCircle, CheckCircle, ArrowRight, Mail } from 'lucide-react';

interface ChecklistDoc {
  id: string;
  name: string;
  description: string;
  easyExplanation: string;
  sanketTip: string;
  category: 'Identity' | 'Income' | 'Bank Proof' | 'Tax filings';
}

export default function LoanChecklistDownload() {
  const [employmentType, setEmploymentType] = useState<'salaried' | 'self-employed'>('salaried');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const salariedDocs: ChecklistDoc[] = [
    {
      id: 'sal-kyc',
      name: 'Aadhaar Card / PAN Card',
      category: 'Identity',
      description: 'Primary government-issued identification cards for KYC compliance.',
      easyExplanation: 'Proof of who you are. This is requested by standard Reserve Bank guidelines.',
      sanketTip: 'Make sure your name and date of birth match perfectly on both cards to avoid file queries.'
    },
    {
      id: 'sal-slip',
      name: '6 Months Salary Slip',
      category: 'Income',
      description: 'Official monthly payslips issued by your current employer showing earnings.',
      easyExplanation: 'Proof of your active job salary, showing your monthly income and allowances.',
      sanketTip: 'If your company does not issue slips, we can help format an official salary certificate instead.'
    },
    {
      id: 'sal-bank',
      name: '1 Year Bank Statement (Salary Account)',
      category: 'Bank Proof',
      description: 'Detailed bank ledger statements showing continuous salary credits.',
      easyExplanation: 'A PDF printout of your main salary account from the last 12 months.',
      sanketTip: 'Download the official banking PDF directly from your netbanking. Scanned photos are usually rejected.'
    },
    {
      id: 'sal-form16',
      name: '2 Years Form 16',
      category: 'Tax filings',
      description: 'Employer-issued certificate of tax deducted at source under Income Tax parameters.',
      easyExplanation: 'A routine tax document issued by your HR or finance department.',
      sanketTip: 'If Form 16 is unavailable, 2 years of your personal IT Return files work perfectly too.'
    }
  ];

  const selfEmployedDocs: ChecklistDoc[] = [
    {
      id: 'se-kyc',
      name: 'Aadhaar Card / PAN Card',
      category: 'Identity',
      description: 'Primary identity verification cards representing individual parameters.',
      easyExplanation: 'Standard identity proof for yourself and your business entity.',
      sanketTip: 'Keep both personal and company PAN ready if you run a registered Private Limited company.'
    },
    {
      id: 'se-itr',
      name: '3 Years IT Return with Computation',
      category: 'Income',
      description: 'Income Tax Return files complete with calculation sheets and accounts.',
      easyExplanation: 'Tax documents showing how much profit your business reported over 3 years.',
      sanketTip: 'Provide the full multi-page Computation Sheet, not just the single-page acknowledgment receipt.'
    },
    {
      id: 'se-gst',
      name: 'GST Certificate / Udyam Registration',
      category: 'Tax filings',
      description: 'Official corporate registrations or micro enterprise certificate proving commercial existence.',
      easyExplanation: 'Government document showing that your business is active and legally registered.',
      sanketTip: 'If you do not have GST, simple local Gumastadhara licenses (shop establishment) are acceptable.'
    },
    {
      id: 'se-bank',
      name: '1 Year Bank Statement (Current & Savings)',
      category: 'Bank Proof',
      description: 'Primary operational bank ledgers for business turnover and checks.',
      easyExplanation: 'Statements from your business current account and your primary savings account.',
      sanketTip: 'A rich business turnover shown in your current bank account statement dramatically boosts your score.'
    }
  ];

  const currentDocs = employmentType === 'salaried' ? salariedDocs : selfEmployedDocs;

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleClear = () => {
    setCheckedItems({});
  };

  const handleDownload = () => {
    const listTitle = employmentType === 'salaried' ? 'SALARIED PROFESSIONAL' : 'SELF-EMPLOYED PROPRIETOR / BUSINESS';
    const activeDocs = currentDocs;

    const heading = `========================================================\n` +
                    `               SR FINSERV & TITLE ADVISORY\n` +
                    `     HOME & MORTGAGE LOANS REQUIRED DOCUMENT CHECKLIST\n` +
                    `========================================================\n\n` +
                    `Employment Profile: ${listTitle}\n` +
                    `Generated On       : ${new Date().toLocaleDateString()}\n` +
                    `Status Summary     : ${activeDocs.filter(d => checkedItems[d.id]).length} of ${activeDocs.length} Verified\n` +
                    `Legal / Loan Rep   : Sanket Champaneri\n` +
                    `Office Helpline    : +91 84879 74404\n` +
                    `--------------------------------------------------------\n\n` +
                    `MANDATORY DOSSIER PAPERS:\n\n`;

    let body = '';
    activeDocs.forEach((doc, idx) => {
      const isChecked = !!checkedItems[doc.id];
      const checkBox = isChecked ? '[✓] PREPARED   ' : '[ ] INCOMPLETE ';
      body += `${idx + 1}. ${checkBox} - ${doc.name}\n` +
              `   Easy understanding explanation: ${doc.easyExplanation}\n` +
              `   Sanket's Expert Tip           : ${doc.sanketTip}\n\n`;
    });

    const footer = `--------------------------------------------------------\n` +
                   `NEXT ACTION STEPS:\n` +
                   `1. Gather the documents checked above (digital PDFs or clear photos).\n` +
                   `2. Email files directly to sanketbhavsar27@gmail.com for expert scrutiny.\n` +
                   `3. Reach out to Sanket Champaneri at +91 84879 74404 to fast-track your file.\n\n` +
                   `SR Finserv - Your Premium Financial Advisory Partner. Thank you.`;

    const fullContent = heading + body + footer;
    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = `SR_Finserv_Mortgage_Checklist_${employmentType}.txt`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Calculate progress
  const doneCount = currentDocs.filter(doc => checkedItems[doc.id]).length;
  const totalCount = currentDocs.length;
  const percentage = Math.round((doneCount / totalCount) * 100);

  return (
    <div className="bg-white rounded-3xl border border-slate-150 shadow-md overflow-hidden text-left" id="loan-documents-checklist">
      {/* Visual Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 px-6 py-6 border-b border-indigo-500/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-2.5 py-0.5 mb-2">
            <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300">Easy-to-Understand Guide</span>
          </div>
          <h3 className="font-display font-extrabold text-xl text-white leading-tight">Mortgage Document Planner</h3>
          <p className="text-xs text-slate-300 mt-1">We make paper compliance simple. Go through the checklist step-by-step!</p>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md self-start sm:self-center cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Download Checklist (.TXT)
        </button>
      </div>

      <div className="p-6">
        {/* Step Breakdown Intro */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 flex items-start gap-2.5">
            <span className="text-[#059669] text-base font-bold mt-0.5">1</span>
            <div>
              <p className="text-xs font-black text-slate-800 uppercase tracking-wide">Select Profile</p>
              <p className="text-[10.5px] text-slate-500 font-semibold mt-0.5">Choose Salaried or Self-Employed</p>
            </div>
          </div>
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex items-start gap-2.5">
            <span className="text-blue-600 text-base font-bold mt-0.5">2</span>
            <div>
              <p className="text-xs font-black text-slate-800 uppercase tracking-wide">Tick Items</p>
              <p className="text-[10.5px] text-slate-500 font-semibold mt-0.5">Check off documents you have ready</p>
            </div>
          </div>
          <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-3 flex items-start gap-2.5">
            <span className="text-purple-600 text-base font-bold mt-0.5">3</span>
            <div>
              <p className="text-xs font-black text-slate-800 uppercase tracking-wide">Email documents</p>
              <p className="text-[10.5px] text-slate-500 font-semibold mt-0.5">Send your files securely to sanketbhavsar27@gmail.com</p>
            </div>
          </div>
        </div>

        {/* Employment Category Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-50 border border-slate-150 rounded-2xl mb-6">
          <button
            onClick={() => setEmploymentType('salaried')}
            className={`py-3 px-4 rounded-xl text-xs font-black tracking-wide transition-all cursor-pointer text-center ${
              employmentType === 'salaried'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-150'
            }`}
          >
            🧑‍💼 Salaried (Regular Job & Payslip)
          </button>
          <button
            onClick={() => setEmploymentType('self-employed')}
            className={`py-3 px-4 rounded-xl text-xs font-black tracking-wide transition-all cursor-pointer text-center ${
              employmentType === 'self-employed'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-150'
            }`}
          >
            🏢 Self-Employed (Shop & Business owners)
          </button>
        </div>

        {/* Dynamic Audit Progress Meter */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Verification Progress</span>
              <span className="text-xs font-extrabold text-slate-900">
                {employmentType === 'salaried' ? 'Your Salaried Document Folder' : 'Your Business Document Folder'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-black text-blue-700 bg-blue-50 border border-blue-150 px-2.5 py-1 rounded-lg">
                {doneCount} of {totalCount} Ready ({percentage}%)
              </span>
            </div>
          </div>
          {/* Custom progress track bar */}
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden p-0.5 border border-slate-300">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Documents Checklist interactive rows */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Essential Document List</span>
            {doneCount > 0 && (
              <button
                onClick={handleClear}
                className="text-[10px] font-bold text-red-500 hover:text-red-700 hover:underline flex items-center gap-1 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Start Over
              </button>
            )}
          </div>

          <div className="space-y-3">
            {currentDocs.map((doc, idx) => {
              const checked = !!checkedItems[doc.id];
              return (
                <div
                  key={doc.id}
                  onClick={() => toggleCheck(doc.id)}
                  className={`border rounded-2xl p-4.5 transition-all cursor-pointer select-none relative overflow-hidden ${
                    checked 
                      ? 'bg-emerald-50/10 border-emerald-400 shadow-xs' 
                      : 'bg-white border-slate-200 hover:border-slate-350 hover:bg-slate-50/30'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 shrink-0">
                      {checked ? (
                        <div className="w-5 h-5 bg-emerald-600 text-white rounded-md flex items-center justify-center">
                          ✓
                        </div>
                      ) : (
                        <div className="w-5 h-5 border-2 border-slate-300 rounded-md hover:border-slate-400" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md tracking-wider bg-slate-100 text-slate-600 font-mono">
                          {doc.category}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">Step {idx + 1}</span>
                      </div>

                      <h4 className={`text-sm font-black mt-1.5 ${checked ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                        {doc.name}
                      </h4>
                      
                      <p className="text-[11px] text-slate-500 mt-1 font-bold leading-normal">
                        {doc.easyExplanation}
                      </p>

                      {/* Sanket's direct tip container */}
                      <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-2.5 mt-2.5 flex items-start gap-2">
                        <span className="text-[10px] uppercase py-0.5 px-1.5 rounded-md bg-amber-100 text-amber-800 font-black text-[9px] tracking-wide mt-0.5 shrink-0">
                          Sanket's Tip
                        </span>
                        <p className="text-[10.5px] text-slate-600 font-semibold leading-relaxed">
                          {doc.sanketTip}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Helpline and Email documents callout */}
        <div className="bg-blue-50/60 border border-blue-200/60 rounded-2xl p-4.5 flex items-start gap-3.5 shadow-3xs">
          <span className="text-xl shrink-0">📧</span>
          <div className="space-y-2 flex-grow">
            <p className="font-extrabold text-[12px] text-blue-900">Ready to submit? Email your documents directly!</p>
            <p className="text-[11px] text-blue-800 leading-relaxed font-semibold">
              Don't worry if forms seem confusing. You can securely send your gathered documents, PDF files, or receipts directly to our inbox: <a href="mailto:sanketbhavsar27@gmail.com" className="font-black text-blue-700 underline">sanketbhavsar27@gmail.com</a>, or call Sanket on <a href="tel:+918487974404" className="underline font-bold">+91 84879 74404</a>.
            </p>
            <div className="pt-1">
              <a
                href="mailto:sanketbhavsar27@gmail.com?subject=My%20SR%20Finserv%20Loan%20Documents%2520Checklist&body=Hi%2520Sanket,%0A%0AI%2520have%2520completed%2520the%2520required%2520documents%2520checklist%2520on%2520the%2520website.%2520Please%2520find%2520attached%2520my%2520income%2520and%2520identity%2520proofs%2520for%2520review.%0A%0AThank%2520you."
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] uppercase tracking-wide px-3.5 py-1.5 rounded-lg transition-all"
              >
                <Mail className="w-3.5 h-3.5" />
                Draft Document Email
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
