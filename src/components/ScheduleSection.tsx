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
    return <div>Loading...</div>; // Or some other placeholder
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

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Working Days</h3>
        <p className="text-sm text-gray-500 mb-4">Select an unassigned day to create a new time slot.</p>
        <div className="flex flex-wrap gap-2">
          {workingDays.map(day => {
            const isSelected = allAssignedDays.includes(day);
            
            let buttonClass = 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300';
            if (isSelected) {
              buttonClass = 'bg-gray-200 text-gray-400 cursor-not-allowed';
            }

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                disabled={isSelected}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${buttonClass}`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Time Slots</h3>
          <button
            onClick={handleAddScheduleGroup}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Slot
          </button>
        </div>
        <div className="space-y-4">
            {groupedSchedules.map((schedule, index) => (
                <div
                    key={index}
                    onClick={() => setActiveScheduleIndex(index)}
                    className={`rounded-xl border transition-all ${activeScheduleIndex === index ? 'bg-blue-50 border-blue-300 shadow-md' : 'bg-white hover:bg-gray-50 border-gray-200'}`}
                >
                    <div className="p-4 cursor-pointer flex justify-between items-center">
                      <div className="flex-grow">
                          <div className="flex flex-wrap items-center gap-2">
                            {schedule.days?.sort((a,b) => workingDays.indexOf(a) - workingDays.indexOf(b)).map(day => (
                                <span key={day} className="flex items-center gap-1.5 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-1 rounded-full">
                                    {day}
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveDayFromGroup(day, index);
                                        }} 
                                        className="text-blue-500 hover:text-blue-700"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </span>
                            ))}
                            {schedule.days?.length === 0 && (
                                <p className="font-semibold text-gray-500">No days selected</p>
                            )}
                             <div className="relative inline-block">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setAddDayDropdownIndex(addDayDropdownIndex === index ? null : index);
                                    }}
                                    className="p-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-full"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                                {addDayDropdownIndex === index && (
                                    <div className="absolute z-20 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200">
                                        <div className="py-1">
                                            {workingDays.filter(d => !allAssignedDays.includes(d)).length > 0 ? (
                                                workingDays.filter(d => !allAssignedDays.includes(d)).map(day => (
                                                    <a
                                                        key={day}
                                                        href="#"
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddDayToGroup(day, index); }}
                                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    >
                                                        {day}
                                                    </a>
                                                ))
                                            ) : (
                                                <span className="block px-4 py-2 text-sm text-gray-500">No available days</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">{formatTime(schedule.hours?.start || '')} - {formatTime(schedule.hours?.end || '')}</p>
                      </div>
                      <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${activeScheduleIndex === index ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                              {activeScheduleIndex === index ? 'Active' : 'Edit'}
                          </span>
                           {groupedSchedules.length > 1 &&
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveScheduleGroup(index);
                                }}
                                className="p-1 text-red-500 hover:bg-red-100 rounded-full"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                           }
                      </div>
                    </div>

                    {activeScheduleIndex === index && (
                      <div className="bg-white rounded-b-xl p-6 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label htmlFor={`start-time-${index}`} className="text-sm font-medium text-gray-700 flex items-center">
                                <Sunrise className="w-4 h-4 mr-2 text-yellow-500" /> Start Time
                            </label>
                            <input
                              id={`start-time-${index}`}
                              type="time"
                              value={activeSchedule?.hours?.start || ''}
                              onChange={e => handleTimeChange('start', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor={`end-time-${index}`} className="text-sm font-medium text-gray-700 flex items-center">
                                <Sunset className="w-4 h-4 mr-2 text-orange-500" /> End Time
                            </label>
                            <input
                              id={`end-time-${index}`}
                              type="time"
                              value={activeSchedule?.hours?.end || ''}
                              onChange={e => handleTimeChange('end', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200 text-center text-gray-600 font-medium">
                            Working Hours: {formatTime(activeSchedule?.hours?.start || '')} - {formatTime(activeSchedule?.hours?.end || '')}
                        </div>
                        
                        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <button onClick={() => handlePresetHours('09:00', '17:00')} className="p-3 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 flex flex-col items-center gap-1">
                                <Sun className="w-5 h-5 text-orange-400"/>
                                <span className="text-xs font-medium">9-5</span>
                            </button>
                            <button onClick={() => handlePresetHours('07:00', '15:00')} className="p-3 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 flex flex-col items-center gap-1">
                                <Sunrise className="w-5 h-5 text-yellow-400"/>
                                <span className="text-xs font-medium">Early</span>
                            </button>
                            <button onClick={() => handlePresetHours('11:00', '19:00')} className="p-3 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 flex flex-col items-center gap-1">
                                <Clock className="w-5 h-5 text-sky-400"/>
                                <span className="text-xs font-medium">Late</span>
                            </button>
                            <button onClick={() => handlePresetHours('13:00', '21:00')} className="p-3 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 flex flex-col items-center gap-1">
                                <Moon className="w-5 h-5 text-indigo-400"/>
                                <span className="text-xs font-medium">Evening</span>
                            </button>
                        </div>
                      </div>
                    )}
                </div>
            ))}
        </div>
      </div>

      <div className="pt-8 border-t">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Minimum Hours</h3>
        <div className="grid grid-cols-3 gap-3">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Daily</label>
                <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md" value={data.minimumHours?.daily || ''} onChange={e => onChange({...data, minimumHours: {...data.minimumHours, daily: +e.target.value}})} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weekly</label>
                <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md" value={data.minimumHours?.weekly || ''} onChange={e => onChange({...data, minimumHours: {...data.minimumHours, weekly: +e.target.value}})} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly</label>
                <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md" value={data.minimumHours?.monthly || ''} onChange={e => onChange({...data, minimumHours: {...data.minimumHours, monthly: +e.target.value}})} />
            </div>
        </div>
      </div>

      <div className="pt-8 border-t">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule Flexibility</h3>
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
        <p className="mt-2 text-sm text-gray-500">
          Select all applicable flexibility options.
        </p>
        {errors.flexibility && (
          <p className="mt-1 text-sm text-red-600">{errors.flexibility.join(', ')}</p>
        )}
      </div>

      <div className="pt-8 border-t">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Time Zones</h3>
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
        <p className="mt-2 text-sm text-gray-500">
          Select all applicable time zones.
        </p>
        {errors.timeZones && (
          <p className="mt-1 text-sm text-red-600">{errors.timeZones.join(', ')}</p>
        )}
      </div>

      {(onNext || onPrevious) && (
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          {onPrevious && (
            <button
              onClick={onPrevious}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            >
              <ArrowLeft className="w-5 h-5" />
              Previous
            </button>
          )}
          {onNext && (
            <button
              onClick={onNext}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ScheduleSection; 