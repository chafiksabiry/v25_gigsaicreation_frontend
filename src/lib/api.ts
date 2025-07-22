import type { Gig, GigHistory } from './types';
import { GigData } from '../types';
import Cookies from 'js-cookie';
import axios from 'axios';
import { setLastGigId } from './postMessageHandler';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';


// TODO: Implement these functions with your preferred storage solution
export async function createGig() {
  throw new Error('Not implemented');
}

export async function updateGig(_id: string, _updates: Partial<Gig>) {
  throw new Error('Not implemented');
}

export async function submitForReview(id: string) {
  return updateGig(id, { status: 'active' as any });
}

export async function publishGig(id: string) {
  return updateGig(id, { status: 'active' as any });
}

export async function closeGig(id: string) {
  return updateGig(id, { status: 'archived' as any });
}

export async function getGigHistory(gigId: string) {
  throw new Error('Not implemented');
}

export async function fetchCompanies() {
  try {
    const response = await fetch('https://api-companysearchwizard.harx.ai/api/companies');
    if (!response.ok) {
      throw new Error('Failed to fetch companies');
    }
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch companies');
    }
    return data.data;
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }
}

interface Company {
  _id: string;
  userId: string | { $oid: string };
  name: string;
  industry: string;
  // Add other company fields as needed
}

// export async function getCompanyIdByUserId(userId: string): Promise<string> {
//   try {
//     const companies = await fetchCompanies();
//     const company = companies.find((company: Company) => 
//       company.userId === userId || 
//       (typeof company.userId === 'object' && company.userId.$oid === userId)
//     );
    
//     if (!company) {
//       throw new Error(`No company found for userId: ${userId}`);
//     }
    
//     return company._id;
//   } catch (error) {
//     console.error('Error getting companyId by userId:', error);
//     throw error;
//   }
// }

// Fonction pour corriger automatiquement les données de schedule
function fixScheduleData(data: GigData): GigData {
  const workingDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  // Corriger availability.schedule
  if (data.availability && data.availability.schedule) {
    const fixedAvailabilitySchedule = data.availability.schedule.map((schedule, index) => {
      if (!schedule.day) {
        const dayIndex = index % workingDays.length;
        return {
          ...schedule,
          day: workingDays[dayIndex]
        };
      }
      return schedule;
    });
    
    data.availability.schedule = fixedAvailabilitySchedule;
  }
  
  // Corriger schedule.schedules
  if (data.schedule && data.schedule.schedules) {
    const fixedScheduleSchedules = data.schedule.schedules.map((schedule, index) => {
      if (!schedule.day) {
        const dayIndex = index % workingDays.length;
        return {
          ...schedule,
          day: workingDays[dayIndex]
        };
      }
      return schedule;
    });
    
    data.schedule.schedules = fixedScheduleSchedules;
  }
  
  return data;
}

