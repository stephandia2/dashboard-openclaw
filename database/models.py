"""
Modèles SQLAlchemy pour OpenClaw Dashboard
Fichier: database/models.py
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Task(db.Model):
    """Modèle pour les tâches Kanban"""
    __tablename__ = 'tasks'
    
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
    __tablename__ = 'cron_jobs'
    
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
    """Modèle pour les métriques d'utilisation"""
    __tablename__ = 'metrics'
    
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
    """Modèle pour les entrées de log"""
    __tablename__ = 'log_entries'
    
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


class Agent(db.Model):
    """Modèle pour les agents"""
    __tablename__ = 'agents'
    
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(20), default='offline')  # online, offline, error
    type = db.Column(db.String(50), nullable=False)  # main, service, skill
    config = db.Column(db.JSON, default=dict)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_seen = db.Column(db.DateTime, nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'status': self.status,
            'type': self.type,
            'config': self.config,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_seen': self.last_seen.isoformat() if self.last_seen else None
        }


class AgentRelation(db.Model):
    """Modèle pour les relations entre agents"""
    __tablename__ = 'agent_relations'
    
    id = db.Column(db.Integer, primary_key=True)
    agent_id = db.Column(db.String(50), db.ForeignKey('agents.id'), nullable=False)
    related_agent_id = db.Column(db.String(50), db.ForeignKey('agents.id'), nullable=False)
    relation_type = db.Column(db.String(50), default='depends_on')  # depends_on, communicates_with, etc.
    
    def to_dict(self):
        return {
            'id': self.id,
            'agent_id': self.agent_id,
            'related_agent_id': self.related_agent_id,
            'relation_type': self.relation_type
        }
