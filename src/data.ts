import { LoanService, LegalService, InsuranceService, InquiryLead, ClientTestimonial } from './types';

export const LOAN_SERVICES: LoanService[] = [
  {
    id: 'home-loan',
    title: 'Home Loans',
    description: 'Fulfill your dream of owning a home with competitive interest rates and tailored repayment structures.',
    maxAmount: 'Up to ₹10 Crores',
    interestRateMin: '8.40% p.a.',
    tenureMax: '30 Years',
    features: [
      'Flexible repayment tenures up to 30 years',
      'Minimal documentation & quick processing',
      'Balance transfer option with top-up facility',
      'Expert advice throughout the home acquisition journey'
    ],
    documents: [
      'ID Proof (PAN, Aadhaar)',
      'Address Proof',
      'Salary Slips (Last 3 months) or ITR (Last 2 years)',
      'Bank Statements (Last 6 months)',
      'Property Documents (Title deed, Sale agreement)'
    ]
  },
  {
    id: 'business-loan',
    title: 'Business Loans',
    description: 'Grow your business, buy inventory, or expand operations with swift unsecured & secured loan packages.',
    maxAmount: 'Up to ₹2 Crores',
    interestRateMin: '11.50% p.a.',
    tenureMax: '5 Years',
    features: [
      'No collateral required for unsecured lines',
      'Speedy approval & disbursement cycle',
      'Special programs for MSMEs and Women Entrepreneurs',
      'Structured EMI plans matching your business cashflows'
    ],
    documents: [
      'ID & Address Proof of Promoters',
      'Business Registration Proof (GSTIN, MSME, Udyam)',
      'ITR and Audited Financials (Last 2 years)',
      'Bank Account Statements (Last 12 months)',
      'Existing loan track record (if any)'
    ]
  },
  {
    id: 'property-loan',
    title: 'Loan Against Property (LAP)',
    description: 'Unlock the hidden equity value of your residential or commercial property for personal or commercial needs.',
    maxAmount: 'Up to ₹15 Crores (65% of Value)',
    interestRateMin: '9.00% p.a.',
    tenureMax: '15 Years',
    features: [
      'Lower interest rates compared to personal loans',
      'Both occupied & rented properties eligible',
      'Continued usage of your property while servicing the loan',
      'High-value ticket sizes for major commercial expansion'
    ],
    documents: [
      'KYC documents of all co-applicants',
      'Income proof: ITR or Form 16 / Salary Slips',
      'Original Chain of Property Title Documents',
      'Approved Building Plan & Tax receipts',
      'Last 6 months primary bank account transactions'
    ]
  },
  {
    id: 'personal-loan',
    title: 'Personal Loans',
    description: 'Get immediate financial assistance for medical emergencies, travel, weddings, or debt consolidation without collateral.',
    maxAmount: 'Up to ₹25 Lakhs',
    interestRateMin: '10.99% p.a.',
    tenureMax: '7 Years',
    features: [
      '100% paperless and custom structured application',
      'Disbursal in as little as 24-48 hours',
      'No collateral or security deposit required',
      'Transparent charges with absolute zero hidden costs'
    ],
    documents: [
      'PAN Card & Aadhaar',
      'Last 3 months certified Salary Slips',
      'Last 6 months Bank Account Statements',
      'Employee ID Card photocopy'
    ]
  }
];

