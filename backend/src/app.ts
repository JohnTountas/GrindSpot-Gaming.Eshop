/**
 * Creates and configures the Express application, middleware, and route wiring.
 */
import express, { Express } from "express";
import fs from "fs";
import path from "path";
import cors, { CorsOptions } from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import { config as envConfig } from "./config/env";
import { errorHandler } from "./middleware/error.middleware";
import authRoutes from "./modules/auth/auth.routes";
import productRoutes from "./modules/products/product.routes";
import cartRoutes from "./modules/cart/cart.routes";
import orderRoutes, { adminRouter as adminOrderRoutes } from "./modules/orders/order.routes";
import categoryRoutes from "./modules/categories/category.routes";
import compareWishlistRoutes from "./modules/compare_wishlist/compare_wishlist.routes";
import adminCatalogRoutes from "./modules/adminCatalog/adminCatalog.routes";

// Defines application route segments used across middleware and routing.
const ROUTE_PATHS = {
  apiBase: "/api",
  apiDocs: "/docs",
  healthCheck: "/health",
  uploadsPublicPath: "/uploads",
} as const;

// Defines filesystem directories used by static serving.
const DIRECTORY_PATHS = {
  uploadsDirectory: envConfig.upload.uploadDir,
  frontendDistDirectory: process.env.FRONTEND_DIST_PATH || "",
} as const;

// Describes the normalized configuration used to bootstrap the Express app.
interface ApplicationSetupConfig {
  allowedCorsOrigin: string;
  runningEnvironment: string;
  serverPort: number;
  routePaths: typeof ROUTE_PATHS;
  directoryPaths: typeof DIRECTORY_PATHS;
}

// Builds the default application setup config from environment values.
function buildDefaultSetupConfig(): ApplicationSetupConfig {
  return {
    allowedCorsOrigin: envConfig.corsOrigin,
    runningEnvironment: envConfig.nodeEnv,
    serverPort: envConfig.port,
    routePaths: ROUTE_PATHS,
    directoryPaths: DIRECTORY_PATHS,
  };
}

// Builds CORS options used by the security middleware layer.
function createCorsOptions(allowedCorsOrigin: string): CorsOptions {
  return {
    origin: allowedCorsOrigin,
    credentials: true,
  };
}

// Applies security-related middleware such as Helmet and CORS.
function applySecurityMiddleware(expressApplication: Express, allowedCorsOrigin: string): void {
  expressApplication.use(helmet());
  expressApplication.use(cors(createCorsOptions(allowedCorsOrigin)));
}

// Applies JSON, URL-encoded, and cookie parsing middleware.
function applyBodyParsingMiddleware(expressApplication: Express): void {
  expressApplication.use(express.json());
  expressApplication.use(express.urlencoded({ extended: true }));
  expressApplication.use(cookieParser());
}

// Enables request logging in development environments.
function applyRequestLoggingMiddleware(
  expressApplication: Express,
  runningEnvironment: string
): void {
  if (runningEnvironment === "development") {
    expressApplication.use(morgan("dev"));
  }
}

// Serves uploaded assets from the configured static directory.
function serveStaticUploads(
  expressApplication: Express,
  uploadsPublicPath: string,
  uploadsDirectoryPath: string
): void {
  expressApplication.use(uploadsPublicPath, express.static(uploadsDirectoryPath));
}

