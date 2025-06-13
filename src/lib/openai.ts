import { TimezoneCode } from './ai';
import { TimezoneGenerationRequest, TimezoneGenerationResponse } from './aiPrompts';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export async function generateTimezones(
  request: TimezoneGenerationRequest,
  apiKey: string
): Promise<TimezoneGenerationResponse> {
  const prompt = `Based on the following business requirements, suggest optimal time zones and working hours:

Target markets: ${request.targetMarkets.join(', ')}
Business hours: ${request.businessHours || 'Not specified'}
Team distribution: ${request.teamDistribution || 'Not specified'}
Coverage requirements: ${request.coverageRequirements || 'Not specified'}

Please provide:
1. A list of primary time zones for operations (use IANA timezone names)
2. Suggested working hours (in 24-hour format)
3. Schedule flexibility recommendations
4. Coverage analysis and gaps

Format your response as a JSON object with the following structure:
{
  "suggestedTimezones": ["America/New_York", "Europe/London", ...],
  "workingHours": {
    "start": "09:00",
    "end": "17:00"
  },
  "coverageAnalysis": "Brief analysis of coverage...",
  "flexibilityRecommendations": ["Recommendation 1", "Recommendation 2", ...]
}`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that provides timezone and scheduling recommendations for global business operations. IMPORTANT: All responses MUST be in English only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const parsedResponse = JSON.parse(content);
      return {
        suggestedTimezones: parsedResponse.suggestedTimezones,
        workingHours: parsedResponse.workingHours,
        coverageAnalysis: parsedResponse.coverageAnalysis,
        flexibilityRecommendations: parsedResponse.flexibilityRecommendations
      };
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      throw new Error('Invalid response format from OpenAI');
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
} 