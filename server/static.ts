import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function serveStatic(app: express.Express) {
  const distPath = path.resolve(__dirname, "../client/dist");

  // statické soubory
  app.use(express.static(distPath));

  // SPA fallback (Express 5 kompatibilní)
  app.use((req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}
