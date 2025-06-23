import React from 'react';
import { SkillsDisplay } from './SkillsDisplay';
import { SkillsCard } from './SkillsCard';

export function SkillsExample() {
  // Exemple de données de skills selon le schéma
  const exampleSkills = {
    languages: [
      { language: 'English', proficiency: 'C1 - Advanced', iso639_1: 'en' },
      { language: 'French', proficiency: 'B2 - Upper Intermediate', iso639_1: 'fr' },
      { language: 'Spanish', proficiency: 'B1 - Intermediate', iso639_1: 'es' }
    ],
    soft: [
      { skill: 'Communication', level: 4 },
      { skill: 'Leadership', level: 3 },
      { skill: 'Problem Solving', level: 5 },
      { skill: 'Team Collaboration', level: 4 }
    ],
    professional: [
      { skill: 'Sales Management', level: 4 },
      { skill: 'Customer Relationship', level: 5 },
      { skill: 'Market Analysis', level: 3 },
      { skill: 'Negotiation', level: 4 }
    ],
    technical: [
      { skill: 'CRM Systems', level: 4 },
      { skill: 'Microsoft Office', level: 5 },
      { skill: 'Sales Analytics', level: 3 },
      { skill: 'Social Media Marketing', level: 4 }
    ],
    certifications: [
      { name: 'Sales Professional Certification', required: true, provider: 'Sales Institute' },
      { name: 'CRM Specialist', required: false, provider: 'Tech Academy' },
      { name: 'Digital Marketing Certificate', required: false, provider: 'Marketing Pro' }
    ]
  };

  const handleEdit = () => {
    console.log('Edit skills clicked');
  };

  const handleAdd = () => {
    console.log('Add skill clicked');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Skills Display Examples</h1>
        <p className="text-gray-600">Different variants of the SkillsDisplay and SkillsCard components</p>
      </div>

      {/* SkillsCard - Interactive */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">SkillsCard - Interactive</h2>
        <SkillsCard 
          skills={exampleSkills}
          title="Sales Representative Skills"
          subtitle="Required competencies for the position"
          editable={true}
          onEdit={handleEdit}
          onAdd={handleAdd}
        />
      </div>

      {/* SkillsCard - Read Only */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">SkillsCard - Read Only</h2>
        <SkillsCard 
          skills={exampleSkills}
          title="Required Skills"
          subtitle="Skills and competencies for this position"
          editable={false}
        />
      </div>

      {/* Default Variant */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">SkillsDisplay - Default Variant</h2>
        <SkillsDisplay skills={exampleSkills} />
      </div>

      {/* Compact Variant */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">SkillsDisplay - Compact Variant</h2>
        <SkillsDisplay skills={exampleSkills} variant="compact" />
      </div>

      {/* Detailed Variant */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">SkillsDisplay - Detailed Variant</h2>
        <SkillsDisplay skills={exampleSkills} variant="detailed" />
      </div>

      {/* Without Levels */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">SkillsDisplay - Without Skill Levels</h2>
        <SkillsDisplay skills={exampleSkills} showLevels={false} />
      </div>

      {/* Custom Styling */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">SkillsDisplay - Custom Styling</h2>
        <SkillsDisplay 
          skills={exampleSkills} 
          className="bg-white/80 backdrop-blur-sm rounded-xl p-6" 
        />
      </div>
    </div>
  );
} 