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
  "description": string (detailed job description STRICTLY in 5-8 lines, separated by newlines),
  "category": string (can be a new category if none of the existing ones fit),
  "seniority": {
    "level": string (MUST be one of the available seniority levels),
    "yearsExperience": string
  },
  "skills": {
    "industry": string[]
  }
}

Generate a detailed, professional description that MUST include these sections across 5-8 lines:
1. Role overview (1-2 lines)
2. Key responsibilities (2-3 lines)
3. Required qualifications (1-2 lines)
4. What success looks like in this role (1 line)

CRITICAL: 
- The description MUST contain EXACTLY between 5 and 8 lines, separated by newlines
- Each line should be a complete, meaningful sentence
- The seniority level MUST exactly match one of the provided options
- The category can be a new one if none of the existing categories fit the role

Example description format (6 lines):
We are seeking a talented professional to join our dynamic team.
The ideal candidate will drive sales growth through prospecting and relationship building.
Key responsibilities include managing client accounts, conducting product demonstrations, and meeting sales targets.
You will also collaborate with marketing to develop effective sales strategies.
Required qualifications include 3+ years of sales experience and excellent communication skills.
Success in this role means consistently meeting targets while maintaining high customer satisfaction.`
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
        
        // Validate description length
        const descriptionLines = parsed.description.split('\n').filter((line: string) => line.trim().length > 0);
        if (descriptionLines.length < 5 || descriptionLines.length > 8) {
          throw new Error(`Description must be between 5 and 8 lines (current: ${descriptionLines.length} lines)`);
        }

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

export async function generateSeniorityAndExperience(title: string, description: string, seniorityLevels: string[]): Promise<{ level: string; yearsExperience: string }> {
  if (!isValidApiKey(OPENAI_API_KEY)) {
    throw new Error('Please configure your OpenAI API key in the .env file');
  }

  if (!title || !description) {
    throw new Error('Title and description are required');
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that helps determine appropriate seniority levels and years of experience for job positions.
          
Available seniority levels (you MUST choose one of these):
${seniorityLevels.map(level => `- ${level}`).join('\n')}

For each level, here are the typical years of experience:
- Entry Level: 0-2 years
- Junior: 1-3 years
- Mid-Level: 3-5 years
- Senior: 5-8 years
- Team Lead: 6-10 years
- Supervisor: 8-12 years
- Manager: 10-15 years
- Director: 15+ years

Return ONLY a valid JSON object with the following structure:
{
  "level": string (MUST be one of the available seniority levels),
  "yearsExperience": string (in format like "2-3 years" or "5+ years")
}`
        },
        {
          role: "user",
          content: `Title: ${title}
Description: ${description}

Based on this job title and description, suggest an appropriate seniority level and years of experience. The seniority level MUST be one of the available options listed above.`
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('Failed to generate suggestions');
    }

    const result = JSON.parse(content);
    
    // Validate that the suggested level is one of the available options
    if (!seniorityLevels.includes(result.level)) {
      throw new Error('Invalid seniority level suggested');
    }

    return {
      level: result.level,
      yearsExperience: result.yearsExperience
    };
  } catch (error) {
    console.error('Error generating seniority and experience:', error);
    throw error;
  }
}

interface TimezoneInfo {
  name: string;
  cities: string[];
  standard: string;
  daylight: string;
  utcOffset: number;
  businessHours: {
    start: string;
    end: string;
  };
}

export type TimezoneCode = "ET" | "CT" | "MT" | "PT" | "GMT" | "CET" | "GST" | "SGT" | "JST" | "AEST";

