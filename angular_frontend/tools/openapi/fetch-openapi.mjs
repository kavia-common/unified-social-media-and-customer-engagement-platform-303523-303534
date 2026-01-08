import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

/**
 * Best-effort parse of the Angular environment apiBaseUrl so we do not hardcode
 * backend paths in scripts.
 */
function resolveApiBaseUrl() {
  // Prefer explicit env var override for CI/dev.
  if (process.env.NG_APP_BACKEND_URL && process.env.NG_APP_BACKEND_URL.trim()) {
    return process.env.NG_APP_BACKEND_URL.trim();
  }

  // Fall back to reading src/environments/environment.ts.
  const envFile = path.join(projectRoot, 'src', 'environments', 'environment.ts');
  const content = fs.readFileSync(envFile, 'utf8');

  // Very small heuristic to find the default url fallback:
  // ... ?? 'http://localhost:3001'
  const match = content.match(/\?\?\s*'([^']+)'/);
  if (match?.[1]) return match[1];

  // Safe fallback
  return 'http://localhost:3001';
}

function main() {
  const apiBaseUrl = resolveApiBaseUrl().replace(/\/+$/, '');
  const openApiUrl = `${apiBaseUrl}/openapi/v1/openapi.json`;

  const outDir = path.join(projectRoot, 'src', 'app', 'api', 'generated');
  const outFile = path.join(outDir, 'openapi.json');

  fs.mkdirSync(outDir, { recursive: true });

  // Node 18+ has global fetch.
  return fetch(openApiUrl)
    .then(async (r) => {
      if (!r.ok) {
        const text = await r.text().catch(() => '');
        throw new Error(`Failed to fetch OpenAPI from ${openApiUrl} (${r.status}): ${text}`);
      }
      return r.text();
    })
    .then((text) => {
      fs.writeFileSync(outFile, text, 'utf8');
      console.log(`OpenAPI saved to ${path.relative(projectRoot, outFile)}`);
    });
}

main().catch((err) => {
  console.error(err?.stack ?? String(err));
  process.exit(1);
});
