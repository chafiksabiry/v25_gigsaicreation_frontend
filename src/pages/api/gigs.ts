import type { NextApiRequest, NextApiResponse } from 'next';
import { GigData } from '../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('API Request received:', {
    method: req.method,
    headers: req.headers,
    body: req.body
  });

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const gigData: GigData = req.body;
    console.log('Received gig data:', gigData);

    // TODO: Replace this with your actual database logic
    // For now, we'll just simulate a successful save
    console.log('Saving gig data to database...');

    // Simulate a delay to mimic database operation
    await new Promise(resolve => setTimeout(resolve, 1000));

    const response = {
      success: true,
      message: 'Gig saved successfully',
      data: gigData
    };
    console.log('Sending response:', response);

    // Ensure we're sending a valid JSON response
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(response);
  } catch (error) {
    console.error('Error in API handler:', error);
    const errorResponse = { 
      success: false,
      message: 'Failed to save gig data',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    console.log('Sending error response:', errorResponse);
    return res.status(500).json(errorResponse);
  }
} 