export const MAJOR_TIMEZONES: Record<TimezoneCode, TimezoneInfo> = {
  "ET": {
    name: "Eastern Time (ET)",
    cities: ["New York", "Miami", "Boston"],
    standard: "EST",
    daylight: "EDT",
    utcOffset: -5,
    businessHours: { start: "09:00", end: "17:00" }
  },
  "CT": {
    name: "Central Time (CT)",
    cities: ["Chicago", "Houston", "Dallas"],
    standard: "CST",
    daylight: "CDT",
    utcOffset: -6,
    businessHours: { start: "09:00", end: "17:00" }
  },
  "MT": {
    name: "Mountain Time (MT)",
    cities: ["Denver", "Phoenix", "Salt Lake City"],
    standard: "MST",
    daylight: "MDT",
    utcOffset: -7,
    businessHours: { start: "09:00", end: "17:00" }
  },
  "PT": {
    name: "Pacific Time (PT)",
    cities: ["Los Angeles", "San Francisco", "Seattle"],
    standard: "PST",
    daylight: "PDT",
    utcOffset: -8,
    businessHours: { start: "09:00", end: "17:00" }
  },
  "GMT": {
    name: "Greenwich Mean Time (GMT)",
    cities: ["London"],
    standard: "GMT",
    daylight: "BST",
    utcOffset: 0,
    businessHours: { start: "09:00", end: "17:00" }
  },
  "CET": {
    name: "Central European Time (CET)",
    cities: ["Paris", "Berlin", "Rome"],
    standard: "CET",
    daylight: "CEST",
    utcOffset: 1,
    businessHours: { start: "09:00", end: "17:00" }
  },
  "GST": {
    name: "Gulf Standard Time (GST)",
    cities: ["Dubai", "Abu Dhabi", "Muscat"],
    standard: "GST",
    daylight: "GST",
    utcOffset: 4,
    businessHours: { start: "08:00", end: "16:00" }
  },
  "SGT": {
    name: "Singapore Time (SGT)",
    cities: ["Singapore", "Kuala Lumpur"],
    standard: "SGT",
    daylight: "SGT",
    utcOffset: 8,
    businessHours: { start: "09:00", end: "17:00" }
  },
  "JST": {
    name: "Japan Standard Time (JST)",
    cities: ["Tokyo", "Osaka", "Seoul"],
    standard: "JST",
    daylight: "JST",
    utcOffset: 9,
    businessHours: { start: "09:00", end: "17:00" }
  },
  "AEST": {
    name: "Australian Eastern Time (AET)",
    cities: ["Sydney", "Melbourne", "Brisbane"],
    standard: "AEST",
    daylight: "AEDT",
    utcOffset: 10,
    businessHours: { start: "09:00", end: "17:00" }
  }
};

export const TIMEZONE_GROUPS: Record<string, TimezoneCode[]> = {
  americas: ["ET", "CT", "MT", "PT"],
  europe: ["GMT", "CET"],
  asiaPacific: ["GST", "SGT", "JST", "AEST"]
};

interface TimezoneCoverage {
  primary: string[];
  secondary: string[];
  overlap: {
    start: string;
    end: string;
    zones: string[];
  }[];
}

export function analyzeTimezones(selectedTimezones: TimezoneCode[]): TimezoneCoverage {
  // Filter out invalid timezones
  const validTimezones = selectedTimezones.filter(tz => MAJOR_TIMEZONES[tz]);

  // Sort timezones by UTC offset
  const sortedTimezones = validTimezones
    .map(tz => MAJOR_TIMEZONES[tz])
    .sort((a, b) => a.utcOffset - b.utcOffset);

  // Determine primary and secondary coverage
  const primary = validTimezones.filter(tz => 
    MAJOR_TIMEZONES[tz].utcOffset >= -5 && MAJOR_TIMEZONES[tz].utcOffset <= 1
  );
  const secondary = validTimezones.filter(tz => !primary.includes(tz));

  // Calculate overlapping business hours
  const overlap = [];
  if (sortedTimezones.length > 1) {
    for (let i = 0; i < sortedTimezones.length - 1; i++) {
      const current = sortedTimezones[i];
      const next = sortedTimezones[i + 1];
      
      const hourDiff = next.utcOffset - current.utcOffset;
      if (hourDiff <= 8) { // Only consider zones with reasonable overlap
        const overlapStart = addHours(current.businessHours.start, hourDiff);
        const overlapEnd = current.businessHours.end;
        
        if (isTimeInRange(overlapStart, next.businessHours.start, next.businessHours.end)) {
          overlap.push({
            start: overlapStart,
            end: overlapEnd,
            zones: [current.name, next.name]
          });
        }
      }
    }
  }

  return {
    primary,
    secondary,
    overlap
  };
}

