import React from 'react';
import { 
  DollarSign, Users, Globe2, Brain, Target, FileText, 
  ArrowRight, Star, TrendingUp, Clock, CheckCircle, 
  Calendar, Languages, Building2, Briefcase, Phone,
  GraduationCap, Award, Laptop, Shield, BookOpen
} from 'lucide-react';
import { GigData } from '../types';

interface GigDetailsProps {
  data: GigData;
  onApply?: () => void;
}

export function GigDetails({ data, onApply }: GigDetailsProps) {
  // ... keep existing code ...

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ... keep existing header and main content ... */}

      {/* Update the Skills Required section in the sidebar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-600" />
            Required Skills
          </h2>
        </div>
        <div className="p-6 space-y-6">
          {/* Languages */}
          {data.skills.languages.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Languages className="w-4 h-4 text-gray-400" />
                Languages
              </h3>
              <div className="space-y-2">
                {data.skills.languages.map((lang, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                    <span className="text-gray-900">{lang.name}</span>
                    <span className="text-sm text-gray-600">{lang.level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Professional Skills */}
          {data.skills.professional.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-400" />
                Professional Skills
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {data.skills.professional.map((skill, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-2 p-2 bg-indigo-50 text-indigo-700 rounded-lg"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technical Skills */}
          {data.skills.technical.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Laptop className="w-4 h-4 text-gray-400" />
                Technical Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.skills.technical.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Soft Skills */}
          {data.skills.soft.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                Soft Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.skills.soft.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {data.skills.certifications.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-gray-400" />
                Required Certifications
              </h3>
              <div className="space-y-2">
                {data.skills.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-yellow-50 text-yellow-700 rounded-lg">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm">{cert.name}</span>
                    {cert.required && (
                      <span className="text-xs bg-yellow-200 px-2 py-0.5 rounded-full ml-auto">
                        Required
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ... keep rest of the component ... */}
    </div>
  );
}