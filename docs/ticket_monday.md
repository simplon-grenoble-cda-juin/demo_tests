# Bienvenue, c’est lundi !

Lors de la réunion de début de journée, **trois tickets** vous ont été assignés.  
Votre collègue a livré les **modèles** et **répertoires** nécessaires à la mise en place de l’authentification : il est maintenant temps de **remplacer la fausse base de données** par une **vraie base PostgreSQL** !

## Pré-requis

Avant de commencer, prenez connaissance des fichiers suivants :

- `src/modeles/User.ts`
- `src/repositories/UserRepository.ts`
- `src/modeles/Token.ts`
- `src/repositories/TokenRepository.ts`

Ensuite, préparez votre environnement :

1. Créez votre base de données à l’aide des scripts fournis :
   - Schéma de la BDD : `database_schema.sql`
   - Données initiales : `database_seeds.sql`
2. Créez et configurez votre fichier `.env`
   - Indiquez les variables de connexion à la base (host, port, user, password, dbname)
3. Vérifiez la connexion
   - Lancez le serveur
   - Envoyez une requête sur la route `/players`
   - Vous devriez obtenir la liste des joueurs existants

## Ticket #1 — L’inscription

Actuellement, la méthode du contrôleur interagit avec une fausse base de données. Votre mission : la connecter à la vraie base PostgreSQL.

Liste des actions à mener, dans l’ordre d’exécution :

1. Vérifier la validité de la requête reçue et renvoyer une erreur si elle est invalide.

2. Vérifier qu’il n’existe pas déjà un utilisateur avec cet email en base de données, et renvoyer une erreur si c’est le cas.

3. Hasher le mot de passe soumis par l’utilisateur avec `await argon2.hash(password)`.

4. Créer une instance d’utilisateur (à partir du modèle `User`) en utilisant l’email soumis et le mot de passe haché.

5. Enregistrer l’utilisateur en base de données et récupérer son identifiant (`id`).  
   Renvoyer une erreur si l’enregistrement a échoué.

6. Créer une instance de token (à partir du modèle `Token`) avec l’identifiant de l’utilisateur.

7. Enregistrer le token en base de données et récupérer son identifiant (`id`).  
   Renvoyer une erreur si l’enregistrement a échoué.

8. Ajouter un cookie à la réponse avec la clé `userToken` et la valeur du token réel (accessible via `getToken()`).  
   Assurez-vous que ce cookie soit non accessible via JavaScript (`httpOnly: true`).

9. Si tout s’est bien déroulé, renvoyer une réponse de succès (`201`) contenant le message `"Inscription réussie"` et le token (uniquement la valeur, pas l’objet complet).

## Ticket #2 — La connexion

La méthode actuelle du contrôleur `signIn` s’appuie sur la logique déjà en place mais doit être refactorisée pour fonctionner entièrement avec la vraie base de données PostgreSQL.

Liste des actions à mener, dans l’ordre d’exécution :

1. Vérifier la validité de la requête reçue et renvoyer une erreur si elle est invalide.

2. Rechercher l’utilisateur en base de données à partir de son email.  
   - Si aucun utilisateur n’est trouvé, renvoyer une erreur `401` avec le message `"Email ou mot de passe invalide"`.

3. Vérifier la validité du mot de passe soumis :  
   - Utiliser `await argon2.verify()` pour comparer le mot de passe envoyé avec le hash enregistré.  
   - Si le mot de passe est incorrect, renvoyer une erreur `401` avec le même message.

4. Tenter de récupérer un token existant associé à l’utilisateur via son `userId`.  
   - Si aucun token n’existe, créer une nouvelle instance de `Token` et l’enregistrer en base.  
   - Si l’enregistrement échoue, renvoyer une erreur `500`.

5. Ajouter un cookie à la réponse avec la clé `userToken` et la valeur du token réel (accessible via `getToken()`).  
   Assurez-vous que ce cookie soit non accessible via JavaScript (`httpOnly: true`).

6. Si tout s’est bien déroulé, renvoyer une réponse de succès (`200`) contenant le message `"Connexion réussie"` et le token (uniquement la valeur, pas l’objet complet).

## Ticket #3 — Le profil utilisateur

La méthode du contrôleur `profil` doit désormais exploiter la vraie base de données pour vérifier la validité du token et retourner les informations de l’utilisateur correspondant.

Liste des actions à mener, dans l’ordre d’exécution :

1. Vérifier la validité du token reçu dans la requête à l’aide de `AuthService.validateAuthToken`.  
   Renvoyer une erreur `401` si le token est invalide.

2. Rechercher le token dans la base de données via le `TokenRepository`.  
   Si le token n’existe pas, renvoyer une erreur `403` avec le message `"Token non reconnu"`.

3. À partir du token trouvé, récupérer l’utilisateur associé grâce à son `userId` via le `UserRepository`.  
   Si aucun utilisateur n’est trouvé, renvoyer une erreur `404` avec le message `"Utilisateur introuvable"`.

4. Si le token et l’utilisateur sont valides, renvoyer une réponse JSON avec le message `"Token valide"` et les données de l’utilisateur (en utilisant `user.serialize()`).
