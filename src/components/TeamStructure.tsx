import React from 'react';
import { Plus, Trash2, Check, Globe, Users, Building2, ChevronRight, Briefcase, GraduationCap, ArrowLeft, ArrowRight } from 'lucide-react';
import { predefinedOptions } from '../lib/guidance';
import { GigData } from '../types';

interface TeamRoleOption {
  id: string;
  name: string;
  description: string;
}

interface TeamRole {
  roleId: string;
  count: number;
  seniority: {
    level: string;
    yearsExperience: number;
  };
}

// Type assertion pour predefinedOptions.team.roles
const teamRoles = predefinedOptions.team.roles as TeamRoleOption[];

interface TeamStructureProps {
  data: GigData;
  onChange: (data: GigData) => void;
  errors: {
    team?: {
      size?: string;
      structure?: string[];
      territories?: string[];
      reporting?: {
        to?: string;
        frequency?: string;
      };
      collaboration?: string[];
    };
  };
  onPrevious?: () => void;
  onNext?: () => void;
  onSave?: () => void;
  onAIAssist?: () => void;
  onSectionChange?: (sectionId: 'basic' | 'schedule' | 'commission' | 'leads' | 'skills' | 'team' | 'docs') => void;
  currentSection: 'basic' | 'schedule' | 'commission' | 'leads' | 'skills' | 'team' | 'docs';
}

