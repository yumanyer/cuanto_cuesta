import {Router} from "express";
import {createIngrediente,bulkCreateIngrediente,getIngredientesByRecetaId} from "../controllers/ingrediente.controllers.js";
import {requireAuth} from "../middleware/auth/requireAuth.middleware.js"
import {checkOwnershipReceta} from "../middleware/user/chechExistitReceta.middleware.js"

const IngredienteRouter = Router();

IngredienteRouter.post("/create",  requireAuth(["Pastelero","Admin"]),checkOwnershipReceta, createIngrediente);

IngredienteRouter.post("/bulkCreate", requireAuth(["Pastelero","Admin"]), checkOwnershipReceta,bulkCreateIngrediente);

IngredienteRouter.get("/receta/:id",requireAuth(["Pastelero", "Admin"]),checkOwnershipReceta,getIngredientesByRecetaId);



export default IngredienteRouter;