import express, { type Express } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the built frontend
const frontendBuild = path.join(__dirname, "..", "..", "blood-donor", "dist");
app.use(express.static(frontendBuild));

// API routes
app.use("/api", router);

// Fallback to index.html for React Router (SPA)
app.get("*", (_req, res) => {
  res.sendFile(path.join(frontendBuild, "index.html"));
});

export default app;
