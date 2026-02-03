import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CpuChipIcon,
  PuzzlePieceIcon,
  SwatchIcon,
  HeartIcon,
  DocumentTextIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';

// Import des composants
import Dashboard from './components/Dashboard';
import KanbanBoard from './components/KanbanBoard';
import CronJobs from './components/CronJobs';
import Agents from './components/Agents';
import Skills from './components/Skills';
import Models from './components/Models';
import HeartbeatMonitor from './components/HeartbeatMonitor';
import LogsViewer from './components/LogsViewer';
import QuickActions from './components/QuickActions';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: HomeIcon },
    { path: '/kanban', label: 'Kanban', icon: ClipboardDocumentListIcon },
    { path: '/cron', label: 'Cron Jobs', icon: ClockIcon },
    { path: '/agents', label: 'Agents', icon: CpuChipIcon },
    { path: '/skills', label: 'Skills', icon: PuzzlePieceIcon },
    { path: '/models', label: 'Models', icon: SwatchIcon },
    { path: '/heartbeat', label: 'Heartbeat', icon: HeartIcon },
    { path: '/logs', label: 'Logs', icon: DocumentTextIcon },
    { path: '/actions', label: 'Actions', icon: BoltIcon },
  ];

  return (
    <Router>
      <div className="flex h-screen bg-gray-900">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-20'
          } bg-gray-800 border-r border-gray-700 transition-all duration-300 flex flex-col`}
        >
          {/* Logo */}
          <div className="p-6 flex items-center justify-between">
            {sidebarOpen ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">C</span>
                </div>
                <span className="text-xl font-bold text-white">OpenClaw</span>
              </div>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto">
                <span className="text-white font-bold text-xl">C</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`
                }
                title={!sidebarOpen ? item.label : ''}
              >
                <item.icon className="w-6 h-6 flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </NavLink>
            ))}
          </nav>

          {/* Toggle Sidebar Button */}
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex items-center justify-center p-2 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <svg
                className={`w-6 h-6 transform transition-transform duration-300 ${
                  sidebarOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </svg>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/kanban" element={<KanbanBoard />} />
              <Route path="/cron" element={<CronJobs />} />
              <Route path="/agents" element={<Agents />} />
              <Route path="/skills" element={<Skills />} />
              <Route path="/models" element={<Models />} />
              <Route path="/heartbeat" element={<HeartbeatMonitor />} />
              <Route path="/logs" element={<LogsViewer />} />
              <Route path="/actions" element={<QuickActions />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
