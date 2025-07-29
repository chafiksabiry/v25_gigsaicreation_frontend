import { fetchActivities, fetchIndustries, fetchLanguages, fetchSoftSkills, fetchTechnicalSkills, fetchProfessionalSkills } from './api';
import type { Activity, Industry, Language } from '../types';

let activitiesCache: Activity[] = [];
let industriesCache: Industry[] = [];
let languagesCache: Language[] = [];
let softSkillsCache: Array<{_id: string, name: string, description: string, category: string}> = [];
let technicalSkillsCache: Array<{_id: string, name: string, description: string, category: string}> = [];
let professionalSkillsCache: Array<{_id: string, name: string, description: string, category: string}> = [];
let isActivitiesLoaded = false;
let isIndustriesLoaded = false;
let isLanguagesLoaded = false;
let isSoftSkillsLoaded = false;
let isTechnicalSkillsLoaded = false;
let isProfessionalSkillsLoaded = false;

export async function loadActivities(): Promise<Activity[]> {
  if (isActivitiesLoaded && activitiesCache.length > 0) {
    console.log('📋 Using cached activities:', activitiesCache.length);
    return activitiesCache;
  }
  try {
    console.log('🔄 Fetching activities from API...');
    const { data, error } = await fetchActivities();
    if (error) {
      console.error('❌ Error loading activities:', error);
      return [];
    }
    console.log('✅ Activities loaded successfully:', data.length);
    console.log('📋 Sample activities:', data.slice(0, 3).map(a => ({ id: a._id, name: a.name, category: a.category })));
    activitiesCache = data;
    isActivitiesLoaded = true;
    return data;
  } catch (error) {
    console.error('❌ Error loading activities:', error);
    return [];
  }
}

export async function loadIndustries(): Promise<Industry[]> {
  if (isIndustriesLoaded && industriesCache.length > 0) {
    console.log('🏭 Using cached industries:', industriesCache.length);
    return industriesCache;
  }
  try {
    console.log('🔄 Fetching industries from API...');
    const { data, error } = await fetchIndustries();
    if (error) {
      console.error('❌ Error loading industries:', error);
      return [];
    }
    console.log('✅ Industries loaded successfully:', data.length);
    console.log('🏭 Sample industries:', data.slice(0, 3).map(i => ({ id: i._id, name: i.name })));
    industriesCache = data;
    isIndustriesLoaded = true;
    return data;
  } catch (error) {
    console.error('❌ Error loading industries:', error);
    return [];
  }
}

export async function loadLanguages(): Promise<Language[]> {
  if (isLanguagesLoaded && languagesCache.length > 0) {
    console.log('🌐 Using cached languages:', languagesCache.length);
    return languagesCache;
  }
  try {
    console.log('🔄 Fetching languages from API...');
    const { data, error } = await fetchLanguages();
    if (error) {
      console.error('❌ Error loading languages:', error);
      return [];
    }
    console.log('✅ Languages loaded successfully:', data.length);
    console.log('🌐 Sample languages:', data.slice(0, 3).map(l => ({ id: l._id, name: l.name, code: l.code })));
    languagesCache = data;
    isLanguagesLoaded = true;
    return data;
  } catch (error) {
    console.error('❌ Error loading languages:', error);
    return [];
  }
}

// Activity utility functions
export function getActivityById(id: string): Activity | undefined {
  return activitiesCache.find(activity => activity._id === id);
}

export function getActivityNameById(id: string): string {
  const activity = activitiesCache.find(activity => activity._id === id);
  return activity ? activity.name : '';
}

export function convertActivityNamesToIds(names: string[]): string[] {
  const ids: string[] = [];
  for (const name of names) {
    const activity = activitiesCache.find(a => a.name.toLowerCase() === name.toLowerCase());
    if (activity) {
      ids.push(activity._id);
    } else {
      console.warn(`Activity "${name}" not found in cache`);
    }
  }
  return ids;
}

export function getActivityOptions(): Array<{ value: string; label: string; category: string }> {
  const options = activitiesCache
    .filter(activity => activity.isActive)
    .map(activity => ({
      value: activity._id,
      label: activity.name,
      category: activity.category
    }));
  console.log('🎯 Activity options generated:', options.length);
  if (options.length > 0) {
    console.log('📋 Sample activity options:', options.slice(0, 3));
  }
  return options;
}

// Industry utility functions
export function getIndustryById(id: string): Industry | undefined {
  return industriesCache.find(industry => industry._id === id);
}

export function getIndustryNameById(id: string): string {
  const industry = industriesCache.find(industry => industry._id === id);
  return industry ? industry.name : '';
}