export const LEGAL_SERVICES: LegalService[] = [
  {
    id: 'title-search',
    title: 'Title Search & Legal Opinion',
    description: 'Verify the complete history of property ownership to prevent legal disputes and ensure a clean, marketable title.',
    estimatedTimeline: '3 - 5 Working Days',
    importance: 'Mandatory for bank loan sanctions and to guarantee that a seller owns absolute rights to transfer the property.',
    processSteps: [
      'Verification of Mother Deed and Chain of Title deeds at Sub-Registrar Office',
      'Checking and drafting Encumbrance Certificate (EC) report for 13 to 30 years',
      'Reviewing approved layouts, tax paid receipts, and khata certificates',
      'Issuance of formal, signed Legal Opinion Certificate by certified advocates'
    ],
    documentsRequired: [
      'Copy of latest Sale Deed / Parent Deeds',
      'Khata Certificate and Extract',
      'Encumbrance Certificate (EC)',
      'Tax Paid Receipts (Current year)',
      'Approved Building Plan / Layout NOC'
    ]
  },
  {
    id: 'deed-drafting',
    title: 'Sale Deed & Agreement to Sale',
    description: 'Professional, legally binding preparation of Agreements to Sale, Conveyance Sale Deeds, Gift Deeds, and lease licenses crafted under the Registration Act.',
    estimatedTimeline: '1 - 2 Working Days',
    importance: 'Airtight drafting safeguards both the buyer and seller by establishing transparent payout, possession clauses, and indemnities.',
    processSteps: [
      'Personal briefing to confirm commercial value, earnest deposit, and balance terms',
      'First copy draft prepared by specialized real estate legal counsel',
      'Unlimited revisions with buyer-seller mutual confirmation calls',
      'Final print-ready legal document formatted for stamp paper and witness signings'
    ],
    documentsRequired: [
      'Identity documents of all purchasing and selling parties (Aadhaar & PAN)',
      'Prior parent deeds, chain title files, and possession certificates',
      'Agreed transaction value, earnest advances, and balance schedules',
      'Municipal tax assessment bill and khata extract copy'
    ]
  },
  {
    id: 'power-of-attorney',
    title: 'Power of Attorney (PoA)',
    description: 'Drafting of General (GPA) and Special Power of Attorney (SPA) resources to legally empower trusted representatives to execute decisions on your behalf.',
    estimatedTimeline: '1 Working Day',
    importance: 'Indispensable for NRI property transactions, busy business executives, or elderly buyers who cannot physically attend municipal registrations.',
    processSteps: [
      'Determining specific realms of authority (handling bank loans, signing deeds, or court representation)',
      'Airtight draft formatting highlighting revocability or durational conditions',
      'Review of the draft with the appointed executive agent',
      'Coordination of legal stamp duty printouts for signatures and notary attestation'
    ],
    documentsRequired: [
      'Principal and attorney-holder KYC (Aadhaar, PAN, Passport-size Photo)',
      'Purpose documents (e.g. details of the property or bank loans to be managed)',
      'Two passport-size photos of both parties'
    ]
  },
  {
    id: 'affidavits-drafting',
    title: 'Affidavit & Declaration Panels',
    description: 'Expert drafting of legal affidavits, family declarations, name-change announcements, address corrections, and income certificates.',
    estimatedTimeline: 'Same-Day Delivery',
    importance: 'Verifies personal declarations on stamp paper for government, municipal offices, or banking approvals.',
    processSteps: [
      'Gathering accurate demographic statements and declare details',
      'Drafting the structural layout under legal validation criteria',
      'Filing on appropriate non-judicial stamp paper value',
      'Notarial stamp placement for instant compliance dispatch'
    ],
    documentsRequired: [
      'Declarant passport or Aadhaar card for KYC verification',
      'Supportive documentary proofs related to the specific declaration',
      'Specified stamp paper value (we arrange this on your behalf)'
    ]
  },
  {
    id: 'notary-attestation',
    title: 'Certified Notary Services',
    description: 'Attestation of copies, execution of oaths, signature validations, and certified true copies administered by authorized Notary Public.',
    estimatedTimeline: 'Instant (While You Wait)',
    importance: 'Prevents fraudulent document transactions and gives documents absolute legal authenticity before global bank lenders or municipal registries.',
    processSteps: [
      'Physical inspection of original certificates alongside copy sets',
      'Authentication of signatures on central registrar logs',
      'Affixing the official Notary holographic red/green seal and signature notation',
      'Registry book entry log for certified status protection'
    ],
    documentsRequired: [
      'Original source documents to be certified (Degrees, Passports, Deeds, etc.)',
      'Clear high-resolution photocopy sets for verification matching',
      'Physical presence of the signing authorities'
    ]
  }
];

