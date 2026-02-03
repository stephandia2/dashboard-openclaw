# 🚀 OpenClaw Dashboard

Dashboard web complet pour surveiller et gérer votre instance OpenClaw.

## 📋 Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Installation](#installation)
- [Utilisation](#utilisation)
- [API](#api)
- [Développement](#développement)
- [Docker](#docker)

## ✨ Fonctionnalités

### Backend (Flask)
- ✅ API REST complète
- ✅ WebSocket pour logs temps réel
- ✅ Base de données SQLite avec SQLAlchemy
- ✅ Gestion des tâches Kanban
- ✅ Gestion des jobs cron
- ✅ Monitoring des agents et skills

### Frontend (React)
- 🎨 Interface moderne avec Tailwind CSS (dark mode)
- 📊 Tableaux de bord avec graphiques (Recharts)
- 🔄 Kanban board avec drag & drop
- 📡 Logs en temps réel via WebSocket
- 📱 Responsive design

## 🏗️ Architecture

```
dashboard-openclaw/
├── app.py                 # Backend Flask
├── requirements.txt       # Dépendances Python
├── Dockerfile            # Configuration Docker
├── database/
│   └── models.py         # Modèles SQLAlchemy
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── components/
        │   ├── Dashboard.jsx
        │   ├── KanbanBoard.jsx
        │   ├── CronJobs.jsx
        │   ├── Agents.jsx
        │   ├── Skills.jsx
        │   ├── Models.jsx
        │   ├── HeartbeatMonitor.jsx
        │   ├── LogsViewer.jsx
        │   └── QuickActions.jsx
        └── hooks/
            └── useApi.js
```

## 🚀 Installation

### Prérequis

- Python 3.11+
- Node.js 18+
- npm ou yarn

### Backend

1. Créer un environnement virtuel :
```bash
cd /home/quentinagency/Documents/App/dashboard-openclaw
python3 -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate
```

2. Installer les dépendances :
```bash
pip install -r requirements.txt
```

3. Lancer le serveur :
```bash
python app.py
```

Le backend sera accessible sur `http://localhost:5000`

### Frontend

1. Installer les dépendances :
```bash
cd frontend
npm install
```

2. Lancer le serveur de développement :
```bash
npm run dev
```

Le frontend sera accessible sur `http://localhost:3000`

## 🐳 Docker

### Construire et lancer avec Docker

```bash
# Construire l'image
docker build -t openclaw-dashboard .

# Lancer le conteneur
docker run -p 5000:5000 -v $(pwd)/instance:/app/instance openclaw-dashboard
```

### Docker Compose

```yaml
version: '3.8'
services:
  dashboard:
    build: .
    ports:
      - "5000:5000"
    volumes:
      - ./instance:/app/instance
    environment:
      - FLASK_ENV=production
```

## 📝 Utilisation

### Dashboard
La page principale affiche :
- Statut du Gateway (online/offline)
- Statistiques des agents et skills
- Graphiques d'utilisation des tokens
- Coûts par modèle

### Kanban Board
Gérez vos tâches avec le système Kanban :
- Créer, modifier, supprimer des tâches
- Drag & drop entre les colonnes
- Priorités et assignations

### Cron Jobs
- Liste des jobs planifiés
- Exécution manuelle
- Activation/désactivation
- Suppression

### Agents
- Visualisation de la topologie
- Statut des agents
- Relations entre agents

### Skills
- Liste des skills installés
- Activation/désactivation
- Versions et descriptions

### Models
- Modèles LLM disponibles
- Comparaison des coûts
- Switch rapide entre modèles

### Heartbeat Monitor
- Surveillance temps réel
- Historique des heartbeats
- Temps de réponse
- Uptime

### Logs
- Logs en temps réel (WebSocket)
- Filtres par niveau et source
- Recherche
- Téléchargement

### Quick Actions
- Redémarrer Gateway
- Vider le cache
- Créer des backups
- Actions d'urgence

## 🔌 API

### Endpoints

#### Statut
```
GET /api/status
```

#### Métriques
```
GET /api/metrics
```

#### Tâches (Kanban)
```
GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
```

#### Jobs Cron
```
GET    /api/cron-jobs
POST   /api/cron-jobs/:id/run
POST   /api/cron-jobs/:id/toggle
DELETE /api/cron-jobs/:id
```

#### Agents
```
GET /api/agents
```

#### Skills
```
GET    /api/skills
POST   /api/skills/:id/toggle
```

#### Modèles
```
GET    /api/models
POST   /api/models/:id/activate
```

#### Heartbeat
```
GET /api/heartbeat
```

#### Logs
```
GET /api/logs?limit=50&level=INFO&source=gateway
```

#### Actions
```
POST /api/actions/restart
POST /api/actions/clear-cache
```

### WebSocket

Se connecter à `ws://localhost:5000/socket.io`

Événements :
- `connect` - Connexion établie
- `new_log` - Nouveau log reçu
- `task_created` - Tâche créée
- `task_updated` - Tâche mise à jour
- `job_completed` - Job terminé
- `gateway_restarted` - Gateway redémarré

## 💻 Développement

### Structure du code

Le projet suit une architecture modulaire :

- **Backend** : Flask avec blueprints pour organiser les routes
- **Frontend** : React avec hooks personnalisés pour l'API
- **Base de données** : SQLAlchemy ORM avec migrations

### Tests

```bash
# Backend
pytest

# Frontend
npm test
```

### Linting

```bash
# Python
flake8 app.py

# JavaScript
npm run lint
```

## 🛠️ Technologies utilisées

### Backend
- **Flask** - Framework web Python
- **Flask-SocketIO** - WebSocket
- **Flask-SQLAlchemy** - ORM
- **Flask-CORS** - CORS

### Frontend
- **React 18** - Framework UI
- **Vite** - Build tool
- **Tailwind CSS** - CSS framework
- **Recharts** - Graphiques
- **Socket.io-client** - WebSocket client
- **@dnd-kit** - Drag & drop

## 📄 License

MIT License - Voir LICENSE pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📧 Contact

Pour toute question ou suggestion, n'hésitez pas à contacter l'équipe OpenClaw.
