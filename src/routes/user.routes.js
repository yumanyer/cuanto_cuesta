import express from 'express';
import { loginUser, UserRegistrer } from "../controllers/user.controllers.js"
import { checkEmailExists } from '../middleware/mail.middleware.js';
import { jsonValidator } from '../middleware/json.middleware.js';
const router = express.Router()


router.post("/register",jsonValidator,checkEmailExists, UserRegistrer);

router.post("/login", jsonValidator,loginUser ,) ;

 
export default router  