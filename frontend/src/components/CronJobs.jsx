import React, { useState } from 'react';
import { useApi, apiPost, apiDelete } from '../hooks/useApi';
import {
  PlayIcon,
  PauseIcon,
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  RefreshIcon,
} from '@heroicons/react/24/outline';

function CronJobs() {
  const { data: jobs, loading, refetch } = useApi('/api/cron-jobs');
  const [runningJobs, setRunningJobs] = useState(new Set());

  const handleRunJob = async (jobId) => {
    try {
      setRunningJobs((prev) => new Set(prev).add(jobId));
      await apiPost(`/api/cron-jobs/${jobId}/run`);
      refetch();
    } catch (error) {
      console.error('Erreur lors de l\'exécution:', error);
    } finally {
      setRunningJobs((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
    }
  };

  const handleToggleJob = async (jobId) => {
    try {
      await apiPost(`/api/cron-jobs/${jobId}/toggle`);
      refetch();
    } catch (error) {
      console.error('Erreur lors du changement d\'état:', error);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (confirm('Voulez-vous vraiment supprimer ce job ?')) {
      try {
        await apiDelete(`/api/cron-jobs/${jobId}`);
        refetch();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const getStatusBadge = (status, isActive) => {
    if (!isActive) {
      return <span className="badge-gray">Désactivé</span>;
    }
    switch (status) {
      case 'running':
        return <span className="badge-blue">En cours</span>;
      case 'error':
        return <span className="badge-red">Erreur</span>;
      default:
        return <span className="badge-green">Actif</span>;
    }
  };

  const formatSchedule = (schedule) => {
    // Format simple pour l'affichage - dans un vrai système, on utiliserait une lib comme cron-parser
    const parts = schedule.split(' ');
    if (parts.length === 5) {
      if (parts[0] === '0' && parts[1] === '0') {
        return `Tous les jours à minuit`;
      }
      if (parts[0].startsWith('0') && parts[2] === '*') {
        return `Tous les jours à ${parts[1]}h${parts[0].replace('0', '')}`;
      }
      if (parts[4] !== '*') {
        const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        return `Tous les ${days[parseInt(parts[4])] || parts[4]}`;
      }
    }
    return schedule;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Cron Jobs</h1>
          <p className="text-gray-400 mt-1">
            Gérez vos tâches planifiées
          </p>
        </div>
        <button
          onClick={refetch}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshIcon className="w-5 h-5" />
          Actualiser
        </button>
      </div>

      {/* Liste des jobs */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Nom</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Schedule</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Commande</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Dernier run</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Statut</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs?.map((job) => (
              <tr key={job.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <ClockIcon className="w-5 h-5 text-gray-500" />
                    <span className="text-white font-medium">{job.name}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <code className="text-sm text-blue-400 bg-blue-900/30 px-2 py-1 rounded">
                    {job.schedule}
                  </code>
                  <p className="text-gray-500 text-sm mt-1">{formatSchedule(job.schedule)}</p>
                </td>
                <td className="py-4 px-4">
                  <code className="text-sm text-green-400 font-mono">{job.command}</code>
                </td>
                <td className="py-4 px-4">
                  {job.last_run ? (
                    <span className="text-gray-300">
                      {new Date(job.last_run).toLocaleString('fr-FR')}
                    </span>
                  ) : (
                    <span className="text-gray-500">Jamais</span>
                  )}
                </td>
                <td className="py-4 px-4">
                  {getStatusBadge(job.status, job.is_active)}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRunJob(job.id)}
                      disabled={runningJobs.has(job.id) || job.status === 'running'}
                      className="btn-icon text-green-400 hover:text-green-300 disabled:opacity-50"
                      title="Exécuter"
                    >
                      {runningJobs.has(job.id) ? (
                        <RefreshIcon className="w-5 h-5 animate-spin" />
                      ) : (
                        <PlayIcon className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleToggleJob(job.id)}
                      className={`btn-icon ${job.is_active ? 'text-yellow-400 hover:text-yellow-300' : 'text-green-400 hover:text-green-300'}`}
                      title={job.is_active ? 'Désactiver' : 'Activer'}
                    >
                      {job.is_active ? (
                        <PauseIcon className="w-5 h-5" />
                      ) : (
                        <CheckCircleIcon className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="btn-icon text-red-400 hover:text-red-300"
                      title="Supprimer"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {jobs?.length === 0 && (
          <div className="text-center py-12">
            <ClockIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Aucun job cron configuré</p>
          </div>
        )}
      </div>

      {/* Légende */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Légende</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <PlayIcon className="w-5 h-5 text-green-400" />
            <span className="text-gray-300">Exécuter manuellement</span>
          </div>
          <div className="flex items-center gap-2">
            <PauseIcon className="w-5 h-5 text-yellow-400" />
            <span className="text-gray-300">Désactiver</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-green-400" />
            <span className="text-gray-300">Activer</span>
          </div>
          <div className="flex items-center gap-2">
            <TrashIcon className="w-5 h-5 text-red-400" />
            <span className="text-gray-300">Supprimer</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CronJobs;
