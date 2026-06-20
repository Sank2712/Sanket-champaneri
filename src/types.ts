export type LeadType = 'loan' | 'legal' | 'insurance';

export interface InquiryLead {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  leadType: LeadType;
  subType: string;
  amount?: number; // relevant for loans
  details: string; // details of the request
  status: 'New' | 'Contacted' | 'In Progress' | 'Completed' | 'Closed';
  createdAt: string;
  notes?: string;
  bestTimeToCall?: string;
}

export interface LoanService {
  id: string;
  title: string;
  description: string;
  maxAmount: string;
  interestRateMin: string;
  tenureMax: string;
  features: string[];
  documents: string[];
}

export interface LegalService {
  id: string;
  title: string;
  description: string;
  estimatedTimeline: string;
  importance: string;
  processSteps: string[];
  documentsRequired: string[];
}

export interface InsuranceService {
  id: string;
  title: string;
  description: string;
  category: 'Life' | 'General';
  maxCoverage: string;
  premiumStart: string;
  features: string[];
  documents: string[];
}

export interface ClientTestimonial {
  id: string;
  clientName: string;
  serviceUsed: string;
  testimonialText: string;
  hasPermission: boolean; // permission to display actual name
  rating: number; // 1-5 stars
  status: 'Approved' | 'Pending';
  createdAt: string;
}


