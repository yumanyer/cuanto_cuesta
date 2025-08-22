import express from "express";
import { MatterRaw } from "../models/matterRaw.models.js";
import { userMiddleware } from "../middleware/user.middleware.js";
import { deleteProdctUser, createProduct, modifyProduct,getProductById} from "../controllers/matterRaw.controllers.js";
import { checkOwnership } from "../middleware/checkOwnership.middleware.js"; 
import { requireAuth } from "../middleware/requireAuth.middleware.js";

const MatterRawRouter = express.Router();

// Obtener producto SOLO si es del usuario
 MatterRawRouter.get("/get", requireAuth(["Pastelero","Admin"]), getProductById);

// Crear producto
MatterRawRouter.post("/create", requireAuth(["Pastelero","Admin"]), createProduct);

// Modificar producto (solo si es del usuario)
MatterRawRouter.put("/modify/:id", requireAuth(["Pastelero","Admin"]), checkOwnership, modifyProduct);

// Eliminar producto (solo si es del usuario)
MatterRawRouter.delete("/delete/:id", requireAuth(["Pastelero","Admin"]), checkOwnership, deleteProdctUser);

export default MatterRawRouter;
