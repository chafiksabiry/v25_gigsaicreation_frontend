import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  AlertCircle,
  CheckCircle,
  DollarSign,
  Users,
  Globe2,
  Brain,
  FileText,
  Star,
  Clock,
  Calendar,
  Briefcase,
  Award,
  Laptop,
  Coins,
  Edit3,
  AlertTriangle,
  Heart,
  MapPin,
  Building,
  TrendingUp,
  Target,
  Zap,
  Shield,
  BookOpen,
  Languages,
  CheckSquare,
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

  // State for skills data
  const [softSkills, setSoftSkills] = useState<Array<{_id: string, name: string, description: string, category: string}>>([]);
  const [professionalSkills, setProfessionalSkills] = useState<Array<{_id: string, name: string, description: string, category: string}>>([]);
  const [technicalSkills, setTechnicalSkills] = useState<Array<{_id: string, name: string, description: string, category: string}>>([]);
  const [skillsLoading, setSkillsLoading] = useState(true);

  // Load skills from API
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setSkillsLoading(true);
        
        // Fetch all skills categories
        const [softResponse, professionalResponse, technicalResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_REP_URL}/skills/soft`),
          fetch(`${import.meta.env.VITE_REP_URL}/skills/professional`),
          fetch(`${import.meta.env.VITE_REP_URL}/skills/technical`)
        ]);

        if (softResponse.ok) {
          const softData = await softResponse.json();
          setSoftSkills(softData.data || []);
        }

        if (professionalResponse.ok) {
          const professionalData = await professionalResponse.json();
          setProfessionalSkills(professionalData.data || []);
        }

        if (technicalResponse.ok) {
          const technicalData = await technicalResponse.json();
          setTechnicalSkills(technicalData.data || []);
        }
      } catch (error) {
        console.error('Error fetching skills:', error);
      } finally {
        setSkillsLoading(false);
      }
    };

    fetchSkills();
  }, []);

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
      console.log('🚀 Publishing gig with skills data:', data.skills);
      
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

  // const renderValidationSummary = () => (
  //   <div className="mb-8 space-y-4">
  //     {hasErrors && (
  //       <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-lg p-6 shadow-sm">
  //         <div className="flex items-center gap-3 mb-4">
  //           <AlertCircle className="w-6 h-6 text-red-500" />
  //           <h3 className="font-bold text-red-800 text-lg">Issues to Resolve</h3>
  //         </div>
  //         <ul className="space-y-3">
  //           {Object.entries(validation.errors).map(([section, errors]) => (
  //             <li key={section} className="flex items-start gap-4 bg-white p-4 rounded-lg border border-red-200 shadow-sm">
  //               <span className="text-red-600 font-bold text-lg">⚠</span>
  //               <div className="flex-1">
  //                 <span className="font-bold capitalize text-red-800 text-base">{section}:</span>
  //                 <span className="ml-2 text-red-700"> {errors.join(", ")}</span>
  //                 <button
  //                   onClick={() => onEdit(section)}
  //                   className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
  //                 >
  //                   Fix Now
  //                 </button>
  //               </div>
  //             </li>
  //           ))}
  //         </ul>
  //       </div>
  //     )}

  //     {hasWarnings && (
  //       <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-500 rounded-lg p-6 shadow-sm">
  //         <div className="flex items-center gap-3 mb-4">
  //           <AlertTriangle className="w-6 h-6 text-yellow-600" />
  //           <h3 className="font-bold text-yellow-800 text-lg">Recommendations</h3>
  //         </div>
  //         <ul className="space-y-3">
  //           {Object.entries(validation.warnings).map(
  //             ([section, warnings]) => (
  //               <li key={section} className="flex items-start gap-4 bg-white p-4 rounded-lg border border-yellow-200 shadow-sm">
  //                 <span className="text-yellow-600 font-bold text-lg">💡</span>
  //                 <div className="flex-1">
  //                   <span className="font-bold capitalize text-yellow-800 text-base">{section}:</span>
  //                   <span className="ml-2 text-yellow-700"> {warnings.join(", ")}</span>
  //                   <button
  //                     onClick={() => onEdit(section)}
  //                     className="ml-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
  //                   >
  //                     Review
  //                   </button>
  //                 </div>
  //               </li>
  //             )
  //           )}
  //         </ul>
  //       </div>
  //     )}

  //     {!hasErrors && !hasWarnings && (
  //       <div className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 rounded-lg p-6 shadow-sm">
  //         <div className="flex items-center gap-4">
  //           <CheckCircle className="w-8 h-8 text-green-500" />
  //           <div>
  //             <h3 className="font-bold text-green-800 text-xl">Ready to Publish! 🚀</h3>
  //             <p className="text-green-700 text-base mt-1">
  //               All required information has been provided and validated successfully.
  //             </p>
  //           </div>
  //         </div>
  //       </div>
  //     )}
  //   </div>
  // );

  const renderEditableSection = (title: string, section: string, icon: React.ReactNode, children: React.ReactNode) => (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="border-b border-white/20 px-6 py-5 flex items-center justify-between bg-gradient-to-r from-[#667eea]/5 to-[#764ba2]/5">
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#667eea] to-[#764ba2] flex items-center gap-3">
          {icon}
          {title}
        </h2>
        <button
          onClick={() => onEdit(section)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:from-[#5a6fd8] hover:to-[#6a4190] text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Edit3 className="w-4 h-4" />
          Edit
        </button>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );

  const renderMetricCard = (icon: React.ReactNode, title: string, value: string | number, subtitle: string, color: string) => (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#667eea] to-[#764ba2] text-base">{title}</h3>
          <p className="text-gray-600 text-sm">{subtitle}</p>
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-2">{value}</div>
    </div>
  );

  // Helper to check if documentation has files
  const hasDocumentation = (doc: any) => {
    if (!doc) return false;
    return (
      (doc.product && doc.product.length > 0) ||
      (doc.process && doc.process.length > 0) ||
      (doc.training && doc.training.length > 0) ||
      (doc.templates && Object.keys(doc.templates || {}).length > 0) ||
      (doc.reference && Object.keys(doc.reference || {}).length > 0)
    );
  };

  // Layout: single column, compact
  return (
    <div className="flex-1 overflow-auto w-full h-full bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-full h-full px-2 py-2 max-w-2xl mx-auto">
        {/* Page Header with Title and Description */}
        <div className="mb-4">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#667eea] to-[#764ba2] mb-2">Final Review & Publication</h1>
            <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Review all the details of your gig before publishing. Make sure everything is accurate and complete. 
              You can edit any section by clicking the "Edit" button next to each section.
            </p>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <button
                onClick={onBack}
                className="px-3 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 text-sm"
              >
                ← Back
              </button>
              <button
                onClick={() => onEdit('documentation')}
                className="px-3 py-2 bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:from-[#5a6fd8] hover:to-[#6a4190] text-white rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 text-sm"
              >
                <FileText className="w-4 h-4" />
                Documentation
              </button>
            </div>
            <button
              onClick={handlePublish}
              disabled={isSubmitting}
              className="px-4 py-2 bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:from-[#5a6fd8] hover:to-[#6a4190] disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 text-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Publishing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Publish
                </>
              )}
            </button>
          </div>
        </div>

        {/* Key Metrics Cards (stacked, compact) */}
        <div className="space-y-2 mb-4">
          {renderMetricCard(
            <DollarSign className="w-6 h-6 text-[#667eea]" />,
            "Base Salary",
            `${getCurrencySymbol()}${data?.commission?.baseAmount || "0"}`,
            data?.commission?.base || "No base salary",
            "bg-gradient-to-br from-[#667eea]/10 to-[#667eea]/20"
          )}
          {renderMetricCard(
            <Star className="w-6 h-6 text-[#764ba2]" />,
            "Performance Bonus",
            data?.commission?.bonus ? `${getCurrencySymbol()}${data?.commission?.bonusAmount || "0"}` : "N/A",
            data?.commission?.bonus || "No bonus structure",
            "bg-gradient-to-br from-[#764ba2]/10 to-[#764ba2]/20"
          )}
          {renderMetricCard(
            <Users className="w-6 h-6 text-[#f093fb]" />,
            "Team Size",
            String(data.team?.size || '0'),
            "Team Members",
            "bg-gradient-to-br from-[#f093fb]/10 to-[#f093fb]/20"
          )}
          {renderMetricCard(
            <Globe2 className="w-6 h-6 text-[#667eea]" />,
            "Coverage",
            data.schedule?.schedules && data.schedule.schedules.length > 0 ? 
              `${groupSchedules(data.schedule.schedules).length} Time Slots` : "No schedule",
            data.schedule?.schedules && data.schedule.schedules.length > 0 ? 
              groupSchedules(data.schedule.schedules).map(g => `${g.days.join(', ')}: ${g.hours.start}-${g.hours.end}`).join(" | ") : "No schedule defined",
            "bg-gradient-to-br from-[#667eea]/10 to-[#764ba2]/20"
          )}
        </div>

        {/* Basic Information */}
        {renderEditableSection(
          "Basic Information",
          "basic",
          <Briefcase className="w-6 h-6 text-gray-600" />,
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              {data?.title || 'No title provided'}
            </h1>
            <p className="text-gray-700 mb-2 leading-relaxed text-sm">{data?.description || 'No description provided'}</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {data?.category && (
                <span className="px-2 py-1 bg-gradient-to-r from-[#667eea]/20 to-[#667eea]/30 text-[#667eea] rounded-full text-xs font-semibold border border-[#667eea]/30">
                  {data.category}
                </span>
              )}
              {data?.seniority?.level && (
                <span className="px-2 py-1 bg-gradient-to-r from-[#764ba2]/20 to-[#764ba2]/30 text-[#764ba2] rounded-full text-xs font-semibold border border-[#764ba2]/30">
                  {data.seniority.level}
                </span>
              )}
              {data?.seniority?.yearsExperience && (
                <span className="px-2 py-1 bg-gradient-to-r from-[#f093fb]/20 to-[#f093fb]/30 text-[#f093fb] rounded-full text-xs font-semibold border border-[#f093fb]/30">
                  {data.seniority.yearsExperience} Years Experience
                </span>
              )}
            </div>
          </div>
        )}

        {/* Commission Structure */}
        {data?.commission && renderEditableSection(
          "Commission Structure",
          "commission",
          <DollarSign className="w-6 h-6 text-gray-600" />,
          <div className="space-y-6">
            {/* Base Commission */}
            {data.commission.base && (
              <div className="bg-gradient-to-r from-[#667eea]/10 to-[#667eea]/20 rounded-xl p-6 border border-[#667eea]/30">
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#667eea] to-[#764ba2] mb-4 flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-[#667eea]" />
                  Base Commission
                </h3>
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-white/20">
                  <div className="text-3xl font-bold text-gray-900 mb-3">
                    {getCurrencySymbol()}
                    {data.commission.baseAmount || '0'}
                  </div>
                  <div className="text-gray-700 text-lg mb-4">
                    {data.commission.base}
                  </div>
                  {data.commission.minimumVolume && (
                    <div className="pt-4 border-t border-[#667eea]/20">
                      <div className="text-base font-semibold text-gray-700 mb-3">
                        Minimum Requirements:
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="px-4 py-2 bg-gradient-to-r from-[#667eea]/20 to-[#667eea]/30 text-[#667eea] rounded-full text-sm font-semibold border border-[#667eea]/30">
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
              <div className="bg-gradient-to-r from-[#764ba2]/10 to-[#764ba2]/20 rounded-xl p-6 border border-[#764ba2]/30">
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#764ba2] to-[#f093fb] mb-4 flex items-center gap-3">
                  <Star className="w-6 h-6 text-[#764ba2]" />
                  Performance Bonus
                </h3>
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-white/20">
                  <div className="text-3xl font-bold text-gray-900 mb-3">
                    {getCurrencySymbol()}
                    {data.commission.bonusAmount}
                  </div>
                  <div className="text-gray-700 text-lg">
                    {data.commission.bonus}
                  </div>
                </div>
              </div>
            )}

            {/* Transaction Commission */}
            {data.commission.transactionCommission?.type && (
              <div className="bg-gradient-to-r from-[#f093fb]/10 to-[#f093fb]/20 rounded-xl p-6 border border-[#f093fb]/30">
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#f093fb] to-[#667eea] mb-4 flex items-center gap-3">
                  <Coins className="w-6 h-6 text-[#f093fb]" />
                  Transaction Commission
                </h3>
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-white/20">
                  <div className="text-3xl font-bold text-gray-900 mb-3">
                    {data.commission.transactionCommission.type === "percentage"
                      ? `${data.commission.transactionCommission.amount}%`
                      : `${getCurrencySymbol()}${
                          data.commission.transactionCommission.amount
                        }`}
                  </div>
                  <div className="text-gray-700 text-lg">
                    {data.commission.transactionCommission.type === "percentage"
                      ? "Per Transaction Value"
                      : "Per Transaction"}
                  </div>
                </div>
              </div>
            )}

            {/* Additional Details */}
            {data.commission.structure && (
              <div className="bg-gradient-to-br from-[#667eea]/5 to-[#764ba2]/5 rounded-xl p-6 border border-[#667eea]/20">
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#667eea] to-[#764ba2] mb-4">
                  Additional Commission Details
                </h3>
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-white/20">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-lg">
                    {data.commission.structure}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Schedule & Availability */}
        {data?.schedule && renderEditableSection(
          "Schedule & Availability",
          "schedule",
          <Calendar className="w-6 h-6 text-gray-600" />,
          <div className="space-y-6">
            {/* Coverage: show days + hours */}
            {data.schedule.schedules && data.schedule.schedules.length > 0 && (
              <div className="mb-2">
                <h3 className="font-semibold text-[#667eea] mb-1 flex items-center gap-2">
                  <Globe2 className="w-4 h-4" /> Coverage
                </h3>
                <ul className="text-xs text-gray-700 space-y-1">
                  {groupSchedules(data.schedule.schedules).map((group, idx) => (
                    <li key={idx}>
                      <span className="font-semibold">{group.days.join(', ')}:</span> {group.hours.start} - {group.hours.end}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Time Zones: show names not IDs */}
            {data.schedule.timeZones && data.schedule.timeZones.length > 0 && (
              <div className="mb-2">
                <h3 className="font-semibold text-[#764ba2] mb-1 flex items-center gap-2">
                  <Globe2 className="w-4 h-4" /> Time Zones
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data.schedule.timeZones.map((zone, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gradient-to-r from-[#764ba2]/20 to-[#764ba2]/30 text-[#764ba2] rounded-full text-xs font-semibold border border-[#764ba2]/30">
                      {zone}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data.schedule.flexibility && data.schedule.flexibility.length > 0 && (
              <div className="bg-gradient-to-r from-[#f093fb]/10 to-[#f093fb]/20 rounded-xl p-6 border border-[#f093fb]/30">
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#f093fb] to-[#667eea] mb-4 flex items-center gap-3">
                  <Clock className="w-6 h-6 text-[#f093fb]" />
                  Flexibility Options
                </h3>
                <div className="flex flex-wrap gap-3">
                  {data.schedule.flexibility.map((option) => (
                    <span
                      key={option}
                      className="px-4 py-2 bg-gradient-to-r from-[#f093fb]/20 to-[#f093fb]/30 text-[#f093fb] rounded-full text-sm font-semibold border border-[#f093fb]/30"
                    >
                      {option}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Skills & Qualifications */}
        {renderEditableSection(
          "Skills & Qualifications",
          "skills",
          <Brain className="w-6 h-6 text-gray-600" />,
          <div className="space-y-6">
            {/* Technical Skills */}
            {data.skills?.technical && data.skills.technical.length > 0 && (
              <div>
                <h4 className="font-semibold text-[#667eea] mb-1">Technical Skills</h4>
                <ul className="text-xs text-gray-700 flex flex-wrap gap-2">
                  {data.skills.technical.map((s, idx) => (
                    <li key={idx} className="px-2 py-1 bg-gradient-to-r from-[#667eea]/20 to-[#667eea]/30 text-[#667eea] rounded-full border border-[#667eea]/30">
                      {s.details || s.skill?.$oid || 'Skill'}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Professional Skills */}
            {data.skills?.professional && data.skills.professional.length > 0 && (
              <div>
                <h4 className="font-semibold text-[#764ba2] mb-1">Professional Skills</h4>
                <ul className="text-xs text-gray-700 flex flex-wrap gap-2">
                  {data.skills.professional.map((s, idx) => (
                    <li key={idx} className="px-2 py-1 bg-gradient-to-r from-[#764ba2]/20 to-[#764ba2]/30 text-[#764ba2] rounded-full border border-[#764ba2]/30">
                      {s.details || s.skill?.$oid || 'Skill'}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Soft Skills */}
            {data.skills?.soft && data.skills.soft.length > 0 && (
              <div>
                <h4 className="font-semibold text-[#f093fb] mb-1">Soft Skills</h4>
                <ul className="text-xs text-gray-700 flex flex-wrap gap-2">
                  {data.skills.soft.map((s, idx) => (
                    <li key={idx} className="px-2 py-1 bg-gradient-to-r from-[#f093fb]/20 to-[#f093fb]/30 text-[#f093fb] rounded-full border border-[#f093fb]/30">
                      {s.details || s.skill?.$oid || 'Skill'}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Certifications */}
            {data.skills?.certifications && data.skills.certifications.length > 0 && (
              <div>
                <h4 className="font-semibold text-[#667eea] mb-1">Certifications</h4>
                <ul className="text-xs text-gray-700 flex flex-wrap gap-2">
                  {data.skills.certifications.map((c, idx) => (
                    <li key={idx} className="px-2 py-1 bg-gradient-to-r from-[#667eea]/20 to-[#667eea]/30 text-[#667eea] rounded-full border border-[#667eea]/30">
                      {c.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Team Structure */}
        {data.team && renderEditableSection(
          "Team Structure",
          "team",
          <Users className="w-6 h-6 text-gray-600" />,
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#667eea]/10 to-[#764ba2]/20 rounded-lg p-6 text-center border border-[#667eea]/30">
              <Users className="w-10 h-10 text-[#667eea] mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 mb-2">{data.team.size}</div>
              <div className="text-base text-gray-600 font-semibold">Team Members</div>
            </div>
            
            {data.team.structure && data.team.structure.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#667eea] to-[#764ba2] mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#667eea]" />
                  Team Roles
                </h3>
                <div className="space-y-3">
                  {data.team.structure.map((role, index) => {
                    const roleInfo = predefinedOptions.team.roles.find(r => r.id === role.roleId);
                    return (
                      <div key={index} className="bg-gradient-to-br from-[#667eea]/5 to-[#764ba2]/5 rounded-lg p-4 border border-[#667eea]/20">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-gray-900">
                            {roleInfo ? roleInfo.name : role.roleId}
                          </div>
                          <div className="text-sm text-gray-600 font-semibold">
                            Count: {role.count}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {roleInfo ? roleInfo.description : ''}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span className="font-semibold">Seniority:</span> {role.seniority.level}
                          <span className="font-semibold">Experience:</span> {role.seniority.yearsExperience} years
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Documentation */}
        {hasDocumentation(data.documentation) && renderEditableSection(
          "Documentation",
          "documentation",
          <FileText className="w-6 h-6 text-gray-600" />,
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#667eea]/10 to-[#764ba2]/20 rounded-lg p-6 border border-[#667eea]/30">
              <div className="flex items-center gap-3 mb-3">
                <CheckSquare className="w-6 h-6 text-[#667eea]" />
                <span className="font-bold text-[#667eea] text-base">Documentation Complete</span>
              </div>
              <p className="text-gray-700 text-xs">
                All required documentation has been uploaded and verified successfully.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-[#667eea]/5 to-[#764ba2]/5 rounded-lg p-2 border border-[#667eea]/20">
              <h4 className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#667eea] to-[#764ba2] mb-1 text-sm">Documentation Status</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#667eea]" />
                  <span className="text-gray-700">Identity verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#667eea]" />
                  <span className="text-gray-700">Professional credentials</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#667eea]" />
                  <span className="text-gray-700">Portfolio materials</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
    