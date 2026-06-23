import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Shield,
  HelpCircle,
  Briefcase,
  FileText,
  User,
  Users,
  Search,
  CheckCircle,
  X,
  Award,
  Lock,
  ArrowRight,
  Phone,
  Star,
  ThumbsUp,
  ThumbsDown,
  Menu,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  FileCheck,
  Check,
  Instagram
} from 'lucide-react';
import { LOAN_SERVICES, LEGAL_SERVICES, INSURANCE_SERVICES, FAQS } from './data';
import { InquiryLead, LeadType, ClientTestimonial, VisitorBookEntry } from './types';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import LoanChecklistDownload from './components/LoanChecklistDownload';
import EMICalculator from './components/EMICalculator';
import EligibilityChecker from './components/EligibilityChecker';

const fallbackTestimonials: ClientTestimonial[] = [
  {
    id: 'fallback-1',
    clientName: 'Kirtan Mehta',
    serviceUsed: 'Home Loans',
    testimonialText: "Ahmedabad's best home loans assistance. Sanket verified my Prahladnagar documents directly at my home. Sanctions approved from national banks under 4 days without any direct branch hopping!",
    rating: 5,
    status: 'Approved',
    createdAt: new Date().toISOString(),
    likes: 5,
    hasPermission: true
  },
  {
    id: 'fallback-2',
    clientName: 'Viral Shah',
    serviceUsed: 'Sale Deed Conveyance',
    testimonialText: "Got my Sale Deed draft completed and notary registered at my site office. Super legal execution. Absolutely hassle free conveyancing with zero queues.",
    rating: 5,
    status: 'Approved',
    createdAt: new Date().toISOString(),
    likes: 3,
    hasPermission: true
  },
  {
    id: 'fallback-3',
    clientName: 'Saurabh Patel',
    serviceUsed: 'Business CC Limit',
    testimonialText: "Highly technical underwriting insights. Bypassed complicated legal gaps in my enterprise paperwork for commercial limits. Excellent job, Sanket.",
    rating: 5,
    status: 'Approved',
    createdAt: new Date().toISOString(),
    likes: 8,
    hasPermission: true
  }
];

const getAutoReplyForRating = (rating: number, clientName: string) => {
  const replies: Record<number, string> = {
    5: `Thank you, ${clientName}! Delivering premium doorstep convenience and making files easy to understand is our core mission. Glad I could assist you with your advisory files! - Sanket Champaneri (Director, SR Finserv)`,
    4: `Thank you so much, ${clientName}! We appreciate your high trust in SR Finserv. We are always working to make documentation and legal representation as simple as possible. - Sanket Champaneri`,
    3: `Thank you for your review, ${clientName}. We strictly audit our processes based on your rating feedback to ensure our doorstep services remain top-tier. - Sanket Champaneri`
  };
  return replies[rating] || `Thank you for your valuable feedback, ${clientName}! We are committed to securing your file and legacy. - Sanket Champaneri`;
};

