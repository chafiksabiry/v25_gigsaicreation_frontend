export const aiPrompts = {
  basic: {
    title: "Basic Information Assistant",
    description: "Get AI suggestions for your gig's basic information"
  },
  schedule: {
    title: "Schedule Assistant",
    description: "Get AI suggestions for scheduling and time management"
  },
  commission: {
    title: "Commission Assistant",
    description: "Get AI suggestions for commission structure"
  },
  leads: {
    title: "Leads Assistant",
    description: "Get AI suggestions for lead management"
  },
  skills: {
    title: "Skills Assistant",
    description: "Get AI suggestions for required skills"
  },
  team: {
    title: "Team Assistant",
    description: "Get AI suggestions for team structure"
  },
  docs: {
    title: "Documentation Assistant",
    description: "Get AI suggestions for documentation"
  }
};

export const predefinedOptions = {
  basic: {
    categories: [
      'Sales',
      'Customer Support',
      'Marketing',
      'Engineering',
      'Finance',
      'Human Resources',
      'Operations',
      'IT',
      'Legal',
      'Administration'
    ],
    seniorityLevels: [
      'Entry Level',
      'Junior',
      'Mid-Level',
      'Senior',
      'Team Lead',
      'Supervisor',
      'Manager',
      'Director'
    ],
    timeZones: [
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'Europe/London',
      'Europe/Paris',
      'Europe/Dubai',
      'Asia/Singapore',
      'Asia/Tokyo',
      'Australia/Sydney'
    ],
    destinationZones: [
      'France',
      'United States',
      'United Kingdom',
      'Germany',
      'Spain',
      'Italy',
      'Canada',
      'Australia',
      'Morocco',
      'Turkey'
    ]
  },
  availability: {
    schedule: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
    ],
    timeZones: [
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'Europe/London',
      'Europe/Paris',
      'Weekend Rotation',
      'Night Shift Available',
      'Split Shifts',
      'Part-Time Options',
      'Compressed Work Week',
      'Shift Swapping Allowed'
    ]
  },
  commission: {
    baseTypes: [
      'Fixed Salary',
      'Base + Commission',
      'Pure Commission',
      'Tiered Commission',
      'Graduated Commission'
    ],
    bonusTypes: [
      'Performance Bonus',
      'Sales Bonus',
      'Project Completion',
      'Team Achievement',
      'Quarterly Bonus',
      'Annual Bonus'
    ],
    currencies: [
      { code: 'USD', name: 'US Dollar', symbol: '$' },
      { code: 'EUR', name: 'Euro', symbol: '€' },
      { code: 'GBP', name: 'British Pound', symbol: '£' },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
      { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
      { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
      { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
      { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
      { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
      { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' }
    ],
    minimumVolumeUnits: [
      'Calls',
      'Conversions',
      'Sales'
    ],
    minimumVolumePeriods: [
      'Daily',
      'Weekly',
      'Monthly'
    ],
    transactionCommissionTypes: [
      'Fixed Amount',
      'Percentage',
      'Conversion'
    ]
  },
  skills: {
    languages: [
      {
        language: "French",
        proficiency: "Natif",
        iso639_1: "fr",
      }
    ],
    professional: [{
      skill: "Brand Identity Design",
      level: 1
    }],
    technical: [{
      skill: "Adobe Illustrator",
      level: 1
    }],
    soft: [{
      skill: "Communication",
      level: 1
    }],
    skillLevels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  },
  team: {
    roles: [],
    territories: []
  },
  leads: {
    sources: []
  }
};

export const sectionGuidance = {
  basic: {
    title: 'Basic Information',
    steps: [
      'Enter a clear and descriptive title for the role',
      'Select the appropriate category',
      'Choose the seniority level',
      'Specify required years of experience'
    ],
    tips: [
      'Use industry-standard job titles for better visibility',
      'Be specific about the role category to attract the right candidates',
      'Match seniority level with experience requirements',
      'Consider both minimum and preferred experience levels'
    ]
  },
  availability: {
    title: 'Availability',
    steps: [
      'Select working days',
      'Define working hours',
      'Specify time zones',
      'Set minimum hour requirements',
      'Choose flexibility options'
    ],
    tips: [
      'Consider multiple time zones for global coverage',
      'Be clear about shift patterns and rotations',
      'Include any flexibility in scheduling',
      'Specify both core hours and flexible time slots'
    ]
  },
  schedule: {
    title: 'Schedule & Availability',
    steps: [
      'Select working days',
      'Define working hours',
      'Specify time zones',
      'Set minimum hour requirements',
      'Choose flexibility options'
    ],
    tips: [
      'Consider multiple time zones for global coverage',
      'Be clear about shift patterns and rotations',
      'Include any flexibility in scheduling',
      'Specify both core hours and flexible time slots'
    ]
  },
  commission: {
    title: 'Commission Structure',
    steps: [
      'Select the currency',
      'Choose the commission type',
      'Set base amounts',
      'Define bonus structure',
      'Add detailed commission terms'
    ],
    tips: [
      'Be transparent about commission calculations',
      'Include all potential bonus opportunities',
      'Clearly explain performance targets',
      'Specify payment frequency and terms'
    ]
  },
  leads: {
    title: 'Lead Distribution',
    steps: [
      'Define lead types and percentages',
      'Describe each lead category',
      'List lead sources',
      'Set distribution rules'
    ],
    tips: [
      'Balance the mix of hot, warm, and cold leads',
      'Be specific about lead quality criteria',
      'Explain the lead assignment process',
      'Include information about lead follow-up expectations'
    ]
  },
  skills: {
    title: 'Required Skills',
    steps: [
      'Select required languages',
      'Choose technical skills',
      'Add soft skills',
      'Specify required tools'
    ],
    tips: [
      'Prioritize must-have vs. nice-to-have skills',
      'Be specific about language proficiency levels',
      'Include both technical and soft skills',
      'List relevant tools and software'
    ]
  },
  team: {
    title: 'Team Structure',
    steps: [
      'Define team size',
      'List team roles',
      'Select target countries',
      'Set reporting relationships'
    ],
    tips: [
      'Be clear about team hierarchy',
      'Include cross-functional relationships',
      'Specify country coverage requirements',
      'Define collaboration requirements'
    ]
  },
  docs: {
    title: 'Documentation',
    steps: [
      'List product documentation',
      'Add process guides',
      'Include training materials',
      'Specify access requirements'
    ],
    tips: [
      'Ensure all necessary resources are listed',
      'Include both internal and external documentation',
      'Specify any required certifications',
      'Note documentation update frequency'
    ]
  }
};