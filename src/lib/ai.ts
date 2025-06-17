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
  "timeZone": string (MUST be one of the available time zones),
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
- The time zone MUST be one of the provided options
- The schedule flexibility options MUST be from the provided list
- The destination zone MUST be one of the provided options`
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

        // Validate time zone
        if (!predefinedOptions.basic.timeZones.includes(parsed.timeZone)) {
          throw new Error('Invalid time zone suggestion');
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

export type TimezoneCode = 'America/New_York' | 'Europe/London' | 'Asia/Singapore' | 'Asia/Tokyo' | 'Europe/Paris' | 'America/Chicago' | 'America/Denver' | 'America/Los_Angeles' | 'Europe/Dubai' | 'Australia/Sydney';

export const MAJOR_TIMEZONES: Record<TimezoneCode, TimezoneInfo> = {
  'America/New_York': {
    name: 'New York (EST/EDT)',
    description: 'Eastern United States, major financial hub',
    offset: -5,
    abbreviation: 'EST/EDT',
    businessHours: { start: "09:00", end: "17:00" }
  },
  'America/Chicago': {
    name: 'Chicago (CST/CDT)',
    description: 'Central United States, major business hub',
    offset: -6,
    abbreviation: 'CST/CDT',
    businessHours: { start: "09:00", end: "17:00" }
  },
  'America/Denver': {
    name: 'Denver (MST/MDT)',
    description: 'Mountain United States, growing tech hub',
    offset: -7,
    abbreviation: 'MST/MDT',
    businessHours: { start: "09:00", end: "17:00" }
  },
  'America/Los_Angeles': {
    name: 'Los Angeles (PST/PDT)',
    description: 'Western United States, major tech and entertainment hub',
    offset: -8,
    abbreviation: 'PST/PDT',
    businessHours: { start: "09:00", end: "17:00" }
  },
  'Europe/London': {
    name: 'London (GMT/BST)',
    description: 'United Kingdom, major European financial center',
    offset: 0,
    abbreviation: 'GMT/BST',
    businessHours: { start: "09:00", end: "17:00" }
  },
  'Europe/Paris': {
    name: 'Paris (CET/CEST)',
    description: 'Central European business hub',
    offset: 1,
    abbreviation: 'CET/CEST',
    businessHours: { start: "09:00", end: "17:00" }
  },
  'Europe/Dubai': {
    name: 'Dubai (GST)',
    description: 'Middle Eastern business hub',
    offset: 4,
    abbreviation: 'GST',
    businessHours: { start: "09:00", end: "17:00" }
  },
  'Asia/Singapore': {
    name: 'Singapore (SGT)',
    description: 'Southeast Asian business hub',
    offset: 8,
    abbreviation: 'SGT',
    businessHours: { start: "09:00", end: "17:00" }
  },
  'Asia/Tokyo': {
    name: 'Tokyo (JST)',
    description: 'Japan, major Asian financial center',
    offset: 9,
    abbreviation: 'JST',
    businessHours: { start: "09:00", end: "17:00" }
  },
  'Australia/Sydney': {
    name: 'Sydney (AEST/AEDT)',
    description: 'Australia, major Asia-Pacific business hub',
    offset: 10,
    abbreviation: 'AEST/AEDT',
    businessHours: { start: "09:00", end: "17:00" }
  }
};

export const TIMEZONE_GROUPS = {
  americas: ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles'] as TimezoneCode[],
  europe: ['Europe/London', 'Europe/Paris', 'Europe/Dubai'] as TimezoneCode[],
  asiaPacific: ['Asia/Singapore', 'Asia/Tokyo', 'Australia/Sydney'] as TimezoneCode[]
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
      baseAmount: string;
      bonus?: string;
      bonusAmount?: string;
      currency: string;
      minimumVolume: {
        amount: string;
        period: string;
        unit: string;
      };
      transactionCommission: {
        type: string;
        amount: string;
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

CRITICAL: The commission base type MUST be EXACTLY one of these five options, no variations allowed:
1. "Fixed Salary"
2. "Base + Commission"
3. "Pure Commission"
4. "Tiered Commission"
5. "Graduated Commission"

CRITICAL: The transaction commission type MUST be EXACTLY one of these three options, no variations allowed:
1. "Fixed Amount"
2. "Percentage"
3. "Conversion"

CRITICAL RULES FOR NUMERICAL VALUES:
1. baseAmount MUST be a plain number without currency symbol (e.g., 5000 not $5000)
2. bonusAmount MUST be a plain number without currency symbol (e.g., 200 not $200)
3. transactionCommission.amount MUST be a plain number without currency symbol or percentage sign (e.g., 5 not $5 or 5%)
4. minimumVolume.amount MUST be a plain number without currency symbol (e.g., 100000 not $100000)
5. minimumVolume.period MUST be EXACTLY one of: "Daily", "Weekly", "Monthly" (no variations allowed)

CRITICAL RULES FOR DAYS OF THE WEEK:
1. ALWAYS use English day names regardless of input language:
   - Monday (not Lundi, Montag, etc.)
   - Tuesday (not Mardi, Dienstag, etc.)
   - Wednesday (not Mercredi, Mittwoch, etc.)
   - Thursday (not Jeudi, Donnerstag, etc.)
   - Friday (not Vendredi, Freitag, etc.)
   - Saturday (not Samedi, Samstag, etc.)
   - Sunday (not Dimanche, Sonntag, etc.)
2. Days MUST be in the exact format shown above
3. Days MUST be in an array format
4. Days MUST be capitalized

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
        "base": "Fixed Salary",
        "baseAmount": "5000",
        "bonus": "Performance Bonus",
        "bonusAmount": "10",
        "currency": "EUR",  // Correct: ISO code
        "minimumVolume": {
          "amount": "100000",
          "period": "Monthly",
          "unit": "Calls"
        },
        "transactionCommission": {
          "type": "Percentage",
          "amount": "5"
        }
      }
    ]
  }
}

Examples of INCORRECT format (DO NOT USE):
{
  "commission": {
    "options": [
      {
        "currency": "Euro",     // Wrong: full name
        "currency": "€",        // Wrong: symbol
        "currency": "euro",     // Wrong: lowercase
        "currency": "EURO",     // Wrong: not ISO code
        "currency": "EUR.",     // Wrong: extra character
      }
    ]
  }
}

Available bonus types:
${predefinedOptions.commission.bonusTypes.map(type => `- ${type}`).join('\n')}

Available currencies:
${predefinedOptions.commission.currencies.map(currency => `- ${currency.name} (${currency.code})`).join('\n')}

Available lead sources:
${predefinedOptions.leads.sources.map(source => `- ${source}`).join('\n')}

Return ONLY a valid JSON object with the following structure:
{
  "commission": {
    "options": [
      {
        "base": string (MUST be EXACTLY one of: "Fixed Salary", "Base + Commission", "Pure Commission", "Tiered Commission", "Graduated Commission"),
        "baseAmount": string (MUST be a plain number without currency symbol),
        "bonus": string (optional, MUST be one of the available bonus types),
        "bonusAmount": string (optional, MUST be a plain number without currency symbol),
        "currency": string (MUST be one of the available currency codes),
        "minimumVolume": {
          "amount": string (MUST be a plain number without currency symbol),
          "period": string (MUST be EXACTLY one of: "Daily", "Weekly", "Monthly"),
          "unit": string (MUST match the currency)
        },
        "transactionCommission": {
          "type": string (MUST be EXACTLY one of: "Fixed Amount", "Percentage", "Conversion"),
          "amount": string (MUST be a plain number without currency symbol or percentage sign)
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

Based on this job title and description, suggest appropriate commission structures and activity types. The commission base type MUST be EXACTLY one of: "Fixed Salary", "Base + Commission", "Pure Commission", "Tiered Commission", or "Graduated Commission". No variations or other types are allowed.`
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
    
    // Validate commission options
    const validBaseTypes = ["Fixed Salary", "Base + Commission", "Pure Commission", "Tiered Commission", "Graduated Commission"];
    result.commission.options.forEach((option: any) => {
      if (!validBaseTypes.includes(option.base)) {
        throw new Error(`Invalid commission base type: ${option.base}. Must be one of: ${validBaseTypes.join(', ')}`);
      }
      if (option.bonus && !predefinedOptions.commission.bonusTypes.includes(option.bonus)) {
        // Add new bonus type to predefined options if it's not already there
        if (!predefinedOptions.commission.bonusTypes.includes(option.bonus)) {
          predefinedOptions.commission.bonusTypes.push(option.bonus);
          console.log(`Added new bonus type: ${option.bonus}`);
        }
      }
      if (!predefinedOptions.commission.currencies.some(currency => currency.code === option.currency)) {
        throw new Error('Invalid currency');
      }

      // Validate numerical values are plain numbers without currency symbols or percentage signs
      const validateNumber = (value: string, fieldName: string) => {
        if (value.includes('$') || value.includes('%') || value.includes('€') || value.includes('£')) {
          throw new Error(`${fieldName} must be a plain number without currency symbol or percentage sign`);
        }
        if (isNaN(Number(value))) {
          throw new Error(`${fieldName} must be a valid number`);
        }
      };

      validateNumber(option.baseAmount, 'baseAmount');
      if (option.bonusAmount) validateNumber(option.bonusAmount, 'bonusAmount');
      validateNumber(option.minimumVolume.amount, 'minimumVolume.amount');
      validateNumber(option.transactionCommission.amount, 'transactionCommission.amount');

      // Validate period is exactly one of the allowed values
      const validPeriods = ["Daily", "Weekly", "Monthly"];
      if (!validPeriods.includes(option.minimumVolume.period)) {
        throw new Error(`minimumVolume.period must be exactly one of: ${validPeriods.join(', ')}`);
      }
    });

    // Update predefinedOptions with any new base types
    result.commission.options.forEach((option: any) => {
      if (!predefinedOptions.commission.baseTypes.includes(option.base)) {
        predefinedOptions.commission.baseTypes.push(option.base);
        console.log(`Added new base type: ${option.base}`);
      }
    });

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
  const expandDayRange = (dayRange: string): string[] => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Check if the input contains any range indicators or multiple days
    if (dayRange.toLowerCase().includes('to') || 
        dayRange.includes('-') || 
        dayRange.includes(',') || 
        dayRange.includes('through') ||
        dayRange.includes('&') ||
        dayRange.includes('and')) {
      throw new Error('Only single days are allowed. Please specify a single day (e.g., "Monday", "Tuesday", etc.).');
    }
    
    // Validate that it's a valid day
    const normalizedDay = dayRange.trim();
    if (!days.includes(normalizedDay)) {
      throw new Error(`Invalid day: ${dayRange}. Must be one of: ${days.join(', ')}`);
    }
    
    // Return single day
    return [normalizedDay];
  };

  // Generate schedule based on input or default to weekdays
  let scheduleDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  if (generatedData.schedule?.schedules?.[0]?.day) {
    scheduleDays = expandDayRange(generatedData.schedule.schedules[0].day);
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
  // Force base type to always be "Base + Commission"
  const base = "Base + Commission";

  const validTransactionTypes = predefinedOptions.commission.transactionCommissionTypes;
  // Force commission type to always be "Fixed Amount"
  const finalTransactionType = "Fixed Amount";
  const transactionAmountRaw = generatedData.commission?.options?.[0]?.transactionCommission?.amount;
  const cleanedTransactionAmount = transactionAmountRaw
    ? transactionAmountRaw.replace(/[^0-9.]/g, '')
    : '1';

  const finalTransactionAmount = cleanedTransactionAmount || '1';

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
    const currentScheduleDays = schedule.day ? expandDayRange(schedule.day) : scheduleDays;

    return currentScheduleDays.map((day: string, dayIndex: number) => ({
      day,
      hours: {
        start: scheduleStartTime,
        end: scheduleEndTime
      },
      _id: {
        $oid: `684fdd69e512be3d11a9edc${index * 100 + dayIndex + 6}`
      }
    }));
  }).flat() || defaultSchedule;

  return {
    title: generatedData.jobTitles?.[0] || '',
    description: generatedData.deliverables?.join('\n') || '',
    category: generatedData.sectors?.[0] || '',
    highlights: generatedData.highlights || [],
    destinationZones: (generatedData.destinationZones || []).map(zone => {
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
      flexibility: generatedData.schedule?.flexibility || [],
      minimumHours: {
        daily: generatedData.schedule?.minimumHours?.daily || undefined,
        weekly: generatedData.schedule?.minimumHours?.weekly || undefined,
        monthly: generatedData.schedule?.minimumHours?.monthly || undefined
      },
    },
    commission: {
      base,
      baseAmount: (
        generatedData.commission?.options?.[0]?.baseAmount
          ? generatedData.commission.options[0].baseAmount.replace(/[^0-9.]/g, '')
          : '3'
      ),
      bonus: "Performance Bonus",
      bonusAmount: (
        generatedData.commission?.options?.[0]?.bonusAmount
          ? generatedData.commission.options[0].bonusAmount.replace(/[^0-9.]/g, '')
          : '2'
      ),
      structure: generatedData.commission?.options?.[0]?.structure || '',
      currency: generatedData.commission?.options?.[0]?.currency || 'USD',
      minimumVolume: {
        amount: (
          generatedData.commission?.options?.[0]?.minimumVolume?.amount
            ? generatedData.commission.options[0].minimumVolume.amount.replace(/[^0-9.]/g, '')
            : '3'
        ),
        period: generatedData.commission?.options?.[0]?.minimumVolume?.period
          ? generatedData.commission.options[0].minimumVolume.period.charAt(0).toUpperCase() + generatedData.commission.options[0].minimumVolume.period.slice(1)
          : 'Monthly',
        unit: generatedData.commission?.options?.[0]?.minimumVolume?.unit
          ? (generatedData.commission.options[0].minimumVolume.unit.toLowerCase() === 'sales' ? 'Sales' : 'Calls')
          : 'Calls'
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
      structure: generatedData.team?.structure || [],
      territories: generatedData.team?.territories || [],
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
          For languages, use CEFR levels (A1, A2, B1, B2, C1, C2).
          A1: Basic user
          A2: Elementary user
          B1: Intermediate user
          B2: Upper intermediate user
          C1: Advanced user
          C2: Mastery user`
        },
        {
          role: "user",
          content: `Generate skills for this position: ${description}`
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
    const validLanguages = predefinedOptions.skills.languages.map(lang => lang.name);
    const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    
    result.languages.forEach((lang: any) => {
      // Ensure we're dealing with human languages, not programming languages
      if (!validLanguages.includes(lang.name)) {
        throw new Error(`Invalid human language: ${lang.name}`);
      }
      if (!validLevels.includes(lang.level)) {
        throw new Error(`Invalid language level: ${lang.level}`);
      }
    });

    return result;
  } catch (error) {
    console.error('Error generating skills:', error);
    throw error;
  }
}
