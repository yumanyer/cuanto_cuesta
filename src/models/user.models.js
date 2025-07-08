import { dataBase } from "../config/connectDB.config.js"


export async function createUser(Name,Email,Password){
    try {
    const query = `INSERT INTO cuesta_Tanto.usuarios  ("Name", "Email", "Password") VALUES ($1, $2, $3)`
    const values = [Name,Email,Password]
    await  dataBase.query(query,values)

    } catch (error) {
        throw error
    }
}