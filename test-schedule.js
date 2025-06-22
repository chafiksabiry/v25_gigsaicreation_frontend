// Test script pour vérifier le groupement des horaires
const testSchedules = [
  {
    "day": "Monday",
    "hours": {
      "start": "08:30",
      "end": "12:40"
    }
  },
  {
    "day": "Tuesday", 
    "hours": {
      "start": "08:30",
      "end": "12:40"
    }
  },
  {
    "day": "Wednesday",
    "hours": {
      "start": "08:30", 
      "end": "12:40"
    }
  },
  {
    "day": "Thursday",
    "hours": {
      "start": "08:30",
      "end": "12:40" 
    }
  },
  {
    "day": "Friday",
    "hours": {
      "start": "08:30",
      "end": "12:40"
    }
  },
  {
    "day": "Monday",
    "hours": {
      "start": "09:00",
      "end": "14:30"
    }
  },
  {
    "day": "Tuesday",
    "hours": {
      "start": "09:00", 
      "end": "14:30"
    }
  },
  {
    "day": "Wednesday",
    "hours": {
      "start": "09:00",
      "end": "14:30"
    }
  },
  {
    "day": "Thursday",
    "hours": {
      "start": "09:00",
      "end": "14:30"
    }
  },
  {
    "day": "Friday",
    "hours": {
      "start": "09:00",
      "end": "14:30"
    }
  }
];

// Fonction de nettoyage (copiée du composant)
const cleanSchedules = (schedules) => {
  if (!schedules || schedules.length === 0) {
    return [];
  }

  const seen = new Set();
  const cleaned = [];

  schedules.forEach(schedule => {
    if (schedule && schedule.day && schedule.hours) {
      const key = `${schedule.day}-${schedule.hours.start}-${schedule.hours.end}`;
      if (!seen.has(key)) {
        seen.add(key);
        cleaned.push({
          day: schedule.day,
          hours: {
            start: schedule.hours.start,
            end: schedule.hours.end
          }
        });
      }
    }
  });

  return cleaned;
};

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

// Test
console.log("Données originales:", testSchedules.length, "entrées");
const cleaned = cleanSchedules(testSchedules);
console.log("Après nettoyage:", cleaned.length, "entrées");
const grouped = groupSchedules(cleaned);
console.log("Après groupement:", grouped.length, "slots");
console.log("Slots:", JSON.stringify(grouped, null, 2)); 