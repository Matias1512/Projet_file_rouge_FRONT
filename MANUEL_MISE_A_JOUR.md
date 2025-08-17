# Manuel de Mise à Jour - DevClass

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Prérequis et Environnement](#prérequis-et-environnement)
3. [Procédure de Mise à Jour](#procédure-de-mise-à-jour)
4. [Gestion des Versions](#gestion-des-versions)
5. [Tests et Validation](#tests-et-validation)
6. [Migration et Compatibilité](#migration-et-compatibilité)
7. [Rollback et Récupération](#rollback-et-récupération)
8. [Bonnes Pratiques](#bonnes-pratiques)

---

## Vue d'ensemble

DevClass est une plateforme éducative React moderne utilisant une architecture basée sur :
- **Frontend** : React 18 + Vite + Chakra UI
- **Authentification** : JWT avec validation automatique
- **Édition de code** : Monaco Editor
- **Conteneurisation** : Docker multi-stage
- **CI/CD** : GitHub Actions avec déploiement automatisé

Ce manuel détaille les procédures de mise à jour sécurisées pour maintenir la plateforme à jour tout en préservant la stabilité et la sécurité.

---

## Prérequis et Environnement

### Versions Requises

| Composant | Version Minimale | Version Recommandée | Justification |
|-----------|------------------|-------------------|---------------|
| Node.js | 18.0.0 | 20.x LTS | Support ESM et performance Vite |
| npm | 9.0.0 | 10.x | Gestion améliorée des workspaces |
| Docker | 20.10.0 | 24.x | Support multi-platform builds |
| Git | 2.30.0 | 2.40.x | Améliorations sécurité et performance |

### Vérification de l'Environnement

```bash
# Vérifier les versions installées
node --version    # Doit afficher v20.x ou supérieur
npm --version     # Doit afficher 10.x ou supérieur
docker --version  # Doit afficher 24.x ou supérieur
git --version     # Doit afficher 2.40.x ou supérieur

# Vérifier l'accès au projet
cd devClass/
npm --version
ls -la package.json  # Doit exister et être lisible
```

### Configuration de l'Environnement de Développement

```bash
# Variables d'environnement recommandées
export NODE_ENV=development
export VITE_API_BASE_URL=https://schooldev.duckdns.org/api
export VITE_PISTON_API_URL=https://emkc.org/api/v2/piston

# Configuration npm pour la sécurité
npm config set audit-level moderate
npm config set fund false
npm config set update-notifier false
```

---

## Procédure de Mise à Jour

### 1. Préparation de la Mise à Jour

#### Sauvegarde Préalable
```bash
# Créer une branche de sauvegarde
git checkout -b backup/pre-update-$(date +%Y%m%d)
git push origin backup/pre-update-$(date +%Y%m%d)

# Sauvegarder la configuration actuelle
cp devClass/package.json devClass/package.json.backup
cp devClass/package-lock.json devClass/package-lock.json.backup
```

#### Audit de Sécurité Initial
```bash
cd devClass/
npm audit --audit-level moderate
npm outdated
```

### 2. Mise à Jour des Dépendances

#### Dépendances de Production

**React et Écosystème :**
```bash
# Mise à jour React (approche conservatrice)
npm update react react-dom
npm update @vitejs/plugin-react

# Vérifier la compatibilité
npm run build
npm run test:ci
```

**Chakra UI (Design System) :**
```bash
# Mise à jour Chakra UI avec ses dépendances
npm update @chakra-ui/react @emotion/react @emotion/styled framer-motion
```

**Monaco Editor :**
```bash
# Mise à jour de l'éditeur de code
npm update @monaco-editor/react
```

**Routage et HTTP :**
```bash
# Mise à jour React Router et Axios
npm update react-router-dom axios
```

#### Dépendances de Développement

**Outils de Build et Test :**
```bash
# Mise à jour Vite et outils associés
npm update vite vitest @vitest/coverage-v8
npm update @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

**Linting et Formatage :**
```bash
# Mise à jour ESLint et plugins
npm update eslint eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-refresh
```

### 3. Mise à Jour par Étapes (Approche Recommandée)

#### Étape 1 : Dépendances Critiques
```bash
# Mise à jour une par une pour isoler les problèmes
npm update react react-dom
npm run test:ci
npm run build

npm update @chakra-ui/react
npm run test:ci
npm run build
```

#### Étape 2 : Outils de Développement
```bash
npm update vite
npm run dev # Tester le serveur de développement
npm run build

npm update vitest @vitest/coverage-v8
npm run test:ci
```

#### Étape 3 : Autres Dépendances
```bash
npm update # Mise à jour de toutes les dépendances restantes
npm audit fix # Correction automatique des vulnérabilités
```

### 4. Gestion des Conflits de Versions

#### Résolution des Incompatibilités
```bash
# En cas de conflit, installer une version spécifique
npm install react@^18.3.0 --save-exact

# Nettoyer le cache en cas de problème
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### Override des Versions (si nécessaire)
```json
// Dans package.json - À utiliser avec précaution
{
  "overrides": {
    "vulnerable-package": "^safe-version"
  }
}
```

---

## Gestion des Versions

### Stratégie de Versioning

DevClass utilise le **Semantic Versioning (SemVer)** :
- **MAJOR.MINOR.PATCH** (ex: 2.1.3)
- **MAJOR** : Changements incompatibles
- **MINOR** : Nouvelles fonctionnalités compatibles
- **PATCH** : Corrections de bugs

### Workflow Git

#### Branches de Développement
```bash
# Créer une branche pour la mise à jour
git checkout -b update/dependencies-$(date +%Y%m%d)

# Après les modifications
git add devClass/package*.json
git commit -m "update: Mise à jour des dépendances principales

- React 18.3.1 → 18.3.2
- Chakra UI 2.10.5 → 2.11.0
- Vite 6.0.5 → 6.1.0

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin update/dependencies-$(date +%Y%m%d)
```

#### Pull Request et Review
```bash
# Créer une PR via GitHub CLI
gh pr create --title "🔄 Mise à jour des dépendances $(date +%Y-%m-%d)" \
  --body "## Résumé
- Mise à jour des dépendances de production et développement
- Tests passés ✅
- Audit de sécurité validé ✅

## Changements Majeurs
- React 18.3.x
- Chakra UI 2.11.x
- Vite 6.1.x

## Tests Effectués
- [x] npm run lint
- [x] npm run test:ci
- [x] npm run build
- [x] Tests manuels interface utilisateur"
```

---

## Tests et Validation

### Suite de Tests Complète

#### 1. Tests Statiques
```bash
cd devClass/

# Analyse du code avec ESLint
npm run lint
# ✅ Doit passer sans erreur

# Vérification de type TypeScript
npm run typecheck
# ✅ Doit passer sans erreur de type
```

#### 2. Tests Unitaires et d'Intégration
```bash
# Tests avec couverture
npm run test:coverage
# ✅ Couverture > 80% recommandée

# Tests en mode CI (sans watch)
npm run test:ci
# ✅ Tous les tests doivent passer
```

#### 3. Tests de Build
```bash
# Build de production
npm run build
# ✅ Doit se terminer sans erreur

# Test du serveur de preview
npm run preview &
curl http://localhost:4173
# ✅ Doit retourner le HTML de l'application
```

#### 4. Tests de Sécurité
```bash
# Audit des vulnérabilités
npm audit --audit-level moderate
# ✅ Aucune vulnérabilité de niveau modéré ou élevé

# Analyse avec SonarQube (si configuré)
sonar-scanner
# ✅ Score qualité > 85%
```

### Tests Manuels Critiques

#### Interface Utilisateur
- [ ] **Authentification** : Login/Logout fonctionnel
- [ ] **Éditeur Monaco** : Coloration syntaxique et auto-complétion
- [ ] **Exécution de code** : API Piston répond correctement
- [ ] **Navigation** : Toutes les routes accessibles
- [ ] **Responsive** : Interface adaptée mobile/desktop

#### Accessibilité
```bash
# Tests d'accessibilité automatisés (si configurés)
npm run test:a11y

# Tests manuels recommandés :
# - Navigation clavier complète
# - Lecteur d'écran (NVDA/JAWS)
# - Contraste des couleurs
# - Zoom 200%
```

---

## Migration et Compatibilité

### Gestion des Breaking Changes

#### React 17 → 18
```javascript
// Migration du point d'entrée
// AVANT (React 17)
import ReactDOM from 'react-dom';
ReactDOM.render(<App />, document.getElementById('root'));

// APRÈS (React 18)
import { createRoot } from 'react-dom/client';
const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

#### Chakra UI v1 → v2
```javascript
// Migration des thèmes
// AVANT
import { theme } from '@chakra-ui/react';

// APRÈS
import { extendTheme } from '@chakra-ui/react';
const customTheme = extendTheme({
  // Configuration personnalisée
});
```

### Vérification de Compatibilité

#### API Backend
```bash
# Tester la compatibilité avec l'API
curl -X GET "https://schooldev.duckdns.org/api/health"
# ✅ Doit retourner un status 200

# Test d'authentification
curl -X POST "https://schooldev.duckdns.org/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

#### API Piston (Exécution de code)
```bash
# Test de l'API d'exécution
curl -X GET "https://emkc.org/api/v2/piston/runtimes"
# ✅ Doit retourner la liste des langages supportés
```

---

## Rollback et Récupération

### Procédure de Rollback Rapide

#### 1. Rollback Git
```bash
# Identifier le commit stable précédent
git log --oneline -10

# Rollback vers le dernier commit stable
git reset --hard <commit-hash-stable>
git push --force-with-lease origin main

# Alternative : Revert des commits problématiques
git revert <commit-hash-problématique>
git push origin main
```

#### 2. Rollback des Dépendances
```bash
# Restaurer les fichiers de configuration
cp devClass/package.json.backup devClass/package.json
cp devClass/package-lock.json.backup devClass/package-lock.json

# Réinstaller les dépendances précédentes
cd devClass/
rm -rf node_modules
npm ci
```

#### 3. Rollback Docker (Production)
```bash
# Redéployer la version précédente
docker pull matias151/schooldev_front:<previous-tag>
docker-compose down
docker-compose up -d

# Vérifier le déploiement
curl -I https://app-schooldev.duckdns.org
```

### Points de Contrôle

#### Avant Mise à Jour
- [ ] Sauvegarde Git créée
- [ ] Configuration sauvegardée
- [ ] Tests passent avec la version actuelle
- [ ] Documentation de rollback préparée

#### Après Mise à Jour
- [ ] Tous les tests automatisés passent
- [ ] Tests manuels validés
- [ ] Performance maintenue
- [ ] Aucune régression détectée

---

## Bonnes Pratiques

### Fréquence des Mises à Jour

#### Planning Recommandé
- **Quotidien** : Surveillance des alertes de sécurité
- **Hebdomadaire** : Mise à jour des dépendances PATCH
- **Mensuel** : Mise à jour des dépendances MINOR
- **Trimestriel** : Évaluation des mises à jour MAJOR

#### Priorités de Mise à Jour
1. **CRITIQUE** : Vulnérabilités de sécurité
2. **HAUTE** : Corrections de bugs bloquants
3. **MOYENNE** : Nouvelles fonctionnalités stables
4. **BASSE** : Améliorations de performance

### Automatisation

#### GitHub Dependabot
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/devClass"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
    reviewers:
      - "team-lead"
    assignees:
      - "dev-team"
```

#### Scripts d'Automatisation
```bash
#!/bin/bash
# scripts/update-dependencies.sh

set -e

echo "🔍 Audit de sécurité initial..."
npm audit --audit-level moderate

echo "📦 Mise à jour des dépendances..."
npm update

echo "🧪 Exécution des tests..."
npm run test:ci

echo "🏗️ Build de validation..."
npm run build

echo "✅ Mise à jour terminée avec succès !"
```

### Monitoring Post-Mise à Jour

#### Métriques à Surveiller
- **Performance** : Temps de chargement initial
- **Erreurs** : Taux d'erreur JavaScript
- **Accessibilité** : Score Lighthouse
- **Sécurité** : Alertes de vulnérabilités

#### Outils de Surveillance
```bash
# Performance avec Lighthouse CI
npx lighthouse-ci collect --url=https://app-schooldev.duckdns.org

# Surveillance des erreurs
# (À configurer avec un service comme Sentry)
```

### Documentation

#### Changelog Automatique
```markdown
## [2.1.0] - 2024-01-15

### Added
- Nouveau composant Challenge pour les exercices interactifs
- Support TypeScript amélioré

### Changed
- Mise à jour React 18.3.1 → 18.3.2
- Amélioration des performances de l'éditeur Monaco

### Fixed
- Correction du bug de navigation dans les leçons
- Amélioration de l'accessibilité clavier

### Security
- Correction de la vulnérabilité CVE-2024-XXXX dans axios
```

---

## Contacts et Support

### Équipe Technique
- **Tech Lead** : Responsable des décisions d'architecture
- **DevOps** : Gestion des déploiements et infrastructure
- **QA** : Validation des tests et qualité

### Ressources Externes
- **React** : https://react.dev/learn
- **Vite** : https://vitejs.dev/guide/
- **Chakra UI** : https://chakra-ui.com/docs
- **Monaco Editor** : https://microsoft.github.io/monaco-editor/

### Escalade en Cas de Problème
1. **Niveau 1** : Équipe de développement
2. **Niveau 2** : Tech Lead + DevOps
3. **Niveau 3** : Architecture et direction technique

---

*Ce manuel est mis à jour régulièrement pour refléter l'évolution de la plateforme DevClass. Dernière révision : $(date)*