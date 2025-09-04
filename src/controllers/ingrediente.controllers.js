import { Ingredientes } from "../models/ingredientes.models.js";

const instanciaIngredientes = new Ingredientes();

// --- CREAR INGREDIENTE ---

export async function createIngrediente(req, res) {
    try {
        const unidadesValidas = {
            gramos: { normalizada: "Gramos", factor: 1 },
            mililitro: { normalizada: "Mililitro", factor: 1 },
            individual: { normalizada: "Individual", factor: 1 },
            kilo: { normalizada: "Gramos", factor: 1000 },
            litro: { normalizada: "Mililitro", factor: 1000 }
        };

        const { receta_id, materia_prima_id, cantidad_usada, unidad } = req.body;

        const user_id = req.user?.id;
        if (!user_id) {
            return res.status(401).json({ details: "No tienes permisos para realizar esta acción" });
        }   
        if (!receta_id || !materia_prima_id || cantidad_usada == null || !unidad) {
            return res.status(422).json({ details: "Los campos receta_id, materia_prima_id, cantidad_usada y unidad son obligatorios" });
        }


        const unidadKey = unidad.trim().toLowerCase();
        const unidadInfo = unidadesValidas[unidadKey];
        if (!unidadInfo) {
            return res.status(422).json({ details: "Unidad inválida" });
        }
        const cantidad = Number(cantidad_usada);
        if (isNaN(cantidad) || cantidad <= 0) {
            return res.status(422).json({ details: "Cantidad usada debe ser un número mayor a cero" });
        }
        //  Valida la unidad y obtiene la info de normalización 
        const unidadNormalizada = unidadInfo.normalizada;
        const cantidadNormalizada = cantidad * unidadInfo.factor;

        console.time("createIngrediente_controller");

        const ingrediente = await instanciaIngredientes.createIngrediente(
            user_id,
            receta_id,
            materia_prima_id,
            cantidadNormalizada,
            unidadNormalizada
        );
        return res.status(201).json(ingrediente);


    } catch (error) {
       console.error("Error al crear el ingrediente:", error);
       return res.status(500).json({ message: "Error al crear el ingrediente",error }); 
    }
}

export async function bulkCreateIngrediente(req, res) {
    try {
        const { receta_id, ingredientes } = req.body;
        const user_id = req.user?.id;

        if (!user_id) return res.status(401).json({ details: "No autorizado" });
        if (!receta_id || !Array.isArray(ingredientes) || ingredientes.length === 0)
            return res.status(422).json({ details: "Debe enviar al menos un ingrediente" });

        // 2️⃣ Llamar al model para insertar los ingredientes
        const created = await instanciaIngredientes.bulkCreateIngrediente(user_id, receta_id, ingredientes);

        return res.status(201).json(created);
    } catch (error) {
        console.error("Error en bulkCreateIngrediente:", error);
        return res.status(500).json({ details: "Error interno" });
    }
}

