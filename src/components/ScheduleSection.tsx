import React, { useState, useEffect } from "react";
import { SelectionList } from "./SelectionList";
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
  Globe,
  X,
  Calendar,
  Users,
  Target,
} from "lucide-react";
import { TimezoneCode, MAJOR_TIMEZONES } from "../lib/ai";
import { DaySchedule, GroupedSchedule, groupSchedules as groupSchedulesUtil } from "../lib/scheduleUtils";

// ... (interfaces remain the same)

interface TimeRange {
  start: string;
  end: string;
}

interface ScheduleSectionProps {
  data: {
    schedules: DaySchedule[];
    timeZones: TimezoneCode[];
    flexibility: string[];
    minimumHours: {
      daily?: number;
      weekly?: number;
      monthly?: number;
    };
    availability?: any;
  };
  onChange: (data: any) => void;
  errors: { [key: string]: string[] };
  onNext?: () => void;
  onPrevious?: () => void;
}

const workingDays = ["Monday", "Tuesday", "Thursday", "Friday", "Saturday", "Sunday"];

const groupSchedules = (schedules: DaySchedule[]): GroupedSchedule[] => {
  if (!schedules || schedules.length === 0) {
    return [{ days: ["Monday", "Tuesday", "Thursday", "Friday"], hours: { start: '09:00', end: '17:00' } }];
  }
  
  // Filter out Wednesday and deduplicate entries
  const filteredSchedules = schedules.filter(schedule => 
    schedule && 
    schedule.day && 
    schedule.day !== "Wednesday" && 
    schedule.hours && 
    typeof schedule.hours.start === 'string' && 
    typeof schedule.hours.end === 'string' &&
    schedule.hours.start.trim() !== '' &&
    schedule.hours.end.trim() !== ''
  );
  
  // Deduplicate by day (keep the first occurrence of each day)
  const uniqueSchedules: DaySchedule[] = [];
  const seenDays = new Set<string>();
  
  filteredSchedules.forEach(schedule => {
    if (!seenDays.has(schedule.day)) {
      seenDays.add(schedule.day);
      uniqueSchedules.push(schedule);
    }
  });
  
  const grouped = groupSchedulesUtil(uniqueSchedules);
  return grouped.length > 0 ? grouped : [{ days: [], hours: { start: '09:00', end: '17:00' } }];
};

const flattenSchedules = (groupedSchedules: GroupedSchedule[]): DaySchedule[] => {
  const flat: DaySchedule[] = [];
  groupedSchedules.forEach(group => {
    group.days.forEach(day => {
      flat.push({ day, hours: group.hours });
    });
  });
  return flat;
};

