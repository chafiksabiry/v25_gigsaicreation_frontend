import type { GigSuggestion } from "../types";

export const MOCK_GIG_SUGGESTIONS: GigSuggestion = {
  jobTitles: [
    "Commercial pour Mutuelles Santé",
    "Vendeur de Mutuelles Santé",
    "Consultant en Mutuelles Santé"
  ],
  description: "Rejoignez notre équipe commerciale pour vendre des mutuelles santé de nos partenaires de confiance. Votre mission sera de contacter des prospects et de leur proposer la meilleure couverture santé selon leur profil. Vous serez rémunéré à la performance avec des primes pour les objectifs dépassés.",
  highlights: [
    "Rémunération au succès",
    "Formation et accompagnement",
    "Bonus pour les objectifs dépassés"
  ],
  deliverables: [
    "Vente de mutuelles santé",
    "Qualification de rendez-vous",
    "Dépassement des objectifs de vente"
  ],
  sectors: ["Outbound Sales"],
  industries: ["67890abcdef123456789012"], // Insurance ID example
  activities: ["12345abcdef678901234567"], // Sales activity ID example
  destinationZones: ["507f1f77bcf86cd799439011"], // France ID example
  requirements: {
    essential: [
      "Expérience en vente",
      "Excellente communication",
      "Motivation commerciale"
    ],
    preferred: [
      "Connaissance du secteur santé",
      "Expérience en télévente",
      "Maîtrise des outils CRM"
    ]
  },
  skills: {
    languages: [
      {
        language: "fr",
        proficiency: "C2",
        iso639_1: "fr"
      },
      {
        language: "en",
        proficiency: "B2",
        iso639_1: "en"
      }
    ],
    soft: [
      {
        skill: { $oid: "507f1f77bcf86cd799439013" },
        level: 4
      },
      {
        skill: { $oid: "507f1f77bcf86cd799439014" },
        level: 3
      }
    ],
    professional: [
      {
        skill: { $oid: "507f1f77bcf86cd799439015" },
        level: 4,
        details: "Vente B2C et prospection téléphonique"
      },
      {
        skill: { $oid: "507f1f77bcf86cd799439016" },
        level: 3,
        details: "Négociation commerciale et closing"
      }
    ],
    technical: [
      {
        skill: { $oid: "507f1f77bcf86cd799439017" },
        level: 2,
        details: "Utilisation de CRM et outils de prospection"
      }
    ],
    certifications: []
  },
  schedule: {
    schedules: [
      {
        day: "Monday",
        hours: { start: "09:00", end: "17:00" },
        _id: { $oid: "507f1f77bcf86cd799439018" }
      },
      {
        day: "Tuesday",
        hours: { start: "09:00", end: "17:00" },
        _id: { $oid: "507f1f77bcf86cd799439019" }
      },
      {
        day: "Wednesday",
        hours: { start: "09:00", end: "17:00" },
        _id: { $oid: "507f1f77bcf86cd79943901a" }
      },
      {
        day: "Thursday",
        hours: { start: "09:00", end: "17:00" },
        _id: { $oid: "507f1f77bcf86cd79943901b" }
      },
      {
        day: "Friday",
        hours: { start: "09:00", end: "17:00" },
        _id: { $oid: "507f1f77bcf86cd79943901c" }
      }
    ],
    timeZones: ["507f1f77bcf86cd79943901d"],
    time_zone: "507f1f77bcf86cd79943901d",
    minimumHours: {
      daily: 8,
      weekly: 40,
      monthly: 160
    },
    flexibility: [
      "Remote Work Available",
      "Flexible Hours",
      "Part-Time Options"
    ]
  },
  commission: {
    base: "Performance Based",
    baseAmount: 2500,
    bonus: "Performance Bonus",
    bonusAmount: 500,
    structure: "Tiered Commission",
    currency: "507f1f77bcf86cd79943901e", // EUR currency ID example
    minimumVolume: {
      amount: 100,
      period: "Monthly",
      unit: "Sales"
    },
    transactionCommission: {
      type: "Fixed Amount",
      amount: 25.50
    },
    additionalDetails: "Commission payée mensuellement avec bonus trimestriel selon les objectifs atteints. Possibilité d'augmentation après 6 mois de performance."
  },
  team: {
    size: 5,
    structure: [
      {
        roleId: "Team Lead",
        count: 1,
        seniority: {
          level: "Senior-Level",
          yearsExperience: 7
        }
      },
      {
        roleId: "Agent",
        count: 4,
        seniority: {
          level: "Mid-Level",
          yearsExperience: 3
        }
      }
    ],
    territories: ["507f1f77bcf86cd799439011"], // France
    reporting: {
      to: "Sales Manager",
      frequency: "Weekly"
    },
    collaboration: [
      "Daily standups",
      "Weekly team reviews",
      "Monthly training sessions"
    ]
  },
  seniority: {
    level: "Mid-Level",
    yearsExperience: 3
  }
};

// Fonction pour simuler un délai d'API
export const simulateApiDelay = (ms: number = 2000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Fonction pour générer des suggestions mockées
export const generateMockGigSuggestions = async (input: string): Promise<GigSuggestion> => {
  console.log('🎭 Using mock data instead of OpenAI API for input:', input);
  
  // Simuler un délai d'API
  await simulateApiDelay(1500);
  
  // Personnaliser légèrement les données selon l'input
  const mockData = { ...MOCK_GIG_SUGGESTIONS };
  
  // Adapter le titre selon l'input
  if (input.toLowerCase().includes('tech')) {
    mockData.jobTitles = [
      "Développeur Full Stack",
      "Ingénieur Logiciel",
      "Consultant Technique"
    ];
    mockData.description = "Rejoignez notre équipe technique pour développer des solutions innovantes...";
  } else if (input.toLowerCase().includes('marketing')) {
    mockData.jobTitles = [
      "Responsable Marketing Digital",
      "Spécialiste Marketing",
      "Consultant Marketing"
    ];
    mockData.description = "Développez nos stratégies marketing et augmentez notre visibilité...";
  }
  
  return mockData;
};
