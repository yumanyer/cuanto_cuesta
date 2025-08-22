import { dataBase } from "../config/connectDB.config.js";
import { createUser } from "../models/user.models.js"
import { verifyPassword } from "../utils/hash.utils.js";
import { generateToken,verifyToken } from "../config/jwt.config.js";


function evaluatePasswordStrength(password) {
  let score = 0;
  let feedback = [];

  if (password.length >= 8) score += 1; else feedback.push('al menos 8 caracteres');
  if (/[a-z]/.test(password)) score += 1; else feedback.push('letras minúsculas');
  if (/[A-Z]/.test(password)) score += 1; else feedback.push('letras mayúsculas');
  if (/[0-9]/.test(password)) score += 1; else feedback.push('números');
  if (/[^A-Za-z0-9]/.test(password)) score += 1; else feedback.push('símbolos especiales');

  return { score, feedback };
}



export async function UserRegistrer(req, res) {
  try {

    const { Name, Email, Password, Rol } = req.body;

    const regemail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+(\.[a-z]{2,})+$/;

    const { score, feedback } = evaluatePasswordStrength(Password);
      if (score < 3) {
        return res.status(422).json({
          details: `La contraseña debe ser más segura. Falta: ${feedback.join(', ')}`
        });
      }

    if (!Name || !Email || !Password) {
      return res.status(422).json({
        details: "LOS CAMPOS NAME, EMAIL Y PASSWORD DEBEN ESTAR TODOS COMPLETOS",
      });
    }

    if (!regemail.test(Email)) {
      return res.status(422).json({
        details: "El formato del correo electrónico no es válido. Por favor, verifica que sea correcto."
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
    res.cookie("authToken",token,{
      httpOnly:true,
      secure:true,
      sameSite:"strict",
      maxAge:3600*1000 //es la duración de la cookie en milisegundos.
    })
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
      return res.status(401).json({ details: "Usuario o contraseña incorrectos" });
    }

    const user = result.rows[0];

    const isPasswordCorrect = await verifyPassword(Password, user.Password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ details: "Usuario o contraseña incorrectos" });
    }

    // Generar token
    const token = generateToken({
      id: user.id,
      Name: user.Name,
      Email: user.Email,
      Rol: user.Rol,
    });
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 3600 * 1000, // es la duración de la cookie en milisegundos.
    });
    return res.status(200).json({
      details: `Bienvenido Sr. ${user.Name}`,
      user: Email,
      userId: user.id,
      userRole: user.Rol,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      details: "Error al intentar iniciar sesión",
    });
  }
};
