import React, { useState } from "react";
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
import type { GigSuggestion, GigData } from "../types";
import { predefinedOptions } from "../lib/guidance";

const sections = [
  { id: "basic", label: "Basic Info", icon: Briefcase },
  { id: "schedule", label: "Schedule", icon: Globe2 },
  { id: "commission", label: "Commission", icon: DollarSign },
  { id: "leads", label: "Leads", icon: Target },
  { id: "skills", label: "Skills", icon: Brain },
  { id: "team", label: "Team", icon: Users },
  { id: "docs", label: "Documentation", icon: FileText },
];

const PrompAI: React.FC = () => {
  const [input, setInput] = useState("");
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [confirmedSuggestions, setConfirmedSuggestions] =
    useState<GigSuggestion | null>(null);
  const [currentSection, setCurrentSection] = useState("basic");
  const [gigData, setGigData] = useState<GigData>({
    userId: "",
    companyId: "",
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
    schedule: {
      days: [],
      hours: "",
      timeZones: [],
      flexibility: [],
      minimumHours: {}
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
      languages: [],
      soft: [],
      professional: [],
      technical: [],
      certifications: []
    },
    seniority: {
      years: "",
      level: "",
      yearsExperience: ""
    },
    team: {
      size: "",
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

    // Mettre à jour les données du gig avec les suggestions
    setGigData((prevData: GigData) => ({
      ...prevData,
      // Section Basic
      title: suggestions.jobTitles?.[0] || prevData.title,
      description: suggestions.deliverables?.join("\n") || prevData.description,
      category: suggestions.sectors?.[0] || prevData.category,
      destinationZones: suggestions.destinationZones || prevData.destinationZones,
      destination_zone: suggestions.destinationZones?.[0] ? 'TR' : prevData.destination_zone,
      seniority: {
        level: suggestions.seniority?.level || prevData.seniority.level,
        years: suggestions.seniority?.yearsExperience || prevData.seniority.years,
        yearsExperience: suggestions.seniority?.yearsExperience || prevData.seniority.yearsExperience
      },
      // Section Schedule
      schedule: {
        days: suggestions.schedule?.days || prevData.schedule.days,
        hours: suggestions.schedule?.hours || prevData.schedule.hours,
        timeZones:
          suggestions.schedule?.timeZones || prevData.schedule.timeZones,
        flexibility: suggestions.schedule?.flexibility || prevData.schedule.flexibility,
        minimumHours: {
          daily: suggestions.schedule?.minimumHours?.daily || prevData.schedule.minimumHours.daily,
          weekly: suggestions.schedule?.minimumHours?.weekly || prevData.schedule.minimumHours.weekly,
          monthly: suggestions.schedule?.minimumHours?.monthly || prevData.schedule.minimumHours.monthly
        }
      },
      // Section Commission
      commission: {
        base: suggestions.commission?.base || prevData.commission.base,
        baseAmount: suggestions.commission?.baseAmount || prevData.commission.baseAmount,
        bonus: suggestions.commission?.bonus || prevData.commission.bonus,
        bonusAmount: suggestions.commission?.bonusAmount || prevData.commission.bonusAmount,
        structure: suggestions.commission?.structure || prevData.commission.structure,
        currency: suggestions.commission?.currency || prevData.commission.currency,
        minimumVolume: {
          amount: suggestions.commission?.minimumVolume?.amount || prevData.commission.minimumVolume.amount,
          period: suggestions.commission?.minimumVolume?.period || prevData.commission.minimumVolume.period,
          unit: suggestions.commission?.minimumVolume?.unit || prevData.commission.minimumVolume.unit,
        },
        transactionCommission: {
          type: suggestions.commission?.transactionCommission?.type || prevData.commission.transactionCommission.type,
          amount: suggestions.commission?.transactionCommission?.amount || prevData.commission.transactionCommission.amount,
        },
        kpis: suggestions.commission?.kpis || prevData.commission.kpis || []
      },
      // Section Skills
      skills: {
        languages: suggestions.skills?.languages || prevData.skills.languages,
        soft: suggestions.skills?.soft || prevData.skills.soft,
        professional:
          suggestions.skills?.professional || prevData.skills.professional,
        technical: suggestions.skills?.technical || prevData.skills.technical,
        certifications: suggestions.skills?.certifications || prevData.skills.certifications,
      },
      // Section Team
      team: {
        size: suggestions.team?.size?.toString() || prevData.team.size,
        structure: suggestions.team?.structure || prevData.team.structure,
        territories: suggestions.team?.territories || prevData.team.territories,
        reporting: {
          to: suggestions.team?.reporting?.to || prevData.team.reporting.to,
          frequency:
            suggestions.team?.reporting?.frequency ||
            prevData.team.reporting.frequency,
        },
        collaboration: suggestions.team?.collaboration || prevData.team.collaboration,
      },
      // Section Documentation
      documentation: {
        product:
          suggestions.documentation?.product || prevData.documentation.product,
        process:
          suggestions.documentation?.process || prevData.documentation.process,
        training:
          suggestions.documentation?.training ||
          prevData.documentation.training,
        reference:
          suggestions.documentation?.reference || prevData.documentation.reference,
        templates:
          suggestions.documentation?.templates || prevData.documentation.templates,
      },
    }));
  };

  const handleSectionChange = (sectionId: string) => {
    setCurrentSection(sectionId);
  };

  const handleGigDataChange = (newData: GigData) => {
    console.log('handleGigDataChange - Previous data:', gigData);
    console.log('handleGigDataChange - New data:', newData);
    
    // If we have confirmed suggestions, merge them with the new data
    if (confirmedSuggestions) {
      const updatedData = {
        ...newData,
        // Preserve destinationZones from suggestions if they exist
        destinationZones: confirmedSuggestions.destinationZones || newData.destinationZones,
        // If we have a destination_zone from suggestions, use it
        destination_zone: newData.destination_zone || (confirmedSuggestions.destinationZones?.[0] ? 'TR' : '')
      };
      
      console.log('handleGigDataChange - Updated data with suggestions:', updatedData);
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
            {currentSection === "basic" ? (
              <BasicSection
                data={gigData}
                onChange={handleGigDataChange}
                errors={{}}
                onSectionChange={handleSectionChange}
                currentSection={currentSection}
              />
            ) : (
              <SectionContent
                section={currentSection}
                data={gigData}
                onChange={handleGigDataChange}
                errors={{}}
                constants={predefinedOptions}
                onSectionChange={handleSectionChange}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  function setShowGuidance(arg0: boolean): void {
    throw new Error("Function not implemented.");
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
                    onClick={() => setShowGuidance(!setShowGuidance)}
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
                  <Send className="w-5 h-5" />
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
