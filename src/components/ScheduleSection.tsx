import React, { useState, useEffect } from "react";
import {
  Clock,
  Sunrise,
  Sunset,
  Sun,
  Moon,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Copy,
} from "lucide-react";
import { DaySchedule, GroupedSchedule, groupSchedules as groupSchedulesUtil } from "../lib/scheduleUtils";
import { TimezoneCode, MAJOR_TIMEZONES } from "../lib/ai";

interface TimeRange {
  start: string;
  end: string;
}

interface ScheduleSectionProps {
  data: {
    schedules: DaySchedule[];
    minimumHours: {
      daily?: number;
      weekly?: number;
      monthly?: number;
    };
    timeZones: TimezoneCode[];
    flexibility: string[];
  };
  onChange: (data: ScheduleSectionProps['data']) => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

const workingDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const flexibilityOptions = [
  'Remote Work Available', 'Flexible Hours', 'Weekend Rotation', 
  'Night Shift Available', 'Split Shifts', 'Part-Time Options', 
  'Compressed Work Week', 'Shift Swapping Allowed'
];

const groupSchedules = (schedules: DaySchedule[]): GroupedSchedule[] => {
  if (!schedules || schedules.length === 0) {
    return [
      { days: ["Monday", "Tuesday"], hours: { start: '08:30', end: '12:40' } },
      { days: ["Thursday", "Saturday"], hours: { start: '09:00', end: '14:30' } }
    ];
  }
  return groupSchedulesUtil(schedules);
};

const flattenSchedules = (groupedSchedules: GroupedSchedule[]): DaySchedule[] => {
  return groupedSchedules.flatMap(group => 
    group.days.map(day => ({ day, hours: group.hours }))
  );
};

export function ScheduleSection({
  data,
  onChange,
  onNext,
  onPrevious
}: ScheduleSectionProps) {
  const [groupedSchedules, setGroupedSchedules] = useState<GroupedSchedule[]>(() => groupSchedules(data.schedules));

  useEffect(() => {
    const flatSchedules = flattenSchedules(groupedSchedules);
    onChange({ ...data, schedules: flatSchedules });
  }, [groupedSchedules]);

  useEffect(() => {
    const mergeSchedules = () => {
      if (groupedSchedules.length <= 1) {
        return;
      }

      const merged = groupedSchedules.reduce((acc, currentGroup) => {
        const existingGroupIndex = acc.findIndex(
          (group) =>
            group.hours.start === currentGroup.hours.start &&
            group.hours.end === currentGroup.hours.end
        );

        if (existingGroupIndex > -1) {
          const daysToAdd = currentGroup.days.filter(
            (day) => !acc[existingGroupIndex].days.includes(day)
          );
          acc[existingGroupIndex].days.push(...daysToAdd);
          acc[existingGroupIndex].days.sort((a, b) => workingDays.indexOf(a) - workingDays.indexOf(b));
        } else {
          acc.push(JSON.parse(JSON.stringify(currentGroup)));
        }
        return acc;
      }, [] as GroupedSchedule[]);

      if (JSON.stringify(merged) !== JSON.stringify(groupedSchedules)) {
        setGroupedSchedules(merged);
      }
    };

    const timer = setTimeout(mergeSchedules, 500);
    return () => clearTimeout(timer);
  }, [groupedSchedules]);

  const handleToggleDayInGroup = (day: string, groupIndex: number) => {
    setGroupedSchedules(currentSchedules => {
      const newSchedules = JSON.parse(JSON.stringify(currentSchedules));
      const group = newSchedules[groupIndex];
      const dayIndex = group.days.indexOf(day);
      if (dayIndex > -1) {
        group.days.splice(dayIndex, 1);
      } else {
        group.days.push(day);
      }
      return newSchedules;
    });
  };

  const handleTimeChange = (groupIndex: number, type: "start" | "end", value: string) => {
    setGroupedSchedules(currentSchedules => {
      const newSchedules = JSON.parse(JSON.stringify(currentSchedules));
      newSchedules[groupIndex].hours[type] = value;
      return newSchedules;
    });
  };

  const handlePresetHours = (groupIndex: number, start: string, end: string) => {
    setGroupedSchedules(currentSchedules => {
      const newSchedules = JSON.parse(JSON.stringify(currentSchedules));
      newSchedules[groupIndex].hours = { start, end };
      return newSchedules;
    });
  };

  const handleAddScheduleGroup = () => {
    setGroupedSchedules(currentSchedules => [
      ...currentSchedules,
      { days: [], hours: { start: '09:00', end: '17:00' } }
    ]);
  };

  const handleRemoveScheduleGroup = (index: number) => {
    if (groupedSchedules.length <= 1) return; // Optional: prevent removing the last group
    setGroupedSchedules(currentSchedules => currentSchedules.filter((_, i) => i !== index));
  };

  const handleDuplicateScheduleGroup = (index: number) => {
    setGroupedSchedules(currentSchedules => {
      const groupToDuplicate = currentSchedules[index];
      const newGroup = {
        days: [], // Pas de jours sélectionnés pour le nouveau groupe
        hours: { ...groupToDuplicate.hours } // Copie les mêmes heures
      };
      return [...currentSchedules, newGroup];
    });
  };

  const handleHoursChange = (field: 'daily' | 'weekly' | 'monthly', value: string) => {
    onChange({
      ...data,
      minimumHours: { ...data.minimumHours, [field]: value ? parseInt(value, 10) : undefined }
    });
  };

  const handleTimezoneChange = (tz: TimezoneCode) => {
    const newTimezones = data.timeZones.includes(tz)
      ? data.timeZones.filter(t => t !== tz)
      : [...data.timeZones, tz];
    onChange({ ...data, timeZones: newTimezones });
  };

  const handleFlexibilityChange = (option: string) => {
    const newFlexibility = data.flexibility.includes(option)
      ? data.flexibility.filter(o => o !== option)
      : [...data.flexibility, option];
    onChange({ ...data, flexibility: newFlexibility });
  };

  const formatTime = (time: string): string => {
    if (!time) return "Invalid Time";
    const [hour, minute] = time.split(":");
    if (isNaN(parseInt(hour)) || isNaN(parseInt(minute))) return "Invalid Time";
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHour = h % 12 || 12;
    return `${String(formattedHour).padStart(2, '0')}:${minute} ${ampm}`;
  };

  // Fonction pour vérifier si un jour est déjà sélectionné dans d'autres groupes
  const isDayUsedInOtherGroups = (day: string, currentGroupIndex: number): boolean => {
    return groupedSchedules.some((schedule, index) => 
      index !== currentGroupIndex && schedule.days.includes(day)
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6">
      <div className="space-y-6">
        {groupedSchedules.map((schedule, index) => (
          <div key={index} className="p-6 bg-white border border-gray-200/80 rounded-2xl shadow-sm relative transition-shadow hover:shadow-md">
            {groupedSchedules.length > 1 && (
                <button
                  onClick={() => handleRemoveScheduleGroup(index)}
                  className="absolute top-3 right-3 p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
                  aria-label="Remove schedule group"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
            )}
            <button
              onClick={() => handleDuplicateScheduleGroup(index)}
              className="absolute top-3 right-12 p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-500 rounded-full transition-colors"
              aria-label="Duplicate schedule group"
            >
              <Copy className="w-4 h-4" />
            </button>
            <div className="space-y-5">
              <div>
                <h4 className="text-base font-semibold text-gray-800 mb-3">Working Days</h4>
                <div className="flex flex-wrap gap-2">
                  {workingDays.map(day => {
                    const isSelected = schedule.days.includes(day);
                    const isUsedInOtherGroups = isDayUsedInOtherGroups(day, index);
                    const isDisabled = isUsedInOtherGroups && !isSelected;
                    
                    return (
                      <button
                        key={day}
                        onClick={() => !isDisabled && handleToggleDayInGroup(day, index)}
                        disabled={isDisabled}
                        className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-md'
                            : isDisabled
                            ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        title={isDisabled ? `${day} is already selected in another schedule group` : undefined}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-gray-500" />
                  Working Hours
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor={`start-time-${index}`} className="text-xs text-gray-500 flex items-center">
                      <Sunrise className="w-4 h-4 mr-1.5 text-gray-400" />
                      Start Time
                    </label>
                    <input
                      id={`start-time-${index}`}
                      type="time"
                      value={schedule.hours.start}
                      onChange={e => handleTimeChange(index, 'start', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor={`end-time-${index}`} className="text-xs text-gray-500 flex items-center">
                      <Sunset className="w-4 h-4 mr-1.5 text-gray-400" />
                      End Time
                    </label>
                    <input
                      id={`end-time-${index}`}
                      type="time"
                      value={schedule.hours.end}
                      onChange={e => handleTimeChange(index, 'end', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg text-center font-semibold text-gray-800 tracking-wider">
                  {formatTime(schedule.hours.start)} - {formatTime(schedule.hours.end)}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <button onClick={() => handlePresetHours(index, '09:00', '17:00')} className="p-3 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-300 flex flex-col items-center gap-1.5 transition-all">
                      <Sun className="w-5 h-5 text-orange-400"/>
                      <span className="text-xs font-medium">9-5</span>
                  </button>
                  <button onClick={() => handlePresetHours(index, '07:00', '15:00')} className="p-3 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-300 flex flex-col items-center gap-1.5 transition-all">
                      <Sunrise className="w-5 h-5 text-yellow-400"/>
                      <span className="text-xs font-medium">Early</span>
                  </button>
                  <button onClick={() => handlePresetHours(index, '11:00', '19:00')} className="p-3 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-300 flex flex-col items-center gap-1.5 transition-all">
                      <Clock className="w-5 h-5 text-sky-400"/>
                      <span className="text-xs font-medium">Late</span>
                  </button>
                  <button onClick={() => handlePresetHours(index, '13:00', '21:00')} className="p-3 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-300 flex flex-col items-center gap-1.5 transition-all">
                      <Moon className="w-5 h-5 text-indigo-400"/>
                      <span className="text-xs font-medium">Evening</span>
                  </button>
              </div>
            </div>
          </div>
        ))}

        <div className="pt-4">
          <button
            onClick={handleAddScheduleGroup}
            className="w-full flex justify-center items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold text-sm">Add Schedule Group</span>
          </button>
        </div>

        {/* Minimum Hours, Timezones, and Flexibility Section */}
        <div className="p-6 bg-white border border-gray-200/80 rounded-2xl shadow-sm space-y-8">
          
          {/* Minimum Hours Requirements */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Clock className="w-6 h-6 mr-3 text-blue-600" />
              Minimum Hours Requirements
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Per Day</label>
                <input type="number" placeholder="e.g., 8" 
                  value={data.minimumHours.daily || ''} 
                  onChange={(e) => handleHoursChange('daily', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center font-medium"
                />
                <p className="text-xs text-gray-500 mt-2 text-center">Maximum: 24 hours</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Per Week</label>
                <input type="number" placeholder="e.g., 40" 
                  value={data.minimumHours.weekly || ''}
                  onChange={(e) => handleHoursChange('weekly', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center font-medium"
                />
                <p className="text-xs text-gray-500 mt-2 text-center">Maximum: 168 hours</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Per Month</label>
                <input type="number" placeholder="e.g., 160" 
                  value={data.minimumHours.monthly || ''}
                  onChange={(e) => handleHoursChange('monthly', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center font-medium"
                />
                <p className="text-xs text-gray-500 mt-2 text-center">Maximum: 744 hours</p>
              </div>
            </div>
          </div>

          {/* Time Zones */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <div className="w-6 h-6 mr-3 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">TZ</span>
              </div>
              Time Zones
            </h4>
            <div className="bg-white p-4 rounded-lg border border-green-200 shadow-sm">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-3">
                {Object.entries(MAJOR_TIMEZONES).map(([code, {name}]) => {
                  const isSelected = data.timeZones.includes(code as TimezoneCode);
                  return (
                    <label key={code} className={`flex items-center space-x-3 p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                      isSelected 
                        ? 'bg-green-100 border border-green-300 shadow-sm' 
                        : 'hover:bg-green-50'
                    }`}>
                      <input type="checkbox"
                        checked={isSelected}
                        onChange={() => handleTimezoneChange(code as TimezoneCode)}
                        className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 focus:ring-2"
                      />
                      <span className={`text-sm font-medium ${
                        isSelected ? 'text-green-800' : 'text-gray-700'
                      }`}>{name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Schedule Flexibility */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <div className="w-6 h-6 mr-3 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">F</span>
              </div>
              Schedule Flexibility
            </h4>
            <div className="bg-white p-4 rounded-lg border border-purple-200 shadow-sm">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-3">
                {flexibilityOptions.map((option) => {
                  const isSelected = data.flexibility.includes(option);
                  return (
                    <label key={option} className={`flex items-center space-x-3 p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                      isSelected 
                        ? 'bg-purple-100 border border-purple-300 shadow-sm' 
                        : 'hover:bg-purple-50'
                    }`}>
                      <input type="checkbox"
                        checked={isSelected}
                        onChange={() => handleFlexibilityChange(option)}
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-2"
                      />
                      <span className={`text-sm font-medium ${
                        isSelected ? 'text-purple-800' : 'text-gray-700'
                      }`}>{option}</span>
                    </label>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-4 text-center italic">Select all applicable schedule flexibility options</p>
            </div>
          </div>

        </div>
      </div>
      
      <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-200">
        <button onClick={onPrevious} disabled={!onPrevious}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Previous
        </button>
        <button onClick={onNext}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 font-semibold text-sm transition-colors shadow-sm hover:shadow-md">
          Next
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default ScheduleSection; 