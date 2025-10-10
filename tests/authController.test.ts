import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../index";

describe("AuthController.signIn", () => {
  it("email is invalid", () => {
    request(app)
      .post("/signin")
      .send({ email: "invalid@email.com", password: "123" })
      .expect(401)
      .expect("Content-Type", /json/)
      .then((response) => {
        expect(response.body.message).toEqual("Email ou mot de passe invalide");
      });
  });
});
