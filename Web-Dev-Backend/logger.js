const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "access.log");

/**
 * Middleware de logging pour Express
 * Écrit dans access.log sous le format :
 * 2025-10-27T21:45:30.000Z - ::1 - PUT /api/teachers/1 body:{"email":"or 1=1"} - 200 - 18ms ua:Mozilla/5.0
 */
function logger(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const ip =
      (req.headers["x-forwarded-for"] &&
        req.headers["x-forwarded-for"].split(",")[0]) ||
      req.socket.remoteAddress ||
      "unknown";

    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();

    // 🔹 Corps de la requête (converti en JSON pour les PUT/POST)
    let bodyString = "";
    if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
      try {
        bodyString = " body:" + JSON.stringify(req.body);
      } catch {
        bodyString = " body:[unreadable]";
      }
    }

    // 🔹 User-Agent
    const ua = req.headers["user-agent"] || "unknown-UA";

    // 🔹 Ligne finale du log
    const logLine = `${timestamp} - ${ip} - ${req.method} ${req.originalUrl}${bodyString} - ${res.statusCode} - ${duration}ms ua:${ua}\n`;

    // 🔹 Écriture dans le fichier (créé s’il n’existe pas)
    fs.appendFileSync(logFile, logLine, { encoding: "utf8" });
  });

  next();
}

module.exports = { logger };