export const INSURANCE_SERVICES: InsuranceService[] = [
  {
    id: 'term-life-insurance',
    title: 'Term Life Insurance',
    description: 'Ensure absolute financial protection and stability for your family with large sum-assured packages in case of unforeseen events.',
    category: 'Life',
    maxCoverage: 'Up to ₹5 Crores',
    premiumStart: 'Starting ₹450 / Month',
    features: [
      'Pure term cover for high financial liabilities',
      'Option to add Critical Illness and Accidental Death benefits',
      'Tax savings up to ₹1.5 Lakhs under Section 80C',
      'Flexible payout options (Lump sum, monthly, or combination)'
    ],
    documents: [
      'Identity Proof (Aadhaar, Passport)',
      'Income Proof (Form 16, ITR, last 3 months salary slips)',
      'Recent Passport-size Photograph',
      'Medical Check-up reports (arranged free)'
    ]
  },
  {
    id: 'health-insurance',
    title: 'Comprehensive Health Cover',
    description: 'Protect your self and your family against rising medical inflation with cashless hospitalizations across 10,000+ top network hospitals.',
    category: 'General',
    maxCoverage: 'Up to ₹1 Crore',
    premiumStart: 'Starting ₹350 / Month',
    features: [
      'Cashless treatments and diagnostic covers inside Network Hospitals',
      'No Claim Bonus renewals and restoration benefits',
      'Coverage for pre and post-hospitalization costs & day-care routines',
      'Tax deductions on premium paid under Section 80D'
    ],
    documents: [
      'KYC documents of all family members to be insured',
      'Prior medical history declaration details',
      'Age Proof (Birth certificate, Board certificate)'
    ]
  },
  {
    id: 'motor-vehicle-insurance',
    title: 'Motor & Fleet Insurance',
    description: 'Get comprehensive damage or third-party liability insurance for your personal cars, commercial trucks, or corporate fleet vectors.',
    category: 'General',
    maxCoverage: 'IDV (Insured Declared Value)',
    premiumStart: 'Starting ₹150 / Month',
    features: [
      'Cashless repairs at premium workshops nationwide',
      'Engine protection, zero-depreciation and roadside aid options',
      'Instant policy issuance and paperless transfer process',
      'Attractive No Claim Bonus (NCB) transfer allowances'
    ],
    documents: [
      'Vehicle Registration Certificate (RC Book)',
      'Previous year policy copy (for NCB transfer)',
      'Driving License copy and Owner KYC'
    ]
  },
  {
    id: 'property-asset-insurance',
    title: 'Property & Business Asset Insurance',
    description: 'Secure your residential villa, retail store, factory machinery, or office infrastructure against fire, natural disasters, and burglary.',
    category: 'General',
    maxCoverage: 'Based on Asset Valuation',
    premiumStart: 'Custom Quote',
    features: [
      'Comprehensive fire, earthquake, lightning, and flood security cover',
      'Machinery breakdown and business interruption restoration options',
      'Burglary, theft, and employee fidelity protection add-ons',
      'Fast, structured claims support and expert surveyor evaluations'
    ],
    documents: [
      'Property title deeds or rental lease agreements',
      'Detailed inventory stock book registers and invoice copies',
      'Machinery specifications & valuation certificates'
    ]
  }
];

export const INITIAL_LEADS: InquiryLead[] = [
  {
    id: 'lead-1',
    fullName: 'Rajesh Kumar',
    phone: '+91 84879 74404',
    email: 'rajesh.kumar@example.com',
    leadType: 'loan',
    subType: 'Home Loan',
    amount: 4500000,
    details: 'Interested in buying a 2BHK flat near Prahladnagar, Ahmedabad. Need a home loan of approx 45 Lakhs. Looking for banks with lowest interest rate options.',
    status: 'In Progress',
    createdAt: '2026-06-18T14:32:00Z',
    notes: 'Called Rajesh on June 18. He has a stable salary account with SBI. Eligible for ~8.45% ROI. Awaiting digital income statement upload.',
    bestTimeToCall: 'Evenings 5 PM - 7 PM'
  },
  {
    id: 'lead-2',
    fullName: 'Ananya Sharma',
    phone: '+91 87654 32109',
    email: 'ananya.sh@example.com',
    leadType: 'legal',
    subType: 'Title Search & Legal Opinion',
    details: 'Acquiring an ancestral plot of land in Ahmedabad. Need a complete historical title verification check and legal opinion to proceed with sale agreement.',
    status: 'New',
    createdAt: '2026-06-19T08:15:00Z',
    bestTimeToCall: 'Anytime'
  },
  {
    id: 'lead-3',
    fullName: 'SR Enterprises (Sanjay)',
    phone: '+91 76543 21098',
    email: 'sanjay@srenterprises.com',
    leadType: 'loan',
    subType: 'Business Loan',
    amount: 2500000,
    details: 'Expanding manufacturing warehouse capacity near Venus Alpha Market. Looking for a cash flow business loan of 25 Lakhs, preferably within 10 days. GST registration active.',
    status: 'Contacted',
    createdAt: '2026-06-17T11:00:00Z',
    notes: 'Spoke regarding Udyam MSME certificate and GST audits. Sent list of documents required. Promised to email documents today.',
    bestTimeToCall: 'Mornings 10 AM - 12 PM'
  }
];

