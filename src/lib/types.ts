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
  proficiency: 'Basic' | 'Conversational' | 'Professional' | 'Native/Bilingual';
}

export interface ParsedGig {
  title: string;
  quantity: number;
  timeline: string;
  type: string;
  description: string;
  status?: 'draft' | 'pending_review' | 'published' | 'closed';
  destination_zone?: string;
  seniority?: {
    level: string;
    yearsExperience: number;
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
    size: number;
    structure: Array<{
      roleId: string;
      count: number;
      seniority: {
        level: string;
        yearsExperience: number;
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
    amount: string;
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

export interface GigData {
  userId: string;
  companyId: string;
  title: string;
  description: string;
  category: string;
  destination_zone: string;
  callTypes: string[];
  highlights: string[];
  requirements: {
    essential: string[];
    preferred: string[];
  };
  benefits: string[];
  schedule: {
    days: string[];
    startTime: string;
    endTime: string;
    timeZones: string[];
    flexibility: string[];
    minimumHours: {
      daily?: number;
      weekly?: number;
      monthly?: number;
    };
  };
  commission: {
    base: string;
    baseAmount: string;
    bonus: string;
    bonusAmount: string;
    structure: string;
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
    kpis: any[];
  };
  leads: {
    types: Array<{
      type: 'hot' | 'warm' | 'cold';
      percentage: number;
      description: string;
    }>;
    sources: string[];
    distribution: {
      method: string;
      rules: any[];
    };
    qualificationCriteria: any[];
  };
  skills: {
    languages: Array<{ name: string; level: string; }>;
    soft: string[];
    professional: string[];
    technical: string[];
    certifications: string[];
  };
  seniority: {
    level: string;
    yearsExperience: number;
  };
  team: {
    size: number;
    structure: Array<{
      roleId: string;
      count: number;
      seniority: {
        level: string;
        yearsExperience: number;
      };
    }>;
    territories: string[];
    reporting: {
      to: string;
      frequency: string;
    };
    collaboration: string[];
  };
  tools: {
    provided: string[];
    required: string[];
  };
  training: {
    initial: {
      duration: string;
      format: string;
      topics: string[];
    };
    ongoing: {
      frequency: string;
      format: string;
      topics: string[];
    };
    support: string[];
  };
  metrics: {
    kpis: any[];
    targets: Record<string, any>;
    reporting: {
      frequency: string;
      metrics: any[];
    };
  };
  documentation: {
    templates: Record<string, any>;
    reference: Record<string, any>;
    product: Array<{ name: string; url: string; }>;
    process: Array<{ name: string; url: string; }>;
    training: Array<{ name: string; url: string; }>;
  };
  compliance: {
    requirements: string[];
    certifications: string[];
    policies: string[];
  };
  equipment: {
    required: string[];
    provided: string[];
  };
}

export interface GigSuggestion {
  jobTitles: string[];
  deliverables: string[];
  compensation: string[];
  skills: string[];
  kpis: string[];
  timeframes: string[];
  requirements: string[];
  languages: string[];
  seniority: {
    level: string;
    yearsExperience: number;
  };
  schedule: {
    days: string[];
    startTime: string;
    endTime: string;
    timeZones: string[];
    flexibility: string[];
    minimumHours: {
      daily?: number;
      weekly?: number;
      monthly?: number;
    };
  };
  commission: {
    options: Array<{
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
    }>;
  };
  sectors: string[];
  activity: {
    options: Array<{
      type: string;
      description: string;
      requirements: string[];
    }>;
  };
  destinationZones: string[];
}