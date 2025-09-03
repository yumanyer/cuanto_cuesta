import { Recetas } from "../models/recetas.model.js";

const instanciaRecetas = new Recetas();

// --- CREAR RECETA ---
export async function createReceta(req, res) {
    try {
        // Desestructuramos del body
        const { nombre_receta, descripcion, precio_total } = req.body;

        // Limpiar y convertir
        const nombre = nombre_receta?.trim();
        const desc = descripcion?.trim();
        const precio = Number(precio_total);

        // Verificar que el usuario esté autenticado
        const user_id = req.user?.id;
        if (!user_id) {
            return res.status(401).json({ details: "No tienes permisos para realizar esta acción" });
        }

        // Validaciones
        if (!nombre || nombre.length < 3 || nombre.length > 50) {
            return res.status(422).json({ details: "El nombre de la receta debe tener entre 3 y 50 caracteres" });
        }
        if (!desc || desc.length < 3 || desc.length > 500) {
            return res.status(422).json({ details: "La descripción de la receta debe tener entre 3 y 500 caracteres" });
        }
        if (typeof precio !== 'number' || isNaN(precio) || precio <= 0) {
            return res.status(422).json({ details: "El precio total de la receta debe ser un número mayor a cero" });
        }

        // Crear receta
        const receta = await instanciaRecetas.creatReceta(user_id, nombre, desc, precio);

        // Devolver resultado
        return res.status(201).json(receta);
    } catch (error) {
        console.error("Error al crear la receta:", error);
        return res.status(500).json({ message: "Error al crear la receta" });
    }
}
