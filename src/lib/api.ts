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
  userId: string;
  name: string;
  industry: string;
  // Add other company fields as needed
}

export async function getCompanyIdByUserId(userId: string): Promise<string> {
  try {
    const companies = await fetchCompanies();
    // const company = companies.find((company: Company) => company._id === "681a91865736a7a7cf2453b8");
    
    // if (!company) {
    //   throw new Error(`No company found for userId: ${userId}`);
    // }
    
    return "681a91865736a7a7cf2453b8";
  } catch (error) {
    console.error('Error getting companyId by userId:', error);
    throw error;
  }
}

export async function saveGigData(gigData: GigData): Promise<void> {
  try {
    const isStandalone = import.meta.env.VITE_STANDALONE === 'true';
    const userId = Cookies.get('userId');
    
    if (!userId) {
      throw new Error('User ID not found in cookies');
    }

    // Get companyId based on userId
    const companyId = await getCompanyIdByUserId(userId);

    const gigDataWithIds = {
      ...gigData,
      userId,
      companyId
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