import React, { useEffect } from 'react';
import { InfoText } from './InfoText';
import { predefinedOptions } from '../lib/guidance';
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
  ArrowLeft,
  GraduationCap
} from "lucide-react";
import { GigData } from '../types';

interface BasicSectionProps {
  data: GigData;
  onChange: (data: GigData) => void;
  errors: { [key: string]: string[] };
  onPrevious?: () => void;
  onNext?: () => void;
  onSave?: () => void;
  onAIAssist?: () => void;
  onSectionChange?: (sectionId: string) => void;
  currentSection: string;
}

const BasicSection: React.FC<BasicSectionProps> = ({ 
  data, 
  onChange, 
  errors, 
  onPrevious, 
  onNext,
  onSave,
  onAIAssist,
  onSectionChange,
  currentSection = 'basic'
}) => {
  // Add Material Icons
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Get all categories including the one from data if it's not in predefined options
  const allCategories = React.useMemo(() => {
    const categories = new Set(predefinedOptions.basic.categories);
    if (data.category && !categories.has(data.category)) {
      categories.add(data.category);
    }
    return Array.from(categories);
  }, [data.category]);

  return (
    <div className="w-full bg-white p-6">
      {/* Header Navigation */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Create New Gig</h1>
        <div className="flex gap-3">
          <button 
            onClick={onSave}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg flex items-center gap-2 text-gray-700 hover:bg-gray-50"
          >
            <Save className="w-5 h-5" />
            Save Progress
          </button>
          <button 
            onClick={onAIAssist}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg flex items-center gap-2 text-gray-700 hover:bg-gray-50"
          >
            <Brain className="w-5 h-5 text-blue-600" />
            AI assist
          </button>
        </div>
      </div>

      {/* Guidance Section */}
      <div className="mb-8">
        <h2 className="flex items-center gap-2 text-lg font-medium text-gray-900 mb-4">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          Guidance for Basic Information
        </h2>
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">Steps:</span>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Enter a clear and descriptive title for the role</li>
              <li>Select the appropriate category</li>
              <li>Choose the seniority level</li>
              <li>Specify required years of experience</li>
            </ol>
          </div>
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">Tips:</span>
            </div>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Use industry-standard job titles for better visibility</li>
              <li>Be specific about the role category to attract the right candidates</li>
              <li>Match seniority level with experience requirements</li>
              <li>Consider both minimum and preferred experience levels</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="space-y-8">
        <InfoText>
          Start by providing the basic information about the contact center role. Be specific and clear
          about the position's requirements and responsibilities.
        </InfoText>

        {/* Title and Description */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Position Details</h3>
              <p className="text-sm text-gray-600">Define the role title and main responsibilities</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={data.title || ''}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  onChange({ ...data, title: newTitle });
                }}
                className={`mt-1 block w-full rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Senior Customer Service Representative"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.join(', ')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={data.description || ''}
                onChange={(e) => {
                  onChange({ ...data, description: e.target.value });
                }}
                rows={4}
                className={`mt-1 block w-full rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Describe the role, key responsibilities, and what success looks like in this position..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.join(', ')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Category */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Role Category</h3>
              <p className="text-sm text-gray-600">Select the primary focus area</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {allCategories.map((category) => (
              <button
                key={category}
                onClick={() => onChange({ ...data, category })}
                className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-200 ${
                  data.category === category
                    ? 'bg-purple-100 text-purple-700 border-2 border-purple-500 shadow-md scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-purple-200'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  data.category === category
                    ? 'bg-purple-600'
                    : 'border-2 border-gray-300'
                }`}>
                  {data.category === category && (
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  )}
                </div>
                <span className="flex-1 font-medium">{category}</span>
                {!predefinedOptions.basic.categories.includes(category) && (
                  <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                    New
                  </span>
                )}
              </button>
            ))}
          </div>
          {errors.category && (
            <p className="mt-2 text-sm text-red-600">{errors.category.join(', ')}</p>
          )}
        </div>

        {/* Seniority */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <GraduationCap className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Experience Level</h3>
              <p className="text-sm text-gray-600">Define seniority and experience requirements</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Seniority Level</label>
              <select
                value={data.seniority?.level || ''}
                onChange={(e) =>
                  onChange({
                    ...data,
                    seniority: { ...data.seniority, level: e.target.value }
                  })
                }
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Select seniority level</option>
                {predefinedOptions.basic.seniorityLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
              <input
                type="text"
                value={data.seniority?.yearsExperience || ''}
                onChange={(e) =>
                  onChange({
                    ...data,
                    seniority: { ...data.seniority, yearsExperience: e.target.value }
                  })
                }
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g., 2-3 years"
              />
            </div>
          </div>

          {data.seniority?.level && data.seniority?.yearsExperience && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-emerald-200">
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-emerald-600" />
                <div>
                  <span className="font-medium text-gray-900">{data.seniority.level}</span>
                  <span className="text-gray-600 mx-2">•</span>
                  <span className="text-gray-700">{data.seniority.yearsExperience} experience</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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
          onClick={() => {
            console.log('Next button clicked');
            if (onNext) {
              console.log('Calling onNext');
              onNext();
            } else {
              console.warn('onNext is not defined');
            }
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Next
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default BasicSection;