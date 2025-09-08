import {dataBase} from "../config/connectDB.config.js"
import { normalizarUnidad, getUnidadesValidas } from "../utils/unidades.utils.js";

export class Ingredientes {
  constructor(id, user_id, receta_id, materia_prima_id, cantidad_usada, unidad, created_at) {
    this.id = id;
    this.user_id = user_id;
    this.receta_id = receta_id;
    this.materia_prima_id = materia_prima_id;
    this.cantidad_usada = cantidad_usada;
    this.unidad = unidad;
    this.created_at = created_at;
  }

async createIngrediente(user_id, receta_id, materia_prima_id, cantidad_usada, unidad) {
    // --- Validar unidad antes de tocar la DB ---
    const result = normalizarUnidad(unidad, cantidad_usada);
    if (!result) throw new Error(`Unidad no válida. Las unidades permitidas son: ${getUnidadesValidas().join(", ")}`);
    const { unidadNormalizada, cantidadNormalizada } = result;

    
    const client = await dataBase.connect();

    try {
        // inicio transaccion
        await client.query("BEGIN");

        // bloqueo fila para evitar concurrecia 
        const { rows: materiaRows } = await client.query(
            `SELECT stock, unidad FROM cuesta_tanto.materia_prima 
             WHERE id = $1 AND user_id = $2 FOR UPDATE`,
            [materia_prima_id, user_id]
        );
        if (materiaRows.length === 0) throw new Error("No tenés permisos para modificar esta materia");

        // valido que se cargue la cantidad en la qeu fue creada materia prima
        const unidadBase = materiaRows[0].unidad;
        const compatibles = {
            "Gramos": ["Gramos", "Kilo"],
            "Mililitro": ["Mililitro", "Litro"],
            "Individual": ["Individual"]
        };
        if (!compatibles[unidadBase]?.includes(unidad)) {
            throw new Error(`Unidad incompatible. La materia prima se cargó como '${unidadBase}'`);
        }

        // STOCK
        if (materiaRows[0].stock < cantidadNormalizada) throw new Error("Stock insuficiente. Tu stock actual: " + materiaRows[0].stock);

        //DUPLICADOS
        const { rows: ingredienteRows } = await client.query(
            `SELECT id, cantidad_usada FROM cuesta_tanto.ingredientes
             WHERE receta_id = $1 AND materia_prima_id = $2 AND user_id = $3
             FOR UPDATE`,
            [receta_id, materia_prima_id, user_id]
        );

        let ingredienteCreado;
        if (ingredienteRows.length > 0) {
            const newCantidad = Number(ingredienteRows[0].cantidad_usada) + cantidadNormalizada;
            const { rows } = await client.query(
                `UPDATE cuesta_tanto.ingredientes
                 SET cantidad_usada = $1
                 WHERE id = $2
                 RETURNING *`,
                [newCantidad, ingredienteRows[0].id]
            );
            ingredienteCreado = rows[0];
        } else {
            const { rows } = await client.query(
                `INSERT INTO cuesta_tanto.ingredientes
                 (user_id, receta_id, materia_prima_id, cantidad_usada, unidad)
                 VALUES ($1,$2,$3,$4,$5)
                 RETURNING *`,
                [user_id, receta_id, materia_prima_id, cantidadNormalizada, unidadNormalizada]
            );
            ingredienteCreado = rows[0];
        }

        // STOCK 
        await client.query(
            `UPDATE cuesta_tanto.materia_prima
             SET stock = stock - $1
             WHERE id = $2`,
            [cantidadNormalizada, materia_prima_id]
        );

        // si sale todo bien confirmo transaccion
        await client.query("COMMIT");
        return ingredienteCreado;

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error creando ingrediente:", error);
        throw error;  
    } finally {
        client.release();
    }
}

/**
* que sea del usuario,
* que la unidad sea compatible con la materia prima, 
* que haya stock suficiente, 
* Se mergean duplicados dentro del array.
* Se validan unidades y cantidades (incluyendo Individual sin decimales).
* Se actualizan registros existentes en la receta en vez de duplicarlos.
* Solo se insertan los nuevos.
* Se actualiza stock correctamente.
 */

// Bulk insert de ingredientes en una sola transacción
async bulkCreateIngrediente(user_id, receta_id, ingredientes) {
    const client = await dataBase.connect();

    // Si viene en string lo parseo
    let ingredienteArray = ingredientes;
    if (typeof ingredientes === "string") {
        ingredienteArray = JSON.parse(ingredientes);
    }

    try {
        await client.query("BEGIN");

        //  Combinar duplicados dentro del mismo array con  el constructor Map
        const map = new Map();
        for (const ing of ingredienteArray) {

            // normalizo unidad y  valido cantid
            const result = normalizarUnidad(ing.unidad, ing.cantidad_usada);
            if (!result) {
                throw new Error(
                    `Unidad no válida para materia prima ${ing.materia_prima_id}. ` +
                    `Permitidas: ${getUnidadesValidas().join(", ")}`
                );
            }

            let { unidadNormalizada, cantidadNormalizada } = result;

            if (cantidadNormalizada <= 0) {
                throw new Error(`Cantidad inválida para ${ing.materia_prima_id}: ${ing.cantidad_usada}`);
            }

            if (unidadNormalizada === "Individual" && !Number.isInteger(cantidadNormalizada)) {
                throw new Error(`La unidad "Individual" solo acepta enteros. Se recibió: ${cantidadNormalizada}`);
            }

        // valido que se cargue la cantidad en la qeu fue creada materia prima
            const { rows: materiaRows } = await client.query(
                `SELECT unidad FROM cuesta_tanto.materia_prima 
                 WHERE id = $1 AND user_id = $2`,
                [ing.materia_prima_id, user_id]
            );

            if (materiaRows.length === 0) {
                throw new Error(`No tenés permisos sobre la materia prima ${ing.materia_prima_id}`);
            }

            const unidadBase = materiaRows[0].unidad;
            const compatibles = {
                "Gramos": ["Gramos", "Kilo"],
                "Mililitro": ["Mililitro", "Litro"],
                "Individual": ["Individual"]
            };

            if (!compatibles[unidadBase]?.includes(unidadNormalizada)) {
                throw new Error(`Unidad incompatible para materia prima ${ing.materia_prima_id}. La unidad base es '${unidadBase}', se recibió '${unidadNormalizada}'`);
            }

            /**
             * Map funciona como un diccionario ordenado.
            * .has() → pregunta si ya existe la clave.
            * .get() → obtiene el valor existente para modificarlo.
            * .set() → inserta o reemplaza el valor.
            * Esto en tu modelo permite que un bulkCreate no duplique ingredientes 
            * y que la cantidad total de cada materia prima se acumule correctamente.
             */
            // Combinar duplicados
            if (map.has(ing.materia_prima_id)) {
                map.get(ing.materia_prima_id).cantidad_usada += cantidadNormalizada;
            } else {
                map.set(ing.materia_prima_id, {
                    ...ing,
                    unidad: unidadNormalizada,
                    cantidad_usada: cantidadNormalizada
                });
            }
        }

        const ingredientesMapeadeos = [...map.values()];

        // duplicados 
        const { rows: existentes } = await client.query(
            `SELECT id, materia_prima_id, cantidad_usada 
             FROM cuesta_tanto.ingredientes
             WHERE receta_id = $1 AND user_id = $2`,
            [receta_id, user_id]
        );

        const actualizados = [];
        const nuevos = [];

        for (const ing of ingredientesMapeadeos) {
            const existe = existentes.find(e => e.materia_prima_id === ing.materia_prima_id);

            // STOCK
            const { rows: materiaRows } = await client.query(
                `SELECT stock FROM cuesta_tanto.materia_prima 
                 WHERE id = $1 AND user_id = $2 
                 FOR UPDATE`,
                [ing.materia_prima_id, user_id]
            );

            if (materiaRows[0].stock < ing.cantidad_usada) {
                throw new Error(`Stock insuficiente para ${ing.materia_prima_id}. Disponible: ${materiaRows[0].stock}`);
            }

            // STOCK
            await client.query(
                `UPDATE cuesta_tanto.materia_prima
                 SET stock = stock - $1
                 WHERE id = $2`,
                [ing.cantidad_usada, ing.materia_prima_id]
            );

            if (existe) {
                
                const newCantidad = Number(existe.cantidad_usada) + ing.cantidad_usada;
                const { rows } = await client.query(
                    `UPDATE cuesta_tanto.ingredientes
                     SET cantidad_usada = $1
                     WHERE id = $2
                     RETURNING *`,
                    [newCantidad, existe.id]
                );
                actualizados.push(rows[0]);
            } else {
                nuevos.push(ing);
            }
        }

        // Inserto nuevos ingredientes de una sola vez
        let insertados = [];
        if (nuevos.length > 0) {
            const values = [];
            const placeholders = [];

            nuevos.forEach((ing, i) => {
                const start = i * 5 + 1;
                placeholders.push(`($${start}, $${start+1}, $${start+2}, $${start+3}, $${start+4})`);
                values.push(user_id, receta_id, ing.materia_prima_id, ing.cantidad_usada, ing.unidad);
            });

            const query = `
                INSERT INTO cuesta_tanto.ingredientes
                (user_id, receta_id, materia_prima_id, cantidad_usada, unidad)
                VALUES ${placeholders.join(", ")}
                RETURNING *`;
            const { rows } = await client.query(query, values);
            insertados = rows;
        }

        await client.query("COMMIT");
        return [...actualizados, ...insertados];

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error en bulkCreateIngrediente model:", error);
        throw error;
    } finally {
        client.release();
    }
}


async getIngrediente(user_id,receta_id){
    try {
        const query=`
        SELECT * FROM cuesta_tanto.ingredientes 
        WHERE user_id = $1 AND receta_id = $2 ;
        `
        const values= [user_id,receta_id]
        console.time("getIngrediente")
        const result=await dataBase.query(query,values)
        console.timeEnd("getIngrediente")
        return result.rows
    } catch (error) {
        console.log()
        console.error("Error obteniendo ingredientes:", error);
        throw error
    }
}

}