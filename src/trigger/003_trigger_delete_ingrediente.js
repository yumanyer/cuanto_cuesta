// Cuando se elimina un ingrediente,
// recalcula el precio_total de la receta a la que pertenecía.

import { dataBase } from "../config/connectDB.config.js";

export async function TriggerDeleteIngrediente() {
  const query = `
    CREATE OR REPLACE FUNCTION cuesta_tanto.recalcular_precio_al_eliminar()
    RETURNS TRIGGER AS $$
    BEGIN
      UPDATE cuesta_tanto.recetas r
      SET precio_total = COALESCE(sub.total, 0)
      FROM (
        SELECT i.receta_id, SUM(i.cantidad_usada * m.precio_unitario) AS total
        FROM cuesta_tanto.ingredientes i
        JOIN cuesta_tanto.materia_prima m ON m.id = i.materia_prima_id
        WHERE i.receta_id = OLD.receta_id
        GROUP BY i.receta_id
      ) sub
      WHERE r.id = sub.receta_id;

      -- Si no hubo filas (no quedan ingredientes), forzamos precio_total = 0
      IF NOT FOUND THEN
        UPDATE cuesta_tanto.recetas
        SET precio_total = 0
        WHERE id = OLD.receta_id;
      END IF;

      RETURN OLD;
    END;
    $$ LANGUAGE plpgsql;
  `;
  await dataBase.query(query);
  console.log("✅ Trigger creado/actualizado: recalcular_precio_al_eliminar");
}
