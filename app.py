# OpenClaw Dashboard - Flask Backend
# Fichier: app.py

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import random
import threading
import time
import os

# Configuration de l'application
app = Flask(__name__)
app.config['SECRET_KEY'] = 'openclaw-dashboard-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///openclaw.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialisation des extensions
db = SQLAlchemy(app)
CORS(app, resources={r"/api/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# =============================================================================
# MODÈLES SQLALCHEMY
# =============================================================================

class Task(db.Model):
    """Modèle pour les tâches Kanban"""
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='todo')  # todo, in_progress, done
    priority = db.Column(db.String(10), default='medium')  # low, medium, high
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    assignee = db.Column(db.String(100), nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'priority': self.priority,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'assignee': self.assignee
        }

class CronJob(db.Model):
    """Modèle pour les jobs cron"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    schedule = db.Column(db.String(100), nullable=False)  # Expression cron
    command = db.Column(db.String(500), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    last_run = db.Column(db.DateTime, nullable=True)
    next_run = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(20), default='idle')  # idle, running, error
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'schedule': self.schedule,
            'command': self.command,
            'is_active': self.is_active,
            'last_run': self.last_run.isoformat() if self.last_run else None,
            'next_run': self.next_run.isoformat() if self.next_run else None,
            'status': self.status
        }

class Metric(db.Model):
    """Modèle pour les métriques"""
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, default=datetime.utcnow().date)
    model = db.Column(db.String(50), nullable=False)
    tokens_input = db.Column(db.Integer, default=0)
    tokens_output = db.Column(db.Integer, default=0)
    cost = db.Column(db.Float, default=0.0)
    
    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.isoformat() if self.date else None,
            'model': self.model,
            'tokens_input': self.tokens_input,
            'tokens_output': self.tokens_output,
            'cost': self.cost
        }

class LogEntry(db.Model):
    """Modèle pour les logs"""
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    level = db.Column(db.String(10), default='INFO')  # DEBUG, INFO, WARN, ERROR
    source = db.Column(db.String(50), default='system')
    message = db.Column(db.Text, nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'level': self.level,
            'source': self.source,
            'message': self.message
        }

# =============================================================================
# DONNÉES SIMULÉES (en attendant l'intégration réelle avec OpenClaw)
# =============================================================================

AGENTS_DATA = [
    {'id': 'agent-1', 'name': 'Claude Desktop', 'status': 'online', 'type': 'main', 'relations': ['agent-2', 'agent-3']},
    {'id': 'agent-2', 'name': 'Scheduler', 'status': 'online', 'type': 'service', 'relations': ['agent-1']},
    {'id': 'agent-3', 'name': 'Email Assistant', 'status': 'offline', 'type': 'skill', 'relations': ['agent-1']},
    {'id': 'agent-4', 'name': 'File Manager', 'status': 'online', 'type': 'skill', 'relations': []},
    {'id': 'agent-5', 'name': 'Web Search', 'status': 'online', 'type': 'skill', 'relations': ['agent-1']},
]

SKILLS_DATA = [
    {'id': 'skill-1', 'name': 'gcal', 'description': 'Google Calendar integration', 'version': '1.2.0', 'enabled': True},
    {'id': 'skill-2', 'name': 'gmail', 'description': 'Gmail integration for email management', 'version': '2.1.0', 'enabled': True},
    {'id': 'skill-3', 'name': 'slack', 'description': 'Slack workspace integration', 'version': '1.5.2', 'enabled': False},
    {'id': 'skill-4', 'name': 'github', 'description': 'GitHub repository management', 'version': '3.0.1', 'enabled': True},
    {'id': 'skill-5', 'name': 'weather', 'description': 'Weather forecast and alerts', 'version': '1.0.0', 'enabled': True},
    {'id': 'skill-6', 'name': 'stocks', 'description': 'Stock market data and alerts', 'version': '2.2.0', 'enabled': False},
]

MODELS_DATA = [
    {'id': 'claude-sonnet-4-20250514', 'name': 'Claude 4 Sonnet', 'provider': 'Anthropic', 'cost_per_1k_input': 0.003, 'cost_per_1k_output': 0.015, 'active': True},
    {'id': 'claude-opus-4-20250514', 'name': 'Claude 4 Opus', 'provider': 'Anthropic', 'cost_per_1k_input': 0.015, 'cost_per_1k_output': 0.075, 'active': False},
    {'id': 'gpt-4o', 'name': 'GPT-4o', 'provider': 'OpenAI', 'cost_per_1k_input': 0.005, 'cost_per_1k_output': 0.015, 'active': False},
    {'id': 'gemini-2.5-pro', 'name': 'Gemini 2.5 Pro', 'provider': 'Google', 'cost_per_1k_input': 0.00125, 'cost_per_1k_output': 0.01, 'active': False},
]

# Heartbeats simulés
heartbeat_history = []
for i in range(24):
    heartbeat_history.append({
        'timestamp': (datetime.utcnow() - timedelta(hours=23-i)).isoformat(),
        'status': 'ok' if random.random() > 0.1 else 'warning',
        'response_time': random.randint(50, 500)
    })

# Logs simulés en mémoire
logs_buffer = []
log_levels = ['DEBUG', 'INFO', 'WARN', 'ERROR']
log_sources = ['gateway', 'scheduler', 'api', 'database', 'system']
log_messages = [
    'Connected to gateway',
    'Job executed successfully',
    'API request received',
    'Database query executed',
    'Cache cleared',
    'Agent initialized',
    'Skill loaded',
    'Heartbeat received',
    'Token usage updated',
    'Configuration reloaded'
]

for i in range(100):
    logs_buffer.append({
        'id': i + 1,
        'timestamp': (datetime.utcnow() - timedelta(minutes=random.randint(1, 120))).isoformat(),
        'level': random.choice(log_levels),
        'source': random.choice(log_sources),
        'message': random.choice(log_messages)
    })

# =============================================================================
# ROUTES API
# =============================================================================

@app.route('/api/status')
def get_status():
    """Retourne le statut du Gateway OpenClaw"""
    uptime_seconds = int(time.time() - app_start_time)
    hours, remainder = divmod(uptime_seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    
    return jsonify({
        'status': 'online',
        'version': '1.0.0',
        'uptime': f"{hours}h {minutes}m {seconds}s",
        'uptime_seconds': uptime_seconds,
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/metrics')
def get_metrics():
    """Retourne les métriques d'utilisation des tokens"""
    # Simuler des données de métriques pour les 7 derniers jours
    metrics = []
    models = ['Claude 4 Sonnet', 'GPT-4o', 'Gemini 2.5 Pro']
    
    for i in range(7):
        date = (datetime.utcnow() - timedelta(days=6-i)).date()
        for model in models:
            metrics.append({
                'date': date.isoformat(),
                'model': model,
                'tokens_input': random.randint(1000, 50000),
                'tokens_output': random.randint(500, 20000),
                'cost': round(random.uniform(0.1, 5.0), 2)
            })
    
    # Calculer les totaux
    total_cost = sum(m['cost'] for m in metrics)
    total_input = sum(m['tokens_input'] for m in metrics)
    total_output = sum(m['tokens_output'] for m in metrics)
    
    return jsonify({
        'metrics': metrics,
        'summary': {
            'total_cost': round(total_cost, 2),
            'total_tokens_input': total_input,
            'total_tokens_output': total_output,
            'period': '7 days'
        }
    })

@app.route('/api/cron-jobs')
def get_cron_jobs():
    """Liste tous les jobs cron"""
    jobs = CronJob.query.all()
    return jsonify([job.to_dict() for job in jobs])

@app.route('/api/cron-jobs/<int:job_id>/run', methods=['POST'])
def run_cron_job(job_id):
    """Exécute un job cron manuellement"""
    job = CronJob.query.get_or_404(job_id)
    job.last_run = datetime.utcnow()
    job.status = 'running'
    db.session.commit()
    
    # Simuler l'exécution du job (dans un vrai scénario, on lancerait un subprocess)
    def execute_job():
        time.sleep(2)  # Simuler le temps d'exécution
        job.status = 'idle'
        db.session.commit()
        # Émettre un événement WebSocket
        socketio.emit('job_completed', {'job_id': job_id, 'status': 'success'})
    
    threading.Thread(target=execute_job).start()
    
    # Ajouter un log
    add_log('INFO', 'scheduler', f"Cron job '{job.name}' executed manually")
    
    return jsonify({'message': f"Job {job_id} started", 'job': job.to_dict()})

@app.route('/api/cron-jobs/<int:job_id>', methods=['DELETE'])
def delete_cron_job(job_id):
    """Supprime un job cron"""
    job = CronJob.query.get_or_404(job_id)
    db.session.delete(job)
    db.session.commit()
    
    add_log('INFO', 'scheduler', f"Cron job '{job.name}' deleted")
    
    return jsonify({'message': f"Job {job_id} deleted"})

@app.route('/api/cron-jobs/<int:job_id>/toggle', methods=['POST'])
def toggle_cron_job(job_id):
    """Active ou désactive un job cron"""
    job = CronJob.query.get_or_404(job_id)
    job.is_active = not job.is_active
    db.session.commit()
    
    status = 'enabled' if job.is_active else 'disabled'
    add_log('INFO', 'scheduler', f"Cron job '{job.name}' {status}")
    
    return jsonify({'message': f"Job {job_id} {status}", 'job': job.to_dict()})

@app.route('/api/agents')
def get_agents():
    """Liste tous les agents et leurs relations"""
    return jsonify(AGENTS_DATA)

@app.route('/api/skills')
def get_skills():
    """Liste tous les skills installés"""
    return jsonify(SKILLS_DATA)

@app.route('/api/skills/<skill_id>/toggle', methods=['POST'])
def toggle_skill(skill_id):
    """Active ou désactive un skill"""
    skill = next((s for s in SKILLS_DATA if s['id'] == skill_id), None)
    if skill:
        skill['enabled'] = not skill['enabled']
        status = 'enabled' if skill['enabled'] else 'disabled'
        add_log('INFO', 'system', f"Skill '{skill['name']}' {status}")
        return jsonify(skill)
    return jsonify({'error': 'Skill not found'}), 404

@app.route('/api/models')
def get_models():
    """Liste tous les modèles disponibles avec leurs coûts"""
    return jsonify(MODELS_DATA)

@app.route('/api/models/<model_id>/activate', methods=['POST'])
def activate_model(model_id):
    """Active un modèle"""
    for model in MODELS_DATA:
        model['active'] = (model['id'] == model_id)
    
    model = next((m for m in MODELS_DATA if m['id'] == model_id), None)
    add_log('INFO', 'system', f"Model '{model['name']}' activated")
    
    return jsonify({'message': f"Model {model_id} activated", 'models': MODELS_DATA})

@app.route('/api/heartbeat')
def get_heartbeat():
    """Retourne l'historique des heartbeats"""
    return jsonify({
        'history': heartbeat_history,
        'current': {
            'status': 'ok',
            'response_time': random.randint(50, 200),
            'timestamp': datetime.utcnow().isoformat()
        }
    })

@app.route('/api/logs')
def get_logs():
    """Retourne les logs récents"""
    limit = request.args.get('limit', 50, type=int)
    level = request.args.get('level', None)
    source = request.args.get('source', None)
    
    filtered_logs = logs_buffer
    
    if level:
        filtered_logs = [log for log in filtered_logs if log['level'] == level.upper()]
    if source:
        filtered_logs = [log for log in filtered_logs if log['source'] == source.lower()]
    
    # Trier par timestamp décroissant
    filtered_logs = sorted(filtered_logs, key=lambda x: x['timestamp'], reverse=True)
    
    return jsonify(filtered_logs[:limit])

@app.route('/api/actions/restart', methods=['POST'])
def restart_gateway():
    """Redémarre le Gateway OpenClaw"""
    add_log('WARN', 'system', 'Gateway restart requested')
    
    # Dans un vrai scénario, on redémarrerait le service
    def restart():
        time.sleep(2)
        add_log('INFO', 'system', 'Gateway restarted successfully')
        socketio.emit('gateway_restarted', {'timestamp': datetime.utcnow().isoformat()})
    
    threading.Thread(target=restart).start()
    
    return jsonify({'message': 'Gateway restart initiated'})

@app.route('/api/actions/clear-cache', methods=['POST'])
def clear_cache():
    """Vide le cache"""
    add_log('INFO', 'system', 'Cache cleared')
    return jsonify({'message': 'Cache cleared successfully'})

# =============================================================================
# ROUTES POUR LE KANBAN
# =============================================================================

@app.route('/api/tasks')
def get_tasks():
    """Liste toutes les tâches"""
    tasks = Task.query.all()
    return jsonify([task.to_dict() for task in tasks])

@app.route('/api/tasks', methods=['POST'])
def create_task():
    """Crée une nouvelle tâche"""
    data = request.json
    task = Task(
        title=data.get('title'),
        description=data.get('description'),
        status=data.get('status', 'todo'),
        priority=data.get('priority', 'medium'),
        assignee=data.get('assignee')
    )
    db.session.add(task)
    db.session.commit()
    
    add_log('INFO', 'system', f"Task '{task.title}' created")
    socketio.emit('task_created', task.to_dict())
    
    return jsonify(task.to_dict()), 201

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """Met à jour une tâche"""
    task = Task.query.get_or_404(task_id)
    data = request.json
    
    task.title = data.get('title', task.title)
    task.description = data.get('description', task.description)
    task.status = data.get('status', task.status)
    task.priority = data.get('priority', task.priority)
    task.assignee = data.get('assignee', task.assignee)
    task.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    add_log('INFO', 'system', f"Task '{task.title}' updated")
    socketio.emit('task_updated', task.to_dict())
    
    return jsonify(task.to_dict())

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Supprime une tâche"""
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    
    add_log('INFO', 'system', f"Task '{task.title}' deleted")
    socketio.emit('task_deleted', {'id': task_id})
    
    return jsonify({'message': f"Task {task_id} deleted"})

# =============================================================================
# WEBSOCKET EVENTS
# =============================================================================

@socketio.on('connect')
def handle_connect():
    """Gestion de la connexion WebSocket"""
    print(f"Client connected: {request.sid}")
    emit('connected', {'message': 'Connected to OpenClaw Dashboard'})

@socketio.on('disconnect')
def handle_disconnect():
    """Gestion de la déconnexion WebSocket"""
    print(f"Client disconnected: {request.sid}")

# =============================================================================
# FONCTIONS UTILITAIRES
# =============================================================================

def add_log(level, source, message):
    """Ajoute un log au buffer et à la base de données"""
    log_entry = {
        'id': len(logs_buffer) + 1,
        'timestamp': datetime.utcnow().isoformat(),
        'level': level,
        'source': source,
        'message': message
    }
    logs_buffer.append(log_entry)
    
    # Garder seulement les 1000 derniers logs en mémoire
    if len(logs_buffer) > 1000:
        logs_buffer.pop(0)
    
    # Émettre via WebSocket
    socketio.emit('new_log', log_entry)
    
    # Sauvegarder en base de données
    db_log = LogEntry(level=level, source=source, message=message)
    db.session.add(db_log)
    db.session.commit()

def generate_random_logs():
    """Génère des logs aléatoires périodiquement"""
    while True:
        time.sleep(random.randint(5, 15))
        level = random.choice(log_levels)
        source = random.choice(log_sources)
        message = random.choice(log_messages)
        add_log(level, source, message)

def init_database():
    """Initialise la base de données avec des données de test"""
    with app.app_context():
        db.create_all()
        
        # Ajouter des tâches de test si la base est vide
        if Task.query.count() == 0:
            test_tasks = [
                Task(title='Configurer OpenClaw', description='Installation et configuration initiale', status='done', priority='high'),
                Task(title='Intégrer Gmail', description='Connecter le skill Gmail', status='in_progress', priority='medium'),
                Task(title='Créer dashboard', description='Développer le dashboard web', status='in_progress', priority='high'),
                Task(title='Ajouter WebSocket', description='Implémenter les logs temps réel', status='todo', priority='medium'),
                Task(title='Documentation', description='Rédiger la documentation', status='todo', priority='low'),
            ]
            for task in test_tasks:
                db.session.add(task)
        
        # Ajouter des jobs cron de test si la base est vide
        if CronJob.query.count() == 0:
            test_jobs = [
                CronJob(name='Morning Check', schedule='0 8 * * *', command='openclaw heartbeat', is_active=True),
                CronJob(name='Daily Backup', schedule='0 2 * * *', command='openclaw backup', is_active=True),
                CronJob(name='Weekly Report', schedule='0 9 * * 1', command='openclaw report weekly', is_active=False),
                CronJob(name='Cleanup Logs', schedule='0 3 * * 0', command='openclaw logs cleanup', is_active=True),
            ]
            for job in test_jobs:
                db.session.add(job)
        
        db.session.commit()
        print("Base de données initialisée")

# =============================================================================
# POINT D'ENTRÉE
# =============================================================================

if __name__ == '__main__':
    app_start_time = time.time()
    
    # Initialiser la base de données
    init_database()
    
    # Démarrer le thread de génération de logs
    log_thread = threading.Thread(target=generate_random_logs, daemon=True)
    log_thread.start()
    
    print("🚀 OpenClaw Dashboard démarré sur http://localhost:5000")
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
