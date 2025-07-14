import React, { useState } from 'react';
import { FileText, X, Save, Plus } from 'lucide-react';

interface DocumentationData {
  type: string;
  format: string;
  requirements: string;
  files: Array<{
    url: string;
    name: string;
    type: string;
  }>;
}

interface DocumentationFormProps {
  onSave: (data: DocumentationData) => void;
  onSkip: () => void;
}

const DocumentationForm: React.FC<DocumentationFormProps> = ({ onSave, onSkip }) => {
  const [documentation, setDocumentation] = useState<DocumentationData>({
    type: '',
    format: '',
    requirements: '',
    files: []
  });

  const handleSave = () => {
    onSave(documentation);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <FileText className="mr-2" />
        Documentation Requirements
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Documentation Type</label>
          <input
            type="text"
            value={documentation.type}
            onChange={(e) => setDocumentation({ ...documentation, type: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="e.g., Technical Documentation, User Manual"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Format</label>
          <input
            type="text"
            value={documentation.format}
            onChange={(e) => setDocumentation({ ...documentation, format: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="e.g., PDF, Markdown, HTML"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Requirements</label>
          <textarea
            value={documentation.requirements}
            onChange={(e) => setDocumentation({ ...documentation, requirements: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={4}
            placeholder="Enter documentation requirements..."
          />
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onSkip}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Skip
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentationForm; 