export const FAQS = [
  {
    question: 'How many years of industry experience do you have?',
    answer: 'Our principal consultant, Sanket Bhavsar, has a total of 7 years of hands-on experience working directly in professional bank loans departments, followed by 2 years running our specialized independent legal & loan advisory. This combined 9-year corporate backing gives our clients unmatched leverage with private and public banks.'
  },
  {
    question: 'Where is your physical office located in Ahmedabad?',
    answer: 'Our primary headquarters is located at: Office No. 87, Venus Alfa Market, Venus Atlantis, Near Shell Petrol Pump, Prahladnagar, Ahmedabad - 380015. You are welcome to book a priority in-person appointments.'
  },
  {
    question: 'What kind of real estate legal agreements can you draft?',
    answer: 'We draft and notarize Sale Deeds (Deed of Conveyance), Agreements to Sale, General & Special Power of Attorney (PoA), certified Affidavits, Partnership Deeds, and coordinate Slot Booking at local Sub-Registrar offices.'
  },
  {
    question: 'How do you simplify complicated bank loan processes?',
    answer: 'Armed with 7 years inside major loans departments, Sanket evaluates your exact application the way top banks do. We correct documentation flaws, structure tax & business files correctly, match you with appropriate banking partnerships, and negotiate the lowest possible loan rates.'
  },
  {
    question: 'Do you charge clients upfront fees for diagnostic checks?',
    answer: 'No. Our primary eligibility diagnostics and first advisory consultations are free of charge. We maintain complete transparency and are dedicated to saving our customers time and interest expense.'
  }
];

export const INITIAL_TESTIMONIALS: ClientTestimonial[] = [
  {
    id: 'test-1',
    clientName: 'Rajesh K. Bhavsar',
    serviceUsed: 'Home Loan Advisory',
    testimonialText: 'SR Finserv made the impossible possible. My bank home loan was stuck over minor municipal layout approvals, but their deep legal understanding and direct bank integrations secured a sanction of ₹48 Lakhs inside of 5 working days!',
    hasPermission: true,
    rating: 5,
    status: 'Approved',
    createdAt: '2026-05-12T09:15:00Z'
  },
  {
    id: 'test-2',
    clientName: 'Priya Deshmukh',
    serviceUsed: '30-Year Title Search & Legal Opinion',
    testimonialText: 'Very professional 30-year deed search report. They dug out ancient sub-registrar archives of the land package near Thane and delivered an airtight status report. The legal team is efficient and communicative!',
    hasPermission: true,
    rating: 5,
    status: 'Approved',
    createdAt: '2026-06-02T14:30:00Z'
  },
  {
    id: 'test-3',
    clientName: 'Anand Singh (MSME Owner)',
    serviceUsed: 'Loan Against Property',
    testimonialText: 'I’m extremely pleased with SR Finserv. Sanket evaluated my self-employed business cash flows and guided me past strict CIBIL requirements, arranging our LAP project at a fantastic 9.0% interest. Transparent, no surprise commissions.',
    hasPermission: true,
    rating: 5,
    status: 'Approved',
    createdAt: '2026-06-10T11:45:00Z'
  },
  {
    id: 'test-4',
    clientName: 'Anonymous Client',
    serviceUsed: 'Business Expansion Funding',
    testimonialText: 'Needed ₹25 Lakhs immediately for raw inventory stocking. Sanket organized our collateral-free MSME files and got the funds disbursed rapidly in 36 hours. Extremely thankful for the option to submit feedback without my name listed.',
    hasPermission: false,
    rating: 5,
    status: 'Approved',
    createdAt: '2026-06-14T17:00:00Z'
  }
];

