import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Brain,
  Briefcase,
  Target,
  DollarSign,
  Gauge,
  Clock,
  Award,
  Globe2,
  AlertCircle,
  Edit2,
  X,
  CheckCircle,
  ArrowRight,
  XCircle,
  Plus,
  Trash2,
  Check,
  Loader2,
  Users,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Calendar,
} from "lucide-react";
import type { GigSuggestion } from "../types";
import i18n from "i18n-iso-countries";
import fr from "i18n-iso-countries/langs/fr.json";
import en from "i18n-iso-countries/langs/en.json";
import { generateGigSuggestions } from "../lib/ai";
import { fetchSoftSkills, fetchTechnicalSkills, fetchProfessionalSkills, fetchAllCountries, Country, fetchAllTimezones as fetchAllTimezonesNew, Timezone, getCountryNameById } from "../lib/api";
import { predefinedOptions } from "../lib/guidance";
import { 
  loadActivities, 
  loadIndustries, 
  loadLanguages,
  getActivityOptions, 
  getIndustryOptions,
  getLanguageOptions,
  getActivityNameById,
  getIndustryNameById,
  getLanguageNameById} from '../lib/activitiesIndustries';
import Logo from "./Logo";

type ScheduleEntry = {
  day: string;
  hours: { start: string; end: string };
  _id?: { $oid: string };
};

type GroupedSchedule = {
  hours: { start: string; end: string };
  days: string[];
};

// Timezone data type with _id
type TimezoneData = {
  _id: string;
  countryCode: string;
  countryName: string;
  zoneName: string;
  gmtOffset: number;
  lastUpdated?: string;
  __v?: number;
  createdAt?: string;
  updatedAt?: string;
};

// Processed timezone type for UI
type ProcessedTimezone = {
  _id: string;
  name: string;
  offset: number;
  abbreviation: string;
  countryName: string;
};

// Register languages
i18n.registerLocale(fr);
i18n.registerLocale(en);

// Helper function to check if a value is a string array

// Country data type
type CountryData = {
  name: {
    common: string;
    official: string;
  };
  cca2: string;
};

interface SuggestionsProps {
  input: string;
  onBack: () => void;
  onConfirm: (suggestions: GigSuggestion) => void;
  initialSuggestions?: GigSuggestion | null;
}

// OpenAI functionality has been moved to backend API


// Major countries with their alpha-2 codes
const DESTINATION_ZONES: { [key: string]: string } = {
  "FR": "France",
  "US": "United States",
  "GB": "United Kingdom",
  "DE": "Germany",
  "CA": "Canada",
  "AU": "Australia",
  "JP": "Japan",
  "IN": "India",
  "BR": "Brazil",
  "MX": "Mexico",
  "ES": "Spain",
  "IT": "Italy",
  "NL": "Netherlands",
  "SE": "Sweden",
  "NO": "Norway",
  "DK": "Denmark",
  "FI": "Finland",
  "CH": "Switzerland",
  "AT": "Austria",
  "BE": "Belgium",
  "PT": "Portugal",
  "IE": "Ireland",
  "NZ": "New Zealand",
  "SG": "Singapore",
  "KR": "South Korea",
  "CN": "China",
  "RU": "Russia",
  "ZA": "South Africa",
  "AR": "Argentina",
  "CL": "Chile",
  "CO": "Colombia",
  "PE": "Peru",
  "VE": "Venezuela",
  "UY": "Uruguay",
  "PY": "Paraguay",
  "BO": "Bolivia",
  "EC": "Ecuador",
  "GY": "Guyana",
  "SR": "Suriname",
  "GF": "French Guiana",
};







const LANGUAGE_LEVELS = [
  { value: "A1", label: "A1 - Beginner" },
  { value: "A2", label: "A2 - Elementary" },
  { value: "B1", label: "B1 - Intermediate" },
  { value: "B2", label: "B2 - Upper Intermediate" },
  { value: "C1", label: "C1 - Advanced" },
  { value: "C2", label: "C2 - Mastery" },
];

const SKILL_LEVELS = [
  { value: 1, label: "Basic" },
  { value: 2, label: "Intermediate" },
  { value: 3, label: "Advanced" },
  { value: 4, label: "Expert" },
  { value: 5, label: "Master" },
];



const BONUS_TYPES = ["Performance Bonus", "Team Bonus"];

const TRANSACTION_TYPES = [
  "Fixed Amount",
  "Percentage",
  "Tiered Amount",
  "Volume Based",
  "Performance Based",
];

const TEAM_ROLES = [
  "Team Lead",
  "Senior Agent",
  "Agent",
  "Junior Agent",
  "Supervisor",
  "Manager",
  "Coordinator",
  "Specialist",
  "Consultant",
  "Representative",
  "Associate",
  "Assistant",
  "Trainee",
  "Intern",
];

// Territories will be loaded from API

const MAJOR_TIMEZONES: { [key: string]: { name: string; offset: number } } = {
  "New York (EST/EDT)": { name: "New York (EST/EDT)", offset: -5 },
  "Chicago (CST/CDT)": { name: "Chicago (CST/CDT)", offset: -6 },
  "Denver (MST/MDT)": { name: "Denver (MST/MDT)", offset: -7 },
  "Los Angeles (PST/PDT)": { name: "Los Angeles (PST/PDT)", offset: -8 },
  "London (GMT/BST)": { name: "London (GMT/BST)", offset: 0 },
  "Paris (CET/CEST)": { name: "Paris (CET/CEST)", offset: 1 },
  "Dubai (GST)": { name: "Dubai (GST)", offset: 4 },
  "Singapore (SGT)": { name: "Singapore (SGT)", offset: 8 },
  "Tokyo (JST)": { name: "Tokyo (JST)", offset: 9 },
  "Sydney (AEST/AEDT)": { name: "Sydney (AEST/AEDT)", offset: 10 },
};


const FLEXIBILITY_SELECT_OPTIONS = [
  "Remote Work Available",
  "Flexible Hours",
  "Weekend Rotation",
  "Night Shift Available",
  "Split Shifts",
  "Part-Time Options",
  "Compressed Work Week",
  "Shift Swapping Allowed",
];

