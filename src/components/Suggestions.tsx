import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Brain,
  Briefcase,
  Target,
  DollarSign,
  Gauge,
  Clock,
  Award,
  Globe2,
  AlertCircle,
  Edit2,
  Save,
  X,
  CheckCircle,
  ArrowRight,
  PlusCircle,
  XCircle,
  Plus,
  Trash2,
  Check,
  Loader2,
  MapPin,
  Users,
} from "lucide-react";
import OpenAI from "openai";
import type { JobDescription, GigMetadata } from "../lib/types";
import type { GigSuggestion } from "../types";
import Swal from "sweetalert2";
import Modal from './Modal';
import LeadsForm from './LeadsForm';
import TeamForm from './TeamForm';
import DocumentationForm from './DocumentationForm';
import BasicSection from './BasicSection';
import i18n from 'i18n-iso-countries';
import fr from 'i18n-iso-countries/langs/fr.json';
import en from 'i18n-iso-countries/langs/en.json';
import Cookies from 'js-cookie';
import { generateGigSuggestions } from '../lib/ai';

// Register languages
i18n.registerLocale(fr);
i18n.registerLocale(en);

// Helper function to check if a value is a string array
const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
};

const getNestedProperty = (obj: any, path: string) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const setNestedProperty = (obj: any, path: string, value: any) => {
  const parts = path.split('.');
  const lastPart = parts.pop()!;
  const target = parts.reduce((acc, part) => {
    if (!acc[part]) {
      acc[part] = {};
    }
    return acc[part];
  }, obj);
  target[lastPart] = value;
};

type StringArraySection =
  | 'jobTitles'
  | 'deliverables'
  | 'sectors'
  | 'destinationZones'
  | 'highlights'
  | 'requirements.essential'
  | 'requirements.preferred'
  | 'skills.technical'
  | 'skills.soft'
  | 'skills.professional'
  | 'skills.languages'
  | 'skills.certifications'
  | 'commission.kpis'
  | 'commission'
  | 'activity'
  | 'kpis'
  | 'timeframes'
  | 'requirements'
  | 'compensation'
  | 'languages'
  | 'skills'
  | 'activity-requirement';

interface ActivityOption {
  type: string;
  description: string;
  requirements: string[];
}

type EditableGigSuggestion = Omit<GigSuggestion, 'commission' | 'activity'> & {
  commission?: {
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
  activity?: {
    options: Array<{
      type: string;
      description: string;
      requirements: string[];
    }>;
  };
};

interface SuggestionsProps {
  input: string;
  onBack: () => void;
  onConfirm: (suggestions: GigSuggestion) => void;
}

let openai: OpenAI | null = null;
try {
  if (import.meta.env.VITE_OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    });
  }
} catch (error) {
  console.error("Error initializing OpenAI client:", error);
}

const COMMON_TIMEZONES = [
  "UTC",
  "GMT",
  "CET (Central European Time)",
  "EET (Eastern European Time)",
  "WET (Western European Time)",
  "EST (Eastern Standard Time)",
  "CST (Central Standard Time)",
  "PST (Pacific Standard Time)",
  "IST (India Standard Time)",
  "JST (Japan Standard Time)",
  "AEDT (Australian Eastern Daylight Time)",
  "NZDT (New Zealand Daylight Time)"
];

interface LeadType {
  type: 'hot' | 'warm' | 'cold';
  percentage: number;
  description: string;
  conversionRate?: number;
}

interface LeadsData {
  types: LeadType[];
  sources: string[];
}

interface TeamRole {
  roleId: string;
  count: number;
  seniority: {
    level: string;
    yearsExperience: number;
  };
}

interface TeamData {
  size: number;
  structure: TeamRole[];
  territories: string[];
}

interface PredefinedOptions {
  leads: {
    sources: string[];
  };
  team: {
    roles: Array<{
      id: string;
      name: string;
      description: string;
    }>;
    territories: string[];
  };
  basic: {
    seniorityLevels: string[];
  };
}

