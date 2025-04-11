import OpenAI from 'openai';
import { GigData } from '../types';
import { predefinedOptions } from './guidance';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const isValidApiKey = (key: string) => {
  return key && key !== 'your_openai_api_key_here' && key.startsWith('sk-');
};

// Rate limiting configuration
const RETRY_DELAY = 1000; // 1 second
const MAX_RETRIES = 3;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function retryWithBackoff(fn: () => Promise<any>, retries = MAX_RETRIES): Promise<any> {
  try {
    return await fn();
  } catch (error: any) {
    if (error?.error?.code === 'rate_limit_exceeded' && retries > 0) {
      const delay = RETRY_DELAY * (MAX_RETRIES - retries + 1);
      await sleep(delay);
      return retryWithBackoff(fn, retries - 1);
    }
    throw error;
  }
}

export async function analyzeTitleAndGenerateDescription(title: string): Promise<Partial<GigData>> {
  if (!isValidApiKey(OPENAI_API_KEY)) {
    throw new Error('Please configure your OpenAI API key in the .env file');
  }

  if (!title) {
    throw new Error('Title is required');
  }

  try {
    const result = await retryWithBackoff(async () => {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant that helps create job listings. Analyze the job title and suggest an appropriate category and seniority level.

Available categories (for reference):
${predefinedOptions.basic.categories.map(cat => `- ${cat}`).join('\n')}

Available seniority levels:
${predefinedOptions.basic.seniorityLevels.map(level => `- ${level}`).join('\n')}

Return ONLY a valid JSON object with the following structure:
{
  "description": string (detailed job description),
  "category": string (can be a new category if none of the existing ones fit),
  "seniority": {
    "level": string (MUST be one of the available seniority levels),
    "yearsExperience": string
  },
  "skills": {
    "industry": string[]
  }
}

Generate a detailed, professional description that includes:
1. Role overview
2. Key responsibilities
3. Required qualifications
4. What success looks like in this role

IMPORTANT: The seniority level MUST exactly match one of the provided options. The category can be a new one if none of the existing categories fit the role.`
          },
          {
            role: "user",
            content: `Title: ${title}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error('Failed to generate suggestions');
      }

      try {
        const parsed = JSON.parse(content);
        
        // Validate seniority level
        if (!predefinedOptions.basic.seniorityLevels.includes(parsed.seniority.level)) {
          throw new Error('Invalid seniority level suggestion');
        }

        return parsed;
      } catch (parseError) {
        console.error('Failed to parse AI response:', content);
        throw new Error('Failed to parse AI suggestions');
      }
    });

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`AI suggestion failed: ${error.message}`);
    }
    throw new Error('AI suggestion failed');
  }
}