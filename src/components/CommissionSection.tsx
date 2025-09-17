import React from "react";
import { useEffect } from 'react';
import { InfoText } from './InfoText';
import { predefinedOptions } from '../lib/guidance';
import { 
  DollarSign, Target, AlertCircle, Coins, 
  Star, Calculator, ArrowLeft, ArrowRight
} from 'lucide-react';
import { GigData } from '../types';

interface CommissionSectionProps {
  data: GigData;
  onChange: (data: GigData) => void;
  errors: { [key: string]: string[] };
  warnings: { [key: string]: string[] };
  onNext?: () => void;
  onPrevious?: () => void;
}

export function CommissionSection({ data, onChange, errors, warnings, onNext, onPrevious }: CommissionSectionProps) {
  const getCurrencySymbol = () => {
    return data?.commission?.currency ? 
      predefinedOptions.commission.currencies.find(c => c.code === data?.commission?.currency)?.symbol || '$'
      : '$';
  };

  // Log Commission Section data
  useEffect(() => {
  }, [data.commission, data.seniority, errors, warnings]);

  const handleBaseChange = (field: string, value: string | number) => {
    onChange({
      ...data,
      commission: {
        ...data.commission,
        [field]: field === 'baseAmount'
          ? (typeof value === 'string' ? parseFloat(value) || 0 : value)
          : value, // pour les selects, garder la string
      },
    });
  };

  const handleMinimumVolumeChange = (field: string, value: string | number) => {
    onChange({
      ...data,
      commission: {
        ...data.commission,
        minimumVolume: {
          ...data.commission?.minimumVolume,
          [field]: field === 'amount'
            ? (typeof value === 'string' ? parseFloat(value) || 0 : value)
            : value, // pour unit et period, garder la string
        },
      },
    });
  };

  const handleTransactionChange = (field: string, value: string | number) => {
    onChange({
      ...data,
      commission: {
        ...data.commission,
        transactionCommission: {
          ...data.commission?.transactionCommission,
          [field]: field === 'amount'
            ? (typeof value === 'string' ? parseFloat(value) || 0 : value)
            : value, // pour type, garder la string
        },
      },
    });
  };

  const handleBonusChange = (field: string, value: string | number) => {
    onChange({
      ...data,
      commission: {
        ...data.commission,
        [field]: field === 'bonusAmount'
          ? (typeof value === 'string' ? parseFloat(value) || 0 : value)
          : value, // pour bonus, garder la string
      },
    });
  };


  // Add new base type if it doesn't exist
  useEffect(() => {
    if (data?.commission?.base && !predefinedOptions.commission.baseTypes.includes(data.commission.base)) {
      predefinedOptions.commission.baseTypes.push(data.commission.base);
    }
  }, [data?.commission?.base]);

  // Add new bonus type if it doesn't exist
  useEffect(() => {
    if (data?.commission?.bonus && !predefinedOptions.commission.bonusTypes.includes(data.commission.bonus)) {
      predefinedOptions.commission.bonusTypes.push(data.commission.bonus);
    }
  }, [data?.commission?.bonus]);

  // Add new unit type if it doesn't exist
  useEffect(() => {
    if (data?.commission?.minimumVolume?.unit && !predefinedOptions.commission.minimumVolumeUnits.includes(data.commission.minimumVolume.unit)) {
      predefinedOptions.commission.minimumVolumeUnits.push(data.commission.minimumVolume.unit);
    }
  }, [data?.commission?.minimumVolume?.unit]);

  // Add new period type if it doesn't exist
  useEffect(() => {
    if (data?.commission?.minimumVolume?.period && !predefinedOptions.commission.minimumVolumePeriods?.includes(data.commission.minimumVolume.period)) {
      if (!predefinedOptions.commission.minimumVolumePeriods) {
        predefinedOptions.commission.minimumVolumePeriods = [];
      }
      predefinedOptions.commission.minimumVolumePeriods.push(data.commission.minimumVolume.period);
    }
  }, [data?.commission?.minimumVolume?.period]);

  // Add new transaction commission type if it doesn't exist
  useEffect(() => {
    if (data?.commission?.transactionCommission?.type && !predefinedOptions.commission.transactionCommissionTypes?.includes(data.commission.transactionCommission.type)) {
      if (!predefinedOptions.commission.transactionCommissionTypes) {
        predefinedOptions.commission.transactionCommissionTypes = [];
      }
      predefinedOptions.commission.transactionCommissionTypes.push(data.commission.transactionCommission.type);
    }
  }, [data?.commission?.transactionCommission?.type]);

  console.log('💰 COMMISSION SECTION - Rendering CommissionSection component');
  console.log('💰 COMMISSION SECTION - data.commission:', data.commission);
  console.log('💰 COMMISSION SECTION - currency:', data?.commission?.currency);
  console.log('💰 COMMISSION SECTION - baseAmount:', data?.commission?.baseAmount);
  console.log('💰 COMMISSION SECTION - base:', data?.commission?.base);
  console.log('💰 COMMISSION SECTION - minimumVolume:', data?.commission?.minimumVolume);
  console.log('💰 COMMISSION SECTION - transactionCommission:', data?.commission?.transactionCommission);
  console.log('💰 COMMISSION SECTION - bonus:', data?.commission?.bonus);
  console.log('💰 COMMISSION SECTION - bonusAmount:', data?.commission?.bonusAmount);
  console.log('💰 COMMISSION SECTION - errors:', errors);
  console.log('💰 COMMISSION SECTION - warnings:', warnings);
  
  return (
    <div className="w-full bg-white p-0">
      
      <div className="space-y-8">
        <InfoText>
          Define the complete commission structure including base rate, transaction commission,
          and performance bonus. All components will be displayed together.
        </InfoText>

        {/* Currency Selection */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 shadow-sm border border-green-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Currency</h3>
              <p className="text-sm text-gray-600">Select the payment currency</p>
            </div>
          </div>

          {/* Other Currency Options */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Other Currencies</label>
            <select
              value={data?.commission?.currency || ''}
              onChange={(e) => onChange({ 
                ...data, 
                commission: { 
                  ...data.commission,
                  currency: e.target.value
                } 
              })}
              className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
            >
              <option value="">Select a currency</option>
              {predefinedOptions.commission.currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.name} ({currency.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Base Commission */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 shadow-lg border border-blue-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Coins className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-blue-900">Base Commission</h3>
              <p className="text-base text-blue-700">Set the fixed base rate and requirements</p>
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Base Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    {getCurrencySymbol()}
                  </span>
                  <input
                    type="number"
                    className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="0.00"
                    value={data?.commission?.baseAmount || ''}
                    onChange={e => handleBaseChange('baseAmount', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Base Type</label>
                <select
                  className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={data?.commission?.base || ''}
                  onChange={e => handleBaseChange('base', e.target.value)}
                >
                  <option value="">Select type</option>
                  {predefinedOptions.commission.baseTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Minimum Volume Requirements */}
            <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Target className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-gray-900 text-lg">Minimum Requirements</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Target Amount</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="0.00"
                    value={data?.commission?.minimumVolume?.amount || ''}
                    onChange={e => handleMinimumVolumeChange('amount', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Unit</label>
                  <select
                    className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={data?.commission?.minimumVolume?.unit || ''}
                    onChange={e => handleMinimumVolumeChange('unit', e.target.value)}
                  >
                    <option value="">Select unit</option>
                    {predefinedOptions.commission.minimumVolumeUnits.map((unit) => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Period</label>
                  <select
                    className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={data?.commission?.minimumVolume?.period || ''}
                    onChange={e => handleMinimumVolumeChange('period', e.target.value)}
                  >
                    <option value="">Select period</option>
                    {predefinedOptions.commission.minimumVolumePeriods?.map((period) => (
                      <option key={period} value={period}>{period}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Commission */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-8 shadow-lg border border-purple-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Calculator className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-purple-900">Transaction Commission</h3>
              <p className="text-base text-purple-700">Define per-transaction rewards</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-purple-200 shadow-sm">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Commission Type</label>
              <select
                className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                value={data?.commission?.transactionCommission?.type || ''}
                onChange={e => handleTransactionChange('type', e.target.value)}
              >
                <option value="">Select type</option>
                {predefinedOptions.commission.transactionCommissionTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-purple-200 shadow-sm">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Amount/Percentage</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  {data?.commission?.transactionCommission?.type === 'Percentage' ? '%' : getCurrencySymbol()}
                </span>
                <input
                  type="number"
                  className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder="0.00"
                  value={data?.commission?.transactionCommission?.amount || ''}
                  onChange={e => handleTransactionChange('amount', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Performance Bonus */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-8 shadow-lg border border-amber-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Star className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-amber-900">Performance Bonus</h3>
              <p className="text-base text-amber-700">Set additional performance-based rewards</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-amber-200 shadow-sm">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Bonus Type</label>
              <select
                className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                value={data?.commission?.bonus || ''}
                onChange={e => handleBonusChange('bonus', e.target.value)}
              >
                <option value="">Select bonus type</option>
                {predefinedOptions.commission.bonusTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-amber-200 shadow-sm">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Bonus Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  {getCurrencySymbol()}
                </span>
                <input
                  type="number"
                  className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  placeholder="0.00"
                  value={data?.commission?.bonusAmount || ''}
                  onChange={e => handleBonusChange('bonusAmount', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
          <label className="block text-lg font-semibold text-gray-800 mb-4">Additional Details</label>
          <textarea
            className="w-full min-h-[120px] rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-4 text-gray-700 transition-all resize-none"
            placeholder="Add any additional details about the commission structure..."
            value={data?.commission?.additionalDetails || ''}
            onChange={e => onChange({
              ...data,
              commission: {
                ...data.commission,
                additionalDetails: e.target.value
              }
            })}
          />
        </div>

        {/* Validation Messages */}
        {((errors?.commission && errors.commission.length > 0) || (warnings?.commission && warnings.commission.length > 0)) && (
          <div className="space-y-4">
            {errors?.commission && errors.commission.length > 0 && (
              <div className="flex items-start gap-3 p-6 bg-red-50 rounded-xl text-red-700 border border-red-200">
                <AlertCircle className="w-6 h-6 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-lg">Please fix the following:</p>
                  <ul className="mt-2 text-sm list-disc list-inside space-y-1">
                    {errors.commission.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {warnings?.commission && warnings.commission.length > 0 && (
              <div className="flex items-start gap-3 p-6 bg-yellow-50 rounded-xl text-yellow-700 border border-yellow-200">
                <AlertCircle className="w-6 h-6 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-lg">Recommendations:</p>
                  <ul className="mt-2 text-sm list-disc list-inside space-y-1">
                    {warnings.commission.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-8 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={onPrevious}
              className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Previous
            </button>
          </div>
          <button
            onClick={onNext}
            className="flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            Next
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}