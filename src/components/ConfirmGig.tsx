import React from "react";
import Swal from "sweetalert2";
import { CheckCircle, AlertCircle } from "lucide-react";
import type { GigData } from "../types";
import Cookies from 'js-cookie';
import { saveGigData } from '../lib/api';

interface ConfirmGigProps {
  gig: GigData;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmGig: React.FC<ConfirmGigProps> = ({ gig, onConfirm, onCancel }) => {
  const handleConfirm = async () => {
    try {
      let userId: string;
      let companyId: string;

      companyId = Cookies.get('companyId');
      userId = Cookies.get('userId');

      if (!userId || !companyId) {
        throw new Error("User ID or Company ID not found in cookies");
      }

      const gigData: GigData = {
        ...gig,
        userId,
        companyId,
        category: gig.category || "",
        destination_zone: gig.destination_zone || "",
        callTypes: gig.callTypes || [],
        highlights: gig.highlights || [],
        requirements: {
          essential: gig.requirements?.essential || [],
          preferred: gig.requirements?.preferred || []
        },
        benefits: gig.benefits || [],
        schedule: {
          days: gig.schedule?.days || [],
          hours: gig.schedule?.hours || "",
          timeZones: gig.schedule?.timeZones || [],
          flexibility: gig.schedule?.flexibility || [],
          minimumHours: gig.schedule?.minimumHours || {}
        },
        commission: {
          base: gig.commission?.base || "",
          baseAmount: gig.commission?.baseAmount || "",
          bonus: gig.commission?.bonus || "",
          bonusAmount: gig.commission?.bonusAmount || "",
          structure: gig.commission?.structure || "",
          currency: gig.commission?.currency || "",
          minimumVolume: {
            amount: gig.commission?.minimumVolume?.amount || "",
            period: gig.commission?.minimumVolume?.period || "",
            unit: gig.commission?.minimumVolume?.unit || ""
          },
          transactionCommission: {
            type: gig.commission?.transactionCommission?.type || "",
            amount: gig.commission?.transactionCommission?.amount || ""
          },
          kpis: gig.commission?.kpis || []
        },
        leads: {
          types: gig.leads?.types || [],
          sources: gig.leads?.sources || [],
          distribution: {
            method: gig.leads?.distribution?.method || "",
            rules: gig.leads?.distribution?.rules || []
          },
          qualificationCriteria: gig.leads?.qualificationCriteria || []
        },
        skills: {
          languages: gig.skills?.languages || [],
          soft: gig.skills?.soft || [],
          professional: gig.skills?.professional || [],
          technical: gig.skills?.technical || [],
          certifications: gig.skills?.certifications || []
        },
        seniority: {
          level: gig.seniority?.level || "",
          years: gig.seniority?.years || "",
          yearsExperience: typeof gig.seniority?.yearsExperience === 'string' ? parseInt(gig.seniority.yearsExperience) || 0 : gig.seniority?.yearsExperience || 0
        },
        team: {
          size: gig.team?.size || "",
          structure: gig.team?.structure || [],
          territories: gig.team?.territories || [],
          reporting: {
            to: gig.team?.reporting?.to || "",
            frequency: gig.team?.reporting?.frequency || ""
          },
          collaboration: gig.team?.collaboration || []
        },
        documentation: {
          product: gig.documentation?.product || [],
          process: gig.documentation?.process || [],
          training: gig.documentation?.training || [],
          reference: gig.documentation?.reference || [],
          templates: gig.documentation?.templates || []
        },
        tools: {
          provided: gig.tools?.provided || [],
          required: gig.tools?.required || []
        },
        training: {
          initial: {
            duration: gig.training?.initial?.duration || "",
            format: gig.training?.initial?.format || "",
            topics: gig.training?.initial?.topics || []
          },
          ongoing: {
            frequency: gig.training?.ongoing?.frequency || "",
            format: gig.training?.ongoing?.format || "",
            topics: gig.training?.ongoing?.topics || []
          },
          support: gig.training?.support || []
        },
        metrics: {
          kpis: gig.metrics?.kpis || [],
          targets: gig.metrics?.targets || {},
          reporting: {
            frequency: gig.metrics?.reporting?.frequency || "",
            metrics: gig.metrics?.reporting?.metrics || []
          }
        },
        compliance: {
          requirements: gig.compliance?.requirements || [],
          certifications: gig.compliance?.certifications || [],
          policies: gig.compliance?.policies || []
        },
        equipment: {
          required: gig.equipment?.required || [],
          provided: gig.equipment?.provided || []
        }
      };

      await saveGigData(gigData);
      
      await Swal.fire({
        title: "Success!",
        text: "Gig has been created successfully",
        icon: "success",
        confirmButtonText: "OK",
      });

      onConfirm();
    } catch (error) {
      console.error("Error saving gig:", error);
      await Swal.fire({
        title: "Error!",
        text: error instanceof Error ? error.message : "Failed to save gig",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Confirm Gig Details</h2>
      
      <div className="space-y-4">
        <div className="flex items-start">
          <CheckCircle className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" />
          <div>
            <h3 className="font-semibold">{gig.title}</h3>
            <p className="text-gray-600">{gig.description}</p>
          </div>
        </div>

        <div className="flex items-start">
          <AlertCircle className="h-6 w-6 text-yellow-500 mr-2 flex-shrink-0" />
          <div>
            <h3 className="font-semibold">Please Review</h3>
            <p className="text-gray-600">
              Please review all the details above. Once confirmed, the gig will be created and published.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Confirm & Create
        </button>
      </div>
    </div>
  );
};
