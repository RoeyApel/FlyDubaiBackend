import { type INestApplication, ValidationPipe } from '@nestjs/common';

export const GLOBAL_API_PREFIX = 'api/v1';

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
