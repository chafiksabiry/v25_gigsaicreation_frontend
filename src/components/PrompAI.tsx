
    // Mettre à jour les données du gig avec les suggestions
    setGigData((prevData) => ({
      ...prevData,
      // Section Basic
      title: suggestions.jobTitles?.[0] || prevData.title,
      description: suggestions.deliverables?.join("\n") || prevData.description,
      category: suggestions.sectors?.[0] || prevData.category,
      seniority: {
        level: suggestions.seniority?.level || prevData.seniority.level,
        years: (parseInt(suggestions.seniority?.yearsExperience || "0")).toString(),
        yearsExperience: suggestions.seniority?.yearsExperience || prevData.seniority.yearsExperience || "0"
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
      base: false,
      baseAmount: 0,mission: {
          amount:
        amount: 0,ons.commission?.options?.[0]?.transactionCommission
              ?.amount || prevData.commission.transactionCommission.amount,
        },
        kpis: suggestions.commission?.options?.[0]?.kpis || prevData.commission.kpis || []
          level: lang.level || ''
        })) || prevData.skills.languages,
        soft: suggestions.skills?.soft || prevData.skills.soft || [],
        professional: suggestions.skills?.professional || prevData.skills.professional || [],
        technical: suggestions.skills?.technical || prevData.skills.technical || [],
        certifications: suggestions.skills?.certifications?.map(cert => ({
          name: cert.name || '',
          required: cert.required || false,
          provider: cert.provider
        })) || prevData.skills.certifications || []
      },
        soft: suggestions.skills?.soft || prevData.skills.soft || [],
        professional: suggestions.skills?.professional || prevData.skills.professional || [],
        technical: suggestions.skills?.technical || prevData.skills.technical || [],
        certifications: suggestions.skills?.certifications?.map(cert => ({
          name: cert.name || '',
          required: cert.required || false,
          provider: cert.provider
        })) || prevData.skills.certifications || []
      },
      // Section Team
      team: {
        size: parseInt(suggestions.team?.size?.toString() || "0"),
        structure: suggestions.team?.structure || prevData.team.structure,        years: parseInt(suggestions.seniority?.yearsExperience || "0"),        languages: suggestions.skills?.languages || prevData.skills.languages,
        professional:
          suggestions.skills?.professional || prevData.skills.professional,
      },

        flexibility: suggestions.schedule?.flexibility || prevData.schedule?.flexibility || []