import React from "react";
import Swal from "sweetalert2";
import Cookies from 'js-cookie';
import axios from 'axios';
import {
  AlertCircle,
  CheckCircle,
  DollarSign,
  Users,
  Globe2,
  Brain,
  Target,
  FileText,
  ArrowRight,
  Star,
  TrendingUp,
  Clock,
  Calendar,
  Languages,
  Building2,
  Briefcase,
  Phone,
  GraduationCap,
  Award,
  Laptop,
  Shield,
  ArrowLeft,
  Coins,
  BookOpen,
} from "lucide-react";
import { GigData } from "../types";
import { predefinedOptions } from "../lib/guidance";
import { validateGigData } from "../lib/validation";
import { saveGigData } from '../lib/api';

interface GigReviewProps {
  data: GigData;
  onEdit: (section: string) => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  onBack: () => void;
  skipValidation?: boolean;
}

export function GigReview({
  data,
  onEdit,
  onSubmit,
  isSubmitting,
  onBack,
  skipValidation = false,
}: GigReviewProps) {
  const validation = skipValidation ? { isValid: true, errors: {}, warnings: {} } : validateGigData(data);
  const hasErrors = Object.keys(validation.errors).length > 0;
  const hasWarnings = Object.keys(validation.warnings).length > 0;

  const getCurrencySymbol = () => {
    if (!data.commission) {
      return "$";
    }
    return data.commission.currency
      ? predefinedOptions.commission.currencies.find(
          (c) => c.code === data.commission.currency
        )?.symbol || "$"
      : "$";
  };

  const handlePublish = async () => {
    try {
      await saveGigData(data);
      await onSubmit();
      Swal.fire({
        title: "Success!",
        text: "Your gig has been published successfully.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        window.location.href = "/app11";
      });
    } catch (error) {
      console.error('Error publishing gig:', error);
      Swal.fire({
        title: "Error!",
        text: error instanceof Error ? error.message : "An unknown error occurred.",
        icon: "error",
        confirmButtonText: "Try Again",
      });
    }
  };

  const renderValidationSummary = () => (
    <div className="mb-6 space-y-4">
      {hasErrors && (
        <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-800">
              Please fix the following issues:
            </h3>
            <ul className="mt-2 space-y-1 text-sm text-red-700">
              {Object.entries(validation.errors).map(([section, errors]) => (
                <li key={section} className="flex items-start gap-2">
                  <span>•</span>
                  <div>
                    <span className="font-medium capitalize">{section}:</span>
                    <span> {errors.join(", ")}</span>
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
              {Object.entries(validation.warnings).map(
                ([section, warnings]) => (
                  <li key={section} className="flex items-start gap-2">
                    <span>•</span>
                    <div>
                      <span className="font-medium capitalize">{section}:</span>
                      <span> {warnings.join(", ")}</span>
                      <button
                        onClick={() => onEdit(section)}
                        className="ml-2 text-yellow-800 hover:text-yellow-900 underline"
                      >
                        Review
                      </button>
                    </div>
                  </li>
                )
              )}
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
              All required information has been provided and validated. You can
              now publish your gig.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Edit</span>
          </button>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Review Gig Details
          </h1>
          <button
            onClick={handlePublish}
            disabled={isSubmitting || hasErrors}
            className={`px-6 py-2 text-white rounded-lg flex items-center gap-2 ${
              hasErrors
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <span>
                {hasErrors ? "Fix Issues to Publish" : "Publish GigA"}
              </span>
            )}
          </button>
        </div>

        {renderValidationSummary()}

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-8">
          {/* Key Metrics */}
          <div className="col-span-3 grid grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 text-gray-700 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h3 className="font-medium">Base Commission</h3>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {getCurrencySymbol()}
                {data?.commission?.baseAmount || "0"}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {data?.commission?.base || "No base commission"}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 text-gray-700 mb-2">
                <Star className="w-5 h-5 text-purple-600" />
                <h3 className="font-medium">Performance Bonus</h3>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {data?.commission?.bonus
                  ? `${getCurrencySymbol()}${data?.commission?.bonusAmount || "0"}`
                  : "N/A"}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {data?.commission?.bonus || "No bonus structure"}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 text-gray-700 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium">Team Size</h3>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {data.team?.size || '0'}
              </div>
              <p className="text-sm text-gray-600 mt-1">Target Team Size</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 text-gray-700 mb-2">
                <Globe2 className="w-5 h-5 text-orange-600" />
                <h3 className="font-medium">Coverage</h3>
              </div>
              <div className="text-lg font-bold text-gray-900">
                {data.schedule?.hours || 'Not specified'}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {data.schedule?.timeZones?.join(", ") || 'No time zones specified'}
              </p>
            </div>
          </div>

          {/* Main Content Column */}
          <div className="col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-gray-600" />
                  Basic Information
                </h2>
              </div>
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {data?.title || 'No title provided'}
                </h1>
                <p className="text-gray-700">{data?.description || 'No description provided'}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {data?.category && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {data.category}
                    </span>
                  )}
                  {data?.seniority?.level && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                      {data.seniority.level}
                    </span>
                  )}
                  {data?.seniority?.yearsExperience && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {data.seniority.yearsExperience} Experience
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Commission Structure */}
            {data?.commission && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Commission Structure
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  {/* Base Commission */}
                  {data.commission.base && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Base Commission
                      </h3>
                      <div className="bg-white rounded-lg border border-green-100 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold text-gray-900">
                              {getCurrencySymbol()}
                              {data.commission.baseAmount || '0'}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {data.commission.base}
                            </div>
                          </div>
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        {data.commission.minimumVolume && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="text-sm text-gray-600">
                              Minimum Requirements:
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                {data.commission.minimumVolume.amount}{" "}
                                {data.commission.minimumVolume.unit}
                              </div>
                              <span className="text-sm text-gray-600">
                                per {data.commission.minimumVolume.period}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Performance Bonus */}
                  {data.commission.bonus && data.commission.bonusAmount && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Performance Bonus
                      </h3>
                      <div className="bg-white rounded-lg border border-blue-100 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold text-gray-900">
                              {getCurrencySymbol()}
                              {data.commission.bonusAmount}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {data.commission.bonus}
                            </div>
                          </div>
                          <Star className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Transaction Commission */}
                  {data.commission.transactionCommission?.type && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Transaction Commission
                      </h3>
                      <div className="bg-white rounded-lg border border-purple-100 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold text-gray-900">
                              {data.commission.transactionCommission.type === "percentage"
                                ? `${data.commission.transactionCommission.amount}%`
                                : `${getCurrencySymbol()}${
                                    data.commission.transactionCommission.amount
                                  }`}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {data.commission.transactionCommission.type === "percentage"
                                ? "Per Transaction Value"
                                : "Per Transaction"}
                            </div>
                          </div>
                          <Coins className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Additional Details */}
                  {data.commission.structure && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Additional Details
                      </h3>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {data.commission.structure}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Schedule */}
            {data?.schedule && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    Schedule
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-6">
                    {data.schedule.days && data.schedule.days.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">
                          Working Days
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {data.schedule.days.map((day) => (
                            <span
                              key={day}
                              className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                            >
                              {day}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {data.schedule.hours && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">
                          Working Hours
                        </h3>
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-900">
                            {data.schedule.hours}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {data.schedule.timeZones && data.schedule.timeZones.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        Time Zones
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {data.schedule.timeZones.map((zone) => (
                          <span
                            key={zone}
                            className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                          >
                            {zone}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {data.schedule.flexibility && data.schedule.flexibility.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        Flexibility Options
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {data.schedule.flexibility.map((option) => (
                          <span
                            key={option}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {option}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Lead Distribution */}
            {data?.leads && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    Lead Distribution
                  </h2>
                </div>
                <div className="p-6">
                  {data.leads.types && data.leads.types.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                      {data.leads.types.map((lead) => (
                        <div
                          key={lead.type}
                          className="bg-gradient-to-b from-purple-50 to-white rounded-lg p-4 border border-purple-100"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900 capitalize">
                              {lead.type} Leads
                            </h4>
                            <span className="text-sm font-semibold text-purple-600">
                              {lead.percentage}%
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {lead.description}
                          </p>
                          {lead.conversionRate && (
                            <div className="mt-3 flex items-center gap-2 text-sm text-purple-700">
                              <TrendingUp className="w-4 h-4" />
                              <span>{lead.conversionRate}% avg. conversion</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {data.leads.sources && data.leads.sources.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        Lead Sources
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {data.leads.sources.map((source) => (
                          <span
                            key={source}
                            className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                          >
                            {source}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Skills Required */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-600" />
                  Required Skills
                </h2>
              </div>
              <div className="p-6 space-y-6">
                {/* Languages */}
                {data.skills?.languages?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Languages className="w-4 h-4 text-gray-400" />
                      Languages
                    </h3>
                    <div className="space-y-2">
                      {data.skills.languages.map((lang, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                        >
                          <span className="text-gray-900">{lang.name}</span>
                          <span className="text-sm text-gray-600">
                            {lang.level}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Professional Skills */}
                {data.skills?.professional?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-gray-400" />
                      Professional Skills
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {data.skills.professional.map((skill, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 bg-indigo-50 text-indigo-700 rounded-lg"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technical Skills */}
                {data.skills?.technical?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Laptop className="w-4 h-4 text-gray-400" />
                      Technical Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {data.skills.technical.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {data.skills?.certifications?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4 text-gray-400" />
                      Required Certifications
                    </h3>
                    <div className="space-y-2">
                      {data.skills.certifications.map((cert, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 bg-yellow-50 text-yellow-700 rounded-lg"
                        >
                          <Shield className="w-4 h-4" />
                          <span className="text-sm">{cert.name}</span>
                          {cert.required && (
                            <span className="text-xs bg-yellow-200 px-2 py-0.5 rounded-full ml-auto">
                              Required
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Documentation */}
            {Object.entries(data.documentation || {}).map(([type, docs]) => {
              if (!docs || docs.length === 0) return null;
              return (
                <div key={type}>
                  <h3 className="text-sm font-medium text-gray-700 capitalize mb-2">
                    {type} Documentation
                  </h3>
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
      </div>
    </div>
  );
}