export function suggestTimezones(baseTimezone: TimezoneCode): TimezoneCode[] {
  const base = MAJOR_TIMEZONES[baseTimezone];
  if (!base) return [];

  const suggestions: TimezoneCode[] = [];
  
  // Add timezones from the same region
  for (const [region, zones] of Object.entries(TIMEZONE_GROUPS)) {
    if (zones.includes(baseTimezone)) {
      suggestions.push(...zones.filter(tz => tz !== baseTimezone) as TimezoneCode[]);
      break;
    }
  }

  // Add complementary timezones for global coverage
  if (base.utcOffset <= 0) { // If in Americas/Europe
    suggestions.push(...TIMEZONE_GROUPS.asiaPacific.slice(0, 2));
  } else { // If in Asia/Pacific
    suggestions.push(...TIMEZONE_GROUPS.americas.slice(0, 2));
  }

  return [...new Set(suggestions)];
}

// Helper functions
function addHours(time: string, hours: number): string {
  const [h, m] = time.split(':').map(Number);
  const newHours = (h + hours + 24) % 24;
  return `${String(newHours).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function isTimeInRange(time: string, start: string, end: string): boolean {
  const [h, m] = time.split(':').map(Number);
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  
  const timeMinutes = h * 60 + m;
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  
  return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
}

export function getTimezoneDisplayName(timezone: TimezoneCode): string {
  return MAJOR_TIMEZONES[timezone]?.name || timezone;
}

export function getTimezoneBusinessHours(timezone: TimezoneCode): { start: string; end: string } {
  return MAJOR_TIMEZONES[timezone]?.businessHours || { start: "09:00", end: "17:00" };
}

interface WorkingHoursSuggestion {
  start: string;
  end: string;
  description: string;
  coverage: string[];
}

export function generateWorkingHoursSuggestions(
  selectedTimezones: TimezoneCode[],
  jobCategory?: string
): WorkingHoursSuggestion[] {
  const suggestions: WorkingHoursSuggestion[] = [];

  // Standard business hours for each region
  const standardHours = {
    americas: { start: "09:00", end: "17:00" },
    europe: { start: "09:00", end: "17:00" },
    asiaPacific: { start: "09:00", end: "17:00" }
  };

  // Get the regions covered by selected timezones
  const coveredRegions = new Set<string>();
  selectedTimezones.forEach(tz => {
    for (const [region, zones] of Object.entries(TIMEZONE_GROUPS)) {
      if (zones.includes(tz)) {
        coveredRegions.add(region);
      }
    }
  });

  // Add standard business hours suggestion
  suggestions.push({
    start: "09:00",
    end: "17:00",
    description: "Standard business hours",
    coverage: ["Local business hours"]
  });

  // Add early shift suggestion if covering multiple regions
  if (coveredRegions.size > 1) {
    suggestions.push({
      start: "06:00",
      end: "14:00",
      description: "Early shift for better timezone coverage",
      coverage: ["Early overlap with Asia/Pacific", "Afternoon coverage for Americas"]
    });
  }

  // Add late shift suggestion if covering multiple regions
  if (coveredRegions.size > 1) {
    suggestions.push({
      start: "14:00",
      end: "22:00",
      description: "Late shift for better timezone coverage",
      coverage: ["Morning coverage for Americas", "Evening overlap with Asia/Pacific"]
    });
  }

  // Add split shift suggestion for global coverage
  if (coveredRegions.size > 2) {
    suggestions.push({
      start: "08:00",
      end: "12:00",
      description: "Split shift for global coverage (morning)",
      coverage: ["Morning overlap with multiple regions"]
    });
    suggestions.push({
      start: "16:00",
      end: "20:00",
      description: "Split shift for global coverage (evening)",
      coverage: ["Evening overlap with multiple regions"]
    });
  }

  // Add job-specific suggestions
  if (jobCategory?.toLowerCase().includes('sales')) {
    suggestions.push({
      start: "10:00",
      end: "18:00",
      description: "Optimal hours for sales activities",
      coverage: ["Peak customer availability", "Key business hours coverage"]
    });
  }

  // Add suggestions for customer support if relevant
  if (jobCategory?.toLowerCase().includes('support')) {
    suggestions.push({
      start: "07:00",
      end: "15:00",
      description: "Early customer support coverage",
      coverage: ["Early customer support availability"]
    });
    suggestions.push({
      start: "15:00",
      end: "23:00",
      description: "Late customer support coverage",
      coverage: ["Extended customer support hours"]
    });
  }

  return suggestions;
}

// Helper function to format time for display
export function formatTimeRange(start: string, end: string): string {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return `${formatTime(start)} - ${formatTime(end)}`;
}