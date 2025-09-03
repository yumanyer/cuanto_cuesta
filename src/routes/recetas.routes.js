import {Router} from "express";
import {createReceta} from "../controllers/recetas.controllers.js";
import {requireAuth} from "../middleware/auth/requireAuth.middleware.js"
const RecetasRouter = Router();

RecetasRouter.post("/create", requireAuth(["Pastelero","Admin"]), createReceta);

export default RecetasRouter;