import express from 'express';
import { loginUser, UserRegistrer } from "../controllers/user.controllers.js"
import { checkEmailExists } from '../middleware/mail.middleware.js';
import { userMiddleware } from '../middleware/user.middleware.js';


const router = express.Router()


router.post("/register", checkEmailExists, UserRegistrer);

router.post("/Login", loginUser);

 
export default router 