import { MatterRaw } from "../models/matterRaw.models.js"
const instanciaMatterRaw = new MatterRaw()

export async function MatterRawControllers(req,res){
        try {
            const user_id = req.user.id

            if(!user_id){
                return res.status(401).json({details:"No tienes permisos para realizar esta acción"})
            }
            const {nombre_producto,cantidad_comprada,unidad,precio}=req.body
            if(!nombre_producto || !cantidad_comprada || !unidad || !precio){
                return res.status(422).json({details:"Los campos nombre_producto, cantidad_comprada, unidad y precio son obligatorios"})
            }
            if (typeof nombre_producto !== "string" || nombre_producto.trim() === "") {
              return res.status(422).json({ details: "El nombre del producto debe ser un texto válido" });
            }

            if (typeof cantidad_comprada !== "number" || cantidad_comprada <= 0) {
              return res.status(422).json({ details: "La cantidad debe ser un número mayor a cero" });
            }

            if (!["gramo", "mililitro", "unidad"].includes(unidad)) {
              return res.status(422).json({ details: "La unidad debe ser 'gramo', 'mililitro' o 'unidad'" });
            }

            if (typeof precio !== "number" || precio <= 0) {
              return res.status(422).json({ details: "El precio debe ser un número mayor a cero" });
            }

            const producto = await instanciaMatterRaw.createProduct(nombre_producto,cantidad_comprada,unidad,precio,user_id)
            return res.status(201).json(producto)
        } catch (error) {
            console.error("Error al crear el producto:", error);
            return res.status(500).json({
                message: "Error al crear el producto",
            });
        }
}