const predefinedOptions: PredefinedOptions = {
  leads: {
    sources: [
      'LinkedIn',
      'Email Marketing',
      'Social Media',
      'Referrals',
      'Events',
      'Cold Calling',
      'Website',
      'Other'
    ]
  },
  team: {
    roles: [
      {
        id: 'manager',
        name: 'Manager',
        description: 'Team leader responsible for overall performance'
      },
      {
        id: 'senior',
        name: 'Senior',
        description: 'Experienced professional with leadership capabilities'
      },
      {
        id: 'mid',
        name: 'Mid-level',
        description: 'Professional with solid experience'
      },
      {
        id: 'junior',
        name: 'Junior',
        description: 'Entry-level professional'
      }
    ],
    territories: [
      'North America',
      'Europe',
      'Asia',
      'South America',
      'Africa',
      'Oceania'
    ]
  },
  basic: {
    seniorityLevels: [
      'Entry Level',
      'Junior',
      'Mid-Level',
      'Senior',
      'Team Lead',
      'Supervisor',
      'Manager',
      'Director'
    ]
  }
};

interface GigData {
  userId: string;
  companyId: string;
  title: string;
  description: string;
  type: string;
  quantity: number;
  timeline: string;
  skills_required: string[];
  languages_required: Array<{ code: string; name: string }>;
  kpis: string[];
  category: string;
  seniority: {
    level: string;
    yearsExperience: number;
  };
  availability: {
    schedule: {
      days: string[];
      hours: {
        start: string;
        end: string;
      };
    }[];
    timeZones: string[];
    flexibility: string[];
    minimumHours: {
      daily: number;
      weekly: number;
      monthly: number;
    };
    };
  schedule: {
    schedules: {
      days: string[];
      hours: {
        start: string;
        end: string;
      };
    }[];
    timeZones: string[];
    flexibility: string[];
    minimumHours: {
      daily: number;
      weekly: number;
      monthly: number;
    };
  };
  commission: {
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
  };
  sectors: string[];
  activity: {
    type: string;
    description: string;
    requirements: string[];
  };
  leads?: LeadsData;
  team?: {
    size: number;
    structure: TeamRole[];
    territories: string[];
    reporting: {
      to: string;
      frequency: string;
    };
    collaboration: string[];
  };
  documentation: {
    templates: null,
    reference: null,
    product: [],
    process: [],
    training: []
  };
  status: string;
  created_at: string;
  updated_at: string;
}

interface SuggestionState extends GigSuggestion {
  // Additional fields specific to SuggestionState can be added here
}

const fallbackSuggestions: GigSuggestion = {
  title: "",
  description: "",
  category: "",
  highlights: [],
  jobTitles: [],
  deliverables: [],
  sectors: [],
  destinationZones: [],
  timeframes: [],
  availability: {
    schedule: [{
      days: [],
      hours: {
        start: "",
        end: ""
      }
    }],
    timeZones: [],
    flexibility: [],
    minimumHours: {
      daily: 8,
      weekly: 40,
      monthly: 160
    }
  },
  schedule: {
    schedules: [{
      days: [],
      hours: {
        start: "",
        end: ""
      }
    }],
    timeZones: ["CET"],
    flexibility: [],
    minimumHours: {
      daily: 8,
      weekly: 40,
      monthly: 160
    }
  },
  requirements: {
    essential: [],
    preferred: []
  },
  benefits: [],
  skills: {
    languages: [],
    soft: [{
      skill: "Communication",
      level: 1
    }],
    professional: [{
      skill: "Brand Identity Design",
      level: 1
    }],
    technical: [{
      skill: "Adobe Illustrator",
      level: 1
    }],
    certifications: []
  },
  seniority: {
    level: "",
    yearsExperience: 0
  },
  commission: {
    options: []
  },
  activity: {
    options: []
  },
  team: {
    size: 1,
    structure: [{
      roleId: "default",
      count: 1,
      seniority: {
        level: "Senior",
        yearsExperience: 5
      }
    }],
    territories: ["Global"],
    reporting: {
      to: "Project Manager",
      frequency: "Weekly"
    },
    collaboration: ["Daily standups", "Weekly reviews"]
  },
  leads: {
    types: [],
    sources: [],
    distribution: {
      method: "",
      rules: []
    },
    qualificationCriteria: []
  },
  documentation: {
    templates: null,
    reference: null,
    product: [],
    process: [],
    training: []
  }
};

