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
  schedule: {
    days: string[];
    hours: string;
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
    languages: Array<{ name: string; level: string }>;
    soft: string[];
    professional: string[];
    technical: string[];
    certifications: Array<{
      name: string;
      required: boolean;
      provider?: string;
    }>;
  };
  seniority: {
    years: string;
    level: string;
    yearsExperience: string;
    aiGenerated?: boolean;
  };
  team: {
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
  schedule: {
    days: string[];
    hours: string;
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
    languages: Array<{ name: string; level: string }>;
    soft: string[];
    professional: string[];
    technical: string[];
    certifications: Array<{
      name: string;
      required: boolean;
      provider?: string;
    }>;
  };
  seniority: {
    years: string;
    level: string;
    yearsExperience: string;
  };
  team: {
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
    reporting: {
      to: string;
      frequency: string;
    };
    collaboration: string[];
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