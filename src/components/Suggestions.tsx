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
import { groupSchedules } from "../lib/scheduleUtils";

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
      days: [""],
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
      day: "",
      hours: {
        start: "",
        end: ""
      }
    }],
    timeZones: ["CET"],
    flexibility: ["Part-Time Options"],
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
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  useEffect(() => {
    const generateSuggestions = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await generateGigSuggestions(input);
        console.log('Generated suggestions:', result);
        
        // Convert schedules from days array to individual day objects
        if (result.schedule && result.schedule.schedules) {
          const convertedSchedules: Array<{
            day: string;
            hours: { start: string; end: string };
            _id?: { $oid: string };
          }> = [];
          result.schedule.schedules.forEach((schedule: any, index: number) => {
            if (schedule.days && Array.isArray(schedule.days)) {
              // Convert from days array to individual day objects
              schedule.days.forEach((day: string) => {
                convertedSchedules.push({
                  day: day,
                  hours: schedule.hours,
                  _id: {
                    $oid: `generated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                  }
                });
              });
            } else if (schedule.day) {
              // Already in correct format
              convertedSchedules.push({
                ...schedule,
                _id: schedule._id || {
                  $oid: `generated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                }
              });
            }
          });
          result.schedule.schedules = convertedSchedules;
        }

        // Convert commission structure to options format if needed
        if (result.commission && !(result.commission as any).options) {
          // Convert old structure to new options structure
          const oldCommission = result.commission as any;
          const commissionOption = {
            base: oldCommission.base || "Base",
            baseAmount: oldCommission.baseAmount || "0",
            bonus: oldCommission.bonus,
            bonusAmount: oldCommission.bonusAmount,
            structure: oldCommission.structure,
            currency: oldCommission.currency || "EUR",
            minimumVolume: oldCommission.minimumVolume || {
              amount: "0",
              period: "Monthly",
              unit: "Units"
            },
            transactionCommission: oldCommission.transactionCommission || {
              type: "Fixed",
              amount: "0"
            }
          };
          
          result.commission = {
            options: [commissionOption]
          };
        }
        
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

  const addItem = (section: string, item: string) => {
    if (!suggestions) return;

    const newSuggestions = { ...suggestions };
    
    switch (section) {
      case 'highlights':
        newSuggestions.highlights = [...(newSuggestions.highlights || []), item];
        break;
      case 'jobTitles':
        newSuggestions.jobTitles = [...(newSuggestions.jobTitles || []), item];
        break;
      case 'deliverables':
        newSuggestions.deliverables = [...(newSuggestions.deliverables || []), item];
        break;
      case 'sectors':
        newSuggestions.sectors = [...(newSuggestions.sectors || []), item];
        break;
      case 'destinationZones':
        newSuggestions.destinationZones = [...(newSuggestions.destinationZones || []), item];
        break;
      case 'requirements.essential':
        newSuggestions.requirements.essential = [...(newSuggestions.requirements.essential || []), item];
        break;
      case 'requirements.preferred':
        newSuggestions.requirements.preferred = [...(newSuggestions.requirements.preferred || []), item];
        break;
      case 'skills.technical':
        newSuggestions.skills.technical = [...(newSuggestions.skills.technical || []), { skill: item, level: 1 }];
        break;
      case 'skills.soft':
        newSuggestions.skills.soft = [...(newSuggestions.skills.soft || []), { skill: item, level: 1 }];
        break;
      case 'skills.languages':
        newSuggestions.skills.languages = [...(newSuggestions.skills.languages || []), { language: item, proficiency: 'Intermediate', iso639_1: 'en' }];
        break;
    }
    
    setSuggestions(newSuggestions);
  };

  const updateItem = (section: string, index: number, newValue: string) => {
    if (!suggestions) return;

    const newSuggestions = { ...suggestions };
    
    switch (section) {
      case 'highlights':
        newSuggestions.highlights[index] = newValue;
        break;
      case 'jobTitles':
        newSuggestions.jobTitles[index] = newValue;
        break;
      case 'deliverables':
        newSuggestions.deliverables[index] = newValue;
        break;
      case 'sectors':
        newSuggestions.sectors[index] = newValue;
        break;
      case 'destinationZones':
        newSuggestions.destinationZones[index] = newValue;
        break;
      case 'requirements.essential':
        newSuggestions.requirements.essential[index] = newValue;
        break;
      case 'requirements.preferred':
        newSuggestions.requirements.preferred[index] = newValue;
        break;
      case 'skills.technical':
        newSuggestions.skills.technical[index] = { skill: newValue, level: newSuggestions.skills.technical[index].level };
        break;
      case 'skills.soft':
        newSuggestions.skills.soft[index] = { skill: newValue, level: newSuggestions.skills.soft[index].level };
        break;
      case 'skills.languages':
        const currentLang = newSuggestions.skills.languages[index];
        newSuggestions.skills.languages[index] = { 
          language: newValue, 
          proficiency: currentLang.proficiency, 
          iso639_1: currentLang.iso639_1 || 'en' 
        };
        break;
    }
    
    setSuggestions(newSuggestions);
    setEditingSection(null);
    setEditingIndex(null);
    setEditValue('');
  };

  const deleteItem = (section: string, index: number) => {
    if (!suggestions) return;

    const newSuggestions = { ...suggestions };
    
    switch (section) {
      case 'highlights':
        newSuggestions.highlights = newSuggestions.highlights.filter((_, i) => i !== index);
        break;
      case 'jobTitles':
        newSuggestions.jobTitles = newSuggestions.jobTitles.filter((_, i) => i !== index);
        break;
      case 'deliverables':
        newSuggestions.deliverables = newSuggestions.deliverables.filter((_, i) => i !== index);
        break;
      case 'sectors':
        newSuggestions.sectors = newSuggestions.sectors.filter((_, i) => i !== index);
        break;
      case 'destinationZones':
        newSuggestions.destinationZones = newSuggestions.destinationZones.filter((_, i) => i !== index);
        break;
      case 'requirements.essential':
        newSuggestions.requirements.essential = newSuggestions.requirements.essential.filter((_, i) => i !== index);
        break;
      case 'requirements.preferred':
        newSuggestions.requirements.preferred = newSuggestions.requirements.preferred.filter((_, i) => i !== index);
        break;
      case 'skills.technical':
        newSuggestions.skills.technical = newSuggestions.skills.technical.filter((_, i) => i !== index);
        break;
      case 'skills.soft':
        newSuggestions.skills.soft = newSuggestions.skills.soft.filter((_, i) => i !== index);
        break;
      case 'skills.languages':
        newSuggestions.skills.languages = newSuggestions.skills.languages.filter((_, i) => i !== index);
        break;
    }
    
    setSuggestions(newSuggestions);
  };

  const startEditing = (section: string, index: number, currentValue: any) => {
    setEditingSection(section);
    setEditingIndex(index);
    if (typeof currentValue === 'string') {
      setEditValue(currentValue);
    } else if (currentValue && typeof currentValue === 'object') {
      setEditValue(currentValue.skill || currentValue.language || '');
    } else {
      setEditValue('');
    }
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setEditingIndex(null);
    setEditValue('');
  };

  const renderEditableList = (section: string, items: any[], title: string) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <button
            onClick={() => {
              setEditingSection(section);
              setEditingIndex(-1);
              setEditValue('');
            }}
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
        
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
              {editingSection === section && editingIndex === index ? (
                <div className="flex items-center space-x-2 flex-1">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={() => updateItem(section, index, editValue)}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="text-gray-600 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-gray-700 flex-1">
                    {typeof item === 'string' ? item : (item?.skill || item?.language || '')}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEditing(section, index, item)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteItem(section, index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {editingSection === section && editingIndex === -1 && (
          <div className="flex items-center space-x-2 mt-3">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={`Add new ${title.toLowerCase()}`}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={() => {
                if (editValue.trim()) {
                  addItem(section, editValue.trim());
                  setEditValue('');
                  setEditingSection(null);
                  setEditingIndex(null);
                }
              }}
              className="text-green-600 hover:text-green-700"
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              onClick={cancelEditing}
              className="text-gray-600 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderEditableSchedules = () => {
    if (!suggestions?.schedule?.schedules) return null;

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-600" />
            Schedule
          </h3>
          <button
            onClick={() => {
              if (suggestions) {
                const newSchedule = {
                  day: "Monday",
                  hours: { start: "09:00", end: "17:00" },
                  _id: { $oid: `generated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }
                };
                const newSuggestions = {
                  ...suggestions,
                  schedule: {
                    ...suggestions.schedule,
                    schedules: [...suggestions.schedule.schedules, newSchedule]
                  }
                };
                setSuggestions(newSuggestions);
              }
            }}
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Day</span>
          </button>
        </div>
        
        <div className="space-y-3">
          {suggestions.schedule.schedules.map((schedule, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Day</label>
                  <select
                    value={schedule.day}
                    onChange={(e) => {
                      if (suggestions) {
                        const newSuggestions = { ...suggestions };
                        newSuggestions.schedule.schedules[index].day = e.target.value;
                        setSuggestions(newSuggestions);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    type="time"
                    value={formatTimeForInput(schedule.hours.start)}
                    onChange={(e) => {
                      if (suggestions) {
                        const newSuggestions = { ...suggestions };
                        newSuggestions.schedule.schedules[index].hours.start = formatTimeForDisplay(e.target.value);
                        setSuggestions(newSuggestions);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">End Time</label>
                  <input
                    type="time"
                    value={formatTimeForInput(schedule.hours.end)}
                    onChange={(e) => {
                      if (suggestions) {
                        const newSuggestions = { ...suggestions };
                        newSuggestions.schedule.schedules[index].hours.end = formatTimeForDisplay(e.target.value);
                        setSuggestions(newSuggestions);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-3">
                <button
                  onClick={() => {
                    if (suggestions) {
                      const newSuggestions = { ...suggestions };
                      newSuggestions.schedule.schedules = newSuggestions.schedule.schedules.filter((_, i) => i !== index);
                      setSuggestions(newSuggestions);
                    }
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const formatTimeForInput = (time: string) => {
    if (!time) return "";
    // Convert "8:30" to "08:30" for HTML time input
    const parts = time.split(':');
    if (parts.length === 2) {
      const hours = parts[0].padStart(2, '0');
      const minutes = parts[1].padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    return time;
  };

  const formatTimeForDisplay = (time: string) => {
    if (!time) return "";
    // Convert "08:30" to "8:30" for display
    const parts = time.split(':');
    if (parts.length === 2) {
      const hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      return `${hours}:${minutes}`;
    }
    return time;
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
            <div className="flex-1">
              {editingSection === 'title' ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="text-2xl font-semibold text-gray-900 bg-transparent border-b-2 border-blue-500 focus:outline-none flex-1"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      if (suggestions && editValue.trim()) {
                        setSuggestions({ ...suggestions, title: editValue.trim() });
                        setEditingSection(null);
                        setEditValue('');
                      }
                    }}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="text-gray-600 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                    <Briefcase className="w-6 h-6 mr-2 text-blue-600" />
                    {suggestions.title}
                  </h2>
                  <button
                    onClick={() => {
                      setEditingSection('title');
                      setEditValue(suggestions.title);
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              {suggestions.category}
            </span>
          </div>

          {/* Description */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900">Description</h3>
              <button
                onClick={() => {
                  setEditingSection('description');
                  setEditValue(suggestions.description);
                }}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            {editingSection === 'description' ? (
              <div className="space-y-2">
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  autoFocus
                />
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      if (editValue.trim()) {
                        setSuggestions({ ...suggestions, description: editValue.trim() });
                        setEditingSection(null);
                        setEditValue('');
                      }
                    }}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="text-gray-600 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 leading-relaxed">{suggestions.description}</p>
            )}
          </div>

          {/* Highlights */}
          {renderEditableList('highlights', suggestions.highlights, 'Key Highlights')}

          {/* Schedule */}
          {renderEditableSchedules()}

          {/* Requirements */}
          {suggestions.requirements && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Requirements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderEditableList('requirements.essential', suggestions.requirements.essential, 'Essential Requirements')}
                {renderEditableList('requirements.preferred', suggestions.requirements.preferred, 'Preferred Requirements')}
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
                {renderEditableList('skills.languages', suggestions.skills.languages, 'Languages')}
                {renderEditableList('skills.soft', suggestions.skills.soft, 'Soft Skills')}
                {renderEditableList('skills.technical', suggestions.skills.technical, 'Technical Skills')}
              </div>
            </div>
          )}

          {/* Additional editable sections */}
          {renderEditableList('jobTitles', suggestions.jobTitles, 'Job Titles')}
          {renderEditableList('deliverables', suggestions.deliverables, 'Deliverables')}
          {renderEditableList('sectors', suggestions.sectors, 'Sectors')}
          {renderEditableList('destinationZones', suggestions.destinationZones, 'Destination Zones')}

          {/* Commission */}
          {suggestions.commission && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
                Commission Structure
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {suggestions.commission.options && suggestions.commission.options.length > 0 ? (
                  <div className="space-y-4">
                    {suggestions.commission.options.map((option, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <span className="text-gray-600 text-sm">Base:</span>
                            <p className="font-medium text-gray-900">{option.base}</p>
                          </div>
                          <div>
                            <span className="text-gray-600 text-sm">Base Amount:</span>
                            <p className="font-medium text-gray-900">{option.baseAmount}</p>
                          </div>
                          {option.bonus && (
                            <div>
                              <span className="text-gray-600 text-sm">Bonus:</span>
                              <p className="font-medium text-gray-900">{option.bonus}</p>
                            </div>
                          )}
                          {option.bonusAmount && (
                            <div>
                              <span className="text-gray-600 text-sm">Bonus Amount:</span>
                              <p className="font-medium text-gray-900">{option.bonusAmount}</p>
                            </div>
                          )}
                          {option.structure && (
                            <div>
                              <span className="text-gray-600 text-sm">Structure:</span>
                              <p className="font-medium text-gray-900">{option.structure}</p>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-600 text-sm">Currency:</span>
                            <p className="font-medium text-gray-900">{option.currency}</p>
                          </div>
                          {option.minimumVolume && (
                            <div>
                              <span className="text-gray-600 text-sm">Minimum Volume:</span>
                              <p className="font-medium text-gray-900">
                                {option.minimumVolume.amount} {option.minimumVolume.unit} per {option.minimumVolume.period}
                              </p>
                            </div>
                          )}
                          {option.transactionCommission && (
                            <div>
                              <span className="text-gray-600 text-sm">Transaction Commission:</span>
                              <p className="font-medium text-gray-900">
                                {option.transactionCommission.amount} ({option.transactionCommission.type})
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No commission structure defined</p>
                )}
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