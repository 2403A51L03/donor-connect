import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { pool } from "@workspace/db";

const router: IRouter = Router();

router.get("/healthz", async (_req, res) => {
  try {
    // Test database connection
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();

    const data = HealthCheckResponse.parse({
      status: "ok",
      database: "connected"
    });
    res.json(data);
  } catch (error) {
    const data = HealthCheckResponse.parse({
      status: "error",
      database: "disconnected",
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(503).json(data);
  }
});

export default router;
