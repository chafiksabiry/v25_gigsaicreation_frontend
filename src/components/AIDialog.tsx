import React from 'react';
import { Brain, Loader } from 'lucide-react';
import { Dialog } from './Dialog';

interface AIDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  analyzing: boolean;
}

export function AIDialog({ isOpen, onClose, onProceed, analyzing }: AIDialogProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="AI-Powered Suggestions">
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <h3 className="font-medium text-blue-900">Let AI Help You</h3>
              <p className="mt-1 text-sm text-blue-700">
                Based on the title and description you provided, our AI can suggest appropriate values for:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-blue-700">
                <li>• Category and seniority level</li>
                <li>• Required skills and qualifications</li>
                <li>• Commission structure</li>
                <li>• Schedule and time zones</li>
                <li>• Team structure and territories</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Skip AI Suggestions
          </button>
          <button
            onClick={onProceed}
            disabled={analyzing}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {analyzing ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                <span>Generate Suggestions</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Dialog>
  );
}