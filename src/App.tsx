import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  UserCheck,
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
  Globe,
  Instagram,
  Bell,
  Menu
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { LOAN_SERVICES, LEGAL_SERVICES, INSURANCE_SERVICES, INITIAL_LEADS, FAQS, INITIAL_TESTIMONIALS } from './data';
import { InquiryLead, LeadType, ClientTestimonial, InsuranceService } from './types';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import LoanChecklistDownload from './components/LoanChecklistDownload';
// @ts-ignore

export default function App() {
  // Navigation and Tab management
  const [activeTab, setActiveTab] = useState<'home' | 'services' | 'inquire' | 'about_us' | 'go_live' | 'links'>('home');
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);

  // Hash routing for social links (srfinserv.co/#links)
  useEffect(() => {
    const checkHashRoute = () => {
      if (window.location.hash === '#links' || window.location.hash === '#social' || window.location.hash === '#social-hub') {
        setActiveTab('links');
        setIsCrmMode(false);
      } else if (window.location.hash === '#services') {
        setActiveTab('services');
        setIsCrmMode(false);
      } else if (window.location.hash === '#inquire') {
        setActiveTab('inquire');
        setIsCrmMode(false);
      } else if (window.location.hash === '#about_us') {
        setActiveTab('about_us');
        setIsCrmMode(false);
      }
    };
    checkHashRoute();
    window.addEventListener('hashchange', checkHashRoute);
    return () => window.removeEventListener('hashchange', checkHashRoute);
  }, []);

  // Floating WhatsApp FAB entrance animation state
  const [showWhatsappFab, setShowWhatsappFab] = useState<boolean>(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWhatsappFab(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Client Testimonials state
  const [testimonials, setTestimonials] = useState<ClientTestimonial[]>(INITIAL_TESTIMONIALS);

  // Load testimonials from Firestore in real-time
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'testimonials'), (snapshot) => {
        const list: ClientTestimonial[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as ClientTestimonial);
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setTestimonials(list);
      }, (error) => {
        console.error("Error listening to testimonials:", error);
      });
      return () => unsub();
    } catch (err) {
      console.error("Failed to start testimonials real-time listener:", err);
    }
  }, []);

  // Submit Testimonial Form State
  const [newTestimonialName, setNewTestimonialName] = useState('');
  const [newTestimonialService, setNewTestimonialService] = useState('Home Loans');
  const [newTestimonialText, setNewTestimonialText] = useState('');
  const [newTestimonialPermission, setNewTestimonialPermission] = useState(true);
  const [newTestimonialRating, setNewTestimonialRating] = useState(5);
  const [testimonialSubmitted, setTestimonialSubmitted] = useState(false);

  // Email Alerts & Real-time Toasts State Engine
  const [advisorEmail, setAdvisorEmail] = useState(() => {
    return localStorage.getItem('sr_finserv_advisor_email') || 'sanketbhavsar27@gmail.com';
  });
  useEffect(() => {
    localStorage.setItem('sr_finserv_advisor_email', advisorEmail);
  }, [advisorEmail]);

  const [toasts, setToasts] = useState<any[]>([]);
  const [emailLogs, setEmailLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem('sr_finserv_email_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      {
        id: 'log-initial-1',
        recipient: 'sanketbhavsar27@gmail.com',
        subject: '🔔 Inbound Lead Dispatch: Rajesh Kumar Patel',
        body: 'Hello SR Finserv Advisor,\n\nA new customer requirement has been submitted on your live website!\n\nDetails:\n- Customer Name: Rajesh Kumar Patel\n- Phone: 9876543210\n- Requirement: Home Loan Services\n- Received: 2026-06-20 08:32:01',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'SUCCESS',
        clientName: 'Rajesh Kumar Patel'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('sr_finserv_email_logs', JSON.stringify(emailLogs));
  }, [emailLogs]);

  const triggerNotification = (title: string, message: string, type: 'success' | 'info' | 'warning' = 'info', isEmail = true, clientName?: string) => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, title, message, type, timestamp: new Date(), isEmail }]);
    
    // Auto drop after 5s
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);

    // If matches email log requested, push log
    if (isEmail && clientName) {
      const logId = `log-${Date.now()}`;
      const newLog = {
        id: logId,
        recipient: advisorEmail,
        subject: `🔔 Inbound Lead Dispatch: ${clientName}`,
        body: `Hello SR Finserv Advisor,\n\nA new customer requirement has been submitted on your live website!\n\nDetails:\n- Customer Name: ${clientName}\n- Message summary: ${message}\n- Received: ${new Date().toLocaleString()}\n\nBest Regards,\nSR Finserv Automated Notification Service`,
        timestamp: new Date().toISOString(),
        status: 'SUCCESS',
        clientName
      };
      setEmailLogs(prev => [newLog, ...prev]);
    }
  };

  const lastSubmittedIdRef = useRef<string>('');
  const isInitialLeadsLoad = useRef<boolean>(true);
  
  // Leads & CRM Management State
  const [leads, setLeads] = useState<InquiryLead[]>(INITIAL_LEADS);

  // Load leads from Firestore in real-time
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'leads'), (snapshot) => {
        const list: InquiryLead[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as InquiryLead);
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setLeads(list.length > 0 ? list : INITIAL_LEADS);

        // Notify active user of new submissions
        if (!isInitialLeadsLoad.current) {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const data = change.doc.data() as InquiryLead;
              if (data.id && data.id !== lastSubmittedIdRef.current) {
                triggerNotification(
                  'Live Inbound Lead Received!',
                  `Client ${data.fullName} is interested in ${data.subType || 'our assistance'}.`,
                  'success',
                  true,
                  data.fullName
                );
              }
            }
          });
        } else {
          isInitialLeadsLoad.current = false;
        }
      }, (error) => {
        console.error("Error listening to leads:", error);
      });
      return () => unsub();
    } catch (err) {
      console.error("Failed to start leads real-time listener:", err);
    }
  }, [advisorEmail]);

  // Synchronize legacy local reviews and leads to the global Firestore database
  useEffect(() => {
    try {
      // 1. Migrate Local Testimonials to Firestore
      const savedTestimonials = localStorage.getItem('sr_finserv_testimonials');
      if (savedTestimonials) {
        const parsed = JSON.parse(savedTestimonials);
        if (Array.isArray(parsed)) {
          parsed.forEach((t: any) => {
            if (t && t.id && !['test-1', 'test-2', 'test-3', 'test-4'].includes(t.id)) {
              setDoc(doc(db, 'testimonials', t.id), {
                clientName: t.clientName || 'Valued Client',
                serviceUsed: t.serviceUsed || 'Home Loans',
                testimonialText: t.testimonialText || '',
                hasPermission: t.hasPermission !== false,
                rating: Number(t.rating) || 5,
                status: t.status || 'Approved',
                createdAt: t.createdAt || new Date().toISOString()
              }, { merge: true }).catch(err => {
                console.error("Historical testimonial sync failed:", err);
              });
            }
          });
        }
      }

      // 2. Migrate Local Leads to Firestore
      const savedLeads = localStorage.getItem('sr_finserv_leads');
      if (savedLeads) {
        const parsed = JSON.parse(savedLeads);
        if (Array.isArray(parsed)) {
          parsed.forEach((l: any) => {
            if (l && l.id && !['lead-1'].includes(l.id)) {
              setDoc(doc(db, 'leads', l.id), {
                fullName: l.fullName || '',
                phone: l.phone || '',
                email: l.email || '',
                leadType: l.leadType || 'loan',
                subType: l.subType || '',
                amount: Number(l.amount) || 0,
                details: l.details || '',
                status: l.status || 'New',
                createdAt: l.createdAt || new Date().toISOString(),
                notes: l.notes || '',
                bestTimeToCall: l.bestTimeToCall || ''
              }, { merge: true }).catch(err => {
                console.error("Historical lead sync failed:", err);
              });
            }
          });
        }
      }
    } catch (error) {
      console.warn("Storage sync error:", error);
    }
  }, []);

  // Advisor Panel View Toggle
  const [isCrmMode, setIsCrmMode] = useState<boolean>(false);
  const [showCrmLoginModal, setShowCrmLoginModal] = useState<boolean>(false);
  const [showDocumentChecklistModal, setShowDocumentChecklistModal] = useState<boolean>(false);
  const [showInquiryModal, setShowInquiryModal] = useState<boolean>(false);
  const [showFaqModal, setShowFaqModal] = useState<boolean>(false);
  const [activeServiceSubTab, setActiveServiceSubTab] = useState<'loan' | 'legal' | 'insurance'>('loan');
  const [isLoanExpanded, setIsLoanExpanded] = useState<boolean>(true);
  const [isLegalExpanded, setIsLegalExpanded] = useState<boolean>(false);
  const [isInsuranceExpanded, setIsInsuranceExpanded] = useState<boolean>(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState<boolean>(false);
  const [crmPasscodeInput, setCrmPasscodeInput] = useState<string>('');
  const [isCrmAuthenticated, setIsCrmAuthenticated] = useState<boolean>(false);
  const [crmLoginError, setCrmLoginError] = useState<string>('');

  // Counter states for secret triggers (logo or footer)
  const [logoClickCount, setLogoClickCount] = useState<number>(0);
  const [footerClickCount, setFooterClickCount] = useState<number>(0);

  // Keyboard shortcut listener: Ctrl + Shift + C
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'c') ||
        (e.shiftKey && e.altKey && e.key.toLowerCase() === 'c')
      ) {
        e.preventDefault();
        setShowCrmLoginModal(true);
        setCrmPasscodeInput('');
        setCrmLoginError('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Timer to clear secret click accumulators if too much time passes
  useEffect(() => {
    if (logoClickCount > 0) {
      const timer = setTimeout(() => setLogoClickCount(0), 2000);
      return () => clearTimeout(timer);
    }
  }, [logoClickCount]);

  useEffect(() => {
    if (footerClickCount > 0) {
      const timer = setTimeout(() => setFooterClickCount(0), 2000);
      return () => clearTimeout(timer);
    }
  }, [footerClickCount]);

  const triggerCrmPortalLogin = () => {
    setShowCrmLoginModal(true);
    setCrmPasscodeInput('');
    setCrmLoginError('');
    setLogoClickCount(0);
    setFooterClickCount(0);
  };

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

  // Call Back Reminders System
  const [callReminders, setCallReminders] = useState<any[]>(() => {
    const saved = localStorage.getItem('sr_finserv_call_reminders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('sr_finserv_call_reminders', JSON.stringify(callReminders));
  }, [callReminders]);

  useEffect(() => {
    const checkInterval = setInterval(() => {
      const now = Date.now();
      let hasChange = false;
      
      const updated = callReminders.map(rem => {
        if (!rem.triggered && now >= new Date(rem.scheduledAt).getTime()) {
          // Check if the original lead is still 'New'
          const matchingLead = leads.find(l => l.id === rem.leadId);
          if (matchingLead && matchingLead.status === 'New') {
            triggerNotification(
              '☎️ Call Back Reminder Triggered!',
              `Reminder: Call ${rem.fullName} ASAP at ${rem.phone} for ${rem.subType}. Status is still 'New'.`,
              'warning',
              false
            );
          }
          hasChange = true;
          return { ...rem, triggered: true };
        }
        return rem;
      });

      if (hasChange) {
        setCallReminders(updated);
      }
    }, 4000); // Check every 4s

    return () => clearInterval(checkInterval);
  }, [callReminders, leads]);

  // Submit Inquiry Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    requirement: 'Loan services' as 'Loan services' | 'Insurance services' | 'Legal services',
  });
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [lastSubmittedId, setLastSubmittedId] = useState<string>('');

  // Handle service prefill choice
  const handlePrefillInquiry = (type: LeadType, name: string) => {
    let req: 'Loan services' | 'Insurance services' | 'Legal services' = 'Loan services';
    if (type === 'insurance') {
      req = 'Insurance services';
    } else if (type === 'legal') {
      req = 'Legal services';
    }
    setFormData(prev => ({
      ...prev,
      requirement: req,
    }));
    setShowInquiryModal(true);
    
    // Direct inform on WhatsApp: e.g. "Hello Sanket! I'm interested in Home Loans"
    const customerName = formData.fullName || 'A customer';
    const whatsappMessage = `Hello Sanket! ${customerName} has requested information about your "${name}" service. Please assist.`;
    const whatsappUrl = `https://wa.me/918487974404?text=${encodeURIComponent(whatsappMessage)}`;
    
    // Open dynamic WhatsApp chat with Sanket
    window.open(whatsappUrl, '_blank');

    // Scroll smoothly to form contact section
    const element = document.getElementById('inquiry-form-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Inquiry submission handler
  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) {
      alert('Please fill in your Name and Mo. Number so we can consult you.');
      return;
    }

    const newId = `lead-${Date.now()}`;
    let leadType: LeadType = 'loan';
    if (formData.requirement === 'Insurance services') {
      leadType = 'insurance';
    } else if (formData.requirement === 'Legal services') {
      leadType = 'legal';
    }

    const newLead: InquiryLead = {
      id: newId,
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email || 'N/A',
      leadType: leadType,
      subType: formData.requirement,
      details: `Requested advisory for ${formData.requirement}`,
      status: 'New',
      createdAt: new Date().toISOString(),
      notes: ''
    };

    // Save lead to real-time Cloud Firestore database
    lastSubmittedIdRef.current = newId;
    setLastSubmittedId(newId);
    
    setDoc(doc(db, 'leads', newId), newLead).then(() => {
      triggerNotification(
        'Inbound Lead Placed!',
        `A new requirement form has been received from ${newLead.fullName}. Automated notification dispatches started.`,
        'success',
        true,
        newLead.fullName
      );
    }).catch(err => {
      console.error("Error saving lead to Firestore:", err);
      // Fallback local alert trigger so they always feel secure
      triggerNotification(
        'Offline Lead Saved',
        `A requirement form has been received from ${newLead.fullName}. (Substituted locally due to network fallback)`,
        'warning',
        true,
        newLead.fullName
      );
    });

    setFormSubmitted(true);

    // Reset standard parts
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      requirement: 'Loan services',
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
    const newId = `test-${Date.now()}`;

    const newTestimonial: ClientTestimonial = {
      id: newId,
      clientName: permittedName,
      serviceUsed: newTestimonialService,
      testimonialText: newTestimonialText.trim(),
      hasPermission: newTestimonialPermission,
      rating: newTestimonialRating,
      status: 'Approved',
      createdAt: new Date().toISOString(),
      advisorReply: 'Thank you for choosing SR Finserv'
    };

    // Save testimonial to real-time Cloud Firestore database
    setDoc(doc(db, 'testimonials', newId), newTestimonial).catch(err => {
      console.error("Error saving testimonial to Firestore:", err);
    });

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

  const handleDeleteTestimonial = async (testimonialId: string) => {
    if (confirm('Are you sure you want to remove this client testimonial?')) {
      try {
        await deleteDoc(doc(db, 'testimonials', testimonialId));
      } catch (err) {
        console.error("Error deleting testimonial from Firestore:", err);
      }
    }
  };

  const handleToggleTestimonialStatus = async (testimonialId: string) => {
    const testimonial = testimonials.find(t => t.id === testimonialId);
    if (!testimonial) return;
    const newStatus = testimonial.status === 'Approved' ? 'Pending' : 'Approved';
    try {
      await updateDoc(doc(db, 'testimonials', testimonialId), { status: newStatus });
    } catch (err) {
      console.error("Error updating testimonial status in Firestore:", err);
    }
  };

  const handleUpdateTestimonialReply = async (testimonialId: string, replyText: string) => {
    try {
      await updateDoc(doc(db, 'testimonials', testimonialId), { advisorReply: replyText });
    } catch (err) {
      console.error("Error updating testimonial reply in Firestore:", err);
    }
  };

  // CRM Lead Updates
  const handleUpdateLeadStatus = async (leadId: string) => {
    try {
      await updateDoc(doc(db, 'leads', leadId), {
        status: leadStatusEdit,
        notes: leadNotesEdit
      });
    } catch (err) {
      console.error("Error updating lead status in Firestore:", err);
    }
    setSelectedLeadForEdit(null);
  };

  const handleTriggerSimulation = () => {
    const dummyNames = ["Dhruvi Mehta", "Smit Patel", "Kishan Bhavsar", "Ananya Shah"];
    const randomName = dummyNames[Math.floor(Math.random() * dummyNames.length)];
    const dummyServices = ["Home Loan Advisory", "Legal Property Title Clear Draft", "Term Insurance Consulting"];
    const randomService = dummyServices[Math.floor(Math.random() * dummyServices.length)];
    
    const simId = `lead-${Date.now()}`;
    const simLead: InquiryLead = {
      id: simId,
      fullName: randomName,
      phone: "9184879" + Math.floor(10000 + Math.random() * 90000).toString(),
      email: `${randomName.toLowerCase().replace(/\s+/g, "")}@gmail.com`,
      leadType: randomService.includes("Loan") ? "loan" : randomService.includes("Legal") ? "legal" : "insurance",
      subType: randomService,
      details: `Generated test submission for ${randomService} to verify real-time advisor email alert and CRM reactivity.`,
      status: 'New',
      createdAt: new Date().toISOString(),
      notes: 'Generated via Demo Simulator'
    };

    setDoc(doc(db, 'leads', simId), simLead).then(() => {
      triggerNotification(
        'Advisor Alert Realized!',
        `Simulated message from ${randomName} published. Inbox notification pushed to ${advisorEmail}.`,
        'success',
        true,
        randomName
      );
    }).catch(err => {
      console.error("Simulation error:", err);
    });
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

  // Dynamic reviews rating per department & overall stats computation
  const overallStats = useMemo(() => {
    const approved = testimonials.filter(t => t.status === 'Approved');
    const sum = approved.reduce((acc, t) => acc + t.rating, 0);
    const avg = approved.length ? Number((sum / approved.length).toFixed(1)) : 4.9;
    const count = approved.length ? approved.length : 12; // fallback to default
    return { avg, count };
  }, [testimonials]);

  const loanRatings = useMemo(() => {
    const approved = testimonials.filter(
      t => t.status === 'Approved' && 
      (t.serviceUsed === 'Home Loans' || t.serviceUsed === 'Business Loan' || t.serviceUsed === 'Personal Loans' || t.serviceUsed === 'Project Loan' || t.serviceUsed === 'Working Capital' || t.serviceUsed.toLowerCase().includes('loan') || t.serviceUsed.toLowerCase().includes('capital'))
    );
    const sum = approved.reduce((acc, t) => acc + t.rating, 0);
    const avg = approved.length ? Number((sum / approved.length).toFixed(1)) : 4.9;
    const count = approved.length ? approved.length : 18; // fallback to default
    return { avg, count };
  }, [testimonials]);

  const legalRatings = useMemo(() => {
    const approved = testimonials.filter(
      t => t.status === 'Approved' && 
      (t.serviceUsed === 'Sale Deed' || t.serviceUsed === 'Rent Agreement' || t.serviceUsed === 'Agreement to Sale' || t.serviceUsed === 'Power of Attorney' || t.serviceUsed === 'Affidavit' || t.serviceUsed === 'Notary Services' || t.serviceUsed.toLowerCase().includes('legal') || t.serviceUsed.toLowerCase().includes('notary') || t.serviceUsed.toLowerCase().includes('agreement') || t.serviceUsed.toLowerCase().includes('deed'))
    );
    const sum = approved.reduce((acc, t) => acc + t.rating, 0);
    const avg = approved.length ? Number((sum / approved.length).toFixed(1)) : 4.8;
    const count = approved.length ? approved.length : 14; // fallback to default
    return { avg, count };
  }, [testimonials]);

  const insuranceRatings = useMemo(() => {
    const approved = testimonials.filter(
      t => t.status === 'Approved' && 
      (t.serviceUsed === 'General Insurance' || t.serviceUsed === 'Life Insurance' || t.serviceUsed.toLowerCase().includes('insurance'))
    );
    const sum = approved.reduce((acc, t) => acc + t.rating, 0);
    const avg = approved.length ? Number((sum / approved.length).toFixed(1)) : 4.9;
    const count = approved.length ? approved.length : 9; // fallback to default
    return { avg, count };
  }, [testimonials]);

  return (
    <div className="min-h-screen bg-brand-beige selection:bg-brand-gold-100 flex flex-col font-sans transition-all duration-300">
      
      {/* PROFESSIONAL HEADER */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-brand-navy-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div 
              className="flex items-center gap-3 cursor-pointer select-none" 
              onClick={() => { 
                setActiveTab('home'); 
                setIsCrmMode(false);
                const nextCount = logoClickCount + 1;
                if (nextCount >= 5) {
                  triggerCrmPortalLogin();
                } else {
                  setLogoClickCount(nextCount);
                }
              }}
            >
              <div className="w-11 h-11 bg-brand-navy-600 rounded-xl flex items-center justify-center border border-brand-navy-100 shadow-xs">
                <span className="font-display font-black text-xl text-white tracking-tighter">SR</span>
              </div>
              <div className="hidden min-[360px]:block">
                <span id="brand-title" className="font-display text-base sm:text-xl font-extrabold text-brand-navy-950 block tracking-tight">
                  SR Finserv
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-extrabold text-brand-navy-600 block -mt-1">
                  Legal & Loans Advisory
                </span>
              </div>
            </div>
          </div>

          {/* Action badge - Simple & Secure */}
          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-brand-navy-600 border border-blue-100">
              <Shield className="w-3.5 h-3.5 text-brand-navy-600" />
              <span>Doorstep Service</span>
            </span>
            {isCrmMode && (
              <button
                onClick={() => {
                  setIsCrmMode(false);
                  setIsCrmAuthenticated(false); // require re-login for security next time
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs border bg-brand-gold-500 text-brand-navy-950 border-brand-gold-400 font-sans font-extrabold hover:bg-brand-gold-400"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Exit CRM Portal</span>
              </button>
            )}

            {/* Interactive Hamburger Dropdown Menu on Corner Side - Contains all Navigation & Required Docs */}
            <div className="relative">
              <button
                onClick={() => setShowMenuDropdown(!showMenuDropdown)}
                className="p-2 sm:p-2.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-600 rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer select-none relative flex items-center justify-center animate-fade-in"
                title="Open menu"
                id="corner-menu-trigger"
              >
                <Menu className="w-5 h-5 shrink-0" />
              </button>

              {showMenuDropdown && (
                <>
                  {/* Backdrop overlay to close when clicking outside */}
                  <div 
                    className="fixed inset-0 z-40 bg-transparent" 
                    onClick={() => setShowMenuDropdown(false)} 
                  />
                  
                  {/* Floating Action Dropdown Menu aligned to right corner */}
                  <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-200/80 rounded-2xl shadow-[0_12px_30px_rgba(15,23,42,0.15)] z-50 py-2.5 animate-[scaleIn_0.15s_ease-out]">
                    <div className="px-3 pb-2 mb-1.5 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">SR Navigation</span>
                      <span className="text-[8px] uppercase tracking-widest bg-blue-50 text-blue-600 font-extrabold px-1.5 py-0.5 rounded-md">Advisory</span>
                    </div>
                    
                    {/* Main Website Navigation Tabs */}
                    <button
                      onClick={() => {
                        setShowMenuDropdown(false);
                        setActiveTab('home');
                        setIsCrmMode(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-50 transition-all cursor-pointer select-none group rounded-xl ${activeTab === 'home' && !isCrmMode ? 'bg-blue-50/40' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                        🏠
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`block text-xs font-bold ${activeTab === 'home' && !isCrmMode ? 'text-blue-600 font-black' : 'text-slate-900'} group-hover:text-blue-600 transition-colors font-sans truncate`}>
                          Overview
                        </span>
                        <span className="block text-[10px] text-slate-500 font-medium font-sans truncate mt-0.5">
                          Advisory introduction & trust
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowMenuDropdown(false);
                        setActiveTab('services');
                        setIsCrmMode(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-50 transition-all cursor-pointer select-none group rounded-xl ${activeTab === 'services' && !isCrmMode ? 'bg-blue-50/40' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                        🏦
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`block text-xs font-bold ${activeTab === 'services' && !isCrmMode ? 'text-blue-600 font-black' : 'text-slate-900'} group-hover:text-blue-600 transition-colors font-sans truncate`}>
                          Services
                        </span>
                        <span className="block text-[10px] text-slate-500 font-medium font-sans truncate mt-0.5">
                          Loans, Legal, & Insurance catalog
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowMenuDropdown(false);
                        setActiveTab('about_us');
                        setIsCrmMode(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-50 transition-all cursor-pointer select-none group rounded-xl ${activeTab === 'about_us' && !isCrmMode ? 'bg-blue-50/40' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                        🏢
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`block text-xs font-bold ${activeTab === 'about_us' && !isCrmMode ? 'text-blue-600 font-black' : 'text-slate-900'} group-hover:text-blue-600 transition-colors font-sans truncate`}>
                          About Us
                        </span>
                        <span className="block text-[10px] text-slate-500 font-medium font-sans truncate mt-0.5">
                          Sanket's journey & office details
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowMenuDropdown(false);
                        setActiveTab('links');
                        setIsCrmMode(false);
                        window.location.hash = '#links';
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-50 transition-all cursor-pointer select-none group rounded-xl ${activeTab === 'links' && !isCrmMode ? 'bg-pink-50/40' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                        📱
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`block text-xs font-bold ${activeTab === 'links' && !isCrmMode ? 'text-pink-600 font-black' : 'text-slate-900'} group-hover:text-pink-600 transition-colors font-sans truncate`}>
                          Social Bio-Links Hub
                        </span>
                        <span className="block text-[10px] text-slate-500 font-medium font-sans truncate mt-0.5">
                          Instagram / Bio share links page
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowMenuDropdown(false);
                        setShowInquiryModal(true);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-50 transition-all cursor-pointer select-none group rounded-xl"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                        📞
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors font-sans truncate">
                          Customer Requirement Form
                        </span>
                        <span className="block text-[10px] text-slate-500 font-medium font-sans truncate mt-0.5">
                          Book a Doorstep Callback
                        </span>
                      </div>
                    </button>

                    <div className="my-1 border-t border-slate-100" />

                    {/* Highly Requested Document Checklist point */}
                    <button
                      onClick={() => {
                        setShowMenuDropdown(false);
                        setShowDocumentChecklistModal(true);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-blue-50/50 transition-all cursor-pointer select-none group rounded-xl"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                        📋
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors font-sans truncate">
                          Required Docs
                        </span>
                        <span className="block text-[10px] text-slate-500 font-semibold font-sans truncate mt-0.5">
                          Downloadable Checklist PDF
                        </span>
                      </div>
                    </button>

                    {/* Frequently Asked Questions */}
                    <button
                      onClick={() => {
                        setShowMenuDropdown(false);
                        setShowFaqModal(true);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-amber-50/50 transition-all cursor-pointer select-none group rounded-xl"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                        ❓
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block text-xs font-bold text-slate-900 group-hover:text-brand-navy-600 transition-colors font-sans truncate">
                          Frequently Asked FAQs
                        </span>
                        <span className="block text-[10px] text-slate-500 font-semibold font-sans truncate mt-0.5">
                          Process Answers & Stamp Laws
                        </span>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
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
                  
                  {/* Cloud Real-Time Indicator */}
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md font-mono font-bold flex items-center gap-1.5 animate-pulse">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    Cloud Firestore Real-Time Sync Active
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

                      {/* Remind Me to Call Integration */}
                      <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-100 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-brand-navy-600" />
                            <span>Call Follow-up Reminder</span>
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded-md">Status-Gate</span>
                        </div>
                        
                        {(() => {
                          const activeReminder = callReminders.find(r => r.leadId === selectedLeadForEdit.id && !r.triggered);
                          if (activeReminder) {
                            return (
                              <div className="space-y-2">
                                <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3 text-[11px] text-amber-900 space-y-1">
                                  <div className="flex items-center gap-2 font-black text-amber-800">
                                    <Bell className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                                    <span>24-Hour Reminder Active</span>
                                  </div>
                                  <p className="text-[10px] text-amber-700">Scheduled: {new Date(activeReminder.scheduledAt).toLocaleString()}</p>
                                  <p className="text-[9px] text-amber-600 italic">Will notify Sanket ONLY if client status remains <strong>'New'</strong>.</p>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCallReminders(prev => prev.filter(r => r.id !== activeReminder.id));
                                      triggerNotification('Reminder Cleared', `Call reminder for ${selectedLeadForEdit.fullName} removed.`, 'info', false);
                                    }}
                                    className="flex-1 text-[10px] bg-white border border-slate-250 hover:bg-slate-50 font-bold py-2 rounded-lg text-slate-600 transition-all"
                                  >
                                    Cancel Reminder
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      // Trigger immediately
                                      setCallReminders(prev => prev.map(r => r.id === activeReminder.id ? { ...r, scheduledAt: new Date(Date.now() - 1000).toISOString() } : r));
                                    }}
                                    className="flex-1 text-[10px] bg-brand-gold-500 hover:bg-brand-gold-400 text-brand-navy-950 font-bold py-2 rounded-lg transition-all"
                                  >
                                    ⚡ Trigger Now
                                  </button>
                                </div>
                              </div>
                            );
                          } else {
                            const isCurrentlyNew = selectedLeadForEdit.status === 'New';
                            return (
                              <div className="space-y-2">
                                <p className="text-[11px] text-slate-500 leading-tight">
                                  Adds an automated visual alert after 24 hours if the lead status is still <strong>'New'</strong>.
                                </p>
                                {!isCurrentlyNew && (
                                  <p className="text-[9px] text-amber-600 font-semibold bg-amber-50 p-1.5 rounded-lg border border-amber-100">
                                    ⚠️ Note: Client status is currently '{selectedLeadForEdit.status}'. Set back to 'New' when scheduling if needed.
                                  </p>
                                )}
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const scheduledTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
                                      const newReminder = {
                                        id: `rem-${selectedLeadForEdit.id}-${Date.now()}`,
                                        leadId: selectedLeadForEdit.id,
                                        fullName: selectedLeadForEdit.fullName,
                                        phone: selectedLeadForEdit.phone,
                                        subType: selectedLeadForEdit.subType,
                                        scheduledAt: scheduledTime,
                                        triggered: false
                                      };
                                      setCallReminders(prev => [...prev, newReminder]);
                                      triggerNotification(
                                        '⏱️ Reminder Set (24h)',
                                        `Sanket will be reminded to call ${selectedLeadForEdit.fullName} at ${selectedLeadForEdit.phone} in 24 hours.`,
                                        'success',
                                        false
                                      );
                                    }}
                                    className="flex-1 bg-brand-navy-50 hover:bg-brand-navy-100 text-brand-navy-800 font-bold text-[10px] py-2 px-2.5 rounded-xl border border-brand-navy-100 transition-all flex items-center justify-center gap-1.5"
                                  >
                                    <Bell className="w-3.5 h-3.5 text-brand-navy-600 shrink-0" />
                                    <span>Remind to Call (24h)</span>
                                  </button>
                                  
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const scheduledTime = new Date(Date.now() + 15 * 1000).toISOString(); // 15 seconds
                                      const newReminder = {
                                        id: `rem-${selectedLeadForEdit.id}-${Date.now()}`,
                                        leadId: selectedLeadForEdit.id,
                                        fullName: selectedLeadForEdit.fullName,
                                        phone: selectedLeadForEdit.phone,
                                        subType: selectedLeadForEdit.subType,
                                        scheduledAt: scheduledTime,
                                        triggered: false
                                      };
                                      setCallReminders(prev => [...prev, newReminder]);
                                      triggerNotification(
                                        '🚀 Test Reminder Scheduled',
                                        `Validation alert scheduled in 15 seconds for ${selectedLeadForEdit.fullName}! Keep the status as 'New' to verify.`,
                                        'info',
                                        false
                                      );
                                    }}
                                    className="bg-brand-gold-100/60 hover:bg-brand-gold-500 hover:text-brand-navy-950 text-brand-gold-900 border border-brand-gold-250 font-bold text-[10px] py-2 px-3 rounded-xl transition-all"
                                    title="Trigger in 15s for visual validation"
                                  >
                                    ⚡ Test 15s
                                  </button>
                                </div>
                              </div>
                            );
                          }
                        })()}
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
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="font-display font-extrabold text-brand-navy-900 text-base flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Advisor Notification Desk</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">Real-time alerts, email relays, and incoming business monitor.</p>
                    </div>

                    {/* Email Config Block */}
                    <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Email Routing Active</span>
                        <span className="text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md">SMTP RELAY</span>
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 block">Alert Delivery Target Address</label>
                        <div className="flex gap-2">
                          <input
                            type="email"
                            className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-brand-gold-500 font-medium text-brand-navy-950"
                            value={advisorEmail}
                            onChange={(e) => setAdvisorEmail(e.target.value)}
                            placeholder="sanketbhavsar27@gmail.com"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 italic">Whenever clients place requirements on the web, instant alerts dispatch to this inbox.</p>
                      </div>
                    </div>

                    {/* Simulation Module */}
                    <div className="bg-brand-gold-50/40 p-4 rounded-xl border border-brand-gold-100/60 space-y-3">
                      <div>
                        <h4 className="text-xs font-bold text-brand-navy-900">🧪 Visual Simulation & Test Node</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">Trigger a simulated inbound client lead (e.g. from Dhruvi Mehta) to satisfy visual alert testing & immediate routing validation.</p>
                      </div>
                      
                      <button
                        type="button"
                        onClick={handleTriggerSimulation}
                        className="w-full bg-brand-gold-500 hover:bg-brand-gold-400 text-brand-navy-950 font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4 text-brand-navy-950 shrink-0" />
                        <span>Simulate New Lead & Email Alert</span>
                      </button>
                    </div>

                    {/* Email Logs Section */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">Notification Dispatch logs</span>
                        <span className="text-[10px] text-slate-400 font-mono">({emailLogs.length} relayed)</span>
                      </div>

                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        {emailLogs.length === 0 ? (
                          <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50/50 rounded-lg border border-dashed">No log entries generated yet.</p>
                        ) : (
                          emailLogs.map((log: any) => (
                            <div key={log.id} className="bg-slate-50 p-3 rounded-lg text-[11px] border border-slate-100 space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="font-extrabold text-slate-700 truncate max-w-[120px]">{log.clientName || 'Valued Client'}</span>
                                <span className="text-[9px] font-mono text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                              </div>
                              <div className="text-slate-500 leading-tight truncate" title={log.subject}><strong>Sub:</strong> {log.subject}</div>
                              <div className="flex justify-between items-center text-[9px] font-mono pt-1 text-slate-400">
                                <span>Relay To: {log.recipient}</span>
                                <span className="text-emerald-600 font-bold">● {log.status}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Simple Help */}
                    <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100 text-center">
                      <p className="text-[11px] text-slate-500">💡 Select any client lead on the left of this screen to observe detailed customer diagnostics or record followups & status states.</p>
                    </div>

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
                      <th className="p-3 min-w-[180px]">Advisor Reply (Auto Reply)</th>
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
                          <input
                            type="text"
                            defaultValue={test.advisorReply || ''}
                            onBlur={(e) => {
                              if (e.target.value !== (test.advisorReply || '')) {
                                handleUpdateTestimonialReply(test.id, e.target.value);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const target = e.target as HTMLInputElement;
                                if (target.value !== (test.advisorReply || '')) {
                                  handleUpdateTestimonialReply(test.id, target.value);
                                }
                                target.blur();
                              }
                            }}
                            placeholder="Add auto reply response..."
                            className="w-full text-[11px] font-medium text-slate-850 bg-slate-50 rounded-xl px-3 py-1.5 border border-slate-250 hover:bg-slate-100/50 focus:bg-white focus:border-brand-navy-600 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
                          />
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
                    <p className="text-xs text-slate-500 font-sans">Official domain setup for Sanket Champaneri's private consultancy.</p>
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
                      <span className="font-bold">⚠️ Notice to Sanket Champaneri:</span>
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

                        {/* Dynamic UPI QR Code Component */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                          <div className="text-center space-y-1 pb-1">
                            <span className="text-[10px] font-black tracking-widest text-emerald-600 uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                              ⚡ Fully Dynamic UPI QR Generator
                            </span>
                            <p className="text-[11px] text-slate-500 pt-1">Scan this dynamic code with any mobile UPI app to instantly prefill payment parameters.</p>
                          </div>

                          <div className="flex flex-col md:flex-row items-center gap-6 justify-center">
                            
                            {/* Live QR Code SVG Frame */}
                            <div className="bg-white p-4.5 rounded-2xl border border-slate-200.5 flex flex-col items-center justify-center shadow-md relative group hover:shadow-lg transition-all">
                              <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex items-center justify-center">
                                <QRCodeSVG 
                                  value={`upi://pay?pa=${goLiveUpiId}&pn=Sanket%20Champaneri%20SR%20Finserv&am=606.82&cu=INR&tn=SR%20Finserv%20GoDaddy%20Setup`}
                                  size={160}
                                  bgColor="#FFFFFF"
                                  fgColor="#0B132B"
                                  level="M"
                                  includeMargin={true}
                                />
                              </div>

                              {/* Small central logo or accent bar representing India interface */}
                              <div className="mt-2.5 flex items-center gap-1.5 px-3 py-1 bg-brand-navy-950 text-white rounded-lg text-[9px] font-bold select-none">
                                <span className="animate-pulse text-[#25D366]">●</span>
                                <span className="tracking-wide">BHIM UPI LIVE</span>
                              </div>
                            </div>

                            {/* Info and customization fields */}
                            <div className="space-y-4 flex-1 w-full">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                                  Payee UPI VPA Address (Live Dynamic)
                                </label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={goLiveUpiId}
                                    onChange={(e) => setGoLiveUpiId(e.target.value)}
                                    className="w-full text-xs p-3.5 pr-10 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy-600 font-mono font-bold text-brand-navy-900"
                                    placeholder="e.g. 8487974404@ybl"
                                  />
                                  <span className="absolute right-3.5 top-3.5 text-xs">✏️</span>
                                </div>
                                <span className="text-[9px] text-slate-400 block font-semibold">
                                  The generated QR code instantly updates as you compile/type your target VPA.
                                </span>
                              </div>

                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-slate-500 font-medium">Merchant/Name:</span>
                                  <span className="font-extrabold text-brand-navy-950">SR Finserv Advisory</span>
                                </div>
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-slate-500 font-medium">Specified Net Cost:</span>
                                  <span className="font-mono font-bold text-brand-navy-900">₹606.82 (INR)</span>
                                </div>
                                <div className="flex justify-between text-[11px] border-t border-slate-200 pt-1.5 mt-1.5">
                                  <span className="text-slate-500 font-medium text-[10px]">Embedded URI:</span>
                                  <span className="font-mono text-[9px] text-slate-400 text-right break-all truncate max-w-[150px]">
                                    upi://pay?pa={goLiveUpiId}...
                                  </span>
                                </div>
                              </div>
                            </div>

                          </div>

                          {/* UPI App Integration Guide */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-4 text-xs text-slate-400 font-semibold">
                            <span>Supported Apps:</span>
                            <div className="flex items-center gap-3">
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-extrabold">GPay</span>
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-extrabold">PhonePe</span>
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-extrabold">Paytm</span>
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-extrabold">BHIM</span>
                            </div>
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
                          <span className="text-white">Sanket Champaneri</span>
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
          <section className="bg-white py-16 relative overflow-hidden border-b border-brand-navy-100">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
              <span className="text-xs uppercase bg-blue-50 text-brand-navy-700 border border-blue-100 px-4 py-2 rounded-full font-bold inline-block">
                Our Genesis & Leadership
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-brand-navy-950 tracking-tight">
                About <span className="text-white font-black bg-brand-navy-600 px-3.5 py-1 rounded-2xl ml-1">SR Finserv</span>
              </h1>
              <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
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
                    SR Finserv was established by Sanket Champaneri to solve a massive pain point in Ahmedabad's property market. Having spent <strong className="text-brand-navy-950">7 intense years directly inside major banking loans departments</strong>, Sanket observed first-hand why decent families and self-employed micro-enterprises were being turned down by automated systems over simple document gaps.
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
                  
                  <div className="space-y-1">
                    <h3 className="font-display font-black text-xl text-brand-navy-950">Sanket Champaneri</h3>
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
                <div className="bg-white text-brand-navy-950 rounded-3xl p-8 border border-brand-navy-100 shadow-sm space-y-6">
                  <h4 className="font-display font-black text-lg text-brand-navy-950 border-b border-brand-navy-100 pb-3 flex items-center justify-between">
                    <span>Ahmedabad Head Office</span>
                    <span className="text-[10px] bg-blue-50 text-brand-navy-600 px-2 py-0.5 rounded-md font-mono font-bold uppercase">Certified</span>
                  </h4>

                  <div className="space-y-5 text-sm">
                    {/* Mail */}
                    <div className="flex items-start gap-4">
                      <span className="text-xl shrink-0 mt-0.5">✉️</span>
                      <div>
                        <span className="text-slate-500 block font-bold text-xs uppercase tracking-wider">Direct Email Support</span>
                        <a href="mailto:sanketbhavsar27@gmail.com" className="font-extrabold text-brand-navy-600 hover:underline font-mono text-base">
                          sanketbhavsar27@gmail.com
                        </a>
                      </div>
                    </div>

                    {/* Direct phone line */}
                    <div className="flex items-start gap-4">
                      <span className="text-xl shrink-0 mt-0.5">📞</span>
                      <div>
                        <span className="text-slate-500 block font-bold text-xs uppercase tracking-wider">Direct Phone Helpline</span>
                        <a href="tel:+918487974404" className="font-extrabold text-brand-navy-600 hover:underline font-mono text-base">
                          +91 84879 74404
                        </a>
                      </div>
                    </div>

                    {/* Regional coverage / Address */}
                    <div className="flex items-start gap-4">
                      <span className="text-xl shrink-0 mt-0.5">📍</span>
                      <div>
                        <span className="text-slate-500 block font-bold text-xs uppercase tracking-wider">Physical Head Office Address</span>
                        <span className="text-slate-700 leading-relaxed block text-sm font-semibold mt-0.5">
                          87, Venus Alfa Market, Venus Atlantis, Near Shell Petrol Pump, Prahladnagar, Ahmedabad - 380015.
                        </span>
                      </div>
                    </div>

                    {/* SLA Priority */}
                    <div className="flex items-start gap-4">
                      <span className="text-xl shrink-0 mt-0.5">⚡</span>
                      <div>
                        <span className="text-slate-500 block font-bold text-xs uppercase tracking-wider">Priority SLA Guarantee</span>
                        <span className="text-slate-700 font-semibold block text-xs sm:text-sm">
                          Within 2 Hours (Sanket directly responds to calls and queries).
                        </span>
                      </div>
                    </div>

                    {/* Instagram Support */}
                    <div className="flex items-start gap-4">
                      <span className="text-xl shrink-0 mt-0.5">📸</span>
                      <div>
                        <span className="text-slate-500 block font-bold text-xs uppercase tracking-wider">On Instagram</span>
                        <a 
                          href="https://www.instagram.com/SR_Finserv/" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="font-extrabold text-pink-600 hover:text-pink-700 hover:underline flex items-center gap-1.5 text-base mt-0.5"
                        >
                          <Instagram className="w-4 h-4 shrink-0" />
                          @SR_Finserv
                        </a>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => { setShowInquiryModal(true); }}
                    className="w-full bg-brand-navy-600 hover:bg-brand-navy-800 text-white font-black text-sm py-4 rounded-xl transition-all shadow-md text-center mt-2.5"
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
      ) : activeTab === 'links' ? (
        /* SPECIAL SOCIAL SHARING AND LINK-IN-BIO HUB */
        <main className="flex-1 bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
            {/* Top Info Banner for Sanket on Desktop */}
            <div className="hidden lg:flex items-center justify-between bg-gradient-to-r from-pink-600 to-indigo-700 text-white rounded-3xl p-6 shadow-md border border-pink-500/30">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest bg-white/20 border border-white/20 px-3 py-1 rounded-full">
                  📱 Social Outreach Launchpad
                </span>
                <h2 className="font-display font-black text-2.5xl mt-1.5 font-sans">srfinserv.co Social Hub</h2>
                <p className="text-pink-100 text-xs">
                  This dashboard manages your unified Link-in-Bio profile. Use the copied link on your social handles to drive high-intent leads.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText("https://www.srfinserv.co/#links");
                    triggerNotification("Link Copied!", "Your official Instagram Bio Link is ready to paste.", "success", false);
                  }}
                  className="bg-white hover:bg-slate-100 text-pink-700 font-extrabold text-xs px-5 py-3 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span>🔗</span> Copy Bio Link
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* MOBILE PREVIEWER AND LINK-IN-BIO LANDING PAGE */}
              {/* On mobile screens, this takes 100% space and looks like a gorgeous native Linktree. On desktop, it is framed inside a beautiful smartphone container. */}
              <div className="lg:col-span-5 flex justify-center w-full">
                
                {/* Smartphone Wrapper Frame (Desktop-only visual) */}
                <div className="w-full max-w-[420px] bg-white lg:rounded-[42px] lg:border-[10px] lg:border-slate-900 lg:shadow-[0_25px_60px_rgba(15,23,42,0.3)] overflow-hidden lg:relative lg:aspect-[9/18.5] flex flex-col min-h-[640px]">
                  
                  {/* Smartphone Speaker/Camera notch (Desktop-only visual) */}
                  <div className="hidden lg:block absolute top-0 left-1/2 -translate-x-1/2 h-5 w-32 bg-slate-900 rounded-b-xl z-20" />
                  
                  {/* Standalone Link-in-Bio Main Canvas */}
                  <div className="flex-1 bg-gradient-to-b from-slate-900 via-brand-navy-950 to-slate-900 text-white relative flex flex-col p-6 sm:p-8 pt-10 sm:pt-14 overflow-y-auto">
                    
                    {/* Pulsing Light Accents */}
                    <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-[-50px] left-[-50px] w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                    {/* Header profile section */}
                    <div className="text-center space-y-4 mb-4 select-none">
                      <div className="inline-flex relative">
                        <div className="w-20 h-20 bg-gradient-to-br from-brand-gold-400 to-amber-500 rounded-full p-0.5 shadow-lg flex items-center justify-center">
                          <div className="w-full h-full bg-brand-navy-950 rounded-full flex items-center justify-center font-display font-black text-2xl text-brand-gold-500">
                            SR
                          </div>
                        </div>
                        {/* Interactive Sparkle badge */}
                        <span className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 text-white border-2 border-slate-900 rounded-full flex items-center justify-center text-[10px] shadow-sm font-bold" title="Verified Professional Profile">
                          ✓
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-center gap-1.5 font-sans">
                          <h1 className="font-display font-black text-lg tracking-tight text-white">SR Finserv Advisory</h1>
                        </div>
                        <p className="text-[11px] font-bold text-brand-gold-400 uppercase tracking-widest font-sans">
                          Sanket Champaneri • CEO
                        </p>
                        <p className="text-xs text-slate-300 max-w-[280px] mx-auto leading-relaxed">
                          9+ Years expert doorstep banking & legal contracts solutions in Ahmedabad.
                        </p>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-800 border border-slate-700 text-slate-300 mt-2 font-display">
                          📍 Prahladnagar, Ahmedabad
                        </span>
                      </div>
                    </div>

                    {/* Action Link Blocks Container */}
                    <div className="space-y-4 z-10">
                      
                      {/* LINK 1: DIRECT WHATSAPP */}
                      <a
                        href="https://wa.me/918487974404?text=Hello%20SR%20Finserv.%20I%20visited%20your%20Social%20Media%20links%20hub%20and%20want%20to%20get%20in%20touch%20regarding%20financial/loans/legal%20guidance."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/40 p-4 rounded-2xl transition-all shadow-sm hover:scale-[1.02] active:scale-95 cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center text-lg shadow-sm shrink-0 group-hover:rotate-6 transition-transform">
                          💬
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <span className="block font-black text-[9px] text-[#25D366] uppercase tracking-wider">Fastest Connect</span>
                          <span className="block text-xs font-black text-white mt-0.5 truncate font-display">Chat Live on WhatsApp</span>
                          <span className="block text-[10px] text-slate-400 font-semibold truncate font-sans">Instant advisor query clearance</span>
                        </div>
                        <span className="text-slate-400 text-xs font-mono group-hover:translate-x-1 transition-transform">→</span>
                      </a>

                      {/* LINK 2: CALL ADVISOR HOTLINE */}
                      <a
                        href="tel:+918487974404"
                        className="group flex items-center gap-3 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-400/40 p-4 rounded-2xl transition-all shadow-sm hover:scale-[1.02] active:scale-95 cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center text-lg shadow-sm shrink-0 group-hover:scale-105 transition-all">
                          📞
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <span className="block font-black text-[9px] text-sky-400 uppercase tracking-wider">Call Hotline</span>
                          <span className="block text-xs font-black text-white mt-0.5 truncate font-display">+91 84879 74404</span>
                          <span className="block text-[10px] text-slate-400 font-semibold truncate font-sans">Direct advice line (10 AM - 7 PM)</span>
                        </div>
                        <span className="text-slate-400 text-xs font-mono group-hover:translate-x-1 transition-transform">→</span>
                      </a>

                      {/* LINK 3: BOOK DOORSTEP callback */}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('inquire');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full group flex items-center gap-3 bg-brand-gold-500/10 hover:bg-brand-gold-500/20 border border-brand-gold-400/40 p-4 rounded-2xl transition-all shadow-sm hover:scale-[1.02] active:scale-95 cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-xl bg-brand-gold-500 text-brand-navy-950 flex items-center justify-center text-lg shadow-sm shrink-0 group-hover:-rotate-6 transition-transform">
                          🏠
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <span className="block font-black text-[9px] text-brand-gold-400 uppercase tracking-wider">Free Callback Form</span>
                          <span className="block text-xs font-black text-white mt-0.5 truncate font-display">Book Doorstep Callback</span>
                          <span className="block text-[10px] text-slate-400 font-semibold truncate font-sans">Prefills customized local requests</span>
                        </div>
                        <span className="text-slate-400 text-xs font-mono group-hover:translate-x-1 transition-transform">→</span>
                      </button>

                      {/* LINK 4: DOWNLOAD DOCUMENT CHECKLIST */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowDocumentChecklistModal(true);
                        }}
                        className="w-full group flex items-center gap-3 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-400/40 p-4 rounded-2xl transition-all shadow-sm hover:scale-[1.02] active:scale-95 cursor-pointer font-sans"
                      >
                        <div className="w-10 h-10 rounded-xl bg-pink-500 text-white flex items-center justify-center text-lg shadow-sm shrink-0 group-hover:scale-105 transition-all">
                          📋
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <span className="block font-black text-[9px] text-pink-400 uppercase tracking-wider">Required Checklist</span>
                          <span className="block text-xs font-black text-white mt-0.5 truncate font-display">Get Loan Docs PDF</span>
                          <span className="block text-[10px] text-slate-400 font-semibold truncate">Document check before sanctioning</span>
                        </div>
                        <span className="text-slate-400 text-xs font-mono group-hover:translate-x-1 transition-transform">→</span>
                      </button>

                      {/* LINK 5: EXPAND STANDARD SITE VIEW */}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('home');
                          window.location.hash = '';
                        }}
                        className="w-full group flex items-center gap-3 bg-slate-850 hover:bg-slate-800 border border-slate-700 p-4 rounded-2xl transition-all shadow-sm hover:scale-[1.02] active:scale-95 cursor-pointer font-sans"
                      >
                        <div className="w-10 h-10 rounded-xl bg-slate-700 text-slate-300 flex items-center justify-center text-lg shadow-sm shrink-0">
                          🌐
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <span className="block font-black text-[9px] text-slate-400 uppercase tracking-wider">Full Experience</span>
                          <span className="block text-xs font-black text-white mt-0.5 truncate font-display">Explore Main Website</span>
                          <span className="block text-[10px] text-slate-400 font-semibold truncate">Calculators, full catalogs, reviews</span>
                        </div>
                        <span className="text-slate-400 text-xs font-mono group-hover:translate-x-1 transition-transform">→</span>
                      </button>

                    </div>

                    {/* Social links handles row */}
                    <div className="flex items-center justify-center gap-6 mt-10 border-t border-slate-800/60 pt-6 select-none">
                      <a href="https://www.instagram.com/SR_Finserv/" target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-800 hover:bg-pink-600 text-slate-300 hover:text-white rounded-xl transition-all" title="Instagram">
                        <Instagram className="w-5 h-5 shrink-0" />
                      </a>
                      <a href="mailto:sanketbhavsar27@gmail.com" className="p-3 bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white rounded-xl transition-all" title="Email Info">
                        <FileText className="w-5 h-5 shrink-0" />
                      </a>
                      <a href="https://maps.google.com/?q=Venus+Atlantis+Corporate+Park+Prahladnagar+Ahmedabad" target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-xl transition-all" title="Head Office Map">
                        <Globe className="w-5 h-5 shrink-0" />
                      </a>
                    </div>

                    <div className="text-center mt-auto pt-8">
                      <p className="text-[10px] text-slate-500 font-mono">
                        &copy; {new Date().getFullYear()} SR Finserv • srfinserv.co
                      </p>
                      <p className="text-[8px] text-slate-600 font-semibold tracking-wider mt-0.5 uppercase">
                        Ahmedabad's Best Doorstep Loans & Legal Partner
                      </p>
                    </div>

                  </div>
                </div>
              </div>

              {/* CO-SANKET PROMOTIONAL TOOLS DASHBOARD PANEL (HIDDEN ON NATIVE MOBILE) */}
              <div className="lg:col-span-7 space-y-6 w-full font-sans">
                
                {/* Visual Section Header */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                  <div className="border-b border-slate-100 pb-5">
                    <h3 className="font-display font-black text-xl text-brand-navy-950 flex items-center gap-2">
                      <span>📱</span> Link-in-Bio Distribution Kit
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Sanket, copy and paste these optimized URLs into your profiles to guide social clients straight to key service checkout nodes.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Link 1: Unified Social Profile */}
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3.5 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-xl pointer-events-none" />
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase font-bold tracking-widest text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full border border-pink-100 font-display">Recommended URL</span>
                        <h4 className="font-display font-bold text-brand-navy-950 text-sm mt-1.5">Instagram / Bio Link</h4>
                        <p className="text-[11px] text-slate-500 leading-normal font-semibold font-sans">This points customers to the mobile-first consolidated bio directory screen.</p>
                      </div>
                      <div className="bg-white px-3.5 py-3 rounded-xl border border-slate-200 font-mono text-xs font-bold text-slate-700 select-all truncate">
                        https://www.srfinserv.co/#links
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText("https://www.srfinserv.co/#links");
                          triggerNotification("URL Copied!", "Copied: https://www.srfinserv.co/#links", "success", false);
                        }}
                        className="w-full bg-slate-900 hover:bg-slate-950 text-white font-extrabold text-xs py-3 rounded-xl transition-all text-center flex items-center justify-center gap-2 shadow-xs cursor-pointer select-none"
                      >
                        Copy Bio Link
                      </button>
                    </div>

                    {/* Link 2: Direct Callback Form */}
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3.5 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#2563eb]/5 rounded-full blur-xl pointer-events-none" />
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase font-bold tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 font-display">Deep Link URL</span>
                        <h4 className="font-display font-bold text-brand-navy-950 text-sm mt-1.5">Direct Inquiry Link</h4>
                        <p className="text-[11px] text-slate-500 leading-normal font-semibold font-sans">Bypasses other panels and takes customers directly to the lead registration form.</p>
                      </div>
                      <div className="bg-white px-3.5 py-3 rounded-xl border border-slate-200 font-mono text-xs font-bold text-slate-700 select-all truncate">
                        https://www.srfinserv.co/#inquire
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText("https://www.srfinserv.co/#inquire");
                          triggerNotification("URL Copied!", "Copied: https://www.srfinserv.co/#inquire", "success", false);
                        }}
                        className="w-full bg-slate-900 hover:bg-slate-950 text-white font-extrabold text-xs py-3 rounded-xl transition-all text-center flex items-center justify-center gap-2 shadow-xs cursor-pointer select-none"
                      >
                        Copy Direct Inquiry Link
                      </button>
                    </div>

                  </div>
                </div>

                {/* Desk/Print-Friendly QR Code Generator Frame */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  <div className="md:col-span-5 flex flex-col items-center col-span-12">
                    <div className="bg-white p-5 rounded-2xl border-2 border-dashed border-slate-200 shadow-md flex flex-col items-center gap-3">
                      <div className="bg-white p-2 border border-slate-100 rounded-xl">
                        <QRCodeSVG 
                          value="https://www.srfinserv.co/#links"
                          size={150}
                          bgColor="#FFFFFF"
                          fgColor="#0B132B"
                          level="H"
                          includeMargin={true}
                        />
                      </div>
                      <span className="text-[10px] font-black text-brand-navy-950 uppercase tracking-widest bg-brand-gold-100 border border-brand-gold-300 px-3 py-1 rounded-full">
                        Scan for SR Finserv
                      </span>
                    </div>
                  </div>

                  <div className="md:col-span-7 space-y-4 text-left col-span-12">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-brand-navy-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">Office Desk Promo</span>
                    <h3 className="font-display font-black text-lg text-brand-navy-950">Print-Ready Desk QR Code</h3>
                    <p className="text-xs text-slate-500 leading-normal font-semibold font-sans">
                      Excellent for offline promotion! Place this desk QR code in your Prahladnagar office or print it on business cards. When Ahmedabad clients scan it, they instantly open your mobile-responsive social bio.
                    </p>
                    <div className="pt-2 flex gap-3 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          window.print();
                        }}
                        className="bg-brand-navy-950 hover:bg-brand-navy-900 text-white font-extrabold text-xs px-4 py-3 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        🖨️ Print Dashboard QR
                      </button>
                    </div>
                  </div>
                </div>

                {/* Integration tutorials on Social Networks */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
                  <h4 className="font-display font-black text-base text-brand-navy-950 font-sans">📋 How to Integrate This Link Into Your Platforms:</h4>
                  
                  <div className="space-y-4">
                    <div className="flex gap-3 text-xs leading-normal font-semibold text-slate-600 font-sans">
                      <div className="w-6 h-6 rounded-lg bg-pink-50 text-pink-600 font-extrabold flex items-center justify-center shrink-0">1</div>
                      <p>
                        <strong className="text-brand-navy-950">Add to your Instagram Bio:</strong> Edit your Instagram profile, click "Links", select "Add External Link", and paste <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-pink-600">https://www.srfinserv.co/#links</code>. Give it the title "SR Finserv Doorstep Advisory".
                      </p>
                    </div>

                    <div className="flex gap-3 text-xs leading-normal font-semibold text-slate-600 font-sans border-t border-slate-100 pt-4">
                      <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 font-extrabold flex items-center justify-center shrink-0">2</div>
                      <p>
                        <strong className="text-brand-navy-950">Add to WhatsApp Business Status & Catalog:</strong> Open WhatsApp settings, select "Business Tools & Profile", click edit under "Website" field, and paste your social bio-link there.
                      </p>
                    </div>

                    <div className="flex gap-3 text-xs leading-normal font-semibold text-slate-600 font-sans border-t border-slate-100 pt-4">
                      <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 font-extrabold flex items-center justify-center shrink-0">3</div>
                      <p>
                        <strong className="text-brand-navy-950">Add to Facebook Page Website:</strong> Navigate to your Page's "About" section and insert the main URL in the website link tab to drive visitor traffic straight into doorstep loan callbacks!
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </main>
      ) : (
        /* STANDARD USER-FACING FRONTEND */
        <>
          {/* HERO BANNER */}
          <section className="relative overflow-hidden bg-white text-brand-navy-950 pt-16 pb-20 md:py-28 border-b border-brand-navy-100">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* Left Header */}
                <div className="lg:col-span-7 space-y-7">
                  {/* Trust Badge */}
                  <div className="inline-flex items-center gap-2.5 bg-blue-50 border border-blue-100 px-4 py-2 rounded-2xl text-brand-navy-700 text-sm font-extrabold shadow-sm">
                    <Award className="w-5 h-5 text-brand-navy-600 shrink-0" />
                    <span>9 Years of Ahmedabad's Best Banking & Legal Mastery (Ahmedabad, Gujarat Only)</span>
                  </div>

                  <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-brand-navy-950 tracking-tight leading-tight animate-fade-in">
                    Premium Financial Consulting & <span className="text-brand-navy-600 font-extrabold">Doorstep Legal</span> Solutions
                  </h1>

                  <p className="text-slate-600 text-lg md:text-xl leading-relaxed max-w-2xl font-semibold">
                    With over nine years of bank loan department operations and document execution experience, <span className="text-brand-navy-600 font-black">SR Finserv</span> offers direct doorstep support for your legal contracts and home financing <span className="text-emerald-700 font-bold">exclusively in Ahmedabad, Gujarat</span>.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4.5 pt-2">
                    <button
                      onClick={() => { setShowInquiryModal(true); }}
                      className="bg-brand-navy-600 hover:bg-brand-navy-800 font-extrabold text-white font-sans px-5.5 py-3 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <span>Inquire Call Back</span>
                      <ArrowRight className="w-4 h-4 animate-pulse" />
                    </button>
                    <button
                      onClick={() => { setActiveTab('about_us'); }}
                      className="bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-200 font-sans px-5.5 py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <UserCheck className="w-4 h-4 text-brand-navy-600" />
                      <span>About Sanket Champaneri</span>
                    </button>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-3 gap-6 pt-10 md:pt-14 border-t border-slate-200 max-w-lg">
                    <div>
                      <div className="text-3xl font-black font-display text-brand-navy-600">9 Yrs</div>
                      <div className="text-slate-500 text-xs font-bold uppercase mt-1">Combined Work</div>
                    </div>
                    <div>
                      <div className="text-3xl font-black font-display text-brand-navy-950">₹15 Cr+</div>
                      <div className="text-slate-500 text-xs font-bold uppercase mt-1">Facilitated</div>
                    </div>
                    <div>
                      <div className="text-3xl font-black font-display text-brand-navy-600">100%</div>
                      <div className="text-slate-500 text-xs font-bold uppercase mt-1">Compliant Support</div>
                    </div>
                  </div>
                </div>

                {/* Right Frame Content - Premium Advisory Calling Card */}
                <div className="lg:col-span-5 bg-gradient-to-br from-brand-navy-950 to-brand-navy-900 border border-brand-navy-800 p-8 sm:p-9 rounded-3xl shadow-xl relative text-white" id="advisor-calling-card">
                  <div className="absolute top-4 right-4 text-[10px] bg-brand-gold-500/20 border border-brand-gold-500/30 text-brand-gold-300 px-3 py-1 rounded-md font-bold uppercase tracking-wider">
                    Privileged Access
                  </div>

                  <div className="space-y-6">
                    <div>
                      <span className="text-3xl">💼</span>
                      <h3 className="font-display font-black text-2xl text-white mt-3 leading-tight">Ahmedabad's Priority Doorstep Consulting</h3>
                      <p className="text-slate-300 text-xs mt-2 leading-relaxed">
                        No banks visits or tedious queues. Since 2017, we have facilitated document verification, direct bank file representation, and compliant notary drafts at your door.
                      </p>
                    </div>

                    <div className="space-y-3.5 pt-3 border-t border-brand-navy-800">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-navy-800 flex items-center justify-center text-sm font-bold text-brand-gold-400">✓</div>
                        <span className="text-xs text-slate-200 font-bold">Exclusively Ahmedabad, Gujarat coverage</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-navy-800 flex items-center justify-center text-sm font-bold text-brand-gold-400">✓</div>
                        <span className="text-xs text-slate-200 font-bold">7+ Years Core Underwriting department insights</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-navy-800 flex items-center justify-center text-sm font-bold text-brand-gold-400">✓</div>
                        <span className="text-xs text-slate-200 font-bold">Hassle-free doorstep collection & sign-off</span>
                      </div>
                    </div>

                    <div className="pt-4 space-y-3">
                      <button
                        onClick={() => setShowInquiryModal(true)}
                        className="w-full bg-brand-gold-500 hover:bg-brand-gold-400 text-brand-navy-950 font-black text-xs py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>📋</span> Open Requirement Form
                      </button>
                      <p className="text-[10px] text-center text-slate-400 font-medium">
                        Alternatively, access via the top-right <strong className="text-slate-300">Three-Line Menu</strong>
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>

          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24" id="services-section">
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
              <span className="text-xs uppercase tracking-widest font-extrabold text-brand-gold-600 block">Premium Expertise Hub</span>
              <h2 className="font-display text-2xl md:text-3.5xl font-extrabold text-brand-navy-950 tracking-tight animate-fade-in">
                Bespoke Doorstep Solutions in Ahmedabad
              </h2>
              <p className="text-sm text-slate-500 font-semibold leading-relaxed">
                Click any core segment directly below to reveal its verified financial services, doorstep stamp registries, and protective asset coverages.
              </p>
            </div>

            {/* Premium Interactive Service Accordions */}
            <div id="services-accordions-group" className="space-y-6">
              {/* Financial & Loans Accordion Card */}
              <div id="accordion-loans" className={`overflow-hidden transition-all duration-300 rounded-3xl border ${
                isLoanExpanded 
                  ? 'bg-blue-50/15 border-blue-300 shadow-md ring-2 ring-blue-500/10' 
                  : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md shadow-xs'
              }`}>
                {/* Header Click Target */}
                <button
                  type="button"
                  id="accordion-loans-trigger"
                  onClick={() => setIsLoanExpanded(!isLoanExpanded)}
                  className="w-full text-left p-6 sm:p-8 flex items-center justify-between cursor-pointer select-none transition-colors hover:bg-slate-50/60"
                >
                  <div className="flex items-center gap-4.5">
                    <div className={`p-3 rounded-2xl border transition-all ${
                      isLoanExpanded 
                        ? 'bg-blue-600 text-white border-blue-500 scale-105' 
                        : 'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                      <Briefcase className="w-6 h-6 shrink-0" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-display font-black text-lg sm:text-xl text-brand-navy-950">
                          Financial & Loan Services
                        </h3>
                        <div className="flex items-center gap-1 text-[10px] text-amber-600 font-black bg-amber-50 border border-amber-100 rounded-md px-2 py-0.5">
                          <Star className="w-3 h-3 fill-brand-gold-500 text-brand-gold-500 shrink-0" />
                          <span>{loanRatings.avg} ({loanRatings.count} reviews)</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 font-semibold mt-1">
                        Direct files representation with leading national banks & NBFCs. Competitive rates from 7.20%.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                      {isLoanExpanded ? 'Hide Options ▴' : 'Click to Expand ▾'}
                    </span>
                    <div className={`w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 transition-transform duration-300 ${isLoanExpanded ? 'rotate-180 bg-blue-100 text-blue-700 border-blue-200' : ''}`}>
                      ▾
                    </div>
                  </div>
                </button>

                {/* Expanded Content Area */}
                {isLoanExpanded && (
                  <div className="border-t border-slate-150 p-6 sm:p-8 bg-white/70 animate-fade-in" id="accordion-loans-content">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      {/* Left Side Info Banner */}
                      <div className="lg:col-span-5 bg-gradient-to-br from-blue-950 to-brand-navy-900 border border-blue-900 text-white p-7 sm:p-8 rounded-2xl shadow-md">
                        <span className="text-3xl">🏦</span>
                        <h4 className="font-display font-black text-xl text-white mt-3 leading-tight font-sans">
                          Why Choose Our Financial Desk?
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed mt-2.5">
                          We bypass exhausting bank loops and standard procedural queues in Gujarat. Our seasoned experts draft and represent direct files with top national and private institutes for maximum success.
                        </p>

                        <div className="space-y-3 border-t border-blue-900/60 pt-4.5 mt-4.5">
                          <div className="flex items-start gap-2.5">
                            <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                            <span className="text-[11.5px] text-slate-205 font-bold font-display">Comprehensive Home & Commercial Loans</span>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                            <span className="text-[11.5px] text-slate-205 font-bold font-display">Fast-tracked approval loops on complex ownership papers</span>
                          </div>
                        </div>

                        <div className="bg-blue-900/40 border border-blue-800 rounded-xl p-3.5 mt-5">
                          <p className="text-[11px] text-blue-200 leading-relaxed font-semibold">
                            💡 <strong>Direct Operations Support:</strong> Over 9 years of bank loan department experience with instant doorstep verification support.
                          </p>
                        </div>
                      </div>

                      {/* Right Side Services Grid */}
                      <div className="lg:col-span-7 space-y-4">
                        <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4">
                          <p className="text-xs text-brand-navy-950 font-bold leading-relaxed flex items-center gap-2">
                            <span>💡</span>
                            <span>Click any active financing catalog below to prefill your doorstep requirement form:</span>
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5" id="loan-items-grid">
                          {LOAN_SERVICES.map((loan) => (
                            <div
                              key={loan.id}
                              id={`loan-srv-${loan.id}`}
                              onClick={() => handlePrefillInquiry('loan', loan.title)}
                              className="group cursor-pointer bg-white p-4.5 rounded-2xl border border-slate-200 hover:border-blue-500 shadow-xs hover:shadow-md transition-all flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform shrink-0">
                                  💵
                                </div>
                                <span className="block font-black text-xs text-brand-navy-950 font-display group-hover:text-blue-600 transition-colors">
                                  {loan.title}
                                </span>
                              </div>
                              <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                                Apply
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Legal & Property Search Accordion Card */}
              <div id="accordion-legal" className={`overflow-hidden transition-all duration-300 rounded-3xl border ${
                isLegalExpanded 
                  ? 'bg-purple-50/15 border-purple-300 shadow-md ring-2 ring-purple-500/10' 
                  : 'bg-white border-slate-200 hover:border-purple-300 hover:shadow-md shadow-xs'
              }`}>
                {/* Header Click Target */}
                <button
                  type="button"
                  id="accordion-legal-trigger"
                  onClick={() => setIsLegalExpanded(!isLegalExpanded)}
                  className="w-full text-left p-6 sm:p-8 flex items-center justify-between cursor-pointer select-none transition-colors hover:bg-slate-55/40"
                >
                  <div className="flex items-center gap-4.5">
                    <div className={`p-3 rounded-2xl border transition-all ${
                      isLegalExpanded 
                        ? 'bg-purple-600 text-white border-purple-500 scale-105' 
                        : 'bg-purple-50 text-purple-700 border-purple-100'
                    }`}>
                      <FileText className="w-6 h-6 shrink-0" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-display font-black text-lg sm:text-xl text-brand-navy-950">
                          Legal Compliance & Document Drafting
                        </h3>
                        <div className="flex items-center gap-1 text-[10px] text-amber-600 font-black bg-amber-50 border border-amber-100 rounded-md px-2 py-0.5">
                          <Star className="w-3 h-3 fill-brand-gold-500 text-brand-gold-500 shrink-0" />
                          <span>{legalRatings.avg} ({legalRatings.count} reviews)</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 font-semibold mt-1">
                        Professional sub-registrar slot planning, title certificate clearance, and doorstep registered notary drafts.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100">
                      {isLegalExpanded ? 'Hide Options ▴' : 'Click to Expand ▾'}
                    </span>
                    <div className={`w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 transition-transform duration-300 ${isLegalExpanded ? 'rotate-180 bg-purple-100 text-purple-700 border-purple-200' : ''}`}>
                      ▾
                    </div>
                  </div>
                </button>

                {/* Expanded Content Area with smooth transition */}
                {isLegalExpanded && (
                  <div className="border-t border-slate-150 p-6 sm:p-8 bg-white/70 animate-fade-in" id="accordion-legal-content">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      {/* Left Side Info Banner */}
                      <div className="lg:col-span-5 bg-gradient-to-br from-purple-950 to-indigo-950 border border-purple-900 text-white p-7 sm:p-8 rounded-2xl shadow-md space-y-5">
                        <div>
                          <span className="text-3xl">📜</span>
                          <h4 className="font-display font-black text-xl text-white mt-3 leading-tight font-sans">
                            Verified Stamp & Drafting Desk
                          </h4>
                          <p className="text-xs text-slate-300 leading-relaxed mt-2.5">
                            Specialized legal draftsmen ready to support your property transfer notarizations and government records search. We ensure solid title verification checks.
                          </p>
                        </div>

                        {/* Doorstep Notary Bullet */}
                        <div className="bg-purple-900/30 border border-purple-800/80 rounded-xl p-4 flex items-start gap-3">
                          <span className="text-base shrink-0 mt-0.5">🖋️</span>
                          <div>
                            <p className="font-bold text-xs text-purple-300 font-display">Doorstep Notary Execution</p>
                            <p className="text-[10.5px] text-slate-300 leading-relaxed font-semibold mt-1">
                              Save hours of standing in municipal queues. We coordinate registered notary slots, stamp duty execution, and sworn affidavits safely at your home.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Right Side Services Grid */}
                      <div className="lg:col-span-7 space-y-4">
                        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                          <p className="text-xs text-brand-navy-950 font-bold leading-relaxed flex items-center gap-2">
                            <span>💡</span>
                            <span>Click any deed template to automatically prefill and review your format specifications:</span>
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5" id="legal-items-grid">
                          {LEGAL_SERVICES.map((legal) => (
                            <div
                              key={legal.id}
                              id={`legal-srv-${legal.id}`}
                              onClick={() => handlePrefillInquiry('legal', legal.title)}
                              className="group cursor-pointer bg-white p-4.5 rounded-2xl border border-slate-200 hover:border-purple-500 shadow-xs hover:shadow-md transition-all flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform shrink-0">
                                  {legal.id === 'sale-deed' && '📜'}
                                  {legal.id === 'rent-agreement' && '🏠'}
                                  {legal.id === 'agreement-to-sale' && '🤝'}
                                  {legal.id === 'power-of-attorney' && '✍️'}
                                  {legal.id === 'affidavit' && '📋'}
                                  {legal.id === 'notary-services' && '🖋️'}
                                </div>
                                <span className="block font-black text-xs text-brand-navy-950 font-display group-hover:text-purple-600 transition-colors">
                                  {legal.title}
                                </span>
                              </div>
                              <span className="text-[9px] font-black text-purple-600 bg-purple-50 px-2.5 py-1.5 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-all shrink-0">
                                Draft
                              </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Comprehensive Asset Protection & Insurance Section Accordion Card */}
            <div id="accordion-insurance" className={`overflow-hidden transition-all duration-300 rounded-3xl border ${
              isInsuranceExpanded 
                ? 'bg-emerald-50/20 border-emerald-300 shadow-md ring-2 ring-emerald-500/10' 
                : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-md shadow-xs'
            }`}>
              {/* Header Click Target */}
              <button
                type="button"
                id="accordion-insurance-trigger"
                onClick={() => setIsInsuranceExpanded(!isInsuranceExpanded)}
                className="w-full text-left p-6 sm:p-8 flex items-center justify-between cursor-pointer select-none transition-colors hover:bg-slate-55/40"
              >
                <div className="flex items-center gap-4.5">
                  <div className={`p-3 rounded-2xl border transition-all ${
                    isInsuranceExpanded 
                      ? 'bg-emerald-600 text-white border-emerald-500 scale-105' 
                      : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  }`}>
                    <Shield className="w-6 h-6 shrink-0" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-display font-black text-lg sm:text-xl text-brand-navy-950">
                        Asset Protection & Insurance Solutions
                      </h3>
                      <div className="flex items-center gap-1 text-[10px] text-amber-600 font-black bg-amber-50 border border-amber-100 rounded-md px-2 py-0.5">
                        <Star className="w-3 h-3 fill-brand-gold-500 text-brand-gold-500 shrink-0" />
                        <span>{insuranceRatings.avg} ({insuranceRatings.count} reviews)</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 font-semibold mt-1">
                      Term policies, commercial asset shields, and health underwriting with leading Indian coverage networks.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                    {isInsuranceExpanded ? 'Hide Options ▴' : 'Click to Expand ▾'}
                  </span>
                  <div className={`w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 transition-transform duration-300 ${isInsuranceExpanded ? 'rotate-180 bg-emerald-100 text-emerald-700 border-emerald-250' : ''}`}>
                    ▾
                  </div>
                </div>
              </button>

              {/* Expanded Content Area with smooth transition */}
              {isInsuranceExpanded && (
                <div className="border-t border-slate-150 p-6 sm:p-8 bg-white/70 animate-fade-in" id="accordion-insurance-content">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Side Info Banner */}
                    <div className="lg:col-span-5 bg-gradient-to-br from-emerald-950 to-slate-900 border border-emerald-900 text-white p-7 sm:p-8 rounded-2xl shadow-md">
                      <span className="text-3xl">🛡️</span>
                      <h4 className="font-display font-black text-xl text-white mt-3 leading-tight font-sans">
                        Sovereign Protection Advisory
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed mt-2.5">
                        Protect your hard-earned investments with comprehensive premium insurance plans. Partnered directly with high claims-ratio operators in India to align terms with your active financial profile.
                      </p>

                      <div className="space-y-3.5 border-t border-emerald-900/60 pt-4.5 mt-4.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-emerald-400 font-bold shrink-0">✓</span>
                          <span className="text-xs text-slate-200 font-bold font-display">Comprehensive term & home loan coverage shields</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-emerald-400 font-bold shrink-0">✓</span>
                          <span className="text-xs text-slate-200 font-bold font-display">Doorstep documentation collection & claims tracking</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Side Services Grid */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                        <p className="text-xs text-brand-navy-950 font-bold leading-relaxed flex items-center gap-2">
                          <span>💡</span>
                          <span>Click any coverage configuration below to request direct premium quotation:</span>
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5" id="insurance-items-grid">
                        {INSURANCE_SERVICES.map((ins) => (
                          <div
                            key={ins.id}
                            id={`ins-srv-${ins.id}`}
                            onClick={() => handlePrefillInquiry('insurance', ins.title)}
                            className="group cursor-pointer bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 shadow-xs hover:shadow-md transition-all flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform shrink-0">
                                {ins.id === 'general-insurance' ? '🛡️' : '❤️'}
                              </div>
                              <span className="block font-black text-xs text-brand-navy-950 font-display group-hover:text-emerald-600 transition-colors">
                                {ins.title}
                              </span>
                            </div>
                            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0">
                              Protect
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

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

                {/* Aggregate overall rating badge */}
                <div className="flex items-center justify-center gap-2 pt-2">
                  <div className="flex bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2 items-center gap-2.5 shadow-xs">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3.5 h-3.5 fill-brand-gold-500 text-brand-gold-500" />
                      ))}
                    </div>
                    <div className="h-4 w-px bg-amber-200" />
                    <span className="text-xs font-bold text-brand-navy-950">
                      Satisfaction Rating: <span className="text-amber-600 font-extrabold">{overallStats.avg}</span> / 5.0 ({overallStats.count} Verified Reviews)
                    </span>
                  </div>
                </div>
              </div>

              {/* Testimonials grid */}
              {testimonials.filter(t => t.status === 'Approved').length === 0 ? (
                <div className="text-center py-12 bg-white/70 rounded-3xl border border-dashed border-brand-navy-200 p-8 max-w-xl mx-auto shadow-sm">
                  <p className="text-slate-500 text-sm font-medium">
                    No verified reviews published yet. Be the first to share your experience using the client feedback desk below!
                  </p>
                </div>
              ) : (
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
                        <div className="relative pt-2">
                          <span className="absolute -top-3.5 -left-1.5 text-4xl text-brand-gold-300 font-serif select-none opacity-50">“</span>
                          <p className="text-slate-850 text-[13.5px] leading-relaxed font-semibold italic font-sans relative z-10 pl-1">
                            "{item.testimonialText}"
                          </p>
                        </div>

                        {/* Advisor Reply Speech Bubble */}
                        {item.advisorReply && (
                          <div className="mt-3.5 p-2.5 bg-slate-50/75 border border-slate-100 rounded-2xl text-[10px] text-slate-500 space-y-1 relative">
                            <div className="absolute -top-1.5 left-5 w-3 h-3 bg-slate-50/75 border-t border-l border-slate-100 rotate-45" />
                            <div className="flex items-center gap-1.5">
                              <div className="w-4 h-4 rounded-full bg-brand-navy-850 flex items-center justify-center text-[7px] text-white font-extrabold shrink-0">
                                S
                              </div>
                              <span className="font-bold text-brand-navy-900 text-[9px]">Sanket Champaneri</span>
                              <span className="px-1 py-0.5 rounded-sm bg-brand-navy-50 text-[7px] text-brand-navy-700 font-bold uppercase tracking-wider">Advisor</span>
                            </div>
                            <p className="italic pl-5.5 font-medium leading-relaxed text-slate-500">
                              "{item.advisorReply}"
                            </p>
                          </div>
                        )}
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
              )}

              {/* Feedbacks Submit segment */}
              <div className="mt-16 max-w-3xl mx-auto bg-white text-brand-navy-900 rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-xl border border-brand-navy-100">
                <div className="absolute top-0 right-0 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-brand-navy-100 pb-5">
                    <div>
                      <h3 className="font-display font-black text-lg text-brand-navy-900">Customer Satisfaction Ratings</h3>
                      <p className="text-xs text-slate-500 mt-1 font-semibold">Submit your testimonial block. Your experience helps hundreds of local property buyers.</p>
                    </div>
                    <span className="bg-blue-50 border border-blue-200 text-brand-navy-700 px-3 py-1.5 rounded-xl font-bold font-mono text-[9px] uppercase tracking-wider">
                      Client Feedback Desk
                    </span>
                  </div>

                  {/* Privacy Guard Assurance */}
                  <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-2xl p-4 text-[11px] text-emerald-950 flex items-start gap-3">
                    <span className="text-base shrink-0">🛡️</span>
                    <div className="space-y-1">
                      <p className="font-bold text-emerald-800">Airtight Privacy Guard Enabled</p>
                      <p className="text-slate-600 leading-normal">
                        To maintain secure and trustworthy feedback, we <strong>do not collect, require, or display</strong> your mobile number, email, or any other contact details here. Only your preferred display name, selected stars rating, and satisfaction remarks will showcase publicly.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleTestimonialSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name input */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-brand-navy-800 block">Your Name (Optional)</label>
                        <input
                          type="text"
                          className="w-full text-xs px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-250 text-brand-navy-950 focus:bg-white focus:outline-none focus:border-brand-navy-600 font-semibold"
                          placeholder="Leave blank to submit anonymously"
                          value={newTestimonialName}
                          onChange={(e) => setNewTestimonialName(e.target.value)}
                        />
                      </div>

                      {/* Dropdown list of services */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-brand-navy-800 block">Service Acquired</label>
                        <select
                          className="w-full text-xs px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-250 text-brand-navy-950 focus:bg-white focus:outline-none focus:border-brand-navy-600 font-semibold"
                          value={newTestimonialService}
                          onChange={(e) => setNewTestimonialService(e.target.value)}
                        >
                          <optgroup label="💼 LOANS DEPARTMENT">
                            <option value="Home Loans">🏠 Home Loans</option>
                            <option value="Business Loan">💼 Business Loan</option>
                            <option value="Personal Loans">💳 Personal Loans</option>
                            <option value="Project Loan">🏗️ Project Loan</option>
                            <option value="Working Capital">⚙️ Working Capital Limit</option>
                          </optgroup>
                          
                          <optgroup label="🛡️ INSURANCE DEPARTMENT">
                            <option value="General Insurance">🚗 General Asset & Commercial Insurance</option>
                            <option value="Life Insurance">❤️ Term & Mortgage Life Insurance</option>
                          </optgroup>

                          <optgroup label="⚖️ LEGAL DEPARTMENT">
                            <option value="Sale Deed">📜 Sale Deed Drafting & Execution</option>
                            <option value="Rent Agreement">🤝 Rent & Lease Agreement Drafting</option>
                            <option value="Agreement to Sale">📝 Agreement to Sale Preparation</option>
                            <option value="Power of Attorney">👤 Power of Attorney (GPA/SPA)</option>
                            <option value="Affidavit">🖋️ Sworn Affidavit & Self-Declaration</option>
                            <option value="Notary Services">🏛️ Doorstep Notary Public Services</option>
                          </optgroup>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      {/* Star Rating select */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase tracking-rose font-bold text-brand-navy-800 block">Rating score</span>
                        <div className="flex gap-2.5 items-center">
                          {[1, 2, 3, 4, 5].map((stars) => (
                            <button
                              key={stars}
                              type="button"
                              onClick={() => setNewTestimonialRating(stars)}
                              className="focus:outline-none text-2xl transition-transform hover:scale-125"
                            >
                              <span className={stars <= newTestimonialRating ? 'text-brand-gold-500' : 'text-slate-350'}>★</span>
                            </button>
                          ))}
                          <span className="text-xs text-brand-navy-600 font-bold ml-2">({newTestimonialRating}/5 Stars)</span>
                        </div>
                      </div>

                      {/* Name display permission checkbox */}
                      <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <input
                          id="newTestimonialPermission"
                          type="checkbox"
                          className="w-4.5 h-4.5 accent-brand-navy-600 cursor-pointer rounded-md"
                          checked={newTestimonialPermission}
                          onChange={(e) => setNewTestimonialPermission(e.target.checked)}
                        />
                        <label htmlFor="newTestimonialPermission" className="text-[11px] text-slate-600 cursor-pointer font-medium select-none">
                          I consent to display my name publicly with this review.
                        </label>
                      </div>
                    </div>

                    {/* Testimonial message textbox */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-brand-navy-800 block">Write Testimonial Statement</label>
                      <textarea
                        rows={3}
                        required
                        className="w-full text-xs p-3.5 rounded-xl bg-slate-50 border border-slate-250 text-brand-navy-950 focus:bg-white focus:outline-none focus:border-brand-navy-600 font-semibold"
                        placeholder="Describe your satisfaction with Sanket's legal document reports or loan approvals speed..."
                        value={newTestimonialText}
                        onChange={(e) => setNewTestimonialText(e.target.value)}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-brand-navy-600 hover:bg-brand-navy-800 text-white font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-md mt-4"
                    >
                      Publish Review Live
                    </button>
                  </form>

                  {testimonialSubmitted && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-950 text-xs flex items-center gap-2.5">
                      <CheckCircle className="w-4 h-4 shrink-0 text-green-600" />
                      <div>
                        <p className="font-bold">Testimonial added instantly!</p>
                        <p className="text-[11px] text-green-800">Thank you. Your feedback is published live in our visual grid and stored locally.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </section>

        </>
      )}

      {/* FOOTER CONTACT ROW */}
      <footer className="mt-auto bg-slate-50 text-slate-600 border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 pb-12 border-b border-slate-200">
          
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-navy-600 rounded-lg flex items-center justify-center border border-slate-200">
                <span className="font-display font-black text-lg text-white">SR</span>
              </div>
              <div>
                <span className="font-display text-lg font-black text-brand-navy-950 block">SR Finserv</span>
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-brand-navy-600 block -mt-1">
                  Legal & Loans Advisory
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Serving property developers, individual buyers, and aspiring business entrepreneurs exclusively in Ahmedabad, Gujarat, with over nine combined years of major bank loan officer expertise and active doorstep legal solutions.
            </p>
          </div>

          <div className="md:col-span-4 space-y-4">
            <h4 className="font-display font-black text-sm text-brand-navy-950 uppercase tracking-wider">Services Coverage</h4>
            <ul className="text-xs space-y-2.5">
              <li>
                <button
                  onClick={() => {
                    setActiveTab('services');
                    setActiveServiceSubTab('loan');
                    setIsLoanExpanded(true);
                    setIsCrmMode(false);
                    setTimeout(() => {
                      const el = document.getElementById('services-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="hover:text-brand-navy-600 transition-colors text-left font-semibold"
                >
                  Residential Home Loans (Starting @ 7.20%)
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('services');
                    setActiveServiceSubTab('loan');
                    setIsLoanExpanded(true);
                    setIsCrmMode(false);
                    setTimeout(() => {
                      const el = document.getElementById('services-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="hover:text-brand-navy-600 transition-colors text-left font-semibold"
                >
                  Mortgage Loans / LAP (Starting @ 8.70%)
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('services');
                    setActiveServiceSubTab('legal');
                    setIsLegalExpanded(true);
                    setIsCrmMode(false);
                    setTimeout(() => {
                      const el = document.getElementById('services-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="hover:text-brand-navy-600 transition-colors text-left font-semibold"
                >
                  Mother Deed 30-Year Title Search Reports
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('services');
                    setActiveServiceSubTab('legal');
                    setIsLegalExpanded(true);
                    setIsCrmMode(false);
                    setTimeout(() => {
                      const el = document.getElementById('services-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="hover:text-brand-navy-600 transition-colors text-left font-semibold"
                >
                  Sub-Registrar Slot Booking Support
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-4">
            <h4 className="font-display font-black text-sm text-brand-navy-950 uppercase tracking-wider">Direct Business Support</h4>
            <div className="space-y-3 pt-1 text-sm font-semibold text-slate-600">
              <div className="flex items-start gap-2.5">
                <span className="text-slate-500 shrink-0 mt-0.5">📍</span>
                <span className="text-slate-600 leading-relaxed font-semibold">
                  87, Venus Alfa Market, Venus Atlantis, Near Shell Petrol Pump, Prahladnagar, Ahmedabad - 380015
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-slate-500 shrink-0">📞</span>
                <a href="tel:+918487974404" className="text-brand-navy-600 font-extrabold hover:underline">
                  +91 84879 74404
                </a>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-slate-500 shrink-0">✉️</span>
                <a href="mailto:sanketbhavsar27@gmail.com" className="text-brand-navy-600 font-extrabold hover:underline">
                  sanketbhavsar27@gmail.com
                </a>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-slate-500 shrink-0 mt-0.5">📸</span>
                <a href="https://www.instagram.com/SR_Finserv/" target="_blank" rel="noopener noreferrer" className="text-pink-600 font-extrabold hover:underline flex items-center gap-1.5">
                  <Instagram className="w-3.5 h-3.5" />
                  @SR_Finserv
                </a>
              </div>
              <div className="flex items-start gap-2.5 bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl shadow-xs">
                <span className="text-slate-600 shrink-0">⚡</span>
                <span className="text-brand-navy-700 font-bold">Callback SLA: 2 Hours Guaranteed Call Back</span>
              </div>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-semibold">
          <div>
            &copy; {new Date().getFullYear()} SR Finserv. All Rights Reserved.
          </div>
          <div className="flex gap-4 font-mono text-[10px] text-slate-400 items-center">
            <span>Founded by Sanket Champaneri</span>
            <span>•</span>
            <span 
              className="cursor-default select-none hover:text-slate-500 transition-colors"
              onClick={() => {
                const nextCount = footerClickCount + 1;
                if (nextCount >= 5) {
                  triggerCrmPortalLogin();
                } else {
                  setFooterClickCount(nextCount);
                }
              }}
              title="State encryption status active"
            >
              Secure SSL Encrypted
            </span>
          </div>
        </div>
      </footer>

      {/* Toast Notification Deck */}
      <div className="fixed top-6 right-6 z-[99999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.15)] border border-slate-100 p-4 flex gap-3 transform translate-y-0 opacity-100 transition-all duration-300 relative overflow-hidden"
          >
            {/* Status indicators */}
            <div className={`w-1.5 absolute left-0 top-0 bottom-0 ${
              toast.type === 'success' ? 'bg-emerald-500' :
              toast.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
            }`} />
            
            <div className="p-1 rounded-full bg-slate-50 shrink-0 self-start">
              {toast.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-500" />
              )}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800">{toast.title}</span>
                <span className="text-[9px] font-mono text-slate-400">Just now</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">{toast.message}</p>
              
              {toast.isEmail && (
                <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center gap-1.5 text-[9px] font-mono text-emerald-600 font-extrabold bg-[#ecfdf5]/80 p-1 rounded-sm">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>DISPATCHED TO: {advisorEmail}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="text-slate-400 hover:text-slate-600 shrink-0 self-start"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

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
          <span className="w-1.5 h-1.5 rounded-full bg-[#0ea5e9] animate-ping" />
          <span>Sanket is Online</span>
        </div>

        <a
          id="whatsapp-fab"
          href="https://wa.me/918487974404?text=Hello%20Sanket%20%40%20SR%20Finserv%2C%20I%20have%20an%20inquiry%20regarding%20property%20legal%20documents%20/%20loans."
          target="_blank"
          referrerPolicy="no-referrer"
          rel="noopener noreferrer"
          className="group pointer-events-auto flex items-center gap-2.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white p-3.5 sm:px-4 sm:py-3.5 rounded-full shadow-[0_12px_36px_rgba(14,165,233,0.4)] hover:shadow-[0_16px_40px_rgba(14,165,233,0.6)] transform hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-300 md:w-auto"
          title="Chat with Sanket Champaneri on WhatsApp"
        >
          {/* Pulsing state ring */}
          <span className="absolute inset-0 rounded-full border-2 border-[#0ea5e9] animate-ping opacity-25" />
          
          <MessageCircle className="w-6 h-6 shrink-0 fill-white text-[#0ea5e9] group-hover:rotate-12 transition-transform duration-300" />
          
          <div className="hidden sm:flex flex-col items-start leading-none pr-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-sky-100 leading-none">Instant Support</span>
            <span className="text-xs font-extrabold text-white mt-0.5 font-sans">Chat on WhatsApp</span>
          </div>

          {/* Sparkle micro accent */}
          <Sparkles className="w-3.5 h-3.5 text-white/80 hidden sm:inline-block animate-pulse shrink-0" />
        </a>
      </div>

      {/* ADVISOR CRM SECURE LOGIN MODAL */}
      {showCrmLoginModal && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" 
            onClick={() => setShowCrmLoginModal(false)}
          />
          
          {/* Modal Container */}
          <div className="relative bg-white border border-slate-200/80 w-full max-w-md rounded-3xl shadow-[0_24px_50px_rgba(15,23,42,0.18)] p-6 sm:p-8 overflow-hidden animate-[scaleIn_0.25s_ease-out]">
            {/* Header Lock Icon Ring */}
            <div className="flex flex-col items-center text-center space-y-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-brand-navy-600 shadow-xs">
                <Lock className="w-6 h-6 text-brand-navy-600 animate-[pulse_2s_infinite]" />
              </div>
              <div>
                <h3 className="font-display text-xl font-extrabold text-brand-navy-950">Advisor Security Portal</h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  Private Access for Sanket Champaneri (SR Finserv)
                </p>
              </div>
            </div>

            {/* Input Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                // Check passcode
                if (crmPasscodeInput === '8487' || crmPasscodeInput === '2712') {
                  setIsCrmAuthenticated(true);
                  setIsCrmMode(true);
                  setShowCrmLoginModal(false);
                  setCrmPasscodeInput('');
                  setCrmLoginError('');
                  // Show success toast
                  const id = Date.now();
                  setToasts(prev => [
                    ...prev, 
                    { 
                      id, 
                      title: 'Welcome back, Advisor!', 
                      message: 'Secure CRM Portal successfully unlocked.', 
                      type: 'success' 
                    }
                  ]);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  setCrmLoginError('Incorrect PIN code. Please try again.');
                  setCrmPasscodeInput('');
                }
              }}
              className="space-y-5"
            >
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block text-center">
                  Enter 4-Digit Advisor PIN
                </label>
                <input
                  type="password"
                  placeholder="••••"
                  maxLength={4}
                  value={crmPasscodeInput}
                  onChange={(e) => {
                    // Only accept numbers
                    const val = e.target.value.replace(/\D/g, '');
                    setCrmPasscodeInput(val);
                    if (crmLoginError) setCrmLoginError('');
                  }}
                  className="w-full text-center text-3xl font-mono tracking-widest p-3 bg-slate-50 rounded-2xl border-2 border-slate-200/80 text-brand-navy-950 focus:border-brand-navy-600 focus:bg-white outline-none transition-all"
                  autoFocus
                  required
                />
              </div>

              {crmLoginError && (
                <p className="text-xs text-rose-500 font-bold text-center bg-rose-50 border border-rose-100 p-2.5 rounded-xl">
                  ⚠️ {crmLoginError}
                </p>
              )}

              <p className="text-[10px] text-slate-400 font-medium text-center leading-relaxed">
                Authorized device logging is active. Unrecognized login attempts are recorded for compliance audit.
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCrmLoginModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-navy-950 hover:bg-brand-navy-900 text-white py-3 rounded-xl font-bold text-xs shadow-xs transition-colors"
                >
                  Unlock Portal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROFESSIONAL DOCUMENT CHECKLIST MODAL */}
      {showDocumentChecklistModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity duration-300" 
            onClick={() => setShowDocumentChecklistModal(false)}
          />
          
          {/* Modal Container */}
          <div className="relative bg-white border border-slate-200/80 w-full max-w-4xl rounded-3xl shadow-[0_24px_50px_rgba(15,23,42,0.22)] flex flex-col max-h-[90vh] overflow-hidden animate-[scaleIn_0.25s_ease-out]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <FileCheck className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-extrabold text-brand-navy-950">
                    Smart Mortgage & Document Planner
                  </h3>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    Interactive checklists tailored by Sanket Champaneri to align with banking standards
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDocumentChecklistModal(false)}
                className="w-10 h-10 rounded-xl bg-white border border-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all cursor-pointer shadow-xs active:scale-95"
                title="Close Checklist"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - Scrollable container for LoanChecklistDownload */}
            <div className="flex-1 overflow-y-auto p-6 bg-white shrink-min">
              <div className="pb-4 mb-4 border-b border-slate-100 text-xs text-slate-500 leading-relaxed font-semibold">
                📋 <strong>Advisor Recommendation:</strong> Please select your loan profile, employment structure, and target banks to view required document requirements. You can tick verified documents and download the checklist as a personalized PDF.
              </div>
              <LoanChecklistDownload />
            </div>

            {/* Modal Footer */}
            <div className="p-4.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-400 shrink-0">
              <span>SR Finserv • Ahmedabad, Gujarat</span>
              <button
                onClick={() => setShowDocumentChecklistModal(false)}
                className="px-4 py-2 bg-brand-navy-950 hover:bg-brand-navy-900 text-white font-sans text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER REQUIREMENT FORM MODAL */}
      {showInquiryModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity duration-300" 
            onClick={() => setShowInquiryModal(false)}
          />
          
          {/* Modal Container */}
          <div className="relative bg-white border border-slate-200/80 w-full max-w-lg rounded-3xl shadow-[0_24px_50px_rgba(15,23,42,0.22)] flex flex-col max-h-[90vh] overflow-hidden animate-[scaleIn_0.25s_ease-out]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-105 flex items-center justify-center text-[#2563eb]">
                  <PhoneCall className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display text-base font-extrabold text-brand-navy-950">
                    Customer Requirement Details
                  </h3>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                    Priority Doorstep Advisory Signup
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInquiryModal(false)}
                className="w-10 h-10 rounded-xl bg-white border border-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all cursor-pointer shadow-xs active:scale-95"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-white shrink-min">
              <p className="text-xs text-slate-600 mb-5 font-semibold">
                Please enter your requirements below. Founded by <strong className="text-brand-navy-900">Sanket Champaneri</strong>, we evaluate underwritings tailored strictly to your profile at your doorstep in Ahmedabad, Gujarat.
              </p>

              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Name</label>
                  <input
                    type="text"
                    required
                    className="w-full text-sm px-4 py-3 bg-white border border-slate-200 text-brand-navy-950 focus:outline-none focus:border-brand-navy-600 shadow-xs font-semibold rounded-xl"
                    placeholder="e.g. Sanket Champaneri"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Mo. Number</label>
                  <input
                    type="tel"
                    required
                    className="w-full text-sm px-4 py-3 bg-white border border-slate-200 text-brand-navy-950 focus:outline-none focus:border-brand-navy-600 shadow-xs font-semibold rounded-xl"
                    placeholder="e.g. +91 84879 74404"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Email id</label>
                  <input
                    type="email"
                    required
                    className="w-full text-sm px-4 py-3 bg-white border border-slate-200 text-brand-navy-950 focus:outline-none focus:border-brand-navy-600 shadow-xs font-semibold rounded-xl"
                    placeholder="e.g. sanketbhavsar27@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Requirement</label>
                  <select
                    className="w-full text-sm px-4 py-3 bg-white border border-slate-200 text-brand-navy-950 focus:outline-none focus:border-brand-navy-600 shadow-xs font-semibold rounded-xl"
                    value={formData.requirement}
                    onChange={(e) => setFormData({ ...formData, requirement: e.target.value as any })}
                  >
                    <option value="Loan services">Loan services</option>
                    <option value="Insurance services">Insurance services</option>
                    <option value="Legal services">Legal services</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-navy-600 hover:bg-brand-navy-800 text-white font-black text-sm py-3.5 rounded-xl transition-all shadow-md mt-6 cursor-pointer"
                >
                  Submit Customer Requirement
                </button>
              </form>

              {formSubmitted && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-950 text-xs flex items-start gap-2.5 animate-fade-in">
                  <CheckCircle className="w-5 h-5 shrink-0 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm">Inquiry logged successfully!</p>
                    <p className="text-green-800 mt-1 font-medium leading-relaxed font-sans">
                      We have logged your request. Sanket Champaneri or our doorstep legal specialist will call you back within 2 hours.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-400 shrink-0">
              <span>9 Years Experience • Ahmedabad Only</span>
              <button
                onClick={() => setShowInquiryModal(false)}
                className="px-4 py-2 bg-brand-navy-950 hover:bg-brand-navy-900 text-white font-sans text-xs font-bold rounded-xl transition-all shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FREQUENTLY ASKED QUESTIONS MODAL */}
      {showFaqModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity duration-300" 
            onClick={() => setShowFaqModal(false)}
          />
          
          {/* Modal Container */}
          <div className="relative bg-white border border-slate-200/80 w-full max-w-2xl rounded-3xl shadow-[0_24px_50px_rgba(15,23,42,0.22)] flex flex-col max-h-[85vh] overflow-hidden animate-[scaleIn_0.25s_ease-out]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-extrabold text-brand-navy-950">
                    Frequently Asked Questions (FAQs)
                  </h3>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                    Loans, Stamp Duty & Registration Guide
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFaqModal(false)}
                className="w-10 h-10 rounded-xl bg-white border border-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all cursor-pointer shadow-xs active:scale-95"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/40">
              <p className="text-xs text-slate-500 font-medium leading-relaxed mb-1">
                Have questions about loan requirements, underwriting guidelines, doorstep processing, or property registration and notarization laws in Gujarat? Browse through our compiled advisory answers below.
              </p>

              <div className="space-y-3">
                {FAQS.map((faq, index) => {
                  const isOpen = faqOpenIndex === index;
                  return (
                    <div
                      key={index}
                      className="border border-slate-200/70 rounded-2xl bg-white p-4 transition-all shadow-xs hover:border-blue-200"
                    >
                      <button
                        type="button"
                        onClick={() => setFaqOpenIndex(isOpen ? null : index)}
                        className="w-full flex justify-between items-center text-left font-display font-semibold text-brand-navy-950 text-sm md:text-[14px] focus:outline-none"
                      >
                        <span className="pr-4">{faq.question}</span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-brand-gold-600 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </button>
                      
                      {isOpen && (
                        <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 leading-relaxed font-sans font-medium">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-400 shrink-0">
              <span>Verified Legal Advisory Services</span>
              <button
                onClick={() => setShowFaqModal(false)}
                className="px-4 py-2 bg-brand-navy-950 hover:bg-brand-navy-900 text-white font-sans text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
