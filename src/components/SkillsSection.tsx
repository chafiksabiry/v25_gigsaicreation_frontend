import React, { useState, useEffect } from 'react';
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
      skill: { $oid: string }; // MongoDB ObjectId format for mongoose.Types.ObjectId
      level: number;
      details: string; // Added details field to match backend
    }>;
    professional: Array<{
      skill: { $oid: string }; // MongoDB ObjectId format for mongoose.Types.ObjectId
      level: number;
      details: string; // Added details field to match backend
    }>;
    technical: Array<{
      skill: { $oid: string }; // MongoDB ObjectId format for mongoose.Types.ObjectId
      level: number;
      details: string; // Added details field to match backend
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

// Skills will be loaded from APIs

export function SkillsSection({ data, onChange, errors, onNext, onPrevious }: SkillsSectionProps) {
  // API data states
  const [professionalSkills, setProfessionalSkills] = useState<Array<{_id: string, name: string, description: string, category: string}>>([]);
  const [softSkills, setSoftSkills] = useState<Array<{_id: string, name: string, description: string, category: string}>>([]);
  const [technicalSkills, setTechnicalSkills] = useState<Array<{_id: string, name: string, description: string, category: string}>>([]);
  const [loadingSkills, setLoadingSkills] = useState({
    professional: false,
    soft: false,
    technical: false
  });
  const [errorSkills, setErrorSkills] = useState({
    professional: false,
    soft: false,
    technical: false
  });

  // Ensure data is never undefined and all properties are initialized
  const safeData = {
    languages: (data?.languages || []),
    soft: (data?.soft || []),
    professional: (data?.professional || []),
    technical: (data?.technical || []),
    certifications: (data?.certifications || [])
  };

  // Load skills from APIs
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        // Fetch professional skills
        setLoadingSkills(prev => ({ ...prev, professional: true }));
        setErrorSkills(prev => ({ ...prev, professional: false }));
        const professionalResponse = await fetch('https://api-repcreationwizard.harx.ai/api/skills/professional');
        if (professionalResponse.ok) {
          const professionalData = await professionalResponse.json();
          setProfessionalSkills(professionalData.data || []);
        } else {
          setErrorSkills(prev => ({ ...prev, professional: true }));
        }
        setLoadingSkills(prev => ({ ...prev, professional: false }));

        // Fetch soft skills
        setLoadingSkills(prev => ({ ...prev, soft: true }));
        setErrorSkills(prev => ({ ...prev, soft: false }));
        const softResponse = await fetch('https://api-repcreationwizard.harx.ai/api/skills/soft');
        if (softResponse.ok) {
          const softData = await softResponse.json();
          setSoftSkills(softData.data || []);
        } else {
          setErrorSkills(prev => ({ ...prev, soft: true }));
        }
        setLoadingSkills(prev => ({ ...prev, soft: false }));

        // Fetch technical skills
        setLoadingSkills(prev => ({ ...prev, technical: true }));
        setErrorSkills(prev => ({ ...prev, technical: false }));
        const technicalResponse = await fetch('https://api-repcreationwizard.harx.ai/api/skills/technical');
        if (technicalResponse.ok) {
          const technicalData = await technicalResponse.json();
          setTechnicalSkills(technicalData.data || []);
        } else {
          setErrorSkills(prev => ({ ...prev, technical: true }));
        }
        setLoadingSkills(prev => ({ ...prev, technical: false }));
      } catch (error) {
        console.error('Error fetching skills:', error);
        setLoadingSkills({ professional: false, soft: false, technical: false });
        setErrorSkills({ professional: true, soft: true, technical: true });
      }
    };

    fetchSkills();
  }, []);

  // Migrate skills to ObjectId format if needed
  const migrateSkillsToObjectIds = () => {
    let needsUpdate = false;
    const migratedData = { ...safeData };
    
    ['soft', 'professional', 'technical'].forEach(type => {
      const skillArray = migratedData[type as keyof typeof migratedData];
      if (skillArray && Array.isArray(skillArray)) {
        const migratedSkills = skillArray.map((skill: any) => {
          // Helper function to find skill by name
          const findSkillByName = (skillName: string, skillType: string) => {
            let skillArray: Array<{_id: string, name: string, description: string, category: string}>;
            switch (skillType) {
              case 'soft': skillArray = softSkills; break;
              case 'professional': skillArray = professionalSkills; break;
              case 'technical': skillArray = technicalSkills; break;
              default: skillArray = [];
            }
            
            // Try exact match first
            let found = skillArray.find(s => s.name === skillName);
            
            // If not found, try case-insensitive match
            if (!found) {
              found = skillArray.find(s => s.name.toLowerCase() === skillName.toLowerCase());
            }
            
            // If still not found, try partial match
            if (!found) {
              found = skillArray.find(s => 
                s.name.toLowerCase().includes(skillName.toLowerCase()) ||
                skillName.toLowerCase().includes(s.name.toLowerCase())
              );
            }
            
            return found;
          };

          // If skill is a string, convert to ObjectId format
          if (typeof skill === 'string') {
            console.log(`🔄 Migrating string skill "${skill}" to ObjectId format`);
            const foundSkill = findSkillByName(skill, type);
            if (foundSkill) {
              console.log(`✅ Found skill "${skill}" in database with ID: ${foundSkill._id}`);
              needsUpdate = true;
              return { 
                skill: { $oid: foundSkill._id }, 
                level: 1,
                details: foundSkill.description || 'Migrated from string'
              };
            } else {
              console.log(`⚠️ Skill "${skill}" not found in database - removing`);
              return null; // Remove skills that don't exist in database
            }
          }
          
          // If skill.skill is a string, convert to ObjectId format
          if (skill && typeof skill.skill === 'string') {
            console.log(`🔄 Migrating skill.skill string "${skill.skill}" to ObjectId format`);
            const foundSkill = findSkillByName(skill.skill, type);
            if (foundSkill) {
              console.log(`✅ Found skill "${skill.skill}" in database with ID: ${foundSkill._id}`);
              needsUpdate = true;
              return { 
                ...skill, 
                skill: { $oid: foundSkill._id },
                details: skill.details || foundSkill.description || 'Migrated from string'
              };
            } else {
              console.log(`⚠️ Skill "${skill.skill}" not found in database - removing`);
              return null; // Remove skills that don't exist in database
            }
          }
          
          return skill;
        }).filter(Boolean); // Remove null entries
        (migratedData as any)[type] = migratedSkills;
      }
    });
    
    if (needsUpdate) {
      console.log('🔄 Migrating skills to ObjectId format');
      onChange(migratedData);
    }
  };

  // Run migration when component mounts or when skills are loaded
  useEffect(() => {
    if (professionalSkills.length > 0 || softSkills.length > 0 || technicalSkills.length > 0) {
      migrateSkillsToObjectIds();
    }
  }, [professionalSkills, softSkills, technicalSkills]);

  // Log Skills Section data
  React.useEffect(() => {
    console.log('=== SKILLS SECTION DATA ===');
    console.log('Skills Data:', {
      languages: safeData.languages,
      soft: safeData.soft,
      professional: safeData.professional,
      technical: safeData.technical,
      certifications: safeData.certifications
    });
    console.log('API Skills:', {
      professional: professionalSkills,
      soft: softSkills,
      technical: technicalSkills
    });
    console.log('Skills Errors:', errors);
    console.log('========================');
  }, [safeData, errors, professionalSkills, softSkills, technicalSkills]);

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
    const skills = safeData[type as keyof typeof safeData];
    return skills.some((s: any, i: number) => {
      if (excludeIndex !== undefined && i === excludeIndex) return false;
      if (type === 'languages') {
        return s.language === name;
      } else {
        // For skills, handle both ObjectId format and string format
        let skillId = null;
        
        if (typeof s === 'string') {
          // Handle case where skill is still a string (not yet migrated)
          skillId = s;
        } else if (typeof s === 'object' && s !== null && 'skill' in s) {
          if (typeof s.skill === 'string') {
            // Handle case where skill.skill is still a string (not yet migrated)
            skillId = s.skill;
          } else if (typeof s.skill === 'object' && s.skill.$oid) {
            // Handle ObjectId format
            skillId = s.skill.$oid;
          }
        }
        
        return skillId === name;
      }
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
      // Handle non-language skills - support both ObjectId format and string format
      let skillId = '';
      let skillLevel = 1;
      
      if (typeof skill === 'string') {
        // Handle case where skill is still a string (not yet migrated)
        skillId = skill;
        skillLevel = 1;
      } else if (typeof skill === 'object' && skill !== null) {
        // Type guard to check if it's a skill object
        if ('skill' in skill && skill.skill) {
          if (typeof skill.skill === 'string') {
            // Handle case where skill.skill is still a string (not yet migrated)
            skillId = skill.skill;
            skillLevel = (skill as any).level || 1;
          } else if (typeof skill.skill === 'object' && skill.skill.$oid) {
            // Handle ObjectId format
            skillId = skill.skill.$oid;
            skillLevel = (skill as any).level || 1;
          }
        }
      }
      
      setNewSkill({ 
        language: skillId, 
        proficiency: '', 
        iso639_1: '',
        level: skillLevel
      });
    }
  };

  const handleEditChange = (field: 'language' | 'proficiency' | 'iso639_1' | 'level', value: string | number) => {
    setNewSkill({ ...newSkill, [field]: value });
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
      // Handle skills - support both ObjectId format and string format
      let currentSkillId = '';
      
      if (typeof currentSkill === 'string') {
        currentSkillId = currentSkill;
      } else if (typeof currentSkill === 'object' && currentSkill !== null && 'skill' in currentSkill) {
        if (typeof currentSkill.skill === 'string') {
          currentSkillId = currentSkill.skill;
        } else if (typeof currentSkill.skill === 'object' && currentSkill.skill.$oid) {
          currentSkillId = currentSkill.skill.$oid;
        }
      }
      
      nameChanged = currentSkillId !== newSkill.language;
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
      // For skills, we need to find the skill object to get both ID and name
      const skillOptions = editingIndex.type === 'professional' ? professionalSkills : 
                          editingIndex.type === 'technical' ? technicalSkills : softSkills;
      const selectedSkill = skillOptions.find(s => s._id === newSkill.language);
      
      if (selectedSkill) {
        updated[editingIndex.index] = {
          skill: { $oid: selectedSkill._id }, // Store MongoDB ObjectId format
          level: newSkill.level,
          details: selectedSkill.description || '' // Add details field
        };
      } else {
        // Don't update with skills that don't exist in the database
        console.log(`❌ Skill not found in database during update: "${newSkill.language}". Skipping update.`);
        return; // Exit early without updating the skill
      }
    }
    
    onChange({ ...safeData, [editingIndex.type]: updated });
    setEditingIndex(null);
  };

  const handleEditCancel = () => {
    setEditingIndex(null);
  };

  const handleRemove = (type: string, idx: number) => {
    const updated = safeData[type as keyof typeof safeData].filter((_: any, i: number) => i !== idx);
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
      // For skills, we need to find the skill object to get both ID and name
      const skillOptions = addMode.type === 'professional' ? professionalSkills : 
                          addMode.type === 'technical' ? technicalSkills : softSkills;
      const selectedSkill = skillOptions.find(s => s._id === newSkill.language);
      
      if (selectedSkill) {
        updated = [...safeData[addMode.type as keyof typeof safeData], {
          skill: { $oid: selectedSkill._id }, // Store MongoDB ObjectId format
          level: newSkill.level,
          details: selectedSkill.description || '' // Add details field
        }];
      } else {
        // Don't add skills that don't exist in the database
        console.log(`❌ Skill not found in database: "${newSkill.language}". Skipping addition.`);
        return; // Exit early without adding the skill
      }
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
    bgColor: string,
    iconColor: string,
    isLanguage: boolean = false
  ) => {
    const skills = safeData[type as keyof typeof safeData] as any[];
    const isEditing = editingIndex?.type === type;
    const isAdding = addMode.type === type && addMode.active;
    
    // Get the appropriate skills array based on type
    let options: Array<{_id: string, name: string, description: string, category: string}> = [];
    let isLoading = false;
    let hasError = false;
    
    if (isLanguage) {
      // For languages, we still use the static LANGUAGES array
      options = LANGUAGES.map(lang => ({ _id: lang, name: lang, description: '', category: 'language' }));
    } else {
      switch (type) {
        case 'professional':
          options = professionalSkills;
          isLoading = loadingSkills.professional;
          hasError = errorSkills.professional;
          break;
        case 'technical':
          options = technicalSkills;
          isLoading = loadingSkills.technical;
          hasError = errorSkills.technical;
          break;
        case 'soft':
          options = softSkills;
          isLoading = loadingSkills.soft;
          hasError = errorSkills.soft;
          break;
        default:
          options = [];
      }
    }

    return (
      <div className={`bg-gradient-to-br from-${bgColor}-50 via-${bgColor}-50/30 to-${bgColor}-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-${bgColor}-100/50`}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2.5 bg-${bgColor}-100/80 rounded-lg shadow-inner`}>
            {icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {isLoading && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <div className="w-3 h-3 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </div>
              )}
              {hasError && !isLoading && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-red-500">⚠️ Failed to load skills</span>
                  <button
                    onClick={() => {
                      const fetchSkills = async () => {
                        try {
                          setLoadingSkills(prev => ({ ...prev, [type]: true }));
                          setErrorSkills(prev => ({ ...prev, [type]: false }));
                          const response = await fetch(`https://api-repcreationwizard.harx.ai/api/skills/${type}`);
                          if (response.ok) {
                            const data = await response.json();
                            const setter = type === 'professional' ? setProfessionalSkills : 
                                         type === 'technical' ? setTechnicalSkills : setSoftSkills;
                            setter(data.data || []);
                          } else {
                            setErrorSkills(prev => ({ ...prev, [type]: true }));
                          }
                          setLoadingSkills(prev => ({ ...prev, [type]: false }));
                        } catch (error) {
                          console.error(`Error fetching ${type} skills:`, error);
                          setLoadingSkills(prev => ({ ...prev, [type]: false }));
                          setErrorSkills(prev => ({ ...prev, [type]: true }));
                        }
                      };
                      fetchSkills();
                    }}
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
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
                        } else {
                          handleEditChange('language', e.target.value);
                        }
                                              } else {
                          // For skills, store the ObjectId
                          const selectedSkill = options.find(opt => opt._id === e.target.value);
                          if (selectedSkill) {
                            setNewSkill({
                              ...newSkill,
                              language: selectedSkill._id // Store ObjectId
                            });
                          }
                        }
                    }}
                    disabled={isLoading}
                  >
                    <option value="">{isLoading ? 'Loading...' : (isLanguage ? 'Select language' : 'Select skill')}</option>
                    {isLanguage ? (
                      languageOptions.map(opt => (
                        <option key={opt.iso639_1} value={opt.language} disabled={isDuplicate(opt.language, type, editingIndex.index)}>
                          {opt.language}
                        </option>
                      ))
                    ) : (
                      options.map(opt => {
                        // Ne disable que si c'est un doublon ET que ce n'est pas la valeur actuelle
                        const currentSkill = skills[editingIndex?.index ?? -1];
                        const isCurrent = currentSkill && currentSkill.skill && typeof currentSkill.skill === 'object' && currentSkill.skill.$oid === opt._id;
                        return (
                          <option
                            key={opt._id}
                            value={opt._id}
                            disabled={isDuplicate(opt._id, type, editingIndex?.index) && !isCurrent}
                          >
                            {opt.name}
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
                        : (() => {
                            // For skills, handle both ObjectId format and string format (for backward compatibility)
                            let skillName = '';
                            
                            if (typeof skill === 'string') {
                              // Handle case where skill is still a string (not yet migrated)
                              skillName = skill;
                            } else if (skill.skill) {
                              if (typeof skill.skill === 'string') {
                                // Handle case where skill.skill is still a string (not yet migrated)
                                skillName = skill.skill;
                              } else if (typeof skill.skill === 'object' && skill.skill.$oid) {
                                // Handle ObjectId format
                                const skillId = skill.skill.$oid;
                                let skillArray: Array<{_id: string, name: string, description: string, category: string}>;
                                switch (type) {
                                  case 'professional':
                                    skillArray = professionalSkills;
                                    break;
                                  case 'technical':
                                    skillArray = technicalSkills;
                                    break;
                                  case 'soft':
                                    skillArray = softSkills;
                                    break;
                                  default:
                                    skillArray = [];
                                }
                                const skillObject = skillArray.find(s => s._id === skillId);
                                skillName = skillObject ? skillObject.name : skillId;
                              }
                            }
                            
                            return skillName || 'Unknown Skill';
                          })()}
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
        {!isLanguage && options.length === 0 && !isLoading && !hasError && (
          <div className="text-center py-4 text-gray-500">
            <p>No skills available</p>
          </div>
        )}
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
                  } else {
                    handleEditChange('language', e.target.value);
                  }
                } else {
                  // For skills, store the ObjectId
                  const selectedSkill = options.find(opt => opt._id === e.target.value);
                  if (selectedSkill) {
                    setNewSkill({
                      ...newSkill,
                      language: selectedSkill._id // Store ObjectId
                    });
                  }
                }
              }}
              disabled={isLoading}
            >
              <option value="">{isLoading ? 'Loading...' : (isLanguage ? 'Select language' : 'Select skill')}</option>
              {isLanguage ? (
                languageOptions.map(opt => (
                  <option key={opt.iso639_1} value={opt.language} disabled={isDuplicate(opt.language, type)}>
                    {opt.language}
                  </option>
                ))
              ) : (
                options.map(opt => {
                  // Ne disable que si c'est un doublon
                  return (
                    <option
                      key={opt._id}
                      value={opt._id}
                      disabled={isDuplicate(opt._id, type)}
                    >
                      {opt.name}
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
            className={`${!isLanguage && (options.length === 0 || isLoading || hasError) ? 'text-gray-400 cursor-not-allowed' : `text-${iconColor}-600 hover:text-${iconColor}-700 hover:underline`} flex items-center gap-1.5 font-medium transition-colors duration-200`} 
            onClick={() => { setAddMode({ type, active: true }); setEditingIndex(null); setNewSkill({ language: '', proficiency: '', iso639_1: '', level: 1 }); }}
            disabled={!isLanguage && (options.length === 0 || isLoading || hasError)}
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
    <div className="w-full bg-white p-0">
      <div className="space-y-8">
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
              'purple',
              'purple'
            )}

            {/* Technical Skills */}
            {renderSkillSection(
              'technical',
              'Technical Skills',
              'Specify required technical tools and software proficiency',
              <Laptop className="w-5 h-5 text-emerald-600" />,
              'emerald',
              'emerald'
            )}

            {/* Soft Skills */}
            {renderSkillSection(
              'soft',
              'Soft Skills',
              'Add interpersonal and communication skills',
              <Users className="w-5 h-5 text-orange-600" />,
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
            <div className="flex items-center gap-3">
              <button
                onClick={onPrevious}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              >
                <ArrowLeft className="w-5 h-5" />
                Previous
              </button>
            </div>
            <button
              onClick={() => {
                // Final migration to ensure all skills are in ObjectId format
                const finalMigration = () => {
                  let needsUpdate = false;
                  const migratedData = { ...safeData };
                  
                  ['soft', 'professional', 'technical'].forEach(type => {
                    const skillArray = migratedData[type as keyof typeof migratedData];
                    if (skillArray && Array.isArray(skillArray)) {
                      const migratedSkills = skillArray.map((skill: any) => {
                        // Helper function to find skill by name
                        const findSkillByName = (skillName: string, skillType: string) => {
                          let skillArray: Array<{_id: string, name: string, description: string, category: string}>;
                          switch (skillType) {
                            case 'soft': skillArray = softSkills; break;
                            case 'professional': skillArray = professionalSkills; break;
                            case 'technical': skillArray = technicalSkills; break;
                            default: skillArray = [];
                          }
                          
                          // Try exact match first
                          let found = skillArray.find(s => s.name === skillName);
                          
                          // If not found, try case-insensitive match
                          if (!found) {
                            found = skillArray.find(s => s.name.toLowerCase() === skillName.toLowerCase());
                          }
                          
                          // If still not found, try partial match
                          if (!found) {
                            found = skillArray.find(s => 
                              s.name.toLowerCase().includes(skillName.toLowerCase()) ||
                              skillName.toLowerCase().includes(s.name.toLowerCase())
                            );
                          }
                          
                          return found;
                        };

                        // If skill is a string, convert to ObjectId format
                        if (typeof skill === 'string') {
                          console.log(`🔄 Final migration: Converting string skill "${skill}" to ObjectId`);
                          const foundSkill = findSkillByName(skill, type);
                          if (foundSkill) {
                            console.log(`✅ Final migration: Found skill "${skill}" with ID: ${foundSkill._id}`);
                            needsUpdate = true;
                            return { 
                              skill: { $oid: foundSkill._id }, 
                              level: 1,
                              details: foundSkill.description || 'Migrated from string'
                            };
                          } else {
                            console.log(`⚠️ Final migration: Skill "${skill}" not found in database - removing`);
                            return null; // Remove skills that don't exist in database
                          }
                        }
                        
                        // If skill.skill is a string, convert to ObjectId format
                        if (skill && typeof skill.skill === 'string') {
                          console.log(`🔄 Final migration: Converting skill.skill string "${skill.skill}" to ObjectId`);
                          const foundSkill = findSkillByName(skill.skill, type);
                          if (foundSkill) {
                            console.log(`✅ Final migration: Found skill "${skill.skill}" with ID: ${foundSkill._id}`);
                            needsUpdate = true;
                            return { 
                              ...skill, 
                              skill: { $oid: foundSkill._id },
                              details: skill.details || foundSkill.description || 'Migrated from string'
                            };
                          } else {
                            console.log(`⚠️ Final migration: Skill "${skill.skill}" not found in database - removing`);
                            return null; // Remove skills that don't exist in database
                          }
                        }
                        
                        return skill; // Already in correct format
                      }).filter(Boolean); // Remove null entries
                      (migratedData as any)[type] = migratedSkills;
                    }
                  });
                  
                  if (needsUpdate) {
                    console.log('🔄 Final migration completed, updating data');
                    onChange(migratedData);
                  }
                };
                
                finalMigration();
                onNext && onNext();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}