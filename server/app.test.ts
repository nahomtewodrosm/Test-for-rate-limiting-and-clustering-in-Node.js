import request from "supertest"
import { describe, expect, it } from "vitest"
import { createApp } from "./app"

describe("protection API", () => {
  it("returns health checks even after many API requests", async () => {
    const app = createApp()
    await Promise.all(Array.from({ length: 125 }, () => request(app).get("/api/status")))
    const response = await request(app).get("/health")
    expect(response.status).toBe(200)
    expect(response.body.ok).toBe(true)
  })

  it("returns 429 and Retry-After after the global limit", async () => {
    const app = createApp()
    for (let index = 0; index < 100; index += 1) await request(app).get("/api/status")
    const response = await request(app).get("/api/status")
    expect(response.status).toBe(429)
    expect(response.headers["retry-after"]).toBeDefined()
  })

  it("applies a stricter limit to auth endpoints", async () => {
    const app = createApp()
    for (let index = 0; index < 5; index += 1) await request(app).post("/api/auth/login").send({ email: "demo@example.com" })
    expect((await request(app).post("/api/auth/login")).status).toBe(429)
  })
})
