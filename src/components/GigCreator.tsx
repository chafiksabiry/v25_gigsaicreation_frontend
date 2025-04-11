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
  Target,
  ArrowRight,
} from "lucide-react";
import { GigReview } from "./GigReview";
import { ValidationMessage } from "./ValidationMessage";
import { analyzeTitleAndGenerateDescription } from "../lib/ai";
import { validateGigData } from "../lib/validation";
import { GigData } from "../types";
import { predefinedOptions } from "../lib/guidance";
import { AIDialog } from "./AIDialog";
import { supabase } from "../lib/supabase";
import BasicSection from './BasicSection';
import { SectionContent } from './SectionContent';

const sections = [
  { id: "basic", label: "Basic Info", icon: Briefcase },
  { id: "schedule", label: "Schedule", icon: Globe2 },
  { id: "commission", label: "Commission", icon: DollarSign },
  { id: "leads", label: "Leads", icon: Target },
  { id: "skills", label: "Skills", icon: Brain },
  { id: "team", label: "Team", icon: Users },
  { id: "docs", label: "Documentation", icon: FileText },
];

const initialGigData: GigData = {
  title: "",
  description: "",
  category: "",
  callTypes: [],
  highlights: [],
  requirements: {
    essential: [],
    preferred: [],
  },
  benefits: [],
  schedule: {
    days: ([] as unknown) as string[],
    hours: "",
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
    languages: [],
    soft: [],
    professional: [],
    technical: [],
    certifications: [],
  },
  seniority: {
    level: "",
    yearsExperience: "",
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
  },
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

export function GigCreator({ children }: GigCreatorProps) {
  const [currentSection, setCurrentSection] = useState(sections[0].id);
  const [gigData, setGigData] = useState<GigData>(initialGigData);
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

  const validation = validateGigData(gigData);
  const currentSectionHasErrors = Object.keys(validation.errors).some(
    (key) => key === currentSection
  );
  const currentSectionHasWarnings = Object.keys(validation.warnings).some(
    (key) => key === currentSection
  );
  const isLastSection = currentSection === sections[sections.length - 1].id;

  const handleGigDataChange = (newData: GigData) => {
    console.log('GigCreator - handleGigDataChange - Current data:', gigData);
    console.log('GigCreator - handleGigDataChange - New data:', newData);
    setGigData(newData);
    const validation = validateGigData(newData);
    setValidationErrors(validation.errors);
  };

  const handleAISuggest = async () => {
    if (!gigData.title) {
      setValidationErrors({ title: ["Please enter a title first"] });
      return;
    }

    setAnalyzing(true);
    try {
      const suggestions = await analyzeTitleAndGenerateDescription(
        gigData.title
      );
      setGigData((prev) => ({
        ...prev,
        ...suggestions,
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
      const { data, error } = await supabase
        .from("gigs")
        .insert({
          title: gigData.title,
          description: gigData.description,
          category: gigData.category,
          seniority_level: gigData.seniority.level,
          years_experience: gigData.seniority.yearsExperience,
          schedule_days: gigData.schedule.days,
          schedule_hours: gigData.schedule.hours,
          schedule_timezone: gigData.schedule.timeZones,
          schedule_flexibility: gigData.schedule.flexibility.join(", "),
          commission_base: gigData.commission.base,
          commission_base_amount: gigData.commission.baseAmount,
          commission_bonus: gigData.commission.bonus,
          commission_bonus_amount: gigData.commission.bonusAmount,
          commission_currency: gigData.commission.currency,
          commission_structure: gigData.commission.structure,
          commission_minimum_volume_amount: gigData.commission.minimumVolume.amount,
          commission_minimum_volume_period: gigData.commission.minimumVolume.period,
          commission_minimum_volume_unit: gigData.commission.minimumVolume.unit,
          commission_transaction_type: gigData.commission.transactionCommission.type,
          commission_transaction_amount: gigData.commission.transactionCommission.amount,
          team_size: gigData.team.size,
          team_structure: gigData.team.structure,
          team_territories: gigData.team.territories,
          prerequisites: [],
          call_types: gigData.callTypes,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        // Insert skills
        if (
          gigData.skills.languages.length > 0 ||
          gigData.skills.professional.length > 0 ||
          gigData.skills.technical.length > 0
        ) {
          const skillsToInsert = [
            ...gigData.skills.languages.map((lang) => ({
              gig_id: data.id,
              category: "language",
              name: lang.name,
              level: lang.level,
            })),
            ...gigData.skills.professional.map((skill) => ({
              gig_id: data.id,
              category: "professional",
              name: skill,
            })),
            ...gigData.skills.technical.map((skill) => ({
              gig_id: data.id,
              category: "technical",
              name: skill,
            })),
          ];

          const { error: skillsError } = await supabase
            .from("gig_skills")
            .insert(skillsToInsert);

          if (skillsError) throw skillsError;
        }

        // Insert leads
        if (gigData.leads.types.some((lead) => lead.percentage > 0)) {
          const { error: leadsError } = await supabase.from("gig_leads").insert(
            gigData.leads.types.map((lead) => ({
              gig_id: data.id,
              lead_type: lead.type,
              percentage: lead.percentage,
              description: lead.description,
              sources: gigData.leads.sources,
            }))
          );

          if (leadsError) throw leadsError;
        }

        // Insert documentation
        const docsToInsert = [
          ...gigData.documentation.product.map((doc) => ({
            gig_id: data.id,
            doc_type: "product",
            name: doc.name,
            url: doc.url,
          })),
          ...gigData.documentation.process.map((doc) => ({
            gig_id: data.id,
            doc_type: "process",
            name: doc.name,
            url: doc.url,
          })),
          ...gigData.documentation.training.map((doc) => ({
            gig_id: data.id,
            doc_type: "training",
            name: doc.name,
            url: doc.url,
          })),
        ];

        if (docsToInsert.length > 0) {
          const { error: docsError } = await supabase
            .from("gig_documentation")
            .insert(docsToInsert);

          if (docsError) throw docsError;
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
    console.log('GigCreator - handleNext - Current section:', currentSection);
    const currentIndex = sections.findIndex(s => s.id === currentSection);
    if (currentIndex < sections.length - 1) {
      const nextSection = sections[currentIndex + 1].id;
      console.log('GigCreator - handleNext - Moving to section:', nextSection);
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
        onBack={() => setIsReviewing(false)}
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
