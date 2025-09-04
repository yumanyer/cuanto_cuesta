import { Ingredientes } from "../models/ingredientes.models.js";
import { normalizarUnidad,getUnidadesValidas } from "../utils/unidades.utils.js";

const instanciaIngredientes = new Ingredientes();

// --- CREAR INGREDIENTE ---

export async function createIngrediente(req, res) {
    try {

        const { receta_id, materia_prima_id, cantidad_usada, unidad } = req.body;

        // valido al usario 
        const user_id = req.user?.id;
        if (!user_id) {
            return res.status(401).json({ details: "No tienes permisos para realizar esta acción" });
        }  
        // valido los campos obligatorios
        if (receta_id==null || materia_prima_id==null || cantidad_usada == null || unidad==null ) {
            return res.status(422).json({ details: "Los campos receta_id, materia_prima_id, cantidad_usada y unidad son obligatorios" });
        }

        const result = normalizarUnidad(unidad , cantidad_usada)
        if (!result) {
            return res.status(422).json({ details: `Unidad no válida. Las unidades permitidas son: ${getUnidadesValidas().join(", ")}` });
        }
        const { unidadNormalizada, cantidadNormalizada } = result;


        const cantidad = Number(cantidad_usada);
        if (isNaN(cantidad) || cantidad <= 0) {
            return res.status(422).json({ details: "Cantidad usada debe ser un número mayor a cero" });
        }

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

        for(const ing of ingredientes){

            const result = normalizarUnidad(ing.unidad , ing.cantidad_usada)
            if (!result) {
                return res.status(422).json({ details: `Unidad no válida. Las unidades permitidas son: ${getUnidadesValidas().join(", ")}` });
            }
            const { unidadNormalizada, cantidadNormalizada } = result;
            ing.unidad = unidadNormalizada;
            ing.cantidad_usada = cantidadNormalizada;   

        }
        
        
        
        const created = await instanciaIngredientes.bulkCreateIngrediente(user_id, receta_id, ingredientes);
        return res.status(201).json(created);
    } catch (error) {
        console.error("Error en bulkCreateIngrediente:", error);
        return res.status(500).json({ details: "Error interno" });
    }
}

