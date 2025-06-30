import type { Gig, GigHistory } from './types';
import { GigData } from '../types';
import Cookies from 'js-cookie';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// TODO: Implement these functions with your preferred storage solution
export async function createGig(gigData: Partial<Gig>) {
  throw new Error('Not implemented');
}

export async function updateGig(id: string, updates: Partial<Gig>) {
  throw new Error('Not implemented');
}

export async function submitForReview(id: string) {
  return updateGig(id, { status: 'pending_review' });
}

export async function publishGig(id: string) {
  return updateGig(id, { status: 'published' });
}

export async function closeGig(id: string) {
  return updateGig(id, { status: 'closed' });
}

export async function getGigHistory(gigId: string) {
  throw new Error('Not implemented');
}

export async function fetchCompanies() {
  try {
    const response = await fetch('https://preprod-api-companysearchwizard.harx.ai/api/companies');
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
      })),
      certifications: fixedGigData.skills.certifications.map(cert => ({
        name: cert.name,
        required: cert.required,
        provider: cert.provider
      }))
    };

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
      timeZone: fixedGigData.availability.timeZones?.[0] || 'UTC', // Use first timezone as default
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