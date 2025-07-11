import { dataBase } from "../config/connectDB.config.js";

export const checkEmailExists= async (req,res,next)=>{

    try {
        const {Email} = req.body
        const result = await dataBase.query('SELECT * FROM cuesta_tanto.usuarios WHERE "Email" = $1', [Email]);
        if(result.rows.length>0){
            return res.status(409)
            .json({
            type: "EMAIL_ALREADY_EXISTS",
            details: "Este correo ya fue registrado"
        })
        }
        next()
    } 
    catch (error) {
        console.error('Hubo un error validando el Email:', error);
        res.status(500).json({message:"Error al buscar el email"})
    }
}