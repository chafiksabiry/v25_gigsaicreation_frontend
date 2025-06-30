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
import { DaySchedule } from "../lib/scheduleUtils";

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

  // Log section data when component renders
  React.useEffect(() => {
    console.log(`=== SECTION: ${section.toUpperCase()} ===`);
    console.log('Section Data:', data);
    console.log('Section Errors:', errors);
    console.log('========================');
  }, [section, data, errors]);

  const cleanSchedules = (schedules: DaySchedule[]): DaySchedule[] => {
    if (!schedules || schedules.length === 0) {
      return [];
    }
  
    const seen = new Set<string>();
    const cleaned: DaySchedule[] = [];
  
    schedules.forEach(schedule => {
      if (schedule && schedule.day && schedule.hours) {
        const key = `${schedule.day}-${schedule.hours.start}-${schedule.hours.end}`;
        if (!seen.has(key)) {
          seen.add(key);
          cleaned.push({
            day: schedule.day,
            hours: {
              start: schedule.hours.start,
              end: schedule.hours.end
            }
          });
        }
      }
    });
  
    return cleaned;
  };

  // Ensure seniority object is properly initialized
  const initializedData = React.useMemo(() => ({
    ...data,
    schedule: {
      schedules: cleanSchedules(data.schedule?.schedules || []),
      timeZones: data.schedule?.timeZones || [],
      flexibility: data.schedule?.flexibility || [],
      minimumHours: data.schedule?.minimumHours || {
        daily: undefined,
        weekly: undefined,
        monthly: undefined,
      },
      shifts: data.schedule?.shifts || []
    },
    seniority: {
      level: data.seniority?.level || '',
      yearsExperience: data.seniority?.yearsExperience || 0,
      aiGenerated: data.seniority?.aiGenerated,
    },
    skills: {
      professional: data.skills?.professional || [{
        skill: "Brand Identity Design",
        level: 1
      }],
      technical: data.skills?.technical || [{
        skill: "Adobe Illustrator",
        level: 1
      }],
      soft: data.skills?.soft || [{
        skill: "Communication",
        level: 1
      }],
      languages: data.skills?.languages || [{
        language: "English",
        proficiency: "C1",
        iso639_1: "en"
      }],
      certifications: data.skills?.certifications || []
    }
  }), [data]);

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
            data={initializedData.schedule ? {
              schedules: initializedData.schedule.schedules || [],
              timeZones: initializedData.schedule.timeZones as TimezoneCode[],
              flexibility: initializedData.schedule.flexibility || [],
              minimumHours: initializedData.schedule.minimumHours || {
                daily: undefined,
                weekly: undefined,
                monthly: undefined,
              }
            } : {
              schedules: [],
              timeZones: [] as TimezoneCode[],
              flexibility: [],
              minimumHours: {
                daily: undefined,
                weekly: undefined,
                monthly: undefined,
              }
            }}
            onChange={(scheduleData) => onChange({
              ...initializedData,
              schedule: {
                schedules: scheduleData.schedules,
                timeZones: scheduleData.timeZones,
                flexibility: scheduleData.flexibility,
                minimumHours: scheduleData.minimumHours,
              },
            })}
            onPrevious={() => onSectionChange?.('basic')}
            onNext={() => onSectionChange?.('commission')}
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
            data={initializedData.skills}
            onChange={(skillsData) => onChange({
              ...initializedData,
              seniority: {
                ...initializedData.seniority,
                yearsExperience: initializedData.seniority.yearsExperience
              },
              skills: {
                ...skillsData,
                languages: skillsData.languages.map((lang: string | { language: string; proficiency: string; iso639_1: string }) => ({
                  language: typeof lang === 'string' ? lang : lang.language,
                  proficiency: typeof lang === 'string' ? 'A1' : (lang.proficiency || 'A1'),
                  iso639_1: '' // This will be handled by the backend
                })),
                soft: skillsData.soft.map((skill: string | { skill: string; level: number }) => ({
                  skill: typeof skill === 'string' ? skill : skill.skill,
                  level: typeof skill === 'string' ? 1 : Number(skill.level)
                })),
                professional: skillsData.professional.map((skill: string | { skill: string; level: number }) => ({
                  skill: typeof skill === 'string' ? skill : skill.skill,
                  level: typeof skill === 'string' ? 1 : Number(skill.level)
                })),
                certifications: skillsData.certifications.map((cert: string | { name: string; required: boolean; provider?: string }) => ({
                  name: typeof cert === 'string' ? cert : cert.name,
                  required: typeof cert === 'string' ? true : cert.required,
                  provider: typeof cert === 'string' ? '' : cert.provider
                })),
                technical: skillsData.technical.map((skill: string | { skill: string; level: number }) => ({
                  skill: typeof skill === 'string' ? skill : skill.skill,
                  level: typeof skill === 'string' ? 1 : Number(skill.level)
                }))
              }
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
              onSectionChange?.(section);
            }}
            isSubmitting={false}
            onBack={() => {
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

