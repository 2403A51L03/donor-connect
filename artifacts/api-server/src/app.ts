import express, { type Express, static as expressStatic } from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import router from "./routes";

const __dirname = process.cwd();

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve API routes (must come BEFORE static files to match /api/*)
app.use("/api", router);

// Serve static files from the built frontend
const frontendBuild = path.join(__dirname, "artifacts", "blood-donor", "dist", "public");
if (process.env.NODE_ENV !== "production" || true) {
  console.log(`Frontend path: ${frontendBuild}`);
  console.log(`Frontend exists: ${fs.existsSync(frontendBuild)}`);
  console.log(`Index.html exists: ${fs.existsSync(path.join(frontendBuild, "index.html"))}`);
}

// Serve all static assets (CSS, JS, images, etc.)
app.use(expressStatic(frontendBuild, {
  maxAge: '1h',
  etag: false
}));

// Fallback: serve index.html for all non-API, non-static routes (SPA routing)
app.use((_req, res) => {
  res.sendFile(path.join(frontendBuild, 'index.html'));
});

export default app;
