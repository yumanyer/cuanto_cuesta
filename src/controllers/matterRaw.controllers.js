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

            if (!["gramos", "mililitro", "individual"].includes(unidad.toLowerCase())) {
              return res.status(422).json({ details: "La unidad debe ser 'gramos', 'mililitro' o 'Individual'" });
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

export async function modifyProduct(req,res) {
        try {
            const {nombre_producto,cantidad_comprada,unidad,precio} = req.body;
            const { id } = req.params;
            //console.log( "este es el id del que hace la peticion: ",id)
            const user_id = req.user.id;
            //console.log("Este es el ID de quien creo el producto: ",user_id)

            
            if(!user_id){
                return res.status(401).json({details:"No tienes permisos para realizar esta acción"})
            }

            if(!id){
              return res.status(400).json({message: "Falta el ID en los parámetros de la ruta"})
            }
            if( !nombre_producto || !cantidad_comprada || !unidad || !precio){
                return res.status(422).json({details:"Los campos nombre_producto, cantidad_comprada, unidad y precio son obligatorios"})
            }
            if (typeof nombre_producto !== "string" || nombre_producto.trim() === "") {
              return res.status(422).json({ details: "El nombre del producto debe ser un texto válido" });
            }

            if (typeof cantidad_comprada !== "number" || cantidad_comprada <= 0) {
              return res.status(422).json({ details: "La cantidad debe ser un número mayor a cero" });
            }

            if (!["gramos", "mililitro", "individual"].includes(unidad.toLowerCase())) {
              return res.status(422).json({ details: "La unidad debe ser Gramos, mililitro, Individual" });
            }

            if (typeof precio !== "number" || precio <= 0) {
              return res.status(422).json({ details: "El precio debe ser un número mayor a cero" });
            }

          const modifyProduct = await instanciaMatterRaw.modifyProduct(nombre_producto,cantidad_comprada,unidad,precio,id,user_id)
          return res.status(200).json(modifyProduct)
            
        } catch (error) {
              return res.status(500).json({
                details: "Error al modificar el producto",
                error: error
            });
        }


}

export async function deleteProdctUser(req, res) {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    if (!id) {
      return res.status(400).json({ message: "Se debe indicar qué producto eliminar" });
    }

    const deleteResult = await instanciaMatterRaw.deleteProduct(id, user_id);
    const deletedProduct = deleteResult.rows[0];

    if (deletedProduct) {
      return res.status(200).json({
        message: "Producto eliminado correctamente",
        producto_eliminado: {
          id: deletedProduct.id,
          nombre: deletedProduct.nombre_producto,
          cantidad: deletedProduct.cantidad_comprada,
          unidad: deletedProduct.unidad,
          precio: deletedProduct.precio,
          creado: deletedProduct.created_at
        }
      });
    } else {
      return res.status(404).json({ message: "El producto no existe o no tenés permiso para eliminarlo" });
    }

  } catch (error) {
    return res.status(500).json({
      message: "Error al eliminar el producto",
      error: error.message
    });
  }
}
