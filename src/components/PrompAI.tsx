import React, { useState } from "react";
import Cookies from 'js-cookie';
import {
  Brain,
  HelpCircle,
  Briefcase,
  FileText,
  Globe2,
  DollarSign,
  Users,
  PlusCircle,
} from "lucide-react";
import { AIDialog } from "./AIDialog";
import { Suggestions } from "./Suggestions";
import { SectionContent } from "./SectionContent";
import type { GigData, GigSuggestion } from "../types";
import { predefinedOptions } from "../lib/guidance";
import { mapGeneratedDataToGigData } from '../lib/ai';

const sections = [
  { id: "basic", label: "Basic Info", icon: Briefcase },
  { id: "schedule", label: "Schedule", icon: Globe2 },
  { id: "commission", label: "Commission", icon: DollarSign },
  // { id: "leads", label: "Leads", icon: Target },
  { id: "skills", label: "Skills", icon: Brain },
  { id: "team", label: "Team", icon: Users },
  { id: "docs", label: "Documentation", icon: FileText },
];

const PrompAI: React.FC = () => {
  const [input, setInput] = useState("");
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);
  const [confirmedSuggestions, setConfirmedSuggestions] =
    useState<GigSuggestion | null>(null);
  const [currentSection, setCurrentSection] = useState("basic");
  const [isManualMode, setIsManualMode] = useState(false);
  const [gigData, setGigData] = useState<GigData>({
    userId: Cookies.get('userId') || "",
    companyId: Cookies.get('companyId') || "",
    destination_zone: "",
    destinationZones: [],
    callTypes: [],
    highlights: [],
    requirements: {
      essential: [],
      preferred: []
    },
    benefits: [],
    tools: {
      provided: [],
      required: []
    },
    equipment: {
      provided: [],
      required: []
    },
    title: "",
    description: "",
    category: "",
    availability: {
      schedule: [{
        day: "",
        hours: {
          start: "",
          end: ""
        }
      }],
      timeZones: [],
      time_zone: "",
      flexibility: [],
      minimumHours: {},
    },
    schedule: {
      schedules: [{
        day: "",
        hours: {
          start: "",
          end: ""
        }
      }],
      timeZones: [],
      flexibility: [],
      minimumHours: {},
    },
    commission: {
      base: "",
      baseAmount: 0,
      bonus: "",
      bonusAmount: 0,
      structure: "",
      currency: "",
      minimumVolume: {
        amount: 0,
        period: "",
        unit: ""
      },
      transactionCommission: {
        type: "",
        amount: 0
      },
      kpis: []
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
    skills: {
      languages: [{
        language: "French",
        proficiency: "B1",
        iso639_1: "fr"
      }],
      soft: [{ skill: { $oid: "softSkillOid" }, level: 1, details: "" }],
      professional: [{ skill: { $oid: "professionalSkillOid" }, level: 1, details: "" }],
      technical: [{ skill: { $oid: "technicalSkillOid" }, level: 1, details: "" }],
      certifications: []
    },
    seniority: {

      level: "",
      yearsExperience: 0
    },
    team: {
      size: 0,
      structure: [],
      territories: [],
      reporting: {
        to: "",
        frequency: ""
      },
      collaboration: []
    },
    training: {
      initial: {
        duration: "",
        format: "",
        topics: []
      },
      ongoing: {
        frequency: "",
        format: "",
        topics: []
      },
      support: []
    },
    metrics: {
      kpis: [],
      targets: {},
      reporting: {
        frequency: "",
        metrics: []
      }
    },
    documentation: {
      templates: null,
      reference: null,
      product: [],
      process: [],
      training: []
    },
    compliance: {
      requirements: [],
      certifications: [],
      policies: []
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setShowAIDialog(true);
    }
  };

  const handleGenerateSuggestions = () => {
    setIsAnalyzing(true);
    setShowAIDialog(false);
    // Simuler le temps d'analyse
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowSuggestions(true);
    }, 1500);
  };

  const handleConfirmSuggestions = (suggestions: GigSuggestion) => {
    setConfirmedSuggestions(suggestions);
    setShowSuggestions(false);
    setCurrentSection("basic");

    // Map the generated data to the initialized structure
    const mappedData = mapGeneratedDataToGigData(suggestions);
    
    // Update the gig data with the mapped suggestions
    setGigData((prevData: GigData) => ({
      ...prevData,
      ...mappedData,
      // Preserve any existing data that wasn't in the suggestions
      userId: prevData.userId,
      companyId: prevData.companyId,
      // Ensure destination_zone is set correctly
      destination_zone: suggestions.destinationZones?.[0] === 'Tunisia' ? 'TN' : prevData.destination_zone
    }));
  };

  const handleSectionChange = (sectionId: string) => {
    // Si onSectionChange est appelé avec 'suggestions', revenir aux suggestions
    if (sectionId === 'suggestions') {
      // Préserver les suggestions confirmées pour pouvoir y revenir
      setShowSuggestions(true);
      setCurrentSection("basic");
      // Préserver l'input original pour éviter la régénération
      if (confirmedSuggestions && !input.trim()) {
        // Si l'input est vide mais qu'on a des suggestions confirmées,
        // on peut utiliser un placeholder ou garder l'input vide
        // car les suggestions sont déjà chargées
      }
      return;
    }
    
    setCurrentSection(sectionId);
  };

  const handleGigDataChange = (newData: GigData) => {
    
    // If we have confirmed suggestions, merge them with the new data
    if (confirmedSuggestions) {
      const updatedData = {
        ...newData,
        // Preserve destinationZones from suggestions if they exist
        destinationZones: confirmedSuggestions.destinationZones || newData.destinationZones,
        // If we have a destination_zone from suggestions, use it
        destination_zone: newData.destination_zone || (confirmedSuggestions.destinationZones?.[0] === 'Tunisia' ? 'TN' : '')
      };
      
      setGigData(updatedData);
    } else {
      setGigData(newData);
    }
  };

  const handleManualMode = () => {
    setIsManualMode(true);
    setCurrentSection("basic");
  };

  const handleBackToSuggestions = () => {
    setConfirmedSuggestions(null);
    setShowSuggestions(true);
    setCurrentSection("basic");
    setGigData({
      userId: Cookies.get('userId') || "",
      companyId: Cookies.get('companyId') || "",
      destination_zone: "",
      destinationZones: [],
      callTypes: [],
      highlights: [],
      requirements: {
        essential: [],
        preferred: []
      },
      benefits: [],
      tools: {
        provided: [],
        required: []
      },
      equipment: {
        provided: [],
        required: []
      },
      title: "",
      description: "",
      category: "",
      availability: {
        schedule: [{
          day: "",
          hours: {
            start: "",
            end: ""
          }
        }],
        timeZones: [],
        time_zone: "",
        flexibility: [],
        minimumHours: {},
      },
      schedule: {
        schedules: [{
          day: "",
          hours: {
            start: "",
            end: ""
          }
        }],
        timeZones: [],
        flexibility: [],
        minimumHours: {},
      },
      commission: {
        base: "",
        baseAmount: 0,
        bonus: "",
        bonusAmount: 0,
        structure: "",
        currency: "",
        minimumVolume: {
          amount: 0,
          period: "",
          unit: ""
        },
        transactionCommission: {
          type: "",
          amount: 0
        },
        kpis: []
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
      skills: {
        languages: [{
          language: "French",
          proficiency: "B1",
          iso639_1: "fr"
        }],
        soft: [{ skill: { $oid: "softSkillOid" }, level: 1, details: "" }],
        professional: [{ skill: { $oid: "professionalSkillOid" }, level: 1, details: "" }],
        technical: [{ skill: { $oid: "technicalSkillOid" }, level: 1, details: "" }],
        certifications: []
      },
      seniority: {

        level: "",
        yearsExperience: 0
      },
      team: {
        size: 0,
        structure: [],
        territories: [],
        reporting: {
          to: "",
          frequency: ""
        },
        collaboration: []
      },
      training: {
        initial: {
          duration: "",
          format: "",
          topics: []
        },
        ongoing: {
          frequency: "",
          format: "",
          topics: []
        },
        support: []
      },
      metrics: {
        kpis: [],
        targets: {},
        reporting: {
          frequency: "",
          metrics: []
        }
      },
      documentation: {
        templates: null,
        reference: null,
        product: [],
        process: [],
        training: []
      },
      compliance: {
        requirements: [],
        certifications: [],
        policies: []
      }
    });
  };

  if (showSuggestions) {
    return (
      <Suggestions
        input={input}
        onBack={() => setShowSuggestions(false)}
        onConfirm={handleConfirmSuggestions}
        initialSuggestions={confirmedSuggestions}
      />
    );
  }

  if (confirmedSuggestions || isManualMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="w-full h-full py-8 px-4">
          {/* Header with back button for manual mode */}
          {isManualMode && (
            <div className="mb-8">
              <button
                onClick={() => setIsManualMode(false)}
                className="flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to AI Assistant
              </button>
              <div className="text-center">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                  Create Gig Manually
                </h1>
                <p className="text-lg text-gray-600">Fill out the sections below to create your gig</p>
              </div>
            </div>
          )}

          {/* Navigation and Section Content */}
          <div className="backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 overflow-hidden w-full h-full">
            {/* Navigation Tabs */}
            {currentSection !== 'review' && (
              <nav className="border-b border-gray-200 bg-white px-4 py-3">
                <div className="flex justify-start gap-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => handleSectionChange(section.id)}
                      className={`flex items-center gap-2 px-4 py-2 text-base font-medium transition-all duration-200
                        ${section.id === currentSection
                          ? "border-b-2 border-blue-600 text-blue-600"
                          : "text-gray-600 hover:text-blue-600 border-b-2 border-transparent"
                        }`}
                      style={{ outline: "none" }}
                    >
                      <section.icon className={`w-5 h-5 ${section.id === currentSection ? 'text-blue-600' : 'text-gray-400'}`} />
                      {section.label}
                    </button>
                  ))}
                </div>
              </nav>
            )}

            {/* Section Content */}
            <div>
              <SectionContent
                section={currentSection}
                data={gigData}
                onChange={handleGigDataChange}
                errors={{}}
                constants={predefinedOptions}
                onSectionChange={handleSectionChange}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="w-full h-full py-16 px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Create with AI Assistance
          </h1>
          <p className="text-xl text-gray-600 w-full mx-auto">
            Describe your needs naturally, and let AI help structure your
            content
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Describe your needs naturally
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowSuggestions(true)}
                    className="text-blue-600 hover:text-blue-700 flex items-center text-sm"
                  >
                    <HelpCircle className="w-4 h-4 mr-1" />
                    Writing Tips
                  </button>
                  <button
                    type="button"
                    onClick={handleManualMode}
                    className="text-green-600 hover:text-green-700 flex items-center text-sm"
                  >
                    <PlusCircle className="w-5 h-5 mr-1" />
                    <span>Create Manually</span>
                  </button>
                </div>
              </div>

              {showGuidance && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Writing Tips</h3>
                  <ul className="text-sm text-blue-600 space-y-2">
                    <li>• Be specific about your target audience and location</li>
                    <li>• Mention key requirements and qualifications</li>
                    <li>• Include details about schedule and availability</li>
                    <li>• Specify any technical requirements or tools needed</li>
                    <li>• Describe the compensation structure if possible</li>
                  </ul>
                </div>
              )}

              <div className="relative">
                <textarea
                  id="description"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Example: I need a sales campaign targeting Spanish-speaking customers in Europe, with a focus on insurance products..."
                  className="w-full h-32 px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm resize-none"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="absolute bottom-4 right-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-3 rounded-xl hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Brain className="w-5 h-5" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <AIDialog
        isOpen={showAIDialog}
        onClose={() => setShowAIDialog(false)}
        onProceed={handleGenerateSuggestions}
        analyzing={isAnalyzing}
      />
    </div>
  );
};

export default PrompAI;
