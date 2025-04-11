import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Brain,
  Briefcase,
  Target,
  DollarSign,
  Gauge,
  TrendingUp,
  Clock,
  Award,
  Globe2,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  Edit2,
  Save,
  X,
  CheckCircle,
  ArrowRight,
  PlusCircle,
} from "lucide-react";
import OpenAI from "openai";
import axios from "axios";
import type { JobDescription, GigMetadata } from "../lib/types";
import Swal from "sweetalert2";
import moment from 'moment-timezone';
import Modal from './Modal';
import LeadsForm from './LeadsForm';
import TeamForm from './TeamForm';
import DocumentationForm from './DocumentationForm';
import BasicSection from './BasicSection';

// Helper function to check if a value is a string array
const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
};

type StringArraySection = 'jobTitles' | 'deliverables' | 'compensation' | 'skills' | 'kpis' | 'timeframes' | 'requirements' | 'languages' | 'sectors';

interface ActivityOption {
  type: string;
  description: string;
  requirements: string[];
}

interface GigSuggestion {
  jobTitles: string[];
  deliverables: string[];
  compensation: any; // TODO: Define specific type
  skills: string[];
  kpis: string[];
  timeframes: string[];
  requirements: string[];
  languages: string[];
  seniority: {
    level: string;
    yearsExperience: string;
  };
  schedule: {
    days: string[];
    hours: string;
    timeZones: string[];
    flexibility: string[];
    minimumHours: {
      daily: number;
      weekly: number;
      monthly: number;
    };
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
  sectors: string[];
  activity: {
    options: ActivityOption[];
  };
}

type EditableGigSuggestion = GigSuggestion;

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
      'Mid Level',
      'Senior',
      'Lead',
      'Manager',
      'Director',
      'Executive'
    ]
  }
};

interface GigData {
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
    hours: string;
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
  documentation?: {
    type: string;
    format: string;
    requirements: string;
    files: Array<{
      url: string;
      name: string;
      type: string;
    }>;
  };
  status: string;
  created_at: string;
  updated_at: string;
}

interface SuggestionState extends GigSuggestion {
  // Additional fields specific to SuggestionState can be added here
}

