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

// Mapeo de unidades y su factor de conversión
const unidadesValidas = {
  gramos: { normalizada: "Gramos", factor: 1 },
  mililitro: { normalizada: "Mililitro", factor: 1 },
  individual: { normalizada: "Individual", factor: 1 },
  kilo: { normalizada: "Gramos", factor: 1000 },
  litro: { normalizada: "Mililitro", factor: 1000 }
};

// --- CREAR PRODUCTO ---
export async function createProduct(req, res) {
  try {
    // Obtener usuario autenticado
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ details: "No tienes permisos para realizar esta acción" });

    const { nombre_producto, stock, unidad, precio } = req.body;

    // Validar campos obligatorios
    if (!nombre_producto || stock == null || !unidad || precio == null) {
      return res.status(422).json({ details: "Los campos nombre_producto, stock, unidad y precio son obligatorios" });
    }

    const nombre = nombre_producto.trim();
    const cantidad = Number(stock);
    const precioNum = Number(precio);

    // Normalizar unidad
    const unidadKey = unidad.trim().toLowerCase();
    const unidadInfo = unidadesValidas[unidadKey];

    if (!unidadInfo) return res.status(422).json({ details: "Unidad inválida" });

    // Validaciones básicas
    if (!nombre || nombre.length < 3 || nombre.length > 50) return res.status(422).json({ details: "El nombre del producto debe tener entre 3 y 50 caracteres" });
    if (isNaN(cantidad) || cantidad <= 0) return res.status(422).json({ details: "La cantidad debe ser un número mayor a cero" });
    if (isNaN(precioNum) || precioNum <= 0) return res.status(422).json({ details: "El precio debe ser un número mayor a cero" });

    // Comprobar duplicados
    const existeProducto = await instanciaMatterRaw.existeProductoForUser(nombre, unidadInfo.normalizada, user_id);
    if (existeProducto) return res.status(422).json({ details: "Ya existe un producto con ese nombre y unidad" });

    // Convertir cantidad a unidad base (gramos o mililitros)
    const cantidadConvertida = cantidad * unidadInfo.factor;

    // Crear producto en la DB
    const producto = await instanciaMatterRaw.createProduct(
      nombre,
      cantidadConvertida,
      unidadInfo.normalizada,
      precioNum,
      user_id,
      unidadKey // opcional: guardar unidad original para mostrarla en frontend
    );

    return res.status(201).json(producto);

  } catch (error) {
    console.error("Error al crear el producto:", error);
    return res.status(500).json({ message: "Error al crear el producto" });
  }
}

// --- MODIFICAR PRODUCTO ---
export async function modifyProduct(req, res) {
  try {
    // Obtener usuario autenticado
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ details: "No tienes permisos para realizar esta acción" });

    const { id } = req.params;
    const { nombre_producto, stock, unidad, precio } = req.body;

    // Validar campos obligatorios
    if (!id || !nombre_producto || stock == null || !unidad || precio == null) {
      return res.status(422).json({ details: "Los campos nombre_producto, stock, unidad y precio son obligatorios" });
    }

    const nombre = nombre_producto.trim();
    const cantidad = Number(stock);
    const precioNum = Number(precio);

    // Normalizar unidad
    const unidadKey = unidad.trim().toLowerCase();
    const unidadInfo = unidadesValidas[unidadKey];
    if (!unidadInfo) return res.status(422).json({ details: "Unidad inválida" });
    

    // Validaciones básicas
    if (!nombre || nombre.length < 3 || nombre.length > 50) return res.status(422).json({ details: "El nombre del producto debe tener entre 3 y 50 caracteres" });
    if (typeof cantidad !== 'number' || isNaN(cantidad) || cantidad <= 0) return res.status(422).json({ details: "La cantidad debe ser un número mayor a cero" });
    if (isNaN(precioNum) || precioNum <= 0) return res.status(422).json({ details: "El precio debe ser un número mayor a cero" });

    // Comprobar duplicados
    const existeProducto = await instanciaMatterRaw.existeProductoForUser(nombre, unidadInfo.normalizada, user_id);
    if (existeProducto) return res.status(422).json({ details: "Ya existe un producto con ese nombre y unidad" });

    // Convertir cantidad a unidad base (gramos o mililitros)
    const cantidadConvertida = cantidad * unidadInfo.factor;
    // Modificar producto en DB
    const productoModificado = await instanciaMatterRaw.modifyProduct(
      nombre,
      cantidadConvertida,
      unidadInfo.normalizada,
      precioNum,
      id,
      user_id,
      unidadKey // opcional: guardar unidad original
    );

    return res.status(200).json(productoModificado);

  } catch (error) {
    console.error("Error al modificar el producto:", error);
    return res.status(500).json({ details: "Error al modificar el producto", error: error.message });
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