export function convertIndustryNamesToIds(names: string[]): string[] {
  const ids: string[] = [];
  for (const name of names) {
    const industry = industriesCache.find(i => i.name.toLowerCase() === name.toLowerCase());
    if (industry) {
      ids.push(industry._id);
    } else {
      console.warn(`Industry "${name}" not found in cache`);
    }
  }
  return ids;
}

export function getIndustryOptions(): Array<{ value: string; label: string }> {
  const options = industriesCache
    .filter(industry => industry.isActive)
    .map(industry => ({
      value: industry._id,
      label: industry.name
    }));
  console.log('🏭 Industry options generated:', options.length);
  if (options.length > 0) {
    console.log('🏭 Sample industry options:', options.slice(0, 3));
  }
  return options;
}

// Language utility functions
export function getLanguageById(id: string): Language | undefined {
  return languagesCache.find(language => language._id === id);
}

export function getLanguageNameById(id: string): string {
  const language = languagesCache.find(language => language._id === id);
  return language ? language.name : 'Unknown Language';
}

export function getLanguageCodeById(id: string): string {
  const language = languagesCache.find(language => language._id === id);
  return language ? language.code : '';
}

export function convertLanguageNamesToIds(names: string[]): string[] {
  const ids: string[] = [];
  for (const name of names) {
    const language = languagesCache.find(l => l.name.toLowerCase() === name.toLowerCase());
    if (language) {
      ids.push(language._id);
    } else {
      console.warn(`Language "${name}" not found in cache`);
    }
  }
  return ids;
}

export function getLanguageOptions(): Array<{ value: string; label: string; code: string }> {
  const options = languagesCache.map(language => ({
    value: language._id,
    label: language.name,
    code: language.code
  }));
  console.log('🌐 Language options generated:', options.length);
  if (options.length > 0) {
    console.log('🌐 Sample language options:', options.slice(0, 3));
  }
  return options;
}

// Load soft skills from API
export async function loadSoftSkills(): Promise<Array<{_id: string, name: string, description: string, category: string}>> {
  if (isSoftSkillsLoaded && softSkillsCache.length > 0) {
    console.log('💬 Using cached soft skills:', softSkillsCache.length);
    return softSkillsCache;
  }
  try {
    console.log('🔄 Fetching soft skills from API...');
    const response = await fetchSoftSkills();
    if (response.error) {
      console.error('❌ Error loading soft skills:', response.error);
      return [];
    }
    console.log('✅ Soft skills loaded successfully:', response.data.length);
    console.log('💬 Sample soft skills:', response.data.slice(0, 3).map((s: any) => ({ id: s._id, name: s.name, category: s.category })));
    softSkillsCache = response.data;
    isSoftSkillsLoaded = true;
    return response.data;
  } catch (error) {
    console.error('❌ Error loading soft skills:', error);
    return [];
  }
}

// Load technical skills from API
export async function loadTechnicalSkills(): Promise<Array<{_id: string, name: string, description: string, category: string}>> {
  if (isTechnicalSkillsLoaded && technicalSkillsCache.length > 0) {
    console.log('🔧 Using cached technical skills:', technicalSkillsCache.length);
    return technicalSkillsCache;
  }
  try {
    console.log('🔄 Fetching technical skills from API...');
    const response = await fetchTechnicalSkills();
    if (response.error) {
      console.error('❌ Error loading technical skills:', response.error);
      return [];
    }
    console.log('✅ Technical skills loaded successfully:', response.data.length);
    console.log('🔧 Sample technical skills:', response.data.slice(0, 3).map((s: any) => ({ id: s._id, name: s.name, category: s.category })));
    technicalSkillsCache = response.data;
    isTechnicalSkillsLoaded = true;
    return response.data;
  } catch (error) {
    console.error('❌ Error loading technical skills:', error);
    return [];
  }
}

// Load professional skills from API
export async function loadProfessionalSkills(): Promise<Array<{_id: string, name: string, description: string, category: string}>> {
  if (isProfessionalSkillsLoaded && professionalSkillsCache.length > 0) {
    console.log('💼 Using cached professional skills:', professionalSkillsCache.length);
    return professionalSkillsCache;
  }
  try {
    console.log('🔄 Fetching professional skills from API...');
    const response = await fetchProfessionalSkills();
    if (response.error) {
      console.error('❌ Error loading professional skills:', response.error);
      return [];
    }
    console.log('✅ Professional skills loaded successfully:', response.data.length);
    console.log('💼 Sample professional skills:', response.data.slice(0, 3).map((s: any) => ({ id: s._id, name: s.name, category: s.category })));
    professionalSkillsCache = response.data;
    isProfessionalSkillsLoaded = true;
    return response.data;
  } catch (error) {
    console.error('❌ Error loading professional skills:', error);
    return [];
  }
}

