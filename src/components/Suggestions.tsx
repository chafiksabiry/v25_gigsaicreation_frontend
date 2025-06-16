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
  | 'activity';

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
  onConfirm?: (suggestions: GigSuggestion) => void;
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
    yearsExperience: string;
  };
}

interface TeamData {
  size: string;
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
    yearsExperience: string;
  };
  schedule: {
    days: string[];
    startTime: string;
    endTime: string;
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
  team?: TeamData;
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

const fallbackSuggestions: SuggestionState = {
  title: "Software Engineer",
  description: "Looking for an experienced software engineer",
  category: "Technology",
  highlights: ["Remote work", "Competitive salary", "Growth opportunities"],
  jobTitles: ["Software Engineer", "Full Stack Developer", "Backend Developer", "Frontend Developer"],
  deliverables: ["Code implementation", "Technical documentation", "Unit tests", "Code review"],
  skills: {
    languages: [{ name: "English", level: "Professional" }],
    soft: ["Communication", "Problem Solving", "Teamwork"],
    professional: [],
    technical: [],
    certifications: []
  },
  requirements: {
    essential: ["Bachelor's degree", "3+ years experience"],
    preferred: ["Master's degree", "5+ years experience"]
  },
  sectors: ["Technology", "Finance", "Healthcare"],
  destinationZones: ["Spain", "France", "Italy", "Germany", "Portugal", "Greece", "Poland", "Czech Republic", "Hungary", "Romania", "Bulgaria", "Croatia", "Slovakia", "Slovenia", "Denmark", "Finland", "Sweden", "Norway", "Ireland", "Estonia", "Latvia", "Lithuania", "Luxembourg", "Malta", "Cyprus"],
  schedule: {
    days: [],
    startTime: "09:00",
    endTime: "18:00",
    timeZones: ["CET"],
    flexibility: [],
    minimumHours: { daily: 8, weekly: 40, monthly: 160 }
  },
  commission: { options: [] },
  activity: { options: [] },
  team: { 
    size: 1,
    structure: [{
      roleId: "default",
      count: 1,
      seniority: {
        level: "Senior",
        yearsExperience: "5+"
      }
    }],
    territories: ["Global"]
  },
  leads: { 
    types: [], 
    sources: [],
    distribution: { method: "", rules: [] },
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

export function Suggestions({ input, onBack, onConfirm }: SuggestionsProps) {
  const [suggestions, setSuggestions] = useState<GigSuggestion | null>(null);
  const [editableSuggestions, setEditableSuggestions] = useState<EditableGigSuggestion | null>(null);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [apiKeyMissing] = useState(!openai);
  const [selectedJobTitle, setSelectedJobTitle] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState<JobDescription | null>(
    null
  );
  const [isJobDescriptionLoading, setIsJobDescriptionLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSection, setEditingSection] = useState<StringArraySection | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showMetadata, setShowMetadata] = useState(false);
  const [metadata, setMetadata] = useState<GigMetadata | null>(null);
  const [editableMetadata, setEditableMetadata] = useState<GigMetadata | null>(
    null
  );
  const [isMetadataLoading, setIsMetadataLoading] = useState(false);
  const [isSuggestionsConfirmed, setIsSuggestionsConfirmed] = useState(false);
  const [editingMetadataField, setEditingMetadataField] = useState<
    string | null
  >(null);
  const [editingScheduleIndex, setEditingScheduleIndex] = useState<
    number | null
  >(null);
  const [editingHourIndex, setEditingHourIndex] = useState<number | null>(null);
  const [isLeadsModalOpen, setIsLeadsModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [gigData, setGigData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBasicSection, setShowBasicSection] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [leadsData, setLeadsData] = useState<any>(null);

  useEffect(() => {
    if (input.trim().length > 0) {
      setIsSuggestionsLoading(true);
      generateSuggestions().finally(() => {
        setIsSuggestionsLoading(false);
      });
    }
  }, [input]);

  const handleConfirm = () => {
    if (!suggestions) return;

    // Transform commission data from suggestions format to CommissionSection format
    const commissionData = {
      options: [{
        base: suggestions.commission?.options?.[0]?.base || "Fixed Salary",
        baseAmount: suggestions.commission?.options?.[0]?.baseAmount || "2",
        bonus: suggestions.commission?.options?.[0]?.bonus,
        bonusAmount: suggestions.commission?.options?.[0]?.bonusAmount,
        currency: suggestions.commission?.options?.[0]?.currency || "USD",
        minimumVolume: {
          amount: suggestions.commission?.options?.[0]?.minimumVolume?.amount || "4",
          period: suggestions.commission?.options?.[0]?.minimumVolume?.period || "Monthly",
          unit: suggestions.commission?.options?.[0]?.minimumVolume?.unit || "Projects"
        },
        transactionCommission: {
          type: suggestions.commission?.options?.[0]?.transactionCommission?.type || "Fixed Amount",
          amount: suggestions.commission?.options?.[0]?.transactionCommission?.amount || "3"
        }
      }]
    };

    const transformedSuggestions: GigSuggestion = {
      title: suggestions.title || "",
      description: suggestions.description || "",
      category: suggestions.category || "",
      highlights: suggestions.highlights || [],
      jobTitles: suggestions.jobTitles || [],
      deliverables: suggestions.deliverables || [],
      sectors: suggestions.sectors || [],
      destinationZones: suggestions.destinationZones || [],
      schedule: {
        days: suggestions.schedule?.days || [],
        startTime: suggestions.schedule?.startTime || "09:00",
        endTime: suggestions.schedule?.endTime || "18:00",
        timeZones: suggestions.schedule?.timeZones || ["CET"],
        flexibility: suggestions.schedule?.flexibility || [],
        minimumHours: {
          daily: suggestions.schedule?.minimumHours?.daily || 8,
          weekly: suggestions.schedule?.minimumHours?.weekly || 40,
          monthly: suggestions.schedule?.minimumHours?.monthly || 160
        }
      },
      requirements: {
        essential: suggestions.requirements?.essential || [],
        preferred: suggestions.requirements?.preferred || []
      },
      benefits: suggestions.benefits || [],
      skills: {
        languages: Array.isArray(suggestions.skills?.languages) 
          ? suggestions.skills.languages.map(lang => ({ name: lang.name, level: lang.level })) 
          : [],
        soft: suggestions.skills?.soft || [],
        professional: suggestions.skills?.professional || [],
        technical: suggestions.skills?.technical || [],
        certifications: suggestions.skills?.certifications || []
      },
      seniority: suggestions?.seniority ? {
        level: suggestions.seniority.level || '',
        yearsExperience: Number(suggestions.seniority.yearsExperience) || 0,
        years: String(suggestions.seniority.yearsExperience) || '0'
      } : {
        level: '',
        yearsExperience: 0,
        years: '0'
      },
      commission: commissionData,
      activity: suggestions.activity || {
        options: []
      },
      team: suggestions.team || { size: 1, structure: [{ roleId: "default", count: 1, seniority: { level: "Senior", yearsExperience: "5+" } }], territories: ["Global"] },
      leads: suggestions.leads || { types: [], sources: [] },
      documentation: suggestions.documentation || { 
        templates: null,
        reference: null,
        product: [],
        process: [],
        training: []
      }
    };

    if (onConfirm) {
      onConfirm(transformedSuggestions);
    }
  };

  const generateJobDescription = async (title: string) => {
    if (!openai) {
      const fallbackDescriptions: Record<string, JobDescription> = {
        "Sales Representative": {
          title: "Sales Representative",
          description:
            "A Sales Representative is responsible for actively seeking out and engaging with potential customers to generate leads and close sales deals.",
          responsibilities: [
            "Identify and contact potential customers",
            "Present products and services effectively",
            "Maintain relationships with existing clients",
            "Meet or exceed sales targets",
            "Track and report sales activities",
          ],
          qualifications: [
            "2+ years of sales experience",
            "Strong communication and negotiation skills",
            "Proven track record of meeting sales goals",
            "CRM software proficiency",
            "Bachelor's degree in business or related field preferred",
          ],
          languages: {
            required: ["English (Fluent)"],
            preferred: ["Spanish (Conversational)", "Mandarin (Basic)"],
          },
        },
      };

      setJobDescription(
        fallbackDescriptions[title] || {
          title,
          description: "Position details currently unavailable.",
          responsibilities: [],
          qualifications: [],
          languages: {
            required: [],
            preferred: [],
          },
        }
      );
      return;
    }

    try {
      setIsJobDescriptionLoading(true);

      const prompt = `Create a detailed job description for a "${title}" position in JSON format with the following structure:
      {
        "title": "${title}",
        "description": "A concise overview of the role",
        "responsibilities": ["List of 5 key responsibilities"],
        "qualifications": ["List of 5 key qualifications"],
        "languages": {
          "required": ["List of required languages with proficiency levels"],
          "preferred": ["List of preferred languages with proficiency levels"]
        }
      }
      Make it specific and professional, including relevant language requirements for the role.`;

      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-3.5-turbo",
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content;
      if (response) {
        const jobData = JSON.parse(response);
        setJobDescription(jobData);
      }
    } catch (error) {
      console.error("Error generating job description:", error);
      setJobDescription({
        title,
        description: "Failed to load job description. Please try again later.",
        responsibilities: [],
        qualifications: [],
        languages: {
          required: [],
          preferred: [],
        },
      });
    } finally {
      setIsJobDescriptionLoading(false);
    }
  };

  const handleJobTitleClick = (title: string) => {
    if (selectedJobTitle === title) {
      setSelectedJobTitle(null);
      setJobDescription(null);
    } else {
      setSelectedJobTitle(title);
      generateJobDescription(title);
    }
  };

  const startEditing = (section: StringArraySection, index: number, value: string) => {
    setEditingSection(section);
    setEditingIndex(index);
    setEditValue(value);
  };

  const saveEdit = () => {
    if (editingSection && editingIndex !== null && editableSuggestions) {
      const newSuggestions = { ...editableSuggestions };
      const items = getNestedProperty(newSuggestions, editingSection);
      if (isStringArray(items)) {
        items[editingIndex] = editValue;
        setEditableSuggestions({
          ...newSuggestions,
          commission: newSuggestions.commission || { options: [] },
          activity: newSuggestions.activity || { options: [] }
        });
        setSuggestions({
          ...newSuggestions,
          commission: newSuggestions.commission || { options: [] },
          activity: newSuggestions.activity || { options: [] }
        });
      }
      setEditingSection(null);
      setEditingIndex(null);
      setEditValue("");
    }
  };

  const cancelEdit = () => {
    setEditingSection(null);
    setEditingIndex(null);
    setEditValue("");
  };

  const addNewItem = (section: StringArraySection) => {
    if (!editableSuggestions) return;
    const newSuggestions = { ...editableSuggestions };
    const items = getNestedProperty(newSuggestions, section);
    if (section === 'commission') {
      newSuggestions[section] = {
        options: [...(items as any).options, {
          base: '',
          baseAmount: '',
          currency: 'EUR',
          minimumVolume: { amount: '', period: '', unit: '' },
          transactionCommission: { type: '', amount: '' }
        }]
      };
    } else if (section === 'activity') {
      newSuggestions[section] = {
        options: [...(items as any).options, {
          type: '',
          description: '',
          requirements: []
        }]
      };
    } else if (isStringArray(items)) {
      setNestedProperty(newSuggestions, section, [...items, ""]);
    }
    setEditableSuggestions(newSuggestions);
  };

  const removeItem = (section: StringArraySection, index: number) => {
    if (!editableSuggestions) return;
    const newSuggestions = { ...editableSuggestions };
    const items = getNestedProperty(newSuggestions, section);
    if (isStringArray(items)) {
      const filteredItems = items.filter((_, i) => i !== index);
      setNestedProperty(newSuggestions, section, filteredItems);
      setEditableSuggestions({
        ...newSuggestions,
        commission: newSuggestions.commission || { options: [] },
        activity: newSuggestions.activity || { options: [] }
      });
      setSuggestions({
        ...newSuggestions,
        commission: newSuggestions.commission || { options: [] },
        activity: newSuggestions.activity || { options: [] }
      });
    }
  };

  const startEditingMetadata = (field: string, value: string) => {
    setEditingMetadataField(field);
    setEditValue(value);
  };

  const startEditingSchedule = (
    scheduleIndex: number,
    field: string,
    value: string
  ) => {
    setEditingScheduleIndex(scheduleIndex);
    setEditingMetadataField(field);
    setEditValue(value);
  };

  const startEditingHour = (scheduleIndex: number, hourIndex: number) => {
    setEditingScheduleIndex(scheduleIndex);
    setEditingHourIndex(hourIndex);
  };

  const saveMetadataEdit = () => {
    if (!editableMetadata || !editingMetadataField) return;

    const updatedMetadata = { ...editableMetadata };

    if (editingScheduleIndex !== null) {
      if (editingHourIndex !== null) {
        // Editing schedule hours
        const [day, time] = editValue.split(",");
        const [start, end] = time.split("-").map((t) => t.trim());
        updatedMetadata.schedules[editingScheduleIndex].hours[
          editingHourIndex
        ] = {
          day: day.trim(),
          start,
          end,
        };
      } else {
        // Editing schedule name or description
        updatedMetadata.schedules[editingScheduleIndex] = {
          ...updatedMetadata.schedules[editingScheduleIndex],
          [editingMetadataField]: editValue,
        };
      }
    } else if (
      Array.isArray(updatedMetadata[editingMetadataField as keyof GigMetadata])
    ) {
      // Editing arrays (suggestedNames or industries)
      const arrayField = editingMetadataField as keyof Pick<
        GigMetadata,
        "suggestedNames" | "industries"
      >;
      updatedMetadata[arrayField] = editValue
        .split(",")
        .map((item) => item.trim());
    }

    setEditableMetadata(updatedMetadata);
    setMetadata(updatedMetadata);
    cancelEdit();
  };

  const addNewSchedule = () => {
    if (!editableMetadata) return;

    const newSchedule = {
      name: "New Schedule",
      description: "Description for new schedule",
      hours: [{ day: "Monday", start: "09:00", end: "17:00" }],
    };

    const updatedMetadata = {
      ...editableMetadata,
      schedules: [...editableMetadata.schedules, newSchedule],
    };

    setEditableMetadata(updatedMetadata);
    setMetadata(updatedMetadata);
    setEditingScheduleIndex(updatedMetadata.schedules.length - 1);
    setEditingMetadataField("name");
    setEditValue("New Schedule");
  };

  const addNewHour = (scheduleIndex: number) => {
    if (!editableMetadata) return;

    const updatedMetadata = { ...editableMetadata };
    updatedMetadata.schedules[scheduleIndex].hours.push({
      day: "New Day",
      start: "09:00",
      end: "17:00",
    });

    setEditableMetadata(updatedMetadata);
    setMetadata(updatedMetadata);
    setEditingScheduleIndex(scheduleIndex);
    setEditingHourIndex(
      updatedMetadata.schedules[scheduleIndex].hours.length - 1
    );
  };

  const removeSchedule = (index: number) => {
    if (!editableMetadata) return;

    const updatedMetadata = {
      ...editableMetadata,
      schedules: editableMetadata.schedules.filter((_, i) => i !== index),
    };

    setEditableMetadata(updatedMetadata);
    setMetadata(updatedMetadata);
  };

  const removeHour = (scheduleIndex: number, hourIndex: number) => {
    if (!editableMetadata) return;

    const updatedMetadata = { ...editableMetadata };
    updatedMetadata.schedules[scheduleIndex].hours = updatedMetadata.schedules[
      scheduleIndex
    ].hours.filter((_, i) => i !== hourIndex);

    setEditableMetadata(updatedMetadata);
    setMetadata(updatedMetadata);
  };

  const generateMetadata = async () => {
    if (!openai) {
      const fallbackMetadata: GigMetadata = {
        suggestedNames: [
          "Professional Sales Development Program",
          "Enterprise Sales Excellence Initiative",
          "Strategic Sales Growth Campaign",
          "Sales Performance Optimization Project",
        ],
        industries: [
          "Technology & Software",
          "Financial Services",
          "Healthcare & Medical",
          "Professional Services",
          "Manufacturing & Industrial",
        ],
        schedules: [
          {
            name: "Standard Business Hours",
            description:
              "Traditional work schedule aligned with most business operations",
            hours: [
              { day: "Monday", start: "9:00", end: "17:00" },
              { day: "Tuesday", start: "9:00", end: "17:00" },
              { day: "Wednesday", start: "9:00", end: "17:00" },
              { day: "Thursday", start: "9:00", end: "17:00" },
              { day: "Friday", start: "9:00", end: "17:00" },
            ],
          },
          {
            name: "Extended Business Hours",
            description: "Extended coverage for global business operations",
            hours: [
              { day: "Monday", start: "9:00", end: "19:00" },
              { day: "Tuesday", start: "9:00", end: "19:00" },
              { day: "Wednesday", start: "9:00", end: "19:00" },
              { day: "Thursday", start: "9:00", end: "19:00" },
              { day: "Friday", start: "9:00", end: "19:00" },
              { day: "Saturday", start: "10:00", end: "15:00" },
            ],
          },
        ],
      };
      setMetadata(fallbackMetadata);
      setEditableMetadata(fallbackMetadata);
      return;
    }

    try {
      setIsMetadataLoading(true);

      const prompt = `Based on this gig description: "${input}"

      Please provide suggestions in the following JSON format:
      {
        "suggestedNames": [4 professional and catchy names for the gig],
        "industries": [5 relevant industries for this type of work],
        "schedules": [
          {
            "name": "schedule name",
            "description": "brief description of the schedule",
            "hours": [
              {
                "day": "day of week",
                "start": "start time (HH:MM)",
                "end": "end time (HH:MM)"
              }
            ]
          }
        ]
      }

      Include at least 2 different schedule options with appropriate working hours.`;

      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-3.5-turbo",
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content;
      if (response) {
        const metadataData = JSON.parse(response);
        setMetadata(metadataData);
        setEditableMetadata(metadataData);
        console.log('Generated Metadata:', metadataData);
      }
    } catch (error) {
      console.error("Error generating metadata:", error);
      const fallbackMetadata: GigMetadata = {
        suggestedNames: [
          "Professional Sales Development Program",
          "Enterprise Sales Excellence Initiative",
          "Strategic Sales Growth Campaign",
          "Sales Performance Optimization Project",
        ],
        industries: [
          "Technology & Software",
          "Financial Services",
          "Healthcare & Medical",
          "Professional Services",
          "Manufacturing & Industrial",
        ],
        schedules: [
          {
            name: "Standard Business Hours",
            description:
              "Traditional work schedule aligned with most business operations",
            hours: [
              { day: "Monday", start: "9:00", end: "17:00" },
              { day: "Tuesday", start: "9:00", end: "17:00" },
              { day: "Wednesday", start: "9:00", end: "17:00" },
              { day: "Thursday", start: "9:00", end: "17:00" },
              { day: "Friday", start: "9:00", end: "17:00" },
            ],
          },
          {
            name: "Extended Business Hours",
            description: "Extended coverage for global business operations",
            hours: [
              { day: "Monday", start: "9:00", end: "19:00" },
              { day: "Tuesday", start: "9:00", end: "19:00" },
              { day: "Wednesday", start: "9:00", end: "19:00" },
              { day: "Thursday", start: "9:00", end: "19:00" },
              { day: "Friday", start: "9:00", end: "19:00" },
              { day: "Saturday", start: "10:00", end: "15:00" },
            ],
          },
        ],
      };
      setMetadata(fallbackMetadata);
      setEditableMetadata(fallbackMetadata);
    } finally {
      setIsMetadataLoading(false);
    }
  };

  const handleValidate = () => {
    generateMetadata();
    setShowMetadata(true);
  };


    const generateSuggestions = async () => {
      if (!openai) {
        // Fallback suggestions if OpenAI is not available
        const fallbackSuggestions = {
          jobTitles: ["Sales Development Representative", "Business Development Manager"],
          deliverables: [
            "Generate qualified leads",
            "Convert prospects into customers",
            "Achieve monthly revenue target of €50,000",
            "Collaborate with marketing team",
            "Track opportunities in CRM"
          ],
          skills: {
            languages: [{ name: "English", level: "Fluent" }],
            soft: ["B2B Sales", "CRM Software", "Lead Generation", "Negotiation"],
            professional: [],
            technical: [],
            certifications: []
          },
          timeframes: ["Full-time", "Remote"],
          requirements: { essential: [], preferred: [] },
          // languages: ["English (Fluent)"],
          seniority: {
            years: "",
            level: "",
            yearsExperience: 0
          },
          schedule: {
            days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            hours: "9:00 AM - 6:00 PM CET",
            timeZones: ["CET"],
            flexibility: ["Remote work", "Flexible hours"],
            minimumHours: {
              daily: 8,
              weekly: 40,
              monthly: 160
            },
            startTime: "09:00",
            endTime: "18:00"
          },
          commission: {
            options: [{
              base: "Fixed Salary",
              baseAmount: "0",
              bonus: "quarterly",
              bonusAmount: "5000",
              currency: "USD",
              minimumVolume: {
                amount: "0",
                period: "Monthly",
                unit: "Projects"
              },
              transactionCommission: {
                type: "Fixed Amount",
                amount: "0"
              }
            }]
          },
          sectors: ["SaaS", "Software", "Technology"],
          activity: {
            options: [{
              type: "B2B Sales",
              description: "Direct B2B sales for SaaS products",
              requirements: [
                "B2B sales experience",
                "CRM software proficiency",
                "Strong communication skills"
              ]
            }]
          },
          destinationZones: ["Europe", "North America", "Asia", "South America", "Africa", "Oceania", "Middle East"]
        };
        setSuggestions(fallbackSuggestions);
        setEditableSuggestions(fallbackSuggestions);
        return;
      }

      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `You are a gig creation assistant. Your task is to generate suggestions for a gig based on the input provided.
              IMPORTANT: You must respond with ONLY a valid JSON object. Do not include any other text, explanations, or markdown formatting.
              The response must be a single JSON object matching this exact structure:
              {
                jobTitles: string[],
                deliverables: string[],
                compensation: string[],
                skills: {
                  // Human languages required for the role (e.g. English, French, Spanish)
                  languages: { name: string, level: string }[],
                  soft: string[],
                  professional: string[],
                  technical: string[],
                  certifications: string[]
                },
                kpis: string[],
                timeframes: string[],
                requirements: string[],
                // languages: string[],
                seniority: {
                  level: string,
                  yearsExperience: string
                },
                schedule: {
                  days: string[],
                  hours: string,
                  timeZones: string[],
                  flexibility: string[],
                  minimumHours: {
                    daily?: number,
                    weekly?: number,
                    monthly?: number
                  },
                  startTime: string,
                  endTime: string
                },
                commission: {
                  options: Array<{
                    base: string,
                    baseAmount: string,
                    bonus?: string,
                    bonusAmount?: string,
                    currency: string,
                    minimumVolume: {
                      amount: string,
                      period: string,
                      unit: string
                    },
                    transactionCommission: {
                      type: string,
                      amount: string
                    }
                  }>
                },
                sectors: string[],
                activity: {
                  options: Array<{
                    type: string,
                    description: string,
                    requirements: string[]
                  }>
                },
                destinationZones: string[],
                team: {
                  size: string,
                  structure: Array<{
                    roleId: string,
                    count: number,
                    seniority: {
                      level: string,
                      yearsExperience: string
                    }
                  }>,
                  territories: string[]
                }
              }

              For destinationZones, analyze the input and suggest relevant geographic regions where the gig could be performed.
              Consider factors like:
              - Target market
              - Time zone requirements
              - Language requirements
              - Cultural considerations
              - Market potential
              - Infrastructure requirements
              
              Remember: Respond with ONLY the JSON object, no other text.`
            },
            {
              role: "user",
              content: input
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        });

        const content = response.choices[0]?.message?.content;
        if (content) {
          try {
            const parsedSuggestions = JSON.parse(content);
            
            // Ensure all required fields are present with default values if missing
            const defaultSuggestions = {
              seniority: {
                years: "Senior",
                level: "",
                yearsExperience: ""
              },
              schedule: {
                days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                hours: "9:00 AM - 6:00 PM CET",
                timeZones: ["CET"],
                flexibility: ["Remote work", "Flexible hours"],
                minimumHours: {
                  daily: 8,
                  weekly: 40,
                  monthly: 160
                },
                startTime: "09:00",
                endTime: "18:00"
              },
              commission: {
                options: [{
                  base: "Fixed Salary",
                  baseAmount: "0",
                  bonus: "quarterly",
                  bonusAmount: "5000",
                  currency: "USD",
                  minimumVolume: {
                    amount: "0",
                    period: "Monthly",
                    unit: "Projects"
                  },
                  transactionCommission: {
                    type: "Fixed Amount",
                    amount: "2"
                  }
                }]
              },
              activity: {
                options: [{
                  type: "Default Activity",
                  description: "Default activity description",
                  requirements: ["Default requirement"]
                }]
              },
              team: {
                size: 0,
                structure: [{
                  roleId: "default",
                  count: 1,
                  seniority: {
                    level: "Senior",
                    yearsExperience: "5+"
                  }
                }],
                territories: ["Global"]
              },
              destinationZones: ["Europe", "North America", "Asia", "South America", "Africa", "Oceania", "Middle East"]
            };

            const finalSuggestions = {
              ...defaultSuggestions,
              ...parsedSuggestions,
              team: {
                ...defaultSuggestions.team,
                ...parsedSuggestions.team,
                structure: parsedSuggestions.team?.structure || defaultSuggestions.team.structure
              }
            };

            setSuggestions(finalSuggestions);
            setEditableSuggestions(finalSuggestions);
            setGigData(finalSuggestions); // Set the gigData state with the generated suggestions
            console.log('Generated Suggestions:', finalSuggestions);
          } catch (error) {
            console.error("Error parsing suggestions:", error);
            // Fallback to default suggestions if parsing fails
            setSuggestions(fallbackSuggestions);
            setEditableSuggestions(fallbackSuggestions);
          }
        }
      } catch (error: any) {
        console.error("Error generating suggestions:", error);
        
        // Check if it's a rate limit error (429)
        if (error?.status === 429 || error?.error?.code === 'rate_limit_exceeded') {
          await Swal.fire({
            title: "Service Temporarily Unavailable",
            text: "The AI assistance service is temporarily unavailable. We will continue in manual mode.",
            icon: "info",
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
            customClass: {
              popup: "rounded-lg shadow-lg",
              title: "text-xl font-semibold text-gray-800",
              htmlContainer: "text-gray-600"
            }
          });
          
          // Redirect to manual creation page
          window.location.href = "/gigsmanual";
          return;
        }

        // For other errors, use fallback suggestions
        setSuggestions(fallbackSuggestions);
        setEditableSuggestions(fallbackSuggestions);
      }
    };

  const validateGigData = (gigData: any) => {
    const emptyFields: string[] = [];
    
    // Check basic fields
    if (!gigData.title) emptyFields.push('Title');
    if (!gigData.description) emptyFields.push('Description');
    if (!gigData.category) emptyFields.push('Category');
    if (!gigData.seniority?.level) emptyFields.push('Seniority Level');
    if (!gigData.seniority?.yearsExperience) emptyFields.push('Years of Experience');
    
    // Check schedule fields
    if (!gigData.schedule?.days || gigData.schedule.days.length === 0) {
      gigData.schedule = {
        ...gigData.schedule,
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
      };
    }
    if (!gigData.schedule?.hours) {
      gigData.schedule = {
        ...gigData.schedule,
        hours: "9:00 AM - 6:00 PM"
      };
    }
    if (!gigData.schedule?.timeZones || gigData.schedule.timeZones.length === 0) {
      gigData.schedule = {
        ...gigData.schedule,
        timeZones: ["UTC"]
      };
    }
    if (!gigData.schedule?.minimumHours?.daily) {
      gigData.schedule.minimumHours = {
        ...gigData.schedule?.minimumHours,
        daily: 8
      };
    }
    if (!gigData.schedule?.minimumHours?.weekly) {
      gigData.schedule.minimumHours = {
        ...gigData.schedule?.minimumHours,
        weekly: 40
      };
    }
    if (!gigData.schedule?.minimumHours?.monthly) {
      gigData.schedule.minimumHours = {
        ...gigData.schedule?.minimumHours,
        monthly: 160
      };
    }
    
    // Check commission fields
    if (!gigData.commission?.base) {
      gigData.commission = {
        ...gigData.commission,
        base: "percentage"
      };
    }
    if (!gigData.commission?.baseAmount) {
      gigData.commission = {
        ...gigData.commission,
        baseAmount: "15"
      };
    }
    if (!gigData.commission?.currency) {
      gigData.commission = {
        ...gigData.commission,
        currency: "USD"
      };
    }
    if (!gigData.commission?.minimumVolume?.amount) {
      gigData.commission.minimumVolume = {
        ...gigData.commission?.minimumVolume,
        amount: "50000"
      };
    }
    if (!gigData.commission?.minimumVolume?.period) {
      gigData.commission.minimumVolume = {
        ...gigData.commission?.minimumVolume,
        period: "monthly"
      };
    }
    if (!gigData.commission?.minimumVolume?.unit) {
      gigData.commission.minimumVolume = {
        ...gigData.commission?.minimumVolume,
        unit: "USD"
      };
    }
    if (!gigData.commission?.transactionCommission?.type) {
      gigData.commission.transactionCommission = {
        ...gigData.commission?.transactionCommission,
        type: "percentage"
      };
    }
    if (!gigData.commission?.transactionCommission?.amount) {
      gigData.commission.transactionCommission = {
        ...gigData.commission?.transactionCommission,
        amount: "5"
      };
    }
    
    return emptyFields;
  };

  // Ajouter les styles globaux pour SweetAlert2

  const handleSaveAndOnBack = async (documentation?: any) => {
    try {
      const initialGigData = {
        title: selectedJobTitle || suggestions?.jobTitles?.[0] || "Untitled Gig",
        description: jobDescription?.description || suggestions?.activity?.options?.[0]?.description || "No description provided",
        type: suggestions?.activity?.options?.[0]?.type || "General",
        category: suggestions?.sectors?.[0] || "General",
        quantity: 1,
        timeline: suggestions?.timeframes?.[0] || "Flexible",
        skills: {
          languages: suggestions?.skills?.languages.map(lang => ({ name: lang.name, level: lang.level })) || [],
          soft: suggestions?.skills?.soft || [],
          professional: suggestions?.skills?.professional || [],
          technical: suggestions?.skills?.technical || [],
          certifications: suggestions?.skills?.certifications || []
        },
        requirements: suggestions?.requirements || { essential: [], preferred: [] },
        status: "draft",
        seniority: {
          years: suggestions?.seniority?.years || "Mid Level",
          level: suggestions?.seniority?.level || "Mid Level",
          yearsExperience: suggestions?.seniority?.yearsExperience || "2-5 years"
        },
        schedule: {
          days: suggestions?.schedule?.days || [],
          hours: suggestions?.schedule?.hours || "9:00 AM - 6:00 PM CET",
          timeZones: suggestions?.schedule?.timeZones || ["CET"],
          flexibility: suggestions?.schedule?.flexibility || [],
          minimumHours: {
            daily: suggestions?.schedule?.minimumHours?.daily || 8,
            weekly: suggestions?.schedule?.minimumHours?.weekly || 40,
            monthly: suggestions?.schedule?.minimumHours?.monthly || 160
          },
          startTime: suggestions?.schedule?.startTime || "09:00",
          endTime: suggestions?.schedule?.endTime || "18:00"
        },
        commission: {
          base: suggestions?.commission?.options?.[0]?.base || "Fixed Salary",
          baseAmount: suggestions?.commission?.options?.[0]?.baseAmount || "2",
          bonus: suggestions?.commission?.options?.[0]?.bonus,
          bonusAmount: suggestions?.commission?.options?.[0]?.bonusAmount,
          currency: suggestions?.commission?.options?.[0]?.currency || "USD",
          minimumVolume: {
            amount: suggestions?.commission?.options?.[0]?.minimumVolume?.amount || "4",
            period: suggestions?.commission?.options?.[0]?.minimumVolume?.period || "Monthly",
            unit: suggestions?.commission?.options?.[0]?.minimumVolume?.unit || "Projects"
          },
          transactionCommission: {
            type: suggestions?.commission?.options?.[0]?.transactionCommission?.type || "Fixed Amount",
            amount: suggestions?.commission?.options?.[0]?.transactionCommission?.amount || "3"
          },
          kpis: []
        },
        leads: {
          types: [
            { type: 'hot', percentage: 0, description: "", conversionRate: 0 },
            { type: 'warm', percentage: 0, description: "", conversionRate: 0 },
            { type: 'cold', percentage: 0, description: "", conversionRate: 0 }
          ],
          sources: []
        },
        team: {
          size: gigData.team?.size || '0',
          structure: gigData.team?.structure || [],
          territories: gigData.team?.territories || []
        },
        documentation: {
          templates: null,
          reference: null,
          product: [],
          process: [],
          training: []
        }
      };

      // Ajouter les données de documentation si elles existent
      if (documentation) {
        initialGigData.documentation = {
          templates: documentation.templates,
          reference: documentation.reference,
          product: documentation.product.map((doc: { name: string; url: string }) => ({ name: doc.name, url: doc.url })),
          process: documentation.process.map((doc: { name: string; url: string }) => ({ name: doc.name, url: doc.url })),
          training: documentation.training.map((doc: { name: string; url: string }) => ({ name: doc.name, url: doc.url }))
        };
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/gigs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(initialGigData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.statusText}`);
      }

      const savedData = await response.json();

      await Swal.fire({
        title: "Success",
        text: "Gig data saved successfully!",
        icon: "success",
        customClass: {
          popup: "rounded-lg shadow-lg",
          title: "text-xl font-semibold text-gray-800",
          htmlContainer: "text-gray-600",
          confirmButton: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        }
      }).then(() => {
        onBack();
      });
    } catch (error) {
      console.error("Error saving gig data:", error);
      await Swal.fire({
        title: "Error",
        text: error instanceof Error ? error.message : "Failed to save gig data. Please try again.",
        icon: "error",
        customClass: {
          popup: "rounded-lg shadow-lg",
          title: "text-xl font-semibold text-gray-800",
          htmlContainer: "text-gray-600",
          confirmButton: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        }
      });
    }
  };

  const handleLeadsSave = (data: any) => {
    setLeadsData(data);
    setIsLeadsModalOpen(false);
  };

  const handleLeadsSkip = () => {
    setGigData((prev: GigData) => ({
      ...prev,
      leads: {
        types: [
          { type: 'hot', percentage: 0, description: "", conversionRate: 0 },
          { type: 'warm', percentage: 0, description: "", conversionRate: 0 },
          { type: 'cold', percentage: 0, description: "", conversionRate: 0 }
        ],
        sources: []
      }
    }));
    setIsLeadsModalOpen(false);
    setIsTeamModalOpen(true);
  };

  const handleTeamSave = (teamData: any) => {
    setGigData((prev: GigData) => ({
      ...prev,
      team: teamData
    }));
    setIsTeamModalOpen(false);
    setIsDocModalOpen(true);
  };

  const handleTeamSkip = () => {
    setGigData((prev: GigData) => ({
      ...prev,
      team: {
        size: "1-5",
        structure: [],
        territories: []
      }
    }));
    setIsTeamModalOpen(false);
    setIsDocModalOpen(true);
  };

  const handleDocumentationSave = (documentationData: any) => {
    setGigData((prev: GigData) => ({
      ...prev,
      documentation: documentationData
    }));
    setIsDocModalOpen(false);
    handleSaveAndOnBack();
  };

  const handleDocumentationSkip = () => {
    setGigData((prev: GigData) => ({
      ...prev,
      documentation: {
        templates: null,
        reference: null,
        product: [],
        process: [],
        training: []
      }
    }));
    setIsDocModalOpen(false);
    handleSaveAndOnBack();
  };

  const saveToDatabase = async () => {
    try {
      // Préparer les données pour l'API
      const apiData = {
        title: gigData.title,
        description: gigData.description,
        type: gigData.type,
        quantity: gigData.quantity,
        price: gigData.price,
        duration: gigData.duration,
        location: gigData.location,
        skills: {
          languages: gigData.skills.languages.map((lang: { name: string; level: string }) => ({ name: lang.name, level: lang.level })),
          soft: gigData.skills.soft,
          professional: gigData.skills.professional,
          technical: gigData.skills.technical,
          certifications: gigData.skills.certifications
        },
        requirements: gigData.requirements,
        benefits: gigData.benefits,
        status: gigData.status,
        leads: {
          types: [
            { type: 'hot', ...gigData.leads.hot },
            { type: 'warm', ...gigData.leads.warm },
            { type: 'cold', ...gigData.leads.cold }
          ],
          sources: gigData.leads.sources
        },
        team: {
          size: gigData.team.size,
          structure: gigData.team.structure,
          territories: gigData.team.territories
        },
        documentation: {
          templates: gigData.documentation.templates,
          reference: gigData.documentation.reference,
          product: gigData.documentation.product,
          process: gigData.documentation.process,
          training: gigData.documentation.training
        }
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/gigs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        throw new Error(errorData.message || `Error: ${response.statusText}`);
      }

      const savedData = await response.json();

      Swal.fire({
        title: "Success",
        text: "Gig data saved successfully!",
          icon: "success",
        customClass: {
          popup: "rounded-lg shadow-lg",
          title: "text-xl font-semibold text-gray-800",
          content: "text-gray-600",
          confirmButton: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        }
      }).then(() => {
        onBack();
      });
      console.log('Saving to database:', gigData);
    } catch (error) {
      console.error("Error saving gig data:", error);
      Swal.fire({
        title: "Error",
        text: error instanceof Error ? error.message : "Failed to save gig data. Please try again.",
        icon: "error",
        customClass: {
          popup: "rounded-lg shadow-lg",
          title: "text-xl font-semibold text-gray-800",
          content: "text-gray-600",
          confirmButton: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        }
      });
    }
  };


  const updateItem = (section: StringArraySection, index: number, value: string) => {
    if (!editableSuggestions) return;
    const newSuggestions = { ...editableSuggestions };
    const items = getNestedProperty(newSuggestions, section);
    if (isStringArray(items)) {
      items[index] = value;
      setEditableSuggestions(newSuggestions);
    }
  };

  const addItem = (section: StringArraySection) => {
    if (!editableSuggestions) return;
    const newSuggestions = { ...editableSuggestions };
    const items = getNestedProperty(newSuggestions, section);
    if (section === 'commission') {
      newSuggestions[section] = {
        options: [...(items as any).options, {
          base: '',
          baseAmount: '',
          currency: 'EUR',
          minimumVolume: { amount: '', period: '', unit: '' },
          transactionCommission: { type: '', amount: '' }
        }]
      };
    } else if (section === 'activity') {
      newSuggestions[section] = {
        options: [...(items as any).options, {
          type: '',
          description: '',
          requirements: []
        }]
      };
    } else if (isStringArray(items)) {
      setNestedProperty(newSuggestions, section, [...items, ""]);
    }
    setEditableSuggestions(newSuggestions);
  };

  const renderEditableList = (
    section: StringArraySection,
    title: string,
    icon: React.ReactNode
  ) => {
    if (!editableSuggestions) return null;
    
    const items = getNestedProperty(editableSuggestions, section);
    if (!isStringArray(items)) return null;

    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            {icon}
            {title}
          </h3>
          <button
            onClick={() => addItem(section)}
            className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
          >
            <Edit2 className="w-4 h-4 mr-1" />
            Add New
          </button>
        </div>
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-center justify-between group">
              {editingSection === section && editingIndex === index ? (
                <div className="flex-1 flex items-center space-x-2">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 px-2 py-1 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={saveEdit}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-between text-gray-700 group">
                  <span>{item}</span>
                  <div className="hidden group-hover:flex items-center space-x-2">
                    <button
                      onClick={() => startEditing(section, index, item)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeItem(section, index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const addNewCommissionOption = () => {
    if (!editableSuggestions) return;
    const newSuggestions = { ...editableSuggestions };
    
    if (!newSuggestions.commission) {
      newSuggestions.commission = {
        options: []
      };
    }
    
    if (!newSuggestions.commission.options) {
      newSuggestions.commission.options = [];
    }

    newSuggestions.commission.options.push({
      base: "Hourly",
      baseAmount: "0",
      currency: "USD",
      minimumVolume: {
        amount: "0",
        period: "Weekly",
        unit: "Hours"
      },
      transactionCommission: {
        type: "Fixed Amount",
        amount: "2"
      }
    });

    setEditableSuggestions(newSuggestions);
  };

  const editCommissionOption = (index: number) => {
    if (!editableSuggestions?.commission?.options) return;
    const option = editableSuggestions.commission.options[index];
    setEditingSection('commission');
    setEditingIndex(index);
    setEditValue(JSON.stringify(option));
  };

  const removeCommissionOption = (index: number) => {
    if (!editableSuggestions?.commission?.options) return;
    const newSuggestions = { ...editableSuggestions };
    newSuggestions.commission.options = newSuggestions.commission.options.filter((_, i) => i !== index);
    setEditableSuggestions(newSuggestions);
  };

  const renderCommissionSection = () => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <DollarSign className="w-6 h-6 text-green-600 mr-2" />
            <h2 className="text-2xl font-semibold">Base Commission</h2>
          </div>
          <button
            onClick={() => startEditingMetadata('commission', '')}
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit2 className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Base</label>
              <p className="mt-1 text-lg font-medium text-gray-900">
                {editableSuggestions?.commission?.options?.[0]?.base || "Not set"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Base Amount</label>
              <p className="mt-1 text-lg font-medium text-gray-900">
                {editableSuggestions?.commission?.options?.[0]?.baseAmount || "0"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bonus</label>
              <p className="mt-1 text-lg font-medium text-gray-900">
                {editableSuggestions?.commission?.options?.[0]?.bonus || "Not set"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bonus Amount</label>
              <p className="mt-1 text-lg font-medium text-gray-900">
                {editableSuggestions?.commission?.options?.[0]?.bonusAmount || "0"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Currency</label>
              <p className="mt-1 text-lg font-medium text-gray-900">
                {editableSuggestions?.commission?.options?.[0]?.currency || "USD"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Structure</label>
              <p className="mt-1 text-lg font-medium text-gray-900">
                {editableSuggestions?.commission?.options?.[0]?.structure || "Not set"}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Minimum Volume</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <p className="mt-1 text-lg font-medium text-gray-900">
                  {editableSuggestions?.commission?.options?.[0]?.minimumVolume?.amount || "0"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Period</label>
                <p className="mt-1 text-lg font-medium text-gray-900">
                  {editableSuggestions?.commission?.options?.[0]?.minimumVolume?.period || "Not set"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit</label>
                <p className="mt-1 text-lg font-medium text-gray-900">
                  {editableSuggestions?.commission?.options?.[0]?.minimumVolume?.unit || "Not set"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Transaction Commission</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <p className="mt-1 text-lg font-medium text-gray-900">
                  {editableSuggestions?.commission?.options?.[0]?.transactionCommission?.type || "Fixed Amount"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <p className="mt-1 text-lg font-medium text-gray-900">
                  {editableSuggestions?.commission?.options?.[0]?.transactionCommission?.amount || "0"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSectorsSection = () => {
    if (!editableSuggestions?.sectors) return null;

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
            Target Sectors
          </h3>
          <button
            onClick={() => addNewItem('sectors')}
            className="text-blue-600 hover:text-blue-700 flex items-center text-sm"
          >
            <PlusCircle className="w-4 h-4 mr-1" />
            Add Sector
          </button>
        </div>

        <div className="space-y-2">
          {editableSuggestions.sectors.map((sector, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded group">
              {editingSection === 'sectors' && editingIndex === index ? (
                <div className="flex-1 flex items-center space-x-2">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={saveEdit}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-gray-700">{sector}</span>
                  <div className="hidden group-hover:flex items-center space-x-2">
                    <button
                      onClick={() => startEditing('sectors', index, sector)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeItem('sectors', index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderActivitySection = () => {
    if (!editableSuggestions?.activity) return null;

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Target className="w-5 h-5 mr-2 text-purple-600" />
            Activity Details
          </h3>
          <button
            onClick={() => addNewActivityOption()}
            className="text-blue-600 hover:text-blue-700 flex items-center text-sm"
          >
            <PlusCircle className="w-4 h-4 mr-1" />
            Add Option
          </button>
        </div>

        <div className="space-y-4">
          {editableSuggestions.activity.options?.map((option, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg group">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{option.type}</h4>
                <div className="hidden group-hover:flex items-center space-x-2">
                  <button
                    onClick={() => editActivityOption(index)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeActivityOption(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mb-3">{option.description}</p>
              <div className="space-y-2">
                {option.requirements.map((req, reqIndex) => (
                  <div key={reqIndex} className="flex items-center justify-between p-2 bg-white rounded group">
                    <span className="text-gray-700">{req}</span>
                    <div className="hidden group-hover:flex items-center space-x-2">
                      <button
                        onClick={() => editActivityRequirement(index, reqIndex)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeActivityRequirement(index, reqIndex)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => addActivityRequirement(index)}
                  className="w-full text-blue-600 hover:text-blue-700 text-sm flex items-center justify-center py-2"
                >
                  <PlusCircle className="w-4 h-4 mr-1" />
                  Add Requirement
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSenioritySection = () => {
    if (!editableSuggestions?.seniority) return null;

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Award className="w-5 h-5 mr-2 text-yellow-600" />
            Seniority Requirements
          </h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-blue-600 hover:text-blue-700"
          >
            {isEditing ? "Done" : "Edit"}
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Seniority Level *</label>
            {isEditing ? (
              <input
                type="text"
                value={editableSuggestions.seniority.level}
                onChange={(e) => {
                  const newSuggestions = { ...editableSuggestions };
                  newSuggestions.seniority.level = e.target.value;
                  setEditableSuggestions(newSuggestions);
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g. Mid-level, Senior, etc."
              />
            ) : (
              <p className="text-lg font-medium text-gray-900">{editableSuggestions.seniority.level}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Years of Experience *</label>
            {isEditing ? (
              <input
                type="text"
                value={editableSuggestions.seniority.yearsExperience}
                onChange={(e) => {
                  const newSuggestions = { ...editableSuggestions };
                  newSuggestions.seniority.yearsExperience = Number(e.target.value);
                  setEditableSuggestions(newSuggestions);
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g. 2-5 years, 5+ years, etc."
              />
            ) : (
              <p className="text-lg font-medium text-gray-900">{editableSuggestions.seniority.yearsExperience}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderScheduleSection = () => {
    if (!editableSuggestions?.schedule) return null;

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-600" />
            Schedule
          </h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-blue-600 hover:text-blue-700"
          >
            {isEditing ? "Done" : "Edit"}
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Working Hours *</label>
            {isEditing ? (
              <input
                type="text"
                value={editableSuggestions.schedule.hours}
                onChange={(e) => {
                  const newSuggestions = { ...editableSuggestions };
                  newSuggestions.schedule.hours = e.target.value;
                  setEditableSuggestions(newSuggestions);
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g. 08h00 - 17h00 CET"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900">{editableSuggestions.schedule.hours}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Working Days</label>
            <div className="mt-2 space-x-2">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                <label key={day} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={editableSuggestions.schedule.days.includes(day)}
                    onChange={(e) => {
                      const newSuggestions = { ...editableSuggestions };
                      if (e.target.checked) {
                        newSuggestions.schedule.days = [...newSuggestions.schedule.days, day];
                      } else {
                        newSuggestions.schedule.days = newSuggestions.schedule.days.filter(d => d !== day);
                      }
                      setEditableSuggestions(newSuggestions);
                    }}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <span className="ml-2">{day}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Time Zones</label>
            <div className="mt-2 space-y-2">
              {editableSuggestions.schedule.timeZones.map((timezone, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-700">{timezone}</span>
                  {isEditing && (
                    <button
                      onClick={() => {
                        const newSuggestions = { ...editableSuggestions };
                        newSuggestions.schedule.timeZones = newSuggestions.schedule.timeZones.filter((_, i) => i !== index);
                        setEditableSuggestions(newSuggestions);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {isEditing && (
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <select
                      className="flex-1 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      onChange={(e) => {
                        if (e.target.value) {
                          const newSuggestions = { ...editableSuggestions };
                          newSuggestions.schedule.timeZones = [...newSuggestions.schedule.timeZones, e.target.value];
                          setEditableSuggestions(newSuggestions);
                          e.target.value = "";
                        }
                      }}
                      value=""
                    >
                      <option value="">Select a timezone...</option>
                      {COMMON_TIMEZONES.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Start Time *</label>
            {isEditing ? (
              <input
                type="time"
                value={editableSuggestions.schedule.startTime || ""}
                onChange={(e) => {
                  const newSuggestions = { ...editableSuggestions };
                  newSuggestions.schedule.startTime = e.target.value;
                  setEditableSuggestions(newSuggestions);
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g. 09:00"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900">{editableSuggestions.schedule.startTime}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">End Time *</label>
            {isEditing ? (
              <input
                type="time"
                value={editableSuggestions.schedule.endTime || ""}
                onChange={(e) => {
                  const newSuggestions = { ...editableSuggestions };
                  newSuggestions.schedule.endTime = e.target.value;
                  setEditableSuggestions(newSuggestions);
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g. 18:00"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900">{editableSuggestions.schedule.endTime}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const addNewActivityOption = () => {
    if (!editableSuggestions) return;
    const newSuggestions = { ...editableSuggestions };
    if (!newSuggestions.activity) {
      newSuggestions.activity = { options: [] };
    }
    newSuggestions.activity.options.push({
      type: "New Activity",
      description: "Description for new activity",
      requirements: []
    });
    setEditableSuggestions(newSuggestions);
  };

  const editActivityOption = (index: number) => {
    if (!editableSuggestions?.activity?.options) return;
    const option = editableSuggestions.activity.options[index];
    setEditingSection('activity');
    setEditingIndex(index);
    setEditValue(JSON.stringify(option));
  };

  const removeActivityOption = (index: number) => {
    if (!editableSuggestions?.activity?.options) return;
    const newSuggestions = { ...editableSuggestions };
    newSuggestions.activity.options = newSuggestions.activity.options.filter((_, i) => i !== index);
    setEditableSuggestions(newSuggestions);
  };

  const editActivityRequirement = (optionIndex: number, reqIndex: number) => {
    if (!editableSuggestions?.activity?.options) return;
    const option = editableSuggestions.activity.options[optionIndex];
    if (!option.requirements) return;
    const requirement = option.requirements[reqIndex];
    setEditingSection('activity-requirement');
    setEditingIndex(reqIndex);
    setEditValue(requirement);
  };

  const removeActivityRequirement = (optionIndex: number, reqIndex: number) => {
    if (!editableSuggestions?.activity?.options) return;
    const newSuggestions = { ...editableSuggestions };
    const option = newSuggestions.activity.options[optionIndex];
    if (option.requirements) {
      option.requirements = option.requirements.filter((_, i) => i !== reqIndex);
    }
    setEditableSuggestions(newSuggestions);
  };

  const addActivityRequirement = (optionIndex: number) => {
    if (!editableSuggestions?.activity?.options) return;
    const newSuggestions = { ...editableSuggestions };
    const option = newSuggestions.activity.options[optionIndex];
    if (!option.requirements) {
      option.requirements = [];
    }
    option.requirements.push("New requirement");
    setEditableSuggestions(newSuggestions);
  };

  const renderDestinationZonesSection = () => {
    
    if (!editableSuggestions?.destinationZones) {
      return null;
    }

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Globe2 className="w-5 h-5 mr-2 text-blue-600" />
            Destination Zones
          </h3>
          <button
            onClick={() => addNewItem('destinationZones')}
            className="text-blue-600 hover:text-blue-700 flex items-center text-sm"
          >
            <PlusCircle className="w-4 h-4 mr-1" />
            Add Zone
          </button>
        </div>

        <div className="space-y-2">
          {editableSuggestions.destinationZones.map((zone, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded group">
              {editingSection === 'destinationZones' && editingIndex === index ? (
                <div className="flex-1 flex items-center space-x-2">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={saveEdit}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-gray-700">{zone}</span>
                  <div className="hidden group-hover:flex items-center space-x-2">
                    <button
                      onClick={() => startEditing('destinationZones', index, zone)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeItem('destinationZones', index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (suggestions?.destinationZones && suggestions.destinationZones.length > 0 && 
        (!suggestions.destination_zone || suggestions.destination_zone.length === 0)) {
      const firstCountry = suggestions.destinationZones[0];
      const countryCode = Object.entries(i18n.getNames('en'))
        .find(([_, name]) => name === firstCountry)?.[0];
      
      if (countryCode) {
        setSuggestions(prev => prev ? { ...prev, destination_zone: countryCode } : null);
      }
    }
  }, [suggestions?.destinationZones, suggestions?.destination_zone]);

  if (showMetadata) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-16">
        <div className="max-w-4xl mx-auto pt-16 px-4">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setShowMetadata(false)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Suggestions
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Gig Details & Scheduling
            </h1>
          </div>

          {isMetadataLoading ? (
            <div className="bg-white rounded-xl shadow-xl p-6 mb-8">
              <div className="flex items-center justify-center py-8">
                <Brain className="w-6 h-6 text-blue-600 animate-pulse mr-2" />
                <span className="text-gray-600">Generating suggestions...</span>
              </div>
            </div>
          ) : (
            metadata && (
              <div className="space-y-8">
                {renderSenioritySection()}
                {renderScheduleSection()}
                {renderDestinationZonesSection()}
                {/* Suggested Names Section */}
                <div className="bg-white rounded-xl shadow-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Suggested Names
                    </h2>
                    <button
                      onClick={() =>
                        startEditingMetadata(
                          "suggestedNames",
                          metadata.suggestedNames.join(", ")
                        )
                      }
                      className="text-blue-600 hover:text-blue-700 flex items-center text-sm"
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit Names
                    </button>
                  </div>
                  {editingMetadataField === "suggestedNames" ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter names separated by commas"
                      />
                      <button
                        onClick={saveMetadataEdit}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {metadata.suggestedNames.map((name, index) => (
                        <div key={index} className="p-4 bg-blue-50 rounded-lg">
                          <p className="text-blue-900 font-medium">{name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Industries Section */}
                <div className="bg-white rounded-xl shadow-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Relevant Industries
                    </h2>
                    <button
                      onClick={() =>
                        startEditingMetadata(
                          "industries",
                          metadata.industries.join(", ")
                        )
                      }
                      className="text-blue-600 hover:text-blue-700 flex items-center text-sm"
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit Industries
                    </button>
                  </div>
                  {editingMetadataField === "industries" ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter industries separated by commas"
                      />
                      <button
                        onClick={saveMetadataEdit}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {metadata.industries.map((industry, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium"
                        >
                          {industry}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Schedules Section */}
                <div className="bg-white rounded-xl shadow-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Recommended Schedules
                    </h2>
                    <button
                      onClick={addNewSchedule}
                      className="text-blue-600 hover:text-blue-700 flex items-center text-sm"
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Add Schedule
                    </button>
                  </div>
                  <div className="space-y-6">
                    {metadata.schedules.map((schedule, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-4">
                          {editingScheduleIndex === index &&
                          editingMetadataField === "name" ? (
                            <div className="flex items-center space-x-2 flex-1">
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="flex-1 px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <button
                                onClick={saveMetadataEdit}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Save className="w-5 h-5" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            <h3 className="text-lg font-medium text-gray-900 flex items-center">
                              {schedule.name}
                              <button
                                onClick={() =>
                                  startEditingSchedule(
                                    index,
                                    "name",
                                    schedule.name
                                  )
                                }
                                className="ml-2 text-blue-600 hover:text-blue-700"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </h3>
                          )}
                          <button
                            onClick={() => removeSchedule(index)}
                            className="text-red-600 hover:text-red-700 ml-2"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {editingScheduleIndex === index &&
                        editingMetadataField === "description" ? (
                          <div className="flex items-center space-x-2 mb-4">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="flex-1 px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={saveMetadataEdit}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Save className="w-5 h-5" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center mb-4">
                            <p className="text-gray-600 flex-1">
                              {schedule.description}
                            </p>
                            <button
                              onClick={() =>
                                startEditingSchedule(
                                  index,
                                  "description",
                                  schedule.description
                                )
                              }
                              className="text-blue-600 hover:text-blue-700 ml-2"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        <div className="space-y-2">
                          {schedule.hours.map((hour, hourIndex) => (
                            <div
                              key={hourIndex}
                              className="flex items-center justify-between bg-gray-50 p-3 rounded group"
                            >
                              {editingScheduleIndex === index &&
                              editingHourIndex === hourIndex ? (
                                <div className="flex-1 flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={`${hour.day}, ${hour.start}-${hour.end}`}
                                    onChange={(e) =>
                                      setEditValue(e.target.value)
                                    }
                                    className="flex-1 px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Day, HH:MM-HH:MM"
                                  />
                                  <button
                                    onClick={saveMetadataEdit}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <Save className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <span className="font-medium text-gray-700">
                                    {hour.day}
                                  </span>
                                  <div className="flex items-center space-x-4">
                                    <span className="text-gray-600">
                                      {hour.start.replace(':', 'h')} - {hour.end.replace(':', 'h')}
                                    </span>
                                    <div className="hidden group-hover:flex items-center space-x-2">
                                      <button
                                        onClick={() =>
                                          startEditingHour(index, hourIndex)
                                        }
                                        className="text-blue-600 hover:text-blue-700"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() =>
                                          removeHour(index, hourIndex)
                                        }
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                          <button
                            onClick={() => addNewHour(index)}
                            className="w-full text-blue-600 hover:text-blue-700 text-sm flex items-center justify-center py-2 border border-dashed border-blue-300 rounded-lg mt-2"
                          >
                            <Edit2 className="w-4 h-4 mr-1" />
                            Add Working Hours
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="fixed bottom-8 right-8">
                  <button
                    onClick={() => {
                      Swal.fire({
                        title: "Complete Gig Creation",
                        text: "Would you like to add additional information?",
                        icon: "question",
                        showDenyButton: true,
                        showCancelButton: true,
                        confirmButtonText: "Yes, add details",
                        denyButtonText: "No, save and return",
                        cancelButtonText: "Cancel",
                        customClass: {
                          popup: "rounded-lg shadow-lg",
                          title: "text-xl font-semibold text-gray-800",
                          htmlContainer: "text-gray-600",
                          confirmButton: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700",
                          denyButton: "px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700",
                          cancelButton: "px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                        }
                      }).then((result) => {
                        if (result.isConfirmed) {
                          // Ouvrir le modal des leads
                          setIsLeadsModalOpen(true);
                        } else if (result.isDenied) {
                          // Sauvegarder directement
                          handleSaveAndOnBack();
                        }
                      });
                    }}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Complete & Return to Gig Creation
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-16">
      {showBasicSection ? (
        <BasicSection
          data={{
            userId: '',
            companyId: '',
            title: suggestions?.jobTitles[0] || '',
            description: suggestions?.deliverables.join('\n') || '',
            category: suggestions?.sectors[0] || '',
            seniority: {
              level: suggestions?.seniority?.level || '',
              yearsExperience: suggestions?.seniority?.yearsExperience || 1,
              years: suggestions?.seniority?.years || ''
            },
            destination_zone: suggestions?.destinationZones?.[0] || "France",
            callTypes: [],
          }}
          onChange={(data) => {
            // Handle changes in basic section
            console.log('Basic section data changed:', data);
          }}
          errors={{}}
        />
      ) : (
        <div className="max-w-4xl mx-auto pt-16 px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              {!isSuggestionsLoading && suggestions && !isSuggestionsConfirmed && (
                <button
                  onClick={() => setIsSuggestionsConfirmed(true)}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Confirm Suggestions
                </button>
              )}
              {isSuggestionsConfirmed && (
                <button
                  onClick={handleConfirm}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={!suggestions || isConfirming}
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Next: Review Details
                </button>
              )}
            </div>
          </div>

          {apiKeyMissing && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
                <p className="text-sm text-yellow-700">
                  OpenAI API key is missing. AI-powered suggestions are currently
                  using fallback data. Please add your API key to enable real AI
                  suggestions.
                </p>
              </div>
            </div>
          )}

          {(suggestions || isSuggestionsLoading) && (
            <div className="bg-white rounded-xl shadow-xl p-6 mb-8">
              {isSuggestionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Brain className="w-6 h-6 text-blue-600 animate-pulse mr-2" />
                  <span className="text-gray-600">Generating suggestions...</span>
                </div>
              ) : (
                suggestions && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      {renderSenioritySection()}
                      {renderEditableList("jobTitles", "Job Titles", <Briefcase className="w-5 h-5 mr-2 text-blue-600" />)}
                      {renderEditableList("deliverables", "Deliverables", <Target className="w-5 h-5 mr-2 text-purple-600" />)}
                      {renderEditableList("kpis", "KPIs", <Gauge className="w-5 h-5 mr-2 text-green-600" />)}
                    </div>

                    <div className="space-y-6">
                      {renderEditableList("timeframes", "Timeframes", <Clock className="w-5 h-5 mr-2 text-gray-600" />)}
                      {renderEditableList("requirements", "Requirements", <Target className="w-5 h-5 mr-2 text-purple-600" />)}
                      {renderEditableList("compensation", "Compensation", <DollarSign className="w-5 h-5 mr-2 text-green-600" />)}
                      {renderEditableList("languages", "Languages", <Globe2 className="w-5 h-5 mr-2 text-blue-600" />)}
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                      {renderEditableList("skills", "Skills", <Brain className="w-5 h-5 mr-2 text-blue-600" />)}
                      {renderCommissionSection()}
                      {renderSectorsSection()}
                      {renderActivitySection()}
                      {renderDestinationZonesSection()}
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {isSuggestionsConfirmed && (
            <div className="fixed bottom-8 right-8 flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg shadow-lg">
              <CheckCircle className="w-5 h-5" />
              <span>Suggestions confirmed! Click "Next" to continue</span>
            </div>
          )}

          <div className="flex justify-end space-x-4 mt-8">
            <button
              onClick={onBack}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      <Modal
        isOpen={isLeadsModalOpen}
        onClose={() => setIsLeadsModalOpen(false)}
        title="Leads Information"
        onSave={() => setIsLeadsModalOpen(false)}
        onSkip={handleLeadsSkip}
      >
        <LeadsForm
          onSave={(data) => {
            setGigData((prev: GigData) => ({
              ...prev,
              leads: data
            }));
            setIsLeadsModalOpen(false);
            setIsTeamModalOpen(true);
          }}
          predefinedSources={predefinedOptions.leads.sources}
        />
      </Modal>

      <Modal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        title="Team Structure"
        
        onSave={() => setIsTeamModalOpen(false)}
        onSkip={handleTeamSkip}
      >
        <TeamForm
          onSave={handleTeamSave}
          predefinedRoles={predefinedOptions.team.roles}
          predefinedTerritories={predefinedOptions.team.territories}
        />
      </Modal>

      <Modal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        title="Documentation Requirements"
        onSave={() => setIsDocModalOpen(false)}
        onSkip={handleDocumentationSkip}
      >
        <DocumentationForm
          onSave={handleDocumentationSave}
          cloudinaryUrl="https://api.cloudinary.com/v1_1/dyqg8x26j/raw/upload"
        />
      </Modal>
    </div>
  );
}
