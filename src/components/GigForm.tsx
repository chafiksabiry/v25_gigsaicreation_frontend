import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { saveGigData } from '../lib/api';
import { 
  Calendar, Clock, DollarSign, Users, Globe2, 
  Brain, Briefcase, FileText, Building2
} from 'lucide-react';
import axios from 'axios';
import Cookies from 'js-cookie';
import type { ParsedGig } from '../lib/types';

interface GigFormProps {
  gig: ParsedGig;
  onSave: (updatedGig: ParsedGig) => void;
  onCancel: () => void;
}

type GigFormData = {
  title: string;
  description: string;
  category: string;
  callTypes: string[];
  availability: {
    schedule: {
      day: string;
      hours: {
        start: string;
        end: string;
      };
    }[];
    timeZones: string[];
    flexibility: string[];
    minimumHours: {
      daily?: number;
      weekly?: number;
      monthly?: number;
    };
  };
  schedule: {
    schedules: {
      day: string;
      hours: {
        start: string;
        end: string;
      };
    }[];
    timeZones: string[];
    flexibility: string[];
    minimumHours: {
      daily?: number;
      weekly?: number;
      monthly?: number;
    };
  };
  commission: {
    base: string;
    baseAmount: string;
    bonus: string;
    bonusAmount: string;
    structure: string;
  };
  leads: {
    types: {
      type: 'hot' | 'warm' | 'cold';
      percentage: number;
      description: string;
    }[];
    sources: string[];
  };
  skills: {
    languages: { 
      language: string; 
      proficiency: string; 
      iso639_1: string;
      _id?: { $oid: string };
    }[];
    soft: {
      skill: string;
      level: number;
    }[];
    professional: {
      skill: string;
      level: number;
    }[];
    technical: {
      skill: string;
      level: number;
    }[];
    certifications: string[];
    industry: string[];
  };
  seniority: {
    level: string;
    yearsExperience: number;
  };
  team: {
    size: number;
    structure: string[];
    territories: string[];
  };
  prerequisites: string[];
  documentation: {
    templates: {};
    reference: {};
    product: string[];
    process: string[];
    training: string[];
  };
};

