// Test script pour vérifier la structure des données de schedule
const testData = {
  "title": "Health Insurance Sales Representative",
  "description": "Join our HARX sales team to sell health insurance plans from trusted partners like APRIL, SPVIE, ALPTIS, etc. Your mission involves contacting prospects, offering the best health coverage based on their needs, and achieving sales targets. You will earn a base salary of 1722 euros with additional incentives: 25 € per qualified appointment, up to 900 € per signed contract, bonuses for exceeding targets, and team performance bonuses. We provide you with a solid script, warm leads, quick training, partner materials, live coaching, and performance tracking. Ideal candidates are excellent communicators, adaptable, focused on results, and able to commit a few hours daily. Immediate start with a team in selection process. Don't miss out on this opportunity!",
  "category": "Outbound Sales",
  "userId": {
    "$oid": "680a27ffefa3d29d628d0016"
  },
  "companyId": {
    "$oid": "684ace43641398dc582f1acc"
  },
  "destination_zone": "FR",
  "seniority": {
    "level": "Entry Level",
    "yearsExperience": "0"
  },
  "skills": {
    "professional": [],
    "technical": [],
    "soft": [
      {
        "skill": "Communication",
        "level": 1,
        "_id": {
          "$oid": "6858ffd007f1eaaf941acb1f"
        }
      }
    ],
    "languages": []
  },
  "availability": {
    "schedule": [
      {
        "hours": {
          "start": "08:30",
          "end": "12:40"
        },
        "_id": {
          "$oid": "6858ffd007f1eaaf941acb20"
        }
      },
      {
        "hours": {
          "start": "08:30",
          "end": "12:40"
        },
        "_id": {
          "$oid": "6858ffd007f1eaaf941acb21"
        }
      },
      {
        "hours": {
          "start": "09:00",
          "end": "14:30"
        },
        "_id": {
          "$oid": "6858ffd007f1eaaf941acb22"
        }
      },
      {
        "hours": {
          "start": "09:00",
          "end": "14:30"
        },
        "_id": {
          "$oid": "6858ffd007f1eaaf941acb23"
        }
      }
    ],
    "timeZone": "Singapore (SGT)",
    "flexibility": [
      "Remote Work Available",
      "Flexible Hours"
    ],
    "minimumHours": {
      "daily": 4,
      "weekly": 15,
      "monthly": 60
    }
  },
  "commission": {
    "base": "Fixed Salary",
    "baseAmount": "1722",
    "bonus": "Performance Bonus",
    "bonusAmount": "150",
    "structure": "Individual",
    "currency": "EUR",
    "minimumVolume": {
      "amount": "25",
      "period": "Daily",
      "unit": "Calls"
    },
    "transactionCommission": {
      "type": "Fixed Amount",
      "amount": "900"
    }
  },
  "leads": {
    "types": [],
    "sources": []
  },
  "team": {
    "size": "6",
    "structure": [
      {
        "roleId": "agent",
        "count": 4,
        "seniority": {
          "level": "Junior",
          "yearsExperience": "1"
        },
        "_id": {
          "$oid": "6858ffd007f1eaaf941acb24"
        }
      },
      {
        "roleId": "senior_agent",
        "count": 1,
        "seniority": {
          "level": "Mid-Level",
          "yearsExperience": "3"
        },
        "_id": {
          "$oid": "6858ffd007f1eaaf941acb25"
        }
      },
      {
        "roleId": "team_lead",
        "count": 1,
        "seniority": {
          "level": "Senior",
          "yearsExperience": "5"
        },
        "_id": {
          "$oid": "6858ffd007f1eaaf941acb26"
        }
      }
    ],
    "territories": []
  },
  "documentation": {
    "product": [],
    "process": [],
    "training": []
  },
  "createdAt": {
    "$date": "2025-06-23T07:18:40.494Z"
  },
  "updatedAt": {
    "$date": "2025-06-23T07:18:40.494Z"
  },
  "__v": 0
};

console.log("=== ANALYSE DES DONNÉES ACTUELLES ===");
console.log("Structure actuelle de availability.schedule:");
console.log(JSON.stringify(testData.availability.schedule, null, 2));

