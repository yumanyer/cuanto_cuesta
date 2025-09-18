import express from 'express';
import { loginUser, UserRegistrer,logoutUser,refreshToken } from "../controllers/user.controllers.js"
import { checkEmailExists } from '../middleware/auth/mail.middleware.js';
import { jsonValidator } from '../middleware/auth/json.middleware.js'; 
const router = express.Router()


router.post("/register",jsonValidator,checkEmailExists, UserRegistrer);

router.post("/login", jsonValidator,loginUser) ;

router.post("/logout", logoutUser)

router.post("/refreshToken", jsonValidator,refreshToken)
 
export default router  