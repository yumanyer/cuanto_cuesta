import express from 'express';
import { UserController } from "../controllers/user.controllers.js"

const router = express.Router()


router.post("/",UserController)

export default router