## Les tests et leur environnement

Ce projet sert de support pédagogique pour illustrer **les tests** automatisés dans un contexte applicatif complet :  connexion à une base PostgreSQL, jeux de données réalistes, gestion d’environnement. Il montre comment articuler un environnement de test robuste et reproductible.

---

### 🧱 Structure générale

L’écosystème de tests est organisé selon une logique claire :

| Dossier | Rôle principal |
|----------|----------------|
| `tests/_setup/` | Gestion de la connexion PostgreSQL |
| `tests/_factories/` | Génération de données à la volée par entités pour les tests ciblés |
| `tests/integrations/` | Tests d’intégrations |
| `tests/units/` | Tests unitaires  |

---

### ⚙️ Deux approches de test complémentaires

1. **Tests avec `seed.ts`**  
   → utilisent un jeu de données complet  
   → adaptés aux tests de cohérence et aux repositories  
   Exemple : `fixturesFactory.test.ts`

2. **Tests sans `seed.ts`**  
   → créent uniquement les données nécessaires via les factories  
   → adaptés aux tests ciblés (authentification, contrôleurs, etc.)  
   Exemple : `api.test.js` ou `authController.test.ts`

Chaque approche repose sur `ClientManager`, qui s’occupe de connecter, vider et réinitialiser la base entre les tests.

---

### 🧠 Concepts illustrés dans le projet

- Gestion d’environnement (`NODE_ENV`, `.env.test`, `.env.dev`)
- Utilisation des factories pour créer des entités cohérentes
- Structure AAA (*Arrange / Act / Assert*) dans les tests

---

### 📚 Documentations disponibles

- [Les cookies](https://github.com/simplon-grenoble-cda-juin/demo_tests/blob/env_tests/docs/cookies.md)  
  → Explication de la gestion des cookies dans les tests et l’authentification

- [Fausses données DB — général](https://github.com/simplon-grenoble-cda-juin/demo_tests/blob/env_tests/tests/doc.md)  
  → Présentation de la logique globale de génération de données pour les tests

- [Fausses données DB — fixtures #1 (_setup_)](https://github.com/simplon-grenoble-cda-juin/demo_tests/blob/env_tests/tests/_setup/_doc.md)  
  → Explication du rôle de `ClientManager` et du jeu de données `seed.ts`

- [Fausses données DB — fixtures #2 (_factories_)](https://github.com/simplon-grenoble-cda-juin/demo_tests/blob/env_tests/tests/_factories/_doc.md)  
  → Détail du fonctionnement des factories et de leur usage dans les tests ciblés
