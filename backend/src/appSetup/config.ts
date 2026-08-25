import { config as envConfig } from '../config/env';

export const routePaths = {
  apiBase: '/api',
  apiDocs: '/docs',
  healthCheck: '/health',
  uploadsPublicPath: '/uploads',
} as const;

export const directoryPaths = {
  uploadsDirectory: envConfig.upload.uploadDir,
  frontendDistDirectory: process.env.FRONTEND_DIST_PATH || '',
} as const;

export interface ApplicationSetupConfig {
  allowedCorsOrigins: string[];
  runningEnvironment: string;
  serverPort: number;
  routePaths: typeof routePaths;
  directoryPaths: typeof directoryPaths;
}

// Resolves the runtime settings needed to assemble the Express application.
export function buildApplicationSetupConfig(): ApplicationSetupConfig {
  return {
    allowedCorsOrigins: envConfig.corsOrigins,
    runningEnvironment: envConfig.nodeEnv,
    serverPort: envConfig.port,
    routePaths,
    directoryPaths,
  };
}
