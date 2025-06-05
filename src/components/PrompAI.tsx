import React, { useState } from "react";

export function PrompAI() {
  const [suggestions, setSuggestions] = useState({
    jobTitles: [],
    deliverables: [],
    sectors: [],
    seniority: {
      level: '',
      yearsExperience: ''
    },
    schedule: {
      days: [],
      hours: '',
      timeZones: [],
      flexibility: []
    },
    commission: {
      options: [{
        base: '',
        baseAmount: '',
        bonus: '',
        bonusAmount: '',
        structure: '',
        currency: '',
        minimumVolume: {
          amount: '',
          period: '',
          unit: ''
        },
        transactionCommission: {
          type: '',
          amount: ''
        },
        kpis: []
      }]
    },
    skills: {
      languages: [],
      professional: []
    },
    team: {
      size: 0,
      structure: [],
      territories: [],
      reporting: {
        to: '',
        frequency: ''
      },
      collaboration: []
    },
    documentation: {
      product: '',
      process: '',
      training: [],
      reference: [],
      templates: []
    }
  });

  const [gigData, setGigData] = useState({
    title: '',
    description: '',
    category: '',
    seniority: {
      level: '',
      years: 0
    },
    schedule: {
      days: [],
      hours: '',
      timeZones: [],
      flexibility: [],
      minimumHours: {
        daily: 0,
        weekly: 0,
        monthly: 0
      }
    },
    commission: {
      base: '',
      baseAmount: '',
      bonus: '',
      bonusAmount: '',
      structure: '',
      currency: '',
      minimumVolume: {
        amount: '',
        period: '',
        unit: ''
      },
      transactionCommission: {
        type: '',
        amount: ''
      },
      kpis: []
    },
    skills: {
      languages: [],
      professional: []
    },
    team: {
      size: 0,
      structure: [],
      territories: [],
      reporting: {
        to: '',
        frequency: ''
      },
      collaboration: []
    },
    documentation: {
      product: '',
      process: '',
      training: [],
      reference: [],
      templates: []
    }
  });

  // Mettre à jour les données du gig avec les suggestions
  setGigData((prevData) => ({
    ...prevData,
    // Section Basic
    title: suggestions.jobTitles?.[0] || prevData.title,
    description: suggestions.deliverables?.join("\n") || prevData.description,
    category: suggestions.sectors?.[0] || prevData.category,
    seniority: {
      level: suggestions.seniority?.level || prevData.seniority.level,
      years: parseInt(suggestions.seniority?.yearsExperience || "0"),
    },
    // Section Schedule
    schedule: {
      days: suggestions.schedule?.days || prevData.schedule?.days || [],
      hours: suggestions.schedule?.hours || prevData.schedule?.hours || '',
      timeZones: suggestions.schedule?.timeZones || prevData.schedule?.timeZones || [],
      flexibility: suggestions.schedule?.flexibility || prevData.schedule?.flexibility || [],
      minimumHours: {
        daily: 0,
        weekly: 0,
        monthly: 0
      }
    },
    // Section Commission
    commission: {
      base:
        suggestions.commission?.options?.[0]?.base ||
        prevData.commission.base,
      baseAmount:
        suggestions.commission?.options?.[0]?.baseAmount ||
        prevData.commission.baseAmount,
      bonus:
        suggestions.commission?.options?.[0]?.bonus ||
        prevData.commission.bonus,
      bonusAmount:
        suggestions.commission?.options?.[0]?.bonusAmount ||
        prevData.commission.bonusAmount,
      structure:
        suggestions.commission?.options?.[0]?.structure ||
        prevData.commission.structure,
      currency:
        suggestions.commission?.options?.[0]?.currency ||
        prevData.commission.currency,
      minimumVolume: {
        amount:
          suggestions.commission?.options?.[0]?.minimumVolume?.amount ||
          prevData.commission.minimumVolume.amount,
        period:
          suggestions.commission?.options?.[0]?.minimumVolume?.period ||
          prevData.commission.minimumVolume.period,
        unit:
          suggestions.commission?.options?.[0]?.minimumVolume?.unit ||
          prevData.commission.minimumVolume.unit,
      },
      transactionCommission: {
        type:
          suggestions.commission?.options?.[0]?.transactionCommission?.type ||
          prevData.commission.transactionCommission.type,
        amount:
          suggestions.commission?.options?.[0]?.transactionCommission
            ?.amount || prevData.commission.transactionCommission.amount,
      },
      kpis: suggestions.commission?.options?.[0]?.kpis || prevData.commission.kpis || []
    },
    // Section Skills
    skills: {
      languages: suggestions.skills?.languages || prevData.skills.languages,
      professional:
        suggestions.skills?.professional || prevData.skills.professional,
    },
    // Section Team
    team: {
      size: parseInt(suggestions.team?.size?.toString() || "0"),
      structure: suggestions.team?.structure || prevData.team.structure,
      territories: suggestions.team?.territories || prevData.team.territories,
      reporting: {
        to: suggestions.team?.reporting?.to || prevData.team.reporting.to,
        frequency:
          suggestions.team?.reporting?.frequency ||
          prevData.team.reporting.frequency,
      },
      collaboration: suggestions.team?.collaboration || prevData.team.collaboration,
    },
    // Section Documentation
    documentation: {
      product:
        suggestions.documentation?.product || prevData.documentation.product,
      process:
        suggestions.documentation?.process || prevData.documentation.process,
      training:
        suggestions.documentation?.training ||
        prevData.documentation.training,
      reference:
        suggestions.documentation?.reference || prevData.documentation.reference,
      templates:
        suggestions.documentation?.templates || prevData.documentation.templates,
    },
  }));
};

const handleSectionChange = (sectionId: string) => {
  setCurrentSection(sectionId);
};
