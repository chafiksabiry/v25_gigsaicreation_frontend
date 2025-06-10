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

Available categories (for reference):
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
  "category": string (MUST be one of the available categories or a new one if none fit),
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
- The category MUST be one of the provided options or a new one if none fit
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
  return MAJOR_TIMEZONES[timezone]?.businessHours || { start: "09:00", end: "17:00" };
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
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
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

CRITICAL: The commission base type MUST be EXACTLY one of these five options, no variations allowed:
1. "Fixed Salary"
2. "Base + Commission"
3. "Pure Commission"
4. "Tiered Commission"
5. "Graduated Commission"

Examples of valid commission structures:
{
  "commission": {
    "options": [
      {
        "base": "Fixed Salary",
        "baseAmount": "5000",
        "bonus": "Performance Bonus",
        "bonusAmount": "10%",
        "currency": "USD",
        "minimumVolume": {
          "amount": "100000",
          "period": "monthly",
          "unit": "USD"
        },
        "transactionCommission": {
          "type": "percentage",
          "amount": "5%"
        }
      }
    ]
  }
}

OR

{
  "commission": {
    "options": [
      {
        "base": "Base + Commission",
        "baseAmount": "3000",
        "bonus": "Sales Target Bonus",
        "bonusAmount": "15%",
        "currency": "EUR",
        "minimumVolume": {
          "amount": "50000",
          "period": "monthly",
          "unit": "EUR"
        },
        "transactionCommission": {
          "type": "percentage",
          "amount": "3%"
        }
      }
    ]
  }
}

OR

{
  "commission": {
    "options": [
      {
        "base": "Pure Commission",
        "baseAmount": "0",
        "bonus": "High Performance Bonus",
        "bonusAmount": "20%",
        "currency": "GBP",
        "minimumVolume": {
          "amount": "75000",
          "period": "monthly",
          "unit": "GBP"
        },
        "transactionCommission": {
          "type": "percentage",
          "amount": "8%"
        }
      }
    ]
  }
}

OR

{
  "commission": {
    "options": [
      {
        "base": "Tiered Commission",
        "baseAmount": "2500",
        "bonus": "Tier Achievement Bonus",
        "bonusAmount": "25%",
        "currency": "USD",
        "minimumVolume": {
          "amount": "100000",
          "period": "quarterly",
          "unit": "USD"
        },
        "transactionCommission": {
          "type": "tiered",
          "amount": "5-15%"
        }
      }
    ]
  }
}

OR

{
  "commission": {
    "options": [
      {
        "base": "Graduated Commission",
        "baseAmount": "2000",
        "bonus": "Progressive Achievement Bonus",
        "bonusAmount": "30%",
        "currency": "EUR",
        "minimumVolume": {
          "amount": "25000",
          "period": "monthly",
          "unit": "EUR"
        },
        "transactionCommission": {
          "type": "graduated",
          "amount": "2-10%"
        }
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
        "baseAmount": string (amount or percentage),
        "bonus": string (optional, MUST be one of the available bonus types),
        "bonusAmount": string (optional, amount or percentage),
        "currency": string (MUST be one of the available currency codes),
        "minimumVolume": {
          "amount": string,
          "period": string (e.g., "monthly", "quarterly"),
          "unit": string (MUST match the currency)
        },
        "transactionCommission": {
          "type": string (e.g., "percentage", "fixed"),
          "amount": string
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

Available team roles:
${predefinedOptions.team.roles.map(role => `- ${role.name} (${role.description})`).join('\n')}

Available territories:
${predefinedOptions.team.territories.map(territory => `- ${territory}`).join('\n')}

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
      const validRole = predefinedOptions.team.roles.find(r => r.id === role.id);
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
      if (!predefinedOptions.team.territories.includes(territory)) {
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
    "yearsExperience": "2-4"  // Wrong: range instead of single number
  }
}
{
  "seniority": {
    "level": "Mid-Level",
    "yearsExperience": "4 years"  // Wrong: includes text
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
      temperature: 0.3, // Reduced temperature for more consistent output
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
      // Remove any non-numeric characters except for the hyphen
      const cleanStr = result.seniority.yearsExperience.replace(/[^0-9-]/g, '');
      
      if (cleanStr.includes('-')) {
        // If it's a range, take the average and round up
        const [min, max] = cleanStr.split('-').map(Number);
        if (!isNaN(min) && !isNaN(max)) {
          yearsExperience = Math.ceil((min + max) / 2);
        } else {
          throw new Error('Invalid years of experience range');
        }
      } else {
        // If it's a single number as string
        yearsExperience = parseInt(cleanStr);
      }
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

export function mapGeneratedDataToGigData(generatedData: GigSuggestion): Partial<GigData> {
  return {
    title: generatedData.jobTitles?.[0] || '',
    description: generatedData.deliverables?.join('\n') || '',
    category: generatedData.sectors?.[0] || '',
    highlights: generatedData.highlights || [],
    destinationZones: generatedData.destinationZones || [],
    seniority: {
      level: generatedData.seniority?.level || '',
      yearsExperience: generatedData.seniority?.yearsExperience || 0,
      years: String(generatedData.seniority?.yearsExperience || 0)
    },
    schedule: {
      days: generatedData.schedule?.days || [],
      hours: generatedData.schedule?.hours || '',
      timeZones: generatedData.schedule?.timeZones || [],
      flexibility: generatedData.schedule?.flexibility || [],
      minimumHours: {
        daily: generatedData.schedule?.minimumHours?.daily || undefined,
        weekly: generatedData.schedule?.minimumHours?.weekly || undefined,
        monthly: generatedData.schedule?.minimumHours?.monthly || undefined
      }
    },
    commission: {
      base: generatedData.commission?.base || '',
      baseAmount: generatedData.commission?.baseAmount || '',
      bonus: generatedData.commission?.bonus || '',
      bonusAmount: generatedData.commission?.bonusAmount || '',
      structure: generatedData.commission?.structure || '',
      currency: generatedData.commission?.currency || '',
      minimumVolume: {
        amount: generatedData.commission?.minimumVolume?.amount || '',
        period: generatedData.commission?.minimumVolume?.period || '',
        unit: generatedData.commission?.minimumVolume?.unit || ''
      },
      transactionCommission: {
        type: generatedData.commission?.transactionCommission?.type || '',
        amount: generatedData.commission?.transactionCommission?.amount || ''
      },
      kpis: generatedData.commission?.kpis || []
    },
    skills: {
      languages: generatedData.skills?.languages || [],
      soft: generatedData.skills?.soft || [],
      professional: generatedData.skills?.professional || [],
      technical: generatedData.skills?.technical || [],
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
    }
  };
}