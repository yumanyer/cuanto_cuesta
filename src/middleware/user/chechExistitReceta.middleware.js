import { dataBase } from "../../config/connectDB.config.js";

export const checkOwnershipReceta = async (req, res, next) => {
  try {
    const {receta_id} = req.body; 
    const user_id = req.user.id;

    const query = `
      SELECT 1 FROM cuesta_tanto.recetas
      WHERE id = $1 AND user_id = $2
    `;
    const values = [receta_id, user_id];
    const result = await dataBase.query(query, values);

    if (result.rows.length > 0) {
      return next(); // ✅ El usuario es dueño de la receta
    }

    return res.status(403).json({
      message: "No tenés permisos para modificar esta receta",
    });
  } catch (error) {
    console.error("Error verificando propiedad de la receta:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};
