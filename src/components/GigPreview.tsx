import React from 'react';
import { AlertCircle, CheckCircle, DollarSign, Users, Globe2, Brain, Target, FileText, ArrowRight, Star, TrendingUp, Clock } from 'lucide-react';
import { Dialog } from './Dialog';
import { GigData } from '../types';
import { predefinedOptions } from '../lib/guidance';
import { validateGigData } from '../lib/validation';

interface GigPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  data: GigData;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  onEdit: (section: string) => void;
  skipValidation?: boolean;
}

export function GigPreview({ isOpen, onClose, data, onSubmit, isSubmitting, onEdit, skipValidation = false }: GigPreviewProps) {
  const validation = skipValidation ? { isValid: true, errors: {}, warnings: {} } : validateGigData(data);
  const hasErrors = Object.keys(validation.errors).length > 0;
  const hasWarnings = Object.keys(validation.warnings).length > 0;

  const getCurrencySymbol = () => {
    return data?.commission?.currency ? 
      predefinedOptions.commission.currencies.find(c => c.code === data?.commission?.currency)?.symbol || '$'
      : '$';
  };

  const renderValidationSummary = () => (
    <div className="mb-6 space-y-4">
      {hasErrors && (
        <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-800">Please fix the following issues:</h3>
            <ul className="mt-2 space-y-1 text-sm text-red-700">
              {Object.entries(validation.errors).map(([section, errors]) => (
                <li key={section} className="flex items-start gap-2">
                  <span>•</span>
                  <div>
                    <span className="font-medium capitalize">{section}:</span>
                    <span> {errors.join(', ')}</span>
                    <button 
                      onClick={() => onEdit(section)}
                      className="ml-2 text-red-800 hover:text-red-900 underline"
                    >
                      Fix
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {hasWarnings && (
        <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-800">Recommendations:</h3>
            <ul className="mt-2 space-y-1 text-sm text-yellow-700">
              {Object.entries(validation.warnings).map(([section, warnings]) => (
                <li key={section} className="flex items-start gap-2">
                  <span>•</span>
                  <div>
                    <span className="font-medium capitalize">{section}:</span>
                    <span> {warnings.join(', ')}</span>
                    <button 
                      onClick={() => onEdit(section)}
                      className="ml-2 text-yellow-800 hover:text-yellow-900 underline"
                    >
                      Review
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {!hasErrors && !hasWarnings && (
        <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-green-800">Ready to Publish</h3>
            <p className="mt-1 text-sm text-green-700">
              All required information has been provided and validated. You can now publish your gig.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Review Gig Details">
      <div className="space-y-8">
        {renderValidationSummary()}

        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 -mx-6 -mt-6 p-6 text-white rounded-t-lg">
          <h2 className="text-3xl font-bold mb-3">{data.title || 'Untitled Gig'}</h2>
          <p className="text-blue-100 text-lg">{data.description || 'No description provided'}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
              {data.category}
            </span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
              {data.seniority?.level}
            </span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
              {data.seniority?.yearsExperience} Experience
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Key Metrics */}
          <div className="col-span-3 grid grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <DollarSign className="w-5 h-5" />
                <h3 className="font-medium">Base Commission</h3>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {getCurrencySymbol()}{data?.commission?.baseAmount || '0'}
              </div>
              <p className="text-sm text-blue-600 mt-1">{data?.commission?.base || 'No base commission'}</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <div className="flex items-center gap-2 text-purple-700 mb-2">
                <Users className="w-5 h-5" />
                <h3 className="font-medium">Team Size</h3>
              </div>
              <div className="text-2xl font-bold text-purple-900">{data.team?.size}</div>
              <p className="text-sm text-purple-600 mt-1">Target Team Size</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <TrendingUp className="w-5 h-5" />
                <h3 className="font-medium">Performance Bonus</h3>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {data?.commission?.bonus ? `${getCurrencySymbol()}${data?.commission?.bonusAmount || '0'}` : 'N/A'}
              </div>
              <p className="text-sm text-green-600 mt-1">{data?.commission?.bonus || 'No bonus structure'}</p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
              <div className="flex items-center gap-2 text-orange-700 mb-2">
                <Clock className="w-5 h-5" />
                <h3 className="font-medium">Schedule</h3>
              </div>
              <div className="text-lg font-bold text-orange-900">{data.schedule?.hours}</div>
              <p className="text-sm text-orange-600 mt-1">{data.schedule?.timeZones?.join(', ')}</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Commission Structure */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <DollarSign className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-semibold text-gray-900">Commission Structure</h3>
              </div>

              <div className="space-y-6">
                {/* Base Commission */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-3">Base Commission</h4>
                  <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-green-100">
                    <div>
                      <div className="text-sm text-gray-600">{data?.commission?.base}</div>
                      <div className="text-2xl font-bold text-gray-900 mt-1">
                        {getCurrencySymbol()}{data?.commission?.baseAmount || '0'}
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-green-600" />
                  </div>
                </div>

                {/* Performance Bonus */}
                {data?.commission?.bonus && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-3">Performance Bonus</h4>
                    <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-blue-100">
                      <div>
                        <div className="text-sm text-gray-600">{data?.commission?.bonus}</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">
                          {getCurrencySymbol()}{data?.commission?.bonusAmount || '0'}
                        </div>
                      </div>
                      <Star className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                )}

                {/* Additional Details */}
                {data?.commission?.structure && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Additional Details</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{data?.commission?.structure}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Lead Distribution */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Target className="w-6 h-6 text-orange-600" />
                <h3 className="text-xl font-semibold text-gray-900">Lead Distribution</h3>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {data.leads?.types.map((lead) => (
                  <div key={lead.type} className="bg-gradient-to-b from-orange-50 to-white rounded-lg p-4 border border-orange-100">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 capitalize">{lead.type} Leads</h4>
                      <span className="text-sm font-semibold text-orange-600">{lead.percentage}%</span>
                    </div>
                    <p className="text-sm text-gray-600">{lead.description}</p>
                  </div>
                ))}
              </div>

              {data.leads?.sources.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Lead Sources</h4>
                  <div className="flex flex-wrap gap-2">
                    {data.leads.sources.map((source) => (
                      <span key={source} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Skills Required */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Required Skills</h3>
              </div>

              <div className="space-y-4">
                {/* Languages */}
                {data.skills?.languages?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Languages</h4>
                    <div className="space-y-2">
                      {data.skills.languages.map((lang, index) => (
                        <div key={index} className="flex items-center justify-between bg-purple-50 px-3 py-2 rounded-lg">
                          <span className="text-purple-900">{lang.name}</span>
                          <span className="text-sm text-purple-700">{lang.level}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Professional Skills */}
                {data.skills?.professional?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Professional Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {data.skills.professional.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Documentation */}
            {Object.values(data.documentation).some(docs => docs.length > 0) && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Documentation</h3>
                </div>

                <div className="space-y-4">
                  {Object.entries(data.documentation).map(([type, docs]) => {
                    if (docs.length === 0) return null;
                    return (
                      <div key={type}>
                        <h4 className="text-sm font-medium text-gray-700 capitalize mb-2">{type}</h4>
                        <ul className="space-y-2">
                          {docs.map((doc, index) => (
                            <li key={index}>
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                              >
                                <FileText className="w-4 h-4" />
                                <span className="flex-1">{doc.name}</span>
                                <ArrowRight className="w-3 h-3" />
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back to Edit
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting || hasErrors}
            className={`px-4 py-2 text-white rounded-md flex items-center gap-2 ${
              hasErrors 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <span>{hasErrors ? 'Fix Issues to Publish' : 'Publish Gig'}</span>
            )}
          </button>
        </div>
      </div>
    </Dialog>
  );
}