export const Suggestions: React.FC<SuggestionsProps> = ({ input, onBack, onConfirm }) => {
  const [suggestions, setSuggestions] = useState<GigSuggestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateSuggestions = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await generateGigSuggestions(input);
        setSuggestions(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate suggestions');
      } finally {
        setLoading(false);
      }
    };

    if (input.trim()) {
      generateSuggestions();
    }
  }, [input]);

  const handleConfirm = () => {
    if (suggestions) {
      onConfirm(suggestions);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center space-x-3">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="text-lg text-gray-700">Generating suggestions...</span>
          </div>
          <p className="text-center text-gray-500 mt-4">
            Analyzing your requirements and creating personalized gig suggestions
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Generating Suggestions</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={onBack}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!suggestions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Suggestions Available</h3>
            <p className="text-gray-600 mb-6">Unable to generate suggestions for your input.</p>
            <button
              onClick={onBack}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-16">
      <div className="max-w-4xl mx-auto pt-16 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Input</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">AI-Generated Suggestions</h1>
        </div>

        {/* Suggestions Card */}
        <div className="bg-white rounded-xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <Briefcase className="w-6 h-6 mr-2 text-blue-600" />
              {suggestions.title}
            </h2>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              {suggestions.category}
            </span>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
            <p className="text-gray-700 leading-relaxed">{suggestions.description}</p>
          </div>

          {/* Highlights */}
          {suggestions.highlights && suggestions.highlights.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Key Highlights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggestions.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-700">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Schedule */}
          {suggestions.schedule && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                Schedule
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {suggestions.schedule.schedules && suggestions.schedule.schedules.length > 0 ? (
                  <div className="space-y-3">
                    {suggestions.schedule.schedules.map((schedule, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-600">Days:</span>
                          <span className="font-medium text-gray-900">
                            {schedule.days.join(', ')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-600">Hours:</span>
                          <span className="font-medium text-gray-900">
                            {schedule.hours.start} - {schedule.hours.end}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No specific schedule defined</p>
                )}
                
                {suggestions.schedule.timeZones && suggestions.schedule.timeZones.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Time Zones:</span>
                      <span className="font-medium text-gray-900">
                        {suggestions.schedule.timeZones.join(', ')}
                      </span>
                    </div>
                  </div>
                )}

                {suggestions.schedule.flexibility && suggestions.schedule.flexibility.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">Flexibility:</span>
                      <span className="font-medium text-gray-900">
                        {suggestions.schedule.flexibility.join(', ')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Requirements */}
          {suggestions.requirements && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Requirements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {suggestions.requirements.essential && suggestions.requirements.essential.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Essential</h4>
                    <ul className="space-y-1">
                      {suggestions.requirements.essential.map((req, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 text-sm">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {suggestions.requirements.preferred && suggestions.requirements.preferred.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Preferred</h4>
                    <ul className="space-y-1">
                      {suggestions.requirements.preferred.map((req, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 text-sm">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Skills */}
          {suggestions.skills && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-blue-600" />
                Skills
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {suggestions.skills.languages && suggestions.skills.languages.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Languages</h4>
                    <div className="space-y-1">
                      {suggestions.skills.languages.map((lang, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-gray-700 text-sm">{lang.language}</span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {lang.proficiency}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {suggestions.skills.soft && suggestions.skills.soft.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Soft Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.skills.soft.map((skill, index) => (
                        <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {typeof skill === 'string' ? skill : skill.skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Commission */}
          {suggestions.commission && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
                Commission Structure
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600 text-sm">Base:</span>
                    <p className="font-medium text-gray-900">{suggestions.commission.base}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Amount:</span>
                    <p className="font-medium text-gray-900">{suggestions.commission.baseAmount}</p>
                  </div>
                  {suggestions.commission.bonus && (
                    <div>
                      <span className="text-gray-600 text-sm">Bonus:</span>
                      <p className="font-medium text-gray-900">{suggestions.commission.bonus}</p>
                    </div>
                  )}
                  {suggestions.commission.bonusAmount && (
                    <div>
                      <span className="text-gray-600 text-sm">Bonus Amount:</span>
                      <p className="font-medium text-gray-900">{suggestions.commission.bonusAmount}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Team */}
          {suggestions.team && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Team Structure
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600 text-sm">Team Size:</span>
                    <p className="font-medium text-gray-900">{suggestions.team.size} members</p>
                  </div>
                  {suggestions.team.territories && suggestions.team.territories.length > 0 && (
                    <div>
                      <span className="text-gray-600 text-sm">Territories:</span>
                      <p className="font-medium text-gray-900">{suggestions.team.territories.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Input
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Check className="w-5 h-5" />
            <span>Use These Suggestions</span>
          </button>
        </div>
      </div>
    </div>
  );
};

function parseYearsExperience(val: any) {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    // Prend le premier nombre trouvé dans la string
    const match = val.match(/\\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }
  return 0;
} 