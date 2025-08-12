# Manuel de Déploiement - DevClass Frontend

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Prérequis](#prérequis)
3. [Architecture de déploiement](#architecture-de-déploiement)
4. [Déploiement automatique (CI/CD)](#déploiement-automatique-cicd)
5. [Déploiement manuel](#déploiement-manuel)
6. [Configuration des environnements](#configuration-des-environnements)
7. [Monitoring et maintenance](#monitoring-et-maintenance)
8. [Dépannage](#dépannage)
9. [Sécurité](#sécurité)

---

## 🎯 Vue d'ensemble

DevClass est une plateforme éducative React déployée en tant qu'application conteneurisée avec:
- **Frontend**: React 18 + Vite + Chakra UI
- **Serveur web**: Nginx (dans container)
- **Reverse proxy**: Traefik
- **Infrastructure**: VM Azure avec Docker
- **CI/CD**: GitHub Actions
- **Registry**: Docker Hub

**URLs de production:**
- Application: https://app-schooldev.duckdns.org
- API Backend: https://schooldev.duckdns.org/api/

---

## ⚙️ Prérequis

### Côté développement
- Node.js 20.x
- npm 10.x
- Git
- Docker & Docker Compose
- Accès au repository GitHub

### Côté serveur de production
- VM Azure Ubuntu
- Docker & Docker Compose installés
- Traefik configuré comme reverse proxy
- Accès SSH avec clés
- Nom de domaine: `app-schooldev.duckdns.org`

### Secrets GitHub requis
```
DOCKER_USERNAME          # Nom d'utilisateur Docker Hub
DOCKER_PASSWORD          # Mot de passe Docker Hub
VM_HOST                  # IP de la VM Azure
VM_USER                  # Utilisateur SSH (azureuser)
VM_SSH_KEY              # Clé privée SSH
SONAR_TOKEN             # Token SonarQube
```

---

## 🏗️ Architecture de déploiement

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Développeur   │───▶│  GitHub Actions  │───▶│   Docker Hub    │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        │
                       ┌──────────────────┐              │
                       │   SonarQube      │              │
                       │  (Code Quality)  │              │
                       └──────────────────┘              │
                                                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                       VM Azure (Production)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Traefik   │  │  Frontend   │  │        Backend          │  │
│  │ (Port 80/443)│  │   (Nginx)   │  │      (API REST)         │  │
│  │             │  │             │  │                         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│         │                │                        │             │
│         └────────────────┼────────────────────────┘             │
│                          │                                      │
│                    ┌─────────────┐                              │
│                    │   Network   │                              │
│                    │    "web"    │                              │
│                    └─────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Déploiement automatique (CI/CD)

### Processus automatique

Le déploiement se déclenche automatiquement sur chaque push vers la branche `main`:

1. **CI (Continuous Integration)**
   - Installation des dépendances
   - Linting avec ESLint
   - Tests avec Vitest
   - Build de l'application
   - Upload des artefacts

2. **Analyse de qualité**
   - Tests avec coverage
   - Analyse SonarQube

3. **CD (Continuous Deployment)**
   - Build de l'image Docker
   - Push vers Docker Hub
   - Déploiement sur la VM

### Déclenchement manuel

Pour forcer un redéploiement:

```bash
# Depuis votre machine locale
git checkout main
git pull origin main
git push origin main  # Déclenche le pipeline
```

### Suivi du déploiement

1. Aller sur GitHub → Actions
2. Sélectionner le workflow "CI/CD Pipeline"
3. Suivre l'exécution en temps réel
4. Vérifier le statut de chaque étape

---

## 🛠️ Déploiement manuel

### 1. Build local et test

```bash
# Naviguer vers le projet
cd devClass/

# Installer les dépendances
npm ci

# Lancer les tests
npm run test:ci

# Linter le code
npm run lint

# Build de production
npm run build

# Test en local (optionnel)
npm run preview
```

### 2. Build et push de l'image Docker

```bash
# Se placer à la racine du sous-projet
cd devClass/

# Build de l'image
docker build -t matias151/schooldev_front:manual .

# Test local de l'image
docker run -p 8080:80 matias151/schooldev_front:manual

# Push vers Docker Hub (nécessite docker login)
docker push matias151/schooldev_front:manual
```

### 3. Déploiement sur la VM

```bash
# Connexion SSH à la VM
ssh azureuser@<VM_IP>

# Navigation vers le projet
cd /home/azureuser/Projet_file_rouge_FRONT

# Mise à jour du code
git pull origin main

# Mise à jour de l'image
docker-compose pull frontend

# Redémarrage du service
docker-compose up -d frontend

# Vérification
docker ps | grep schooldev_front
docker logs schooldev_front
```

---

## 🔧 Configuration des environnements

### Variables d'environnement

**Production (dans docker-compose.yml):**
```yaml
environment:
  - NODE_ENV=production
```

**Développement (dans .env.local):**
```bash
VITE_API_URL=http://localhost:8000/api
VITE_ENVIRONMENT=development
```

### Configuration Nginx

Le fichier `nginx.conf` configure:
- Routing SPA (Single Page Application)
- Headers de sécurité
- Compression gzip
- Serveur sur port 80

### Configuration Traefik

Labels Docker Compose pour Traefik:
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.frontend.rule=Host(`app-schooldev.duckdns.org`)"
  - "traefik.http.routers.frontend.entrypoints=web,websecure"
  - "traefik.http.routers.frontend.tls.certresolver=myresolver"
  - "traefik.http.services.frontend.loadbalancer.server.port=80"
```

---

## 📊 Monitoring et maintenance

### Vérifications de santé

```bash
# Status des containers
docker ps

# Logs de l'application
docker logs schooldev_front -f

# Utilisation des ressources
docker stats schooldev_front

# Santé du réseau
docker network ls
docker network inspect web
```

### Commandes de maintenance

```bash
# Redémarrage du service
docker-compose restart frontend

# Mise à jour forcée
docker-compose pull frontend
docker-compose up -d --force-recreate frontend

# Nettoyage des images obsolètes
docker image prune -f

# Sauvegarde des logs
docker logs schooldev_front > /var/log/schooldev_front_$(date +%Y%m%d).log
```

### Monitoring des performances

1. **Métriques système:**
   ```bash
   # CPU et mémoire
   htop
   
   # Espace disque
   df -h
   
   # Utilisation réseau
   iftop
   ```

2. **Métriques applicatives:**
   - Temps de réponse Nginx
   - Logs d'erreur
   - Trafic entrant/sortant

### Alertes et notifications

- GitHub Actions envoie des notifications en cas d'échec
- Logs centralisés dans `/var/log/`
- Surveillance Traefik dashboard

---

## 🔍 Dépannage

### Problèmes courants

#### 1. Application inaccessible

**Symptômes:** Site ne se charge pas
```bash
# Vérifier le container
docker ps | grep schooldev_front

# Vérifier les logs
docker logs schooldev_front

# Vérifier Traefik
curl -H "Host: app-schooldev.duckdns.org" http://localhost
```

#### 2. Erreurs de build

**Symptômes:** Échec du pipeline CI/CD
```bash
# Vérifier les dépendances
cd devClass && npm ci

# Tests locaux
npm run test:ci
npm run lint
npm run build
```

#### 3. Problèmes de certificat SSL

**Symptômes:** HTTPS ne fonctionne pas
```bash
# Vérifier Traefik
docker logs traefik

# Renouveler le certificat
docker-compose restart traefik
```

#### 4. Problèmes de réseau Docker

**Symptômes:** Containers ne communiquent pas
```bash
# Recréer le réseau
docker network rm web
docker network create web

# Redémarrer les services
docker-compose down
docker-compose up -d
```

### Logs et debugging

**Emplacements des logs:**
```bash
# Logs applicatifs
docker logs schooldev_front

# Logs système
/var/log/syslog
/var/log/docker.log

# Logs Nginx (dans le container)
docker exec schooldev_front cat /var/log/nginx/access.log
docker exec schooldev_front cat /var/log/nginx/error.log
```

### Rollback

En cas de problème, rollback vers la version précédente:

```bash
# Utiliser une image tagged précédente
docker pull matias151/schooldev_front:<previous-sha>

# Modifier docker-compose.yml temporairement
image: matias151/schooldev_front:<previous-sha>

# Redéployer
docker-compose up -d frontend
```

---

## 🔐 Sécurité

### Bonnes pratiques implémentées

1. **Container sécurisé:**
   - Image basée sur Alpine Linux
   - Nginx configuré avec headers de sécurité
   - Pas de privilèges root nécessaires

2. **Réseau sécurisé:**
   - Communication via réseau Docker privé
   - HTTPS obligatoire via Traefik
   - Certificats Let's Encrypt automatiques

3. **CI/CD sécurisé:**
   - Secrets GitHub chiffrés
   - Images scannées par SonarQube
   - Authentification SSH par clés

### Configuration des headers de sécurité

Dans `nginx.conf`:
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

### Gestion des secrets

- **Jamais** committer de secrets dans le code
- Utiliser GitHub Secrets pour les variables sensibles
- Rotation régulière des clés SSH et tokens
- Variables d'environnement pour la configuration

### Mise à jour de sécurité

```bash
# Mise à jour des dépendances Node.js
cd devClass
npm audit
npm audit fix

# Mise à jour de l'image de base
docker pull node:20-alpine
docker pull nginx:alpine

# Rebuild avec les dernières versions
docker build --no-cache -t matias151/schooldev_front:latest .
```

---

## 📞 Support et contacts

**Équipe DevOps:**
- Repository: https://github.com/Matias1512/Projet_file_rouge_FRONT
- Issues: https://github.com/Matias1512/Projet_file_rouge_FRONT/issues

**Environnements:**
- Production: https://app-schooldev.duckdns.org
- API: https://schooldev.duckdns.org/api/

**Monitoring:**
- GitHub Actions: Historique des déploiements
- SonarQube: Qualité du code
- Docker Hub: Gestion des images

---

## 📝 Notes de version

### v1.0.0 - Configuration initiale
- Déploiement Docker avec Nginx
- Pipeline CI/CD GitHub Actions
- Integration SonarQube
- Configuration Traefik
- Support HTTPS automatique

---

*Dernière mise à jour: $(date '+%Y-%m-%d')*
*Maintenu par: Équipe DevClass*