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
      'Inbound Sales',
      'Outbound Sales',
      'Customer Service',
      'Technical Support',
      'Account Management',
      'Lead Generation',
      'Market Research',
      'Appointment Setting',
      'Order Processing',
      'Customer Retention',
      'Billing Support',
      'Product Support',
      'Help Desk',
      'Chat Support',
      'Email Support',
      'Social Media Support',
      'Survey Calls',
      'Welcome Calls',
      'Follow-up Calls',
      'Complaint Resolution',
      'Warranty Support',
      'Collections',
      'Dispatch Services',
      'Emergency Support',
      'Multilingual Support'
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
      'New York (EST/EDT)',
      'Chicago (CST/CDT)',
      'Denver (MST/MDT)',
      'Los Angeles (PST/PDT)',
      'London (GMT/BST)',
      'Paris (CET/CEST)',
      'Dubai (GST)',
      'Singapore (SGT)',
      'Tokyo (JST)',
      'Sydney (AEST/AEDT)'
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
  sectors: [
    'Inbound Sales',
    'Outbound Sales',
    'Customer Service',
    'Technical Support',
    'Account Management',
    'Lead Generation',
    'Market Research',
    'Appointment Setting',
    'Order Processing',
    'Customer Retention',
    'Billing Support',
    'Product Support',
    'Help Desk',
    'Chat Support',
    'Email Support',
    'Social Media Support',
    'Survey Calls',
    'Welcome Calls',
    'Follow-up Calls',
    'Complaint Resolution',
    'Warranty Support',
    'Collections',
    'Dispatch Services',
    'Emergency Support',
    'Multilingual Support'
  ],
  industries: [
    'Retail / e-Commerce',
    'Telecom & Internet Providers',
    'Banking & Fintech',
    'Automotive',
    'Health & Insurance',
    'Hospitality / Tourism / Airlines',
    'Insurance',
    'Education & Training',
    'SaaS B2B',
    'Real Estate',
    'Transport / Logistics',
    'Events / Ticketing',
    'Business Services (Legal, Consulting, Administrative, etc.)',
    'Survey Institutes'
  ],
  activities: [
    'Customer Service',
    'Technical Support',
    'Order Taking',
    'Administrative Support',
    'Complaints / Crisis Management',
    'After-Sales Hotline',
    'Telemarketing / Telesales',
    'Appointment Scheduling',
    'Customer Follow-Ups',
    'Surveys & Polls',
    'Telephone Debt Collection',
    'Customer Loyalty / Upselling',
    'Customer Onboarding'
  ],
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
      'New York (EST/EDT)',
      'Chicago (CST/CDT)',
      'Denver (MST/MDT)',
      'Los Angeles (PST/PDT)',
      'London (GMT/BST)',
      'Paris (CET/CEST)',
      'Dubai (GST)',
      'Singapore (SGT)',
      'Tokyo (JST)',
      'Sydney (AEST/AEDT)'
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
        proficiency: "C2",
        iso639_1: "fr",
      }
    ],
    soft: [
      { skill: "Active Listening", level: 1 },
      { skill: "Clear Articulation", level: 1 },
      { skill: "Proper Tone & Language", level: 1 },
      { skill: "Spelling & Grammar Accuracy", level: 1 },
      { skill: "Empathy", level: 1 },
      { skill: "Patience", level: 1 },
      { skill: "Self-Regulation", level: 1 },
      { skill: "Analytical Thinking", level: 1 },
      { skill: "Creativity", level: 1 },
      { skill: "Decision-Making", level: 1 },
      { skill: "Service Orientation", level: 1 },
      { skill: "Ownership", level: 1 },
      { skill: "Adaptability", level: 1 },
      { skill: "Team Collaboration", level: 1 },
      { skill: "Conflict Resolution", level: 1 },
      { skill: "Cultural Sensitivity", level: 1 },
      { skill: "Multitasking", level: 1 },
      { skill: "Efficiency", level: 1 },
      { skill: "Resilience", level: 1 },
      { skill: "Receptiveness to Feedback", level: 1 },
      { skill: "Willingness to Learn", level: 1 }
    ],
    professional: [
      { skill: "In-depth understanding of products/services", level: 1 },
      { skill: "Knowledge of company policies, terms, SLAs, and escalation paths", level: 1 },
      { skill: "Familiarity with standard operating procedures (SOPs) for different issue types", level: 1 },
      { skill: "Voice Support: call handling techniques, hold/transfer/escalation protocol", level: 1 },
      { skill: "Email Support: structured writing, canned responses, professional formatting", level: 1 },
      { skill: "Live Chat/Messenger: real-time typing, handling multiple chats, shortcut commands", level: 1 },
      { skill: "Social Media Messaging: brand-safe communication, crisis handling, sentiment detection", level: 1 },
      { skill: "Proficiency in tools like Salesforce, HubSpot, Zoho, etc.", level: 1 },
      { skill: "Ability to log, tag, update, and close tickets accurately", level: 1 },
      { skill: "Understanding of ticket priority levels and SLA timelines", level: 1 },
      { skill: "Usage of dialers, softphones, VoIP systems (e.g. Twilio)", level: 1 },
      { skill: "Call dispositioning and tagging", level: 1 },
      { skill: "Knowledge of call recording and QA monitoring systems", level: 1 },
      { skill: "Fast and accurate typing (ideally 40–60 WPM for chat agents)", level: 1 },
      { skill: "Proficient in copy-paste discipline, keyboard shortcuts, and multitab workflows", level: 1 },
      { skill: "Real-time data entry during live interactions", level: 1 },
      { skill: "Familiarity with basic troubleshooting steps (especially for tech/product support roles)", level: 1 },
      { skill: "Comfort with remote support tools, screen sharing, or device guides", level: 1 },
      { skill: "Use of knowledge bases, macros, and FAQs to guide responses", level: 1 },
      { skill: "Adherence to quality assurance (QA) frameworks", level: 1 },
      { skill: "Awareness of data protection regulations (GDPR, CCPA, PCI DSS, etc.)", level: 1 },
      { skill: "Following compliance scripts and avoiding unauthorized statements", level: 1 },
      { skill: "Understanding of: AHT (Average Handle Time), CSAT (Customer Satisfaction), FCR (First Call Resolution), QA Scores, NPS, etc.", level: 1 },
      { skill: "Ability to self-monitor performance and meet targets", level: 1 },
      { skill: "Multilingual abilities depending on geography", level: 1 },
      { skill: "Familiarity with regional expressions and cultural tone", level: 1 },
      { skill: "Correct use of formal/informal register depending on the context", level: 1 },
      { skill: "Ability to flag product issues, bugs, or patterns", level: 1 },
      { skill: "Use of tools like Excel, Google Sheets, or internal dashboards for reporting", level: 1 },
      { skill: "Writing internal case notes and handover summaries clearly and concisely", level: 1 }
    ],
    technical: [
      { skill: "Proficiency in using cloud-based contact center software (e.g. Genesys, Five9, Talkdesk, NICE, Twilio, Aircall)", level: 1 },
      { skill: "Understanding of VoIP systems, automatic call distributors (ACD), and interactive voice response (IVR)", level: 1 },
      { skill: "Handling call transfers, holds, recordings, conferencing, and dispositions", level: 1 },
      { skill: "Daily use of CRM systems: Salesforce, Zoho CRM, HubSpot, etc.", level: 1 },
      { skill: "Familiarity with ticketing platforms: Zendesk, Freshdesk, Jira, Help Scout, etc.", level: 1 },
      { skill: "Tagging, prioritizing, escalating, and resolving tickets efficiently", level: 1 },
      { skill: "Managing multiple concurrent chats using tools like Intercom, LivePerson, Drift, Crisp, Tawk.to", level: 1 },
      { skill: "Use of shortcuts, canned responses, and chat routing rules", level: 1 },
      { skill: "Basic understanding of chatbot integrations and human handoffs", level: 1 },
      { skill: "Efficient use of shared inboxes (e.g., Outlook 365 Shared Mailboxes, Gmail for Business)", level: 1 },
      { skill: "Familiarity with email automation, filters, and categorization", level: 1 },
      { skill: "Adherence to email templates and formatting standards", level: 1 },
      { skill: "Navigating internal knowledge bases (e.g., Confluence, Guru, Notion)", level: 1 },
      { skill: "Using search functions and contributing to documentation updates", level: 1 },
      { skill: "Retrieving correct information quickly to answer queries", level: 1 },
      { skill: "Proficiency in Windows/macOS, including multitasking between tools", level: 1 },
      { skill: "Using MS Office or Google Workspace for basic reporting (Excel/Sheets), documentation (Word/Docs), and presentations (PowerPoint/Slides)", level: 1 },
      { skill: "Working with cloud platforms: Google Drive, Dropbox, OneDrive for internal document sharing", level: 1 },
      { skill: "Using collaboration tools like Slack, Microsoft Teams, or Zoom for internal communication", level: 1 },
      { skill: "Typing at 40–60 words per minute (WPM) with low error rate", level: 1 },
      { skill: "Using keyboard shortcuts and productivity tools (clipboard managers, text expanders)", level: 1 },
      { skill: "Navigating call listening, screen recording, and coaching feedback systems", level: 1 },
      { skill: "Diagnosing common user issues (e.g., login problems, app bugs, basic config)", level: 1 },
      { skill: "Using remote desktop tools (e.g., TeamViewer, AnyDesk, Zoom screen sharing)", level: 1 },
      { skill: "Logging reproducible bugs for product/engineering", level: 1 }
    ],
    skillLevels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  },
  team: {
    roles: [
      {
        id: 'team_lead',
        name: 'Team Lead',
        description: 'Manages team performance and provides guidance'
      },
      {
        id: 'senior_agent',
        name: 'Senior Agent',
        description: 'Experienced agent with advanced skills and mentoring capabilities'
      },
      {
        id: 'agent',
        name: 'Agent',
        description: 'Handles customer interactions and core responsibilities'
      },
      {
        id: 'junior_agent',
        name: 'Junior Agent',
        description: 'Entry-level agent with basic responsibilities and learning focus'
      },
      {
        id: 'supervisor',
        name: 'Supervisor',
        description: 'Oversees operations and ensures quality standards'
      },
      {
        id: 'manager',
        name: 'Manager',
        description: 'Strategic planning and team development'
      },
      {
        id: 'coordinator',
        name: 'Coordinator',
        description: 'Coordinates activities and communication'
      },
      {
        id: 'specialist',
        name: 'Specialist',
        description: 'Expert in specific areas or processes'
      },
      {
        id: 'consultant',
        name: 'Consultant',
        description: 'Provides expert advice and strategic guidance'
      },
      {
        id: 'representative',
        name: 'Representative',
        description: 'Represents the company in customer interactions'
      },
      {
        id: 'associate',
        name: 'Associate',
        description: 'Supports team operations and projects'
      },
      {
        id: 'assistant',
        name: 'Assistant',
        description: 'Provides support and administrative tasks'
      },
      {
        id: 'trainee',
        name: 'Trainee',
        description: 'Learning role with structured training program'
      },
      {
        id: 'intern',
        name: 'Intern',
        description: 'Student or recent graduate gaining practical experience'
      }
    ],
    territories: [
      'North America',
      'Europe',
      'Asia Pacific',
      'Latin America',
      'Middle East',
      'Africa',
      'United States',
      'Canada',
      'United Kingdom',
      'France',
      'Germany',
      'Spain',
      'Italy',
      'Australia',
      'Japan',
      'China',
      'India',
      'Brazil',
      'Mexico',
      'South Africa'
    ]
  },
  leads: {
    sources: []
  },
  schedule: {
    flexibility: [
      "Remote Work Available",
      "Flexible Hours",
      "Weekend Rotation",
      "Night Shift Available",
      "Split Shifts",
      "Part-Time Options",
      "Compressed Work Week",
      "Shift Swapping Allowed"
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