import { createUser } from "../models/user.models.js"


export async function UserController(req,res){

    try {
    // extraigo los datos del user
    const { Name,Email,Password } = req.body
    // 
    await createUser(Name,Email,Password)
    res.status(201).json({message:"Usuario creado"})

    
    } catch (error) {
        console.error('Error al crear el usuario:', error);
        res.status(500).json({message:"Error al crear el usuario"})
    }
    
}