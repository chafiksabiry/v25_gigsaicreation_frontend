import React, { useEffect, useState } from 'react';
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
  GraduationCap,
  Search
} from "lucide-react";
import { GigData } from '../types';
import i18n from 'i18n-iso-countries';
import fr from 'i18n-iso-countries/langs/fr.json';
import en from 'i18n-iso-countries/langs/en.json';
import { analyzeCityAndGetCountry } from '../lib/ai';

// Register languages
i18n.registerLocale(fr);
i18n.registerLocale(en);

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
  const [searchTerm, setSearchTerm] = useState('');
  const [cityInput, setCityInput] = useState('');

  // Sélectionner automatiquement le premier pays de destinationZones
  useEffect(() => {
    if (data.destinationZones && data.destinationZones.length > 0 && 
        (!data.destination_zone || data.destination_zone.length === 0)) {
      const firstCountry = data.destinationZones[0];
      
      // Convertir le nom du pays en code pays
      const countryCode = Object.entries(i18n.getNames('en'))
        .find(([_, name]) => name === firstCountry)?.[0];
      
      if (countryCode) {
        onChange({ ...data, destination_zone: countryCode });
      }
    }
  }, [data.destinationZones, data.destination_zone, data, onChange]);

  // Fonction pour vérifier si un pays est sélectionné
  const isCountrySelected = (countryCode: string) => {
    return data.destination_zone === countryCode;
  };

  const handleCountrySelect = (countryCode: string) => {
    onChange({ ...data, destination_zone: countryCode });
  };

  const getCountriesByZone = (zone: string) => {
    const zoneCountries: { [key: string]: string[] } = {
      'Europe': ['FR', 'DE', 'ES', 'IT', 'NL', 'BE', 'CH', 'AT', 'PT', 'GR', 'PL', 'CZ', 'HU', 'RO', 'BG', 'HR', 'SK', 'SI', 'DK', 'FI', 'SE', 'NO', 'IE', 'GB', 'EE', 'LV', 'LT', 'LU', 'MT', 'CY'],
      'Amérique du Nord': ['US', 'CA', 'MX'],
      'Amérique du Sud': ['BR', 'AR', 'CL', 'CO', 'PE', 'VE', 'EC', 'BO', 'PY', 'UY', 'GY', 'SR', 'TT', 'JM', 'HT', 'DO', 'CU', 'HN', 'NI', 'CR', 'PA', 'SV', 'GT', 'BZ'],
      'Asie': ['CN', 'JP', 'KR', 'IN', 'ID', 'TH', 'VN', 'MY', 'PH', 'SG', 'HK', 'TW'],
      'Afrique': ['ZA', 'EG', 'MA', 'NG', 'KE', 'GH', 'SN', 'TN', 'DZ', 'CI', 'AO', 'TZ', 'ZM', 'ZW', 'NA', 'MG', 'MU', 'MR', 'MZ', 'NE', 'RW', 'SC', 'SL', 'SO', 'SD', 'SZ', 'TG', 'UG'],
      'Océanie': ['AU', 'NZ'],
      'Moyen-Orient': ['AE', 'SA', 'QA', 'KW', 'PS', 'TR', 'LB']
    };

    return (zoneCountries[zone] || [])
      .map(code => {
        const name = i18n.getName(code, 'en');
        return name ? { code, name } : null;
      })
      .filter((country): country is { code: string; name: string } => country !== null)
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  // Log destination zone codes from suggestions
  useEffect(() => {
    console.log('Debug destinationZones:', {
      destinationZones: data.destinationZones,
      currentDestinationZone: data.destination_zone
    });

    if (data.destinationZones && data.destinationZones.length > 0) {
      // Convert country names to codes with special cases
      const countryCodes = data.destinationZones.map(country => {
        // Special cases for countries that are part of larger entities
        const specialCases: { [key: string]: string } = {
          'England': 'GB',  // England is part of United Kingdom
          'Scotland': 'GB', // Scotland is part of United Kingdom
          'Wales': 'GB',    // Wales is part of United Kingdom
          'Northern Ireland': 'GB' // Northern Ireland is part of United Kingdom
        };

        // Check if the country is a special case
        if (specialCases[country]) {
          console.log('Found special case for country:', country, '->', specialCases[country]);
          return { country, code: specialCases[country] };
        }

        // Normal case: look up the country code
        const code = Object.entries(i18n.getNames('en'))
          .find(([_, name]) => name === country)?.[0];
        
        console.log('Looking up country code for:', country, '->', code);
        
        if (!code) {
          console.log('No code found for country:', country);
          return { country, code: undefined };
        }
        
        return { country, code };
      });

      console.log('Converted country codes:', countryCodes);

      // Set destination_zone to the first country code if available
      if (countryCodes.length > 0 && countryCodes[0].code) {
        console.log('Setting destination_zone to:', countryCodes[0].code);
        onChange({ ...data, destination_zone: countryCodes[0].code });
      } else {
        console.log('No valid country code found to set as destination_zone');
      }
    } else {
      console.log('No destinationZones available');
    }
  }, [data.destinationZones]);

  const filteredZones = ['Europe', 'Afrique', 'Amérique du Nord', 'Amérique du Sud', 'Asie', 'Océanie', 'Moyen-Orient'].filter((zone) => {
    const countries = getCountriesByZone(zone);
    return countries.some(country => 
      country.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

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

  // Get all seniority levels including the one from data if it's not in predefined options
  const allSeniorityLevels = React.useMemo(() => {
    const levels = new Set(predefinedOptions.basic.seniorityLevels);
    if (data.seniority?.level && !levels.has(data.seniority.level)) {
      levels.add(data.seniority.level);
    }
    return Array.from(levels);
  }, [data.seniority?.level]);

  // Update the seniority section to include the years field
  const handleSeniorityChange = (field: 'level' | 'years' | 'yearsExperience', value: string) => {
    const newData = {
      ...data,
      seniority: {
        ...data.seniority,
        [field]: value,
        // years: field === 'yearsExperience' ? value : data.seniority?.yearsExperience || '',
        yearsExperience: field === 'yearsExperience' ? value : data.seniority?.yearsExperience || '',
        aiGenerated: data.seniority?.aiGenerated
      }
    };
    onChange(newData);
  };

  // Log initial data when component mounts
  useEffect(() => {
  }, []);

  // Log data changes
  useEffect(() => {
    console.log('Data from OpenAI:', {
      title: data.title,
      description: data.description,
      category: data.category,
      destination_zone: data.destination_zone,
      destinationZones: data.destinationZones,
      seniority: data.seniority
    });
  }, [data]);

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

        {/* Destination Zone Section */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Globe2 className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Destination Zone</h3>
              <p className="text-sm text-gray-600">Select the target country</p>
            </div>
          </div>

          {/* Affichage du pays sélectionné */}
          {data.destination_zone && (
            <div className="mb-4 p-4 bg-white rounded-lg border border-amber-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Country:</h4>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm">
                  {i18n.getName(data.destination_zone, 'en')}
                  <button
                    onClick={() => handleCountrySelect('')}
                    className="ml-1 text-amber-600 hover:text-amber-800"
                  >
                    ×
                  </button>
                </span>
              </div>
            </div>
          )}

          {/* Suggestions from data.destinationZones */}
          {data.destinationZones && data.destinationZones.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Suggested Countries:</h4>
              <div className="flex flex-wrap gap-2">
                {data.destinationZones.map((country) => {
                  const countryCode = Object.entries(i18n.getNames('en'))
                    .find(([_, name]) => name === country)?.[0];
                  
                  if (!countryCode) return null;

                  return (
                    <button
                      key={countryCode}
                      onClick={() => handleCountrySelect(countryCode)}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                        data.destination_zone === countryCode
                          ? 'bg-amber-100 text-amber-700 border-2 border-amber-500'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      {country}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Search for a country..."
              />
            </div>
          </div>

          <div className="space-y-6">
            {filteredZones.map((zone) => {
              const countries = getCountriesByZone(zone);
              if (countries.length === 0) return null;

              return (
                <div key={zone} className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">{zone}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {countries.map(({ code, name }) => (
                      <button
                        key={code}
                        onClick={() => handleCountrySelect(code)}
                        className={`flex items-center gap-2 p-3 rounded-lg text-left transition-colors ${
                          data.destination_zone === code
                            ? 'bg-amber-100 text-amber-700 border-2 border-amber-500'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          data.destination_zone === code
                            ? 'bg-amber-600'
                            : 'border-2 border-gray-300'
                        }`}>
                          {data.destination_zone === code && (
                            <div className="w-2.5 h-2.5 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="flex-1">{name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {errors.destination_zone && (
            <p className="mt-2 text-sm text-red-600">{errors.destination_zone.join(', ')}</p>
          )}
        </div>

        {/* Experience Level Section */}
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
                onChange={(e) => handleSeniorityChange('level', e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Select seniority level</option>
                {allSeniorityLevels.map((level) => (
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
                value={data.seniority?.years || ''}
                onChange={(e) => handleSeniorityChange('years', e.target.value)}
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
            if (onSectionChange) {
              onSectionChange('schedule');
            } else if (onNext) {
              onNext();
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