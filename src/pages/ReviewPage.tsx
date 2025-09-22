import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  DollarSign, 
  Users, 
  Brain, 
  Calendar, 
  Briefcase, 
  Award, 
  Star, 
  Clock, 
  MapPin, 
  Building, 
  Target, 
  Zap, 
  Languages, 
  Laptop, 
  Heart, 
  Edit3, 
  ArrowLeft, 
  Coins,
  Globe,
  TrendingUp,
  Shield,
  FileText,
  CheckSquare
} from 'lucide-react';
import { GigData } from '../types';
import { predefinedOptions } from '../lib/guidance';
import { groupSchedules } from '../lib/scheduleUtils';
import { 
  fetchAllTimezones, 
  fetchCompanyById, 
  getCountryNameById,
  fetchAllCurrencies,
  fetchCurrencyById,
  Currency 
} from '../lib/api';
import { 
  getIndustryNameById,
  loadLanguages,
  getLanguageNameById
} from '../lib/activitiesIndustries';
import Swal from 'sweetalert2';

interface ReviewPageProps {
  data: GigData;
  onEdit: (section: string) => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  onBack: () => void;
  skipValidation?: boolean;
}

export function ReviewPage({
  data,
  onEdit,
  onSubmit,
  isSubmitting,
  onBack,
  skipValidation = false,
}: ReviewPageProps) {
  // State for skills data
  const [softSkills, setSoftSkills] = useState<Array<{_id: string, name: string, description: string, category: string}>>([]);
  const [professionalSkills, setProfessionalSkills] = useState<Array<{_id: string, name: string, description: string, category: string}>>([]);
  const [technicalSkills, setTechnicalSkills] = useState<Array<{_id: string, name: string, description: string, category: string}>>([]);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [languagesLoading, setLanguagesLoading] = useState(true);

  // State for timezones, companies, and currencies
  const [timezoneMap, setTimezoneMap] = useState<{ [key: string]: string }>({});
  const [companyMap, setCompanyMap] = useState<{ [key: string]: string }>({});
  const [countryName, setCountryName] = useState<string>('');
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);

  // Load skills and languages from API
  useEffect(() => {
    const fetchSkillsAndLanguages = async () => {
      try {
        setSkillsLoading(true);
        setLanguagesLoading(true);
        
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

  // Fetch currencies
  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const fetchedCurrencies = await fetchAllCurrencies();
        setCurrencies(fetchedCurrencies);
      } catch (error) {
        console.error('❌ Error loading currencies:', error);
      }
    };
    
    loadCurrencies();
  }, []);

  // Fetch selected currency details when currency ID changes
  useEffect(() => {
    const loadSelectedCurrency = async () => {
      if (data?.commission?.currency && currencies.length > 0) {
        console.log('🔍 Looking for currency:', data.commission.currency);
        console.log('📋 Available currencies:', currencies.length);
        
        // First try to find in loaded currencies
        const foundCurrency = currencies.find(c => c._id === data.commission.currency);
        if (foundCurrency) {
          console.log('✅ Found currency in list:', foundCurrency);
          setSelectedCurrency(foundCurrency);
        } else {
          console.log('❌ Currency not found in list, fetching by ID...');
          // If not found, fetch by ID
          try {
            const fetchedCurrency = await fetchCurrencyById(data.commission.currency);
            if (fetchedCurrency) {
              console.log('✅ Fetched currency by ID:', fetchedCurrency);
              setSelectedCurrency(fetchedCurrency);
            }
          } catch (error) {
            console.error('❌ Error fetching selected currency:', error);
          }
        }
      } else {
        setSelectedCurrency(null);
      }
    };

    loadSelectedCurrency();
  }, [data?.commission?.currency, currencies]);

  // Fetch meta data
  useEffect(() => {
    const fetchMeta = async () => {
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
      
      if (data.companyId) {
        try {
          const company = await fetchCompanyById(data.companyId);
          if (company) {
            const cMap: { [key: string]: string } = {};
            cMap[company._id] = company.name || company._id;
            setCompanyMap(cMap);
          }
        } catch (e) { /* ignore */ }
      }
      
      if (data.destination_zone) {
        try {
          const countryNameFromApi = await getCountryNameById(data.destination_zone);
          setCountryName(countryNameFromApi);
        } catch (e) { 
          console.error('❌ ReviewPage: Error fetching country name:', e);
          setCountryName(data.destination_zone);
        }
      }
    };
    fetchMeta();
  }, []);

  // Helper functions
  const getTimeZoneName = (zone: string) => timezoneMap[zone] || zone;
  const getCompanyName = (id: string) => companyMap[id] || id;
  const destinationZoneName = countryName || getTimeZoneName(data.destination_zone);

  const getSkillName = (skill: any, category: 'soft' | 'professional' | 'technical') => {
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

  const getLanguageName = (language: any) => {
    if (languagesLoading) return 'Loading...';
    
    let languageId: string;
    if (typeof language === 'string') {
      languageId = language;
    } else if (language && typeof language === 'object' && language.$oid) {
      languageId = language.$oid;
    } else {
      return '';
    }
    
    const languageName = getLanguageNameById(languageId);
    return languageName || languageId;
  };

  const getCurrencySymbol = () => {
    return selectedCurrency?.symbol || '$';
  };

  const getCurrencyName = () => {
    return selectedCurrency?.name || 'Unknown Currency';
  };

  const getCurrencyCode = () => {
    return selectedCurrency?.code || 'USD';
  };

  // Debug commission data
  useEffect(() => {
    console.log('💰 Commission data:', data?.commission);
    console.log('💰 Base amount:', data?.commission?.baseAmount);
    console.log('💰 Transaction amount:', data?.commission?.transactionCommission?.amount);
    console.log('💰 Bonus amount:', data?.commission?.bonusAmount);
    console.log('💰 Min volume amount:', data?.commission?.minimumVolume?.amount);
  }, [data?.commission]);

  const handlePublish = async () => {
    try {
      await onSubmit();
      
      const result = await Swal.fire({
        title: "Success!",
        text: "Your gig has been published successfully.",
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "OK",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#3b82f6",
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
        handlePublish();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <CheckSquare className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Final Review</h1>
                <p className="text-blue-100 text-lg">Review all details before publishing your gig opportunity</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold transition-all duration-200 backdrop-blur-sm border border-white/20 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>
              <button
                onClick={handlePublish}
                disabled={isSubmitting}
                className="px-8 py-3 bg-white text-blue-600 hover:bg-blue-50 disabled:bg-gray-300 disabled:text-gray-500 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
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
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Left Column - Main Sections */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* Job Details Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Job Details</h2>
                      <p className="text-white/80 text-sm">Position information and requirements</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onEdit('basic')}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-semibold transition-all duration-200 backdrop-blur-sm border border-white/20 flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-3">{data?.title || 'No title provided'}</h1>
                  <p className="text-gray-700 text-base leading-relaxed mb-4">{data?.description || 'No description provided'}</p>
                  
                  <div className="flex flex-wrap gap-3">
                    {data?.category && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                        {data.category}
                      </span>
                    )}
                    {data?.seniority?.level && (
                      <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-lg text-sm font-medium">
                        {data.seniority.level}
                      </span>
                    )}
                    {data?.seniority?.yearsExperience && (
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium">
                        {data.seniority.yearsExperience} Years Experience
                      </span>
                    )}
                  </div>
                </div>

                {/* Industries */}
                {data?.industries && data.industries.length > 0 && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-blue-900">Industries</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {data.industries.map((industry, index) => {
                        const industryName = getIndustryNameById(industry);
                        return industryName ? (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-lg">
                            {industryName}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Commission Structure */}
            {data?.commission && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Commission Structure</h2>
                        <p className="text-white/80 text-sm">Earnings and incentive details</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onEdit('commission')}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-semibold transition-all duration-200 backdrop-blur-sm border border-white/20 flex items-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-6">
                    
                    {/* Currency */}
                    {data.commission.currency && (
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center gap-3">
                          <DollarSign className="w-5 h-5 text-blue-600" />
                          <div>
                            <h3 className="font-semibold text-blue-900">Currency</h3>
                            <p className="text-blue-700 text-sm">{getCurrencySymbol()} {getCurrencyName()} ({getCurrencyCode()})</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Commission Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Per Call - Always show if commission exists */}
                      {data.commission && (
                        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 text-center">
                          <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                          <h3 className="font-semibold text-emerald-900 mb-1">Commission Per Call</h3>
                          <div className="text-2xl font-bold text-emerald-900">
                            {getCurrencySymbol()}{data.commission.baseAmount || 0}
                          </div>
                        </div>
                      )}

                      {/* Transaction - Always show if commission exists */}
                      {data.commission && (
                        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200 text-center">
                          <Coins className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                          <h3 className="font-semibold text-purple-900 mb-1">Transaction Commission</h3>
                          <div className="text-2xl font-bold text-purple-900">
                            {getCurrencySymbol()}{data.commission.transactionCommission?.amount || 0}
                          </div>
                        </div>
                      )}

                      {/* Bonus - Always show if commission exists */}
                      {data.commission && (
                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-center">
                          <Star className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                          <h3 className="font-semibold text-amber-900 mb-1">Bonus & Incentives</h3>
                          <div className="text-2xl font-bold text-amber-900">
                            {getCurrencySymbol()}{data.commission.bonusAmount || 0}
                          </div>
                        </div>
                      )}

                      {/* Minimum Volume - Always show if commission exists */}
                      {data.commission && (
                        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200 text-center">
                          <Target className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                          <h3 className="font-semibold text-orange-900 mb-1">Minimum Volume</h3>
                          <div className="text-2xl font-bold text-orange-900">
                            {getCurrencySymbol()}{data.commission.minimumVolume?.amount || 0}
                          </div>
                          <p className="text-orange-700 text-sm">per {data.commission.minimumVolume?.period || 'month'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Section */}
            {data?.schedule && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Schedule & Availability</h2>
                        <p className="text-white/80 text-sm">Working hours and flexibility</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onEdit('schedule')}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-semibold transition-all duration-200 backdrop-blur-sm border border-white/20 flex items-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {data.schedule.schedules && data.schedule.schedules.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-purple-600" />
                          Working Days
                        </h3>
                        <div className="space-y-3">
                          {groupSchedules(data.schedule.schedules).map((group, index) => (
                            <div key={index} className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                              <div className="flex flex-wrap gap-2 mb-2">
                                {group.days.map((day, dayIndex) => (
                                  <span key={dayIndex} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium">
                                    {day}
                                  </span>
                                ))}
                              </div>
                              <div className="flex items-center gap-2 text-purple-700 font-medium">
                                <Clock className="w-4 h-4" />
                                {group.hours.start} - {group.hours.end}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {data.schedule.flexibility && data.schedule.flexibility.length > 0 && (
                      <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                        <h3 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-indigo-600" />
                          Flexibility Options
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {data.schedule.flexibility.map((option, index) => (
                            <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm">
                              {option}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            
            {/* Skills Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Skills</h2>
                      <p className="text-white/80 text-sm">Required qualifications</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onEdit('skills')}
                    className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-semibold transition-all duration-200 backdrop-blur-sm border border-white/20 flex items-center gap-2"
                  >
                    <Edit3 className="w-3 h-3" />
                    Edit
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Languages */}
                {data.skills?.languages && data.skills.languages.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Languages className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-blue-900">Languages</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {data.skills.languages.length}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {data.skills.languages.map((lang, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {getLanguageName(lang.language)} ({lang.proficiency})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technical Skills */}
                {data.skills?.technical && data.skills.technical.length > 0 && (
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Laptop className="w-4 h-4 text-purple-600" />
                      <span className="font-semibold text-purple-900">Technical</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {data.skills.technical.map((s, i) => (
                        <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                          {skillsLoading ? 'Loading...' : getSkillName(s.skill, 'technical')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Professional Skills */}
                {data.skills?.professional && data.skills.professional.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Briefcase className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-green-900">Professional</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {data.skills.professional.map((s, i) => (
                        <span key={i} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                          {skillsLoading ? 'Loading...' : getSkillName(s.skill, 'professional')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Soft Skills */}
                {data.skills?.soft && data.skills.soft.length > 0 && (
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Heart className="w-4 h-4 text-orange-600" />
                      <span className="font-semibold text-orange-900">Soft Skills</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {data.skills.soft.map((s, i) => (
                        <span key={i} className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                          {skillsLoading ? 'Loading...' : getSkillName(s.skill, 'soft')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Team Structure */}
            {data.team && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white">Team</h2>
                        <p className="text-white/80 text-sm">Structure & roles</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onEdit('team')}
                      className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-semibold transition-all duration-200 backdrop-blur-sm border border-white/20 flex items-center gap-2"
                    >
                      <Edit3 className="w-3 h-3" />
                      Edit
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{data.team.size}</div>
                    <div className="text-blue-700 font-medium">Team Members</div>
                  </div>
                  
                  {data.team.structure && data.team.structure.length > 0 && (
                    <div className="space-y-3">
                      {data.team.structure.map((role, index) => {
                        const roleInfo = predefinedOptions.team.roles.find(r => r.id === role.roleId);
                        return (
                          <div key={index} className="bg-violet-50 rounded-lg p-3 border border-violet-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium text-gray-900 text-sm">
                                {roleInfo ? roleInfo.name : role.roleId}
                              </div>
                              <span className="px-2 py-1 bg-violet-100 text-violet-700 rounded text-xs font-medium">
                                {role.count}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">
                                {role.seniority.level}
                              </span>
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                {role.seniority.yearsExperience}y exp
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Company Info */}
            {data?.companyId && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Building className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Company</h3>
                    <p className="text-gray-600 text-sm">{getCompanyName(data.companyId)}</p>
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
