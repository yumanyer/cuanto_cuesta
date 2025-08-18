import { logger } from "../utils/winstons.js";

export const logRequest = (req, res, next) => {
  const { method, url, body } = req;

  // Solo body resumido si existe
  const bodyPreview = body && Object.keys(body).length ? JSON.stringify(body) : null;

  logger.http(`${method} ${url} - ${new Date().toISOString()}${bodyPreview ? " - body: " + bodyPreview : ""}`);

  next();
};

