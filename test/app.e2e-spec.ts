import type { Server } from 'node:http';
import { Global, type INestApplication, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { afterAll, beforeAll, describe, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { DatabaseModule } from '../src/database/database.module.js';

// The database is swapped for a fake DataSource so e2e tests need no Postgres.
// It only has to satisfy the repository factories of TypeOrmModule.forFeature.
@Global()
@Module({
  providers: [
    {
      provide: DataSource,
      useValue: { entityMetadatas: [], options: {}, getRepository: () => ({}) },
    },
  ],
  exports: [DataSource],
})
class StubDatabaseModule {}

describe('App (e2e)', () => {
  let app: INestApplication<Server>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(DatabaseModule)
      .useModule(StubDatabaseModule)
      .compile();

    app = moduleRef.createNestApplication<INestApplication<Server>>();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health reports ok', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect({ status: 'ok' });
  });
});
