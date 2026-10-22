import express, { type RequestHandler } from "express"
import rateLimit from "express-rate-limit"

export const GLOBAL_LIMIT = 100
export const WINDOW_MS = 15 * 60 * 1000
export const AUTH_LIMIT = 5

export function createApp() {
  const app = express()
  app.set("trust proxy", 1)
  app.use(express.json({ limit: "100kb" }))

  // Health checks stay available to load balancers and monitoring systems.
  app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true, service: "protection-api", worker: process.pid })
  })

  const globalLimiter = rateLimit({
    windowMs: WINDOW_MS,
    limit: GLOBAL_LIMIT,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many requests", code: "RATE_LIMITED" },
  })
  const authLimiter = rateLimit({
    windowMs: WINDOW_MS,
    limit: AUTH_LIMIT,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many authentication attempts", code: "AUTH_RATE_LIMITED" },
  })

  app.use("/api", globalLimiter)
  app.use("/api/auth/login", authLimiter)
  app.use("/api/auth/register", authLimiter)
  app.use("/api/auth/password-reset", authLimiter)

  const workerHeader: RequestHandler = (_req, res, next) => {
    res.setHeader("X-Worker-Pid", String(process.pid))
    next()
  }
  app.use("/api", workerHeader)

  app.get("/api/status", (_req, res) => {
    res.json({ ok: true, message: "API is protected", worker: process.pid })
  })
  app.post("/api/auth/login", (req, res) => {
    res.json({ ok: true, action: "login", received: Boolean(req.body?.email), worker: process.pid })
  })
  app.post("/api/auth/register", (_req, res) => {
    res.status(201).json({ ok: true, action: "register", worker: process.pid })
  })
  app.post("/api/auth/password-reset", (_req, res) => {
    res.json({ ok: true, action: "password-reset", worker: process.pid })
  })

  app.use((_req, res) => res.status(404).json({ error: "Not found" }))
  return app
}
