import OpenAI from 'openai';
import { GigData, GigSuggestion } from '../types';
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
            content: `You are an AI assistant that helps create job listings. Analyze the job title and suggest an appropriate category, seniority level, and other relevant details.

IMPORTANT: All responses MUST be in English only.

Available categories (MUST choose EXACTLY one of these, no variations or new categories allowed):
${predefinedOptions.basic.categories.map(cat => `- ${cat}`).join('\n')}

Available seniority levels:
${predefinedOptions.basic.seniorityLevels.map(level => `- ${level}`).join('\n')}

Available time zones:
${predefinedOptions.basic.timeZones.map(zone => `- ${zone}`).join('\n')}

Available schedule flexibility options:
${predefinedOptions.schedule.flexibility.map(option => `- ${option}`).join('\n')}

Available destination zones:
${predefinedOptions.basic.destinationZones.map(zone => `- ${zone}`).join('\n')}

Return ONLY a valid JSON object with the following structure:
{
  "description": string (detailed job description STRICTLY in 5-8 lines, separated by newlines),
  "category": string (MUST be EXACTLY one of the available categories, no variations or new categories allowed),
  "seniority": {
    "level": string (MUST be one of the available seniority levels),
    "yearsExperience": string
  },
  "timeZones": string[] (MUST be an array of time zones from the available options),
  "scheduleFlexibility": string[] (MUST be from available options),
  "destinationZone": string (MUST be one of the available zones),
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
- The category MUST be EXACTLY one of the provided options, no variations or new categories allowed
- The time zones MUST be an array of time zones from the provided options (we will use the first element as primary)
- The schedule flexibility options MUST be from the provided list
- The destination zone MUST be one of the provided options`
          },
          {
            role: "user",
            content: `Title: ${title}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
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

        // Validate time zones
        if (!Array.isArray(parsed.timeZones) || !parsed.timeZones.every((tz: string) => 
          predefinedOptions.basic.timeZones.includes(tz))) {
          throw new Error('Invalid time zones suggestion');
        }

        // Validate schedule flexibility
        if (!parsed.scheduleFlexibility.every((option: string) => 
          predefinedOptions.schedule.flexibility.includes(option))) {
          throw new Error('Invalid schedule flexibility options');
        }

        // Validate destination zone
        if (!predefinedOptions.basic.destinationZones.includes(parsed.destinationZone)) {
          throw new Error('Invalid destination zone suggestion');
        }

        // Add validation for category
        if (!predefinedOptions.basic.categories.includes(parsed.category)) {
          throw new Error(`Invalid category: ${parsed.category}. Must be one of: ${predefinedOptions.basic.categories.join(', ')}`);
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

export async function generateSeniorityAndExperience(title: string, description: string, seniorityLevels: string[]): Promise<{ seniority: { level: string; yearsExperience: number } }> {
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
          
IMPORTANT: All responses MUST be in English only.

Available seniority levels (you MUST choose one of these):
${predefinedOptions.basic.seniorityLevels.map(level => `- ${level}`).join('\n')}

For each level, here are the typical years of experience (you MUST return a SINGLE number, not a range):
- Entry Level: 1 year
- Junior: 2 years
- Mid-Level: 4 years
- Senior: 6 years
- Team Lead: 8 years
- Supervisor: 10 years
- Manager: 12 years
- Director: 15 years

Consider the following factors when determining seniority:
1. Complexity of responsibilities
2. Required technical expertise
3. Leadership requirements
4. Decision-making authority
5. Industry standards
6. Company size and structure

Return ONLY a valid JSON object with the following structure:
{
  "seniority": {
    "level": string (MUST be one of the available seniority levels),
    "yearsExperience": number (MUST be a single number, not a range)
  }
}`
        },
        {
          role: "user",
          content: `Title: ${title}
Description: ${description}

Based on this job title and description, suggest an appropriate seniority level and years of experience. The seniority level MUST be one of the available options listed above. Return a single number for yearsExperience, not a range.`
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
    if (!predefinedOptions.basic.seniorityLevels.includes(result.seniority.level)) {
      throw new Error('Invalid seniority level suggested');
    }

    // Ensure yearsExperience is a single number
    let yearsExperience: number;
    if (typeof result.seniority.yearsExperience === 'number') {
      yearsExperience = result.seniority.yearsExperience;
    } else {
      // Handle string format and ensure we get a single number
      const yearsStr = result.seniority.yearsExperience.toString().replace(/[^0-9]/g, '');
      yearsExperience = parseInt(yearsStr);
    }

    if (isNaN(yearsExperience) || typeof yearsExperience !== 'number') {
      throw new Error('Invalid years of experience value - must be a single number');
    }

    return {
      seniority: {
        level: result.seniority.level,
        yearsExperience: yearsExperience
      }
    };
  } catch (error) {
    console.error('Error generating seniority and experience:', error);
    throw error;
  }
}

export interface TimezoneInfo {
  name: string;
  description: string;
  offset: number;
  abbreviation: string;
  businessHours: {
    start: string;
    end: string;
  };
}

export type TimezoneCode = 'New York (EST/EDT)' | 'Chicago (CST/CDT)' | 'Denver (MST/MDT)' | 'Los Angeles (PST/PDT)' | 'London (GMT/BST)' | 'Paris (CET/CEST)' | 'Dubai (GST)' | 'Singapore (SGT)' | 'Tokyo (JST)' | 'Sydney (AEST/AEDT)';

export const MAJOR_TIMEZONES: Record<TimezoneCode, TimezoneInfo> = {
  'New York (EST/EDT)': {
    name: 'New York (EST/EDT)',
    description: 'Eastern United States, major financial hub',
    offset: -5,
    abbreviation: 'EST/EDT',
    businessHours: { start: "09:00", end: "17:00" }
  },
  'Chicago (CST/CDT)': {
    name: 'Chicago (CST/CDT)',
    description: 'Central United States, major business hub',
    offset: -6,
    abbreviation: 'CST/CDT',
    businessHours: { start: "09:00", end: "17:00" }
  },
  'Denver (MST/MDT)': {
    name: 'Denver (MST/MDT)',
    description: 'Mountain United States, growing tech hub',
    offset: -7,
    abbreviation: 'MST/MDT',
    businessHours: { start: "09:00", end: "17:00" }
  },
  'Los Angeles (PST/PDT)': {
    name: 'Los Angeles (PST/PDT)',
    description: 'Western United States, major tech and entertainment hub',
    offset: -8,
    abbreviation: 'PST/PDT',
    businessHours: { start: "09:00", end: "17:00" }
  },
  'London (GMT/BST)': {
    name: 'London (GMT/BST)',
    description: 'United Kingdom, major European financial center',
    offset: 0,
    abbreviation: 'GMT/BST',
    businessHours: { start: "09:00", end: "17:00" }
  },
  'Paris (CET/CEST)': {
    name: 'Paris (CET/CEST)',
    description: 'Central European business hub',
    offset: 1,
    abbreviation: 'CET/CEST',
    businessHours: { start: "09:00", end: "17:00" }
  },
  'Dubai (GST)': {
    name: 'Dubai (GST)',
    description: 'Middle Eastern business hub',
    offset: 4,
    abbreviation: 'GST',
    businessHours: { start: "09:00", end: "17:00" }
  },
  'Singapore (SGT)': {
    name: 'Singapore (SGT)',
    description: 'Southeast Asian business hub',
    offset: 8,
    abbreviation: 'SGT',
    businessHours: { start: "09:00", end: "17:00" }
  },
  'Tokyo (JST)': {
    name: 'Tokyo (JST)',
    description: 'Japan, major Asian financial center',
    offset: 9,
    abbreviation: 'JST',
    businessHours: { start: "09:00", end: "17:00" }
  },
  'Sydney (AEST/AEDT)': {
    name: 'Sydney (AEST/AEDT)',
    description: 'Australia, major Asia-Pacific business hub',
    offset: 10,
    abbreviation: 'AEST/AEDT',
    businessHours: { start: "09:00", end: "17:00" }
  }
};

