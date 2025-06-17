import React, { useState, useEffect } from "react";
import { InfoText } from "./InfoText";
import { predefinedOptions } from "../lib/guidance";
import { SelectionList } from "./SelectionList";
import {
  Clock,
  Calendar,
  AlertCircle,
  Sunrise,
  Sunset,
  Sun,
  Moon,
  Globe2,
  ArrowLeft,
  ArrowRight,
  Save,
  Brain,
  Globe,
  PenSquare,
  Plus,
  Trash2
} from "lucide-react";
import { MAJOR_TIMEZONES, TimezoneCode, analyzeTimezones, suggestTimezones, generateWorkingHoursSuggestions, formatTimeRange } from "../lib/ai";

interface TimeRange {
  start: string;
  end: string;
}

interface ScheduleSectionProps {
  data: {
    schedules: {
      day: string;
      hours: {
        start: string;
        end: string;
      };
    }[];
    timeZones: TimezoneCode[];
    flexibility: string[];
    minimumHours: {
      daily?: number;
      weekly?: number;
      monthly?: number;
    };
    availability?: {
      schedule: {
        day: string;
        hours: {
          start: string;
          end: string;
        };
      }[];
      timeZones: TimezoneCode[];
      flexibility: string[];
      minimumHours: {
        daily?: number;
        weekly?: number;
        monthly?: number;
      };
    };
  };
  onChange: (data: any) => void;
  errors: { [key: string]: string[] };
  hasBaseCommission?: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
  onSave?: () => void;
  onAIAssist?: () => void;
  currentSection: string;
}

interface TimezoneOption {
  value: TimezoneCode;
  label: string;
  description: string;
}

