import React from 'react';
import { Plus, Trash2, Check, Globe, Users, Building2, ChevronRight, Briefcase, GraduationCap, Target, ArrowLeft, ArrowRight } from 'lucide-react';
import { predefinedOptions } from '../lib/guidance';

interface TeamRole {
  roleId: string;
  count: number;
  seniority: {
    level: string;
    yearsExperience: string;
  };
}

interface TeamStructureProps {
  team: {
    size: string;
    structure: TeamRole[];
    territories: string[];
    reporting: {
      to: string;
      frequency: string;
    };
    collaboration: string[];
  };
  onChange: (team: {
    size: string;
    structure: TeamRole[];
    territories: string[];
    reporting: {
      to: string;
      frequency: string;
    };
    collaboration: string[];
  }) => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export function TeamStructure({ team, onChange, onNext, onPrevious }: TeamStructureProps) {
  // Ensure team.structure is always an array
  const teamStructure = team?.structure || [];
  
  // Ensure team.territories is always an array
  const territories = team?.territories || [];
  
  // Ensure team.reporting is always an object
  const reporting = team?.reporting || { to: '', frequency: '' };

  // Ensure team.collaboration is always an array
  const collaboration = team?.collaboration || [];
  
  const handleAddRole = () => {
    const availableRole = predefinedOptions.team.roles.find(
      role => !teamStructure.some(s => s.roleId === role.id)
    );
    
    if (availableRole) {
      onChange({
        ...team,
        structure: [...teamStructure, { 
          roleId: availableRole.id, 
          count: 1,
          seniority: {
            level: '',
            yearsExperience: ''
          }
        }]
      });
    }
  };

  const handleRemoveRole = (index: number) => {
    onChange({
      ...team,
      structure: teamStructure.filter((_, i) => i !== index)
    });
  };

  const handleRoleChange = (index: number, roleId: string) => {
    const newStructure = [...teamStructure];
    newStructure[index] = { 
      ...newStructure[index], 
      roleId,
      seniority: {
        level: '',
        yearsExperience: ''
      }
    };
    onChange({
      ...team,
      structure: newStructure
    });
  };

  const handleCountChange = (index: number, count: number) => {
    const newStructure = [...teamStructure];
    newStructure[index] = { ...newStructure[index], count: Math.max(1, count) };
    onChange({
      ...team,
      structure: newStructure
    });
  };

  const handleSeniorityChange = (index: number, field: 'level' | 'yearsExperience', value: string) => {
    const newStructure = [...teamStructure];
    newStructure[index] = {
      ...newStructure[index],
      seniority: {
        ...newStructure[index].seniority,
        [field]: value
      }
    };
    onChange({
      ...team,
      structure: newStructure
    });
  };

  const handleTerritoryToggle = (territory: string) => {
    const newTerritories = territories.includes(territory)
      ? territories.filter(t => t !== territory)
      : [...territories, territory];
    onChange({
      ...team,
      territories: newTerritories
    });
  };

  const totalTeamSize = teamStructure.reduce((sum, role) => sum + role.count, 0);

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
              value={team?.size || ''}
              onChange={(e) => onChange({ ...team, size: e.target.value })}
              placeholder="e.g., 5-10 people"
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
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
          {teamStructure.map((role, index) => (
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
                      {predefinedOptions.team.roles.map((r) => (
                        <option 
                          key={r.id} 
                          value={r.id}
                          disabled={teamStructure.some((s, i) => i !== index && s.roleId === r.id)}
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
                    {predefinedOptions.team.roles.find(r => r.id === role.roleId)?.description}
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
                        <option key={level} value={level}>
                          {level}
                        </option>
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
                      value={role.seniority.yearsExperience}
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
            disabled={teamStructure.length >= predefinedOptions.team.roles.length}
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
          {predefinedOptions?.team?.territories ? (
            predefinedOptions.team.territories.map((territory) => (
              <button
                key={territory}
                onClick={() => handleTerritoryToggle(territory)}
                className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                  territories.includes(territory)
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  territories.includes(territory)
                    ? 'bg-emerald-600'
                    : 'border-2 border-gray-300'
                }`}>
                  {territories.includes(territory) && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="flex-1">{territory}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            ))
          ) : (
            <div className="col-span-2 text-center text-gray-500">
              Loading territories...
            </div>
          )}
        </div>

        {territories.length > 0 && (
          <div className="mt-4 p-3 bg-white rounded-lg border border-emerald-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Selected Territories:</span>
              <span className="font-medium text-emerald-600">{territories.length}</span>
            </div>
          </div>
        )}
      </div>

      {/* Reporting Structure */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Target className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Reporting Structure</h3>
            <p className="text-sm text-gray-600">Define reporting relationships and frequency</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Reports To</label>
            <input
              type="text"
              value={reporting.to}
              onChange={(e) => onChange({
                ...team,
                reporting: {
                  ...reporting,
                  to: e.target.value
                }
              })}
              placeholder="e.g., Sales Manager"
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Reporting Frequency</label>
            <input
              type="text"
              value={reporting.frequency}
              onChange={(e) => onChange({
                ...team,
                reporting: {
                  ...reporting,
                  frequency: e.target.value
                }
              })}
              placeholder="e.g., Weekly"
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Collaboration */}
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-rose-100 rounded-lg">
            <Users className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Team Collaboration</h3>
            <p className="text-sm text-gray-600">Define collaboration requirements</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={collaboration.join(', ')}
              onChange={(e) => onChange({
                ...team,
                collaboration: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
              })}
              placeholder="e.g., Marketing Team, Product Team"
              className="flex-1 rounded-lg border-gray-300 shadow-sm focus:ring-rose-500 focus:border-rose-500"
            />
          </div>

          {collaboration.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {collaboration.map((item, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          )}
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