export const TIMEZONE_GROUPS = {
  americas: ['New York (EST/EDT)', 'Chicago (CST/CDT)', 'Denver (MST/MDT)', 'Los Angeles (PST/PDT)'] as TimezoneCode[],
  europe: ['London (GMT/BST)', 'Paris (CET/CEST)', 'Dubai (GST)'] as TimezoneCode[],
  asiaPacific: ['Singapore (SGT)', 'Tokyo (JST)', 'Sydney (AEST/AEDT)'] as TimezoneCode[]
};

interface TimeRange {
  start: string;
  end: string;
  description: string;
  coverage: string[];
}

export function analyzeTimezones(timezones: TimezoneCode[]) {
  const validTimezones = timezones.filter(tz => MAJOR_TIMEZONES[tz]);
  
  if (validTimezones.length === 0) {
    return {
      coverage: 'No valid timezones selected',
      gaps: ['Full coverage needed'],
      recommendations: ['Select at least one timezone']
    };
  }

  const sortedTimezones = validTimezones
    .map(tz => MAJOR_TIMEZONES[tz])
    .sort((a, b) => a.offset - b.offset);

  // Determine primary and secondary coverage
  const primary = validTimezones.filter(tz => 
    MAJOR_TIMEZONES[tz].offset >= -5 && MAJOR_TIMEZONES[tz].offset <= 1
  );
  const secondary = validTimezones.filter(tz => !primary.includes(tz));

  return {
    coverage: `Primary coverage: ${primary.map(tz => MAJOR_TIMEZONES[tz].name).join(', ')}${
      secondary.length ? `\nSecondary coverage: ${secondary.map(tz => MAJOR_TIMEZONES[tz].name).join(', ')}` : ''
    }`,
    gaps: findCoverageGaps(validTimezones),
    recommendations: generateRecommendations(validTimezones)
  };
}

export function suggestTimezones(baseTimezone: TimezoneCode): TimezoneCode[] {
  const base = MAJOR_TIMEZONES[baseTimezone];
  const suggestions: TimezoneCode[] = [];

  // Add complementary timezones for global coverage
  if (base.offset <= 0) { // If in Americas/Europe
    suggestions.push(...TIMEZONE_GROUPS.asiaPacific);
  } else { // If in Asia/Pacific
    suggestions.push(...TIMEZONE_GROUPS.americas, ...TIMEZONE_GROUPS.europe);
  }

  return [...new Set([baseTimezone, ...suggestions])];
}

function findCoverageGaps(timezones: TimezoneCode[]): string[] {
  const gaps: string[] = [];
  const sortedTimezones = timezones
    .map(tz => MAJOR_TIMEZONES[tz])
    .sort((a, b) => a.offset - b.offset);

  // Check for major gaps in coverage
  if (!timezones.some(tz => MAJOR_TIMEZONES[tz].offset >= -5 && MAJOR_TIMEZONES[tz].offset <= -4)) {
    gaps.push('Americas (EST/EDT)');
  }
  if (!timezones.some(tz => MAJOR_TIMEZONES[tz].offset >= 0 && MAJOR_TIMEZONES[tz].offset <= 1)) {
    gaps.push('Europe (GMT/CET)');
  }
  if (!timezones.some(tz => MAJOR_TIMEZONES[tz].offset >= 8 && MAJOR_TIMEZONES[tz].offset <= 9)) {
    gaps.push('Asia/Pacific (SGT/JST)');
  }

  return gaps;
}

function generateRecommendations(timezones: TimezoneCode[]): string[] {
  const recommendations: string[] = [];
  const gaps = findCoverageGaps(timezones);

  if (gaps.length > 0) {
    recommendations.push(`Consider adding coverage for: ${gaps.join(', ')}`);
  }

  if (timezones.length < 2) {
    recommendations.push('Add more timezones for better global coverage');
  }

  return recommendations;
}

export function getTimezoneDisplayName(timezone: TimezoneCode): string {
  return MAJOR_TIMEZONES[timezone]?.name || timezone;
}

export function getTimezoneBusinessHours(timezone: TimezoneCode): { start: string; end: string } {
  return MAJOR_TIMEZONES[timezone]?.businessHours || { start: "08h00", end: "17h00" };
}

interface WorkingHoursSuggestion {
  start: string;
  end: string;
  description: string;
  coverage: string[];
}

export function generateWorkingHoursSuggestions(
  timezones: TimezoneCode[],
  businessType: string
): TimeRange[] {
  const suggestions: TimeRange[] = [];

  // Standard business hours
  suggestions.push({
    start: '09:00',
    end: '17:00',
    description: 'Standard business hours',
    coverage: ['Local market coverage']
  });

  // Extended hours for global coverage
  if (timezones.length > 1) {
    suggestions.push({
      start: '07:00',
      end: '19:00',
      description: 'Extended business hours',
      coverage: ['Improved global coverage', 'Overlap with other regions']
    });
  }

  // 24/7 coverage suggestion for certain business types
  if (businessType.toLowerCase().includes('support') || timezones.length > 2) {
    suggestions.push({
      start: '00:00',
      end: '23:59',
      description: '24/7 coverage',
      coverage: ['Full global coverage', 'Round-the-clock service']
    });
  }

  return suggestions;
}

export function formatTimeRange(start: string, end: string): string {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}h${minutes}`;
  };

  return `${formatTime(start)} - ${formatTime(end)}`;
}

export async function generateCommissionAndActivity(title: string, description: string): Promise<{
  commission: {
    options: Array<{
      base: string;
      baseAmount: number;
      bonus?: string;
      bonusAmount?: number;
      currency: string;
      minimumVolume: {
        amount: number;
        period: string;
        unit: string;
      };
      transactionCommission: {
        type: string;
        amount: number;
      };
    }>;
  };
  activity: {
    options: Array<{
      type: string;
      description: string;
      requirements: string[];
    }>;
  };
}> {
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
          content: `You are an AI assistant that helps determine appropriate commission structures and activity types for job positions.

IMPORTANT: All responses MUST be in English only.

CRITICAL COMMISSION STRUCTURE RULES:
1. The commission base type MUST be EXACTLY one of these TWO options only: "Fixed Salary" or "Base + Commission"
2. The bonus type MUST ALWAYS be "Performance Bonus" (no other options allowed)
3. The transaction commission type MUST ALWAYS be "Fixed Amount" (no other options allowed)
4. The minimumVolume.unit MUST be EXACTLY one of these TWO options only: "Calls" or "Sales"
5. The minimumVolume.period MUST be EXACTLY one of these THREE options only: "Daily", "Weekly", or "Monthly"
6. ALL numerical values MUST be realistic and appropriate for the job type:
   - For sales positions: baseAmount 0-5000, bonusAmount 50-500, transactionCommission.amount 10-100
   - For service positions: baseAmount 2000-8000, bonusAmount 100-1000, transactionCommission.amount 5-50
   - minimumVolume.amount should be realistic targets (e.g., 10-100 for daily, 50-500 for weekly, 200-2000 for monthly)
   - For "Base + Commission" positions: baseAmount should be 0, bonusAmount should be 100-300
   - For "Fixed Salary" positions: baseAmount should be 2000-8000, bonusAmount should be 50-200
7. NEVER return empty strings or null values for numerical fields
8. ALWAYS provide specific, realistic numbers based on the job description
9. For sales roles, bonusAmount should typically be 100-300 for performance bonuses

CRITICAL RULES FOR CURRENCY SELECTION:
1. ALWAYS use standard ISO 4217 currency codes (3 letters):
   - EUR (not Euro, Euros, €)
   - USD (not Dollar, Dollars, $)
   - MAD (not Dirham, Dirhams)
   - TRY (not Turkish Lira)
   - GBP (not Pound, Pounds, £)
   - JPY (not Yen, ¥)
   - INR (not Rupee, ₹)
   - AED (not Dirham, د.إ)
   - SGD (not Singapore Dollar, S$)
   - AUD (not Australian Dollar, A$)
   - CAD (not Canadian Dollar, C$)
   - HKD (not Hong Kong Dollar, HK$)
