import React, { useState, useEffect } from 'react';
import { Brain, HelpCircle, PlusCircle } from 'lucide-react';
import { Suggestions } from './Suggestions';
import { SectionContent } from './SectionContent';
import Logo from './Logo';
import { AIDialog } from './AIDialog';
import { GigData, GigSuggestion } from '../types';
import { predefinedOptions } from '../lib/guidance';
import { mapGeneratedDataToGigData } from '../lib/ai';
import Cookies from 'js-cookie';
import { 
  Briefcase, 
  Calendar, 
  DollarSign, 
  Users, 
  Award,
  ClipboardList
} from "lucide-react";

const sections = [
  { id: 'basic', label: 'Basic Information', icon: Briefcase },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'commission', label: 'Commission', icon: DollarSign },
  { id: 'skills', label: 'Skills', icon: Award },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'review', label: 'Review', icon: ClipboardList }
];

const PrompAI: React.FC = () => {
  const [input, setInput] = useState("");
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);
  const [confirmedSuggestions, setConfirmedSuggestions] = useState<GigSuggestion | null>(null);
  const [currentSection, setCurrentSection] = useState<string>("basic");
  const [showReview, setShowReview] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editGigId, setEditGigId] = useState<string | null>(null);
  const [isLoadingGig, setIsLoadingGig] = useState(false);

  const [gigData, setGigData] = useState<GigData>({
    userId: Cookies.get('userId') || "",
    companyId: Cookies.get('companyId') || "",
    title: "",
    description: "",
    category: "",
    destination_zone: "",
    destinationZones: [],
    callTypes: [],
    highlights: [],
    industries: [],
    activities: [],
    status: 'to_activate',
    requirements: {
      essential: [],
      preferred: []
    },
    benefits: [],
    availability: {
      schedule: [],
      timeZones: [],
      time_zone: "",
      flexibility: [],
      minimumHours: {}
    },
    schedule: {
      schedules: [],
      timeZones: [],
      time_zone: "",
      flexibility: [],
      minimumHours: {}
    },
    commission: {
      base: "",
      baseAmount: 0,
      bonus: "",
      bonusAmount: 0,
      structure: "",
      currency: "",
      minimumVolume: {
        amount: 0,
        period: "",
        unit: ""
      },
      transactionCommission: {
        type: "",
        amount: 0
      },
      kpis: []
    },
    leads: {
      types: [],
      sources: [],
      distribution: {
        method: "",
        rules: []
      },
      qualificationCriteria: []
    },
    skills: {
      languages: [],
      soft: [],
      professional: [],
      technical: []
    },
    seniority: {
      level: "",
      yearsExperience: 0
    },
    team: {
      size: 0,
      structure: [],
      territories: [],
      reporting: {
        to: "",
        frequency: ""
      },
      collaboration: []
    },
    documentation: {
      training: [],
      product: [],
      process: []
    }
  });

  // Scroll to top when section changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentSection]);

  // Check for edit mode parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editParam = urlParams.get('edit');
    const gigIdParam = urlParams.get('gigId');
    const sectionParam = urlParams.get('section');
    
    if (editParam === 'true' && gigIdParam) {
      setIsEditMode(true);
      setEditGigId(gigIdParam);
      loadGigForEdit(gigIdParam);
      
      // Si une section est spécifiée, aller directement au formulaire
      if (sectionParam) {
        setCurrentSection(sectionParam);
        setIsManualMode(true);
      }
    }
  }, []);

  // Function to load gig data for editing
  const loadGigForEdit = async (gigId: string) => {
    setIsLoadingGig(true);
    try {
      console.log('🔄 EDIT MODE - Fetching gig data from:', `${import.meta.env.VITE_API_URL}/gigs/${gigId}`);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/gigs/${gigId}`);
      
      if (!response.ok) {
        console.error('🔄 EDIT MODE - API Error:', response.status, response.statusText);
        throw new Error(`Failed to fetch gig data: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log('🔄 EDIT MODE - API Response:', responseData);
      
      const { data } = responseData;
      
      if (data) {
        // Map the fetched gig data to our GigData format
        const mappedGigData: GigData = {
          userId: data.userId || Cookies.get('userId') || "",
          companyId: data.companyId || Cookies.get('companyId') || "",
          title: data.title || "",
          description: data.description || "",
          category: data.category || "",
          destination_zone: typeof data.destination_zone === 'object' && data.destination_zone?._id 
            ? data.destination_zone._id 
            : data.destination_zone || "",
          destinationZones: data.destinationZones || [],
          callTypes: data.callTypes || [],
          highlights: data.highlights || [],
          industries: Array.isArray(data.industries) 
            ? data.industries.map(industry => 
                typeof industry === 'object' && industry?._id 
                  ? industry._id 
                  : industry
              )
            : [],
          activities: Array.isArray(data.activities) 
            ? data.activities.map(activity => 
                typeof activity === 'object' && activity?._id 
                  ? activity._id 
                  : activity
              )
            : [],
          status: data.status || 'to_activate',
          requirements: data.requirements || { essential: [], preferred: [] },
          benefits: data.benefits || [],
          availability: {
            schedule: data.availability?.schedule || data.schedule?.schedules || [],
            timeZones: data.availability?.timeZones || data.schedule?.timeZones || [],
            time_zone: typeof data.availability?.time_zone === 'object' && data.availability?.time_zone?._id
              ? data.availability.time_zone._id
              : typeof data.schedule?.time_zone === 'object' && data.schedule?.time_zone?._id
              ? data.schedule.time_zone._id
              : data.availability?.time_zone || data.schedule?.time_zone || "",
            flexibility: data.availability?.flexibility || data.schedule?.flexibility || [],
            minimumHours: data.availability?.minimumHours || data.schedule?.minimumHours || {}
          },
          schedule: {
            schedules: data.schedule?.schedules || data.availability?.schedule || [],
            timeZones: data.schedule?.timeZones || data.availability?.timeZones || [],
            time_zone: typeof data.schedule?.time_zone === 'object' && data.schedule?.time_zone?._id
              ? data.schedule.time_zone._id
              : typeof data.availability?.time_zone === 'object' && data.availability?.time_zone?._id
              ? data.availability.time_zone._id
              : data.schedule?.time_zone || data.availability?.time_zone || "",
            flexibility: data.schedule?.flexibility || data.availability?.flexibility || [],
            minimumHours: data.schedule?.minimumHours || data.availability?.minimumHours || {}
          },
          // Ajouter time_zone au niveau racine pour ScheduleSection
          time_zone: typeof data.schedule?.time_zone === 'object' && data.schedule?.time_zone?._id
            ? data.schedule.time_zone._id
            : typeof data.availability?.time_zone === 'object' && data.availability?.time_zone?._id
            ? data.availability.time_zone._id
            : data.schedule?.time_zone || data.availability?.time_zone || "",
          commission: {
            base: data.commission?.base || "",
            baseAmount: data.commission?.baseAmount || 0,
            bonus: data.commission?.bonus || "",
            bonusAmount: data.commission?.bonusAmount || 0,
            structure: data.commission?.structure || "",
            additionalDetails: data.commission?.additionalDetails || "",
            currency: typeof data.commission?.currency === 'object' && data.commission?.currency?._id
              ? data.commission.currency._id
              : data.commission?.currency || "",
            minimumVolume: data.commission?.minimumVolume || { amount: 0, period: "", unit: "" },
            transactionCommission: data.commission?.transactionCommission || { type: "", amount: 0 },
            kpis: data.commission?.kpis || []
          },
          leads: {
            types: data.leads?.types || [],
            sources: data.leads?.sources || [],
            distribution: data.leads?.distribution || { method: "", rules: [] },
            qualificationCriteria: data.leads?.qualificationCriteria || []
          },
          skills: {
            languages: Array.isArray(data.skills?.languages) 
              ? data.skills.languages.map(lang => ({
                  language: typeof lang.language === 'object' && lang.language?._id 
                    ? lang.language._id 
                    : lang.language || '',
                  proficiency: lang.proficiency || '',
                  iso639_1: lang.iso639_1 || ''
                }))
              : [],
            soft: Array.isArray(data.skills?.soft) 
              ? data.skills.soft.map(skill => {
                  console.log('🔄 EDIT MODE - Mapping soft skill:', skill);
                  const mappedSkill = {
                    skill: typeof skill.skill === 'object' && skill.skill?._id 
                      ? { $oid: skill.skill._id }
                      : typeof skill.skill === 'string'
                      ? skill.skill
                      : { $oid: '' },
                    level: skill.level || 1,
                    details: skill.details || ''
                  };
                  console.log('🔄 EDIT MODE - Mapped soft skill result:', mappedSkill);
                  return mappedSkill;
                })
              : [],
            professional: Array.isArray(data.skills?.professional) 
              ? data.skills.professional.map(skill => {
                  console.log('🔄 EDIT MODE - Mapping professional skill:', skill);
                  console.log('🔄 EDIT MODE - skill.skill type:', typeof skill.skill);
                  console.log('🔄 EDIT MODE - skill.skill._id:', skill.skill?._id);
                  const mappedSkill = {
                    skill: typeof skill.skill === 'object' && skill.skill?._id 
                      ? { $oid: skill.skill._id }
                      : typeof skill.skill === 'string'
                      ? skill.skill
                      : { $oid: '' },
                    level: skill.level || 1,
                    details: skill.details || ''
                  };
                  console.log('🔄 EDIT MODE - Mapped professional skill result:', mappedSkill);
                  return mappedSkill;
                })
              : [],
            technical: Array.isArray(data.skills?.technical) 
              ? data.skills.technical.map(skill => {
                  console.log('🔄 EDIT MODE - Mapping technical skill:', skill);
                  const mappedSkill = {
                    skill: typeof skill.skill === 'object' && skill.skill?._id 
                      ? { $oid: skill.skill._id }
                      : typeof skill.skill === 'string'
                      ? skill.skill
                      : { $oid: '' },
                    level: skill.level || 1,
                    details: skill.details || ''
                  };
                  console.log('🔄 EDIT MODE - Mapped technical skill result:', mappedSkill);
                  return mappedSkill;
                })
              : []
          },
          seniority: {
            level: data.seniority?.level || "",
            yearsExperience: data.seniority?.yearsExperience || 0
          },
          team: {
            size: data.team?.size || 0,
            structure: data.team?.structure || [],
            territories: Array.isArray(data.team?.territories)
              ? data.team.territories.map(territory =>
                  typeof territory === 'object' && territory?._id
                    ? territory._id
                    : territory
                )
              : [],
            reporting: data.team?.reporting || { to: "", frequency: "" },
            collaboration: data.team?.collaboration || []
          },
          documentation: {
            training: data.documentation?.training || [],
            product: data.documentation?.product || [],
            process: data.documentation?.process || []
          }
        };
        
        console.log('🔄 EDIT MODE - Loaded gig data:', data);
        console.log('🔄 EDIT MODE - Raw industries:', data.industries);
        console.log('🔄 EDIT MODE - Raw activities:', data.activities);
        console.log('🔄 EDIT MODE - Mapped gig data:', mappedGigData);
        console.log('🔄 EDIT MODE - Mapped industries (IDs):', mappedGigData.industries);
        console.log('🔄 EDIT MODE - Mapped activities (IDs):', mappedGigData.activities);
        console.log('🔄 EDIT MODE - destination_zone ID:', mappedGigData.destination_zone);
        console.log('🔄 EDIT MODE - time_zone ID (schedule):', mappedGigData.schedule.time_zone);
        console.log('🔄 EDIT MODE - time_zone ID (root):', mappedGigData.time_zone);
        console.log('🔄 EDIT MODE - currency ID:', mappedGigData.commission.currency);
        console.log('🔄 EDIT MODE - Raw skills data:', data.skills);
        console.log('🔄 EDIT MODE - Raw languages:', data.skills?.languages);
        console.log('🔄 EDIT MODE - Raw professional skills:', data.skills?.professional);
        console.log('🔄 EDIT MODE - Raw technical skills:', data.skills?.technical);
        console.log('🔄 EDIT MODE - Raw soft skills:', data.skills?.soft);
        
        // Debug: Log individual skill structures
        if (data.skills?.professional && data.skills.professional.length > 0) {
          console.log('🔄 EDIT MODE - First professional skill raw structure:', data.skills.professional[0]);
          console.log('🔄 EDIT MODE - First professional skill.skill type:', typeof data.skills.professional[0].skill);
          console.log('🔄 EDIT MODE - First professional skill.skill value:', data.skills.professional[0].skill);
        }
        console.log('🔄 EDIT MODE - Mapped skills data:', mappedGigData.skills);
        console.log('🔄 EDIT MODE - Mapped languages:', mappedGigData.skills.languages);
        console.log('🔄 EDIT MODE - Mapped professional skills:', mappedGigData.skills.professional);
        console.log('🔄 EDIT MODE - Mapped technical skills:', mappedGigData.skills.technical);
        console.log('🔄 EDIT MODE - Mapped soft skills:', mappedGigData.skills.soft);
        
        // Debug: Log mapped skill structures
        if (mappedGigData.skills.professional.length > 0) {
          console.log('🔄 EDIT MODE - First mapped professional skill structure:', mappedGigData.skills.professional[0]);
          console.log('🔄 EDIT MODE - First mapped professional skill.skill:', mappedGigData.skills.professional[0].skill);
        }
        
        // Debug: Vérifier la structure des skills mappés
        if (mappedGigData.skills.languages.length > 0) {
          console.log('🔄 EDIT MODE - First language structure:', mappedGigData.skills.languages[0]);
        }
        if (mappedGigData.skills.professional.length > 0) {
          console.log('🔄 EDIT MODE - First professional skill structure:', mappedGigData.skills.professional[0]);
        }
        console.log('🔄 EDIT MODE - Raw team territories:', data.team?.territories);
        console.log('🔄 EDIT MODE - Mapped team territories:', mappedGigData.team.territories);
        
        setGigData(mappedGigData);
        setIsManualMode(true); // Activer le mode manuel pour l'édition
        
        // Vérifier si une section spécifique est demandée dans l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const sectionParam = urlParams.get('section');
        setCurrentSection(sectionParam || "basic");
      }
    } catch (error) {
      console.error('Error loading gig for edit:', error);
      // En cas d'erreur, on peut afficher un message ou rediriger
    } finally {
      setIsLoadingGig(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      // Modal disabled - directly proceed to suggestions generation
      handleGenerateSuggestions();
    }
  };

  const handleGenerateSuggestions = () => {
    setIsAnalyzing(true);
    setShowAIDialog(false);
    // Simuler le temps d'analyse
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowSuggestions(true);
    }, 1500);
  };

  const handleConfirmSuggestions = (suggestions: GigSuggestion) => {
    setConfirmedSuggestions(suggestions);
    setShowSuggestions(false);
    setCurrentSection("basic");

    // Map the generated data to the initialized structure
    const mappedData = mapGeneratedDataToGigData(suggestions);
    console.log('🔄 PROMP AI - suggestions.destination_zone:', suggestions.destination_zone);
    console.log('🔄 PROMP AI - mappedData.destination_zone:', mappedData.destination_zone);
    console.log('🔄 PROMP AI - selectedJobTitle:', suggestions.selectedJobTitle);
    
    // Update the gig data with the mapped suggestions
    setGigData((prevData: GigData) => ({
      ...prevData,
      ...mappedData,
      // Use selected job title as the main title
      title: suggestions.selectedJobTitle || mappedData.title || prevData.title,
      // Preserve any existing data that wasn't in the suggestions
      userId: prevData.userId,
      companyId: prevData.companyId,
      // Use the destination_zone from mappedData (which comes from AI suggestions)
      destination_zone: mappedData.destination_zone || prevData.destination_zone
    }));
  };

  const handleSectionChange = (sectionId: string) => {
    console.log(`🔄 PROMP AI - Section change to: ${sectionId}`);
    console.log('🔄 PROMP AI - gigData.schedule:', gigData.schedule);
    console.log('🔄 PROMP AI - gigData.availability:', gigData.availability);
    setCurrentSection(sectionId);
  };

  const handleGigDataChange = (newData: GigData) => {
    console.log('🔄 PROMP AI - Gig data changed:', newData);
    setGigData(newData);
  };

  const handleManualMode = () => {
    setIsManualMode(true);
    setCurrentSection("basic");
  };

  if (showSuggestions) {
    return (
      <div className="w-full h-full py-8 px-4 mx-auto max-w-5xl">
        <Suggestions
          input={input}
          onBack={() => {
            setShowSuggestions(false);
            // S'assurer que la section courante est définie quand on revient
            if (confirmedSuggestions || isManualMode) {
              setCurrentSection("basic");
            }
          }}
          onConfirm={handleConfirmSuggestions}
          initialSuggestions={confirmedSuggestions}
        />
      </div>
    );
  }

  // Show loading state when loading gig for edit
  if (isLoadingGig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gig data for editing...</p>
        </div>
      </div>
    );
  }

  if (confirmedSuggestions || isManualMode) {
    // S'assurer que currentSection est valide
    const validSections = sections.map(s => s.id);
    const effectiveSection = validSections.includes(currentSection) ? currentSection : 'basic';
    
    // Si showReview est true, afficher directement le GigReview
    if (showReview) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <div className="w-full h-full py-8 px-4">
            <div className="w-full max-w-3xl mx-auto mb-8">
              <div className="flex flex-col items-center bg-white border border-blue-100 rounded-xl shadow-sm py-6 px-4">
                <Logo className="mb-4" />
              </div>
            </div>
            <div className="backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 overflow-hidden w-full h-full">
              <div>
                <SectionContent
                  section="review"
                  data={gigData}
                  onChange={handleGigDataChange}
                  errors={{}}
                  constants={predefinedOptions}
                  onSectionChange={handleSectionChange}
                  isAIMode={!!confirmedSuggestions}
                  isEditMode={isEditMode}
                  editGigId={editGigId}
                />
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className={
          effectiveSection === 'review'
            ? 'w-full h-full py-8 px-4'
            : 'w-full h-full py-8 px-4 mx-auto max-w-5xl'
        }>
          {/* Logo et Titre global en haut */}
          <div className="w-full max-w-3xl mx-auto mb-8">
            {confirmedSuggestions && (
                  <div className="flex flex-col items-center bg-white border border-blue-100 rounded-xl shadow-sm py-6 px-4">
                    <Logo className="mb-4" />
                  </div>
            )}
          </div>

          {/* Header with back button and centered logo for manual mode */}
          {isManualMode && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setIsManualMode(false)}
                  className="flex items-center text-blue-600 hover:text-blue-700 transition-colors duration-200 py-2"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {isEditMode ? 'Back to Dashboard' : 'Back to AI Assistant'}
                </button>
                <div className="flex-1 flex justify-center items-center">
                  <Logo />
                </div>
                <div className="w-32"></div> {/* Spacer to balance the layout */}
              </div>
              <div className="text-center mt-2">
                <div className="flex items-center justify-center space-x-3 mb-2">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {isEditMode ? 'Edit Gig' : 'Create Gig Manually'}
                  </h1>
                </div>
                <p className="text-lg text-gray-600">
                  {isEditMode ? 'Modify the sections below to update your gig' : 'Fill out the sections below to create your gig'}
                </p>
              </div>
            </div>
          )}

          {/* Navigation and Section Content */}
          <div className="backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 overflow-hidden w-full h-full">
            
            {/* Navigation Tabs */}
            {effectiveSection !== 'review' && (
              <nav className="border-b border-gray-200 bg-white px-4 py-3">
                <div className="flex justify-center gap-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => handleSectionChange(section.id)}
                      className={`flex items-center gap-2 px-4 py-2 text-base font-medium transition-all duration-200
                        ${section.id === effectiveSection
                          ? "border-b-2 border-blue-600 text-blue-600"
                          : "text-gray-600 hover:text-blue-600 border-b-2 border-transparent"
                        }`}
                      style={{ outline: "none" }}
                    >
                      <section.icon className={`w-5 h-5 ${section.id === effectiveSection ? 'text-blue-600' : 'text-gray-400'}`} />
                      {section.label}
                    </button>
                  ))}
                </div>
              </nav>
            )}

            {/* Section Content */}
            <div>
              <SectionContent
                section={effectiveSection}
                data={gigData}
                onChange={handleGigDataChange}
                errors={{}}
                constants={predefinedOptions}
                onSectionChange={handleSectionChange}
                isAIMode={!!confirmedSuggestions}
                isEditMode={isEditMode}
                editGigId={editGigId}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="w-full h-full py-6 px-4 mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <Logo className="mb-8" />
          <div className="flex items-center justify-center space-x-4 mb-6">
            <h1 className="text-5xl font-bold text-black">
              Create with AI Assistance
            </h1>
          </div>
          <p className="text-xl text-gray-600 w-full mx-auto">
            Describe your needs naturally, and let AI help structure your
            content
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Describe your needs naturally
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowGuidance(!showGuidance)}
                    className="text-blue-600 hover:text-blue-700 flex items-center text-sm"
                  >
                    <HelpCircle className="w-4 h-4 mr-1" />
                    Writing Tips
                  </button>
                  <button
                    type="button"
                    onClick={handleManualMode}
                    className="text-green-600 hover:text-green-700 flex items-center text-sm"
                  >
                    <PlusCircle className="w-5 h-5 mr-1" />
                    <span>Create Manually</span>
                  </button>
                </div>
              </div>

              {showGuidance && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Writing Tips</h3>
                  <ul className="text-sm text-blue-600 space-y-2">
                    <li>• Be specific about your target audience and location</li>
                    <li>• Mention key requirements and qualifications</li>
                    <li>• Include details about schedule and availability</li>
                    <li>• Specify any technical requirements or tools needed</li>
                    <li>• Describe the compensation structure if possible</li>
                  </ul>
                </div>
              )}

              <div className="relative">
                <textarea
                  id="description"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Example: I need a sales campaign targeting Spanish-speaking customers in Europe, with a focus on insurance products..."
                  className="w-full h-32 px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm resize-none"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="absolute bottom-4 right-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-3 rounded-xl hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Brain className="w-5 h-5" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

{/* AIDialog disabled - modal removed */}
    </div>
  );
};

export default PrompAI;