export const environment = {
  /**
   * Production base URL for REST API calls.
   * Keep default aligned with backend container port for local/proxy usage; override via NG_APP_BACKEND_URL.
   */
  apiBaseUrl: (globalThis as any)?.process?.env?.['NG_APP_BACKEND_URL'] ?? 'http://localhost:3001',

  /**
   * Base URL for realtime endpoints (future). Not used yet.
   */
  wsUrl: (globalThis as any)?.process?.env?.['NG_APP_WS_URL'] ?? '',

  /**
   * Node environment for toggles/logging.
   */
  nodeEnv: (globalThis as any)?.process?.env?.['NG_APP_NODE_ENV'] ?? 'production',
};

export type Environment = typeof environment;
