import path from 'path';
import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import prisma from '../config/database';

function buildSwaggerDocumentationOptions() {
  const routeDefinitionGlobs = [
    path.join(process.cwd(), 'src/features/**/*.routes.ts'),
    path.join(__dirname, '../features/**/*.routes.js'),
  ];

  return {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'grindspot E-Shop API',
        version: '1.0.0',
        description: 'Modern e-commerce API built with Express and TypeScript',
        contact: {
          name: 'API Support',
        },
      },
      servers: [
        {
          url: '/',
          description: 'Current deployment origin',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    apis: routeDefinitionGlobs,
  };
}

// Registers the generated Swagger UI and spec for interactive API browsing.
export function registerApiDocumentation(expressApplication: Express, docsRoutePath: string): void {
  const swaggerDocumentationOptions = buildSwaggerDocumentationOptions();
  const swaggerSpecification = swaggerJsDoc(swaggerDocumentationOptions);

  expressApplication.use(docsRoutePath, swaggerUi.serve, swaggerUi.setup(swaggerSpecification));
}

// Adds a database-aware health endpoint so production checks fail loudly when
// the API can no longer reach Postgres or when the storefront catalog has not
// been seeded yet. For this app, an empty catalog is an operational problem
// because the public storefront cannot render its primary content.
export function registerHealthCheckRoute(expressApplication: Express, healthCheckPath: string): void {
  expressApplication.get(healthCheckPath, async (_request, response) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      const productCount = await prisma.product.count();
      const catalogSeeded = productCount > 0;

      if (!catalogSeeded) {
        return response.status(503).json({
          status: 'error',
          timestamp: new Date().toISOString(),
          database: 'connected',
          catalogSeeded: false,
          productCount,
          error: 'Catalog is empty. Run the production seed workflow before serving traffic.',
        });
      }

      return response.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
        catalogSeeded: true,
        productCount,
      });
    } catch {
      return response.status(503).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'unavailable',
        catalogSeeded: false,
        error: 'Database connectivity check failed.',
      });
    }
  });
}

// Exposes a lightweight root endpoint when the frontend build is not being served.
export function registerRootRoute(expressApplication: Express): void {
  expressApplication.get('/', (_request, response) => {
    response.json({
      name: 'grindspot API',
      status: 'online',
      endpoints: {
        health: '/health',
        docs: '/docs',
        auth: '/api/auth',
        products: '/api/products',
        categories: '/api/categories',
      },
    });
  });
}

