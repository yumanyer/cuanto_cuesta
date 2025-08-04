import { dataBase } from "../config/connectDB.config.js";

export class MatterRaw{
    constructor(id,user_id,nombre_producto,cantidad_comprada,unidad,precio,created_at){
        this.id=id
        this.user_id=user_id
        this.nombre_producto=nombre_producto
        this.cantidad_comprada=cantidad_comprada
        this.unidad=unidad
        this.precio=precio
        this.created_at=created_at
    }

    //crear nuevo producto en la db
    async createProduct(nombre_producto,cantidad_comprada,unidad,precio,user_id){
        try {
        
        const query='INSERT INTO cuesta_tanto.materia_prima(nombre_producto,cantidad_comprada,unidad,precio,user_id) VALUES ($1,$2,$3,$4,$5) RETURNING *'
        const values=[nombre_producto,cantidad_comprada,unidad,precio,user_id]
        const result=await dataBase.query(query,values)
        return result.rows[0]
        } catch (error) {
            throw error
        }
    
    }
}

    