interface GigData {
  companyId: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  destination_zone: string;
  logoUrl?: string; // URL du logo généré par DALL-E et uploadé sur Cloudinary
  callTypes: string[];
  highlights: any[];
  requirements: {
    essential: any[];
    preferred: any[];
  };
  benefits: any[];
  availability: {
    schedule: {
      day: string;
      hours: {
        start: string;
        end: string;
      };
    }[];
    timeZones: string[];
    flexibility: string[];
    minimumHours: {
      daily?: number;
      weekly?: number;
      monthly?: number;
    };
  };
  schedule: {
    schedules: {
      day: string;
      hours: {
        start: string;
        end: string;
      };
    }[];
    timeZones: string[];
    flexibility: string[];
    minimumHours: {
      daily?: number;
      weekly?: number;
      monthly?: number;
    };
  };
  commission: {
    base: string;
    baseAmount: string;
    bonus: string;
    bonusAmount: string;
    structure: string;
    currency: string;
    minimumVolume: {
      amount: string;
      period: string;
      unit: string;
    };
    transactionCommission: {
      type: string;
      amount: string;
    };
    kpis: any[];
  };
  leads: {
    types: {
      type: string;
      percentage: number;
      description: string;
    }[];
    sources: string[];
    distribution: {
      method: string;
      rules: any[];
    };
    qualificationCriteria: any[];
  };
  skills: {
    languages: {
      language: string;
      proficiency: string;
      iso639_1: string;
    }[];
    soft: {
      skill: string;
      level: number;
    }[];
    professional: {
      skill: string;
      level: number;
    }[];
    technical: {
      skill: string;
      level: number;
    }[];
    certifications: string[];
  };
  seniority: {
    level: string;
    yearsExperience: number;
  };
  team: {
    size: number;
    structure: {
      roleId: string;
      count: number;
      seniority: {
        level: string;
        yearsExperience: number;
      };
    }[];
    territories: string[];
    reporting: {
      to: string;
      frequency: string;
    };
    collaboration: any[];
  };
  documentation: {
    templates: Record<string, any>;
    reference: Record<string, any>;
    product: { name: string; url: string; }[];
    process: { name: string; url: string; }[];
    training: { name: string; url: string; }[];
  };
  tools: {
    provided: any[];
    required: any[];
  };
  training: {
    initial: {
      duration: string;
      format: string;
      topics: any[];
    };
    ongoing: {
      frequency: string;
      format: string;
      topics: any[];
    };
    support: any[];
  };
  metrics: {
    kpis: any[];
    targets: Record<string, any>;
    reporting: {
      frequency: string;
      metrics: any[];
    };
  };
  compliance: {
    requirements: any[];
    certifications: any[];
    policies: any[];
  };
  equipment: {
    required: any[];
    provided: any[];
  };
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function GigForm() {
  const { register, control, handleSubmit, formState: { errors } } = useForm<GigFormData>();

  const onSubmit = async (data: GigFormData) => {
    try {
      // Insert main gig data
      const gigData: GigData = {
        companyId: Cookies.get('companyId') || "",
        userId: Cookies.get('userId') || "",
        title: data.title,
        description: data.description,
        category: data.category,
        destination_zone: "",
        callTypes: data.callTypes,
        highlights: [],
        requirements: {
          essential: [],
          preferred: []
        },
        benefits: [],
        availability: {
          schedule: data.schedule?.schedules || [
            {
              day: "",
              hours: {
                start: "",
                end: ""
              }
            }
          ],
          timeZones: Array.isArray(data.schedule?.timeZones) ? data.schedule.timeZones : (data.schedule?.timeZones ? [data.schedule.timeZones] : []),
          flexibility: Array.isArray(data.schedule?.flexibility) ? data.schedule.flexibility : (data.schedule?.flexibility ? [data.schedule.flexibility] : []),
          minimumHours: {
            daily: undefined,
            weekly: undefined,
            monthly: undefined
          }
        },
        schedule: {
          schedules: data.schedule?.schedules || [
            {
              day: "",
              hours: {
                start: "",
                end: ""
              }
            }
          ],
          timeZones: Array.isArray(data.schedule?.timeZones) ? data.schedule.timeZones : (data.schedule?.timeZones ? [data.schedule.timeZones] : []),
          flexibility: Array.isArray(data.schedule?.flexibility) ? data.schedule.flexibility : (data.schedule?.flexibility ? [data.schedule.flexibility] : []),
          minimumHours: {
            daily: undefined,
            weekly: undefined,
            monthly: undefined
          }
        },
        commission: {
          base: data.commission.base,
          baseAmount: data.commission.baseAmount,
          bonus: data.commission.bonus,
          bonusAmount: data.commission.bonusAmount,
          structure: data.commission.structure,
          currency: "USD",
          minimumVolume: {
            amount: "",
            period: "",
            unit: ""
          },
          transactionCommission: {
            type: "",
            amount: ""
          },
          kpis: []
        },
        leads: {
          types: data.leads.types,
          sources: data.leads.sources,
          distribution: {
            method: "",
            rules: []
          },
          qualificationCriteria: []
        },
        skills: {
          languages: data.skills.languages,
          soft: data.skills.soft.map(skill => ({
            skill: skill.skill,
            level: skill.level
          })),
          professional: data.skills.professional.map(skill => ({
            skill: skill.skill,
            level: skill.level
          })),
          technical: data.skills.technical.map(skill => ({
            skill: skill.skill,
            level: skill.level
          })),
          certifications: []
        },
        seniority: {
          level: data.seniority.level,
          yearsExperience: data.seniority.yearsExperience,
        },
        team: {
          size: data.team?.size || 0,
          structure: (data.team?.structure || []).map(role => ({
            roleId: role,
            count: 1,
            seniority: {
              level: "",
              yearsExperience: 0
            }
          })),
          territories: data.team?.territories || [],
          reporting: {
            to: "",
            frequency: ""
          },
          collaboration: []
        },
        documentation: {
          templates: {},
          reference: {},
          product: (data.documentation?.product || []).map(name => ({ name, url: "" })),
          process: (data.documentation?.process || []).map(name => ({ name, url: "" })),
          training: (data.documentation?.training || []).map(name => ({ name, url: "" }))
        },
        tools: {
          provided: [],
          required: []
        },
        training: {
          initial: {
            duration: "",
            format: "",
            topics: []
          },
          ongoing: {
            frequency: "",
            format: "",
            topics: []
          },
          support: []
        },
        metrics: {
          kpis: [],
          targets: {},
          reporting: {
            frequency: "",
            metrics: []
          }
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
      };

      const { data: gig, error: gigError } = await saveGigData(gigData);

      if (gigError) throw gigError;

      // Insert skills
      const skillsPromises = [
        ...data.skills.languages.map(lang => ({
          gig_id: gig.id,
          category: 'language',
          language: lang.language,
          proficiency: lang.proficiency,
          iso639_1: lang.iso639_1
        })),
        ...data.skills.soft.map(skill => ({
          gig_id: gig.id,
          category: 'soft',
          name: skill
        })),
        ...data.skills.professional.map(skill => ({
          gig_id: gig.id,
          category: 'professional',
          name: skill
        })),
        ...data.skills.industry.map(skill => ({
          gig_id: gig.id,
          category: 'industry',
          name: skill
        }))
      ];

      const skillsResponse = await axios.post(`${API_URL}/gig_skills`, skillsPromises);
      if (!skillsResponse.data) throw new Error('Failed to save skills');

      // Insert leads
      const leadsResponse = await axios.post(`${API_URL}/gig_leads`, {
        gig_id: gig.id,
        leads: data.leads.types.map(lead => ({
          lead_type: lead.type,
          percentage: lead.percentage,
          description: lead.description,
          sources: data.leads.sources
        }))
      });
      if (!leadsResponse.data) throw new Error('Failed to save leads');

      // Insert documentation
      const docsPromises = [
        ...(data.documentation?.product || []).map(doc => ({
          gig_id: gig.id,
          type: 'product',
          name: doc,
          url: ""
        })),
        ...(data.documentation?.process || []).map(doc => ({
          gig_id: gig.id,
          type: 'process',
          name: doc,
          url: ""
        })),
        ...(data.documentation?.training || []).map(doc => ({
          gig_id: gig.id,
          type: 'training',
          name: doc,
          url: ""
        }))
      ];

      const docsResponse = await axios.post(`${API_URL}/gig_documentation`, docsPromises);
      if (!docsResponse.data) throw new Error('Failed to save documentation');

      alert('Gig created successfully!');
    } catch (error) {
      console.error('Error creating gig:', error);
      alert('Error creating gig. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full h-full py-8 px-4">
      <div className="space-y-8">
        {/* Basic Information */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                {...register('title', { required: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                {...register('description', { required: true })}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        {/* Schedule */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Calendar className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-2xl font-semibold">Schedule</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Working Hours</label>
              <input
                type="text"
                {...register('schedule.schedules.0.hours.start', { required: true })}
                placeholder="e.g., 08h00 - 17h00 EST"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Time Zones</label>
              <input
                type="text"
                {...register('schedule.timeZones', { required: true })}
                placeholder="e.g., EST, CST, PST"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        {/* Skills */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Brain className="w-6 h-6 text-purple-600 mr-2" />
            <h2 className="text-2xl font-semibold">Required Skills</h2>
          </div>
          <div className="space-y-6">
            {/* Languages */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Languages</h3>
              <div className="space-y-2">
                {/* Add dynamic language fields */}
              </div>
            </div>

            {/* Soft Skills */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Soft Skills</h3>
              <div className="space-y-2">
                {/* Add dynamic soft skills fields */}
              </div>
            </div>

            {/* Professional Skills */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Professional Skills</h3>
              <div className="space-y-2">
                {/* Add dynamic professional skills fields */}
              </div>
            </div>
          </div>
        </section>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Gig
          </button>
        </div>
      </div>
    </form>
  );
}