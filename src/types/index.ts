export interface GigData {
  userId: string;
  companyId: string;
  title: string;
  description: string;
  category: string;
  destination_zone: string;
  destination_zone_ai_generated?: string;
  destinationZones?: string[];
  callTypes: string[];
  highlights: string[];
  requirements: {
    essential: string[];
    preferred: string[];
  };
  benefits: {
    type: string;
    description: string;
  }[];
  availability: {
    schedule: Array<{
      day: string;
      hours: {
        start: string;
        end: string;
      };
    }>;
    timeZones: string[];
    flexibility: string[];
    minimumHours: {
      daily?: number;
      weekly?: number;
      monthly?: number;
    };
  }
  schedule: {
    schedules: Array<{
      day: string;
      hours: {
        start: string;
        end: string;
      };
    }>;
    timeZones: string[];
    flexibility: string[];
    minimumHours: {
      daily?: number;
      weekly?: number;
      monthly?: number;
    };
    shifts?: {
      name: string;
      hours: string;
      timezone: string;
    }[];
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
    kpis: {
      metric: string;
      target: string;
      reward: string;
    }[];
    additionalDetails?: string;
  };
  leads: {
    types: Array<{
      type: 'hot' | 'warm' | 'cold';
      percentage: number;
      description: string;
      conversionRate?: number;
    }>;
    sources: string[];
    distribution: {
      method: string;
      rules: string[];
    };
    qualificationCriteria: string[];
  };
  skills: {
    languages: Array<{ 
      language: string; 
      proficiency: string;
      iso639_1: string;
    }>;
    soft: Array<{
      skill: string;
      level: number;
    }>;
    professional: Array<{
      skill: string;
      level: number;
    }>;
    technical: Array<{
      skill: string;
      level: number;
    }>;
    certifications: Array<{
      name: string;
      required: boolean;
      provider?: string;
    }>;
  };
  seniority: {
    level: string;
    yearsExperience: number;
    aiGenerated?: boolean;
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
    provided: Array<{
      name: string;
      type: string;
      description?: string;
    }>;
    required: Array<{
      name: string;
      type: string;
      description?: string;
    }>;
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
    kpis: string[];
    targets: { [key: string]: string };
    reporting: {
      frequency: string;
      metrics: string[];
    };
  };
  documentation: {
    templates: any;
    reference: any;
    product: Array<{ name: string; url: string }>;
    process: Array<{ name: string; url: string }>;
    training: Array<{ name: string; url: string }>;
  };
  compliance: {
    requirements: string[];
    certifications: string[];
    policies: string[];
  };
  equipment: {
    required: Array<{
      type: string;
      specifications: string[];
    }>;
    provided: Array<{
      type: string;
      specifications: string[];
    }>;
  };
}

export interface GigSuggestion {
  title: string;
  description: string;
  category: string;
  highlights: string[];
  jobTitles: string[];
  deliverables: string[];
  sectors: string[];
  destinationZones: string[];
  timeframes: string[];
  availability: {
    schedule: Array<{
      days: string[];
      hours: {
        start: string;
        end: string;
      };
    }>;
    timeZones: string[];
    flexibility: string[];
    minimumHours: {
      daily: number;
      weekly: number;
      monthly: number;
    };
  };
  schedule: {
    schedules: Array<{
      days: string[];
      hours: {
        start: string;
        end: string;
      };
    }>;
    timeZones: string[];
    flexibility: string[];
    minimumHours: {
      daily?: number;
      weekly?: number;
      monthly?: number;
    };
    shifts?: {
      name: string;
      hours: string;
      timezone: string;
    }[];
  };
  requirements: {
    essential: string[];
    preferred: string[];
  };
  benefits: {
    type: string;
    description: string;
  }[];
  skills: {
    languages: Array<{ 
      language: string; 
      proficiency: string;
      iso639_1: string;
    }>;
    soft: Array<{
      skill: string;
      level: number;
    }>;
    professional: Array<{
      skill: string;
      level: number;
      details?: string;
    }>;
    technical: Array<{
      skill: string;
      level: number;
      details?: string;
    }>;
    certifications: Array<{
      name: string;
      required: boolean;
      provider?: string;
    }>;
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
  commission: {
    options: Array<{
      base: string;
      baseAmount: string;
      bonus?: string;
      bonusAmount?: string;
      structure?: string;
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
  activity: {
    options: Array<{
      type: string;
      description: string;
      requirements: string[];
    }>;
  };
  leads: {
    types: Array<{
      type: 'hot' | 'warm' | 'cold';
      percentage: number;
      description: string;
      conversionRate?: number;
    }>;
    sources: string[];
    distribution: {
      method: string;
      rules: string[];
    };
    qualificationCriteria: string[];
  };
  documentation: {
    templates: any;
    reference: any;
    product: Array<{ name: string; url: string }>;
    process: Array<{ name: string; url: string }>;
    training: Array<{ name: string; url: string }>;
  };
}