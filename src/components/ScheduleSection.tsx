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
} from "lucide-react";
import { DaySchedule, GroupedSchedule, groupSchedules as groupSchedulesUtil } from "../lib/scheduleUtils";
import { TimezoneCode, MAJOR_TIMEZONES } from "../lib/ai";


interface ScheduleSectionProps {
  data: {
    schedules: DaySchedule[];
    minimumHours: {
      daily?: number;
      weekly?: number;
      monthly?: number;
    };
    timeZone?: TimezoneCode;
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

const allWeekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Group schedules by identical hours
const groupSchedulesByHours = (schedules: DaySchedule[]): GroupedSchedule[] => {
  const groups: Record<string, GroupedSchedule> = {};
  schedules.forEach((schedule) => {
    const key = `${schedule.hours.start}-${schedule.hours.end}`;
    if (!groups[key]) {
      groups[key] = { hours: { ...schedule.hours }, days: [] };
    }
    groups[key].days.push(schedule.day);
  });
  return Object.values(groups);
};

const getUnusedDay = (schedules: DaySchedule[]): string | undefined => {
  const used = schedules.map((s) => s.day);
  return allWeekDays.find((d) => !used.includes(d));
};

export function ScheduleSection({
  data,
  onChange,
  onNext,
  onPrevious
}: ScheduleSectionProps) {
  // Use flat schedules as source of truth
  const [schedules, setSchedules] = useState<DaySchedule[]>(data.schedules);
  // Track empty groups that haven't been populated yet
  const [emptyGroups, setEmptyGroups] = useState<Array<{id: string, hours: {start: string, end: string}}>>([]);

  useEffect(() => {
    onChange({ ...data, schedules });
  }, [schedules]);

  // Group for display
  const groupedSchedules = groupSchedulesByHours(schedules);

  // Vérifier si tous les jours sont déjà sélectionnés
  const selectedDays = schedules.map(schedule => schedule.day);
  const allDaysSelected = allWeekDays.every(day => selectedDays.includes(day));

  // Toggle a day in/out of a group
  const handleDayToggle = (day: string, groupHours: { start: string; end: string }, groupId?: string) => {
    if (groupId && groupId.startsWith('empty_')) {
      // This is an empty group, add the day to schedules and remove from empty groups
      setSchedules((prev) => [...prev, { day, hours: groupHours }]);
      setEmptyGroups((prev) => prev.filter(g => g.id !== groupId));
    } else {
      // Normal group logic
      setSchedules((prev) => {
        const idx = prev.findIndex((s) => s.day === day);
        if (idx > -1) {
          // If same hours, remove; else, update hours
          if (
            prev[idx].hours.start === groupHours.start &&
            prev[idx].hours.end === groupHours.end
          ) {
            return prev.filter((s, i) => i !== idx);
          } else {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], hours: { ...groupHours } };
            return updated;
          }
        } else {
          // Add new day with these hours
          return [...prev, { day, hours: { ...groupHours } }];
        }
      });
    }
  };

  // Change hours for all days in a group
  const handleHoursChange = (group: GroupedSchedule, field: "start" | "end", value: string) => {
    setSchedules((prev) =>
      prev.map((s) =>
        group.days.includes(s.day)
          ? { ...s, hours: { ...s.hours, [field]: value } }
          : s
      )
    );
  };

  // Rename this function to avoid conflict
  const handleMinimumHoursChange = (field: 'daily' | 'weekly' | 'monthly', value: string) => {
    onChange({
      ...data,
      minimumHours: { ...data.minimumHours, [field]: value ? parseInt(value, 10) : undefined }
    });
  };

  // Preset buttons
  const handlePresetClick = (group: GroupedSchedule, preset: string) => {
    let newHours;
    switch (preset) {
      case "9-5":
        newHours = { start: "09:00", end: "17:00" };
        break;
      case "Early":
        newHours = { start: "07:00", end: "15:00" };
        break;
      case "Late":
        newHours = { start: "11:00", end: "19:00" };
        break;
      case "Evening":
        newHours = { start: "13:00", end: "21:00" };
        break;
      default:
        newHours = group.hours;
    }
    setSchedules((prev) =>
      prev.map((s) =>
        group.days.includes(s.day)
          ? { ...s, hours: { ...newHours } }
          : s
      )
    );
  };

