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
  Zap,
  Heart,
  Eye,
  BarChart3,
  Phone,
  Mail,
  Building,
  UserCheck,
  Target as TargetIcon,
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
      return "€";
    }
    return data.commission.currency
      ? predefinedOptions.commission.currencies.find(
          (c) => c.code === data.commission.currency
        )?.symbol || "€"
      : "€";
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <h3 className="font-semibold text-red-800 text-lg">Issues to Resolve</h3>
          </div>
          <ul className="space-y-3">
            {Object.entries(validation.errors).map(([section, errors]) => (
              <li key={section} className="flex items-start gap-3 bg-red-100 p-3 rounded-md">
                <span className="text-red-600 font-bold">⚠</span>
                <div className="flex-1">
                  <span className="font-semibold capitalize text-red-800">{section}:</span>
                  <span className="ml-2 text-red-700"> {errors.join(", ")}</span>
                  <button
                    onClick={() => onEdit(section)}
                    className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
                  >
                    Fix Now
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasWarnings && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800 text-lg">Recommendations</h3>
          </div>
          <ul className="space-y-3">
            {Object.entries(validation.warnings).map(
              ([section, warnings]) => (
                <li key={section} className="flex items-start gap-3 bg-yellow-100 p-3 rounded-md">
                  <span className="text-yellow-600 font-bold">💡</span>
                  <div className="flex-1">
                    <span className="font-semibold capitalize text-yellow-800">{section}:</span>
                    <span className="ml-2 text-yellow-700"> {warnings.join(", ")}</span>
                    <button
                      onClick={() => onEdit(section)}
                      className="ml-4 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md text-sm font-medium transition-colors"
                    >
                      Review
                    </button>
                  </div>
                </li>
              )
            )}
          </ul>
        </div>
      )}

      {!hasErrors && !hasWarnings && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <div>
              <h3 className="font-semibold text-green-800 text-lg">Ready to Publish! 🚀</h3>
              <p className="text-green-700">
                All required information has been provided and validated. Your gig is ready to go live!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Edit</span>
          </button>
        </div>

        {/* Title Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Review Gig Details
            </h1>
            <p className="text-gray-600">
              Final review before launching your opportunity
            </p>
          </div>
          <button
            onClick={handlePublish}
            disabled={isSubmitting || hasErrors}
            className={`px-6 py-3 text-white rounded-lg flex items-center gap-3 font-semibold transition-colors ${
              hasErrors
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>
                  {hasErrors ? "Fix Issues to Publish" : "Launch Gig"}
                </span>
              </>
            )}
          </button>
        </div>

        {renderValidationSummary()}

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Base Salary</h3>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {getCurrencySymbol()}
              {data?.commission?.baseAmount || "0"}
            </div>
            <p className="text-gray-600 text-sm">
              {data?.commission?.base || "No base salary"}
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Performance Bonus</h3>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {data?.commission?.bonus
                ? `${getCurrencySymbol()}${data?.commission?.bonusAmount || "0"}`
                : "N/A"}
            </div>
            <p className="text-gray-600 text-sm">
              {data?.commission?.bonus || "No bonus structure"}
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Team Size</h3>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {data.team?.size || '0'}
            </div>
            <p className="text-gray-600 text-sm">Team Members</p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Globe2 className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Coverage</h3>
            </div>
            <div className="space-y-3">
              {data.schedule?.schedules && data.schedule.schedules.length > 0 ? (
                groupSchedules(data.schedule.schedules).map((group, index) => (
                  <div key={`coverage-${index}`} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="text-lg font-bold text-gray-900 mb-1">
                      {group.hours.start} - {group.hours.end}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">Working Hours</p>
                    <div className="flex flex-wrap gap-1">
                      {group.days.map((day, dayIndex) => (
                        <span
                          key={`${day}-${dayIndex}`}
                          className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium"
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-600 text-xs mt-1">Working Days</p>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm">No schedule specified</div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Content Column */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                  <Briefcase className="w-6 h-6 text-gray-600" />
                  Basic Information
                </h2>
              </div>
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  {data?.title || 'No title provided'}
                </h1>
                <p className="text-gray-700 mb-6 leading-relaxed">{data?.description || 'No description provided'}</p>
                <div className="flex flex-wrap gap-3">
                  {data?.category && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {data.category}
                    </span>
                  )}
                  {data?.seniority?.level && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                      {data.seniority.level}
                    </span>
                  )}
                  {data?.seniority?.yearsExperience && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {data.seniority.yearsExperience} Years Experience
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Commission Structure */}
            {data?.commission && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                    <DollarSign className="w-6 h-6 text-gray-600" />
                    Commission Structure
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  {/* Base Commission */}
                  {data.commission.base && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Base Commission
                      </h3>
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-3xl font-bold text-gray-900 mb-2">
                              {getCurrencySymbol()}
                              {data.commission.baseAmount || '0'}
                            </div>
                            <div className="text-gray-700">
                              {data.commission.base}
                            </div>
                          </div>
                        </div>
                        {data.commission.minimumVolume && (
                          <div className="mt-4 pt-4 border-t border-green-200">
                            <div className="text-sm font-semibold text-gray-700 mb-2">
                              Minimum Requirements:
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                {data.commission.minimumVolume.amount}{" "}
                                {data.commission.minimumVolume.unit}
                              </span>
                              <span className="text-gray-600 text-sm">
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
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-3">
                        <Star className="w-5 h-5 text-blue-600" />
                        Performance Bonus
                      </h3>
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-3xl font-bold text-gray-900 mb-2">
                              {getCurrencySymbol()}
                              {data.commission.bonusAmount}
                            </div>
                            <div className="text-gray-700">
                              {data.commission.bonus}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Transaction Commission */}
                  {data.commission.transactionCommission?.type && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-3">
                        <Coins className="w-5 h-5 text-purple-600" />
                        Transaction Commission
                      </h3>
                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-3xl font-bold text-gray-900 mb-2">
                              {data.commission.transactionCommission.type === "percentage"
                                ? `${data.commission.transactionCommission.amount}%`
                                : `${getCurrencySymbol()}${
                                    data.commission.transactionCommission.amount
                                  }`}
                            </div>
                            <div className="text-gray-700">
                              {data.commission.transactionCommission.type === "percentage"
                                ? "Per Transaction Value"
                                : "Per Transaction"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Additional Details */}
                  {data.commission.structure && (
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Additional Details
                      </h3>
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {data.commission.structure}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Schedule */}
            {data?.schedule && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-gray-600" />
                    Schedule & Availability
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data.schedule.schedules && data.schedule.schedules.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-gray-600" />
                          Working Days
                        </h3>
                        <div className="space-y-3">
                          {groupSchedules(data.schedule.schedules).map((group, index) => (
                            <div
                              key={`${group.hours.start}-${group.hours.end}-${index}`}
                              className="bg-orange-50 border border-orange-200 rounded-lg p-4"
                            >
                              <div className="flex flex-wrap gap-2">
                                {group.days.map((day, dayIndex) => (
                                  <span
                                    key={dayIndex}
                                    className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
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
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-gray-600" />
                          Working Hours
                        </h3>
                        <div className="space-y-3">
                          {groupSchedules(data.schedule.schedules).map((group, index) => (
                            <div key={`hours-${index}`} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                              <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-orange-600" />
                                <span className="text-lg font-semibold text-gray-900">
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
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Globe2 className="w-5 h-5 text-gray-600" />
                        Time Zones
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {data.schedule.timeZones.map((zone) => (
                          <span
                            key={zone}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                          >
                            {zone}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {data.schedule.flexibility && data.schedule.flexibility.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-600" />
                        Flexibility Options
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {data.schedule.flexibility.map((option) => (
                          <span
                            key={option}
                            className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Skills Required */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                  <Brain className="w-5 h-5 text-gray-600" />
                  Required Skills
                </h2>
              </div>
              <div className="p-6 space-y-6">
                {/* Languages */}
                {data.skills?.languages?.length > 0 && (
                  <div>
                    <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Languages className="w-4 h-4 text-gray-600" />
                      Languages
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {data.skills.languages.map((lang, index) => (
                        <span
                          key={`${lang.language}-${index}`}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                          {lang.language} ({lang.proficiency})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technical Skills */}
                {data.skills?.technical?.length > 0 && (
                  <div>
                    <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Laptop className="w-4 h-4 text-gray-600" />
                      Technical Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {data.skills.technical.map((skill, index) => (
                        <span
                          key={`${skill.skill}-${index}`}
                          className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                        >
                          {skill.skill} (Level {skill.level})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Soft Skills */}
                {data.skills?.soft?.length > 0 && (
                  <div>
                    <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-gray-600" />
                      Soft Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {data.skills.soft.map((skill, index) => (
                        <span
                          key={`${skill.skill}-${index}`}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                        >
                          {skill.skill} (Level {skill.level})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {data.skills?.certifications?.length > 0 && (
                  <div>
                    <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4 text-gray-600" />
                      Certifications
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {data.skills.certifications.map((cert, index) => (
                        <span
                          key={`${cert.name}-${index}`}
                          className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                        >
                          {cert.name} {cert.required ? '(Required)' : '(Optional)'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Team Structure */}
            {data.team && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-600" />
                    Team Structure
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">Team Size</h3>
                      <span className="text-2xl font-bold text-gray-900">{data.team.size}</span>
                    </div>
                    <div className="text-gray-600 text-sm">
                      {data.team.structure.length} role types defined
                    </div>
                  </div>

                  {data.team.structure && data.team.structure.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Roles</h3>
                      <div className="space-y-2">
                        {data.team.structure.map((role, index) => (
                          <div
                            key={`${role.roleId}-${index}`}
                            className="bg-gray-50 rounded-lg p-3"
                          >
                            <div className="font-semibold text-gray-900 mb-1">Role {index + 1}</div>
                            <p className="text-gray-600 text-sm">
                              Count: {role.count} | Level: {role.seniority.level} ({role.seniority.yearsExperience} years)
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Documentation */}
            {data.documentation && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-600" />
                    Documentation
                  </h2>
                </div>
                <div className="p-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Available Resources</h3>
                    <div className="space-y-3">
                      {data.documentation.product && data.documentation.product.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Product Documentation</h4>
                          <div className="space-y-1">
                            {data.documentation.product.map((doc, index) => (
                              <div key={`product-${index}`} className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-500" />
                                <span className="text-gray-700 text-sm">{doc.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {data.documentation.process && data.documentation.process.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Process Documentation</h4>
                          <div className="space-y-1">
                            {data.documentation.process.map((doc, index) => (
                              <div key={`process-${index}`} className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-500" />
                                <span className="text-gray-700 text-sm">{doc.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {data.documentation.training && data.documentation.training.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Training Materials</h4>
                          <div className="space-y-1">
                            {data.documentation.training.map((doc, index) => (
                              <div key={`training-${index}`} className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-500" />
                                <span className="text-gray-700 text-sm">{doc.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
    