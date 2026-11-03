import { type ClassConstructor, plainToInstance } from 'class-transformer';
import { validate, type ValidationError } from 'class-validator';

/** Runs the same transform + validation as the global ValidationPipe. */
export async function validateDto<T extends object>(
  dtoClass: ClassConstructor<T>,
  plain: object,
): Promise<{ dto: T; errors: string[] }> {
  const dto = plainToInstance(dtoClass, plain);
  const errors = await validate(dto, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  return { dto, errors: errors.flatMap((error) => errorPaths(error)) };
}

function errorPaths(error: ValidationError, parent = ''): string[] {
  const path = parent ? `${parent}.${error.property}` : error.property;
  const children = error.children ?? [];

  return children.length > 0
    ? children.flatMap((child) => errorPaths(child, path))
    : [path];
}
