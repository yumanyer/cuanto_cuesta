//backend/src/middleware/requireAuth.middleware.js
import { verifyToken } from "../config/jwt.config.js";

export const requireAuth = (allowRoles=[]) =>async (req ,res ,next ) =>{
    const token = req.cookies.token
    if(!token){return res.status(401).json({message:"No estás autenticado"})}
    try {
        const payload = verifyToken(token)
        req.user = payload  
        if(allowRoles.length && !allowRoles.includes(payload.role)){
            return res.status(401).json({message:"No estás autorizado para acceder a esta ruta"})
        }
        next()
    } catch (error) {
        return res.status(401).json({message:"No estás autenticado"})
    }
}