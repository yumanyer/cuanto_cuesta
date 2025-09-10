import { instanciaIngredientes } from "../models/ingredientes.models.js";
import { normalizarUnidad, getUnidadesValidas } from "../utils/unidades.utils.js";

export async function createIngrediente(req, res) {
  try {
    const { receta_id, materia_prima_id, cantidad_usada, unidad } = req.body;
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ details: "No autorizado" });
    if (!receta_id || !materia_prima_id || !cantidad_usada || !unidad) return res.status(422).json({ details: "Faltan datos obligatorios" });

    const result = normalizarUnidad(unidad, cantidad_usada);
    if (!result) return res.status(422).json({ details: `Unidad no válida. Permitidas: ${getUnidadesValidas().join(", ")}` });
    const { unidadNormalizada, cantidadNormalizada } = result;
    if (isNaN(cantidadNormalizada) || cantidadNormalizada <= 0) return res.status(422).json({ details: "Cantidad usada debe ser >0" });

    const created = await instanciaIngredientes.createIngrediente(user_id, receta_id, materia_prima_id, cantidadNormalizada, unidadNormalizada);
    return res.status(201).json(created);

  } catch (error) {
    console.error("Error createIngrediente:", error);
    if (error.message.includes("Unidad incompatible")) return res.status(422).json({ details: error.message });
    if (error.message.includes("No tenés permisos")) return res.status(403).json({ details: error.message });
    if (error.message.includes("Stock insuficiente")) return res.status(409).json({ details: error.message });
    return res.status(500).json({ details: "Error interno del servidor" });
  }
}

export async function bulkCreateIngrediente(req, res) {
  try {
    const { receta_id, ingredientes } = req.body;
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ details: "No autorizado" });
    if (!receta_id || !Array.isArray(ingredientes) || ingredientes.length === 0) return res.status(422).json({ details: "Debe enviar al menos un ingrediente" });

    const created = await instanciaIngredientes.bulkCreateIngrediente(user_id, receta_id, ingredientes);
    return res.status(201).json(created);

  } catch (error) {
    console.error("Error bulkCreateIngrediente:", error);
    return res.status(400).json({ details: error.message || "Error en la creación de ingredientes" });
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

export async function updateIngrediente(req, res) {
    try {
        const { id, receta_id, user_id } = req.params;
        const { materia_prima_id, cantidad_usada, unidad } = req.body;

        // Validaciones básicas
        if (!user_id) return res.status(401).json({ details: "No autorizado" });
        if (!id || !receta_id || !materia_prima_id || !cantidad_usada || !unidad)
            return res.status(422).json({ details: "Faltan datos obligatorios" });

        // Normalizar unidad
        const result = normalizarUnidad(unidad, cantidad_usada);
        if (!result) return res.status(422).json({ details: `Unidad no válida. Permitidas: ${getUnidadesValidas().join(", ")}` });

        const { unidadNormalizada, cantidadNormalizada } = result;
        if (isNaN(cantidadNormalizada) || cantidadNormalizada <= 0)
            return res.status(422).json({ details: "Cantidad usada debe ser >0" });

        // Llamada al modelo
        const updated = await instanciaIngredientes.updateIngrediente(
            Number(id),
            Number(user_id),
            Number(receta_id),
            Number(materia_prima_id),
            cantidadNormalizada,
            unidadNormalizada
        );

        return res.status(200).json({ ok: true, data: updated });

    } catch (error) {
        console.error("Error updateIngrediente:", error);

        if (error.message.includes("Unidad incompatible")) return res.status(422).json({ details: error.message });
        if (error.message.includes("No tenés permisos")) return res.status(403).json({ details: error.message });
        if (error.message.includes("Stock insuficiente")) return res.status(409).json({ details: error.message });

        return res.status(500).json({ details: "Error interno del servidor" });
    }
}