2. Currency codes MUST be:
   - Exactly 3 letters
   - All uppercase
   - No currency symbols
   - No currency names
3. Consider the following factors when choosing currency:
   - Primary market location
   - Target audience location
   - Industry standards in the region
   - Company headquarters location
   - Global vs local role scope
4. For global/remote positions, consider:
   - Company's primary market
   - Most common currency in the industry
   - Currency stability and recognition
5. If location is unclear, default to EUR for European roles or the most relevant regional currency

Examples of CORRECT format:
{
  "commission": {
    "options": [
      {
        "base": "Base + Commission",
        "baseAmount": 0,
        "bonus": "Performance Bonus",
        "bonusAmount": 150,
        "currency": "EUR",
        "minimumVolume": {
          "amount": 50,
          "period": "Monthly",
          "unit": "Calls"
        },
        "transactionCommission": {
          "type": "Fixed Amount",
          "amount": 25
        }
      }
    ]
  }
}

Return ONLY a valid JSON object with the following structure:
{
  "commission": {
    "options": [
      {
        "base": string (MUST be EXACTLY one of: "Fixed Salary", "Base + Commission"),
        "baseAmount": number (MUST be a plain number without currency symbol),
        "bonus": string (MUST ALWAYS be "Performance Bonus"),
        "bonusAmount": number (MUST be a plain number without currency symbol),
        "currency": string (MUST be one of the available currency codes),
        "minimumVolume": {
          "amount": number (MUST be a plain number without currency symbol),
          "period": string (MUST be EXACTLY one of: "Daily", "Weekly", "Monthly"),
          "unit": string (MUST be EXACTLY one of: "Calls", "Sales")
        },
        "transactionCommission": {
          "type": string (MUST ALWAYS be "Fixed Amount"),
          "amount": number (MUST be a plain number without currency symbol or percentage sign)
        }
      }
    ]
  },
  "activity": {
    "options": [
      {
        "type": string (e.g., "Lead Generation", "Sales"),
        "description": string (detailed description of the activity),
        "requirements": string[] (list of specific requirements)
      }
    ]
  }
}

Consider the following factors when determining commission and activity:
1. Industry standards and practices
2. Role complexity and responsibilities
3. Market conditions and competition
4. Performance metrics and KPIs
5. Risk and reward balance
6. Team structure and hierarchy`
        },
        {
          role: "user",
          content: `Title: ${title}
Description: ${description}

Based on this job title and description, suggest appropriate commission structures and activity types. The commission base type MUST be EXACTLY one of: "Fixed Salary" or "Base + Commission". The bonus type MUST ALWAYS be "Performance Bonus". The transaction commission type MUST ALWAYS be "Fixed Amount". The unit MUST be either "Calls" or "Sales". The period MUST be one of "Daily", "Weekly", or "Monthly".`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('Failed to generate suggestions');
    }

    const result = JSON.parse(content);
    
    // Validate and fix commission structure
    if (result.commission?.options) {
      result.commission.options.forEach((option: any) => {
        // Ensure all numerical values are numbers
        if (typeof option.baseAmount === 'string') {
          option.baseAmount = parseFloat(option.baseAmount) || 0;
        }
        if (typeof option.bonusAmount === 'string') {
          option.bonusAmount = parseFloat(option.bonusAmount) || 0;
        }
        if (option.minimumVolume && typeof option.minimumVolume.amount === 'string') {
          option.minimumVolume.amount = parseFloat(option.minimumVolume.amount) || 0;
        }
        if (option.transactionCommission && typeof option.transactionCommission.amount === 'string') {
          option.transactionCommission.amount = parseFloat(option.transactionCommission.amount) || 0;
        }
        
        // Ensure bonus type is always "Performance Bonus"
        option.bonus = "Performance Bonus";
        
        // Ensure transaction commission type is always "Fixed Amount"
        if (option.transactionCommission) {
          option.transactionCommission.type = "Fixed Amount";
        }
        
        // Validate unit and period
        if (option.minimumVolume) {
          const validUnits = ["Calls", "Sales"];
          if (!validUnits.includes(option.minimumVolume.unit)) {
            option.minimumVolume.unit = "Calls";
          }
          
          const validPeriods = ["Daily", "Weekly", "Monthly"];
          if (!validPeriods.includes(option.minimumVolume.period)) {
            option.minimumVolume.period = "Monthly";
          }
        }
        
        // Fix common commission value inversions
        // If minimumVolume.amount is very low (1-5) and transactionCommission.amount is also low (20-50),
        // it might be an inversion. Check if the description contains specific amounts.
        if (option.minimumVolume && option.transactionCommission) {
          const minVol = option.minimumVolume.amount;
          const transComm = option.transactionCommission.amount;
          
          // If both values are suspiciously low, they might be inverted
          if (minVol <= 5 && transComm <= 50) {
            // Look for specific amounts in the description that might indicate the correct values
            const description = result.description || '';
            
            // Check for appointment amounts (should be minimumVolume.amount)
            const appointmentMatch = description.match(/(\d+)\s*[€€]\s*per\s*(appointment|rendez-vous|meeting)/i);
            if (appointmentMatch) {
              option.minimumVolume.amount = parseInt(appointmentMatch[1]);
            }
            
            // Check for contract amounts (should be transactionCommission.amount)
            const contractMatch = description.match(/(\d+)\s*[€€]\s*per\s*(contract|contrat|sale|vente)/i);
            if (contractMatch) {
              option.transactionCommission.amount = parseInt(contractMatch[1]);
            }
          }
          
          // Additional check: if transactionCommission.amount is 0 but there are sale amounts mentioned
          if (transComm === 0) {
            const description = result.description || '';
            
            // Look for "X € per sale" patterns
            const saleMatch = description.match(/(\d+)\s*[€€]\s*per\s*sale/i);
            if (saleMatch) {
              option.transactionCommission.amount = parseInt(saleMatch[1]);
            }
            
            // Look for "up to X €" patterns (common in sales descriptions)
            const upToMatch = description.match(/up\s*to\s*(\d+)\s*[€€]/i);
            if (upToMatch) {
              option.transactionCommission.amount = parseInt(upToMatch[1]);
            }
            
            // Look for "X € / vente" patterns (French)
            const venteMatch = description.match(/(\d+)\s*[€€]\s*\/\s*vente/i);
            if (venteMatch) {
              option.transactionCommission.amount = parseInt(venteMatch[1]);
            }
            
            // Look for "X € par vente" patterns (French)
            const parVenteMatch = description.match(/(\d+)\s*[€€]\s*par\s*vente/i);
            if (parVenteMatch) {
              option.transactionCommission.amount = parseInt(parVenteMatch[1]);
            }
          }
        }
      });
    }

    return result;
  } catch (error) {
    console.error('Error generating commission and activity:', error);
    throw error;
  }
}

// Add a function to get current available options
export function getAvailableCommissionOptions() {
  return {
    baseTypes: predefinedOptions.commission.baseTypes,
    bonusTypes: predefinedOptions.commission.bonusTypes,
    currencies: predefinedOptions.commission.currencies
  };
}

// Add a function to get available sectors
export function getAvailableSectors() {
  return predefinedOptions.sectors;
}

export async function generateTeamAndTerritories(title: string, description: string): Promise<{
  team: {
    roles: Array<{
      id: string;
      name: string;
      description: string;
      count: number;
      requirements: string[];
    }>;
    structure: {
      hierarchy: string;
      reporting: string;
      collaboration: string[];
    };
  };
  territories: {
    primary: string[];
    secondary: string[];
    coverage: {
      type: string;
      description: string;
      requirements: string[];
    }[];
  };
}> {
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
          content: `You are an AI assistant that helps determine appropriate team structures and territory assignments for job positions.

