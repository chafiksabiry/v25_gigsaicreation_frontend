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
  console.log('CreateGig - Rendering');
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
          console.log('CreateGig - Current section:', currentSection);
          console.log('CreateGig - Current data:', data);
          
          if (currentSection === 'basic') {
            const basicData = {
              ...data,
              destinationZones: data.destinationZones || []
            };
            console.log('CreateGig - Passing data to BasicSection:', basicData);
            
            return (
              <BasicSection
                data={basicData}
                onChange={(newData) => {
                  console.log('CreateGig - onChange called with:', newData);
                  onChange(newData);
                }}
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