// Get soft skill by ID
export function getSoftSkillById(id: string): {_id: string, name: string, description: string, category: string} | undefined {
  return softSkillsCache.find(skill => skill._id === id);
}

// Get technical skill by ID
export function getTechnicalSkillById(id: string): {_id: string, name: string, description: string, category: string} | undefined {
  return technicalSkillsCache.find(skill => skill._id === id);
}

// Get professional skill by ID
export function getProfessionalSkillById(id: string): {_id: string, name: string, description: string, category: string} | undefined {
  return professionalSkillsCache.find(skill => skill._id === id);
}

// Get soft skill name by ID
export function getSoftSkillNameById(id: string): string {
  const skill = softSkillsCache.find(skill => skill._id === id);
  return skill ? skill.name : 'Unknown Soft Skill';
}

// Get technical skill name by ID
export function getTechnicalSkillNameById(id: string): string {
  const skill = technicalSkillsCache.find(skill => skill._id === id);
  return skill ? skill.name : 'Unknown Technical Skill';
}

// Get professional skill name by ID
export function getProfessionalSkillNameById(id: string): string {
  const skill = professionalSkillsCache.find(skill => skill._id === id);
  return skill ? skill.name : 'Unknown Professional Skill';
}

// Convert soft skill names to IDs
export function convertSoftSkillNamesToIds(names: string[]): string[] {
  return names.map(name => {
    const skill = softSkillsCache.find(s => s.name.toLowerCase() === name.toLowerCase());
    return skill ? skill._id : name; // Return original name if not found
  });
}

// Convert technical skill names to IDs
export function convertTechnicalSkillNamesToIds(names: string[]): string[] {
  return names.map(name => {
    const skill = technicalSkillsCache.find(s => s.name.toLowerCase() === name.toLowerCase());
    return skill ? skill._id : name; // Return original name if not found
  });
}

// Convert professional skill names to IDs
export function convertProfessionalSkillNamesToIds(names: string[]): string[] {
  return names.map(name => {
    const skill = professionalSkillsCache.find(s => s.name.toLowerCase() === name.toLowerCase());
    return skill ? skill._id : name; // Return original name if not found
  });
}

// Get soft skill options for UI
export function getSoftSkillOptions(): Array<{ value: string; label: string; category: string }> {
  const options = softSkillsCache
    .map(skill => ({
      value: skill._id,
      label: skill.name,
      category: skill.category
    }));
  console.log('💬 Soft skill options generated:', options.length);
  if (options.length > 0) {
    console.log('💬 Sample soft skill options:', options.slice(0, 3));
  }
  return options;
}

// Get technical skill options for UI
export function getTechnicalSkillOptions(): Array<{ value: string; label: string; category: string }> {
  const options = technicalSkillsCache
    .map(skill => ({
      value: skill._id,
      label: skill.name,
      category: skill.category
    }));
  console.log('🔧 Technical skill options generated:', options.length);
  if (options.length > 0) {
    console.log('🔧 Sample technical skill options:', options.slice(0, 3));
  }
  return options;
}

// Get professional skill options for UI
export function getProfessionalSkillOptions(): Array<{ value: string; label: string; category: string }> {
  const options = professionalSkillsCache
    .map(skill => ({
      value: skill._id,
      label: skill.name,
      category: skill.category
    }));
  console.log('💼 Professional skill options generated:', options.length);
  if (options.length > 0) {
    console.log('💼 Sample professional skill options:', options.slice(0, 3));
  }
  return options;
}

// Cache management
export function clearCache() {
  activitiesCache = [];
  industriesCache = [];
  languagesCache = [];
  softSkillsCache = [];
  technicalSkillsCache = [];
  professionalSkillsCache = [];
  isActivitiesLoaded = false;
  isIndustriesLoaded = false;
  isLanguagesLoaded = false;
  isSoftSkillsLoaded = false;
  isTechnicalSkillsLoaded = false;
  isProfessionalSkillsLoaded = false;
  console.log('🗑️ Cache cleared');
}

export async function initializeData() {
  console.log('🚀 Initializing all data...');
  await Promise.all([
    loadActivities(),
    loadIndustries(),
    loadLanguages(),
    loadSoftSkills(),
    loadTechnicalSkills(),
    loadProfessionalSkills()
  ]);
  console.log('✅ All data initialized');
} 