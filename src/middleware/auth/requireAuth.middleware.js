// backend/src/middleware/requireAuth.middleware.js
import { verifyToken, generateAccessToken } from "../../config/jwt.config.js";

export const requireAuth = (allowRoles = []) => async (req, res, next) => {
  let token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ message: "No estás autenticado" });
  }

  try {
    // Intentamos verificar el accessToken
    const payload = verifyToken(token);
    req.user = payload;

    // Verificamos roles si aplica
    if (allowRoles.length && !allowRoles.includes(payload.Rol)) {
      return res.status(403).json({ message: "No estás autorizado para acceder a esta ruta" });
    }

    next();
  } catch (error) {
    // Si el token expiró, intentamos usar el refreshToken
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Token expirado y no hay refresh token" });
    }

    try {
      const payload = verifyToken(refreshToken, "refresh");
      const newAccessToken = generateAccessToken({
        id: payload.id,
        Name: payload.Name,
        Email: payload.Email,
        Rol: payload.Rol
      });

      // Seteamos el nuevo authToken en cookies
      const isProd = process.env.NODE_ENV === "production";
      res.cookie("authToken", newAccessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "strict",
        maxAge: 3600 * 1000 // 1 hora
      });

      req.user = payload; // seguimos adelante
      next();
    } catch (err) {
      return res.status(401).json({ message: "Refresh token inválido o expirado" });
    }
  }
};
