import React, { useState } from 'react';
import { Save, X, Edit2, Plus, Trash2 } from 'lucide-react';
import type { ParsedGig } from '../lib/types';

interface GigFormProps {
  gig: ParsedGig;
  onSave: (updatedGig: ParsedGig) => void;
  onCancel: () => void;
}

export function GigForm({ gig, onSave, onCancel }: GigFormProps) {
  const [formData, setFormData] = useState(gig);
  const [isEditingSeniority, setIsEditingSeniority] = useState(false);
  const seniorityLevels = [
    'Entry Level',
    'Junior',
    'Mid-Level',
    'Senior',
    'Team Lead',
    'Supervisor',
    'Manager',
    'Director'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleArrayChange = (field: string, value: string[]) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNestedChange = <K extends keyof ParsedGig>(
    parent: K,
    field: keyof NonNullable<ParsedGig[K]>,
    value: any
  ) => {
    const currentValue = formData[parent];
    if (currentValue && typeof currentValue === 'object') {
      setFormData({
        ...formData,
        [parent]: {
          ...currentValue,
          [field]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [parent]: {
          [field]: value
        }
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-6">
      {/* Basic Information Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Basic Information</h2>
        
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title *
          </label>
          <input
            type="text"
            id="title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description *
          </label>
          <textarea
            id="description"
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category *
          </label>
          <input
            type="text"
            id="category"
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Seniority Requirements Section */}
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-yellow-500"><svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a2 2 0 0 1 2 2v1.528a6.002 6.002 0 0 1 4.472 7.472l-1.528-.44A4.002 4.002 0 0 0 12 5.528V4a2 2 0 0 1 2-2zM4 4a2 2 0 0 1 2-2v1.528a6.002 6.002 0 0 0-4.472 7.472l1.528-.44A4.002 4.002 0 0 1 8 5.528V4a2 2 0 0 1-2-2z"/></svg></span>
              <h2 className="text-xl font-semibold">Seniority Requirements</h2>
            </div>
            {!isEditingSeniority && (
              <button
                type="button"
                className="text-blue-600 hover:underline text-sm"
                onClick={() => setIsEditingSeniority(true)}
              >
                Edit
              </button>
            )}
          </div>
          {!isEditingSeniority ? (
            <>
              <div className="mb-2">
                <div className="text-sm text-gray-500 font-medium">Seniority Level *</div>
                <div className="text-lg font-semibold text-gray-900">{formData.seniority?.level || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Years of Experience *</div>
                <div className="text-lg font-semibold text-gray-900">{formData.seniority?.yearsExperience || '-'}</div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="seniorityLevel" className="block text-sm font-medium text-gray-700">
                  Level *
                </label>
                <select
                  id="seniorityLevel"
                  required
                  value={formData.seniority?.level || ''}
                  onChange={(e) => handleNestedChange('seniority', 'level', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select Level</option>
                  {seniorityLevels.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="yearsExperience" className="block text-sm font-medium text-gray-700">
                  Years of Experience *
                </label>
                <input
                  type="text"
                  id="yearsExperience"
                  required
                  value={formData.seniority?.yearsExperience || ''}
                  onChange={(e) => handleNestedChange('seniority', 'yearsExperience', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2 flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsEditingSeniority(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => setIsEditingSeniority(false)}
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Schedule</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Working Days
          </label>
          <div className="mt-2 space-x-2">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
              <label key={day} className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={formData.schedule?.days?.includes(day)}
                  onChange={(e) => {
                    const newDays = e.target.checked
                      ? [...(formData.schedule?.days || []), day]
                      : (formData.schedule?.days || []).filter(d => d !== day);
                    handleNestedChange('schedule', 'days', newDays);
                  }}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2">{day}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="workingHours" className="block text-sm font-medium text-gray-700">
            Working Hours *
          </label>
          <input
            type="text"
            id="workingHours"
            required
            value={formData.schedule?.hours}
            onChange={(e) => handleNestedChange('schedule', 'hours', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="e.g., 9:00 AM - 5:00 PM"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Time Zones
          </label>
          <div className="mt-2">
            {formData.schedule?.timeZones?.map((timezone, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={timezone}
                  onChange={(e) => {
                    const newTimeZones = [...(formData.schedule?.timeZones || [])];
                    newTimeZones[index] = e.target.value;
                    handleNestedChange('schedule', 'timeZones', newTimeZones);
                  }}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newTimeZones = [...(formData.schedule?.timeZones || [])];
                    newTimeZones.splice(index, 1);
                    handleNestedChange('schedule', 'timeZones', newTimeZones);
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newTimeZones = [...(formData.schedule?.timeZones || []), ''];
                handleNestedChange('schedule', 'timeZones', newTimeZones);
              }}
              className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Time Zone
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Flexibility Options
          </label>
          <div className="mt-2 space-y-2">
            {['Remote Work', 'Flexible Hours', 'Part-time', 'Full-time'].map((option) => (
              <label key={option} className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={formData.schedule?.flexibility?.includes(option)}
                  onChange={(e) => {
                    const newFlexibility = e.target.checked
                      ? [...(formData.schedule?.flexibility || []), option]
                      : (formData.schedule?.flexibility || []).filter(f => f !== option);
                    handleNestedChange('schedule', 'flexibility', newFlexibility);
                  }}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2">{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="dailyHours" className="block text-sm font-medium text-gray-700">
              Daily Hours
            </label>
            <input
              type="number"
              id="dailyHours"
              value={formData.schedule?.minimumHours?.daily}
              onChange={(e) => handleNestedChange('schedule', 'minimumHours', {
                ...formData.schedule?.minimumHours,
                daily: parseInt(e.target.value)
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="weeklyHours" className="block text-sm font-medium text-gray-700">
              Weekly Hours
            </label>
            <input
              type="number"
              id="weeklyHours"
              value={formData.schedule?.minimumHours?.weekly}
              onChange={(e) => handleNestedChange('schedule', 'minimumHours', {
                ...formData.schedule?.minimumHours,
                weekly: parseInt(e.target.value)
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="monthlyHours" className="block text-sm font-medium text-gray-700">
              Monthly Hours
            </label>
            <input
              type="number"
              id="monthlyHours"
              value={formData.schedule?.minimumHours?.monthly}
              onChange={(e) => handleNestedChange('schedule', 'minimumHours', {
                ...formData.schedule?.minimumHours,
                monthly: parseInt(e.target.value)
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Commission Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Commission Structure</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="commissionBase" className="block text-sm font-medium text-gray-700">
              Base Type *
            </label>
            <select
              id="commissionBase"
              required
              value={formData.commission?.base}
              onChange={(e) => handleNestedChange('commission', 'base', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Base Type</option>
              <option value="fixed">Fixed</option>
              <option value="percentage">Percentage</option>
              <option value="tiered">Tiered</option>
            </select>
          </div>

          <div>
            <label htmlFor="baseAmount" className="block text-sm font-medium text-gray-700">
              Base Amount *
            </label>
            <input
              type="text"
              id="baseAmount"
              required
              value={formData.commission?.baseAmount}
              onChange={(e) => handleNestedChange('commission', 'baseAmount', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="bonus" className="block text-sm font-medium text-gray-700">
              Bonus Type
            </label>
            <select
              id="bonus"
              value={formData.commission?.bonus}
              onChange={(e) => handleNestedChange('commission', 'bonus', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Bonus Type</option>
              <option value="performance">Performance</option>
              <option value="retention">Retention</option>
              <option value="referral">Referral</option>
            </select>
          </div>

          <div>
            <label htmlFor="bonusAmount" className="block text-sm font-medium text-gray-700">
              Bonus Amount
            </label>
            <input
              type="text"
              id="bonusAmount"
              value={formData.commission?.bonusAmount}
              onChange={(e) => handleNestedChange('commission', 'bonusAmount', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
            Currency *
          </label>
          <select
            id="currency"
            required
            value={formData.commission?.currency}
            onChange={(e) => handleNestedChange('commission', 'currency', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select Currency</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="minVolumeAmount" className="block text-sm font-medium text-gray-700">
              Minimum Volume Amount *
            </label>
            <input
              type="text"
              id="minVolumeAmount"
              required
              value={formData.commission?.minimumVolume?.amount}
              onChange={(e) => handleNestedChange('commission', 'minimumVolume', {
                ...formData.commission?.minimumVolume,
                amount: e.target.value
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="minVolumePeriod" className="block text-sm font-medium text-gray-700">
              Period *
            </label>
            <select
              id="minVolumePeriod"
              required
              value={formData.commission?.minimumVolume?.period}
              onChange={(e) => handleNestedChange('commission', 'minimumVolume', {
                ...formData.commission?.minimumVolume,
                period: e.target.value
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Period</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
            </select>
          </div>
          <div>
            <label htmlFor="minVolumeUnit" className="block text-sm font-medium text-gray-700">
              Unit *
            </label>
            <select
              id="minVolumeUnit"
              required
              value={formData.commission?.minimumVolume?.unit}
              onChange={(e) => handleNestedChange('commission', 'minimumVolume', {
                ...formData.commission?.minimumVolume,
                unit: e.target.value
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Unit</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="transactions">Transactions</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="transactionType" className="block text-sm font-medium text-gray-700">
              Transaction Commission Type *
            </label>
            <select
              id="transactionType"
              required
              value={formData.commission?.transactionCommission?.type}
              onChange={(e) => handleNestedChange('commission', 'transactionCommission', {
                ...formData.commission?.transactionCommission,
                type: e.target.value
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Type</option>
              <option value="fixed">Fixed</option>
              <option value="percentage">Percentage</option>
            </select>
          </div>

          <div>
            <label htmlFor="transactionAmount" className="block text-sm font-medium text-gray-700">
              Transaction Commission Amount *
            </label>
            <input
              type="text"
              id="transactionAmount"
              required
              value={formData.commission?.transactionCommission?.amount}
              onChange={(e) => handleNestedChange('commission', 'transactionCommission', {
                ...formData.commission?.transactionCommission,
                amount: e.target.value
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Leads Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Leads Management</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Lead Types
          </label>
          <div className="mt-2 space-y-4">
            {formData.leads?.types?.map((lead, index) => (
              <div key={index} className="border p-4 rounded-lg space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Type
                    </label>
                    <select
                      value={lead.type}
                      onChange={(e) => {
                        const newTypes = [...(formData.leads?.types || [])];
                        const selectedType = e.target.value as 'hot' | 'warm' | 'cold';
                        newTypes[index] = { ...lead, type: selectedType };
                        handleNestedChange('leads', 'types', newTypes);
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="hot">Hot</option>
                      <option value="warm">Warm</option>
                      <option value="cold">Cold</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Percentage
                    </label>
                    <input
                      type="number"
                      value={lead.percentage}
                      onChange={(e) => {
                        const newTypes = [...(formData.leads?.types || [])];
                        newTypes[index] = { ...lead, percentage: parseInt(e.target.value) };
                        handleNestedChange('leads', 'types', newTypes);
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <input
                    type="text"
                    value={lead.description}
                    onChange={(e) => {
                      const newTypes = [...(formData.leads?.types || [])];
                      newTypes[index] = { ...lead, description: e.target.value };
                      handleNestedChange('leads', 'types', newTypes);
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Conversion Rate
                  </label>
                  <input
                    type="number"
                    value={lead.conversionRate}
                    onChange={(e) => {
                      const newTypes = [...(formData.leads?.types || [])];
                      newTypes[index] = { ...lead, conversionRate: parseInt(e.target.value) };
                      handleNestedChange('leads', 'types', newTypes);
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newTypes = [...(formData.leads?.types || [])];
                    newTypes.splice(index, 1);
                    handleNestedChange('leads', 'types', newTypes);
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newTypes = [...(formData.leads?.types || []), {
                  type: 'hot',
                  percentage: 0,
                  description: '',
                  conversionRate: 0
                }];
                handleNestedChange('leads', 'types', newTypes);
              }}
              className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Lead Type
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Lead Sources
          </label>
          <div className="mt-2">
            {formData.leads?.sources?.map((source, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={source}
                  onChange={(e) => {
                    const newSources = [...(formData.leads?.sources || [])];
                    newSources[index] = e.target.value;
                    handleNestedChange('leads', 'sources', newSources);
                  }}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newSources = [...(formData.leads?.sources || [])];
                    newSources.splice(index, 1);
                    handleNestedChange('leads', 'sources', newSources);
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newSources = [...(formData.leads?.sources || []), ''];
                handleNestedChange('leads', 'sources', newSources);
              }}
              className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Lead Source
            </button>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Team Structure</h2>
        
        <div>
          <label htmlFor="teamSize" className="block text-sm font-medium text-gray-700">
            Team Size *
          </label>
          <select
            id="teamSize"
            required
            value={formData.team?.size}
            onChange={(e) => handleNestedChange('team', 'size', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select Team Size</option>
            <option value="1-5">1-5</option>
            <option value="6-10">6-10</option>
            <option value="11-20">11-20</option>
            <option value="20+">20+</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Team Structure
          </label>
          <div className="mt-2 space-y-4">
            {formData.team?.structure?.map((role, index) => (
              <div key={index} className="border p-4 rounded-lg space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Role ID
                    </label>
                    <input
                      type="text"
                      value={role.roleId}
                      onChange={(e) => {
                        const newStructure = [...(formData.team?.structure || [])];
                        newStructure[index] = { ...role, roleId: e.target.value };
                        handleNestedChange('team', 'structure', newStructure);
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Count
                    </label>
                    <input
                      type="number"
                      value={role.count}
                      onChange={(e) => {
                        const newStructure = [...(formData.team?.structure || [])];
                        newStructure[index] = { ...role, count: parseInt(e.target.value) };
                        handleNestedChange('team', 'structure', newStructure);
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Seniority Level
                    </label>
                    <select
                      value={role.seniority?.level}
                      onChange={(e) => {
                        const newStructure = [...(formData.team?.structure || [])];
                        newStructure[index] = {
                          ...role,
                          seniority: { ...role.seniority, level: e.target.value }
                        };
                        handleNestedChange('team', 'structure', newStructure);
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="Junior">Junior</option>
                      <option value="Mid">Mid</option>
                      <option value="Senior">Senior</option>
                      <option value="Lead">Lead</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Years of Experience
                    </label>
                    <input
                      type="text"
                      value={role.seniority?.yearsExperience}
                      onChange={(e) => {
                        const newStructure = [...(formData.team?.structure || [])];
                        newStructure[index] = {
                          ...role,
                          seniority: { ...role.seniority, yearsExperience: e.target.value }
                        };
                        handleNestedChange('team', 'structure', newStructure);
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newStructure = [...(formData.team?.structure || [])];
                    newStructure.splice(index, 1);
                    handleNestedChange('team', 'structure', newStructure);
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newStructure = [...(formData.team?.structure || []), {
                  roleId: '',
                  count: 1,
                  seniority: {
                    level: 'Junior',
                    yearsExperience: ''
                  }
                }];
                handleNestedChange('team', 'structure', newStructure);
              }}
              className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Team Role
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Territories
          </label>
          <div className="mt-2">
            {formData.team?.territories?.map((territory, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={territory}
                  onChange={(e) => {
                    const newTerritories = [...(formData.team?.territories || [])];
                    newTerritories[index] = e.target.value;
                    handleNestedChange('team', 'territories', newTerritories);
                  }}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newTerritories = [...(formData.team?.territories || [])];
                    newTerritories.splice(index, 1);
                    handleNestedChange('team', 'territories', newTerritories);
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newTerritories = [...(formData.team?.territories || []), ''];
                handleNestedChange('team', 'territories', newTerritories);
              }}
              className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Territory
            </button>
          </div>
        </div>
      </div>

      {/* Documentation Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Documentation</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Product Documentation
          </label>
          <div className="mt-2 space-y-4">
            {formData.documentation?.product?.map((doc, index) => (
              <div key={index} className="border p-4 rounded-lg space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Document Name
                    </label>
                    <input
                      type="text"
                      value={doc.name}
                      onChange={(e) => {
                        const newDocs = [...(formData.documentation?.product || [])];
                        newDocs[index] = { ...doc, name: e.target.value };
                        handleNestedChange('documentation', 'product', newDocs);
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      URL
                    </label>
                    <input
                      type="url"
                      value={doc.url}
                      onChange={(e) => {
                        const newDocs = [...(formData.documentation?.product || [])];
                        newDocs[index] = { ...doc, url: e.target.value };
                        handleNestedChange('documentation', 'product', newDocs);
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newDocs = [...(formData.documentation?.product || [])];
                    newDocs.splice(index, 1);
                    handleNestedChange('documentation', 'product', newDocs);
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newDocs = [...(formData.documentation?.product || []), {
                  name: '',
                  url: ''
                }];
                handleNestedChange('documentation', 'product', newDocs);
              }}
              className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Product Document
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Process Documentation
          </label>
          <div className="mt-2 space-y-4">
            {formData.documentation?.process?.map((doc, index) => (
              <div key={index} className="border p-4 rounded-lg space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Document Name
                    </label>
                    <input
                      type="text"
                      value={doc.name}
                      onChange={(e) => {
                        const newDocs = [...(formData.documentation?.process || [])];
                        newDocs[index] = { ...doc, name: e.target.value };
                        handleNestedChange('documentation', 'process', newDocs);
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      URL
                    </label>
                    <input
                      type="url"
                      value={doc.url}
                      onChange={(e) => {
                        const newDocs = [...(formData.documentation?.process || [])];
                        newDocs[index] = { ...doc, url: e.target.value };
                        handleNestedChange('documentation', 'process', newDocs);
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newDocs = [...(formData.documentation?.process || [])];
                    newDocs.splice(index, 1);
                    handleNestedChange('documentation', 'process', newDocs);
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newDocs = [...(formData.documentation?.process || []), {
                  name: '',
                  url: ''
                }];
                handleNestedChange('documentation', 'process', newDocs);
              }}
              className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Process Document
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Training Documentation
          </label>
          <div className="mt-2 space-y-4">
            {formData.documentation?.training?.map((doc, index) => (
              <div key={index} className="border p-4 rounded-lg space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Document Name
                    </label>
                    <input
                      type="text"
                      value={doc.name}
                      onChange={(e) => {
                        const newDocs = [...(formData.documentation?.training || [])];
                        newDocs[index] = { ...doc, name: e.target.value };
                        handleNestedChange('documentation', 'training', newDocs);
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      URL
                    </label>
                    <input
                      type="url"
                      value={doc.url}
                      onChange={(e) => {
                        const newDocs = [...(formData.documentation?.training || [])];
                        newDocs[index] = { ...doc, url: e.target.value };
                        handleNestedChange('documentation', 'training', newDocs);
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newDocs = [...(formData.documentation?.training || [])];
                    newDocs.splice(index, 1);
                    handleNestedChange('documentation', 'training', newDocs);
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newDocs = [...(formData.documentation?.training || []), {
                  name: '',
                  url: ''
                }];
                handleNestedChange('documentation', 'training', newDocs);
              }}
              className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Training Document
            </button>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </button>
      </div>
    </form>
  );
}