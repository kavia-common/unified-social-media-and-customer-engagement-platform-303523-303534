export const environment = {
  /**
   * Base URL for REST API calls.
   * Set at runtime via the container env var NG_APP_BACKEND_URL when deployed.
   */
  apiBaseUrl: (globalThis as any)?.process?.env?.['NG_APP_BACKEND_URL'] ?? 'http://localhost:3001',

  /**
   * Base URL for realtime endpoints (future). Not used yet.
   */
  wsUrl: (globalThis as any)?.process?.env?.['NG_APP_WS_URL'] ?? '',

  /**
   * Node environment for toggles/logging.
   */
  nodeEnv: (globalThis as any)?.process?.env?.['NG_APP_NODE_ENV'] ?? 'development',
};

export type Environment = typeof environment;
