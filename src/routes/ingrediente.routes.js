import {Router} from "express";
import {createIngrediente,bulkCreateIngrediente} from "../controllers/ingrediente.controllers.js";
import {requireAuth} from "../middleware/auth/requireAuth.middleware.js"

const IngredienteRouter = Router();

IngredienteRouter.post("/create", requireAuth(["Pastelero","Admin"]), createIngrediente);

IngredienteRouter.post("/bulkCreate", requireAuth(["Pastelero","Admin"]), bulkCreateIngrediente);
export default IngredienteRouter;