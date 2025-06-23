import React, { useState } from "react";
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
  Briefcase,
  Award,
  Laptop,
  Shield,
  ArrowLeft,
  Coins,
  BookOpen,
  MapPin,
  Edit3,
  Check,
  AlertTriangle,
  X,
} from "lucide-react";
import { GigData } from "../types";
import { predefinedOptions } from "../lib/guidance";
import { validateGigData } from "../lib/validation";
import { saveGigData } from '../lib/api';
import { groupSchedules } from "../lib/scheduleUtils";

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
    <div className="mb-8 space-y-4">
      {hasErrors && (
        <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-red-50 to-red-100 rounded-2xl border border-red-200 shadow-sm">
          <div className="flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-red-800 text-lg mb-3">
              Please fix the following issues:
            </h3>
            <ul className="space-y-2 text-sm text-red-700">
              {Object.entries(validation.errors).map(([section, errors]) => (
                <li key={section} className="flex items-start gap-3">
                  <span className="text-red-600 font-bold">•</span>
                  <div className="flex-1">
                    <span className="font-semibold capitalize">{section}:</span>
                    <span> {errors.join(", ")}</span>
                    <button
                      onClick={() => onEdit(section)}
                      className="ml-3 text-red-800 hover:text-red-900 underline font-medium transition-colors"
                    >
                      Fix Now
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {hasWarnings && (
        <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-amber-50 to-yellow-100 rounded-2xl border border-yellow-200 shadow-sm">
          <div className="flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-800 text-lg mb-3">Recommendations:</h3>
            <ul className="space-y-2 text-sm text-yellow-700">
              {Object.entries(validation.warnings).map(
                ([section, warnings]) => (
                  <li key={section} className="flex items-start gap-3">
                    <span className="text-yellow-600 font-bold">•</span>
                    <div className="flex-1">
                      <span className="font-semibold capitalize">{section}:</span>
                      <span> {warnings.join(", ")}</span>
                      <button
                        onClick={() => onEdit(section)}
                        className="ml-3 text-yellow-800 hover:text-yellow-900 underline font-medium transition-colors"
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
        <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-emerald-50 to-green-100 rounded-2xl border border-green-200 shadow-sm">
          <div className="flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-green-800 text-lg mb-2">Ready to Publish</h3>
            <p className="text-green-700">
              All required information has been provided and validated. You can
              now publish your gig with confidence.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto py-12 px-6">
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-3 text-slate-600 hover:text-slate-900 transition-colors duration-200 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Edit</span>
          </button>
        </div>

        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Review Gig Details
            </h1>
            <p className="text-slate-600 text-lg">
              Final review before publishing your gig
            </p>
          </div>
          <button
            onClick={handlePublish}
            disabled={isSubmitting || hasErrors}
            className={`px-8 py-4 text-white rounded-xl flex items-center gap-3 font-semibold text-lg shadow-lg transition-all duration-200 ${
              hasErrors
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105"
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>
                  {hasErrors ? "Fix Issues to Publish" : "Publish Gig"}
                </span>
              </>
            )}
          </button>
        </div>

        {renderValidationSummary()}

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-10">
          {/* Key Metrics */}
          <div className="col-span-3 grid grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-3 text-slate-700 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg">Base Commission</h3>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-2">
                {getCurrencySymbol()}
                {data?.commission?.baseAmount || "0"}
              </div>
              <p className="text-slate-600">
                {data?.commission?.base || "No base commission"}
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-3 text-slate-700 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg">Performance Bonus</h3>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-2">
                {data?.commission?.bonus
                  ? `${getCurrencySymbol()}${data?.commission?.bonusAmount || "0"}`
                  : "N/A"}
              </div>
              <p className="text-slate-600">
                {data?.commission?.bonus || "No bonus structure"}
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-3 text-slate-700 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg">Team Size</h3>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-2">
                {data.team?.size || '0'}
              </div>
              <p className="text-slate-600">Target Team Size</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-3 text-slate-700 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Globe2 className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-lg">Coverage</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-xl font-bold text-slate-900">
                    {data.schedule?.schedules?.[0]?.hours?.start || 'Not specified'} - {data.schedule?.schedules?.[0]?.hours?.end || 'Not specified'}
                  </div>
                  <p className="text-sm text-slate-600">Working Hours</p>
                </div>
                {data.schedule?.schedules && data.schedule.schedules.length > 0 && (
                  <div>
                    <div className="text-sm font-semibold text-slate-700 mb-1">Working Days</div>
                    <div className="flex flex-wrap gap-1">
                      {data.schedule.schedules.map((schedule, index) => (
                        schedule.day && (
                          <span
                            key={index}
                            className="px-2 py-1 bg-orange-100 text-orange-700 rounded-md text-xs font-medium"
                          >
                            {schedule.day}
                          </span>
                        )
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-sm font-semibold text-slate-700 mb-1">Time Zones</div>
                  <p className="text-sm text-slate-600">
                    {data.schedule?.timeZones?.join(", ") || 'No time zones specified'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Column */}
          <div className="col-span-2 space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 px-8 py-6">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <div className="p-2 bg-slate-200 rounded-lg">
                    <Briefcase className="w-6 h-6 text-slate-600" />
                  </div>
                  Basic Information
                </h2>
              </div>
              <div className="p-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-4">
                  {data?.title || 'No title provided'}
                </h1>
                <p className="text-slate-700 text-lg leading-relaxed mb-6">{data?.description || 'No description provided'}</p>
                <div className="flex flex-wrap gap-3">
                  {data?.category && (
                    <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                      {data.category}
                    </span>
                  )}
                  {data?.seniority?.level && (
                    <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                      {data.seniority.level}
                    </span>
                  )}
                  {data?.seniority?.yearsExperience && (
                    <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                      {data.seniority.yearsExperience} Years Experience
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Commission Structure */}
            {data?.commission && (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 px-8 py-6">
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    <div className="p-2 bg-green-200 rounded-lg">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    Commission Structure
                  </h2>
                </div>
                <div className="p-8 space-y-8">
                  {/* Base Commission */}
                  {data.commission.base && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                      <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        Base Commission
                      </h3>
                      <div className="bg-white rounded-xl border border-green-100 p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-3xl font-bold text-slate-900">
                              {getCurrencySymbol()}
                              {data.commission.baseAmount || '0'}
                            </div>
                            <div className="text-slate-600 mt-2">
                              {data.commission.base}
                            </div>
                          </div>
                          <div className="p-3 bg-green-100 rounded-full">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                          </div>
                        </div>
                        {data.commission.minimumVolume && (
                          <div className="mt-6 pt-6 border-t border-slate-100">
                            <div className="text-sm font-semibold text-slate-700 mb-3">
                              Minimum Requirements:
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                                {data.commission.minimumVolume.amount}{" "}
                                {data.commission.minimumVolume.unit}
                              </div>
                              <span className="text-sm text-slate-600">
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
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                      <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                        <Star className="w-6 h-6 text-blue-600" />
                        Performance Bonus
                      </h3>
                      <div className="bg-white rounded-xl border border-blue-100 p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-3xl font-bold text-slate-900">
                              {getCurrencySymbol()}
                              {data.commission.bonusAmount}
                            </div>
                            <div className="text-slate-600 mt-2">
                              {data.commission.bonus}
                            </div>
                          </div>
                          <div className="p-3 bg-blue-100 rounded-full">
                            <Star className="w-8 h-8 text-blue-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Transaction Commission */}
                  {data.commission.transactionCommission?.type && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                      <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                        <Coins className="w-6 h-6 text-purple-600" />
                        Transaction Commission
                      </h3>
                      <div className="bg-white rounded-xl border border-purple-100 p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-3xl font-bold text-slate-900">
                              {data.commission.transactionCommission.type === "percentage"
                                ? `${data.commission.transactionCommission.amount}%`
                                : `${getCurrencySymbol()}${
                                    data.commission.transactionCommission.amount
                                  }`}
                            </div>
                            <div className="text-slate-600 mt-2">
                              {data.commission.transactionCommission.type === "percentage"
                                ? "Per Transaction Value"
                                : "Per Transaction"}
                            </div>
                          </div>
                          <div className="p-3 bg-purple-100 rounded-full">
                            <Coins className="w-8 h-8 text-purple-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Additional Details */}
                  {data.commission.structure && (
                    <div className="bg-slate-50 rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-slate-900 mb-4">
                        Additional Details
                      </h3>
                      <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {data.commission.structure}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Schedule */}
            {data?.schedule && (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 px-8 py-6">
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    <div className="p-2 bg-orange-200 rounded-lg">
                      <Calendar className="w-6 h-6 text-orange-600" />
                    </div>
                    Schedule
                  </h2>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-2 gap-8">
                    {data.schedule.schedules && data.schedule.schedules.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-orange-500" />
                          Working Days
                        </h3>
                        <div className="space-y-3">
                          {groupSchedules(data.schedule.schedules).map((group, index) => (
                            <div
                              key={`${group.hours.start}-${group.hours.end}-${index}`}
                              className="bg-orange-50 border border-orange-200 rounded-xl p-4"
                            >
                              <div className="flex flex-wrap gap-2">
                                {group.days.map((day, dayIndex) => (
                                  <span
                                    key={dayIndex}
                                    className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold"
                                  >
                                    {day}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {data.schedule.schedules && data.schedule.schedules.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-orange-500" />
                          Working Hours
                        </h3>
                        <div className="space-y-3">
                          {groupSchedules(data.schedule.schedules).map((group, index) => (
                            <div key={`hours-${index}`} className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                              <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-orange-600" />
                                <span className="text-lg font-semibold text-slate-900">
                                  {group.hours.start} - {group.hours.end}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {data.schedule.timeZones && data.schedule.timeZones.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                        <Globe2 className="w-5 h-5 text-slate-500" />
                        Time Zones
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {data.schedule.timeZones.map((zone) => (
                          <span
                            key={zone}
                            className="px-4 py-2 bg-slate-100 text-slate-800 rounded-full text-sm font-semibold"
                          >
                            {zone}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {data.schedule.flexibility && data.schedule.flexibility.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-500" />
                        Flexibility Options
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {data.schedule.flexibility.map((option) => (
                          <span
                            key={option}
                            className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold"
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
            {/* {data?.leads && (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 px-8 py-6">
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    <div className="p-2 bg-purple-200 rounded-lg">
                      <Target className="w-6 h-6 text-purple-600" />
                    </div>
                    Lead Distribution
                  </h2>
                </div>
                <div className="p-8">
                  {data.leads.types && data.leads.types.length > 0 && (
                    <div className="grid grid-cols-3 gap-6">
                      {data.leads.types.map((lead) => (
                        <div
                          key={lead.type}
                          className="bg-gradient-to-b from-purple-50 to-white rounded-xl p-6 border border-purple-100 shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-slate-900 capitalize">
                              {lead.type} Leads
                            </h4>
                            <span className="text-lg font-bold text-purple-600">
                              {lead.percentage}%
                            </span>
                          </div>
                          <p className="text-slate-600 mb-4">
                            {lead.description}
                          </p>
                          {lead.conversionRate && (
                            <div className="flex items-center gap-2 text-sm text-purple-700">
                              <TrendingUp className="w-4 h-4" />
                              <span>{lead.conversionRate}% avg. conversion</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {data.leads.sources && data.leads.sources.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold text-slate-700 mb-4">
                        Lead Sources
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {data.leads.sources.map((source) => (
                          <span
                            key={source}
                            className="px-4 py-2 bg-slate-100 text-slate-800 rounded-full text-sm font-semibold"
                          >
                            {source}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )} */}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Skills Required */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                  <div className="p-2 bg-indigo-200 rounded-lg">
                    <Brain className="w-5 h-5 text-indigo-600" />
                  </div>
                  Required Skills
                </h2>
              </div>
              <div className="p-6 space-y-8">
                {/* Languages */}
                {data.skills?.languages?.length > 0 && (
                  <div>
                    <h3 className="text-base font-semibold text-slate-700 mb-4 flex items-center gap-2">
                      <Languages className="w-5 h-5 text-slate-500" />
                      Languages
                    </h3>
                    <div className="space-y-3">
                      {data.skills.languages.map((lang, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-slate-50 px-4 py-3 rounded-xl border border-slate-200"
                        >
                          <span className="font-semibold text-slate-900">{lang.language}</span>
                          <span className="text-sm text-slate-600 bg-slate-200 px-2 py-1 rounded-full">
                            {lang.proficiency}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Professional Skills */}
                {data.skills?.professional?.length > 0 && (
                  <div>
                    <h3 className="text-base font-semibold text-slate-700 mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-slate-500" />
                      Professional Skills
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {data.skills.professional.map((skill, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-200"
                        >
                          <CheckCircle className="w-5 h-5 text-indigo-600" />
                          <span className="text-sm font-semibold flex-1">{skill.skill}</span>
                          <span className="text-xs bg-indigo-200 px-2 py-1 rounded-full font-semibold">
                            Level {skill.level}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technical Skills */}
                {data.skills?.technical?.length > 0 && (
                  <div>
                    <h3 className="text-base font-semibold text-slate-700 mb-4 flex items-center gap-2">
                      <Laptop className="w-5 h-5 text-slate-500" />
                      Technical Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {data.skills.technical.map((skill, index) => (
                        <div
                          key={index}
                          className="px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold flex items-center gap-2"
                        >
                          {skill.skill}
                          <span className="text-xs bg-blue-200 px-2 py-0.5 rounded-full">
                            Level {skill.level}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {data.skills?.certifications?.length > 0 && (
                  <div>
                    <h3 className="text-base font-semibold text-slate-700 mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-slate-500" />
                      Required Certifications
                    </h3>
                    <div className="space-y-3">
                      {data.skills.certifications.map((cert, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-yellow-50 text-yellow-700 rounded-xl border border-yellow-200"
                        >
                          <Shield className="w-5 h-5 text-yellow-600" />
                          <span className="text-sm font-semibold flex-1">{cert.name}</span>
                          {cert.required && (
                            <span className="text-xs bg-yellow-200 px-2 py-1 rounded-full font-semibold">
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
                <div key={type} className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-900 capitalize mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-slate-600" />
                    {type} Documentation
                  </h3>
                  <ul className="space-y-3">
                    {docs.map((doc: { name: string; url: string }, index: number) => (
                      <li key={index}>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-sm text-blue-600 hover:text-blue-800 p-3 bg-blue-50 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors duration-200"
                        >
                          <FileText className="w-4 h-4" />
                          <span className="flex-1 font-medium">{doc.name}</span>
                          <ArrowRight className="w-4 h-4" />
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
