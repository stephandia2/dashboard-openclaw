# Dockerfile pour OpenClaw Dashboard
# Fichier: Dockerfile

FROM python:3.11-slim

# Définir le répertoire de travail
WORKDIR /app

# Installer les dépendances système
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copier les fichiers de requirements
COPY requirements.txt .

# Installer les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code de l'application
COPY app.py .
COPY database/ ./database/

# Créer le volume pour la base de données
VOLUME ["/app/instance"]

# Exposer le port
EXPOSE 5000

# Commande de démarrage
CMD ["python", "app.py"]
