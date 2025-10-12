import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { GlobalsController } from "../controllers/GlobalsController";

export const globalsRouter = Router();

// Browse players endpoint 
globalsRouter.get("/players", (req, res) => {
  const controller = new GlobalsController(req, res);
  controller.browsePlayers();
});