  const handleTimezoneChange = (tz: TimezoneCode) => {
    // Allow only single selection - replace the entire timezone with the selected one
    const newTimezone = data.timeZone === tz ? undefined : tz;
    onChange({ ...data, timeZone: newTimezone });
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

  // Add a new group with an unused day
  const handleAddScheduleGroup = () => {
    // Get all existing hours from grouped schedules
    const existingHours = groupedSchedules.map(group => `${group.hours.start}-${group.hours.end}`);
    
    // Define possible default hours
    const possibleDefaults = [
      { start: "09:00", end: "17:00" },
      { start: "08:00", end: "16:00" },
      { start: "10:00", end: "18:00" },
      { start: "07:00", end: "15:00" },
      { start: "11:00", end: "19:00" },
      { start: "12:00", end: "20:00" },
      { start: "06:00", end: "14:00" },
      { start: "13:00", end: "21:00" }
    ];
    
    // Find the first default that doesn't conflict with existing hours
    let defaultHours = possibleDefaults[0]; // fallback
    for (const hours of possibleDefaults) {
      const hoursString = `${hours.start}-${hours.end}`;
      if (!existingHours.includes(hoursString)) {
        defaultHours = hours;
        break;
      }
    }
    
    const emptyGroupId = `empty_${Date.now()}`;
    
    setEmptyGroups((prev) => [
      ...prev,
      { id: emptyGroupId, hours: defaultHours },
    ]);
  };

  // Remove a group (remove all its days)
  const handleRemoveScheduleGroup = (group: GroupedSchedule) => {
    setSchedules((prev) => prev.filter((s) => !group.days.includes(s.day)));
  };

  // Sécurise timeZone pour l'affichage
  const timeZone = data.timeZone;

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6">
      <div className="space-y-6">
        {/* Display normal groups */}
        {groupedSchedules.map((group, index) => (
          <div key={index} className="p-4 bg-white border border-gray-200/80 rounded-lg shadow-sm relative transition-shadow hover:shadow-md">
            <button
              onClick={() => handleRemoveScheduleGroup(group)}
              className="absolute top-2 right-2 p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
              aria-label="Remove schedule group"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Working Days</h4>
                <div className="flex gap-1">
                  {workingDays.map(day => {
                    const isSelected = group.days.includes(day);
                    const isInOtherGroup = !isSelected && schedules.some(s => s.day === day);
                    return (
                      <button
                        key={day}
                        onClick={() => handleDayToggle(day, group.hours)}
                        disabled={isInOtherGroup}
                        className={`px-2 py-1 text-xs font-medium rounded transition-all duration-200 ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-sm'
                            : isInOtherGroup
                            ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        title={isInOtherGroup ? `${day} is already selected in another schedule group` : undefined}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-gray-500" />
                  Working Hours
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 flex items-center">
                      <Sunrise className="w-3 h-3 mr-1 text-gray-400" />
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={group.hours.start}
                      onChange={(e) => handleHoursChange(group, 'start', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 flex items-center">
                      <Sunset className="w-3 h-3 mr-1 text-gray-400" />
                      End Time
                    </label>
                    <input
                      type="time"
                      value={group.hours.end}
                      onChange={(e) => handleHoursChange(group, 'end', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded-lg text-center font-semibold text-gray-800 text-sm">
                  {formatTime(group.hours.start)} - {formatTime(group.hours.end)}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <button onClick={() => handlePresetClick(group, '9-5')} className="p-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-300 flex flex-col items-center gap-1 transition-all">
                      <Sun className="w-4 h-4 text-orange-400"/>
                      <span className="text-xs font-medium">9-5</span>
                  </button>
                  <button onClick={() => handlePresetClick(group, 'Early')} className="p-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-300 flex flex-col items-center gap-1 transition-all">
                      <Sunrise className="w-4 h-4 text-yellow-400"/>
                      <span className="text-xs font-medium">Early</span>
                  </button>
                  <button onClick={() => handlePresetClick(group, 'Late')} className="p-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-300 flex flex-col items-center gap-1 transition-all">
                      <Clock className="w-4 h-4 text-sky-400"/>
                      <span className="text-xs font-medium">Late</span>
                  </button>
                  <button onClick={() => handlePresetClick(group, 'Evening')} className="p-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-300 flex flex-col items-center gap-1 transition-all">
                      <Moon className="w-4 h-4 text-indigo-400"/>
                      <span className="text-xs font-medium">Evening</span>
                  </button>
              </div>
            </div>
          </div>
        ))}

        {/* Display empty groups */}
        {emptyGroups.map((emptyGroup) => (
          <div key={emptyGroup.id} className="p-4 bg-white border border-gray-200/80 rounded-lg shadow-sm relative transition-shadow hover:shadow-md">
            <button
              onClick={() => setEmptyGroups(prev => prev.filter(g => g.id !== emptyGroup.id))}
              className="absolute top-2 right-2 p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
              aria-label="Remove empty group"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Working Days</h4>
                <div className="flex gap-1">
                  {workingDays.map(day => {
                    const isInOtherGroup = schedules.some(s => s.day === day);
                    return (
                      <button
                        key={day}
                        onClick={() => handleDayToggle(day, emptyGroup.hours, emptyGroup.id)}
                        disabled={isInOtherGroup}
                        className={`px-2 py-1 text-xs font-medium rounded transition-all duration-200 ${
                          isInOtherGroup
                            ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        title={isInOtherGroup ? `${day} is already selected in another schedule group` : undefined}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-gray-500" />
                  Working Hours
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 flex items-center">
                      <Sunrise className="w-3 h-3 mr-1 text-gray-400" />
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={emptyGroup.hours.start}
                      onChange={(e) => setEmptyGroups(prev => prev.map(g => g.id === emptyGroup.id ? {...g, hours: {...g.hours, start: e.target.value}} : g))}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 flex items-center">
                      <Sunset className="w-3 h-3 mr-1 text-gray-400" />
                      End Time
                    </label>
                    <input
                      type="time"
                      value={emptyGroup.hours.end}
                      onChange={(e) => setEmptyGroups(prev => prev.map(g => g.id === emptyGroup.id ? {...g, hours: {...g.hours, end: e.target.value}} : g))}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded-lg text-center font-semibold text-gray-800 text-sm">
                  {formatTime(emptyGroup.hours.start)} - {formatTime(emptyGroup.hours.end)}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-3">
                  <button onClick={() => setEmptyGroups(prev => prev.map(g => g.id === emptyGroup.id ? {...g, hours: {start: "09:00", end: "17:00"}} : g))} className="p-3 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-300 flex flex-col items-center gap-1.5 transition-all">
                      <Sun className="w-5 h-5 text-orange-400"/>
                      <span className="text-xs font-medium">9-5</span>
                  </button>
                  <button onClick={() => setEmptyGroups(prev => prev.map(g => g.id === emptyGroup.id ? {...g, hours: {start: "07:00", end: "15:00"}} : g))} className="p-3 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-300 flex flex-col items-center gap-1.5 transition-all">
                      <Sunrise className="w-5 h-5 text-yellow-400"/>
                      <span className="text-xs font-medium">Early</span>
                  </button>
                  <button onClick={() => setEmptyGroups(prev => prev.map(g => g.id === emptyGroup.id ? {...g, hours: {start: "11:00", end: "19:00"}} : g))} className="p-3 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-300 flex flex-col items-center gap-1.5 transition-all">
                      <Clock className="w-5 h-5 text-sky-400"/>
                      <span className="text-xs font-medium">Late</span>
                  </button>
                  <button onClick={() => setEmptyGroups(prev => prev.map(g => g.id === emptyGroup.id ? {...g, hours: {start: "13:00", end: "21:00"}} : g))} className="p-3 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-300 flex flex-col items-center gap-1.5 transition-all">
                      <Moon className="w-5 h-5 text-indigo-400"/>
                      <span className="text-xs font-medium">Evening</span>
                  </button>
              </div>
            </div>
          </div>
        ))}

        <div className="pt-4">
          {/* Afficher le bouton seulement si tous les jours ne sont pas sélectionnés ET qu'il n'y a pas de groupes vides */}
          {!allDaysSelected && emptyGroups.length === 0 && (
            <button
              onClick={handleAddScheduleGroup}
              className="w-full flex justify-center items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold text-sm">Add Schedule Group</span>
            </button>
          )}

          {/* Message quand tous les jours sont sélectionnés */}
          {allDaysSelected && (
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center justify-center space-x-2 text-green-700 mb-2">
                <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <span className="font-semibold text-sm">All week days are scheduled!</span>
              </div>
              <p className="text-xs text-green-600">
                You can still modify existing schedules or remove days to add new groups.
              </p>
            </div>
          )}
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
                  onChange={(e) => handleMinimumHoursChange('daily', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center font-medium"
                />
                <p className="text-xs text-gray-500 mt-2 text-center">Maximum: 24 hours</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Per Week</label>
                <input type="number" placeholder="e.g., 40" 
                  value={data.minimumHours.weekly || ''}
                  onChange={(e) => handleMinimumHoursChange('weekly', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center font-medium"
                />
                <p className="text-xs text-gray-500 mt-2 text-center">Maximum: 168 hours</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Per Month</label>
                <input type="number" placeholder="e.g., 160" 
                  value={data.minimumHours.monthly || ''}
                  onChange={(e) => handleMinimumHoursChange('monthly', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center font-medium"
                />
                <p className="text-xs text-gray-500 mt-2 text-center">Maximum: 744 hours</p>
              </div>
            </div>
          </div>

          {/* Time Zone */}
          <div className="bg-green-50 border border-green-200 rounded-xl">
            <h4 className="text-lg font-bold text-gray-800 flex items-center px-4 pt-4 pb-2">
              <div className="w-6 h-6 mr-3 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">TZ</span>
              </div>
              Time Zone
            </h4>
            <div className="flex justify-center">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 m-0 p-0">
                {Object.entries(MAJOR_TIMEZONES).map(([code, {name}]) => {
                  const isSelected = data.timeZone === code;
                  return (
                    <label
                      key={code}
                      className={`flex flex-col items-center justify-center border rounded-lg transition-all duration-200 cursor-pointer text-center text-xs font-medium
                        ${isSelected ? 'bg-green-100 border-2 border-green-500 shadow' : 'bg-white border-green-200 hover:bg-green-50'}
                        p-0 m-0 h-14 w-36`}
                      style={{ minWidth: 0, minHeight: 0 }}
                    >
                      <input
                        type="radio"
                        name="timezone"
                        checked={isSelected}
                        onChange={() => handleTimezoneChange(code as TimezoneCode)}
                        className="appearance-none"
                      />
                      <span className="leading-tight">{name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 mb-2 text-center italic">Select one timezone for your schedule</p>
          </div>

          {/* Schedule Flexibility */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <div className="w-6 h-6 mr-3 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">F</span>
              </div>
              Schedule Flexibility
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 m-0 p-0">
              {flexibilityOptions.map((option) => {
                const isSelected = data.flexibility.includes(option);
                return (
                  <label
                    key={option}
                    className={`flex flex-col items-center justify-center border rounded-lg transition-all duration-200 cursor-pointer text-center text-xs font-medium
                      ${isSelected ? 'bg-purple-100 border-2 border-purple-500 shadow' : 'bg-white border-purple-200 hover:bg-purple-50'}
                      p-0 m-0 h-14 w-36`}
                    style={{ minWidth: 0, minHeight: 0 }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleFlexibilityChange(option)}
                      className="appearance-none"
                    />
                    <span className="leading-tight">{option}</span>
                  </label>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center italic">Select all applicable schedule flexibility options</p>
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