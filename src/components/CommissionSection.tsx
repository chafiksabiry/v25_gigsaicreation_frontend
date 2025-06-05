import React from 'react';
import { InfoText } from './InfoText';
import { predefinedOptions } from '../lib/guidance';
import { 
  DollarSign, Target, AlertCircle, Coins, 
  TrendingUp, BarChart2, Percent, Star,
  ArrowUpRight, Calculator, ArrowLeft, ArrowRight
} from 'lucide-react';

interface CommissionSectionProps {
  data: {
    base: string;
    baseAmount: string;
    bonus?: string;
    bonusAmount?: string;
    structure?: string;
    currency: string;
    minimumVolume: {
      amount: string;
      period: string;
      unit: string;
    };
    transactionCommission: {
      type: string;
      amount: string;
    };
  };
  onChange: (data: any) => void;
  errors: { [key: string]: string[] };
  warnings: { [key: string]: string[] };
  onNext?: () => void;
  onPrevious?: () => void;
}

export function CommissionSection({ data, onChange, errors, warnings, onNext, onPrevious }: CommissionSectionProps) {
  const getCurrencySymbol = () => {
    return data?.currency ? 
      predefinedOptions.commission.currencies.find(c => c.code === data?.currency)?.symbol || '$'
      : '$';
  };

  const formatAmount = (value: string) => {
    return value?.replace(/[^\d.]/g, '') || '';
  };

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
              onClick={() => onChange({ ...data, currency: currency.code })}
              className={`flex items-center gap-3 p-4 rounded-xl text-left transition-colors ${
                data?.currency === currency.code
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                data?.currency === currency.code
                  ? 'bg-green-600'
                  : 'border-2 border-gray-300'
              }`}>
                {data?.currency === currency.code && (
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
                  value={data?.baseAmount || ''}
                  onChange={(e) => onChange({ ...data, baseAmount: formatAmount(e.target.value) })}
                  className="block w-full rounded-lg border-gray-300 pl-7 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter base amount"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Base Type</label>
              <select
                value={data?.base || ''}
                onChange={(e) => onChange({ ...data, base: e.target.value })}
                className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select type</option>
                {predefinedOptions.commission.baseTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
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
                  value={data?.minimumVolume?.amount || ''}
                  onChange={(e) => onChange({
                    ...data,
                    minimumVolume: {
                      ...data?.minimumVolume,
                      amount: formatAmount(e.target.value)
                    }
                  })}
                  className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter target"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Unit</label>
                <select
                  value={data?.minimumVolume?.unit || ''}
                  onChange={(e) => onChange({
                    ...data,
                    minimumVolume: {
                      ...data?.minimumVolume,
                      unit: e.target.value
                    }
                  })}
                  className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select unit</option>
                  <option value="calls">Calls Handled</option>
                  <option value="hours">Hours Volume</option>
                  <option value="transactions">Successful Transactions</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Period</label>
                <select
                  value={data?.minimumVolume?.period || ''}
                  onChange={(e) => onChange({
                    ...data,
                    minimumVolume: {
                      ...data?.minimumVolume,
                      period: e.target.value
                    }
                  })}
                  className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select period</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
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
              value={data?.transactionCommission?.type || ''}
              onChange={(e) => onChange({
                ...data,
                transactionCommission: {
                  ...data?.transactionCommission,
                  type: e.target.value
                }
              })}
              className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Select type</option>
              <option value="fixed">Fixed Amount per Transaction</option>
              <option value="percentage">Percentage of Transaction Value</option>
              <option value="tiered">Tiered Based on Volume</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Amount/Percentage</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">
                  {data?.transactionCommission?.type === 'percentage' ? '%' : getCurrencySymbol()}
                </span>
              </div>
              <input
                type="text"
                value={data?.transactionCommission?.amount || ''}
                onChange={(e) => onChange({
                  ...data,
                  transactionCommission: {
                    ...data?.transactionCommission,
                    amount: formatAmount(e.target.value)
                  }
                })}
                className="block w-full rounded-lg border-gray-300 pl-7 focus:ring-purple-500 focus:border-purple-500"
                placeholder={`Enter ${data?.transactionCommission?.type === 'percentage' ? 'percentage' : 'amount'}`}
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
                value={data.bonus}
                onChange={(e) => onChange({ ...data, bonus: e.target.value })}
                className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="">Select bonus type</option>
                {predefinedOptions.commission.bonusTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
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
                  value={data.bonusAmount}
                  onChange={(e) => onChange({ ...data, bonusAmount: formatAmount(e.target.value) })}
                  className="block w-full rounded-lg border-gray-300 pl-7 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Enter bonus amount"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">Additional Details</label>
        <textarea
          value={data.structure}
          onChange={(e) => onChange({ ...data, structure: e.target.value })}
          rows={4}
          className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Add any additional details about the commission structure..."
        />
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