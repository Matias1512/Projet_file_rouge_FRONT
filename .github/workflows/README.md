# CI/CD Pipeline Documentation

## Vue d'ensemble

Ce pipeline CI/CD implémente les meilleures pratiques d'intégration et déploiement continus pour l'application DevClass sur une VM Azure unique.

## Architecture du Pipeline

### 🔄 Intégration Continue (CI)

**Job: `ci`**
- ✅ Checkout du code source
- ✅ Installation des dépendances (npm ci)
- ✅ Analyse statique (ESLint)  
- ✅ Vérification des types (TypeScript)
- ✅ Tests unitaires et d'intégration
- ✅ Build de l'application
- ✅ Upload des artifacts de build

### 🔍 Analyse de Qualité

**Job: `code-quality`**
- ✅ Analyse SonarCloud
- ✅ Détection des vulnérabilités
- ✅ Couverture de code
- ✅ Code smells et bugs

### 🚀 Déploiement Continu (CD)

**Job: `deploy`**
- **Trigger**: Push sur branche `main`
- **Environnement**: https://schooldev.duckdns.org
- **VM Azure**: Déploiement via SSH
- **Images Docker**: 
  - `matias151/schooldev_front:latest`
  - `matias151/schooldev_front:{sha}`

## Workflow des Branches

```
feature/xxx → main → VM Azure
```

## Pull Request Workflow

1. **Création PR** → Déclenche CI complète
2. **Tests passent** → Code review possible  
3. **Merge vers main** → Déploiement automatique sur VM

## Environnement

### Production (VM Azure)
- **URL**: https://app-schooldev.duckdns.org
- **Container**: `schooldev_front`
- **Proxy**: Traefik avec SSL automatique
- **Network**: `web` (partagé avec backend)
- **Déploiement**: Automatique sur `main`
- **Rollback**: Manuel avec tags Docker

## Configuration Requise

### GitHub Secrets
- `DOCKER_USERNAME`: Username Docker Hub
- `DOCKER_PASSWORD`: Password Docker Hub  
- `SONAR_TOKEN`: Token SonarCloud

### GitHub Environments
- `staging`: Environment staging avec URL
- `production`: Environment production avec URL

## Métriques et Monitoring

- **Build time**: Surveillance des temps de build
- **Test coverage**: Couverture de code via SonarCloud
- **Deploy frequency**: Fréquence des déploiements
- **Lead time**: Temps entre commit et production

## Rollback Strategy

### Rollback Staging
```bash
docker pull matias151/schooldev_front:staging-previous
docker stop schooldev_staging
docker run -d --name schooldev_staging matias151/schooldev_front:staging-previous
```

### Rollback Production
```bash
# Utiliser le tag précédent
docker pull matias151/schooldev_front:{previous-sha}
docker stop schooldev_production  
docker run -d --name schooldev_production matias151/schooldev_front:{previous-sha}
```

## Améliorations Futures

- [ ] Tests end-to-end (Playwright/Cypress)
- [ ] Déploiement blue/green
- [ ] Monitoring applicatif (Sentry)
- [ ] Alerts automatiques
- [ ] Performance testing