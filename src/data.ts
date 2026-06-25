import { LoanService, LegalService, InsuranceService, InquiryLead, ClientTestimonial } from './types';

export const LOAN_SERVICES: LoanService[] = [
  {
    id: 'home-loan',
    title: 'Home Loans (Buying, Building, Renovating)',
    description: 'Competitive interest rates with seamless approval on any residential property, flats, plots, or customized self-construction doorstep assistance.',
    maxAmount: '',
    interestRateMin: 'From 7.20% p.a.',
    tenureMax: '',
    features: ['Doorstep document collection', 'SBI, HDFC & top national banks compare', 'Speedy file sanctioning'],
    documents: ['Aadhaar & PAN Card', 'Income Proofs (Salary Slips / ITR)', 'Bank Statements']
  },
  {
    id: 'business-loan',
    title: 'Business Loans (Secured & Collateral-Free)',
    description: 'Grow your enterprise with quick-turnaround limits, collateral-free MSME schemes, and custom industrial commercial term loans.',
    maxAmount: '',
    interestRateMin: 'Competitive MSME Rates',
    tenureMax: '',
    features: ['MSME-friendly fast approval', 'Minimal financial documentation options', 'No hidden upfront charges'],
    documents: ['GST Returns', 'P&L & Balance Sheet', 'KYC Documents']
  },
  {
    id: 'working-capital',
    title: 'Working Capital Limit (OD, CC, BG & LC)',
    description: 'Scale daily corporate liquid cash flows easily. Customized Cash Credit (CC) limits, Overdraft (OD) facilities, Bank Guarantees, and Letters of Credit.',
    maxAmount: '',
    interestRateMin: 'Custom Corporate Rates',
    tenureMax: '',
    features: ['Interest computed only on drawn funds', 'Flexible repayment with zero penalties', 'Instant annual renewal coordination'],
    documents: ['3 Years Audit Reports', 'GST Returns & Ledger', 'Bank Statements']
  },
  {
    id: 'loan-against-property',
    title: 'Loan Against Property (LAP) & CC Limit',
    description: 'Unlock the liquid strength of your physical residential, commercial, or industrial land assets with higher loan-to-value (LTV) limits.',
    maxAmount: '',
    interestRateMin: 'Attractive Secured Rates',
    tenureMax: '',
    features: ['Multipurpose cash dispatching', 'Higher tenure than personal loans', 'Retain asset ownership securely'],
    documents: ['Property ownership chain deeds', 'Approved map layout plans', 'ITR & KYC']
  },
  {
    id: 'vehicle-commercial-loan',
    title: 'Vehicle & Commercial Machinery Loans',
    description: 'Fast-track funding for luxurious private cars, high-performance commercial logistics fleets, cranes, and advanced manufacturing machinery.',
    maxAmount: '',
    interestRateMin: 'Dealer Tie-up Specials',
    tenureMax: '',
    features: ['Direct dealer tie-ups', 'Minimal documentation required', 'Doorstep delivery files coordination'],
    documents: ['Asset Invoice Quotation', 'Bank Statements', 'KYC Papers']
  },
  {
    id: 'project-loan',
    title: 'Project Loan & Corporate Restructuring',
    description: 'Substantial structural funding for massive housing residential projects, multi-specialty hospitals, hotels, and heavy industrial plant expansions.',
    maxAmount: '',
    interestRateMin: 'Tailored Bank Rates',
    tenureMax: '',
    features: ['Detailed Project Report assistance', 'Capital structuring advice', 'Phased commercial release coordinating'],
    documents: ['Project Report & Valuation Plan', 'Company KYC', 'Financial projections']
  }
];