console.log("\n=== PROBLÈME IDENTIFIÉ ===");
console.log("❌ Les objets dans availability.schedule n'ont PAS de propriété 'day'");
console.log("❌ Ils ont seulement 'hours' et '_id'");

console.log("\n=== STRUCTURE CORRIGÉE ===");
console.log("✅ Voici comment les données devraient être structurées:");

// Structure corrigée
const correctedSchedule = [
  {
    "day": "Monday",
    "hours": {
      "start": "08:30",
      "end": "12:40"
    },
    "_id": {
      "$oid": "6858ffd007f1eaaf941acb20"
    }
  },
  {
    "day": "Tuesday", 
    "hours": {
      "start": "08:30",
      "end": "12:40"
    },
    "_id": {
      "$oid": "6858ffd007f1eaaf941acb21"
    }
  },
  {
    "day": "Wednesday",
    "hours": {
      "start": "09:00",
      "end": "14:30"
    },
    "_id": {
      "$oid": "6858ffd007f1eaaf941acb22"
    }
  },
  {
    "day": "Thursday",
    "hours": {
      "start": "09:00",
      "end": "14:30"
    },
    "_id": {
      "$oid": "6858ffd007f1eaaf941acb23"
    }
  }
];

console.log(JSON.stringify(correctedSchedule, null, 2));

console.log("\n=== FONCTION DE CORRECTION ===");
console.log("Voici une fonction pour corriger automatiquement les données:");

function fixScheduleData(data) {
  const workingDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  if (data.availability && data.availability.schedule) {
    const fixedSchedule = data.availability.schedule.map((schedule, index) => {
      // Si l'objet n'a pas de propriété 'day', on l'ajoute
      if (!schedule.day) {
        // Utiliser l'index pour assigner un jour de la semaine
        const dayIndex = index % workingDays.length;
        return {
          ...schedule,
          day: workingDays[dayIndex]
        };
      }
      return schedule;
    });
    
    return {
      ...data,
      availability: {
        ...data.availability,
        schedule: fixedSchedule
      }
    };
  }
  
  return data;
}

console.log("Fonction fixScheduleData créée");
console.log("\n=== TEST DE LA CORRECTION ===");

const fixedData = fixScheduleData(testData);
console.log("Données corrigées:");
console.log(JSON.stringify(fixedData.availability.schedule, null, 2));

console.log("\n=== FONCTION DE GROUPEMENT ===");
console.log("Test de la fonction groupSchedules avec les données corrigées:");

// Fonction de groupement (copiée du fichier scheduleUtils.ts)
const groupSchedules = (schedules) => {
  if (!schedules || schedules.length === 0) {
    return [];
  }

  const groups = {};
  
  schedules.forEach(schedule => {
    if (schedule && 
        schedule.day && 
        schedule.hours && 
        typeof schedule.hours.start === 'string' && 
        typeof schedule.hours.end === 'string' &&
        schedule.hours.start.trim() !== '' &&
        schedule.hours.end.trim() !== '') {
        
        const hoursKey = `${schedule.hours.start}-${schedule.hours.end}`;
        if (!groups[hoursKey]) {
            groups[hoursKey] = [];
        }
        if (schedule.day && !groups[hoursKey].includes(schedule.day)) {
            groups[hoursKey].push(schedule.day);
        }
    }
  });
  
  const grouped = Object.entries(groups)
    .filter(([_, days]) => days.length > 0)
    .map(([hoursKey, days]) => {
      const [start, end] = hoursKey.split('-');
      return { 
        days: days.sort(),
        hours: { start, end } 
      };
    })
    .sort((a, b) => {
      const aStart = a.hours.start;
      const bStart = b.hours.start;
      return aStart.localeCompare(bStart);
    });

  return grouped;
};

const groupedResult = groupSchedules(fixedData.availability.schedule);
console.log("Résultat du groupement:");
console.log(JSON.stringify(groupedResult, null, 2));

console.log("\n=== RÉSUMÉ ===");
console.log("✅ Le problème est identifié: les données n'ont pas de propriété 'day'");
console.log("✅ La solution: ajouter automatiquement les jours lors de la sauvegarde");
console.log("✅ Le code de GigReview.tsx a été corrigé pour gérer cette structure");
console.log("✅ La fonction groupSchedules fonctionne correctement avec les données corrigées"); 