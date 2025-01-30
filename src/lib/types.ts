import { Database } from './database.types';

export interface Profile {
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