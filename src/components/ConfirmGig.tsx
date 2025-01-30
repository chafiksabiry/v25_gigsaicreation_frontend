import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import type { ParsedGig } from '../lib/types';

interface ConfirmGigProps {
  gig: ParsedGig;
  onConfirm: () => void;
  onEdit: () => void;
}

export function ConfirmGig({ gig, onConfirm, onEdit }: ConfirmGigProps) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-blue-400 mr-2" />
          <p className="text-sm text-blue-700">
            Please review your gig details before publishing
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Title</label>
            <p className="text-lg font-medium text-gray-900">{gig.title}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Quantity</label>
            <p className="text-lg font-medium text-gray-900">{gig.quantity} actions</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Timeline</label>
            <p className="text-lg font-medium text-gray-900">{gig.timeline}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Type</label>
            <p className="text-lg font-medium text-gray-900">{gig.type}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Description</label>
            <p className="text-lg font-medium text-gray-900">{gig.description}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-8">
        <button
          onClick={onEdit}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Edit Details
        </button>
        <button
          onClick={onConfirm}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Confirm & Publish
        </button>
      </div>
    </div>
  );
}