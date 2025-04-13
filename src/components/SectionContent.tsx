import React from "react";
import { GigData } from "../types";
import { SectionGuidance } from "./SectionGuidance";
import BasicSection from "./BasicSection";
import { ScheduleSection } from "./ScheduleSection";
import { CommissionSection } from "./CommissionSection";
import { LeadsSection } from "./LeadsSection";
import { SkillsSection } from "./SkillsSection";
import { TeamStructure } from "./TeamStructure";
import { DocumentationSection } from "./DocumentationSection";
import { GigReview } from "./GigReview";
import { validateGigData } from "../lib/validation";

interface SectionContentProps {
  section: string;
  data: GigData;
  onChange: (data: GigData) => void;
  errors: { [key: string]: string[] };
  constants: any;
  onSectionChange?: (section: string) => void;
}

export function SectionContent({
  section,
  data,
  onChange,
  errors,
  onSectionChange,
}: SectionContentProps) {
  console.log('SectionContent - Initial data:', data);

  // Ensure seniority object is properly initialized
  const initializedData = React.useMemo(() => ({
    ...data,
    seniority: {
      level: data.seniority?.level || '',
      yearsExperience: data.seniority?.yearsExperience || '',
      aiGenerated: data.seniority?.aiGenerated
    }
  }), [data]);

  console.log('SectionContent - Initialized data:', initializedData);

  const validation = validateGigData(initializedData);

  const sections = [
    "basic",
    "schedule",
    "commission",
    "leads",
    "skills",
    "team",
    "docs",
    "review",
  ];

  const handlePrevious = () => {
    const currentIndex = sections.indexOf(section);
    if (currentIndex > 0) {
      const prevSection = sections[currentIndex - 1];
      if (onSectionChange) {
        onSectionChange(prevSection);
      }
    }
  };

  const handleNext = () => {
    const currentIndex = sections.indexOf(section);
    console.log("Current section:", section);
    console.log("Current index:", currentIndex);
    console.log("Sections:", sections);
    console.log("onSectionChange is defined:", !!onSectionChange);

    if (currentIndex < sections.length - 1) {
      const nextSection = sections[currentIndex + 1];
      console.log("Next section:", nextSection);

      if (onSectionChange) {
        console.log("Calling onSectionChange with:", nextSection);
        onSectionChange(nextSection);
      } else {
        console.warn("onSectionChange is undefined");
      }
    } else {
      console.warn("Already at last section, can't go next");
    }
  };

  const renderContent = () => {
    switch (section) {
      case "basic":
        return (
          <BasicSection
            data={initializedData}
            onChange={onChange}
            errors={errors}
            onPrevious={() => onSectionChange?.('')}
            onNext={() => onSectionChange?.('schedule')}
            onSave={() => {}}
            onAIAssist={() => {}}
            currentSection={section}
          />
        );

      case "schedule":
        return (
          <ScheduleSection
            data={initializedData.schedule || {
              days: [],
              hours: "",
              timeZones: [],
              flexibility: [],
              minimumHours: {
                daily: undefined,
                weekly: undefined,
                monthly: undefined,
              },
              startTime: "09:00",
              endTime: "17:00",
            }}
            onChange={(scheduleData) => onChange({
              ...initializedData,
              schedule: scheduleData
            })}
            errors={errors}
            onPrevious={() => onSectionChange?.('basic')}
            onNext={() => onSectionChange?.('commission')}
            onSave={() => {}}
            onAIAssist={() => {}}
            currentSection={section}
          />
        );

      case "commission":
        return (
          <CommissionSection
            data={initializedData}
            onChange={onChange}
            errors={errors}
            onPrevious={() => onSectionChange?.('schedule')}
            onNext={() => onSectionChange?.('leads')}
            onSave={() => {}}
            onAIAssist={() => {}}
            currentSection={section}
          />
        );

      case "leads":
        return (
          <LeadsSection
            data={initializedData}
            onChange={onChange}
            errors={errors}
            onPrevious={() => onSectionChange?.('commission')}
            onNext={() => onSectionChange?.('skills')}
            onSave={() => {}}
            onAIAssist={() => {}}
            currentSection={section}
          />
        );

      case "skills":
        return (
          <SkillsSection
            data={initializedData}
            onChange={onChange}
            errors={errors}
            onPrevious={() => onSectionChange?.('leads')}
            onNext={() => onSectionChange?.('team')}
            onSave={() => {}}
            onAIAssist={() => {}}
            currentSection={section}
          />
        );

      case "team":
        return (
          <TeamStructure
            data={initializedData}
            onChange={onChange}
            errors={errors}
            onPrevious={() => onSectionChange?.('skills')}
            onNext={() => onSectionChange?.('docs')}
            onSave={() => {}}
            onAIAssist={() => {}}
            currentSection={section}
          />
        );

      case "docs":
        console.log('SectionContent - Rendering DocumentationSection');
        return (
          <DocumentationSection
            data={initializedData.documentation}
            onChange={(newDocs) => onChange({ ...initializedData, documentation: newDocs })}
            errors={errors}
            onPrevious={() => onSectionChange?.('team')}
            onNext={() => {}}
            onReview={() => {
              console.log('SectionContent - Calling onReview');
              onSectionChange?.('review');
            }}
            isLastSection={true}
          />
        );

      case "review":
        console.log('SectionContent - Rendering GigReview');
        return (
          <GigReview
            data={initializedData}
            onEdit={(section) => {
              console.log('SectionContent - onEdit - Setting section to:', section);
              onSectionChange?.(section);
            }}
            onSubmit={async () => {
              console.log('SectionContent - onSubmit - Submitting gig');
              // Handle submission here
            }}
            isSubmitting={false}
            onBack={() => {
              console.log('SectionContent - onBack - Going back to docs section');
              onSectionChange?.('docs');
            }}
            skipValidation={false}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <SectionGuidance section={section} />
      {renderContent()}
    </div>
  );
}