IMPORTANT: All responses MUST be in English only.

Available team roles:
${(predefinedOptions.team.roles as Array<{id: string; name: string; description: string}>).map(role => `- ${role.name} (${role.description})`).join('\n')}

Available territories:
${(predefinedOptions.team.territories as string[]).map(territory => `- ${territory}`).join('\n')}

Return ONLY a valid JSON object with the following structure:
{
  "team": {
    "roles": [
      {
        "id": string (MUST match one of the available role IDs),
        "name": string (MUST match one of the available role names),
        "description": string (detailed role description),
        "count": number (suggested number of positions),
        "requirements": string[] (specific requirements for this role)
      }
    ],
    "structure": {
      "hierarchy": string (description of team hierarchy),
      "reporting": string (reporting structure),
      "collaboration": string[] (key collaboration points)
    }
  },
  "territories": {
    "primary": string[] (MUST be from available territories),
    "secondary": string[] (MUST be from available territories),
    "coverage": [
      {
        "type": string (e.g., "Regional", "Global"),
        "description": string (coverage description),
        "requirements": string[] (specific requirements for coverage)
      }
    ]
  }
}

Consider the following factors when determining team structure and territories:
1. Business objectives and goals
2. Market size and potential
3. Cultural and language considerations
4. Time zone coverage needs
5. Resource allocation and efficiency
6. Growth and scalability
7. Local market knowledge requirements
8. Regulatory and compliance considerations`
        },
        {
          role: "user",
          content: `Title: ${title}
Description: ${description}

Based on this job title and description, suggest appropriate team structure and territory assignments. The roles MUST be from the available options listed above, and territories MUST be from the available list.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('Failed to generate suggestions');
    }

    const result = JSON.parse(content);
    
    // Validate team roles
    result.team.roles.forEach((role: any) => {
      const validRole = (predefinedOptions.team.roles as Array<{id: string; name: string; description: string}>).find(r => r.id === role.id);
      if (!validRole) {
        throw new Error(`Invalid role ID: ${role.id}`);
      }
      if (validRole.name !== role.name) {
        throw new Error(`Role name mismatch for ID ${role.id}`);
      }
    });

    // Validate territories
    const allTerritories = [...result.territories.primary, ...result.territories.secondary];
    allTerritories.forEach((territory: string) => {
      if (!(predefinedOptions.team.territories as string[]).includes(territory)) {
        throw new Error(`Invalid territory: ${territory}`);
      }
    });

    return result;
  } catch (error) {
    console.error('Error generating team and territories:', error);
    throw error;
  }
}

export async function analyzeCityAndGetCountry(city: string): Promise<string> {
  if (!isValidApiKey(OPENAI_API_KEY)) {
    throw new Error('Please configure your OpenAI API key in the .env file');
  }

  if (!city) {
    throw new Error('City name is required');
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that helps identify the country of a given city. 
          Return ONLY the country name in French, exactly as it appears in the predefined list of countries.
          If the city is not found or is ambiguous, return "Unknown".
          
          Available countries:
          ${predefinedOptions.basic.destinationZones.join(', ')}`
        },
        {
          role: "user",
          content: `City: ${city}`
        }
      ],
      temperature: 0.3,
      max_tokens: 50
    });

    const country = completion.choices[0].message.content?.trim();
    
    if (!country || country === "Unknown" || !predefinedOptions.basic.destinationZones.includes(country)) {
      throw new Error('Could not determine the country for the given city');
    }

    return country;
  } catch (error) {
    console.error('Error analyzing city:', error);
    throw error;
  }
}

export async function generateSeniorityByCategory(
  title: string, 
  description: string, 
  category: string
): Promise<{ seniority: { level: string; yearsExperience: number } }> {
  if (!isValidApiKey(OPENAI_API_KEY)) {
    throw new Error('Please configure your OpenAI API key in the .env file');
  }

  if (!title || !description || !category) {
    throw new Error('Title, description, and category are required');
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that helps determine appropriate seniority levels and years of experience for job positions based on the job category.

IMPORTANT: All responses MUST be in English only.

Available seniority levels (you MUST choose one of these):
${predefinedOptions.basic.seniorityLevels.map(level => `- ${level}`).join('\n')}

For each level, here are the typical years of experience (you MUST return a SINGLE number, not a range or string):
- Entry Level: 1
- Junior: 2
- Mid-Level: 4
- Senior: 6
- Team Lead: 8
- Supervisor: 10
- Manager: 12
- Director: 15

Consider the following factors when determining seniority:
1. Job category and industry standards
2. Complexity of responsibilities
3. Required technical expertise
4. Leadership requirements
5. Decision-making authority
6. Company size and structure
7. Category-specific requirements

Return ONLY a valid JSON object with the following structure:
{
  "seniority": {
    "level": string (MUST be one of the available seniority levels),
    "yearsExperience": number (MUST be a single number, not a string or range)
  }
}

CRITICAL RULES FOR yearsExperience:
1. MUST be a number, not a string
2. MUST be a single number, not a range
3. MUST NOT include any text like "years" or "ans"
4. MUST NOT be in quotes
5. MUST be a whole number
6. MUST be between 0 and 30

Examples of CORRECT format:
{
  "seniority": {
    "level": "Mid-Level",
    "yearsExperience": 4
  }
}

Examples of INCORRECT format (DO NOT USE):
{
  "seniority": {
    "level": "Mid-Level",
    "yearsExperience": "4"  // Wrong: string instead of number
  }
}
{
  "seniority": {
    "level": "Mid-Level",
    "yearsExperience": 3  // Wrong: range instead of single number
  }
}
{
  "seniority": {
    "level": "Mid-Level",
    "yearsExperience": 2  // Wrong: includes text
  }
}`
        },
        {
          role: "user",
          content: `Title: ${title}
Description: ${description}
Category: ${category}

Based on this job title, description, and category, suggest an appropriate seniority level and years of experience. The seniority level MUST be one of the available options listed above. Return a single number for yearsExperience, not a string or range.`
        }
      ],
      temperature: 0.3,
      max_tokens: 200
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('Failed to generate suggestions');
    }

    const result = JSON.parse(content);
    
    // Validate that the suggested level is one of the available options
    if (!predefinedOptions.basic.seniorityLevels.includes(result.seniority.level)) {
      throw new Error('Invalid seniority level suggested');
    }

    // Convert and validate yearsExperience
    let yearsExperience: number;
    
    if (typeof result.seniority.yearsExperience === 'number') {
      yearsExperience = result.seniority.yearsExperience;
    } else if (typeof result.seniority.yearsExperience === 'string') {
      // Remove any non-numeric characters
      const cleanStr = result.seniority.yearsExperience.replace(/[^0-9]/g, '');
      yearsExperience = parseInt(cleanStr);
    } else {
      throw new Error('yearsExperience must be a number or a valid string representation');
    }

    // Final validation
    if (isNaN(yearsExperience) || !Number.isInteger(yearsExperience)) {
      throw new Error('yearsExperience must be a valid whole number');
    }

    if (yearsExperience < 0 || yearsExperience > 30) {
      throw new Error('yearsExperience must be between 0 and 30');
    }

    return {
      seniority: {
        level: result.seniority.level,
        yearsExperience: yearsExperience
      }
    };
  } catch (error) {
    console.error('Error generating seniority by category:', error);
    throw error;
  }
}

function convertTo24HourFormat(time: string): string {
  // Remove any whitespace and convert to lowercase
  time = time.trim().toLowerCase();
  
  // Handle format like "1am", "2pm", "10:30am", etc.
  const match = time.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
  if (!match) {
    // If already in 24h format (HH:mm), validate and return
    if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      const [hours, minutes] = time.split(':');
      return `${hours.padStart(2, '0')}:${minutes}`;
    }
    return '10:00'; // Default value if format is invalid
  }

  let [_, hours, minutes = '00', period] = match;
  hours = parseInt(hours).toString();
  
  // Convert to 24h format
  if (period === 'pm' && hours !== '12') {
    hours = (parseInt(hours) + 12).toString();
  } else if (period === 'am' && hours === '12') {
    hours = '00';
  }

  // Ensure two digits for hours and minutes
  hours = hours.padStart(2, '0');
  minutes = minutes.padStart(2, '0');
  
  return `${hours}:${minutes}`;
}