export const Suggestions: React.FC<SuggestionsProps> = (props) => {
  const [suggestions, setSuggestions] = useState<GigSuggestion | null>(props.initialSuggestions || null);
  const [loading, setLoading] = useState(!props.initialSuggestions);
  const [error, setError] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [allTimezones, setAllTimezones] = useState<TimezoneData[]>([]);
  const [availableTimezones, setAvailableTimezones] = useState<ProcessedTimezone[]>([]);
  const [timezoneLoading, setTimezoneLoading] = useState(false);
  const [timezonesLoaded, setTimezonesLoaded] = useState(false);
  const [allCountries, setAllCountries] = useState<CountryData[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<CountryData[]>([]);
  const [searching, setSearching] = useState(false);
  const [timezoneSearch, setTimezoneSearch] = useState("");
  const [softSkills, setSoftSkills] = useState<Array<{_id: string, name: string, description: string, category: string}>>([]);
  const [technicalSkills, setTechnicalSkills] = useState<Array<{_id: string, name: string, description: string, category: string}>>([]);
  const [professionalSkills, setProfessionalSkills] = useState<Array<{_id: string, name: string, description: string, category: string}>>([]);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [territoriesFromAPI, setTerritoriesFromAPI] = useState<Country[]>([]);
  const [territoriesLoading, setTerritoriesLoading] = useState(true);
  const [territoryNames, setTerritoryNames] = useState<{[key: string]: string}>({});
  const [allCountriesFromAPI, setAllCountriesFromAPI] = useState<Country[]>([]);
  const [destinationCountriesLoading, setDestinationCountriesLoading] = useState(false);
  const isGeneratingRef = useRef(false);
  const lastProcessedInputRef = useRef<string>("");
  const skillsLoadedRef = useRef(false);
  const [activities, setActivities] = useState<Array<{ value: string; label: string; category: string }>>([]);
  const [industries, setIndustries] = useState<Array<{ value: string; label: string }>>([]);
  const [languages, setLanguages] = useState<Array<{ value: string; label: string; code: string }>>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [industriesLoading, setIndustriesLoading] = useState(true);
  const [languagesLoading, setLanguagesLoading] = useState(true);



  // Load activities, industries, and languages from external API
  useEffect(() => {
    const loadActivitiesIndustriesAndLanguages = async () => {
      
      try {
        setActivitiesLoading(true);
        setIndustriesLoading(true);
        setLanguagesLoading(true);
        
        const activitiesData = await loadActivities();
        
        const industriesData = await loadIndustries();
        
        const languagesData = await loadLanguages();
        
        // Get options for UI components
        const activityOptions = getActivityOptions();
        const industryOptions = getIndustryOptions();
        const languageOptions = getLanguageOptions();
        
        
        
        // Log sample data for debugging
        if (activityOptions.length > 0) {
        }
        if (industryOptions.length > 0) {
        }
        if (languageOptions.length > 0) {
        }
        
        setActivities(activityOptions);
        setIndustries(industryOptions);
        setLanguages(languageOptions);
        setIsDataLoaded(true);
        
        
        
      } catch (error) {
        console.error('❌ Suggestions: Error loading activities, industries, and languages:', error);
        alert(`Error loading data: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your internet connection and try again.`);
      } finally {
        setActivitiesLoading(false);
        setIndustriesLoading(false);
        setLanguagesLoading(false);
      }
    };

    loadActivitiesIndustriesAndLanguages();
  }, []);

  // Fetch all countries from API for destination zones
  useEffect(() => {
    const loadAllCountries = async () => {
      setDestinationCountriesLoading(true);
      try {
        const countries = await fetchAllCountries();
        // Sort countries alphabetically by common name
        const sortedData = countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
        setAllCountriesFromAPI(sortedData);
      } catch (error) {
        console.error('Error fetching countries:', error);
      } finally {
        setDestinationCountriesLoading(false);
      }
    };

    loadAllCountries();
  }, []);

  // Ensure all team roles have valid seniority structure
  const validateAndFixTeamStructure = () => {
    if (!suggestions?.team?.structure) return;
    
    let needsUpdate = false;
    const newSuggestions = { ...suggestions };
    
    newSuggestions.team.structure.forEach((role, index) => {
      // Check if role is a string and convert it to proper object structure
      if (typeof role === 'string') {
        newSuggestions.team.structure[index] = {
          roleId: role,
          count: 1,
          seniority: {
            level: "Mid-Level",
            yearsExperience: 3,
          },
        };
        needsUpdate = true;
      } else if (typeof role === 'object' && role !== null) {
        // Ensure role has required properties
        if (!role.roleId) {
          newSuggestions.team.structure[index] = {
            ...role,
            roleId: "Agent",
            count: role.count || 1,
            seniority: role.seniority || {
              level: "Mid-Level",
              yearsExperience: 3,
            },
          };
          needsUpdate = true;
        } else if (!role.seniority) {
          newSuggestions.team.structure[index] = {
            ...role,
            seniority: {
              level: "Mid-Level",
              yearsExperience: 3,
            },
          };
          needsUpdate = true;
        } else if (!role.seniority.level || !role.seniority.yearsExperience) {
          newSuggestions.team.structure[index] = {
            ...role,
            seniority: {
              level: role.seniority.level || "Mid-Level",
              yearsExperience: role.seniority.yearsExperience || 3,
            },
          };
          needsUpdate = true;
        }
      } else {
        // If role is null, undefined, or invalid, replace with default structure
        newSuggestions.team.structure[index] = {
          roleId: "Agent",
          count: 1,
          seniority: {
            level: "Mid-Level",
            yearsExperience: 3,
          },
        };
        needsUpdate = true;
      }
    });
    
    if (needsUpdate) {
      setSuggestions(prev => prev ? newSuggestions : null);
    }
  };

  // Validate team structure when suggestions change
  useEffect(() => {
    if (suggestions?.team?.structure) {
      validateAndFixTeamStructure();
    }
  }, []); // Only run once on mount to prevent infinite loop

  // Fetch all countries, timezones, and skills when component mounts
  useEffect(() => {
    const fetchAllData = async () => {
      // Fetch countries
      if (allCountries.length === 0) {
        setCountriesLoading(true);
        try {
          const countries = await fetchAllCountries();
          const countriesData = countries.map(country => ({
            name: {
              common: country.name.common,
              official: country.name.official
            },
            cca2: country.cca2
          }));
          setAllCountries(countriesData);
        } catch (error) {
          console.error('❌ Error fetching countries:', error);
        } finally {
          setCountriesLoading(false);
        }
      }

      // Fetch territories (countries) from API
      if (territoriesFromAPI.length === 0) {
        setTerritoriesLoading(true);
        try {
          const countries = await fetchAllCountries();
          const sortedCountries = countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
          setTerritoriesFromAPI(sortedCountries);
        } catch (error) {
          console.error('❌ Error fetching territories:', error);
          // Fallback to empty array - will show loading state
          setTerritoriesFromAPI([]);
        } finally {
          setTerritoriesLoading(false);
        }
      }

      // Fetch timezones only once
      if (!timezonesLoaded) {
      setTimezoneLoading(true);
      try {
        const data = await fetchAllTimezonesNew();
        if (data.length > 0) {
          setAllTimezones(data);
          setTimezonesLoaded(true);
        } else {
            console.error('❌ No timezones received from API');
            // Fallback to default timezones
            setAllTimezones([]);
            setTimezonesLoaded(true);
        }
      } catch (error) {
          console.error('❌ Error fetching timezones:', error);
          setAllTimezones([]);
          setTimezonesLoaded(true);
      } finally {
        setTimezoneLoading(false);
        }
      }
    };

    fetchAllData();
  }, []); // Empty dependency array - only run once on mount

  // Process all timezones when loaded
  useEffect(() => {
    if (!timezonesLoaded || allTimezones.length === 0) {
      return;
    }

    setTimezoneLoading(true);
    
    try {
      // Process all timezones from the API
      const processedTimezones = allTimezones
        .map(tz => ({
          _id: tz._id,
          name: tz.zoneName,
          offset: tz.gmtOffset / 3600, // Convert seconds to hours
          abbreviation: tz.zoneName.split('/').pop() || '',
          countryName: tz.countryName
        }))
        .sort((a, b) => a.offset - b.offset);

      setAvailableTimezones(processedTimezones);
    } catch (error) {
      console.error('❌ Error processing timezones:', error);
      // Fallback to default timezones if processing fails
      setAvailableTimezones(Object.entries(MAJOR_TIMEZONES).map(([code, { name, offset }]) => ({
        _id: `default_${code}`,
        name,
        offset,
        abbreviation: code.split('(')[1]?.split(')')[0] || '',
        countryName: ''
      })));
    } finally {
      setTimezoneLoading(false);
    }
  }, [allTimezones, timezonesLoaded]);

  // No longer fetch country-specific timezones - we show all timezones available

  // Effect to show all timezones from API (no longer filtering by country)
  useEffect(() => {
    if (allTimezones && allTimezones.length > 0 && availableTimezones.length === 0) {
      const processedTimezones = allTimezones
        .map(tz => ({
          _id: tz._id,
          name: tz.zoneName,
          offset: tz.gmtOffset / 3600,
          abbreviation: tz.zoneName.split('/').pop() || '',
          countryName: tz.countryName
        }))
        .sort((a, b) => a.offset - b.offset);
      setAvailableTimezones(processedTimezones);
    }
  }, [allTimezones, availableTimezones.length]);

  // Fetch skills from API
  useEffect(() => {
    const fetchSkills = async () => {
      if (skillsLoadedRef.current) {
        return; // Already loaded
      }

      setSkillsLoading(true);
      
      try {
        const [softResult, technicalResult, professionalResult] = await Promise.all([
          fetchSoftSkills(),
          fetchTechnicalSkills(),
          fetchProfessionalSkills()
        ]);

        if (!softResult.error && softResult.data.length > 0) {
          setSoftSkills(softResult.data);
        }

        if (!technicalResult.error && technicalResult.data.length > 0) {
          setTechnicalSkills(technicalResult.data);
        }

        if (!professionalResult.error && professionalResult.data.length > 0) {
          setProfessionalSkills(professionalResult.data);
        }

        skillsLoadedRef.current = true;
      } catch (error) {
        console.error('❌ Error fetching skills:', error);
      } finally {
        setSkillsLoading(false);
      }
    };

    fetchSkills();
  }, []); // Empty dependency array - only run once on mount

  // Global migration effect - runs when skills are loaded
  useEffect(() => {
    if (suggestions && (softSkills.length > 0 || professionalSkills.length > 0 || technicalSkills.length > 0)) {
      
      const migrateAllSkills = () => {
        if (!suggestions.skills) return;
        
        let needsUpdate = false;
        const migratedSkills = { ...suggestions.skills };
        
        ['soft', 'professional', 'technical'].forEach(type => {
          const skillArray = migratedSkills[type as keyof typeof migratedSkills];
          if (skillArray && Array.isArray(skillArray)) {
            (migratedSkills as any)[type] = skillArray.map((skill: any) => {
              if (skill && typeof skill.skill === 'string') {
                
                let skillArray: any[] = [];
                switch (type) {
                  case 'soft': skillArray = softSkills; break;
                  case 'professional': skillArray = professionalSkills; break;
                  case 'technical': skillArray = technicalSkills; break;
                }
                
                // Try exact match first
                let found = skillArray.find(s => s.name === skill.skill);
                
                // If not found, try case-insensitive match
                if (!found) {
                  found = skillArray.find(s => s.name.toLowerCase() === skill.skill.toLowerCase());
                }
                
                // If still not found, try partial match
                if (!found) {
                  found = skillArray.find(s => 
                    s.name.toLowerCase().includes(skill.skill.toLowerCase()) ||
                    skill.skill.toLowerCase().includes(s.name.toLowerCase())
                  );
                }
                
                if (found) {
                  needsUpdate = true;
                  return { 
                    ...skill, 
                    skill: { $oid: found._id },
                    details: skill.details || `Migrated from "${skill.skill}" to "${found.name}"`
                  };
                } else {
                  // Keep as string but mark for later processing
                  return { 
                    ...skill, 
                    _needsMigration: true,
                    _originalSkill: skill.skill
                  };
                }
              }
              return skill;
            });
          }
        });
        
        if (needsUpdate) {
          setSuggestions(prev => prev ? { ...prev, skills: migratedSkills } : null);
        }
      };
      
      migrateAllSkills();
    }
  }, [softSkills, professionalSkills, technicalSkills]); // Removed suggestions from dependencies

  // Skills migration effect - runs when skills are loaded
  useEffect(() => {
    if (suggestions && (softSkills.length > 0 || professionalSkills.length > 0 || technicalSkills.length > 0)) {
      
      // Helper: get ObjectId for a skill name and type
      const getSkillObjectId = (skillName: string, type: string): string | undefined => {
        let arr: any[] = [];
        if (type === 'soft') arr = softSkills;
        if (type === 'professional') arr = professionalSkills;
        if (type === 'technical') arr = technicalSkills;
        const found = arr.find(s => s.name === skillName);
        return found?._id;
      };

      const migrateSkillsToObjectIds = () => {
        if (!suggestions.skills) return;
        
        let needsUpdate = false;
        const migratedSkills = { ...suggestions.skills } as any;
        
        ['soft', 'professional', 'technical'].forEach(type => {
          const skillArray = migratedSkills[type];
          if (skillArray && Array.isArray(skillArray)) {
            migratedSkills[type] = skillArray.map((skill: any) => {
              if (skill && typeof skill.skill === 'string') {
                const oid = getSkillObjectId(skill.skill, type);
                if (oid) {
                  needsUpdate = true;
                  return { 
                    ...skill, 
                    skill: { $oid: oid },
                    details: skill.details || 'Migrated from string'
                  };
                } else {
                  return skill; // Keep as string if not found
                }
              }
              return skill; // Already ObjectId format
            });
          }
        });
        
        if (needsUpdate) {
          setSuggestions(prev => prev ? { ...prev, skills: migratedSkills } : null);
        }
      };
      
      migrateSkillsToObjectIds();
    }
  }, [softSkills, professionalSkills, technicalSkills]); // Removed suggestions from dependencies

  // Load territory names when suggestions change
  useEffect(() => {
    const loadTerritoryNames = async () => {
      if (!suggestions?.team?.territories || suggestions.team.territories.length === 0) {
        setTerritoryNames({});
        return;
      }
      
      const names: {[key: string]: string} = {};
      for (const territoryId of suggestions.team.territories) {
        try {
          const name = await getCountryNameById(territoryId);
          names[territoryId] = name;
        } catch (error) {
          console.error(`Error loading territory name for ${territoryId}:`, error);
          names[territoryId] = territoryId; // Fallback to ID
        }
      }
      setTerritoryNames(names);
    };

    loadTerritoryNames();
  }, [suggestions?.team?.territories]);

  // Force migration on component mount - only run once
  useEffect(() => {
    const forceMigration = () => {
      if (suggestions && suggestions.skills) {
        let hasStringSkills = false;
        
        ['soft', 'professional', 'technical'].forEach(type => {
          const skillArray = (suggestions.skills as any)[type];
          if (skillArray && Array.isArray(skillArray)) {
            skillArray.forEach((skill: any) => {
              if (skill && typeof skill.skill === 'string') {
                hasStringSkills = true;
              }
            });
          }
        });
        
        if (hasStringSkills) {
          // Trigger the global migration effect
          const event = new CustomEvent('forceSkillsMigration');
          window.dispatchEvent(event);
        }
      }
    };
    
    // Run on mount
    forceMigration();
    
    // Listen for force migration events
    const handleForceMigration = () => {
      forceMigration();
    };
    
    window.addEventListener('forceSkillsMigration', handleForceMigration);
    
    return () => {
      window.removeEventListener('forceSkillsMigration', handleForceMigration);
    };
  }, []); // Only run on mount, removed suggestions dependency

  useEffect(() => {
    const generateSuggestions = async () => {
      // Prevent multiple simultaneous API calls
      if (isGeneratingRef.current) {
        return;
      }

      // Don't regenerate if we already processed this exact input
      if (lastProcessedInputRef.current === props.input.trim()) {
        return;
      }

      // Don't regenerate if we have initial suggestions (coming back from manual mode)
      if (props.initialSuggestions) {
        setSuggestions(props.initialSuggestions);
        setLoading(false);
        return;
      }

      try {
        isGeneratingRef.current = true;
        lastProcessedInputRef.current = props.input.trim();
        setLoading(true);
        setError(null);
        const result = await generateGigSuggestions(props.input);
        
        // Convert schedules from days array to individual day objects
        if (result.schedule && result.schedule.schedules) {
          const convertedSchedules: Array<ScheduleEntry> = [];
          result.schedule.schedules.forEach((schedule: any) => {
            if (schedule.days && Array.isArray(schedule.days)) {
              // Convert from days array to individual day objects
              schedule.days.forEach((day: string) => {
                convertedSchedules.push({
                  day: day,
                  hours: schedule.hours,
                  _id: {
                    $oid: `generated_${Date.now()}_${Math.random()
                      .toString(36)
                      .substr(2, 9)}`,
                  },
                });
              });
            } else if (schedule.day) {
              // Already in correct format
              convertedSchedules.push({
                ...schedule,
                _id: schedule._id || {
                  $oid: `generated_${Date.now()}_${Math.random()
                    .toString(36)
                    .substr(2, 9)}`,
                },
              });
            }
          });

                  // Format times to be compliant with <input type="time">
        result.schedule.schedules.forEach((schedule) => {
          const formatTimeForInput = (timeStr: string) => {
            if (!timeStr || !timeStr.includes(":")) return "00:00";
            const [h, m] = timeStr.split(":");
            return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
          };
          schedule.hours.start = formatTimeForInput(schedule.hours.start);
          schedule.hours.end = formatTimeForInput(schedule.hours.end);
        });

          result.schedule.schedules = convertedSchedules;
        }

        // Convert commission structure to options format if needed
        if (result.commission && !(result.commission as any).options) {
          // Convert old structure to new options structure
          const oldCommission = result.commission as any;
          const commissionOption = {
            base: oldCommission.base || "Base + Commission",
            baseAmount:
              typeof oldCommission.baseAmount === "string"
                ? parseFloat(oldCommission.baseAmount) || 0
                : oldCommission.baseAmount || 0,
            bonus: "Performance Bonus",
            bonusAmount:
              typeof oldCommission.bonusAmount === "string"
                ? parseFloat(oldCommission.bonusAmount) || 0
                : oldCommission.bonusAmount || 0,
            structure: oldCommission.structure,
            currency: oldCommission.currency || "EUR",
            minimumVolume: oldCommission.minimumVolume || {
              amount: 0,
              period: "Monthly",
              unit: "Sales",
            },
            transactionCommission: oldCommission.transactionCommission || {
              type: "Fixed Amount",
              amount: 0,
            },
          };

          result.commission = {
            options: [commissionOption],
          };
        }

        // Validate and filter sectors to only allow predefined ones
        if (result.sectors && result.sectors.length > 0) {
          
          
          const validSectors = result.sectors.filter(sector => {
            const isValid = predefinedOptions.sectors.includes(sector);
            if (!isValid) {
              console.warn(`❌ Invalid sector "${sector}" - not in allowed list`);
            }
            return isValid;
          });
          
          result.sectors = validSectors;
        }

        // Validate and filter flexibility options to only allow predefined ones
        if (result.schedule?.flexibility && result.schedule.flexibility.length > 0) {
          
          
          const validFlexibility = result.schedule.flexibility.filter(option => {
            const isValid = FLEXIBILITY_SELECT_OPTIONS.includes(option);
            if (!isValid) {
              console.warn(`❌ Invalid flexibility option "${option}" - not in allowed list`);
            }
            return isValid;
          });
          
          result.schedule.flexibility = validFlexibility;
        }

        // Validate and filter skills to only allow predefined ones from API
        if (result.skills) {
          
          
          // Only validate if skills are loaded from API
          if (professionalSkills.length > 0 && technicalSkills.length > 0 && softSkills.length > 0) {
            
            
            // Helper function to find best match for a skill
            const findBestSkillMatch = (skillName: string, skillArray: any[]) => {
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
            
            // Validate and migrate professional skills
            if (result.skills.professional && result.skills.professional.length > 0) {
              const validProfessional = result.skills.professional.map(skill => {
                const skillName = typeof skill === 'string' ? skill : (typeof skill.skill === 'string' ? skill.skill : skill.skill.$oid);
                const found = findBestSkillMatch(skillName, professionalSkills);
                if (found) {
                  return { 
                    skill: { $oid: found._id },
                    level: typeof skill === 'object' ? skill.level : 1,
                    details: typeof skill === 'object' ? skill.details : `Migrated from "${skillName}"`
                  };
                } else {
                  console.warn(`⚠️ Professional skill "${skillName}" not found in database - keeping as string`);
                  return skill; // Keep original format
                }
              });
              result.skills.professional = validProfessional;
            }

            // Validate and migrate technical skills
            if (result.skills.technical && result.skills.technical.length > 0) {
              const validTechnical = result.skills.technical.map(skill => {
                const skillName = typeof skill === 'string' ? skill : (typeof skill.skill === 'string' ? skill.skill : skill.skill.$oid);
                const found = findBestSkillMatch(skillName, technicalSkills);
                if (found) {
                  return { 
                    skill: { $oid: found._id },
                    level: typeof skill === 'object' ? skill.level : 1,
                    details: typeof skill === 'object' ? skill.details : `Migrated from "${skillName}"`
                  };
                } else {
                  console.warn(`⚠️ Technical skill "${skillName}" not found in database - keeping as string`);
                  return skill; // Keep original format
                }
              });
              result.skills.technical = validTechnical;
            }

            // Validate and migrate soft skills
            if (result.skills.soft && result.skills.soft.length > 0) {
              const validSoft = result.skills.soft.map(skill => {
                const skillName = typeof skill === 'string' ? skill : (typeof skill.skill === 'string' ? skill.skill : skill.skill.$oid);
                const found = findBestSkillMatch(skillName, softSkills);
                if (found) {
                  return { 
                    skill: { $oid: found._id },
                    level: typeof skill === 'object' ? skill.level : 1,
                  };
                } else {
                  console.warn(`⚠️ Soft skill "${skillName}" not found in database - keeping as string`);
                  return skill; // Keep original format
                }
              });
              result.skills.soft = validSoft;
            }
          } else {
          }
        }

        // Convert destination zones from country names to alpha-2 codes
        if (result.destinationZones && result.destinationZones.length > 0) {
          
          const convertedZones = await Promise.all(result.destinationZones.map(async (zone) => {
            // If it's already an alpha-2 code (2 letters), keep it
            if (typeof zone === 'string' && zone.length === 2 && /^[A-Z]{2}$/.test(zone)) {
              return zone;
            }
            
            // If it's "Global", replace with "France" (FR)
            if (typeof zone === 'string' && zone.toLowerCase() === 'global') {
              return 'FR';
            }
            
            // If it's a country name, convert to alpha-2 code
            if (typeof zone === 'string') {
              const alpha2Code = await getAlpha2Code(zone);
              return alpha2Code;
            }
            
            return zone;
          }));
          
          result.destinationZones = convertedZones;
        } else {
          // If no destination zones are provided, default to France
          result.destinationZones = ['FR'];
        }

        setSuggestions(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to generate suggestions"
        );
      } finally {
        setLoading(false);
        isGeneratingRef.current = false;
      }
    };

    if (props.input.trim() && !props.initialSuggestions) {
      generateSuggestions();
    }

    // Cleanup function to reset the generating flag
    return () => {
      isGeneratingRef.current = false;
    };
  }, [props.input]);

  // Memoized timezone options for the UI
  const timezoneOptions = React.useMemo(() => {
    return availableTimezones.length > 0
      ? availableTimezones.map(tz => ({
          _id: tz._id,
          zoneName: tz.name,
          countryName: tz.countryName,
          offset: tz.offset, // Include offset for GMT display
        }))
      : Object.entries(MAJOR_TIMEZONES).map(([code, { name, offset }]) => ({
          _id: `default_${code}`,
          zoneName: name,
          countryName: '',
          offset: offset,
        }));
  }, [availableTimezones]);

  // Auto-select first timezone when available timezones change
  useEffect(() => {
    if (!suggestions?.schedule || availableTimezones.length === 0) return;
    
    setSuggestions(prev => {
      if (!prev || !prev.schedule) return prev;
      return {
        ...prev,
        schedule: {
          ...prev.schedule,
          timeZones: [availableTimezones[0]._id],
          time_zone: availableTimezones[0]._id
        }
      };
    });
  }, [availableTimezones]); // Only depend on availableTimezones

  // Re-validate skills when they are loaded from API
  useEffect(() => {
    if (!suggestions?.skills) return;
    if (professionalSkills.length > 0 && technicalSkills.length > 0 && softSkills.length > 0) {
      
      setSuggestions(prev => {
        if (!prev || !prev.skills) return prev;
        
        const newSuggestions = { ...prev };
        
        // Helper function to find best match for a skill
        const findBestSkillMatch = (skillName: string, skillArray: any[]) => {
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
        
        // Validate and migrate professional skills
        if (newSuggestions.skills.professional && newSuggestions.skills.professional.length > 0) {
          const validProfessional = newSuggestions.skills.professional.map(skill => {
            const skillName = typeof skill === 'string' ? skill : (typeof skill.skill === 'string' ? skill.skill : skill.skill.$oid);
            const found = findBestSkillMatch(skillName, professionalSkills);
            if (found) {
              return { 
                skill: { $oid: found._id },
                level: typeof skill === 'object' ? skill.level : 1,
                details: typeof skill === 'object' ? skill.details : `Migrated from "${skillName}"`
              };
            } else {
              console.warn(`⚠️ Re-validation: Professional skill "${skillName}" not found in database - keeping as string`);
              return skill; // Keep original format
            }
          });
          newSuggestions.skills.professional = validProfessional;
        }

        // Validate and migrate technical skills
        if (newSuggestions.skills.technical && newSuggestions.skills.technical.length > 0) {
          const validTechnical = newSuggestions.skills.technical.map(skill => {
            const skillName = typeof skill === 'string' ? skill : (typeof skill.skill === 'string' ? skill.skill : skill.skill.$oid);
            const found = findBestSkillMatch(skillName, technicalSkills);
            if (found) {
              return { 
                skill: { $oid: found._id },
                level: typeof skill === 'object' ? skill.level : 1,
                details: typeof skill === 'object' ? skill.details : `Migrated from "${skillName}"`
              };
            } else {
              console.warn(`⚠️ Re-validation: Technical skill "${skillName}" not found in database - keeping as string`);
              return skill; // Keep original format
            }
          });
          newSuggestions.skills.technical = validTechnical;
        }

        // Validate and migrate soft skills
        if (newSuggestions.skills.soft && newSuggestions.skills.soft.length > 0) {
          const validSoft = newSuggestions.skills.soft.map(skill => {
            const skillName = typeof skill === 'string' ? skill : (typeof skill.skill === 'string' ? skill.skill : skill.skill.$oid);
            const found = findBestSkillMatch(skillName, softSkills);
            if (found) {
              return { 
                skill: { $oid: found._id },
                level: typeof skill === 'object' ? skill.level : 1,
              };
            } else {
              console.warn(`⚠️ Re-validation: Soft skill "${skillName}" not found in database - keeping as string`);
              return skill; // Keep original format
            }
          });
          newSuggestions.skills.soft = validSoft;
        }

        return newSuggestions;
      });
    }
  }, [professionalSkills, technicalSkills, softSkills]); // Removed suggestions dependency to prevent infinite loop

  const handleConfirm = () => {
    if (suggestions) {
      // Final migration to ensure all skills are in ObjectId format
      const finalMigration = () => {
        if (!suggestions.skills) return suggestions;
        
        let needsUpdate = false;
        const migratedSkills = { ...suggestions.skills };
        
        ['soft', 'professional', 'technical'].forEach(type => {
          const skillArray = migratedSkills[type as keyof typeof migratedSkills];
          if (skillArray && Array.isArray(skillArray)) {
            (migratedSkills as any)[type] = skillArray.map((skill: any) => {
              // Helper function to find skill by name
              const findSkillByName = (skillName: string, skillType: string) => {
                let skillArray: any[] = [];
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
                const foundSkill = findSkillByName(skill, type);
                if (foundSkill) {
                  needsUpdate = true;
                  return { 
                    skill: { $oid: foundSkill._id }, 
                    level: 1,
                    details: foundSkill.description || 'Migrated from string'
                  };
                } else {
                  return null; // Remove skills that don't exist in database
                }
              }
              
              // If skill.skill is a string, convert to ObjectId format
              if (skill && typeof skill.skill === 'string') {
                const foundSkill = findSkillByName(skill.skill, type);
                if (foundSkill) {
                  needsUpdate = true;
                  return { 
                    ...skill, 
                    skill: { $oid: foundSkill._id },
                    details: skill.details || foundSkill.description || 'Migrated from string'
                  };
                } else {
                  return null; // Remove skills that don't exist in database
                }
              }
              
              return skill; // Already in correct format
            }).filter(Boolean); // Remove null entries
          }
        });
        
        if (needsUpdate) {
          return { ...suggestions, skills: migratedSkills };
        }
        
        return suggestions;
      };
      
      const finalSuggestions = finalMigration();
      props.onConfirm(finalSuggestions);
    }
  };

  // Helper function to get country name from API ID or alpha-2 code
  const getCountryName = (countryId: string): string => {
    // First check if it's an API ID (MongoDB ObjectId format)
    if (countryId && countryId.length === 24) {
      const country = allCountriesFromAPI.find(c => c._id === countryId);
      if (country) {
        return country.name.common;
      }
    }
    
    // Then check our predefined list (for backward compatibility)
    if (DESTINATION_ZONES[countryId]) {
      return DESTINATION_ZONES[countryId];
    }
    
    // Then check the fetched countries by cca2 (for backward compatibility)
    const country = allCountries.find(c => c.cca2 === countryId);
    if (country) {
      return country.name.common;
    }
    
    return countryId;
  };

  // Helper function to get territory name by ID
  const getTerritoryName = (territoryId: string): string => {
    // First check if we have the name in our resolved names cache
    if (territoryNames[territoryId]) {
      return territoryNames[territoryId];
    }
    
    // Then check if it's an API ID (MongoDB ObjectId format) in loaded territories
    if (territoryId && territoryId.length === 24) {
      const country = territoriesFromAPI.find(c => c._id === territoryId);
      if (country) {
        return country.name.common;
      }
    }
    // Fallback to display the ID as-is (for backward compatibility)
    return territoryId;
  };

  // Helper function to search for countries by name
  const searchCountries = async (searchTerm: string): Promise<CountryData[]> => {
    if (!searchTerm || searchTerm.length < 2) return [];
    
    setSearching(true);
    try {
      const countries = await fetchAllCountries();
      // Filter countries by search term
      const filtered = countries.filter(country => 
        country.name.common.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.name.official.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      // Convert to expected format
      const data = filtered.map(country => ({
        name: {
          common: country.name.common,
          official: country.name.official
        },
        cca2: country.cca2
      }));
      
      return data;
    } catch (error) {
      console.error('❌ Error searching countries:', error);
      return [];
    } finally {
      setSearching(false);
    }
    return [];
  };

  // Helper function to get alpha-2 code from country name (synchronous version for UI)
  const getAlpha2CodeSync = (countryName: string): string => {
    
    // First check our predefined list
    const predefinedCode = Object.keys(DESTINATION_ZONES).find(
      code => DESTINATION_ZONES[code] === countryName
    );
    if (predefinedCode) {
      return predefinedCode;
    }
    
    // Then check the fetched countries
    const country = allCountries.find(c => c.name.common === countryName);
    if (country) {
      return country.cca2;
    }
    
    return countryName;
  };

  // Helper function to get alpha-2 code from country name (async version for API calls)
  const getAlpha2Code = async (countryName: string): Promise<string> => {
    
    // First check our predefined list
    const predefinedCode = Object.keys(DESTINATION_ZONES).find(
      code => DESTINATION_ZONES[code] === countryName
    );
    if (predefinedCode) {
      return predefinedCode;
    }
    
    // Then check the fetched countries
    const country = allCountries.find(c => c.name.common === countryName);
    if (country) {
      return country.cca2;
    }
    
    // If not found, try to fetch from our API
    try {
      const countries = await fetchAllCountries();
      const country = countries.find(c => 
        c.name.common.toLowerCase() === countryName.toLowerCase() ||
        c.name.official.toLowerCase() === countryName.toLowerCase()
      );
      
      if (country) {
        return country.cca2;
      }
    } catch (error) {
      console.error('❌ Error fetching from API:', error);
    }
    
    return countryName;
  };

  const addItem = (section: string, item: string) => {
    if (!suggestions) return;

    const newSuggestions = { ...suggestions };

    switch (section) {
      case "highlights":
        newSuggestions.highlights = [
          ...(newSuggestions.highlights || []),
          item,
        ];
        break;
      case "jobTitles":
        newSuggestions.jobTitles = [...(newSuggestions.jobTitles || []), item];
        break;
      case "deliverables":
        newSuggestions.deliverables = [
          ...(newSuggestions.deliverables || []),
          item,
        ];
        break;
      case "industries":
        // Convert industry name to ID
        const industryId = industries.find(i => i.label === item)?.value;
        if (industryId) {
          newSuggestions.industries = [...(newSuggestions.industries || []), industryId];
        } else {
          console.warn(`Industry "${item}" not found in available options. Skipping.`);
        }
        break;
      case "activities":
        // Convert activity name to ID
        const activityId = activities.find(a => a.label === item)?.value;
        if (activityId) {
          newSuggestions.activities = [...(newSuggestions.activities || []), activityId];
        } else {
          console.warn(`Activity "${item}" not found in available options. Skipping.`);
        }
        break;
      case "languages":
        // Convert language name to ID
        const languageId = languages.find(l => l.label === item)?.value;
        if (languageId) {
          newSuggestions.skills.languages = [
            ...(newSuggestions.skills.languages || []),
            { language: languageId, proficiency: 'B1', iso639_1: 'en' }
          ];
        } else {
          console.warn(`Language "${item}" not found in available options. Skipping.`);
        }
        break;
      case "sectors":
        // Validate that the sector is in the allowed list
        if (predefinedOptions.sectors.includes(item)) {
          newSuggestions.sectors = [...(newSuggestions.sectors || []), item];
        } else {
          console.warn(`Sector "${item}" is not in the allowed list. Skipping.`);
        }
        break;
      case "destinationZones":
        // For destination zones, we store the alpha-2 code
        
        // If someone tries to add "Global", replace with "France"
        if (item.toLowerCase() === 'global') {
          item = 'France';
        }
        
        const alpha2Code = getAlpha2CodeSync(item);
        
        newSuggestions.destinationZones = [
          ...(newSuggestions.destinationZones || []),
          alpha2Code,
        ];
        
        break;
      case "requirements.essential":
        newSuggestions.requirements.essential = [
          ...(newSuggestions.requirements.essential || []),
          item,
        ];
        break;
      case "requirements.preferred":
        newSuggestions.requirements.preferred = [
          ...(newSuggestions.requirements.preferred || []),
          item,
        ];
        break;
      case "skills.technical":
        newSuggestions.skills.technical = [
          ...(newSuggestions.skills.technical || []),
          { skill: { $oid: item }, level: 1 },
        ];
        break;
      case "skills.soft":
        newSuggestions.skills.soft = [
          ...(newSuggestions.skills.soft || []),
          { skill: { $oid: item }, level: 1 },
        ];
        break;
      case "skills.languages":
        newSuggestions.skills.languages = [
          ...(newSuggestions.skills.languages || []),
          { language: item, proficiency: "Intermediate", iso639_1: "en" },
        ];
        break;
    }

    setSuggestions(newSuggestions);
  };

  const updateItem = (section: string, index: number, newValue: string) => {
    if (!suggestions) return;

    const newSuggestions = { ...suggestions };

    switch (section) {
      case "highlights":
        newSuggestions.highlights[index] = newValue;
        break;
      case "jobTitles":
        newSuggestions.jobTitles[index] = newValue;
        break;
      case "deliverables":
        newSuggestions.deliverables[index] = newValue;
        break;
      case "industries":
        // Convert industry name to ID
        const industryId = industries.find(i => i.label === newValue)?.value;
        if (industryId) {
          newSuggestions.industries[index] = industryId;
        } else {
          console.warn(`Industry "${newValue}" not found in available options. Skipping update.`);
        }
        break;
      case "activities":
        // Convert activity name to ID
        const activityId = activities.find(a => a.label === newValue)?.value;
        if (activityId) {
          newSuggestions.activities[index] = activityId;
        } else {
          console.warn(`Activity "${newValue}" not found in available options. Skipping update.`);
        }
        break;
      case "sectors":
        // Validate that the sector is in the allowed list
        if (predefinedOptions.sectors.includes(newValue)) {
          newSuggestions.sectors[index] = newValue;
        } else {
          console.warn(`Sector "${newValue}" is not in the allowed list. Skipping update.`);
        }
        break;
      case "destinationZones":
        // For destination zones, we store the alpha-2 code
        
        // If someone tries to update to "Global", replace with "France"
        if (newValue.toLowerCase() === 'global') {
          newValue = 'France';
        }
        
        const alpha2Code = getAlpha2CodeSync(newValue);
        newSuggestions.destinationZones[index] = alpha2Code;
        break;
      case "requirements.essential":
        newSuggestions.requirements.essential[index] = newValue;
        break;
      case "requirements.preferred":
        newSuggestions.requirements.preferred[index] = newValue;
        break;
      case "skills.technical":
        newSuggestions.skills.technical[index] = {
          skill: { $oid: newValue },
          level: newSuggestions.skills.technical[index].level,
        };
        break;
      case "skills.soft":
        newSuggestions.skills.soft[index] = {
          skill: { $oid: newValue },
          level: newSuggestions.skills.soft[index].level,
        };
        break;
      case "skills.languages":
        const currentLang = newSuggestions.skills.languages[index];
        newSuggestions.skills.languages[index] = {
          language: newValue,
          proficiency: currentLang.proficiency,
          iso639_1: currentLang.iso639_1 || "en",
        };
        break;
    }

    setSuggestions(newSuggestions);
  };

  const deleteItem = (section: string, index: number) => {
    if (!suggestions) return;

    const newSuggestions = { ...suggestions };

    switch (section) {
      case "highlights":
        newSuggestions.highlights = newSuggestions.highlights.filter(
          (_, i) => i !== index
        );
        break;
      case "jobTitles":
        newSuggestions.jobTitles = newSuggestions.jobTitles.filter(
          (_, i) => i !== index
        );
        break;
      case "deliverables":
        newSuggestions.deliverables = newSuggestions.deliverables.filter(
          (_, i) => i !== index
        );
        break;
      case "industries":
        newSuggestions.industries = newSuggestions.industries.filter(
          (_, i) => i !== index
        );
        break;
      case "activities":
        newSuggestions.activities = newSuggestions.activities.filter(
          (_, i) => i !== index
        );
        break;
      case "sectors":
        newSuggestions.sectors = newSuggestions.sectors.filter(
          (_, i) => i !== index
        );
        break;
      case "destinationZones":
        newSuggestions.destinationZones =
          newSuggestions.destinationZones.filter((_, i) => i !== index);
        break;
      case "requirements.essential":
        newSuggestions.requirements.essential =
          newSuggestions.requirements.essential.filter((_, i) => i !== index);
        break;
      case "requirements.preferred":
        newSuggestions.requirements.preferred =
          newSuggestions.requirements.preferred.filter((_, i) => i !== index);
        break;
      case "skills.technical":
        newSuggestions.skills.technical =
          newSuggestions.skills.technical.filter((_, i) => i !== index);
        break;
      case "skills.soft":
        newSuggestions.skills.soft = newSuggestions.skills.soft.filter(
          (_, i) => i !== index
        );
        break;
      case "skills.languages":
        newSuggestions.skills.languages =
          newSuggestions.skills.languages.filter((_, i) => i !== index);
        break;
    }

    setSuggestions(newSuggestions);
  };

  const startEditing = (section: string, index: number, currentValue: any) => {
    setEditingSection(section);
    setEditingIndex(index);
    if (typeof currentValue === "string") {
      // For destination zones, convert alpha-2 code to country name for editing
      if (section === "destinationZones") {
        const countryName = getCountryName(currentValue);
        setEditValue(countryName);
      } else {
      setEditValue(currentValue);
      }
    } else if (currentValue && typeof currentValue === "object") {
      // Handle skill objects with $oid
      if (currentValue.skill) {
        if (typeof currentValue.skill === 'string') {
          setEditValue(currentValue.skill);
        } else if (currentValue.skill && typeof currentValue.skill === 'object' && currentValue.skill.$oid) {
          setEditValue(currentValue.skill.$oid);
        } else {
          setEditValue("");
        }
      } else if (currentValue.language) {
        setEditValue(currentValue.language);
      } else {
        setEditValue("");
      }
    } else {
      setEditValue("");
    }
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setEditingIndex(null);
    setEditValue("");
    setSearchResults([]);
  };

  const renderEditableList = (section: string, items: any[], title: string) => {
    const currentItems = items || [];

    return (
      <div className="mb-6">
        <div className="flex items-center justify-end mb-4">
          <button
            onClick={() => {
              setEditingSection(section);
              setEditingIndex(-1);
              setEditValue("");
            }}
            className="flex items-center space-x-1 text-blue-700 hover:text-blue-900 font-semibold text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>

        {currentItems.length > 0 && (
          <div className="space-y-3">
            {currentItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
              >
                {editingSection === section && editingIndex === index ? (
                  <div className="flex items-center space-x-2 flex-1">
                    {section === "destinationZones" ? (
                      <div className="flex-1">
                        <input
                          type="text"
                        value={editValue}
                          onChange={async (e) => {
                            const value = e.target.value;
                            setEditValue(value);
                            
                            // Search for countries if user types something
                            if (value.length >= 2) {
                              const results = await searchCountries(value);
                              setSearchResults(results);
                            } else {
                              setSearchResults([]);
                            }
                          }}
                          placeholder="Type to search countries..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-blue-700"
                        autoFocus
                        />
                        {searching && (
                          <div className="mt-2 text-sm text-gray-500 flex items-center">
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Searching countries...
                          </div>
                        )}
                        {searchResults.length > 0 && (
                          <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                            {searchResults.map((country) => (
                              <button
                                key={country.cca2}
                                type="button"
                                onClick={() => {
                                  setEditValue(country.name.common);
                                  setSearchResults([]);
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                              >
                                <div className="font-medium">{country.name.common}</div>
                                <div className="text-sm text-gray-500">{country.cca2}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : section === "sectors" || section === "industries" || section === "activities" ? (
                      <select
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-blue-700"
                        autoFocus
                      >
                        <option value="">Select a {section === "sectors" ? "sector" : section === "industries" ? "industry" : "activity"}...</option>
                        {(section === "sectors" ? predefinedOptions.sectors : section === "industries" ? predefinedOptions.industries : predefinedOptions.activities).filter((item: string) => {
                          // When editing, include the current item being edited
                          if (editingIndex >= 0 && currentItems[editingIndex] === item) {
                            return true;
                          }
                          // Otherwise, exclude items that are already selected
                          return !currentItems.includes(item);
                        }).map((item: string) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-blue-700"
                        autoFocus
                      />
                    )}
                    <button
                      onClick={() => {
                        updateItem(section, index, editValue);
                        setEditingSection(null);
                        setEditingIndex(null);
                        setEditValue("");
                        setSearchResults([]);
                      }}
                      className="text-green-700 hover:text-green-800 p-1"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="text-gray-500 hover:text-gray-700 p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-gray-700 flex-1 font-medium">
                      {typeof item === "string"
                        ? section === "destinationZones" 
                          ? (() => {
                              const countryName = getCountryName(item);
                              return (
                                <div className="flex items-center space-x-2">
                                  <span>{countryName}</span>
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    {item}
                                  </span>
                                </div>
                              );
                            })()
                          : item
                        : item?.skill || item?.language || ""}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => startEditing(section, index, item)}
                        className="text-blue-900 hover:text-blue-700 p-1"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteItem(section, index)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {editingSection === section && editingIndex === -1 && (
          <div className="flex items-center space-x-3 mt-4">
            {section === "destinationZones" ? (
              <div className="flex-1">
                <input
                  type="text"
                value={editValue}
                  onChange={async (e) => {
                    const value = e.target.value;
                    setEditValue(value);
                    
                    // Search for countries if user types something
                    if (value.length >= 2) {
                      const results = await searchCountries(value);
                      setSearchResults(results);
                    } else {
                      setSearchResults([]);
                    }
                  }}
                  placeholder="Type to search countries..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-blue-700"
                autoFocus
                />
                {searching && (
                  <div className="mt-2 text-sm text-gray-500 flex items-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Searching countries...
                  </div>
                )}
                {searchResults.length > 0 && (
                  <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                    {searchResults.map((country) => (
                      <button
                        key={country.cca2}
                        type="button"
                        onClick={() => {
                          setEditValue(country.name.common);
                          setSearchResults([]);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium">{country.name.common}</div>
                        <div className="text-sm text-gray-500">{country.cca2}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : section === "sectors" || section === "industries" || section === "activities" ? (
              <select
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-blue-700"
                autoFocus
              >
                <option value="">Select a {section === "sectors" ? "sector" : section === "industries" ? "industry" : "activity"}...</option>
                {(section === "sectors" ? predefinedOptions.sectors : section === "industries" ? predefinedOptions.industries : predefinedOptions.activities).filter((item: string) => {
                  // When editing, include the current item being edited
                  if (editingIndex >= 0 && currentItems[editingIndex] === item) {
                    return true;
                  }
                  // Otherwise, exclude items that are already selected
                  return !currentItems.includes(item);
                }).map(
                  (item: string) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  )
                )}
              </select>
            ) : (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder={`Add a new ${title.toLowerCase()}`}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-blue-700"
                autoFocus
              />
            )}
            <button
              onClick={() => {
                if (editValue.trim()) {
                  addItem(section, editValue.trim());
                  setEditValue("");
                  setEditingSection(null);
                  setEditingIndex(null);
                  setSearchResults([]);
                }
              }}
              className="text-green-700 hover:text-green-800 p-2"
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              onClick={cancelEditing}
              className="text-gray-500 hover:text-gray-700 p-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const formatTime24 = (time: string) => {
    if (!time || !time.includes(":")) return time;
    let [hoursStr, minutesStr] = time.split(":");
    return `${hoursStr}h${minutesStr}`;
  };

  const renderEditableSchedules = () => {
    if (!suggestions?.schedule) return null;

    const groupedSchedules = (suggestions.schedule.schedules || []).reduce(
      (groups, schedule) => {
        // Ignorer les schedules avec des jours vides
        if (!schedule.day || schedule.day.trim() === "") return groups;
        
        const key = `${schedule.hours.start}-${schedule.hours.end}`;
        if (!groups[key]) {
          groups[key] = { hours: schedule.hours, days: [] };
        }
        groups[key].days.push(schedule.day);
        return groups;
      },
      {} as Record<string, GroupedSchedule>
    );

    const allWeekDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    // Trouver les groupes vides (schedules avec des jours vides)
    const emptySchedules = suggestions.schedule.schedules.filter(
      schedule => !schedule.day || schedule.day.trim() === ""
    );

    // Vérifier si tous les jours sont déjà sélectionnés
    const selectedDays = suggestions.schedule.schedules
      .filter(schedule => schedule.day && schedule.day.trim() !== "")
      .map(schedule => schedule.day);
    
    const allDaysSelected = allWeekDays.every(day => selectedDays.includes(day));

    const addNewScheduleGroup = () => {
      if (!suggestions) return;
      
      // Cherche un horaire non utilisé
      const defaultHoursList = [
        { start: "09:00", end: "17:00" },
        { start: "07:00", end: "15:00" },
        { start: "11:00", end: "19:00" },
        { start: "14:00", end: "22:00" },
      ];
      const usedHours = suggestions.schedule.schedules.map(s => `${s.hours.start}-${s.hours.end}`);
      const availableHours = defaultHoursList.find(
        h => !usedHours.includes(`${h.start}-${h.end}`)
      ) || { start: "09:00", end: "17:00" };

      // Créer un nouveau groupe avec des horaires mais sans jours sélectionnés
      const newSchedule: ScheduleEntry = {
        day: "", // Jour vide - aucun jour sélectionné par défaut
        hours: availableHours,
        _id: {
          $oid: `generated_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`,
        },
      };
      
      const newSuggestions = {
        ...suggestions,
        schedule: {
          ...suggestions.schedule,
          schedules: [...suggestions.schedule.schedules, newSchedule],
        },
      };
      setSuggestions(newSuggestions);
    };

    const handleDayToggle = (
      dayToToggle: string,
      groupHours: { start: string; end: string }
    ) => {
      const newSuggestions = JSON.parse(JSON.stringify(suggestions));
      const scheduleIndex = newSuggestions.schedule.schedules.findIndex(
        (s: ScheduleEntry) => s.day === dayToToggle
      );

      if (scheduleIndex > -1) {
        const currentHours =
          newSuggestions.schedule.schedules[scheduleIndex].hours;
        if (
          currentHours.start === groupHours.start &&
          currentHours.end === groupHours.end
        ) {
          newSuggestions.schedule.schedules.splice(scheduleIndex, 1);
        } else {
          newSuggestions.schedule.schedules[scheduleIndex].hours = groupHours;
        }
      } else {
        newSuggestions.schedule.schedules.push({
          day: dayToToggle,
          hours: groupHours,
          _id: {
            $oid: `generated_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`,
          },
        });
      }
      setSuggestions(newSuggestions);
    };

    const handleHoursChange = (
      group: GroupedSchedule,
      field: "start" | "end",
      value: string
    ) => {
      const newSuggestions = JSON.parse(JSON.stringify(suggestions));
      group.days.forEach((day: string) => {
        const schedule = newSuggestions.schedule.schedules.find(
          (s: ScheduleEntry) => s.day === day
        );
        if (schedule) {
          schedule.hours[field] = value;
        }
      });
      setSuggestions(newSuggestions);
    };

    const handlePresetClick = (group: GroupedSchedule, preset: string) => {
      let newHours;
      switch (preset) {
        case "9-5":
          newHours = { start: "09:00", end: "17:00" };
          break;
        case "Early":
          newHours = { start: "07:00", end: "15:00" };
          break;
        case "Late":
          newHours = { start: "11:00", end: "19:00" };
          break;
        case "Evening":
          newHours = { start: "14:00", end: "22:00" };
          break;
        default:
          newHours = group.hours;
      }

      const newSuggestions = JSON.parse(JSON.stringify(suggestions));
      group.days.forEach((day: string) => {
        const schedule = newSuggestions.schedule.schedules.find(
          (s: ScheduleEntry) => s.day === day
        );
        if (schedule) {
          schedule.hours = newHours;
        }
      });
      setSuggestions(newSuggestions);
    };

    const handleEmptyScheduleDayToggle = (dayToToggle: string, emptySchedule: ScheduleEntry) => {
      const newSuggestions = JSON.parse(JSON.stringify(suggestions));
      const scheduleIndex = newSuggestions.schedule.schedules.findIndex(
        (s: ScheduleEntry) => s._id?.$oid === emptySchedule._id?.$oid
      );

      if (scheduleIndex > -1) {
        newSuggestions.schedule.schedules[scheduleIndex].day = dayToToggle;
      }
      setSuggestions(newSuggestions);
    };

    const handleEmptyScheduleHoursChange = (emptySchedule: ScheduleEntry, field: "start" | "end", value: string) => {
      const newSuggestions = JSON.parse(JSON.stringify(suggestions));
      const scheduleIndex = newSuggestions.schedule.schedules.findIndex(
        (s: ScheduleEntry) => s._id?.$oid === emptySchedule._id?.$oid
      );

      if (scheduleIndex > -1) {
        newSuggestions.schedule.schedules[scheduleIndex].hours[field] = value;
      }
      setSuggestions(newSuggestions);
    };

    const handleEmptySchedulePresetClick = (emptySchedule: ScheduleEntry, preset: string) => {
      let newHours;
      switch (preset) {
        case "9-5":
          newHours = { start: "09:00", end: "17:00" };
          break;
        case "Early":
          newHours = { start: "07:00", end: "15:00" };
          break;
        case "Late":
          newHours = { start: "11:00", end: "19:00" };
          break;
        case "Evening":
          newHours = { start: "14:00", end: "22:00" };
          break;
        default:
          newHours = emptySchedule.hours;
      }

      const newSuggestions = JSON.parse(JSON.stringify(suggestions));
      const scheduleIndex = newSuggestions.schedule.schedules.findIndex(
        (s: ScheduleEntry) => s._id?.$oid === emptySchedule._id?.$oid
      );

      if (scheduleIndex > -1) {
        newSuggestions.schedule.schedules[scheduleIndex].hours = newHours;
      }
      setSuggestions(newSuggestions);
    };

    const deleteEmptySchedule = (emptySchedule: ScheduleEntry) => {
      const newSuggestions = JSON.parse(JSON.stringify(suggestions));
      const scheduleIndex = newSuggestions.schedule.schedules.findIndex(
        (s: ScheduleEntry) => s._id?.$oid === emptySchedule._id?.$oid
      );

      if (scheduleIndex > -1) {
        newSuggestions.schedule.schedules.splice(scheduleIndex, 1);
        setSuggestions(newSuggestions);
      }
    };

    const deleteScheduleGroup = (groupHours: { start: string; end: string }) => {
      const newSuggestions = JSON.parse(JSON.stringify(suggestions));
      const schedulesToRemove = newSuggestions.schedule.schedules.filter(
        (s: ScheduleEntry) => s.hours.start === groupHours.start && s.hours.end === groupHours.end
      );
      
      schedulesToRemove.forEach((schedule: ScheduleEntry) => {
        const scheduleIndex = newSuggestions.schedule.schedules.findIndex(
          (s: ScheduleEntry) => s._id?.$oid === schedule._id?.$oid
        );
        if (scheduleIndex > -1) {
          newSuggestions.schedule.schedules.splice(scheduleIndex, 1);
        }
      });
      
      setSuggestions(newSuggestions);
    };

    return (
      <div className="space-y-4">
        {Object.keys(groupedSchedules).length > 0 ? (
          Object.entries(groupedSchedules).map(([key, group]) => (
            <div
              key={key}
              className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm font-semibold text-gray-800 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                  Working Days
                </h5>
                <button
                  onClick={() => deleteScheduleGroup(group.hours)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete schedule group"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-1 flex-wrap border-b border-gray-200 pb-2 mb-3">
                {allWeekDays.map((day) => {
                  const isSelected = group.days.includes(day);
                  const isInOtherGroup = !isSelected && suggestions.schedule.schedules.some((s) => s.day === day);
                  return (
                    <button
                      key={day}
                      onClick={() => handleDayToggle(day, group.hours)}
                      disabled={isInOtherGroup}
                      className={`rounded-full px-4 py-1.5 font-semibold text-sm transition-all duration-200 shadow-sm
                        ${isSelected ? 'bg-blue-600 text-white shadow' : isInOtherGroup ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700'}
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-blue-600" />
                  Working Hours
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
                      <Sunrise className="w-3 h-3 mr-1 text-orange-400" />
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={group.hours.start}
                      onChange={(e) =>
                        handleHoursChange(group, "start", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
                      <Sunset className="w-3 h-3 mr-1 text-indigo-400" />
                      End Time
                    </label>
                    <input
                      type="time"
                      value={group.hours.end}
                      onChange={(e) =>
                        handleHoursChange(group, "end", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="text-center bg-white border border-gray-200 rounded-lg p-2 mb-4">
                  <span className="font-semibold text-gray-700 text-sm">
                    {formatTime24(group.hours.start)} -{" "}
                    {formatTime24(group.hours.end)}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button
                    onClick={() => handlePresetClick(group, "9-5")}
                    className="flex flex-col items-center justify-center py-2 px-1 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors shadow-sm"
                  >
                    <Sun className="w-4 h-4 text-yellow-500 mb-1" />
                    <span className="text-xs font-medium text-gray-600">
                      9-5
                    </span>
                  </button>
                  <button
                    onClick={() => handlePresetClick(group, "Early")}
                    className="flex flex-col items-center justify-center py-2 px-1 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors shadow-sm"
                  >
                    <Sunrise className="w-4 h-4 text-orange-500 mb-1" />
                    <span className="text-xs font-medium text-gray-600">
                      Early
                    </span>
                  </button>
                  <button
                    onClick={() => handlePresetClick(group, "Late")}
                    className="flex flex-col items-center justify-center py-2 px-1 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors shadow-sm"
                  >
                    <Clock className="w-4 h-4 text-indigo-500 mb-1" />
                    <span className="text-xs font-medium text-gray-600">
                      Late
                    </span>
                  </button>
                  <button
                    onClick={() => handlePresetClick(group, "Evening")}
                    className="flex flex-col items-center justify-center py-2 px-1 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors shadow-sm"
                  >
                    <Moon className="w-4 h-4 text-purple-500 mb-1" />
                    <span className="text-xs font-medium text-gray-600">
                      Evening
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : null}

        {/* Afficher les groupes vides */}
        {emptySchedules.map((emptySchedule, index) => (
          <div
            key={emptySchedule._id?.$oid || index}
            className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-sm font-semibold text-gray-600">
                New Schedule Group (No days selected)
              </h5>
              <button
                onClick={() => deleteEmptySchedule(emptySchedule)}
                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex gap-1 mb-4">
              {allWeekDays.map((day) => {
                const isSelected = emptySchedule.day === day;
                const isInOtherGroup = suggestions.schedule.schedules.some((s) => s.day === day);
                return (
                  <button
                    key={day}
                    onClick={() => handleEmptyScheduleDayToggle(day, emptySchedule)}
                    disabled={isInOtherGroup}
                    className={`rounded-full px-4 py-1.5 font-semibold text-sm transition-all duration-200 shadow-sm
                      ${isSelected ? 'bg-blue-600 text-white shadow' : isInOtherGroup ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700'}
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
              <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-blue-600" />
                Working Hours
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
                    <Sunrise className="w-3 h-3 mr-1 text-orange-400" />
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={emptySchedule.hours.start}
                    onChange={(e) =>
                      handleEmptyScheduleHoursChange(emptySchedule, "start", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
                    <Sunset className="w-3 h-3 mr-1 text-indigo-400" />
                    End Time
                  </label>
                  <input
                    type="time"
                    value={emptySchedule.hours.end}
                    onChange={(e) =>
                      handleEmptyScheduleHoursChange(emptySchedule, "end", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="text-center bg-white border border-gray-200 rounded-lg p-2 mb-4">
                <span className="font-semibold text-gray-700 text-sm">
                  {formatTime24(emptySchedule.hours.start)} -{" "}
                  {formatTime24(emptySchedule.hours.end)}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  onClick={() => handleEmptySchedulePresetClick(emptySchedule, "9-5")}
                  className="flex flex-col items-center justify-center py-2 px-1 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors shadow-sm"
                >
                  <Sun className="w-4 h-4 text-yellow-500 mb-1" />
                  <span className="text-xs font-medium text-gray-600">
                    9-5
                  </span>
                </button>
                <button
                  onClick={() => handleEmptySchedulePresetClick(emptySchedule, "Early")}
                  className="flex flex-col items-center justify-center py-2 px-1 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors shadow-sm"
                >
                  <Sunrise className="w-4 h-4 text-orange-500 mb-1" />
                  <span className="text-xs font-medium text-gray-600">
                    Early
                  </span>
                </button>
                <button
                  onClick={() => handleEmptySchedulePresetClick(emptySchedule, "Late")}
                  className="flex flex-col items-center justify-center py-2 px-1 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors shadow-sm"
                >
                  <Clock className="w-4 h-4 text-indigo-500 mb-1" />
                  <span className="text-xs font-medium text-gray-600">
                    Late
                  </span>
                </button>
                <button
                  onClick={() => handleEmptySchedulePresetClick(emptySchedule, "Evening")}
                  className="flex flex-col items-center justify-center py-2 px-1 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors shadow-sm"
                >
                  <Moon className="w-4 h-4 text-purple-500 mb-1" />
                  <span className="text-xs font-medium text-gray-600">
                    Evening
                  </span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Message si aucun planning n'est défini */}
        {Object.keys(groupedSchedules).length === 0 && emptySchedules.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">No schedule defined.</p>
          </div>
        )}

        {/* Afficher le bouton seulement si tous les jours ne sont pas sélectionnés ET qu'il n'y a pas de groupes vides */}
        {!allDaysSelected && emptySchedules.length === 0 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={addNewScheduleGroup}
              className="flex items-center space-x-2 px-5 py-2 border-2 border-dashed border-blue-400 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>Add Schedule Group</span>
            </button>
          </div>
        )}

        {/* Message quand tous les jours sont sélectionnés ET qu'il n'y a pas de groupes vides */}
        {allDaysSelected && emptySchedules.length === 0 && (
          <div className="text-center mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-center space-x-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">All week days are scheduled!</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              You can still modify existing schedules or remove days to add new groups.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderMinimumHoursSection = () => {
    if (!suggestions?.schedule) return null;

    const handleMinimumHoursChange = (field: 'daily' | 'weekly' | 'monthly', value: string) => {
      const newSuggestions = { ...suggestions };
      if (!newSuggestions.schedule.minimumHours) {
        newSuggestions.schedule.minimumHours = { daily: 0, weekly: 0, monthly: 0 };
      }
      
      const numericValue = value ? parseInt(value, 10) : 0;
      newSuggestions.schedule.minimumHours[field] = numericValue;
      setSuggestions(newSuggestions);
    };

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Gauge className="w-5 h-5 text-orange-600" />
            </div>
            <h4 className="text-lg font-bold text-gray-800">Minimum Hours Requirements</h4>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border-2 border-orange-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                Daily Hours
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={suggestions.schedule.minimumHours?.daily || ''}
                  onChange={(e) => handleMinimumHoursChange('daily', e.target.value)}
                  placeholder="e.g. 8"
                  className="w-full p-4 pr-12 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all duration-200 hover:border-orange-300"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold text-sm">
                  hrs
                </span>
              </div>
              <p className="text-xs text-gray-600">Minimum hours per day</p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                Weekly Hours
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="168"
                  value={suggestions.schedule.minimumHours?.weekly || ''}
                  onChange={(e) => handleMinimumHoursChange('weekly', e.target.value)}
                  placeholder="e.g. 40"
                  className="w-full p-4 pr-12 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white transition-all duration-200 hover:border-amber-300"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold text-sm">
                  hrs
                </span>
              </div>
              <p className="text-xs text-gray-600">Minimum hours per week</p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Monthly Hours
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="744"
                  value={suggestions.schedule.minimumHours?.monthly || ''}
                  onChange={(e) => handleMinimumHoursChange('monthly', e.target.value)}
                  placeholder="e.g. 160"
                  className="w-full p-4 pr-12 border-2 border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white transition-all duration-200 hover:border-red-300"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold text-sm">
                  hrs
                </span>
              </div>
              <p className="text-xs text-gray-600">Minimum hours per month</p>
            </div>
          </div>

          {/* Summary Card */}
          <div className="mt-6 p-4 bg-white rounded-lg border border-orange-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {suggestions.schedule.minimumHours?.daily || 0}
                </div>
                <div className="text-xs text-gray-500">Daily</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-600">
                  {suggestions.schedule.minimumHours?.weekly || 0}
                </div>
                <div className="text-xs text-gray-500">Weekly</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {suggestions.schedule.minimumHours?.monthly || 0}
                </div>
                <div className="text-xs text-gray-500">Monthly</div>
              </div>
          </div>
                  </div>
        </div>
      </div>
    );
  };

  const renderTimezoneSection = () => {
    if (!suggestions?.schedule) return null;

    const handleTimezoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      const newSuggestions = { ...suggestions };
      
      if (value) {
        // Find the selected timezone to get the _id
        const selectedTimezone = filteredTimezones.find(tz => tz._id === value);
        if (selectedTimezone) {
          newSuggestions.schedule.timeZones = [selectedTimezone._id];
          newSuggestions.schedule.time_zone = selectedTimezone._id;
        } else {
          newSuggestions.schedule.timeZones = [value]; // Fallback to string
          newSuggestions.schedule.time_zone = value;
        }
      } else {
        newSuggestions.schedule.timeZones = [];
        newSuggestions.schedule.time_zone = undefined;
      }
      
      setSuggestions(newSuggestions);
    };

    // Filter timezones based on search
    const filteredTimezones = availableTimezones.filter(tz =>
      tz.name && tz._id && (
        tz.name.toLowerCase().includes(timezoneSearch.toLowerCase()) ||
        tz.countryName?.toLowerCase().includes(timezoneSearch.toLowerCase())
      )
    );

    // Get the first destination zone for display
    const firstDestination = suggestions.destinationZones?.[0];
    const destinationCountryName = firstDestination ? getCountryName(firstDestination) : 'Unknown';

    return (
      <div className="mb-8 p-6 rounded-xl border border-green-200 bg-green-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-500 text-white font-bold mr-3">TZ</div>
            <div>
              <h4 className="text-xl font-bold text-green-900">Time Zone</h4>
              <p className="text-sm text-green-700">
                Available timezones worldwide
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {timezoneLoading && (
              <div className="flex items-center">
                <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                <span className="text-sm text-green-600 ml-1">Loading...</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Search input */}
        {timezoneOptions.length > 0 && (
          <div className="mb-3">
            <input
              type="text"
              placeholder="Search timezones by name, country, or abbreviation..."
              value={timezoneSearch}
              onChange={(e) => setTimezoneSearch(e.target.value)}
              className="w-full p-3 rounded-lg border border-green-300 bg-white text-green-900 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
        )}
        
        <select
          className="w-full p-3 rounded-lg border border-green-300 bg-white text-green-900 font-semibold focus:outline-none focus:ring-2 focus:ring-green-400 mb-2"
          value={suggestions.schedule.time_zone || ''}
          onChange={handleTimezoneChange}
          disabled={timezoneLoading}
        >
            <option value="">Select a timezone...</option>
          {filteredTimezones.map((tz) => (
            <option key={tz._id} value={tz._id}>
              {tz.name} {tz.countryName ? `- ${tz.countryName}` : ''} (GMT{tz.offset >= 0 ? '+' : ''}{tz.offset})
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 italic text-center mt-2">
          {availableTimezones.length > 0 
            ? timezoneSearch 
              ? `Showing ${filteredTimezones.length} of ${availableTimezones.length} timezones`
              : `${availableTimezones.length} timezones available worldwide`
            : timezoneLoading 
              ? 'Loading timezones from API...'
              : 'No timezones available'
          }
        </p>
      </div>
    );
  };

  const renderDestinationZonesSection = () => {
    if (!suggestions) return null;

    const handleAddDestinationZone = async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      if (!value) return;
      
      // Use the existing addItem logic for destination zones
      addItem("destinationZones", value);
      
      // Reset select
      e.target.value = '';
    };

    const handleRemoveDestinationZone = (zone: string) => {
      const newSuggestions = { ...suggestions };
      newSuggestions.destinationZones = newSuggestions.destinationZones.filter(z => z !== zone);
      setSuggestions(newSuggestions);
    };

    const selected = suggestions.destinationZones || [];
    
    // Get all available countries from API, excluding already selected ones
    const availableCountries = allCountriesFromAPI
      .filter(country => !selected.includes(country._id))
      .map(country => ({ 
        code: country._id, 
        name: country.name.common 
      }));

    return (
      <div className="mb-8 p-6 rounded-xl border border-amber-200 bg-amber-50">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-amber-500 text-white font-bold mr-3">D</div>
          <h4 className="text-xl font-bold text-amber-900">Destination Zones</h4>
        </div>
        {/* Badges sélectionnés */}
        <div className="flex flex-wrap gap-2 mb-4">
          {selected.map(zone => (
            <span key={zone} className="flex items-center bg-amber-100 text-amber-800 text-sm font-medium pl-3 pr-2 py-1 rounded-full">
              <span>{getCountryName(zone)}</span>
              <button
                type="button"
                onClick={() => handleRemoveDestinationZone(zone)}
                className="ml-2 text-amber-600 hover:text-amber-800 rounded-full focus:outline-none focus:bg-amber-200"
                title="Remove"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </span>
          ))}
        </div>
        
        {/* Select pour ajouter */}
        <select
          className="w-full p-3 rounded-lg border border-amber-300 bg-white text-amber-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 mb-2"
          defaultValue=""
          onChange={handleAddDestinationZone}
          disabled={destinationCountriesLoading}
        >
          <option value="" disabled>
            {destinationCountriesLoading ? 'Loading countries...' : 'Add destination zone...'}
          </option>
          {availableCountries.map(({ code, name }) => (
            <option key={code} value={code}>{name}</option>
          ))}
        </select>
        <p className="text-xs text-gray-500 italic text-center mt-2">
          {destinationCountriesLoading 
            ? 'Loading countries from API...' 
            : `${availableCountries.length} countries available for selection`
          }
        </p>
      </div>
    );
  };

  const renderSectorsSection = () => {
    if (!suggestions) return null;

    const handleAddSector = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      if (!value) return;
      const newSuggestions = { ...suggestions };
      if (!newSuggestions.sectors) newSuggestions.sectors = [];
      if (!newSuggestions.sectors.includes(value)) {
        newSuggestions.sectors = [...newSuggestions.sectors, value];
        setSuggestions(newSuggestions);
      }
      // Reset select
      e.target.value = '';
    };

    const handleRemoveSector = (sector: string) => {
      const newSuggestions = { ...suggestions };
      newSuggestions.sectors = newSuggestions.sectors.filter(s => s !== sector);
      setSuggestions(newSuggestions);
    };

    const selected = suggestions.sectors || [];
    const available = predefinedOptions.sectors.filter(sector => !selected.includes(sector));

    return (
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-orange-500 text-white font-bold mr-3">S</div>
          <h4 className="text-xl font-bold text-orange-900">Sectors</h4>
        </div>
        {/* Badges sélectionnés */}
        <div className="flex flex-wrap gap-2 mb-4">
          {selected.map(sector => (
            <span key={sector} className="flex items-center bg-orange-100 text-orange-800 text-sm font-medium pl-3 pr-2 py-1 rounded-full">
              {sector}
              <button
                type="button"
                onClick={() => handleRemoveSector(sector)}
                className="ml-2 text-orange-600 hover:text-orange-800 rounded-full focus:outline-none focus:bg-orange-200"
                title="Remove"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </span>
          ))}
        </div>
        {/* Select pour ajouter */}
        <select
          className="w-full p-3 rounded-lg border border-orange-300 bg-white text-orange-900 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400 mb-2"
          defaultValue=""
          onChange={handleAddSector}
        >
          <option value="" disabled>Add sector...</option>
          {available.map(sector => (
            <option key={sector} value={sector}>{sector}</option>
          ))}
        </select>
      </div>
    );
  };

  const renderActivitiesSection = () => {
    if (!suggestions) return null;



    const handleAddActivity = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      if (!value) return;
      
      // Find the activity by label and get its ID
      const selectedActivity = activities.find(activity => activity.label === value);
      if (!selectedActivity) {
        console.error('❌ Activity not found:', value);
        return;
      }
      
      const newSuggestions = { ...suggestions };
      if (!newSuggestions.activities) newSuggestions.activities = [];
      if (!newSuggestions.activities.includes(selectedActivity.value)) {
        newSuggestions.activities = [...newSuggestions.activities, selectedActivity.value];
        setSuggestions(newSuggestions);
      }
      // Reset select
      e.target.value = '';
    };

    const handleRemoveActivity = (activity: string) => {
      const newSuggestions = { ...suggestions };
      newSuggestions.activities = newSuggestions.activities.filter(a => a !== activity);
      setSuggestions(newSuggestions);
    };

    const selected = suggestions.activities || [];
    const available = activities.filter(activity => !selected.includes(activity.value));
    

    return (
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-500 text-white font-bold mr-3">A</div>
          <h4 className="text-xl font-bold text-green-900">Activities</h4>
        </div>
        {/* Badges sélectionnés */}
        <div className="flex flex-wrap gap-2 mb-4">
          {selected.map(activityId => {
            const activityName = getActivityNameById(activityId);
            return activityName ? (
              <span key={activityId} className="flex items-center bg-green-100 text-green-800 text-sm font-medium pl-3 pr-2 py-1 rounded-full">
                {activityName}
                <button
                  type="button"
                  onClick={() => handleRemoveActivity(activityId)}
                  className="ml-2 text-green-600 hover:text-green-800 rounded-full focus:outline-none focus:bg-green-200"
                  title="Remove"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </span>
            ) : null;
          })}
        </div>
        {/* Select pour ajouter */}
        {activitiesLoading ? (
          <div className="w-full p-3 rounded-lg border border-green-300 bg-gray-50 text-gray-500 text-center">
            <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
            Loading activities from API...
          </div>
        ) : (
          <select
            className="w-full p-3 rounded-lg border border-green-300 bg-white text-green-900 font-semibold focus:outline-none focus:ring-2 focus:ring-green-400 mb-2"
            defaultValue=""
            onChange={handleAddActivity}
          >
            <option value="" disabled>Add activity...</option>
            {available.map(activity => (
              <option key={activity.value} value={activity.label}>{activity.label}</option>
            ))}
          </select>
        )}
        {!activitiesLoading && activities.length === 0 && (
          <p className="text-xs text-red-500 italic text-center mt-2">
            ⚠️ No activities available. Please check API connection.
          </p>
        )}
      </div>
    );
  };

  const renderIndustriesSection = () => {
    if (!suggestions) return null;



    const handleAddIndustry = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      if (!value) return;
      
      // Find the industry by label and get its ID
      const selectedIndustry = industries.find(industry => industry.label === value);
      if (!selectedIndustry) {
        console.error('❌ Industry not found:', value);
        return;
      }
      
      const newSuggestions = { ...suggestions };
      if (!newSuggestions.industries) newSuggestions.industries = [];
      if (!newSuggestions.industries.includes(selectedIndustry.value)) {
        newSuggestions.industries = [...newSuggestions.industries, selectedIndustry.value];
        setSuggestions(newSuggestions);
      }
      // Reset select
      e.target.value = '';
    };

    const handleRemoveIndustry = (industry: string) => {
      const newSuggestions = { ...suggestions };
      newSuggestions.industries = newSuggestions.industries.filter(i => i !== industry);
      setSuggestions(newSuggestions);
    };

    const selected = suggestions.industries || [];
    const available = industries.filter(industry => !selected.includes(industry.value));
    

    return (
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-500 text-white font-bold mr-3">I</div>
          <h4 className="text-xl font-bold text-indigo-900">Industries</h4>
        </div>
        {/* Badges sélectionnés */}
        <div className="flex flex-wrap gap-2 mb-4">
          {selected.map(industryId => {
            const industryName = getIndustryNameById(industryId);
            return industryName ? (
              <span key={industryId} className="flex items-center bg-indigo-100 text-indigo-800 text-sm font-medium pl-3 pr-2 py-1 rounded-full">
                {industryName}
                <button
                  type="button"
                  onClick={() => handleRemoveIndustry(industryId)}
                  className="ml-2 text-indigo-600 hover:text-indigo-800 rounded-full focus:outline-none focus:bg-indigo-200"
                  title="Remove"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </span>
            ) : null;
          })}
        </div>
        {/* Select pour ajouter */}
        {industriesLoading ? (
          <div className="w-full p-3 rounded-lg border border-indigo-300 bg-gray-50 text-gray-500 text-center">
            <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
            Loading industries from API...
          </div>
        ) : (
          <select
            className="w-full p-3 rounded-lg border border-indigo-300 bg-white text-indigo-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-2"
            defaultValue=""
            onChange={handleAddIndustry}
          >
            <option value="" disabled>Add industry...</option>
            {available.map(industry => (
              <option key={industry.value} value={industry.label}>{industry.label}</option>
            ))}
          </select>
        )}
        {!industriesLoading && industries.length === 0 && (
          <p className="text-xs text-red-500 italic text-center mt-2">
            ⚠️ No industries available. Please check API connection.
          </p>
        )}
      </div>
    );
  };

  const renderFlexibilitySection = () => {
    if (!suggestions?.schedule) return null;

    const handleAddFlexibility = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      if (!value) return;
      const newSuggestions = { ...suggestions };
      if (!newSuggestions.schedule.flexibility) newSuggestions.schedule.flexibility = [];
      if (!newSuggestions.schedule.flexibility.includes(value)) {
        newSuggestions.schedule.flexibility = [...newSuggestions.schedule.flexibility, value];
        setSuggestions(newSuggestions);
      }
      // Reset select
      e.target.value = '';
    };

    const handleRemoveFlexibility = (option: string) => {
      const newSuggestions = { ...suggestions };
      newSuggestions.schedule.flexibility = newSuggestions.schedule.flexibility.filter(f => f !== option);
      setSuggestions(newSuggestions);
    };

    const selected = suggestions.schedule.flexibility || [];
    const available = FLEXIBILITY_SELECT_OPTIONS.filter(opt => !selected.includes(opt));

    return (
      <div className="mb-8 p-6 rounded-xl border border-purple-200 bg-purple-50">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-500 text-white font-bold mr-3">F</div>
          <h4 className="text-xl font-bold text-purple-900">Schedule Flexibility</h4>
        </div>
        {/* Badges sélectionnés */}
        <div className="flex flex-wrap gap-2 mb-4">
          {selected.map(option => (
            <span key={option} className="flex items-center bg-purple-100 text-purple-800 text-sm font-medium pl-3 pr-2 py-1 rounded-full">
              {option}
              <button
                type="button"
                onClick={() => handleRemoveFlexibility(option)}
                className="ml-2 text-purple-600 hover:text-purple-800 rounded-full focus:outline-none focus:bg-purple-200"
                title="Remove"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </span>
          ))}
        </div>
        {/* Select pour ajouter */}
        <select
          className="w-full p-3 rounded-lg border border-purple-300 bg-white text-purple-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400 mb-2"
          defaultValue=""
          onChange={handleAddFlexibility}
        >
          <option value="" disabled>Add flexibility option...</option>
          {available.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <p className="text-xs text-gray-500 italic text-center mt-2">
          Select all applicable schedule flexibility options
        </p>
      </div>
    );
  };

  const renderSenioritySection = () => {
    if (!suggestions) return null;

    const handleSeniorityLevelChange = (level: string) => {
      const newSuggestions = { ...suggestions };
      newSuggestions.seniority = {
        ...newSuggestions.seniority,
        level: level,
      };
      setSuggestions(newSuggestions);
    };

    const handleYearsExperienceChange = (years: string) => {
      const newSuggestions = { ...suggestions };
      const numericValue = parseInt(years, 10);
      if (!isNaN(numericValue)) {
        newSuggestions.seniority = {
          ...newSuggestions.seniority,
          yearsExperience: numericValue,
        };
        setSuggestions(newSuggestions);
      }
    };

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-blue-900">
            Seniority Level
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Level
            </label>
            <select
              value={suggestions.seniority?.level || ""}
              onChange={(e) => handleSeniorityLevelChange(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select level...</option>
              {predefinedOptions.basic.seniorityLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Years of Experience
            </label>
            <input
              type="number"
              value={suggestions.seniority?.yearsExperience || ""}
              onChange={(e) => handleYearsExperienceChange(e.target.value)}
              placeholder="e.g. 5"
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderDescriptionSection = () => {
    if (!suggestions) return null;

    const handleDescriptionChange = (newDescription: string) => {
      const newSuggestions = { ...suggestions };
      newSuggestions.description = newDescription;
      setSuggestions(newSuggestions);
    };

    return (
      <div className="mb-8">
                  <textarea
            value={suggestions.description || ""}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder="Enter a detailed description of the role, responsibilities, and what success looks like..."
            rows={8}
            className="w-full p-4 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-700 leading-relaxed"
          />
          
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {suggestions.description ? `${suggestions.description.length} characters` : "0 characters"}
            </div>
            <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              Detailed description helps attract the right candidates
            </div>
          </div>
      </div>
    );
  };

  const renderCommissionSection = () => {
    if (!suggestions) return null;


    const updateCommissionOption = (
      index: number,
      field: string,
      value: string | number
    ) => {
      const newSuggestions = { ...suggestions };
      if (newSuggestions.commission) {
        // Correction : parser uniquement les champs numériques
        const numericFields = [
          'amount', 'baseAmount', 'bonusAmount'
        ];
        if (field.includes(".")) {
          const [parent, child] = field.split(".");
          if (numericFields.includes(child)) {
            const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
            (newSuggestions.commission as any)[parent][child] = numericValue;
          } else {
            (newSuggestions.commission as any)[parent][child] = value;
          }
        } else {
          if (numericFields.includes(field)) {
            const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
            (newSuggestions.commission as any)[field] = numericValue;
          } else {
            (newSuggestions.commission as any)[field] = value;
          }
        }
        setSuggestions(newSuggestions);
      }
    };


    return (
      <div className="mb-8">
        {suggestions.commission ? (
          <div className="space-y-8">
            {(() => {
              const option = suggestions.commission;
              const index = 0;
              return (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Base Configuration */}
                <div className="mb-8">
                  <h6 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                    </div>
                    Commission Per Call
                  </h6>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={
                            typeof option.baseAmount === "number"
                              ? option.baseAmount
                              : option.baseAmount
                              ? parseFloat(option.baseAmount)
                              : ""
                          }
                          onChange={(e) =>
                            updateCommissionOption(
                              index,
                              "baseAmount",
                              e.target.value
                            )
                          }
                          placeholder="e.g. 2500"
                          className="w-full p-4 pr-16 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
                        />
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold text-sm">
                          {option.currency || "EUR"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Minimum Volume */}
                <div className="mb-8 p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border-2 border-orange-100">
                  <h6 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg mr-3">
                      <Gauge className="w-5 h-5 text-orange-600" />
                    </div>
                    Minimum Volume Requirements
                  </h6>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700">
                        Target Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={
                          typeof option.minimumVolume?.amount === "number"
                            ? option.minimumVolume.amount
                            : parseFloat(option.minimumVolume?.amount) || ""
                        }
                        onChange={(e) =>
                          updateCommissionOption(
                            index,
                            "minimumVolume.amount",
                            e.target.value
                          )
                        }
                        placeholder="e.g. 100"
                        className="w-full p-4 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all duration-200 hover:border-orange-300"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700">
                        Unit Type
                      </label>
                      <select
                        value={option.minimumVolume?.unit || ""}
                        onChange={(e) =>
                          updateCommissionOption(
                            index,
                            "minimumVolume.unit",
                            e.target.value
                          )
                        }
                        className="w-full p-4 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all duration-200 hover:border-orange-300"
                      >
                        <option value="">Select unit...</option>
                        <option value="Calls">Calls</option>
                        <option value="Sales">Sales</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700">
                        Period
                      </label>
                      <select
                        value={option.minimumVolume?.period || ""}
                        onChange={(e) =>
                          updateCommissionOption(
                            index,
                            "minimumVolume.period",
                            e.target.value
                          )
                        }
                        className="w-full p-4 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all duration-200 hover:border-orange-300"
                      >
                        <option value="">Select period...</option>
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Bonus Configuration */}
                <div className="mb-8 p-6 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl border-2 border-yellow-100">
                  <h6 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                      <Award className="w-5 h-5 text-yellow-600" />
                    </div>
                    Bonus & Incentives
                  </h6>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700">
                        Bonus Type
                      </label>
                      <select
                        value={option.bonus || "Performance Bonus"}
                        onChange={(e) =>
                          updateCommissionOption(index, "bonus", e.target.value)
                        }
                        className="w-full p-4 border-2 border-yellow-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white transition-all duration-200 hover:border-yellow-300"
                      >
                        {BONUS_TYPES.map((bonusType) => (
                          <option key={bonusType} value={bonusType}>
                            {bonusType}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700">
                        Bonus Amount
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={
                            typeof option.bonusAmount === "number"
                              ? option.bonusAmount
                              : option.bonusAmount
                              ? parseFloat(option.bonusAmount)
                              : ""
                          }
                          onChange={(e) =>
                            updateCommissionOption(
                              index,
                              "bonusAmount",
                              e.target.value
                            )
                          }
                          placeholder="e.g. 500"
                          className="w-full p-4 pr-16 border-2 border-yellow-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 hover:border-yellow-300"
                        />
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold text-sm">
                          {option.currency || "EUR"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Currency */}
                <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-100">
                  <h6 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <Globe2 className="w-5 h-5 text-blue-600" />
                    </div>
                    Currency Settings
                  </h6>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700">
                        Currency
                      </label>
                      <select
                        value={option.currency || ""}
                        onChange={(e) =>
                          updateCommissionOption(
                            index,
                            "currency",
                            e.target.value
                          )
                        }
                        className="w-full p-4 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200 hover:border-blue-300"
                      >
                        <option value="EUR">EUR (€)</option>
                        <option value="USD">USD ($)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="CAD">CAD (C$)</option>
                        <option value="AUD">AUD (A$)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Transaction Commission */}
                <div className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border-2 border-purple-100">
                  <h6 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                      <DollarSign className="w-5 h-5 text-purple-600" />
                    </div>
                    Transaction Commission
                  </h6>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700">
                        Commission Type
                      </label>
                      <select
                        value={
                          option.transactionCommission?.type || "Fixed Amount"
                        }
                        onChange={(e) =>
                          updateCommissionOption(
                            index,
                            "transactionCommission.type",
                            e.target.value
                          )
                        }
                        className="w-full p-4 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all duration-200 hover:border-purple-300"
                      >
                        {TRANSACTION_TYPES.map((transactionType) => (
                          <option key={transactionType} value={transactionType}>
                            {transactionType}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700">
                        Commission Amount
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={
                            typeof option.transactionCommission?.amount ===
                            "number"
                              ? option.transactionCommission.amount
                              : parseFloat(
                                  option.transactionCommission?.amount
                                ) || ""
                          }
                          onChange={(e) =>
                            updateCommissionOption(
                              index,
                              "transactionCommission.amount",
                              e.target.value
                            )
                          }
                          placeholder="e.g. 25.50"
                          className="w-full p-4 pr-16 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:border-purple-300"
                        />
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold text-sm">
                          {option.currency || "EUR"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              );
            })()}
          </div>
        ) : (
          <div className="text-center py-16 bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-2xl border-2 border-dashed border-gray-300 shadow-lg">
            <div className="p-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
              <DollarSign className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              No Commission Options
            </h3>
            <p className="text-gray-600 mb-8 w-full mx-auto text-lg leading-relaxed">
              Create commission options to define how your team will be
              compensated for their performance and achievements.
            </p>
            <button
              onClick={addCommissionOption}
              className="flex items-center space-x-3 mx-auto px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-lg transform hover:scale-105"
            >
              <Plus className="w-6 h-6" />
              <span>Add Commission Option</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderSkillsSection = () => {
    if (!suggestions) return null;

    // Helper: get ObjectId for a skill name and type
    function getSkillObjectId(skillName: string, type: string): string | undefined {
      let arr: any[] = [];
      if (type === 'soft') arr = softSkills;
      if (type === 'professional') arr = professionalSkills;
      if (type === 'technical') arr = technicalSkills;
      const found = arr.find(s => s.name === skillName);
      return found?._id;
    }

    // Note: Skills migration is now handled at the top level of the component

    // Mapping for display: always show ObjectId if possible
    const skillsWithObjectIds: any = { ...suggestions.skills };
    ['soft', 'professional', 'technical'].forEach(type => {
      skillsWithObjectIds[type] = ((suggestions.skills as any)[type] as any[]).map(s => {
        if (typeof s.skill === 'string') {
          const oid = getSkillObjectId(s.skill, type);
          return { ...s, skill: oid ? { $oid: oid } : s.skill };
        }
        return s;
      });
    });

    const addSkill = (skillType: string, skill: string, level: number = 1) => {
      
      const newSuggestions = { ...suggestions };
      if (!newSuggestions.skills) {
        newSuggestions.skills = {
          languages: [],
          soft: [],
          professional: [],
          technical: [],
          certifications: [],
        };
      }

      switch (skillType) {
        case "languages":
          // Find the language by ID to get the code
          const selectedLanguage = languages.find(l => l.value === skill);
          if (selectedLanguage) {
            newSuggestions.skills.languages.push({
              language: selectedLanguage.value, // Store ID
              proficiency: LANGUAGE_LEVELS[level - 1]?.value || "B1",
              iso639_1: selectedLanguage.code, // Use correct code
            });
          } else {
            console.warn(`Language with ID "${skill}" not found. Skipping addition.`);
            return; // Exit early without adding the skill
          }
          break;
        case "soft":
        case "professional":
        case "technical":
          // For skills, we need to find the skill object to get the ObjectId
          let skillArray: Array<{_id: string, name: string, description: string, category: string}>;
          switch (skillType) {
            case "soft":
              skillArray = softSkills;
              break;
            case "professional":
              skillArray = professionalSkills;
              break;
            case "technical":
              skillArray = technicalSkills;
              break;
            default:
              skillArray = [];
          }
          
          // Find the skill by ObjectId (skill parameter is now the ObjectId)
          const skillObject = skillArray.find(s => s._id === skill);
          
          if (skillObject) {
            const skillData = { 
              skill: { $oid: skillObject._id }, // Store MongoDB ObjectId format
              level,
              details: skillObject.description || '' // Add details field
            };
            (newSuggestions.skills as any)[skillType].push(skillData);
          } else {
            // Don't add skills that don't exist in the database
            return; // Exit early without adding the skill
          }
          break;
      }
      
      setSuggestions(newSuggestions);
    };

    const updateSkill = (skillType: string, index: number, field: string, value: string | number) => {
      
      const newSuggestions = { ...suggestions };
      if (!newSuggestions.skills) return;

      switch (skillType) {
        case "languages":
          if (field === "language") {
            // Find the language by ID to get the code
            const selectedLanguage = languages.find(l => l.value === value);
            if (selectedLanguage) {
              newSuggestions.skills.languages[index].language = selectedLanguage.value; // Store ID
              newSuggestions.skills.languages[index].iso639_1 = selectedLanguage.code; // Update code
            } else {
              console.warn(`Language with ID "${value}" not found. Skipping update.`);
              return;
            }
          } else if (field === "proficiency") {
            newSuggestions.skills.languages[index].proficiency = value as string;
          }
          break;
        case "soft":
        case "professional":
        case "technical":
          if (field === "skill") {
            // For skills, we need to find the skill object to get the ObjectId
            let skillArray: Array<{_id: string, name: string, description: string, category: string}>;
            switch (skillType) {
              case "soft":
                skillArray = softSkills;
                break;
              case "professional":
                skillArray = professionalSkills;
                break;
              case "technical":
                skillArray = technicalSkills;
                break;
              default:
                skillArray = [];
            }
            
            // Find the skill by ObjectId (value parameter is now the ObjectId)
            const skillObject = skillArray.find(s => s._id === value);
            
            
            if (skillObject) {
              (newSuggestions.skills as any)[skillType][index].skill = { $oid: skillObject._id }; // Store MongoDB ObjectId format
              (newSuggestions.skills as any)[skillType][index].details = skillObject.description || ''; // Update details field
            } else {
              // Don't update with skills that don't exist in the database
              return; // Exit early without updating the skill
            }
          } else if (field === "level") {
            (newSuggestions.skills as any)[skillType][index].level = value as number;
          }
          break;
      }
      setSuggestions(newSuggestions);
    };

    const deleteSkill = (skillType: string, index: number) => {
      
      const arr = (suggestions.skills as any)[skillType];
      if (arr && arr[index]) {
        const skillEntry = arr[index];
        if (skillEntry && skillEntry.skill && skillEntry.skill.$oid) {
        } else {
        }
      }
      const newSuggestions = { ...suggestions };
      if (!newSuggestions.skills) return;
      switch (skillType) {
        case "languages":
          newSuggestions.skills.languages.splice(index, 1);
          break;
        case "soft":
          newSuggestions.skills.soft.splice(index, 1);
          break;
        case "professional":
          newSuggestions.skills.professional.splice(index, 1);
          break;
        case "technical":
          newSuggestions.skills.technical.splice(index, 1);
          break;
      }
      setSuggestions(newSuggestions);
    };

    const renderSkillCard = (skillType: string, items: any[], title: string, icon: React.ReactNode) => {
      const currentItems = items || [];

      const getSkillOptions = (skillType: string) => {
        switch (skillType) {
          case "languages":
            return languages
              .filter(lang => !currentItems.some(item => item.language === lang.value))
              .map(lang => ({ id: lang.value, name: lang.label }));
          case "professional":
            return professionalSkills
              .filter(skill => !currentItems.some(item => {
                if (!item || !item.skill) return false;
                const skillId = typeof item.skill === 'string' ? item.skill : (item.skill && typeof item.skill === 'object' && item.skill.$oid ? item.skill.$oid : null);
                return skillId === skill._id;
              }))
              .map(skill => ({ id: skill._id, name: skill.name }));
          case "technical":
            return technicalSkills
              .filter(skill => !currentItems.some(item => {
                if (!item || !item.skill) return false;
                const skillId = typeof item.skill === 'string' ? item.skill : (item.skill && typeof item.skill === 'object' && item.skill.$oid ? item.skill.$oid : null);
                return skillId === skill._id;
              }))
              .map(skill => ({ id: skill._id, name: skill.name }));
          case "soft":
            return softSkills
              .filter(skill => !currentItems.some(item => {
                if (!item || !item.skill) return false;
                const skillId = typeof item.skill === 'string' ? item.skill : (item.skill && typeof item.skill === 'object' && item.skill.$oid ? item.skill.$oid : null);
                return skillId === skill._id;
              }))
              .map(skill => ({ id: skill._id, name: skill.name }));
          default:
            return [];
        }
      };

      const skillOptions = getSkillOptions(skillType);

      return (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                {icon}
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-800">{title}</h4>
                <p className="text-sm text-gray-600">
                  {skillType === "languages" && `${languages.length} available`}
                  {skillType === "professional" && `${professionalSkills.length} available`}
                  {skillType === "technical" && `${technicalSkills.length} available`}
                  {skillType === "soft" && `${softSkills.length} available`}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingSection(skillType);
                setEditingIndex(-1);
                setEditValue("");
              }}
              className="flex items-center space-x-1 text-blue-700 hover:text-blue-900 font-semibold text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>

          {currentItems.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentItems
                .map((item, index) => {
                  let skillName = '';
                  if (skillType === "languages") {
                    skillName = getLanguageNameById(item.language);
                  } else {
                    let skillArray: Array<{_id: string, name: string, description: string, category: string}>;
                    switch (skillType) {
                      case "soft":
                        skillArray = softSkills;
                        break;
                      case "professional":
                        skillArray = professionalSkills;
                        break;
                      case "technical":
                        skillArray = technicalSkills;
                        break;
                      default:
                        skillArray = [];
                    }
                    const skillId = typeof item.skill === 'string' ? item.skill : (item.skill && typeof item.skill === 'object' && item.skill.$oid ? item.skill.$oid : null);
                    if (skillId) {
                      const skillObject = skillArray.find(s => s._id === skillId);
                      skillName = skillObject ? skillObject.name : '';
                    } else if (item.skill && typeof item.skill === 'object' && item.skill.name) {
                      skillName = item.skill.name;
                    }
                  }
                  if (!skillName) return null;
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      {editingSection === skillType && editingIndex === index ? (
                        <div className="space-y-3">
                          <select
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            autoFocus
                          >
                            <option value="">Select {skillType === "languages" ? "language" : "skill"}...</option>
                            {skillType === "languages" 
                              ? languages.map((lang) => (
                                  <option key={lang.value} value={lang.value}>
                                    {lang.label}
                                  </option>
                                ))
                              : skillType === "professional"
                              ? professionalSkills.map((skill) => (
                                  <option key={skill._id} value={skill._id}>
                                    {skill.name}
                                  </option>
                                ))
                              : skillType === "technical"
                              ? technicalSkills.map((skill) => (
                                  <option key={skill._id} value={skill._id}>
                                    {skill.name}
                                  </option>
                                ))
                              : softSkills.map((skill) => (
                                  <option key={skill._id} value={skill._id}>
                                    {skill.name}
                                  </option>
                                ))
                            }
                          </select>
                          {skillType === "languages" ? (
                            <select
                              value={item.proficiency || "B1"}
                              onChange={(e) => updateSkill(skillType, index, "proficiency", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              {LANGUAGE_LEVELS.map((level) => (
                                <option key={level.value} value={level.value}>
                                  {level.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <select
                              value={item.level || 1}
                              onChange={(e) => updateSkill(skillType, index, "level", parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              {SKILL_LEVELS.map((level) => (
                                <option key={level.value} value={level.value}>
                                  {level.label}
                                </option>
                              ))}
                            </select>
                          )}
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                if (editValue.trim()) {
                                  updateSkill(skillType, index, skillType === "languages" ? "language" : "skill", editValue.trim());
                                  setEditingSection(null);
                                  setEditingIndex(null);
                                  setEditValue("");
                                }
                              }}
                              className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="flex-1 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h5 className="font-semibold text-gray-800">{skillName}</h5>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => {
                                  setEditingSection(skillType);
                                  setEditingIndex(index);
                                  if (skillType === "languages") {
                                    // Find the language name by ID for display
                                    const languageObj = languages.find(l => l.value === item.language);
                                    setEditValue(languageObj ? languageObj.value : item.language);
                                  } else {
                                    let skillArray: Array<{_id: string, name: string, description: string, category: string}>;
                                    switch (skillType) {
                                      case "soft":
                                        skillArray = softSkills;
                                        break;
                                      case "professional":
                                        skillArray = professionalSkills;
                                        break;
                                      case "technical":
                                        skillArray = technicalSkills;
                                        break;
                                      default:
                                        skillArray = [];
                                    }
                                    const skillId = typeof item.skill === 'string' ? item.skill : (item.skill && typeof item.skill === 'object' && item.skill.$oid ? item.skill.$oid : null);
                                    setEditValue(skillId || '');
                                  }
                                }}
                                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteSkill(skillType, index)}
                                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Level:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              skillType === "languages" 
                                ? item.proficiency?.includes("C") 
                                  ? "bg-green-100 text-green-800"
                                  : item.proficiency?.includes("B") 
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                                : item.level >= 4 
                                ? "bg-purple-100 text-purple-800"
                                : item.level >= 3 
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}>
                              {skillType === "languages" 
                                ? LANGUAGE_LEVELS.find(l => l.value === item.proficiency)?.label || "B1 - Intermediate"
                                : SKILL_LEVELS.find(l => l.value === item.level)?.label || "Basic"
                              }
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}

          {editingSection === skillType && editingIndex === -1 && (
            <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
              <div className="space-y-4">
                {skillsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                    <span className="text-gray-600">Loading skills from API...</span>
                  </div>
                ) : (
                  <select
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                  >
                    <option value="">Select {skillType === "languages" ? "language" : "skill"}...</option>
                    {skillType === "languages" 
                      ? skillOptions.map((option: any) => (
                          <option key={option.id} value={option.id}>
                            {option.name}
                          </option>
                        ))
                      : skillType === "professional"
                      ? professionalSkills
                          .filter(skill => !currentItems.some(item => {
                            if (!item || !item.skill) return false;
                            const skillId = typeof item.skill === 'string' ? item.skill : (item.skill && typeof item.skill === 'object' && item.skill.$oid ? item.skill.$oid : null);
                            return skillId === skill._id;
                          }))
                          .map((skill) => (
                            <option key={skill._id} value={skill._id}>
                              {skill.name}
                            </option>
                          ))
                      : skillType === "technical"
                      ? technicalSkills
                          .filter(skill => !currentItems.some(item => {
                            if (!item || !item.skill) return false;
                            const skillId = typeof item.skill === 'string' ? item.skill : (item.skill && typeof item.skill === 'object' && item.skill.$oid ? item.skill.$oid : null);
                            return skillId === skill._id;
                          }))
                          .map((skill) => (
                            <option key={skill._id} value={skill._id}>
                              {skill.name}
                            </option>
                          ))
                      : softSkills
                          .filter(skill => !currentItems.some(item => {
                            if (!item || !item.skill) return false;
                            const skillId = typeof item.skill === 'string' ? item.skill : (item.skill && typeof item.skill === 'object' && item.skill.$oid ? item.skill.$oid : null);
                            return skillId === skill._id;
                          }))
                          .map((skill) => (
                            <option key={skill._id} value={skill._id}>
                              {skill.name}
                            </option>
                          ))
                    }
                  </select>
                )}
                {skillType === "languages" ? (
                  <select
                    defaultValue="B1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {LANGUAGE_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    defaultValue={1}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {SKILL_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                )}
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      if (editValue.trim()) {
                        if (skillType === "languages") {
                          const level = 2; // Default to B1 for languages (index 2)
                          addSkill(skillType, editValue.trim(), level);
                          setEditValue("");
                          setEditingSection(null);
                          setEditingIndex(null);
                        } else {
                          // For skills, editValue should already be the ObjectId
                          // Verify that the skill exists in the database before adding
                          let skillArray: Array<{_id: string, name: string, description: string, category: string}>;
                          switch (skillType) {
                            case "soft":
                              skillArray = softSkills;
                              break;
                            case "professional":
                              skillArray = professionalSkills;
                              break;
                            case "technical":
                              skillArray = technicalSkills;
                              break;
                            default:
                              skillArray = [];
                          }
                          
                          const skillExists = skillArray.some(s => s._id === editValue.trim());
                          if (skillExists) {
                            const level = 1; // Default to Basic for skills
                            addSkill(skillType, editValue.trim(), level);
                            setEditValue("");
                            setEditingSection(null);
                            setEditingIndex(null);
                          }
                        }
                      }
                    }}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Add {skillType === "languages" ? "Language" : "Skill"}
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="space-y-8">
        {renderSkillCard(
          "languages",
          suggestions.skills?.languages || [],
          "Languages",
          <Globe2 className="w-5 h-5 text-blue-600" />
        )}
        {renderSkillCard(
          "professional",
          suggestions.skills?.professional || [],
          "Professional Skills",
          <Briefcase className="w-5 h-5 text-green-600" />
        )}
        {renderSkillCard(
          "technical",
          suggestions.skills?.technical || [],
          "Technical Skills",
          <Target className="w-5 h-5 text-purple-600" />
        )}
        {renderSkillCard(
          "soft",
          suggestions.skills?.soft || [],
          "Soft Skills",
          <Users className="w-5 h-5 text-orange-600" />
        )}
      </div>
    );
  };

  const renderTeamSection = () => {
    if (!suggestions) return null;

    const addTeamRole = () => {
      const newSuggestions = { ...suggestions };
      if (!newSuggestions.team) {
        newSuggestions.team = {
          size: 1,
          structure: [],
          territories: [],
          reporting: {
            to: "Project Manager",
            frequency: "Weekly",
          },
          collaboration: ["Daily standups", "Weekly reviews"],
        };
      }

      const newRole = {
        roleId: "Agent",
        count: 1,
        seniority: {
          level: "Mid-Level",
          yearsExperience: 3,
        },
      };

      newSuggestions.team.structure.push(newRole);
      newSuggestions.team.size = newSuggestions.team.structure.reduce((sum, role) => {
        const roleCount = typeof role === 'object' && role !== null ? role.count : 1;
        return sum + roleCount;
      }, 0);
      setSuggestions(newSuggestions);
    };

    const updateTeamRole = (index: number, field: string, value: string | number) => {
      const newSuggestions = { ...suggestions };
      if (!newSuggestions.team) return;

      // Ensure the role exists and has proper structure
      if (!newSuggestions.team.structure[index]) {
        newSuggestions.team.structure[index] = {
          roleId: "Agent",
          count: 1,
          seniority: {
            level: "Mid-Level",
            yearsExperience: 3,
          },
        };
      } else {
        // Check if role is a string and convert it to proper object structure
        const currentRole = newSuggestions.team.structure[index];
        if (typeof currentRole === 'string') {
          newSuggestions.team.structure[index] = {
            roleId: currentRole,
            count: 1,
            seniority: {
              level: "Mid-Level",
              yearsExperience: 3,
            },
          };
        } else if (typeof currentRole === 'object' && currentRole !== null) {
          // Ensure role has required properties
          if (!currentRole.roleId) {
            newSuggestions.team.structure[index] = {
              ...currentRole,
              roleId: "Agent",
              count: currentRole.count || 1,
              seniority: currentRole.seniority || {
                level: "Mid-Level",
                yearsExperience: 3,
              },
            };
          } else if (!currentRole.seniority) {
            newSuggestions.team.structure[index] = {
              ...currentRole,
              seniority: {
                level: "Mid-Level",
                yearsExperience: 3,
              },
            };
          }
        } else {
          // If role is null, undefined, or invalid, replace with default structure
          newSuggestions.team.structure[index] = {
            roleId: "Agent",
            count: 1,
            seniority: {
              level: "Mid-Level",
              yearsExperience: 3,
            },
          };
        }
      }

      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        if (child === "yearsExperience") {
          (newSuggestions.team.structure[index] as any)[parent][child] = parseInt(value as string) || 0;
        } else {
          (newSuggestions.team.structure[index] as any)[parent][child] = value;
        }
      } else {
        if (field === "count") {
          newSuggestions.team.structure[index].count = parseInt(value as string) || 1;
        } else {
          newSuggestions.team.structure[index].roleId = value as string;
        }
      }

      // Recalculate total team size
      newSuggestions.team.size = newSuggestions.team.structure.reduce((sum, role) => {
        const roleCount = typeof role === 'object' && role !== null ? role.count : 1;
        return sum + roleCount;
      }, 0);
      setSuggestions(newSuggestions);
    };

    const deleteTeamRole = (index: number) => {
      const newSuggestions = { ...suggestions };
      if (!newSuggestions.team) return;

      newSuggestions.team.structure.splice(index, 1);
      newSuggestions.team.size = newSuggestions.team.structure.reduce((sum, role) => {
        const roleCount = typeof role === 'object' && role !== null ? role.count : 1;
        return sum + roleCount;
      }, 0);
      setSuggestions(newSuggestions);
    };

    const addTerritory = (territory: string) => {
      if (!suggestions || !territory) return;
      
      const newSuggestions = { ...suggestions };
      if (!newSuggestions.team) {
        newSuggestions.team = {
          size: 1,
          structure: [],
          territories: [],
          reporting: {
            to: "Project Manager",
            frequency: "Weekly",
          },
          collaboration: ["Daily standups", "Weekly reviews"],
        };
      }
      
      // Ensure territories array exists
      if (!newSuggestions.team.territories) {
        newSuggestions.team.territories = [];
      }
      
      // Only add if not already present
      if (!newSuggestions.team.territories.includes(territory)) {
        newSuggestions.team.territories.push(territory);
        setSuggestions(newSuggestions);
      }
    };

    const removeTerritory = (territoryToRemove: string) => {
      if (!suggestions) return;
      const newSuggestions = { ...suggestions };
      if (newSuggestions.team && newSuggestions.team.territories) {
        newSuggestions.team.territories = newSuggestions.team.territories.filter(
          (territory) => territory !== territoryToRemove
        );
        setSuggestions(newSuggestions);
      }
    };

    return (
      <div className="space-y-8">
        {/* Team Size Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-800">Team Size</h4>
                <p className="text-sm text-gray-600">
                  Total members: {suggestions.team?.size || 0}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-3">
                <div className="text-center">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Total Size</label>
                  <input
                    type="number"
                    min="1"
                    value={suggestions.team?.size || 0}
                    onChange={(e) => {
                      const newSize = parseInt(e.target.value) || 0;
                      const newSuggestions = { ...suggestions };
                      if (!newSuggestions.team) {
                        newSuggestions.team = {
                          size: newSize,
                          structure: [],
                          territories: [],
                          reporting: {
                            to: "Project Manager",
                            frequency: "Weekly",
                          },
                          collaboration: ["Daily standups", "Weekly reviews"],
                        };
                      } else {
                        newSuggestions.team.size = newSize;
                        // Adjust the first role's count to match the new total size
                        if (newSuggestions.team.structure.length > 0) {
                          newSuggestions.team.structure[0].count = newSize;
                        } else {
                          // If no roles exist, create a default role
                          newSuggestions.team.structure.push({
                            roleId: "Agent",
                            count: newSize,
                            seniority: {
                              level: "Mid-Level",
                              yearsExperience: 3,
                            },
                          });
                        }
                      }
                      setSuggestions(newSuggestions);
                    }}
                    className="w-20 text-center text-2xl font-bold text-blue-600 bg-white border-2 border-blue-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Team Size Breakdown */}
          {suggestions.team?.structure && suggestions.team.structure.length > 0 && (
            <div className="mt-4 pt-4 border-t border-blue-200">
              <h5 className="text-sm font-semibold text-gray-700 mb-3">Team Breakdown:</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {suggestions.team.structure.map((role, index) => {
                  // Handle case where role might be a string
                  const roleId = typeof role === 'string' ? role : (role?.roleId || 'Unknown');
                  const roleCount = typeof role === 'object' && role !== null ? role.count : 1;
                  const seniorityLevel = typeof role === 'object' && role !== null ? (role.seniority?.level || 'Not specified') : 'Not specified';
                  
                  return (
                    <div key={index} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-blue-100">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">
                          {roleId}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {roleCount} {roleCount === 1 ? 'member' : 'members'}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          {seniorityLevel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Team Size Statistics */}
          <div className="mt-4 pt-4 border-t border-blue-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {suggestions.team?.structure?.length || 0}
                </div>
                <div className="text-xs text-gray-500">Different Roles</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {suggestions.team?.structure?.filter(role => {
                    if (typeof role === 'string') return false;
                    if (typeof role !== 'object' || role === null) return false;
                    return role.seniority?.level?.includes('Senior') || role.seniority?.level?.includes('Lead') || role.seniority?.level?.includes('Manager');
                  }).reduce((sum, role) => {
                    const roleCount = typeof role === 'object' && role !== null ? role.count : 1;
                    return sum + roleCount;
                  }, 0) || 0}
                </div>
                <div className="text-xs text-gray-500">Senior Members</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">
                  {suggestions.team?.structure?.filter(role => {
                    if (typeof role === 'string') return false;
                    if (typeof role !== 'object' || role === null) return false;
                    return role.seniority?.level?.includes('Junior') || role.seniority?.level?.includes('Entry') || role.seniority?.level?.includes('Trainee');
                  }).reduce((sum, role) => {
                    const roleCount = typeof role === 'object' && role !== null ? role.count : 1;
                    return sum + roleCount;
                  }, 0) || 0}
                </div>
                <div className="text-xs text-gray-500">Junior Members</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {suggestions.team?.territories?.length || 0}
                </div>
                <div className="text-xs text-gray-500">Territories</div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Roles */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Briefcase className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="text-lg font-bold text-gray-800">Team Roles</h4>
            </div>
            <button
              onClick={addTeamRole}
              className="flex items-center space-x-1 text-blue-700 hover:text-blue-900 font-semibold text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Role</span>
            </button>
          </div>

          {suggestions.team?.structure && suggestions.team.structure.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {suggestions.team.structure.map((role, index) => {
                // Handle case where role might be a string
                const roleId = typeof role === 'string' ? role : (role?.roleId || 'Agent');
                const roleCount = typeof role === 'object' && role !== null ? role.count : 1;
                const seniorityLevel = typeof role === 'object' && role !== null ? (role.seniority?.level || 'Mid-Level') : 'Mid-Level';
                const yearsExperience = typeof role === 'object' && role !== null ? (role.seniority?.yearsExperience || 3) : 3;
                
                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-semibold text-gray-800">Role #{index + 1}</h5>
                      <button
                        onClick={() => deleteTeamRole(index)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Role Type
                        </label>
                        <select
                          value={roleId}
                          onChange={(e) => updateTeamRole(index, "roleId", e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          {TEAM_ROLES.map((teamRole) => (
                            <option key={teamRole} value={teamRole}>
                              {teamRole}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Number of Members
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={roleCount}
                          onChange={(e) => updateTeamRole(index, "count", e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <select
                            value={seniorityLevel}
                            onChange={(e) => updateTeamRole(index, "seniority.level", e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          >
                            {predefinedOptions.basic.seniorityLevels.map((level) => (
                              <option key={level} value={level}>
                                {level}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Years Experience
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={yearsExperience}
                            onChange={(e) => updateTeamRole(index, "seniority.yearsExperience", e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
              <div className="p-4 bg-white rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-sm">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Team Roles Defined
              </h3>
              <p className="text-gray-500 mb-6 w-full mx-auto">
                Add team roles to define the structure and responsibilities of your team members.
              </p>
              <button
                onClick={addTeamRole}
                className="flex items-center space-x-1 text-blue-700 hover:text-blue-900 font-semibold text-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Team Role</span>
              </button>
            </div>
          )}
        </div>

        {/* Territories */}
        <div>
          <h4 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <Globe2 className="w-5 h-5 text-purple-600" />
            </div>
            Territories
          </h4>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestions.team?.territories?.map((territory) => (
              <div
                key={territory}
                className="flex items-center bg-purple-100 text-purple-800 text-sm font-medium pl-3 pr-2 py-1 rounded-full"
              >
                {getTerritoryName(territory)}
                <button
                  onClick={() => removeTerritory(territory)}
                  className="ml-2 text-purple-600 hover:text-purple-800 rounded-full focus:outline-none focus:bg-purple-200"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          <select
            onChange={(e) => {
              if (e.target.value) {
                addTerritory(e.target.value);
                e.target.value = ""; // Reset select
              }
            }}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            defaultValue=""
            disabled={territoriesLoading}
          >
            <option value="" disabled>
              {territoriesLoading ? "Loading territories..." : "Add a territory..."}
            </option>
            {territoriesFromAPI.filter(
              (country: Country) => !suggestions.team?.territories?.includes(country._id)
            ).map((country: Country) => (
              <option key={country._id} value={country._id}>
                {country.name.common}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  if (loading && !props.initialSuggestions) {
    return (
      <div className="flex flex-col justify-center items-center h-screen from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center max-w-md">
          <Logo className="mb-6" />
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 animate-fade-in">
              Processing Your Request
            </h2>
            <p className="text-gray-600 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              Our AI is analyzing your requirements and generating personalized suggestions...
            </p>
            {/* Professional loading dots */}
            <div className="flex justify-center space-x-2 mt-6">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-professional-dots"></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-professional-dots"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-professional-dots"></div>
            </div>
          </div>
          <div className="mt-8">
            <button
              onClick={props.onBack}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-red-50 text-red-800 p-8">
        <AlertCircle className="w-16 h-16 mb-4 text-red-600" />
        <h2 className="text-2xl font-bold mb-2">
          Error Generating Suggestions
        </h2>
        <p className="text-center mb-6">{error}</p>
        <button
          onClick={props.onBack}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-red-700 text-white font-semibold rounded-lg shadow-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>
    );
  }

  if (!suggestions) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-gray-700 p-8">
        <Brain className="w-16 h-16 mb-4 text-gray-400" />
        <h2 className="text-2xl font-bold mb-2">No Suggestions Available</h2>
        <p className="text-center mb-6">
          We couldn't generate suggestions based on your input. Please try
          again.
        </p>
        <button
          onClick={props.onBack}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="w-full h-full px-4 py-8">
        <div className="w-full h-full">
          {/* AI Mode Title with HARX Logo */}
          <div className="text-center mb-8">
            <Logo className="mb-6" />
            <div className="flex items-center justify-center space-x-3 mb-4">
              <h1 className="text-4xl font-bold text-center ...">AI-Powered Gig Creation</h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Review and refine the AI-generated suggestions for your gig. Customize each section to match your specific requirements.
            </p>
          </div>

          <div className="flex justify-between items-center mb-8">
            <button
              onClick={props.onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h2 className="text-2xl font-bold text-gray-800">
              Review & Refine Suggestions
            </h2>
            <button
              onClick={handleConfirm}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <span>Confirm & Continue</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 space-y-12">

            {/* Basic Section */}
            <div className="p-3 rounded-2xl border-2 border-blue-200 bg-blue-50">
              <div className="flex justify-center mb-8">
                <div className="relative">
                  {/* No logo related state, logic, or JSX */}
                </div>
              </div>

              <div className="flex items-center mb-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white mr-2">
                  <Briefcase className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-extrabold text-blue-900 tracking-tight">Basic Information</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <h4 className="text-base font-semibold text-blue-800 mb-1">Job Titles</h4>
                  {renderEditableList(
                    "jobTitles",
                    suggestions.jobTitles,
                    "Job Titles"
                  )}
                </div>
                <div>
                  <h4 className="text-base font-semibold text-blue-800 mb-1">Job Description</h4>
                  {renderDescriptionSection()}
                </div>
                <div>
                  <h4 className="text-base font-semibold text-blue-800 mb-1">Highlights</h4>
                  {renderEditableList(
                    "highlights",
                    suggestions.highlights,
                    "Highlights"
                  )}
                </div>
                <div>
                  {renderIndustriesSection()}
                </div>
                <div>
                  {renderActivitiesSection()}
                </div>
                <div>
                  <h4 className="text-base font-semibold text-blue-800 mb-1">Deliverables</h4>
                  {renderEditableList(
                    "deliverables",
                    suggestions.deliverables,
                    "Deliverables"
                  )}
                </div>
                <div>
                  {renderSectorsSection()}
                </div>
                <div>
                  {renderDestinationZonesSection()}
                </div>
                <div>
                  {renderSenioritySection()}
                </div>
              </div>
            </div>

            {/* Schedule Section */}
            <div className="p-6 rounded-lg border border-gray-200">
              <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
                <Clock className="w-7 h-7 mr-3 text-blue-700" />
                Schedule
              </h3>
              {renderEditableSchedules()}
              {renderMinimumHoursSection()}
              {renderTimezoneSection()}
              {renderFlexibilitySection()}
            </div>

            {/* Commission Section */}
            <div className="p-6 rounded-lg border border-gray-200">
              <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
                <DollarSign className="w-7 h-7 mr-3 text-blue-700" />
                Commission
              </h3>
              {renderCommissionSection()}
            </div>

            {/* Skills Section */}
            <div className="p-6 rounded-lg border border-gray-200">
              <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
                <Award className="w-7 h-7 mr-3 text-blue-700" />
                Skills
              </h3>
              {renderSkillsSection()}
            </div>

            {/* Team Section */}
            <div className="p-6 rounded-lg border border-gray-200">
              <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
                <Users className="w-7 h-7 mr-3 text-blue-700" />
                Team Structure
              </h3>
              {renderTeamSection()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


