# FlyDubaiBackend

NestJS + TypeScript backend template (ESM, pnpm, Vitest + SWC, ESLint + Prettier, pino logging, PostgreSQL + TypeORM).

## Getting started

```bash
pnpm install
cp .env.example .env
pnpm db   # local PostgreSQL
pnpm dev
```

- Health: `GET /api/v1/health`

## Scripts

| Script                        | Purpose                         |
| ----------------------------- | ------------------------------- |
| `pnpm db`                     | Start local PostgreSQL (Docker) |
| `pnpm dev`                    | Run with watch mode             |
| `pnpm build` / `pnpm start`   | Compile and run `dist/`         |
| `pnpm typecheck`              | Type-check without emitting     |
| `pnpm lint` / `pnpm format`   | ESLint + Prettier check / fix   |
| `pnpm test` / `pnpm test:e2e` | Unit / e2e tests                |

## Layout

```
src/
  main.ts            bootstrap
  app.module.ts      root module
  app.setup.ts       global prefix, validation
  config/            env validation (class-validator)
  common/            logging, shared utilities
  database/          TypeORM connection
  health/            health endpoint
test/                e2e tests and test setup
```

Add new features as modules under `src/<feature>/` (module, controller, service, DTOs) and import them in `AppModule`.

## Database

PostgreSQL via TypeORM with `synchronize: true`: the schema is created and updated automatically from your entities on startup. Define entities as `*.entity.ts` files in a feature module and register them with `TypeOrmModule.forFeature([...])`.
