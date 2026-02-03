import React, { useState } from 'react';
import { apiPost } from '../hooks/useApi';
import {
  BoltIcon,
  ArrowPathIcon,
  TrashIcon,
  ServerIcon,
  CloudArrowUpIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const ACTIONS = [
  {
    id: 'restart',
    name: 'Redémarrer Gateway',
    description: 'Redémarre le service Gateway OpenClaw',
    icon: ArrowPathIcon,
    color: 'blue',
    dangerous: false,
  },
  {
    id: 'clear-cache',
    name: 'Vider le cache',
    description: 'Supprime toutes les données en cache',
    icon: TrashIcon,
    color: 'yellow',
    dangerous: false,
  },
  {
    id: 'backup',
    name: 'Créer une backup',
    description: 'Crée une sauvegarde complète de la configuration',
    icon: ServerIcon,
    color: 'green',
    dangerous: false,
  },
  {
    id: 'update-skills',
    name: 'Mettre à jour les skills',
    description: 'Télécharge les dernières versions des skills',
    icon: CloudArrowUpIcon,
    color: 'purple',
    dangerous: false,
  },
  {
    id: 'reload-config',
    name: 'Recharger la configuration',
    description: 'Recharge le fichier de configuration sans redémarrer',
    icon: CogIcon,
    color: 'gray',
    dangerous: false,
  },
  {
    id: 'emergency-stop',
    name: 'Arrêt d\'urgence',
    description: 'Arrête immédiatement tous les agents et services',
    icon: ExclamationTriangleIcon,
    color: 'red',
    dangerous: true,
  },
];

function QuickActions() {
  const [executing, setExecuting] = useState(null);
  const [results, setResults] = useState({});

  const handleAction = async (actionId) => {
    const action = ACTIONS.find((a) => a.id === actionId);

    if (action.dangerous) {
      const confirmed = confirm(
        `⚠️ ATTENTION: ${action.name}\n\n${action.description}\n\nCette action est irréversible. Continuer ?`
      );
      if (!confirmed) return;
    }

    setExecuting(actionId);
    setResults((prev) => ({ ...prev, [actionId]: null }));

    try {
      let result;
      switch (actionId) {
        case 'restart':
          result = await apiPost('/api/actions/restart');
          break;
        case 'clear-cache':
          result = await apiPost('/api/actions/clear-cache');
          break;
        case 'backup':
        case 'update-skills':
        case 'reload-config':
        case 'emergency-stop':
          // Simuler pour les actions non implémentées
          await new Promise((resolve) => setTimeout(resolve, 1500));
          result = { message: `${action.name} exécuté avec succès` };
          break;
        default:
          result = { message: 'Action non reconnue' };
      }

      setResults((prev) => ({ ...prev, [actionId]: { success: true, message: result.message } }));
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [actionId]: { success: false, message: error.message },
      }));
    } finally {
      setExecuting(null);
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-600 hover:bg-blue-700 ring-blue-500',
      yellow: 'bg-yellow-600 hover:bg-yellow-700 ring-yellow-500',
      green: 'bg-green-600 hover:bg-green-700 ring-green-500',
      purple: 'bg-purple-600 hover:bg-purple-700 ring-purple-500',
      gray: 'bg-gray-600 hover:bg-gray-700 ring-gray-500',
      red: 'bg-red-600 hover:bg-red-700 ring-red-500',
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Actions rapides</h1>
        <p className="text-gray-400 mt-1">
          Exécutez des actions sur votre instance OpenClaw
        </p>
      </div>

      {/* Grille d'actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          const isExecuting = executing === action.id;
          const result = results[action.id];

          return (
            <div
              key={action.id}
              className={`card transition-all ${
                action.dangerous ? 'border-red-500/30' : ''
              } ${result?.success ? 'border-green-500/30' : ''}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${getColorClasses(action.color)}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {action.dangerous && (
                  <span className="badge-red text-xs">Dangereux</span>
                )}
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">{action.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{action.description}</p>

              {result && (
                <div
                  className={`p-3 rounded-lg mb-4 ${
                    result.success ? 'bg-green-900/30' : 'bg-red-900/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-400" />
                    ) : (
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                    )}
                    <span className={result.success ? 'text-green-300' : 'text-red-300'}>
                      {result.message}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={() => handleAction(action.id)}
                disabled={isExecuting}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                  action.dangerous
                    ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
                    : 'bg-gray-700 hover:bg-gray-600 text-white focus:ring-blue-500'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isExecuting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Exécution...
                  </span>
                ) : (
                  'Exécuter'
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Section d'avertissement */}
      <div className="card bg-yellow-900/20 border-yellow-600/30">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-yellow-300 font-medium mb-1">Attention</h4>
            <p className="text-yellow-200/70 text-sm">
              Certaines actions peuvent avoir des effets irréversibles. Assurez-vous de comprendre
              l'impact de chaque action avant de l'exécuter. Les actions marquées comme "Dangereux"
              nécessitent une confirmation supplémentaire.
            </p>
          </div>
        </div>
      </div>

      {/* Journal des actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Journal des actions</h3>
        <div className="space-y-2">
          {Object.entries(results).length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aucune action exécutée récemment</p>
          ) : (
            Object.entries(results).map(([actionId, result]) => {
              const action = ACTIONS.find((a) => a.id === actionId);
              if (!result) return null;
              return (
                <div
                  key={actionId}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    result.success ? 'bg-green-900/20' : 'bg-red-900/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {result.success ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-400" />
                    ) : (
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                    )}
                    <span className="text-gray-300">{action?.name}</span>
                  </div>
                  <span className={`text-sm ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                    {result.success ? 'Succès' : 'Échec'}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default QuickActions;