const fallbackSuggestions: SuggestionState = {
  jobTitles: [],
  deliverables: [],
  compensation: [],
  skills: [],
  kpis: [],
  timeframes: [],
  requirements: [],
  languages: [],
  seniority: {
    level: "Mid Level",
    yearsExperience: "2-5 years"
  },
  schedule: {
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    hours: "9:00 AM - 6:00 PM",
    timeZones: ["UTC"],
    flexibility: ["Remote"],
    minimumHours: {
      daily: 8,
      weekly: 40,
      monthly: 160
    }
  },
  commission: {
    options: [{
      base: "fixed",
      baseAmount: "5000",
      currency: "USD",
      minimumVolume: {
        amount: "10000",
        period: "monthly",
        unit: "USD"
      },
      transactionCommission: {
        type: "percentage",
        amount: "5"
      }
    }]
  },
  sectors: [],
  activity: {
    options: []
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

  useEffect(() => {
    if (input.trim().length > 0) {
      setIsSuggestionsLoading(true);
      generateSuggestions().finally(() => {
        setIsSuggestionsLoading(false);
      });
    }
  }, [input]);

  const handleConfirm = () => {
    if (!suggestions) {
      Swal.fire({
        title: "Error",
        text: "No suggestions available to confirm",
        icon: "error",
        customClass: {
          popup: "rounded-lg shadow-lg",
          title: "text-xl font-semibold text-gray-800",
          htmlContainer: "text-gray-600",
          confirmButton: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        }
      });
      return;
    }

    // Apply default values for missing fields
    const validatedSuggestions = { ...suggestions };
    
    // Basic fields
    if (!validatedSuggestions.title) {
      validatedSuggestions.title = "Untitled Gig";
    }
    if (!validatedSuggestions.description) {
      validatedSuggestions.description = "No description provided";
    }
    if (!validatedSuggestions.category) {
      validatedSuggestions.category = "General";
    }
    if (!validatedSuggestions.seniority?.level) {
      validatedSuggestions.seniority = {
        ...validatedSuggestions.seniority,
        level: "Mid Level"
      };
    }
    if (!validatedSuggestions.seniority?.yearsExperience) {
      validatedSuggestions.seniority = {
        ...validatedSuggestions.seniority,
        yearsExperience: "2-5 years"
      };
    }

    // Validate and apply default values
    validateGigData(validatedSuggestions);

    setIsConfirming(true);
    if (onConfirm) {
      onConfirm(validatedSuggestions);
    }
  };

  console.log("Suggestions 1:", suggestions);

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
      const items = newSuggestions[editingSection];
      if (isStringArray(items)) {
        items[editingIndex] = editValue;
        setEditableSuggestions(newSuggestions);
        setSuggestions(newSuggestions);
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
    const items = newSuggestions[section];
    if (isStringArray(items)) {
      newSuggestions[section] = [...items, "New Item"];
      setEditableSuggestions(newSuggestions);
      setSuggestions(newSuggestions);
      startEditing(section, newSuggestions[section].length - 1, "New Item");
    }
  };

  const removeItem = (section: StringArraySection, index: number) => {
    if (!editableSuggestions) return;
    const newSuggestions = { ...editableSuggestions };
    const items = newSuggestions[section];
    if (isStringArray(items)) {
      newSuggestions[section] = items.filter((_, i) => i !== index);
      setEditableSuggestions(newSuggestions);
      setSuggestions(newSuggestions);
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
              { day: "Monday", start: "9:00", end: "17:30" },
              { day: "Tuesday", start: "9:00", end: "17:30" },
              { day: "Wednesday", start: "9:00", end: "17:30" },
              { day: "Thursday", start: "9:00", end: "17:30" },
              { day: "Friday", start: "9:00", end: "17:30" },
            ],
          },
          {
            name: "Extended Business Hours",
            description: "Extended coverage for global business operations",
            hours: [
              { day: "Monday", start: "9:00", end: "19:30" },
              { day: "Tuesday", start: "9:00", end: "19:30" },
              { day: "Wednesday", start: "9:00", end: "19:30" },
              { day: "Thursday", start: "9:00", end: "19:30" },
              { day: "Friday", start: "9:00", end: "19:30" },
              { day: "Saturday", start: "10:00", end: "15:30" },
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
              { day: "Monday", start: "9:00", end: "17:30" },
              { day: "Tuesday", start: "9:00", end: "17:30" },
              { day: "Wednesday", start: "9:00", end: "17:30" },
              { day: "Thursday", start: "9:00", end: "17:30" },
              { day: "Friday", start: "9:00", end: "17:30" },
            ],
          },
          {
            name: "Extended Business Hours",
            description: "Extended coverage for global business operations",
            hours: [
              { day: "Monday", start: "9:00", end: "19:30" },
              { day: "Tuesday", start: "9:00", end: "19:30" },
              { day: "Wednesday", start: "9:00", end: "19:30" },
              { day: "Thursday", start: "9:00", end: "19:30" },
              { day: "Friday", start: "9:00", end: "19:30" },
              { day: "Saturday", start: "10:00", end: "15:30" },
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

  console.log("Suggestions 2:", suggestions);

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
          compensation: ["Base salary + commission", "Quarterly performance bonuses"],
          skills: ["B2B Sales", "CRM Software", "Lead Generation", "Negotiation", "English Fluency"],
          kpis: ["Monthly revenue target: €50,000", "Lead conversion rate", "Number of qualified leads"],
          timeframes: ["Full-time", "Remote"],
          requirements: [
            "2+ years B2B sales experience",
            "Fluent in English",
            "Experience with CRM software",
            "Software industry experience preferred"
          ],
          languages: ["English (Fluent)"],
          seniority: {
            level: "Senior",
            yearsExperience: "5+ years"
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
            }
          },
          commission: {
            options: [{
              base: "percentage",
              baseAmount: "15",
              bonus: "quarterly",
              bonusAmount: "5000",
              currency: "EUR",
              minimumVolume: {
                amount: "50000",
                period: "monthly",
                unit: "EUR"
              },
              transactionCommission: {
                type: "percentage",
                amount: "5"
              }
            },
            {
              base: "fixed",
              baseAmount: "3000",
              bonus: "yearly",
              bonusAmount: "10000",
              currency: "EUR",
              minimumVolume: {
                amount: "100000",
                period: "yearly",
                unit: "EUR"
              },
              transactionCommission: {
                type: "fixed",
                amount: "100"
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
            },
            {
              type: "Account Management",
              description: "Managing and growing existing client relationships",
              requirements: [
                "Account management experience",
                "Client relationship skills",
                "Upselling expertise"
              ]
            }]
          }
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
              content: `You are a gig creation assistant. Generate suggestions for a gig based on the following input. 
              Include all required fields and multiple options for commission and activity. 
              Format the response as a JSON object matching this structure:
              {
                jobTitles: string[],
                deliverables: string[],
                compensation: string[],
                skills: string[],
                kpis: string[],
                timeframes: string[],
                requirements: string[],
                languages: string[],
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
                  }
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
                }
              }`
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
                level: "Senior",
                yearsExperience: "5+ years"
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
                }
              },
              commission: {
                options: [{
                  base: "percentage",
                  baseAmount: "15",
                  bonus: "quarterly",
                  bonusAmount: "5000",
                  currency: "EUR",
                  minimumVolume: {
                    amount: "50000",
                    period: "monthly",
                    unit: "EUR"
                  },
                  transactionCommission: {
                    type: "percentage",
                    amount: "5"
                  }
                }]
              },
              activity: {
                options: [{
                  type: "Default Activity",
                  description: "Default activity description",
                  requirements: ["Default requirement"]
                }]
              }
            };

            // Merge parsed suggestions with default values
            const mergedSuggestions = {
              ...parsedSuggestions,
              seniority: parsedSuggestions.seniority || defaultSuggestions.seniority,
              schedule: parsedSuggestions.schedule || defaultSuggestions.schedule,
              commission: {
                options: parsedSuggestions.commission?.options || defaultSuggestions.commission.options
              },
              activity: {
                options: parsedSuggestions.activity?.options || defaultSuggestions.activity.options
              }
            };

            setSuggestions(mergedSuggestions);
            setEditableSuggestions(mergedSuggestions);
          } catch (error) {
            console.error("Error parsing suggestions:", error);
            // Fallback to default suggestions if parsing fails
            setSuggestions(fallbackSuggestions);
            setEditableSuggestions(fallbackSuggestions);
          }
        }
      } catch (error) {
        console.error("Error generating suggestions:", error);
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

  const handleSaveAndOnBack = async () => {
    try {
      const initialGigData = {
        title: selectedJobTitle || suggestions?.jobTitles?.[0] || "Untitled Gig",
        description: jobDescription?.description || suggestions?.activity?.options?.[0]?.description || "No description provided",
        type: suggestions?.activity?.options?.[0]?.type || "General",
        category: suggestions?.sectors?.[0] || "General",
        quantity: 1,
        timeline: suggestions?.timeframes?.[0] || "Flexible",
        skills: suggestions?.skills || [],
        requirements: suggestions?.requirements || [],
        status: "draft",
        seniority: {
          level: suggestions?.seniority?.level || "Mid Level",
          yearsExperience: suggestions?.seniority?.yearsExperience || "2-5 years"
        },
        schedule: {
          days: suggestions?.schedule?.days || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          hours: suggestions?.schedule?.hours || "9:00 AM - 6:00 PM CET",
          timeZones: suggestions?.schedule?.timeZones || ["CET"],
          flexibility: suggestions?.schedule?.flexibility || ["Remote work", "Flexible hours"],
          minimumHours: suggestions?.schedule?.minimumHours || {
            daily: 8,
            weekly: 40,
            monthly: 160
          }
        },
        commission: {
          base: "percentage",
          baseAmount: "10000",
          bonus: "quarterly",
          bonusAmount: "5000",
          currency: "EUR",
          minimumVolume: {
            amount: "50000",
            period: "monthly",
            unit: "EUR"
          },
          transactionCommission: {
            type: "percentage",
            amount: "5"
          }
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
          size: "1-5",
          structure: [],
          territories: []
        },
        documentation: {
          product: [],
          process: [],
          training: []
        }
      };

      // Ajouter les données de documentation si elles existent
      if (documentation) {
        initialGigData.documentation = {
          product: documentation.product.map(doc => ({ name: doc.name, url: doc.url })),
          process: documentation.process.map(doc => ({ name: doc.name, url: doc.url })),
          training: documentation.training.map(doc => ({ name: doc.name, url: doc.url }))
        };
      }

      const response = await fetch("http://localhost:5004/api/gigs", {
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
      console.log('API Success Response:', savedData);

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
      });

      onBack();
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

  const handleLeadsSave = (leadsData: any) => {
    setGigData(prev => ({
      ...prev,
      leads: leadsData
    }));
    setIsLeadsModalOpen(false);
    setIsTeamModalOpen(true);
  };

  const handleLeadsSkip = () => {
    setGigData(prev => ({
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
    setGigData(prev => ({
      ...prev,
      team: teamData
    }));
    setIsTeamModalOpen(false);
    setIsDocModalOpen(true);
  };

  const handleTeamSkip = () => {
    setGigData(prev => ({
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
    setGigData(prev => ({
      ...prev,
      documentation: documentationData
    }));
    setIsDocModalOpen(false);
    handleSaveAndOnBack();
  };

  const handleDocumentationSkip = () => {
    setGigData(prev => ({
      ...prev,
      documentation: {
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
        skills: gigData.skills,
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
          product: gigData.documentation.product,
          process: gigData.documentation.process,
          training: gigData.documentation.training
        }
      };

      console.log('Sending data to API:', apiData);

      const response = await fetch("http://localhost:5004/api/gigs", {
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
      console.log('API Success Response:', savedData);

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

  console.log("Suggestions 3:", suggestions);

  const updateItem = (section: StringArraySection, index: number, value: string) => {
    if (!editableSuggestions) return;
    const newSuggestions = { ...editableSuggestions };
    const items = newSuggestions[section];
    if (isStringArray(items)) {
      items[index] = value;
      setEditableSuggestions(newSuggestions);
    }
  };

  const addItem = (section: StringArraySection) => {
    if (!editableSuggestions) return;
    const newSuggestions = { ...editableSuggestions };
    const items = newSuggestions[section];
    if (isStringArray(items)) {
      newSuggestions[section] = [...items, ""];
      setEditableSuggestions(newSuggestions);
    }
  };

  const renderEditableList = (
    section: StringArraySection,
    title: string,
    icon: React.ReactNode
  ) => {
    if (!editableSuggestions) return null;
    
    const items = editableSuggestions[section];
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
      newSuggestions.commission = { options: [] };
    }
    newSuggestions.commission.options.push({
      base: "percentage",
      baseAmount: "10000",
      bonus: "quarterly",
      bonusAmount: "5000",
      currency: "EUR",
      minimumVolume: {
        amount: "50000",
        period: "monthly",
        unit: "EUR"
      },
      transactionCommission: {
        type: "percentage",
        amount: "5"
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
    if (!editableSuggestions?.commission) return null;

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
            Commission Structure
          </h3>
          <button
            onClick={addNewCommissionOption}
            className="text-blue-600 hover:text-blue-700 flex items-center text-sm"
          >
            <PlusCircle className="w-4 h-4 mr-1" />
            Add Option
          </button>
        </div>

        <div className="space-y-4">
          {editableSuggestions.commission.options?.map((option, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded group">
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Base Commission</label>
                    <p className="text-gray-900">{option.baseAmount} {option.currency}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Type</label>
                    <p className="text-gray-900">{option.base}</p>
                  </div>
                </div>
                {option.bonus && (
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Bonus</label>
                      <p className="text-gray-900">{option.bonusAmount} {option.currency}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Period</label>
                      <p className="text-gray-900">{option.bonus}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="hidden group-hover:flex items-center space-x-2">
                <button
                  onClick={() => editCommissionOption(index)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeCommissionOption(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
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
                  newSuggestions.seniority.yearsExperience = e.target.value;
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
                placeholder="e.g. 9:00 AM - 5:00 PM CET"
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
                                      {hour.start} - {hour.end}
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
                    Complete 
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
            title: suggestions?.jobTitles[0] || '',
            description: suggestions?.deliverables.join('\n') || '',
            category: suggestions?.sectors[0] || '',
            seniority: suggestions?.seniority || { level: '', yearsExperience: '' }
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
        onSave={handleLeadsSave}
        onSkip={handleLeadsSkip}
      >
        <LeadsForm
          onSave={handleLeadsSave}
          predefinedSources={predefinedOptions.leads.sources}
        />
      </Modal>

      <Modal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        title="Team Structure"
        onSave={handleTeamSave}
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
        onSave={handleDocumentationSave}
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
