import { GigData, GigSuggestion } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api-gigsmanual.harx.ai/api';

export async function generateGigSuggestions(description: string): Promise<GigSuggestion> {
  if (!description) {
    throw new Error('Description is required');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/ai/generate-gig-suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: description
      })
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Log the backend response for debugging
    console.log('Backend API Response:', data);
    
    // Transform the backend response to match our GigSuggestion type
    const transformedData = {
      jobTitles: data.jobTitles || [],
      jobDescription: data.jobDescription || '',
      category: data.category || '',
      destination_zone: data.destination_zone || '',
      activities: data.activities || [],
      industries: data.industries || [],
      seniority: data.seniority || { level: '', yearsExperience: 0 },
      skills: data.skills || { languages: [], soft: [], professional: [], technical: [] },
      availability: data.availability || {},
      commission: data.commission || {},
      team: data.team || { size: 1, structure: [], territories: [] },
      
      // Additional fields that might be expected by the UI
      description: data.jobDescription || '',
      sectors: data.category ? [data.category] : [],
      scheduleFlexibility: data.availability?.flexibility || [],
      destinationZones: data.destination_zone ? [data.destination_zone] : [],
      highlights: data.highlights || [],
      deliverables: data.deliverables || [],
      requirements: { essential: [], preferred: [] }, // Backend doesn't provide this yet
      
      // Schedule mapping
      schedule: {
        schedules: data.availability?.schedule ? data.availability.schedule.map((sched: any) => ({
          days: [sched.day],
          hours: sched.hours
        })) : [],
        timeZones: data.availability?.time_zone ? [data.availability.time_zone] : [],
        time_zone: data.availability?.time_zone || '',
        flexibility: data.availability?.flexibility || [],
        minimumHours: data.availability?.minimumHours || { daily: 0, weekly: 0, monthly: 0 }
      }
    };

    console.log('Transformed data for UI:', transformedData);
    return transformedData;
  } catch (error) {
    console.error('Error calling backend API:', error);
    throw error;
  }
}

// Keep the mapGeneratedDataToGigData function for compatibility
export function mapGeneratedDataToGigData(generatedData: GigSuggestion): Partial<GigData> {
  return {
    title: generatedData.jobTitles?.[0] || '',
    description: generatedData.jobDescription || '',
    category: generatedData.category || '',
    seniority: generatedData.seniority || { level: '', yearsExperience: 0 },
    activities: generatedData.activities || [],
    industries: generatedData.industries || [],
    skills: generatedData.skills || { languages: [], soft: [], professional: [], technical: [] },
    availability: generatedData.availability || {},
    commission: generatedData.commission || {},
    team: generatedData.team || { size: 1, structure: [], territories: [] },
    destinationZone: generatedData.destination_zone || ''
  };
}