import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  Brain,
  Save,
  Briefcase,
  FileText,
  Globe2,
  DollarSign,
  Users,
} from "lucide-react";
import { GigReview } from "./GigReview";
import { analyzeTitleAndGenerateDescription, generateSkills } from "../lib/ai";
import { validateGigData } from "../lib/validation";
import { GigData } from "../types";
import { predefinedOptions } from "../lib/guidance";
import { AIDialog } from "./AIDialog";
import Cookies from 'js-cookie';
import { saveGigData } from '../lib/api';
import axios from 'axios';

const sections = [
  { id: "basic", label: "Basic Info", icon: Briefcase },
  { id: "schedule", label: "Schedule", icon: Globe2 },
  { id: "commission", label: "Commission", icon: DollarSign },
  // { id: "leads", label: "Leads", icon: Target },
  { id: "skills", label: "Skills", icon: Brain },
  { id: "team", label: "Team", icon: Users },
  { id: "docs", label: "Documentation", icon: FileText },
];

const initialGigData: GigData = {
  userId: "",
  companyId: "",
  title: "",
  description: "",
  category: "",
  destination_zone: "",
  destinationZones: [],
  callTypes: [],
  highlights: [],
  requirements: {
    essential: [],
    preferred: [],
  },
  benefits: [],
  schedule: {
    days: ([] as unknown) as string[],
    startTime: "",
    endTime: "",
    timeZones: [],
    flexibility: [],
    minimumHours: {
      daily: undefined,
      weekly: undefined,
      monthly: undefined,
    },
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
      unit: "",
    },
    transactionCommission: {
      type: "",
      amount: "",
    },
    kpis: [],
  },
  leads: {
    types: [
      { type: "hot", percentage: 0, description: "" },
      { type: "warm", percentage: 0, description: "" },
      { type: "cold", percentage: 0, description: "" },
    ],
    sources: [],
    distribution: {
      method: "",
      rules: [],
    },
    qualificationCriteria: [],
  },
  skills: {
    languages: [{ name: "English", level: "fluent" }],
    technical: ["Adobe Illustrator", "Adobe Photoshop", "Typography", "Color Theory"],
    professional: ["Brand Identity Design", "Logo Design", "Marketing Collateral Design", "Portfolio Management"],
    soft: ["Creativity", "Time Management", "Client Communication", "Attention to Detail"],
    certifications: []
  },
  seniority: {
    years: "",
    level: "",
    yearsExperience: 0,
  },
  team: {
    size: "",
    structure: [],
    territories: [],
    reporting: {
      to: "",
      frequency: "",
    },
    collaboration: [],
  },
  tools: {
    provided: [],
    required: [],
  },
  training: {
    initial: {
      duration: "",
      format: "",
      topics: [],
    },
    ongoing: {
      frequency: "",
      format: "",
      topics: [],
    },
    support: [],
  },
  metrics: {
    kpis: [],
    targets: {},
    reporting: {
      frequency: "",
      metrics: [],
    },
  },
  documentation: {
    templates: {},
    reference: {},
    product: [],
    process: [],
    training: [],
  },
  compliance: {
    requirements: [],
    certifications: [],
    policies: [],
  },
  equipment: {
    required: [],
    provided: [],
  }
};

// Update the constants structure
const constants = {
  ...predefinedOptions,
  metrics: {
    ...predefinedOptions.metrics,
    metricTypes: predefinedOptions.metrics.kpis
  }
};

