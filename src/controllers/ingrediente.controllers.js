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

        // Verifica que el usuario esté autenticado 
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ details: "No tienes permisos para realizar esta acción" });
        }

        //  Validaciones 
        if (!Number.isInteger(receta_id) || receta_id <= 0) {
            return res.status(422).json({ details: "ID de receta inválido" });
        }
        if (!Number.isInteger(materia_prima_id) || materia_prima_id <= 0) {
            return res.status(422).json({ details: "ID de materia prima inválido" });
        }

        const cantidad = Number(cantidad_usada);
        if (isNaN(cantidad) || cantidad <= 0) {
            return res.status(422).json({ details: "Cantidad usada debe ser un número mayor a cero" });
        }

        //  Valida la unidad y obtiene la info de normalización 
        const unidadInfo = unidadesValidas[unidad.toLowerCase()];
        if (!unidadInfo) {
            return res.status(422).json({ details: "Unidad inválida" });
        }

        // Aplicar normalización de cantidad 
        const cantidadNormalizada = cantidad * unidadInfo.factor;
        const unidadNormalizada = unidadInfo.normalizada;

        
        console.time("createIngrediente_controller");
        const ingrediente = await instanciaIngredientes.createIngrediente(
            receta_id,
            materia_prima_id,
            cantidadNormalizada,
            unidadNormalizada
        );
        console.timeEnd("createIngrediente_controller");

        return res.status(201).json(ingrediente);

    } catch (error) {
        console.error("Error al crear el ingrediente:", error);
        return res.status(500).json({ message: "Error al crear el ingrediente" });
    }
}

export async function bulkCreateIngrediente(req, res) {
    try {
        const {receta_id,ingredientes} = req.body;
        // Verifica que el usuario esté autenticado 
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ details: "No tienes permisos para realizar esta acción" });
        }

        if(!receta_id || !Array.isArray(ingredientes) || ingredientes.length <= 0){
            return res.status(422).json({details:"Debe enviar al menos un ingrediente"});
        }

        console.time("bulkCreateIngrediente_controller");
        const ingredientesCreados = await instanciaIngredientes.bulkCreateIngrediente(receta_id,ingredientes);
        console.timeEnd("bulkCreateIngrediente_controller");
        return res.status(201).json(ingredientesCreados);

    } catch (error) {
        console.error("Error al crear los ingredientes:", error);
        return res.status(500).json({ message: "Error al crear los ingredientes" });
    }
}
