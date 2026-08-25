/**
 * Assemble the Express app from small setup modules.
 *
 * The goal here is readability: routing, docs, static assets, and middleware
 * registration each live in their own focused setup file.
 */
import express from 'express';
import { errorHandler } from './middleware/error.middleware';
import { registerApiFeatureRoutes } from './appSetup/apiRoutes';
import { buildApplicationSetupConfig } from './appSetup/config';
import {
  registerApiDocumentation,
  registerHealthCheckRoute,
  registerRootRoute,
} from './appSetup/documentation';
import {
  hasFrontendBuild,
  registerFrontendRoutes,
  registerNotFoundRoute,
} from './appSetup/frontend';
import { registerCoreMiddleware, registerUploadStaticRoute } from './appSetup/middleware';

function createExpressApplication() {
  const setupConfig = buildApplicationSetupConfig();
  const expressApplication = express();

  // Trust a single proxy hop so hosted environments can forward the original
  // protocol and client details for cookies, security headers, and limits.
  expressApplication.set('trust proxy', 1);

  registerCoreMiddleware(
    expressApplication,
    setupConfig.allowedCorsOrigins,
    setupConfig.runningEnvironment
  );
  registerUploadStaticRoute(
    expressApplication,
    setupConfig.routePaths.uploadsPublicPath,
    setupConfig.directoryPaths.uploadsDirectory
  );
  registerApiDocumentation(expressApplication, setupConfig.routePaths.apiDocs);
  registerHealthCheckRoute(expressApplication, setupConfig.routePaths.healthCheck);
  registerApiFeatureRoutes(expressApplication, setupConfig.routePaths.apiBase);

  // In production the backend serves the built SPA. During backend-only runs we
  // fall back to a lightweight root route instead of pretending the frontend exists.
  if (hasFrontendBuild(setupConfig.directoryPaths.frontendDistDirectory)) {
    registerFrontendRoutes(expressApplication, setupConfig.directoryPaths.frontendDistDirectory);
  } else {
    registerRootRoute(expressApplication);
  }

  // Keep the 404 and error handler last so feature routes get the first chance
  // to answer the request.
  registerNotFoundRoute(expressApplication);
  expressApplication.use(errorHandler);

  return expressApplication;
}

const app = createExpressApplication();

export default app;

