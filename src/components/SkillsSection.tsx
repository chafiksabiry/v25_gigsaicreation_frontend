import React from 'react';
import { InfoText } from './InfoText';
import { SkillSelector } from './SkillSelector';
import { predefinedOptions } from '../lib/guidance';
import { Languages, BookOpen, Laptop, Users, ArrowLeft, ArrowRight } from 'lucide-react';

interface SkillsSectionProps {
  data: {
    languages: Array<{ name: string; level: string }>;
    soft: string[];
    professional: string[];
    technical: string[];
    certifications: Array<{
      name: string;
      required: boolean;
      provider?: string;
    }>;
  };
  onChange: (data: any) => void;
  errors: { [key: string]: string[] };
  onNext?: () => void;
  onPrevious?: () => void;
}

export function SkillsSection({ data, onChange, errors, onNext, onPrevious }: SkillsSectionProps) {
  // Ensure data is never undefined and all properties are initialized
  const safeData = {
    languages: (data?.languages || []),
    soft: (data?.soft || []),
    professional: (data?.professional || []),
    technical: (data?.technical || []),
    certifications: (data?.certifications || [])
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 via-white to-slate-50 rounded-2xl shadow-sm border border-slate-100">
      <InfoText>
        Define all required skills for the role, including languages, technical tools, and soft skills.
        Be specific about proficiency levels where applicable.
      </InfoText>

      <div className="grid grid-cols-1 gap-8">
        {/* Languages */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50/30 to-blue-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 border border-blue-100/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100/80 rounded-lg shadow-inner">
              <Languages className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Languages</h3>
              <p className="text-sm text-gray-600">Specify required languages and proficiency levels</p>
            </div>
          </div>
          <SkillSelector
            skills={safeData.languages}
            onChange={(languages) => onChange({ ...safeData, languages })}
            type="language"
            showLevel={true}
          />
          {errors.languages && (
            <p className="mt-2 text-sm text-red-600">{errors.languages.join(', ')}</p>
          )}
        </div>

        {/* Professional Skills */}
        <div className="bg-gradient-to-br from-purple-50 via-pink-50/30 to-purple-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 border border-purple-100/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100/80 rounded-lg shadow-inner">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Professional Skills</h3>
              <p className="text-sm text-gray-600">Add required professional and industry-specific skills</p>
            </div>
          </div>
          <SkillSelector
            skills={safeData.professional.map(skill => ({ name: skill }))}
            onChange={(skills) => onChange({ ...safeData, professional: skills.map(s => s.name) })}
            type="professional"
          />
        </div>

        {/* Technical Skills */}
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50/30 to-emerald-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 border border-emerald-100/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-100/80 rounded-lg shadow-inner">
              <Laptop className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Technical Skills</h3>
              <p className="text-sm text-gray-600">Specify required technical tools and software proficiency</p>
            </div>
          </div>
          <SkillSelector
            skills={safeData.technical.map(skill => ({ name: skill }))}
            onChange={(skills) => onChange({ ...safeData, technical: skills.map(s => s.name) })}
            type="technical"
          />
        </div>

        {/* Soft Skills */}
        <div className="bg-gradient-to-br from-orange-50 via-amber-50/30 to-orange-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 border border-orange-100/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100/80 rounded-lg shadow-inner">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Soft Skills</h3>
              <p className="text-sm text-gray-600">Add interpersonal and communication skills</p>
            </div>
          </div>
          <SkillSelector
            skills={safeData.soft.map(skill => ({ name: skill }))}
            onChange={(skills) => onChange({ ...safeData, soft: skills.map(s => s.name) })}
            type="soft"
          />
        </div>
      </div>

      {/* Skill Summary */}
      {(safeData.languages.length > 0 || safeData.professional.length > 0 || 
        safeData.technical.length > 0 || safeData.soft.length > 0) && (
        <div className="mt-8 p-6 bg-white rounded-xl shadow-sm border border-slate-100">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Skills Summary</h4>
          <div className="space-y-3">
            {safeData.languages.length > 0 && (
              <div className="flex items-center gap-2 p-2 bg-blue-50/50 rounded-lg">
                <Languages className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">
                  {safeData.languages.length} language{safeData.languages.length > 1 ? 's' : ''} required
                </span>
              </div>
            )}
            {safeData.professional.length > 0 && (
              <div className="flex items-center gap-2 p-2 bg-purple-50/50 rounded-lg">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-gray-600">
                  {safeData.professional.length} professional skill{safeData.professional.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
            {safeData.technical.length > 0 && (
              <div className="flex items-center gap-2 p-2 bg-emerald-50/50 rounded-lg">
                <Laptop className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-gray-600">
                  {safeData.technical.length} technical skill{safeData.technical.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
            {safeData.soft.length > 0 && (
              <div className="flex items-center gap-2 p-2 bg-orange-50/50 rounded-lg">
                <Users className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-gray-600">
                  {safeData.soft.length} soft skill{safeData.soft.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={onPrevious}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
        >
          <ArrowLeft className="w-5 h-5" />
          Previous
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Next
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}