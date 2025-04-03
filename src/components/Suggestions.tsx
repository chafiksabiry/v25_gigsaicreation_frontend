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
} from "lucide-react";
import OpenAI from "openai";
import axios from "axios";
import type { JobDescription, GigMetadata } from "../lib/types";
import Swal from "sweetalert2";
interface GigSuggestion {
  jobTitles: string[];
  deliverables: string[];
  compensation: string[];
  skills: string[];
  kpis: string[];
  timeframes: string[];
  requirements: string[];
  languages: string[];
}

interface SuggestionsProps {
  input: string;
  onBack: () => void;
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

export function Suggestions({ input, onBack }: SuggestionsProps) {
  const [suggestions, setSuggestions] = useState<GigSuggestion | null>(null);
  const [editableSuggestions, setEditableSuggestions] =
    useState<GigSuggestion | null>(null);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [apiKeyMissing] = useState(!openai);
  const [selectedJobTitle, setSelectedJobTitle] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState<JobDescription | null>(
    null
  );
  const [isJobDescriptionLoading, setIsJobDescriptionLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSection, setEditingSection] = useState<
    keyof GigSuggestion | null
  >(null);
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

  const handleConfirmSuggestions = () => {
    setIsSuggestionsConfirmed(true);
    handleValidate();
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

  const startEditing = (
    section: keyof GigSuggestion,
    index: number,
    value: string
  ) => {
    setEditingSection(section);
    setEditingIndex(index);
    setEditValue(value);
  };

  const saveEdit = () => {
    if (editingSection && editingIndex !== null && editableSuggestions) {
      const updatedSuggestions = {
        ...editableSuggestions,
        [editingSection]: editableSuggestions[editingSection].map(
          (item: string, index: number) =>
            index === editingIndex ? editValue : item
        ),
      };
      setEditableSuggestions(updatedSuggestions);
      setSuggestions(updatedSuggestions);
      setEditingSection(null);
      setEditingIndex(null);
      setEditValue("");
    }
  };

  const cancelEdit = () => {
    setEditingSection(null);
    setEditingIndex(null);
    setEditValue("");
    setEditingMetadataField(null);
    setEditingScheduleIndex(null);
    setEditingHourIndex(null);
  };

  const addNewItem = (section: keyof GigSuggestion) => {
    if (editableSuggestions) {
      const updatedSuggestions = {
        ...editableSuggestions,
        [section]: [...editableSuggestions[section], "New Item"],
      };
      setEditableSuggestions(updatedSuggestions);
      setSuggestions(updatedSuggestions);
      startEditing(section, updatedSuggestions[section].length - 1, "New Item");
    }
  };


  const removeItem = (section: keyof GigSuggestion, index: number) => {
    if (editableSuggestions) {
      const updatedSuggestions = {
        ...editableSuggestions,
        [section]: editableSuggestions[section].filter((_, i) => i !== index),
      };
      setEditableSuggestions(updatedSuggestions);
      setSuggestions(updatedSuggestions); // Assurez-vous que l'état est mis à jour
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

  useEffect(() => {
    const generateSuggestions = async () => {
      if (!openai) {
        const fallbackSuggestions = {
          jobTitles: [
            "Sales Representative",
            "Account Manager",
            "Business Development Rep",
            "Customer Success Manager",
          ],
          deliverables: [
            "Successful calls completed",
            "Deals closed",
            "Revenue generated",
            "Client meetings scheduled",
          ],
          compensation: [
            "Per-action payment",
            "Commission-based",
            "Performance bonuses",
            "Tiered compensation",
          ],
          skills: [
            "Communication",
            "Sales",
            "Customer service",
            "Time management",
            "CRM experience",
          ],
          kpis: [
            "25% conversion rate on calls",
            "50 qualified leads per week",
            "$10,000 monthly revenue",
            "90% customer satisfaction rate",
          ],
          timeframes: [
            "3-month initial contract",
            "1-week onboarding period",
            "2-week ramp-up phase",
            "Monthly performance review",
          ],
          requirements: [
            "Minimum 2 years sales experience",
            "Industry certification preferred",
            "Fluent English required",
            "CRM software proficiency",
          ],
          languages: [
            "English (Fluent)",
            "Spanish (Conversational)",
            "Mandarin (Basic)",
            "French (Business Level)",
          ],
        };
        setSuggestions(fallbackSuggestions);
        setEditableSuggestions(fallbackSuggestions);
        return;
      }

      try {
        setIsSuggestionsLoading(true);

        const prompt = `Given this gig description: "${input}"
        
        Please analyze it and provide suggestions in the following JSON format:
        {
          "jobTitles": [4 relevant job titles],
          "deliverables": [4 specific measurable deliverables],
          "compensation": [4 appropriate compensation structures],
          "skills": [5 essential skills required],
          "kpis": [4 key performance indicators with specific metrics],
          "timeframes": [4 realistic project timeframes],
          "requirements": [4 specific requirements including certifications or experience],
          "languages": [4 relevant language requirements with proficiency levels]
        }
        
        Make suggestions specific to the industry and type of work mentioned. Include specific numbers and metrics where applicable.`;

        const completion = await openai.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "gpt-3.5-turbo",
          temperature: 0.7,
        });

        const response = completion.choices[0]?.message?.content;
        if (response) {
          const suggestedData = JSON.parse(response);
          setSuggestions(suggestedData);
          setEditableSuggestions(suggestedData);
        }
      } catch (error) {
        console.error("Error generating suggestions:", error);
        const fallbackSuggestions = {
          jobTitles: [
            "Sales Representative",
            "Account Manager",
            "Business Development Rep",
            "Customer Success Manager",
          ],
          deliverables: [
            "Successful calls completed",
            "Deals closed",
            "Revenue generated",
            "Client meetings scheduled",
          ],
          compensation: [
            "Per-action payment",
            "Commission-based",
            "Performance bonuses",
            "Tiered compensation",
          ],
          skills: [
            "Communication",
            "Sales",
            "Customer service",
            "Time management",
            "CRM experience",
          ],
          kpis: [
            "25% conversion rate on calls",
            "50 qualified leads per week",
            "$10,000 monthly revenue",
            "90% customer satisfaction rate",
          ],
          timeframes: [
            "3-month initial contract",
            "1-week onboarding period",
            "2-week ramp-up phase",
            "Monthly performance review",
          ],
          requirements: [
            "Minimum 2 years sales experience",
            "Industry certification preferred",
            "Fluent English required",
            "CRM software proficiency",
          ],
          languages: [
            "English (Fluent)",
            "Spanish (Conversational)",
            "Mandarin (Basic)",
            "French (Business Level)",
          ],
        };
        setSuggestions(fallbackSuggestions);
        setEditableSuggestions(fallbackSuggestions);
      } finally {
        setIsSuggestionsLoading(false);
      }
    };

    if (input.trim().length > 10) {
      generateSuggestions();
    }
  }, [input]);

  const handleSaveAndOnBack = async () => {
    if (!suggestions) {
      alert("Les données des suggestions sont vides.");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/gigs`,
        suggestions
      );

      if (response.status === 201) {
        console.log("Gig créé avec succès:", response.data);

        await Swal.fire({
          title: "Success",
          text: 'The "gig" has been successfully created!',
          icon: "success",
          confirmButtonText: "go to Gigs",
        });

        window.location.href = "/gigs"
      }
    } catch (error) {
      console.error("Erreur lors de la création de la gig:", error);
      alert("Une erreur est survenue lors de la création de la gig.");
    }
  };

  console.log("Suggestions 3:", suggestions);
  const renderEditableList = (
    section: keyof GigSuggestion,
    title: string,
    icon: React.ReactNode
  ) => {
    if (!editableSuggestions) return null;

    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            {icon}
            {title}
          </h3>
          <button
            onClick={() => addNewItem(section)}
            className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
          >
            <Edit2 className="w-4 h-4 mr-1" />
            Add New
          </button>
        </div>
        <ul className="space-y-2">
          {editableSuggestions[section].map((item: string, index: number) => (
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
                    onClick={handleSaveAndOnBack}
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
      <div className="max-w-4xl mx-auto pt-16 px-4">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Gig Creation
          </button>
          <div className="flex items-center space-x-4">
            {!isSuggestionsConfirmed ? (
              <button
                onClick={() => setIsSuggestionsConfirmed(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Confirm Suggestions
              </button>
            ) : (
              <button
                onClick={handleConfirmSuggestions}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                    {renderEditableList(
                      "jobTitles",
                      "Suggested Job Titles",
                      <Briefcase className="w-5 h-5 mr-2 text-blue-500" />
                    )}
                    {renderEditableList(
                      "deliverables",
                      "Expected Deliverables",
                      <Target className="w-5 h-5 mr-2 text-green-500" />
                    )}
                    {renderEditableList(
                      "kpis",
                      "Key Performance Indicators",
                      <TrendingUp className="w-5 h-5 mr-2 text-indigo-500" />
                    )}
                  </div>

                  <div className="space-y-6">
                    {renderEditableList(
                      "timeframes",
                      "Project Timeframes",
                      <Clock className="w-5 h-5 mr-2 text-orange-500" />
                    )}
                    {renderEditableList(
                      "requirements",
                      "Requirements & Certifications",
                      <Award className="w-5 h-5 mr-2 text-red-500" />
                    )}
                    {renderEditableList(
                      "compensation",
                      "Typical Compensation",
                      <DollarSign className="w-5 h-5 mr-2 text-emerald-500" />
                    )}
                    {renderEditableList(
                      "languages",
                      "Language Requirements",
                      <Globe2 className="w-5 h-5 mr-2 text-purple-500" />
                    )}
                  </div>

                  <div className="lg:col-span-2">
                    {renderEditableList(
                      "skills",
                      "Key Skills Required",
                      <Gauge className="w-5 h-5 mr-2 text-purple-500" />
                    )}
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
      </div>
    </div>
  );
}
