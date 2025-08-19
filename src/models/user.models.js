    import { dataBase } from "../config/connectDB.config.js"
    import { createHash } from "../utils/hash.utils.js"


    export async function createUser(Name,Email,Password,Rol){
        try {
            const hashedPassword= await createHash(Password)
            if(!hashedPassword){
            throw new Error("Error generando hash de la contraseña");
            }
        const query = `INSERT INTO cuesta_Tanto.usuarios  ("Name", "Email", "Password","Rol") VALUES ($1, $2, $3, $4) RETURNING "id"`
        const values = [Name,Email,hashedPassword,Rol]
        console.time("createUser")
        const resultado =await  dataBase.query(query,values)
        console.timeEnd("createUser")
        const userId = resultado.rows[0].id        
        return userId
        } catch (error) {
            throw error
        }
    }