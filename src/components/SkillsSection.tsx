import React, { useState } from 'react';
import { InfoText } from './InfoText';
import { Languages, BookOpen, Laptop, Users, ArrowLeft, ArrowRight, Pencil } from 'lucide-react';

interface SkillsSectionProps {
  data: {
    languages: Array<{
      language: string;
      proficiency: string;
      iso639_1: string;
    }>;
    soft: Array<{
      skill: string;
      level: number;
    }>;
    professional: Array<{
      skill: string;
      level: number;
    }>;
    technical: Array<{
      skill: string;
      level: number;
    }>;
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

// Language levels from Suggestions.tsx
const LANGUAGE_LEVELS = [
  { value: "A1", label: "A1 - Beginner" },
  { value: "A2", label: "A2 - Elementary" },
  { value: "B1", label: "B1 - Intermediate" },
  { value: "B2", label: "B2 - Upper Intermediate" },
  { value: "C1", label: "C1 - Advanced" },
  { value: "C2", label: "C2 - Mastery" },
];

// Skill levels from Suggestions.tsx
const SKILL_LEVELS = [
  { value: 1, label: "Basic" },
  { value: 2, label: "Intermediate" },
  { value: 3, label: "Advanced" },
  { value: 4, label: "Expert" },
  { value: 5, label: "Master" },
];

// Languages from Suggestions.tsx
const LANGUAGES = [
  "English",
  "French",
  "Spanish",
  "German",
  "Italian",
  "Portuguese",
  "Dutch",
  "Russian",
  "Chinese (Mandarin)",
  "Japanese",
  "Korean",
  "Arabic",
  "Hindi",
  "Turkish",
  "Polish",
  "Swedish",
  "Norwegian",
  "Danish",
  "Finnish",
  "Greek",
  "Hebrew",
  "Thai",
  "Vietnamese",
  "Indonesian",
  "Malay",
  "Filipino",
  "Urdu",
  "Bengali",
  "Persian",
  "Czech",
  "Hungarian",
  "Romanian",
  "Bulgarian",
  "Croatian",
  "Serbian",
  "Slovak",
  "Slovenian",
  "Estonian",
  "Latvian",
  "Lithuanian",
];

// Professional skills from Suggestions.tsx
const PROFESSIONAL_SKILLS = [
  "Sales Management",
  "Account Management",
  "Customer Relationship Management",
  "Lead Generation",
  "Market Research",
  "Business Development",
  "Strategic Planning",
  "Project Management",
  "Team Leadership",
  "Negotiation",
  "Presentation Skills",
  "Client Communication",
  "Contract Management",
  "Budget Management",
  "Performance Analysis",
  "Process Improvement",
  "Quality Assurance",
  "Compliance Management",
  "Risk Assessment",
  "Stakeholder Management",
  "Vendor Management",
  "Supply Chain Management",
  "Inventory Management",
  "Logistics Coordination",
  "Event Planning",
  "Public Relations",
  "Brand Management",
  "Digital Marketing",
  "Content Strategy",
  "Social Media Management",
];

// Technical skills from Suggestions.tsx
const TECHNICAL_SKILLS = [
  "CRM Systems (Salesforce, HubSpot)",
  "Microsoft Office Suite",
  "Google Workspace",
  "Data Analysis",
  "Excel Advanced Functions",
  "Power BI",
  "Tableau",
  "SQL",
  "Python",
  "JavaScript",
  "HTML/CSS",
  "WordPress",
  "Shopify",
  "Zendesk",
  "Intercom",
  "LiveChat",
  "Freshdesk",
  "Help Scout",
  "Zapier",
  "Integromat",
  "API Integration",
  "Web Scraping",
  "SEO Tools",
  "Google Analytics",
  "Google Ads",
  "Facebook Ads",
  "LinkedIn Ads",
  "Email Marketing Platforms",
  "Video Editing",
  "Graphic Design",
  "Adobe Creative Suite",
  "Canva",
  "Figma",
  "Sketch",
  "Video Conferencing Tools",
  "Project Management Tools",
  "Accounting Software",
  "E-commerce Platforms",
  "Payment Processing",
  "Cybersecurity",
];

// Soft skills from Suggestions.tsx
const SOFT_SKILLS = [
  "Communication",
  "Active Listening",
  "Empathy",
  "Problem Solving",
  "Critical Thinking",
  "Creativity",
  "Adaptability",
  "Flexibility",
  "Time Management",
  "Organization",
  "Attention to Detail",
  "Multitasking",
  "Stress Management",
  "Conflict Resolution",
  "Teamwork",
  "Collaboration",
  "Leadership",
  "Mentoring",
  "Coaching",
  "Motivation",
  "Initiative",
  "Self-motivation",
  "Reliability",
  "Dependability",
  "Professionalism",
  "Customer Service",
  "Patience",
  "Tolerance",
  "Cultural Awareness",
  "Interpersonal Skills",
  "Networking",
  "Public Speaking",
  "Presentation Skills",
  "Persuasion",
  "Influence",
  "Decision Making",
  "Judgment",
  "Analytical Thinking",
  "Strategic Thinking",
  "Innovation",
];

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
  const [newSkill, setNewSkill] = useState({ language: '', proficiency: '', iso639_1: '', level: 1 });
  const [addMode, setAddMode] = useState<{ type: string; active: boolean }>({ type: '', active: false });

  // Language options with ISO codes
  const languageOptions = LANGUAGES.map(lang => {
    // Map common languages to ISO codes
    const isoMap: { [key: string]: string } = {
      'English': 'en',
      'French': 'fr',
      'Spanish': 'es',
      'German': 'de',
      'Italian': 'it',
      'Portuguese': 'pt',
      'Dutch': 'nl',
      'Russian': 'ru',
      'Chinese (Mandarin)': 'zh',
      'Japanese': 'ja',
      'Korean': 'ko',
      'Arabic': 'ar',
      'Hindi': 'hi',
      'Turkish': 'tr',
      'Polish': 'pl',
      'Swedish': 'sv',
      'Norwegian': 'no',
      'Danish': 'da',
      'Finnish': 'fi',
      'Greek': 'el',
      'Hebrew': 'he',
      'Thai': 'th',
      'Vietnamese': 'vi',
      'Indonesian': 'id',
      'Malay': 'ms',
      'Filipino': 'fil',
      'Urdu': 'ur',
      'Bengali': 'bn',
      'Persian': 'fa',
      'Czech': 'cs',
      'Hungarian': 'hu',
      'Romanian': 'ro',
      'Bulgarian': 'bg',
      'Croatian': 'hr',
      'Serbian': 'sr',
      'Slovak': 'sk',
      'Slovenian': 'sl',
      'Estonian': 'et',
      'Latvian': 'lv',
      'Lithuanian': 'lt'
    };
    return {
      language: lang,
      iso639_1: isoMap[lang] || 'en'
    };
  });

  // Function to get level label
  const getLevelLabel = (level: number) => {
    const option = SKILL_LEVELS.find(opt => opt.value === level);
    return option ? option.label : 'Unknown';
  };

  const getLanguageLevelLabel = (proficiency: string) => {
    const option = LANGUAGE_LEVELS.find(opt => opt.value === proficiency);
    return option ? option.label : proficiency;
  };

  // Prevent duplicate skills
  const isDuplicate = (name: string, type: string, excludeIndex?: number) => {
    if (type === 'languages') {
      const languages = safeData.languages;
      return languages.some((lang, idx) => lang.language === name && idx !== excludeIndex);
    }
    const skills = safeData[type as keyof typeof safeData];
    return skills.some((s: any, idx) => {
      if (typeof s === 'string') return s === name;
      return s.skill === name || s.name === name;
    });
  };

  // Handlers
  const handleEdit = (type: string, idx: number) => {
    setEditingIndex({ type, index: idx });
    const skill = safeData[type as keyof typeof safeData][idx];
    if (type === 'languages') {
      const languageSkill = skill as { language: string; proficiency: string; iso639_1: string };
      setNewSkill({
        language: languageSkill.language,
        proficiency: languageSkill.proficiency,
        iso639_1: languageSkill.iso639_1,
        level: 1
      });
    } else {
      // Handle non-language skills with proper typing
      const skillObj = typeof skill === 'string' ? { skill: skill, level: 1 } : skill as { skill: string; level: number };
      setNewSkill({ 
        language: skillObj.skill || '', 
        proficiency: '', 
        iso639_1: '',
        level: skillObj.level || 1
      });
    }
  };

  const handleEditChange = (field: 'language' | 'proficiency' | 'iso639_1' | 'level', value: string | number) => {
    setNewSkill({ ...newSkill, [field]: value });
    console.log('newSkill after change:', { ...newSkill, [field]: value });
  };

  const handleEditSave = () => {
    if (!editingIndex || !newSkill.language) return;
    
    // Check for duplicates only if the language/skill name has changed
    const currentSkill = safeData[editingIndex.type as keyof typeof safeData][editingIndex.index];
    let nameChanged = false;
    
    if (editingIndex.type === 'languages') {
      const languageSkill = currentSkill as { language: string; proficiency: string; iso639_1: string };
      nameChanged = languageSkill.language !== newSkill.language;
    } else {
      const skillObj = currentSkill as { skill: string; level: number };
      nameChanged = skillObj.skill !== newSkill.language;
    }
    
    if (nameChanged && isDuplicate(newSkill.language, editingIndex.type, editingIndex.index)) return;
    
    const updated = [...safeData[editingIndex.type as keyof typeof safeData]];
    if (editingIndex.type === 'languages') {
      updated[editingIndex.index] = {
        language: newSkill.language,
        proficiency: newSkill.proficiency,
        iso639_1: newSkill.iso639_1
      };
    } else {
      updated[editingIndex.index] = {
        skill: newSkill.language,
        level: newSkill.level
      };
    }
    
    console.log('updated before onChange:', updated);
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
    if (!addMode.active || !newSkill.language || isDuplicate(newSkill.language, addMode.type)) return;

    let updated;
    if (addMode.type === 'languages') {
      updated = [...safeData.languages, {
        language: newSkill.language,
        proficiency: newSkill.proficiency,
        iso639_1: newSkill.iso639_1
      }];
    } else {
      updated = [...safeData[addMode.type as keyof typeof safeData], {
        skill: newSkill.language,
        level: newSkill.level
      }];
    }
    onChange({ ...safeData, [addMode.type]: updated });
    setNewSkill({ language: '', proficiency: '', iso639_1: '', level: 1 });
    setAddMode({ type: '', active: false });
  };

  const renderSkillSection = (
    type: string,
    title: string,
    description: string,
    icon: React.ReactNode,
    options: any[],
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
                editingIndex?.type === type && editingIndex?.index === idx && !addMode.active
                  ? `bg-${bgColor}-50/70 border-${bgColor}-300 shadow-sm ring-2 ring-${bgColor}-200` 
                  : 'bg-white border-blue-100 hover:border-blue-200 hover:shadow-sm'
              } rounded-lg group`}
            >
              {editingIndex?.type === type && editingIndex?.index === idx && !addMode.active ? (
                <div className="flex gap-3 items-center w-full">
                  <select
                    className={`border border-${bgColor}-300 focus:border-${bgColor}-500 focus:ring-2 focus:ring-${bgColor}-200 rounded-lg px-3.5 py-2 text-gray-700 text-sm outline-none transition-all w-40 bg-white`}
                    value={newSkill.language}
                    onChange={e => {
                      if (isLanguage) {
                        const selected = languageOptions.find(opt => opt.language === e.target.value);
                        if (selected) {
                          setNewSkill({
                            ...newSkill,
                            language: selected.language,
                            iso639_1: selected.iso639_1
                          });
                          console.log('newSkill after change:', {
                            ...newSkill,
                            language: selected.language,
                            iso639_1: selected.iso639_1
                          });
                        } else {
                          handleEditChange('language', e.target.value);
                        }
                      } else {
                        handleEditChange('language', e.target.value);
                      }
                    }}
                  >
                    <option value="">{isLanguage ? 'Select language' : 'Select skill'}</option>
                    {isLanguage ? (
                      languageOptions.map(opt => (
                        <option key={opt.iso639_1} value={opt.language} disabled={isDuplicate(opt.language, type, editingIndex.index)}>
                          {opt.language}
                        </option>
                      ))
                    ) : (
                      options.map(opt => {
                        // Ne disable que si c'est un doublon ET que ce n'est pas la valeur actuelle
                        const isCurrent = (skills[editingIndex?.index ?? -1]?.skill === opt);
                        return (
                          <option
                            key={opt}
                            value={opt}
                            disabled={isDuplicate(opt, type, editingIndex?.index) && !isCurrent}
                          >
                            {opt}
                          </option>
                        );
                      })
                    )}
                  </select>
                  {isLanguage && (
                    <select
                      className={`border border-${bgColor}-300 focus:border-${bgColor}-500 focus:ring-2 focus:ring-${bgColor}-200 rounded-lg px-3.5 py-2 text-gray-700 text-sm outline-none transition-all w-40 bg-white`}
                      value={newSkill.proficiency}
                      onChange={e => handleEditChange('proficiency', e.target.value)}
                    >
                      <option value="">Select level</option>
                      {LANGUAGE_LEVELS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  )}
                  {!isLanguage && (
                    <select
                      className={`border border-${bgColor}-300 focus:border-${bgColor}-500 focus:ring-2 focus:ring-${bgColor}-200 rounded-lg px-3.5 py-2 text-gray-700 text-sm outline-none transition-all w-40 bg-white`}
                      value={newSkill.level}
                      onChange={e => handleEditChange('level', parseInt(e.target.value))}
                    >
                      {SKILL_LEVELS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
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
                    <span className="font-medium">
                      {isLanguage 
                        ? skill.language 
                        : (typeof skill === 'string' 
                            ? skill 
                            : skill.skill || skill.name || '')}
                    </span>
                    {isLanguage && (
                      <>
                        <span className="mx-2 text-gray-400">-</span>
                        <span className="text-blue-600 font-medium">{getLanguageLevelLabel(skill.proficiency)}</span>
                      </>
                    )}
                    {!isLanguage && typeof skill === 'object' && skill.level && (
                      <>
                        <span className="mx-2 text-gray-400">-</span>
                        <span className="text-blue-600 font-medium">{getLevelLabel(skill.level)}</span>
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
              value={newSkill.language}
              onChange={e => {
                if (isLanguage) {
                  const selected = languageOptions.find(opt => opt.language === e.target.value);
                  if (selected) {
                    setNewSkill({
                      ...newSkill,
                      language: selected.language,
                      iso639_1: selected.iso639_1
                    });
                    console.log('newSkill after change:', {
                      ...newSkill,
                      language: selected.language,
                      iso639_1: selected.iso639_1
                    });
                  } else {
                    handleEditChange('language', e.target.value);
                  }
                } else {
                  handleEditChange('language', e.target.value);
                }
              }}
            >
              <option value="">{isLanguage ? 'Select language' : 'Select skill'}</option>
              {isLanguage ? (
                languageOptions.map(opt => (
                  <option key={opt.iso639_1} value={opt.language} disabled={isDuplicate(opt.language, type)}>
                    {opt.language}
                  </option>
                ))
              ) : (
                options.map(opt => {
                  // Ne disable que si c'est un doublon ET que ce n'est pas la valeur actuelle
                  const isCurrent = (skills[editingIndex?.index ?? -1]?.skill === opt);
                  return (
                    <option
                      key={opt}
                      value={opt}
                      disabled={isDuplicate(opt, type, editingIndex?.index) && !isCurrent}
                    >
                      {opt}
                    </option>
                  );
                })
              )}
            </select>
            {isLanguage && (
              <select
                className={`border border-${bgColor}-300 focus:border-${bgColor}-500 focus:ring-2 focus:ring-${bgColor}-200 rounded-lg px-3.5 py-2 text-gray-700 text-sm outline-none transition-all w-40 bg-white`}
                value={newSkill.proficiency}
                onChange={e => setNewSkill({ ...newSkill, proficiency: e.target.value })}
              >
                <option value="">Select level</option>
                {LANGUAGE_LEVELS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            )}
            {!isLanguage && (
              <select
                className={`border border-${bgColor}-300 focus:border-${bgColor}-500 focus:ring-2 focus:ring-${bgColor}-200 rounded-lg px-3.5 py-2 text-gray-700 text-sm outline-none transition-all w-40 bg-white`}
                value={newSkill.level}
                onChange={e => setNewSkill({ ...newSkill, level: parseInt(e.target.value) })}
              >
                {SKILL_LEVELS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
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
              onClick={() => { setAddMode({ type: '', active: false }); setNewSkill({ language: '', proficiency: '', iso639_1: '', level: 1 }); }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button 
            className={`text-${iconColor}-600 hover:text-${iconColor}-700 flex items-center gap-1.5 font-medium transition-colors duration-200 hover:underline`} 
            onClick={() => { setAddMode({ type, active: true }); setEditingIndex(null); setNewSkill({ language: '', proficiency: '', iso639_1: '', level: 1 }); }}
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
          PROFESSIONAL_SKILLS,
          'purple',
          'purple'
        )}

        {/* Technical Skills */}
        {renderSkillSection(
          'technical',
          'Technical Skills',
          'Specify required technical tools and software proficiency',
          <Laptop className="w-5 h-5 text-emerald-600" />,
          TECHNICAL_SKILLS,
          'emerald',
          'emerald'
        )}

        {/* Soft Skills */}
        {renderSkillSection(
          'soft',
          'Soft Skills',
          'Add interpersonal and communication skills',
          <Users className="w-5 h-5 text-orange-600" />,
          SOFT_SKILLS,
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