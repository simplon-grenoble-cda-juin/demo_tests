import { Controller } from "../libs/Controller";
import Token from "../modeles/Token";
import User from "../modeles/User";
import { TokenRepository } from "../repositories/TokenRepository";
import { UserRepository } from "../repositories/UserRepository";
import { AuthService } from "../services/AuthService";
import argon2 from "argon2";

export class AuthController extends Controller {
  signUp = async () => {
    const validate = AuthService.validateAuthRequest(this.request);

    if (!validate.success) {
      return this.response.status(400).json({ message: validate.message });
    }

    const userRepository = new UserRepository();
    const tokenRepository = new TokenRepository();

    const { email, password } = validate.data;

    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
      return this.response
        .status(409)
        .json({ message: "Utilisateur déjà existant" });
    }

    const passwordHash = await argon2.hash(password);
    const user = new User(email, passwordHash);
    const userId = await userRepository.create(user);

    if (!userId) {
      return this.response
        .status(500)
        .json({ message: "Une erreur est survenue" });
    }

    const token = new Token(userId);
    const tokenId = await tokenRepository.create(token);

    if (!tokenId) {
      return this.response
        .status(500)
        .json({ message: "Une erreur est survenue" });
    }

    this.response.cookie("userToken", token.getToken(), {
      httpOnly: true,
    });

    return this.response.status(201).json({
      message: "Inscription réussie",
      token: token.getToken(),
    });
  };

  signIn = async () => {
    const validate = AuthService.validateAuthRequest(this.request);

    if (!validate.success) {
      return this.response.status(400).json({ message: validate.message });
    }

    const userRepository = new UserRepository();
    const tokenRepository = new TokenRepository();

    const { email, password } = validate.data;

    const existingUser = await userRepository.findByEmail(email);
    const existingUserId = existingUser?.getId();

    if (!existingUser || !existingUserId) {
      return this.response
        .status(401)
        .json({ message: "Email ou mot de passe invalide" });
    }

    const validPassword = await argon2.verify(
      existingUser.getPasswordHash(),
      password
    );

    if (!validPassword) {
      return this.response
        .status(401)
        .json({ message: "Email ou mot de passe invalide" });
    }

    let token = await tokenRepository.findByUserId(existingUserId);

    if (!token) {
      token = new Token(existingUserId);
      const tokenId = await tokenRepository.create(token);

      if (!tokenId) {
        return this.response
          .status(500)
          .json({ message: "Une erreur est survenue" });
      }
    }

    this.response.cookie("userToken", token.getToken(), {
      httpOnly: true,
    });

    return this.response.status(200).json({
      message: "Connexion réussie",
      token: token.getToken(),
    });
  };

  profil = async () => {
    const validate = AuthService.validateAuthToken(this.request);

    if (!validate.success) {
      return this.response.status(401).json({ message: validate.message });
    }

    const userRepository = new UserRepository();
    const tokenRepository = new TokenRepository();

    let token = await tokenRepository.find(validate.data.token);

    if (!token) {
      return this.response.status(403).json({ message: "Token non reconnu" });
    }

    const user = await userRepository.find(token.getUserId());

    if (!user) {
      return this.response
        .status(404)
        .json({ message: "Utilisateur introuvable" });
    }

    this.response.json({
      message: "Token valide",
      data: JSON.stringify(user.serialize()),
    });
  };
}
