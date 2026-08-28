import express, { Express } from 'express';
import cors, { CorsOptions } from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

// Centralize the CORS decision so every environment uses the same allowlist
// logic instead of duplicating origin checks around the app.
function createCorsOptions(allowedCorsOrigins: string[]): CorsOptions {
  return {
    origin(requestOrigin, callback) {
      if (!requestOrigin) {
        callback(null, true);
        return;
      }

      if (allowedCorsOrigins.includes(requestOrigin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${requestOrigin} is not allowed by CORS.`));
    },
    credentials: true,
  };
}

// Applies the shared middleware stack used by both local and deployed environments.
export function registerCoreMiddleware(
  expressApplication: Express,
  allowedCorsOrigins: string[],
  runningEnvironment: string
): void {
  expressApplication.use(helmet());
  expressApplication.use(cors(createCorsOptions(allowedCorsOrigins)));
  expressApplication.use(express.json());
  expressApplication.use(express.urlencoded({ extended: true }));
  expressApplication.use(cookieParser());

  if (runningEnvironment === 'development') {
    // Keep noisy request logging out of production while preserving a helpful
    // local feedback loop during API work.
    expressApplication.use(morgan('dev'));
  }
}

// Exposes uploaded assets through the public uploads route.
export function registerUploadStaticRoute(
  expressApplication: Express,
  uploadsPublicPath: string,
  uploadsDirectoryPath: string
): void {
  expressApplication.use(uploadsPublicPath, express.static(uploadsDirectoryPath));
}
