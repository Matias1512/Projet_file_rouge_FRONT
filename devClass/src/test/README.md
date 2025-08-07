# Tests pour DevClass

Ce dossier contient les tests unitaires et d'intégration pour l'application DevClass.

## Configuration

Les tests utilisent **Vitest** avec **React Testing Library** et **jsdom** pour simuler l'environnement DOM.

### Fichiers de configuration :

- `setup.js` : Configuration globale des tests (importe jest-dom)
- `vite.config.js` : Configuration de Vitest dans le fichier Vite

## Tests disponibles

### Home.test.jsx

Tests complets pour le composant `Home` couvrant :

#### Authentification
- ✅ Redirection vers login si non authentifié
- ✅ Pas d'action pendant le chargement d'auth
- ✅ Déconnexion automatique en cas d'erreur 401/403

#### Chargement des cours
- ✅ Chargement et affichage des cours avec succès
- ✅ Gestion des listes vides
- ✅ Gestion des erreurs de chargement

#### Rendu et mise en page
- ✅ Style de défilement horizontal
- ✅ Ordre d'affichage des cartes de cours

#### CoursesCard - Affichage des informations
- ✅ Informations correctes pour chaque cours (Java, Python, PHP, Angular)
- ✅ Gestion des niveaux de difficulté (FACILE, MOYEN, DIFFICILE, DÉBUTANT)
- ✅ Couleurs spécifiques par langage
- ✅ Couleur par défaut pour langages inconnus

#### États de verrouillage
- ✅ Premier cours déverrouillé
- ✅ Cours suivants verrouillés (progression à 0)
- ✅ Affichage de l'icône cadenas pour cours verrouillés

#### Navigation
- ✅ Navigation vers /lessons sur clic CONTINUER
- ✅ Pas de navigation sur clic cours verrouillé

#### Indicateurs de progression
- ✅ Affichage progression 0/9 pour tous les cours
- ✅ Barres de progression Chakra UI

#### Images et accessibilité
- ✅ Images avec attributs alt corrects
- ✅ Dimensions d'images appropriées (350x350)

### CodeEditor.test.jsx

Tests complets pour le composant `CodeEditor` couvrant :

#### Mode libre (sans exerciceId)
- ✅ Affichage du mode libre par défaut
- ✅ Utilisation de JavaScript par défaut
- ✅ Changement de langage avec le sélecteur
- ✅ Mise à jour du code lors du changement de langage

#### Mode exercice (avec exerciceId)
- ✅ Affichage du spinner pendant le chargement
- ✅ Chargement et affichage d'un exercice avec starter code
- ✅ Mapping correct des langages (Java, Python, etc.)
- ✅ Utilisation du snippet par défaut si pas de starter code
- ✅ Gestion des erreurs de chargement

#### Fonction mapApiLanguageToMonaco
- ✅ Mapping correct de tous les langages supportés
- ✅ Utilisation de JavaScript par défaut pour langages inconnus
- ✅ Gestion des cas sans langage défini

#### Interaction avec l'éditeur
- ✅ Mise à jour de la valeur lors des changements
- ✅ Focus automatique de l'éditeur au montage

#### Rendu conditionnel
- ✅ Masquage de l'éditeur pendant le chargement
- ✅ Affichage après chargement réussi
- ✅ Affichage immédiat en mode libre

#### Intégration avec les composants enfants
- ✅ Transmission des bonnes props à LanguageSelector
- ✅ Transmission des bonnes props à Output
- ✅ Transmission de l'exercice à Output quand disponible

### LessonExercises.test.jsx

Tests complets pour le composant `LessonExercises` couvrant :

#### États de chargement
- ✅ Affichage du spinner pendant le chargement
- ✅ Redirection si utilisateur non authentifié

#### Chargement des données
- ✅ Chargement et affichage des exercices
- ✅ Gestion du cas sans exercices disponibles

#### Gestion des erreurs
- ✅ Affichage d'erreur en cas d'échec de chargement
- ✅ Message si leçon introuvable
- ✅ Déconnexion automatique en cas d'erreur 401/403

#### Fonctionnalités
- ✅ Logique de déverrouillage des exercices
- ✅ Affichage des icônes selon le type d'exercice
- ✅ Indicateurs d'exercices complétés

#### Navigation
- ✅ Bouton retour vers les leçons
- ✅ Démarrage d'exercice normal (vers éditeur)
- ✅ Démarrage d'exercice QCM (vers page QCM)

#### Gestion UserExercises
- ✅ Création de UserExercise si inexistant
- ✅ Pas de création si déjà existant

#### Couleurs par langage
- ✅ Couleur rouge pour Java
- ✅ Couleur bleue par défaut

## Scripts de test

```bash
# Exécuter tous les tests
npm test

# Exécuter les tests en mode CI (une fois)
npm run test:ci

# Exécuter avec couverture de code
npm run test:coverage

# Exécuter un test spécifique
npm test LessonExercises.test.jsx
```

## Mocking

Les tests utilisent les mocks suivants :

- **axios** : Pour simuler les appels API
- **react-router-dom** : Pour useNavigate, useParams et useLocation
- **@monaco-editor/react** : Mock de l'éditeur Monaco avec textarea simple
- **../hooks/useAuth** : Pour simuler l'authentification (LessonExercises)
- **../api** : Pour les fonctions d'API (LessonExercises)
- **react-icons** : Pour remplacer les icônes par des éléments de test
- **./LanguageSelector, ./Output, ./HintText** : Mocks des composants enfants

## Bonnes pratiques

1. **Tests isolés** : Chaque test est indépendant avec des mocks propres
2. **Données de test** : Utilisation de données mockées cohérentes
3. **Attentes explicites** : Tests des comportements attendus et des cas d'erreur
4. **Couverture complète** : Tests des différents états et interactions du composant

## Ajout de nouveaux tests

1. Créer un fichier `.test.jsx` à côté du composant
2. Importer les dépendances nécessaires de `@testing-library/react`
3. Mocker les dépendances externes
4. Organiser les tests par fonctionnalité avec `describe()`
5. Tester les cas nominaux et les cas d'erreur