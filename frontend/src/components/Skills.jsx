import React from 'react';
import { useApi, apiPost } from '../hooks/useApi';
import {
  PuzzlePieceIcon,
  CheckCircleIcon,
  XCircleIcon,
  PowerIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

function Skills() {
  const { data: skills, loading, refetch } = useApi('/api/skills');

  const handleToggleSkill = async (skillId) => {
    try {
      await apiPost(`/api/skills/${skillId}/toggle`);
      refetch();
    } catch (error) {
      console.error('Erreur lors du changement d\'état:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const enabledSkills = skills?.filter((s) => s.enabled) || [];
  const disabledSkills = skills?.filter((s) => !s.enabled) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Skills</h1>
        <p className="text-gray-400 mt-1">
          Gérez les skills installés sur votre instance OpenClaw
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <PuzzlePieceIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Skills</p>
              <p className="text-2xl font-bold text-white">{skills?.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-600 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Activés</p>
              <p className="text-2xl font-bold text-white">{enabledSkills.length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-600 rounded-lg">
              <XCircleIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Désactivés</p>
              <p className="text-2xl font-bold text-white">{disabledSkills.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grille des skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills?.map((skill) => (
          <div
            key={skill.id}
            className={`card transition-all ${
              skill.enabled ? 'border-green-600/30' : 'border-gray-700 opacity-75'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${
                skill.enabled ? 'bg-green-600' : 'bg-gray-600'
              }`}>
                <PuzzlePieceIcon className="w-6 h-6 text-white" />
              </div>
              <button
                onClick={() => handleToggleSkill(skill.id)}
                className={`p-2 rounded-lg transition-colors ${
                  skill.enabled
                    ? 'text-green-400 hover:bg-green-900/30'
                    : 'text-gray-400 hover:bg-gray-700'
                }`}
                title={skill.enabled ? 'Désactiver' : 'Activer'}
              >
                <PowerIcon className="w-5 h-5" />
              </button>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">{skill.name}</h3>
            <p className="text-gray-400 text-sm mb-3">{skill.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm font-mono">v{skill.version}</span>
              <span className={`badge ${skill.enabled ? 'badge-green' : 'badge-gray'}`}>
                {skill.enabled ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Tableau détaillé */}
      <div className="card overflow-x-auto">
        <h3 className="text-lg font-semibold text-white mb-4">Détails des skills</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Nom</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Description</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Version</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Statut</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {skills?.map((skill) => (
              <tr key={skill.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <PuzzlePieceIcon className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-medium">{skill.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-gray-300">{skill.description}</span>
                </td>
                <td className="py-3 px-4">
                  <code className="text-sm text-gray-400 font-mono">{skill.version}</code>
                </td>
                <td className="py-3 px-4">
                  <span className={`badge ${skill.enabled ? 'badge-green' : 'badge-gray'}`}>
                    {skill.enabled ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleToggleSkill(skill.id)}
                    className={`btn-icon ${skill.enabled ? 'text-green-400' : 'text-gray-400'}`}
                  >
                    <PowerIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info box */}
      <div className="card bg-blue-900/20 border-blue-600/30">
        <div className="flex items-start gap-3">
          <InformationCircleIcon className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-blue-300 font-medium mb-1">À propos des skills</h4>
            <p className="text-blue-200/70 text-sm">
              Les skills étendent les capacités d'OpenClaw en ajoutant des intégrations avec 
              des services externes. Activez uniquement les skills dont vous avez besoin pour 
              optimiser les performances.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Skills;
