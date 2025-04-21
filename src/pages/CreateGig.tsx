import React from 'react';
import { GigCreator } from '../components/GigCreator';
import BasicSection from '../components/BasicSection';
import { GigData } from '../types';

interface GigCreatorProps {
  data: GigData;
  onChange: (data: GigData) => void;
  errors: { [key: string]: string[] };
  onPrevious: () => void;
  onNext: () => void;
  onSave: () => void;
  onAIAssist: () => void;
  currentSection: string;
}

export function CreateGig() {
  return (
    <div className="min-h-screen bg-gray-50">
      <GigCreator>
        {({
          data,
          onChange,
          errors,
          onPrevious,
          onNext,
          onSave,
          onAIAssist,
          currentSection
        }: GigCreatorProps) => {
          if (currentSection === 'basic') {
            return (
              <BasicSection
                data={data}
                onChange={onChange}
                errors={errors}
                onPrevious={onPrevious}
                onNext={onNext}
                onSave={onSave}
                onAIAssist={onAIAssist}
                currentSection={currentSection}
              />
            );
          }
          return null;
        }}
      </GigCreator>
    </div>
  );
}

export default CreateGig; 