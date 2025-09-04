import {dataBase} from "../config/connectDB.config.js"

export class Ingredientes{
    constructor(id,user_id,receta_id,materia_prima_id,cantidad_usada,created_at,unidad){
        this.id=id
        this.receta_id=receta_id
        this.materia_prima_id=materia_prima_id
        this.cantidad_usada=cantidad_usada
        this.unidad=unidad
        this.created_at=created_at
    }

    async createIngrediente(user_id, receta_id, materia_prima_id, cantidad_usada, unidad){
        try {
    const query = `
    INSERT INTO cuesta_tanto.ingredientes 
    (user_id, receta_id, materia_prima_id, cantidad_usada, unidad)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *`;
            const values = [user_id, receta_id, materia_prima_id, cantidad_usada, unidad];
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
    async  bulkCreateIngrediente(user_id, receta_id, ingredientes) {
    const client = await dataBase.connect();
    try {
        await client.query('BEGIN');

        const values = [];
        const placeholders = [];
        let ingredienteArray = ingredientes;
        if (typeof ingredientes === 'string') ingredienteArray = JSON.parse(ingredientes);

        ingredienteArray.forEach((ing, i) => {
            const start = i * 5 + 1;
            placeholders.push(`($${start}, $${start+1}, $${start+2}, $${start+3}, $${start+4})`);
            values.push(user_id, receta_id, ing.materia_prima_id, ing.cantidad_usada, ing.unidad);
        });

        const query = `
            INSERT INTO cuesta_tanto.ingredientes (user_id, receta_id, materia_prima_id, cantidad_usada, unidad)
            VALUES ${placeholders.join(', ')}
            RETURNING *
        `;
        const result = await client.query(query, values);

        await client.query('COMMIT');
        return result.rows;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error en bulkCreateIngrediente model:", error);
        throw error;
    } finally {
        client.release();
    }
    }

    // async getIngrediente(user_id,receta_id,ingrediente)

}