interface GigCreatorProps {
  children: (props: {
    data: GigData;
    onChange: (data: GigData) => void;
    errors: { [key: string]: string[] };
    onPrevious: () => void;
    onNext: () => void;
    onSave: () => void;
    onAIAssist: () => void;
    onReview: () => void;
    currentSection: string;
    isLastSection: boolean;
  }) => React.ReactNode;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function GigCreator({ children }: GigCreatorProps) {
  const [currentSection, setCurrentSection] = useState(sections[0].id);
  const [gigData, setGigData] = useState<GigData>({
    ...initialGigData,
    destinationZones: []
  });
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skipValidation, setSkipValidation] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string[];
  }>({});
  const [isSaving, setIsSaving] = useState(false);

  console.log('GigCreator - Initial state:', {
    currentSection,
    gigData,
    validationErrors
  });

  const handleGigDataChange = (newData: GigData) => {
    console.log('handleGigDataChange - Previous data:', gigData);
    console.log('handleGigDataChange - New data:', newData);
    const updatedData = {
      ...newData,
      destinationZones: newData.destinationZones || []
    };
    console.log('handleGigDataChange - Updated data:', updatedData);
    setGigData(updatedData);
    const validation = validateGigData(updatedData);
    setValidationErrors(validation.errors);
  };

  const handleAISuggest = async () => {
    if (!gigData.title) {
      setValidationErrors({ title: ["Please enter a title first"] });
      return;
    }

    setAnalyzing(true);
    try {
      const [suggestions, skills] = await Promise.all([
        analyzeTitleAndGenerateDescription(gigData.title),
        generateSkills(gigData.title, gigData.description || "")
      ]);
      
      setGigData((prev) => ({
        ...prev,
        ...suggestions,
        skills: {
          ...prev.skills,
          ...skills
        }
      }));
      setShowAIDialog(false);
    } catch (error: any) {
      setValidationErrors({ ai: [error.message] });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let userId: string;
      let companyId: string;

      // Vérifier si on est en mode standalone
      const isStandalone = import.meta.env.VITE_STANDALONE === 'true';

      

      if (isStandalone) {
        // Valeurs par défaut pour le mode standalone
        companyId = Cookies.get('companyId') ?? "";
        userId = Cookies.get('userId') ?? "";
      } else {
        // Récupérer le companyId associé à l'utilisateur
        await saveGigData(gigData);
        
        // Since saveGigData doesn't return data, we'll use the cookies directly
        userId = Cookies.get("userId") || "";
        companyId = Cookies.get("companyId") || "";

        if (!userId || !companyId) {
          throw new Error("User ID or Company ID not found in cookies");
        }
      }

      const gigDataToSave = {
        title: gigData.title,
        description: gigData.description,
        category: gigData.category,
        userId: userId,
        companyId: companyId,
        seniority: {
          level: gigData.seniority.level,
          yearsExperience: gigData.seniority.yearsExperience
        },
        skills: {
          professional: gigData.skills.professional,
          languages: gigData.skills.languages,
          technical: gigData.skills.technical,
          soft: gigData.skills.soft
        },
        schedule: {
          days: gigData.schedule?.days || [],
          startTime: gigData.schedule?.startTime || '',
          endTime: gigData.schedule?.endTime || '',
          timeZones: gigData.schedule?.timeZones || [],
          flexibility: gigData.schedule?.flexibility || '',
          minimumHours: {
            daily: gigData.schedule?.minimumHours?.daily || 0,
            weekly: gigData.schedule?.minimumHours?.weekly || 0,
            monthly: gigData.schedule?.minimumHours?.monthly || 0
          }
        },
        commission: {
          base: gigData.commission.base,
          baseAmount: gigData.commission.baseAmount,
          bonus: gigData.commission.bonus,
          bonusAmount: gigData.commission.bonusAmount,
          currency: gigData.commission.currency,
          minimumVolume: {
            amount: gigData.commission.minimumVolume.amount,
            period: gigData.commission.minimumVolume.period,
            unit: gigData.commission.minimumVolume.unit
          },
          transactionCommission: {
            type: gigData.commission.transactionCommission.type,
            amount: gigData.commission.transactionCommission.amount
          }
        },
        leads: {
          types: gigData.leads.types,
          sources: gigData.leads.sources
        },
        team: {
          size: gigData.team?.size || '0',
          structure: gigData.team?.structure || [],
          territories: gigData.team?.territories || []
        },
        documentation: {
          training: gigData.documentation.training,
          product: gigData.documentation.product,
          process: gigData.documentation.process
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };


      const response = await axios.post(`${API_URL}/gigs`, gigDataToSave);
      const gig = response.data;

      if (gig) {
        // Insert skills
        if (
          gigData.skills.languages.length > 0 ||
          gigData.skills.professional.length > 0 ||
          gigData.skills.technical.length > 0
        ) {
          const skillsToInsert = [
            ...gigData.skills.languages.map((lang) => ({
              gig_id: gig.id,
              category: "language",
              name: lang.name,
              level: lang.level,
            })),
            ...gigData.skills.professional.map((skill) => ({
              gig_id: gig.id,
              category: "professional",
              name: skill,
            })),
            ...gigData.skills.technical.map((skill) => ({
              gig_id: gig.id,
              category: "technical",
              name: skill,
            })),
          ];

          await axios.post(`${API_URL}/gig_skills`, { skills: skillsToInsert });
        }

        // Insert leads
        if (gigData.leads.types.some((lead) => lead.percentage > 0)) {
          await axios.post(`${API_URL}/gig_leads`, {
            gig_id: gig.id,
            leads: gigData.leads.types.map((lead) => ({
              lead_type: lead.type,
              percentage: lead.percentage,
              description: lead.description,
              sources: gigData.leads.sources,
            })),
          });
        }

        // Insert documentation
        const docsToInsert = [
          ...gigData.documentation.product.map((doc) => ({
            gig_id: gig.id,
            doc_type: "product",
            name: doc.name,
            url: doc.url,
          })),
          ...gigData.documentation.process.map((doc) => ({
            gig_id: gig.id,
            doc_type: "process",
            name: doc.name,
            url: doc.url,
          })),
          ...gigData.documentation.training.map((doc) => ({
            gig_id: gig.id,
            doc_type: "training",
            name: doc.name,
            url: doc.url,
          })),
        ];

        if (docsToInsert.length > 0) {
          await axios.post(`${API_URL}/gig_documentation`, { docs: docsToInsert });
        }

        // Reset form
        setGigData(initialGigData);
        setCurrentSection("basic");
        setIsReviewing(false);
      }
    } catch (error: any) {
      console.error("Error creating gig:", error);
      setSubmitError("Failed to create gig. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save current progress to local storage
      localStorage.setItem("gigDraft", JSON.stringify(gigData));
      // Show success message
      alert("Progress saved successfully!");
    } catch (error) {
      console.error("Error saving progress:", error);
      alert("Failed to save progress. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => {

    const currentIndex = sections.findIndex(s => s.id === currentSection);
    if (currentIndex < sections.length - 1) {
      const nextSection = sections[currentIndex + 1].id;
      setCurrentSection(nextSection);
    }
  };

  const handlePrevious = () => {
    const currentIndex = sections.findIndex(s => s.id === currentSection);
    if (currentIndex > 0) {
      const prevSection = sections[currentIndex - 1].id;
      setCurrentSection(prevSection);
    }
  };

  const handleReview = () => {
    setIsReviewing(true);
  };

  if (isReviewing) {
    return (
      <GigReview
        data={gigData}
        onEdit={(section) => {
          setCurrentSection(section);
          setIsReviewing(false);
        }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onBack={() => {
          setIsReviewing(false);
        }}
        skipValidation={skipValidation}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-xl shadow-xl">
          {children({
            data: gigData,
            onChange: handleGigDataChange,
            errors: validationErrors,
            onPrevious: handlePrevious,
            onNext: handleNext,
            onSave: handleSave,
            onAIAssist: () => setShowAIDialog(true),
            onReview: handleReview,
            currentSection: currentSection,
            isLastSection: currentSection === sections[sections.length - 1].id
          })}
        </div>
      </div>

      <AIDialog
        isOpen={showAIDialog}
        onClose={() => setShowAIDialog(false)}
        onProceed={handleAISuggest}
        analyzing={analyzing}
      />
    </div>
  );
}
