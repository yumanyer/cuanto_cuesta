import { MatterRaw } from "../models/matterRaw.models.js"


const instanciaMatterRaw = new MatterRaw()

/**
 *    return res.status(200).json({
     message: product.length > 0 
       ? "Estos son los productos que tienes" 
       : "No hay productos para este usuario",
     producto_encontrado: product 
   });
 1 El endpoint es válido.
 2 La consulta se ejecuta correctamente.
 3 No hay error del servidor ni del cliente.
 4 El frontend no tiene que manejar dos flujos distintos (éxito vs error).
 */
export async function getProductById(req,res) {
   const user_id = req.user.id
   const products = await instanciaMatterRaw.getProductById(user_id)
   
   return res.status(200).json({
     message: products.length > 0 
       ? "Estos son los productos que tienes" 
       : "No hay productos para este usuario",
     producto_encontrado: products 
   });
}

export async function createProduct(req, res) {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ details: "No tienes permisos para realizar esta acción" });
    }

    const { nombre_producto, cantidad_comprada, unidad, precio } = req.body;

    if (nombre_producto == null || cantidad_comprada == null || unidad == null || precio == null) {
      return res.status(422).json({ details: "Los campos nombre_producto, cantidad_comprada, unidad y precio son obligatorios" });
    }
    const nombre = nombre_producto.trim();
    const cantidad = Number(cantidad_comprada);
    const precioNum = Number(precio)

    if (!nombre || nombre.length < 3 || nombre.length > 50) {
      return res.status(422).json({ details: "El nombre del producto debe tener entre 3 y 50 caracteres" });
    }

    if (isNaN(cantidad) || cantidad <= 0) {
      return res.status(422).json({ details: "La cantidad debe ser un número mayor a cero" });
    }


    // Normalizar unidad
    const unidadesValidas = {
      gramos: "Gramos",
      mililitro: "Mililitro",
      individual: "Individual"
    };

    const unidadNormalizada = unidadesValidas[unidad.toLowerCase()];
    if (!unidadNormalizada) {
      return res.status(422).json({ details: "La unidad debe ser 'Gramos', 'Mililitro' o 'Individual'" });
    }

    if (isNaN(precioNum) || precioNum <= 0) {
      return res.status(422).json({ details: "El precio debe ser un número mayor a cero" });
    }

    // Valido que el cliente no haga overflow
    if (cantidad_comprada === 0 || precio === 0) {
      return res.status(422).json({ details: "La cantidad y el precio no pueden ser 0" });
    }

    const existeProducto = await instanciaMatterRaw.existeProductoForUser(nombre_producto, unidadNormalizada, user_id);
    if (existeProducto) {
      return res.status(422).json({ details: "Ya existe un producto con ese nombre y unidad" });
    }

    const producto = await instanciaMatterRaw.createProduct(nombre_producto, cantidad_comprada, unidadNormalizada, precio, user_id);
    return res.status(201).json(producto);

  } catch (error) {
    console.error("Error al crear el producto:", error);
    return res.status(500).json({
      message: "Error al crear el producto",
    });
  }
}


export async function modifyProduct(req, res) {
  try {
    const { nombre_producto, cantidad_comprada, unidad, precio } = req.body;
    const { id } = req.params;
    const user_id = req.user.id;

    // Usuario autenticado
    if (!user_id) {
      return res.status(401).json({ details: "No tenés permisos para realizar esta acción" });
    }

    // Validar ID del producto
    if (!id) {
      return res.status(400).json({ message: "Falta el ID en los parámetros de la ruta" });
    }

    // Validar campos obligatorios
    if (nombre_producto == null || cantidad_comprada == null || unidad == null || precio == null) {
      return res.status(422).json({ details: "Los campos nombre_producto, cantidad_comprada, unidad y precio son obligatorios" });
    }

    // Normalizar y convertir valores
    const nombre = nombre_producto.trim();
    const cantidad = Number(cantidad_comprada);
    const precioNum = Number(precio);

    // Validar tipo y rango de nombre
    if (!nombre || nombre.length < 3 || nombre.length > 50) {
      return res.status(422).json({ details: "El nombre del producto debe tener entre 3 y 50 caracteres" });
    }

    // Validar cantidad
    if (isNaN(cantidad) || cantidad <= 0) {
      return res.status(422).json({ details: "La cantidad debe ser un número mayor a cero" });
    }

    // Normalizar y validar unidad
    const unidadesValidas = { gramos: "Gramos", mililitro: "Mililitro", individual: "Individual" };
    const unidadNormalizada = unidadesValidas[unidad.trim().toLowerCase()];
    if (!unidadNormalizada) {
      return res.status(422).json({ details: "La unidad debe ser 'Gramos', 'Mililitro' o 'Individual'" });
    }

    // Validar precio
    if (isNaN(precioNum) || precioNum <= 0) {
      return res.status(422).json({ details: "El precio debe ser un número mayor a cero" });
    }

    // Comprobar duplicados
    const existeProducto = await instanciaMatterRaw.existeProductoForUser(nombre, unidadNormalizada, user_id);
    if (existeProducto) {
      return res.status(422).json({ details: "Ya existe un producto con ese nombre y unidad" });
    }

    // Modificar producto en DB
    const productoModificado = await instanciaMatterRaw.modifyProduct(
      nombre,
      cantidad,
      unidadNormalizada,
      precioNum,
      id,
      user_id
    );

    return res.status(200).json(productoModificado);

  } catch (error) {
    console.error("Error al modificar el producto:", error);
    return res.status(500).json({
      details: "Error al modificar el producto",
      error: error.message
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
        message: "Producto eliminado correctamente",producto:deletedProduct});
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
