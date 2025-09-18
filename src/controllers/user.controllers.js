// controllers/user.controllers.js
import { dataBase } from "../config/connectDB.config.js";
import { createUser } from "../models/user.models.js";
import { verifyPassword } from "../utils/hash.utils.js";
import { generateAccessToken, generateRefreshToken, verifyToken } from "../config/jwt.config.js";

const isProd = process.env.NODE_ENV === "production";

// Registro de usuario
export async function UserRegistrer(req, res) {
  try {
    const { Name, Email, Password, Rol } = req.body;
    const regemail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+(\.[a-z]{2,})+$/;

    if (!Name || !Email || !Password) {
      return res.status(422).json({ details: "Name, Email y Password son obligatorios." });
    }
    if (!regemail.test(Email)) {
      return res.status(422).json({ details: "Formato de correo inválido." });
    }

    const { score, feedback } = evaluatePasswordStrength(Password);
    if (score < 3) {
      return res.status(422).json({ details: `Contraseña débil. Faltan: ${feedback.join(", ")}` });
    }

    const userRole = Rol || "Pastelero";
    const idUser = await createUser(Name, Email, Password, userRole);
    const payload = { id: idUser, Name, Email, Rol: userRole };

    const accessToken = generateAccessToken(payload); // 15 min
    const refreshToken = generateRefreshToken(payload); // 7 días

    // Guardar cookies sincronizadas con JWT
    res.cookie("authToken", accessToken, { 
        httpOnly: true, 
        secure: isProd, 
        sameSite: "strict", 
        maxAge: 15 * 60 * 1000 // 15 minutos
    });
    res.cookie("refreshToken", refreshToken, { 
        httpOnly: true, 
        secure: isProd, 
        sameSite: "strict", 
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    });

    return res.status(201).json({ message: "Usuario registrado con éxito" });
  } catch (error) {
    console.error("Error al crear el usuario:", error);
    return res.status(500).json({ message: "Error al registrar usuario" });
  }
}

// Login de usuario
export const loginUser = async (req, res) => {
  const { Email, Password } = req.body;
  if (!Email || !Password) {
    return res.status(422).json({ details: "Email y Password son obligatorios" });
  }

  try {
    const result = await dataBase.query(
      'SELECT id, "Email", "Password", "Rol", "Name" FROM cuesta_tanto.usuarios WHERE "Email" = $1',
      [Email]
    );
    if (result.rows.length === 0) return res.status(401).json({ details: "Usuario o contraseña incorrectos" });

    const user = result.rows[0];
    const isPasswordCorrect = await verifyPassword(Password, user.Password);
    if (!isPasswordCorrect) return res.status(401).json({ details: "Usuario o contraseña incorrectos" });

    const payload = { id: user.id, Name: user.Name, Email: user.Email, Rol: user.Rol };
    const accessToken = generateAccessToken(payload); // 15 min
    const refreshToken = generateRefreshToken(payload); // 7 días

    // Cookies sincronizadas
    res.cookie("authToken", accessToken, { 
        httpOnly: true, 
        secure: isProd, 
        sameSite: "strict", 
        maxAge: 15 * 60 * 1000 
    });
    res.cookie("refreshToken", refreshToken, { 
        httpOnly: true, 
        secure: isProd, 
        sameSite: "strict", 
        maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    return res.status(200).json({
      message: `Bienvenido Sr. ${user.Name}`,
      user: Email,
      userId: user.id,
      userRole: user.Rol
    });
  } catch (error) {
    console.error("Error login:", error);
    return res.status(500).json({ details: "Error al iniciar sesión" });
  }
};

// Logout
export const logoutUser = (req, res) => {
res.clearCookie("authToken", { httpOnly: true, secure: isProd, sameSite: "strict" });
res.clearCookie("refreshToken", { httpOnly: true, secure: isProd, sameSite: "strict" });

  return res.status(200).json({ message: "Cierre de sesión exitoso" });
};

export const refreshToken = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) return res.status(401).json({ message: "No estás autenticado" });

        const payload = verifyToken(token, "refresh");
        const newAccessToken = generateAccessToken({ id: payload.id, Name: payload.Name, Email: payload.Email, Rol: payload.Rol });

        res.cookie("authToken", newAccessToken, { 
            httpOnly: true, 
            secure: isProd, 
            sameSite: "strict", 
            maxAge: 15*60*1000  // 15 minutos
        });

        return res.status(200).json({ message: "Access token actualizado" });
    } catch (error) {
        console.error("Error refresh token:", error);
        return res.status(401).json({ message: "Refresh token inválido o expirado" });
    }
};