export async function saveGigData(gigData: GigData): Promise<{ data: any; error?: Error }> {
  try {
    const userId = Cookies.get('userId') ?? "";
    
    if (!userId) {
      throw new Error('User ID not found in cookies');
    }

    // Get companyId based on userId
    const companyId = Cookies.get('companyId') ?? "";
    // Corriger automatiquement les données de schedule
    const fixedGigData = fixScheduleData(gigData);
    
    // Format skills data to ensure proper structure
    const formattedSkills = {
      ...fixedGigData.skills,
      languages: fixedGigData.skills.languages.map(lang => ({
        language: lang.language,
        proficiency: lang.proficiency,
        iso639_1: lang.iso639_1
      })),
      soft: fixedGigData.skills.soft.map(skill => ({
        skill: skill.skill,
        level: skill.level
      })),
      professional: fixedGigData.skills.professional.map(skill => ({
        skill: skill.skill,
        level: skill.level
      })),
      technical: fixedGigData.skills.technical.map(skill => ({
        skill: skill.skill,
        level: skill.level
      }))
    };

    // Log the formatted skills to ensure ObjectIds are extracted correctly
    console.log('📤 Sending skills data to API:', formattedSkills);
    console.log('🔍 Sample skill format check:');
    if (formattedSkills.soft.length > 0) {
      console.log('  Soft skill example:', formattedSkills.soft[0]);
    }
    if (formattedSkills.professional.length > 0) {
      console.log('  Professional skill example:', formattedSkills.professional[0]);
    }
    if (formattedSkills.technical.length > 0) {
      console.log('  Technical skill example:', formattedSkills.technical[0]);
    }

    // Format schedule data to remove invalid ObjectId references
    const formattedSchedule = {
      ...fixedGigData.schedule,
      schedules: fixedGigData.schedule.schedules.map(schedule => ({
        day: schedule.day, // Use 'day' (singular) instead of 'days'
        hours: schedule.hours
      }))
    };

    // Format availability data
    const formattedAvailability = {
      ...fixedGigData.availability,
      time_zone: (() => {
        const firstTimezone = fixedGigData.availability.timeZones?.[0];
        if (typeof firstTimezone === 'string') {
          return firstTimezone;
        }
        return fixedGigData.availability.time_zone || 'UTC';
      })(),
      schedule: fixedGigData.availability.schedule.map(schedule => ({
        day: schedule.day, // Use 'day' (singular) instead of converting to array
        hours: schedule.hours
      }))
    };

    // Format destination zone to ensure it's a valid country code
    const destinationZone = fixedGigData.destination_zone?.split(',')?.[0]?.trim() || 'US';
    const formattedDestinationZone = destinationZone.length === 2 ? destinationZone : 'US';

    const gigDataWithIds = {
      ...fixedGigData,
      userId,
      companyId,
      skills: formattedSkills,
      schedule: formattedSchedule,
      availability: formattedAvailability,
      destination_zone: formattedDestinationZone
    };

    const response = await fetch(`${API_URL}/gigs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gigDataWithIds),
    });
    const responseText = await response.text();

    if (!response.ok) {
      console.error('Error response text:', responseText);
      try {
        const errorData = JSON.parse(responseText);
        return { data: null, error: new Error(errorData.message || 'Failed to save gig data') };
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
        return { data: null, error: new Error(`Failed to save gig data: ${responseText}`) };
      }
    }
    
    try {
      const data = JSON.parse(responseText);
      
      // Save gig ID using the new utility function
      if (data && data._id) {
        setLastGigId(data._id);
      }
      
      return { data, error: undefined };
    } catch (parseError) {
      console.error('Error parsing success response:', parseError);
      return { data: null, error: new Error('Invalid JSON response from server') };
    }
  } catch (error) {
    console.error('Error in saveGigData:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error occurred') };
  }
}

export async function getGig(gigId: string | null) {
  try {
    if (!gigId) {
      // If no gigId is provided, fetch all gigs
      const { data } = await axios.get(`${API_URL}/gigs`);
      return { data, error: null };
    } else {
      // If gigId is provided, fetch a specific gig
      const { data } = await axios.get(`${API_URL}/gigs/${gigId}`);
      return { data: [data], error: null };
    }
  } catch (error) {
    console.error('Error fetching gig:', error);
    return { data: null, error };
  }
}

export async function fetchAllTimezones(): Promise<{ data: any[]; error?: Error }> {
  try {
    console.log('[fetchAllTimezones] Fetching all timezones from API...');
    const timezoneApiUrl = import.meta.env.VITE_REP_URL || 'https://api-repcreationwizard.harx.ai/api';
    const response = await fetch(`${timezoneApiUrl}/timezones`);
    console.log('[fetchAllTimezones] Response received:', response);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch timezones: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('[fetchAllTimezones] JSON parsed:', result);
    
    if (!result.success) {
      throw new Error(`API returned error: ${result.message || 'Unknown error'}`);
    }
    
    console.log('[fetchAllTimezones] Returning data:', result.data);
    return { data: result.data || [], error: undefined };
  } catch (error) {
    console.error('Error fetching timezones:', error);
    return { 
      data: [], 
      error: error instanceof Error ? error : new Error('Failed to fetch timezones') 
    };
  }
}

export async function fetchTimezonesByCountry(countryCode: string): Promise<{ data: any[]; error?: Error }> {
  try {
    const timezoneApiUrl = import.meta.env.VITE_REP_URL || 'https://api-repcreationwizard.harx.ai/api';
    const response = await fetch(`${timezoneApiUrl}/timezones/country/${countryCode}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch timezones for country ${countryCode}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(`API returned error: ${result.message || 'Unknown error'}`);
    }
    
    return { data: result.data || [], error: undefined };
  } catch (error) {
    console.error('Error fetching timezones:', error);
    return { 
      data: [], 
      error: error instanceof Error ? error : new Error('Failed to fetch timezones') 
    };
  }
}

