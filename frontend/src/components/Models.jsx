import React, { useState } from 'react';
import { useApi, apiPost } from '../hooks/useApi';
import {
  SwatchIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ArrowsRightLeftIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

const PROVIDER_COLORS = {
  'Anthropic': 'bg-orange-600',
  'OpenAI': 'bg-green-600',
  'Google': 'bg-blue-600',
  'Mistral': 'bg-purple-600',
};

function Models() {
  const { data: models, loading, refetch } = useApi('/api/models');
  const [switchingModel, setSwitchingModel] = useState(null);

  const handleActivateModel = async (modelId) => {
    try {
      setSwitchingModel(modelId);
      await apiPost(`/api/models/${modelId}/activate`);
      refetch();
    } catch (error) {
      console.error('Erreur lors du changement de modèle:', error);
    } finally {
      setSwitchingModel(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const activeModel = models?.find((m) => m.active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Modèles LLM</h1>
        <p className="text-gray-400 mt-1">
          Gérez les modèles de langage et leurs coûts
        </p>
      </div>

      {/* Modèle actif */}
      {activeModel && (
        <div className="card bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-500/50">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-green-500 rounded-xl">
              <CheckCircleIcon className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-gray-400 text-sm">Modèle actif</p>
              <h2 className="text-2xl font-bold text-white">{activeModel.name}</h2>
              <p className="text-gray-300">{activeModel.provider}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Coût input</p>
              <p className="text-xl font-bold text-green-400">
                ${activeModel.cost_per_1k_input}/1K
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Coût output</p>
              <p className="text-xl font-bold text-green-400">
                ${activeModel.cost_per_1k_output}/1K
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Liste des modèles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {models?.map((model) => (
          <div
            key={model.id}
            className={`card transition-all ${
              model.active
                ? 'border-green-500/50 ring-2 ring-green-500/20'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${
                  PROVIDER_COLORS[model.provider] || 'bg-gray-600'
                }`}>
                  <SwatchIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{model.name}</h3>
                  <p className="text-gray-400 text-sm">{model.provider}</p>
                </div>
              </div>
              {model.active ? (
                <span className="badge-green">Actif</span>
              ) : (
                <span className="badge-gray">Inactif</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-700/50 rounded-lg p-3">
                <p className="text-gray-400 text-xs mb-1">Input / 1K tokens</p>
                <p className="text-green-400 font-mono font-bold">
                  ${model.cost_per_1k_input.toFixed(4)}
                </p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3">
                <p className="text-gray-400 text-xs mb-1">Output / 1K tokens</p>
                <p className="text-green-400 font-mono font-bold">
                  ${model.cost_per_1k_output.toFixed(4)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <code className="text-xs text-gray-500 font-mono">{model.id}</code>
              {!model.active && (
                <button
                  onClick={() => handleActivateModel(model.id)}
                  disabled={switchingModel === model.id}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  {switchingModel === model.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Changement...
                    </>
                  ) : (
                    <>
                      <ArrowsRightLeftIcon className="w-4 h-4" />
                      Activer
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Comparaison des coûts */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Comparaison des coûts</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Modèle</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Provider</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Input/1K</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Output/1K</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Total/1K</th>
              </tr>
            </thead>
            <tbody>
              {models?.map((model) => (
                <tr
                  key={model.id}
                  className={`border-b border-gray-700/50 hover:bg-gray-700/30 ${
                    model.active ? 'bg-green-900/10' : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {model.active && (
                        <CheckCircleIcon className="w-5 h-5 text-green-400" />
                      )}
                      <span className={`font-medium ${model.active ? 'text-green-300' : 'text-white'}`}>
                        {model.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-1 rounded text-xs text-white ${
                      PROVIDER_COLORS[model.provider] || 'bg-gray-600'
                    }`}>
                      {model.provider}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-green-400 font-mono">
                      ${model.cost_per_1k_input.toFixed(4)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-yellow-400 font-mono">
                      ${model.cost_per_1k_output.toFixed(4)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-white font-mono font-bold">
                      ${(model.cost_per_1k_input + model.cost_per_1k_output).toFixed(4)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info box */}
      <div className="card bg-blue-900/20 border-blue-600/30">
        <div className="flex items-start gap-3">
          <InformationCircleIcon className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-blue-300 font-medium mb-1">Coûts estimés</h4>
            <p className="text-blue-200/70 text-sm">
              Les coûts affichés sont des estimations basées sur les tarifs publics des providers. 
              Les coûts réels peuvent varier en fonction de votre plan et de votre utilisation. 
              Les prix sont indiqués pour 1000 tokens (input ou output).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Models;
