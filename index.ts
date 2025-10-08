import Express from "express";
import { fileURLToPath } from "node:url";
import path from "node:path";
import router from "./src/routes";

const app = Express();
const PORT = 3002;

// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(Express.static(path.join(__dirname, "public")));
app.use(Express.urlencoded({ extended: true }));
app.use(Express.json());

app.use(router);

app.listen(PORT, () => {
  console.log(`Le serveur a démarré sur le port ${PORT}`);
});
