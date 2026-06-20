import { LoanService, LegalService, InsuranceService, InquiryLead, ClientTestimonial } from './types';

export const LOAN_SERVICES: LoanService[] = [
  {
    id: 'home-loan',
    title: 'Home Loans',
    description: 'Competitive interest rates and customized home loan options for buy, build, or renovate.',
    maxAmount: 'Best Rates Offered',
    interestRateMin: 'From 7.20% p.a.',
    tenureMax: '30 Years',
    features: ['Doorstep document pickup', 'Expert guidance', 'Multiple bank comparisons'],
    documents: ['Aadhaar & PAN Card', 'Income Proofs (Salary Slips / ITR)', 'Bank Statements']
  },
  {
    id: 'business-loan',
    title: 'Business Loan',
    description: 'Grow your business with quick-approval secured and collateral-free commercial loans.',
    maxAmount: 'Custom Limit',
    interestRateMin: 'From 11.50% p.a.',
    tenureMax: '5 Years',
    features: ['MSME customized terms', 'Doorstep coordination', 'Flexible EMIs'],
    documents: ['GST Returns', 'P&L & Balance Sheet', 'KYC Documents']
  },
  {
    id: 'personal-loan',
    title: 'Personal Loans',
    description: 'Easy personal funding for immediate requirements with competitive terms and fast processing.',
    maxAmount: 'Up to ₹25 Lakhs',
    interestRateMin: 'From 10.99% p.a.',
    tenureMax: '7 Years',
    features: ['Instant digital processing', 'No collateral required', 'Zero hidden fees'],
    documents: ['Salary Slips', 'Bank Statements', 'PAN & Aadhaar']
  },
  {
    id: 'project-loan',
    title: 'Project Loan',
    description: 'Tailored construction and corporate expansion funding for new and existing commercial projects.',
    maxAmount: 'Based on Project Report',
    interestRateMin: 'Best Bank Rates',
    tenureMax: 'Based on project schedule',
    features: ['Project report assistance', 'Capital restructuring support', 'Phased disbursal guidance'],
    documents: ['Project Report & Plan', 'Company KYC', 'Financial projections']
  },
  {
    id: 'working-capital',
    title: 'Working Capital',
    description: 'Optimize daily liquid flow with custom overdraft, cash credit lines, and working capital limits.',
    maxAmount: 'Up to ₹5 Crores',
    interestRateMin: 'From 9.25% p.a.',
    tenureMax: '12 Months (Renewable)',
    features: ['Overdraft & Cash Credit files', 'Interest charged only on utilized funds', 'Fast annual renewals'],
    documents: ['GST Returns', 'Audit reports', 'Bank Statements']
  }
];

export const LEGAL_SERVICES: LegalService[] = [
  {
    id: 'sale-deed',
    title: 'Sale Deed',
    description: 'Professional drafting, verification, and registration coordination of final Conveyance Sale Deeds.',
    estimatedTimeline: '2 - 3 Days',
    importance: 'The final legally binding document that registers property sale.',
    processSteps: ['Draft preparation', 'Local Sub-Registrar execution slots'],
    documentsRequired: ['Prior parent deeds', 'Buying & selling parties KYC']
  },
  {
    id: 'rent-agreement',
    title: 'Rent Agreement',
    description: 'Customized drafting of residential and commercial rent lease agreements with fast legal notarization.',
    estimatedTimeline: '1 Day',
    importance: 'Establishes clear rules, security deposit terms, and tenant tenancy safeguards.',
    processSteps: ['Legal drafting', 'Notary attestation and doorstep delivery'],
    documentsRequired: ['Landlord and Tenant KYC', 'Property description']
  },
  {
    id: 'agreement-to-sale',
    title: 'Agreement to Sale',
    description: 'Preliminary real estate sale agreements safeguarding your commercial transaction advances.',
    estimatedTimeline: '1 - 2 Days',
    importance: 'Secures payment terms and holds the property before final deed registration.',
    processSteps: ['Milestone drafting', 'Advocate supervision & execution'],
    documentsRequired: ['Prior chain documents', 'Commercial advance terms']
  },
  {
    id: 'power-of-attorney',
    title: 'Power of Attorney',
    description: 'Drafting General (GPA) and Special Power of Attorney (SPA) options to authorize trusted proxies.',
    estimatedTimeline: '1 Day',
    importance: 'Enables designated representatives to manage assets, banks, or registrations legalised.',
    processSteps: ['Scope definition', 'Doorstep witnesses setup & notary certification'],
    documentsRequired: ['Principal & Attorney KYC', 'Asset descriptions']
  },
  {
    id: 'affidavit',
    title: 'Affidavit',
    description: 'Drafting of valid sworn physical affidavits, self-declarations, name corrections, and marital proofs.',
    estimatedTimeline: 'Same-Day',
    importance: 'Sworn statements valid before banks, courts, and municipal government departments.',
    processSteps: ['Structuring statements', 'Stamp paper attestation'],
    documentsRequired: ['KYC proofs', 'Declared statements details']
  },
  {
    id: 'notary-services',
    title: 'Notary Services',
    description: 'Instant doorstep verification, true copy attestations, and seal-stamp authorizations.',
    estimatedTimeline: 'Instant',
    importance: 'Verifies the authentic nature of files, saving clients high compliance risks.',
    processSteps: ['Doorstep document inspection', 'Register entry and notary book stamping'],
    documentsRequired: ['Original documents', 'Clear xerox copies']
  }
];

