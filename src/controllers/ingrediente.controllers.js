import { Ingredientes } from "../models/ingredientes.models.js";
import { normalizarUnidad,getUnidadesValidas } from "../utils/unidades.utils.js";

const instanciaIngredientes = new Ingredientes();

// --- CREAR INGREDIENTE ---

export async function createIngrediente(req, res) {
    try {
        const {receta_id,materia_prima_id,cantidad_usada,unidad} = req.body;
        const user_id = req.user?.id;
        if (!user_id) return res.status(401).json({ details: "No autorizado" });
        if(receta_id ==null || materia_prima_id == null || cantidad_usada == null || unidad == null){
            return res.status(422).json({ details: "Faltan datos obligatorios" });
        }

        const result = normalizarUnidad(unidad , cantidad_usada)
        if (!result) {
            return res.status(422).json({ details: `Unidad no válida. Las unidades permitidas son: ${getUnidadesValidas().join(", ")}` });
        }
        const { unidadNormalizada, cantidadNormalizada } = result;
        if(isNaN(cantidadNormalizada) || cantidadNormalizada <= 0){
            return res.status(422).json({ details: "Cantidad usada debe ser un número mayor a 0" });
        }
        const created = await instanciaIngredientes.createIngrediente(user_id, receta_id, materia_prima_id, cantidadNormalizada, unidadNormalizada);
        return res.status(201).json(created);
    } catch (error) {
        console.error("Error en createIngrediente:", error);

        // Mensajes personalizados 
        if (error.message.includes("Unidad incompatible")) {
            return res.status(422).json({ details: error.message });
        } else if (error.message.includes("No tenés permisos")) {
            return res.status(403).json({ details: error.message });
        } else if (error.message.includes("Stock insuficiente")) {
            return res.status(409).json({ details: error.message });
        } else if (error.message.includes("Unidad no válida")) {
            return res.status(422).json({ details: error.message });
        }

        // Error inesperado
        return res.status(500).json({ details: "Error interno del servidor" });
    }
}

export async function bulkCreateIngrediente(req, res) {
    try {
        const { receta_id, ingredientes } = req.body;
        const user_id = req.user?.id;

        if (!user_id) {
            return res.status(401).json({ details: "No autorizado" });
        }

        if (!receta_id || !Array.isArray(ingredientes) || ingredientes.length === 0) {
            return res.status(422).json({ details: "Debe enviar al menos un ingrediente" });
        }

        //  Ya no valido  materia prima ni compatibilidad acá, eso lo maneja el model
        const created = await instanciaIngredientes.bulkCreateIngrediente(
            user_id, 
            receta_id, 
            ingredientes
        );

        return res.status(201).json(created);

    } catch (error) {
        console.error("Error en bulkCreateIngrediente controller:", error);

        // Manejo más explícito de errores según el model
        return res.status(400).json({
            details: error.message || "Error en la creación de ingredientes"
        });
    }
}



export async function getIngredientesByRecetaId(req, res) {
    try {
        const receta_id  = Number(req.params.id);
        const user_id = req.user?.id;
        if (!user_id) return res.status(401).json({ details: "No tienes permisos para realizar esta acción" });
        if (!receta_id) return res.status(422).json({ details: "Debe enviar al menos un ingrediente" });

        const ingredientes = await instanciaIngredientes.getIngrediente(user_id, receta_id);
        return res.status(200).json(ingredientes);
    } catch (error) {
        console.error("Error en getIngredientesByRecetaId:", error);
        return res.status(500).json({ details: "Error interno" });
    }
}
