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
  Globe
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

const workingDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const groupSchedules = (schedules: DaySchedule[]): GroupedSchedule[] => {
  if (!schedules || schedules.length === 0) {
    return [{ days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], hours: { start: '09:00', end: '17:00' } }];
  }
  const grouped = groupSchedulesUtil(schedules);
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
  
  useEffect(() => {
    setGroupedSchedules(groupSchedules(data.schedules));
    if (activeScheduleIndex >= groupSchedules(data.schedules).length) {
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
    let newSchedules = JSON.parse(JSON.stringify(groupedSchedules));

    const groupIndex = newSchedules.findIndex((g: GroupedSchedule) => g.days.includes(day));

    if (groupIndex !== -1) {
        // Day is in a group, remove it
        newSchedules[groupIndex].days = newSchedules[groupIndex].days.filter((d:string) => d !== day);

        // If the group becomes empty, remove the group
        if (newSchedules[groupIndex].days.length === 0 && newSchedules.length > 1) {
            newSchedules = newSchedules.filter((_: GroupedSchedule, i: number) => i !== groupIndex);
            setActiveScheduleIndex(prev => Math.max(0, prev -1));
        }
    } else {
        // Day is unassigned, create a new group for it
        newSchedules.push({ days: [day], hours: { start: '09:00', end: '17:00' } });
        setActiveScheduleIndex(newSchedules.length - 1);
    }
    
    setGroupedSchedules(newSchedules);
    updateParentState(newSchedules);
  };

  const handleTimeChange = (type: "start" | "end", value: string) => {
    const newSchedules = JSON.parse(JSON.stringify(groupedSchedules));
    newSchedules[activeScheduleIndex].hours[type] = value;
    setGroupedSchedules(newSchedules);
    updateParentState(newSchedules);
  };

  const handleAddScheduleGroup = () => {
    const newSchedules = [
      ...groupedSchedules,
      { days: [], hours: { start: '09:00', end: '17:00' } }
    ];
    setActiveScheduleIndex(newSchedules.length - 1);
    setGroupedSchedules(newSchedules);
    updateParentState(newSchedules);
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
        <p className="text-sm text-gray-500 mb-4">Select an unassigned day to create a new time slot, or click a selected day to remove it.</p>
        <div className="flex flex-wrap gap-2">
          {workingDays.map(day => {
            const isSelected = allAssignedDays.includes(day);
            
            let buttonClass = 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300';
            if (isSelected) {
              buttonClass = 'bg-blue-600 text-white shadow';
            }

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${buttonClass}`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Time Slots</h3>
        <div className="space-y-4">
            {groupedSchedules.map((schedule, index) => (
                <div
                    key={index}
                    onClick={() => setActiveScheduleIndex(index)}
                    className={`rounded-xl border transition-all ${activeScheduleIndex === index ? 'bg-blue-50 border-blue-300 shadow-md' : 'bg-white hover:bg-gray-50 border-gray-200'}`}
                >
                    <div className="p-4 cursor-pointer flex justify-between items-center">
                      <div>
                          <p className="font-semibold text-gray-800">{schedule.days?.sort((a,b) => workingDays.indexOf(a) - workingDays.indexOf(b)).join(', ') || 'No days selected'}</p>
                          <p className="text-sm text-gray-600">{formatTime(schedule.hours?.start || '')} - {formatTime(schedule.hours?.end || '')}</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t">
        <div>
          <label className="block text-lg font-medium text-gray-900 mb-4">
            Flexibility
          </label>
          <SelectionList
            options={[
                { value: 'full-remote', label: 'Full Remote' },
                { value: 'hybrid', label: 'Hybrid' },
                { value: 'on-site', label: 'On-site' },
                { value: 'flexible-hours', label: 'Flexible Hours' },
            ]}
            selected={data.flexibility}
            onChange={(selected) => onChange({ ...data, flexibility: selected })}
          />
        </div>
        <div>
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