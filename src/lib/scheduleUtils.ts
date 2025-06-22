export interface TimeRange {
  start: string;
  end: string;
}

export interface DaySchedule {
  day: string;
  hours: TimeRange;
}

export interface GroupedSchedule {
  days: string[];
  hours: TimeRange;
}

export const groupSchedules = (schedules: DaySchedule[]): GroupedSchedule[] => {
  if (!schedules || schedules.length === 0) {
    return [];
  }

  const groups: { [key: string]: string[] } = {};
  
  schedules.forEach(schedule => {
    if (schedule && schedule.hours && typeof schedule.hours.start === 'string' && typeof schedule.hours.end === 'string') {
        const hoursKey = `${schedule.hours.start}-${schedule.hours.end}`;
        if (!groups[hoursKey]) {
            groups[hoursKey] = [];
        }
        if (schedule.day && !groups[hoursKey].includes(schedule.day)) {
            groups[hoursKey].push(schedule.day);
        }
    }
  });
  
  const grouped = Object.entries(groups).map(([hoursKey, days]) => {
    const [start, end] = hoursKey.split('-');
    return { days, hours: { start, end } };
  });

  return grouped;
}; 