import React, { useEffect, useMemo } from 'react';
import { InfoText } from './InfoText';
import { predefinedOptions } from '../lib/guidance';
import {
  Brain,
  Briefcase,
  Globe2,
  Target,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  CheckCircle,
} from "lucide-react";
import { GigData } from '../types';
import i18n from 'i18n-iso-countries';
import fr from 'i18n-iso-countries/langs/fr.json';
import en from 'i18n-iso-countries/langs/en.json';
import { countryToAlpha2, alpha2ToCountry } from '../lib/countryCodes';

// Enregistrement des langues pour la traduction des noms de pays
i18n.registerLocale(fr);
i18n.registerLocale(en);

/**
 * Interface définissant les props du composant BasicSection
 * @property {GigData} data - Les données du gig
 * @property {Function} onChange - Callback pour mettre à jour les données
 * @property {Object} errors - Les erreurs de validation
 * @property {Function} onPrevious - Callback pour la navigation précédente
 * @property {Function} onNext - Callback pour la navigation suivante
 * @property {Function} onSave - Callback pour sauvegarder les données
 * @property {Function} onAIAssist - Callback pour l'assistance IA
 * @property {Function} onSectionChange - Callback pour changer de section
 * @property {string} currentSection - La section actuelle
 */
interface BasicSectionProps {
  data: GigData;
  onChange: (data: GigData) => void;
  errors: { [key: string]: string[] };
  onNext?: () => void;
  onPrevious?: () => void;
  onSave?: () => void;
  onAIAssist?: () => void;
  onSectionChange?: (sectionId: string) => void;
  currentSection: string;
}

/**
 * Composant principal BasicSection
 * Gère l'affichage et la modification des informations de base d'un gig
 */
