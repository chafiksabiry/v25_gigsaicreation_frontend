import React from "react";
import Swal from "sweetalert2";
import { CheckCircle, AlertCircle } from "lucide-react";
import type { ParsedGig } from "../lib/types";
import Cookies from 'js-cookie';
import { saveGigData } from '../lib/api';
import Cookies from 'js-cookie';
import { saveGigData } from '../lib/api';

interface ConfirmGigProps {
  gig: ParsedGig;
  onConfirm: () => void;
  onEdit: () => void;
}

export function ConfirmGig({ gig, onConfirm, onEdit }: ConfirmGigProps) {
  const handleConfirm = async () => {
    try {
      // Vérifier si on est en mode standalone
      const isStandalone = import.meta.env.VITE_STANDALONE === 'true';
      let userId: string;
      let companyId: string;

      if (isStandalone) {
        userId = Cookies.get("userId") || '';
        companyId = Cookies.get("companyId") || '';
        if (!userId || !companyId) {
          throw new Error("Required cookies not found");
        }
      } else {
        const cookieUserId = Cookies.get("userId");
        if (!cookieUserId) {
          throw new Error("User ID not found in cookies");
        }
        userId = cookieUserId;

        // Récupérer le companyId associé à l'utilisateur
        const { data: userData, error: userError } = await saveGigData(gigData);

        if (userError) {
          throw new Error("Failed to fetch user company");
        }

        if (!userData?.company_id) {
          throw new Error("Company ID not found for user");
        }
        companyId = userData.company_id;
      }

      const gigData = {
        ...gig,
        userId: userId,
        companyId: companyId
      };

      console.log('ConfirmGig - Gig Data:', gigData);


      const response = await fetch(`${import.meta.env.VITE_API_URL}/gigs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(gigData),
        body: JSON.stringify(gigData),
      });

      const data = await response.json();
      console.log('ConfirmGig - API Response:', data);

      if (!response.ok) {
        throw new Error(data.message || "Échec de la publication du gig");
      }

      // 🎉 Afficher une notification de succès
      Swal.fire({
        title: "Succès!",
        text: "Votre gig a été publié avec succès.",
        icon: "success",
        confirmButtonText: "OK",
      });

      onConfirm(); // Indiquer que l'opération a réussi
    } catch (error: any) {
      console.error("Erreur lors de la confirmation du gig:", error);

      // ❌ Afficher une notification d'erreur
      Swal.fire({
        title: "Erreur!",
        text: error.message || "Une erreur s'est produite.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-blue-400 mr-2" />
          <p className="text-sm text-blue-700">
            Veuillez vérifier les détails de votre gig avant de le publier.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Titre</label>
            <p className="text-lg font-medium text-gray-900">{gig.title}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Quantité
            </label>
            <p className="text-lg font-medium text-gray-900">
              {gig.quantity} actions
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Durée</label>
            <p className="text-lg font-medium text-gray-900">{gig.timeline}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Type</label>
            <p className="text-lg font-medium text-gray-900">{gig.type}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Description
            </label>
            <p className="text-lg font-medium text-gray-900">
              {gig.description}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-8">
        <button
          onClick={onEdit}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Modifier
        </button>
        <button
          onClick={handleConfirm}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Confirmer & Publier
        </button>
      </div>
    </div>
  );
}
