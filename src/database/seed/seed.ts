import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module.js';
import { SeedService } from './seed.service.js';

async function seed(): Promise<void> {
  const app = await NestFactory.createApplicationContext(SeedModule);

  try {
    await app.get(SeedService).run();
  } finally {
    await app.close();
  }
}

seed().catch((error: unknown) => {
  new Logger('Seed').error(error);
  process.exitCode = 1;
});
