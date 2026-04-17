/**
 * Databricks Apps: single Node process serving the TanStack Start SSR bundle.
 * Binds to 0.0.0.0:${DATABRICKS_APP_PORT} per platform requirements.
 *
 * TanStack Start's production `fetch` handler does SSR only; client chunks live
 * under dist/client (e.g. /assets/*.js). Cloudflare Workers inject those as
 * separate assets — on Node we must serve them explicitly.
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";
import { serve } from "srvx/node";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const clientRoot = resolve(join(root, "dist", "client"));
const { default: app } = await import(join(root, "dist/server/server.js"));

const port = Number(
  process.env.DATABRICKS_APP_PORT ?? process.env.PORT ?? 8000,
);
const hostname = "0.0.0.0";

/** @param {string} filePath */
function contentTypeFor(filePath) {
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".js") || filePath.endsWith(".mjs"))
    return "application/javascript; charset=utf-8";
  if (filePath.endsWith(".json")) return "application/json; charset=utf-8";
  if (filePath.endsWith(".svg")) return "image/svg+xml";
  if (filePath.endsWith(".woff2")) return "font/woff2";
  if (filePath.endsWith(".woff")) return "font/woff";
  if (filePath.endsWith(".ico")) return "image/x-icon";
  if (filePath.endsWith(".map")) return "application/json; charset=utf-8";
  return "application/octet-stream";
}

/**
 * Resolve a URL pathname to a file under clientRoot, or null if unsafe / missing.
 * @param {string} pathname
 */
function resolveClientFile(pathname) {
  const decoded = decodeURIComponent(pathname);
  const withoutLead = decoded.replace(/^\/+/, "");
  const candidate = resolve(join(clientRoot, withoutLead));
  const rel = relative(clientRoot, candidate);
  if (rel.startsWith("..") || rel === "..") return null;
  if (!existsSync(candidate) || !statSync(candidate).isFile()) return null;
  return candidate;
}

/**
 * @param {Request} request
 */
function tryServeClientStatic(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  if (!pathname.startsWith("/assets/")) return null;

  const filePath = resolveClientFile(pathname);
  if (!filePath) return null;

  const headers = new Headers({
    "content-type": contentTypeFor(filePath),
    "cache-control": "public, max-age=31536000, immutable",
  });

  if (request.method === "HEAD") {
    const { size } = statSync(filePath);
    headers.set("content-length", String(size));
    return new Response(null, { status: 200, headers });
  }

  if (request.method !== "GET") return null;

  const nodeStream = createReadStream(filePath);
  return new Response(Readable.toWeb(nodeStream), { status: 200, headers });
}

const innerFetch = app.fetch.bind(app);

serve({
  fetch(request) {
    const staticResponse = tryServeClientStatic(request);
    if (staticResponse) return staticResponse;
    return innerFetch(request);
  },
  port,
  hostname,
});
