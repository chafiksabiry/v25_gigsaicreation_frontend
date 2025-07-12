import React, { useEffect, useState } from 'react';
import { getGig } from '../lib/api';
import { GigDetails } from './GigDetails';
import { Loader2 } from 'lucide-react';
import { GigData } from '../types';

interface GigViewProps {
  selectedGigId: string | null;
  onSelectGig: (id: string) => void;
}

const GigView: React.FC<GigViewProps> = ({ selectedGigId, onSelectGig }) => {
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGig, setSelectedGig] = useState<GigData | null>(null);

  useEffect(() => {
    async function loadGigs() {
      try {
        const { data, error } = await getGig(selectedGigId);

        if (error) throw error;
        
        if (data) {
          setGigs(data);
          if (selectedGigId) {
            const selected = data.find((g: { id: string }) => g.id === selectedGigId);
            if (selected) {
              const transformedData = transformGigData(selected);
              setSelectedGig(transformedData);
            }
          }
        }
      } catch (error) {
        console.error('Error loading gigs:', error);
      } finally {
        setLoading(false);
      }
    }

    loadGigs();
  }, [selectedGigId]);

  // Transform database gig data to GigData format
  const transformGigData = (gig: any): GigData => ({
    userId: gig.userId,
    companyId: gig.companyId,
    title: gig.title,
    description: gig.description,
    category: gig.category,
    logoUrl: gig.logoUrl, // Include the logo URL
    callTypes: gig.call_types || [],
    highlights: [],
    requirements: {
      essential: [],
      preferred: []
    },
    benefits: [],
    availability: {
      schedule: gig.schedule_schedules || [
        {
          day: "",
          hours: {
            start: "",
            end: ""
          }
        }
      ],
      timeZones: gig.schedule_timezone || "",
      flexibility: gig.schedule_flexibility ? [gig.schedule_flexibility] : [],
      minimumHours: {
        daily: gig.minimum_hours_daily,
        weekly: gig.minimum_hours_weekly,
        monthly: gig.minimum_hours_monthly
      }
    },
    schedule: {
      schedules: gig.schedule_schedules || [
        {
          day: "",
          hours: {
            start: "",
            end: ""
          }
        }
      ],
      timeZones: gig.schedule_timezone || "",
      flexibility: gig.schedule_flexibility ? [gig.schedule_flexibility] : [],
      minimumHours: {
        daily: gig.minimum_hours_daily,
        weekly: gig.minimum_hours_weekly,
        monthly: gig.minimum_hours_monthly
      }
    },
    commission: {
      base: gig.commission_base || 'Fixed Salary',
      baseAmount: gig.commission_base_amount || '',
      bonus: gig.commission_bonus || '',
      bonusAmount: gig.commission_bonus_amount || '',
      structure: gig.commission_structure || '',
      currency: gig.commission_currency || 'USD',
      minimumVolume: {
        amount: gig.minimum_volume_amount || '',
        period: gig.minimum_volume_period || '',
        unit: gig.minimum_volume_unit || ''
      },
      transactionCommission: {
        type: gig.transaction_commission_type || '',
        amount: gig.transaction_commission_amount || ''
      },
      kpis: []
    },
    leads: {
      types: gig.gig_leads?.map((lead: any) => ({
        type: lead.lead_type,
        percentage: lead.percentage,
        description: lead.description,
        conversionRate: lead.conversion_rate
      })) || [],
      sources: gig.gig_leads?.[0]?.sources || [],
      distribution: {
        method: '',
        rules: []
      },
      qualificationCriteria: []
    },
    skills: {
      languages: gig.gig_skills
        ?.filter((skill: any) => skill.category === 'language')
        .map((skill: any) => ({
          language: skill.language,
          proficiency: skill.proficiency,
          iso639_1: skill.iso639_1
        })) || [],
      soft: gig.gig_skills
        ?.filter((skill: any) => skill.category === 'soft')
        .map((skill: any) => ({
          skill: skill.skill,
          level: skill.level,
        })) || [],
      professional: gig.gig_skills
        ?.filter((skill: any) => skill.category === 'professional')
        .map((skill: any) => ({
          skill: skill.skill,
          level: skill.level,
        })) || [],
      technical: gig.gig_skills
        ?.filter((skill: any) => skill.category === 'technical')
        .map((skill: any) => ({
          skill: skill.skill,
          level: skill.level,
        })) || [],
      certifications: []
    },
    seniority: {
      level: gig.seniority_level || '',
      yearsExperience: gig.years_experience || 0,
    },
    team: {
      size: gig.team_size || 0,
      structure: gig.team_structure || [],
      territories: gig.team_territories || [],
      reporting: {
        to: '',
        frequency: ''
      },
      collaboration: []
    },
    tools: {
      provided: [],
      required: []
    },
    training: {
      initial: {
        duration: '',
        format: '',
        topics: []
      },
      ongoing: {
        frequency: '',
        format: '',
        topics: []
      },
      support: []
    },
    metrics: {
      kpis: [],
      targets: {},
      reporting: {
        frequency: '',
        metrics: []
      }
    },
    documentation: {
      product: gig.gig_documentation
        ?.filter((doc: any) => doc.doc_type === 'product')
        .map((doc: any) => ({
          name: doc.name,
          url: doc.url
        })) || [],
      process: gig.gig_documentation
        ?.filter((doc: any) => doc.doc_type === 'process')
        .map((doc: any) => ({
          name: doc.name,
          url: doc.url
        })) || [],
      training: gig.gig_documentation
        ?.filter((doc: any) => doc.doc_type === 'training')
        .map((doc: any) => ({
          name: doc.name,
          url: doc.url
        })) || []
    },
    compliance: {
      requirements: [],
      certifications: [],
      policies: []
    },
    equipment: {
      required: [],
      provided: []
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (selectedGig) {
    return (
      <GigDetails 
        data={selectedGig}
      />
    );
  }

  return (
    <div className="space-y-6">
      {gigs.map((gig) => (
        <div
          key={gig.id}
          onClick={() => {
            const transformedData = transformGigData(gig);
            setSelectedGig(transformedData);
            onSelectGig(gig.id);
          }}
          className="bg-white shadow-sm hover:shadow-md transition-shadow rounded-xl border border-gray-200 p-6 cursor-pointer"
        >
                  <div className="flex justify-between items-start">
          <div className="flex items-start gap-4">
            {/* Logo */}
            {gig.logoUrl && (
              <div className="flex-shrink-0">
                <img 
                  src={gig.logoUrl} 
                  alt="Gig Logo" 
                  className="w-12 h-12 rounded-lg border border-gray-200 bg-white object-contain"
                />
              </div>
            )}
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{gig.title}</h2>
                <p className="text-gray-600 line-clamp-2">{gig.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {gig.category}
                </span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  {gig.seniority_level}
                </span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  {gig.team_size}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Base Commission</div>
              <div className="font-semibold text-gray-900">
                {gig.commission_currency} {gig.commission_base_amount}
              </div>
              {gig.commission_bonus && (
                <div className="mt-1 text-sm text-green-600">
                  + Performance Bonus
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GigView;