// Builds OpenAPI metadata and route scanning options for Swagger generation.
function buildSwaggerDocumentationOptions() {
  const routeDefinitionGlobs = [
    path.join(process.cwd(), "src/modules/**/*.routes.ts"),
    path.join(__dirname, "modules/**/*.routes.js"),
  ];

  return {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "grindspot E-Shop API",
        version: "1.0.0",
        description: "Modern e-commerce API built with Express and TypeScript",
        contact: {
          name: "API Support",
        },
      },
      servers: [
        {
          // Relative URL keeps Swagger "Try it out" working behind proxies (Render, Docker, local).
          url: "/",
          description: "Current deployment origin",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
    apis: routeDefinitionGlobs,
  };
}

// Registers interactive Swagger API documentation endpoints.
function registerApiDocumentation(
  expressApplication: Express,
  docsRoutePath: string
): void {
  const swaggerDocumentationOptions = buildSwaggerDocumentationOptions();
  const swaggerSpecification = swaggerJsDoc(swaggerDocumentationOptions);

  expressApplication.use(docsRoutePath, swaggerUi.serve, swaggerUi.setup(swaggerSpecification));
}

// Registers a lightweight health endpoint for readiness checks.
function registerHealthCheckRoute(expressApplication: Express, healthCheckPath: string): void {
  expressApplication.get(healthCheckPath, (_request, response) => {
    response.json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  });
}

// Registers the API root metadata endpoint.
function registerRootRoute(expressApplication: Express): void {
  expressApplication.get("/", (_request, response) => {
    response.json({
      name: "grindspot API",
      status: "online",
      endpoints: {
        health: "/health",
        docs: "/docs",
        auth: "/api/auth",
        products: "/api/products",
        categories: "/api/categories",
      },
    });
  });
}

// Registers feature route groups under the API base path.
function registerApiFeatureRoutes(expressApplication: Express, apiBasePath: string): void {
  expressApplication.use(`${apiBasePath}/auth`, authRoutes);
  expressApplication.use(`${apiBasePath}/products`, productRoutes);
  expressApplication.use(`${apiBasePath}/cart`, cartRoutes);
  expressApplication.use(`${apiBasePath}/orders`, orderRoutes);
  expressApplication.use(`${apiBasePath}/admin/orders`, adminOrderRoutes);
  expressApplication.use(`${apiBasePath}/admin/catalog`, adminCatalogRoutes);
  expressApplication.use(`${apiBasePath}/categories`, categoryRoutes);
  expressApplication.use(`${apiBasePath}/me`, compareWishlistRoutes);
}

// Checks whether a frontend build exists and can be served.
function hasFrontendBuild(frontendDistDirectory: string): boolean {
  if (!frontendDistDirectory) {
    return false;
  }

  const indexFilePath = path.join(frontendDistDirectory, "index.html");
  return fs.existsSync(indexFilePath);
}

// Serves frontend static assets and SPA fallback while excluding API/system routes.
function registerFrontendRoutes(
  expressApplication: Express,
  frontendDistDirectory: string,
  routePaths: typeof ROUTE_PATHS
): void {
  expressApplication.use(express.static(frontendDistDirectory));

  expressApplication.get("*", (request, response, next) => {
    const requestPath = request.path;
    const isApiRoute = requestPath.startsWith(routePaths.apiBase);
    const isDocsRoute = requestPath.startsWith(routePaths.apiDocs);
    const isHealthRoute = requestPath === routePaths.healthCheck;
    const isUploadsRoute = requestPath.startsWith(routePaths.uploadsPublicPath);

    if (isApiRoute || isDocsRoute || isHealthRoute || isUploadsRoute) {
      next();
      return;
    }

    response.sendFile(path.join(frontendDistDirectory, "index.html"));
  });
}

// Registers a fallback 404 handler for unmatched routes.
function registerNotFoundRoute(expressApplication: Express): void {
  expressApplication.use((_request, response) => {
    response.status(404).json({ error: "Route not found" });
  });
}

// Builds the fully configured Express application instance.
function createExpressApplication(setupConfig: ApplicationSetupConfig): Express {
  const expressApplication = express();
  expressApplication.set("trust proxy", 1);

  applySecurityMiddleware(expressApplication, setupConfig.allowedCorsOrigin);
  applyBodyParsingMiddleware(expressApplication);
  applyRequestLoggingMiddleware(expressApplication, setupConfig.runningEnvironment);
  serveStaticUploads(
    expressApplication,
    setupConfig.routePaths.uploadsPublicPath,
    setupConfig.directoryPaths.uploadsDirectory
  );
  registerApiDocumentation(
    expressApplication,
    setupConfig.routePaths.apiDocs
  );
  registerHealthCheckRoute(expressApplication, setupConfig.routePaths.healthCheck);
  registerApiFeatureRoutes(expressApplication, setupConfig.routePaths.apiBase);

  if (hasFrontendBuild(setupConfig.directoryPaths.frontendDistDirectory)) {
    registerFrontendRoutes(
      expressApplication,
      setupConfig.directoryPaths.frontendDistDirectory,
      setupConfig.routePaths
    );
  } else {
    registerRootRoute(expressApplication);
  }

  registerNotFoundRoute(expressApplication);
  expressApplication.use(errorHandler);

  return expressApplication;
}

// Builds the configuration and initializes the configured Express app.
const applicationSetupConfig = buildDefaultSetupConfig();
const app = createExpressApplication(applicationSetupConfig);

export default app;