const BasicSection: React.FC<BasicSectionProps> = ({ 
  data, 
  onChange, 
  errors, 
  onPrevious, 
  onNext
}) => {
  useEffect(() => {
    if (!data.destinationZones) {
      onChange({
        ...data,
        destinationZones: []
      });
    }
  }, []);

  useEffect(() => {
  }, [data]);

  /**
   * Obtient le nom du pays à partir du code alpha-2
   * @param {string} alpha2Code - Le code alpha-2 du pays
   * @returns {string} - Le nom du pays
   */
  const getCountryName = (alpha2Code: string): string => {
    return i18n.getName(alpha2Code, 'en') || alpha2ToCountry[alpha2Code] || alpha2Code;
  };

  /**
   * Gère la sélection d'un pays
   * @param {string} countryCode - Le code du pays sélectionné
   */
  const handleCountrySelect = (countryCode: string) => {
    if (!countryCode) {
      // Si aucun pays n'est sélectionné, on met à jour uniquement destination_zone
      onChange({
        ...data,
        destination_zone: ''
      });
      return;
    }

    const countryName = i18n.getName(countryCode, 'en');
    
    if (!countryName) {
      console.error('Invalid country code:', countryCode);
      return;
    }
    
    // Mettre à jour destination_zone et s'assurer que le pays sélectionné est dans destinationZones
    const updatedDestinationZones = data.destinationZones || [];
    if (!updatedDestinationZones.includes(countryCode)) {
      // Ajouter le nouveau pays au début de la liste
      updatedDestinationZones.unshift(countryCode);
    }
    
    onChange({
      ...data,
      destination_zone: countryCode,
      destinationZones: updatedDestinationZones
    });
  };

  /**
   * Récupère la liste des pays par zone géographique
   * Basé sur la logique de Suggestions.tsx avec les zones principales
   * @param {string} zone - La zone géographique
   * @returns {Array} - Liste des pays de la zone
   */
  const getCountriesByZone = (zone: string) => {
    // Utiliser les mêmes zones que dans Suggestions.tsx
    const zoneCountries: { [key: string]: string[] } = {
      'Europe': ['FR', 'DE', 'ES', 'IT', 'NL', 'BE', 'CH', 'AT', 'PT', 'GR', 'PL', 'CZ', 'HU', 'RO', 'BG', 'HR', 'SK', 'SI', 'DK', 'FI', 'SE', 'NO', 'IE', 'GB', 'EE', 'LV', 'LT', 'LU', 'MT', 'CY'],
      'Amérique du Nord': ['US', 'CA', 'MX'],
      'Amérique du Sud': ['BR', 'AR', 'CL', 'CO', 'PE', 'VE', 'EC', 'BO', 'PY', 'UY', 'GY', 'SR'],
      'Asie': ['CN', 'JP', 'KR', 'IN', 'ID', 'TH', 'VN', 'MY', 'PH', 'SG', 'HK', 'TW'],
      'Afrique': ['ZA', 'EG', 'MA', 'NG', 'KE', 'GH', 'SN', 'TN', 'DZ', 'CI', 'AO', 'TZ', 'ZM', 'ZW', 'NA', 'MG', 'MU', 'MR', 'MZ', 'NE', 'RW', 'SC', 'SL', 'SO', 'SD', 'SZ', 'TG', 'UG'],
      'Océanie': ['AU', 'NZ'],
      'Moyen-Orient': ['AE', 'SA', 'QA', 'KW', 'PS', 'TR', 'LB']
    };

    return (zoneCountries[zone] || [])
      .map(code => {
        const name = getCountryName(code);
        return name ? { code, name } : null;
      })
      .filter((country): country is { code: string; name: string } => country !== null)
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  /**
   * Effet pour initialiser destination_zone seulement si elle est vide
   * Basé sur la logique de Suggestions.tsx et api.ts
   */
  useEffect(() => {
    // Seulement initialiser si destination_zone est vide et destinationZones contient des données
    if (!data.destination_zone && data.destinationZones && data.destinationZones.length > 0) {
      const firstDestination = data.destinationZones[0];
      
      // Si c'est déjà un code de pays (2-3 caractères), l'utiliser directement
      if (firstDestination && firstDestination.length <= 3) {
        // Valider que c'est un code de pays valide
        const countryName = i18n.getName(firstDestination, 'en');
        if (countryName) {
          onChange({ ...data, destination_zone: firstDestination });
        }
      } else {
        // Convertir les noms de pays en codes
        const countryCode = countryToAlpha2[firstDestination] || 
                           Object.entries(i18n.getNames('en'))
                             .find(([_, name]) => name === firstDestination)?.[0];
        
        if (countryCode) {
          onChange({ ...data, destination_zone: countryCode });
        }
      }
    } else if (data.destination_zone && (!data.destinationZones || data.destinationZones.length === 0)) {
      // Si destination_zone est défini mais destinationZones est vide, initialiser destinationZones
      onChange({
        ...data,
        destinationZones: [data.destination_zone]
      });
    }
  }, [data.destinationZones, data.destination_zone]);

  /**
   * Effet pour ajouter les icônes Material Icons
   */
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  /**
   * Récupère toutes les catégories disponibles
   * Inclut les catégories prédéfinies et les nouvelles catégories
   */
  const allCategories = useMemo(() => {
    const categories = new Set(predefinedOptions.basic.categories);
    if (data.category && !categories.has(data.category)) {
      categories.add(data.category);
    }
    return Array.from(categories);
  }, [data.category]);

  /**
   * Gère les changements dans la section séniorité
   * @param {string} field - Le champ modifié (level, years, yearsExperience)
   * @param {string} value - La nouvelle valeur
   */
  const handleSeniorityChange = (field: 'level' | 'years' | 'yearsExperience', value: string) => {
    const newData = { ...data };
    
    if (!newData.seniority) {
      newData.seniority = {
        level: '',
        yearsExperience: 0,
      };
    }

    if (field === 'level') {
      // Vérifier que le niveau est dans la liste prédéfinie
      if (!predefinedOptions.basic.seniorityLevels.includes(value)) {
        return; // Ignorer les niveaux non prédéfinis
      }
      newData.seniority.level = value;
    } else if (field === 'years' || field === 'yearsExperience') {
      // Nettoyer la valeur pour n'avoir que des chiffres
      const cleanValue = value.replace(/[^0-9]/g, '');
      newData.seniority.yearsExperience = parseInt(cleanValue) || 0;
    }

    onChange(newData);
  };

  // Log Basic Section data
  useEffect(() => {
    console.log('=== BASIC SECTION DATA ===');
    console.log('Basic Data:', {
      title: data.title,
      category: data.category,
      highlights: data.highlights,
      destinationZones: data.destinationZones,
      destination_zone: data.destination_zone,
      seniority: data.seniority,
      requirements: data.requirements,
      benefits: data.benefits,
      callTypes: data.callTypes
    });
    console.log('Basic Errors:', errors);
    console.log('========================');
  }, [data, errors]);

  // Le rendu du composant
  return (
    <div className="w-full bg-white p-0">
      <div className="space-y-8">
        <InfoText>
          Start by providing the basic information about the contact center role. Be specific and clear
          about the position's requirements and responsibilities.
        </InfoText>

        {/* --- Position Details --- */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Position Details</h3>
              <p className="text-sm text-gray-500">Define the role title and main responsibilities</p>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input type="text" value={data.title || ''} onChange={(e) => onChange({ ...data, title: e.target.value })}
                className={`mt-1 block w-full rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.title ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="e.g., Senior Customer Service Representative" />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.join(', ')}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea value={data.description || ''} onChange={(e) => onChange({ ...data, description: e.target.value })} rows={4}
                className={`mt-1 block w-full rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.description ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="Describe the role, key responsibilities, and what success looks like in this position..." />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.join(', ')}</p>}
            </div>
          </div>
        </div>

        {/* --- Role Category --- */}
        <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Role Category</h3>
              <p className="text-sm text-gray-500">Select the primary focus area</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {allCategories.map((category) => (
              <button key={category} onClick={() => onChange({ ...data, category })}
                className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-200 border-2 ${data.category === category ? 'bg-purple-50 border-purple-500' : 'bg-white hover:bg-gray-50 border-gray-200'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${data.category === category ? 'border-purple-600 bg-purple-600' : 'border-gray-300'}`}>
                  {data.category === category && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
                <span className="flex-1 font-medium text-gray-800">{category}</span>
                {!predefinedOptions.basic.categories.includes(category) && <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">New</span>}
              </button>
            ))}
          </div>
          {errors.category && <p className="mt-2 text-sm text-red-600">{errors.category.join(', ')}</p>}
        </div>

        {/* --- Destination Zone --- */}
        <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Globe2 className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Destination Zone</h3>
              <p className="text-sm text-gray-500">Select the target country</p>
            </div>
          </div>
          <label className="block text-sm font-medium text-gray-700">Country</label>
          <select value={data.destination_zone || ''} onChange={(e) => handleCountrySelect(e.target.value)}
            className="mt-1 block w-full py-2.5 px-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
            <option value="">Select a country</option>
            {['Europe', 'Afrique', 'Amérique du Nord', 'Amérique du Sud', 'Asie', 'Océanie', 'Moyen-Orient'].map((zone) => {
              const countries = getCountriesByZone(zone);
              if (countries.length === 0) return null;
              return <optgroup key={zone} label={zone}>{countries.map(({ code, name }) => <option key={code} value={code}>{name}</option>)}</optgroup>;
            })}
          </select>
          {data.destination_zone && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              <Globe2 className="w-4 h-4" />
              <span>Selected: {getCountryName(data.destination_zone)}</span>
            </div>
          )}
          {errors.destination_zone && <p className="mt-2 text-sm text-red-600">{errors.destination_zone.join(', ')}</p>}
        </div>

        {/* --- Experience Level --- */}
        <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <GraduationCap className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Experience Level</h3>
              <p className="text-sm text-gray-500">Define seniority and experience requirements</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Seniority Level</label>
              <select value={data.seniority?.level || ''} onChange={(e) => handleSeniorityChange('level', e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500">
                <option value="">Select seniority level</option>
                {predefinedOptions.basic.seniorityLevels.map(level => <option key={level} value={level}>{level}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
              <input type="number" value={data.seniority?.yearsExperience || ''} onChange={(e) => handleSeniorityChange('years', e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500" placeholder="e.g., 2" />
            </div>
          </div>
          {data.seniority?.level && (data.seniority?.yearsExperience || 0) > 0 && (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <Brain className="h-5 w-5 text-emerald-600" />
              <p className="text-sm font-medium text-gray-700">
                {data.seniority.level}
                <span className="mx-2 font-light text-gray-400">•</span>
                {data.seniority.yearsExperience} years of experience
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <button onClick={onPrevious} disabled={!onPrevious}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Previous
          </button>
        </div>
        <button onClick={onNext}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
          Next
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default BasicSection;