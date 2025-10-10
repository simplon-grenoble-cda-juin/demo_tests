import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../index";

describe("AuthController.signIn", () => {
  it("email is invalid", () => {
    // On englobe notre application Express dans la fonction "request"
    request(app)
      // On appelle la route "/signin" avec la méthode POST
      .post("/signin")
      // On transmet des données dans le body de la requête
      .send({ email: "invalid@email.com", password: "123" })
      // On s'attend à ce que le statut de la réponse soit le code 401
      .expect(401)
      // On s'attend à ce que le type du contenu de la réponse soit du JSON
      .expect("Content-Type", /json/)
      // Ensuite...
      .then((response) => {
        // On compare la valeur du message reçu dans le JSON
        // avec "Email ou mot de passe invalide"
        expect(response.body.message).toEqual("Email ou mot de passe invalide");
      });
  });

  it("email is absent", () => {
    request(app)
      .post("/signin")
      .send({ password: "123" })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((response) => {
        expect(response.body.message).toEqual("Email et mot de passe requis");
      });
  });

  it("password is absent", () => {
    request(app)
      .post("/signin")
      .send({ email: "test1@test.com" })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((response) => {
        expect(response.body.message).toEqual("Email et mot de passe requis");
      });
  });

  it("email and password are absent", () => {
    request(app)
      .post("/signin")
      .send({})
      .expect(400)
      .expect("Content-Type", /json/)
      .then((response) => {
        expect(response.body.message).toEqual("Email et mot de passe requis");
      });
  });

  it("email and password are valid", () => {
    request(app)
      .post("/signin")
      .send({ email: "test1@test.com", password: "123" })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((response) => {
        expect(response.body.message).toEqual("Connexion réussie");
      });
  });
});

describe("AuthController.profil", () => {
  // On prépare un agent pour conserver un même contexte
  // entre plusieurs requêtes qui s'enchaînent.
  const agent = request.agent(app);

  // On commence à utiliser l'agent pour se connecter,
  // afin d'avoir un cookie d'authentification
  it("should save cookie", async () => {
    const response = await agent
      .post("/signin")
      .send({ email: "test1@test.com", password: "123" });

    // On vérifie la présence d'un header "set-cookie",
    // qui permet de créer un cookie
    const setCookie = response.headers["set-cookie"]?.[0];

    // Si le header est vide, on indique que le test
    // a échoué en retournant false
    if (!setCookie) return false;

    // Si la valeur du header commence avec "userToken=",
    // on considère que notre cookie va bien être
    // créé (return true). Sinon, on considère que le
    // cookie ne sera pas créé (return false)
    return setCookie.startsWith("userToken=");
  });

  it("should return profile data", async () => {
    // On utilise notre agent déjà connecté
    // grâce au test précédent
    const response = await agent.get("/me");

    // On s'attend à ce que le message nous indique
    // que le token est valide (présent dans les cookies)
    expect(response.body.message).toEqual("Token valide");
  });

  it("should return no valid token error", async () => {
    // On teste sans token, sans passer par notre agent.
    // Pour une requête "neutre" (sans contexte persistant),
    // on réutilise directement "request".
    const response = await request(app).get("/me");
    expect(response.body.message).toEqual("Token manquant ou invalide");
  });

  it("should return unknown token", async () => {
    const response = await request(app)
      .get("/me")
      // Toujours avec une requête neutre, on vient tester
      // en définissant un cookie "userToken" qui
      // aura une valeur non valide/reconnue
      .set("Cookie", ["userToken=unknowntoken"]);

    expect(response.body.message).toEqual("Token non reconnu");
  });
});
