import { Request } from "express";
import crypto from "node:crypto";
import { Result } from "../types/Types";
import User from "../modeles/User";

export class AuthService {
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

  static validateAuthToken(request: Request): Result<{ token: string }, null> {
    const authCookies = request.cookies;

    if (!authCookies?.userToken) {
      return {
        success: false,
        message: "Token manquant ou invalide",
      };
    }

    const userToken: string = authCookies.userToken;

    return { success: true, data: { token: userToken } };
  }
}
