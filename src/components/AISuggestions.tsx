import React from 'react';
import { Brain } from 'lucide-react';
import { aiPrompts } from '../lib/guidance';

interface AISuggestionsProps {
  section: keyof typeof aiPrompts;
  onSuggest: () => void;
}

export function AISuggestions({ section, onSuggest }: AISuggestionsProps) {
  const prompt = aiPrompts[section];

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Brain className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-blue-900">{prompt.title}</h3>
      </div>
      
      <p className="text-blue-700 mb-4">{prompt.description}</p>
      
      <div className="space-y-2 mb-6">
        {prompt.suggestions.map((suggestion, index) => (
          <div key={index} className="flex items-center gap-2 text-blue-600">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
            <span className="text-sm">{suggestion}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onSuggest}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
      >
        <Brain className="w-5 h-5" />
        <span>Generate Suggestions</span>
      </button>
    </div>
  );
}