// Skills API functions
export async function fetchSoftSkills() {
  try {
    const response = await fetch(`${import.meta.env.VITE_REP_URL}/skills/soft`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return { data: data.data, error: null };
  } catch (error) {
    console.error('Error fetching soft skills:', error);
    return { data: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function fetchTechnicalSkills() {
  try {
    const response = await fetch(`${import.meta.env.VITE_REP_URL}/skills/technical`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return { data: data.data, error: null };
  } catch (error) {
    console.error('Error fetching technical skills:', error);
    return { data: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function fetchProfessionalSkills() {
  try {
    const response = await fetch(`${import.meta.env.VITE_REP_URL}/skills/professional`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return { data: data.data, error: null };
  } catch (error) {
    console.error('Error fetching professional skills:', error);
    return { data: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// New functions to save skills to database
export async function saveSkillToDatabase(skillData: {
  name: string;
  description: string;
  category: 'soft' | 'technical' | 'professional';
  level?: number;
}): Promise<{ data: any; error?: Error }> {
  try {
    const response = await fetch(`${import.meta.env.VITE_REP_URL}/skills/${skillData.category}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: skillData.name,
        description: skillData.description,
        category: skillData.category,
        level: skillData.level || 1
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to save skill: ${errorText}`);
    }

    const data = await response.json();
    return { data: data.data, error: undefined };
  } catch (error) {
    console.error('Error saving skill to database:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Failed to save skill') 
    };
  }
}

export async function updateSkillInDatabase(
  skillId: string, 
  skillData: {
    name?: string;
    description?: string;
    category?: 'soft' | 'technical' | 'professional';
    level?: number;
  }
): Promise<{ data: any; error?: Error }> {
  try {
    const response = await fetch(`${import.meta.env.VITE_REP_URL}/skills/${skillId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(skillData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update skill: ${errorText}`);
    }

    const data = await response.json();
    return { data: data.data, error: undefined };
  } catch (error) {
    console.error('Error updating skill in database:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Failed to update skill') 
    };
  }
}

export async function deleteSkillFromDatabase(skillId: string): Promise<{ data: any; error?: Error }> {
  try {
    const response = await fetch(`${import.meta.env.VITE_REP_URL}/skills/${skillId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete skill: ${errorText}`);
    }

    const data = await response.json();
    return { data: data.data, error: undefined };
  } catch (error) {
    console.error('Error deleting skill from database:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Failed to delete skill') 
    };
  }
}

export async function getSkillById(skillId: string): Promise<{ data: any; error?: Error }> {
  try {
    const response = await fetch(`${import.meta.env.VITE_REP_URL}/skills/id/${skillId}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get skill: ${errorText}`);
    }

    const data = await response.json();
    return { data: data.data, error: undefined };
  } catch (error) {
    console.error('Error getting skill by ID:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Failed to get skill') 
    };
  }
}

export async function searchSkillsByName(name: string, category?: 'soft' | 'technical' | 'professional'): Promise<{ data: any[]; error?: Error }> {
  try {
    const categoryParam = category ? `&category=${category}` : '';
    const response = await fetch(`${import.meta.env.VITE_REP_URL}/skills/search?name=${encodeURIComponent(name)}${categoryParam}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to search skills: ${errorText}`);
    }

    const data = await response.json();
    return { data: data.data || [], error: undefined };
  } catch (error) {
    console.error('Error searching skills:', error);
    return { 
      data: [], 
      error: error instanceof Error ? error : new Error('Failed to search skills') 
    };
  }
}

// Function to sync skills from external sources to database
export async function syncSkillsToDatabase(skills: Array<{
  name: string;
  description: string;
  category: 'soft' | 'technical' | 'professional';
  source?: string;
}>): Promise<{ data: any[]; error?: Error }> {
  try {
    const results = [];
    
    for (const skill of skills) {
      try {
        // Check if skill already exists
        const searchResult = await searchSkillsByName(skill.name, skill.category);
        
        if (searchResult.data.length > 0) {
          // Skill exists, update if needed
          const existingSkill = searchResult.data[0];
          if (existingSkill.description !== skill.description) {
            const updateResult = await updateSkillInDatabase(existingSkill._id, {
              description: skill.description
            });
            if (updateResult.data) {
              results.push(updateResult.data);
            }
          } else {
            results.push(existingSkill);
          }
        } else {
          // Skill doesn't exist, create new one
          const createResult = await saveSkillToDatabase(skill);
          if (createResult.data) {
            results.push(createResult.data);
          }
        }
      } catch (skillError) {
        console.error(`Error processing skill ${skill.name}:`, skillError);
        // Continue with other skills even if one fails
      }
    }
    
    return { data: results, error: undefined };
  } catch (error) {
    console.error('Error syncing skills to database:', error);
    return { 
      data: [], 
      error: error instanceof Error ? error : new Error('Failed to sync skills') 
    };
  }
}

// Interfaces for API responses
interface Activity {
  _id: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

interface Industry {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

interface Language {
  _id: string;
  code: string;
  name: string;
  nativeName: string;
  __v: number;
  createdAt: string;
  lastUpdated: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T[];
  pagination: any;
  message: string;
}

export async function fetchActivities(): Promise<{ data: Activity[]; error?: Error }> {
  try {
    const response = await fetch('https://api-repcreationwizard.harx.ai/api/activities');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result: ApiResponse<Activity> = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch activities');
    }
    return { data: result.data };
  } catch (error) {
    console.error('Error fetching activities:', error);
    return { data: [], error: error as Error };
  }
}

export async function fetchIndustries(): Promise<{ data: Industry[]; error?: Error }> {
  try {
    const response = await fetch('https://api-repcreationwizard.harx.ai/api/industries');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result: ApiResponse<Industry> = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch industries');
    }
    return { data: result.data };
  } catch (error) {
    console.error('Error fetching industries:', error);
    return { data: [], error: error as Error };
  }
}

export async function fetchLanguages(): Promise<{ data: Language[]; error?: Error }> {
  try {
    const response = await fetch('https://api-repcreationwizard.harx.ai/api/languages');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result: ApiResponse<Language> = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch languages');
    }
    return { data: result.data };
  } catch (error) {
    console.error('Error fetching languages:', error);
    return { data: [], error: error as Error };
  }
}