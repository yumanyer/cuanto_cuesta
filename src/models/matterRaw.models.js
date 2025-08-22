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


    async existeProductoForUser(nombre_producto,unidad,user_id){
        try {
            const query="SELECT * FROM cuesta_tanto.materia_prima WHERE nombre_producto = $1 AND unidad = $2 AND user_id = $3"
            const values = [ nombre_producto,unidad,user_id]
            console.time("existeProducto")
            const result=await dataBase.query(query,values)
            console.timeEnd("existeProducto")
            return result.rows.length > 0
        } catch (error) {
            throw error
        }
    }

    //devolver todos los productos que pertenecen a un usuario específico. 
    async getProductById(user_id){
        try {

            const query="SELECT * FROM cuesta_tanto.materia_prima WHERE user_id = $1 "
            const values = [ user_id]
            console.time("getProductByIdUser")
            const result=await dataBase.query(query,values)
            console.timeEnd("getProductByIdUser")
            return result.rows
        } catch (error) {
            throw error
        }
    }

    //crear nuevo producto en la db
    async createProduct(nombre_producto,cantidad_comprada,unidad,precio,user_id){
        try {
        console.time("createProduct")
        const query='INSERT INTO cuesta_tanto.materia_prima(nombre_producto,cantidad_comprada,unidad,precio,user_id) VALUES ($1,$2,$3,$4,$5) RETURNING *'
        console.timeEnd("createProduct")
        const values=[nombre_producto,cantidad_comprada,unidad,precio,user_id]
        const result=await dataBase.query(query,values)
        return result.rows[0]
        } catch (error) {
            throw error
        }
    
    }

    async  modifyProduct(nombre_producto,cantidad_comprada,unidad,precio,id,user_id){
        try {
        console.time("modifyProduct")
        const query='UPDATE cuesta_tanto.materia_prima SET nombre_producto = $3, cantidad_comprada = $4, unidad = $5, precio = $6 WHERE id = $1 AND user_id = $2 RETURNING *'
        console.timeEnd("modifyProduct")
        const values=[id, user_id, nombre_producto, cantidad_comprada, unidad, precio]
        const result=await dataBase.query(query,values)
        return result.rows[0]
        } catch (error) {
          throw error
        }
}

    async deleteProduct(id,user_id){
        try {
            console.time("deleteProduct")
            const query = 'DELETE from  cuesta_tanto.materia_prima where id = $1 and user_id = $2 RETURNING * '
            console.timeEnd("deleteProduct")
            const values = [id,user_id]
            const result = await dataBase.query(query,values)
            return result
        } catch (error) {
            throw error
        }
    }
}    