import jwt from "jsonwebtoken";
import { config } from "./env.config.js";

// Genera Access Token (corto plazo)
export function generateAccessToken(payload) {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: "1h" });
}

// Genera Refresh Token (largo plazo)
export function generateRefreshToken(payload) {
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

// Verifica token (access o refresh)
export function verifyToken(token, type = "access") {
  try {
    const secret = type === "refresh" ? config.JWT_REFRESH_SECRET : config.JWT_SECRET;
    return jwt.verify(token, secret);
  } catch (error) {
    throw error;
  }
}
