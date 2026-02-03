import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  HeartIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

function HeartbeatMonitor() {
  const { data: heartbeatData, loading } = useApi('/api/heartbeat');
  const [currentStatus, setCurrentStatus] = useState('ok');

  // Simuler un heartbeat temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      // Dans un vrai système, on ferait un appel API ou WebSocket
      setCurrentStatus(Math.random() > 0.9 ? 'warning' : 'ok');
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const history = heartbeatData?.history || [];
  const current = heartbeatData?.current || {};

  // Calculer les statistiques
  const totalChecks = history.length;
  const okChecks = history.filter((h) => h.status === 'ok').length;
  const warningChecks = history.filter((h) => h.status === 'warning').length;
  const errorChecks = history.filter((h) => h.status === 'error').length;
  const avgResponseTime = history.reduce((acc, h) => acc + h.response_time, 0) / totalChecks;

  // Préparer les données pour le graphique
  const chartData = history.map((h) => ({
    time: new Date(h.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    responseTime: h.response_time,
    status: h.status === 'ok' ? 1 : h.status === 'warning' ? 0.5 : 0,
  }));

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ok':
        return <CheckCircleIcon className="w-6 h-6 text-green-400" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" />;
      case 'error':
        return <XCircleIcon className="w-6 h-6 text-red-400" />;
      default:
        return <ClockIcon className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ok':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'ok':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Heartbeat Monitor</h1>
        <p className="text-gray-400 mt-1">
          Surveillance de la santé du système en temps réel
        </p>
      </div>

      {/* Statut actuel */}
      <div className={`card ${currentStatus === 'ok' ? 'border-green-500/50' : 'border-yellow-500/50'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-xl ${getStatusBg(currentStatus)} ${currentStatus === 'ok' ? 'animate-pulse' : ''}`}>
              <HeartIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Statut actuel</p>
              <h2 className={`text-2xl font-bold ${getStatusColor(currentStatus)}`}>
                {currentStatus === 'ok' ? 'Système opérationnel' : 'Attention requise'}
              </h2>
              <p className="text-gray-300">
                Dernière vérification: {current.response_time}ms
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Uptime (24h)</p>
            <p className="text-3xl font-bold text-white">
              {((okChecks / totalChecks) * 100).toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-gray-400 text-sm">Checks OK</p>
              <p className="text-2xl font-bold text-white">{okChecks}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-gray-400 text-sm">Warnings</p>
              <p className="text-2xl font-bold text-white">{warningChecks}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <XCircleIcon className="w-8 h-8 text-red-400" />
            <div>
              <p className="text-gray-400 text-sm">Errors</p>
              <p className="text-2xl font-bold text-white">{errorChecks}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <ClockIcon className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-gray-400 text-sm">Temps moyen</p>
              <p className="text-2xl font-bold text-white">{avgResponseTime.toFixed(0)}ms</p>
            </div>
          </div>
        </div>
      </div>

      {/* Graphique de temps de réponse */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">
          Temps de réponse (24 dernières heures)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorResponse" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" unit="ms" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#F3F4F6' }}
            />
            <Area
              type="monotone"
              dataKey="responseTime"
              stroke="#3B82F6"
              fillOpacity={1}
              fill="url(#colorResponse)"
              name="Temps de réponse (ms)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Historique détaillé */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Historique détaillé</h3>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full">
            <thead className="sticky top-0 bg-gray-800">
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Heure</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Statut</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Temps de réponse</th>
              </tr>
            </thead>
            <tbody>
              {[...history].reverse().map((entry, index) => (
                <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="py-2 px-4">
                    <span className="text-gray-300 font-mono text-sm">
                      {new Date(entry.timestamp).toLocaleTimeString('fr-FR')}
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(entry.status)}
                      <span className={`capitalize ${getStatusColor(entry.status)}`}>
                        {entry.status === 'ok' ? 'OK' : entry.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-4 text-right">
                    <span className={`font-mono ${
                      entry.response_time > 300 ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {entry.response_time}ms
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default HeartbeatMonitor;
