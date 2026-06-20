import React, { useState, useMemo } from 'react';
import { Calculator, DollarSign, Calendar, TrendingUp } from 'lucide-react';

export default function EMICalculator() {
  const [principal, setPrincipal] = useState<number>(2500000); // 25 Lakhs
  const [interestRate, setInterestRate] = useState<number>(7.20); // 7.20%
  const [tenure, setTenure] = useState<number>(20); // 20 years
  const [tenureType, setTenureType] = useState<'years' | 'months'>('years');

  const formattedPrincipal = useMemo(() => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(principal);
  }, [principal]);

  // EMI Logic
  const emiData = useMemo(() => {
    const P = principal;
    const r = (interestRate / 12) / 100;
    const n = tenureType === 'years' ? tenure * 12 : tenure;

    if (r === 0) {
      const monthly = P / n;
      const totalAmount = P;
      const totalInterestPayable = 0;
      return {
        monthlyEMI: monthly,
        totalInterest: totalInterestPayable,
        totalPayable: totalAmount,
        interestPercentage: 0,
        principalPercentage: 100
      };
    }

    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayable = emi * n;
    const totalInterest = totalPayable - P;

    const interestPercent = (totalInterest / totalPayable) * 100;
    const principalPercent = 100 - interestPercent;

    return {
      monthlyEMI: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayable: Math.round(totalPayable),
      interestPercentage: Math.round(interestPercent),
      principalPercentage: Math.round(principalPercent)
    };
  }, [principal, interestRate, tenure, tenureType]);

  // Amortization Schedule (top 15 rows for display)
  const scheduleRows = useMemo(() => {
    const rows = [];
    const P = principal;
    const r = (interestRate / 12) / 100;
    const n = tenureType === 'years' ? tenure * 12 : tenure;

    let balance = P;
    const emi = emiData.monthlyEMI;

    // We can do annual grouping for better display
    if (tenureType === 'years') {
      for (let year = 1; year <= tenure; year++) {
        let yearlyInterest = 0;
        let yearlyPrincipal = 0;
        
        for (let m = 1; m <= 12; m++) {
          const interest = balance * r;
          const principalPaid = emi - interest;
          yearlyInterest += interest;
          yearlyPrincipal += principalPaid;
          balance -= principalPaid;
          if (balance < 0) balance = 0;
        }

        rows.push({
          period: `Year ${year}`,
          principalPaid: Math.round(yearlyPrincipal),
          interestPaid: Math.round(yearlyInterest),
          remainingBalance: Math.round(balance)
        });

        if (balance <= 0) break;
      }
    } else {
      // Monthly schedule, show first 10 months and final summary
      for (let month = 1; month <= Math.min(n, 12); month++) {
        const interest = balance * r;
        const principalPaid = emi - interest;
        balance -= principalPaid;
        rows.push({
          period: `Month ${month}`,
          principalPaid: Math.round(principalPaid),
          interestPaid: Math.round(interest),
          remainingBalance: Math.max(0, Math.round(balance))
        });
      }
    }
    return rows;
  }, [principal, interestRate, tenure, tenureType, emiData]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div id="emi-calculator-component" className="bg-white rounded-2xl shadow-xl border border-brand-navy-100 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-brand-navy-50 rounded-xl text-brand-navy-600">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-brand-navy-800">Smart EMI Loan Calculator</h3>
          <p className="text-sm text-slate-500">Calculate monthly outflows & plan your loan budget</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          {/* Principal Control */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-brand-navy-800">Loan Amount</label>
              <div className="flex items-center gap-2 bg-brand-navy-50 border border-brand-navy-100 px-3 py-1.5 rounded-lg">
                <span className="text-xs font-semibold text-brand-navy-600">₹</span>
                <input
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(Math.max(10000, Math.min(100000000, Number(e.target.value))))}
                  className="w-28 text-right bg-transparent border-none outline-none font-bold text-brand-navy-800 text-sm focus:ring-0"
                />
              </div>
            </div>
            <input
              type="range"
              min="100000"
              max="20000000"
              step="50000"
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full accent-brand-navy-600 h-2 bg-brand-navy-100 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>₹1 Lakh</span>
              <span>₹50 L</span>
              <span>₹1 Cr</span>
              <span>₹2 Cr</span>
            </div>
          </div>

          {/* Interest Control */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-brand-navy-800">Interest Rate (% p.a.)</label>
              <div className="flex items-center gap-1 bg-brand-navy-50 border border-brand-navy-100 px-3 py-1.5 rounded-lg">
                <input
                  type="number"
                  step="0.05"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Math.max(1, Math.min(30, Number(e.target.value))))}
                  className="w-14 text-right bg-transparent border-none outline-none font-bold text-brand-navy-800 text-sm"
                />
                <span className="text-xs font-semibold text-brand-navy-600">%</span>
              </div>
            </div>
            <input
              type="range"
              min="5"
              max="20"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full accent-brand-navy-600 h-2 bg-brand-navy-100 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>5%</span>
              <span>7.2% (Home Loan Promo)</span>
              <span>8.7% (Mortgage Loan)</span>
              <span>12%+ (Business Loan)</span>
            </div>
          </div>

          {/* Tenure Control */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-brand-navy-800">Loan Tenure</label>
              <div className="flex items-center gap-2">
                {/* Tenure Selector */}
                <div className="flex bg-brand-navy-100 p-0.5 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => { setTenureType('years'); if (tenure > 30) setTenure(15); }}
                    className={`px-3 py-1 rounded-md transition-all ${tenureType === 'years' ? 'bg-white text-brand-navy-800 shadow-xs' : 'text-slate-500'}`}
                  >
                    Years
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTenureType('months'); if (tenure <= 30) setTenure(tenure * 12); }}
                    className={`px-3 py-1 rounded-md transition-all ${tenureType === 'months' ? 'bg-white text-brand-navy-800 shadow-xs' : 'text-slate-500'}`}
                  >
                    Months
                  </button>
                </div>
                <div className="flex items-center gap-1 bg-brand-navy-50 border border-brand-navy-100 px-3 py-1.5 rounded-lg">
                  <input
                    type="number"
                    value={tenure}
                    onChange={(e) => setTenure(Math.max(1, Math.min(360, Number(e.target.value))))}
                    className="w-12 text-right bg-transparent border-none outline-none font-bold text-brand-navy-800 text-sm"
                  />
                  <span className="text-xs text-brand-navy-600 font-semibold">{tenureType === 'years' ? 'Yrs' : 'Mths'}</span>
                </div>
              </div>
            </div>
            <input
              type="range"
              min={tenureType === 'years' ? '1' : '6'}
              max={tenureType === 'years' ? '30' : '360'}
              value={tenure}
              onChange={(e) => setTenure(Number(e.target.value))}
              className="w-full accent-brand-navy-600 h-2 bg-brand-navy-100 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>{tenureType === 'years' ? '1 Year' : '6 Mths'}</span>
              <span>{tenureType === 'years' ? '15 Years' : '180 Mths'}</span>
              <span>{tenureType === 'years' ? '30 Years' : '360 Mths'}</span>
            </div>
          </div>
        </div>

        {/* Results Page */}
        <div className="bg-brand-navy-50 rounded-2xl p-6 border border-brand-navy-100 flex flex-col justify-between">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-wider font-bold text-slate-400">Estimated Monthly Outgo</p>
            <div>
              <span className="text-4xl md:text-5xl font-display font-extrabold text-brand-navy-800 block">
                {formatCurrency(emiData.monthlyEMI)}
              </span>
              <span className="text-sm text-slate-500 mt-1 block">per month (EMI)</span>
            </div>

            {/* Visual ratio bar */}
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-brand-navy-600">Principal: {emiData.principalPercentage}%</span>
                <span className="text-brand-gold-600">Interest: {emiData.interestPercentage}%</span>
              </div>
              <div className="w-full h-3 bg-brand-navy-100 rounded-full overflow-hidden flex">
                <div className="bg-brand-navy-600 h-full transition-all" style={{ width: `${emiData.principalPercentage}%` }} />
                <div className="bg-brand-gold-500 h-full transition-all" style={{ width: `${emiData.interestPercentage}%` }} />
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-brand-navy-100">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Principal Amount</p>
                <p className="text-base font-bold text-brand-navy-800 mt-1">{formatCurrency(principal)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Interest</p>
                <p className="text-base font-bold text-brand-gold-600 mt-1">{formatCurrency(emiData.totalInterest)}</p>
              </div>
              <div className="col-span-2 pt-2 border-t border-brand-navy-100/50">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Repayment Amount</p>
                <p className="text-lg font-extrabold text-brand-navy-950 mt-1">{formatCurrency(emiData.totalPayable)}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 bg-white/80 rounded-xl border border-brand-navy-100/30 text-xs text-slate-500 flex items-start gap-2.5">
            <p>
              <strong>*Estimated figure:</strong> Actual banking approvals are subject to final Credit Score checking, debt-to-income limits, and underwriting policy.
            </p>
          </div>
        </div>
      </div>

      {/* Schedule Table Toggle */}
      <div className="mt-8 border-t border-slate-100 pt-6">
        <h4 className="text-sm font-bold text-brand-navy-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-brand-gold-500" />
          Estimated Repayment Timeline Schedule ({tenureType === 'years' ? 'Annual Breakdown' : 'First 12 Months'})
        </h4>
        
        <div className="overflow-x-auto max-h-60 overflow-y-auto border border-brand-navy-100 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-brand-navy-50 text-brand-navy-800 font-semibold border-b border-brand-navy-100">
                <th className="p-3">Period</th>
                <th className="p-3 text-right">Principal Paid</th>
                <th className="p-3 text-right">Interest Paid</th>
                <th className="p-3 text-right">Remaining Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600 selection:bg-brand-gold-100">
              {scheduleRows.map((row, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="p-2.5 font-medium text-brand-navy-800">{row.period}</td>
                  <td className="p-2.5 text-right font-mono">{formatCurrency(row.principalPaid)}</td>
                  <td className="p-2.5 text-right font-mono text-brand-gold-600">{formatCurrency(row.interestPaid)}</td>
                  <td className="p-2.5 text-right font-mono">{formatCurrency(row.remainingBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
