import { spawn } from "node:child_process";

const port = process.env.DATABRICKS_APP_PORT ?? process.env.PORT ?? "8000";
const host = "0.0.0.0";
const args = [
  "run",
  "--project",
  "backend",
  "uvicorn",
  "backend.app.main:app",
  "--host",
  host,
  "--port",
  port,
];

const child = spawn("uv", args, {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});

child.on("error", (error) => {
  console.error("Failed to start uvicorn via uv:", error);
  process.exit(1);
});