export function TeamStructure({ data, onChange, errors, onPrevious, onNext, onSave, onAIAssist, onSectionChange, currentSection }: TeamStructureProps) {
  // Initialize team with default values if undefined
  const initializedTeam = {
    ...data,
    team: {
      size: data.team?.size || '0',
      structure: data.team?.structure || [],
      territories: data.team?.territories || [],
      reporting: data.team?.reporting || { to: '', frequency: '' },
      collaboration: data.team?.collaboration || []
    }
  };

  const handleAddRole = () => {
    const availableRole = teamRoles.find(
      role => !initializedTeam.team.structure.some(s => s.roleId === role.id)
    );
    if (availableRole) {
      onChange({
        ...data,
        team: {
          ...initializedTeam.team,
          structure: [...initializedTeam.team.structure, { 
            roleId: availableRole.id, 
            count: 1,
            seniority: {
              level: '',
              yearsExperience: 0
            }
          }]
        }
      });
    }
  };

  const handleRemoveRole = (index: number) => {
    onChange({
      ...data,
      team: {
        ...initializedTeam.team,
        structure: initializedTeam.team.structure.filter((_, i) => i !== index)
      }
    });
  };

  const handleRoleChange = (index: number, roleId: string) => {
    const newStructure = [...initializedTeam.team.structure];
    newStructure[index] = { 
      ...newStructure[index], 
      roleId,
      seniority: {
        level: '',
        yearsExperience: 0
      }
    };
    onChange({
      ...data,
      team: {
        ...initializedTeam.team,
        structure: newStructure
      }
    });
  };

  const handleCountChange = (index: number, count: number) => {
    const newStructure = [...initializedTeam.team.structure];
    newStructure[index] = { ...newStructure[index], count: Math.max(1, count) };
    onChange({
      ...data,
      team: {
        ...initializedTeam.team,
        structure: newStructure
      }
    });
  };

  const handleSeniorityChange = (index: number, field: 'level' | 'yearsExperience', value: string) => {
    const newStructure = [...initializedTeam.team.structure];
    newStructure[index] = {
      ...newStructure[index],
      seniority: {
        ...newStructure[index].seniority,
        [field]: value
      }
    };
    onChange({
      ...data,
      team: {
        ...initializedTeam.team,
        structure: newStructure
      }
    });
  };

  const handleTerritoryToggle = (territory: string) => {
    const newTerritories = initializedTeam.team.territories.includes(territory)
      ? initializedTeam.team.territories.filter(t => t !== territory)
      : [...initializedTeam.team.territories, territory];
    onChange({
      ...data,
      team: {
        ...initializedTeam.team,
        territories: newTerritories
      }
    });
  };

  const handleTeamSizeChange = (size: string) => {
    onChange({
      ...data,
      team: {
        ...initializedTeam.team,
        size
      }
    });
  };

  const handleReportingChange = (field: 'to' | 'frequency', value: string) => {
    onChange({
      ...data,
      team: {
        ...initializedTeam.team,
        reporting: {
          ...initializedTeam.team.reporting,
          [field]: value
        }
      }
    });
  };

  const handleCollaborationChange = (collaboration: string[]) => {
    onChange({
      ...data,
      team: {
        ...initializedTeam.team,
        collaboration
      }
    });
  };

  const totalTeamSize = initializedTeam.team.structure.reduce((sum, role) => sum + role.count, 0);

  return (
    <div className="space-y-8">
      {/* Team Size */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Team Size</h3>
            <p className="text-sm text-gray-600">Define the target team size and composition</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Target Team Size</label>
            <input
              type="text"
              value={initializedTeam.team.size || '0'}
              onChange={(e) => handleTeamSizeChange(e.target.value)}
              placeholder="e.g., 5-10 people"
              className={`mt-1 block w-full rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors?.team?.size ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors?.team?.size && (
              <p className="mt-1 text-sm text-red-600">{errors.team.size}</p>
            )}
          </div>
          <div className="flex items-center justify-between px-4 py-2 bg-white rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Current Team Composition</div>
            <div className="text-lg font-semibold text-blue-600">{totalTeamSize} Members</div>
          </div>
        </div>
      </div>

      {/* Team Structure */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Building2 className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Team Structure</h3>
            <p className="text-sm text-gray-600">Define roles and their requirements</p>
          </div>
        </div>

        <div className="space-y-4">
          {initializedTeam.team.structure.map((role, index) => (
            <div key={index} className="bg-white rounded-xl border border-purple-100 overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <select
                      value={role.roleId}
                      onChange={(e) => handleRoleChange(index, e.target.value)}
                      className="block w-full bg-white rounded-lg border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">Select role</option>
                      {teamRoles.map((r) => (
                        <option 
                          key={r.id} 
                          value={r.id}
                          disabled={initializedTeam.team.structure.some((s, i) => i !== index && s.roleId === r.id)}
                        >
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => handleRemoveRole(index)}
                      className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {role.roleId && (
                  <p className="mt-2 text-sm text-purple-700">
                    {teamRoles.find(r => r.id === role.roleId)?.description}
                  </p>
                )}
              </div>

              <div className="p-4 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>Team Members</span>
                      </div>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={role.count}
                      onChange={(e) => handleCountChange(index, parseInt(e.target.value) || 1)}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        <span>Seniority Level</span>
                      </div>
                    </label>
                    <select
                      value={role.seniority.level}
                      onChange={(e) => handleSeniorityChange(index, 'level', e.target.value)}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">Select level</option>
                      {predefinedOptions.basic.seniorityLevels.map((level) => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        <span>Experience</span>
                      </div>
                    </label>
                    <input
                      type="text"
                      value={role.seniority.yearsExperience.toString()}
                      onChange={(e) => handleSeniorityChange(index, 'yearsExperience', e.target.value)}
                      placeholder="e.g., 2-3 years"
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={handleAddRole}
            disabled={false}
            className="w-full flex items-center justify-center gap-2 p-3 text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            <span>Add Role</span>
          </button>
        </div>
      </div>

      {/* Territories */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Globe className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Coverage Areas</h3>
            <p className="text-sm text-gray-600">Select territories for team operations</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {predefinedOptions.team.territories.map((territory) => (
            <button
              key={territory}
              onClick={() => handleTerritoryToggle(territory)}
              className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                initializedTeam.team.territories.includes(territory)
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                initializedTeam.team.territories.includes(territory)
                  ? 'bg-emerald-600'
                  : 'border-2 border-gray-300'
              }`}>
                {initializedTeam.team.territories.includes(territory) && (
                  <Check className="w-4 h-4 text-white" />
                )}
              </div>
              <span className="flex-1">{territory}</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          ))}
        </div>

        {initializedTeam.team.territories.length > 0 && (
          <div className="mt-4 p-3 bg-white rounded-lg border border-emerald-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Selected Territories:</span>
              <span className="font-medium text-emerald-600">{initializedTeam.team.territories.length}</span>
            </div>
          </div>
        )}
      </div>

      {/* Reporting */}
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Briefcase className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Reporting</h3>
            <p className="text-sm text-gray-600">Define reporting structure</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Report to</label>
            <input
              type="text"
              value={initializedTeam.team.reporting.to}
              onChange={(e) => handleReportingChange('to', e.target.value)}
              placeholder="e.g., Manager Name"
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Reporting frequency</label>
            <input
              type="text"
              value={initializedTeam.team.reporting.frequency}
              onChange={(e) => handleReportingChange('frequency', e.target.value)}
              placeholder="e.g., Weekly"
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>
        </div>
      </div>

      {/* Collaboration */}
      <div className="bg-gradient-to-r from-lime-50 to-green-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-lime-100 rounded-lg">
            <Users className="w-5 h-5 text-lime-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Collaboration</h3>
            <p className="text-sm text-gray-600">Define collaboration requirements</p>
          </div>
        </div>

        <div className="space-y-4">
          {initializedTeam.team.collaboration.map((collaborator, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <input
                  type="text"
                  value={collaborator}
                  onChange={(e) => handleCollaborationChange([
                    ...initializedTeam.team.collaboration.slice(0, index),
                    e.target.value,
                    ...initializedTeam.team.collaboration.slice(index + 1)
                  ])}
                  placeholder="e.g., John Doe"
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-lime-500 focus:border-lime-500"
                />
              </div>
              <div className="ml-4">
                <button
                  onClick={() => handleCollaborationChange(initializedTeam.team.collaboration.filter((_, i) => i !== index))}
                  className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={() => handleCollaborationChange([...initializedTeam.team.collaboration, ''])}
            className="w-full flex items-center justify-center gap-2 p-3 text-lime-600 hover:text-lime-800 bg-lime-50 hover:bg-lime-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            <span>Add Collaborator</span>
          </button>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={onPrevious}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
        >
          <ArrowLeft className="w-5 h-5" />
          Previous
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Next
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}