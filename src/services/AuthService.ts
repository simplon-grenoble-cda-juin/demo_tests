import { Request } from "express";
import crypto from "node:crypto";
import { Result } from "../types/Types";
import User from "../modeles/User";

export class AuthService {
  // Test N°1
  static generateToken(): string {
    return crypto.randomBytes(16).toString("hex");
  }

  // Test N°2
  static createUser(email: string, password: string): User {
    const signupAt = new Date().toISOString();
    return new User(email, password, signupAt);
  }

  // Test N°3
  static findUserByEmail(users: User[], email: string): Result<User, null> {
    const exists = users.find((user) => user.getEmail() === email);

    if (!exists) {
      return { success: false, message: "Email inconnu" };
    }

    return { success: true, data: exists };
  }

  // Test N°4
  static authenticateUser(
    users: User[],
    email: string,
    password: string
  ): Result<User, null> {
    const found = this.findUserByEmail(users, email);
    
    if (!found.success || found.data.getPassword() !== password) {
      return {
        success: false,
        message: "Email ou mot de passe invalide",
      };
    }
    
    return { success: true, data: found.data };
  }

  // Test N°5
  static validateAuthRequest(
    request: Request
  ): Result<{ email: string; password: string }, null> {
    const { email, password } = request.body ?? {};

    if (!request.body || !email || !password) {
      return {
        success: false,
        message: "Email et mot de passe requis",
      };
    }

    return {
      success: true,
      data: { email, password },
    };
  }

  // Test N°6
  static validateAuthToken(request: Request): Result<{ token: string }, null> {
    const authHeader = request.headers;

    if (!authHeader) {
      return {
        success: false,
        message: "Token manquant ou invalide",
      };
    }
    const authorization = request.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return {
        success: false,
        message: "Token manquant ou invalide",
      };
    }

    const token = authorization.split(" ")[1];

    return { success: true, data: { token } };
  }
}
