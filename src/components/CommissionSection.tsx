import React, { useEffect } from 'react';
import { InfoText } from './InfoText';
import { predefinedOptions } from '../lib/guidance';
import { 
  DollarSign, Target, AlertCircle, Coins, 
  TrendingUp, BarChart2, Percent, Star,
  ArrowUpRight, Calculator, ArrowLeft, ArrowRight
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

  const formatAmount = (value: string) => {
    // Remove any currency symbols and non-numeric characters except decimal point
    return value?.replace(/[^\d.]/g, '') || '';
  };

  // Log commission data
  console.log('Commission Data:', {
    base: data?.commission?.base,
    baseAmount: data?.commission?.baseAmount,
    bonus: data?.commission?.bonus,
    bonusAmount: data?.commission?.bonusAmount,
    structure: data?.commission?.structure,
    currency: data?.commission?.currency,
    minimumVolume: data?.commission?.minimumVolume,
    transactionCommission: data?.commission?.transactionCommission,
    kpis: data?.commission?.kpis
  });

  // Add new base type if it doesn't exist
  useEffect(() => {
    if (data?.commission?.base && !predefinedOptions.commission.baseTypes.includes(data.commission.base)) {
      predefinedOptions.commission.baseTypes.push(data.commission.base);
      console.log(`Added new base type: ${data.commission.base}`);
    }
  }, [data?.commission?.base]);

  // Add new bonus type if it doesn't exist
  useEffect(() => {
    if (data?.commission?.bonus && !predefinedOptions.commission.bonusTypes.includes(data.commission.bonus)) {
      predefinedOptions.commission.bonusTypes.push(data.commission.bonus);
      console.log(`Added new bonus type: ${data.commission.bonus}`);
    }
  }, [data?.commission?.bonus]);

  return (
    <div className="space-y-8">
      <InfoText>
        Define the complete commission structure including base rate, transaction commission,
        and performance bonus. All components will be displayed together.
      </InfoText>

      {/* Currency Selection */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Currency</h3>
            <p className="text-sm text-gray-600">Select the payment currency</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {predefinedOptions.commission.currencies.map((currency) => (
            <button
              key={currency.code}
              onClick={() => onChange({ 
                ...data, 
                commission: { 
                  ...data.commission,
                  currency: currency.code
                } 
              })}
              className={`flex items-center gap-3 p-4 rounded-xl text-left transition-colors ${
                data?.commission?.currency === currency.code
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                data?.commission?.currency === currency.code
                  ? 'bg-green-600'
                  : 'border-2 border-gray-300'
              }`}>
                {data?.commission?.currency === currency.code && (
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                )}
              </div>
              <div>
                <span className="font-medium">{currency.symbol}</span>
                <span className="text-sm text-gray-500 ml-2">{currency.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Base Commission */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Coins className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Base Commission</h3>
            <p className="text-sm text-gray-600">Set the fixed base rate and requirements</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Base Amount</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">{getCurrencySymbol()}</span>
                </div>
                <input
                  type="text"
                  value={data?.commission?.baseAmount || ''}
                  onChange={(e) => onChange({ 
                    ...data, 
                    commission: { 
                      ...data.commission,
                      baseAmount: formatAmount(e.target.value)
                    } 
                  })}
                  className="block w-full rounded-lg border-gray-300 pl-7 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter base amount"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Base Type</label>
              <select
                value={data?.commission?.base || ''}
                onChange={(e) => {
                  const newBaseType = e.target.value;
                  // Add new base type if it doesn't exist
                  if (newBaseType && !predefinedOptions.commission.baseTypes.includes(newBaseType)) {
                    predefinedOptions.commission.baseTypes.push(newBaseType);
                  }
                  onChange({ 
                    ...data, 
                    commission: { 
                      ...data.commission,
                      base: newBaseType
                    } 
                  });
                }}
                className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select type</option>
                {predefinedOptions.commission.baseTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
                {data?.commission?.base && !predefinedOptions.commission.baseTypes.includes(data.commission.base) && (
                  <option value={data.commission.base}>{data.commission.base}</option>
                )}
              </select>
            </div>
          </div>

          {/* Minimum Volume Requirements */}
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-gray-900">Minimum Requirements</h4>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Target Amount</label>
                <input
                  type="text"
                  value={data?.commission?.minimumVolume?.amount || ''}
                  onChange={(e) => onChange({
                    ...data,
                    commission: {
                      ...data.commission,
                      minimumVolume: {
                        ...data.commission?.minimumVolume,
                        amount: formatAmount(e.target.value)
                      }
                    }
                  })}
                  className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter target"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Unit</label>
                <select
                  value={data?.commission?.minimumVolume?.unit || ''}
                  onChange={(e) => onChange({
                    ...data,
                    commission: {
                      ...data.commission,
                      minimumVolume: {
                        ...data.commission?.minimumVolume,
                        unit: e.target.value
                      }
                    }
                  })}
                  className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select unit</option>
                  <option value="Posts">Posts</option>
                  <option value="Calls">Calls</option>
                  <option value="Transactions">Transactions</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Period</label>
                <select
                  value={data?.commission?.minimumVolume?.period || ''}
                  onChange={(e) => onChange({
                    ...data,
                    commission: {
                      ...data.commission,
                      minimumVolume: {
                        ...data.commission?.minimumVolume,
                        period: e.target.value
                      }
                    }
                  })}
                  className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select period</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Commission */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Calculator className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Transaction Commission</h3>
            <p className="text-sm text-gray-600">Define per-transaction rewards</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Commission Type</label>
            <select
              value={data?.commission?.transactionCommission?.type || ''}
              onChange={(e) => onChange({
                ...data,
                commission: {
                  ...data.commission,
                  transactionCommission: {
                    ...data.commission?.transactionCommission,
                    type: e.target.value
                  }
                }
              })}
              className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Select type</option>
              <option value="Conversion">Conversion</option>
              <option value="Fixed">Fixed Amount</option>
              <option value="Percentage">Percentage</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Amount/Percentage</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">
                  {data?.commission?.transactionCommission?.type === 'Percentage' ? '%' : getCurrencySymbol()}
                </span>
              </div>
              <input
                type="text"
                value={data?.commission?.transactionCommission?.amount || ''}
                onChange={(e) => onChange({
                  ...data,
                  commission: {
                    ...data.commission,
                    transactionCommission: {
                      ...data.commission?.transactionCommission,
                      amount: formatAmount(e.target.value)
                    }
                  }
                })}
                className="block w-full rounded-lg border-gray-300 pl-7 focus:ring-purple-500 focus:border-purple-500"
                placeholder={`Enter ${data?.commission?.transactionCommission?.type === 'Percentage' ? 'percentage' : 'amount'}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Performance Bonus */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Star className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Performance Bonus</h3>
            <p className="text-sm text-gray-600">Set additional performance-based rewards</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Bonus Type</label>
              <select
                value={data?.commission?.bonus || ''}
                onChange={(e) => {
                  const newBonusType = e.target.value;
                  // Add new bonus type if it doesn't exist
                  if (newBonusType && !predefinedOptions.commission.bonusTypes.includes(newBonusType)) {
                    predefinedOptions.commission.bonusTypes.push(newBonusType);
                  }
                  onChange({ 
                    ...data, 
                    commission: { 
                      ...data.commission,
                      bonus: newBonusType
                    } 
                  });
                }}
                className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="">Select bonus type</option>
                {predefinedOptions.commission.bonusTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
                {data?.commission?.bonus && !predefinedOptions.commission.bonusTypes.includes(data.commission.bonus) && (
                  <option value={data.commission.bonus}>{data.commission.bonus}</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Bonus Amount</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">{getCurrencySymbol()}</span>
                </div>
                <input
                  type="text"
                  value={data?.commission?.bonusAmount || ''}
                  onChange={(e) => onChange({ 
                    ...data, 
                    commission: { 
                      ...data.commission,
                      bonusAmount: formatAmount(e.target.value)
                    } 
                  })}
                  className="block w-full rounded-lg border-gray-300 pl-7 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Enter bonus amount"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Messages */}
      {((errors?.commission && errors.commission.length > 0) || (warnings?.commission && warnings.commission.length > 0)) && (
        <div className="space-y-3">
          {errors?.commission && errors.commission.length > 0 && (
            <div className="flex items-start gap-2 p-4 bg-red-50 rounded-lg text-red-700">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <div>
                <p className="font-medium">Please fix the following:</p>
                <ul className="mt-1 text-sm list-disc list-inside">
                  {errors.commission.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {warnings?.commission && warnings.commission.length > 0 && (
            <div className="flex items-start gap-2 p-4 bg-yellow-50 rounded-lg text-yellow-700">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <div>
                <p className="font-medium">Recommendations:</p>
                <ul className="mt-1 text-sm list-disc list-inside">
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