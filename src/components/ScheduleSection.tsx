import React, { useState } from 'react';
import { InfoText } from './InfoText';
import { predefinedOptions } from '../lib/guidance';
import { SelectionList } from './SelectionList';
import { Clock, AlertCircle, Sunrise, Sunset, Sun, Moon, Globe2, ArrowLeft, ArrowRight } from 'lucide-react';

interface TimeRange {
  start: string;
  end: string;
}

interface ScheduleSectionProps {
  data: {
    days: string[];
    hours: string;
    timeZones: string[];
    flexibility: string[];
    minimumHours: {
      daily?: number;
      weekly?: number;
      monthly?: number;
    };
    startTime?: string;
    endTime?: string;
  };
  onChange: (data: any) => void;
  errors: { [key: string]: string[] };
  hasBaseCommission?: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
}

export function ScheduleSection({ 
  data = {
    days: [],
    hours: '',
    timeZones: [],
    flexibility: [],
    minimumHours: {
      daily: undefined,
      weekly: undefined,
      monthly: undefined
    },
    startTime: '09:00',
    endTime: '17:00'
  }, 
  onChange, 
  errors = {}, 
  hasBaseCommission = false, 
  onNext, 
  onPrevious 
}: ScheduleSectionProps) {
  const [startTime, setStartTime] = useState(data.startTime || '09:00');
  const [endTime, setEndTime] = useState(data.endTime || '17:00');

  const handleTimeChange = (type: 'start' | 'end', value: string) => {
    const newTime = type === 'start' ? { startTime: value, endTime } : { startTime, endTime: value };
    const formattedTime = `${formatTime(newTime.startTime)} - ${formatTime(newTime.endTime)}`;
    
    if (type === 'start') {
      setStartTime(value);
    } else {
      setEndTime(value);
    }

    onChange({
      ...data,
      hours: formattedTime,
      ...newTime
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleMinimumHoursChange = (period: 'daily' | 'weekly' | 'monthly', value: string) => {
    const numericValue = value === '' ? undefined : Math.max(0, parseInt(value) || 0);
    const maxValues = {
      daily: 24,
      weekly: 168,
      monthly: 744
    };

    const limitedValue = numericValue !== undefined ? 
      Math.min(numericValue, maxValues[period]) : undefined;

    onChange({
      ...data,
      minimumHours: {
        ...data.minimumHours,
        [period]: limitedValue
      }
    });
  };

  return (
    <div className="space-y-6">
      <InfoText className="bg-blue-50 border-blue-100 text-blue-800">
        Define the working schedule and time requirements for this gig.
      </InfoText>

      {false && (
        <div className="flex justify-between">
          <button onClick={onPrevious}>Previous</button>
          <button onClick={onNext}>Next</button>
        </div>
      )}

      <div className="space-y-6">
        {/* Working Days */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Sun className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Working Days</h3>
              <p className="text-sm text-gray-600">Select the days of the week</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {weekdays.map((day) => (
              <button
                key={day}
                onClick={() => {
                  const days = data.days.includes(day)
                    ? data.days.filter((d) => d !== day)
                    : [...data.days, day];
                  onChange({ ...data, days });
                }}
                className={`px-3 py-1 rounded-full text-sm ${
                  data.days.includes(day)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
          {errors.days && <p className="mt-1 text-sm text-red-600">{errors.days.join(', ')}</p>}
        </div>

        {/* Working Hours */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Working Hours</h3>
              <p className="text-sm text-gray-600">Set your preferred working hours</p>
            </div>
          </div>
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
              onClick={() => {
                setStartTime('09:00');
                setEndTime('17:00');
                handleTimeChange('start', '09:00');
                handleTimeChange('end', '17:00');
              }}
              className="flex flex-col items-center gap-1 p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              <Sun className="w-5 h-5 text-orange-500" />
              <span className="text-xs text-gray-600">9-5</span>
            </button>

            <button
              onClick={() => {
                setStartTime('08:00');
                setEndTime('16:00');
                handleTimeChange('start', '08:00');
                handleTimeChange('end', '16:00');
              }}
              className="flex flex-col items-center gap-1 p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              <Sunrise className="w-5 h-5 text-blue-500" />
              <span className="text-xs text-gray-600">Early</span>
            </button>

            <button
              onClick={() => {
                setStartTime('10:00');
                setEndTime('18:00');
                handleTimeChange('start', '10:00');
                handleTimeChange('end', '18:00');
              }}
              className="flex flex-col items-center gap-1 p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              <Clock className="w-5 h-5 text-purple-500" />
              <span className="text-xs text-gray-600">Late</span>
            </button>

            <button
              onClick={() => {
                setStartTime('13:00');
                setEndTime('21:00');
                handleTimeChange('start', '13:00');
                handleTimeChange('end', '21:00');
              }}
              className="flex flex-col items-center gap-1 p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              <Moon className="w-5 h-5 text-indigo-500" />
              <span className="text-xs text-gray-600">Evening</span>
            </button>
          </div>
        </div>

        {/* Time Zones */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Globe2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Time Zones</h3>
              <p className="text-sm text-gray-600">Select applicable time zones</p>
            </div>
          </div>
          <SelectionList
            options={predefinedOptions.basic.timeZones}
            selected={data.timeZones}
            onChange={(timeZones) => onChange({ ...data, timeZones })}
            multiple={true}
            layout="flow"
          />
          {errors.timeZones && (
            <p className="mt-1 text-sm text-red-600">{errors.timeZones.join(', ')}</p>
          )}
        </div>

        {/* Schedule Flexibility */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Schedule Flexibility</h3>
              <p className="text-sm text-gray-600">Select flexibility options</p>
            </div>
          </div>
          <SelectionList
            options={predefinedOptions.basic.scheduleFlexibility}
            selected={data.flexibility || []}
            onChange={(flexibility) => onChange({ ...data, flexibility })}
            multiple={true}
            layout="flow"
            size="sm"
          />
        </div>

        {/* Minimum Hours Requirements */}
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-rose-100 rounded-lg">
              <Clock className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Minimum Hours Requirements
                {hasBaseCommission && <span className="text-red-500 ml-1">*</span>}
              </h3>
              <p className="text-sm text-gray-600">Set minimum working hours</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Per Day</label>
              <div className="mt-1">
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={data.minimumHours?.daily ?? ''}
                  onChange={(e) => handleMinimumHoursChange('daily', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 8"
                />
                <p className="mt-1 text-xs text-gray-500">Maximum: 24 hours</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Per Week</label>
              <div className="mt-1">
                <input
                  type="number"
                  min="0"
                  max="168"
                  value={data.minimumHours?.weekly ?? ''}
                  onChange={(e) => handleMinimumHoursChange('weekly', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 40"
                />
                <p className="mt-1 text-xs text-gray-500">Maximum: 168 hours</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Per Month</label>
              <div className="mt-1">
                <input
                  type="number"
                  min="0"
                  max="744"
                  value={data.minimumHours?.monthly ?? ''}
                  onChange={(e) => handleMinimumHoursChange('monthly', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 160"
                />
                <p className="mt-1 text-xs text-gray-500">Maximum: 744 hours</p>
              </div>
            </div>
          </div>

          {hasBaseCommission && !data.minimumHours?.daily && !data.minimumHours?.weekly && !data.minimumHours?.monthly && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 text-yellow-800 rounded-lg mt-4">
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
    </div>
  );
}