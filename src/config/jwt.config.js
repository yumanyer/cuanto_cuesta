import jwt from "jsonwebtoken"
import { config } from "./env.config.js"

export function generateToken(payload){
    return jwt.sign(payload,config.JWT_SECRET,{
        expiresIn:"1h"
    })
        console.log("TOKEN",config.JWT_SECRET)

}

export function verifyToken(token){
    try {
        const decoded= jwt.verify(token,config.JWT_SECRET)
        return decoded
    } catch (error) {
        throw error
    }
}