import 'reflect-metadata';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';
import { type EnvironmentVariables } from './config/env.validation.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(Logger);
  const config = app.get(ConfigService<EnvironmentVariables, true>);

  app.useLogger(logger);
  app.enableShutdownHooks();
  configureApp(app);

  const port = config.get('PORT', { infer: true });
  await app.listen(port);
  logger.log(`FlyDubai backend listening on port ${port}`);
}

void bootstrap();