export const INSURANCE_SERVICES: InsuranceService[] = [
  {
    id: 'general-insurance',
    title: 'General Insurance',
    description: 'Secure your assets including vehicles, shop inventories, industrial machinery, marine logistics, and complete corporate premises.',
    category: 'General',
    maxCoverage: 'Based on Asset Valuation',
    premiumStart: 'Starting ₹150 / Month',
    features: [
      'Doorstep claim settlement assistance',
      'Cashless repair options at tier-1 garages',
      'Commercial assets fire and natural disaster shield overlays',
      'Comprehensive third-party liabilities covered instantly'
    ],
    documents: [
      'RC book / Asset invoices / prior policy photocopy if any',
      'PAN & Aadhaar of business promoter/owner',
      'Facility layout audits (for heavy factories)'
    ]
  },
  {
    id: 'life-insurance',
    title: 'Life Insurance',
    description: 'Secure your family against high loans or debt exposures with pure Term Life packages, child plans, and smart savings covers.',
    category: 'Life',
    maxCoverage: 'Up to ₹5 Crores',
    premiumStart: 'Starting ₹450 / Month',
    features: [
      'Airtight mortgage liability balance protection plans',
      'Doorstep document processing and free medical check-up coordinates',
      'Special discounted term plans for non-smokers and female earners',
      'Direct tax savings deductions up to ₹1.5L under Section 80C'
    ],
    documents: [
      'PAN card and Aadhaar identity papers',
      'Income proof proofs (IT Returns computation or Form 16)',
      'Free local physical health check-ups scheduled at your doorstep'
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
    details: 'Interested in buying a 2BHK flat near Prahladnagar, Ahmedabad. Need a home loan of approx 45 Lakhs. Looking for doorstep assistance.',
    status: 'In Progress',
    createdAt: '2026-06-18T14:32:00Z',
    notes: 'Home loan inquiry. Prefers doorstep paperwork pick-up. SBI rate eligible. Awaiting income documents.',
    bestTimeToCall: 'Evenings 5 PM - 7 PM'
  }
];

export const FAQS = [
  {
    question: 'Are all of your financial and legal solutions available at the doorstep?',
    answer: 'Yes, absolutely! We believe that your time is highly valuable. No matter if you need a Home Loan file setup, a Sale Deed draft printed or Notary Attestation, our executive legal assistants will deliver and gather your resources directly at your home or corporate workplace.'
  },
  {
    question: 'Where is your physical office located in Ahmedabad?',
    answer: 'Our corporate headquarters is located at: Office No. 87, Venus Alfa Market, Venus Atlantis, Near Shell Petrol Pump, Prahladnagar, Ahmedabad - 380015. You are welcome to schedule an appointment with Sanket Champaneri for priority personal advisory.'
  },
  {
    question: 'How do you simplify complicated banking and legal workflows?',
    answer: 'Founded by Sanket Champaneri (carrying over 9 years of direct institutional banking and financial legal advisory background), we understand exactly how banks process files. We clean your records, correct application bugs, draft precise non-conflicting documents, and coordinate directly with banking networks so you avoid the stress.'
  }
];

export const INITIAL_TESTIMONIALS: ClientTestimonial[] = [];
