export const predefinedOptions = {
  basic: {
    categories: [
      "Customer Service",
      "Technical Support",
      "Sales",
      "Collections",
      "Back Office",
      "Quality Assurance",
      "Training",
      "Management",
      "Other"
    ],
    seniorityLevels: [
      "Entry Level",
      "Junior",
      "Mid Level",
      "Senior",
      "Lead",
      "Manager",
      "Director"
    ],
    scheduleDays: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday"
    ],
    timeZones: [
      "New York (EST/EDT)",
      "Chicago (CST/CDT)",
      "Denver (MST/MDT)",
      "Los Angeles (PST/PDT)",
      "London (GMT/BST)",
      "Paris (CET/CEST)",
      "Dubai (GST)",
      "Singapore (SGT)",
      "Tokyo (JST)",
      "Sydney (AEST/AEDT)"
    ],
    scheduleFlexibility: [
      "Remote Work Available",
      "Flexible Hours",
      "Weekend Rotation",
      "Night Shift Available",
      "Split Shifts",
      "Part-Time Options",
      "Compressed Work Week",
      "Shift Swapping Allowed"
    ],
    workingHours: [
      "9:00 AM - 5:00 PM",
      "8:00 AM - 4:00 PM",
      "10:00 AM - 6:00 PM",
      "12:00 PM - 8:00 PM",
      "2:00 PM - 10:00 PM",
      "10:00 PM - 6:00 AM",
      "Flexible"
    ]
  },
  schedule: {
    scheduleTypes: [
      'Full-Time',
      'Part-Time',
      'Flexible',
      'Shift Work',
      'Rotating Shifts',
      'On-Call',
      'Seasonal',
      'Temporary'
    ]
  },
  commission: {
    currencies: [
      { code: 'USD', symbol: '$', name: 'US Dollar' },
      { code: 'EUR', symbol: '€', name: 'Euro' },
      { code: 'GBP', symbol: '£', name: 'British Pound' },
      { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
      { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
      { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
      { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
      { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
      { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
      { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' }
    ],
    baseTypes: [
      'Fixed Salary',
      'Base + Commission',
      'Pure Commission',
      'Tiered Commission',
      'Graduated Commission'
    ],
    bonusTypes: [
      'Performance Bonus',
      'Quarterly Bonus',
      'Annual Bonus',
      'Team Bonus',
      'Signing Bonus',
      'Retention Bonus',
      'Holiday Bonus'
    ]
  },
  leads: {
    sources: [
      'Website Inquiries',
      'Social Media',
      'Email Campaigns',
      'Trade Shows',
      'Referrals',
      'Cold Calling',
      'Partner Network',
      'Online Advertising',
      'Content Marketing',
      'Direct Mail',
      'Industry Events',
      'Customer Recommendations',
      'LinkedIn Outreach',
      'Webinars',
      'Free Trials'
    ],
    leadTypes: [
      'Hot Leads',
      'Warm Leads',
      'Cold Leads',
      'Qualified Leads',
      'Unqualified Leads',
      'Marketing Qualified Leads',
      'Sales Qualified Leads',
      'Product Qualified Leads'
    ]
  },
  team: {
    roles: [
      { id: 'agent', name: 'Sales Agent', description: 'Handles direct sales and customer interactions' },
      { id: 'lead', name: 'Team Lead', description: 'Supervises and coaches a team of agents' },
      { id: 'supervisor', name: 'Supervisor', description: 'Oversees multiple teams and operations' },
      { id: 'manager', name: 'Manager', description: 'Manages department strategy and performance' },
      { id: 'trainer', name: 'Training Specialist', description: 'Conducts training and development programs' },
      { id: 'qa', name: 'Quality Analyst', description: 'Monitors and evaluates call quality' },
      { id: 'support', name: 'Support Specialist', description: 'Provides technical and process support' },
      { id: 'coordinator', name: 'Team Coordinator', description: 'Handles scheduling and administrative tasks' },
      { id: 'coach', name: 'Performance Coach', description: 'Provides one-on-one coaching and development' },
      { id: 'specialist', name: 'Product Specialist', description: 'Subject matter expert for complex inquiries' }
    ],
    territories: [
      'United States',
      'Canada',
      'United Kingdom',
      'Germany',
      'France',
      'Spain',
      'Italy',
      'Netherlands',
      'Sweden',
      'Norway',
      'Denmark',
      'Finland',
      'Ireland',
      'Belgium',
      'Switzerland',
      'Austria',
      'Portugal',
      'Greece',
      'Poland',
      'Czech Republic',
      'Hungary',
      'Romania',
      'Bulgaria',
      'Australia',
      'New Zealand',
      'Japan',
      'South Korea',
      'Singapore',
      'Malaysia',
      'Thailand',
      'Indonesia',
      'Philippines',
      'Vietnam',
      'India',
      'China',
      'Hong Kong',
      'Taiwan',
      'Brazil',
      'Mexico',
      'Argentina',
      'Chile',
      'Colombia',
      'Peru',
      'South Africa',
      'United Arab Emirates',
      'Saudi Arabia',
      'Israel',
      'Turkey',
      'Egypt',
      'Morocco',
      'Nigeria'
    ]
  },
  skills: {
    languages: [
      { name: 'English' },
      { name: 'Spanish' },
      { name: 'French' },
      { name: 'German' },
      { name: 'Chinese' },
      { name: 'Japanese' },
      { name: 'Arabic' },
      { name: 'Portuguese' },
      { name: 'Russian' }
    ],
    technical: [
      'CRM Systems',
      'Help Desk Software',
      'Live Chat Tools',
      'Ticketing Systems',
      'Remote Support Tools',
      'Knowledge Base Management',
      'Call Center Software',
      'Quality Monitoring Tools',
      'Workforce Management Systems'
    ],
    soft: [
      'Customer Service',
      'Problem Solving',
      'Active Listening',
      'Empathy',
      'Conflict Resolution',
      'Time Management',
      'Communication',
      'Teamwork',
      'Adaptability',
      'Stress Management'
    ],
    skillLevels: [
      'Basic',
      'Conversational',
      'Professional',
      'Native/Bilingual'
    ]
  },
  documentation: {
    documentTypes: [
      'Product Manuals',
      'Process Guides',
      'Training Materials',
      'Compliance Documents',
      'Quality Standards',
      'Performance Metrics',
      'Script Templates',
      'Call Guidelines'
    ]
  },
  metrics: {
    kpis: [
      'Conversion Rate',
      'Average Handle Time',
      'First Call Resolution',
      'Customer Satisfaction',
      'Sales Revenue',
      'Lead Quality',
      'Response Time',
      'Call Quality Score'
    ]
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