import React, { useState, useEffect, useRef } from 'react';
import { useApi } from '../hooks/useApi';
import { io } from 'socket.io-client';
import {
  DocumentTextIcon,
  FunnelIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  PauseIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';

const LOG_LEVELS = {
  DEBUG: { color: 'text-gray-400', bg: 'bg-gray-700' },
  INFO: { color: 'text-blue-400', bg: 'bg-blue-900/30' },
  WARN: { color: 'text-yellow-400', bg: 'bg-yellow-900/30' },
  ERROR: { color: 'text-red-400', bg: 'bg-red-900/30' },
};

const LOG_SOURCES = ['gateway', 'scheduler', 'api', 'database', 'system'];

function LogsViewer() {
  const { data: initialLogs, loading } = useApi('/api/logs?limit=100');
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [levelFilter, setLevelFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [connected, setConnected] = useState(false);
  const logsEndRef = useRef(null);
  const socketRef = useRef(null);

  // Initialiser les logs
  useEffect(() => {
    if (initialLogs) {
      setLogs(initialLogs);
    }
  }, [initialLogs]);

  // WebSocket connection
  useEffect(() => {
    socketRef.current = io('/');

    socketRef.current.on('connect', () => {
      setConnected(true);
      console.log('Connected to logs WebSocket');
    });

    socketRef.current.on('disconnect', () => {
      setConnected(false);
      console.log('Disconnected from logs WebSocket');
    });

    socketRef.current.on('new_log', (newLog) => {
      if (!isPaused) {
        setLogs((prevLogs) => [newLog, ...prevLogs].slice(0, 1000));
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [isPaused]);

  // Filtrer les logs
  useEffect(() => {
    let filtered = logs;

    if (levelFilter) {
      filtered = filtered.filter((log) => log.level === levelFilter);
    }

    if (sourceFilter) {
      filtered = filtered.filter((log) => log.source === sourceFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.message.toLowerCase().includes(query) ||
          log.source.toLowerCase().includes(query)
      );
    }

    setFilteredLogs(filtered);
  }, [logs, levelFilter, sourceFilter, searchQuery]);

  // Auto-scroll
  useEffect(() => {
    if (!isPaused && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredLogs, isPaused]);

  const clearLogs = () => {
    setLogs([]);
  };

  const downloadLogs = () => {
    const logText = filteredLogs
      .map(
        (log) =>
          `[${new Date(log.timestamp).toISOString()}] [${log.level}] [${log.source}] ${log.message}`
      )
      .join('\n');

    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `openclaw-logs-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Logs</h1>
          <p className="text-gray-400 mt-1">
            Logs en temps réel du système OpenClaw
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-gray-300 text-sm">{connected ? 'Connecté' : 'Déconnecté'}</span>
        </div>
      </div>

      {/* Contrôles */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-4">
          {/* Filtre par niveau */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="input w-32"
            >
              <option value="">Tous niveaux</option>
              <option value="DEBUG">DEBUG</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
            </select>
          </div>

          {/* Filtre par source */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="input w-32"
          >
            <option value="">Toutes sources</option>
            {LOG_SOURCES.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>

          {/* Recherche */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher dans les logs..."
            className="input flex-1 min-w-[200px]"
          />

          {/* Boutons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="btn-secondary flex items-center gap-2"
            >
              {isPaused ? (
                <>
                  <PlayIcon className="w-4 h-4" />
                  Reprendre
                </>
              ) : (
                <>
                  <PauseIcon className="w-4 h-4" />
                  Pause
                </>
              )}
            </button>
            <button
              onClick={clearLogs}
              className="btn-danger flex items-center gap-2"
            >
              <TrashIcon className="w-4 h-4" />
              Vider
            </button>
            <button
              onClick={downloadLogs}
              className="btn-primary flex items-center gap-2"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Télécharger
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 text-sm">
        <span className="text-gray-400">
          Total: <span className="text-white font-mono">{logs.length}</span>
        </span>
        <span className="text-gray-400">
          Affichés: <span className="text-white font-mono">{filteredLogs.length}</span>
        </span>
        {isPaused && (
          <span className="text-yellow-400 flex items-center gap-1">
            <PauseIcon className="w-4 h-4" />
            En pause
          </span>
        )}
      </div>

      {/* Logs */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full">
            <thead className="sticky top-0 bg-gray-800 z-10">
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-4 text-gray-400 font-medium w-24">Heure</th>
                <th className="text-left py-2 px-4 text-gray-400 font-medium w-20">Niveau</th>
                <th className="text-left py-2 px-4 text-gray-400 font-medium w-24">Source</th>
                <th className="text-left py-2 px-4 text-gray-400 font-medium">Message</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-500">
                    <DocumentTextIcon className="w-12 h-12 mx-auto mb-2 text-gray-600" />
                    Aucun log à afficher
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const levelStyle = LOG_LEVELS[log.level] || LOG_LEVELS.INFO;
                  return (
                    <tr
                      key={log.id}
                      className={`border-b border-gray-700/30 hover:bg-gray-700/20 ${levelStyle.bg}`}
                    >
                      <td className="py-2 px-4">
                        <span className="text-gray-400 font-mono text-xs">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        <span className={`text-xs font-bold ${levelStyle.color}`}>
                          {log.level}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        <span className="text-gray-500 text-xs">{log.source}</span>
                      </td>
                      <td className="py-2 px-4">
                        <span className="text-gray-300 text-sm">{log.message}</span>
                      </td>
                    </tr>
                  );
                })
              )}
              <tr ref={logsEndRef} />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default LogsViewer;
