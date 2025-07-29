import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  CheckCircle,
  DollarSign,
  Users,
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
  Heart,
  MapPin,
  Building,
  Target,
  Zap,
  Languages,
  CheckSquare,
} from "lucide-react";
import { GigData } from "../types";
import { predefinedOptions } from "../lib/guidance";
import { validateGigData } from "../lib/validation";
import { groupSchedules } from "../lib/scheduleUtils";
import { fetchAllTimezones, fetchCompanies } from '../lib/api';
// import { GigStatusBadge } from './GigStatusBadge';
import { 
  getIndustryNameById,
  loadLanguages,
  getLanguageNameById
} from '../lib/activitiesIndustries';

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

  // State for skills data
  const [softSkills, setSoftSkills] = useState<Array<{_id: string, name: string, description: string, category: string}>>([]);
  const [professionalSkills, setProfessionalSkills] = useState<Array<{_id: string, name: string, description: string, category: string}>>([]);
  const [technicalSkills, setTechnicalSkills] = useState<Array<{_id: string, name: string, description: string, category: string}>>([]);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [languagesLoading, setLanguagesLoading] = useState(true);

  // State for timezones and companies
  const [timezoneMap, setTimezoneMap] = useState<{ [key: string]: string }>({});
  const [companyMap, setCompanyMap] = useState<{ [key: string]: string }>({});

  // Load skills and languages from API
  useEffect(() => {
    const fetchSkillsAndLanguages = async () => {
      try {
        setSkillsLoading(true);
        setLanguagesLoading(true);
        
        // Fetch all skills categories and languages
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

        // Load languages using the utility function
        await loadLanguages();
      } catch (error) {
        console.error('Error fetching skills and languages:', error);
      } finally {
        setSkillsLoading(false);
        setLanguagesLoading(false);
      }
    };

    fetchSkillsAndLanguages();
  }, []);

  // Fetch all timezones and companies on mount
  useEffect(() => {
    const fetchMeta = async () => {
      // Fetch timezones
      try {
        const tzRes = await fetchAllTimezones();
        if (tzRes.data && Array.isArray(tzRes.data)) {
          const tzMap: { [key: string]: string } = {};
          tzRes.data.forEach((tz: any) => {
            tzMap[tz._id] = tz.name || tz.label || tz.tz || tz._id;
          });
          setTimezoneMap(tzMap);
        }
      } catch (e) { /* ignore */ }
      // Fetch companies
      try {
        const companies = await fetchCompanies();
        if (companies && Array.isArray(companies)) {
          const cMap: { [key: string]: string } = {};
          companies.forEach((c: any) => {
            cMap[c._id] = c.name || c._id;
          });
          setCompanyMap(cMap);
        }
      } catch (e) { /* ignore */ }
    };
    fetchMeta();
  }, []);

  // Helper to get time zone name
  const getTimeZoneName = (zone: string) => {
    return timezoneMap[zone] || zone;
  };
  // Helper to get company name
  const getCompanyName = (id: string) => {
    return companyMap[id] || id;
  };
  // Helper to get skill name by id
  const getSkillName = (skill: any, category: 'soft' | 'professional' | 'technical') => {
    // Handle both string and { $oid: string } formats
    let skillId: string;
    if (typeof skill === 'string') {
      skillId = skill;
    } else if (skill && typeof skill === 'object' && skill.$oid) {
      skillId = skill.$oid;
    } else {
      return 'Unknown Skill';
    }

    let arr: any[] = [];
    if (category === 'soft') arr = softSkills;
    if (category === 'professional') arr = professionalSkills;
    if (category === 'technical') arr = technicalSkills;
    const found = arr.find((s) => s._id === skillId);
    return found ? found.name : skillId;
  };

  // Helper to get language name by id
  const getLanguageName = (language: any) => {
    if (languagesLoading) {
      return 'Loading...';
    }
    
    // Handle both string and { $oid: string } formats
    let languageId: string;
    if (typeof language === 'string') {
      languageId = language;
    } else if (language && typeof language === 'object' && language.$oid) {
      languageId = language.$oid;
    } else {
      return 'Unknown Language';
    }
    
    return getLanguageNameById(languageId) || languageId;
  };

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
      
      // Let onSubmit handle the saving (it already calls saveGigData)
      await onSubmit();
      
      const result = await Swal.fire({
        title: "Success!",
        text: "Your gig has been published successfully.",
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "OK",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#667eea",
        cancelButtonColor: "#6b7280",
      });
      
      if (result.isConfirmed) {
        window.location.href = "/app11";
      }
    } catch (error) {
      console.error('Error publishing gig:', error);
      const result = await Swal.fire({
        title: "Error!",
        text: error instanceof Error ? error.message : "An unknown error occurred.",
        icon: "error",
        showCancelButton: true,
        confirmButtonText: "Try Again",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#6b7280",
      });
      
      if (result.isConfirmed) {
        handlePublish(); // Retry publishing
      }
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


  // Before return, define a variable for readable schedule time zones
  // Define a variable for the readable destination zone name
  const destinationZoneName = getTimeZoneName(data.destination_zone);

  return (
    <div className="min-h-screen w-full h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="w-full h-full px-8 py-6 max-w-7xl mx-auto">
  
        {/* Page Header with Title and Description */}
        <div className="mb-8">
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-3">
              <button
                onClick={onBack}
                className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
              >
                ← Previous
              </button>

            </div>
            <button
              onClick={handlePublish}
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:from-[#5a6fd8] hover:to-[#6a4190] disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Publishing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Publish Gig
                </>
              )}
            </button>
          </div>
        </div>


        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Enhanced Basic Information */}
            {renderEditableSection(
              "Basic Information",
              "basic",
              <Briefcase className="w-6 h-6 text-gray-600" />,
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                    {data?.title || 'No title provided'}
                  </h1>
                  <p className="text-gray-700 text-lg leading-relaxed mb-6">{data?.description || 'No description provided'}</p>
                  
                  <div className="flex flex-wrap gap-3 mb-6">
                    {data?.category && (
                      <span className="px-4 py-2 bg-gradient-to-r from-[#667eea]/20 to-[#667eea]/30 text-[#667eea] rounded-full text-sm font-semibold border border-[#667eea]/30">
                        {data.category}
                      </span>
                    )}
                    {data?.seniority?.level && (
                      <span className="px-4 py-2 bg-gradient-to-r from-[#764ba2]/20 to-[#764ba2]/30 text-[#764ba2] rounded-full text-sm font-semibold border border-[#764ba2]/30">
                        {data.seniority.level}
                      </span>
                    )}
                    {data?.seniority?.yearsExperience && (
                      <span className="px-4 py-2 bg-gradient-to-r from-[#f093fb]/20 to-[#f093fb]/30 text-[#f093fb] rounded-full text-sm font-semibold border border-[#f093fb]/30">
                        {data.seniority.yearsExperience} Years Experience
                      </span>
                    )}
                    {/* Gig Status display removed */}
                  </div>

                  {/* Industries Section */}
                  {data?.industries && data.industries.length > 0 && (
                    <div className="mb-6">
                      <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-indigo-100 rounded-lg">
                            <Target className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-indigo-900">Industries</h3>
                            <p className="text-sm text-indigo-700">Relevant industries for this position</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {data.industries.map((industry, index) => {
                            const industryName = getIndustryNameById(industry);
                            return industryName ? (
                              <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full border border-indigo-200">
                                {industryName}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data?.destination_zone && (
                    <div className="bg-gradient-to-br from-[#667eea]/5 to-[#764ba2]/5 rounded-lg p-4 border border-[#667eea]/20">
                      <div className="flex items-center gap-3 mb-2">
                        <MapPin className="w-5 h-5 text-[#667eea]" />
                        <h3 className="font-semibold text-[#667eea]">Destination Zone</h3>
                      </div>
                      <p className="text-gray-700">{destinationZoneName}</p>
                      {/* Show selected schedule time zones if available */}
                      {/* {scheduleTimeZoneNames.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="text-xs text-gray-500">Schedule Time Zones:</span>
                          {scheduleTimeZoneNames.map((name, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gradient-to-r from-[#764ba2]/20 to-[#764ba2]/30 text-[#764ba2] rounded text-xs font-medium border border-[#764ba2]/30">{name}</span>
                          ))}
                        </div>
                      )} */}
                    </div>
                  )}
                  
                  {data?.companyId && (
                    <div className="bg-gradient-to-br from-[#764ba2]/5 to-[#f093fb]/5 rounded-lg p-4 border border-[#764ba2]/20">
                      <div className="flex items-center gap-3 mb-2">
                        <Building className="w-5 h-5 text-[#764ba2]" />
                        <h3 className="font-semibold text-[#764ba2]">Company</h3>
                      </div>
                      <p className="text-gray-700">{getCompanyName(data.companyId)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Enhanced Commission Structure */}
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

                {/* Additional Details */}
                {data?.commission?.additionalDetails && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Additional Details</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{data?.commission?.additionalDetails}</p>
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Schedule */}
            {data?.schedule && renderEditableSection(
              "Schedule & Availability",
              "schedule",
              <Calendar className="w-6 h-6 text-gray-600" />,
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {data.schedule.schedules && data.schedule.schedules.length > 0 && (
                    <>
                      <div className="bg-gradient-to-r from-[#667eea]/10 to-[#667eea]/20 rounded-xl p-6 border border-[#667eea]/30">
                        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#667eea] to-[#764ba2] mb-4 flex items-center gap-3">
                          <Calendar className="w-6 h-6 text-[#667eea]" />
                          Working Days
                        </h3>
                        <div className="space-y-4">
                          {groupSchedules(data.schedule.schedules).map((group, index) => (
                            <div
                              key={`${group.hours.start}-${group.hours.end}-${index}`}
                              className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-white/20"
                            >
                              <div className="flex flex-wrap gap-2 mb-3">
                                {group.days.map((day, dayIndex) => (
                                  <span
                                    key={dayIndex}
                                    className="px-3 py-1 bg-gradient-to-r from-[#667eea]/20 to-[#667eea]/30 text-[#667eea] rounded-full text-sm font-semibold border border-[#667eea]/30"
                                  >
                                    {day}
                                  </span>
                                ))}
                              </div>
                              <div className="flex items-center gap-2 text-[#667eea] font-semibold">
                                <Clock className="w-4 h-4" />
                                {group.hours.start} - {group.hours.end}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* {data.schedule.timeZones && data.schedule.timeZones.length > 0 && (
                  <div className="bg-gradient-to-r from-[#764ba2]/10 to-[#764ba2]/20 rounded-xl p-6 border border-[#764ba2]/30">
                    <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#764ba2] to-[#f093fb] mb-4 flex items-center gap-3">
                      <Globe2 className="w-6 h-6 text-[#764ba2]" />
                      Time Zones
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {data.schedule.timeZones.map((zone) => (
                        <span
                          key={zone}
                          className="px-4 py-2 bg-gradient-to-r from-[#764ba2]/20 to-[#764ba2]/30 text-[#764ba2] rounded-full text-sm font-semibold border border-[#764ba2]/30"
                        >
                          {getTimeZoneName(zone)}
                        </span>
                      ))}
                    </div>
                  </div>
                )} */}

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
          </div>

          {/* Right Column - Enhanced Sidebar */}
          <div className="space-y-8">
            {/* Enhanced Skills Summary */}
            {renderEditableSection(
              "Skills & Qualifications",
              "skills",
              <Brain className="w-6 h-6 text-gray-600" />,
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-[#667eea]/5 to-[#764ba2]/5 rounded-lg p-4 border border-[#667eea]/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Languages className="w-5 h-5 text-[#667eea]" />
                        <span className="text-sm font-semibold text-[#667eea]">Languages:</span>
                      </div>
                      <span className="px-3 py-1 bg-gradient-to-r from-[#667eea]/20 to-[#667eea]/30 text-[#667eea] rounded-full text-sm font-semibold border border-[#667eea]/30">
                        {data.skills?.languages?.length || 0}
                      </span>
                    </div>
                    {data.skills?.languages && data.skills.languages.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {data.skills.languages.map((lang, index) => (
                          <span key={index} className="px-2 py-1 bg-gradient-to-r from-[#667eea]/20 to-[#667eea]/30 text-[#667eea] rounded text-xs font-medium border border-[#667eea]/30">
                            {getLanguageName(lang.language)} ({lang.proficiency})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                </div>
                {/* Actual skill names for each category */}
                <div className="space-y-4">
                  {/* Technical Skills */}
                  {data.skills?.technical && data.skills.technical.length > 0 && (
                    <div>
                      <div className="font-semibold text-[#667eea] mb-1">Technical Skills:</div>
                      <ul className="flex flex-wrap gap-2">
                        {data.skills.technical.map((s, i) => (
                          <li key={i} className="px-3 py-1 bg-[#667eea]/10 rounded text-sm">
                            {skillsLoading ? 'Loading...' : getSkillName(s.skill, 'technical')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {/* Professional Skills */}
                  {data.skills?.professional && data.skills.professional.length > 0 && (
                    <div>
                      <div className="font-semibold text-[#764ba2] mb-1">Professional Skills:</div>
                      <ul className="flex flex-wrap gap-2">
                        {data.skills.professional.map((s, i) => (
                          <li key={i} className="px-3 py-1 bg-[#764ba2]/10 rounded text-sm">
                            {skillsLoading ? 'Loading...' : getSkillName(s.skill, 'professional')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {/* Soft Skills */}
                  {data.skills?.soft && data.skills.soft.length > 0 && (
                    <div>
                      <div className="font-semibold text-[#f093fb] mb-1">Soft Skills:</div>
                      <ul className="flex flex-wrap gap-2">
                        {data.skills.soft.map((s, i) => (
                          <li key={i} className="px-3 py-1 bg-[#f093fb]/10 rounded text-sm">
                            {skillsLoading ? 'Loading...' : getSkillName(s.skill, 'soft')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {/* Certifications section removed - no longer part of skills structure */}
                </div>
              </div>
            )}

            {/* Enhanced Team Structure */}
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


          </div>
        </div>
      </div>
    </div>
  );
}
    