export default function App() {
  // Navigation structure
  const [activeTab, setActiveTab] = useState<'home' | 'services' | 'checklist' | 'story' | 'contact' | 'reviews'>('home');
  const [servicesCategoryFilter, setServicesCategoryFilter] = useState<'all' | 'loan' | 'legal' | 'insurance'>('all');
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);
  const [complianceSubTab, setComplianceSubTab] = useState<'checklist' | 'eligibility' | 'emi'>('checklist');

  // States for live telemetry, testimonials & inquiries
  const [testimonials, setTestimonials] = useState<ClientTestimonial[]>([]);
  const [customReplies, setCustomReplies] = useState<Record<string, string>>({});
  const [editingCustomReplyId, setEditingCustomReplyId] = useState<string | null>(null);
  const [customReplyTexts, setCustomReplyTexts] = useState<Record<string, string>>({});
  const [leads, setLeads] = useState<InquiryLead[]>([]);
  const [visitorLog, setVisitorLog] = useState<VisitorBookEntry[]>([]);
  
  // CRM mode for Sanket Champaneri inside workspace
  const [isCrmMode, setIsCrmMode] = useState<boolean>(false);
  
  // Active state notifications
  const [toasts, setToasts] = useState<{ id: string; title: string; message: string; type: 'success' | 'warning' | 'info' }[]>([]);

  // Hamburger status on mobile
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prefill dynamic assistance form state
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    requirement: 'Loan services' as 'Loan services' | 'Insurance services' | 'Legal services',
    details: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submittedMailtoUrl, setSubmittedMailtoUrl] = useState<string>('');
  const [submittedWhatsappUrl, setSubmittedWhatsappUrl] = useState<string>('');
  
  // Custom states for financial/loan turn-by-turn question wizard
  const [loanStep, setLoanStep] = useState<number>(0);
  const [loanAmount, setLoanAmount] = useState<string>('');
  const [loanArea, setLoanArea] = useState<string>('');

  // Add Testimonial State
  const [newTestimonial, setNewTestimonial] = useState({
    clientName: '',
    serviceUsed: 'Home Loans',
    testimonialText: '',
    rating: 5,
    hasPermission: true
  });
  const [testimonialSubmitted, setTestimonialSubmitted] = useState(false);

  // Selected lead in CRM details drawer
  const [selectedLeadForEdit, setSelectedLeadForEdit] = useState<InquiryLead | null>(null);
  const [localNoteText, setLocalNoteText] = useState('');

  // Synchronize local notes value whenever selected lead shifts
  useEffect(() => {
    setLocalNoteText(selectedLeadForEdit?.notes || '');
  }, [selectedLeadForEdit]);

  const [crmTypeFilter, setCrmTypeFilter] = useState<'all' | 'loan' | 'legal' | 'insurance'>('all');
  const [crmSearchQuery, setCrmSearchQuery] = useState('');
  const [crmStatusFilter, setCrmStatusFilter] = useState<'all' | 'New' | 'active' | 'resolved'>('all');

  // Visitor direct 1-click details state (persisted)
  const [visitorContact, setVisitorContact] = useState<{ fullName: string; phone: string; email: string } | null>(() => {
    try {
      const saved = localStorage.getItem('sr_finserv_visitor_contact');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Modal context when customer selects a specific service card
  const [inbuiltDirectModal, setInbuiltDirectModal] = useState<{
    isOpen: boolean;
    type: LeadType;
    title: string;
  } | null>(null);

  // Selected service tracker to make clicks fully visible on page
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  // Form input states inside direct connect modal
  const [modalFormData, setModalFormData] = useState({ fullName: '', phone: '', email: '' });

  // Floating WhatsApp assistance status
  const [showWhatsappFab, setShowWhatsappFab] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setShowWhatsappFab(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Hash routing triggers
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#services') {
        setActiveTab('services');
      } else if (hash === '#checklist') {
        setActiveTab('checklist');
      } else if (hash === '#story' || hash === '#about') {
        setActiveTab('story');
      } else if (hash === '#contact' || hash === '#inquire') {
        setActiveTab('contact');
      } else if (hash === '#reviews' || hash === '#endorsements') {
        setActiveTab('reviews');
      } else {
        setActiveTab('home');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Live real-time Firestore synchronization for Testimonials
  useEffect(() => {
    try {
      return onSnapshot(collection(db, 'testimonials'), (snapshot) => {
        const list: ClientTestimonial[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as ClientTestimonial);
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setTestimonials(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'testimonials');
      });
    } catch (err) {
      console.warn("Testimonials real-time sync subscription error:", err);
    }
  }, []);

  // Live real-time Firestore synchronization for Leads
  useEffect(() => {
    try {
      return onSnapshot(collection(db, 'leads'), (snapshot) => {
        const list: InquiryLead[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          // Purge non-conforming or boilerplate visual data automatically to preserve absolute cleanliness
          const isSimulatedVal = [
            'Ananya Shah', 'Smit Patel', 'Rajesh Kumar', 
            'Dhruvi Mehta', 'Kishan Bhavsar', 'Rohan Verma', 'Preeti Sharma'
          ].includes(data.fullName) || docSnap.id === 'lead-1';

          if (isSimulatedVal) {
            deleteDoc(doc(db, 'leads', docSnap.id)).catch(() => {});
          } else {
            list.push({ id: docSnap.id, ...data } as InquiryLead);
          }
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setLeads(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'leads');
      });
    } catch (err) {
      console.warn("Leads real-time sync subscription error:", err);
    }
  }, []);

  // Real-time visitor log synchronization for analytics
  useEffect(() => {
    try {
      return onSnapshot(collection(db, 'visitor_book'), (snapshot) => {
        const list: VisitorBookEntry[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as VisitorBookEntry);
        });
        list.sort((a, b) => new Date(b.visitedAt).getTime() - new Date(a.visitedAt).getTime());
        setVisitorLog(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'visitor_book');
      });
    } catch (err) {
      console.warn("Visitor statistics sync subscription error:", err);
    }
  }, []);

  // Automated silent session browser logger
  useEffect(() => {
    try {
      const alreadyChecked = sessionStorage.getItem('sr_finserv_agent_logged');
      if (!alreadyChecked) {
        const entryId = `visit-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
        
        const entryRecord: VisitorBookEntry = {
          id: entryId,
          visitedAt: new Date().toISOString(),
          userAgent: navigator.userAgent || 'Desktop Node',
          language: navigator.language || 'en-IN',
          screenWidth: window.innerWidth || 1200,
          screenHeight: window.innerHeight || 800,
          platform: navigator.platform || 'General POSIX',
          referrer: document.referrer || 'Direct Search',
          pageSection: activeTab,
          isMobile: isMobileDevice
        };

        setDoc(doc(db, 'visitor_book', entryId), entryRecord)
          .then(() => {
            sessionStorage.setItem('sr_finserv_agent_logged', 'true');
          })
          .catch(() => {});
      }
    } catch (e) {
      console.warn("Automated visit tracking error:", e);
    }
  }, [activeTab]);

  // Ensure the view scrolls to the top whenever active tab or category/service filter changes.
  // This prevents the user from being left stranded deep down the page when toggling views.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab, servicesCategoryFilter]);

  // Alert notifier function helper
  const triggerNotification = (title: string, message: string, type: 'success' | 'warning' | 'info' = 'info') => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Trigger immediate CRM bypass unlock for Sanket
  const triggerCrmPortalLogin = () => {
    setIsCrmMode(true);
    triggerNotification('CRM Active', 'Direct CRM Workspace active. Real-time entries unlocked.', 'success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Execute immediate direct connection callback with unblocked secure mailto redirection and firestore queueing
  const handleInbuiltDirectConnect = (fullName: string, phone: string, email: string, productTitle: string, leadType: LeadType) => {
    const newId = `lead-${Date.now()}`;
    const payload: InquiryLead = {
      id: newId,
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || 'N/A',
      leadType: leadType,
      subType: productTitle,
      details: `1-Click Direct callback request registered for ${productTitle} from website visitor.`,
      status: 'New',
      createdAt: new Date().toISOString()
    };

    // Construct prefilled Email notification trigger with user's specific contact details
    const mailtoSubject = encodeURIComponent(`[URGENT CALLBACK INQUIRY] [customer reach] - ${fullName.trim()} requires ${productTitle}`);
    const mailtoBody = encodeURIComponent(
      `Hi Sanket,\n\nA new customer wants an immediate callback. This request was logged in 1-Click:\n\n` +
      `- Client Name: ${fullName.trim()}\n` +
      `- Phone/WhatsApp Number: ${phone.trim()}\n` +
      `- Email Address: ${email.trim() || 'N/A'}\n` +
      `- Chosen Service: ${productTitle}\n` +
      `- Handled On: ${new Date().toLocaleString()}\n` +
      `- Remarks Mail: Customer Reach\n\n` +
      `This message has been dispatched immediately to you via system sync. Make contact now!`
    );
    const emailUrl = `mailto:sanketbhavsar27@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;

    // Now construct WhatsApp trigger directed to Sanket's direct number
    const whatsappMessage = `Hello Sanket Champaneri inside SR Finserv,\nMy name is ${fullName.trim()} (${phone.trim()}).\nI urgently require assistance with product: ${productTitle}.\n\nPlease contact me immediately!`;
    const whatsappUrl = `https://wa.me/918487974404?text=${encodeURIComponent(whatsappMessage)}`;

    setSubmittedMailtoUrl(emailUrl);
    setSubmittedWhatsappUrl(whatsappUrl);

    // OPEN NATIVE MAILTO COMPLETELY SYNCHRONOUSLY FIRST (No delay, no browser blocks!)
    window.location.href = emailUrl;

    // Trigger WhatsApp in background a split-second later
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
    }, 200);

    // Perform the database update asynchronously
    setDoc(doc(db, 'leads', newId), payload)
      .then(() => {
        triggerNotification(
          'Inquiry Transmitted',
          `Sanket Champaneri has been immediately notified regarding your "${productTitle}" requirement.`,
          'success'
        );
      })
      .catch((e) => {
        console.warn("Direct connection Firestore log error:", e);
      });
  };

  // Prefill inquiry form based on specific service selections
  const handlePrefillInquiry = (type: LeadType, id: string, name: string) => {
    setSelectedServiceId(id);
    // Reset questionnaire wizard and set steps directly to Question 1 for all desks
    setLoanAmount('');
    setLoanArea('');
    setLoanStep(1);
    
    setModalFormData({
      fullName: visitorContact?.fullName || `Anonymous ${type === 'loan' ? 'Loan' : type === 'legal' ? 'Legal' : 'Insurance'} Customer`,
      phone: visitorContact?.phone || 'N/A',
      email: visitorContact?.email || 'N/A'
    });

    setInbuiltDirectModal({
      isOpen: true,
      type,
      title: name
    });
  };

  // Turn-by-turn questionnaire submit handler for loan (financial), legal, and insurance products
  const handleLoanFlowSubmit = async () => {
    const newId = `lead-${Date.now()}`;
    const curType = inbuiltDirectModal?.type || 'loan';
    const fallbackName = `Anonymous ${curType === 'loan' ? 'Loan' : curType === 'legal' ? 'Legal' : 'Insurance'} Customer`;
    const payload: InquiryLead = {
      id: newId,
      fullName: modalFormData.fullName.trim() || visitorContact?.fullName || fallbackName,
      phone: modalFormData.phone.trim() || visitorContact?.phone || 'N/A',
      email: modalFormData.email.trim() || visitorContact?.email || 'N/A',
      leadType: curType,
      subType: inbuiltDirectModal?.title || 'Unknown Service',
      details: `Loan Amount: ${loanAmount.trim() || 'Not specified'}. City Area: ${loanArea.trim() || 'Not specified'}.`,
      status: 'New',
      createdAt: new Date().toISOString()
    };

    // Construct prefilled Email notification trigger with user's specific contact details and answers
    const mailtoSubject = encodeURIComponent(`[URGENT CALLBACK INQUIRY] [customer reach] - ${payload.fullName} requires ${payload.subType}`);
    const mailtoBody = encodeURIComponent(
      `Hi Sanket,\n\nA new customer wants an immediate callback. Questionnaire Details:\n\n` +
      `- Client Name: ${payload.fullName}\n` +
      `- Contact Number: ${payload.phone}\n` +
      `- Email Address: ${payload.email}\n` +
      `- Chosen Desk Segment: ${curType.toUpperCase()}\n` +
      `- Chosen Service: ${payload.subType}\n` +
      `- Loan Amount Looking For: ${loanAmount.trim() || 'N/A'}\n` +
      `- Area/City Location: ${loanArea.trim() || 'N/A'}\n` +
      `- Handled On: ${new Date().toLocaleString()}\n` +
      `- Remarks Mail: Customer Reach\n\n` +
      `This message has been dispatched immediately to you via system sync. Make contact now!`
    );
    const emailUrl = `mailto:sanketbhavsar27@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;

    // WhatsApp Alert
    const whatsappMessage = `Hello Sanket Champaneri inside SR Finserv,\nMy name is ${payload.fullName} (${payload.phone}).\nI requested a callback for: ${payload.subType}.\n\n- Loan Amount: ${loanAmount.trim() || 'N/A'}\n- City Area: ${loanArea.trim() || 'N/A'}.\n\nPlease contact me in 1 hour!`;
    const whatsappUrl = `https://wa.me/918487974404?text=${encodeURIComponent(whatsappMessage)}`;

    setSubmittedMailtoUrl(emailUrl);
    setSubmittedWhatsappUrl(whatsappUrl);

    // Trigger browser redirection to mailto
    window.location.href = emailUrl;

    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
    }, 200);

    try {
      await setDoc(doc(db, 'leads', newId), payload);
      triggerNotification(
        'Inquiry Transmitted',
        'Thank you for visit our representative will reach you in one hour',
        'success'
      );
    } catch (e) {
      console.warn("Direct connection Firestore log error:", e);
    }

    setLoanStep(3);
  };

  // Contact form submission
  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim()) {
      alert('Kindly share your primary Name and Contact Number so we can assist your files.');
      return;
    }

    const trimmedEmail = formData.email.trim();
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      triggerNotification('Email Format Warning', 'Kindly verify your email ID format (e.g. name@domain.com) or leave it empty.', 'warning');
      return;
    }

    const newId = `lead-${Date.now()}`;
    let leadType: LeadType = 'loan';
    if (formData.requirement === 'Insurance services') {
      leadType = 'insurance';
    } else if (formData.requirement === 'Legal services') {
      leadType = 'legal';
    }

    const payload: InquiryLead = {
      id: newId,
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || 'N/A',
      leadType: leadType,
      subType: formData.requirement,
      details: formData.details.trim() || `Advisory callback request for ${formData.requirement}`,
      status: 'New',
      createdAt: new Date().toISOString()
    };

    // Immediately trigger native email notification window with prefilled lead data directed to sanketbhavsar27@gmail.com
    const mailtoSubject = encodeURIComponent(`[SR Finserv Callback Inquiry] [customer reach] - ${payload.fullName}`);
    const mailtoBody = encodeURIComponent(
      `Hi Sanket,\n\nA new advisory request has been placed on srfinserv.co:\n\n` +
      `- Full Name: ${payload.fullName}\n` +
      `- Contact Phone: ${payload.phone}\n` +
      `- Email: ${payload.email}\n` +
      `- Desk Interest: ${payload.subType}\n` +
      `- Detailed Requirements: ${payload.details}\n` +
      `- Remarks Mail: Customer Reach\n\n` +
      `Date Logged: ${new Date().toLocaleString()}\n\n` +
      `Kindly review and contact the client immediately!\n`
    );
    const emailUrl = `mailto:sanketbhavsar27@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;
    
    // Construct prefilled WhatsApp link as well
    const whatsappMessage = `Hello Sanket Champaneri inside SR Finserv,\nMy name is ${payload.fullName} (${payload.phone}).\nI requested an advisory callback regarding: ${payload.subType}.\n\nKindly contact me back!`;
    const whatsappUrl = `https://wa.me/918487974404?text=${encodeURIComponent(whatsappMessage)}`;

    setSubmittedMailtoUrl(emailUrl);
    setSubmittedWhatsappUrl(whatsappUrl);

    // Synchronously open the native email composer (zero delay = bypass browser popup check)
    window.location.href = emailUrl;

    setDoc(doc(db, 'leads', newId), payload)
      .then(() => {
        triggerNotification(
          'Inquiry Received',
          `Thank you, ${payload.fullName}. We will reach you within one hour.`,
          'success'
        );

        setFormSubmitted(true);
        setFormData({
          fullName: '',
          phone: '',
          email: '',
          requirement: 'Loan services',
          details: ''
        });
      })
      .catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, `leads/${newId}`);
        triggerNotification('Offline Callback Queued', 'Your callback was registered. We will update right away.', 'warning');
      });
  };

  // Testimonial Form Submit
  const handleTestimonialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestimonial.clientName.trim() || !newTestimonial.testimonialText.trim()) {
      alert('We value your feedback. Please share both your Name and Client Experience.');
      return;
    }

    const permittedId = `test-${Date.now()}`;
    const cleanName = newTestimonial.hasPermission ? newTestimonial.clientName.trim() : 'Verified Client';

    const defaultReplies: Record<number, string> = {
      5: `Thank you, ${cleanName}! Delivering premium doorstep convenience and making files easy to understand is our core mission. Glad I could assist you with your advisory files! - Sanket Champaneri (Director, SR Finserv)`,
      4: `Thank you so much, ${cleanName}! We appreciate your high trust in SR Finserv. We are always working to make documentation and legal representation as simple as possible. - Sanket Champaneri`,
      3: `Thank you for your review, ${cleanName}. We strictly audit our processes based on your rating feedback to ensure our doorstep services remain top-tier. - Sanket Champaneri`
    };
    const autoReplyText = defaultReplies[newTestimonial.rating as number] || `Thank you for your valuable feedback, ${cleanName}! We are committed to securing your file and legacy. - Sanket Champaneri`;

    const cleanTestimonial: ClientTestimonial = {
      id: permittedId,
      clientName: cleanName,
      serviceUsed: newTestimonial.serviceUsed,
      testimonialText: newTestimonial.testimonialText.trim(),
      hasPermission: newTestimonial.hasPermission,
      rating: newTestimonial.rating,
      status: 'Approved',
      createdAt: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      advisorReply: autoReplyText
    };

    setDoc(doc(db, 'testimonials', permittedId), cleanTestimonial)
      .then(() => {
        triggerNotification('Review Added', 'Thank you for your valuable feedback! It is live on our timeline.', 'success');
        setTestimonialSubmitted(true);
        setNewTestimonial({
          clientName: '',
          serviceUsed: 'Home Loans',
          testimonialText: '',
          rating: 5,
          hasPermission: true
        });
        setTimeout(() => setTestimonialSubmitted(false), 5000);
      })
      .catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, `testimonials/${permittedId}`);
      });
  };

  // Testimonial Reaction Counters
  const handleLikeTestimonial = async (id: string, currentLikes: number = 0) => {
    try {
      const tDoc = doc(db, 'testimonials', id);
      await updateDoc(tDoc, { likes: (currentLikes || 0) + 1 });
      triggerNotification('Feedback Approved', 'Helpful endorsement documented.', 'success');
    } catch (e) {
      console.warn("Feedback like update error:", e);
    }
  };

  // CRM: Delete/Edit helpers
  const handleCrmDeleteLead = async (id: string) => {
    if (window.confirm("Confirm deletion of this inquiry? This cannot be undone.")) {
      try {
        await deleteDoc(doc(db, 'leads', id));
        triggerNotification('Inquiry Removed', 'Entry successfully deleted from records.', 'info');
      } catch (e) {
        console.error("Delete error:", e);
      }
    }
  };

  const handleCrmUpdateStatus = async (id: string, nextStatus: InquiryLead['status']) => {
    try {
      await updateDoc(doc(db, 'leads', id), { status: nextStatus });
      triggerNotification('Status Updated', `Entry configured to: ${nextStatus}`, 'success');
      if (selectedLeadForEdit && selectedLeadForEdit.id === id) {
        setSelectedLeadForEdit(prev => prev ? { ...prev, status: nextStatus } : null);
      }
    } catch (e) {
      console.error("Update status error:", e);
    }
  };

  const handleCrmUpdateNote = async (id: string, notesText: string) => {
    try {
      await updateDoc(doc(db, 'leads', id), { notes: notesText });
      triggerNotification('Note Saved', 'Private advisor status note updated successfully.', 'success');
      if (selectedLeadForEdit && selectedLeadForEdit.id === id) {
        setSelectedLeadForEdit(prev => prev ? { ...prev, notes: notesText } : null);
      }
    } catch (e) {
      console.error("Update notes error:", e);
      triggerNotification('Error', 'Could not update notes dynamically.', 'warning');
    }
  };

  // Testimonials filter computations
  const approvedTestimonials = useMemo(() => {
    return testimonials.filter((t) => t.status === 'Approved');
  }, [testimonials]);

  const visibleTestimonials = useMemo(() => {
    const liveApproved = testimonials.filter(t => t.status === 'Approved');
    if (liveApproved.length === 0) {
      return fallbackTestimonials;
    }
    return liveApproved;
  }, [testimonials]);

  const handleUpdateTestimonialReply = async (id: string, replyText: string) => {
    // Dynamically save to local customReplies state first
    setCustomReplies(prev => ({
      ...prev,
      [id]: replyText
    }));

    if (!id.startsWith('fallback-')) {
      try {
        const tDoc = doc(db, 'testimonials', id);
        await updateDoc(tDoc, { advisorReply: replyText });
        triggerNotification('Reply Updated', 'Official reply saved to Firestore!', 'success');
      } catch (err) {
        console.warn("Could not save advisor reply to Firestore:", err);
        triggerNotification('Reply Updated', 'Saved in local session.', 'info');
      }
    } else {
      triggerNotification('Reply Updated', 'Saved in local session.', 'info');
    }
  };

  // CRM entry filters
  const filteredCrmLeads = useMemo(() => {
    return leads.filter((lead) => {
      const q = crmSearchQuery.toLowerCase();
      const matchesSearch = 
        lead.fullName.toLowerCase().includes(q) || 
        lead.phone.includes(q) || 
        lead.email.toLowerCase().includes(q) ||
        (lead.details && lead.details.toLowerCase().includes(q)) ||
        (lead.notes && lead.notes.toLowerCase().includes(q));
      
      const matchesType = crmTypeFilter === 'all' || lead.leadType === crmTypeFilter;
      
      let matchesStatus = true;
      if (crmStatusFilter === 'New') {
        matchesStatus = lead.status === 'New';
      } else if (crmStatusFilter === 'active') {
        matchesStatus = lead.status === 'Contacted' || lead.status === 'In Progress';
      } else if (crmStatusFilter === 'resolved') {
        matchesStatus = lead.status === 'Completed' || lead.status === 'Closed';
      }
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [leads, crmSearchQuery, crmTypeFilter, crmStatusFilter]);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col antialiased">
      
      {/* GLOBAL TOAST NOTIFICATION CONTAINER */}
      <div className="fixed top-6 right-6 z-[99999] flex flex-col gap-3.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-xl border shadow-lg flex items-start gap-3 bg-white pointer-events-auto transition-all ${
              toast.type === 'success' ? 'border-emerald-200 text-slate-800' : 'border-blue-200 text-slate-800'
            }`}
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
            }`}>
              ✓
            </div>
            <div>
              <h5 className="font-extrabold text-sm font-sans tracking-tight">{toast.title}</h5>
              <p className="text-xs text-slate-600 font-semibold mt-1 leading-normal">{toast.message}</p>
            </div>
          </div>
        ))}
      </div>      {/* COMPACT CLEAN HEADER */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100/80 transition-all">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Brand/Signature */}
          <div 
            onClick={() => {
              setActiveTab('home');
              setIsCrmMode(false);
            }} 
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 bg-brand-navy-900 rounded-xl flex items-center justify-center transition-all group-hover:scale-105 group-hover:shadow-sm">
              <span className="font-display font-black text-white text-base tracking-tighter">SR</span>
            </div>
            <div>
              <span className="font-display text-lg font-black text-brand-navy-900 block tracking-tight transition-colors group-hover:text-brand-navy-800">
                SR Finserv
              </span>
              <span className="text-[9px] uppercase tracking-widest font-black text-brand-navy-600 block -mt-1.5">
                Legal & Loans Advisory
              </span>
            </div>
          </div>

          {/* Desktop Navigation Link Tubs */}
          {!isCrmMode ? (
            <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-605">
              <button 
                type="button"
                onClick={() => setActiveTab('home')} 
                className={`transition-all py-1 cursor-pointer ${activeTab === 'home' ? 'text-brand-navy-900 border-b-2 border-brand-navy-900 font-extrabold' : 'hover:text-brand-navy-900 text-slate-500 hover:border-b-2 hover:border-slate-350'}`}
              >
                Home
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('story')} 
                className={`transition-all py-1 cursor-pointer ${activeTab === 'story' ? 'text-brand-navy-900 border-b-2 border-brand-navy-900 font-extrabold' : 'hover:text-brand-navy-900 text-slate-500 hover:border-b-2 hover:border-slate-350'}`}
              >
                About Us
              </button>
              <button 
                type="button"
                onClick={() => { setActiveTab('services'); setServicesCategoryFilter('all'); }} 
                className={`transition-all py-1 cursor-pointer ${activeTab === 'services' ? 'text-brand-navy-900 border-b-2 border-brand-navy-900 font-extrabold' : 'hover:text-brand-navy-900 text-slate-500 hover:border-b-2 hover:border-slate-350'}`}
              >
                Services
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('checklist')} 
                className={`transition-all py-1 cursor-pointer ${activeTab === 'checklist' ? 'text-brand-navy-900 border-b-2 border-brand-navy-900 font-extrabold' : 'hover:text-brand-navy-900 text-slate-500 hover:border-b-2 hover:border-slate-350'}`}
              >
                Checklist
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('reviews')} 
                className={`transition-all py-1 cursor-pointer ${activeTab === 'reviews' ? 'text-brand-navy-900 border-b-2 border-brand-navy-900 font-extrabold' : 'hover:text-brand-navy-900 text-slate-500 hover:border-b-2 hover:border-slate-350'}`}
              >
                Reviews
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('contact')} 
                className={`transition-all py-1 cursor-pointer ${activeTab === 'contact' ? 'text-brand-navy-900 border-b-2 border-brand-navy-900 font-extrabold' : 'hover:text-brand-navy-900 text-slate-500 hover:border-b-2 hover:border-slate-350'}`}
              >
                Contact
              </button>
            </nav>
          ) : (
            <span className="font-mono text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Direct Advisor Panel Secure</span>
            </span>
          )}

          {/* Action Corners */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={triggerCrmPortalLogin}
              className="p-2.5 bg-slate-50 border border-slate-205 hover:bg-slate-100 text-slate-600 hover:text-brand-navy-900 rounded-xl transition-colors cursor-pointer"
              title="Advisor CRM Portal Login"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>

            {isCrmMode ? (
              <button
                type="button"
                onClick={() => {
                  setIsCrmMode(false);
                  setActiveTab('home');
                }}
                className="bg-brand-navy-900 hover:bg-brand-navy-800 text-white font-black text-xs py-2.5 px-4 rounded-xl shadow-xs transition-colors cursor-pointer animate-fade-in"
              >
                Exit CRM
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('contact');
                  setTimeout(() => {
                    const el = document.getElementById('contact-scroll-target');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="hidden sm:inline-block bg-brand-navy-900 hover:bg-brand-navy-800 text-white font-black text-xs py-2.5 px-5 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Get Callback
              </button>
            )}

            {/* Mobile Hamburger Dropdown Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile dropdown lists */}
        {mobileMenuOpen && !isCrmMode && (
          <div className="md:hidden border-t border-slate-100 bg-white p-4 flex flex-col gap-2.5 text-xs font-bold text-slate-700 animate-[fade-in_0.2s_ease-out]">
            <button
              type="button"
              onClick={() => {
                setActiveTab('home');
                setMobileMenuOpen(false);
              }}
              className={`text-left py-2 px-3 rounded-lg transition-colors ${activeTab === 'home' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'}`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('story');
                setMobileMenuOpen(false);
              }}
              className={`text-left py-2 px-3 rounded-lg transition-colors ${activeTab === 'story' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'}`}
            >
              About Us
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('services');
                setServicesCategoryFilter('all');
                setMobileMenuOpen(false);
              }}
              className={`text-left py-2 px-3 rounded-lg transition-colors ${activeTab === 'services' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'}`}
            >
              Services
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('checklist');
                setMobileMenuOpen(false);
              }}
              className={`text-left py-2 px-3 rounded-lg transition-colors ${activeTab === 'checklist' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'}`}
            >
              Checklist
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('reviews');
                setMobileMenuOpen(false);
              }}
              className={`text-left py-2 px-3 rounded-lg transition-colors ${activeTab === 'reviews' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'}`}
            >
              Reviews
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('contact');
                setMobileMenuOpen(false);
              }}
              className={`text-left py-2 px-3 rounded-lg transition-colors ${activeTab === 'contact' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'}`}
            >
              Contact
            </button>
          </div>
        )}
      </header>

      {/* MAIN CONTAINER */}
      {!isCrmMode ? (
        <main className="flex-1 bg-slate-50/50">
          
          {/* HOME TAB (DEFAULT PRESTIGE LANDING) */}
          {activeTab === 'home' && (
            <div className="animate-fade-in">
              {/* HERO SECTION */}
              <section className="bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-16 sm:py-20 border-b border-slate-100">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  
                  {/* Left Column Welcome Info */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-3.5 py-1.5 rounded-full text-brand-navy-600 text-[10.5px] font-black uppercase tracking-wider">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Ahmedabad's Premium Doorstep Advisory</span>
                    </div>

                    <h1 className="font-display text-4xl sm:text-5xl font-black text-brand-navy-900 tracking-tight leading-tight">
                      Bespoke Financial & <span className="text-blue-600 font-extrabold">Doorstep Legal</span> Solutions
                    </h1>

                    <p className="text-xs sm:text-sm text-slate-500 font-bold leading-relaxed max-w-xl">
                      Save hours of tedious banking and legal procedures in Gujarat. We provide direct financial underwriting assistance, water-tight property law drafting, and registered notary executions directly delivered to your doorstep in Ahmedabad.
                    </p>

                    <div className="flex flex-wrap gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setActiveTab('services')}
                        className="bg-brand-navy-900 hover:bg-brand-navy-800 text-white text-xs font-bold px-6 py-3.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-102"
                      >
                        Explore Services <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('contact');
                          setTimeout(() => {
                            const el = document.getElementById('contact-scroll-target');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        }}
                        className="border border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white text-slate-700 text-xs font-bold px-6 py-3.5 rounded-xl transition-all cursor-pointer hover:scale-102"
                      >
                        Inquire Now
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200/60 max-w-md">
                      <div>
                        <strong className="text-lg font-black text-slate-900 block font-display">9+ Years</strong>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Ahmedabad Expert</span>
                      </div>
                      <div>
                        <strong className="text-lg font-black text-slate-900 block font-display">100%</strong>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Doorstep Delivery</span>
                      </div>
                      <div>
                        <strong className="text-lg font-black text-slate-900 block font-display">Direct</strong>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Bank Relations</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column Call Out Card */}
                  <div className="lg:col-span-5 bg-white p-8 sm:p-10 rounded-3xl text-blue-600 shadow-xl relative overflow-hidden border border-blue-100">
                    <div className="absolute -top-4 -right-4 w-44 h-44 bg-blue-100 rounded-full blur-2xl" />
                    
                    <div className="relative z-10 space-y-5">
                      <div>
                        <span className="text-3xl">🤝</span>
                        <h3 className="font-display font-black text-2xl text-blue-900 mt-3 leading-tight">Zero Bank Queue Visits</h3>
                        <p className="text-blue-800 text-xs mt-2 leading-relaxed font-bold">
                          We handle full file representation, bank underwriting guidelines, and registered sub-registrar conveyances to shield you from tedious processing desks.
                        </p>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-blue-100">
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-md bg-blue-50 flex items-center justify-center text-[12px] text-blue-600 font-black">✓</div>
                          <span className="text-xs text-blue-800 font-bold">Comprehensive Title Clear Assessment</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-md bg-blue-50 flex items-center justify-center text-[12px] text-blue-600 font-black">✓</div>
                          <span className="text-xs text-blue-800 font-bold">Top National Lending Terms Comparison</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-md bg-blue-50 flex items-center justify-center text-[12px] text-blue-600 font-black">✓</div>
                          <span className="text-xs text-blue-800 font-bold">Ahmedabad Registered Stamp Assistants</span>
                        </div>
                      </div>

                      <div className="pt-3">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('contact');
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition-colors block text-center uppercase tracking-wider cursor-pointer"
                        >
                          Book Doorstep Session
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </section>

              {/* Removed experience block from home page as requested */}

              {/* SEAMLESS TAB SUMMARY FOR SERVICES */}
              <section className="py-16 bg-slate-50 text-slate-950 border-b border-slate-100">
                <div className="max-w-6xl mx-auto px-6 text-center">
                  <span className="text-xs uppercase tracking-widest text-brand-navy-600 font-extrabold">Professional Portfolios</span>
                  <h2 className="font-display text-2.5xl font-black text-brand-navy-900 mt-2 mb-4 tracking-tight">Our Core Advisory Desks</h2>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto font-bold mb-10 leading-relaxed">
                    Select a segment below or check the navigation panel to view specific doorstep solutions.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-7 rounded-2xl border border-slate-200/80 text-left flex flex-col justify-between hover:shadow-md transition-shadow">
                      <div>
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-lg mb-4">🏦</div>
                        <h3 className="font-display text-lg font-black text-brand-navy-900">Loans Advisory</h3>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed font-bold">
                          Home loans, commercial limits, Cash Credit configurations, and project restructuring compared across top lenders.
                        </p>
                      </div>
                      <button 
                        onClick={() => { setActiveTab('services'); setServicesCategoryFilter('loan'); }}
                        className="text-brand-navy-600 text-xs font-black inline-flex items-center gap-1.5 mt-6 hover:translate-x-1 transition-transform self-start"
                      >
                        Learn more →
                      </button>
                    </div>

                    <div className="bg-white p-7 rounded-2xl border border-slate-200/80 text-left flex flex-col justify-between hover:shadow-md transition-shadow">
                      <div>
                        <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center text-lg mb-4">📜</div>
                        <h3 className="font-display text-lg font-black text-brand-navy-900">Legal Drafting</h3>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed font-bold">
                          Sale deeds, property conveyor banakhat maps, stamp registration duty coordination, and notary public sign-off.
                        </p>
                      </div>
                      <button 
                        onClick={() => { setActiveTab('services'); setServicesCategoryFilter('legal'); }}
                        className="text-purple-600 text-xs font-black inline-flex items-center gap-1.5 mt-6 hover:translate-x-1 transition-transform self-start"
                      >
                        Learn more →
                      </button>
                    </div>

                    <div className="bg-white p-7 rounded-2xl border border-slate-200/80 text-left flex flex-col justify-between hover:shadow-md transition-shadow">
                      <div>
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center text-lg mb-4">🛡️</div>
                        <h3 className="font-display text-lg font-black text-brand-navy-900">Asset Protection</h3>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed font-bold">
                          Compliant mortgage life coverage, cashless premium health networks, and heavy warehouse general liabilities insurance.
                        </p>
                      </div>
                      <button 
                        onClick={() => { setActiveTab('services'); setServicesCategoryFilter('insurance'); }}
                        className="text-emerald-600 text-xs font-black inline-flex items-center gap-1.5 mt-6 hover:translate-x-1 transition-transform self-start"
                      >
                        Learn more →
                      </button>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          )}

          {/* SERVICES TAB SECTION - COMPACT AND ELEGANT PORTFOLIO */}
          {activeTab === 'services' && (
            <div className="max-w-6xl mx-auto px-6 py-12 animate-fade-in">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs uppercase tracking-widest text-brand-navy-600 font-extrabold">Professional Portfolio</span>
                <h1 className="font-display text-3xl sm:text-4xl font-black text-slate-900 mt-2 leading-tight">Our Bespoke Doorstep Services</h1>
                <p className="text-xs sm:text-sm text-slate-500 font-bold leading-relaxed mt-3">
                  Click on any advisory service below to automatically prefill and register your callback requirements directly.
                </p>
              </div>

              {/* CATEGORY SELECTOR PILLS */}
              <div className="flex flex-wrap items-center justify-center gap-2 mb-12 max-w-3xl mx-auto pb-4">
                <button
                  type="button"
                  onClick={() => setServicesCategoryFilter('all')}
                  className={`px-5 py-2.5 rounded-full font-bold text-xs transition-all cursor-pointer ${
                    servicesCategoryFilter === 'all'
                      ? 'bg-brand-navy-950 text-white shadow-sm'
                      : 'bg-slate-150 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  🌐 Show All Portfolios
                </button>
                <button
                  type="button"
                  onClick={() => setServicesCategoryFilter('loan')}
                  className={`px-5 py-2.5 rounded-full font-bold text-xs transition-all cursor-pointer ${
                    servicesCategoryFilter === 'loan'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:text-blue-600 hover:border-blue-300'
                  }`}
                >
                  🏦 Financial Loans Desk
                </button>
                <button
                  type="button"
                  onClick={() => setServicesCategoryFilter('legal')}
                  className={`px-5 py-2.5 rounded-full font-bold text-xs transition-all cursor-pointer ${
                    servicesCategoryFilter === 'legal'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:text-purple-600 hover:border-purple-300'
                  }`}
                >
                  📜 Legal Conveyancing Desk
                </button>
                <button
                  type="button"
                  onClick={() => setServicesCategoryFilter('insurance')}
                  className={`px-5 py-2.5 rounded-full font-bold text-xs transition-all cursor-pointer ${
                    servicesCategoryFilter === 'insurance'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:text-emerald-600 hover:border-emerald-300'
                  }`}
                >
                  🛡️ Asset & Mortgage Shield
                </button>
              </div>

              {/* PORTFOLIO GRID IN SANKET'S COLOR PALETTE */}
              <div className="space-y-16">
                
                {/* 1. LOANS ADVISORY PORTFOLIO */}
                {(servicesCategoryFilter === 'all' || servicesCategoryFilter === 'loan') && (
                  <div className="space-y-6 duration-300">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                      <span className="p-2 bg-blue-50 text-blue-600 rounded-xl font-bold">🏦</span>
                      <h2 className="font-display text-xl sm:text-2xl font-black text-brand-navy-900">Financial Loans Desk</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {LOAN_SERVICES.map((loan) => {
                        const isSelected = selectedServiceId === loan.id;
                        return (
                          <div 
                            key={loan.id}
                            onClick={() => handlePrefillInquiry('loan', loan.id, loan.title)}
                            className={`flex flex-col justify-between transition-all group cursor-pointer rounded-3xl p-6 border relative ${
                              isSelected 
                                ? 'border-2 border-blue-600 ring-4 ring-blue-500/10 shadow-lg bg-blue-50/10 scale-[1.02]' 
                                : 'bg-white hover:bg-slate-50/50 border-slate-200 hover:border-blue-300 hover:shadow-md'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute -top-3 right-4 bg-blue-600 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-xs tracking-wider flex items-center gap-1">
                                🎯 Selected Option ✓
                              </div>
                            )}
                            <div className="space-y-4">
                              <h4 className="font-display font-extrabold text-brand-navy-900 group-hover:text-blue-600 transition-colors text-base leading-snug">
                                {loan.title}
                              </h4>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Advisory service</span>
                              <span className="text-xs text-blue-600 font-black group-hover:translate-x-1.5 transition-transform inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-100">
                                Inquire Now <ArrowRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. LEGAL DRAFTING PORTFOLIO */}
                {(servicesCategoryFilter === 'all' || servicesCategoryFilter === 'legal') && (
                  <div className="space-y-6 duration-300">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                      <span className="p-2 bg-purple-50 text-purple-600 rounded-xl font-bold">📜</span>
                      <h2 className="font-display text-xl sm:text-2xl font-black text-brand-navy-900">Legal Conveyancing Desk</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {LEGAL_SERVICES.map((legal) => {
                        const isNotary = legal.id === 'notary-services';
                        const isSelected = selectedServiceId === legal.id;
                        return (
                          <div 
                            key={legal.id}
                            onClick={() => handlePrefillInquiry('legal', legal.id, legal.title)}
                            className={`flex flex-col justify-between transition-all group cursor-pointer rounded-3xl p-6 border relative ${
                              isSelected
                                ? 'border-2 border-purple-600 ring-4 ring-purple-500/10 shadow-lg bg-purple-50/10 scale-[1.02]'
                                : isNotary 
                                  ? 'bg-gradient-to-br from-blue-50 to-white border-2 border-blue-600 shadow-md scale-[1.02]' 
                                  : 'bg-white hover:bg-slate-50/50 border-slate-200 hover:border-purple-300 hover:shadow-md'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute -top-3 right-4 bg-purple-600 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-xs tracking-wider flex items-center gap-1">
                                🎯 Selected Option ✓
                              </div>
                            )}
                            {isNotary && !isSelected && (
                              <div className="absolute -top-3 left-4 bg-blue-600 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-xs tracking-wider">
                                🌟 Highlighted Doorstep Service
                              </div>
                            )}
                            <div className="space-y-4">
                              <h4 className={`font-display font-extrabold text-base leading-snug ${
                                isSelected ? 'text-purple-900' : isNotary ? 'text-blue-900 group-hover:text-blue-700' : 'text-brand-navy-900 group-hover:text-purple-600'
                              }`}>
                                {legal.title}
                              </h4>
                            </div>
                            <div className={`mt-4 pt-4 border-t flex items-center justify-between ${isNotary ? 'border-blue-200' : 'border-slate-100'}`}>
                              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Conveyance desk</span>
                              <span className={`text-xs font-black group-hover:translate-x-1.5 transition-transform inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
                                isSelected ? 'text-purple-700 bg-purple-50 border-purple-100' : isNotary ? 'text-blue-700 bg-blue-50 border-blue-100' : 'text-purple-600 bg-purple-50 border-purple-100'
                              }`}>
                                Order Draft <ArrowRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. ASSET PROTECTION PORTFOLIO */}
                {(servicesCategoryFilter === 'all' || servicesCategoryFilter === 'insurance') && (
                  <div className="space-y-6 duration-300">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                      <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold">🛡️</span>
                      <h2 className="font-display text-xl sm:text-2xl font-black text-brand-navy-900">Asset & Mortgage Protection Desk</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {INSURANCE_SERVICES.map((ins) => {
                        const isSelected = selectedServiceId === ins.id;
                        return (
                          <div 
                            key={ins.id}
                            onClick={() => handlePrefillInquiry('insurance', ins.id, ins.title)}
                            className={`flex flex-col justify-between transition-all group cursor-pointer rounded-3xl p-6 border relative ${
                              isSelected 
                                ? 'border-2 border-emerald-600 ring-4 ring-emerald-500/10 shadow-lg bg-emerald-50/10 scale-[1.02]' 
                                : 'bg-white hover:bg-slate-50/50 border-slate-200 hover:border-emerald-300 hover:shadow-md'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute -top-3 right-4 bg-emerald-600 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-xs tracking-wider flex items-center gap-1">
                                🎯 Selected Option ✓
                              </div>
                            )}
                            <div className="space-y-4">
                              <h4 className="font-display font-extrabold text-brand-navy-900 group-hover:text-emerald-600 transition-colors text-base leading-snug">
                                {ins.title}
                              </h4>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Protection desk</span>
                              <span className="text-xs text-emerald-600 font-black group-hover:translate-x-1.5 transition-transform inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-100">
                                Get Quote <ArrowRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* CHECKLIST TAB SECTION - SOLID DOWNLOADABLE INTERACTIVE UI */}
          {activeTab === 'checklist' && (
            <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in space-y-8">
              <div className="text-center max-w-2xl mx-auto">
                <span className="text-xs uppercase tracking-widest text-brand-navy-600 font-extrabold font-mono font-bold">Advisory Tools Desk</span>
                <h1 className="font-display text-3xl font-black text-slate-900 mt-1">Calculators & Verification Checklists</h1>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-2.5">
                  Verify your property papers, calculate monthly EMI obligations, and estimate potential borrowing limits prior to launching bank files.
                </p>
              </div>

              {/* Sub-tab selection row */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-200 p-1.5 rounded-2xl max-w-2xl mx-auto">
                <button
                  type="button"
                  onClick={() => setComplianceSubTab('checklist')}
                  className={`py-3 px-1 rounded-xl font-bold text-xs transition-all cursor-pointer text-center ${
                    complianceSubTab === 'checklist'
                      ? 'bg-brand-navy-950 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  📋 Document Planner
                </button>
                <button
                  type="button"
                  onClick={() => setComplianceSubTab('eligibility')}
                  className={`py-3 px-1 rounded-xl font-bold text-xs transition-all cursor-pointer text-center ${
                    complianceSubTab === 'eligibility'
                      ? 'bg-brand-navy-950 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  ⚖️ Eligibility Checker
                </button>
                <button
                  type="button"
                  onClick={() => setComplianceSubTab('emi')}
                  className={`py-3 px-1 rounded-xl font-bold text-xs transition-all cursor-pointer text-center ${
                    complianceSubTab === 'emi'
                      ? 'bg-brand-navy-950 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🧮 EMI Calculator
                </button>
              </div>

              {/* Conditional rendering of advisory sub-sections */}
              <div className="animate-fade-in">
                {complianceSubTab === 'checklist' && (
                  <div className="bg-slate-50 rounded-3xl p-4 sm:p-8 border border-slate-200/80 shadow-xs">
                    <LoanChecklistDownload />
                  </div>
                )}
                {complianceSubTab === 'eligibility' && (
                  <EligibilityChecker />
                )}
                {complianceSubTab === 'emi' && (
                  <EMICalculator />
                )}
              </div>
            </div>
          )}

          {/* SANKET STORY / ABOUT US TAB SECTION */}
          {activeTab === 'story' && (
            <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in space-y-12">
              
              <div className="text-center max-w-2xl mx-auto">
                <span className="text-xs uppercase tracking-widest text-[#2563eb] font-extrabold">Professional Track Record</span>
                <h1 className="font-display text-3xl sm:text-4xl font-black text-brand-navy-900 mt-1">About Us</h1>
                <p className="text-xs text-slate-500 font-bold tracking-widest uppercase mt-1">Founder & Executive Director, SR Finserv</p>
              </div>

              {/* Dynamic narrative */}
              <div className="bg-slate-50 rounded-3xl p-8 sm:p-10 border border-slate-200/80 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                
                <div className="md:col-span-8 space-y-5">
                  <h3 className="font-display text-lg font-bold text-slate-900 leading-tight">
                    "Bridging Rigid Banking Compliance with Local Property Execution"
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-semibold">
                    Having spent over 7 years inside major underwriting desks, standard system gaps turn off families over simple documentation mismatch or formatting. We founded SR Finserv to guarantee water-tight preparation.
                  </p>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-semibold">
                    Over the last 2 years, we added professional property law drafting. Our Ahmedabad assistants coordinate registration schedules for conveyancing sale deeds, leave & license, power of attorney and doorstep registered stamp notarizations.
                  </p>

                  <p className="text-xs font-mono text-[#2563eb] font-bold">
                    📍 Office Location: Venus Atlantis Corporate Park, Prahladnagar, Ahmedabad - 380015
                  </p>
                </div>

                <div className="md:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-4 shadow-xs">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-2xl mx-auto">
                    💼
                  </div>
                  <div>
                    <h5 className="font-display font-black text-slate-900 text-sm">Sanket Champaneri</h5>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5"> Ahmedabad Expert</p>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex flex-col gap-1.5 text-[10px] font-bold text-slate-600 text-left">
                    <span>• Certified Gujarat Notary Partner</span>
                    <span>• 7+ Yrs Corporate Bank Underwrite</span>
                    <span>• 2+ Yrs Independent Legal Drafts</span>
                  </div>
                </div>

              </div>

              {/* Sanket's detailed Ahmedabad experience and story - Placed exclusively here */}
              <div className="pt-8 border-t border-slate-200/60">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-widest text-[#2563eb] block mb-2">Prahladnagar, Ahmedabad Based</span>
                    <h2 className="font-display text-2xl font-black text-brand-navy-900 tracking-tight leading-tight">
                      9 Years Combined Ingress Into Ahmedabad Financial Ecosystem
                    </h2>
                    <p className="text-xs sm:text-sm font-semibold text-slate-600 leading-relaxed mt-4">
                      SR Finserv is headed by financial underwriting expert <strong>Sanket Champaneri</strong> from Venus Atlantis, Prahladnagar. Sanket observed firsthand how Ahmedabad families and busy enterprise owners fell into bottlenecks with complex banking document templates.
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-slate-600 leading-relaxed mt-3">
                      By integrating <strong>7 core years directly in bank loans and underwriting panels</strong> with <strong>2 independent years preparing deeds and title conveyances</strong>, we resolve procedural gaps before files are formally routed. 
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-6 sm:p-8 rounded-3xl grid grid-cols-1 gap-4 shadow-3xs">
                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 font-bold text-base">
                        🏦
                      </div>
                      <div>
                        <h4 className="font-display font-black text-brand-navy-900 text-xs sm:text-sm">7 Years Banking Underwriting Boards</h4>
                        <p className="text-[11px] text-slate-500 leading-normal mt-1 font-bold">Deep credit assessment, file profiling, and sanction pathway clearing inside leading national lenders.</p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100 font-bold text-base">
                        📜
                      </div>
                      <div>
                        <h4 className="font-display font-black text-brand-navy-900 text-xs sm:text-sm">2 Years Certified Real Estate Conveyancing</h4>
                        <p className="text-[11px] text-slate-500 leading-normal mt-1 font-bold">Direct site deed drafts, stamp registrations, banakhat title checks, and doorsteps public notary logs.</p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100 font-bold text-base">
                        🏢
                      </div>
                      <div>
                        <h4 className="font-display font-black text-brand-navy-900 text-xs sm:text-sm">Prahladnagar Corporate Consultation Hub</h4>
                        <p className="text-[11px] text-slate-500 leading-normal mt-1 font-bold">Located premiumly at Prahladnagar, offering safe offline consultations across Ahmedabad.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* CONTACT & DISPATCH TAB SECTION */}
          {activeTab === 'contact' && (
            <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in" id="contact-scroll-target">
              
              <div className="text-center max-w-2xl mx-auto mb-10">
                <span className="text-xs uppercase tracking-widest text-[#2563eb] font-extrabold">Advisory Support Desk</span>
                <h1 className="font-display text-3xl font-black text-slate-900 mt-1">Register Callback Request</h1>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-2.5">
                  No banker calls or queues. Secure direct, private doorbell callback counseling instantly.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
                
                {/* Left Form Panel */}
                <div className="md:col-span-7 bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
                  {formSubmitted ? (
                    <div className="text-center py-10 space-y-4">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto">
                        ✓
                      </div>
                      <h3 className="font-display font-black text-slate-900 text-lg">Inquiry Successfully Placed!</h3>
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                        Your requirement checklist has been synchronized with the real-time database. We will reach you within one hour.
                      </p>

                      <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl text-left space-y-3 mt-4">
                        <p className="text-[11px] text-blue-900 font-extrabold text-center uppercase tracking-wider">
                          📬 Dispatch Immediate Notifications
                        </p>
                        <p className="text-[10.5px] text-slate-500 font-medium text-center leading-normal">
                          If your browser or device has blocked the automatic mailbox launcher, click the buttons below to open your secure email and WhatsApp alerts:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-sans">
                          {submittedMailtoUrl && (
                            <a 
                              href={submittedMailtoUrl}
                              className="bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs text-center border border-blue-700"
                            >
                              📧 Open Email Notification
                            </a>
                          )}
                          {submittedWhatsappUrl && (
                            <a 
                              href={submittedWhatsappUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs text-center border border-emerald-700"
                            >
                              💬 Open WhatsApp Alert
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => setFormSubmitted(false)}
                          className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-lg transition-colors inline-block cursor-pointer mt-1"
                        >
                          Submit Another Callback
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleInquirySubmit} className="space-y-4.5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wide font-black text-slate-400 block">Your Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                          placeholder="What should we call you?"
                          className="w-full bg-white border border-slate-200 focus:border-blue-600 focus:bg-white p-3 rounded-xl text-xs font-bold outline-none transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-wide font-black text-slate-400 block">Mo. Number *</label>
                          <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            placeholder="Primary callback phone"
                            className="w-full bg-white border border-slate-200 focus:border-blue-600 focus:bg-white p-3 rounded-xl text-xs font-bold outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-wide font-black text-slate-400 block">Email Address</label>
                          <input
                            type="text"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            placeholder="Optional email ID"
                            className="w-full bg-white border border-slate-200 focus:border-blue-600 focus:bg-white p-3 rounded-xl text-xs font-bold outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wide font-black text-slate-400 block">Primary Service Desk Required</label>
                        <select
                          value={formData.requirement}
                          onChange={(e: any) => setFormData({...formData, requirement: e.target.value})}
                          className="w-full bg-white border border-slate-200 focus:border-blue-600 p-3 rounded-xl text-xs font-bold outline-none cursor-pointer"
                        >
                          <option value="Loan services">Financial Loans (Home/MSME/CC)</option>
                          <option value="Legal services">Legal Deeds (Sale/conveyance/notary)</option>
                          <option value="Insurance services">Mortgage Insurance & Health floats</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wide font-black text-slate-400 block">Requirement description</label>
                        <textarea
                          rows={3}
                          value={formData.details}
                          onChange={(e) => setFormData({...formData, details: e.target.value})}
                          placeholder="Briefly describe your requirements or simple context details..."
                          className="w-full bg-white border border-slate-200 focus:border-blue-600 focus:bg-white p-3 rounded-xl text-xs font-semibold outline-none transition-all resize-none"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          className="w-full bg-brand-navy-900 hover:bg-brand-navy-800 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-md transition-all uppercase tracking-wider text-center cursor-pointer"
                        >
                          Submit
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Right Interactive Information Panel */}
                <div className="md:col-span-5 space-y-6 bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl">
                  <div>
                    <h4 className="font-display font-black text-brand-navy-900 text-sm uppercase tracking-wide">Contact Details</h4>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-1">We operate across Prahladnagar, satellite, Thaltej, and Ahmedabad West.</p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-600">
                    <div className="flex gap-3">
                      <span className="text-base">📍</span>
                      <p>Office 87, Near Shell Pump, Venus Atlantis Corporate Park, Prahladnagar, Ahmedabad - 380015</p>
                    </div>

                    <div className="flex gap-3">
                      <span className="text-base">☎️</span>
                      <a href="tel:+918487974404" className="hover:underline text-brand-navy-600 font-bold">+91 84879 74404</a>
                    </div>

                    <div className="flex gap-3">
                      <span className="text-base">✉️</span>
                      <a href="mailto:sanketbhavsar27@gmail.com" className="hover:underline text-brand-navy-600 font-bold">sanketbhavsar27@gmail.com</a>
                    </div>

                    <div className="flex gap-3 items-center">
                      <span className="text-base">📸</span>
                      <a 
                        href="https://www.instagram.com/SR_Finserv" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:underline text-brand-navy-600 font-bold inline-flex items-center gap-1.5 hover:text-pink-600 transition-colors"
                      >
                        <Instagram className="w-4 h-4 text-pink-600" /> @SR_Finserv
                      </a>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 text-center">
                    <span className="text-[11px] block text-slate-400 font-bold uppercase tracking-wider mb-2">WhatsApp Direct</span>
                    <a
                      href="https://wa.me/918487974404"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-emerald-55 text-white text-xs font-black px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" /> Start WhatsApp Chat
                    </a>
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="max-w-6xl mx-auto px-6 py-12 animate-fade-in" id="reviews-scroll-target">
              
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs uppercase tracking-widest text-brand-navy-600 font-extrabold block">Client Endorsements</span>
                <h1 className="font-display text-3xl sm:text-4xl font-black text-slate-900 mt-2 leading-tight">Securing Legacies & Files</h1>
                <p className="text-xs sm:text-sm text-slate-500 font-bold leading-relaxed mt-3">
                  See what actual homeowners, commercial MSMEs, and clients say about Sanket's direct doorstep executions.
                </p>
              </div>

              {/* Grid of Approved Genuine Testimonials from Firestore & Fallbacks */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {visibleTestimonials.map((t) => {
                  return (
                    <div key={t.id} className="bg-white border border-slate-200 p-6 rounded-3xl flex flex-col justify-between shadow-xs transition-colors hover:border-slate-350">
                      <div>
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="font-display font-extrabold text-xs text-brand-navy-900 block">{t.clientName}</span>
                            <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{t.serviceUsed}</span>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <div className="flex text-amber-500 text-xxs tracking-tighter">
                              {'★'.repeat(t.rating)}
                              {'☆'.repeat(5 - t.rating)}
                            </div>
                            <button
                              onClick={() => handleLikeTestimonial(t.id, t.likes || 0)}
                              className="text-[9px] font-bold text-slate-400 hover:text-blue-600 flex items-center gap-1 mt-0.5"
                            >
                              <ThumbsUp className="w-2.5 h-2.5" /> <span>{t.likes || 0}</span>
                            </button>
                          </div>
                        </div>

                        <p className="italic text-xs text-slate-500 font-semibold leading-relaxed mt-4 pl-3 border-l-2 border-slate-100">
                          "{t.testimonialText}"
                        </p>
                      </div>
                    </div>
                  );
                })}

              </div>

              {/* INLINE TESTIMONIAL SUBMISSION FORM */}
              <div className="mt-12 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 max-w-2xl mx-auto shadow-xs">
                <div className="text-center max-w-md mx-auto mb-6">
                  <h3 className="font-display font-black text-slate-900 text-lg">Leave Your Client Experience</h3>
                  <p className="text-[11px] text-slate-400 font-semibold mt-1">Sanket is dedicated to improving doorstep consulting files representation daily.</p>
                </div>

                <form onSubmit={handleTestimonialSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Your Name</label>
                      <input
                        type="text"
                        required
                        value={newTestimonial.clientName}
                        onChange={(e) => setNewTestimonial({...newTestimonial, clientName: e.target.value})}
                        placeholder="Kirtan Mehta"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white p-3 rounded-xl text-xs font-bold outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Advisory Segment Used</label>
                      <select
                        value={newTestimonial.serviceUsed}
                        onChange={(e) => setNewTestimonial({...newTestimonial, serviceUsed: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 p-3 rounded-xl text-xs font-bold outline-none cursor-pointer"
                      >
                        <option value="Home Loans">Home Loans Desk</option>
                        <option value="Business CC Limit">Business CC Limit</option>
                        <option value="Sale Deed Conveyance">Sale Deed draft</option>
                        <option value="General Notary Stays">True Notary service</option>
                        <option value="Sworn Affidavits">Sworn affidavit</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Rating Score</label>
                      <select
                        value={newTestimonial.rating}
                        onChange={(e) => setNewTestimonial({...newTestimonial, rating: Number(e.target.value)})}
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold outline-none cursor-pointer text-amber-600"
                      >
                        <option value="5">★★★★★ Outstanding (5)</option>
                        <option value="4">★★★★ Excellent (4)</option>
                        <option value="3">★★★ Average (3)</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2 pt-4 sm:pt-0">
                      <input
                        type="checkbox"
                        id="permission"
                        checked={newTestimonial.hasPermission}
                        onChange={(e) => setNewTestimonial({...newTestimonial, hasPermission: e.target.checked})}
                        className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <label htmlFor="permission" className="text-[10.5px] cursor-pointer text-slate-500 font-bold select-none">
                        Publish with my actual name on srfinserv.co
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Testimonial Statement</label>
                    <textarea
                      required
                      rows={3}
                      value={newTestimonial.testimonialText}
                      onChange={(e) => setNewTestimonial({...newTestimonial, testimonialText: e.target.value})}
                      placeholder="Discuss custom documents checked, communication quality or doorsteps notary registration ease..."
                      className="w-full bg-slate-50 border border-slate-100 focus:border-blue-600 focus:bg-white p-3 rounded-xl text-xs font-semibold outline-none transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3 rounded-xl shadow-xs transition-transform hover:shadow-sm"
                  >
                    Submit Verified Endorsement
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* FAQS SECTION */}
          {activeTab === 'home' && (
            <section className="py-16 bg-white">
              <div className="max-w-4xl mx-auto px-6">
                
                <div className="text-center max-w-2xl mx-auto mb-10">
                  <span className="text-xs uppercase tracking-widest text-brand-navy-600 font-extrabold">Got Questions?</span>
                  <h2 className="font-display text-2.5xl font-black text-slate-900 mt-1">Frequently Asked FAQs</h2>
                  <p className="text-xs text-slate-500 font-bold mt-2 leading-relaxed">
                    Clarify simple procedural elements and standard statutory laws.
                  </p>
                </div>

                <div id="faqs-list" className="space-y-4">
                  {FAQS.map((faq, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 select-none hover:bg-slate-50/50 transition-colors">
                      <div 
                        onClick={() => setFaqOpenIndex(faqOpenIndex === idx ? null : idx)}
                        className="flex justify-between items-center cursor-pointer font-bold text-slate-900 text-xs sm:text-sm font-display"
                      >
                        <span className="pr-4">{faq.question}</span>
                        <span className="bg-slate-100 text-slate-500 p-1.5 rounded-lg shrink-0">
                          {faqOpenIndex === idx ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </span>
                      </div>
                      {faqOpenIndex === idx && (
                        <p className="text-xs text-slate-500 leading-relaxed font-semibold mt-4.5 pt-4.5 border-t border-slate-200/60 font-sans">
                          {faq.answer}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

              </div>
            </section>
          )}

        </main>
      ) : (
        
        /* ADVISOR PORTAL CRM DASHBOARD - DEEP REDESIGNED SPLIT SCREEN CRM */
        <main className="flex-1 bg-slate-50 w-full animate-fade-in p-4 sm:p-6 lg:p-8">
          
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Main CRM Header Board */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-[10px] font-mono font-black border border-blue-105">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Real-time Secure Sync Enabled</span>
                </div>
                <h1 className="font-display font-black text-2.5xl text-brand-navy-900 tracking-tight">SR Finserv Advisor CRM Workspace</h1>
                <p className="text-xs text-slate-500 font-semibold">
                  Examine caller files, track doorstep schedules, configure status stages, and initiate direct secure client WhatsApp chats.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl text-left min-w-[125px]">
                  <span className="text-[10px] text-slate-400 font-bold block">Live Queue</span>
                  <span className="text-xl font-black text-brand-navy-900 font-display">
                    {leads.length} files
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsCrmMode(false);
                    setActiveTab('home');
                  }}
                  className="bg-brand-navy-900 hover:bg-brand-navy-800 text-white font-black text-xs px-5 py-3 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Exit Advisor Mode
                </button>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200/80 p-4 rounded-xl flex items-center gap-3.5 shadow-2xs">
                <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">🆕</div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">New</span>
                  <span className="text-lg font-bold font-display text-slate-900">{leads.filter(l => l.status === 'New').length} pending</span>
                </div>
              </div>
              <div className="bg-white border border-slate-200/80 p-4 rounded-xl flex items-center gap-3.5 shadow-2xs">
                <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center font-bold text-sm">💬</div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Contacted</span>
                  <span className="text-lg font-bold font-display text-slate-900">{leads.filter(l => l.status === 'Contacted').length} files</span>
                </div>
              </div>
              <div className="bg-white border border-slate-200/80 p-4 rounded-xl flex items-center gap-3.5 shadow-2xs">
                <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm">⚡</div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">In Progress</span>
                  <span className="text-lg font-bold font-display text-slate-900">{leads.filter(l => l.status === 'In Progress').length} active</span>
                </div>
              </div>
              <div className="bg-white border border-slate-200/80 p-4 rounded-xl flex items-center gap-3.5 shadow-2xs">
                <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center font-bold text-sm">✓</div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Resolved</span>
                  <span className="text-lg font-bold font-display text-slate-900">{leads.filter(l => l.status === 'Completed' || l.status === 'Closed').length} closed</span>
                </div>
              </div>
            </div>

            {/* Split Screen Workspace Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Leads Queue & Filters (4 Columns) */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* Search & Base Filter Controls */}
                <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-2xs space-y-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={crmSearchQuery}
                      onChange={(e) => setCrmSearchQuery(e.target.value)}
                      placeholder="Search name, phone, notes..."
                      className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-blue-600 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-400">Desk Type</label>
                      <select
                        value={crmTypeFilter}
                        onChange={(e: any) => setCrmTypeFilter(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-[11px] font-bold rounded-lg p-2 outline-none cursor-pointer"
                      >
                        <option value="all">All Desks</option>
                        <option value="loan">Loans Only</option>
                        <option value="legal">Legal Conveyance</option>
                        <option value="insurance">Premium Shield</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-400">Status Stage</label>
                      <select
                        value={crmStatusFilter}
                        onChange={(e: any) => setCrmStatusFilter(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-[11px] font-bold rounded-lg p-2 outline-none cursor-pointer"
                      >
                        <option value="all">All Statuses</option>
                        <option value="New">New Leads</option>
                        <option value="active">Active Leads</option>
                        <option value="resolved">Resolved Leads</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Vertical Leads Card List */}
                <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
                  {filteredCrmLeads.length === 0 ? (
                    <div className="bg-white border border-slate-200/80 p-8 rounded-2xl text-center">
                      <p className="text-xs text-slate-400 font-bold">No matching advisory inquiries found.</p>
                      <button
                        onClick={() => {
                          setCrmSearchQuery('');
                          setCrmTypeFilter('all');
                          setCrmStatusFilter('all');
                        }}
                        className="text-blue-600 text-[10px] font-black underline mt-2 block"
                      >
                        Clear Active Filters
                      </button>
                    </div>
                  ) : (
                    filteredCrmLeads.map((lead) => {
                      const isSelected = selectedLeadForEdit?.id === lead.id;
                      return (
                        <div
                          key={lead.id}
                          onClick={() => setSelectedLeadForEdit(lead)}
                          className={`bg-white border p-4.5 rounded-2xl cursor-pointer transition-all relative overflow-hidden select-none ${
                            isSelected
                              ? 'border-blue-600 shadow-md ring-2 ring-blue-50 bg-blue-50/10'
                              : 'border-slate-200/80 hover:border-slate-350 shadow-2xs hover:bg-slate-50/30'
                          }`}
                        >
                          {/* Colored indicator bar representing current status */}
                          <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                            lead.status === 'New' ? 'bg-blue-500' :
                            lead.status === 'Contacted' ? 'bg-amber-500' :
                            lead.status === 'In Progress' ? 'bg-indigo-500' :
                            lead.status === 'Completed' ? 'bg-emerald-500' :
                            'bg-slate-400'
                          }`} />

                          <div className="pl-2 space-y-2.5">
                            <div className="flex justify-between items-start gap-1">
                              <div>
                                <h4 className="font-display font-black text-slate-900 text-xs sm:text-sm tracking-tight">
                                  {lead.fullName}
                                </h4>
                                <span className="text-[10px] text-slate-500 font-bold block mt-0.5">📞 {lead.phone}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[8.5px] uppercase font-mono font-black shrink-0 border ${
                                lead.status === 'New' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                lead.status === 'Contacted' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                lead.status === 'In Progress' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                lead.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                'bg-slate-50 text-slate-600 border-slate-100'
                              }`}>
                                {lead.status}
                              </span>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100/80">
                              <span className="text-[9px] uppercase tracking-wide font-black text-slate-400 flex items-center gap-1.5">
                                <span>{lead.leadType === 'loan' ? '🏦' : lead.leadType === 'legal' ? '📜' : '🛡️'}</span>
                                <span className="truncate max-w-[120px]">{lead.subType}</span>
                              </span>
                              <span className="text-[9px] font-mono text-slate-405">
                                {new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Detailed Workspace & Interactions (8 Columns) */}
              <div className="lg:col-span-8">
                {selectedLeadForEdit ? (
                  <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden animate-[fade-in_0.3s_ease-out]">
                    
                    {/* Workspace details header */}
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{selectedLeadForEdit.leadType === 'loan' ? '🏦' : selectedLeadForEdit.leadType === 'legal' ? '📜' : '🛡️'}</span>
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">{selectedLeadForEdit.subType}</span>
                        </div>
                        <h2 className="font-display font-black text-xl text-slate-900 mt-1">{selectedLeadForEdit.fullName}</h2>
                        <p className="text-[10px] text-slate-450 font-mono mt-0.5">ID Ref: {selectedLeadForEdit.id}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        {/* Instant WhatsApp launcher with client prefill */}
                        <a
                          href={`https://wa.me/${selectedLeadForEdit.phone.replace(/[^0-9]/g, '') || '918487974404'}?text=${encodeURIComponent(
                            `Hello ${selectedLeadForEdit.fullName}, this is Sanket Champaneri from SR Finserv. I'm reviewing your doorstep ${selectedLeadForEdit.subType} inquiry file. Shall I call you regarding this?`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 bg-[#25D366] hover:bg-emerald-600 rounded-xl text-white font-black text-xs inline-flex items-center gap-1.5 transition-transform shadow-xs cursor-pointer hover:scale-102"
                          title="Generate instant WhatsApp chat connection"
                        >
                          <span className="text-sm">💬</span> WhatsApp Care
                        </a>
                        
                        <a
                          href={`tel:${selectedLeadForEdit.phone}`}
                          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs inline-flex items-center cursor-pointer"
                          title="Dial phone number"
                        >
                          <Phone className="w-4 h-4 shrink-0" />
                        </a>
                      </div>
                    </div>

                    {/* Detailed info blocks */}
                    <div className="p-6 space-y-6">
                      
                      {/* Grid contacts */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact Phone No.</span>
                          <span className="text-sm font-black text-slate-900 block mt-1 font-mono">{selectedLeadForEdit.phone}</span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Client Email ID</span>
                          <span className="text-sm font-black text-slate-900 block mt-1 truncate">{selectedLeadForEdit.email || 'None Provided'}</span>
                        </div>
                      </div>

                      {/* Submitted context details statement */}
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase tracking-wide font-black text-slate-405 block">Client Message Submission</span>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-xs font-semibold text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {selectedLeadForEdit.details || "No secondary requirements described."}
                        </div>
                      </div>

                      {/* Interactive Visual Status Progression Timeline Stepper (Milestone Lifeline) */}
                      <div className="space-y-3 pt-2">
                        <span className="text-[10px] uppercase tracking-wide font-black text-slate-400 block">Configure Milestone Lifeline</span>
                        
                        <div className="relative pt-4 pb-2">
                          {/* Horizontal Connector Line */}
                          <div className="absolute top-[25px] left-8 right-8 h-1 bg-slate-150 -z-0 rounded" />
                          
                          <div className="relative z-10 grid grid-cols-5 gap-1 text-center">
                            {(['New', 'Contacted', 'In Progress', 'Completed', 'Closed'] as InquiryLead['status'][]).map((st, i) => {
                              const isActive = selectedLeadForEdit.status === st;
                              
                              // Check if this step is past/resolved
                              const statusesOrder = ['New', 'Contacted', 'In Progress', 'Completed', 'Closed'];
                              const currentIndex = statusesOrder.indexOf(selectedLeadForEdit.status);
                              const stepIndex = statusesOrder.indexOf(st);
                              const isCompletedStep = stepIndex <= currentIndex;

                              let colorTheme = "bg-blue-600";
                              if (st === 'Contacted') colorTheme = "bg-amber-500";
                              else if (st === 'In Progress') colorTheme = "bg-indigo-600";
                              else if (st === 'Completed') colorTheme = "bg-emerald-600";
                              else if (st === 'Closed') colorTheme = "bg-rose-500";

                              return (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => handleCrmUpdateStatus(selectedLeadForEdit.id, st)}
                                  className="group flex flex-col items-center focus:outline-none cursor-pointer"
                                  title={`Move to ${st}`}
                                >
                                  {/* Step Indicator Dot */}
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                                    isActive 
                                      ? `${colorTheme} border-white shadow-md ring-4 ring-slate-150 text-white scale-110` 
                                      : isCompletedStep
                                        ? `${colorTheme} border-transparent text-white`
                                        : "bg-white border-slate-300 text-slate-400 group-hover:border-slate-450"
                                  }`}>
                                    {isActive ? (
                                      <span className="text-[9px] font-bold">✓</span>
                                    ) : isCompletedStep ? (
                                      <span className="text-[9px]">✓</span>
                                    ) : (
                                      <span className="text-[9px] font-bold font-mono">{i + 1}</span>
                                    )}
                                  </div>

                                  {/* Step Label */}
                                  <span className={`text-[9.5px] uppercase font-black mt-2.5 transition-colors ${
                                    isActive 
                                      ? "text-brand-navy-900 font-extrabold" 
                                      : isCompletedStep
                                        ? "text-slate-700" 
                                        : "text-slate-400 group-hover:text-slate-600"
                                  }`}>
                                    {st}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Interactive private notes board with instant live update trigger */}
                      <div className="space-y-2 pt-4 border-t border-slate-100">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase tracking-wide font-black text-slate-400">Private Advisor Status Notes</span>
                          {selectedLeadForEdit.notes ? (
                            <span className="text-[9px] text-emerald-600 font-bold block">✓ Documented log</span>
                          ) : (
                            <span className="text-[9px] text-slate-400 block font-semibold">Empty note block</span>
                          )}
                        </div>
                        <div className="space-y-2">
                          <textarea
                            rows={3}
                            value={localNoteText}
                            onChange={(e) => setLocalNoteText(e.target.value)}
                            placeholder="Type confidential updates here: 'Waiting on home valuation papers', 'CIBIL report checks passed', 'Doorstep callback booked for Saturday afternoon'..."
                            className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white p-3 rounded-xl text-xs font-semibold outline-none transition-all resize-none"
                          />
                          <div className="flex justify-between items-center">
                            <p className="text-[10px] text-slate-400 font-medium">Internal advisor notes persist automatically upon clicking Save.</p>
                            <button
                              type="button"
                              onClick={() => handleCrmUpdateNote(selectedLeadForEdit.id, localNoteText)}
                              className="px-4 py-2 bg-brand-navy-900 hover:bg-brand-navy-800 text-white font-extrabold text-[10.5px] rounded-lg shadow-xs transition-colors cursor-pointer"
                            >
                              Save Advisor Note
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Trash action bottom bar */}
                      <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                        <span className="text-[10.5px] text-slate-400 font-mono">
                          Submitted on: {new Date(selectedLeadForEdit.createdAt).toLocaleString()}
                        </span>
                        <button
                          onClick={() => {
                            const removeId = selectedLeadForEdit.id;
                            handleCrmDeleteLead(removeId).then(() => {
                              setSelectedLeadForEdit(null);
                            });
                          }}
                          className="text-red-500 hover:text-red-700 font-extrabold hover:underline"
                        >
                          Remove Inquiry permanently
                        </button>
                      </div>

                    </div>

                  </div>
                ) : (
                  <div className="space-y-6 h-full flex flex-col">
                    {/* Welcome interactive guidance block (making CRM instantly visual and easy to understand) */}
                    <div className="bg-white border border-slate-200 bg-linear-to-b from-white to-slate-50/50 rounded-2xl p-8 shadow-2xs flex-1 flex flex-col justify-center items-center min-h-[450px]">
                      
                      <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-2xl mb-4 shadow-2xs animate-pulse">
                        🔎
                      </div>
                      
                      <div className="text-center space-y-2 max-w-md">
                        <h3 className="font-display font-black text-slate-800 text-base">Select callback file</h3>
                        <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                          To search or manage advisor records, click on any client card in the left queue. This lets you log private status updates, trigger doorstep progressions, or initiate direct client WhatsApp dispatches instantly.
                        </p>
                      </div>

                      {/* Visual onboarding playbook */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-8 max-w-2xl w-full">
                        <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl text-center space-y-1.5 shadow-3xs">
                          <span className="text-lg">📂</span>
                          <h5 className="font-display font-black text-slate-800 text-[11px]">1. Browse Queue</h5>
                          <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">Filter by specific Loans, Conveyance or Shield desks.</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl text-center space-y-1.5 shadow-3xs">
                          <span className="text-lg">⚡</span>
                          <h5 className="font-display font-black text-slate-800 text-[11px]">2. Tap Lifeline</h5>
                          <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">Update progress with the visual Milestone Progression Stepper.</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl text-center space-y-1.5 shadow-3xs">
                          <span className="text-lg">💬</span>
                          <h5 className="font-display font-black text-slate-800 text-[11px]">3. WhatsApp Care</h5>
                          <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">Trigger instant direct consultation chats with pre-composed messages.</p>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Collapsible Session Telemetry Console at the Bottom - Out of primary focus! */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              
              {/* Collapsible Header Accordion button */}
              <details className="group">
                <summary className="p-5 flex justify-between items-center font-bold text-slate-900 text-xs sm:text-sm font-display cursor-pointer select-none">
                  <div className="flex items-center gap-2">
                    <span>📡</span>
                    <h3 className="font-display font-black text-slate-900 text-sm">Advanced Web Visitor Telemetry Console</h3>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-md font-bold">
                      {visitorLog.length} entry logs
                    </span>
                  </div>
                  <span className="bg-slate-100 text-slate-500 p-1.5 rounded-lg shrink-0 transition-transform group-open:rotate-180">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </span>
                </summary>

                {/* Collapsed content body */}
                <div className="p-6 border-t border-slate-100 space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-150">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Visited Sessions</span>
                      <span className="text-lg font-black text-slate-800 block mt-1">{visitorLog.length} logged</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-150">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Mobile Access Rate</span>
                      <span className="text-lg font-black text-slate-800 block mt-1">
                        {visitorLog.length > 0 ? (visitorLog.filter(v => v.isMobile).length / visitorLog.length * 100).toFixed(0) : 0}% mobile
                      </span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-150">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Primary Web Referrer</span>
                      <span className="text-lg font-black text-slate-800 block mt-1 truncate">
                        {visitorLog.length > 0 ? visitorLog[0].referrer : 'Direct'}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-150">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Sync status</span>
                      <span className="text-lg font-black text-emerald-600 block mt-1">✓ Active Log</span>
                    </div>
                  </div>

                  {/* Web logging records table */}
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs font-sans text-slate-600 border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 font-extrabold uppercase text-[10px] tracking-wider text-slate-500">
                          <th className="p-3">Visited at</th>
                          <th className="p-3">Referencing site</th>
                          <th className="p-3">Platform classification</th>
                          <th className="p-3">Technical UserAgent</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visitorLog.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-8 text-center font-bold text-slate-400">
                              Analytics engine waiting for web traffic session logs.
                            </td>
                          </tr>
                        ) : (
                          visitorLog.slice(0, 20).map((v) => (
                            <tr key={v.id} className="border-b border-slate-100 text-[11px] hover:bg-slate-50/50">
                              <td className="p-3 whitespace-nowrap font-mono text-slate-500">
                                {new Date(v.visitedAt).toLocaleString()}
                              </td>
                              <td className="p-3 font-semibold text-brand-navy-900 truncate max-w-xs" title={v.referrer}>
                                {v.referrer}
                              </td>
                              <td className="p-3 whitespace-nowrap font-mono text-slate-500">
                                {v.isMobile ? '📱 Mobile' : '💻 Desktop'} ({v.screenWidth}x{v.screenHeight})
                              </td>
                              <td className="p-3 max-w-sm truncate text-slate-450" title={v.userAgent}>
                                {v.userAgent}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </details>

            </div>

          </div>

        </main>
      )}

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-12 px-6 mt-16 text-xs font-semibold">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="bg-white px-5 py-4 rounded-2xl text-blue-800 border border-blue-100 shadow-md space-y-2 text-center md:text-left max-w-xs">
            <h5 className="font-display font-black text-blue-600 text-sm">SR Finserv Advisory</h5>
            <p className="leading-relaxed text-[11px] text-blue-900 font-bold">
              Direct doorstep underwrite representation and title conveyance checks in Ahmedabad. Dedicated to maximum convenience and zero bank queue struggles.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-slate-300 font-bold justify-center">
            <button onClick={() => { setActiveTab('home'); setIsCrmMode(false); }} className="hover:text-white transition-colors">Home Page</button>
            <button onClick={() => { setActiveTab('story'); setIsCrmMode(false); }} className="hover:text-white transition-colors">About Us</button>
            <button onClick={() => { setActiveTab('services'); setServicesCategoryFilter('all'); setIsCrmMode(false); }} className="hover:text-white transition-colors">Bespoke Services</button>
            <button onClick={() => { setActiveTab('checklist'); setIsCrmMode(false); }} className="hover:text-white transition-colors">Compliance Checklist</button>
            <button onClick={() => { setActiveTab('reviews'); setIsCrmMode(false); }} className="hover:text-white transition-colors">Client Reviews</button>
            <button onClick={() => { setActiveTab('contact'); setIsCrmMode(false); }} className="hover:text-white transition-colors">Submit Callback</button>
          </div>

          <div className="text-center md:text-right space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block">Sanket Champaneri</span>
            <p className="text-[11px] font-mono select-none">© {new Date().getFullYear()} srfinserv.co. Ahmedabad, Gujarat.</p>
          </div>
        </div>
      </footer>



      {/* INBUILT DIRECT 1-CLICK CONNECTION MODAL */}
      {inbuiltDirectModal?.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-[99999] animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 flex flex-col justify-between transform transition-all scale-100 pb-2">
            
            {/* Modal Header */}
            <div className="bg-brand-navy-900 text-white p-6 relative">
              <button 
                type="button" 
                onClick={() => setInbuiltDirectModal(null)}
                className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-lg font-black transition-colors"
                title="Dismiss"
              >
                ✕
              </button>
              
              <>
                <span className="text-[9px] uppercase font-black tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full inline-block mb-2 font-mono">
                  {loanStep === 3 ? "Submission Complete" : `Step ${loanStep} of 2: Inquiry Desk`}
                </span>
                <h3 className="font-display font-black text-xl tracking-tight leading-tight">
                  {loanStep === 3 ? "Inquiry Received!" : "Get a Callback"}
                </h3>
                <p className="text-[11px] text-slate-300 font-medium leading-relaxed mt-1.5 font-sans">
                  {loanStep === 1 && `Regarding ${inbuiltDirectModal.title}: How much loan are you looking for?`}
                  {loanStep === 2 && `Regarding ${inbuiltDirectModal.title}: In which area/city are you seeking this?`}
                  {loanStep === 3 && `Thank you for visit! Our representative will reach you in one hour.`}
                </p>
              </>
            </div>

            {/* Custom Multi-Step Questionnaire Wizard for all types */}
            <div className="p-6 font-sans">
              {/* STEP 1: Q1 HOW MUCH LOAN ARE YOU LOOKING FOR? */}
              {loanStep === 1 && (
                <div className="space-y-4">
                  <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
                    1) How much loan are you looking for? <span className="text-blue-600">*</span>
                  </label>
                  
                  {/* Prestigious pre-defined selection chips */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      '₹15 - 30 Lakhs',
                      '₹30 - 50 Lakhs',
                      '₹50 - 99 Lakhs',
                      '₹1 Cr - 3 Crore',
                      '₹3 Crore+'
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setLoanAmount(preset);
                          setLoanStep(2);
                        }}
                        className={`py-2 px-3 rounded-xl border text-[11px] font-bold text-center transition-all ${
                          loanAmount === preset 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/20'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <span className="block text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mb-1.5">Or write custom amount:</span>
                    <input 
                      type="text"
                      placeholder="e.g. 45 Lakhs, 1.2 Crores"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-brand-navy-900 font-bold focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={!loanAmount.trim()}
                      onClick={() => setLoanStep(2)}
                      className={`w-full text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition-colors uppercase tracking-wider text-center ${
                        loanAmount.trim() ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer' : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      Next Step: Location Area →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Q2 IN WHICH AREA IN CITY? */}
              {loanStep === 2 && (
                <div className="space-y-4">
                  <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
                    2) In which area in city? <span className="text-blue-600">*</span>
                  </label>

                  {/* Neighborhood selector chips in Ahmedabad */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Prahladnagar',
                      'Bopal',
                      'Satellite',
                      'Bodakdev',
                      'Vastrapur',
                      'S G Highway',
                      'C G Road'
                    ].map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => {
                          setLoanArea(area);
                        }}
                        className={`py-1.5 px-3 rounded-full border text-[10px] font-extrabold transition-all ${
                          loanArea === area 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-blue-50/20'
                        }`}
                      >
                        {area}
                      </button>
                    ))}
                  </div>

                  <div className="pt-1">
                    <span className="block text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mb-1.5">Or type specialized location:</span>
                    <input 
                      type="text"
                      placeholder="e.g. Gota, Chandkheda, Shahibaug"
                      value={loanArea}
                      onChange={(e) => setLoanArea(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-brand-navy-900 font-bold focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setLoanStep(1)}
                      className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-3 rounded-xl transition-colors uppercase tracking-wider text-center"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      disabled={!loanArea.trim()}
                      onClick={handleLoanFlowSubmit}
                      className={`w-2/3 text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition-colors uppercase tracking-wider text-center ${
                        loanArea.trim() ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer' : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      Get a Callback
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: THANK YOU SCREEN */}
              {loanStep === 3 && (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto shadow-inner animate-bounce">
                    ✓
                  </div>
                  
                  <div className="space-y-2 px-1">
                    <h4 className="font-display font-black text-brand-navy-900 text-lg leading-snug">
                      Thank you for providing details!
                    </h4>
                    <p className="text-xs text-emerald-950 font-black bg-emerald-50 border border-emerald-100 py-3.5 px-4 rounded-xl leading-relaxed">
                      Thank you for visit our representative will reach you in one hour.
                    </p>
                    <p className="text-[11px] text-slate-500 font-semibold leading-relaxed pt-1">
                      Sanket Champaneri has been double-notified regarding your exact loan requirement: <strong className="text-slate-800">{loanAmount}</strong> in <strong className="text-slate-800">{loanArea}</strong>.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setInbuiltDirectModal(null)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3 rounded-xl transition-colors uppercase tracking-wider text-center"
                  >
                    Close Desk
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
