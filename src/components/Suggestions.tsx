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
  Sun,
  Sunrise,
  Sunset,
  Moon,
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

type ScheduleEntry = {
  day: string;
  hours: { start: string; end: string };
  _id?: { $oid: string };
};

type GroupedSchedule = {
  hours: { start: string; end: string };
  days: string[];
};

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
      },
      _id: { $oid: "fallback" }
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

const TIMEZONE_OPTIONS = [
  "New York (EST/EDT)",
  "Chicago (CST/CDT)",
  "Denver (MST/MDT)",
  "Los Angeles (PST/PDT)",
  "London (GMT/BST)",
  "Paris (CET/CEST)",
  "Dubai (GST)",
  "Singapore (SGT)",
  "Tokyo (JST)",
  "Sydney (AEST/AEDT)"
];

const FLEXIBILITY_OPTIONS = [
  "Remote Work Available",
  "Flexible Hours",
  "Weekend Rotation",
  "Night Shift Available",
  "Split Shifts",
  "Part-Time Options",
  "Compressed Work Week",
  "Shift Swapping Allowed"
];

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
          const convertedSchedules: Array<ScheduleEntry> = [];
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

          // Format times to be compliant with <input type="time">
          result.schedule.schedules.forEach(schedule => {
            const formatTime = (timeStr: string) => {
              if (!timeStr || !timeStr.includes(':')) return '00:00';
              const [h, m] = timeStr.split(':');
              return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
            };
            schedule.hours.start = formatTime(schedule.hours.start);
            schedule.hours.end = formatTime(schedule.hours.end);
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

  const handleMinimumHoursChange = (period: 'daily' | 'weekly' | 'monthly', value: string) => {
    if (!suggestions) return;
    const newSuggestions = JSON.parse(JSON.stringify(suggestions));
    const numericValue = parseInt(value, 10);
    if (!isNaN(numericValue)) {
      if (!newSuggestions.schedule.minimumHours) {
          newSuggestions.schedule.minimumHours = {};
      }
      newSuggestions.schedule.minimumHours[period] = numericValue;
      setSuggestions(newSuggestions);
    } else if (value === '') {
        if (!newSuggestions.schedule.minimumHours) {
            newSuggestions.schedule.minimumHours = {};
        }
        delete newSuggestions.schedule.minimumHours[period];
        setSuggestions(newSuggestions);
    }
  };

  const handleAddTimeZone = (zone: string) => {
    if (!suggestions || !zone || suggestions.schedule.timeZones.includes(zone)) return;
    const newSuggestions = {
      ...suggestions,
      schedule: {
        ...suggestions.schedule,
        timeZones: [...suggestions.schedule.timeZones, zone]
      }
    };
    setSuggestions(newSuggestions);
  };

  const handleRemoveTimeZone = (zoneToRemove: string) => {
    if (!suggestions) return;
    const newSuggestions = {
      ...suggestions,
      schedule: {
        ...suggestions.schedule,
        timeZones: suggestions.schedule.timeZones.filter(zone => zone !== zoneToRemove)
      }
    };
    setSuggestions(newSuggestions);
  };

  const handleAddFlexibility = (option: string) => {
    if (!suggestions || !option || suggestions.schedule.flexibility.includes(option)) return;
    const newSuggestions = {
      ...suggestions,
      schedule: {
        ...suggestions.schedule,
        flexibility: [...suggestions.schedule.flexibility, option]
      }
    };
    setSuggestions(newSuggestions);
  };

  const handleRemoveFlexibility = (optionToRemove: string) => {
    if (!suggestions) return;
    const newSuggestions = {
      ...suggestions,
      schedule: {
        ...suggestions.schedule,
        flexibility: suggestions.schedule.flexibility.filter(option => option !== optionToRemove)
      }
    };
    setSuggestions(newSuggestions);
  };

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
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-blue-900">{title}</h4>
          <button
            onClick={() => {
              setEditingSection(section);
              setEditingIndex(-1);
              setEditValue('');
            }}
            className="flex items-center space-x-1 text-blue-900 hover:text-blue-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
        
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              {editingSection === section && editingIndex === index ? (
                <div className="flex items-center space-x-2 flex-1">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-blue-700"
                    autoFocus
                  />
                  <button
                    onClick={() => updateItem(section, index, editValue)}
                    className="text-green-700 hover:text-green-800 p-1"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="text-gray-500 hover:text-gray-700 p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-gray-700 flex-1 font-medium">
                    {typeof item === 'string' ? item : (item?.skill || item?.language || '')}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEditing(section, index, item)}
                      className="text-blue-900 hover:text-blue-700 p-1"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteItem(section, index)}
                      className="text-red-600 hover:text-red-700 p-1"
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
          <div className="flex items-center space-x-3 mt-4">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={`Add a new ${title.toLowerCase()}`}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-blue-700"
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
              className="text-green-700 hover:text-green-800 p-2"
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              onClick={cancelEditing}
              className="text-gray-500 hover:text-gray-700 p-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const formatTo12Hour = (time: string) => {
    if (!time || !time.includes(':')) return time;
    let [hoursStr, minutesStr] = time.split(':');
    let hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    return `${hours}:${minutesStr} ${ampm}`;
  };

  const renderEditableSchedules = () => {
    if (!suggestions?.schedule) return null;

    const groupedSchedules = (suggestions.schedule.schedules || []).reduce((groups, schedule) => {
      const key = `${schedule.hours.start}-${schedule.hours.end}`;
      if (!groups[key]) {
        groups[key] = { hours: schedule.hours, days: [] };
      }
      groups[key].days.push(schedule.day);
      return groups;
    }, {} as Record<string, GroupedSchedule>);

    const allWeekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const handleDayToggle = (dayToToggle: string, groupHours: { start: string; end: string }) => {
      const newSuggestions = JSON.parse(JSON.stringify(suggestions));
      const scheduleIndex = newSuggestions.schedule.schedules.findIndex((s: ScheduleEntry) => s.day === dayToToggle);

      if (scheduleIndex > -1) {
        const currentHours = newSuggestions.schedule.schedules[scheduleIndex].hours;
        if (currentHours.start === groupHours.start && currentHours.end === groupHours.end) {
          newSuggestions.schedule.schedules.splice(scheduleIndex, 1);
        } else {
          newSuggestions.schedule.schedules[scheduleIndex].hours = groupHours;
        }
      } else {
        newSuggestions.schedule.schedules.push({
          day: dayToToggle,
          hours: groupHours,
          _id: { $oid: `generated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }
        });
      }
      setSuggestions(newSuggestions);
    };
    
    const handleHoursChange = (group: GroupedSchedule, field: 'start' | 'end', value: string) => {
      const newSuggestions = JSON.parse(JSON.stringify(suggestions));
      group.days.forEach((day: string) => {
        const schedule = newSuggestions.schedule.schedules.find((s: ScheduleEntry) => s.day === day);
        if (schedule) {
          schedule.hours[field] = value;
        }
      });
      setSuggestions(newSuggestions);
    };

    const handlePresetClick = (group: GroupedSchedule, preset: string) => {
      let newHours;
      switch (preset) {
        case '9-5': newHours = { start: '09:00', end: '17:00' }; break;
        case 'Early': newHours = { start: '07:00', end: '15:00' }; break;
        case 'Late': newHours = { start: '11:00', end: '19:00' }; break;
        case 'Evening': newHours = { start: '14:00', end: '22:00' }; break;
        default: newHours = group.hours;
      }

      const newSuggestions = JSON.parse(JSON.stringify(suggestions));
      group.days.forEach((day: string) => {
        const schedule = newSuggestions.schedule.schedules.find((s: ScheduleEntry) => s.day === day);
        if (schedule) {
          schedule.hours = newHours;
        }
      });
      setSuggestions(newSuggestions);
    };
    
    const addNewScheduleGroup = () => {
      if (!suggestions) return;
      const scheduledDays = suggestions.schedule.schedules.map(s => s.day);
      const firstUnscheduledDay = allWeekDays.find(d => !scheduledDays.includes(d));

      if (firstUnscheduledDay) {
        const newSchedule: ScheduleEntry = {
          day: firstUnscheduledDay,
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
    };
    
    return (
      <div className="space-y-6">
        {Object.keys(groupedSchedules).length > 0 ? (
          Object.entries(groupedSchedules).map(([key, group], index) => (
            <div key={key} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h5 className="text-md font-semibold text-gray-800 mb-4">Working Days</h5>
              <div className="flex flex-wrap gap-2 mb-6">
                {allWeekDays.map(day => {
                  const isSelected = group.days.includes(day);
                  const isInOtherGroup = !isSelected && suggestions.schedule.schedules.some(s => s.day === day);

                  return (
                    <button
                      key={day}
                      onClick={() => handleDayToggle(day, group.hours)}
                      disabled={isInOtherGroup}
                      className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                        isSelected 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : isInOtherGroup 
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <div className="bg-slate-50 rounded-lg p-6 border border-slate-100">
                <h5 className="text-md font-semibold text-gray-700 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  Working Hours
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-1 flex items-center">
                      <Sunrise className="w-4 h-4 mr-1.5 text-orange-400" />
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={group.hours.start}
                      onChange={(e) => handleHoursChange(group, 'start', e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-1 flex items-center">
                      <Sunset className="w-4 h-4 mr-1.5 text-indigo-400" />
                      End Time
                    </label>
                    <input
                      type="time"
                      value={group.hours.end}
                      onChange={(e) => handleHoursChange(group, 'end', e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="text-center bg-white border border-gray-200 rounded-lg p-3 mb-6">
                  <span className="font-semibold text-gray-700 text-lg">
                    {formatTo12Hour(group.hours.start)} - {formatTo12Hour(group.hours.end)}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button onClick={() => handlePresetClick(group, '9-5')} className="flex flex-col items-center justify-center py-3 px-2 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors shadow-sm">
                    <Sun className="w-5 h-5 text-yellow-500 mb-1" />
                    <span className="text-sm font-medium text-gray-600">9-5</span>
                  </button>
                  <button onClick={() => handlePresetClick(group, 'Early')} className="flex flex-col items-center justify-center py-3 px-2 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors shadow-sm">
                    <Sunrise className="w-5 h-5 text-orange-500 mb-1" />
                    <span className="text-sm font-medium text-gray-600">Early</span>
                  </button>
                  <button onClick={() => handlePresetClick(group, 'Late')} className="flex flex-col items-center justify-center py-3 px-2 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors shadow-sm">
                    <Clock className="w-5 h-5 text-indigo-500 mb-1" />
                    <span className="text-sm font-medium text-gray-600">Late</span>
                  </button>
                  <button onClick={() => handlePresetClick(group, 'Evening')} className="flex flex-col items-center justify-center py-3 px-2 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors shadow-sm">
                    <Moon className="w-5 h-5 text-purple-500 mb-1" />
                    <span className="text-sm font-medium text-gray-600">Evening</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">No schedule defined.</p>
          </div>
        )}

        <div className="flex justify-center mt-6">
          <button
            onClick={addNewScheduleGroup}
            className="flex items-center space-x-2 px-5 py-2 border-2 border-dashed border-blue-400 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>Add Schedule Group</span>
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 space-y-8">
            {/* Minimum Hours */}
            <div>
                <h5 className="text-md font-semibold text-gray-800 mb-4">Minimum Hours Requirements</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-600 mb-1 block">Daily</label>
                        <input
                            type="number"
                            placeholder="e.g. 8"
                            value={suggestions.schedule.minimumHours?.daily ?? ''}
                            onChange={(e) => handleMinimumHoursChange('daily', e.target.value)}
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600 mb-1 block">Weekly</label>
                        <input
                            type="number"
                            placeholder="e.g. 40"
                            value={suggestions.schedule.minimumHours?.weekly ?? ''}
                            onChange={(e) => handleMinimumHoursChange('weekly', e.target.value)}
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600 mb-1 block">Monthly</label>
                        <input
                            type="number"
                            placeholder="e.g. 160"
                            value={suggestions.schedule.minimumHours?.monthly ?? ''}
                            onChange={(e) => handleMinimumHoursChange('monthly', e.target.value)}
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Time Zones */}
            <div>
                <h5 className="text-md font-semibold text-gray-800 mb-4">Time Zones</h5>
                <div className="flex flex-wrap gap-2 mb-4">
                    {suggestions.schedule.timeZones.map(zone => (
                        <div key={zone} className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium pl-3 pr-2 py-1 rounded-full">
                            {zone}
                            <button onClick={() => handleRemoveTimeZone(zone)} className="ml-2 text-blue-600 hover:text-blue-800 rounded-full focus:outline-none focus:bg-blue-200">
                                <XCircle className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
                <select
                    onChange={(e) => {
                        if (e.target.value) handleAddTimeZone(e.target.value);
                        e.target.value = ""; // Reset select
                    }}
                    className="w-full p-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue=""
                >
                    <option value="" disabled>Add a time zone...</option>
                    {TIMEZONE_OPTIONS.filter(opt => !suggestions.schedule.timeZones.includes(opt)).map(zone => (
                        <option key={zone} value={zone}>{zone}</option>
                    ))}
                </select>
            </div>
            
            {/* Schedule Flexibility */}
            <div>
                <h5 className="text-md font-semibold text-gray-800 mb-4">Schedule Flexibility</h5>
                <div className="flex flex-wrap gap-2 mb-4">
                    {suggestions.schedule.flexibility.map(opt => (
                        <div key={opt} className="flex items-center bg-green-100 text-green-800 text-sm font-medium pl-3 pr-2 py-1 rounded-full">
                            {opt}
                            <button onClick={() => handleRemoveFlexibility(opt)} className="ml-2 text-green-600 hover:text-green-800 rounded-full focus:outline-none focus:bg-green-200">
                                <XCircle className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
                 <select
                    onChange={(e) => {
                        if (e.target.value) handleAddFlexibility(e.target.value);
                        e.target.value = ""; // Reset select
                    }}
                    className="w-full p-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue=""
                >
                    <option value="" disabled>Add a flexibility option...</option>
                    {FLEXIBILITY_OPTIONS.filter(opt => !suggestions.schedule.flexibility.includes(opt)).map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 text-blue-700 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-red-50 text-red-800 p-8">
        <AlertCircle className="w-16 h-16 mb-4 text-red-600" />
        <h2 className="text-2xl font-bold mb-2">Error Generating Suggestions</h2>
        <p className="text-center mb-6">{error}</p>
        <button
          onClick={onBack}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-red-700 text-white font-semibold rounded-lg shadow-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>
    );
  }

  if (!suggestions) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-gray-700 p-8">
        <Brain className="w-16 h-16 mb-4 text-gray-400" />
        <h2 className="text-2xl font-bold mb-2">No Suggestions Available</h2>
        <p className="text-center mb-6">We couldn't generate suggestions based on your input. Please try again.</p>
        <button
          onClick={onBack}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Review & Refine Suggestions</h1>
            <button
              onClick={handleConfirm}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <span>Confirm & Continue</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 space-y-12">
            
            {/* Basic Section */}
            <div className="p-6 rounded-lg border border-gray-200">
              <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
                <Briefcase className="w-7 h-7 mr-3 text-blue-700" />
                Basic Information
              </h3>
              {renderEditableList('highlights', suggestions.highlights, 'Highlights')}
              {renderEditableList('jobTitles', suggestions.jobTitles, 'Job Titles')}
              {renderEditableList('deliverables', suggestions.deliverables, 'Deliverables')}
              {renderEditableList('sectors', suggestions.sectors, 'Sectors')}
              {renderEditableList('destinationZones', suggestions.destinationZones, 'Destination Zones')}
            </div>

            {/* Schedule Section */}
            <div className="p-6 rounded-lg border border-gray-200">
              <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
                <Clock className="w-7 h-7 mr-3 text-blue-700" />
                Schedule
              </h3>
              {renderEditableSchedules()}
            </div>
            
            {/* Commission Section */}
            <div className="p-6 rounded-lg border border-gray-200">
              <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
                <DollarSign className="w-7 h-7 mr-3 text-blue-700" />
                Commission
              </h3>
              {/* Commission content goes here */}
            </div>

            {/* Skills Section */}
            <div className="p-6 rounded-lg border border-gray-200">
              <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
                <Award className="w-7 h-7 mr-3 text-blue-700" />
                Skills & Requirements
              </h3>
              {renderEditableList('requirements.essential', suggestions.requirements?.essential, 'Essential Requirements')}
              {renderEditableList('requirements.preferred', suggestions.requirements?.preferred, 'Preferred Requirements')}
              {renderEditableList('skills.technical', suggestions.skills?.technical, 'Technical Skills')}
              {renderEditableList('skills.soft', suggestions.skills?.soft, 'Soft Skills')}
              {renderEditableList('skills.languages', suggestions.skills?.languages, 'Languages')}
            </div>

            {/* Team Section */}
            <div className="p-6 rounded-lg border border-gray-200">
              <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
                <Users className="w-7 h-7 mr-3 text-blue-700" />
                Team Structure
              </h3>
              {/* Team content goes here */}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

function parseYearsExperience(val: any) {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    // Prend le premier nombre trouvé dans la string
    const match = val.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }
  return 0;
} 