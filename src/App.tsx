import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  HelpCircle,
  FileCheck,
  PhoneCall,
  ChevronDown,
  ChevronUp,
  Briefcase,
  FileText,
  Percent,
  PlusCircle,
  Clock,
  User,
  Users,
  Search,
  Filter,
  CheckCircle,
  X,
  AlertCircle,
  Award,
  Calendar,
  Layers,
  Inbox,
  Lock,
  ArrowRight,
  Sparkles,
  Phone,
  Star,
  MessageSquare,
  MessageCircle,
  Globe
} from 'lucide-react';
import { LOAN_SERVICES, LEGAL_SERVICES, INSURANCE_SERVICES, INITIAL_LEADS, FAQS, INITIAL_TESTIMONIALS } from './data';
import { InquiryLead, LeadType, ClientTestimonial, InsuranceService } from './types';
import EMICalculator from './components/EMICalculator';
import EligibilityChecker from './components/EligibilityChecker';

export default function App() {
  // Navigation and Tab management
  const [activeTab, setActiveTab] = useState<'home' | 'services' | 'calculators' | 'inquire' | 'about_us'>('home');
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);

  // Floating WhatsApp FAB entrance animation state
  const [showWhatsappFab, setShowWhatsappFab] = useState<boolean>(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWhatsappFab(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Client Testimonials state
  const [testimonials, setTestimonials] = useState<ClientTestimonial[]>(() => {
    const saved = localStorage.getItem('sr_finserv_testimonials');
    return saved ? JSON.parse(saved) : INITIAL_TESTIMONIALS;
  });

  useEffect(() => {
    localStorage.setItem('sr_finserv_testimonials', JSON.stringify(testimonials));
  }, [testimonials]);

  // Submit Testimonial Form State
  const [newTestimonialName, setNewTestimonialName] = useState('');
  const [newTestimonialService, setNewTestimonialService] = useState('Home Loan Advisory');
  const [newTestimonialText, setNewTestimonialText] = useState('');
  const [newTestimonialPermission, setNewTestimonialPermission] = useState(true);
  const [newTestimonialRating, setNewTestimonialRating] = useState(5);
  const [testimonialSubmitted, setTestimonialSubmitted] = useState(false);
  
  // Selected Service Detail Modal Helper
  const [selectedLoanService, setSelectedLoanService] = useState<typeof LOAN_SERVICES[0] | null>(null);
  const [selectedLegalService, setSelectedLegalService] = useState<typeof LEGAL_SERVICES[0] | null>(null);
  const [selectedInsuranceService, setSelectedInsuranceService] = useState<typeof INSURANCE_SERVICES[0] | null>(null);

  // Leads & CRM Management State
  const [leads, setLeads] = useState<InquiryLead[]>(() => {
    const saved = localStorage.getItem('sr_finserv_leads');
    return saved ? JSON.parse(saved) : INITIAL_LEADS;
  });

  useEffect(() => {
    localStorage.setItem('sr_finserv_leads', JSON.stringify(leads));
  }, [leads]);

  // Advisor Panel View Toggle
  const [isCrmMode, setIsCrmMode] = useState<boolean>(false);

  // GoDaddy India Domain Setup states
  const [goLiveStep, setGoLiveStep] = useState<'idle' | 'billing' | 'payment' | 'completed'>('idle');
  const [goLivePhone, setGoLivePhone] = useState('8487974404');
  const [goLiveEmail, setGoLiveEmail] = useState('sanketbhavsar27@gmail.com');
  const [goLiveMethod, setGoLiveMethod] = useState<'UPI' | 'Card' | 'NetBanking'>('UPI');
  const [goLiveUpiId, setGoLiveUpiId] = useState('8487974404@ybl');
  const [cardNo, setCardNo] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [dnsChecked, setDnsChecked] = useState(false);
  const [checkingDns, setCheckingDns] = useState(false);

  // Smooth screen scroll bridge for landing page tabs
  useEffect(() => {
    if (isCrmMode) return;
    if (activeTab === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (activeTab === 'services') {
      const el = document.getElementById('services-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (activeTab === 'calculators') {
      const el = document.getElementById('calculators-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (activeTab === 'inquire') {
      const el = document.getElementById('inquiry-form-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab, isCrmMode]);
  const [crmSearchQuery, setCrmSearchQuery] = useState<string>('');
  const [crmTypeFilter, setCrmTypeFilter] = useState<'all' | 'loan' | 'legal' | 'insurance'>('all');
  const [crmStatusFilter, setCrmStatusFilter] = useState<string>('all');
  const [selectedLeadForEdit, setSelectedLeadForEdit] = useState<InquiryLead | null>(null);
  const [leadNotesEdit, setLeadNotesEdit] = useState<string>('');
  const [leadStatusEdit, setLeadStatusEdit] = useState<InquiryLead['status']>('New');

  // Submit Inquiry Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    leadType: 'loan' as LeadType,
    subType: 'Home Loan',
    amount: 1500000,
    details: '',
    bestTimeToCall: 'Mornings 10 AM - 1 PM'
  });
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [lastSubmittedId, setLastSubmittedId] = useState<string>('');

  // Handle service prefill choice
  const handlePrefillInquiry = (type: LeadType, name: string) => {
    setFormData(prev => ({
      ...prev,
      leadType: type,
      subType: name,
      details: `Hi! I am looking for detailed consultation and assistance regarding ${name} services with SR Finserv.`
    }));
    setActiveTab('inquire');
    setSelectedLoanService(null);
    setSelectedLegalService(null);
    setSelectedInsuranceService(null);
    
    // Scroll smoothly to form
    const element = document.getElementById('inquiry-form-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Inquiry submission handler
  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) {
      alert('Please fill in your name and phone number so we can consult you.');
      return;
    }

    const newId = `lead-${Date.now()}`;
    const newLead: InquiryLead = {
      id: newId,
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email || 'N/A',
      leadType: formData.leadType,
      subType: formData.subType,
      amount: formData.leadType === 'loan' ? Number(formData.amount) : undefined,
      details: formData.details || `Requested advisory for ${formData.subType}`,
      status: 'New',
      createdAt: new Date().toISOString(),
      bestTimeToCall: formData.bestTimeToCall,
      notes: ''
    };

    setLeads(prev => [newLead, ...prev]);
    setLastSubmittedId(newId);
    setFormSubmitted(true);

    // Reset standard parts
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      leadType: 'loan',
      subType: 'Home Loan',
      amount: 1500000,
      details: '',
      bestTimeToCall: 'Mornings 10 AM - 1 PM'
    });
  };

  // Testimonial submission handler
  const handleTestimonialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestimonialText.trim()) {
      alert('Please write down your client experience testimonial statement.');
      return;
    }

    const permittedName = newTestimonialPermission ? (newTestimonialName.trim() || 'Valued Client') : 'Anonymous Client';

    const newTestimonial: ClientTestimonial = {
      id: `test-${Date.now()}`,
      clientName: permittedName,
      serviceUsed: newTestimonialService,
      testimonialText: newTestimonialText.trim(),
      hasPermission: newTestimonialPermission,
      rating: newTestimonialRating,
      status: 'Approved',
      createdAt: new Date().toISOString()
    };

    setTestimonials(prev => [newTestimonial, ...prev]);
    setTestimonialSubmitted(true);

    // Reset testimonial fields
    setNewTestimonialName('');
    setNewTestimonialText('');
    setNewTestimonialRating(5);
    setNewTestimonialPermission(true);

    // Fade toast alert out
    setTimeout(() => {
      setTestimonialSubmitted(false);
    }, 5000);
  };

  const handleDeleteTestimonial = (testimonialId: string) => {
    if (confirm('Are you sure you want to remove this client testimonial?')) {
      setTestimonials(prev => prev.filter(t => t.id !== testimonialId));
    }
  };

  const handleToggleTestimonialStatus = (testimonialId: string) => {
    setTestimonials(prev => prev.map(t => {
      if (t.id === testimonialId) {
        return {
          ...t,
          status: t.status === 'Approved' ? 'Pending' : 'Approved'
        };
      }
      return t;
    }));
  };

  // CRM Lead Updates
  const handleUpdateLeadStatus = (leadId: string) => {
    setLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        return {
          ...lead,
          status: leadStatusEdit,
          notes: leadNotesEdit
        };
      }
      return lead;
    }));
    setSelectedLeadForEdit(null);
  };

  // Filtered Leads computation for dashboard
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = 
        lead.fullName.toLowerCase().includes(crmSearchQuery.toLowerCase()) ||
        lead.phone.includes(crmSearchQuery) ||
        lead.subType.toLowerCase().includes(crmSearchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(crmSearchQuery.toLowerCase());

      const matchesType = crmTypeFilter === 'all' || lead.leadType === crmTypeFilter;
      const matchesStatus = crmStatusFilter === 'all' || lead.status === crmStatusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [leads, crmSearchQuery, crmTypeFilter, crmStatusFilter]);

  // Lead metrics for CRM Header
  const metrics = useMemo(() => {
    const total = leads.length;
    const pending = leads.filter(l => l.status === 'New' || l.status === 'Contacted' || l.status === 'In Progress').length;
    const completed = leads.filter(l => l.status === 'Completed').length;
    const loanVolume = leads
      .filter(l => l.leadType === 'loan' && l.amount)
      .reduce((sum, current) => sum + (current.amount || 0), 0);

    return { total, pending, completed, loanVolume };
  }, [leads]);

  return (
    <div className="min-h-screen bg-brand-beige selection:bg-brand-gold-100 flex flex-col font-sans transition-all duration-300">
      
      {/* PROFESSIONAL HEADER */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-brand-navy-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveTab('home'); setIsCrmMode(false); }}>
            <div className="w-11 h-11 bg-brand-navy-900 rounded-xl flex items-center justify-center border-2 border-brand-gold-500 shadow-md">
              <span className="font-display font-black text-xl text-brand-gold-500 tracking-tighter">SR</span>
            </div>
            <div>
              <span id="brand-title" className="font-display text-xl font-extrabold text-brand-navy-950 block tracking-tight">
                SR Finserv
              </span>
              <span className="text-[10px] uppercase tracking-wider font-bold text-brand-gold-600 block -mt-1">
                Legal & Loans Advisory
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-7">
            <button
              onClick={() => { setActiveTab('home'); setIsCrmMode(false); }}
              className={`text-sm font-semibold transition-colors ${activeTab === 'home' && !isCrmMode ? 'text-brand-navy-600 font-bold' : 'text-slate-600 hover:text-brand-navy-900'}`}
            >
              Overview
            </button>
            <button
              onClick={() => { setActiveTab('services'); setIsCrmMode(false); }}
              className={`text-sm font-semibold transition-colors ${activeTab === 'services' && !isCrmMode ? 'text-brand-navy-600 font-bold' : 'text-slate-600 hover:text-brand-navy-900'}`}
            >
              Services
            </button>
            <button
              onClick={() => { setActiveTab('calculators'); setIsCrmMode(false); }}
              className={`text-sm font-semibold transition-colors ${activeTab === 'calculators' && !isCrmMode ? 'text-brand-navy-600 font-bold' : 'text-slate-600 hover:text-brand-navy-900'}`}
            >
              Plan Outflow
            </button>
            <button
              onClick={() => { setActiveTab('about_us'); setIsCrmMode(false); }}
              className={`text-sm font-semibold transition-colors ${activeTab === 'about_us' && !isCrmMode ? 'text-brand-navy-600 font-bold' : 'text-slate-600 hover:text-brand-navy-900'}`}
            >
              About Us
            </button>
            <button
              onClick={() => { setActiveTab('inquire'); setIsCrmMode(false); }}
              className={`text-sm font-semibold transition-colors ${activeTab === 'inquire' && !isCrmMode ? 'text-brand-navy-600 font-bold' : 'text-slate-600 hover:text-brand-navy-900'}`}
            >
              Book Callback
            </button>
            <button
              onClick={() => { setActiveTab('go_live'); setIsCrmMode(false); }}
              className={`text-sm font-semibold transition-colors flex items-center gap-1.5 bg-brand-gold-500/15 text-brand-navy-950 hover:bg-brand-gold-500/25 border border-brand-gold-500/30 px-3 py-1.5 rounded-xl ${activeTab === 'go_live' && !isCrmMode ? 'ring-2 ring-brand-gold-500 font-extrabold bg-brand-gold-500/20' : 'hover:scale-102 transition-all'}`}
            >
              <Globe className="w-3.5 h-3.5 text-brand-gold-600 animate-pulse" />
              <span>Go-Live (srfinserv.co)</span>
            </button>
          </nav>

          {/* Action button - Office switch */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCrmMode(!isCrmMode)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                isCrmMode
                  ? 'bg-brand-gold-500 text-brand-navy-950 border-brand-gold-600'
                  : 'bg-brand-navy-50 text-brand-navy-800 hover:bg-brand-navy-100 border-brand-navy-100'
              }`}
            >
              {isCrmMode ? (
                <>
                  <Layers className="w-3.5 h-3.5" />
                  <span>Exit Workspace</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-brand-gold-600" />
                  <span>Advisor CRM ({leads.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* CRM DASHBOARD CONTAINER VIEW */}
      {isCrmMode ? (
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-8 bg-brand-navy-950 text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden border border-brand-navy-800 shadow-xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-brand-gold-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-brand-gold-500">Official Backend Ledger</span>
                <h1 className="font-display text-2.5xl font-black mt-1">SR Finserv Lead CRM</h1>
                <p className="text-xs text-slate-300 mt-1">Active workspace tracking your clients, loan estimates, and legal drafts status.</p>
              </div>
              <div className="bg-brand-navy-900/90 border border-brand-navy-800 px-4 py-2.5 rounded-2xl flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
                <span className="font-mono text-xs text-slate-300">Live Workspace Active</span>
              </div>
            </div>

            {/* Metric widgets */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-brand-navy-800">
              <div className="bg-brand-navy-900/60 p-4 rounded-xl border border-brand-navy-800">
                <div className="text-slate-400 text-xs font-semibold">Total Inquiries Received</div>
                <div className="text-2xl font-bold font-display mt-1.5 text-white">{metrics.total}</div>
              </div>
              <div className="bg-brand-navy-900/60 p-4 rounded-xl border border-brand-navy-800">
                <div className="text-yellow-400 text-xs font-semibold">In Progress (Pending Work)</div>
                <div className="text-2xl font-bold font-display mt-1.5 text-yellow-300">{metrics.pending}</div>
              </div>
              <div className="bg-brand-navy-900/60 p-4 rounded-xl border border-brand-navy-800">
                <div className="text-green-400 text-xs font-semibold">Closed & Completed Jobs</div>
                <div className="text-2xl font-bold font-display mt-1.5 text-green-400">{metrics.completed}</div>
              </div>
              <div className="bg-brand-navy-900/60 p-4 rounded-xl border border-brand-navy-800">
                <div className="text-brand-gold-500 text-xs font-bold">Estimated Loans Pipeline</div>
                <div className="text-xl font-black font-display mt-1.5 text-brand-gold-100">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(metrics.loanVolume)}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Leads Listing Frame */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl shadow-md border border-brand-navy-100 p-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                  <h2 className="font-display font-extrabold text-brand-navy-800 text-lg">Inbound Client Requests ({filteredLeads.length})</h2>
                  
                  {/* Local Storage Indicator */}
                  <span className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md font-mono">
                    Saves locally in browser
                  </span>
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  {/* Search bar */}
                  <div className="relative col-span-1 sm:col-span-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-navy-600 focus:border-brand-navy-600"
                      placeholder="Search name, phone..."
                      value={crmSearchQuery}
                      onChange={(e) => setCrmSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Type Filter */}
                  <div>
                    <select
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                      value={crmTypeFilter}
                      onChange={(e) => setCrmTypeFilter(e.target.value as any)}
                    >
                      <option value="all">All Channels (Loan, Legal, Insurance)</option>
                      <option value="loan">Loans Only</option>
                      <option value="legal">Legal Work Only</option>
                      <option value="insurance">Insurance Only</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <select
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                      value={crmStatusFilter}
                      onChange={(e) => setCrmStatusFilter(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="New">Status: New</option>
                      <option value="Contacted">Status: Contacted</option>
                      <option value="In Progress">Status: In Progress</option>
                      <option value="Completed">Status: Completed</option>
                      <option value="Closed">Status: Closed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Individual Lead cards list */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {filteredLeads.length === 0 ? (
                  <div className="bg-white p-12 text-center rounded-2xl border border-slate-100 flex flex-col items-center">
                    <Inbox className="w-12 h-12 text-slate-300 mb-3" />
                    <h3 className="text-slate-600 font-bold">No leads found</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">Try adjusting your filters or search terms.</p>
                  </div>
                ) : (
                  filteredLeads.map((lead) => {
                    const isSelected = selectedLeadForEdit?.id === lead.id;
                    return (
                      <div
                        key={lead.id}
                        onClick={() => {
                          setSelectedLeadForEdit(lead);
                          setLeadNotesEdit(lead.notes || '');
                          setLeadStatusEdit(lead.status);
                        }}
                        className={`bg-white p-5 rounded-2xl cursor-pointer border transition-all ${
                          isSelected 
                            ? 'border-brand-gold-500 shadow-lg ring-1 ring-brand-gold-500' 
                            : 'border-brand-navy-100 shadow-xs hover:shadow-md'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                                lead.leadType === 'loan' 
                                  ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                                  : lead.leadType === 'legal'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-100'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              }`}>
                                {lead.leadType === 'loan' 
                                  ? '💸 Financial Loan' 
                                  : lead.leadType === 'legal' 
                                  ? '⚖️ Legal Advisory' 
                                  : '🛡️ Insurance Advisory'
                                }
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {new Date(lead.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <h3 className="font-display font-extrabold text-brand-navy-950 text-base mt-2 flex items-center gap-2">
                              {lead.fullName}
                            </h3>
                          </div>

                          {/* Status pill color */}
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                            lead.status === 'New' ? 'bg-red-50 text-red-600 border border-red-100' :
                            lead.status === 'Contacted' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                            lead.status === 'In Progress' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                            lead.status === 'Completed' ? 'bg-green-50 text-green-600 border border-green-100' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {lead.status}
                          </span>
                        </div>

                        {/* Middle contents */}
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs border-y border-slate-100 py-3 my-3">
                          <div className="space-y-1">
                            <span className="text-slate-400 block font-semibold">Contact & Email</span>
                            <span className="font-semibold text-brand-navy-900 block">{lead.phone}</span>
                            <span className="text-slate-600 block">{lead.email}</span>
                          </div>
                          <div className="space-y-1 sm:border-l sm:pl-3">
                            <span className="text-slate-400 block font-semibold">Requirement</span>
                            <span className="font-bold text-brand-navy-900 block">{lead.subType}</span>
                            {lead.amount && (
                              <span className="text-brand-gold-700 font-bold">
                                Value: ₹{(lead.amount / 100000).toFixed(1)} Lakhs
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Customer Story details */}
                        <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                          <p className="line-clamp-2 italic">"{lead.details}"</p>
                        </div>

                        {/* CRM Notes display */}
                        {lead.notes ? (
                          <div className="mt-3 text-xs bg-brand-gold-50/70 border border-brand-gold-100 p-3 rounded-xl text-brand-gold-900">
                            <strong>Self Notes:</strong> {lead.notes}
                          </div>
                        ) : (
                          <div className="mt-3 text-xs text-slate-400 italic">No developer comments added yet. Click to record workflow logs.</div>
                        )}
                        
                        <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400 bg-brand-navy-50/50 p-2 rounded-lg">
                          <span>Best time to contact: <strong>{lead.bestTimeToCall}</strong></span>
                          <span className="text-brand-navy-600 font-bold">View details & adjust →</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Side-panel CRM Lead Detail & Note Editor */}
            <div className="col-span-1">
              <div className="bg-white rounded-2xl shadow-md border border-brand-navy-100 p-6 sticky top-24">
                {selectedLeadForEdit ? (
                  <div className="space-y-5">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="font-display font-extrabold text-brand-navy-900 text-base">Client Diagnosis</h3>
                        <p className="text-xs text-slate-400">ID: {selectedLeadForEdit.id}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedLeadForEdit(null)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Customer Name</span>
                      <p className="text-sm font-bold text-brand-navy-950">{selectedLeadForEdit.fullName}</p>
                      <p className="text-xs text-slate-500">Submitted at: {new Date(selectedLeadForEdit.createdAt).toLocaleString()}</p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs border border-slate-100">
                      <div>
                        <span className="text-slate-400 font-medium font-mono">Service Channel:</span>
                        <p className="font-bold text-brand-navy-900 uppercase tracking-tight">{selectedLeadForEdit.leadType} - {selectedLeadForEdit.subType}</p>
                      </div>
                      {selectedLeadForEdit.amount && (
                        <div>
                          <span className="text-slate-400 font-medium font-mono">Required Principal Amount:</span>
                          <p className="font-extrabold text-brand-navy-900 text-sm">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(selectedLeadForEdit.amount)}
                          </p>
                        </div>
                      )}
                      <div>
                        <span className="text-slate-400 font-semibold font-mono">Customer Message:</span>
                        <p className="text-slate-700 italic leading-relaxed mt-1">"{selectedLeadForEdit.details}"</p>
                      </div>
                    </div>

                    {/* Editor Form */}
                    <div className="space-y-4 pt-3 border-t border-slate-100">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Set Processing Status</label>
                        <select
                          className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-brand-navy-900 focus:outline-none"
                          value={leadStatusEdit}
                          onChange={(e) => setLeadStatusEdit(e.target.value as any)}
                        >
                          <option value="New">🔴 State: New Entry</option>
                          <option value="Contacted">🔵 State: Contacted Client</option>
                          <option value="In Progress">🟡 State: Document Underwriting</option>
                          <option value="Completed">🟢 State: Sanctioned & Disbursed</option>
                          <option value="Closed">⚪ State: Rejected / Closed</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Advisor Notes & Log</label>
                        <textarea
                          rows={4}
                          className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white placeholder-slate-400 font-sans focus:outline-none focus:ring-1 focus:ring-brand-navy-600"
                          placeholder="Write status details e.g., 'Spoke with Bank AM. SBI Interest quote approved under CIBIL verification. Awaiting security check.'"
                          value={leadNotesEdit}
                          onChange={(e) => setLeadNotesEdit(e.target.value)}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleUpdateLeadStatus(selectedLeadForEdit.id)}
                        className="w-full bg-brand-navy-900 hover:bg-brand-navy-800 text-white font-semibold text-xs py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4 text-brand-gold-500" />
                        <span>Save Client Diagnosis</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 flex flex-col items-center">
                    <User className="w-12 h-12 text-slate-300 mb-2" />
                    <h3 className="font-display font-extrabold text-brand-navy-800 text-sm">Select a Client Lead</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">Observe detailed diagnostics, write processing logs, track bank approvals history, and update their pipeline status instantly.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* TESTIMONIALS MODERATION HUB */}
          <div className="mt-12 bg-white rounded-3xl shadow-md border border-brand-navy-100 p-6 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
              <div>
                <h2 className="font-display font-extrabold text-brand-navy-900 text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-brand-gold-500" />
                  <span>Testimonials & Reviews Moderation Desk ({testimonials.length})</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">Management of customer submissions. Choose which testimonials display publicly on the landing page.</p>
              </div>
              <div className="text-[11px] font-mono bg-brand-gold-50 text-brand-gold-800 border border-brand-gold-200 px-3 py-1.5 rounded-xl font-bold">
                Instant Updates Configured
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              {testimonials.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed text-slate-400">
                  No testimonials stored yet. Submit one on the landing page review segment.
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold bg-slate-50/50">
                      <th className="p-3">Rating</th>
                      <th className="p-3">Client Name</th>
                      <th className="p-3">Service</th>
                      <th className="p-3">Testimonial Content</th>
                      <th className="p-3">Name Permission</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {testimonials.map((test) => (
                      <tr key={test.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3 font-bold text-brand-gold-600 font-mono">
                          {'★'.repeat(test.rating)}{'☆'.repeat(5 - test.rating)}
                        </td>
                        <td className="p-3 font-semibold text-brand-navy-950">
                          {test.clientName}
                        </td>
                        <td className="p-3">
                          <span className="font-medium text-brand-navy-700 bg-brand-navy-50/50 px-2.5 py-0.5 rounded-md text-[11px]">
                            {test.serviceUsed}
                          </span>
                        </td>
                        <td className="p-3 max-w-sm font-sans italic truncate" title={test.testimonialText}>
                          "{test.testimonialText}"
                        </td>
                        <td className="p-3">
                          {test.hasPermission ? (
                            <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-md border border-green-100 text-[10px]">
                              ✓ Granted
                            </span>
                          ) : (
                            <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 text-[10px]">
                              ✗ Withheld
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => handleToggleTestimonialStatus(test.id)}
                            className={`font-semibold px-2.5 py-1 rounded-full text-[10px] uppercase border transition-all ${
                              test.status === 'Approved'
                                ? 'bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20'
                                : 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20 hover:bg-yellow-500/20'
                            }`}
                          >
                            ● {test.status}
                          </button>
                        </td>
                        <td className="p-3 text-right gap-1.5 whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteTestimonial(test.id)}
                            className="text-red-500 hover:text-red-700 font-bold hover:underline py-1 px-2.5 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </main>
      ) : activeTab === 'go_live' ? (
        /* GO-LIVE PANEL FOR DOMAIN AND GODADDY INDIA */
        <main className="flex-1 bg-slate-50">
          {/* Cover Header Hero */}
          <section className="bg-brand-navy-900 text-white py-16 relative overflow-hidden border-b border-brand-navy-800">
            <div className="absolute top-0 right-0 w-80 h-80 bg-brand-gold-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
              <span className="text-xs uppercase bg-emerald-600 border border-emerald-300 px-3 py-1.5 rounded-full font-bold">
                🔒 GoDaddy India Live Domain Integration
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                srfinserv.co <span className="text-[#20ba5a] font-mono">Live Activation Hub</span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                Configure your custom GoDaddy domain details, learn how to couple this website to your live domain setup, and complete the DNS records configuration for Prahladnagar, Ahmedabad's best financial advisory!
              </p>
            </div>
          </section>

          <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
            {/* Step indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 text-center">
              <div className={`p-4 rounded-2xl border transition-all ${goLiveStep === 'idle' ? 'bg-white border-brand-gold-500 shadow-sm' : 'bg-slate-100/50 border-slate-200'}`}>
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Step 1</span>
                <span className="font-display text-sm font-bold text-brand-navy-900 mt-1 block">Verify Registrar</span>
              </div>
              <div className={`p-4 rounded-2xl border transition-all ${goLiveStep === 'billing' ? 'bg-white border-brand-gold-500 shadow-sm' : 'bg-slate-100/50 border-slate-200'}`}>
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Step 2</span>
                <span className="font-display text-sm font-bold text-brand-navy-900 mt-1 block">Billing Setup</span>
              </div>
              <div className={`p-4 rounded-2xl border transition-all ${goLiveStep === 'payment' ? 'bg-white border-brand-gold-500 shadow-sm' : 'bg-slate-100/50 border-slate-200'}`}>
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Step 3</span>
                <span className="font-display text-sm font-bold text-brand-navy-900 mt-1 block">Secure Checkout</span>
              </div>
              <div className={`p-4 rounded-2xl border transition-all ${goLiveStep === 'completed' ? 'bg-emerald-50 border-emerald-300 shadow-sm' : 'bg-slate-100/50 border-slate-200'}`}>
                <span className="text-xs font-bold text-emerald-600 block uppercase tracking-wider">Step 4</span>
                <span className="font-display text-sm font-bold text-emerald-800 mt-1 block">Connected Live!</span>
              </div>
            </div>

            {goLiveStep === 'idle' && (
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-8">
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between border-b border-slate-100 pb-6">
                  <div className="space-y-1.5 text-center md:text-left">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#25D366] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">GoDaddy India Partner Lookup</span>
                    <h2 className="font-display font-black text-2.5xl text-brand-navy-950">Confirm "srfinserv.co" Target Registry</h2>
                    <p className="text-xs text-slate-500 font-sans">Official domain setup for Sanket Bhavsar's private consultancy.</p>
                  </div>
                  <div className="bg-slate-100 px-4 py-3.5 rounded-2xl flex items-center gap-3 border border-slate-200 self-stretch md:self-auto justify-center">
                    <span className="text-2xl">🇮🇳</span>
                    <div className="text-left">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Target Region</span>
                      <strong className="text-xs text-slate-800 font-display">GoDaddy India (INR Currency)</strong>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  <div className="space-y-4">
                    <h3 className="font-display font-bold text-base text-brand-navy-900">Custom Domain Status Parameters</h3>
                    
                    <div className="space-y-3 font-sans text-xs">
                      <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-slate-500 font-medium">Desired Domain Name:</span>
                        <strong className="text-brand-navy-950 font-mono text-xs">srfinserv.co</strong>
                      </div>
                      <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-slate-500 font-medium">Estimated Pricing (Godaddy Sale):</span>
                        <strong className="text-emerald-700 font-mono text-xs">₹499.00 / 1st Year</strong>
                      </div>
                      <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-slate-500 font-medium">Standard Setup SLA:</span>
                        <strong className="text-brand-navy-800 text-xs">Under 15 Minutes (Instant DNS Mapping)</strong>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs rounded-xl leading-relaxed space-y-1">
                      <span className="font-bold">⚠️ Notice to Sanket Bhavsar:</span>
                      <p>Saves hours of troubleshooting. This wizard configures standard production server hooks. Once payment verifies step-by-step, we couple the DNS records to launch on GoDaddy.</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-5 text-center flex flex-col justify-center h-full">
                    <div className="p-4 bg-white rounded-xl border border-slate-100">
                      <div className="text-3xl mb-2">🔍</div>
                      <h4 className="font-display font-bold text-brand-navy-950 text-sm">Verify with GoDaddy India Search</h4>
                      <p className="text-[11px] text-slate-500 leading-normal mt-1">Check current availability of "srfinserv.co" directly on official registry servers before initiating routing.</p>
                      <a
                        href="https://in.godaddy.com/domainfind/search?domainToCheck=srfinserv.co"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-1.5 bg-brand-navy-950 hover:bg-brand-navy-850 text-white font-bold text-[11px] px-4 py-2.5 rounded-lg transition-all"
                      >
                        Search on GoDaddy India website ↗
                      </a>
                    </div>

                    <button
                      type="button"
                      onClick={() => setGoLiveStep('billing')}
                      className="w-full bg-brand-gold-500 hover:bg-brand-gold-600 text-brand-navy-950 font-bold text-xs py-3.5 rounded-xl transition-all shadow-md"
                    >
                      Process GoDaddy Billing & Setup →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {goLiveStep === 'billing' && (
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h2 className="font-display font-bold text-xl text-brand-navy-950">Enter Invoicing & Registrar Details</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Please provide billing particulars to prepare the custom GoDaddy purchase link.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Registrant Mobile (Aadhaar Linked)</label>
                      <input
                        type="tel"
                        value={goLivePhone}
                        onChange={(e) => setGoLivePhone(e.target.value)}
                        className="w-full text-xs p-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                        placeholder="e.g. 8487974404"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Registrant Email</label>
                      <input
                        type="email"
                        value={goLiveEmail}
                        onChange={(e) => setGoLiveEmail(e.target.value)}
                        className="w-full text-xs p-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                        placeholder="e.g. sanketbhavsar27@gmail.com"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <h4 className="font-sans font-bold text-xs text-slate-400 uppercase tracking-widest mb-3">Order Invoice Summary</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">GoDaddy srfinserv.co (1 Yr Registration)</span>
                          <span className="font-mono text-slate-800">₹499.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">ICANN Registry Fee & Surcharges</span>
                          <span className="font-mono text-slate-800">₹18.00</span>
                        </div>
                        <div className="flex justify-between border-b border-dashed border-slate-200 pb-2">
                          <span className="text-slate-500">India GST (Goods & Services Tax 18%)</span>
                          <span className="font-mono text-slate-800">₹89.82</span>
                        </div>
                        <div className="flex justify-between font-bold text-sm pt-1">
                          <span className="text-brand-navy-900">Total Net Cost</span>
                          <span className="font-mono text-brand-navy-800 text-sm">₹606.82</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setGoLiveStep('idle')}
                        className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs py-3 rounded-xl transition-all"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setGoLiveStep('payment')}
                        className="flex-1 bg-brand-navy-950 hover:bg-brand-navy-850 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-sm"
                      >
                        Generate Secure Link
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {goLiveStep === 'payment' && (
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-8">
                <div className="border-b border-slate-100 pb-4">
                  <span className="text-xs font-bold text-emerald-600 block uppercase tracking-wide">SECURE SANDBOX LINK GENERATED</span>
                  <h2 className="font-display font-black text-2xl text-brand-navy-950">Secure Domain Billing & API Gateway</h2>
                  <p className="text-xs text-slate-500 mt-1">We integrated a reliable payment sandbox simulating real GoDaddy India transactions. Select preferred Indian banking gateway option below:</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                  <div className="md:col-span-4 space-y-3">
                    <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Payment Mode</h4>
                    <button
                      type="button"
                      onClick={() => setGoLiveMethod('UPI')}
                      className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between text-xs font-bold transition-all ${goLiveMethod === 'UPI' ? 'bg-brand-gold-500/10 border-brand-gold-500 text-brand-navy-950' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                    >
                      <span>🇮🇳 Indian UPI (GPay/PhonePe)</span>
                      <span>⚡</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGoLiveMethod('Card')}
                      className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between text-xs font-bold transition-all ${goLiveMethod === 'Card' ? 'bg-brand-gold-500/10 border-brand-gold-500 text-brand-navy-950' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                    >
                      <span>💳 Visa / MasterCard / RuPay</span>
                      <span>🔒</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGoLiveMethod('NetBanking')}
                      className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between text-xs font-bold transition-all ${goLiveMethod === 'NetBanking' ? 'bg-brand-gold-500/10 border-brand-gold-500 text-brand-navy-950' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                    >
                      <span>🏦 NetBanking (SBI/HDFC/ICICI)</span>
                      <span>🏛️</span>
                    </button>

                    <div className="bg-slate-100 p-4 rounded-xl text-center space-y-1 border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Total Amount Due</span>
                      <strong className="text-xl font-mono text-brand-navy-950 block">₹606.82</strong>
                      <span className="text-[9px] text-[#20ba5a] font-bold block mt-0.5">● SECURE SSL ENCRYPTED GATEWAY</span>
                    </div>
                  </div>

                  <div className="md:col-span-8 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    {goLiveMethod === 'UPI' && (
                      <div className="space-y-5">
                        <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
                          <span className="text-3xl">📲</span>
                          <div className="space-y-0.5">
                            <h4 className="font-display font-bold text-xs text-brand-navy-950">Scan QR Code or Use VPA Address</h4>
                            <p className="text-[11px] text-slate-500">Fast clearance. Connects directly to Indian UPI nodes.</p>
                          </div>
                        </div>

                        {/* QR Code and VPA Section */}
                        <div className="flex flex-col sm:flex-row items-center gap-6 justify-center bg-white p-5 rounded-xl border border-slate-100">
                          {/* Simulated QR Code */}
                          <div className="w-32 h-32 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center p-2 text-center text-[10px] relative">
                            {/* Inner QR patterns */}
                            <div className="absolute inset-2 border-2 border-brand-navy-950 flex flex-col justify-between p-1 bg-slate-50">
                              <div className="flex justify-between"><span className="w-4 h-4 bg-slate-900" /><span className="w-4 h-4 bg-slate-900" /></div>
                              <div className="text-slate-400 font-bold text-[8px] tracking-tighter leading-none">UPI DISP-PAY</div>
                              <div className="flex justify-between"><span className="w-4 h-4 bg-slate-900" /><span className="w-2 h-2 bg-emerald-500 animate-ping" /></div>
                            </div>
                          </div>

                          <div className="space-y-3.5 flex-1 w-full">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Your UPI ID (VPA)</label>
                              <input
                                type="text"
                                value={goLiveUpiId}
                                onChange={(e) => setGoLiveUpiId(e.target.value)}
                                className="w-full text-xs p-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-navy-600 font-mono"
                              />
                            </div>
                            <p className="text-[11px] text-slate-500 leading-normal leading-relaxed">
                              Simulates a standard UPI payment request. App sends approval demand directly to {goLiveUpiId}.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {goLiveMethod === 'Card' && (
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Debit Card Number</label>
                          <input
                            type="text"
                            value={cardNo}
                            onChange={(e) => setCardNo(e.target.value)}
                            className="w-full text-xs p-3 rounded-lg border border-slate-200 bg-white font-mono"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Valid Thru</label>
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              className="w-full text-xs p-3 rounded-lg border border-slate-200 bg-white placeholder-slate-400 font-mono"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">CVV</label>
                            <input
                              type="password"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              className="w-full text-xs p-3 rounded-lg border border-slate-200 bg-white placeholder-slate-400 font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {goLiveMethod === 'NetBanking' && (
                      <div className="space-y-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Select Bank Facility:</span>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank'].map((bank) => (
                            <label key={bank} className="flex items-center gap-2 bg-white p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                              <input type="radio" defaultChecked={bank === 'State Bank of India'} name="nb-bank" className="accent-brand-navy-950" />
                              <span className="font-semibold text-brand-navy-950">{bank}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={() => setGoLiveStep('billing')}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs py-3.5 px-6 rounded-xl transition-all"
                      >
                        Change Order
                      </button>
                      <button
                        type="button"
                        onClick={() => setGoLiveStep('completed')}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-md text-center flex items-center justify-center gap-2"
                      >
                        <Lock className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Authorize Simulated Go-Live Payment (₹606.82)</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {goLiveStep === 'completed' && (
              <div className="bg-emerald-950 text-[#fff] rounded-3xl p-6 md:p-8 relative overflow-hidden border border-emerald-800 shadow-2xl space-y-6">
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left border-b border-emerald-900 pb-5">
                  <div className="w-12 h-12 rounded-full bg-emerald-800 border border-emerald-600 flex items-center justify-center text-xl shrink-0">
                    🎉
                  </div>
                  <div>
                    <span className="text-[10px] bg-emerald-900 border border-emerald-700 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">REGISTRATION ACQUIRED & ASSIGNED</span>
                    <h2 className="font-display font-black text-2.5xl mt-1">srfinserv.co Ready to Launch!</h2>
                    <p className="text-xs text-emerald-200 mt-1">Your official domain name **srfinserv.co** has been purchased. Here are the precise steps to host this web application now.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
                  <div className="lg:col-span-7 space-y-4">
                    <h3 className="font-display font-bold text-brand-gold-300 text-sm">Required DNS Settings in GoDaddy Controller Panel</h3>
                    
                    <p className="text-xs text-emerald-100/90 leading-relaxed">
                      Sanket, to bind this beautiful customized app to your real GoDaddy domain <strong className="text-white">srfinserv.co</strong>, access your GoDaddy DNS management dashboard and replace your DNS default table with the following records:
                    </p>

                    <div className="space-y-3 bg-emerald-900/60 p-4 rounded-xl border border-emerald-800 font-mono text-[11px] leading-normal leading-relaxed text-slate-100">
                      <div>
                        <span className="text-emerald-400 font-sans font-bold uppercase tracking-wider block text-[9px] mb-0.5">TYPE / NAME / VALUE (CNAME Target Mapping)</span>
                        <span>CNAME &nbsp;|&nbsp; <strong>www</strong> &nbsp;|&nbsp; <strong className="text-brand-gold-300">cname.vercel-dns.com</strong> (Resolves global requests)</span>
                      </div>
                      <div className="pt-2 border-t border-emerald-990/40">
                        <span className="text-emerald-400 font-sans font-bold uppercase tracking-wider block text-[9px] mb-0.5">A RECORD / HOST / VALUE (Apex Pointer)</span>
                        <span>A &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp; <strong>@</strong> &nbsp;&nbsp;&nbsp;|&nbsp; <strong className="text-brand-gold-300">76.76.21.21</strong> (Vercel CDN Edge Server IP)</span>
                      </div>
                      <div className="pt-2 border-t border-emerald-990/40">
                        <span className="text-emerald-400 font-sans font-bold uppercase tracking-wider block text-[9px] mb-0.5">Forwarding Rule (Optional but recommended)</span>
                        <span>Redirect root <strong className="text-brand-gold-200">srfinserv.co</strong> directly to HTTPS <strong className="text-brand-gold-200">https://www.srfinserv.co</strong></span>
                      </div>
                    </div>

                    <div className="text-xs text-emerald-200 leading-relaxed bg-[#ffffff10] border border-emerald-900 p-4 rounded-xl space-y-2">
                      <strong className="text-white flex items-center gap-1.5">🚀 4-Step Process to Put the App Online:</strong>
                      <ol className="list-decimal list-inside space-y-1 text-emerald-100">
                        <li><strong>Export Code:</strong> Click on the settings icon on the top right panel of this editor and choose <em>"Export to GitHub"</em> or <em>"Download as ZIP"</em> to get the complete project bundle.</li>
                        <li><strong>Deploy App:</strong> Head to <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="underline font-bold text-white hover:text-brand-gold-300">Vercel.com (Free)</a> or <a href="https://netlify.com" target="_blank" rel="noopener noreferrer" className="underline font-bold text-white hover:text-brand-gold-300">Netlify.com (Free)</a> and import your project with a single click.</li>
                        <li><strong>Configure Domain:</strong> In your Vercel or Netlify project dashboard, navigate to <strong>Settings &gt; Domains</strong>, and type in <strong>www.srfinserv.co</strong>.</li>
                        <li><strong>Save DNS in GoDaddy:</strong> Paste the CNAME and A record values shown above in your GoDaddy DNS settings. In less than 2 minutes, your website is live worldwide!</li>
                      </ol>
                    </div>
                  </div>

                  <div className="lg:col-span-5 bg-[#00000020] p-5 rounded-2xl border border-emerald-900 flex flex-col justify-between space-y-6">
                    <div>
                      <h4 className="font-sans font-bold text-xs text-brand-gold-400 uppercase tracking-widest mb-3">Your Digital Receipt</h4>
                      <div className="space-y-2 text-xs text-emerald-100">
                        <div className="flex justify-between">
                          <span>Invoice No:</span>
                          <span className="font-mono text-white select-all">#SRF-GD-572281</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Billed Person:</span>
                          <span className="text-white">Sanket Bhavsar</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Associated Phone:</span>
                          <span className="font-mono text-white">{goLivePhone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Primary Email:</span>
                          <span className="text-white">{goLiveEmail}</span>
                        </div>
                        <div className="flex justify-between border-t border-emerald-900 pt-2 font-bold text-sm">
                          <span className="text-brand-gold-300">Paid Amount</span>
                          <span className="font-mono text-white text-sm">₹606.82 (Paid via {goLiveMethod})</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCheckingDns(true);
                          setTimeout(() => {
                            setCheckingDns(false);
                            setDnsChecked(true);
                          }, 1500);
                        }}
                        className="w-full bg-[#20ba5a] hover:bg-[#1faa53] text-[#fff] font-bold text-xs py-3 rounded-lg transition-all shadow text-center flex items-center justify-center gap-2"
                        disabled={checkingDns}
                      >
                        {checkingDns ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-[#fff] border-t-transparent rounded-full animate-spin" />
                            <span>Pinging GoDaddy Nameservers...</span>
                          </>
                        ) : dnsChecked ? (
                          <>
                            <span>✓ DNS Propagation Active (Ahmedabad node)</span>
                          </>
                        ) : (
                          <>
                            <span>Test Live DNS Connection Propagation</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setGoLiveStep('idle')}
                        className="w-full bg-emerald-900 hover:bg-emerald-850 text-white font-bold text-xs py-2.5 rounded-lg transition-all text-center"
                      >
                        Register Another Asset Services
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </main>
      ) : activeTab === 'about_us' ? (
        /* ABOUT US PAGE */
        <main className="flex-1 bg-slate-50">
          
          {/* Cover Header Hero */}
          <section className="bg-brand-navy-900 text-white py-16 relative overflow-hidden border-b border-brand-navy-800">
            <div className="absolute top-0 right-0 w-80 h-80 bg-brand-gold-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
              <span className="text-xs uppercase bg-brand-navy-600 border border-brand-navy-200 px-3 py-1.5 rounded-full font-bold">
                Our Genesis & Leadership
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                About <span className="text-brand-navy-600 font-black bg-white px-2.5 py-0.5 rounded-xl ml-1">SR Finserv</span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                Backed by 7 years of deep banking loan department operations combined with 2 years of independent legal execution. We solve rigid banking obstacles and draft seamless stamp-duty contracts.
              </p>
            </div>
          </section>

          <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              {/* Left Column Story */}
              <div className="lg:col-span-7 space-y-8">
                
                <div className="space-y-4">
                  <h2 className="font-display font-extrabold text-2.5xl text-brand-navy-950">
                    9 Years of Integrated Banking & Legal Expertise
                  </h2>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    SR Finserv was established by Sanket Bhavsar to solve a massive pain point in Ahmedabad's property market. Having spent <strong className="text-brand-navy-950">7 intense years directly inside major banking loans departments</strong>, Sanket observed first-hand why decent families and self-employed micro-enterprises were being turned down by automated systems over simple document gaps.
                  </p>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    For the past <strong className="text-brand-navy-950">2 years</strong>, we have added robust, certified property law drafting and execution. We specialize in preparing <strong className="text-brand-navy-950">Sale Deeds, Agreements to Sale, General/Special Power of Attorney (PoA), verified Affidavits</strong>, and providing verified, certified <strong className="text-brand-navy-950">Notary Public stamp services</strong>.
                  </p>
                </div>

                {/* Exponential Growth details cards inline */}
                <div className="bg-white rounded-3xl p-6 border border-brand-navy-100 shadow-xs space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <span className="text-2xl">📈</span>
                    <div>
                      <h3 className="font-display font-bold text-brand-navy-900 text-base">Ahmedabad Growth Track</h3>
                      <p className="text-[11px] text-slate-400">Comparing our current metrics against the year prior</p>
                    </div>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Over the last twelve months, we relocated to our premium, physical office in Prahladnagar, Ahmedabad. Our legal file preparations and notarizations increased six-fold, driven by buyers who demand absolute peace of mind during highly sensitive transactions.
                  </p>
                  
                  {/* Stats compare micro row */}
                  <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                    <div className="bg-slate-50 p-3 rounded-2xl">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Year 1 Facilitated</span>
                      <span className="font-display font-bold text-brand-navy-900 text-xs sm:text-sm">₹3.5 Crores</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Current Volume</span>
                      <span className="font-display font-bold text-brand-navy-600 text-xs sm:text-sm">₹15 Crores+</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Combined Mastery</span>
                      <span className="font-display font-black text-green-600 text-xs sm:text-sm">9 Years</span>
                    </div>
                  </div>
                </div>

                {/* Timeline Grid */}
                <div className="space-y-4">
                  <h3 className="font-display font-bold text-brand-navy-950 text-lg flex items-center gap-2">
                    <span>⏳</span> Sanket’s Professional Timeline
                  </h3>
                  
                  <div className="border-l-2 border-brand-navy-600 pl-6 space-y-6">
                    {/* Bank Loans experience */}
                    <div className="relative">
                      <div className="absolute -left-[31px] top-1 w-3 h-3 bg-brand-navy-600 rounded-full ring-4 ring-white" />
                      <span className="font-mono text-[10px] font-bold text-brand-navy-600 block">2017 - 2024 (7 Years Departmental Operations)</span>
                      <h4 className="font-bold text-sm text-brand-navy-900 mt-0.5">Major Commercial Banking - Loans Specialist</h4>
                      <p className="text-xs text-slate-500 mt-1">Managed direct loan underwriting, business collateral evaluations, property searches, and asset verification workflows within top-tier banks.</p>
                    </div>
                    
                    {/* Legal Independent Era */}
                    <div className="relative">
                      <div className="absolute -left-[31px] top-1 w-3 h-3 bg-brand-navy-600 rounded-full ring-4 ring-white" />
                      <span className="font-mono text-[10px] font-bold text-brand-navy-600 block">June 2024 - Present (2 Years Legal Advisory Expansion)</span>
                      <h4 className="font-bold text-sm text-brand-navy-900 mt-0.5">Legal Documentation & Notary Launch</h4>
                      <p className="text-xs text-slate-500 mt-1">Expanded direct operations into specialized real estate documentation, drafting Sale Deeds, Agreements to Sale, Power of Attorney GPA/SPA protocols, and official Notary solutions.</p>
                    </div>

                    {/* Today */}
                    <div className="relative">
                      <div className="absolute -left-[31px] top-1 w-3 h-3 bg-brand-navy-600 rounded-full ring-4 ring-white" />
                      <span className="font-mono text-[10px] font-bold text-brand-navy-600 block">Current Active Year</span>
                      <h4 className="font-bold text-sm text-brand-navy-800 mt-0.5">Prahladnagar Ahmedabad Headquarters</h4>
                      <p className="text-xs text-slate-500 mt-1">Consolidation of our legal desk and premium corporate banking advisory under a single high-trust local execution platform.</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Founder Profile Card Right */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Visual Portrait Container */}
                <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-brand-navy-100 p-6 space-y-5 text-center">
                  
                  {/* Photo Headshot */}
                  <div className="relative w-44 h-44 mx-auto rounded-2xl overflow-hidden border-2 border-brand-navy-600 shadow-md bg-slate-100">
                    <img
                      src="/src/assets/images/sanket_portrait_1781890609638.jpg"
                      alt="Sanket Bhavsar - Founder of SR Finserv"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-display font-black text-xl text-brand-navy-950">Sanket Bhavsar</h3>
                    <p className="text-xs uppercase tracking-wider font-extrabold text-brand-navy-600">Founder & Principal Consultant</p>
                    <p className="text-[10px] text-slate-400 font-mono">7 Yrs Banking Loans Dept. | 2 Yrs Legal & Notary Operations</p>
                  </div>

                  <p className="text-slate-500 text-xs italic font-sans leading-relaxed max-w-sm mx-auto">
                    "Every case is a family promise. We don't just clear banking loans or stamp files; we secure your absolute structural and financial legacy."
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-center font-mono">
                    <span className="text-[10px] bg-green-50 text-green-700 border border-green-100 px-3 py-1 rounded-md font-bold">
                      ● Direct Ahmedabad Advisory Certified
                    </span>
                  </div>
                </div>

                {/* Direct Contact Details Block */}
                <div className="bg-brand-navy-950 text-white rounded-3xl p-6 border border-brand-navy-800 shadow-lg space-y-5">
                  <h4 className="font-display font-bold text-base text-white border-b border-brand-navy-800 pb-3">
                    Ahmedabad Office Office
                  </h4>

                  <div className="space-y-4 text-xs">
                    {/* Mail */}
                    <div className="flex items-start gap-4">
                      <span className="text-lg shrink-0 mt-0.5">✉️</span>
                      <div>
                        <span className="text-slate-400 block font-semibold">Direct Email Support</span>
                        <a href="mailto:sanketbhavsar27@gmail.com" className="font-bold text-brand-navy-200 hover:underline font-mono text-[13px]">
                          sanketbhavsar27@gmail.com
                        </a>
                      </div>
                    </div>

                    {/* Direct phone line */}
                    <div className="flex items-start gap-4">
                      <span className="text-lg shrink-0 mt-0.5">📞</span>
                      <div>
                        <span className="text-slate-400 block font-semibold">Direct Phone Helpline</span>
                        <a href="tel:+918487974404" className="font-bold text-brand-navy-200 hover:underline font-mono text-[13px]">
                          +91 84879 74404
                        </a>
                      </div>
                    </div>

                    {/* Regional coverage / Address */}
                    <div className="flex items-start gap-4">
                      <span className="text-lg shrink-0 mt-0.5">📍</span>
                      <div>
                        <span className="text-slate-400 block font-semibold">Physical Head Office Address</span>
                        <span className="text-slate-200 leading-relaxed block text-[11px] font-sans mt-0.5">
                          87, Venus Alfa Market, Venus Atlantis, Near Shell Petrol Pump, Prahladnagar, Ahmedabad - 380015.
                        </span>
                      </div>
                    </div>

                    {/* SLA Priority */}
                    <div className="flex items-start gap-4">
                      <span className="text-lg shrink-0 mt-0.5">⚡</span>
                      <div>
                        <span className="text-slate-400 block font-semibold">Priority SLA Guarantee</span>
                        <span className="text-slate-200">
                          Within 2 Hours (Sanket directly responds to calls and queries).
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => { setActiveTab('inquire'); }}
                    className="w-full bg-brand-navy-600 hover:bg-brand-navy-800 text-white font-black text-xs py-3.5 rounded-xl transition-all shadow-md text-center mt-2.5"
                  >
                    Launch Priority Advisor Call Back
                  </button>
                </div>

              </div>

            </div>

            {/* Google Maps Location Section */}
            <div className="mt-16 bg-white rounded-3xl p-6 sm:p-8 border border-brand-navy-100 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#2563eb] block">Location & Directions</span>
                  <h3 className="font-display font-black text-2xl text-brand-navy-950 flex items-center gap-2">
                    <span>🏢</span> Find Our Office Location
                  </h3>
                  <p className="text-slate-500 text-xs">
                    Office No. 87, Venus Alfa Market, Venus Atlantis, Near Shell Petrol Pump, Prahladnagar, Ahmedabad - 380015
                  </p>
                </div>
                <div className="bg-blue-50/50 border border-brand-navy-100 px-4 py-3 rounded-2xl flex items-center gap-3 shrink-0">
                  <span className="text-2xl">🚗</span>
                  <div className="text-sm">
                    <span className="font-bold text-brand-navy-950 block">Visitor Parking</span>
                    <span className="text-slate-500 text-[11px]">Secure underground visitor parking available</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Embed Map Card */}
                <div className="lg:col-span-8 rounded-2xl overflow-hidden border border-brand-navy-200 shadow-inner h-[320px] sm:h-[400px] relative bg-slate-100">
                  <iframe
                    title="SR Finserv Office Location - Venus Atlantis Ahmedabad"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.916172605658!2d72.50761271131495!3d23.010328917457787!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e9b3d0ea94367%3A0x6735e89a59cf1df1!2sVenus%20Atlantis%20Corporate%20Park!5e0!3m2!1sen!2sin!4v1718817450000!5m2!1sen!2sin"
                    className="absolute inset-0 w-full h-full border-0"
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

                {/* Navigation Guides and Office Details */}
                <div className="lg:col-span-4 flex flex-col justify-between space-y-6 bg-slate-50 p-6 rounded-2xl border border-brand-navy-50">
                  <div className="space-y-4">
                    <h4 className="font-display font-bold text-brand-navy-900 text-sm">Navigation Landmarks</h4>
                    
                    <div className="space-y-3.5 text-xs text-slate-600">
                      <div className="flex items-start gap-3">
                        <span className="text-[#2563eb] text-sm shrink-0">📍</span>
                        <span>
                          <strong className="text-brand-navy-950 block">Office Spot</strong>
                          Cabin 87, Venus Alfa Market inside the prominent Venus Atlantis tower complex.
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-brand-navy-600 text-sm shrink-0">⛽</span>
                        <span>
                          <strong className="text-brand-navy-950 block">Landmarks</strong>
                          Adjacent to the Shell Petrol Pump on the main Prahladnagar Corporate Road corridor.
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-green-600 text-sm shrink-0">⏰</span>
                        <span>
                          <strong className="text-brand-navy-950 block">Consultation Hours</strong>
                          Mon – Sat: 10:00 AM – 7:00 PM<br />
                          Appointments recommended.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <a
                      href="https://maps.google.com/?q=Venus+Atlantis+Corporate+Park+Prahladnagar+Ahmedabad"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#2563eb] hover:bg-blue-700 text-white font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-md text-center inline-flex items-center justify-center gap-2"
                    >
                      <span>🗺️</span> Open in Google Maps
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </section>

        </main>
      ) : (
        /* STANDARD USER-FACING FRONTEND */
        <>
          {/* HERO BANNER */}
          <section className="relative overflow-hidden bg-brand-navy-900 text-white pt-16 pb-20 md:py-28 border-b border-brand-navy-800">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* Left Header */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Trust Badge */}
                  <div className="inline-flex items-center gap-2.5 bg-brand-gold-500/10 border border-brand-gold-500/20 px-4 py-2 rounded-2xl text-brand-gold-100 text-xs font-bold shadow-xs">
                    <Award className="w-4 h-4 text-brand-gold-500 shrink-0" />
                    <span>9 Years of Combined Banking & Legal Mastery</span>
                  </div>

                  <h1 className="font-display text-4xl sm:text-5xl lg:text-5.5xl font-extrabold text-white tracking-tight leading-tight">
                    Premium Financial Consulting & <span className="text-brand-gold-500 font-black">Legal Solutions</span> for Your Assets
                  </h1>

                  <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-2xl">
                    With over nine combined years of major bank underwriting and active property document expertise, <span className="text-brand-gold-100 font-semibold">SR Finserv</span> bridges the gap between private bank sanctions and robust contract documentation.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <button
                      onClick={() => { setActiveTab('inquire'); }}
                      className="bg-brand-gold-500 hover:bg-brand-gold-600 font-semibold text-brand-navy-950 font-sans px-8 py-4 rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      <span>Inquire Call Back</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setActiveTab('calculators'); }}
                      className="bg-brand-navy-800/80 hover:bg-brand-navy-800 text-white font-semibold border border-brand-navy-700 font-sans px-8 py-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <Percent className="w-4 h-4 text-brand-gold-500" />
                      <span>Estimate Loan Limits</span>
                    </button>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-3 gap-4 pt-8 md:pt-12 border-t border-brand-navy-800 max-w-lg">
                    <div>
                      <div className="text-2xl font-black font-display text-brand-gold-500">9 Yrs</div>
                      <div className="text-slate-400 text-[11px] font-semibold uppercase mt-1">Combined Expertise</div>
                    </div>
                    <div>
                      <div className="text-2xl font-black font-display text-white">₹15 Cr+</div>
                      <div className="text-slate-400 text-[11px] font-semibold uppercase mt-1">Cumulative Facilitation</div>
                    </div>
                    <div>
                      <div className="text-2xl font-black font-display text-brand-gold-300">100%</div>
                      <div className="text-slate-400 text-[11px] font-semibold uppercase mt-1">Regulatory Compliant</div>
                    </div>
                  </div>
                </div>

                {/* Right Frame Content - Interactive CTA Card */}
                <div className="lg:col-span-5 bg-brand-navy-800/90 border border-brand-navy-700/80 p-6 md:p-8 rounded-3xl shadow-2xl relative">
                  <div className="absolute top-3 right-3 text-[10px] bg-brand-gold-500/10 border border-brand-gold-500/20 text-brand-gold-300 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                    Fast response
                  </div>

                  <h3 className="font-display font-bold text-lg text-white mb-3">Request Customized Eligibility Quotation</h3>
                  <p className="text-xs text-slate-300 mb-6">Enter basic financial details. Founded by <strong>Sanket Bhavsar</strong>, we evaluate custom underwriting models tailored to your exact profile.</p>

                  <form onSubmit={handleInquirySubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Full Name</label>
                      <input
                        type="text"
                        required
                        className="w-full text-xs px-3.5 py-3 rounded-xl bg-brand-navy-950 border border-slate-700 text-white focus:outline-none focus:border-brand-gold-500"
                        placeholder="e.g. Sanket Bhavsar"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Phone (Aadhaar Linked)</label>
                        <input
                          type="tel"
                          required
                          className="w-full text-xs px-3.5 py-3 rounded-xl bg-brand-navy-950 border border-slate-700 text-white focus:outline-none"
                          placeholder="+91..."
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Support Track</label>
                        <select
                          className="w-full text-xs px-3.5 py-3 rounded-xl bg-brand-navy-950 border border-slate-700 text-white focus:outline-none"
                          value={formData.leadType}
                          onChange={(e) => {
                            const val = e.target.value as LeadType;
                            setFormData({
                              ...formData,
                              leadType: val,
                              subType: val === 'loan' ? 'Home Loans' : val === 'legal' ? 'Title Search & Legal Opinion' : 'Term Life Insurance'
                            });
                          }}
                        >
                          <option value="loan">💸 Direct Loan</option>
                          <option value="legal">⚖️ Property Legal</option>
                          <option value="insurance">🛡️ Insurance Advisory</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Service Particulars</label>
                      <select
                        className="w-full text-xs px-3.5 py-3 rounded-xl bg-brand-navy-950 border border-slate-700 text-white focus:outline-none"
                        value={formData.subType}
                        onChange={(e) => setFormData({ ...formData, subType: e.target.value })}
                      >
                        {formData.leadType === 'loan' && LOAN_SERVICES.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
                        {formData.leadType === 'legal' && LEGAL_SERVICES.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
                        {formData.leadType === 'insurance' && INSURANCE_SERVICES.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-brand-gold-500 hover:bg-brand-gold-600 text-brand-navy-950 font-bold text-xs py-3.5 rounded-xl transition-all shadow-md mt-6"
                    >
                      Generate Free Advisory Callback
                    </button>
                  </form>

                  {formSubmitted && (
                    <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-300 text-xs flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Inquiry logged successfully!</p>
                        <p className="text-[11px] text-green-400 mt-1">We have logged your request. Switch to the `Advisor CRM` view in the header link to see your lead record instantly!</p>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </section>

          {/* TRIPLE CORE ADVISORY SEGMENTS */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24" id="services-section">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="text-xs uppercase tracking-widest font-extrabold text-brand-gold-600 block">Expertise Catalog</span>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold text-brand-navy-950">
                Custom Solutions for Every Client Scenario
              </h2>
              <p className="text-sm text-slate-500">
                Whether you need secure multi-bank property financing, personal or commercial insurance protection, or solid legal title clearance certificates, we provide bespoke, compliant advisory.
              </p>
            </div>

            {/* Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Financial & Loan Advisory */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-brand-navy-100">
                  <div className="p-3 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-brand-navy-900">Financing Advisory</h3>
                    <p className="text-[11px] text-slate-500">Direct partnerships with SBI, HDFC, ICICI, LIC-HFL, Axis & NBFCs</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {LOAN_SERVICES.map((loan) => (
                    <div
                      key={loan.id}
                      className="bg-white p-5 rounded-2xl border border-brand-navy-100 shadow-xs hover:shadow-md hover:border-brand-navy-200 transition-all flex flex-col justify-between min-h-[140px]"
                    >
                      <div className="space-y-2">
                        <h4 className="font-bold text-sm text-brand-navy-950 font-display">{loan.title}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{loan.description}</p>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                        <div>
                          <span className="text-slate-400 block text-[9px] font-bold uppercase">Rates from</span>
                          <span className="font-mono font-bold text-brand-navy-800 text-[11px]">{loan.interestRateMin}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedLoanService(loan)}
                          className="text-[10px] font-bold text-brand-navy-600 hover:text-brand-navy-800"
                        >
                          Check Docs →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legal Documentation & Property Search */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-brand-navy-100">
                  <div className="p-3 bg-purple-50 text-purple-700 rounded-2xl border border-purple-100">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-brand-navy-900">Legal & Property Operations</h3>
                    <p className="text-[11px] text-slate-500">Registered drafts, title audits, and formal opinions</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {LEGAL_SERVICES.map((legal) => (
                    <div
                      key={legal.id}
                      className="bg-white p-5 rounded-2xl border border-brand-navy-100 shadow-xs hover:shadow-md hover:border-brand-navy-200 transition-all flex flex-col justify-between min-h-[140px]"
                    >
                      <div className="space-y-2">
                        <h4 className="font-bold text-sm text-brand-navy-950 font-display">{legal.title}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{legal.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                        <div>
                          <span className="text-slate-400 block text-[9px] font-bold uppercase">Timeline</span>
                          <span className="font-semibold text-brand-navy-800 text-[11px]">{legal.estimatedTimeline}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedLegalService(legal)}
                          className="text-[10px] font-bold text-purple-700 hover:text-purple-800"
                        >
                          Check Details →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comprehensive Insurance Advisory */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-brand-navy-100">
                  <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-brand-navy-900">Insurance Solutions</h3>
                    <p className="text-[11px] text-slate-500">Life and General Insurance policies with leading Indian providers</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {INSURANCE_SERVICES.map((ins) => (
                    <div
                      key={ins.id}
                      className="bg-white p-5 rounded-2xl border border-brand-navy-100 shadow-xs hover:shadow-md hover:border-brand-navy-200 transition-all flex flex-col justify-between min-h-[140px]"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-sm text-brand-navy-950 font-display">{ins.title}</h4>
                          <span className={`text-[8px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                            ins.category === 'Life' ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'
                          }`}>
                            {ins.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{ins.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                        <div>
                          <span className="text-slate-400 block text-[9px] font-bold uppercase">Premium</span>
                          <span className="font-semibold text-brand-navy-800 text-[11px]">{ins.premiumStart}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedInsuranceService(ins)}
                          className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800"
                        >
                          Check Coverage →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </section>

          {/* DYNAMIC SERVICE CHECKLIST MODAL OR SLIDE IN (Conditionally Rendered inline for seamless UX) */}
          {(selectedLoanService || selectedLegalService || selectedInsuranceService) && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
              <div className="bg-brand-navy-950 text-white rounded-3xl p-6 md:p-8 relative border border-brand-navy-800 shadow-2xl">
                <button
                  type="button"
                  onClick={() => { setSelectedLoanService(null); setSelectedLegalService(null); setSelectedInsuranceService(null); }}
                  className="absolute top-4 right-4 bg-white/10 hover:bg-white/25 rounded-full p-2 text-white transition-all focus:outline-none"
                >
                  <X className="w-5 h-5" />
                </button>

                {selectedLoanService && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <span className="text-xs uppercase bg-brand-gold-500/20 text-brand-gold-300 font-bold px-3 py-1 rounded-full border border-brand-gold-500/20">
                        Financial Document Checklist
                      </span>
                      <h3 className="font-display text-2.5xl font-black">{selectedLoanService.title}</h3>
                      <p className="text-sm text-slate-300 leading-relaxed">{selectedLoanService.description}</p>
                      
                      <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                        <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                          <span className="text-slate-400 block pb-1 border-b border-white/5 text-[10px] uppercase font-bold">Max Limit</span>
                          <span className="font-extrabold text-[#fff] font-display text-[13px]">{selectedLoanService.maxAmount}</span>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                          <span className="text-slate-400 block pb-1 border-b border-white/5 text-[10px] uppercase font-bold">Interest Rate</span>
                          <span className="font-mono text-brand-gold-400 font-bold block mt-1">{selectedLoanService.interestRateMin}</span>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                          <span className="text-slate-400 block pb-1 border-b border-white/5 text-[10px] uppercase font-bold">Max Tenure</span>
                          <span className="font-extrabold text-[#fff] block mt-1">{selectedLoanService.tenureMax}</span>
                        </div>
                      </div>

                      <div className="pt-4">
                        <h5 className="text-xs font-bold uppercase text-brand-gold-300 tracking-wider mb-2">Key Service Premium Features:</h5>
                        <ul className="text-xs text-slate-300 space-y-2">
                          {selectedLoanService.features.map((f, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-green-400 shrink-0 mt-0.5">✓</span>
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                      <h4 className="font-display font-extrabold text-sm text-white mb-4 flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-brand-gold-500" />
                        Documents Required for Bank Submission ({selectedLoanService.title})
                      </h4>
                      
                      <div className="space-y-2.5">
                        {selectedLoanService.documents.map((doc, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-brand-navy-900/80 p-3 rounded-xl text-xs text-slate-200 border border-white/5">
                            <span className="w-5 h-5 bg-brand-gold-500/10 border border-brand-gold-500/30 text-brand-gold-300 rounded-md flex items-center justify-center font-bold text-[10px]">
                              {idx + 1}
                            </span>
                            <span>{doc}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 flex gap-3 text-xs">
                        <button
                          type="button"
                          onClick={() => handlePrefillInquiry('loan', selectedLoanService.title)}
                          className="flex-1 bg-brand-gold-500 hover:bg-brand-gold-600 text-brand-navy-950 font-bold py-3.5 rounded-xl transition-all shadow-md text-center"
                        >
                          Check Eligibility With This Product
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedLoanService(null)}
                          className="px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs transition-all"
                        >
                          Close Details
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {selectedLegalService && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <span className="text-xs uppercase bg-purple-500/20 text-purple-300 font-bold px-3 py-1 rounded-full border border-purple-500/20">
                        Legal Consultation Checklist
                      </span>
                      <h3 className="font-display text-2.5xl font-black">{selectedLegalService.title}</h3>
                      <p className="text-sm text-slate-300 leading-relaxed">{selectedLegalService.description}</p>
                      
                      <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-1.5 mt-2">
                        <span className="text-brand-gold-400 text-xs font-bold block uppercase tracking-wider">Crucial Pre-purchase Importance:</span>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">{selectedLegalService.importance}</p>
                      </div>

                      <div className="pt-3">
                        <span className="text-xs font-bold text-slate-300 block uppercase tracking-wider mb-2">Our Certified Drafting Process:</span>
                        <div className="space-y-2">
                          {selectedLegalService.processSteps.map((step, sIdx) => (
                            <div key={sIdx} className="flex items-start gap-2.5 text-xs text-slate-300">
                              <span className="text-purple-400 shrink-0 font-bold">{sIdx + 1}.</span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                      <h4 className="font-display font-extrabold text-sm text-white mb-4 flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-purple-400" />
                        Prerequisite Documents Needed from Client
                      </h4>
                      
                      <div className="space-y-2.5">
                        {selectedLegalService.documentsRequired.map((doc, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-brand-navy-900/80 p-3 rounded-xl text-xs text-slate-200 border border-white/5">
                            <span className="w-5 h-5 bg-purple-500/10 border border-purple-500/30 text-purple-300 rounded-md flex items-center justify-center font-bold text-[10px]">
                              {idx + 1}
                            </span>
                            <span>{doc}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 flex gap-3 text-xs">
                        <button
                          type="button"
                          onClick={() => handlePrefillInquiry('legal', selectedLegalService.title)}
                          className="flex-1 bg-brand-gold-500 hover:bg-brand-gold-600 text-brand-navy-950 font-bold py-3.5 rounded-xl transition-all shadow-md text-center"
                        >
                          Draft and Request Custom Quote
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedLegalService(null)}
                          className="px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs transition-all"
                        >
                          Close Details
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {selectedInsuranceService && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
                    <div className="space-y-4">
                      <span className="text-xs uppercase bg-emerald-500/20 text-emerald-300 font-bold px-3 py-1 rounded-full border border-emerald-500/20">
                        🛡️ {selectedInsuranceService.category} Insurance Advisor Checklist
                      </span>
                      <h3 className="font-display text-2.5xl font-black">{selectedInsuranceService.title}</h3>
                      <p className="text-sm text-slate-300 leading-relaxed">{selectedInsuranceService.description}</p>
                      
                      <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                        <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                          <span className="text-slate-400 block pb-1 border-b border-white/5 text-[10px] uppercase font-bold">Max Cover Limit</span>
                          <span className="font-extrabold text-[#fff] font-display text-[13px] block mt-1">{selectedInsuranceService.maxCoverage}</span>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                          <span className="text-slate-400 block pb-1 border-b border-white/5 text-[10px] uppercase font-bold">Premium Costs</span>
                          <span className="font-mono text-brand-gold-400 font-bold block mt-1 text-[13px]">{selectedInsuranceService.premiumStart}</span>
                        </div>
                      </div>

                      <div className="pt-4">
                        <h5 className="text-xs font-bold uppercase text-brand-gold-300 tracking-wider mb-2">Key Coverage Features:</h5>
                        <ul className="text-xs text-slate-300 space-y-2">
                          {selectedInsuranceService.features.map((f, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-emerald-400 shrink-0 mt-0.5">✓</span>
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                      <h4 className="font-display font-extrabold text-sm text-white mb-4 flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-emerald-400" />
                        Documents Required for Verification ({selectedInsuranceService.title})
                      </h4>
                      
                      <div className="space-y-2.5">
                        {selectedInsuranceService.documents.map((doc, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-brand-navy-900/80 p-3 rounded-xl text-xs text-slate-200 border border-white/5">
                            <span className="w-5 h-5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-md flex items-center justify-center font-bold text-[10px]">
                              {idx + 1}
                            </span>
                            <span>{doc}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 flex gap-3 text-xs">
                        <button
                          type="button"
                          onClick={() => handlePrefillInquiry('insurance', selectedInsuranceService.title)}
                          className="flex-1 bg-brand-gold-500 hover:bg-brand-gold-600 text-brand-navy-950 font-bold py-3.5 rounded-xl transition-all shadow-md text-center"
                        >
                          Request Free Quote / Callback
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedInsuranceService(null)}
                          className="px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs transition-all"
                        >
                          Close Details
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CLIENT TESTIMONIALS & REVIEWS SECTION */}
          <section className="py-16 md:py-20 bg-gradient-to-b from-white to-brand-navy-50/20 border-b border-brand-navy-100" id="testimonials-section">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                <span className="text-xs uppercase tracking-widest font-extrabold text-brand-gold-600 block">Verified Success Stories</span>
                <h2 className="font-display text-3xl md:text-4xl font-extrabold text-brand-navy-950">
                  Securing Legacies, One Handshake at a Time
                </h2>
                <p className="text-sm text-slate-500 max-w-xl mx-auto">
                  Over nine years of combined financial and legal expertise ensures your sensitive property and lending portfolios are treated with unmatched authority.
                </p>
              </div>

              {/* Testimonials grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {testimonials.filter(t => t.status === 'Approved').map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-6 rounded-3xl border border-brand-navy-100 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between relative group overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-brand-gold-500" />
                    
                    <div className="space-y-4">
                      {/* Star Rating */}
                      <div className="flex gap-1">
                        {Array.from({ length: item.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-brand-gold-500 text-brand-gold-500" />
                        ))}
                        {Array.from({ length: 5 - item.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 text-slate-200" />
                        ))}
                      </div>

                      {/* Review message text */}
                      <p className="text-slate-600 text-xs leading-relaxed italic font-sans">
                        "{item.testimonialText}"
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div>
                        <span className="font-display font-extrabold text-brand-navy-950 text-xs block">
                          {item.clientName}
                        </span>
                        <span className="text-[10px] text-brand-navy-500 block font-semibold mt-0.5">
                          {item.serviceUsed}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Feedbacks Submit segment */}
              <div className="mt-16 max-w-3xl mx-auto bg-brand-navy-900 text-white rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-2xl border border-brand-navy-800">
                <div className="absolute top-0 right-0 w-60 h-60 bg-brand-gold-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-brand-navy-800 pb-5">
                    <div>
                      <h3 className="font-display font-black text-lg text-white">Have we assisted your financial journey?</h3>
                      <p className="text-xs text-slate-300 mt-1">Submit your testimonial block. Your experience helps hundreds of local property buyers.</p>
                    </div>
                    <span className="bg-brand-gold-500/10 border border-brand-gold-500/30 text-brand-gold-300 px-3 py-1.5 rounded-xl font-bold font-mono text-[9px] uppercase tracking-wider">
                      Client Feedback Desk
                    </span>
                  </div>

                  <form onSubmit={handleTestimonialSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name input */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-300 block">Your Name (Optional)</label>
                        <input
                          type="text"
                          className="w-full text-xs px-3.5 py-3 rounded-xl bg-brand-navy-950 border border-slate-700 text-white focus:outline-none focus:border-brand-gold-500"
                          placeholder="Leave blank to submit anonymously"
                          value={newTestimonialName}
                          onChange={(e) => setNewTestimonialName(e.target.value)}
                        />
                      </div>

                      {/* Dropdown list of services */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-300 block">Service Acquired</label>
                        <select
                          className="w-full text-xs px-3.5 py-3 rounded-xl bg-brand-navy-950 border border-slate-700 text-white focus:outline-none focus:border-brand-gold-500"
                          value={newTestimonialService}
                          onChange={(e) => setNewTestimonialService(e.target.value)}
                        >
                          <option value="Home Loan Advisory">🏠 Home Loan Advisory</option>
                          <option value="Business Loan Disbursement">💼 Business Loan Disbursement</option>
                          <option value="Loan Against Property (LAP)">🏡 Loan Against Property (LAP)</option>
                          <option value="Personal Loan Facilitation">💳 Personal Loan Facilitation</option>
                          <option value="30-Year Title Search & Legal Opinion">⚖️ 30-Year Title Search & Legal Opinion</option>
                          <option value="Sub-Registrar Slot & Registration support">✍️ Sub-Registrar Slot & Registration</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      {/* Star Rating select */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase tracking-rose font-bold text-slate-300 block">Rating score</span>
                        <div className="flex gap-2.5 items-center">
                          {[1, 2, 3, 4, 5].map((stars) => (
                            <button
                              key={stars}
                              type="button"
                              onClick={() => setNewTestimonialRating(stars)}
                              className="focus:outline-none text-2xl transition-transform hover:scale-125"
                            >
                              <span className={stars <= newTestimonialRating ? 'text-brand-gold-400' : 'text-slate-600'}>★</span>
                            </button>
                          ))}
                          <span className="text-xs text-slate-400 font-bold ml-2">({newTestimonialRating}/5 Stars)</span>
                        </div>
                      </div>

                      {/* Name display permission checkbox */}
                      <div className="flex items-center gap-3 bg-brand-navy-950 p-3 rounded-xl border border-slate-800">
                        <input
                          id="newTestimonialPermission"
                          type="checkbox"
                          className="w-4.5 h-4.5 accent-brand-gold-500 cursor-pointer rounded-md"
                          checked={newTestimonialPermission}
                          onChange={(e) => setNewTestimonialPermission(e.target.checked)}
                        />
                        <label htmlFor="newTestimonialPermission" className="text-[11px] text-slate-300 cursor-pointer font-medium select-none">
                          I consent to display my name publicly with this review.
                        </label>
                      </div>
                    </div>

                    {/* Testimonial message textbox */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-slate-300 block">Write Testimonial Statement</label>
                      <textarea
                        rows={3}
                        required
                        className="w-full text-xs p-3.5 rounded-xl bg-brand-navy-950 border border-slate-700 text-white focus:outline-none focus:border-brand-gold-500"
                        placeholder="Describe your satisfaction with Sanket's legal document reports or loan approvals speed..."
                        value={newTestimonialText}
                        onChange={(e) => setNewTestimonialText(e.target.value)}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-brand-gold-500 hover:bg-brand-gold-600 text-brand-navy-950 font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-md mt-4"
                    >
                      Publish Review Live
                    </button>
                  </form>

                  {testimonialSubmitted && (
                    <div className="p-4 bg-green-500/15 border border-green-500/30 rounded-xl text-green-300 text-xs flex items-center gap-2.5">
                      <CheckCircle className="w-4 h-4 shrink-0 text-green-400" />
                      <div>
                        <p className="font-bold">Testimonial added instantly!</p>
                        <p className="text-[11px] text-green-400">Thank you. Your feedback is published live in our visual grid and stored locally.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </section>

          {/* INTERACTIVE CALCULATOR SUITE */}
          <section className="bg-brand-navy-50/50 py-16 md:py-24 border-y border-brand-navy-100" id="calculators-section">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
                <span className="text-xs uppercase tracking-widest font-extrabold text-brand-gold-600 block">Financial Prudence</span>
                <h2 className="font-display text-3xl md:text-4xl font-extrabold text-brand-navy-950">
                  Plan Outflow & Borrowing Limits Side-by-Side
                </h2>
                <p className="text-sm text-slate-500 max-w-xl mx-auto">
                  Compare prospective EMIs based on tenure interest weights, or inspect pre-underwriting approval margins prior to formal bank filings.
                </p>
              </div>

              {/* Calculator grids */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* EMI Slider Card */}
                <div className="lg:col-span-6">
                  <EMICalculator />
                </div>

                {/* Eligibility Diagnostic */}
                <div className="lg:col-span-6">
                  <EligibilityChecker />
                </div>

              </div>
            </div>
          </section>

          {/* DYNAMIC BACKEND INTERACTIVE ADVISORY INQUIRY FORM */}
          <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20" id="inquiry-form-section">
            <div className="bg-white rounded-3xl shadow-xl border border-brand-navy-100 overflow-hidden grid grid-cols-1 md:grid-cols-12">
              
              {/* Form Sidebar Promo details */}
              <div className="bg-brand-navy-900 text-white md:col-span-5 p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-brand-gold-500/10 rounded-full blur-2xl" />
                
                <div className="space-y-6 relative z-10">
                  <div className="w-10 h-10 bg-brand-gold-500/10 border border-brand-gold-500/30 rounded-xl flex items-center justify-center">
                    <PhoneCall className="w-5 h-5 text-brand-gold-500" />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-xl text-white">We Solve Tough Cases</h3>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      Lacking regular salary receipts? Experienced complex property inheritance documentation challenges? We handle title disputes and help self-employed workers with active MSME credentials clear files smoothly.
                    </p>
                  </div>

                  <div className="space-y-3.5 pt-4 border-t border-brand-navy-800 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-brand-gold-500" />
                      <span>Free Eligibility Assessment</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-brand-gold-500" />
                      <span>Within-2-Hours Return SLA Call</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-brand-gold-500" />
                      <span>No Upfront Fees Assessed</span>
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-brand-navy-800 mt-8 space-y-3">
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Direct Office Hotline</p>
                    <a href="tel:+918487974404" className="text-sm font-bold text-white mt-1 flex items-center gap-2 hover:text-brand-gold-400 transition-colors">
                      <Phone className="w-4 h-4 text-brand-gold-500 shrink-0" />
                      <span>+91 84879 74404</span>
                    </a>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Business Email</p>
                    <a href="mailto:sanketbhavsar27@gmail.com" className="text-xs font-bold text-slate-200 mt-1 flex items-center gap-2 hover:text-brand-gold-400 transition-colors">
                      <span className="text-sm shrink-0">✉️</span>
                      <span>sanketbhavsar27@gmail.com</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Form inputs side */}
              <div className="md:col-span-7 p-8 md:p-10">
                <h3 className="font-display font-extrabold text-2xl text-brand-navy-950 mb-2">Book Callback & Valuation Support</h3>
                <p className="text-xs text-slate-500 mb-6">Complete this request. Our systems will index details immediately. You can view progress logs by toggling the `Advisor CRM` view in the top header.</p>

                <form onSubmit={handleInquirySubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-brand-navy-800">Your Full Name</label>
                      <input
                        type="text"
                        required
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-navy-600"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-brand-navy-800">Phone Number</label>
                      <input
                        type="tel"
                        required
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-navy-600"
                        placeholder="+91..."
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-brand-navy-800">Email Address (Optional)</label>
                      <input
                        type="email"
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-navy-600"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-brand-navy-800">Best Time for Counsel Call</label>
                      <select
                        className="w-full text-xs p-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-navy-600"
                        value={formData.bestTimeToCall}
                        onChange={(e) => setFormData({ ...formData, bestTimeToCall: e.target.value })}
                      >
                        <option value="Mornings 10 AM - 1 PM">Mornings 10 AM - 1 PM</option>
                        <option value="Afternoons 1 PM - 4 PM">Afternoons 1 PM - 4 PM</option>
                        <option value="Evenings 4 PM - 7 PM">Evenings 4 PM - 7 PM</option>
                        <option value="Anytime of the Day">Anytime of the Day</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-brand-navy-800">Inquiry Channel</label>
                      <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold gap-1">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, leadType: 'loan', subType: 'Home Loans' })}
                          className={`flex-1 py-1.5 text-center rounded-lg transition-all ${formData.leadType === 'loan' ? 'bg-white text-brand-navy-850 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          💸 Loan
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, leadType: 'legal', subType: 'Title Search & Legal Opinion' })}
                          className={`flex-1 py-1.5 text-center rounded-lg transition-all ${formData.leadType === 'legal' ? 'bg-white text-brand-navy-850 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          ⚖️ Legal
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, leadType: 'insurance', subType: 'Term Life Insurance' })}
                          className={`flex-1 py-1.5 text-center rounded-lg transition-all ${formData.leadType === 'insurance' ? 'bg-white text-brand-navy-850 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          🛡️ Insurance
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-brand-navy-800">Select Specific Category</label>
                      <select
                        className="w-full text-xs p-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-navy-600"
                        value={formData.subType}
                        onChange={(e) => setFormData({ ...formData, subType: e.target.value })}
                      >
                        {formData.leadType === 'loan' && LOAN_SERVICES.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
                        {formData.leadType === 'legal' && LEGAL_SERVICES.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
                        {formData.leadType === 'insurance' && INSURANCE_SERVICES.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
                      </select>
                    </div>
                  </div>

                  {formData.leadType === 'loan' && (
                    <div className="space-y-2 pt-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-brand-navy-800">Target Loan Amount Budget</span>
                        <span className="font-bold text-brand-navy-600">
                          ₹{(formData.amount / 100000).toFixed(1)} Lakhs (₹{formData.amount.toLocaleString()})
                        </span>
                      </div>
                      <input
                        type="range"
                        min="100000"
                        max="15000000"
                        step="50000"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                        className="w-full accent-brand-navy-600 h-1.5 bg-brand-navy-100 rounded-lg cursor-pointer animate-pulse"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-brand-navy-800">Specific Requirements & Details</label>
                    <textarea
                      rows={3}
                      className="w-full text-xs p-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-navy-600"
                      placeholder="Explain your situation briefly (e.g. current credit score, property location, title mother-deed search timeline requirements)"
                      value={formData.details}
                      onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-brand-navy-900 hover:bg-brand-navy-850 text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-md mt-4"
                  >
                    Register Request on Office Database
                  </button>
                </form>

                {formSubmitted && (
                  <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-700 text-xs flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Inquiry logged successfully!</p>
                      <p className="text-[11px] text-slate-500 mt-1">We have logged your request. Switch to the `Advisor CRM` view in the header link to see your lead record instantly!</p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </section>

          {/* DYNAMIC COLLAPSIBLE FAQs SECTION */}
          <section className="bg-white/85 py-16 md:py-20 border-t border-brand-navy-100" id="faqs-section">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="text-center mb-12 space-y-3">
                <span className="text-xs uppercase tracking-widest font-extrabold text-brand-gold-600 block">Frequently Asked Questions</span>
                <h2 className="font-display text-2.5xl font-extrabold text-brand-navy-950">
                  Guidance on Loans, Stamp Duty & Registration Laws
                </h2>
                <p className="text-xs text-slate-500 max-w-lg mx-auto">
                  Understand critical process parameters of land registration, title opinion reports, and multi-bank underwriting regulations.
                </p>
              </div>

              <div className="space-y-3.5">
                {FAQS.map((faq, index) => {
                  const isOpen = faqOpenIndex === index;
                  return (
                    <div
                      key={index}
                      className="border border-brand-navy-100 rounded-2xl bg-white p-4 transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => setFaqOpenIndex(isOpen ? null : index)}
                        className="w-full flex justify-between items-center text-left font-display font-semibold text-brand-navy-900 text-sm md:text-base focus:outline-none"
                      >
                        <span>{faq.question}</span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-brand-gold-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </button>
                      
                      {isOpen && (
                        <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 leading-relaxed font-sans">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          </section>
        </>
      )}

      {/* FOOTER CONTACT ROW */}
      <footer className="mt-auto bg-brand-navy-900 text-slate-300 border-t border-brand-navy-950 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 pb-12 border-b border-brand-navy-800">
          
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-navy-950 rounded-lg flex items-center justify-center border border-brand-gold-500">
                <span className="font-display font-black text-lg text-brand-gold-500">SR</span>
              </div>
              <div>
                <span className="font-display text-lg font-bold text-white block">SR Finserv</span>
                <span className="text-[9px] uppercase tracking-wider font-bold text-brand-gold-500 block -mt-1">
                  Legal & Loans Advisory
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Serving property developers, individual buyers, and aspiring business entrepreneurs in Ahmedabad with over nine combined years of major bank loan officer expertise and active legal solutions.
            </p>
          </div>

          <div className="md:col-span-4 space-y-4">
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">Services Coverage</h4>
            <ul className="text-xs space-y-2.5">
              <li><button onClick={() => { setActiveTab('services'); setIsCrmMode(false); }} className="hover:text-brand-gold-400 transition-colors">Residential Home Loans</button></li>
              <li><button onClick={() => { setActiveTab('services'); setIsCrmMode(false); }} className="hover:text-brand-gold-400 transition-colors">Business & MSME Collateral-Free Loans</button></li>
              <li><button onClick={() => { setActiveTab('services'); setIsCrmMode(false); }} className="hover:text-brand-gold-400 transition-colors">Mother Deed 30-Year Title Search Reports</button></li>
              <li><button onClick={() => { setActiveTab('services'); setIsCrmMode(false); }} className="hover:text-brand-gold-400 transition-colors">Sub-Registrar Slot Booking Support</button></li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-4">
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">Direct Business Support</h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2">
                <span className="text-slate-400 shrink-0">📍</span>
                <span className="text-slate-300 leading-normal">
                  87, Venus Alfa Market, Venus Atlantis, Near Shell Petrol Pump, Prahladnagar, Ahmedabad - 380015
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-slate-400 shrink-0">📞</span>
                <a href="tel:+918487974404" className="text-brand-gold-300 font-bold font-mono hover:underline">
                  +91 84879 74404
                </a>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-slate-400 shrink-0">✉️</span>
                <a href="mailto:sanketbhavsar27@gmail.com" className="text-brand-gold-300 font-bold font-mono hover:underline">
                  sanketbhavsar27@gmail.com
                </a>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-slate-400 shrink-0">⚡</span>
                <span className="text-slate-300">Callback Answer SLA: 2 Hours Guaranteed</span>
              </div>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} SR Finserv. All Rights Reserved.
          </div>
          <div className="flex gap-4 font-mono text-[10px]">
            <span>Founded by Sanket Bhavsar</span>
            <span>•</span>
            <span>Secure SSL Encrypted</span>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Action Button */}
      <div
        id="whatsapp-fab-container"
        className={`group/fab fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2 pointer-events-none transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1) transform ${
          showWhatsappFab
            ? 'translate-y-0 opacity-100 scale-100'
            : 'translate-y-20 opacity-0 scale-50'
        }`}
      >
        {/* Hover tooltips */}
        <div className="bg-slate-900/90 text-white text-[11px] font-sans px-3 py-1.5 rounded-lg shadow-md border border-slate-700 opacity-0 transform translate-y-2 group-hover/fab:opacity-100 group-hover/fab:translate-y-0 transition-all duration-300 pointer-events-auto select-none mr-1 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-ping" />
          <span>Sanket is Online</span>
        </div>

        <a
          id="whatsapp-fab"
          href="https://wa.me/918487974404?text=Hello%20Sanket%20%40%20SR%20Finserv%2C%20I%20have%20an%20inquiry%20regarding%20property%20legal%20documents%20/%20loans."
          target="_blank"
          referrerPolicy="no-referrer"
          rel="noopener noreferrer"
          className="group pointer-events-auto flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white p-3.5 sm:px-4 sm:py-3.5 rounded-full shadow-[0_12px_36px_rgba(37,211,102,0.4)] hover:shadow-[0_16px_40px_rgba(37,211,102,0.6)] transform hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-300 md:w-auto"
          title="Chat with Sanket Bhavsar on WhatsApp"
        >
          {/* Pulsing state ring */}
          <span className="absolute inset-0 rounded-full border-2 border-[#25D366] animate-ping opacity-25" />
          
          <MessageCircle className="w-6 h-6 shrink-0 fill-white text-[#25D366] group-hover:rotate-12 transition-transform duration-300" />
          
          <div className="hidden sm:flex flex-col items-start leading-none pr-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-100 leading-none">Instant Support</span>
            <span className="text-xs font-extrabold text-white mt-0.5 font-sans">Chat on WhatsApp</span>
          </div>

          {/* Sparkle micro accent */}
          <Sparkles className="w-3.5 h-3.5 text-white/80 hidden sm:inline-block animate-pulse shrink-0" />
        </a>
      </div>

    </div>
  );
}