// Add this function before mapGeneratedDataToGigData

export function mapGeneratedDataToGigData(generatedData: GigSuggestion): Partial<GigData> {
  // Convert times to 24h format
  const startTime = convertTo24HourFormat(generatedData.schedule?.schedules?.[0]?.hours?.start || '09:00');
  const endTime = convertTo24HourFormat(generatedData.schedule?.schedules?.[0]?.hours?.end || '17:00');

  // Function to expand day ranges into individual days

  // Generate schedule based on input or default to weekdays
  let scheduleDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  if (generatedData.schedule?.schedules?.[0]) {
    const firstSchedule = generatedData.schedule.schedules[0];
    if ('days' in firstSchedule && Array.isArray(firstSchedule.days)) {
      scheduleDays = firstSchedule.days;
    } else if ('day' in firstSchedule && firstSchedule.day) {
      scheduleDays = [firstSchedule.day];
    }
  }

  // Generate schedule for each day
  const defaultSchedule = scheduleDays.map((day, index) => ({
    day,
    hours: {
      start: startTime,
      end: endTime
    },
    _id: {
      $oid: `684fdd69e512be3d11a9edc${index + 6}`
    }
  }));

  // Validate time range
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  // Ensure end time is after start time
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  const finalEndTime = endMinutes > startMinutes ? endTime : '17:00';

  const validBaseTypes = predefinedOptions.commission.baseTypes;
  // Allow both "Fixed Salary" and "Base + Commission" as valid base types
  const validRestrictedBaseTypes = ["Fixed Salary", "Base + Commission"];
  const base = generatedData.commission?.options?.[0]?.base && validRestrictedBaseTypes.includes(generatedData.commission.options[0].base) 
    ? generatedData.commission.options[0].base 
    : "Base + Commission"; // Default to "Base + Commission" if not specified or invalid

  const validTransactionTypes = predefinedOptions.commission.transactionCommissionTypes;
  // Force commission type to always be "Fixed Amount"
  const finalTransactionType = generatedData.commission?.options?.[0]?.transactionCommission?.type || "Fixed Amount";
  
  // Helper function to extract numeric value from string
  const extractNumericValue = (value: string | number): number => {
    if (typeof value === 'number') {
      return isNaN(value) ? 0 : value;
    }
    if (typeof value === 'string') {
      // Handle empty strings
      if (value.trim() === '') {
        return 0;
      }
      // Extract first number from string (e.g., "25 € per qualified appointment" -> 25)
      const match = value.match(/(\d+(?:\.\d+)?)/);
      return match ? parseFloat(match[1]) : 0;
    }
    return 0;
  };

  const transactionAmountRaw = generatedData.commission?.options?.[0]?.transactionCommission?.amount;
  const finalTransactionAmount = extractNumericValue(transactionAmountRaw || '1');

  // Validate language levels
  const validLanguageLevels = predefinedOptions.skills.skillLevels;
  const skills = generatedData.skills || {};
  const languages = skills.languages || [];
  
  // Ensure all language levels are valid
  const validatedLanguages = languages.map((lang: string | any) => {
    if (typeof lang === 'string') {
      // If it's a string like "English (Fluent)", extract the language and level
      const match = lang.match(/^(.+?)\s*\((.+?)\)$/);
      if (match) {
        const [_, language, level] = match;
        // Convert level to proper format if needed
        let normalizedLevel = level;
        if (level.toLowerCase() === 'fluent' || level.toLowerCase() === 'professional') normalizedLevel = 'C1';
        if (level.toLowerCase() === 'native' || level.toLowerCase() === 'native/bilingual' || level.toLowerCase() === 'natif') normalizedLevel = 'C2';
        if (level.toLowerCase() === 'basic') normalizedLevel = 'A1';
        if (level.toLowerCase() === 'conversational') normalizedLevel = 'B1';
        
        return {
          language: language.trim(),
          proficiency: validLanguageLevels.includes(normalizedLevel) ? normalizedLevel : 'A1',
          iso639_1: language.trim().toLowerCase().substring(0, 2) || 'en'
        };
      }
      return { 
        language: lang.trim(), 
        proficiency: 'A1',
        iso639_1: lang.trim().toLowerCase().substring(0, 2) || 'en'
      }; // Default to A1 if format is invalid
    }
    if (typeof lang === 'object' && lang !== null) {
      // If it's already an object with language and proficiency
      let normalizedLevel = lang.proficiency || lang.level;
      if (normalizedLevel?.toLowerCase() === 'fluent' || normalizedLevel?.toLowerCase() === 'professional') normalizedLevel = 'C1';
      if (normalizedLevel?.toLowerCase() === 'native' || normalizedLevel?.toLowerCase() === 'native/bilingual' || normalizedLevel?.toLowerCase() === 'natif') normalizedLevel = 'C2';
      if (normalizedLevel?.toLowerCase() === 'basic') normalizedLevel = 'A1';
      if (normalizedLevel?.toLowerCase() === 'conversational') normalizedLevel = 'B1';
      
      return {
        language: lang.language || lang.name || '',
        proficiency: validLanguageLevels.includes(normalizedLevel) ? normalizedLevel : 'A1',
        iso639_1: lang.iso639_1 || (lang.language || lang.name || '').toLowerCase().substring(0, 2) || 'en'
      };
    }
    return { 
      language: '', 
      proficiency: 'A1',
      iso639_1: 'en'
    }; // Default to empty language and A1 level if invalid
  });

  // Validate soft skills
  const validatedSoftSkills = (skills.soft || []).map((skill: string | any) => {
    if (typeof skill === 'string') {
      return { skill: skill.trim(), level: 1 };
    }
    if (typeof skill === 'object' && skill !== null) {
      return { skill: skill.skill || '', level: 1 };
    }
    return { skill: '', level: 1 };
  });

  // Validate professional skills
  const validatedProfessionalSkills = (skills.professional || []).map((skill: string | any) => {
    if (typeof skill === 'string') {
      return { skill: skill.trim(), level: 1 };
    }
    if (typeof skill === 'object' && skill !== null) {
      return { skill: skill.skill || '', level: 1 };
    }
    return { skill: '', level: 1 };
  });

  // Validate technical skills
  const validatedTechnicalSkills = (skills.technical || []).map((skill: string | any) => {
    if (typeof skill === 'string') {
      return { skill: skill.trim(), level: 1 };
    }
    if (typeof skill === 'object' && skill !== null) {
      return { skill: skill.skill || '', level: 1 };
    }
    return { skill: '', level: 1 };
  });

  // Process all schedules instead of just the first one
  const allSchedules = generatedData.schedule?.schedules?.map((schedule, index) => {
    const scheduleStartTime = convertTo24HourFormat(schedule.hours?.start || startTime);
    const scheduleEndTime = convertTo24HourFormat(schedule.hours?.end || endTime);
    
    // Check if the schedule has a 'day' property (individual day) or 'days' array
    if ('day' in schedule && schedule.day) {
      // This is an individual day schedule
      return {
        day: schedule.day,
        hours: {
          start: scheduleStartTime,
          end: scheduleEndTime
        },
        _id: {
          $oid: `684fdd69e512be3d11a9edc${index + 6}`
        }
      };
    } else if ('days' in schedule && Array.isArray(schedule.days)) {
      // This is a grouped schedule with multiple days
      return schedule.days.map((day: string, dayIndex: number) => ({
        day,
        hours: {
          start: scheduleStartTime,
          end: scheduleEndTime
        },
        _id: {
          $oid: `684fdd69e512be3d11a9edc${index * 100 + dayIndex + 6}`
        }
      }));
    } else {
      // Fallback to default schedule
      return defaultSchedule;
    }
  }).flat() || defaultSchedule;

  // Validate sectors
  const validSectors = predefinedOptions.sectors;
  const validatedSectors = (generatedData.sectors || []).filter(sector => 
    validSectors.includes(sector)
  );

  // Validate team roles - ensure only predefined roles are used
  const validTeamRoles = predefinedOptions.team.roles.map(role => role.id);
  const validatedTeamStructure = (generatedData.team?.structure || []).map((role: any) => {
    // Check if the roleId exists in predefined roles
    if (!validTeamRoles.includes(role.roleId)) {
      // If not valid, try to find a similar role or default to 'agent'
      const similarRole = predefinedOptions.team.roles.find(validRole => 
        validRole.name.toLowerCase().includes('agent') || 
        validRole.name.toLowerCase().includes('representative') ||
        validRole.name.toLowerCase().includes('sales')
      );
      
      return {
        roleId: similarRole?.id || 'agent',
        count: role.count || 1,
        seniority: {
          level: role.seniority?.level || '',
          yearsExperience: role.seniority?.yearsExperience || 0
        }
      };
    }
    
    return {
      roleId: role.roleId,
      count: role.count || 1,
      seniority: {
        level: role.seniority?.level || '',
        yearsExperience: role.seniority?.yearsExperience || 0
      }
    };
  });

  // Validate team territories - ensure only predefined territories are used
  const validTeamTerritories = predefinedOptions.team.territories;
  const validatedTeamTerritories = (generatedData.team?.territories || []).filter(territory => 
    validTeamTerritories.includes(territory)
  );

  return {
    title: generatedData.jobTitles?.[0] || generatedData.title || '',
    description: generatedData.description || '',
    category: validatedSectors[0] || '',
    highlights: generatedData.highlights || [],
    destinationZones: (generatedData.destinationZones || []).map(zone => {
      // If it's "Global", replace with "France"
      if (zone.toLowerCase() === 'global') {
        return 'France';
      }
      
      // Convert continent names to appropriate country/region
      const continentMap: { [key: string]: string } = {
        'Europe': 'European Union',
        'North America': 'United States',
        'South America': 'Brazil',
        'Asia': 'China',
        'Africa': 'South Africa',
        'Oceania': 'Australia',
        'Antarctica': 'Australia' // Default to Australia for Antarctica
      };

      // If it's a continent, convert to appropriate country/region
      if (continentMap[zone]) {
        return continentMap[zone];
      }

      // If it's a city, try to get its country
      if (zone.includes(',')) {
        const parts = zone.split(',');
        return parts[parts.length - 1].trim();
      }

      // If it's already a country or region, return as is
      return zone;
    }).filter(zone => zone && zone.length > 0),
    seniority: {
      level: generatedData.seniority?.level || '',
      yearsExperience: generatedData.seniority?.yearsExperience || 0,
    },
    availability: {
      schedule: allSchedules,
      timeZones: generatedData.schedule?.timeZones || [],
      timeZone: generatedData.schedule?.timeZones?.[0] || '',
      flexibility: generatedData.schedule?.flexibility || [],
      minimumHours: {
        daily: generatedData.schedule?.minimumHours?.daily || undefined,
        weekly: generatedData.schedule?.minimumHours?.weekly || undefined,
        monthly: generatedData.schedule?.minimumHours?.monthly || undefined
      },
    },
    schedule: {
      schedules: allSchedules,
      timeZones: generatedData.schedule?.timeZones || [],
      timeZone: generatedData.schedule?.timeZones?.[0] || '',
      flexibility: generatedData.schedule?.flexibility || [],
      minimumHours: {
        daily: generatedData.schedule?.minimumHours?.daily || undefined,
        weekly: generatedData.schedule?.minimumHours?.weekly || undefined,
        monthly: generatedData.schedule?.minimumHours?.monthly || undefined
      },
    },
    commission: {
      base,
      baseAmount: extractNumericValue(
        generatedData.commission?.options?.[0]?.baseAmount || '0'
      ),
      bonus: "Performance Bonus",
      bonusAmount: extractNumericValue(
        generatedData.commission?.options?.[0]?.bonusAmount || (base === "Base + Commission" ? '150' : '100')
      ),
      structure: generatedData.commission?.options?.[0]?.structure || '',
      currency: generatedData.commission?.options?.[0]?.currency || 'EUR',
      minimumVolume: {
        amount: extractNumericValue(
          generatedData.commission?.options?.[0]?.minimumVolume?.amount || '10'
        ),
        period: (() => {
          const period = generatedData.commission?.options?.[0]?.minimumVolume?.period;
          const validPeriods = ["Daily", "Weekly", "Monthly"];
          if (period && validPeriods.includes(period)) {
            return period;
          }
          // Default to "Monthly" if period is not specified or invalid
          return "Monthly";
        })(),
        unit: (() => {
          const unit = generatedData.commission?.options?.[0]?.minimumVolume?.unit;
          const validUnits = ["Calls", "Sales"];
          if (unit && validUnits.includes(unit)) {
            return unit;
          }
          // Default to "Calls" if unit is not specified or invalid
          return "Calls";
        })()
      },
      transactionCommission: {
        type: finalTransactionType,
        amount: finalTransactionAmount
      },
      kpis: []
    },
    skills: {
      languages: validatedLanguages,
      soft: validatedSoftSkills.map(skill => ({ skill: skill.skill, level: 1 })),
      professional: validatedProfessionalSkills.map(skill => ({ skill: skill.skill, level: 1 })),
      technical: validatedTechnicalSkills.map(skill => ({ skill: skill.skill, level: 1 })),
      certifications: generatedData.skills?.certifications || []
    },
    requirements: {
      essential: generatedData.requirements?.essential || [],
      preferred: generatedData.requirements?.preferred || []
    },
    benefits: generatedData.benefits || [],
    metrics: {
      kpis: [],
      targets: {},
      reporting: {
        frequency: '',
        metrics: []
      }
    },
    team: {
      size: generatedData.team?.size || 0,
      structure: validatedTeamStructure,
      territories: validatedTeamTerritories,
      reporting: {
        to: generatedData.team?.reporting?.to || "Manager",
        frequency: generatedData.team?.reporting?.frequency || "Weekly"
      },
      collaboration: generatedData.team?.collaboration || []
    }
  };
}

