var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./app";
describe("protection API", () => {
    it("returns health checks even after many API requests", () => __awaiter(void 0, void 0, void 0, function* () {
        const app = createApp();
        yield Promise.all(Array.from({ length: 125 }, () => request(app).get("/api/status")));
        const response = yield request(app).get("/health");
        expect(response.status).toBe(200);
        expect(response.body.ok).toBe(true);
    }));
    it("returns 429 and Retry-After after the global limit", () => __awaiter(void 0, void 0, void 0, function* () {
        const app = createApp();
        for (let index = 0; index < 100; index += 1)
            yield request(app).get("/api/status");
        const response = yield request(app).get("/api/status");
        expect(response.status).toBe(429);
        expect(response.headers["retry-after"]).toBeDefined();
    }));
    it("applies a stricter limit to auth endpoints", () => __awaiter(void 0, void 0, void 0, function* () {
        const app = createApp();
        for (let index = 0; index < 5; index += 1)
            yield request(app).post("/api/auth/login").send({ email: "demo@example.com" });
        expect((yield request(app).post("/api/auth/login")).status).toBe(429);
    }));
});
