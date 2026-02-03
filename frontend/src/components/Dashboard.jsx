import React from 'react';
import { useApi } from '../hooks/useApi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CpuChipIcon,
  PuzzlePieceIcon,
} from '@heroicons/react/24/outline';

function StatCard({ title, value, subtext, icon: Icon, color }) {
  const colors = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-600',
  };

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-white mt-2">{value}</h3>
          {subtext && <p className="text-gray-500 text-sm mt-1">{subtext}</p>}
        </div>
        <div className={`${colors[color]} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { data: statusData, loading: statusLoading } = useApi('/api/status');
  const { data: metricsData, loading: metricsLoading } = useApi('/api/metrics');
  const { data: agentsData, loading: agentsLoading } = useApi('/api/agents');
  const { data: skillsData, loading: skillsLoading } = useApi('/api/skills');

  const isLoading = statusLoading || metricsLoading || agentsLoading || skillsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Calculer les statistiques
  const onlineAgents = agentsData?.filter(a => a.status === 'online').length || 0;
  const totalAgents = agentsData?.length || 0;
  const enabledSkills = skillsData?.filter(s => s.enabled).length || 0;
  const totalSkills = skillsData?.length || 0;

  // Préparer les données pour le graphique de coûts
  const costData = metricsData?.metrics?.reduce((acc, metric) => {
    const existing = acc.find(item => item.date === metric.date);
    if (existing) {
      existing.cost += metric.cost;
    } else {
      acc.push({ date: metric.date, cost: metric.cost });
    }
    return acc;
  }, []) || [];

  // Préparer les données pour le graphique par modèle
  const modelData = metricsData?.metrics?.reduce((acc, metric) => {
    const existing = acc.find(item => item.model === metric.model);
    if (existing) {
      existing.tokens += metric.tokens_input + metric.tokens_output;
    } else {
      acc.push({ 
        model: metric.model, 
        tokens: metric.tokens_input + metric.tokens_output 
      });
    }
    return acc;
  }, []) || [];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Vue d'ensemble de votre instance OpenClaw
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${statusData?.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-gray-300">
            {statusData?.status === 'online' ? 'En ligne' : 'Hors ligne'}
          </span>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid-dashboard">
        <StatCard
          title="Status Gateway"
          value={statusData?.status === 'online' ? 'Online' : 'Offline'}
          subtext={`Uptime: ${statusData?.uptime || 'N/A'}`}
          icon={statusData?.status === 'online' ? CheckCircleIcon : ExclamationCircleIcon}
          color={statusData?.status === 'online' ? 'green' : 'orange'}
        />
        <StatCard
          title="Agents Actifs"
          value={`${onlineAgents}/${totalAgents}`}
          subtext={`${onlineAgents} agents en ligne`}
          icon={CpuChipIcon}
          color="blue"
        />
        <StatCard
          title="Skills Activés"
          value={`${enabledSkills}/${totalSkills}`}
          subtext={`${enabledSkills} skills actifs`}
          icon={PuzzlePieceIcon}
          color="purple"
        />
        <StatCard
          title="Coût Total (7j)"
          value={`$${metricsData?.summary?.total_cost?.toFixed(2) || '0.00'}`}
          subtext={`${metricsData?.summary?.total_tokens_input?.toLocaleString() || 0} tokens input`}
          icon={CurrencyDollarIcon}
          color="green"
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique de coûts */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">
            Coûts par jour (7 derniers jours)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={costData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                tickFormatter={(date) => new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Line 
                type="monotone" 
                dataKey="cost" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique par modèle */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">
            Utilisation par modèle
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={modelData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ model, percent }) => `${model}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="tokens"
              >
                {modelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Informations système */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">
          Informations système
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Version</p>
            <p className="text-white font-mono">{statusData?.version || 'N/A'}</p>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Uptime</p>
            <p className="text-white font-mono">{statusData?.uptime || 'N/A'}</p>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Dernier heartbeat</p>
            <p className="text-white font-mono">
              {statusData?.timestamp ? new Date(statusData.timestamp).toLocaleTimeString('fr-FR') : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
