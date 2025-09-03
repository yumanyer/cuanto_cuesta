import {dataBase} from "../config/connectDB.config.js"


export class Recetas{
    constructor(id,user_id,nombre_receta,descripcion,precio_total,created_at){
        this.id=id
        this.user_id=user_id
        this.nombre_receta=nombre_receta
        this.descripcion=descripcion
        this.precio_total=precio_total
        this.created_at=created_at
    }

    async creatReceta(user_id,nombre_receta,descripcion,precio_total){
        try {
            const query = "INSERT INTO cuesta_tanto.recetas(user_id,nombre_receta,descripcion,precio_total) VALUES ($1,$2,$3,$4) RETURNING *"   
            const values = [user_id,nombre_receta,descripcion,precio_total]
            console.time("crearReceta")
            const result = await dataBase.query(query,values)
            console.timeEnd("crearReceta")
            return result.rows[0]
        }
         catch (error) {
            console.error("Error creando receta:", error);
            throw error
        }
    }
    }


