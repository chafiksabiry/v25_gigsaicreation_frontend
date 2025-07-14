import React from 'react';
import { Brain } from 'lucide-react';
import { aiPrompts } from '../lib/guidance';

interface AIAssistantProps {
  section: keyof typeof aiPrompts;
  onGenerate: () => void;
}

export function AIAssistant({ section, onGenerate }: AIAssistantProps) {
  const prompt = aiPrompts[section];

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-full">
          <Brain className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-blue-900">{prompt.title}</h3>
          <p className="text-sm text-blue-700">{prompt.description}</p>
        </div>
      </div>

      <button
        onClick={onGenerate}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
      >
        <Brain className="w-5 h-5" />
        <span>Generate AI Suggestions</span>
      </button>
    </div>
  );
}