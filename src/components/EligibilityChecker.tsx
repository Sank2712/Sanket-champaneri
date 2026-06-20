import React, { useState, useMemo } from 'react';
import { Landmark, ArrowUpRight, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function EligibilityChecker() {
  const [income, setIncome] = useState<number>(75000); // Net monthly income: 75K
  const [existingEmi, setExistingEmi] = useState<number>(10000); // Existing EMIs: 10K
  const [loanType, setLoanType] = useState<'home' | 'business' | 'personal'>('home');
  const [tenureYears, setTenureYears] = useState<number>(20);

  const interestRate = useMemo(() => {
    switch (loanType) {
      case 'home': return 7.20;
      case 'business': return 12.0;
      case 'personal': return 11.5;
    }
  }, [loanType]);

  const eligibility = useMemo(() => {
    // Standard bank multipliers
    // FOIR (Fixed Obligation to Income Ratio) - typically 50% for standard incomes, goes up to 60% for higher income
    const foir = income > 150000 ? 0.60 : income > 50000 ? 0.50 : 0.45;
    const maxAllowedEmi = income * foir;
    const availableEmiForNewLoan = Math.max(0, maxAllowedEmi - existingEmi);

    if (availableEmiForNewLoan <= 0) {
      return {
        maxPrincipal: 0,
        maxEMI: 0,
        monthlyAffordability: 0,
        foirPercent: foir * 100,
        status: 'insufficient_surplus'
      };
    }

    // Solve for P: P = EMI * ((1+r)^n - 1) / (r * (1+r)^n)
    const r = (interestRate / 12) / 100;
    const n = tenureYears * 12;

    if (r === 0) {
      return {
        maxPrincipal: availableEmiForNewLoan * n,
        maxEMI: availableEmiForNewLoan,
        monthlyAffordability: maxAllowedEmi,
        foirPercent: foir * 100,
        status: 'eligible'
      };
    }

    const numerator = Math.pow(1 + r, n) - 1;
    const denominator = r * Math.pow(1 + r, n);
    const maxPrincipal = availableEmiForNewLoan * (numerator / denominator);

    return {
      maxPrincipal: Math.round(maxPrincipal),
      maxEMI: Math.round(availableEmiForNewLoan),
      monthlyAffordability: Math.round(maxAllowedEmi),
      foirPercent: foir * 100,
      status: 'eligible'
    };
  }, [income, existingEmi, interestRate, tenureYears]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div id="eligibility-checker-component" className="bg-white rounded-2xl shadow-xl border border-brand-navy-100 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-brand-navy-50 rounded-xl text-brand-navy-600">
          <Landmark className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-brand-navy-800">Quick Loan Eligibility Checker</h3>
          <p className="text-sm text-slate-500">Estimate your borrowing limits prior to formal banking applications</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User parameters */}
        <div className="space-y-5">
          {/* Loan Category Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Select Loan Objective</label>
            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => { setLoanType('home'); setTenureYears(20); }}
                className={`py-2 text-center rounded-lg font-medium text-xs transition-all ${loanType === 'home' ? 'bg-white text-brand-navy-800 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Home Loan
              </button>
              <button
                type="button"
                onClick={() => { setLoanType('business'); setTenureYears(5); }}
                className={`py-2 text-center rounded-lg font-medium text-xs transition-all ${loanType === 'business' ? 'bg-white text-brand-navy-800 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Business
              </button>
              <button
                type="button"
                onClick={() => { setLoanType('personal'); setTenureYears(3); }}
                className={`py-2 text-center rounded-lg font-medium text-xs transition-all ${loanType === 'personal' ? 'bg-white text-brand-navy-800 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Personal
              </button>
            </div>
          </div>

          {/* Income Control */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-brand-navy-800">Net Monthly Salary / Profit</label>
              <span className="text-sm font-bold text-brand-navy-600">{formatCurrency(income)}</span>
            </div>
            <input
              type="range"
              min="15000"
              max="500000"
              step="5000"
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              className="w-full accent-brand-navy-600 h-2 bg-brand-navy-100 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>₹15K</span>
              <span>₹1.5 Lakhs</span>
              <span>₹3 Lakhs</span>
              <span>₹5 Lakhs</span>
            </div>
          </div>

          {/* Existing EMI Control */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-brand-navy-800">Existing Monthly Outgoing EMIs</label>
              <span className="text-sm font-bold text-red-500">{formatCurrency(existingEmi)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="150000"
              step="2000"
              value={existingEmi}
              onChange={(e) => setExistingEmi(Number(e.target.value))}
              className="w-full accent-brand-navy-600 h-2 bg-brand-navy-100 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>₹0 (None)</span>
              <span>₹50K</span>
              <span>₹1 Lakh</span>
              <span>₹1.5 Lakhs</span>
            </div>
          </div>

          {/* Tenure Control */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-brand-navy-800">Desired Tenure</label>
              <span className="text-sm font-bold text-brand-navy-600">{tenureYears} Years</span>
            </div>
            <input
              type="range"
              min="1"
              max={loanType === 'home' ? 30 : loanType === 'business' ? 10 : 7}
              step="1"
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full accent-brand-navy-600 h-2 bg-brand-navy-100 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>1 Yr</span>
              <span>{loanType === 'home' ? '15 Yrs' : '5 Yrs'}</span>
              <span>{loanType === 'home' ? '30 Yrs' : loanType === 'business' ? '10 Yrs' : '7 Yrs'}</span>
            </div>
          </div>
        </div>

        {/* Diagnostic assessment outputs */}
        <div className="bg-brand-navy-900 text-white rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          {/* Subtle design grid decor */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold-500/10 rounded-full blur-3xl pointer-events-none" />

          {eligibility.status === 'eligible' && eligibility.maxPrincipal > 0 ? (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-brand-gold-100">
                <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider">High Eligibility Score</span>
              </div>

              <div>
                <span className="text-xs text-slate-400">Maximum Eligible Loan Principal</span>
                <span className="text-3xl md:text-4xl font-display font-extrabold text-white block mt-1">
                  {formatCurrency(eligibility.maxPrincipal)}
                </span>
                <span className="text-xs text-brand-gold-100/80 mt-1 block">
                  Estimating approx Interest Rate: <span className="font-mono font-semibold">{interestRate}% p.a.</span>
                </span>
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Monthly Earnings:</span>
                  <span className="font-bold text-white">{formatCurrency(income)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Affordability Cap ({eligibility.foirPercent}% limit):</span>
                  <span className="font-bold text-white">{formatCurrency(eligibility.monthlyAffordability)}</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>Current Demitted Obligations:</span>
                  <span className="font-bold">- {formatCurrency(existingEmi)}</span>
                </div>
                <div className="flex justify-between text-green-400 font-semibold border-t border-white/5 pt-2">
                  <span>New Max monthly EMI limit:</span>
                  <span>{formatCurrency(eligibility.maxEMI)}</span>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-start gap-2 text-[11px] text-slate-300">
                <ShieldCheck className="w-4 h-4 text-brand-gold-500 shrink-0 mt-0.5" />
                <p>Documents representing secondary income, rentals, or active spouse applications can further expand your eligibility limits.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-5 my-auto text-center py-6">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto" />
              <div>
                <h4 className="font-bold text-base text-white">Income Obligations Ratio is High</h4>
                <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">
                  Your current monthly EMIs ({formatCurrency(existingEmi)}) eat up a significant portion of your income. Banks require a larger credit margin.
                </p>
              </div>
              <div className="p-3.5 bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-300 rounded-xl">
                Consider reducing existing obligations or stretching out the tenure slider to increase potential loan limits.
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-between items-center text-xs text-slate-400 border-t border-white/10 pt-4">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 bg-green-500 h-2 rounded-full" />
              SR Finserv Standard Rate Advice
            </span>
            <span className="font-mono text-brand-gold-100">Ready to consult</span>
          </div>
        </div>
      </div>
    </div>
  );
}
