import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

import "dotenv/config";

import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes";
import { log } from "./vite"; // keep only log util – no Vite side‑effects in prod

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────
// We purposely avoid __dirname (it can be undefined after esbuild bundle).
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(currentDir, "public");

const app = express();

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// Logging middleware for /api routes
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const reqPath = req.path;
  let capturedJson: unknown;

  const originalJson = res.json.bind(res);
  res.json = function (body: unknown) {
    capturedJson = body;
    return originalJson(body);
  } as unknown as typeof res.json;

  res.on("finish", () => {
    if (reqPath.startsWith("/api")) {
      const ms = Date.now() - start;
      let line = `${req.method} ${reqPath} ${res.statusCode} in ${ms}ms`;
      if (capturedJson) line += ` :: ${JSON.stringify(capturedJson)}`;
      if (line.length > 80) line = line.slice(0, 79) + "…";
      log(line);
    }
  });

  next();
});

(async () => {
  // Register API routes first
  const server = await registerRoutes(app);

  // Error handler (last piece of middleware before Vite / static fallback)
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // Decide between dev (Vite middleware) and prod (static files)
  const isDev = app.get("env") === "development";
  if (isDev) {
    // Lazy‑import to avoid bundling Vite for prod
    const { setupVite } = await import("./vite.js");
    await setupVite(app, server);
  } else {
    // Serve pre‑built static assets (dist/public)
    app.use(express.static(PUBLIC_DIR));
    // SPA fallback
    app.get("*", (_req, res) =>
      res.sendFile(path.join(PUBLIC_DIR, "index.html"))
    );
  }

  // Railway/Heroku/etc. provide PORT env; default to 5005 locally
  const port = Number(process.env.PORT) || 5005;
  server.listen({ port, host: "0.0.0.0" }, () =>
    console.log(`🚀 Server listening on port ${port}`)
  );
})();
