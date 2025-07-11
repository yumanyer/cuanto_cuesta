import { verifyToken } from '../config/jwt.config.js';

export const userMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Validar que venga el header
  if (!authHeader) {
    return res.status(401).json({ message: 'FLACO SIN TOKEN NO TE PUEDO DEJAR PASAR' });
  }

  // Separar el esquema y el token real
  const [scheme, token] = authHeader.split(' ');

  // Verificar que sea Bearer
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'CUCHA FLACO FIJATE QUE TE FALTA EL BEARER' });
  }

  try {
    // Verificar el token
    const decoded = verifyToken(token);

    // Guardar info del usuario en la request
    req.user = decoded;

    // Continuar
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido o expirado' });
  }
};
