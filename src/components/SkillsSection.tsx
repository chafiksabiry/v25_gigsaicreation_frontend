import React, { useState } from 'react';
import { InfoText } from './InfoText';
import { Languages, BookOpen, Laptop, Users, ArrowLeft, ArrowRight, Pencil } from 'lucide-react';
import { predefinedOptions } from '../lib/guidance';

interface SkillsSectionProps {
  data: {
    languages: Array<{ name: string; level: string } | string>;
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

  // State for editing
  const [editingIndex, setEditingIndex] = useState<{ type: string; index: number } | null>(null);
  const [newSkill, setNewSkill] = useState({ name: '', level: '' });
  const [addMode, setAddMode] = useState<{ type: string; active: boolean }>({ type: '', active: false });

  // Example options
  const languageOptions = [
    'English', 'French', 'Spanish', 'German', 'Italian', 'Arabic', 'Chinese', 'Russian', 'Portuguese', 'Dutch'
  ];
  const levelOptions = ['Beginner', 'Conversational', 'Professional', 'Native'];
  const professionalOptions = predefinedOptions.skills.professional;
  const technicalOptions = predefinedOptions.skills.technical;
  const softOptions = predefinedOptions.skills.soft;

  // Prevent duplicate skills
  const isDuplicate = (name: string, type: string, excludeIndex?: number) => {
    const skills = safeData[type as keyof typeof safeData] as string[];
    return skills.some((s, idx) => s === name && idx !== excludeIndex);
  };

  // Handlers
  const handleEdit = (type: string, idx: number) => {
    setEditingIndex({ type, index: idx });
    const skill = safeData[type as keyof typeof safeData][idx];
    if (type === 'languages') {
      if (typeof skill === 'string') {
        setNewSkill({ name: skill, level: '' });
      } else {
        if ('level' in skill) {
          setNewSkill({ name: skill.name, level: skill.level });
        } else {
          setNewSkill({ name: skill.name, level: '' });
        }
      }
    } else {
      setNewSkill({ name: typeof skill === 'string' ? skill : '', level: '' });
    }
  };

  const handleEditChange = (field: 'name' | 'level', value: string) => {
    setNewSkill({ ...newSkill, [field]: value });
  };

  const handleEditSave = () => {
    if (!editingIndex || !newSkill.name || isDuplicate(newSkill.name, editingIndex.type, editingIndex.index)) return;
    
    const updated = [...safeData[editingIndex.type as keyof typeof safeData]];
    if (editingIndex.type === 'languages') {
      updated[editingIndex.index] = { name: newSkill.name, level: newSkill.level };
    } else {
      updated[editingIndex.index] = newSkill.name;
    }
    
    onChange({ ...safeData, [editingIndex.type]: updated });
    setEditingIndex(null);
  };

  const handleEditCancel = () => {
    setEditingIndex(null);
  };

  const handleRemove = (type: string, idx: number) => {
    const updated = safeData[type as keyof typeof safeData].filter((_, i) => i !== idx);
    onChange({ ...safeData, [type]: updated });
    if (editingIndex?.index === idx) setEditingIndex(null);
  };

  // Add new skill
  const handleAdd = () => {
    if (!addMode.active || !newSkill.name || isDuplicate(newSkill.name, addMode.type)) return;

    let updated;
    if (addMode.type === 'languages') {
      updated = [...safeData.languages, { name: newSkill.name, level: newSkill.level }];
    } else {
      updated = [...safeData[addMode.type as keyof typeof safeData], newSkill.name];
    }
    onChange({ ...safeData, [addMode.type]: updated });
    setNewSkill({ name: '', level: '' });
    setAddMode({ type: '', active: false });
  };

  const renderSkillSection = (
    type: string,
    title: string,
    description: string,
    icon: React.ReactNode,
    options: string[],
    bgColor: string,
    iconColor: string,
    isLanguage: boolean = false
  ) => {
    const skills = safeData[type as keyof typeof safeData] as any[];
    const isEditing = editingIndex?.type === type;
    const isAdding = addMode.type === type && addMode.active;

    return (
      <div className={`bg-gradient-to-br from-${bgColor}-50 via-${bgColor}-50/30 to-${bgColor}-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-${bgColor}-100/50`}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2.5 bg-${bgColor}-100/80 rounded-lg shadow-inner`}>
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        {/* List */}
        <div className="mb-4 space-y-2">
          {skills.map((skill, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between p-3.5 mb-2 border transition-all duration-200 ${
                editingIndex?.index === idx 
                  ? `bg-${bgColor}-50/70 border-${bgColor}-300 shadow-sm ring-2 ring-${bgColor}-200` 
                  : 'bg-white border-blue-100 hover:border-blue-200 hover:shadow-sm'
              } rounded-lg group`}
            >
              {editingIndex?.index === idx ? (
                <div className="flex gap-3 items-center w-full">
                  <select
                    className={`border border-${bgColor}-300 focus:border-${bgColor}-500 focus:ring-2 focus:ring-${bgColor}-200 rounded-lg px-3.5 py-2 text-gray-700 text-sm outline-none transition-all w-40 bg-white`}
                    value={newSkill.name}
                    onChange={e => handleEditChange('name', e.target.value)}
                  >
                    <option value="">Select {type}</option>
                    {options.map(opt => (
                      <option key={opt} value={opt} disabled={isDuplicate(opt, type, editingIndex.index)}>{opt}</option>
                    ))}
                  </select>
                  {isLanguage && (
                    <select
                      className={`border border-${bgColor}-300 focus:border-${bgColor}-500 focus:ring-2 focus:ring-${bgColor}-200 rounded-lg px-3.5 py-2 text-gray-700 text-sm outline-none transition-all w-40 bg-white`}
                      value={newSkill.level}
                      onChange={e => handleEditChange('level', e.target.value)}
                    >
                      <option value="">Select level</option>
                      {levelOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}
                  <div className="flex gap-2 ml-4">
                    <button
                      className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-all duration-200 shadow-sm hover:shadow"
                      onClick={handleEditSave}
                    >
                      Save
                    </button>
                    <button
                      className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-all duration-200 shadow-sm hover:shadow"
                      onClick={handleEditCancel}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-700 text-base flex-1">
                    <span className="font-medium">{isLanguage ? skill.name : skill}</span>
                    {isLanguage && (
                      <>
                        <span className="mx-2 text-gray-400">-</span>
                        <span className="text-blue-600 font-medium">{skill.level}</span>
                      </>
                    )}
                  </p>
                  <div className="flex gap-2 items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      className={`p-2 text-${iconColor}-600 hover:bg-${iconColor}-100 rounded-lg transition-all duration-200 hover:scale-110`}
                      onClick={() => handleEdit(type, idx)}
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-all duration-200 hover:scale-110"
                      onClick={() => handleRemove(type, idx)}
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        {/* Add skill */}
        {isAdding ? (
          <div className="flex gap-3 items-center mb-2 bg-blue-50/70 border border-blue-200 rounded-lg p-3.5 shadow-sm">
            <select
              className={`border border-${bgColor}-300 focus:border-${bgColor}-500 focus:ring-2 focus:ring-${bgColor}-200 rounded-lg px-3.5 py-2 text-gray-700 text-sm outline-none transition-all w-40 bg-white`}
              value={newSkill.name}
              onChange={e => setNewSkill({ ...newSkill, name: e.target.value })}
            >
              <option value="">Select {type}</option>
              {options.map(opt => (
                <option key={opt} value={opt} disabled={isDuplicate(opt, type)}>{opt}</option>
              ))}
            </select>
            {isLanguage && (
              <select
                className={`border border-${bgColor}-300 focus:border-${bgColor}-500 focus:ring-2 focus:ring-${bgColor}-200 rounded-lg px-3.5 py-2 text-gray-700 text-sm outline-none transition-all w-40 bg-white`}
                value={newSkill.level}
                onChange={e => setNewSkill({ ...newSkill, level: e.target.value })}
              >
                <option value="">Select level</option>
                {levelOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}
            <button
              className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-all duration-200 shadow-sm hover:shadow"
              onClick={handleAdd}
            >
              Add
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-all duration-200 shadow-sm hover:shadow"
              onClick={() => { setAddMode({ type: '', active: false }); setNewSkill({ name: '', level: '' }); }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button 
            className={`text-${iconColor}-600 hover:text-${iconColor}-700 flex items-center gap-1.5 font-medium transition-colors duration-200 hover:underline`} 
            onClick={() => { setAddMode({ type, active: true }); setEditingIndex(null); setNewSkill({ name: '', level: '' }); }}
          >
            + Add {type} skill
          </button>
        )}
        {errors[type] && (
          <p className="mt-2 text-sm text-red-600">{errors[type].join(', ')}</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 via-white to-slate-50 rounded-2xl shadow-sm border border-slate-100">
      <InfoText>
        Define all required skills for the role, including languages, technical tools, and soft skills.
        Be specific about proficiency levels where applicable.
      </InfoText>

      <div className="grid grid-cols-1 gap-8">
        {/* Languages */}
        {renderSkillSection(
          'languages',
          'Languages',
          'Specify required languages and proficiency levels',
          <Languages className="w-5 h-5 text-blue-600" />,
          languageOptions,
          'blue',
          'blue',
          true
        )}

        {/* Professional Skills */}
        {renderSkillSection(
          'professional',
          'Professional Skills',
          'Add required professional and industry-specific skills',
          <BookOpen className="w-5 h-5 text-purple-600" />,
          professionalOptions,
          'purple',
          'purple'
        )}

        {/* Technical Skills */}
        {renderSkillSection(
          'technical',
          'Technical Skills',
          'Specify required technical tools and software proficiency',
          <Laptop className="w-5 h-5 text-emerald-600" />,
          technicalOptions,
          'emerald',
          'emerald'
        )}

        {/* Soft Skills */}
        {renderSkillSection(
          'soft',
          'Soft Skills',
          'Add interpersonal and communication skills',
          <Users className="w-5 h-5 text-orange-600" />,
          softOptions,
          'orange',
          'orange'
        )}
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