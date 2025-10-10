import { Controller } from "../libs/Controller";
import User from "../modeles/User";
import { AuthService } from "../services/AuthService";
import { fakeUsers } from "./../../tests/fakeUsers";

// Fake database
const users: User[] = fakeUsers;
const tokens = new Map<string, string>();

export class AuthController extends Controller {
  signUp = async () => {
    const validate = AuthService.validateAuthRequest(this.request);

    if (!validate.success) {
      return this.response.status(400).json({ message: validate.message });
    }

    const { email, password } = validate.data;

    const existing = AuthService.findUserByEmail(users, email);

    if (existing.success) {
      return this.response
        .status(409)
        .json({ message: "Utilisateur déjà existant" });
    }

    const newUser = AuthService.createUser(email, password);
    const token = AuthService.generateToken();

    // Push data in the fake database
    users.push(newUser);
    tokens.set(token, email);

    this.response.status(201).json({
      message: "Inscription réussie",
      token,
      user: JSON.stringify(newUser),
    });
  };

  signIn = () => {
    const validate = AuthService.validateAuthRequest(this.request);

    if (!validate.success) {
      return this.response.status(400).json({ message: validate.message });
    }

    const { email, password } = validate.data;

    const auth = AuthService.authenticateUser(users, email, password);

    if (!auth.success) {
      return this.response
        .status(401)
        .json({ message: "Email ou mot de passe invalide" });
    }

    const token = AuthService.generateToken();

    // Push data in the fake database
    tokens.set(token, email);

    // On crée un cookie "userToken" et on lui donne
    // la valeur du token généré plus tot (ligne 59)
    this.response.cookie("userToken", token, {
      // Permet d'éviter que le cookie soit accessible
      // par du JavaScript côté navigateur
      httpOnly: true,
    });

    this.response.status(200).json({
      message: "Connexion réussie",
      token,
      user: JSON.stringify(auth.data),
    });
  };

  profil = () => {
    // On récupère un objet concernant l'état de validation du cookie
    // + sa potentielle valeur (si trouvée)
    const tokenCheck = AuthService.validateAuthToken(this.request);

    // Si on a eu une erreur dans la récupération...
    if (!tokenCheck.success) {
      // On retourne une erreur 401
      return this.response
        .status(401)
        .json({ message: "Token manquant ou invalide" });
    }

    const token = tokenCheck.data.token;
    const email = tokens.get(token);

    // Si le token ne correspond pas à un enregistrement
    // dans le Map "tokens"...
    if (!email) {
      // On retourne une erreur 403
      return this.response.status(403).json({ message: "Token non reconnu" });
    }

    // On récupère l'utilisateur correspondant à l'adresse
    // email récupérée plut tôt
    const found = AuthService.findUserByEmail(users, email);

    // Si aucun utilisateur trouvé...
    if (!found.success) {
      // On retourne une erreur 404
      return this.response
        .status(404)
        .json({ message: "Utilisateur introuvable" });
    }

    // On retourne un succès (200) avec
    // le message "Token valide" et les
    // données de l'utilisateur dans "data"
    this.response.json({
      message: "Token valide",
      data: JSON.stringify(found.data),
    });
  };
}
