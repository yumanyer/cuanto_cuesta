import express from 'express';
import { loginUser, UserRegister,logoutUser,refreshAccessToken } from "../controllers/user.controllers.js"
import { checkEmailExists } from '../middleware/auth/mail.middleware.js';
import { jsonValidator } from '../middleware/auth/json.middleware.js'; 
const router = express.Router()


router.post("/register",jsonValidator,checkEmailExists, UserRegister);

router.post("/login", jsonValidator,loginUser) ;

router.post("/logout", logoutUser)

router.post("/refreshToken" ,refreshAccessToken)
 
export default router  