export function ScheduleSection({
  data,
  onChange,
  errors = {},
  onNext,
  onPrevious
}: ScheduleSectionProps) {
  const [groupedSchedules, setGroupedSchedules] = useState<GroupedSchedule[]>(groupSchedules(data.schedules));
  const [activeScheduleIndex, setActiveScheduleIndex] = useState(0);
  const [addDayDropdownIndex, setAddDayDropdownIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const newGroupedSchedules = groupSchedules(data.schedules);
    setGroupedSchedules(newGroupedSchedules);
    if (activeScheduleIndex >= newGroupedSchedules.length) {
        setActiveScheduleIndex(0);
    }
  }, [data.schedules]);

  const updateParentState = (newGroupedSchedules: GroupedSchedule[]) => {
    const flatSchedules = flattenSchedules(newGroupedSchedules);
    onChange({ ...data, schedules: flatSchedules });
  };
  
  const activeSchedule = groupedSchedules[activeScheduleIndex];

  if (!activeSchedule) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading schedule configuration...</p>
        </div>
      </div>
    );
  }
  
  const handleDayClick = (day: string) => {
    const isAssigned = groupedSchedules.some(g => g.days.includes(day));
    if (isAssigned) return; // Button should be disabled, but this is a safeguard

    const newSchedules = [
        ...groupedSchedules,
        { days: [day], hours: { start: '09:00', end: '17:00' } }
    ];
    setActiveScheduleIndex(newSchedules.length - 1);
    setGroupedSchedules(newSchedules);
    updateParentState(newSchedules);
  };

  const handleRemoveDayFromGroup = (dayToRemove: string, groupIndex: number) => {
    let newSchedules = JSON.parse(JSON.stringify(groupedSchedules));
    
    newSchedules[groupIndex].days = newSchedules[groupIndex].days.filter((d: string) => d !== dayToRemove);

    if (newSchedules[groupIndex].days.length === 0 && newSchedules.length > 1) {
        newSchedules = newSchedules.filter((_: any, i: number) => i !== groupIndex);
        if (activeScheduleIndex >= groupIndex) {
            setActiveScheduleIndex(prev => Math.max(0, prev - 1));
        }
    }
    
    setGroupedSchedules(newSchedules);
    updateParentState(newSchedules);
  };

  const handleAddDayToGroup = (day: string, groupIndex: number) => {
    const newSchedules = JSON.parse(JSON.stringify(groupedSchedules));
    newSchedules[groupIndex].days.push(day);
    setGroupedSchedules(newSchedules);
    updateParentState(newSchedules);
    setAddDayDropdownIndex(null); // Close dropdown
  };

  const handleTimeChange = (type: "start" | "end", value: string) => {
    const newSchedules = JSON.parse(JSON.stringify(groupedSchedules));
    newSchedules[activeScheduleIndex].hours[type] = value;
    setGroupedSchedules(newSchedules);

    if (newSchedules[activeScheduleIndex].days.length > 0) {
      updateParentState(newSchedules);
    }
  };

  const handleAddScheduleGroup = () => {
    const newSchedules = [
      ...groupedSchedules,
      { days: [], hours: { start: '09:00', end: '17:00' } }
    ];
    setActiveScheduleIndex(newSchedules.length - 1);
    setGroupedSchedules(newSchedules);
  };

  const handleRemoveScheduleGroup = (index: number) => {
    let newSchedules = groupedSchedules.filter((_, i) => i !== index);
    if (newSchedules.length === 0) {
        newSchedules = [{ days: [], hours: { start: '09:00', end: '17:00' } }];
    }
    if (activeScheduleIndex >= index) {
        setActiveScheduleIndex(Math.max(0, activeScheduleIndex -1));
    }
    setGroupedSchedules(newSchedules);
    updateParentState(newSchedules);
  };
  
  const handlePresetHours = (start: string, end: string) => {
    const newSchedules = JSON.parse(JSON.stringify(groupedSchedules));
    newSchedules[activeScheduleIndex].hours = { start, end };
    setGroupedSchedules(newSchedules);
    updateParentState(newSchedules);
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    const [hour, minute] = time.split(":");
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHour = h % 12 || 12;
    return `${formattedHour}:${minute} ${ampm}`;
  };

  const allAssignedDays = groupedSchedules.flatMap(s => s.days);

  const handleNext = async () => {
    if (onNext) {
      setIsLoading(true);
      try {
        await onNext();
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Header Section */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Schedule Configuration</h2>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Configure your working schedule, time zones, and availability preferences to match your business requirements.
        </p>
      </div>

      {/* Working Days Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Working Days</h3>
            <p className="text-sm text-gray-500">Select days to create time slots for your schedule</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {workingDays.map(day => {
            const isSelected = allAssignedDays.includes(day);
            
            let buttonClass = 'bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-300 border-2 border-gray-200 shadow-sm hover:shadow-md';
            if (isSelected) {
              buttonClass = 'bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed';
            }

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                disabled={isSelected}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${buttonClass}`}
                aria-label={`Add ${day} to schedule`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Time Slots Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 hover:shadow-md transition-shadow duration-300">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Time Slots</h3>
              <p className="text-sm text-gray-500">Configure working hours for each day group</p>
            </div>
          </div>
          <button
            onClick={handleAddScheduleGroup}
            className="flex items-center gap-2 px-4 py-2.5 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-200 font-medium"
            aria-label="Add new time slot"
          >
            <Plus className="w-4 h-4" />
            Add Time Slot
          </button>
        </div>
        
        <div className="space-y-4">
            {groupedSchedules.map((schedule, index) => (
                <div
                    key={index}
                    onClick={() => setActiveScheduleIndex(index)}
                    className={`rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                      activeScheduleIndex === index 
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 shadow-lg' 
                        : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
                    }`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActiveScheduleIndex(index);
                      }
                    }}
                >
                    <div className="p-6 cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div className="flex-grow space-y-4">
                          <div className="flex flex-wrap items-center gap-2">
                            {schedule.days?.sort((a,b) => workingDays.indexOf(a) - workingDays.indexOf(b)).map(day => (
                                <span key={day} className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 text-sm font-semibold px-4 py-2 rounded-full border border-blue-200 shadow-sm">
                                    {day}
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveDayFromGroup(day, index);
                                        }} 
                                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                                        aria-label={`Remove ${day} from schedule`}
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </span>
                            ))}
                            {schedule.days?.length === 0 && (
                                <span className="text-gray-400 font-medium italic">No days selected</span>
                            )}
                            
                            <div className="relative inline-block">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setAddDayDropdownIndex(addDayDropdownIndex === index ? null : index);
                                    }}
                                    className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
                                    aria-label="Add day to this time slot"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                                {addDayDropdownIndex === index && (
                                    <div className="absolute z-20 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2">
                                        <div className="py-1">
                                            {workingDays.filter(d => !allAssignedDays.includes(d)).length > 0 ? (
                                                workingDays.filter(d => !allAssignedDays.includes(d)).map(day => (
                                                    <a
                                                        key={day}
                                                        href="#"
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddDayToGroup(day, index); }}
                                                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                                    >
                                                        {day}
                                                    </a>
                                                ))
                                            ) : (
                                                <span className="block px-4 py-2 text-sm text-gray-500 italic">No available days</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-lg font-semibold text-gray-900">
                              {formatTime(schedule.hours?.start || '')} - {formatTime(schedule.hours?.end || '')}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                            activeScheduleIndex === index 
                              ? 'bg-blue-200 text-blue-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                              {activeScheduleIndex === index ? 'ACTIVE' : 'EDIT'}
                          </span>
                          
                          {groupedSchedules.length > 1 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveScheduleGroup(index);
                                }}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                aria-label="Remove this time slot"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {activeScheduleIndex === index && (
                      <div className="bg-white rounded-b-2xl p-8 border-t-2 border-blue-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <label htmlFor={`start-time-${index}`} className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Sunrise className="w-4 h-4 text-yellow-500" /> 
                                Start Time
                            </label>
                            <input
                              id={`start-time-${index}`}
                              type="time"
                              value={activeSchedule?.hours?.start || ''}
                              onChange={e => handleTimeChange('start', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                              aria-describedby={`start-time-help-${index}`}
                            />
                            <p id={`start-time-help-${index}`} className="text-xs text-gray-500">Select the start time for this schedule</p>
                          </div>
                          <div className="space-y-3">
                            <label htmlFor={`end-time-${index}`} className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Sunset className="w-4 h-4 text-orange-500" /> 
                                End Time
                            </label>
                            <input
                              id={`end-time-${index}`}
                              type="time"
                              value={activeSchedule?.hours?.end || ''}
                              onChange={e => handleTimeChange('end', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                              aria-describedby={`end-time-help-${index}`}
                            />
                            <p id={`end-time-help-${index}`} className="text-xs text-gray-500">Select the end time for this schedule</p>
                          </div>
                        </div>

                        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                          <div className="text-center">
                            <span className="text-sm font-medium text-blue-800">Working Hours</span>
                            <div className="text-xl font-bold text-blue-900 mt-1">
                              {formatTime(activeSchedule?.hours?.start || '')} - {formatTime(activeSchedule?.hours?.end || '')}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-8">
                          <h4 className="text-sm font-semibold text-gray-700 mb-4 text-center">Quick Presets</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <button 
                              onClick={() => handlePresetHours('09:00', '17:00')} 
                              className="p-4 bg-white border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-blue-50 hover:border-blue-300 flex flex-col items-center gap-2 transition-all duration-200 hover:shadow-md"
                              aria-label="Set schedule to 9 AM - 5 PM"
                            >
                              <Sun className="w-6 h-6 text-orange-400"/>
                              <span className="text-sm font-semibold">9 AM - 5 PM</span>
                            </button>
                            <button 
                              onClick={() => handlePresetHours('07:00', '15:00')} 
                              className="p-4 bg-white border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-blue-50 hover:border-blue-300 flex flex-col items-center gap-2 transition-all duration-200 hover:shadow-md"
                              aria-label="Set schedule to 7 AM - 3 PM"
                            >
                              <Sunrise className="w-6 h-6 text-yellow-400"/>
                              <span className="text-sm font-semibold">Early Shift</span>
                            </button>
                            <button 
                              onClick={() => handlePresetHours('11:00', '19:00')} 
                              className="p-4 bg-white border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-blue-50 hover:border-blue-300 flex flex-col items-center gap-2 transition-all duration-200 hover:shadow-md"
                              aria-label="Set schedule to 11 AM - 7 PM"
                            >
                              <Clock className="w-6 h-6 text-sky-400"/>
                              <span className="text-sm font-semibold">Late Shift</span>
                            </button>
                            <button 
                              onClick={() => handlePresetHours('13:00', '21:00')} 
                              className="p-4 bg-white border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-blue-50 hover:border-blue-300 flex flex-col items-center gap-2 transition-all duration-200 hover:shadow-md"
                              aria-label="Set schedule to 1 PM - 9 PM"
                            >
                              <Moon className="w-6 h-6 text-indigo-400"/>
                              <span className="text-sm font-semibold">Evening</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
            ))}
        </div>
      </div>

      {/* Minimum Hours Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Target className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Minimum Hours</h3>
            <p className="text-sm text-gray-500">Set minimum working hours requirements</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Daily Hours</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                  value={data.minimumHours?.daily || ''} 
                  onChange={e => onChange({...data, minimumHours: {...data.minimumHours, daily: +e.target.value}})} 
                  placeholder="0"
                  min="0"
                  max="24"
                />
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Weekly Hours</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                  value={data.minimumHours?.weekly || ''} 
                  onChange={e => onChange({...data, minimumHours: {...data.minimumHours, weekly: +e.target.value}})} 
                  placeholder="0"
                  min="0"
                  max="168"
                />
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Monthly Hours</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                  value={data.minimumHours?.monthly || ''} 
                  onChange={e => onChange({...data, minimumHours: {...data.minimumHours, monthly: +e.target.value}})} 
                  placeholder="0"
                  min="0"
                  max="744"
                />
            </div>
        </div>
      </div>

      {/* Schedule Flexibility Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-50 rounded-lg">
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Schedule Flexibility</h3>
            <p className="text-sm text-gray-500">Select all applicable flexibility options for your team</p>
          </div>
        </div>
        
        <SelectionList
          options={[
              { value: 'Remote Work Available', label: 'Remote Work Available' },
              { value: 'Flexible Hours', label: 'Flexible Hours' },
              { value: 'weekend-rotation', label: 'Weekend Rotation' },
              { value: 'Night Shift Available', label: 'Night Shift Available' },
              { value: 'Split Shifts', label: 'Split Shifts' },
              { value: 'Part-Time Options', label: 'Part-Time Options' },
              { value: 'Compressed Work Week', label: 'Compressed Work Week' },
              { value: 'Shift Swapping Allowed', label: 'Shift Swapping Allowed' },
          ]}
          selected={data.flexibility}
          onChange={(selected) => onChange({ ...data, flexibility: selected })}
          multiple={true}
          layout="flow"
          size="sm"
        />
        
        {errors.flexibility && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.flexibility.join(', ')}</p>
          </div>
        )}
      </div>

      {/* Time Zones Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Globe className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Time Zones</h3>
            <p className="text-sm text-gray-500">Select all applicable time zones for your operations</p>
          </div>
        </div>
        
        <SelectionList
          options={Object.entries(MAJOR_TIMEZONES).map(([code, info]) => ({
            value: code as TimezoneCode,
            label: `${(info as any).name}`,
            description: ""
          }))}
          selected={data.timeZones}
          onChange={(timeZones) => onChange({ ...data, timeZones })}
          multiple={true}
          layout="flow"
          size="sm"
        />
        
        {errors.timeZones && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.timeZones.join(', ')}</p>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-8">
        <button 
          onClick={onPrevious} 
          disabled={!onPrevious}
          className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="w-5 h-5" />
          Previous
        </button>
        <button 
          onClick={handleNext}
          disabled={isLoading}
          className="flex items-center gap-3 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            <>
              Next
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default ScheduleSection; 