export async function generateSkills(title: string, description: string): Promise<{
  languages: Array<{
    language: string;
    proficiency: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
    iso639_1: string;
  }>;
  soft: string[];
  professional: string[];
  technical: string[];
}> {
  if (!isValidApiKey(OPENAI_API_KEY)) {
    throw new Error('Please configure your OpenAI API key in the .env file');
  }

  if (!title || !description) {
    throw new Error('Title and description are required');
  }

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a job description expert. Generate skills for a "${title}" position.
          
IMPORTANT: All responses MUST be in English only.

For languages, use CEFR levels (A1, A2, B1, B2, C1, C2):
- A1: Basic user
- A2: Elementary user  
- B1: Intermediate user
- B2: Upper intermediate user
- C1: Advanced user
- C2: Mastery user

Available soft skills (choose 5-8 most relevant):
${predefinedOptions.skills.soft.map(skill => `- ${skill.skill}`).join('\n')}

Available professional skills (choose 8-12 most relevant):
${predefinedOptions.skills.professional.map(skill => `- ${skill.skill}`).join('\n')}

Available technical skills (choose 6-10 most relevant):
${predefinedOptions.skills.technical.map(skill => `- ${skill.skill}`).join('\n')}

Available languages:
${predefinedOptions.skills.languages.map(lang => `- ${lang.language}`).join('\n')}

Return ONLY a valid JSON object with the following structure:
{
  "languages": [
    {
      "language": "string (from available languages)",
      "proficiency": "string (A1, A2, B1, B2, C1, or C2)",
      "iso639_1": "string (2-letter language code)"
    }
  ],
  "soft": [
    "string (from available soft skills list)"
  ],
  "professional": [
    "string (from available professional skills list)"
  ],
  "technical": [
    "string (from available technical skills list)"
  ]
}

CRITICAL RULES:
1. Only select skills from the provided lists - do not create new skills
2. Choose skills that are most relevant to the specific job title and description
3. For customer service roles, prioritize communication and empathy skills
4. For technical support roles, prioritize troubleshooting and technical skills
5. For sales roles, prioritize persuasion and relationship-building skills
6. Select appropriate number of skills: 5-8 soft, 8-12 professional, 6-10 technical
7. For languages, consider the target market and customer base
8. All skill names must match exactly from the provided lists`
        },
        {
          role: "user",
          content: `Generate skills for this position:
Title: ${title}
Description: ${description}

Select the most relevant skills from the provided lists based on the job requirements and responsibilities.`
        }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 1000
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('Failed to generate suggestions');
    }

    const result = JSON.parse(content);
    
    // Validate languages
    const validLanguages = predefinedOptions.skills.languages.map(lang => lang.language);
    const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    
    result.languages.forEach((lang: any) => {
      // Ensure we're dealing with human languages, not programming languages
      if (!validLanguages.includes(lang.language)) {
        throw new Error(`Invalid human language: ${lang.language}`);
      }
      if (!validLevels.includes(lang.proficiency)) {
        throw new Error(`Invalid language level: ${lang.proficiency}`);
      }
    });

    // Validate soft skills
    const validSoftSkills = predefinedOptions.skills.soft.map(skill => skill.skill);
    result.soft.forEach((skill: string) => {
      if (!validSoftSkills.includes(skill)) {
        throw new Error(`Invalid soft skill: ${skill}`);
      }
    });

    // Validate professional skills
    const validProfessionalSkills = predefinedOptions.skills.professional.map(skill => skill.skill);
    result.professional.forEach((skill: string) => {
      if (!validProfessionalSkills.includes(skill)) {
        throw new Error(`Invalid professional skill: ${skill}`);
      }
    });

    // Validate technical skills
    const validTechnicalSkills = predefinedOptions.skills.technical.map(skill => skill.skill);
    result.technical.forEach((skill: string) => {
      if (!validTechnicalSkills.includes(skill)) {
        throw new Error(`Invalid technical skill: ${skill}`);
      }
    });

    return result;
  } catch (error) {
    console.error('Error generating skills:', error);
    throw error;
  }
}

export async function generateGigSuggestions(description: string): Promise<GigSuggestion> {
  if (!isValidApiKey(OPENAI_API_KEY)) {
    throw new Error('Please configure your OpenAI API key in the .env file');
  }

  if (!description) {
    throw new Error('Description is required');
  }

  try {
    const result = await retryWithBackoff(async () => {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant that creates job listings. Generate a JSON response with this structure:

{
  "title": "string",
  "description": "string (5-8 lines)",
  "category": "string (Sales, Customer Service, Technical Support, or Lead Generation)",
  "highlights": ["string"],
  "jobTitles": ["string"],
  "deliverables": ["string"],
  "sectors": ["string (MUST be from the predefined list)"],
  "destinationZones": ["string"],
  "schedule": {
    "schedules": [{"days": ["Monday", "Tuesday"], "hours": {"start": "09:00", "end": "17:00"}}],
    "timeZones": ["string"],
    "flexibility": ["string"],
    "minimumHours": {"daily": 8, "weekly": 40, "monthly": 160}
  },
  "requirements": {"essential": ["string"], "preferred": ["string"]},
  "skills": {
    "languages": [{"language": "string", "proficiency": "B1", "iso639_1": "en"}],
    "soft": [{"skill": "string", "level": 3}],
    "professional": [{"skill": "string", "level": 3}],
    "technical": [{"skill": "string", "level": 3}]
  },
  "seniority": {"level": "Mid-Level", "yearsExperience": 3},
  "team": {
    "size": 1,
    "structure": [{"roleId": "agent", "count": 1, "seniority": {"level": "Mid-Level", "yearsExperience": 3}}],
    "territories": ["France"]
  },
  "commission": {
    "options": [{
      "base": "Base + Commission",
      "baseAmount": 0,
      "bonus": "Performance Bonus",
      "bonusAmount": 150,
      "currency": "EUR",
      "minimumVolume": {"amount": 25, "period": "Monthly", "unit": "Calls"},
      "transactionCommission": {"type": "Fixed Amount", "amount": 50}
    }]
  }
}

Rules:
- Use realistic numbers for commission
- Choose relevant skills from common job requirements
- Keep description concise but professional
- Use standard time zones and working hours
- IMPORTANT: For destinationZones, use specific country names (e.g., "France", "United States", "Germany") NOT "Global" or continents
- Default destination zone should be "France" if no specific country is mentioned
- CRITICAL: For sectors, you MUST ONLY use these exact sectors (no variations, no new sectors):
  * Inbound Sales
  * Outbound Sales
  * Customer Service
  * Technical Support
  * Account Management
  * Lead Generation
  * Market Research
  * Appointment Setting
  * Order Processing
  * Customer Retention
  * Billing Support
  * Product Support
  * Help Desk
  * Chat Support
  * Email Support
  * Social Media Support
  * Survey Calls
  * Welcome Calls
  * Follow-up Calls
  * Complaint Resolution
  * Warranty Support
  * Collections
  * Dispatch Services
  * Emergency Support
  * Multilingual Support
- CRITICAL: For schedule flexibility, you MUST ONLY use these exact options (no variations, no new options):
  * Remote Work Available
  * Flexible Hours
  * Weekend Rotation
  * Night Shift Available
  * Split Shifts
  * Part-Time Options
  * Compressed Work Week
  * Shift Swapping Allowed
- CRITICAL: For skills, you MUST ONLY use skills from the predefined lists. Choose relevant skills based on the job description:

  * Professional Skills (CRM & Ticketing): CRM System Proficiency, Ticket Management, Understanding of ticket priority levels
  * Professional Skills (Call Center Operations): Call Dispositioning, Call Recording & QA Systems, Phone System Usage
  * Professional Skills (Communication Channels): Email Support, Live Chat/Messenger, Social Media Messaging, Voice Support
  * Professional Skills (Compliance & QA): Compliance Script Following, Data Protection Awareness, QA Framework Adherence
  * Professional Skills (Documentation): Fast and Accurate Typing, Keyboard Shortcuts & Productivity, Knowledge Base Usage, Real-time Data Entry
  * Professional Skills (Language & Culture): Formal/Informal Register Usage, Multilingual Abilities, Regional Expression Familiarity
  * Professional Skills (Performance Metrics): Performance Metrics Understanding, Self-Performance Monitoring
  * Professional Skills (Product Knowledge): Familiarity with standard operating procedures (SOPs), In-depth understanding of products/services, Knowledge of company policies
  * Professional Skills (Reporting & Analysis): Basic Troubleshooting, Internal Documentation, Issue Pattern Recognition, Remote Support Tools, Reporting Tools Usage

  * Technical Skills (CRM & Ticketing Systems): CRM Systems Daily Use, Ticket Operations, Ticketing Platforms
  * Technical Skills (Collaboration Tools): Communication Tools Usage
  * Technical Skills (Contact Center Software): Call Management Operations, Cloud-based Contact Center Software, VoIP Systems Understanding
  * Technical Skills (Email Management): Email Automation, Email Template Adherence, Shared Inbox Usage
  * Technical Skills (Knowledge Management): Information Retrieval, Knowledge Base Navigation, Search Function Usage
  * Technical Skills (Live Chat Platforms): Chat Shortcuts & Responses, Chatbot Integration Understanding, Multi-Chat Management
  * Technical Skills (Operating Systems & Office): Cloud Platform Usage, Office Suite Usage, Operating Systems Proficiency
  * Technical Skills (Quality Assurance): Call Monitoring Systems
  * Technical Skills (Technical Support): Bug Logging, Remote Desktop Tools, User Issue Diagnosis
  * Technical Skills (Typing & Productivity): Fast Typing Skills, Keyboard Shortcuts

  * Soft Skills (Adaptability): Adaptability, Cultural Sensitivity, Willingness to Learn
  * Soft Skills (Collaboration): Conflict Resolution, Team Collaboration
  * Soft Skills (Communication): Active Listening, Clear Articulation, Proper Tone & Language, Spelling & Grammar Accuracy
  * Soft Skills (Customer Service): Ownership, Service Orientation
  * Soft Skills (Emotional Intelligence): Empathy, Patience
  * Soft Skills (Problem Solving): Analytical Thinking, Creativity, Decision-Making
  * Soft Skills (Self-Management): Efficiency, Multitasking, Receptiveness to Feedback, Resilience, Self-Regulation`
          },
          {
            role: "user",
            content: `Generate job listing for: ${description}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error('Failed to generate suggestions');
      }

      try {
        const parsedResult = JSON.parse(content);
        
        // Validate sectors to ensure only predefined ones are used
        if (parsedResult.sectors && parsedResult.sectors.length > 0) {
          const validSectors = predefinedOptions.sectors;
          const filteredSectors = parsedResult.sectors.filter((sector: string) => {
            const isValid = validSectors.includes(sector);
            if (!isValid) {
              console.warn(`Invalid sector "${sector}" - not in allowed list`);
            }
            return isValid;
          });
          parsedResult.sectors = filteredSectors;
        }

        // Validate flexibility options to ensure only predefined ones are used
        if (parsedResult.schedule?.flexibility && parsedResult.schedule.flexibility.length > 0) {
          const validFlexibilityOptions = [
            "Remote Work Available",
            "Flexible Hours", 
            "Weekend Rotation",
            "Night Shift Available",
            "Split Shifts",
            "Part-Time Options",
            "Compressed Work Week",
            "Shift Swapping Allowed"
          ];
          const filteredFlexibility = parsedResult.schedule.flexibility.filter((option: string) => {
            const isValid = validFlexibilityOptions.includes(option);
            if (!isValid) {
              console.warn(`Invalid flexibility option "${option}" - not in allowed list`);
            }
            return isValid;
          });
          parsedResult.schedule.flexibility = filteredFlexibility;
        }

        // Validate skills to ensure only predefined ones are used
        if (parsedResult.skills) {
          console.log('🎯 AI Generated Skills (before validation):', {
            professional: parsedResult.skills.professional,
            technical: parsedResult.skills.technical,
            soft: parsedResult.skills.soft
          });
          // Define valid skills from API
          const validProfessionalSkills = [
            "CRM System Proficiency", "Ticket Management", "Understanding of ticket priority levels",
            "Call Dispositioning", "Call Recording & QA Systems", "Phone System Usage",
            "Email Support", "Live Chat/Messenger", "Social Media Messaging", "Voice Support",
            "Compliance Script Following", "Data Protection Awareness", "QA Framework Adherence",
            "Fast and Accurate Typing", "Keyboard Shortcuts & Productivity", "Knowledge Base Usage", "Real-time Data Entry",
            "Formal/Informal Register Usage", "Multilingual Abilities", "Regional Expression Familiarity",
            "Performance Metrics Understanding", "Self-Performance Monitoring",
            "Familiarity with standard operating procedures (SOPs)", "In-depth understanding of products/services", "Knowledge of company policies",
            "Basic Troubleshooting", "Internal Documentation", "Issue Pattern Recognition", "Remote Support Tools", "Reporting Tools Usage"
          ];

          const validTechnicalSkills = [
            "CRM Systems Daily Use", "Ticket Operations", "Ticketing Platforms",
            "Communication Tools Usage", "Call Management Operations", "Cloud-based Contact Center Software", "VoIP Systems Understanding",
            "Email Automation", "Email Template Adherence", "Shared Inbox Usage",
            "Information Retrieval", "Knowledge Base Navigation", "Search Function Usage",
            "Chat Shortcuts & Responses", "Chatbot Integration Understanding", "Multi-Chat Management",
            "Cloud Platform Usage", "Office Suite Usage", "Operating Systems Proficiency",
            "Call Monitoring Systems", "Bug Logging", "Remote Desktop Tools", "User Issue Diagnosis",
            "Fast Typing Skills", "Keyboard Shortcuts"
          ];

          const validSoftSkills = [
            "Adaptability", "Cultural Sensitivity", "Willingness to Learn",
            "Conflict Resolution", "Team Collaboration",
            "Active Listening", "Clear Articulation", "Proper Tone & Language", "Spelling & Grammar Accuracy",
            "Ownership", "Service Orientation",
            "Empathy", "Patience",
            "Analytical Thinking", "Creativity", "Decision-Making",
            "Efficiency", "Multitasking", "Receptiveness to Feedback", "Resilience", "Self-Regulation"
          ];

          // Validate professional skills
          if (parsedResult.skills.professional && parsedResult.skills.professional.length > 0) {
            const filteredProfessional = parsedResult.skills.professional.filter((skill: any) => {
              const skillName = typeof skill === 'string' ? skill : skill.skill;
              const isValid = validProfessionalSkills.includes(skillName);
              if (!isValid) {
                console.warn(`Invalid professional skill "${skillName}" - not in allowed list`);
              }
              return isValid;
            });
            parsedResult.skills.professional = filteredProfessional;
          }

          // Validate technical skills
          if (parsedResult.skills.technical && parsedResult.skills.technical.length > 0) {
            const filteredTechnical = parsedResult.skills.technical.filter((skill: any) => {
              const skillName = typeof skill === 'string' ? skill : skill.skill;
              const isValid = validTechnicalSkills.includes(skillName);
              if (!isValid) {
                console.warn(`Invalid technical skill "${skillName}" - not in allowed list`);
              }
              return isValid;
            });
            parsedResult.skills.technical = filteredTechnical;
          }

          // Validate soft skills
          if (parsedResult.skills.soft && parsedResult.skills.soft.length > 0) {
            const filteredSoft = parsedResult.skills.soft.filter((skill: any) => {
              const skillName = typeof skill === 'string' ? skill : skill.skill;
              const isValid = validSoftSkills.includes(skillName);
              if (!isValid) {
                console.warn(`Invalid soft skill "${skillName}" - not in allowed list`);
              }
              return isValid;
            });
            parsedResult.skills.soft = filteredSoft;
          }
          
          console.log('✅ AI Generated Skills (after validation):', {
            professional: parsedResult.skills.professional,
            technical: parsedResult.skills.technical,
            soft: parsedResult.skills.soft
          });
        }

        // Basic validation and defaults
        if (!parsedResult.commission?.options) {
          parsedResult.commission = {
            options: [{
              base: "Base + Commission",
              baseAmount: 0,
              bonus: "Performance Bonus",
              bonusAmount: 150,
              currency: "EUR",
              minimumVolume: { amount: 25, period: "Monthly", unit: "Calls" },
              transactionCommission: { type: "Fixed Amount", amount: 50 }
            }]
          };
        }

        if (!parsedResult.team) {
          parsedResult.team = {
            size: 1,
            structure: [{
              roleId: "agent",
              count: 1,
              seniority: { level: "Mid-Level", yearsExperience: 3 }
            }],
            territories: ["France"]
          };
        }

        if (!parsedResult.skills) {
          parsedResult.skills = {
            languages: [{ language: "English", proficiency: "B1", iso639_1: "en" }],
            soft: [{ skill: "Communication", level: 3 }],
            professional: [{ skill: "Customer Service", level: 3 }],
            technical: [{ skill: "CRM Software", level: 2 }]
          };
        }
        
        return parsedResult;
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
