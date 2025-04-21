import type { Gig, GigHistory } from './types';
import { GigData } from '../types';

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

export async function saveGigData(gigData: GigData): Promise<void> {
  try {
    console.log('Starting to save gig data:', gigData);
    
    const apiUrl = import.meta.env.VITE_API_URL;
    console.log('Using API URL:', apiUrl);
    
    const response = await fetch(`${apiUrl}/gigs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gigData),
    });

    console.log('API Response status:', response.status);
    console.log('API Response headers:', response.headers);

    const responseText = await response.text();
    console.log('Response text:', responseText);

    if (!response.ok) {
      console.error('Error response text:', responseText);
      try {
        const errorData = JSON.parse(responseText);
        throw new Error(errorData.message || 'Failed to save gig data');
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
        throw new Error(`Failed to save gig data: ${responseText}`);
      }
    }
    
    try {
      const data = JSON.parse(responseText);
      console.log('Parsed response data:', data);
      return data;
    } catch (parseError) {
      console.error('Error parsing success response:', parseError);
      throw new Error('Invalid JSON response from server');
    }
  } catch (error) {
    console.error('Error in saveGigData:', error);
    throw error;
  }
}