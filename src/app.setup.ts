import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const GLOBAL_API_PREFIX = 'api/v1';
export const SWAGGER_PATH = 'api/docs';

/**
 * Request-handling configuration shared by the real bootstrap and the tests,
 * so tests exercise exactly the prefix and validation the service applies.
 */
export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix(GLOBAL_API_PREFIX);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('FlyDubai API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  SwaggerModule.setup(SWAGGER_PATH, app, () =>
    SwaggerModule.createDocument(app, config),
  );
}
