export interface Gig {
  id?: string;
  title: string;
  description: string;
  type: string;
  quantity: number;
  timeline: string;
  requirements: string[];
  skillsRequired: string[];
  languagesRequired: Language[];
  kpis: string[];
  compensation: {
    type: string;
    amount: number;
    currency: string;
    frequency?: string;
  };
  status: 'draft' | 'pending_review' | 'published' | 'closed';
  creatorId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Language {
  language: string;
  proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
}