export function ScheduleSection({
  data = {
    schedules: [],
    timeZones: [],
    flexibility: [],
    minimumHours: {
      daily: undefined,
      weekly: undefined,
      monthly: undefined
    },
    availability: {
      schedule: [],
      timeZones: [],
      flexibility: [],
      minimumHours: {
        daily: undefined,
        weekly: undefined,
        monthly: undefined
      }
    }
  },
  onChange,
  errors = {},
  hasBaseCommission = false,
  onNext,
  onPrevious,
  onSave,
  onAIAssist,
  currentSection = 'schedule'
}: ScheduleSectionProps) {
  const [startTime, setStartTime] = useState(data.schedules?.[0]?.hours?.start || "09:00");
  const [endTime, setEndTime] = useState(data.schedules?.[0]?.hours?.end || "17:00");
  const [selectedDay, setSelectedDay] = useState(data.schedules?.[0]?.day || "Monday");
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [hoursEdit, setHoursEdit] = useState({
    daily: data?.minimumHours?.daily ?? '',
    weekly: data?.minimumHours?.weekly ?? '',
    monthly: data?.minimumHours?.monthly ?? '',
  });
  const [isAddingSchedule, setIsAddingSchedule] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    day: '',
    start: '09:00',
    end: '17:00'
  });
  const [scheduleError, setScheduleError] = useState('');
  const [editingScheduleDay, setEditingScheduleDay] = useState<string | null>(null);
  const [editSchedule, setEditSchedule] = useState({
    start: '',
    end: ''
  });
  const [availabilityStartTime, setAvailabilityStartTime] = useState(data.availability?.schedule?.[0]?.hours?.start || "09:00");
  const [availabilityEndTime, setAvailabilityEndTime] = useState(data.availability?.schedule?.[0]?.hours?.end || "17:00");
  const [selectedAvailabilityDay, setSelectedAvailabilityDay] = useState(data.availability?.schedule?.[0]?.day || "Monday");
  const [isAddingAvailability, setIsAddingAvailability] = useState(false);
  const [newAvailability, setNewAvailability] = useState({
    day: '',
    start: '09:00',
    end: '17:00'
  });
  const [availabilityError, setAvailabilityError] = useState('');
  const [editingAvailabilityDay, setEditingAvailabilityDay] = useState<string | null>(null);
  const [editAvailability, setEditAvailability] = useState({
    start: '',
    end: ''
  });
  const [timezoneAnalysis, setTimezoneAnalysis] = useState<any>(null);
  const [timezoneSuggestions, setTimezoneSuggestions] = useState<any[]>([]);
  const [workingHoursSuggestions, setWorkingHoursSuggestions] = useState<any[]>([]);

  const handleTimeChange = (type: "start" | "end", value: string) => {
    if (type === "start") {
      setStartTime(value);
      const updatedSchedules = data.schedules.map(schedule =>
        schedule.day === selectedDay ? { ...schedule, hours: { ...schedule.hours, start: value } } : schedule
      );
      
      const updatedData = {
        ...data,
        schedules: updatedSchedules
      };

      // Si availability existe, le mettre à jour aussi
      if (data.availability) {
        updatedData.availability = {
          ...data.availability,
          schedule: updatedSchedules
        };
      }
      
      onChange(updatedData);
    } else {
      setEndTime(value);
      const updatedSchedules = data.schedules.map(schedule =>
        schedule.day === selectedDay ? { ...schedule, hours: { ...schedule.hours, end: value } } : schedule
      );
      
      const updatedData = {
        ...data,
        schedules: updatedSchedules
      };

      // Si availability existe, le mettre à jour aussi
      if (data.availability) {
        updatedData.availability = {
          ...data.availability,
          schedule: updatedSchedules
        };
      }
      
      onChange(updatedData);
    }
  };

  const handleAddSchedule = () => {
    setIsAddingSchedule(true);
  };

  const validateScheduleTime = (start: string, end: string) => {
    if (start && end) {
      const startTime = new Date(`2000-01-01T${start}`);
      const endTime = new Date(`2000-01-01T${end}`);
      return endTime > startTime;
    }
    return true;
  };

  const handleSaveNewSchedule = () => {
    if (!validateScheduleTime(newSchedule.start, newSchedule.end)) {
      setScheduleError('End time must be after start time');
      return;
    }

    if (newSchedule.day) {
      setScheduleError('');
      const newScheduleData = {
        day: newSchedule.day,
        hours: {
          start: newSchedule.start,
          end: newSchedule.end
        }
      };
      
      // Update schedules
      const updatedSchedules = [...data.schedules, newScheduleData];
      
      // Update availability schedule if not already present
      if (!predefinedOptions.availability.schedule.includes(newSchedule.day)) {
        predefinedOptions.availability.schedule.push(newSchedule.day);
      }
      
      const updatedData = {
        ...data,
        schedules: updatedSchedules
      };

      // Update availability schedule as well
      if (data.availability) {
        updatedData.availability = {
          ...data.availability,
          schedule: updatedSchedules
        };
      }
      
      onChange(updatedData);
      
      setSelectedDay(newSchedule.day);
      setStartTime(newSchedule.start);
      setEndTime(newSchedule.end);
      setIsAddingSchedule(false);
      setNewSchedule({
        day: '',
        start: '09:00',
        end: '17:00'
      });
    }
  };

  const handleCancelNewSchedule = () => {
    setIsAddingSchedule(false);
    setNewSchedule({
      day: '',
      start: '09:00',
      end: '17:00'
    });
  };

  const handleRemoveSchedule = (dayToRemove: string) => {
    const newSchedules = data.schedules.filter(schedule => schedule.day !== dayToRemove);
    
    // Remove from availability schedule if no other schedules use this day
    if (!newSchedules.some(schedule => schedule.day === dayToRemove)) {
      const index = predefinedOptions.availability.schedule.indexOf(dayToRemove);
      if (index > -1) {
        predefinedOptions.availability.schedule.splice(index, 1);
      }
    }
    
    const updatedData = {
      ...data,
      schedules: newSchedules
    };

    // Update availability schedule as well
    if (data.availability) {
      updatedData.availability = {
        ...data.availability,
        schedule: newSchedules
      };
    }
    
    onChange(updatedData);

    if (selectedDay === dayToRemove) {
      const nextSchedule = newSchedules[0];
      if (nextSchedule) {
        setSelectedDay(nextSchedule.day);
        setStartTime(nextSchedule.hours.start);
        setEndTime(nextSchedule.hours.end);
      }
    }
  };

  const handlePresetHours = (start: string, end: string) => {
    setStartTime(start);
    setEndTime(end);
    onChange({
      ...data,
      schedules: data.schedules.map(schedule =>
        schedule.day === selectedDay ? { ...schedule, hours: { start, end } } : schedule
      )
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    return `${hours}h${minutes}`;
  };

  const formatTimeFr = (time: string) => {
    if (!time) return '';
    const [h, m] = time.split(':');
    return `${h}h${m}`;
  };

  const weekdays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const handleMinimumHoursChange = (
    period: "daily" | "weekly" | "monthly",
    value: string
  ) => {
    const numericValue =
      value === "" ? undefined : Math.max(0, parseInt(value) || 0);
    const maxValues = {
      daily: 24,
      weekly: 168,
      monthly: 744,
    };

    const limitedValue =
      numericValue !== undefined
        ? Math.min(numericValue, maxValues[period])
        : undefined;

    onChange({
      ...data,
      minimumHours: {
        ...data.minimumHours,
        [period]: limitedValue,
      },
    });
  };

  const handleNewScheduleChange = (field: 'start' | 'end', value: string) => {
    const updatedSchedule = { ...newSchedule, [field]: value };
    setNewSchedule(updatedSchedule);
    
    if (validateScheduleTime(updatedSchedule.start, updatedSchedule.end)) {
      setScheduleError('');
    } else {
      setScheduleError('End time must be after start time');
    }
  };

  const handleEditSchedule = (schedule: { day: string, hours: { start: string, end: string } }) => {
    setEditingScheduleDay(schedule.day);
    setEditSchedule({
      start: schedule.hours.start,
      end: schedule.hours.end
    });
  };

  const handleSaveEdit = () => {
    if (!validateScheduleTime(editSchedule.start, editSchedule.end)) {
      setScheduleError('End time must be after start time');
      return;
    }

    if (editingScheduleDay) {
      setScheduleError('');
      const updatedSchedules = data.schedules.map(schedule => 
        schedule.day === editingScheduleDay
          ? {
              ...schedule,
              hours: {
                start: editSchedule.start,
                end: editSchedule.end
              }
            }
          : schedule
      );

      // Ensure the day is in availability schedule
      if (!predefinedOptions.availability.schedule.includes(editingScheduleDay)) {
        predefinedOptions.availability.schedule.push(editingScheduleDay);
      }

      const updatedData = {
        ...data,
        schedules: updatedSchedules
      };

      // Update availability schedule as well
      if (data.availability) {
        updatedData.availability = {
          ...data.availability,
          schedule: updatedSchedules
        };
      }

      onChange(updatedData);

      setEditingScheduleDay(null);
      setEditSchedule({ start: '', end: '' });
    }
  };

  const handleCancelEdit = () => {
    setEditingScheduleDay(null);
    setEditSchedule({ start: '', end: '' });
    setScheduleError('');
  };

  const handleEditScheduleChange = (field: 'start' | 'end', value: string) => {
    const updatedSchedule = { ...editSchedule, [field]: value };
    setEditSchedule(updatedSchedule);
    
    if (validateScheduleTime(updatedSchedule.start, updatedSchedule.end)) {
      setScheduleError('');
    } else {
      setScheduleError('End time must be after start time');
    }
  };

  const handleAvailabilityTimeChange = (type: "start" | "end", value: string) => {
    if (!data.availability) return;

    if (type === "start") {
      setAvailabilityStartTime(value);
      const updatedAvailability = data.availability.schedule.map(schedule =>
        schedule.day === selectedAvailabilityDay ? { ...schedule, hours: { ...schedule.hours, start: value } } : schedule
      );
      
      onChange({
        ...data,
        availability: {
          ...data.availability,
          schedule: updatedAvailability
        }
      });
    } else {
      setAvailabilityEndTime(value);
      const updatedAvailability = data.availability.schedule.map(schedule =>
        schedule.day === selectedAvailabilityDay ? { ...schedule, hours: { ...schedule.hours, end: value } } : schedule
      );
      
      onChange({
        ...data,
        availability: {
          ...data.availability,
          schedule: updatedAvailability
        }
      });
    }
  };

  const handleAddAvailability = () => {
    setIsAddingAvailability(true);
  };

  const handleSaveNewAvailability = () => {
    if (!validateScheduleTime(newAvailability.start, newAvailability.end)) {
      setAvailabilityError('End time must be after start time');
      return;
    }

    if (newAvailability.day) {
      setAvailabilityError('');
      const newAvailabilityData = {
        day: newAvailability.day,
        hours: {
          start: newAvailability.start,
          end: newAvailability.end
        }
      };
      
      const updatedAvailability = [...(data.availability?.schedule || []), newAvailabilityData];
      
      onChange({
        ...data,
        availability: {
          ...data.availability,
          schedule: updatedAvailability
        }
      });
      
      setSelectedAvailabilityDay(newAvailability.day);
      setAvailabilityStartTime(newAvailability.start);
      setAvailabilityEndTime(newAvailability.end);
      setIsAddingAvailability(false);
      setNewAvailability({
        day: '',
        start: '09:00',
        end: '17:00'
      });
    }
  };

  const handleCancelNewAvailability = () => {
    setIsAddingAvailability(false);
    setNewAvailability({
      day: '',
      start: '09:00',
      end: '17:00'
    });
  };

  const handleRemoveAvailability = (dayToRemove: string) => {
    if (!data.availability) return;

    const newAvailability = data.availability.schedule.filter(schedule => schedule.day !== dayToRemove);
    
    onChange({
      ...data,
      availability: {
        ...data.availability,
        schedule: newAvailability
      }
    });

    if (selectedAvailabilityDay === dayToRemove) {
      const nextAvailability = newAvailability[0];
      if (nextAvailability) {
        setSelectedAvailabilityDay(nextAvailability.day);
        setAvailabilityStartTime(nextAvailability.hours.start);
        setAvailabilityEndTime(nextAvailability.hours.end);
      }
    }
  };

  const handleEditAvailability = (availability: { day: string, hours: { start: string, end: string } }) => {
    setEditingAvailabilityDay(availability.day);
    setEditAvailability({
      start: availability.hours.start,
      end: availability.hours.end
    });
  };

  const handleSaveEditAvailability = () => {
    if (!validateScheduleTime(editAvailability.start, editAvailability.end)) {
      setAvailabilityError('End time must be after start time');
      return;
    }

    if (editingAvailabilityDay && data.availability) {
      setAvailabilityError('');
      const updatedAvailability = data.availability.schedule.map(schedule => 
        schedule.day === editingAvailabilityDay
          ? {
              ...schedule,
              hours: {
                start: editAvailability.start,
                end: editAvailability.end
              }
            }
          : schedule
      );

      onChange({
        ...data,
        availability: {
          ...data.availability,
          schedule: updatedAvailability
        }
      });

      setEditingAvailabilityDay(null);
      setEditAvailability({ start: '', end: '' });
    }
  };

  const handleCancelEditAvailability = () => {
    setEditingAvailabilityDay(null);
    setEditAvailability({ start: '', end: '' });
    setAvailabilityError('');
  };

  const handleEditAvailabilityChange = (field: 'start' | 'end', value: string) => {
    const updatedAvailability = { ...editAvailability, [field]: value };
    setEditAvailability(updatedAvailability);
    
    if (validateScheduleTime(updatedAvailability.start, updatedAvailability.end)) {
      setAvailabilityError('');
    } else {
      setAvailabilityError('End time must be after start time');
    }
  };

  useEffect(() => {
    if (data?.timeZones?.length > 0) {
      try {
        // Convert string timezones to TimezoneCode
        const validTimezones = data.timeZones.filter((tz): tz is TimezoneCode => 
          Object.keys(MAJOR_TIMEZONES).includes(tz)
        );
        
        if (validTimezones.length > 0) {
          const analysis = analyzeTimezones(validTimezones);
          setTimezoneAnalysis(analysis);
          
          // Get suggestions based on the first timezone
          const suggestions = suggestTimezones(validTimezones[0]);
          setTimezoneSuggestions(suggestions);

          // Get working hours suggestions
          const hoursSuggestions = generateWorkingHoursSuggestions(validTimezones, 'Sales');
          setWorkingHoursSuggestions(hoursSuggestions);
        }
      } catch (error) {
        console.error('Error analyzing timezones:', error);
      }
    }
  }, [data?.timeZones]);

  useEffect(() => {
    setHoursEdit({
      daily: data?.minimumHours?.daily ?? '',
      weekly: data?.minimumHours?.weekly ?? '',
      monthly: data?.minimumHours?.monthly ?? '',
    });
  }, [data]);

  const baseOptions = predefinedOptions.availability.timeZones;
  const selectedFlex = data?.flexibility || [];
  const allOptions = [
    ...baseOptions,
    ...selectedFlex.filter(opt => !baseOptions.includes(opt))
  ].map(opt => typeof opt === 'string' ? { value: opt, label: opt } : opt);

  return (
    <div className="space-y-6">
      <InfoText>
        Define the working schedule and time zone coverage.
        {hasBaseCommission && ' Minimum hours are required for base commission.'}
      </InfoText>

      <div className="space-y-6">
        {/* Working Days */}
        <div className="bg-white rounded-xl border border-blue-100 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium text-gray-900">Working Days</h3>
              </div>
              <button
                onClick={handleAddSchedule}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Add Day</span>
              </button>
            </div>
          </div>
          <div className="p-4">
            <div className="grid gap-4">
              {data.schedules.map((schedule) => (
                <div
                  key={schedule.day}
                  className={`p-4 rounded-lg border ${
                    selectedDay === schedule.day
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {editingScheduleDay === schedule.day ? (
                    <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="font-medium text-gray-900">{schedule.day}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <div className="flex items-center gap-2">
                              <Sunrise className="w-4 h-4 text-orange-500" />
                              <span>Start Time</span>
                            </div>
                          </label>
                          <input
                            type="time"
                            value={editSchedule.start}
                            onChange={(e) => {
                              const updatedSchedule = { ...editSchedule, start: e.target.value };
                              setEditSchedule(updatedSchedule);
                              if (validateScheduleTime(updatedSchedule.start, updatedSchedule.end)) {
                                setScheduleError('');
                              } else {
                                setScheduleError('End time must be after start time');
                              }
                            }}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <div className="flex items-center gap-2">
                              <Sunset className="w-4 h-4 text-indigo-500" />
                              <span>End Time</span>
                            </div>
                          </label>
                          <input
                            type="time"
                            value={editSchedule.end}
                            onChange={(e) => {
                              const updatedSchedule = { ...editSchedule, end: e.target.value };
                              setEditSchedule(updatedSchedule);
                              if (validateScheduleTime(updatedSchedule.start, updatedSchedule.end)) {
                                setScheduleError('');
                              } else {
                                setScheduleError('End time must be after start time');
                              }
                            }}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {scheduleError && (
                        <div className="text-sm text-red-600">
                          {scheduleError}
                        </div>
                      )}

                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingScheduleDay(null);
                            setEditSchedule({ start: '', end: '' });
                            setScheduleError('');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (!scheduleError) {
                              const updatedSchedules = data.schedules.map(s => 
                                s.day === schedule.day
                                  ? { ...s, hours: { start: editSchedule.start, end: editSchedule.end } }
                                  : s
                              );
                              onChange({
                                ...data,
                                schedules: updatedSchedules
                              });
                              setEditingScheduleDay(null);
                              setEditSchedule({ start: '', end: '' });
                            }
                          }}
                          disabled={!!scheduleError}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="font-medium text-gray-900">{schedule.day}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                          {formatTimeFr(schedule.hours.start)} - {formatTimeFr(schedule.hours.end)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingScheduleDay(schedule.day);
                            setEditSchedule({
                              start: schedule.hours.start,
                              end: schedule.hours.end
                            });
                          }}
                          className="p-1 rounded-full hover:bg-blue-100 text-blue-500"
                        >
                          <PenSquare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveSchedule(schedule.day);
                          }}
                          className="p-1 rounded-full hover:bg-red-100 text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {isAddingSchedule && (
                <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Day
                      </label>
                      <select
                        value={newSchedule.day}
                        onChange={(e) => setNewSchedule({ ...newSchedule, day: e.target.value })}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select a day</option>
                        {weekdays
                          .filter(day => !data.schedules.find(s => s.day === day))
                          .map(day => (
                            <option key={day} value={day}>{day}</option>
                          ))}
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <div className="flex items-center gap-2">
                            <Sunrise className="w-4 h-4 text-orange-500" />
                            <span>Start Time</span>
                          </div>
                        </label>
                        <input
                          type="time"
                          value={newSchedule.start}
                          onChange={(e) => handleNewScheduleChange('start', e.target.value)}
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <div className="flex items-center gap-2">
                            <Sunset className="w-4 h-4 text-indigo-500" />
                            <span>End Time</span>
                          </div>
                        </label>
                        <input
                          type="time"
                          value={newSchedule.end}
                          onChange={(e) => handleNewScheduleChange('end', e.target.value)}
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {scheduleError && (
                      <div className="mt-2 text-sm text-red-600">
                        {scheduleError}
                      </div>
                    )}

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={handleCancelNewSchedule}
                        className="px-4 py-2 rounded-lg bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveNewSchedule}
                        disabled={!newSchedule.day || !!scheduleError}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Schedule
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Availability Days */}
        <div className="bg-white rounded-xl border border-blue-100 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium text-gray-900">Availability Days</h3>
              </div>
              <button
                onClick={handleAddAvailability}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Add Day</span>
              </button>
            </div>
          </div>
          <div className="p-4">
            <div className="grid gap-4">
              {data.availability?.schedule.map((availability) => (
                <div
                  key={availability.day}
                  className={`p-4 rounded-lg border ${
                    selectedAvailabilityDay === availability.day
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {editingAvailabilityDay === availability.day ? (
                    <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="font-medium text-gray-900">{availability.day}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <div className="flex items-center gap-2">
                              <Sunrise className="w-4 h-4 text-orange-500" />
                              <span>Start Time</span>
                            </div>
                          </label>
                          <input
                            type="time"
                            value={editAvailability.start}
                            onChange={(e) => handleEditAvailabilityChange('start', e.target.value)}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <div className="flex items-center gap-2">
                              <Sunset className="w-4 h-4 text-indigo-500" />
                              <span>End Time</span>
                            </div>
                          </label>
                          <input
                            type="time"
                            value={editAvailability.end}
                            onChange={(e) => handleEditAvailabilityChange('end', e.target.value)}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {availabilityError && (
                        <div className="text-sm text-red-600">
                          {availabilityError}
                        </div>
                      )}

                      <div className="flex justify-end gap-2">
                        <button
                          onClick={handleCancelEditAvailability}
                          className="px-3 py-1.5 rounded-lg bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveEditAvailability}
                          disabled={!!availabilityError}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="font-medium text-gray-900">{availability.day}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                          {formatTimeFr(availability.hours.start)} - {formatTimeFr(availability.hours.end)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditAvailability(availability);
                          }}
                          className="p-1 rounded-full hover:bg-blue-100 text-blue-500"
                        >
                          <PenSquare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveAvailability(availability.day);
                          }}
                          className="p-1 rounded-full hover:bg-red-100 text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {isAddingAvailability && (
                <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Day
                      </label>
                      <select
                        value={newAvailability.day}
                        onChange={(e) => setNewAvailability({ ...newAvailability, day: e.target.value })}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select a day</option>
                        {weekdays
                          .filter(day => !data.availability?.schedule.find(a => a.day === day))
                          .map(day => (
                            <option key={day} value={day}>{day}</option>
                          ))}
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <div className="flex items-center gap-2">
                            <Sunrise className="w-4 h-4 text-orange-500" />
                            <span>Start Time</span>
                          </div>
                        </label>
                        <input
                          type="time"
                          value={newAvailability.start}
                          onChange={(e) => setNewAvailability({ ...newAvailability, start: e.target.value })}
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <div className="flex items-center gap-2">
                            <Sunset className="w-4 h-4 text-indigo-500" />
                            <span>End Time</span>
                          </div>
                        </label>
                        <input
                          type="time"
                          value={newAvailability.end}
                          onChange={(e) => setNewAvailability({ ...newAvailability, end: e.target.value })}
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {availabilityError && (
                      <div className="mt-2 text-sm text-red-600">
                        {availabilityError}
                      </div>
                    )}

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={handleCancelNewAvailability}
                        className="px-4 py-2 rounded-lg bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveNewAvailability}
                        disabled={!newAvailability.day || !!availabilityError}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Availability
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Working Hours */}
        {/* {data.schedules.length > 0 && (
          <div className="bg-white rounded-xl border border-blue-100 overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium text-gray-900">Working Hours for {selectedDay}</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Sunrise className="w-4 h-4 text-orange-500" />
                      <span>Start Time</span>
                    </div>
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => handleTimeChange('start', e.target.value)}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Sunset className="w-4 h-4 text-indigo-500" />
                      <span>End Time</span>
                    </div>
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => handleTimeChange('end', e.target.value)}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-4">
                <button
                  onClick={() => handlePresetHours('09:00', '17:00')}
                  className="flex flex-col items-center gap-1 p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <Sun className="w-5 h-5 text-orange-500" />
                  <span className="text-xs text-gray-600">9-5</span>
                </button>

                <button
                  onClick={() => handlePresetHours('08:00', '16:00')}
                  className="flex flex-col items-center gap-1 p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <Sunrise className="w-5 h-5 text-blue-500" />
                  <span className="text-xs text-gray-600">Early</span>
                </button>

                <button
                  onClick={() => handlePresetHours('10:00', '18:00')}
                  className="flex flex-col items-center gap-1 p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <Clock className="w-5 h-5 text-purple-500" />
                  <span className="text-xs text-gray-600">Late</span>
                </button>

                <button
                  onClick={() => handlePresetHours('13:00', '21:00')}
                  className="flex flex-col items-center gap-1 p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <Moon className="w-5 h-5 text-indigo-500" />
                  <span className="text-xs text-gray-600">Evening</span>
                </button>
              </div>
            </div>
          </div>
        )} */}

        {/* Minimum Hours Requirements */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4 relative">
          {/* Bouton stylo en haut à droite */}
          <button
            onClick={() => setIsEditingHours(true)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white border border-blue-200 shadow hover:bg-blue-50 hover:text-blue-700 transition"
            title="Edit minimum hours"
            style={{ display: isEditingHours ? 'none' : 'block' }}
          >
            <PenSquare className="w-5 h-5" />
          </button>
          {isEditingHours && (
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => {
                  onChange({
                    ...data,
                    minimumHours: {
                      daily: hoursEdit.daily === '' ? undefined : Number(hoursEdit.daily),
                      weekly: hoursEdit.weekly === '' ? undefined : Number(hoursEdit.weekly),
                      monthly: hoursEdit.monthly === '' ? undefined : Number(hoursEdit.monthly),
                    },
                  });
                  setIsEditingHours(false);
                }}
                className="p-2 rounded-full bg-green-100 border border-green-200 hover:bg-green-200"
                title="Valider"
              >
                <span className="text-green-700 font-bold">✔</span>
              </button>
              <button
                onClick={() => {
                  setHoursEdit({
                    daily: data?.minimumHours?.daily ?? '',
                    weekly: data?.minimumHours?.weekly ?? '',
                    monthly: data?.minimumHours?.monthly ?? '',
                  });
                  setIsEditingHours(false);
                }}
                className="p-2 rounded-full bg-red-100 border border-red-200 hover:bg-red-200"
                title="Annuler"
              >
                <span className="text-red-700 font-bold">✖</span>
              </button>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-900">
            <Clock className="w-5 h-5" />
            <h3 className="font-medium">
              Minimum Hours Requirements
              {hasBaseCommission && <span className="text-red-500 ml-1">*</span>}
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Per Day</label>
              <div className="mt-1">
                {isEditingHours ? (
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={hoursEdit.daily}
                    onChange={e => setHoursEdit({ ...hoursEdit, daily: e.target.value })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 8"
                  />
                ) : (
                  <div className="text-gray-900 text-base min-h-[2.5rem] flex items-center">{data?.minimumHours?.daily ?? <span className="text-gray-400">-</span>}</div>
                )}
                <p className="mt-1 text-xs text-gray-500">Maximum: 24 hours</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Per Week</label>
              <div className="mt-1">
                {isEditingHours ? (
                  <input
                    type="number"
                    min="0"
                    max="168"
                    value={hoursEdit.weekly}
                    onChange={e => setHoursEdit({ ...hoursEdit, weekly: e.target.value })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 40"
                  />
                ) : (
                  <div className="text-gray-900 text-base min-h-[2.5rem] flex items-center">{data?.minimumHours?.weekly ?? <span className="text-gray-400">-</span>}</div>
                )}
                <p className="mt-1 text-xs text-gray-500">Maximum: 168 hours</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Per Month</label>
              <div className="mt-1">
                {isEditingHours ? (
                  <input
                    type="number"
                    min="0"
                    max="744"
                    value={hoursEdit.monthly}
                    onChange={e => setHoursEdit({ ...hoursEdit, monthly: e.target.value })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 160"
                  />
                ) : (
                  <div className="text-gray-900 text-base min-h-[2.5rem] flex items-center">{data?.minimumHours?.monthly ?? <span className="text-gray-400">-</span>}</div>
                )}
                <p className="mt-1 text-xs text-gray-500">Maximum: 744 hours</p>
              </div>
            </div>
          </div>
          {hasBaseCommission && !data?.minimumHours?.daily && !data?.minimumHours?.weekly && !data?.minimumHours?.monthly && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 text-yellow-800 rounded-lg">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <div>
                <p className="font-medium">Minimum Hours Required</p>
                <p className="text-sm">
                  Please specify minimum hours (daily, weekly, or monthly) when base commission is enabled.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Time Zones */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
          <div className="flex items-center gap-2 text-gray-900">
            <Globe className="w-5 h-5" />
            <h3 className="font-medium">Time Zones</h3>
          </div>
          <SelectionList
            options={Object.entries(MAJOR_TIMEZONES).map(([code, info]) => ({
              value: code as TimezoneCode,
              label: `${info.name}`,
              description: ""
            }))}
            selected={data.timeZones}
            onChange={(timeZones) => onChange({ ...data, timeZones })}
            multiple={true}
            layout="flow"
            size="sm"
          />
          <p className="mt-2 text-sm text-gray-500">
            Select all applicable time zones
          </p>
          {errors.timeZones && (
            <p className="mt-1 text-sm text-red-600">{errors.timeZones.join(', ')}</p>
          )}
        </div>

        {/* Schedule Flexibility */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Flexibility</label>
          {(() => {
            console.log('Flexibility data:', {
              options: predefinedOptions.availability.timeZones,
              selected: data?.flexibility,
              data: data
            });
            return null;
          })()}
          <SelectionList
            options={allOptions}
            selected={selectedFlex}
            onChange={(flexibility) => {
              console.log('Flexibility changed:', flexibility);
              onChange({ ...data, flexibility });
            }}
            multiple={true}
            layout="flow"
            size="sm"
          />
          <p className="mt-2 text-sm text-gray-500">
            Select all applicable schedule flexibility options
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={onPrevious}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
        >
          <ArrowLeft className="w-5 h-5" />
          Previous
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Next
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default ScheduleSection;
