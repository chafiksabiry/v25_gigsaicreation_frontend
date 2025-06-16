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
import { TimezoneCode } from "../lib/ai";

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
      yearsExperience: data.seniority?.yearsExperience || 0,
      aiGenerated: data.seniority?.aiGenerated,
    }
  }), [data]);

  console.log('SectionContent - Initialized data:', initializedData);


  const renderContent = () => {
    switch (section) {
      case "basic":
        return (
          <BasicSection
            data={{
              ...initializedData,
              seniority: {
                ...initializedData.seniority,
                yearsExperience: initializedData.seniority.yearsExperience
              }
            }}
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
            data={(initializedData.schedule as {
              days: string[];
              timeZones: TimezoneCode[];
              flexibility: string[];
              minimumHours: {
                daily?: number;
                weekly?: number;
                monthly?: number;
              };
              startTime?: string;
              endTime?: string;
            }) || {
              days: [],
              timeZones: [] as TimezoneCode[],
              flexibility: [],
              minimumHours: {
                daily: undefined,
                weekly: undefined,
                monthly: undefined,
              },
              startTime: "09:00",
              endTime: "17:00"
            }}
            onChange={(scheduleData) => onChange({
              ...initializedData,
              seniority: {
                ...initializedData.seniority,
                yearsExperience: initializedData.seniority.yearsExperience
              },
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
            data={{
              ...initializedData,
              seniority: {
                ...initializedData.seniority,
                yearsExperience: initializedData.seniority.yearsExperience
              },
              commission: initializedData.commission || {
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
              }
            }}
            onChange={onChange}
            errors={errors}
            warnings={{}}
            onPrevious={() => onSectionChange?.('schedule')}
            onNext={() => onSectionChange?.('skills')}
          />
        );

      // case "leads":
      //   return (
      //     <LeadsSection
      //       data={initializedData.leads || {
      //         types: [
      //           { type: 'hot', percentage: 0, description: '', conversionRate: 0 },
      //           { type: 'warm', percentage: 0, description: '', conversionRate: 0 },
      //           { type: 'cold', percentage: 0, description: '', conversionRate: 0 }
      //         ],
      //         sources: []
      //       }}
      //       onChange={(leadsData) => onChange({
      //         ...initializedData,
      //         seniority: {
      //           ...initializedData.seniority,
      //           years: String(initializedData.seniority.yearsExperience)
      //         },
      //         leads: leadsData
      //       })}
      //       errors={errors}
      //       onPrevious={() => onSectionChange?.('commission')}
      //       onNext={() => onSectionChange?.('skills')}
      //     />
      //   );

      case "skills":
        return (
          <SkillsSection
            data={initializedData.skills || {
              languages: [],
              soft: [],
              professional: [],
              technical: [],
              certifications: []
            }}
            onChange={(skillsData) => onChange({
              ...initializedData,
              seniority: {
                ...initializedData.seniority,
                yearsExperience: initializedData.seniority.yearsExperience
              },
              skills: skillsData
            })}
            errors={errors}
            onPrevious={() => onSectionChange?.('leads')}
            onNext={() => onSectionChange?.('team')}
          />
        );

      case "team":
        return (
          <TeamStructure
            data={{
              ...initializedData,
              seniority: {
                ...initializedData.seniority,
                yearsExperience: initializedData.seniority.yearsExperience
              }
            }}
            onChange={onChange}
            errors={errors}
            onPrevious={() => onSectionChange?.('skills')}
            onNext={() => onSectionChange?.('docs')}
            currentSection={section}
          />
        );

      case "docs":
        console.log('SectionContent - Rendering DocumentationSection');
        return (
          <DocumentationSection
            data={initializedData.documentation}
            onChange={(newDocs) => onChange({
              ...initializedData,
              seniority: {
                ...initializedData.seniority,
                yearsExperience: initializedData.seniority.yearsExperience
              },
              documentation: newDocs
            })}
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
        return (
          <GigReview
            data={{
              ...initializedData,
              seniority: {
                ...initializedData.seniority,
                yearsExperience: initializedData.seniority.yearsExperience
              }
            }}
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

