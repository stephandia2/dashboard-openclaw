import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import {
  CpuChipIcon,
  CheckCircleIcon,
  XCircleIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';

const AGENT_TYPES = {
  main: { label: 'Principal', color: 'bg-purple-600' },
  service: { label: 'Service', color: 'bg-blue-600' },
  skill: { label: 'Skill', color: 'bg-green-600' },
};

function Agents() {
  const { data: agents, loading } = useApi('/api/agents');
  const [selectedAgent, setSelectedAgent] = useState(null);

  // Construire la liste des relations
  const getAgentRelations = (agentId) => {
    const agent = agents?.find((a) => a.id === agentId);
    if (!agent?.relations) return [];
    return agent.relations
      .map((relId) => agents?.find((a) => a.id === relId))
      .filter(Boolean);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Agents</h1>
        <p className="text-gray-400 mt-1">
          Visualisation des agents et leurs relations
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <CpuChipIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Agents</p>
              <p className="text-2xl font-bold text-white">{agents?.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-600 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">En ligne</p>
              <p className="text-2xl font-bold text-white">
                {agents?.filter((a) => a.status === 'online').length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-600 rounded-lg">
              <XCircleIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Hors ligne</p>
              <p className="text-2xl font-bold text-white">
                {agents?.filter((a) => a.status === 'offline').length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-600 rounded-lg">
              <LinkIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Relations</p>
              <p className="text-2xl font-bold text-white">
                {agents?.reduce((acc, a) => acc + (a.relations?.length || 0), 0) || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Vue graphique des agents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des agents */}
        <div className="lg:col-span-2 card">
          <h3 className="text-lg font-semibold text-white mb-4">Topologie des agents</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {agents?.map((agent) => {
              const typeInfo = AGENT_TYPES[agent.type] || AGENT_TYPES.skill;
              return (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedAgent?.id === agent.id
                      ? 'border-blue-500 bg-blue-900/30'
                      : 'border-gray-700 bg-gray-700/50 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className={`w-3 h-3 rounded-full ${
                      agent.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className={`text-xs px-2 py-1 rounded ${typeInfo.color} text-white`}>
                      {typeInfo.label}
                    </span>
                  </div>
                  <h4 className="text-white font-medium">{agent.name}</h4>
                  <p className="text-gray-400 text-sm mt-1">{agent.id}</p>
                  {agent.relations?.length > 0 && (
                    <div className="flex items-center gap-1 mt-2 text-gray-500 text-sm">
                      <LinkIcon className="w-4 h-4" />
                      {agent.relations.length} relation(s)
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Détails de l'agent sélectionné */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">
            {selectedAgent ? 'Détails' : 'Sélectionnez un agent'}
          </h3>
          {selectedAgent ? (
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm">Nom</p>
                <p className="text-white font-medium text-lg">{selectedAgent.name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">ID</p>
                <code className="text-blue-400 text-sm">{selectedAgent.id}</code>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Type</p>
                <span className={`inline-block px-2 py-1 rounded text-sm text-white ${
                  AGENT_TYPES[selectedAgent.type]?.color || 'bg-gray-600'
                }`}>
                  {AGENT_TYPES[selectedAgent.type]?.label || selectedAgent.type}
                </span>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Statut</p>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    selectedAgent.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-white capitalize">{selectedAgent.status}</span>
                </div>
              </div>
              {selectedAgent.relations?.length > 0 && (
                <div>
                  <p className="text-gray-400 text-sm mb-2">Relations</p>
                  <div className="space-y-2">
                    {getAgentRelations(selectedAgent.id).map((rel) => (
                      <div
                        key={rel.id}
                        className="flex items-center gap-2 p-2 bg-gray-700/50 rounded-lg"
                      >
                        <div className={`w-2 h-2 rounded-full ${
                          rel.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <span className="text-gray-300 text-sm">{rel.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Cliquez sur un agent pour voir ses détails
            </p>
          )}
        </div>
      </div>

      {/* Vue en liste */}
      <div className="card overflow-x-auto">
        <h3 className="text-lg font-semibold text-white mb-4">Liste des agents</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-gray-400 font-medium">ID</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Nom</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Statut</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Relations</th>
            </tr>
          </thead>
          <tbody>
            {agents?.map((agent) => (
              <tr key={agent.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                <td className="py-3 px-4">
                  <code className="text-sm text-blue-400">{agent.id}</code>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      agent.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-white">{agent.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-block px-2 py-1 rounded text-xs text-white ${
                    AGENT_TYPES[agent.type]?.color || 'bg-gray-600'
                  }`}>
                    {AGENT_TYPES[agent.type]?.label || agent.type}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`capitalize ${
                    agent.status === 'online' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {agent.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1 text-gray-400">
                    <LinkIcon className="w-4 h-4" />
                    {agent.relations?.length || 0}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Agents;