export const LEGAL_SERVICES: LegalService[] = [
  {
    id: 'sale-deed',
    title: 'Sale Deed (Conveyance & Safe Registration)',
    description: 'Full drafting, water-tight legal clause construction, stamp duty appraisal, and hand-held local registrar registration coordination.',
    estimatedTimeline: '',
    importance: 'The single most critical document representing registered absolute property title and ownership transfer.',
    processSteps: ['Draft preparation and review approval', 'Local Sub-Registrar appointments schedules'],
    documentsRequired: ['All prior parent agreements', 'Seller and Buyer KYC documentation']
  },
  {
    id: 'rent-agreement',
    title: 'Registered Rent Agreement & Leaves Lease',
    description: 'Premium customized tenancy agreement formulation for commercial showroom setups, massive corporate warehouses, or residential properties.',
    estimatedTimeline: '',
    importance: 'Validates statutory safeguards for landlords and ensures tenant advance safety protections.',
    processSteps: ['Friction-free legal drafting', 'Registered stamp setup and notary doorstep delivery'],
    documentsRequired: ['Tenant and Owner ID, PAN, Aadhaar', 'Physical description of property boundaries']
  },
  {
    id: 'agreement-to-sale',
    title: 'Agreement to Sale (Banakhat Prep & Stamp)',
    description: 'Essential real estate draft protecting buyer financial advances and defining future registration milestones rigorously.',
    estimatedTimeline: '',
    importance: 'Locks deal price, schedules future milestones, and creates an enforceable lien on developers.',
    processSteps: ['Payment schedule drafting', 'Advocate certification and signature coordination'],
    documentsRequired: ['Property title clear certificate', 'Advance payment milestone figures']
  },
  {
    id: 'partnership-deed-reg',
    title: 'Partnership Deed Drafting & Firm Registration',
    description: 'Legal drafting of business corporate partnership contracts with direct registrar entry for local business legality.',
    estimatedTimeline: '',
    importance: 'Defines equity structure, profit ratios, operating roles, and commercial liabilities.',
    processSteps: ['Custom clause finalization', 'Stamp purchase and Notary execution'],
    documentsRequired: ['Partner profiles & Aadhaar/PAN cards', 'Office address electricity proof']
  },
  {
    id: 'power-of-attorney',
    title: 'Power of Attorney (GPA & SPA Formats)',
    description: 'Empower trusted kin or local professionals to execute financial bank procedures, deal sign-offs, or sub-registrar property clearance.',
    estimatedTimeline: '',
    importance: 'Authorizes full proxy representation safely when principals reside globally.',
    processSteps: ['Custom power scopes drafting', 'Notary attestation and witness registration scheduling'],
    documentsRequired: ['Grantor and Attorney KYC records', 'Property list under mandate']
  },
  {
    id: 'notary-services',
    title: 'Notary & True Copy Verification Desk',
    description: 'Speedy, legitimate notary attestation, sworn affidavit prep for name corrections, marital status, or official bank clearances.',
    estimatedTimeline: '',
    importance: 'Sovereign recognized verification required for all institutional applications and government records.',
    processSteps: ['Doorstep review and identity verify', 'Register notation logging & verified stamping'],
    documentsRequired: ['Original documents under attest', 'Identity papers of the declarant']
  }
];

export const INSURANCE_SERVICES: InsuranceService[] = [
  {
    id: 'general-insurance',
    title: 'General, Commercial & Asset Insurance',
    description: 'Water-tight protective coverage for vehicles, high-capital industrial warehouses, shop stock, fire loss, marine transit, and public liabilities.',
    category: 'General',
    maxCoverage: '',
    premiumStart: '',
    features: [
      'Experienced doorstep claim representation assistance',
      'Instant cashless approvals at major dealer workshops',
      'Structural commercial business interruption covers to secure cashflow',
      'Multi-provider compare to optimize premium rates immediately'
    ],
    documents: [
      'Prior policies (if existing)',
      'Asset Valuation invoices or vehicle RC Book Copy',
      'KYC proofs of business promoter'
    ]
  },
  {
    id: 'life-insurance',
    title: 'Mortgage Shield & Individual Term Life Insurance',
    description: 'Formulate essential term life protection backing multi-crore home loans, securing your family against property seizures or emergency liabilities.',
    category: 'Life',
    maxCoverage: '',
    premiumStart: '',
    features: [
      'Home Loan protection policy matching precise asset liability schedules',
      'Complimentary doorstep health diagnostics coordination',
      'Lucrative low-premium plans for young earnings brackets',
      'Guaranteed income tax waiver benefits under Indian Tax framework Section 80C'
    ],
    documents: [
      'PAN, Aadhaar identity documents',
      'IT Returns / Form 16 Salary credentials',
      'Physical wellness history indicators'
    ]
  },
  {
    id: 'group-health-insurance',
    title: 'Corporate Employee & Family Health Insurance',
    description: 'Complete family wellness floaters with comprehensive critical illness covers, cashless room rents, and pre-existing disease endorsements.',
    category: 'Health',
    maxCoverage: '',
    premiumStart: '',
    features: [
      'Over 9500 leading Indian network hospitals integrated for cashless transactions',
      'OPD consulting and maternity benefits included from day one',
      'No co-pay clauses ensuring absolute medical freedom'
    ],
    documents: [
      'Employer group census or family member KYC paperwork',
      'Health records declaration'
    ]
  }
];

export const INITIAL_LEADS: InquiryLead[] = [];

export const FAQS = [
  {
    question: 'Are all of your financial and legal solutions available at the doorstep?',
    answer: 'Yes, absolutely! We believe that your time is highly valuable. No matter if you need a Home Loan file setup, a Sale Deed draft, or Notary Attestation, our executive assistants will deliver and gather your resources directly at your home or corporate workplace in Ahmedabad.'
  },
  {
    question: 'Where is your physical office located in Ahmedabad?',
    answer: 'Our corporate office is located at: 87, ground floor, venus alfa bazar, venus atlantis, near shell petrol pump, prahladnagar, satelite, Ahmedabad- 380015. You are welcome to copy the location on the map section in our contact screen to visit our desk for personalized legal and underwrite consultancy.'
  },
  {
    question: 'How do you simplify complicated banking and legal workflows?',
    answer: 'With over 9 years of integrated underwriter operations and property law contract expertise, we know exactly how financial institutes process files. We audit your documentation, resolve simple compliance gaps, and coordinate directly with banking networks so you can clear titles cleanly and safely.'
  }
];

export const INITIAL_TESTIMONIALS: ClientTestimonial[] = [];
