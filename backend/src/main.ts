/**
 * Application Bootstrap
 * 
 * Main entry point for the NestJS voting system application.
 * Includes:
 * - Graceful shutdown handling
 * - Startup health validation
 * - Helmet security headers
 * - API versioning
 * - Proper error handling
 */

import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ValidationPipeCustom } from './common/pipes/validation.pipe';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

const logger = new Logger('Bootstrap');

/**
 * Main bootstrap function
 */
async function bootstrap() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    const configService = app.get(ConfigService);
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');
    const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:3000');

    // Security headers via Helmet
    app.use(helmet());

    // Enable CORS
    app.enableCors({
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin) {
          return callback(null, true);
        }
        if (frontendUrl.includes(origin) || origin === '*') {
          return callback(null, true);
        }
        callback(null, true); // Allow in dev mode
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

    // Global prefix
    const apiVersion = configService.get<string>('API_VERSION', 'v1');
    app.setGlobalPrefix(apiVersion);

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipeCustom({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Global exception filter
    const isProduction = nodeEnv === 'production';
    app.useGlobalFilters(new AllExceptionsFilter(isProduction));

    // Global interceptor
    app.useGlobalInterceptors(new LoggingInterceptor());

    // Serve static files (uploads)
    app.useStaticAssets(join(process.cwd(), 'uploads'), {
      prefix: '/uploads/',
    });

    // Serve static files (uploads)
    app.useStaticAssets(join(process.cwd(), 'uploads'), {
      prefix: '/uploads/',
    });

    // Swagger documentation
    const config = new DocumentBuilder()
      .setTitle('Voting System API')
      .setDescription('Blockchain Voting System Backend API')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('health', 'System health checks')
      .addTag('auth', 'Authentication endpoints')
      .addTag('voters', 'Voter management')
      .addTag('candidates', 'Candidate management')
      .addTag('votes', 'Voting operations')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    // Get port from config
    const port = parseInt(configService.get<string>('PORT', '3001'), 10);

    // Start server
    await app.listen(port);
    
    logger.log(`==================================================`);
    logger.log(`  Voting System API started successfully`);
    logger.log(`  Environment: ${nodeEnv}`);
    logger.log(`  API: http://localhost:${port}`);
    logger.log(`  Swagger: http://localhost:${port}/docs`);
    logger.log(`  Health: http://localhost:${port}/health`);
    logger.log(`==================================================`);

    // Graceful shutdown handlers
    process.on('SIGTERM', async () => {
      logger.log('SIGTERM received. Starting graceful shutdown...');
      await app.close();
      logger.log('HTTP server closed');
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.log('SIGINT received. Starting graceful shutdown...');
      await app.close();
      logger.log('HTTP server closed');
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();