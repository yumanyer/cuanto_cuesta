import {dataBase} from "../config/connectDB.config.js"

export class Ingredientes{
    constructor(id,receta_id,materia_prima_id,cantidad_usada,created_at,unidad){
        this.id=id
        this.receta_id=receta_id
        this.materia_prima_id=materia_prima_id
        this.cantidad_usada=cantidad_usada
        this.unidad=unidad
        this.created_at=created_at
    }

    async createIngrediente(receta_id,materia_prima_id,cantidad_usada,unidad){
        try {
            const query =  `
            INSERT INTO cuesta_tanto.ingredientes 
            (receta_id,materia_prima_id,cantidad_usada,unidad)
             VALUES ($1,$2,$3,$4) RETURNING *
             `
            const values = [receta_id,materia_prima_id,cantidad_usada,unidad]
            console.time("createIngrediente_model")
            const result = await dataBase.query(query,values)
            console.timeEnd("createIngrediente_model")
            return result.rows[0]
        }
         catch (error) {
            console.error("Error creando ingrediente:", error);
            throw error
        }
}



    // Bulk insert de ingredientes en una sola transacción
async bulkCreateIngrediente(receta_id, ingredientes) {
    // 1. Iniciar la transacción
    const client = await dataBase.connect();
    try {
        await client.query('BEGIN');

        const values = [];
        const placeholders = [];

        ingredientes.forEach((ingrediente , index )=>{
            const start = index * 4+1; //calcula el primer placeholder de cada fila
            placeholders.push(`($${start}, $${start + 1}, $${start + 2}, $${start + 3})`);
            values.push(receta_id, ingrediente.materia_prima_id, ingrediente.cantidad_usada, ingrediente.unidad);
        });
        const query = `
        INSERT INTO cuesta_tanto.ingredientes (receta_id, materia_prima_id, cantidad_usada, unidad)
        VALUES ${placeholders.join(', ')}
        RETURNING *
        `
        console.time("bulkCreateIngrediente_model")
        const result = await client.query(query, values);
        console.timeEnd("bulkCreateIngrediente_model")
    
        // 3. Confirmar transacción
        await client.query('COMMIT');
    } catch (error) {
        // 4. Si algo falla, revertir todo
        await  client.query('ROLLBACK');
        console.error("Error en bulkCreateIngrediente:", error);
        throw error;
    } finally {client.release();}



}
}