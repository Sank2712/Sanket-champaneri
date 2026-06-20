import React, { useState } from 'react';
import { Download, Sparkles, CheckSquare, Square, ClipboardList, RefreshCw } from 'lucide-react';

export default function LoanChecklistDownload() {
  const [employmentType, setEmploymentType] = useState<'salaried' | 'self-employed'>('salaried');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const salariedDocs = [
    {
      id: 'sal-kyc',
      name: 'Aadhaar Card / PAN Card',
      description: 'Primary government-issued identification cards for KYC compliance.'
    },
    {
      id: 'sal-slip',
      name: '6 Months Salary Slip',
      description: 'Official monthly payslips issued by your current employer showing earnings and deductions.'
    },
    {
      id: 'sal-bank',
      name: '1 Year Bank Statement (Salary Account)',
      description: 'Detailed bank ledger statements showing continuous salary credits.'
    },
    {
      id: 'sal-form16',
      name: '2 Years Form 16',
      description: 'Employer-issued certificate of tax deducted at source under Income Tax parameters.'
    }
  ];

  const selfEmployedDocs = [
    {
      id: 'se-kyc',
      name: 'Aadhaar Card / PAN Card',
      description: 'Primary identity verification cards representing individual parameters.'
    },
    {
      id: 'se-itr',
      name: '3 Years IT Return with Computation',
      description: 'Income Tax Return files complete with calculation sheets, profit & loss tables, and balance sheets.'
    },
    {
      id: 'se-gst',
      name: 'GST / Udyam Certificate',
      description: 'Official corporate registrations or micro enterprise certificate proving commercial existence.'
    },
    {
      id: 'se-bank',
      name: '1 Year Bank Statement (Current & Savings)',
      description: 'Primary operational bank ledgers for business turnover and personal liquidity checks.'
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
              `   Details: ${doc.description}\n\n`;
    });

    const footer = `--------------------------------------------------------\n` +
                   `NEXT ACTION STEPS:\n` +
                   `1. Assemble the documents checked above (originals and legible photocopies).\n` +
                   `2. Contact our dedicated mortgage coordinates for doorstep verification.\n` +
                   `3. Reach out to Sanket Champaneri at +91 84879 74404 to fast-track your file.\n\n` +
                   `SR Finserv - Your Premium Doorstep Advisory Partner. Thank you.`;

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

  // Calculate dynamic progress
  const doneCount = currentDocs.filter(doc => checkedItems[doc.id]).length;
  const totalCount = currentDocs.length;
  const percentage = Math.round((doneCount / totalCount) * 100);

  return (
    <div className="bg-white rounded-3xl border border-slate-150 shadow-lg overflow-hidden text-left" id="loan-documents-checklist">
      {/* Visual Mini Header */}
      <div className="bg-gradient-to-r from-brand-navy-950 via-brand-navy-900 to-brand-navy-950 px-6 py-5 border-b border-brand-gold-500/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-brand-gold-500/10 border border-brand-gold-500/20 rounded-full px-2.5 py-0.5 mb-2">
            <Sparkles className="w-3 h-3 text-brand-gold-500 animate-pulse" />
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-brand-gold-500">Advisory Desk</span>
          </div>
          <h3 className="font-display font-extrabold text-lg text-white leading-tight">Mortgage & Home Loan Document Planner</h3>
          <p className="text-xs text-slate-350 mt-1">Audit your primary bank and compliance papers before launching your file.</p>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 bg-brand-gold-500 hover:bg-brand-gold-600 active:scale-95 text-brand-navy-950 font-extrabold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md self-start sm:self-center cursor-pointer"
        >
          <Download className="w-4 h-4 text-brand-navy-950" />
          Download Checklist (.TXT)
        </button>
      </div>

      <div className="p-6">
        {/* Employment Category Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-50 border border-slate-150 rounded-2xl mb-6">
          <button
            onClick={() => setEmploymentType('salaried')}
            className={`py-3 px-4 rounded-xl text-xs font-black tracking-wide transition-all cursor-pointer text-center ${
              employmentType === 'salaried'
                ? 'bg-brand-navy-950 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-150'
            }`}
          >
            🧑‍💼 Salaried Category
          </button>
          <button
            onClick={() => setEmploymentType('self-employed')}
            className={`py-3 px-4 rounded-xl text-xs font-black tracking-wide transition-all cursor-pointer text-center ${
              employmentType === 'self-employed'
                ? 'bg-brand-navy-950 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-150'
            }`}
          >
            🏢 Self-Employed Category
          </button>
        </div>

        {/* Dynamic Audit Progress Meter */}
        <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4.5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Verification Scope</span>
              <span className="text-sm font-extrabold text-brand-navy-950">
                {employmentType === 'salaried' ? 'Salaried Dossier Status' : 'Self-Employed Dossier Status'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-black text-brand-navy-950 bg-slate-200/60 border border-slate-300 px-2.5 py-1 rounded-lg font-mono">
                {doneCount} / {totalCount} Ready ({percentage}%)
              </span>
            </div>
          </div>
          {/* Custom progress track bar */}
          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-300">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-600 h-full rounded-full transition-all duration-350 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Documents Checklist interactive rows */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Required Audit Items</span>
            {doneCount > 0 && (
              <button
                onClick={handleClear}
                className="text-[10px] font-bold text-red-500 hover:text-red-700 hover:underline flex items-center gap-1 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Reset Progress
              </button>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-xs">
            {currentDocs.map((doc) => {
              const checked = !!checkedItems[doc.id];
              return (
                <div
                  key={doc.id}
                  onClick={() => toggleCheck(doc.id)}
                  className={`flex items-start gap-3.5 p-4 transition-all cursor-pointer select-none ${
                    checked ? 'bg-emerald-50/15' : 'hover:bg-slate-50/40'
                  }`}
                >
                  <div className="mt-0.5 shrink-0 transition-all">
                    {checked ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span
                      className={`text-sm font-bold block ${
                        checked ? 'text-slate-400 line-through font-medium' : 'text-brand-navy-950'
                      }`}
                    >
                      {doc.name}
                    </span>
                    <p className={`text-xs mt-0.5 leading-relaxed font-semibold ${checked ? 'text-slate-400' : 'text-slate-500'}`}>
                      {doc.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Helpline and Doorstep pick-up callout */}
        <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-lg shrink-0 mt-0.5">🚴</span>
          <div className="space-y-1">
            <p className="font-extrabold text-xs text-amber-900">Doorstep Verification Desk</p>
            <p className="text-[11px] text-amber-800 leading-relaxed font-semibold">
              Ready to submit? Reach out to Sanket Champaneri on <a href="tel:+918487974404" className="underline font-bold">+91 84879 74404</a>. Our legal representative will visit your doorstep to copy physical dossiers or authenticate documents free of cost.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
