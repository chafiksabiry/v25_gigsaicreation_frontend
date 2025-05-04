export interface Profile {
  userId: string;
  companyId: string;
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  title: string | null;
  bio: string | null;
  skills: string[];
  languages: Language[];
  rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

export interface Language {
  language: string;
  proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
}

export interface ParsedGig {
  title: string;
  quantity: number;
  timeline: string;
  type: string;
  description: string;
  status?: 'draft' | 'pending_review' | 'published' | 'closed';
  seniority?: {
    level: string;
    yearsExperience: string;
  };
  schedule?: {
    days: string[];
    hours: string;
    timeZones: string[];
    flexibility: string[];
    minimumHours: {
      daily?: number;
      weekly?: number;
      monthly?: number;
    };
  };
  commission?: {
    base: string;
    baseAmount: string;
    bonus?: string;
    bonusAmount?: string;
    currency: string;
    minimumVolume: {
      amount: string;
      period: string;
      unit: string;
    };
    transactionCommission: {
      type: string;
      amount: string;
    };
  };
  leads?: {
    types: Array<{
      type: 'hot' | 'warm' | 'cold';
      percentage: number;
      description: string;
      conversionRate?: number;
    }>;
    sources: string[];
  };
  team?: {
    size: string;
    structure: Array<{
      roleId: string;
      count: number;
      seniority: {
        level: string;
        yearsExperience: string;
      };
    }>;
    territories: string[];
  };
  documentation?: {
    product: Array<{
      name: string;
      url: string;
    }>;
    process: Array<{
      name: string;
      url: string;
    }>;
    training: Array<{
      name: string;
      url: string;
    }>;
  };
}

export interface Gig {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  type: string;
  quantity: number;
  timeline: string;
  requirements: any[];
  skills_required: string[];
  languages_required: Language[];
  kpis: any[];
  compensation: {
    type: string;
    amount: number;
    currency: string;
    frequency?: string;
  };
  status: 'draft' | 'pending_review' | 'published' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface GigHistory {
  id: string;
  gig_id: string;
  changed_by: string;
  old_status: string;
  new_status: string;
  changes: any;
  created_at: string;
}

export interface JobDescription {
  title: string;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  languages: {
    required: string[];
    preferred: string[];
  };
}

export interface GigMetadata {
  suggestedNames: string[];
  industries: string[];
  schedules: {
    name: string;
    description: string;
    hours: {
      day: string;
      start: string;
      end: string;
    }[];
  }[];
}