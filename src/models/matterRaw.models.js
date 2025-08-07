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

    async  modifyProduct(nombre_producto,cantidad_comprada,unidad,precio,id,user_id){
        try {
        const query='UPDATE cuesta_tanto.materia_prima SET nombre_producto = $3, cantidad_comprada = $4, unidad = $5, precio = $6 WHERE id = $1 AND user_id = $2 RETURNING *'
        const values=[id, user_id, nombre_producto, cantidad_comprada, unidad, precio]
        const result=await dataBase.query(query,values)
        return result.rows[0]
        } catch (error) {
          throw error
        }
}

    async deleteProduct(id){
        try {
            const query = 'DELETE from  cuesta_tanto.materia_prima where id = $1 RETURNING * ' 
            const values = [id]
            const result = await dataBase.query(query,values)
            return result
        } catch (error) {
            throw error
        }
    }


}
    