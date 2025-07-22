export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  title: string | null;
  bio: string | null;
  skills: {
    languages: Language[];
    professional: Skill[];
    technical: Skill[];
    soft: Skill[];
  };
  
  rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

export interface Language {
  language: string;
  proficiency: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  iso639_1: string;
}

export interface Skill {
  skill: string;
  level: number;
}

export interface ParsedGig {
  title: string;
  quantity: number;
  timeline: string;
  type: string;
  description: string;
  status?: 'to_activate' | 'active' | 'inactive' | 'archived';
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
  status: 'to_activate' | 'active' | 'inactive' | 'archived';
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