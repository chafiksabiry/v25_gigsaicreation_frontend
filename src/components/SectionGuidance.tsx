import React from 'react';
import { HelpCircle } from 'lucide-react';
import { InfoText } from './InfoText';
import { sectionGuidance } from '../lib/guidance';

interface SectionGuidanceProps {
  section: string;
}

export function SectionGuidance({ section }: SectionGuidanceProps) {
  console.log('SectionGuidance - section:', section);
  console.log('SectionGuidance - sectionGuidance keys:', Object.keys(sectionGuidance));
  
  const guidance = sectionGuidance[section as keyof typeof sectionGuidance];
  
  console.log('SectionGuidance - guidance found:', guidance);
  
  if (!guidance) {
    console.log('SectionGuidance - No guidance found for section:', section);
    return null;
  }

  console.log('SectionGuidance - Rendering guidance for section:', section);

  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center gap-2 text-blue-700">
        <HelpCircle className="w-5 h-5" />
        <h3 className="font-medium">Guidance for {guidance.title}</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InfoText className="h-full">
          <div className="space-y-2">
            <h4 className="font-medium">Steps:</h4>
            <ol className="list-decimal list-inside space-y-1">
              {guidance.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        </InfoText>

        <InfoText className="h-full">
          <div className="space-y-2">
            <h4 className="font-medium">Tips:</h4>
            <ul className="list-disc list-inside space-y-1">
              {guidance.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        </InfoText>
      </div>
    </div>
  );
}