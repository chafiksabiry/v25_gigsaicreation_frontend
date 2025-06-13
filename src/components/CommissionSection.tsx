import React, { useEffect, useState } from 'react';
import { InfoText } from './InfoText';
import { predefinedOptions } from '../lib/guidance';
import { 
  DollarSign, Target, AlertCircle, Coins, 
  TrendingUp, BarChart2, Percent, Star,
  ArrowUpRight, Calculator, ArrowLeft, ArrowRight,
  PenSquare
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
  const [isEditingBase, setIsEditingBase] = useState(false);
  const [baseEdit, setBaseEdit] = useState({
    baseAmount: data?.commission?.baseAmount || '',
    base: data?.commission?.base || '',
    minimumVolume: {
      amount: data?.commission?.minimumVolume?.amount || '',
      unit: data?.commission?.minimumVolume?.unit || '',
      period: data?.commission?.minimumVolume?.period || '',
    },
  });

  const [isEditingTransaction, setIsEditingTransaction] = useState(false);
  const [transactionEdit, setTransactionEdit] = useState({
    type: data?.commission?.transactionCommission?.type || '',
    amount: data?.commission?.transactionCommission?.amount || '',
  });

  const [isEditingBonus, setIsEditingBonus] = useState(false);
  const [bonusEdit, setBonusEdit] = useState({
    bonus: data?.commission?.bonus || '',
    bonusAmount: data?.commission?.bonusAmount || '',
  });

  const getCurrencySymbol = () => {
    return data?.commission?.currency ? 
      predefinedOptions.commission.currencies.find(c => c.code === data?.commission?.currency)?.symbol || '$'
      : '$';
  };

  const formatAmount = (value: string | number) => {
    // Remove any currency symbols and non-numeric characters except decimal point
    if (typeof value === 'number') return value.toString();
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

  // Add new unit type if it doesn't exist
  useEffect(() => {
    if (data?.commission?.minimumVolume?.unit && !predefinedOptions.commission.minimumVolumeUnits.includes(data.commission.minimumVolume.unit)) {
      predefinedOptions.commission.minimumVolumeUnits.push(data.commission.minimumVolume.unit);
      console.log(`Added new unit type: ${data.commission.minimumVolume.unit}`);
    }
  }, [data?.commission?.minimumVolume?.unit]);

  // Add new period type if it doesn't exist
  useEffect(() => {
    if (data?.commission?.minimumVolume?.period && !predefinedOptions.commission.minimumVolumePeriods?.includes(data.commission.minimumVolume.period)) {
      if (!predefinedOptions.commission.minimumVolumePeriods) {
        predefinedOptions.commission.minimumVolumePeriods = [];
      }
      predefinedOptions.commission.minimumVolumePeriods.push(data.commission.minimumVolume.period);
      console.log(`Added new period type: ${data.commission.minimumVolume.period}`);
    }
  }, [data?.commission?.minimumVolume?.period]);

  // Add new transaction commission type if it doesn't exist
  useEffect(() => {
    if (data?.commission?.transactionCommission?.type && !predefinedOptions.commission.transactionCommissionTypes?.includes(data.commission.transactionCommission.type)) {
      if (!predefinedOptions.commission.transactionCommissionTypes) {
        predefinedOptions.commission.transactionCommissionTypes = [];
      }
      predefinedOptions.commission.transactionCommissionTypes.push(data.commission.transactionCommission.type);
      console.log(`Added new transaction commission type: ${data.commission.transactionCommission.type}`);
    }
  }, [data?.commission?.transactionCommission?.type]);

  useEffect(() => {
    setBaseEdit({
      baseAmount: data?.commission?.baseAmount || '',
      base: data?.commission?.base || '',
      minimumVolume: {
        amount: data?.commission?.minimumVolume?.amount || '',
        unit: data?.commission?.minimumVolume?.unit || '',
        period: data?.commission?.minimumVolume?.period || '',
      },
    });
  }, [data]);

  useEffect(() => {
    setTransactionEdit({
      type: data?.commission?.transactionCommission?.type || '',
      amount: data?.commission?.transactionCommission?.amount || '',
    });
  }, [data]);

  useEffect(() => {
    setBonusEdit({
      bonus: data?.commission?.bonus || '',
      bonusAmount: data?.commission?.bonusAmount || '',
    });
  }, [data]);

  // Liste des types valides
  const validTypes = ["Conversion", "Fixed Amount", "Percentage"];
  const transactionType = data?.commission?.transactionCommission?.type;
  const displayType = validTypes.includes(transactionType) && transactionType
    ? transactionType
    : "Fixed Amount";

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
      <div className="relative bg-gradient-to-r from-blue-100 via-blue-50 to-indigo-100 rounded-2xl p-8 shadow-lg transition hover:shadow-xl">
        {/* Bouton stylo en haut à droite */}
        <button
          onClick={() => setIsEditingBase(true)}
          className="absolute top-4 right-4 p-2 rounded-full bg-white border border-blue-200 shadow hover:bg-blue-50 hover:text-blue-700 transition"
          title="Edit base commission"
          style={{ display: isEditingBase ? 'none' : 'block' }}
        >
          <PenSquare className="w-5 h-5" />
        </button>
        {isEditingBase && (
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => {
                onChange({
                  ...data,
                  commission: {
                    ...data.commission,
                    baseAmount: baseEdit.baseAmount,
                    base: baseEdit.base,
                    minimumVolume: {
                      ...data.commission?.minimumVolume,
                      amount: baseEdit.minimumVolume.amount,
                      unit: baseEdit.minimumVolume.unit,
                      period: baseEdit.minimumVolume.period,
                    },
                  },
                });
                setIsEditingBase(false);
              }}
              className="p-2 rounded-full bg-green-100 border border-green-200 hover:bg-green-200"
              title="Valider"
            >
              <span className="text-green-700 font-bold">✔</span>
            </button>
            <button
              onClick={() => {
                setBaseEdit({
                  baseAmount: data?.commission?.baseAmount || '',
                  base: data?.commission?.base || '',
                  minimumVolume: {
                    amount: data?.commission?.minimumVolume?.amount || '',
                    unit: data?.commission?.minimumVolume?.unit || '',
                    period: data?.commission?.minimumVolume?.period || '',
                  },
                });
                setIsEditingBase(false);
              }}
              className="p-2 rounded-full bg-red-100 border border-red-200 hover:bg-red-200"
              title="Annuler"
            >
              <span className="text-red-700 font-bold">✖</span>
            </button>
          </div>
        )}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Coins className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-blue-900">Base Commission</h3>
            <p className="text-base text-blue-700">Set the fixed base rate and requirements</p>
          </div>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Base Amount</label>
              <div className="mt-1 flex items-center gap-2">
                {isEditingBase ? (
                  <input
                    type="text"
                    className="flex-1 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    value={baseEdit.baseAmount}
                    onChange={e => setBaseEdit({ ...baseEdit, baseAmount: e.target.value })}
                  />
                ) : (
                <p className="flex-1 text-gray-900">
                  {getCurrencySymbol()}{data?.commission?.baseAmount || '0'}
                </p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Base Type</label>
              <div className="mt-1 flex items-center gap-2">
                {isEditingBase ? (
                  <select
                    className="flex-1 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    value={baseEdit.base}
                    onChange={e => setBaseEdit({ ...baseEdit, base: e.target.value })}
                  >
                    <option value="">Select type</option>
                    {predefinedOptions.commission.baseTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                    {baseEdit.base && !predefinedOptions.commission.baseTypes.includes(baseEdit.base) && (
                      <option value={baseEdit.base}>{baseEdit.base}</option>
                    )}
                  </select>
                ) : (
                <p className="flex-1 text-gray-900">
                  {data?.commission?.base || 'Not set'}
                </p>
                )}
              </div>
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
                <div className="mt-1 flex items-center gap-2">
                  {isEditingBase ? (
                    <input
                      type="text"
                      className="flex-1 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      value={baseEdit.minimumVolume.amount}
                      onChange={e => setBaseEdit({ ...baseEdit, minimumVolume: { ...baseEdit.minimumVolume, amount: e.target.value } })}
                    />
                  ) : (
                  <p className="flex-1 text-gray-900">
                    {data?.commission?.minimumVolume?.amount || '0'}
                  </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Unit</label>
                <div className="mt-1 flex items-center gap-2">
                  {isEditingBase ? (
                    <select
                      className="flex-1 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      value={baseEdit.minimumVolume.unit}
                      onChange={e => setBaseEdit({ ...baseEdit, minimumVolume: { ...baseEdit.minimumVolume, unit: e.target.value } })}
                    >
                      <option value="">Select unit</option>
                      {predefinedOptions.commission.minimumVolumeUnits.map((unit) => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                      {baseEdit.minimumVolume.unit && !predefinedOptions.commission.minimumVolumeUnits.includes(baseEdit.minimumVolume.unit) && (
                        <option value={baseEdit.minimumVolume.unit}>{baseEdit.minimumVolume.unit}</option>
                      )}
                    </select>
                  ) : (
                  <p className="flex-1 text-gray-900">
                    {data?.commission?.minimumVolume?.unit || 'Not set'}
                  </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Period</label>
                <div className="mt-1 flex items-center gap-2">
                  {isEditingBase ? (
                    <select
                      className="flex-1 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      value={baseEdit.minimumVolume.period}
                      onChange={e => setBaseEdit({ ...baseEdit, minimumVolume: { ...baseEdit.minimumVolume, period: e.target.value } })}
                    >
                      <option value="">Select period</option>
                      {predefinedOptions.commission.minimumVolumePeriods?.map((period) => (
                        <option key={period} value={period}>{period}</option>
                      ))}
                      {baseEdit.minimumVolume.period && !predefinedOptions.commission.minimumVolumePeriods?.includes(baseEdit.minimumVolume.period) && (
                        <option value={baseEdit.minimumVolume.period}>{baseEdit.minimumVolume.period}</option>
                      )}
                    </select>
                  ) : (
                  <p className="flex-1 text-gray-900">
                    {data?.commission?.minimumVolume?.period || 'Not set'}
                  </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Commission */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 relative">
        {/* Bouton stylo en haut à droite */}
        <button
          onClick={() => setIsEditingTransaction(true)}
          className="absolute top-4 right-4 p-2 rounded-full bg-white border border-purple-200 shadow hover:bg-purple-50 hover:text-purple-700 transition"
          title="Edit transaction commission"
          style={{ display: isEditingTransaction ? 'none' : 'block' }}
        >
          <PenSquare className="w-5 h-5" />
        </button>
        {isEditingTransaction && (
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => {
                onChange({
                  ...data,
                  commission: {
                    ...data.commission,
                    transactionCommission: {
                      ...data.commission?.transactionCommission,
                      type: transactionEdit.type,
                      amount: transactionEdit.amount,
                    },
                  },
                });
                setIsEditingTransaction(false);
              }}
              className="p-2 rounded-full bg-green-100 border border-green-200 hover:bg-green-200"
              title="Valider"
            >
              <span className="text-green-700 font-bold">✔</span>
            </button>
            <button
              onClick={() => {
                setTransactionEdit({
                  type: data?.commission?.transactionCommission?.type || '',
                  amount: data?.commission?.transactionCommission?.amount || '',
                });
                setIsEditingTransaction(false);
              }}
              className="p-2 rounded-full bg-red-100 border border-red-200 hover:bg-red-200"
              title="Annuler"
            >
              <span className="text-red-700 font-bold">✖</span>
            </button>
          </div>
        )}
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
            {isEditingTransaction ? (
            <select
                value={transactionEdit.type}
                onChange={e => setTransactionEdit({ ...transactionEdit, type: e.target.value })}
              className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Select type</option>
              <option value="Conversion">Conversion</option>
              <option value="Fixed">Fixed Amount</option>
              <option value="Percentage">Percentage</option>
            </select>
            ) : (
              <p className="mt-1 text-gray-900">{displayType}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount/Percentage</label>
            <div className="mt-1 flex items-center gap-2">
              {isEditingTransaction ? (
                <input
                  type="text"
                  className="flex-1 rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
                  value={transactionEdit.amount}
                  onChange={e => setTransactionEdit({ ...transactionEdit, amount: e.target.value })}
                />
              ) : (
              <p className="flex-1 text-gray-900">
                {data?.commission?.transactionCommission?.type === 'Percentage' ? '%' : getCurrencySymbol()}
                {data?.commission?.transactionCommission?.amount || '0'}
              </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Bonus */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6 relative">
        {/* Bouton stylo en haut à droite */}
        <button
          onClick={() => setIsEditingBonus(true)}
          className="absolute top-4 right-4 p-2 rounded-full bg-white border border-amber-200 shadow hover:bg-amber-50 hover:text-amber-700 transition"
          title="Edit performance bonus"
          style={{ display: isEditingBonus ? 'none' : 'block' }}
        >
          <PenSquare className="w-5 h-5" />
        </button>
        {isEditingBonus && (
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => {
                onChange({
                  ...data,
                  commission: {
                    ...data.commission,
                    bonus: bonusEdit.bonus,
                    bonusAmount: bonusEdit.bonusAmount,
                  },
                });
                setIsEditingBonus(false);
              }}
              className="p-2 rounded-full bg-green-100 border border-green-200 hover:bg-green-200"
              title="Valider"
            >
              <span className="text-green-700 font-bold">✔</span>
            </button>
            <button
              onClick={() => {
                setBonusEdit({
                  bonus: data?.commission?.bonus || '',
                  bonusAmount: data?.commission?.bonusAmount || '',
                });
                setIsEditingBonus(false);
              }}
              className="p-2 rounded-full bg-red-100 border border-red-200 hover:bg-red-200"
              title="Annuler"
            >
              <span className="text-red-700 font-bold">✖</span>
            </button>
          </div>
        )}
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
              {isEditingBonus ? (
              <select
                className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                  value={bonusEdit.bonus}
                  onChange={e => setBonusEdit({ ...bonusEdit, bonus: e.target.value })}
              >
                <option value="">Select bonus type</option>
                {predefinedOptions.commission.bonusTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
                  {bonusEdit.bonus && !predefinedOptions.commission.bonusTypes.includes(bonusEdit.bonus) && (
                    <option value={bonusEdit.bonus}>{bonusEdit.bonus}</option>
                )}
              </select>
              ) : (
                <p className="mt-1 text-gray-900">{data?.commission?.bonus || 'Not set'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bonus Amount</label>
              <div className="mt-1 flex items-center gap-2">
                {isEditingBonus ? (
                  <input
                    type="text"
                    className="flex-1 rounded-lg border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                    value={bonusEdit.bonusAmount}
                    onChange={e => setBonusEdit({ ...bonusEdit, bonusAmount: e.target.value })}
                  />
                ) : (
                <p className="flex-1 text-gray-900">
                  {getCurrencySymbol()}{data?.commission?.bonusAmount || '0'}
                </p>
                )}
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