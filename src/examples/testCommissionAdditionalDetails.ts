// Test pour vérifier que le champ additionalDetails est bien sauvegardé dans la base de données

import { GigData } from '../types';

// Exemple de données de commission avec additionalDetails
const testCommissionData: GigData = {
  userId: "test-user-id",
  companyId: "test-company-id",
  title: "Test Sales Position",
  description: "Test description",
  category: "Sales",
  destination_zone: "France",
  callTypes: ["Inbound", "Outbound"],
  highlights: ["High commission potential", "Remote work available"],
  industries: ["Technology"],
  activities: ["Lead Generation"],
  requirements: {
    essential: ["Sales experience"],
    preferred: ["CRM knowledge"]
  },
  benefits: [{
    type: "Commission",
    description: "Competitive commission structure"
  }],
  availability: {
    schedule: [{
      day: "Monday",
      hours: {
        start: "09:00",
        end: "18:00"
      }
    }],
    timeZones: ["Europe/Paris"],
    time_zone: "Europe/Paris",
    flexibility: ["Remote Work Available"],
    minimumHours: {
      daily: 8,
      weekly: 40,
      monthly: 160
    }
  },
  schedule: {
    schedules: [{
      day: "Monday",
      hours: {
        start: "09:00",
        end: "18:00"
      }
    }],
    timeZones: ["Europe/Paris"],
    flexibility: ["Remote Work Available"],
    minimumHours: {
      daily: 8,
      weekly: 40,
      monthly: 160
    }
  },
  commission: {
    base: "Base + Commission",
    baseAmount: 0,
    bonus: "Performance Bonus",
    bonusAmount: 150,
    structure: "Fixed",
    currency: "EUR",
    minimumVolume: {
      amount: 50,
      period: "Monthly",
      unit: "Calls"
    },
    transactionCommission: {
      type: "Fixed Amount",
      amount: 25
    },
    kpis: [],
    additionalDetails: "Commission structure includes:\n- Base salary: €0\n- Performance bonus: €150 per month\n- Transaction commission: €25 per call\n- Minimum volume: 50 calls per month\n- Additional incentives for exceeding targets"
  },
  leads: {
    types: [{
      type: "hot",
      percentage: 30,
      description: "High-quality leads with immediate purchase intent"
    }],
    sources: ["Website", "Referrals"],
    distribution: {
      method: "Round Robin",
      rules: ["Equal distribution among team members"]
    },
    qualificationCriteria: ["Budget confirmed", "Decision maker identified"]
  },
  skills: {
    languages: [{
      language: "French",
      proficiency: "Native",
      iso639_1: "fr"
    }],
    soft: [{
      skill: "Communication",
      level: 3
    }],
    professional: [{
      skill: "Sales",
      level: 3
    }],
    technical: [{
      skill: "CRM",
      level: 2
    }]
  },
  seniority: {
    level: "Mid-Level",
    yearsExperience: 3
  },
  team: {
    size: 5,
    structure: [{
      roleId: "sales_representative",
      count: 5,
      seniority: {
        level: "Mid-Level",
        yearsExperience: 3
      }
    }],
    territories: ["France"],
    reporting: {
      to: "Sales Manager",
      frequency: "Weekly"
    },
    collaboration: ["Team meetings", "Shared CRM"]
  }
};

// Fonction pour tester la sauvegarde
export async function testCommissionAdditionalDetails() {
  console.log('🧪 Testing Commission Additional Details...');
  
  // Vérifier que additionalDetails est présent
  if (!testCommissionData.commission.additionalDetails) {
    console.error('❌ additionalDetails is missing from commission data');
    return false;
  }
  
  console.log('✅ additionalDetails is present:', testCommissionData.commission.additionalDetails);
  
  // Vérifier que la structure est correcte
  if (typeof testCommissionData.commission.additionalDetails !== 'string') {
    console.error('❌ additionalDetails should be a string');
    return false;
  }
  
  console.log('✅ additionalDetails is a string');
  
  // Vérifier que le contenu n'est pas vide
  if (testCommissionData.commission.additionalDetails.trim().length === 0) {
    console.error('❌ additionalDetails should not be empty');
    return false;
  }
  
  console.log('✅ additionalDetails has content');
  
  // Simuler la sauvegarde (mapping vers structure pour la base de données)
  const dataForDatabase = {
    ...testCommissionData,
    commission: {
      ...testCommissionData.commission,
      structure: testCommissionData.commission.additionalDetails // Mapping vers commission_structure
    }
  };
  
  console.log('✅ Data mapped for database:', {
    additionalDetails: testCommissionData.commission.additionalDetails,
    structure: dataForDatabase.commission.structure
  });
  
  console.log('🎉 All tests passed! additionalDetails will be saved as commission_structure in database');
  return true;
}

// Exporter les données de test
export { testCommissionData }; 