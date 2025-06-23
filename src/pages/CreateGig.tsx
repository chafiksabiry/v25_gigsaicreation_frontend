import React from 'react';
import { GigCreator } from '../components/GigCreator';
import BasicSection from '../components/BasicSection';
import { ScheduleSection } from '../components/ScheduleSection';
import { CommissionSection } from '../components/CommissionSection';
import { SkillsSection } from '../components/SkillsSection';
import { TeamStructure } from '../components/TeamStructure';
import { DocumentationSection } from '../components/DocumentationSection';
import { GigData } from '../types';
import { TimezoneCode } from '../lib/ai';

interface GigCreatorProps {
  data: GigData;
  onChange: (data: GigData) => void;
  errors: { [key: string]: string[] };
  onPrevious: () => void;
  onNext: () => void;
  onSave: () => void;
  onAIAssist: () => void;
  currentSection: string;
}

export function CreateGig() {
  console.log('CreateGig - Rendering');
  return (
    <div className="min-h-screen bg-gray-50">
      <GigCreator>
        {({
          data,
          onChange,
          errors,
          onPrevious,
          onNext,
          onSave,
          onAIAssist,
          currentSection
        }: GigCreatorProps) => {
          console.log('CreateGig - Current section:', currentSection);
          console.log('CreateGig - Current data:', data);
          
          switch (currentSection) {
            case 'basic':
              return (
                <BasicSection
                  data={data}
                  onChange={onChange}
                  errors={errors}
                  onPrevious={onPrevious}
                  onNext={onNext}
                  onSave={onSave}
                  onAIAssist={onAIAssist}
                  currentSection={currentSection}
                />
              );
            
            case 'schedule':
              return (
                <ScheduleSection
                  data={data.schedule ? {
                    schedules: data.schedule.schedules || [],
                    timeZones: data.schedule.timeZones as TimezoneCode[],
                    flexibility: data.schedule.flexibility || [],
                    minimumHours: data.schedule.minimumHours || {
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
                    ...data,
                    schedule: {
                      schedules: scheduleData.schedules,
                      timeZones: scheduleData.timeZones,
                      flexibility: scheduleData.flexibility,
                      minimumHours: scheduleData.minimumHours,
                    },
                  })}
                  errors={errors}
                  onPrevious={onPrevious}
                  onNext={onNext}
                />
              );
            
            case 'commission':
              return (
                <CommissionSection
                  data={data}
                  onChange={onChange}
                  errors={errors}
                  warnings={{}}
                  onPrevious={onPrevious}
                  onNext={onNext}
                />
              );
            
            case 'skills':
              return (
                <SkillsSection
                  data={data.skills}
                  onChange={(skillsData) => onChange({
                    ...data,
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
                  onPrevious={onPrevious}
                  onNext={onNext}
                />
              );
            
            case 'team':
              return (
                <TeamStructure
                  data={data}
                  onChange={onChange}
                  errors={errors}
                  onPrevious={onPrevious}
                  onNext={onNext}
                  currentSection={currentSection}
                />
              );
            
            case 'docs':
              return (
                <DocumentationSection
                  data={data.documentation}
                  onChange={(newDocs) => onChange({
                    ...data,
                    documentation: newDocs
                  })}
                  onPrevious={onPrevious}
                  onNext={onNext}
                  onReview={() => {
                    // This will trigger the review mode in GigCreator
                    console.log('CreateGig - Review requested');
                  }}
                  isLastSection={true}
                />
              );
            
            default:
              return null;
          }
        }}
      </GigCreator>
    </div>
  );
}

export default CreateGig; 