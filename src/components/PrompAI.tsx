import React, { useState } from "react";
import Cookies from 'js-cookie';
import {
  Brain,
  Send,
  HelpCircle,
  Briefcase,
  FileText,
  Globe2,
  DollarSign,
  Users,
  Target,
  PlusCircle,
} from "lucide-react";
import { AIDialog } from "./AIDialog";
import { Suggestions } from "./Suggestions";
import BasicSection from "./BasicSection";
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
      timeZone: "",
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
      baseAmount: "",
      bonus: "",
      bonusAmount: "",
      structure: "",
      currency: "",
      minimumVolume: {
        amount: "",
        period: "",
        unit: ""
      },
      transactionCommission: {
        type: "",
        amount: ""
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

  if (showSuggestions) {
    return (
      <Suggestions
        input={input}
        onBack={() => setShowSuggestions(false)}
        onConfirm={handleConfirmSuggestions}
      />
    );
  }

  if (confirmedSuggestions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto py-8 px-4">
          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleSectionChange(section.id)}
                className={`flex items-center gap-2 px-6 py-3 whitespace-nowrap ${
                  section.id === currentSection
                    ? "text-blue-600 border-b-2 border-blue-600 font-medium"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <section.icon className="w-5 h-5" />
                {section.label}
              </button>
            ))}
          </div>

          {/* Section Content */}
          <div className="bg-white rounded-xl shadow-xl p-6">
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
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create with AI Assistance
          </h1>
          <p className="text-lg text-gray-600">
            Describe your needs naturally, and let AI help structure your
            content
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-6">
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
                    onClick={() => (window.location.href = "/gigsmanual")}
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
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="absolute bottom-3 right-3 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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
