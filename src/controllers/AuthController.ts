import { Controller } from "../libs/Controller";
import User from "../modeles/User";
import { AuthService } from "../services/AuthService";

const users: User[] = [];
const tokens = new Map<string, string>();

export class AuthController extends Controller {
  signUp = async () => {
    const validate = AuthService.validateAuthRequest(this.request);

    if (!validate.success) {
      return this.response.status(400).json({ message: validate.message });
    }

    const { email, password } = validate.data;

    const existing = AuthService.findUserByEmail([], email);

    if (existing.success) {
      return this.response
        .status(409)
        .json({ message: "Utilisateur déjà existant" });
    }

    const newUser = AuthService.createUser(email, password);
    const token = AuthService.generateToken();

    users.push(newUser);
    tokens.set(token, email);

    this.response.status(201).json({
      message: "Inscription réussie",
      token,
      user: JSON.stringify(newUser),
    });
  };

  signIn = async () => {
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

    tokens.set(token, email);

    this.response.cookie("userToken", token, {
      httpOnly: true,
    });

    this.response.status(200).json({
      message: "Connexion réussie",
      token,
      user: JSON.stringify(auth.data),
    });
  };

  profil = async () => {
    const validate = AuthService.validateAuthToken(this.request);

    if (!validate.success) {
      return this.response.status(401).json({ message: validate.message });
    }

    const token = validate.data.token;
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
