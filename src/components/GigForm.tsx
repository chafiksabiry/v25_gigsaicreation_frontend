import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { saveGigData } from '../lib/api';
import { 
  Calendar, Clock, DollarSign, Users, Globe2, 
  Brain, Briefcase, FileText, Building2
} from 'lucide-react';
import axios from 'axios';
import Cookies from 'js-cookie';

type GigFormData = {
  title: string;
  description: string;
  category: string;
  callTypes: string[];
  schedule: {
    days: string[];
    hours: string;
    timeZones: string[];
    flexibility: string;
  };
  commission: {
    base: string;
    bonus: string;
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
    languages: { name: string; level: string; }[];
    soft: string[];
    professional: string[];
    industry: string[];
  };
  seniority: {
    level: string;
    yearsExperience: string;
  };
  team: {
    size: string;
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function GigForm() {
  const { register, control, handleSubmit, formState: { errors } } = useForm<GigFormData>();

  const onSubmit = async (data: GigFormData) => {
    try {
      // Insert main gig data
      const gigData = {
        userId: Cookies.get("userId") || "",
        companyId: Cookies.get("companyId") || "",
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
        schedule: {
          days: data.schedule?.days || [],
          hours: data.schedule?.hours || '',
          timeZones: data.schedule?.timeZones || [],
          flexibility: data.schedule?.flexibility ? [data.schedule.flexibility] : [],
          minimumHours: {
            daily: undefined,
            weekly: undefined,
            monthly: undefined
          }
        },
        commission: {
          base: data.commission.base,
          baseAmount: "",
          bonus: data.commission.bonus,
          bonusAmount: "",
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
          soft: data.skills.soft,
          professional: data.skills.professional,
          technical: [],
          certifications: []
        },
        seniority: {
          level: data.seniority.level,
          yearsExperience: data.seniority.yearsExperience,
          years: ""
        },
        team: {
          size: data.team?.size || "",
          structure: (data.team?.structure || []).map(role => ({
            roleId: role,
            count: 1,
            seniority: {
              level: "",
              yearsExperience: ""
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
          name: lang.name,
          level: lang.level
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
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto py-8 px-4">
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
                {...register('schedule.hours', { required: true })}
                placeholder="e.g., 9:00 AM - 6:00 PM EST"
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