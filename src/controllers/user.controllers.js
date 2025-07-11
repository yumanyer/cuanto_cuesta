import { dataBase } from "../config/connectDB.config.js";
import { createUser } from "../models/user.models.js"
import { verifyPassword } from "../utils/hash.utils.js";
import { generateToken,verifyToken } from "../config/jwt.config.js";

export async function UserRegistrer(req, res) {
  try {
    const { Name, Email, Password, Rol } = req.body;

    const regemail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+(\.[a-z]{2,})+$/;

    if (!Name || !Email || !Password) {
      return res.status(422).json({
        details: "LOS CAMPOS NAME, EMAIL Y PASSWORD DEBEN ESTAR TODOS COMPLETOS",
      });
    }

    if (!regemail.test(Email)) {
      return res.status(418).json({
        details:
          "SOY UNA TETERA Y EL CORREO QUE ME DISTE LE FALTA COSAS fijate si te comiste una letra o un punto",
      });
    }

    const userRole = Rol || "Pastelero";
    const idUser = await createUser(Name, Email, Password, userRole);

    const token = generateToken({
      id: idUser,
      Name,
      Email,
      Rol: userRole, // ✅ Usamos el rol real, no el que vino crudo
    });

    return res.status(201).json({
      message: "Usuario Registrado con Éxito",
      token,
    });
  } catch (error) {
    console.error("Error al crear el usuario:", error);
    return res.status(500).json({
      message: "Error al crear el usuario",
    });
  }
}


// Login de usuario
export const loginUser = async (req, res) => {
  const { Email, Password } = req.body;

  if (!Email || !Password) {
    return res.status(422).json({ details: "LOS CAMPOS EMAIL Y PASSWORD SON OBLIGATORIOS" });
  }

  try {
    const result = await dataBase.query(
      'SELECT id, "Email", "Password", "Rol", "Name" FROM cuesta_tanto.usuarios WHERE "Email" = $1',
      [Email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ details: "Este correo no existe pa" });
    }

    const user = result.rows[0];

    const isPasswordCorrect = await verifyPassword(Password, user.Password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ details: "Contraseña incorrecta" });
    }

    // Generar token
    const token = generateToken({
      id: user.id,
      Name: user.Name,
      Email: user.Email,
      Rol: user.Rol,
    });

    return res.status(200).json({
      details: `te pudiste logear ${user.Name}`,
      token,
      user: Email,
      userId: user.id,
      userRole: user.Rol,
    });
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      details: "FIJATE QUE PUSISTE ALGO MAL POR QUE NO ENCUENTRO NI EL CORREO NI LA CONTRASEÑA",
      error,
    });
  }
};
