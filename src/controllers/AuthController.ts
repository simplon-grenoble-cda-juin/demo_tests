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

    this.response.status(200).json({
      message: "Connexion réussie",
      token,
      user: JSON.stringify(auth.data),
    });
  };

  profil = () => {
    const tokenCheck = AuthService.validateAuthToken(this.request);

    if (!tokenCheck.success) {
      return this.response
        .status(401)
        .json({ message: "Token manquant ou invalide" });
    }

    const token = tokenCheck.data.token;
    const email = tokens.get(token);

    if (!email) {
      return this.response.status(403).json({ message: "Token non reconnu" });
    }

    const found = AuthService.findUserByEmail(users, email);

    if (!found.success) {
      return this.response
        .status(404)
        .json({ message: "Utilisateur introuvable" });
    }

    this.response.json({
      message: "Token valide",
      data: JSON.stringify(found.data),
    });
  };
}
