import express from "express";
import { MatterRaw } from "../models/matterRaw.models.js";
import { userMiddleware } from "../Middleware/user.middleware.js";
import { deleteProdctUser, MatterRawControllers, modifyProduct } from "../controllers/matterRaw.controllers.js";
import { checkOwnership } from "../Middleware/checkOwnership.middleware.js"; 

const MatterRawRouter = express.Router();

// Crear producto
MatterRawRouter.post("/create", userMiddleware, MatterRawControllers);

// Modificar producto (solo si es del usuario)
MatterRawRouter.put("/modify/:id", userMiddleware, checkOwnership, modifyProduct);

// Eliminar producto (solo si es del usuario)
MatterRawRouter.delete("/delete/:id", userMiddleware, checkOwnership, deleteProdctUser);

export default MatterRawRouter;
